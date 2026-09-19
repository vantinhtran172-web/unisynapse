import time
import uuid
from typing import Optional, List, Dict, Any
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from ...core.config import UPLOADS_DIR
from ...core.database import get_db
from ...core.security import require_member_session, get_optional_member_session
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
    university: Optional[str] = Form("Đại học Bách Khoa TP.HCM"),
    subject_code: Optional[str] = Form("CS101"),
    subject_name: Optional[str] = Form("Lập trình C & Kỹ thuật Con trỏ"),
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
                university, subject_code, subject_name,
                created_at, approved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review', 'passed', 'pending',
                      'passed', 'pending', 'pending', NULL, 0, ?, ?, ?, ?, NULL)
            """, (
                doc_id, owner_id, saved_filename, original_name,
                file.content_type or ext, size_bytes, checksum,
                university or "Đại học Bách Khoa TP.HCM",
                subject_code or "CS101",
                subject_name or "Lập trình C & Kỹ thuật Con trỏ",
                now,
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

    # Fetch student wallet address if linked
    owner_wallet = None
    with get_db() as conn:
        u = conn.execute("SELECT address FROM users WHERE id = ?", (owner_id,)).fetchone()
        if u and u["address"]:
            owner_wallet = u["address"]

    from ...services.solana_onramp_service import SolanaOnRampService
    onchain_proof = SolanaOnRampService.record_academic_proof_onchain(
        doc_id=doc_id,
        checksum=checksum,
        title=original_name,
        quality_score=quality_score,
        owner_pubkey=owner_wallet,
    )
    solana_signature = onchain_proof.get("signature")
    explorer_url = onchain_proof.get("explorer_url")
    reward_event_key = f"document_upload:{doc_id}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE documents
        SET status = 'approved', chunk_count = ?, approved_at = ?, quality_check = ?, solana_tx = ?
        WHERE id = ?
        """, (chunk_count, now, f"passed ({quality_score}/100)", solana_signature, doc_id))

        settle_reward(
            conn,
            user_id=owner_id,
            delta=award_points,
            reason=f"Đóng góp học liệu: {original_name[:25]}",
            source_type="document_upload",
            source_id=doc_id,
            reward_event_key=reward_event_key,
            proof_status="submitted",
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
        "checksum": checksum,
        "university": university or "Đại học Bách Khoa TP.HCM",
        "subject_code": subject_code or "CS101",
        "subject_name": subject_name or "Lập trình C & Kỹ thuật Con trỏ",
        "status": "approved",
        "chunk_count": chunk_count,
        "reward_points": award_points,
        "reputation_gain": reputation_gain,
        "solana_signature": solana_signature,
        "solana_tx": solana_signature,
        "explorer_url": explorer_url,
        "steps": {
            "mime": "passed",
            "privacy": "passed",
            "deduplication": "passed",
            "copyright": "passed",
            "quality": f"passed ({quality_score}/100)",
            "approval": "approved",
        },
    }

@router.get("/{document_id}/content")
def get_document_content(
    document_id: str,
    session_user: Optional[dict] = Depends(get_optional_member_session),
):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (document_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu.")
        doc_dict = dict(doc)

        # Get chunks
        cursor.execute(
            "SELECT chunk_index, page_number, content FROM document_chunks WHERE document_id = ? ORDER BY chunk_index ASC",
            (document_id,)
        )
        chunks = [dict(c) for c in cursor.fetchall()]

        full_text = ""
        file_path = UPLOADS_DIR / doc_dict["filename"]
        if file_path.exists():
            try:
                if file_path.suffix.lower() in [".txt", ".md", ".json", ".csv", ".py", ".cpp", ".java", ".sql"]:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        full_text = f.read()
                elif file_path.suffix.lower() == ".pdf":
                    import pypdf
                    reader = pypdf.PdfReader(str(file_path))
                    p_texts = [p.extract_text() or "" for p in reader.pages]
                    full_text = "\n\n--- [Trang Kế Tiếp] ---\n\n".join(t.strip() for t in p_texts if t.strip())
                else:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        full_text = f.read()
            except Exception:
                pass

        if not full_text and chunks:
            full_text = "\n\n".join(c["content"] for c in chunks)

        return {
            "id": doc_dict["id"],
            "document_id": doc_dict["id"],
            "original_name": doc_dict["original_name"],
            "university": doc_dict.get("university") or "Đại học Bách Khoa TP.HCM",
            "subject_code": doc_dict.get("subject_code") or "CS101",
            "subject_name": doc_dict.get("subject_name") or "Lập trình C & Cấu trúc Dữ liệu",
            "status": doc_dict["status"],
            "chunk_count": doc_dict.get("chunk_count", 0),
            "solana_tx": doc_dict.get("solana_tx"),
            "full_text": full_text,
            "content": full_text,
            "chunks": chunks,
        }

@router.get("/{document_id}/download")
def download_document_source(
    document_id: str,
):
    from fastapi.responses import FileResponse
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (document_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu.")
        doc_dict = dict(doc)
        file_path = UPLOADS_DIR / doc_dict["filename"]
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File nguồn không tồn tại trên hệ thống lưu trữ.")
        
        original_name = doc_dict.get("original_name") or doc_dict["filename"]
        media_type = "text/plain; charset=utf-8" if file_path.suffix.lower() == ".txt" else "application/octet-stream"
        return FileResponse(
            path=str(file_path),
            filename=original_name,
            media_type=media_type
        )

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
