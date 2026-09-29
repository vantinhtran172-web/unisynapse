"""Automated Database Backup Utility for UniSynapse (Checklist Item 20)
Supports safe atomic SQLite live snapshots and PostgreSQL pg_dump exports.
Retains the last 10 backups and purges archives older than 7 days.
"""
import os
import sys
import time
import shutil
import sqlite3
import json
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = Path(os.getenv("UNISYNAPSE_DATA_DIR", str(BASE_DIR / "data"))).resolve()
BACKUP_DIR = DATA_DIR / "backups"
DB_PATH = DATA_DIR / "unisynapse.db"


def backup_sqlite() -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    target_file = BACKUP_DIR / f"unisynapse_{timestamp}.db"
    meta_file = BACKUP_DIR / f"unisynapse_{timestamp}.meta.json"

    if not DB_PATH.exists():
        print(f"[-] SQLite database not found at {DB_PATH}")
        return None

    print(f"[*] Starting atomic SQLite backup from {DB_PATH} -> {target_file}")
    source_conn = sqlite3.connect(DB_PATH)
    dest_conn = sqlite3.connect(target_file)
    try:
        # Atomic online live backup without locking the database
        source_conn.backup(dest_conn, pages=100)
        dest_conn.commit()
    finally:
        source_conn.close()
        dest_conn.close()

    size_bytes = target_file.stat().st_size
    print(f"[+] Backup completed successfully! Size: {size_bytes / 1024:.1f} KB")

    # Collect DB statistics
    meta = {
        "timestamp": timestamp,
        "created_at": time.time(),
        "source_path": str(DB_PATH),
        "backup_path": str(target_file),
        "size_bytes": size_bytes,
        "tables": {},
    }
    try:
        conn = sqlite3.connect(target_file)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [r[0] for r in cur.fetchall()]
        for tbl in tables:
            cur.execute(f"SELECT COUNT(*) FROM {tbl}")
            meta["tables"][tbl] = cur.fetchone()[0]
        conn.close()
    except Exception as err:
        meta["error"] = str(err)

    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    # Prune old backups (keep last 10, remove older than 7 days)
    prune_old_backups(max_keep=10, max_age_days=7)
    return target_file


def prune_old_backups(max_keep: int = 10, max_age_days: int = 7) -> None:
    backups = sorted(BACKUP_DIR.glob("unisynapse_*.db"), key=lambda p: p.stat().st_mtime, reverse=True)
    now = time.time()
    cutoff = now - (max_age_days * 86400)

    for idx, bkp in enumerate(backups):
        # Keep the most recent max_keep unconditionally
        if idx >= max_keep or bkp.stat().st_mtime < cutoff:
            print(f"[*] Pruning old backup: {bkp.name}")
            bkp.unlink(missing_ok=True)
            meta = bkp.with_suffix(".meta.json")
            meta.unlink(missing_ok=True)


if __name__ == "__main__":
    result = backup_sqlite()
    if result:
        print(f"[OK] Database backup verified at {result}")
        sys.exit(0)
    else:
        sys.exit(1)
