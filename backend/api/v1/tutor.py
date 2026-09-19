from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...services.rag_service import RAGService
from ...core.database import get_db
from ...core.security import require_member_session

router = APIRouter(prefix="/tutor", tags=["AI Tutor & RAG"])

class AskQuestionRequest(BaseModel):
    question: str
    model: Optional[str] = "cx/gpt-5.6-luna"
    university: Optional[str] = None
    subject_code: Optional[str] = None
    request_id: Optional[str] = None


@router.get("/tier")
def get_tutor_tier(session_user: dict = Depends(require_member_session)):
    from ...core.config import AI_CHAT_COST_POINTS
    user = session_user["id"]
    with get_db() as conn:
        completed_count = conn.execute(
            "SELECT COUNT(*) FROM ai_usage WHERE user_id = ? AND status = 'completed'",
            (user,)
        ).fetchone()[0]
        free_left = max(0, 3 - completed_count)
        return {
            "free_questions_left": free_left,
            "is_free_tier": free_left > 0,
            "chat_cost_points": 0 if free_left > 0 else AI_CHAT_COST_POINTS,
            "standard_cost": AI_CHAT_COST_POINTS,
        }


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
    usage = hashlib.sha256(f"{user}:{request_id}".encode()).hexdigest()
    fingerprint = hashlib.sha256(json.dumps([question, payload.model, payload.subject_code, payload.university]).encode()).hexdigest()

    def lock(conn):
        if DATABASE_URL.startswith("postgresql"):
            conn.execute("SELECT id FROM users WHERE id = ? FOR UPDATE", (user,))
        else:
            conn.execute("BEGIN IMMEDIATE")

    with get_db() as conn:
        lock(conn)

        # Check Free Tier (first 3 questions are 100% free of charge)
        completed_count = conn.execute(
            "SELECT COUNT(*) FROM ai_usage WHERE user_id = ? AND status = 'completed'",
            (user,)
        ).fetchone()[0]
        is_free_tier = completed_count < 3
        cost = 0 if is_free_tier else AI_CHAT_COST_POINTS

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
                    "is_free_tier": is_free_tier,
                    "free_questions_left": max(0, 3 - completed_count),
                }
                conn.execute("UPDATE ai_usage SET status='completed', cost=0, response=? WHERE id=?",
                             (json.dumps(recovery), usage))
                conn.commit()
                return recovery
            raise HTTPException(409, "Yêu cầu đang xử lý.")

        # Debit points only if not in free tier
        if cost > 0:
            try:
                debit_ai_points(conn, user, cost, usage)
            except LedgerInvariantError as err:
                raise HTTPException(402, f"Không đủ điểm. Cần ít nhất {cost} UniPoints để chat AI (hoặc nạp SOL để đổi điểm).")

        conn.execute(
            "INSERT INTO ai_usage (id,user_id,request_hash,status,cost,created_at) "
            "VALUES (?, ?, ?, 'pending', ?, ?)",
            (usage, user, fingerprint, cost, time.time()),
        )
        conn.commit()

    failed = False
    try:
        result = RAGService.answer_question(
            question=question,
            model=payload.model or "cx/gpt-5.6-luna",
            subject_code=payload.subject_code,
            university=payload.university,
        )
    except Exception:
        failed = True
        result = {
            "answer": "Máy chủ AI hiện không thể trả lời. Vui lòng thử lại sau.",
            "citations": [], "grounded": False, "engine": "error",
            "source_type": "unavailable",
        }

    free_left = max(0, 3 - completed_count - (1 if is_free_tier else 0))

    # If AI processing failed, refund points if debited
    if failed or result.get("engine") == "error":
        with get_db() as conn:
            lock(conn)
            if cost > 0:
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
            result.update(
                points_cost=0,
                points_debited=False,
                is_free_tier=is_free_tier,
                free_questions_left=free_left,
                usage_id=usage
            )
            conn.execute("UPDATE ai_usage SET status='error', cost=0, response=? WHERE id=?",
                         (json.dumps(result), usage))
            conn.commit()
        return result

    # Success
    result.update(
        points_cost=cost,
        points_debited=(cost > 0),
        is_free_tier=is_free_tier,
        free_questions_left=free_left,
        usage_id=usage,
        university=payload.university,
        subject_code=payload.subject_code,
    )

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
        SELECT d.id, d.original_name, d.chunk_count, d.approved_at, d.size_bytes, d.solana_tx
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


