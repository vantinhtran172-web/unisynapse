# UniSynapse — Student-Powered Knowledge Network

> Dự án website UniSynapse: Backend FastAPI, RAG AI Tutor có trích dẫn nguồn, quy trình đóng góp học thuật, sổ cái và nền tảng Solana Devnet đang hoàn thiện.

### Trạng thái triển khai
- **Local development**: hỗ trợ `http://localhost:3000` và API `http://127.0.0.1:8000`.
- **Public URL**: chưa phát hành cố định; không dùng tunnel tạm làm production.
- **Solana Network**: Solana Devnet only; settlement chỉ hiển thị khi backend xác minh receipt thật.
- **Demo seed**: tắt mặc định; chỉ bật local bằng `SEED_DEMO_DATA=1`.

---

## 🌟 1. Tổng quan Kiến trúc Dự án

Dự án được chuẩn hóa theo đúng sơ đồ mã nguồn đề án quốc gia:

```text
unisynapse/
├── frontend/                        # Web Next.js 16 (App Router, Tailwind CSS, Solana Wallet Adapter)
│   │   ├── app/page.tsx             # Client web UI (Dashboard, gán nhãn, Upload, AI Tutor, Sổ cái)
│   │   ├── components/              # UI components kết nối API
│   │   └── lib/api.ts               # Typed REST API Client
├── backend/                         # Web Server FastAPI
│   ├── main.py                      # Điểm khởi chạy, CORS, DB schema
│   ├── core/                        # Cấu hình hệ thống, database và security
│   ├── api/v1/                      # Endpoints: auth, tasks, documents, tutor, rewards, admin
│   ├── services/                    # Logic nghiệp vụ lõi
│   └── tests/test_backend.py        # Backend regression tests
├── program/                         # Khu vực dành cho Solana Anchor contract (chưa triển khai)
├── data/                            # SQLite local database và uploads
├── docs/                            # Tài liệu kiến trúc & đặc tả API
├── start-unisynapse.bat             # Script local khởi động backend/frontend
└── README.md                        # Hướng dẫn dự án
```

---

## 🚀 2. Cách Khởi Động Dự Án (Chạy Thật)

### Cách 1: Khởi chạy Tự Động 1 Click (Khuyến nghị cao nhất)
Chỉ cần **nhấp đúp chuột** vào tập tin:
👉 **`CHAY_TOAN_BO_DU_AN.bat`** (hoặc `start-unisynapse.bat`)

File script tự động thực hiện 100% quy trình:
1. Tự động kiểm tra môi trường Python (3.10+) và Node.js (18+).
2. Tự động khởi tạo môi trường ảo `.venv` và cài đặt dependencies Backend (`requirements.txt`).
3. Tự động cài đặt dependencies Frontend (`npm install`).
4. Nạp sẵn file cấu hình môi trường `.env`.
5. Khởi động đồng thời:
   - **Backend FastAPI**: `http://127.0.0.1:8000` (API Docs Swagger tại `/docs`)
   - **Frontend Next.js**: `http://localhost:3000`
6. Tự động bật trình duyệt web tới `http://localhost:3000`.

*Xem chi tiết hướng dẫn tại file: [`HUONG_DAN_CHAY_DU_AN.md`](HUONG_DAN_CHAY_DU_AN.md)*

---

### Cách 2: Khởi động thủ công bằng dòng lệnh

**Bước 1: Khởi động Backend FastAPI**
```powershell
.venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Bước 2: Khởi động Frontend Next.js**
```powershell
cd frontend
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000` (Trang Quản trị: `http://localhost:3000/admin`)

---

## 🔬 3. Ba Trụ Cột Đóng Góp Chạy Thật

### A. Data Labeling (Gán nhãn dữ liệu)
- Tải các bài toán thực tế từ cơ sở dữ liệu (`/api/v1/tasks/open`).
- Nhiều sinh viên cùng gán nhãn độc lập.
- Hệ thống tự động tính tỷ lệ đồng thuận (**Majority Vote**).
- Chèn bài toán chuẩn ẩn (**Gold Tasks**) để phát hiện gian lận.
- Khi đạt ngưỡng đồng thuận (ví dụ 80%), tự động cộng **UniPoints**, **Reputation** và tạo bằng chứng đối soát.

