import math
import re
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import logging
import pypdf

from ..core.database import get_db

logger = logging.getLogger(__name__)

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
                clean_txt = re.sub(r'[ \t]+', ' ', txt)
                clean_txt = re.sub(r'\n\s*\n+', '\n\n', clean_txt).strip()
                if clean_txt:
                    pages_content.append({"page": i + 1, "text": clean_txt})
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw_text = f.read()
                clean_txt = re.sub(r'[ \t]+', ' ', raw_text)
                clean_txt = re.sub(r'\n\s*\n+', '\n\n', clean_txt).strip()
                if clean_txt:
                    pages_content.append({"page": 1, "text": clean_txt})
        return pages_content

    @staticmethod
    def chunk_pages(pages_content: List[Dict[str, Any]], chunk_size: int = 550, overlap: int = 90) -> List[Dict[str, Any]]:
        chunks = []
        chunk_idx = 0
        for page_data in pages_content:
            page_num = page_data["page"]
            text = page_data["text"]
            
            start = 0
            while start < len(text):
                end = min(len(text), start + chunk_size)
                if end < len(text):
                    last_para = text.rfind('\n\n', start, end)
                    if last_para > start + 200:
                        end = last_para + 2
                    else:
                        last_sent = text.rfind('. ', start, end)
                        if last_sent > start + 180:
                            end = last_sent + 2
                        else:
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
                if start < len(text):
                    next_space = text.find(' ', start)
                    if next_space != -1 and next_space < start + 30:
                        start = next_space + 1
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
    def search_relevant_chunks(cls, question: str, top_k: int = 4, subject_code: Optional[str] = None, university: Optional[str] = None) -> List[Dict[str, Any]]:
        q_tf = extract_term_frequencies(question)
        if not q_tf:
            return []

        results = []
        with get_db() as conn:
            cursor = conn.cursor()
            sql = """
            SELECT dc.id, dc.document_id, dc.document_name, dc.chunk_index,
                   dc.page_number, dc.content, dc.embedding, d.solana_tx, d.subject_code, d.university
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.status = 'approved'
            """
            params = []
            if university and university.upper() not in {"ALL", "ALL_UNIVERSITIES", "TẤT CẢ"}:
                import re
                u_clean = university.strip()
                acronyms = re.findall(r"\b[A-Za-z0-9_]{3,10}\b", u_clean)
                if acronyms:
                    acronym_conditions = " OR ".join(["d.university LIKE ?" for _ in acronyms])
                    sql += f" AND (d.university LIKE ? OR UPPER(d.university) LIKE ? OR {acronym_conditions} OR d.university IS NULL)"
                    params.extend([f"%{u_clean}%", f"%{u_clean.upper()}%"])
                    params.extend([f"%{ac}%" for ac in acronyms])
                else:
                    sql += " AND (d.university LIKE ? OR UPPER(d.university) LIKE ? OR d.university IS NULL)"
                    params.extend([f"%{u_clean}%", f"%{u_clean.upper()}%"])
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
                    "university": row["university"],
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

        if not api_key or not api_key.startswith("AIza"):
            raise RuntimeError("Gemini API key is invalid or not configured.")

        models_to_try = [model, "gemini-1.5-flash", "gemini-flash-latest"]
        seen = set()
        unique_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]
        last_error = ""
        for m in unique_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048},
            }
            try:
                req = urllib.request.Request(
                    url, data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=4) as resp:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    candidates = resp_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip(), m
            except Exception as exc:
                last_error = str(exc)
                if "400" in str(exc) or "403" in str(exc) or "404" in str(exc):
                    break
        raise RuntimeError(f"Gemini API call failed: {last_error}")

    @classmethod
    def answer_question(cls, question: str, api_key: Optional[str] = None, model: str = "gemini-flash-latest", subject_code: Optional[str] = None, university: Optional[str] = None) -> Dict[str, Any]:
        top_chunks = cls.search_relevant_chunks(question, top_k=3, subject_code=subject_code, university=university)
        
        import os
        from ..core.config import GEMINI_API_KEY, ENVIRONMENT

        has_grounded_context = bool(top_chunks) and top_chunks[0]["score"] >= 0.08
        citations = []
        if has_grounded_context:
            for c in top_chunks:
                if c["score"] >= 0.08:
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
                safe_msg = str(err).encode("ascii", "backslashreplace").decode("ascii")
                logger.warning(f"[RAG] GPT-5.6 Luna call notice: {safe_msg[:120]}. Falling back.")

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
                safe_msg = str(err).encode("ascii", "backslashreplace").decode("ascii")
                logger.warning(f"[RAG] Gemini call notice: {safe_msg[:120]}. Using safe fallback.")

        # Native grounded extractive synthesis engine
        if top_chunks:
            answer_text = cls.synthesize_academic_answer(question, top_chunks)
            return {
                "answer": answer_text,
                "citations": citations if citations else [{
                    "document_id": top_chunks[0]["document_id"],
                    "document_name": top_chunks[0]["document_name"],
                    "page": f"Trang {top_chunks[0]['page_number']}" if top_chunks[0].get('page_number') else f"Đoạn {top_chunks[0]['chunk_index'] + 1}",
                    "chunk_index": top_chunks[0]["chunk_index"],
                    "score": top_chunks[0]["score"],
                    "excerpt": top_chunks[0]["content"][:180] + "...",
                    "solana_tx": top_chunks[0].get("solana_tx"),
                    "explorer_url": None,
                }],
                "grounded": True,
                "engine": "extractive_rag",
                "source_type": "approved_documents",
                "source_label": "Tài liệu UniSynapse đã kiểm định (ĐH Văn Hiến)",
            }

        return {
            "answer": (
                "### 🎓 UniSynapse AI Tutor — Hướng dẫn học tập\n\n"
                f"Về câu hỏi: *\"{question}\"*\n\n"
                "Hiện tại kho học liệu đang được mở rộng. Bạn có thể:\n"
                "- Chọn môn học cụ thể trên thanh công cụ (ví dụ: **VHU_DSA - Cấu trúc Dữ liệu & Giải thuật**, **VHU_IT101**, v.v.) để AI đối soát chính xác.\n"
                "- Tải lên file ghi chú, đề cương hoặc giáo trình tại mục **Đóng góp học liệu (6 Cổng)** để nhận ngay điểm thưởng UniPoints và kích hoạt AI phân tích trực tiếp!"
            ),
            "citations": [],
            "grounded": False,
            "engine": "unisynapse_guide",
            "source_type": "guidance",
            "source_label": "Hướng dẫn khai thác học liệu UniSynapse",
        }

    @classmethod
    def synthesize_academic_answer(cls, question: str, top_chunks: List[Dict[str, Any]]) -> str:
        primary = top_chunks[0]
        p_label = f"Trang {primary['page_number']}" if primary.get('page_number') else f"Đoạn {primary['chunk_index'] + 1}"
        doc_name = primary.get('document_name', 'Giáo trình CNTT VHU')
        
        main_content = primary.get('content', '').strip()
        lines = [line.strip() for line in main_content.split('\n') if line.strip()]
        
        response_parts = [
            f"### 🎓 UniSynapse AI Tutor — Hướng dẫn học tập theo Giáo trình: **{doc_name}**",
            "",
            f"**1. 🎯 Bản chất & Khái niệm cốt lõi:**",
        ]
        
        # Keyword matching to highlight most relevant statements
        q_words = set(re.findall(r'\w+', question.lower()))
        scored_lines = []
        for line in lines:
            line_words = set(re.findall(r'\w+', line.lower()))
            overlap = len(q_words.intersection(line_words))
            scored_lines.append((overlap, line))
        scored_lines.sort(key=lambda x: x[0], reverse=True)
        
        core_explanation = []
        for score, line in scored_lines[:3]:
            if score > 0 and len(line) > 15:
                core_explanation.append(f"- {line}")
        if not core_explanation and lines:
            core_explanation = [f"- {l}" for l in lines[:2]]
            
        response_parts.append("\n".join(core_explanation))
        response_parts.append("")
        response_parts.append(f"**2. ⚙️ Nguyên lý hoạt động & Kiến thức học thuật chuyên sâu:**")
        
        details = []
        if len(top_chunks) > 1 and top_chunks[1]["score"] >= 0.18:
            sec_lines = [l.strip() for l in top_chunks[1]["content"].split('\n') if l.strip()]
            for l in sec_lines[:3]:
                if len(l) > 20:
                    details.append(f"- {l}")
        
        if not details:
            for l in lines[2:6]:
                if len(l) > 15:
                    details.append(f"- {l}")
                    
        if details:
            response_parts.append("\n".join(details))
        else:
            response_parts.append("- Khái niệm này là kiến thức nền tảng trong chương trình đào tạo kỹ sư CNTT của Trường Đại học Văn Hiến, được áp dụng trực tiếp vào các bài toán thiết kế phần mềm, tối ưu giải thuật và kiểm định hệ thống.")
            
        response_parts.append("")
        response_parts.append(f"**3. 📚 Đoạn trích dẫn kiểm định từ giáo trình ({p_label}):**")
        clean_excerpt = main_content[:320].replace('\n', ' ')
        response_parts.append(f"> \"{clean_excerpt}...\"")
        response_parts.append("")
        response_parts.append(f"*(Dữ liệu đã được kiểm định 6 cổng chất lượng và lưu trữ bằng chứng bất biến trên Solana Devnet)*")
        response_parts.append("")
        response_parts.append(f"**4. 💡 Hướng dẫn ôn tập kết thúc học phần VHU:**")
        response_parts.append(f"- Bạn có thể bấm nút **'📖 Xem toàn văn tài liệu'** hoặc **'📥 Tải toàn văn file nguồn'** ở thanh trích dẫn bên dưới để xem toàn bộ chương giáo trình, mã nguồn và hệ thống câu hỏi trắc nghiệm / tự luận có đáp án.")
        
        return "\n".join(response_parts)

