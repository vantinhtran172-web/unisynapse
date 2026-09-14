# Cổng Quản Trị Hệ Thống Độc Lập WIT (WIT Admin Operations Console)

## 1. Giới thiệu Kiến trúc An ninh
Theo quy chuẩn an toàn cao cấp của UniSynapse / WIT:
- **Tách biệt 100% Khỏi Máy Khách (Zero Client Footprint)**:
  Cổng quản trị đã được bóc tách hoàn toàn ra khỏi web client công khai (`frontend/` trên Netlify). Mọi định tuyến `/admin`, liên kết điều hướng và mã nguồn quản trị viên đã bị xóa khỏi gói phân phối công khai của người dùng phổ thông.
- **Khóa Bảo Mật Riêng Biệt (`ADMIN_SECURITY_KEY`)**:
  Mọi endpoint quản trị (`/api/v1/admin/*`) trên Backend FastAPI yêu cầu khóa bí mật quản trị viên được cấu hình trong `backend/.env`.
  Yêu cầu API phải kèm theo header:
  `X-Admin-Security-Key: <ADMIN_SECURITY_KEY>`
  Nếu không có hoặc sai khóa, hệ thống sẽ trả về mã lỗi **403 Forbidden** ngay lập tức và chặn hoàn toàn truy cập.

---

## 2. Hướng dẫn Khởi chạy Cổng Quản trị

### Cách 1: Sử dụng Script Tiện ích (Windows)
Chỉ cần nhấp đúp vào file:
```
admin-portal/start-admin.bat
```
Script sẽ tự động khởi động server cục bộ trên cổng `8088` và mở trình duyệt tại: `http://localhost:8088`.

### Cách 2: Khởi chạy bằng lệnh Python
```bash
cd admin-portal
python server.py --open
```

### Cách 3: Chạy trực tiếp từ file (Standalone)
Có thể mở trực tiếp file `admin-portal/index.html` trên trình duyệt quản trị viên và nhập `ADMIN_SECURITY_KEY`.

---

## 3. Cấu hình Khóa Bảo Mật
File cấu hình mẫu: `admin-portal/.env.example`
```env
BACKEND_API_URL=http://localhost:8000/api/v1
ADMIN_SECURITY_KEY=wit-admin-sec-9a8f4c2e1b7d5e3f01829475c8b6a12d
ADMIN_PORTAL_PORT=8088
```
> **CẢNH BÁO AN NINH:** Không bao giờ commit file `.env` chứa khóa quản trị lên các kho lưu trữ công khai hoặc nhúng vào bundle máy khách!

---

## 4. Các tính năng của Cổng Quản trị
1. **Tổng quan Hệ thống (System Overview)**: Theo dõi người dùng, số lượng vector RAG chunks, tài liệu đã duyệt, chứng minh Solana devnet, số lượng UniPoints lưu hành.
2. **Kiểm duyệt Tài liệu Học thuật (Document Moderation)**:
   - Duyệt tài liệu hợp lệ -> Tự động kích hoạt thuật toán Merkle Tree và tạo Proof on-chain.
   - Từ chối tài liệu kèm lý do phản hồi cho tác giả.
3. **Quản lý Nhiệm vụ Gán nhãn (RLHF Tasks)**: Tạo bài toán đánh giá kiến thức với câu hỏi, các phương án lựa chọn, đáp án chuẩn và phần thưởng điểm.
4. **Quản trị Thành viên (Users & Reputation)**: Tra cứu xếp hạng tín nhiệm, ví Solana và lịch sử đóng góp của sinh viên.
5. **Sổ cái Kép & Nhật ký Kiểm toán (Ledger & Solana Audit)**: Đối soát giao dịch nạp rút SOL, phí chat AI Tutor, phần thưởng đóng góp và chuỗi sự kiện kiểm toán bảo mật.
