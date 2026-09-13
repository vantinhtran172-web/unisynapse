import hashlib
import re
from pathlib import Path
from typing import Dict, Any, Tuple, List
from ..core.database import get_db

# Vietnamese PII patterns
PHONE_REGEX = re.compile(r'(?:\+?84|0)(?:3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])\d{7}\b')
CITIZEN_ID_REGEX = re.compile(r'\b(?:\d{9}|\d{12})\b') # CMND 9 số hoặc CCCD 12 số
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')

class VerificationService:
    @staticmethod
    def compute_sha256(content_bytes: bytes) -> str:
        return hashlib.sha256(content_bytes).hexdigest()

    @staticmethod
    def verify_mime(content_bytes: bytes, filename: str) -> Tuple[bool, str]:
        ext = Path(filename).suffix.lower()
        if ext == ".pdf":
            # PDF magic bytes "%PDF-"
            if content_bytes[:5] == b"%PDF-":
                return True, "Valid PDF magic header detected (%PDF-)."
            return False, "Tập tin không phải định dạng PDF hợp lệ (thiếu header %PDF-)."
        elif ext in [".txt", ".md"]:
            try:
                content_bytes.decode("utf-8")
                return True, "Valid UTF-8 plain text file."
            except UnicodeDecodeError:
                return False, "Tập tin văn bản không hợp lệ (lỗi giải mã UTF-8)."
        else:
            return False, f"Định dạng {ext} không được hỗ trợ. Chỉ hỗ trợ .pdf và .txt."

    @staticmethod
    def scan_pii(text: str) -> Tuple[bool, List[str]]:
        findings = []
        
        # Check Phone
        phones = PHONE_REGEX.findall(text)
        if phones:
            findings.append(f"Phát hiện {len(phones)} số điện thoại cá nhân (ví dụ: {phones[0][:4]}***)")

        # Check Citizen ID (CCCD/CMND)
        cids = CITIZEN_ID_REGEX.findall(text)
        if cids:
            findings.append(f"Phát hiện {len(cids)} số CMND/CCCD có nguy cơ lộ danh tính (ví dụ: {cids[0][:3]}***)")

        # Check Personal Email (allow @edu or generic campus domains)
        emails = EMAIL_REGEX.findall(text)
        personal_emails = [e for e in emails if not any(edu in e.lower() for edu in [".edu.vn", ".edu", "campus"])]
        if personal_emails:
            findings.append(f"Phát hiện email cá nhân ngoài trường: {personal_emails[0]}")

        passed = len(findings) == 0
        return passed, findings

    @classmethod
    def check_duplicate(cls, checksum: str) -> Tuple[bool, str]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, original_name, status FROM documents WHERE checksum = ? AND status IN ('approved', 'pending_review')",
                (checksum,)
            )
            row = cursor.fetchone()
            if row:
                return False, f"Tài liệu trùng lặp hoàn toàn (mã băm {checksum[:10]}...) với tài liệu đã có '{row['original_name']}' ({row['status']})."
            return True, "Tài liệu duy nhất (chưa từng xuất hiện trong hệ thống)."

    @staticmethod
    def evaluate_quality(text: str) -> Tuple[bool, int, str]:
        stripped = text.strip()
        length = len(stripped)
        if length < 60:
            return False, 20, "Tài liệu quá ngắn hoặc nội dung không đủ để trích xuất tri thức."
        
        # Calculate word and line density
        words = stripped.split()
        if len(words) < 15:
            return False, 30, "Mật độ từ quá thưa thớt, không đạt chuẩn tài liệu học thuật."
            
        score = min(100, max(50, int(len(words) / 2)))
        return True, score, f"Nội dung đạt chuẩn học thuật ({len(words)} từ, điểm chất lượng: {score}/100)."
