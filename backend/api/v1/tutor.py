from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...services.rag_service import RAGService
from ...core.database import get_db
from ...core.security import require_member_session

router = APIRouter(prefix="/tutor", tags=["AI Tutor & RAG"])

class AskQuestionRequest(BaseModel):
    question: str
    apiKey: Optional[str] = None
    model: Optional[str] = "gemini-2.0-flash"

@router.post("/ask")
def ask_tutor(
    payload: AskQuestionRequest,
    session_user: dict = Depends(require_member_session),
):
    question = payload.question.strip()
    if len(question) < 2:
        raise HTTPException(status_code=400, detail="Câu hỏi quá ngắn.")
    
    result = RAGService.answer_question(
        question=question,
        api_key=payload.apiKey,
        model=payload.model or "gemini-2.0-flash"
    )
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
