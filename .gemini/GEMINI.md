# UniSynapse Workspace Protocol & Agent Memory Directive

> **LƯU Ý DÀNH CHO TẤT CẢ AGENT / AI ASSISTANT KHI BẮT ĐẦU PHIÊN CHAT MỚI:**
> Không bao giờ tự ý thiết lập lại cấu hình hay hỏi lại người dùng những thông tin đã được giải quyết. Mọi quyết định thiết kế, kiến trúc dự án, lịch sử chat, các lỗi đã fix, và kế hoạch triển khai đã được lưu trữ toàn diện tại thư mục `.gemini/`.

## 1. Bản đồ tài liệu trong `.gemini/`
Trước khi thực hiện bất kỳ thay đổi mã nguồn nào, Agent PHẢI tham khảo các tài liệu sau:

1. [PROJECT_OVERVIEW.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/PROJECT_OVERVIEW.md): Tổng quan kiến trúc hệ thống, cấu hình cổng (Ports: 8000, 3000, 3001), luồng Web2.5 (ACB VietQR -> Solana Devnet), và công nghệ sử dụng.
2. [CHAT_HISTORY_AND_DECISIONS.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/CHAT_HISTORY_AND_DECISIONS.md): Toàn bộ lịch sử các yêu cầu, các cuộc trao đổi và quyết định quan trọng của người dùng.
3. [CURRENT_STATE_AND_FIXES.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/CURRENT_STATE_AND_FIXES.md): Trạng thái hiện tại của hệ thống, danh sách các file đã sửa, nguyên nhân gốc rễ (Root Cause) của từng lỗi và cách đã giải quyết.
4. [ROADMAP_AND_PLANS.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/ROADMAP_AND_PLANS.md): Kế hoạch đã hoàn thành, đang triển khai, sắp tới và trong tương lai.
5. [skills/unisynapse-context/SKILL.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/skills/unisynapse-context/SKILL.md): Kỹ năng vận hành, quy chuẩn code, và lệnh điều phối hệ thống.

---

## 2. Nguyên tắc vàng bất biến (Non-Negotiable Constraints)
1. **Quy tắc phối màu Light/Dark (Theme Separation)**:
   - **TUYỆT ĐỐI KHÔNG dùng 1 màu chung thỏa hiệp cho cả 2 giao diện**.
   - Giao diện tối (Dark Mode): Nền đen/navy Cyberpunk `#080a0f`, thẻ midnight slate, chữ sáng tương phản cao (`#f1f3fa` / `#e2e8f0`), hiệu ứng neon cyan & purple.
   - Giao diện sáng (Light Mode): Nền giấy trắng ngọc `#f8fafc` / `#ffffff`, thẻ trắng sạch viền xám mềm `#cbd5e1`, chữ đen than `#0f172a`, phụ đề `#475569`, không bao giờ được xuất hiện mảng đen hoặc chữ mờ.
   - Cú pháp Tailwind CSS v4 cho chế độ tối: `@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));` (Không dùng `@variant`).
2. **Đồng bộ hai môi trường Frontend**:
   - `frontend/` (Chạy chính trên Port 3000).
   - `ui-preview/` (Môi trường kiểm thử UI trên Port 3001).
   - Mọi thay đổi về CSS, Component, Page phải được giữ đồng bộ giữa cả 2 thư mục này.
3. **Hiệu ứng Interactive Canvas (GlobalNetCanvas)**:
   - Các hạt mạng lưới và đường nối theo chuột phải cuộn theo tới tận chân trang (footer).
   - Độ nổi bật (opacity) trên nền sáng được giới hạn ở mức 2/3 (tinh tế, thanh lịch, không quá chói hoặc lố).
4. **Cổng nạp ACB VietQR -> Solana Devnet (`/vi`)**:
   - Tích hợp timeout 10 phút, tự hủy ảnh QR khi hết hạn để đảm bảo an toàn.
   - Polling đối soát tự động mỗi 3 giây qua API backend.
   - Bằng chứng on-chain mở liên kết tới Solana Explorer (Devnet).

---

## 3. Quy tắc Tự Động Cập Nhật Hồ Sơ (MANDATORY AUTO-UPDATE PROTOCOL)
> **BẮT BUỘC ĐỐI VỚI MỌI PHIÊN CHAT MỚI:**
> Sau khi Agent hoàn thành viết code, chỉnh sửa file hoặc giải quyết bất kỳ yêu cầu mới nào từ người dùng, Agent **PHẢI TỰ ĐỘNG** thực hiện cập nhật các tài liệu sau trước khi trả lời người dùng:
> 1. Thêm ghi chú yêu cầu mới và giải pháp vào [CHAT_HISTORY_AND_DECISIONS.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/CHAT_HISTORY_AND_DECISIONS.md).
> 2. Cập nhật danh sách các tệp bị sửa đổi và bằng chứng test vào [CURRENT_STATE_AND_FIXES.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/CURRENT_STATE_AND_FIXES.md).
> 3. Cập nhật tiến độ hoàn thành hoặc thêm task mới vào [ROADMAP_AND_PLANS.md](file:///c:/Users/TGDD/Downloads/unisynapse/.gemini/ROADMAP_AND_PLANS.md).
>
> Tuyệt đối không chờ người dùng nhắc nhở mới cập nhật. Đây là quy chuẩn bắt buộc để bảo toàn vĩnh viễn ký ức dự án qua mọi phiên chat.
