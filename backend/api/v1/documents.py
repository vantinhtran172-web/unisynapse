import time
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from ...core.config import UPLOADS_DIR
from ...core.database import get_db
from ...core.security import require_member_session
from ...services.verification_service import VerificationService
from ...services.rag_service import RAGService
from ...services.solana_service import SolanaService
from ...services.ledger_service import settle_reward

router = APIRouter(prefix="/documents", tags=["Documents & Verification"])
QUARANTINE_DIR = UPLOADS_DIR / ".quarantine"
QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)


def _update_gate(document_id: str, **fields: str) -> None:
    allowed = {
        "status", "mime_check", "pii_check", "dedupe_check",
        "copyright_check", "quality_check", "rejection_reason",
    }
    updates = {key: value for key, value in fields.items() if key in allowed}
    if not updates:
        return
    assignments = ", ".join(f"{key} = ?" for key in updates)
    values = [*updates.values(), document_id]
    with get_db() as conn:
        conn.execute(
            f"UPDATE documents SET {assignments} WHERE id = ?",
            values,
        )
        conn.commit()

@router.get("")
def list_documents(session_user: dict = Depends(require_member_session)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM documents WHERE owner_id = ? ORDER BY created_at DESC",
            (session_user["id"],),
        )
        return [dict(r) for r in cursor.fetchall()]

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    permission_confirmed: bool = Form(False),
    session_user: dict = Depends(require_member_session),
):
    owner_id = session_user["id"]
    now = time.time()
    content_bytes = await file.read()
    size_bytes = len(content_bytes)

    if size_bytes > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Tập tin vượt quá giới hạn 15MB.")

    original_name = Path(file.filename or "").name
    if not original_name or original_name in {".", ".."}:
        raise HTTPException(status_code=400, detail="Tên tập tin không hợp lệ.")

    # Keep untrusted content in a non-public quarantine location until all gates pass.
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    ext = Path(original_name).suffix.lower()
    saved_filename = f"{doc_id}{ext}"
    saved_path = QUARANTINE_DIR / saved_filename

    with open(saved_path, "wb") as f:
        f.write(content_bytes)

    checksum = VerificationService.compute_sha256(content_bytes)

    # 1. Step 1: MIME check
    mime_ok, mime_msg = VerificationService.verify_mime(content_bytes, original_name)
    if not mime_ok:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=mime_msg)

    # 2. Step 2: Deduplication check BEFORE inserting into DB to prevent IntegrityError
    dedupe_ok, dedupe_msg = VerificationService.check_duplicate(checksum, doc_id)
    if not dedupe_ok:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=dedupe_msg)

    with get_db() as conn:
        try:
            conn.execute("""
            INSERT INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes,
                checksum, status, mime_check, pii_check, dedupe_check,
                copyright_check, quality_check, rejection_reason, chunk_count,
                created_at, approved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review', 'passed', 'pending',
                      'passed', 'pending', 'pending', NULL, 0, ?, NULL)
            """, (
                doc_id, owner_id, saved_filename, original_name,
                file.content_type or ext, size_bytes, checksum, now,
            ))
            conn.commit()
        except Exception as exc:
            saved_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=f"Tài liệu đã tồn tại hoặc không thể đăng ký: {exc}")

    def reject_gate(field: str, reason: str) -> None:
        _update_gate(
            doc_id,
            status="rejected",
            **{field: "failed", "rejection_reason": reason},
        )
        saved_path.unlink(missing_ok=True)

    # Extract text preview for PII and Quality check
    try:
        pages = RAGService.extract_text_from_file(saved_path, file.content_type or "")
        full_text = " ".join(p["text"] for p in pages)
    except Exception as exc:
        reason = f"Không thể đọc nội dung tập tin: {exc}"
        reject_gate("quality_check", reason)
        raise HTTPException(status_code=400, detail=reason)

    # 3. Step 3: Privacy / PII check
    pii_ok, pii_findings = VerificationService.scan_pii(full_text)
    if not pii_ok:
        findings_str = "; ".join(pii_findings)
        reject_gate("pii_check", findings_str)
        raise HTTPException(status_code=400, detail=f"Vi phạm chính sách bảo mật riêng tư (PII): {findings_str}")
    _update_gate(doc_id, pii_check="passed")

    # 4. Step 4: Copyright confirmation
    if not permission_confirmed:
        reason = "Bạn chưa xác nhận quyền chia sẻ tài liệu."
        reject_gate("copyright_check", reason)
        raise HTTPException(status_code=400, detail=reason)
    _update_gate(doc_id, copyright_check="passed")

    # 5. Step 5: Academic Quality Score
    quality_ok, quality_score, quality_msg = VerificationService.evaluate_quality(full_text)
    if not quality_ok:
        reject_gate("quality_check", quality_msg)
        raise HTTPException(status_code=400, detail=f"Chất lượng học thuật không đạt: {quality_msg}")
    _update_gate(doc_id, quality_check=f"passed ({quality_score}/100)")

    # Promote only fully validated content into managed storage.
    managed_path = UPLOADS_DIR / saved_filename
    try:
        saved_path.replace(managed_path)
    except OSError as exc:
        _update_gate(
            doc_id,
            status="rejected",
            rejection_reason=f"Không thể lưu trữ an toàn tài liệu: {exc}",
        )
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Không thể lưu trữ an toàn tài liệu.")

    # Auto-index and approve document immediately upon passing verification gates
    chunk_count = RAGService.index_document(
        document_id=doc_id,
        document_name=original_name,
        file_path=managed_path,
        file_type=file.content_type or ext,
    )

    award_points = 50
    reputation_gain = 5
    proof_hash = SolanaService.create_proof_hash(f"document_upload:{doc_id}:{checksum}")
    solana_signature = SolanaService.generate_devnet_signature(proof_hash)
    reward_event_key = f"document_upload:{doc_id}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE documents
        SET status = 'approved', chunk_count = ?, approved_at = ?, quality_check = ?
        WHERE id = ?
        """, (chunk_count, now, f"passed ({quality_score}/100)", doc_id))

        settle_reward(
            conn,
            user_id=owner_id,
            delta=award_points,
            reason=f"Đóng góp học liệu: {original_name[:25]}",
            source_type="document_upload",
            source_id=doc_id,
            reward_event_key=reward_event_key,
            proof_status="unsubmitted",
            solana_signature=solana_signature,
            proof_hash=proof_hash,
            created_at=now,
        )
        cursor.execute("UPDATE users SET reputation = reputation + ? WHERE id = ?", (reputation_gain, owner_id))
        conn.commit()

    return {
        "success": True,
        "document_id": doc_id,
        "filename": original_name,
        "status": "approved",
        "chunk_count": chunk_count,
        "reward_points": award_points,
        "reputation_gain": reputation_gain,
        "solana_signature": solana_signature,
        "explorer_url": SolanaService.get_explorer_url(solana_signature),
        "steps": {
            "mime": "passed",
            "privacy": "passed",
            "deduplication": "passed",
            "copyright": "passed",
            "quality": f"passed ({quality_score}/100)",
            "approval": "approved",
        },
    }

@router.get("/{document_id}")
def get_document_details(
    document_id: str,
    session_user: dict = Depends(require_member_session),
):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM documents WHERE id = ? AND owner_id = ?",
            (document_id, session_user["id"]),
        )
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Tài liệu không tìm thấy.")
        return dict(doc)
