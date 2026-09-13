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
    def search_relevant_chunks(cls, question: str, top_k: int = 4) -> List[Dict[str, Any]]:
        q_tf = extract_term_frequencies(question)
        if not q_tf:
            return []

        results = []
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT dc.id, dc.document_id, dc.document_name, dc.chunk_index,
                   dc.page_number, dc.content, dc.embedding
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.status = 'approved'
            """)
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
                    "score": score
                })
                
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    @staticmethod
    def call_gemini_api(question: str, context_chunks: List[Dict[str, Any]], api_key: str, model: str = "gemini-2.0-flash") -> Tuple[str, str]:
        """
        Gọi Google Gemini Flash API với ràng buộc Grounded RAG nghiêm ngặt:
        - Bắt buộc trích dẫn [Nguồn, Trang]
        - Trả lời phong cách sư phạm sâu sắc
        - Tự động thử model fallback nếu cần
        """
        import urllib.request
        
        context_parts = []
        for i, c in enumerate(context_chunks):
            p_label = f"Trang {c['page_number']}" if c.get('page_number') else f"Đoạn {c['chunk_index'] + 1}"
            context_parts.append(
                f"--- [HỌC LIỆU {i+1}]: {c['document_name']} ({p_label}) ---\n"
                f"{c['content']}"
            )
        context_str = "\n\n".join(context_parts)
        
        system_prompt = (
            "Bạn là UniSynapse AI Tutor — gia sư học thuật thông minh, sư phạm và chuẩn mực dành cho sinh viên đại học.\n\n"
            "QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ 100%):\n"
            "1. TÍNH CHÍNH XÁC HỌC THUẬT: Bạn CHỈ ĐƯỢC PHÉP giải thích dựa trên các dữ kiện, định nghĩa, công thức có trong BỐI CẢNH HỌC LIỆU dưới đây. Tuyệt đối KHÔNG BỊA ĐẶT hay đưa ra kiến thức không có nguồn gốc kiểm định.\n"
            "2. GẮN THẺ TRÍCH DẪN RÕ RÀNG: Mỗi khi nêu một khái niệm, cơ chế hay ví dụ lấy từ học liệu, hãy kèm theo thẻ trích dẫn dạng [Tên tài liệu, Trang X] để sinh viên tiện đối chiếu vào giáo trình gốc.\n"
            "3. PHONG CÁCH SƯ PHẠM ĐẠI HỌC: Trình bày bài giảng mạch lạc bằng Markdown:\n"
            "   - **1. Khái niệm & Định nghĩa cốt lõi**\n"
            "   - **2. Cơ chế hoạt động & Minh họa** (có phân tích code nếu là lập trình)\n"
            "   - **3. Lưu ý & Sai lầm phổ biến khi làm bài thi / thực hành**\n"
            "   - **4. Câu hỏi củng cố ôn tập** (1 câu hỏi nhỏ ở cuối để sinh viên tự kiểm tra).\n"
            "Giọng văn chuyên nghiệp, sư phạm, khuyến khích sinh viên học tập."
        )
        
        user_prompt = f"BỐI CẢNH HỌC LIỆU ĐÃ KIỂM ĐỊNH:\n{context_str}\n\nCÂU HỎI CỦA SINH VIÊN:\n{question}"
        
        models_to_try = [model, "gemini-2.0-flash", "gemini-1.5-flash"]
        seen = set()
        unique_models = [m for m in models_to_try if not (m in seen or seen.add(m))]
        
        last_error = ""
        for m in unique_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_prompt}\n\n{user_prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 2048
                }
            }
            
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    candidates = resp_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip(), m
            except Exception as e:
                last_error = str(e)
                continue
                
        raise RuntimeError(f"Gemini API call failed: {last_error}")

    @classmethod
    def answer_question(cls, question: str, api_key: Optional[str] = None, model: str = "gemini-2.0-flash") -> Dict[str, Any]:
        top_chunks = cls.search_relevant_chunks(question, top_k=3)
        
        # Anti-hallucination refusal threshold
        if not top_chunks or top_chunks[0]["score"] < 0.15:
            return {
                "answer": "Kho tri thức đã duyệt của UniSynapse hiện chưa có tài liệu đủ tương thích để giải đáp chính xác câu hỏi này. Để đảm bảo tính trung thực học thuật và không bịa đặt nguồn, AI Tutor từ chối trả lời ngoài phạm vi học liệu đã kiểm định. Bạn vui lòng đóng góp thêm tài liệu môn học tương ứng hoặc trao đổi thêm với giảng viên!",
                "citations": [],
                "grounded": False,
                "engine": "anti_hallucination_guard"
            }
            
        citations = []
        for c in top_chunks:
            if c["score"] >= 0.15:
                citations.append({
                    "document_id": c["document_id"],
                    "document_name": c["document_name"],
                    "page": f"Trang {c['page_number']}" if c["page_number"] else f"Đoạn {c['chunk_index'] + 1}",
                    "chunk_index": c["chunk_index"],
                    "score": c["score"],
                    "excerpt": c["content"][:180] + "..."
                })

        # Try calling Gemini Flash if API key provided or set in environment
        import os
        from ..core.config import GEMINI_API_KEY
        active_key = (api_key or os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY or "").strip()
        
        if active_key:
            try:
                gemini_text, used_model = cls.call_gemini_api(question, top_chunks, active_key, model)
                return {
                    "answer": gemini_text,
                    "citations": citations,
                    "grounded": True,
                    "engine": used_model
                }
            except Exception as err:
                print(f"[RAG] Gemini Flash call notice ({err}). Using extractive RAG engine.")

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
            answer_text += (
                f"Tài liệu còn bổ sung chi tiết: \n"
                f"> \"{sec['content']}\"\n\n"
            )
            
        answer_text += (
            f"Đây là kiến thức đã được sinh viên đóng góp và qua 6 cổng kiểm định chất lượng trên mạng lưới UniSynapse. "
            f"Bạn có cần giải thích thêm phần nào trong nội dung này không?"
        )
        
        return {
            "answer": answer_text,
            "citations": citations,
            "grounded": True,
            "engine": "extractive_rag"
        }

