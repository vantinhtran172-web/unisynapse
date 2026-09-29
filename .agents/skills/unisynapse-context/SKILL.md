---
name: unisynapse-context
description: Comprehensive operational context, architectural guides, port layout, and theme separation standards for the UniSynapse Web2.5 platform. Use whenever working on code, styling, or deployment in the UniSynapse repository.
---

# Kỹ năng Vận hành Dự án UniSynapse (UniSynapse Context & Operations Skill)

Kỹ năng này cung cấp toàn bộ quy chuẩn kỹ thuật, cấu hình môi trường, và các ràng buộc bắt buộc khi phát triển và bảo trì mã nguồn trong dự án UniSynapse.

---

## 1. Bản đồ Cổng Dịch vụ & Khởi động Hệ thống (Port Layout & Server Commands)

Khi khởi động dự án hoặc xác minh tính năng, luôn tuân thủ phân bổ cổng:

* **Backend FastAPI**: Chạy trên cổng `8000`.
  ```powershell
  # Trong thư mục backend/ (yêu cầu python venv)
  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
* **Production Frontend**: Chạy trên cổng `3000`.
  ```powershell
  # Trong thư mục frontend/
  npm run dev
  ```
* **Staging UI Preview**: Chạy trên cổng `3001`.
  ```powershell
  # Trong thư mục ui-preview/
  npm run dev
  ```

---

## 2. Quy chuẩn Thiết kế Giao diện (Theme Separation Standards)

### A. Ràng buộc Tách biệt Màu sắc (Strict Dual Theme Rule)
> **NGHIÊM CẤM:** Không bao giờ sử dụng một màu xám hay xanh trung tính để dùng chung cho cả Dark Mode và Light Mode. Mọi phần tử đều phải có định nghĩa rõ ràng cho từng trạng thái.

1. **Chế độ Tối (Dark Mode)**:
   * Nền: Thẻ màu midnight gradient `linear-gradient(145deg, rgba(8, 47, 73, 0.5) 0%, rgba(3, 7, 18, 0.9) 100%)`.
   * Chữ chính: `#ffffff` hoặc `#f1f3fa`.
   * Chữ phụ / mô tả: `#94a3b8` hoặc `#a5f3fc`.
   * Điểm nhấn: Neon cyan `#38bdf8` / `#22d3ee`, Neon Green `#14F195`, Purple `#9945FF`.
2. **Chế độ Sáng (Light Mode)**:
   * Nền: Trắng ngọc `#ffffff` hoặc xám mềm `#f8fafc`.
   * Viền: Xám sáng `#cbd5e1` hoặc `#e2e8f0`.
   * Chữ chính: Đen than `#0f172a` (Tương phản cao, dễ đọc dưới ánh sáng mạnh).
   * Chữ phụ / mô tả: Xám slate `#475569`.
   * Điểm nhấn: Xanh lục bảo `#047857` / `#059669`, Xanh dương sâu `#0284c7`, Hổ phách `#92400e`.

### B. Cấu hình Tailwind CSS v4 Bắt buộc
Trong `globals.css`, luôn sử dụng:
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));
```
*Không dùng `@variant dark`, vì nó không nhận diện class `.dark` tự kích hoạt từ ThemeToggle.*

---

## 3. Quy chuẩn Mạng lưới Hạt (GlobalNetCanvas)
* Canvas phải bao phủ toàn bộ chiều cao tài liệu:
  ```tsx
  canvas.width = window.innerWidth;
  canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
  ```
* Chuột tương tác phải cộng thêm độ lệch cuộn: `mouseY = clientY + window.scrollY`.
* Mật độ hạt trên nền sáng được giữ ở mức tương phản nhẹ (giảm 2/3), không để hạt và đường nối quá đậm làm chìm văn bản nội dung.

---

## 4. Quy trình Kiểm tra Bắt buộc Trước khi Bàn giao (Pre-submission Checklist)
Trước khi kết thúc bất kỳ lượt xử lý nào, Agent cần thực hiện:

1. **Kiểm tra TypeScript**:
   ```powershell
   cd frontend; npx tsc --noEmit
   cd ../ui-preview; npx tsc --noEmit
   ```
   Cả hai môi trường phải đạt **0 lỗi**.
2. **Kiểm tra tính đồng bộ**:
   Nếu sửa đổi component hoặc trang chung (như `vi/page.tsx`, `wallet.module.css`, `DataLabeling.tsx`, `ThemeContext.tsx`), phải đồng bộ cập nhật trên cả hai thư mục `frontend/` và `ui-preview/`.
3. **Kiểm tra Phản hồi HTTP**:
   Đảm bảo `http://localhost:3000/vi` và `http://localhost:3001/vi` đều trả về HTTP 200.
