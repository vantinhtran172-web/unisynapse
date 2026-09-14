"""Safe cleanup for abandoned document quarantine objects."""

from __future__ import annotations

import time
from pathlib import Path
from typing import Optional

from ..core.config import UPLOADS_DIR
from ..core.database import get_db


DEFAULT_RETENTION_SECONDS = 24 * 60 * 60


def cleanup_quarantine(
    quarantine_dir: Optional[Path] = None,
    *,
    retention_seconds: int = DEFAULT_RETENTION_SECONDS,
    now: Optional[float] = None,
) -> int:
    """Remove only old quarantine files with no live pending document record."""
    if retention_seconds < 0:
        raise ValueError("retention_seconds must be non-negative")

    directory = quarantine_dir or (UPLOADS_DIR / ".quarantine")
    if not directory.exists():
        return 0

    cutoff = (time.time() if now is None else now) - retention_seconds
    removed = 0
    for candidate in directory.iterdir():
        if not candidate.is_file() or candidate.stat().st_mtime > cutoff:
            continue

        with get_db() as conn:
            row = conn.execute(
                "SELECT status FROM documents WHERE filename = ? LIMIT 1",
                (candidate.name,),
            ).fetchone()
        if row and row["status"] == "pending_review":
            continue

        candidate.unlink(missing_ok=True)
        removed += 1

    return removed