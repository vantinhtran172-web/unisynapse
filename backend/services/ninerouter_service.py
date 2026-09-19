import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from ..core.config import NINEROUTER_API_KEY, NINEROUTER_BASE_URL, NINEROUTER_DEFAULT_MODEL

logger = logging.getLogger("backend.ninerouter")


class NineRouterService:
    """Gateway service to communicate with 9Router OpenAI-compatible API."""

    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 UniSynapse/1.0"

    @classmethod
    def call_chat(
        cls,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        timeout: int = 4,
    ) -> Dict[str, Any]:
        """Send chat messages to 9Router /chat/completions endpoint."""
        active_model = (model or NINEROUTER_DEFAULT_MODEL).strip()
        base_url = NINEROUTER_BASE_URL.rstrip("/")
        endpoint = f"{base_url}/chat/completions"

        payload = {
            "model": active_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": cls.USER_AGENT,
        }
        if NINEROUTER_API_KEY:
            headers["Authorization"] = f"Bearer {NINEROUTER_API_KEY}"

        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=headers,
            method="POST",
        )

        start_time = time.time()
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                elapsed = round(time.time() - start_time, 2)
                raw_body = resp.read().decode("utf-8")
                res_data = json.loads(raw_body)

                choices = res_data.get("choices", [])
                if not choices:
                    raise ValueError("9Router returned response with no choices")

                content = choices[0].get("message", {}).get("content", "")
                usage = res_data.get("usage", {})

                return {
                    "success": True,
                    "content": content,
                    "model": active_model,
                    "usage": usage,
                    "provider": "GPT-5.6 Luna",
                    "latency_ms": round((time.time() - start_time) * 1000, 2),
                }
        except urllib.error.HTTPError as err:
            err_body = err.read().decode("utf-8", errors="ignore")
            logger.error(f"GPT-5.6 Luna HTTP Error {err.code}: {err_body}")
            raise RuntimeError(f"GPT-5.6 Luna trả về lỗi {err.code}: {err_body[:200]}") from err
        except urllib.error.URLError as err:
            logger.error(f"GPT-5.6 Luna URL Error: {err.reason}")
            raise RuntimeError(f"Không thể kết nối tới GPT-5.6 Luna: {err.reason}") from err
        except Exception as exc:
            logger.error(f"GPT-5.6 Luna unexpected error: {exc}")
            raise RuntimeError(f"Lỗi khi xử lý GPT-5.6 Luna: {exc}") from exc

    @classmethod
    def answer_with_context(
        cls,
        question: str,
        context_chunks: Optional[List[Dict[str, Any]]] = None,
        mode: str = "academic",
        model: str = "cx/gpt-5.6-luna",
    ) -> Dict[str, Any]:
        """Generate response with optional context and specialized system prompt."""
        system_prompts = {
            "coding": (
                "Bạn là GPT-5.6 Luna, trợ lý lập trình cấp cao của hệ thống UniSynapse. "
                "Hãy viết code sạch, tối ưu, có giải thích rõ ràng và tuân thủ các chuẩn an toàn. "
                "Trả lời bằng tiếng Việt thân thiện, chuyên nghiệp. Định dạng code bằng markdown fenced blocks."
            ),
            "academic": (
                "Bạn là UniSynapse AI Tutor vận hành bởi mô hình GPT-5.6 Luna. "
                "Hãy phân tích và trả lời câu hỏi học thuật dựa trên kiến thức sâu rộng và tài liệu kiểm định (nếu có). "
                "Trả lời bằng tiếng Việt gãy gọn, có cấu trúc rõ ràng, sư phạm và hữu ích."
            ),
            "general": (
                "Bạn là UniSynapse AI Tutor được vận hành bởi mô hình GPT-5.6 Luna. "
                "Hãy hỗ trợ sinh viên giải quyết mọi thắc mắc học tập, thuật toán và dự án."
            ),
        }

        system_prompt = system_prompts.get(mode, system_prompts["coding"])

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]

        if context_chunks:
            context_text = "\n\n".join(
                f"[Tài liệu: {c.get('document_name', 'Học liệu')} (Trang {c.get('page_number', 1)})]\n{c.get('content', '')}"
                for c in context_chunks
            )
            messages.append({
                "role": "user",
                "content": f"Ngữ cảnh tài liệu kiểm định liên quan:\n{context_text}\n\nCâu hỏi: {question}"
            })
        else:
            messages.append({"role": "user", "content": question})

        return cls.call_chat(messages=messages, model=model)
