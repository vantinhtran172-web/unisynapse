# HƯỚNG DẪN KHỞI CHẠY DỰ ÁN UNISYNAPSE (1-CLICK RUN)

> **Dành cho Giảng viên / Hội đồng chấm / Người kiểm thử dự án.**  
> Dự án đã được thiết lập sẵn sàng để khởi chạy toàn diện chỉ với **1 cú nhấp chuột duy nhất**.

---

## 🚀 Cách 1: Khởi chạy Tự Động 1-Click (Khuyến Nghị Nhanh Nhất)

Trong thư mục gốc của dự án, bạn chỉ cần:

👉 **Nhấp đúp chuột vào file:**
```text
CHAY_TOAN_BO_DU_AN.bat
```
*(hoặc file `start-unisynapse.bat`)*

### File script sẽ tự động thực hiện 100% các bước:
1. **Kiểm tra môi trường:** Tự động nhận diện Python (3.10+) và Node.js (18+).
2. **Khởi tạo môi trường ảo Python:** Tự động tạo `.venv` và cài đặt toàn bộ thư viện backend (`requirements.txt`) nếu máy chưa có.
3. **Cài đặt thư viện Frontend:** Tự động chạy `npm install` nếu thư mục `node_modules` chưa có.
4. **Nạp cấu hình môi trường:** Tự động nạp cấu hình đầy đủ từ file `.env` đã được chuẩn bị sẵn.
5. **Khởi động đồng thời 2 dịch vụ:**
   - **Backend FastAPI**: chạy tại `http://127.0.0.1:8000` (kèm tài liệu Swagger tại `/docs`).
   - **Frontend Next.js**: chạy tại `http://localhost:3000`.
6. **Tự động mở trình duyệt web:** Sau 3 giây, trình duyệt web mặc định sẽ tự động mở trang chủ `http://localhost:3000`.

---

## 🌐 Các Đường Dẫn Truy Cập Sau Khi Khởi Chạy

| Dịch vụ | Địa chỉ URL | Mô tả |
| :--- | :--- | :--- |
| **Giao diện Web Người Dùng** | [http://localhost:3000](http://localhost:3000) | Dashboard sinh viên: Gán nhãn dữ liệu, Đóng góp học liệu, AI Tutor RAG, Ví & Nạp điểm UniPoints |
| **Cổng Quản trị Viên (Admin)** | [http://localhost:3000/admin](http://localhost:3000/admin) | Quản trị hệ thống, duyệt học liệu, cấu hình bài toán, đối soát sổ cái |
| **Tài liệu API Swagger** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Tài liệu đặc tả kỹ thuật RESTful API tương tác trực tiếp |
| **Mạng Blockchain Thử Nghiệm** | **Solana Devnet** | Mạng ghi nhận bằng chứng đối soát bất biến |

---

## 🛠️ Cách 2: Khởi chạy thủ công bằng dòng lệnh (Nếu muốn)

Nếu bạn muốn khởi chạy thủ công từng phần bằng terminal/PowerShell:

### Bước 1: Khởi động Backend (FastAPI)
```powershell
# Tại thư mục gốc dự án:
.venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Bước 2: Khởi động Frontend (Next.js)
```powershell
# Tại thư mục frontend:
cd frontend
npm run dev
```

Truy cập: `http://localhost:3000`

---

## 📋 Hướng Dẫn Kiểm Thử Nhanh Các Tính Năng Chính

1. **Gán nhãn nhiệm vụ (Data Labeling)**:
   - Trên trang chủ, cuộn tới phần **"Nhiệm Vụ Gán Nhãn Dữ Liệu"**.
   - Chọn một nhãn phân loại. Hệ thống lập tức đối soát và cộng ngay **`+10 UniPoints`** vào số dư ví của bạn!
2. **Đóng góp học liệu (Document Upload)**:
   - Cuộn tới phần **"Đóng Góp Học Liệu (6 Cổng)"**.
   - Kéo thả file ghi chú / bài giảng định dạng `.pdf` hoặc `.txt`.
   - Hệ thống tự động kiểm định 5 cổng an toàn (MIME, PII, Checksum, Bản quyền, Chất lượng), băm đoạn vector RAG, tự động phê duyệt và cộng ngay **`+50 UniPoints`** cùng **`+5 Điểm uy tín`**.
3. **Gia sư học tập AI Tutor (RAG Grounded Citations)**:
   - Đặt câu hỏi chuyên ngành CNTT (ví dụ: *"Cây đỏ đen là gì?"*, *"Hàm malloc và free trong C"*).
   - AI Tutor trả lời chính xác và đính kèm **Trích dẫn nguồn minh bạch (Citations)** có số trang và tên file tài liệu.
4. **Nạp UniPoints qua Solana Devnet**:
   - Chuyển sang trang **Ví UniPoints** (`/vi`), kết nối ví Phantom mạng Devnet, chọn gói nạp nhanh và bấm **"Nạp ngay"** để đổi SOL sang UniPoints.

---

## 🛑 Cách Dừng Hệ Thống

Để dừng toàn bộ dịch vụ: Chỉ cần đóng 2 cửa sổ dòng lệnh (Terminal) **UniSynapse Backend** và **UniSynapse Frontend**.
