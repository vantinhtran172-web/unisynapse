import math
import re
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import pypdf

from ..core.database import get_db

# Vietnamese stop words that carry little semantic distinction
STOP_WORDS = {
    "là", "và", "của", "có", "trong", "để", "với", "các", "những", "một",
    "khi", "được", "này", "đó", "thì", "mà", "cho", "từ", "ra", "vào",
    "the", "a", "an", "is", "are", "and", "or", "to", "in", "of", "with"
}

def extract_term_frequencies(text: str) -> Dict[str, float]:
    """
    Trích xuất tần suất từ (Term Frequency) chuẩn hóa cho văn bản tiếng Việt/tiếng Anh.
    Loại bỏ stopwords để tối ưu độ chính xác của RAG.
    """
    words = re.findall(r'[a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+', text.lower())
    tf = {}
    for w in words:
        if len(w) > 1 and w not in STOP_WORDS:
            tf[w] = tf.get(w, 0.0) + 1.0

    # L2 normalize
    norm = math.sqrt(sum(v * v for v in tf.values()))
    if norm > 0:
        tf = {k: round(v / norm, 4) for k, v in tf.items()}
    return tf

def cosine_similarity_tf(tf1: Dict[str, float], tf2: Dict[str, float]) -> float:
    dot = sum(val * tf2.get(term, 0.0) for term, val in tf1.items())
    return round(dot, 4)

