import os
import sys
import zipfile
import hashlib
import time
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from ..core.config import BASE_DIR, BACKEND_DIR, DATA_DIR, UPLOADS_DIR
from ..core.database import get_db

logger = logging.getLogger("vhu_resources")

ZIP_NAME = "tai-lieu-trac-nghiem-VHU.zip"

def find_vhu_zip_path() -> Optional[Path]:
    """Search for tai-lieu-trac-nghiem-VHU.zip in standard deployment locations."""
    candidates = [
        BASE_DIR / ZIP_NAME,
        BACKEND_DIR / "resources" / ZIP_NAME,
        DATA_DIR / "resources" / ZIP_NAME,
        DATA_DIR / ZIP_NAME,
    ]
    for p in candidates:
        if p.exists() and p.is_file() and p.stat().st_size > 0:
            return p
    return None

def ensure_vhu_resources() -> Dict[str, Any]:
    """
    Ensure tai-lieu-trac-nghiem-VHU.zip is present, extracted, and indexed.
    Called during application startup on both local and Render production.
    """
    zip_path = find_vhu_zip_path()
    if not zip_path:
        logger.warning(f"VHU zip bundle {ZIP_NAME} not found in repository.")
        return {"ok": False, "reason": "zip_not_found", "indexed_count": 0}

    logger.info(f"Found VHU resource bundle at: {zip_path} ({zip_path.stat().st_size} bytes)")
    
    target_dir = UPLOADS_DIR / "vhu_exams"
    target_dir.mkdir(parents=True, exist_ok=True)
    
    extracted_files: List[Path] = []
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            for item in z.infolist():
                if item.is_dir():
                    continue
                # Decode filename safely
                try:
                    filename = item.filename.encode("cp437").decode("utf-8")
                except Exception:
                    filename = item.filename
                
                # Sanitize leaf filename
                clean_name = os.path.basename(filename)
                if not clean_name or clean_name.startswith("."):
                    continue
                
                out_path = target_dir / clean_name
                if not out_path.exists() or out_path.stat().st_size != item.file_size:
                    with z.open(item) as src, open(out_path, "wb") as dst:
                        dst.write(src.read())
                extracted_files.append(out_path)
    except Exception as exc:
        logger.error(f"Failed to extract {zip_path}: {exc}")
        return {"ok": False, "error": str(exc), "indexed_count": 0}

    # Index into documents table if not already indexed
    indexed_count = 0
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Ensure demo/system user exists for attribution
        demo_user = cursor.execute("SELECT id FROM users LIMIT 1").fetchone()
        owner_id = demo_user[0] if demo_user else "usr_vhu_system"
        if not demo_user:
            cursor.execute(
                "INSERT OR IGNORE INTO users (id, username, password_hash, role, created_at) "
                "VALUES (?, ?, ?, 'student', ?)",
                ("usr_vhu_system", "vhu_academic_office", "argon2_system_managed", now)
            )

        for doc_file in extracted_files:
            file_name = doc_file.name
            size_bytes = doc_file.stat().st_size
            try:
                content_bytes = doc_file.read_bytes()
                checksum = hashlib.sha256(content_bytes).hexdigest()
            except Exception:
                continue

            # Check if already indexed
            exists = cursor.execute(
                "SELECT id FROM documents WHERE checksum = ? OR original_name = ?",
                (checksum, file_name)
            ).fetchone()

            if not exists:
                doc_id = f"vhu_exam_{hashlib.md5(file_name.encode()).hexdigest()[:8]}"
                ext = doc_file.suffix.lower().lstrip(".") or "pdf"
                subject_name = f"Tài liệu Ôn tập & Trắc nghiệm VHU - {doc_file.stem}"
                cursor.execute("""
                INSERT INTO documents (
                    id, owner_id, filename, original_name, file_type, size_bytes,
                    checksum, status, mime_check, pii_check, dedupe_check,
                    copyright_check, quality_check, created_at, approved_at,
                    university, subject_code, subject_name
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, 'approved', 'pass', 'pass', 'pass',
                    'pass', 'pass', ?, ?,
                    'Đại học Văn Hiến', 'VHU_EXAM', ?
                )
                """, (
                    doc_id, owner_id, f"vhu_exams/{file_name}", file_name, ext, size_bytes,
                    checksum, now, now, subject_name
                ))
                indexed_count += 1
        conn.commit()

    logger.info(f"VHU resources ensured: {len(extracted_files)} files extracted, {indexed_count} new documents indexed.")
    return {
        "ok": True,
        "zip_path": str(zip_path),
        "total_files": len(extracted_files),
        "indexed_count": indexed_count
    }
