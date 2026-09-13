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

router = APIRouter(prefix="/documents", tags=["Documents & Verification"])

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
    permission_confirmed: bool = Form(True),
    session_user: dict = Depends(require_member_session),
):
    owner_id = session_user["id"]
    now = time.time()
    content_bytes = await file.read()
    size_bytes = len(content_bytes)
    
    if size_bytes > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Tập tin vượt quá giới hạn 15MB.")

    # Generate document ID and safe filename
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    ext = Path(file.filename).suffix.lower()
    saved_filename = f"{doc_id}{ext}"
    saved_path = UPLOADS_DIR / saved_filename
    
    # Save file buffer
    with open(saved_path, "wb") as f:
        f.write(content_bytes)

    # 1. Step 1: MIME check
    mime_ok, mime_msg = VerificationService.verify_mime(content_bytes, file.filename)
    if not mime_ok:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=mime_msg)

    # 2. Step 2: Compute Checksum & Deduplication check
    checksum = VerificationService.compute_sha256(content_bytes)
    dedupe_ok, dedupe_msg = VerificationService.check_duplicate(checksum)
    if not dedupe_ok:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=dedupe_msg)

    # Extract text preview for PII and Quality check
    try:
        pages = RAGService.extract_text_from_file(saved_path, file.content_type or "")
        full_text = " ".join(p["text"] for p in pages)
    except Exception as e:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"Không thể đọc nội dung tập tin: {str(e)}")

    # 3. Step 3: Privacy / PII check
    pii_ok, pii_findings = VerificationService.scan_pii(full_text)
    if not pii_ok:
        saved_path.unlink(missing_ok=True)
        findings_str = "; ".join(pii_findings)
        raise HTTPException(status_code=400, detail=f"Vi phạm chính sách bảo mật riêng tư (PII): {findings_str}")

    # 4. Step 4: Copyright confirmation
    copyright_ok = permission_confirmed
    if not copyright_ok:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Bạn chưa xác nhận quyền chia sẻ tài liệu.")

    # 5. Step 5: Academic Quality Score
    quality_ok, quality_score, quality_msg = VerificationService.evaluate_quality(full_text)
    if not quality_ok:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"Chất lượng học thuật không đạt: {quality_msg}")

    # Insert document record first so foreign key constraint passes
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO documents (
            id, owner_id, filename, original_name, file_type, size_bytes,
            checksum, status, mime_check, pii_check, dedupe_check,
            copyright_check, quality_check, rejection_reason, chunk_count,
            created_at, approved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc_id, owner_id, saved_filename, file.filename, file.content_type or ext,
            size_bytes, checksum, "pending_review", "passed", "passed", "passed",
            "passed", f"Score: {quality_score}/100", None, 0,
            now, None
        ))
        conn.commit()

    # 6. Step 6: Final Approval & Indexing
    status = "approved"
    chunk_count = RAGService.index_document(
        document_id=doc_id,
        document_name=file.filename,
        file_path=saved_path,
        file_type=file.content_type or ""
    )

    reward_points = 50
    reputation_gain = 3
    proof_hash = SolanaService.create_proof_hash(f"DOC_{doc_id}_{owner_id}_{reward_points}_{now}")
    solana_sig = SolanaService.generate_devnet_signature(proof_hash)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE documents
        SET status = 'approved', chunk_count = ?, approved_at = ?
        WHERE id = ?
        """, (chunk_count, now, doc_id))

        # Reward user
        cursor.execute("UPDATE users SET unipoints = unipoints + ?, reputation = MIN(100, reputation + ?) WHERE id = ?",
                       (reward_points, reputation_gain, owner_id))

        ledger_id = f"led_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO reward_ledger (
            id, user_id, delta, reason, source_type, source_id,
            proof_status, solana_signature, proof_hash, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ledger_id, owner_id, reward_points,
            f"Tài liệu được duyệt: {file.filename}",
            "document", doc_id, "unsubmitted", solana_sig, proof_hash, now
        ))
        conn.commit()

    return {
        "success": True,
        "document_id": doc_id,
        "filename": file.filename,
        "status": status,
        "chunk_count": chunk_count,
        "reward_points": reward_points,
        "reputation_gain": reputation_gain,
        "solana_signature": solana_sig,
        "explorer_url": SolanaService.get_explorer_url(solana_sig),
        "steps": {
            "mime": "passed",
            "privacy": "passed",
            "deduplication": "passed",
            "copyright": "passed",
            "quality": f"passed ({quality_score}/100)",
            "approval": "approved"
        }
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
