from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...services.rag_service import RAGService
from ...core.database import get_db
from ...core.security import require_member_session

router = APIRouter(prefix="/tutor", tags=["AI Tutor & RAG"])

class AskQuestionRequest(BaseModel):
    question: str
    model: Optional[str] = "gemini-flash-latest"
    request_id: Optional[str] = None


@router.post("/ask")
def ask_tutor(payload: AskQuestionRequest,
              session_user: dict = Depends(require_member_session)):
    import hashlib
    import json
    import time
    import uuid
    from ...core.config import DATABASE_URL, AI_CHAT_COST_POINTS
    from ...services.ledger_service import debit_ai_points, settle_reward, LedgerInvariantError

    question = payload.question.strip()
    if not 2 <= len(question) <= 12000:
        raise HTTPException(400, "Câu hỏi cần từ 2 đến 12000 ký tự.")
    request_id = payload.request_id or str(uuid.uuid4())
    if len(request_id) > 100:
        raise HTTPException(400, "Mã yêu cầu không hợp lệ.")

    user = session_user["id"]
    cost = AI_CHAT_COST_POINTS  # 80 UniPoints
    usage = hashlib.sha256(f"{user}:{request_id}".encode()).hexdigest()
    fingerprint = hashlib.sha256(json.dumps([question, payload.model]).encode()).hexdigest()

    def lock(conn):
        if DATABASE_URL.startswith("postgresql"):
            conn.execute("SELECT id FROM users WHERE id = ? FOR UPDATE", (user,))
        else:
            conn.execute("BEGIN IMMEDIATE")

    with get_db() as conn:
        lock(conn)
        old = conn.execute("SELECT * FROM ai_usage WHERE id = ?", (usage,)).fetchone()
        if old:
            if old["request_hash"] != fingerprint:
                raise HTTPException(409, "Mã yêu cầu đã dùng cho câu hỏi khác.")
            if old["response"]:
                return json.loads(old["response"])
            if time.time() - old["created_at"] > 600:
                if old["cost"] > 0:
                    try:
                        settle_reward(
                            conn,
                            user_id=user,
                            delta=old["cost"],
                            reason="Hoàn điểm yêu cầu AI bị gián đoạn",
                            source_type="ai_refund",
                            source_id=usage,
                            reward_event_key=f"ai_refund:{user}:{usage}",
                            proof_hash=usage,
                            proof_status="verified",
                        )
                    except Exception:
                        pass
                recovery = {
                    "answer": "Yêu cầu trước bị gián đoạn và đã được hoàn điểm. Hãy gửi câu hỏi mới.",
                    "citations": [], "grounded": False,
                    "engine": "recovered", "points_cost": 0,
                    "points_debited": False, "source_type": "unavailable",
                }
                conn.execute("UPDATE ai_usage SET status='completed', cost=0, response=? WHERE id=?",
                             (json.dumps(recovery), usage))
                conn.commit()
                return recovery
            raise HTTPException(409, "Yêu cầu đang xử lý.")

        # Debit 80 UniPoints before processing
        try:
            debit_ai_points(conn, user, cost, usage)
        except LedgerInvariantError as err:
            raise HTTPException(402, f"Không đủ điểm. Cần ít nhất {cost} UniPoints để chat AI.")

        conn.execute(
            "INSERT INTO ai_usage (id,user_id,request_hash,status,cost,created_at) "
            "VALUES (?, ?, ?, 'pending', ?, ?)",
            (usage, user, fingerprint, cost, time.time()),
        )
        conn.commit()

    failed = False
    try:
        result = RAGService.answer_question(
            question=question, model=payload.model or "gemini-flash-latest")
    except Exception:
        failed = True
        result = {
            "answer": "Máy chủ AI hiện không thể trả lời. Vui lòng thử lại sau.",
            "citations": [], "grounded": False, "engine": "error",
            "source_type": "unavailable",
        }

    # If AI processing failed, refund the 80 UniPoints
    if failed or result.get("engine") == "error":
        with get_db() as conn:
            lock(conn)
            try:
                settle_reward(
                    conn,
                    user_id=user,
                    delta=cost,
                    reason="Hoàn tiền chat AI do lỗi hệ thống",
                    source_type="ai_refund",
                    source_id=usage,
                    reward_event_key=f"ai_refund:{user}:{usage}",
                    proof_hash=usage,
                    proof_status="verified",
                )
            except Exception:
                pass
            result.update(points_cost=0, points_debited=False, usage_id=usage)
            conn.execute("UPDATE ai_usage SET status='error', cost=0, response=? WHERE id=?",
                         (json.dumps(result), usage))
            conn.commit()
        return result

    # Success: 80 UniPoints debited
    result.update(points_cost=cost, points_debited=True, usage_id=usage)

    with get_db() as conn:
        lock(conn)
        saved = conn.execute("SELECT response FROM ai_usage WHERE id=?", (usage,)).fetchone()
        if saved and saved["response"]:
            return json.loads(saved["response"])
        conn.execute("UPDATE ai_usage SET status='completed', cost=?, response=? WHERE id=?",
                     (cost, json.dumps(result), usage))
        conn.commit()
    return result

@router.get("/knowledge-base")
def get_knowledge_base():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT d.id, d.original_name, d.chunk_count, d.approved_at, d.size_bytes
        FROM documents d
        WHERE d.status = 'approved'
        ORDER BY d.approved_at DESC
        """)
        docs = [dict(r) for r in cursor.fetchall()]
        
        cursor.execute("SELECT COUNT(*) FROM document_chunks")
        total_chunks = cursor.fetchone()[0]
        
    return {
        "documents": docs,
        "total_documents": len(docs),
        "total_chunks": total_chunks
    }