class NineRouterChatRequest(BaseModel):
    prompt: str
    mode: Optional[str] = "coding"  # coding, academic, general
    model: Optional[str] = "cx/gpt-5.6-luna"
    include_context: Optional[bool] = False
    request_id: Optional[str] = None


@router.post("/ninerouter/chat")
def ninerouter_chat(payload: NineRouterChatRequest,
                    session_user: dict = Depends(require_member_session)):
    import hashlib
    import json
    import time
    import uuid
    from ...core.config import DATABASE_URL, AI_CHAT_COST_POINTS
    from ...services.ledger_service import debit_ai_points, settle_reward, LedgerInvariantError
    from ...services.ninerouter_service import NineRouterService

    prompt = payload.prompt.strip()
    if not 2 <= len(prompt) <= 15000:
        raise HTTPException(400, "Nội dung cần từ 2 đến 15000 ký tự.")
    request_id = payload.request_id or str(uuid.uuid4())

    user = session_user["id"]
    cost = AI_CHAT_COST_POINTS  # 80 UniPoints
    usage = hashlib.sha256(f"{user}:{request_id}".encode()).hexdigest()
    fingerprint = hashlib.sha256(json.dumps([prompt, payload.model, payload.mode]).encode()).hexdigest()

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
                            reason="Hoàn điểm yêu cầu 9Router bị gián đoạn",
                            source_type="ai_refund",
                            source_id=usage,
                            reward_event_key=f"ai_refund:{user}:{usage}",
                            proof_hash=usage,
                            proof_status="verified",
                        )
                    except Exception:
                        pass
                recovery = {
                    "content": "Yêu cầu trước bị gián đoạn và đã được hoàn điểm. Hãy gửi câu hỏi mới.",
                    "success": False,
                    "model": payload.model or "cx/gpt-5.6-luna",
                    "points_cost": 0,
                    "points_debited": False,
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
            raise HTTPException(402, f"Không đủ điểm. Cần ít nhất {cost} UniPoints để sử dụng 9Router AI Studio.")

        conn.execute(
            "INSERT INTO ai_usage (id,user_id,request_hash,status,cost,created_at) "
            "VALUES (?, ?, ?, 'pending', ?, ?)",
            (usage, user, fingerprint, cost, time.time()),
        )
        conn.commit()

    context_chunks = []
    if payload.include_context:
        context_chunks = RAGService.search_relevant_chunks(prompt, top_k=2)

    failed = False
    try:
        nine_res = NineRouterService.answer_with_context(
            question=prompt,
            context_chunks=context_chunks,
            mode=payload.mode or "coding",
            model=payload.model or "cx/gpt-5.6-luna",
        )
        result = {
            "success": True,
            "content": nine_res["content"],
            "model": nine_res.get("model", payload.model),
            "provider": "9Router AI Gateway",
            "elapsed_sec": nine_res.get("elapsed_sec", 0),
            "usage": nine_res.get("usage", {}),
            "citations": [
                {"document_name": c["document_name"], "page": f"Trang {c.get('page_number', 1)}"}
                for c in context_chunks
            ],
            "points_cost": cost,
            "points_debited": True,
            "usage_id": usage,
        }
    except Exception as exc:
        failed = True
        result = {
            "success": False,
            "content": f"Máy chủ 9Router hiện không thể phản hồi: {exc}. Điểm đã được hoàn lại.",
            "model": payload.model,
            "provider": "9Router AI Gateway",
            "points_cost": 0,
            "points_debited": False,
            "usage_id": usage,
        }

    if failed:
        with get_db() as conn:
            lock(conn)
            try:
                settle_reward(
                    conn,
                    user_id=user,
                    delta=cost,
                    reason="Hoàn tiền 9Router do lỗi kết nối",
                    source_type="ai_refund",
                    source_id=usage,
                    reward_event_key=f"ai_refund:{user}:{usage}",
                    proof_hash=usage,
                    proof_status="verified",
                )
            except Exception:
                pass
            conn.execute("UPDATE ai_usage SET status='error', cost=0, response=? WHERE id=?",
                         (json.dumps(result), usage))
            conn.commit()
    else:
        with get_db() as conn:
            lock(conn)
            conn.execute("UPDATE ai_usage SET status='completed', cost=?, response=? WHERE id=?",
                         (cost, json.dumps(result), usage))
            conn.commit()

    return result
