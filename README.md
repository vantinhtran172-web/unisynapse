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

### Cách 1: Chạy Tự Động 1 Click (Khuyến nghị)
Nhấp đúp chuột vào tập tin:
`start-unisynapse.bat`

Script sẽ tự động:
1. Mở cửa sổ **Backend FastAPI Server** tại: `http://127.0.0.1:8000` (Tài liệu API Swagger tại `/docs`)
2. Mở cửa sổ **Frontend Next.js** tại: `http://localhost:3000`
3. Mở trình duyệt web hiển thị trang chủ UniSynapse.

---

### Cách 2: Khởi động thủ công bằng dòng lệnh

**Bước 1: Khởi động Backend FastAPI**
```powershell
cd C:\Users\TGDD\Downloads\ấdadsa\unisynapse
py -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Bước 2: Khởi động Frontend Next.js**
```powershell
cd C:\Users\TGDD\Downloads\ấdadsa\unisynapse\frontend
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000`

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

### C. Solana Devnet settlement
- Giao diện không tự ký hoặc tự tạo transaction giả.
- `/api/v1/rewards/record-onchain` đã retired; ledger phải do backend tạo.
- Signature và Explorer URL chỉ xuất hiện sau khi backend xác minh receipt thật.
- Smart contract, SPL token, SOL payment và settlement worker chưa triển khai.

---

## 🤖 4. RAG AI Tutor (Chống Bịa Đặt & Có Dẫn Nguồn)

- Động cơ tìm kiếm tương đồng vector Cosine Similarity giữa câu hỏi và các đoạn trích trong kho tri thức.
- **Dẫn nguồn minh bạch (Grounded Citations)**: Mỗi câu trả lời đều đi kèm huy hiệu nguồn có thể bấm để xem chi tiết đoạn trích, tên tài liệu và số trang (ví dụ: `[CS101_GiaoTrinh_LapTrinh_C_Va_ConTro.txt, Trang 1]`).
- **Cơ chế từ chối khi không có nguồn (Anti-Hallucination Refusal)**: Nếu câu hỏi nằm ngoài phạm vi học liệu đã kiểm duyệt (độ tương quan < 0.15), AI Tutor kiên quyết từ chối trả lời để đảm bảo tính trung thực học thuật thay vì đoán mò.

---

## ⛓️ 5. Sổ Cái Kép & Bằng Chứng Solana Devnet

- Mọi phát sinh UniPoints đều được ghi vào sổ cái `reward_ledger`.
- Bản ghi chưa có receipt thật giữ trạng thái `unsubmitted` hoặc `unverified`.
- Không hiển thị chữ ký/Explorer link giả.
- Solana settlement Devnet sẽ chỉ bật sau khi contract và RPC reconciliation hoàn tất.

---

## 🧪 6. Chạy Kiểm Thử Tự Động (Unit Tests)

Bộ kiểm thử hiện có thể chạy bằng:
```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests -q
```
Kết quả gần nhất: `2 passed, 7 skipped`. Các test skip phản ánh dependency/integration chưa có cấu hình đầy đủ.
