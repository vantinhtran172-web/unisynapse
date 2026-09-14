import os
import time
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...core.database import get_db
from ...services.rag_service import RAGService
from ...services.solana_service import SolanaService
from ...core.config import UPLOADS_DIR, ENVIRONMENT
from ...core.security import require_admin_session
from ...services.ledger_service import settle_reward

router = APIRouter(
    prefix="/admin",
    tags=["Admin & System"],
    dependencies=[Depends(require_admin_session)],
)

class CreateTaskRequest(BaseModel):
    title: str
    domain: str
    context_snippet: str
    question: str
    options: List[str]
    gold_label: Optional[str] = None
    reward_points: int = 15

class RejectDocRequest(BaseModel):
    reason: str

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

        cursor.execute("""
        INSERT INTO audit_events (id, event_type, entity_id, actor_id, details, created_at)
        VALUES (?, 'document_faculty_approved', ?, 'admin', ?, ?)
        """, (f"aud_{uuid.uuid4().hex[:12]}", doc_id, f"Admin approved {doc['original_name']}. {chunk_count} chunks indexed.", now))

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

        # Audit event
        cursor.execute("""
        INSERT INTO audit_events (id, event_type, entity_id, actor_id, details, created_at)
        VALUES (?, 'document_rejected', ?, 'admin', ?, ?)
        """, (f"aud_{uuid.uuid4().hex[:12]}", doc_id, f"Admin rejected: {req.reason}", now))

    return {"success": True, "message": f"Đã từ chối tài liệu: {req.reason}"}

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
        return rows

@router.post("/tasks")
def create_new_task(req: CreateTaskRequest):
    import json
    now = time.time()
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO tasks (
            id, title, domain, context_snippet, question,
            options, gold_label, reward_points, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
        """, (
            task_id, req.title, req.domain, req.context_snippet, req.question,
            json.dumps(req.options, ensure_ascii=False), req.gold_label, req.reward_points, now
        ))
        
        # Log audit
        cursor.execute("""
        INSERT INTO audit_events (id, event_type, entity_id, actor_id, details, created_at)
        VALUES (?, 'task_created', ?, 'admin', ?, ?)
        """, (f"aud_{uuid.uuid4().hex[:12]}", task_id, f"Admin created task: {req.title}", now))

    return {
        "success": True,
        "task_id": task_id,
        "message": f"Đã tạo bài toán gán nhãn '{req.title}' thành công!"
    }

@router.get("/ledger")
def get_system_ledger():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT rl.*, u.username, u.address as wallet_address
        FROM reward_ledger rl
        LEFT JOIN users u ON rl.user_id = u.id
        ORDER BY rl.created_at DESC
        LIMIT 100
        """)
        rows = [dict(r) for r in cursor.fetchall()]
        for r in rows:
            if r.get("solana_signature"):
                r["explorer_url"] = SolanaService.get_explorer_url(r["solana_signature"])
        return rows

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

@router.get("/audit-events")
def get_audit_events():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM audit_events
        ORDER BY created_at DESC
        LIMIT 80
        """)
        return [dict(r) for r in cursor.fetchall()]

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

