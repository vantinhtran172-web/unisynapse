import os
import time
import uuid
import json
import hashlib
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...core.database import get_db
from ...services.rag_service import RAGService, extract_term_frequencies
from ...services.solana_service import SolanaService
from ...core.config import UPLOADS_DIR, ENVIRONMENT
from ...core.security import require_admin_session, hash_password
from ...services.ledger_service import settle_reward

router = APIRouter(
    prefix="/admin",
    tags=["Admin & System"],
    dependencies=[Depends(require_admin_session)],
)

def log_audit(cursor, action: str, details: str, user_id: str = "admin"):
    now = time.time()
    event_id = f"aud_{uuid.uuid4().hex[:12]}"
    cursor.execute("""
    INSERT INTO audit_events (id, user_id, action, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (event_id, user_id, action, details, now))

class CreateTaskRequest(BaseModel):
    title: str
    domain: Optional[str] = None
    category: Optional[str] = None
    context_snippet: Optional[str] = None
    description: Optional[str] = None
    question: Optional[str] = None
    input_text: Optional[str] = None
    options: Optional[List[str]] = None
    labels: Optional[List[str]] = None
    gold_label: Optional[str] = None
    reward_points: int = 15

class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None
    domain: Optional[str] = None
    category: Optional[str] = None
    context_snippet: Optional[str] = None
    description: Optional[str] = None
    question: Optional[str] = None
    input_text: Optional[str] = None
    options: Optional[List[str]] = None
    labels: Optional[List[str]] = None
    gold_label: Optional[str] = None
    reward_points: Optional[int] = None
    status: Optional[str] = None

class RejectDocRequest(BaseModel):
    reason: str

class CreateDocRequest(BaseModel):
    title: str
    content: str
    file_type: Optional[str] = "text/plain"

class UpdateDocRequest(BaseModel):
    original_name: Optional[str] = None
    status: Optional[str] = None
    rejection_reason: Optional[str] = None

class CreateUserRequest(BaseModel):
    username: str
    password: Optional[str] = None
    role: str = "student"
    unipoints: int = 100
    reputation: int = 100
    wallet_address: Optional[str] = None

class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    reputation: Optional[int] = None
    unipoints: Optional[int] = None
    disabled: Optional[int] = None

class AdjustPointsRequest(BaseModel):
    amount: int
    reason: str

class ChunkRequest(BaseModel):
    content: str
    document_name: Optional[str] = "Tri thức quản trị viên"
    page_number: Optional[int] = 1

@router.get("/verify-key")
@router.post("/verify-key")
def verify_admin_key(admin_user: dict = Depends(require_admin_session)):
    return {
        "valid": True,
        "username": admin_user.get("username", "admin"),
        "role": admin_user.get("role", "superadmin"),
        "auth_method": admin_user.get("auth_method", "session"),
        "message": "Khoá bảo mật quản trị hợp lệ (Admin Security Key verified)",
    }

@router.get("/stats")
def get_system_stats():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tasks")
        total_tasks = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'open'")
        open_tasks = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM documents")
        total_docs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM documents WHERE status = 'approved'")
        approved_docs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM documents WHERE status = 'pending_review'")
        pending_docs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM documents WHERE status = 'rejected'")
        rejected_docs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM document_chunks")
        chunk_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM reward_ledger")
        ledger_count = cursor.fetchone()[0]

        cursor.execute("SELECT SUM(delta) FROM reward_ledger WHERE delta > 0")
        total_points = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM task_submissions")
        total_labels = cursor.fetchone()[0]
        
    return {
        "users": user_count,
        "total_tasks": total_tasks,
        "open_tasks": open_tasks,
        "total_documents": total_docs,
        "approved_documents": approved_docs,
        "pending_documents": pending_docs,
        "rejected_documents": rejected_docs,
        "indexed_chunks": chunk_count,
        "solana_proofs": ledger_count,
        "total_unipoints": total_points,
        "total_labels_submitted": total_labels
    }

@router.get("/documents")
def get_all_documents_for_audit():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT d.*, u.username as owner_name, u.address as owner_wallet
        FROM documents d
        LEFT JOIN users u ON d.owner_id = u.id
        ORDER BY d.created_at DESC
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.post("/documents/{doc_id}/approve")
def approve_document_by_admin(doc_id: str):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")

        doc = dict(doc)
        if doc["status"] == "approved":
            cursor.execute(
                "SELECT solana_signature FROM reward_ledger "
                "WHERE source_type = ? AND source_id = ? ORDER BY created_at DESC LIMIT 1",
                ("document_faculty_approved", doc_id),
            )
            ledger = cursor.fetchone()
            signature = ledger["solana_signature"] if ledger else None
            return {
                "success": True,
                "already_approved": True,
                "chunk_count": doc["chunk_count"] or 0,
                "solana_signature": signature,
                "explorer_url": SolanaService.get_explorer_url(signature) if signature else None,
            }
        if doc["status"] != "pending_review":
            raise HTTPException(status_code=409, detail="Tài liệu không ở trạng thái chờ phê duyệt.")

        file_path = UPLOADS_DIR / Path(doc["filename"]).name
        if not file_path.is_file():
            raise HTTPException(status_code=409, detail="Không tìm thấy bản lưu trữ tài liệu để phê duyệt.")

        chunk_count = RAGService.index_document(
            document_id=doc_id,
            document_name=doc["original_name"],
            file_path=file_path,
            file_type=doc["file_type"],
        )
        if chunk_count < 1:
            raise HTTPException(status_code=422, detail="Tài liệu không tạo được nội dung để lập chỉ mục.")

        award_points = 50
        proof_hash = SolanaService.create_proof_hash(f"faculty_approved:{doc_id}:{doc['checksum']}")
        devnet_sig = SolanaService.generate_devnet_signature(proof_hash)
        entry_id = f"rwd_{uuid.uuid4().hex[:12]}"
        reward_event_key = f"document_faculty_approved:{doc_id}"

        cursor.execute("""
        UPDATE documents
        SET status = 'approved', chunk_count = ?, approved_at = ?, quality_check = 'Approved by Faculty Board'
        WHERE id = ? AND status = 'pending_review'
        """, (chunk_count, now, doc_id))
        if cursor.rowcount != 1:
            raise HTTPException(status_code=409, detail="Tài liệu vừa được xử lý bởi một yêu cầu khác.")

        settle_reward(
            conn,
            user_id=doc["owner_id"],
            delta=award_points,
            reason=f"Phê duyệt Giáo trình bởi Giảng viên ({doc['original_name'][:25]})",
            source_type="document_faculty_approved",
            source_id=doc_id,
            reward_event_key=reward_event_key,
            proof_status="unsubmitted",
            solana_signature=devnet_sig,
            proof_hash=proof_hash,
            created_at=now,
        )

        log_audit(cursor, "document_faculty_approved", f"Admin approved {doc['original_name']}. {chunk_count} chunks indexed.")

    return {
        "success": True,
        "already_approved": False,
        "message": f"Đã phê duyệt tài liệu '{doc['original_name']}'! Đã lập chỉ mục {chunk_count} chunks và cộng +{award_points} UniPoints.",
        "chunk_count": chunk_count,
        "solana_signature": devnet_sig,
        "explorer_url": SolanaService.get_explorer_url(devnet_sig),
    }

@router.post("/documents/{doc_id}/reject")
def reject_document_by_admin(doc_id: str, req: RejectDocRequest):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")

        cursor.execute("""
        UPDATE documents
        SET status = 'rejected', rejection_reason = ?, quality_check = 'Rejected by Admin'
        WHERE id = ?
        """, (req.reason, doc_id))

        log_audit(cursor, "document_rejected", f"Admin rejected: {req.reason}")

    return {"success": True, "message": f"Đã từ chối tài liệu: {req.reason}"}

@router.post("/documents/{doc_id}/revoke")
def revoke_document_by_admin(doc_id: str, req: RejectDocRequest):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")

        reason = req.reason or "Thu hồi theo yêu cầu của Reviewer/Giảng viên"
        cursor.execute("""
        UPDATE documents
        SET status = 'revoked', rejection_reason = ?, quality_check = 'Revoked by Reviewer/Admin'
        WHERE id = ?
        """, (reason, doc_id))

        cursor.execute("DELETE FROM document_chunks WHERE document_id = ?", (doc_id,))
        cursor.execute("UPDATE documents SET chunk_count = 0 WHERE id = ?", (doc_id,))

        log_audit(cursor, "document_revoked", f"Admin/Reviewer revoked document {doc['original_name']}: {reason}")

    return {
        "success": True,
        "message": f"Đã thu hồi tài liệu '{doc['original_name']}'! Các đoạn tri thức đã được cô lập hoàn toàn khỏi RAG AI Tutor.",
        "status": "revoked"
    }

@router.post("/documents")
def create_document_by_admin(req: CreateDocRequest):
    now = time.time()
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    clean_title = req.title.replace(" ", "_")
    file_name = f"{doc_id}_{clean_title}.txt"
    file_path = UPLOADS_DIR / file_name
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(req.content)

    checksum = hashlib.sha256(req.content.encode("utf-8")).hexdigest()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        row = cursor.fetchone()
        owner_id = row["id"] if row else "admin_system"

        cursor.execute("""
        INSERT INTO documents (
            id, owner_id, filename, original_name, file_type, size_bytes,
            checksum, status, mime_check, pii_check, dedupe_check, copyright_check,
            quality_check, chunk_count, created_at, approved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', 'pass', 'pass', 'pass', 'pass', 'Created by Admin', 0, ?, ?)
        """, (doc_id, owner_id, file_name, req.title, req.file_type or "text/plain", len(req.content.encode("utf-8")), checksum, now, now))

    chunk_count = RAGService.index_document(
        document_id=doc_id,
        document_name=req.title,
        file_path=file_path,
        file_type="text/plain"
    )
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE documents SET chunk_count = ? WHERE id = ?", (chunk_count, doc_id))
        log_audit(cursor, "document_created_by_admin", f"Admin created document: {req.title}")

    return {"success": True, "doc_id": doc_id, "chunk_count": chunk_count, "message": f"Đã thêm tài liệu '{req.title}' thành công!"}

@router.put("/documents/{doc_id}")
def update_document(doc_id: str, req: UpdateDocRequest):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")

        fields = []
        params = []
        if req.original_name is not None:
            fields.append("original_name = ?")
            params.append(req.original_name)
        if req.status is not None:
            fields.append("status = ?")
            params.append(req.status)
        if req.rejection_reason is not None:
            fields.append("rejection_reason = ?")
            params.append(req.rejection_reason)

        if fields:
            params.append(doc_id)
            cursor.execute(f"UPDATE documents SET {', '.join(fields)} WHERE id = ?", tuple(params))
            log_audit(cursor, "document_updated", f"Admin updated document {doc_id}")

    return {"success": True, "message": "Đã cập nhật thông tin tài liệu thành công"}

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")

        cursor.execute("DELETE FROM document_chunks WHERE document_id = ?", (doc_id,))
        cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        log_audit(cursor, "document_deleted", f"Admin deleted document: {doc['original_name']}")

    return {"success": True, "message": f"Đã xóa tài liệu '{doc['original_name']}' thành công"}

@router.get("/tasks")
def get_all_tasks_for_admin():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT t.*,
               COUNT(ts.id) as total_submissions,
               SUM(CASE WHEN ts.is_gold_correct = 1 THEN 1 ELSE 0 END) as valid_votes
        FROM tasks t
        LEFT JOIN task_submissions ts ON t.id = ts.task_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
        """)
        rows = [dict(r) for r in cursor.fetchall()]
        for r in rows:
            cursor.execute("""
            SELECT label, COUNT(*) as count
            FROM task_submissions
            WHERE task_id = ?
            GROUP BY label
            ORDER BY count DESC
            """, (r["id"],))
            r["label_breakdown"] = [dict(b) for b in cursor.fetchall()]
            raw_labels = r.get("labels")
            parsed_labels = []
            if raw_labels:
                try:
                    parsed_labels = json.loads(raw_labels) if isinstance(raw_labels, str) else raw_labels
                except Exception:
                    parsed_labels = [raw_labels]
            r["options"] = parsed_labels
            r["domain"] = r.get("category") or "General"
            r["question"] = r.get("input_text") or ""
            r["context_snippet"] = r.get("description") or ""
        return rows

@router.post("/tasks")
def create_new_task(req: CreateTaskRequest):
    now = time.time()
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    options = req.options or req.labels or ["Phương án A", "Phương án B"]
    domain = req.domain or req.category or "General"
    question = req.question or req.input_text or req.context_snippet or ""
    description = req.description or req.context_snippet or ""

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO tasks (
            id, title, description, category, input_text,
            labels, required_votes, consensus_threshold, reward_points,
            gold_label, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 5, 0.7, ?, ?, 'open', ?)
        """, (
            task_id, req.title, description, domain, question,
            json.dumps(options, ensure_ascii=False), req.reward_points, req.gold_label, now
        ))
        
        log_audit(cursor, "task_created", f"Admin created task: {req.title}")

    return {
        "success": True,
        "task_id": task_id,
        "message": f"Đã tạo bài toán gán nhãn '{req.title}' thành công!"
    }

@router.put("/tasks/{task_id}")
def update_task_by_admin(task_id: str, req: UpdateTaskRequest):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        task = cursor.fetchone()
        if not task:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài toán gán nhãn")

        fields = []
        params = []
        if req.title is not None:
            fields.append("title = ?")
            params.append(req.title)
        category = req.category or req.domain
        if category is not None:
            fields.append("category = ?")
            params.append(category)
        input_text = req.input_text or req.question
        if input_text is not None:
            fields.append("input_text = ?")
            params.append(input_text)
        description = req.description or req.context_snippet
        if description is not None:
            fields.append("description = ?")
            params.append(description)
        options = req.options or req.labels
        if options is not None:
            fields.append("labels = ?")
            params.append(json.dumps(options, ensure_ascii=False))
        if req.gold_label is not None:
            fields.append("gold_label = ?")
            params.append(req.gold_label)
        if req.reward_points is not None:
            fields.append("reward_points = ?")
            params.append(req.reward_points)
        if req.status is not None:
            fields.append("status = ?")
            params.append(req.status)

        if fields:
            params.append(task_id)
            cursor.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", tuple(params))
            log_audit(cursor, "task_updated", f"Admin updated task {task_id}")

    return {"success": True, "message": "Đã cập nhật bài toán gán nhãn thành công!"}

@router.delete("/tasks/{task_id}")
def delete_task_by_admin(task_id: str):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        task = cursor.fetchone()
        if not task:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài toán gán nhãn")

        cursor.execute("DELETE FROM task_submissions WHERE task_id = ?", (task_id,))
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        log_audit(cursor, "task_deleted", f"Admin deleted task: {task['title']}")

    return {"success": True, "message": f"Đã xóa bài toán '{task['title']}' thành công!"}

@router.get("/users")
def get_all_users():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT u.*,
               COUNT(DISTINCT ts.id) as tasks_completed,
               COUNT(DISTINCT d.id) as docs_submitted
        FROM users u
        LEFT JOIN task_submissions ts ON u.id = ts.user_id
        LEFT JOIN documents d ON u.id = d.owner_id
        GROUP BY u.id
        ORDER BY u.unipoints DESC
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.post("/users")
def create_user_by_admin(req: CreateUserRequest):
    now = time.time()
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    password = req.password or "UniSynapse@2026"
    pwd_hash = hash_password(password)
    wallet_address = req.wallet_address or f"0x{uuid.uuid4().hex[:40]}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ?", (req.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Tên người dùng đã tồn tại trên hệ thống")

        cursor.execute("""
        INSERT INTO users (
            id, address, username, password_hash, disabled, unipoints, reputation, role, created_at
        ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
        """, (user_id, wallet_address, req.username, pwd_hash, req.unipoints, req.reputation, req.role, now))

        log_audit(cursor, "user_created", f"Admin created user: {req.username} ({req.role})", user_id=user_id)

    return {"success": True, "user_id": user_id, "message": f"Đã tạo người dùng '{req.username}' thành công!"}

@router.put("/users/{user_id}")
def update_user_by_admin(user_id: str, req: UpdateUserRequest):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        fields = []
        params = []
        if req.username is not None:
            fields.append("username = ?")
            params.append(req.username)
        if req.role is not None:
            fields.append("role = ?")
            params.append(req.role)
        if req.reputation is not None:
            fields.append("reputation = ?")
            params.append(req.reputation)
        if req.unipoints is not None:
            fields.append("unipoints = ?")
            params.append(req.unipoints)
        if req.disabled is not None:
            fields.append("disabled = ?")
            params.append(req.disabled)

        if fields:
            params.append(user_id)
            cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", tuple(params))
            log_audit(cursor, "user_updated", f"Admin updated user {user_id}", user_id=user_id)

    return {"success": True, "message": "Đã cập nhật thông tin thành viên thành công!"}

@router.post("/users/{user_id}/adjust-points")
def adjust_user_points(user_id: str, req: AdjustPointsRequest):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        proof_hash = SolanaService.create_proof_hash(f"admin_adj:{user_id}:{req.amount}:{now}")
        devnet_sig = SolanaService.generate_devnet_signature(proof_hash)
        entry_id = f"rwd_adj_{uuid.uuid4().hex[:10]}"

        settle_reward(
            conn,
            user_id=user_id,
            delta=req.amount,
            reason=f"[Admin điều chỉnh] {req.reason}",
            source_type="admin_adjustment",
            source_id=f"adj_{user_id}_{int(now)}",
            reward_event_key=f"admin_adj_{entry_id}",
            proof_status="unsubmitted",
            solana_signature=devnet_sig,
            proof_hash=proof_hash,
            created_at=now,
        )

        log_audit(cursor, "points_adjusted", f"Admin adjusted {req.amount} UniPoints for {user['username']}: {req.reason}", user_id=user_id)

    return {
        "success": True,
        "message": f"Đã {'cộng' if req.amount >= 0 else 'trừ'} {abs(req.amount)} UniPoints cho '{user['username']}' thành công!",
        "solana_signature": devnet_sig,
        "explorer_url": SolanaService.get_explorer_url(devnet_sig),
    }

@router.delete("/users/{user_id}")
def delete_user_by_admin(user_id: str):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        if user["role"] == "admin":
            raise HTTPException(status_code=403, detail="Không thể xóa tài khoản Quản trị viên tối cao!")

        cursor.execute("DELETE FROM member_sessions WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM task_submissions WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        log_audit(cursor, "user_deleted", f"Admin deleted user: {user['username']}", user_id=user_id)

    return {"success": True, "message": f"Đã xóa thành viên '{user['username']}' thành công!"}

@router.get("/chunks")
def get_all_chunks_for_admin(query: Optional[str] = None, document_id: Optional[str] = None, limit: int = 50, offset: int = 0):
    with get_db() as conn:
        cursor = conn.cursor()
        sql = "SELECT dc.id, dc.document_id, dc.document_name, dc.chunk_index, dc.page_number, dc.content, dc.created_at FROM document_chunks dc WHERE 1=1"
        params = []
        if document_id:
            sql += " AND dc.document_id = ?"
            params.append(document_id)
        if query:
            sql += " AND (dc.content LIKE ? OR dc.document_name LIKE ?)"
            params.extend([f"%{query}%", f"%{query}%"])
        sql += " ORDER BY dc.created_at DESC, dc.chunk_index ASC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(sql, tuple(params))
        chunks = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT COUNT(*) FROM document_chunks")
        total = cursor.fetchone()[0]

        return {"chunks": chunks, "total": total}

@router.post("/chunks")
def create_chunk_by_admin(req: ChunkRequest):
    now = time.time()
    chunk_id = f"chk_adm_{uuid.uuid4().hex[:10]}"
    tf_vec = extract_term_frequencies(req.content)
    embedding_json = json.dumps(tf_vec)
    doc_id = "doc_admin_knowledge"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM documents WHERE id = ?", (doc_id,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes,
                checksum, status, mime_check, pii_check, dedupe_check, copyright_check,
                quality_check, chunk_count, created_at, approved_at
            ) VALUES (?, 'admin', 'admin_knowledge.txt', 'Kho Tri Thức Trực Tiếp Admin', 'text/plain', 100,
                      ?, 'approved', 'pass', 'pass', 'pass', 'pass', 'Direct Admin Knowledge', 1, ?, ?)
            """, (doc_id, f"chksum_{chunk_id}", now, now))

        cursor.execute("""
        INSERT INTO document_chunks (
            id, document_id, document_name, chunk_index, page_number, content, embedding, created_at
        ) VALUES (?, ?, ?, 0, ?, ?, ?, ?)
        """, (chunk_id, doc_id, req.document_name or "Kho Tri Thức Quản Trị", req.page_number or 1, req.content, embedding_json, now))

        cursor.execute("UPDATE documents SET chunk_count = (SELECT COUNT(*) FROM document_chunks WHERE document_id = ?) WHERE id = ?", (doc_id, doc_id))
        log_audit(cursor, "chunk_created", f"Admin added knowledge chunk: {req.content[:50]}...")

    return {"success": True, "chunk_id": chunk_id, "message": "Đã thêm đoạn tri thức vào RAG AI Tutor thành công!"}

@router.put("/chunks/{chunk_id}")
def update_chunk_by_admin(chunk_id: str, req: ChunkRequest):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM document_chunks WHERE id = ?", (chunk_id,))
        chunk = cursor.fetchone()
        if not chunk:
            raise HTTPException(status_code=404, detail="Không tìm thấy đoạn tri thức")

        tf_vec = extract_term_frequencies(req.content)
        embedding_json = json.dumps(tf_vec)

        cursor.execute("""
        UPDATE document_chunks
        SET content = ?, document_name = ?, page_number = ?, embedding = ?
        WHERE id = ?
        """, (req.content, req.document_name or chunk["document_name"], req.page_number or chunk["page_number"], embedding_json, chunk_id))

        log_audit(cursor, "chunk_updated", f"Admin updated chunk {chunk_id}")

    return {"success": True, "message": "Đã cập nhật đoạn tri thức thành công!"}

@router.delete("/chunks/{chunk_id}")
def delete_chunk_by_admin(chunk_id: str):
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM document_chunks WHERE id = ?", (chunk_id,))
        chunk = cursor.fetchone()
        if not chunk:
            raise HTTPException(status_code=404, detail="Không tìm thấy đoạn tri thức")

        doc_id = chunk["document_id"]
        cursor.execute("DELETE FROM document_chunks WHERE id = ?", (chunk_id,))
        cursor.execute("UPDATE documents SET chunk_count = (SELECT COUNT(*) FROM document_chunks WHERE document_id = ?) WHERE id = ?", (doc_id, doc_id))

        log_audit(cursor, "chunk_deleted", f"Admin deleted chunk {chunk_id}")

    return {"success": True, "message": "Đã xóa đoạn tri thức khỏi kho RAG thành công!"}

@router.get("/ledger")
def get_system_ledger():
    with get_db() as conn:
        cursor = conn.cursor()

        # Tự động đồng bộ solana_signature từ bank_deposits nếu trong ledger chưa có
        cursor.execute("""
        UPDATE reward_ledger
        SET solana_signature = (
            SELECT bd.solana_signature
            FROM bank_deposits bd
            WHERE (bd.id = reward_ledger.source_id OR reward_ledger.reward_event_key = ('acb_deposit:' || bd.order_code))
              AND bd.solana_signature IS NOT NULL AND bd.solana_signature != ''
            LIMIT 1
        )
        WHERE (solana_signature IS NULL OR solana_signature = '')
          AND source_type = 'acb_bank_deposit'
        """)

        # Tự động đồng bộ solana_signature từ documents nếu là đóng góp học liệu
        cursor.execute("""
        UPDATE reward_ledger
        SET solana_signature = (
            SELECT d.solana_tx
            FROM documents d
            WHERE d.id = reward_ledger.source_id
              AND d.solana_tx IS NOT NULL AND d.solana_tx != ''
            LIMIT 1
        )
        WHERE (solana_signature IS NULL OR solana_signature = '')
          AND source_type = 'document_upload'
        """)
        conn.commit()

        cursor.execute("""
        SELECT rl.*, u.username, u.address as wallet_address,
               bd.solana_signature as bank_solana_signature,
               bd.target_wallet, bd.sol_amount, bd.payout_mode
        FROM reward_ledger rl
        LEFT JOIN users u ON rl.user_id = u.id
        LEFT JOIN bank_deposits bd ON (rl.source_id = bd.id OR rl.reward_event_key = ('acb_deposit:' || bd.order_code))
        ORDER BY rl.created_at DESC
        LIMIT 150
        """)
        rows = [dict(r) for r in cursor.fetchall()]
        for r in rows:
            sig = r.get("solana_signature") or r.get("bank_solana_signature")
            r["solana_signature"] = sig
            r["amount"] = r.get("delta", 0)
            r["tx_type"] = r.get("reason", r.get("source_type", "TRANSACTION"))
            r["memo"] = r.get("reason", "")
            r["timestamp"] = r.get("created_at", 0)
            if sig:
                r["explorer_url"] = SolanaService.get_explorer_url(sig) or f"https://explorer.solana.com/tx/{sig}?cluster=devnet"
            else:
                r["explorer_url"] = None
        return rows

@router.get("/bank-deposits")
def get_all_bank_deposits():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT bd.*, u.username, u.address as wallet_address
        FROM bank_deposits bd
        LEFT JOIN users u ON bd.user_id = u.id
        ORDER BY bd.created_at DESC
        LIMIT 100
        """)
        rows = [dict(r) for r in cursor.fetchall()]
        for r in rows:
            sig = r.get("solana_signature")
            if sig:
                r["explorer_url"] = f"https://explorer.solana.com/tx/{sig}?cluster=devnet"
            else:
                r["explorer_url"] = None
        return rows

@router.get("/audit-events")
def get_audit_events():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM audit_events
        ORDER BY timestamp DESC
        LIMIT 80
        """)
        rows = [dict(r) for r in cursor.fetchall()]
        for r in rows:
            r["created_at"] = r.get("timestamp", 0)
            r["event_type"] = r.get("action", "")
            r["actor_id"] = r.get("user_id", "admin")
        return rows