### B. Tài liệu có quyền (Quy trình kiểm định 6 cổng)
Tập tin PDF hoặc TXT người dùng tải lên bắt buộc phải vượt qua 6 cổng:
1. **Kiểm tra File & MIME**: Xác thực magic bytes `%PDF-` hoặc chuỗi UTF-8 hợp lệ.
2. **Quét bảo mật riêng tư (PII Scanner)**: Quét tự động regex phát hiện SĐT, CCCD/CMND, email cá nhân. Kiên quyết từ chối nếu có dấu hiệu rò rỉ dữ liệu nhạy cảm.
3. **Chống trùng lặp (SHA-256 Checksum)**: Tính mã băm toàn vẹn, từ chối nộp lại các file đã có trong kho tri thức để chống cày điểm ảo.
4. **Cam kết bản quyền & quyền chia sẻ**: Xác thực quyền hạn của sinh viên.
5. **Đánh giá chất lượng học thuật**: Phân tích mật độ từ ngữ, cấu trúc nội dung.
6. **Phê duyệt & Tự động Lập chỉ mục RAG**: Tách đoạn theo số trang thực tế, trích xuất vector embedding và đưa vào kho tri thức.

### C. Cổng Web2.5 Fiat On-Ramp: VietQR (ACB) ➔ Solana Devnet (Đột phá công nghệ)
- **Giải quyết rào cản Web3 cho sinh viên**: Sinh viên không cần KYC, không cần nạp tiền lên các sàn CEX/DEX phức tạp.
- **Tự động hóa toàn diện 24/7**: 
  1. Sinh viên chọn gói đổi SOL và nhập địa chỉ ví Phantom.
  2. Hệ thống sinh mã VietQR động chứa mã đơn `UPxxxxx` và đếm ngược an toàn 10 phút.
  3. Khi sinh viên quét mã chuyển khoản qua ACB hoặc bất kỳ app ngân hàng nào, hệ thống đối soát theo thời gian thực (3 giây/lần).
  4. Ngay khi nhận được tiền, Treasury Service ký lệnh giao dịch Solana và **chuyển thẳng SOL Devnet vào ví Phantom** của sinh viên trong vòng 5 giây.
  5. Cung cấp link trực tiếp kiểm tra trên **Solana Explorer Devnet** (`https://explorer.solana.com/tx/{signature}?cluster=devnet`).

---

## 🤖 4. RAG AI Tutor (Chống Bịa Đặt & Có Dẫn Nguồn)

- Động cơ tìm kiếm tương đồng vector Cosine Similarity giữa câu hỏi và các đoạn trích trong kho tri thức.
- **Dẫn nguồn minh bạch (Grounded Citations)**: Mỗi câu trả lời đều đi kèm huy hiệu nguồn có thể bấm để xem chi tiết đoạn trích, tên tài liệu và số trang (ví dụ: `[CS101_GiaoTrinh_LapTrinh_C_Va_ConTro.txt, Trang 1]`).
- **Cơ chế từ chối khi không có nguồn (Anti-Hallucination Refusal)**: Nếu câu hỏi nằm ngoài phạm vi học liệu đã kiểm duyệt (độ tương quan < 0.15), AI Tutor kiên quyết từ chối trả lời để đảm bảo tính trung thực học thuật thay vì đoán mò.

---

## ⛓️ 5. Sổ Cái Kép & Bằng Chứng Solana Devnet

- Mọi phát sinh UniPoints đều được ghi vào sổ cái `reward_ledger`.
- Bản ghi thanh toán và hoán đổi SOL được kiểm định kép: đối soát số dư biến động thực tế + nội dung chuyển khoản ACB.
- Giao dịch on-chain Solana sử dụng khóa Treasury Keypair độc lập, tự sinh wire transaction và gửi trực tiếp lên Solana Devnet RPC.
- Mọi giao dịch thành công đều có chữ ký Base58 và liên kết Solana Explorer kiểm tra tính minh bạch on-chain.

---

## 🧪 6. Chạy Kiểm Thử Tự Động (Unit Tests)

Bộ kiểm thử đạt độ bao phủ toàn diện các module lõi:
```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests -v
```
**Kết quả mới nhất**: `55 passed, 8 skipped, 0 failed` (100% test case chức năng vượt qua thành công, bao gồm xác thực phiên, đối soát VietQR ACB, chuyển SOL on-ramp, chống rò rỉ PII tài liệu, và tính bất biến của sổ cái kế toán).