class RAGService:
    @staticmethod
    def extract_text_from_file(file_path: Path, file_type: str) -> List[Dict[str, Any]]:
        pages_content = []
        if file_type == "application/pdf" or file_path.suffix.lower() == ".pdf":
            reader = pypdf.PdfReader(str(file_path))
            for i, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                clean_txt = re.sub(r'\s+', ' ', txt).strip()
                if clean_txt:
                    pages_content.append({"page": i + 1, "text": clean_txt})
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw_text = f.read()
                clean_txt = re.sub(r'\s+', ' ', raw_text).strip()
                if clean_txt:
                    pages_content.append({"page": 1, "text": clean_txt})
        return pages_content

    @staticmethod
    def chunk_pages(pages_content: List[Dict[str, Any]], chunk_size: int = 450, overlap: int = 80) -> List[Dict[str, Any]]:
        chunks = []
        chunk_idx = 0
        for page_data in pages_content:
            page_num = page_data["page"]
            text = page_data["text"]
            
            start = 0
            while start < len(text):
                end = min(len(text), start + chunk_size)
                if end < len(text):
                    last_space = text.rfind(' ', start, end)
                    if last_space > start + 150:
                        end = last_space
                
                chunk_str = text[start:end].strip()
                if len(chunk_str) > 30:
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "page_number": page_num,
                        "content": chunk_str
                    })
                    chunk_idx += 1
                
                if end >= len(text):
                    break
                start = end - overlap
        return chunks

    @classmethod
    def index_document(cls, document_id: str, document_name: str, file_path: Path, file_type: str) -> int:
        pages = cls.extract_text_from_file(file_path, file_type)
        chunks = cls.chunk_pages(pages)
        
        now = time.time()
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM document_chunks WHERE document_id = ?", (document_id,))
            
            for item in chunks:
                tf_vec = extract_term_frequencies(item["content"])
                chunk_id = f"chunk_{document_id}_{item['chunk_index']}"
                cursor.execute("""
                INSERT INTO document_chunks (
                    id, document_id, document_name, chunk_index,
                    page_number, content, embedding, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    chunk_id,
                    document_id,
                    document_name,
                    item["chunk_index"],
                    item["page_number"],
                    item["content"],
                    json.dumps(tf_vec),
                    now
                ))
            
            cursor.execute("UPDATE documents SET chunk_count = ?, approved_at = ? WHERE id = ?",
                           (len(chunks), now, document_id))
            conn.commit()
            
        return len(chunks)

    @classmethod
    def search_relevant_chunks(cls, question: str, top_k: int = 4, subject_code: Optional[str] = None) -> List[Dict[str, Any]]:
        q_tf = extract_term_frequencies(question)
        if not q_tf:
            return []

        results = []
        with get_db() as conn:
            cursor = conn.cursor()
            sql = """
            SELECT dc.id, dc.document_id, dc.document_name, dc.chunk_index,
                   dc.page_number, dc.content, dc.embedding, d.solana_tx, d.subject_code
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.status = 'approved'
            """
            params = []
            if subject_code and subject_code.upper() not in {"ALL", "ALL_SUBJECTS", "TẤT CẢ"}:
                sql += " AND (UPPER(d.subject_code) = ? OR d.subject_code IS NULL)"
                params.append(subject_code.strip().upper())
            cursor.execute(sql, tuple(params))
            rows = cursor.fetchall()

            for row in rows:
                doc_tf = json.loads(row["embedding"])
                score = cosine_similarity_tf(q_tf, doc_tf)
                results.append({
                    "id": row["id"],
                    "document_id": row["document_id"],
                    "document_name": row["document_name"],
                    "chunk_index": row["chunk_index"],
                    "page_number": row["page_number"],
                    "content": row["content"],
                    "score": score,
                    "solana_tx": row["solana_tx"],
                    "subject_code": row["subject_code"],
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    @staticmethod
    def call_gemini_api(question: str, context_chunks: List[Dict[str, Any]], api_key: str,
                        model: str = "gemini-flash-latest", grounded: bool = True) -> Tuple[str, str]:
        """Call Gemini in grounded-document or clearly non-grounded general-AI mode."""
        import urllib.request

        context_parts = []
        for i, c in enumerate(context_chunks):
            p_label = f"Trang {c['page_number']}" if c.get('page_number') else f"Đoạn {c['chunk_index'] + 1}"
            context_parts.append(
                f"--- [HỌC LIỆU {i+1}]: {c['document_name']} ({p_label}) ---\n"
                f"{c['content']}"
            )
        context_str = "\n\n".join(context_parts)

        if grounded:
            system_prompt = (
                "Bạn là UniSynapse AI Tutor — gia sư học thuật chuẩn mực.\n"
                "Chỉ giải thích dựa trên BỐI CẢNH HỌC LIỆU đã kiểm định.\n"
                "Mỗi khái niệm lấy từ học liệu phải kèm [Tên tài liệu, Trang X].\n"
                "Không bịa đặt hoặc dùng kiến thức ngoài bối cảnh. Trình bày mạch lạc bằng Markdown."
            )
            user_prompt = f"BỐI CẢNH HỌC LIỆU ĐÃ KIỂM ĐỊNH:\n{context_str}\n\nCÂU HỎI:\n{question}"
        else:
            system_prompt = (
                "Bạn là Google Gemini, trợ lý AI giáo dục của UniSynapse.\n"
                "Câu hỏi này không có tài liệu tương thích trong kho UniSynapse.\n"
                "Hãy trả lời bằng kiến thức chung của bạn một cách hữu ích, trung thực và có tính sư phạm.\n"
                "Không được nói hoặc ngụ ý rằng câu trả lời đến từ tài liệu UniSynapse.\n"
                "Không tạo citation giả, không dùng định dạng [Tên tài liệu, Trang X].\n"
                "Nếu thông tin có thể thay đổi hoặc không chắc chắn, hãy khuyến nghị người học kiểm chứng thêm."
            )
            user_prompt = f"ĐÂY LÀ CÂU HỎI NGOÀI KHO TÀI LIỆU UNIYSYNAPSE:\n{question}"

        models_to_try = [model, "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-pro", "gemini-flash-latest", "gemma-4-31b-it"]
        seen = set()
        unique_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]
        last_error = ""
        for m in unique_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048},
            }
            for attempt in range(2):
                try:
                    req = urllib.request.Request(
                        url, data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
                        method="POST",
                    )
                    with urllib.request.urlopen(req, timeout=25) as resp:
                        resp_json = json.loads(resp.read().decode("utf-8"))
                        candidates = resp_json.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"].strip(), m
                except Exception as exc:
                    last_error = str(exc)
                    if attempt == 0 and ("503" in str(exc) or "429" in str(exc) or "timed out" in str(exc)):
                        import time
                        time.sleep(0.5)
                        continue
                    break
        raise RuntimeError(f"Gemini API call failed: {last_error}")

    @classmethod
    def answer_question(cls, question: str, api_key: Optional[str] = None, model: str = "gemini-flash-latest", subject_code: Optional[str] = None) -> Dict[str, Any]:
        top_chunks = cls.search_relevant_chunks(question, top_k=3, subject_code=subject_code)
        
        import os
        from ..core.config import GEMINI_API_KEY, ENVIRONMENT

        has_grounded_context = bool(top_chunks) and top_chunks[0]["score"] >= 0.15
        citations = []
        if has_grounded_context:
            for c in top_chunks:
                if c["score"] >= 0.15:
                    sol_tx = c.get("solana_tx")
                    citations.append({
                        "document_id": c["document_id"],
                        "document_name": c["document_name"],
                        "page": f"Trang {c['page_number']}" if c["page_number"] else f"Đoạn {c['chunk_index'] + 1}",
                        "chunk_index": c["chunk_index"],
                        "score": c["score"],
                        "excerpt": c["content"][:180] + "...",
                        "solana_tx": sol_tx,
                        "explorer_url": f"https://explorer.solana.com/tx/{sol_tx}?cluster=devnet" if sol_tx else None,
                    })

        # GPT-5.6 Luna model gateway support (cx/gpt-5.6-luna)
        if model and (model.startswith("cx/") or "luna" in model or "9router" in model.lower() or model == "cx/gpt-5.6-luna"):
            from .ninerouter_service import NineRouterService
            try:
                nine_res = NineRouterService.answer_with_context(
                    question=question,
                    context_chunks=top_chunks if has_grounded_context else [],
                    mode="academic",
                    model=model if model.startswith("cx/") else "cx/gpt-5.6-luna",
                )
                return {
                    "answer": nine_res["content"],
                    "citations": citations if has_grounded_context else [],
                    "grounded": has_grounded_context,
                    "engine": "GPT-5.6 Luna",
                    "source_type": "approved_documents" if has_grounded_context else "ai_outside_knowledge_base",
                    "source_label": "Tài liệu UniSynapse đã kiểm định (GPT-5.6 Luna)" if has_grounded_context else "Nguồn từ GPT-5.6 Luna — Không có trong tài liệu",
                }
            except Exception as err:
                print(f"[RAG] GPT-5.6 Luna call notice ({err}). Falling back to Gemini or baseline.")

        client_key = "" if ENVIRONMENT == "production" else (api_key or "")
        active_key = (client_key or os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY or "").strip()
        if active_key:
            try:
                gemini_text, used_model = cls.call_gemini_api(
                    question, top_chunks if has_grounded_context else [], active_key,
                    model, grounded=has_grounded_context)
                return {
                    "answer": gemini_text,
                    "citations": citations if has_grounded_context else [],
                    "grounded": has_grounded_context,
                    "engine": used_model,
                    "source_type": "approved_documents" if has_grounded_context else "ai_outside_knowledge_base",
                    "source_label": "Tài liệu UniSynapse đã kiểm định" if has_grounded_context else "Nguồn từ AI — Không có trong tài liệu",
                }
            except Exception as err:
                print(f"[RAG] Gemini call notice ({err}). Using safe fallback.")

        if not has_grounded_context:
            return {
                "answer": "Câu hỏi này nằm ngoài kho tài liệu UniSynapse và hiện Gemini chưa sẵn sàng trả lời. Vui lòng thử lại sau hoặc bổ sung tài liệu liên quan.",
                "citations": [],
                "grounded": False,
                "engine": "unavailable",
                "source_type": "unavailable",
                "source_label": "Không có nguồn trả lời khả dụng",
            }

        # Native grounded extractive fallback engine
        primary = top_chunks[0]
        context_summary = primary["content"]

        answer_text = (
            f"Dựa trên tài liệu kiểm định **{primary['document_name']}** "
            f"({('Trang ' + str(primary['page_number'])) if primary['page_number'] else 'Phần trích dẫn'}):\n\n"
            f"> \"{context_summary}\"\n\n"
        )
        if len(top_chunks) > 1 and top_chunks[1]["score"] >= 0.20:
            sec = top_chunks[1]
            answer_text += f"Tài liệu còn bổ sung chi tiết: \n> \"{sec['content']}\"\n\n"
        answer_text += "Đây là kiến thức đã được sinh viên đóng góp và qua 6 cổng kiểm định chất lượng trên mạng lưới UniSynapse. Bạn có cần giải thích thêm phần nào trong nội dung này không?"
        return {
            "answer": answer_text,
            "citations": citations,
            "grounded": True,
            "engine": "extractive_rag",
            "source_type": "approved_documents",
            "source_label": "Tài liệu UniSynapse đã kiểm định",
        }