def seed_sample_syllabus():
    """
    Khởi tạo tài liệu học phần mẫu CS101 (Lập trình nâng cao & Cấu trúc dữ liệu)
    để RAG AI Tutor có dữ liệu chuẩn hóa trả lời ngay lập tức.
    """
    now = time.time()
    member_id = os.getenv("DEMO_MEMBER_ID", "").strip()
    if not member_id:
        raise RuntimeError("DEMO_MEMBER_ID is required for sample syllabus seed")
    doc_id = "doc_cs101_sample"
    file_name = "CS101_Syllabus_LapTrinhC.txt"
    file_path = UPLOADS_DIR / file_name

    with get_db() as conn:
        cursor = conn.cursor()
        member = cursor.execute(
            "SELECT id FROM users WHERE id = ? AND disabled = 0",
            (member_id,),
        ).fetchone()
        if not member:
            raise RuntimeError("DEMO_MEMBER_ID must reference an existing active member")
        cursor.execute("SELECT COUNT(*) FROM documents WHERE id = ?", (doc_id,))
        if cursor.fetchone()[0] > 0:
            return

    syllabus_text = """TRƯỜNG ĐẠI HỌC BÁCH KHOA - KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH
GIÁO TRÌNH HỌC PHẦN CS101: NHẬP MÔN KỸ THUẬT LẬP TRÌNH VÀ CẤU TRÚC DỮ LIỆU
Năm học 2025 - 2026

Chương 1: Quản lý bộ nhớ và Con trỏ trong ngôn ngữ C/C++
1.1 Khái niệm Con trỏ (Pointers)
Con trỏ là biến dùng để lưu trữ địa chỉ bộ nhớ của một biến khác. Toán tử & (address-of) lấy địa chỉ của biến, toán tử * (dereference) truy xuất giá trị tại vùng nhớ mà con trỏ đang trỏ tới.
Con trỏ cho phép truy cập trực tiếp vào bộ nhớ máy tính, truyền tham chiếu trong hàm và xây dựng các cấu trúc dữ liệu động.

1.2 Cấp phát bộ nhớ động (Dynamic Memory Allocation)
Trong ngôn ngữ C, bộ nhớ động nằm trên vùng nhớ Heap và được quản lý thông qua thư viện <stdlib.h>:
- Hàm malloc(size_t size): Cấp phát một khối bộ nhớ có kích thước size bytes. Nội dung bên trong vùng nhớ chưa được khởi tạo (chứa giá trị rác). Nếu cấp phát thất bại, hàm trả về NULL.
- Hàm calloc(size_t num, size_t size): Cấp phát bộ nhớ cho mảng gồm num phần tử và tự động gán giá trị 0 cho tất cả các byte.
- Hàm realloc(void *ptr, size_t new_size): Thay đổi kích thước khối bộ nhớ đã cấp phát trước đó.
- Hàm free(void *ptr): Giải phóng vùng nhớ Heap đã cấp phát để tránh rò rỉ bộ nhớ (Memory Leak). Sau khi gọi hàm free, cần gán con trỏ bằng NULL để tránh lỗi con trỏ lơ lửng (Dangling Pointer).

Chương 2: Cấu trúc dữ liệu tự cân bằng - Cây Đỏ Đen (Red-Black Tree)
2.1 Định nghĩa và tính chất của Cây Đỏ Đen
Cây Đỏ Đen là một dạng cây nhị phân tìm kiếm tự cân bằng (Self-balancing Binary Search Tree), trong đó mỗi nút có thêm thuộc tính màu: ĐỎ hoặc ĐEN.
Các tính chất bất biến của Cây Đỏ Đen:
1. Mỗi nút là Đỏ hoặc Đen.
2. Nút gốc (Root) luôn luôn là màu Đen.
3. Tất cả các nút lá rỗng (NIL) đều có màu Đen.
4. Nếu một nút có màu Đỏ thì cả hai nút con của nó phải có màu Đen (Không có hai nút Đỏ liền kề).
5. Mọi đường đi đơn giản từ một nút bất kỳ đến bất kỳ nút lá nào thuộc cây con của nó đều có cùng số lượng nút Đen (Black-height bằng nhau).
Nhờ các tính chất này, chiều cao của cây Đỏ Đen có N nút không bao giờ vượt quá 2 * log2(N + 1), đảm bảo các thao tác Tìm kiếm, Chèn và Xóa luôn có độ phức tạp thời gian O(log N).

Chương 3: Điều kiện qua môn và Tiêu chuẩn đánh giá
Điểm tổng kết học phần CS101 = Chuyên cần (10%) + Bài tập lớn & Thực hành (30%) + Thi giữa kỳ (20%) + Thi cuối kỳ (40%).
Điều kiện qua môn: Điểm tổng kết đạt từ 5.0/10 trở lên và điểm thi cuối kỳ không bị điểm liệt (trên 3.0).
"""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(syllabus_text)

    import hashlib
    checksum = hashlib.sha256(syllabus_text.encode("utf-8")).hexdigest()

    # Đăng ký tài liệu
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR IGNORE INTO documents (
            id, owner_id, filename, original_name, file_type, size_bytes,
            checksum, status, mime_check, pii_check, dedupe_check, copyright_check,
            quality_check, chunk_count, created_at, approved_at
        ) VALUES (?, ?, ?, 'CS101_Syllabus_LapTrinhC.txt', 'text/plain', ?, ?, 'approved', 'pass', 'pass', 'pass', 'pass', 'Approved by Faculty Board', 0, ?, ?)
        """, (doc_id, member_id, file_name, len(syllabus_text.encode("utf-8")), checksum, now, now))
        conn.commit()

    # Lập chỉ mục chunks (tự mở kết nối db độc lập)
    chunk_count = RAGService.index_document(
        document_id=doc_id,
        document_name="CS101_Syllabus_LapTrinhC.txt",
        file_path=file_path,
        file_type="text/plain"
    )

    # Cập nhật số chunk và sổ cái
    proof_hash = SolanaService.create_proof_hash(f"sample_syllabus:{doc_id}:{checksum}")
    devnet_sig = SolanaService.generate_devnet_signature(proof_hash)
    entry_id = f"rwd_seed_{doc_id}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE documents SET chunk_count = ? WHERE id = ?", (chunk_count, doc_id))
        cursor.execute("""
        INSERT OR IGNORE INTO reward_ledger (
            id, user_id, delta, reason, source_type, source_id,
            proof_status, solana_signature, proof_hash, created_at
        ) VALUES (?, ?, 50, 'Giáo trình chuẩn hóa CS101 (Faculty Board)', 'document_seed', ?, 'unsubmitted', ?, ?, ?)
        """, (entry_id, member_id, doc_id, devnet_sig, proof_hash, now))
        conn.commit()

