# UniSynapse — Tổng Quan Kiến Trúc & Hệ Thống (Project Overview)

## 1. Mục tiêu Dự án (Project Mission)
**UniSynapse** là mạng lưới học thuật và tri thức mở Web2.5 dành cho sinh viên và giới nghiên cứu. Hệ thống kết hợp cơ chế kiểm định tri thức phi tập trung (Peer Consensus) với công nghệ blockchain Solana và giải pháp On-Ramp tức thì qua cổng ngân hàng VietQR (ACB) để xóa bỏ rào cản tiền điện tử cho người dùng phổ thông.

---

## 2. Ngăn xếp Công nghệ (Tech Stack)

### A. Frontend Applications (Port 3000 & 3001)
* **Framework**: Next.js 15 (App Router, Turbopack, React 19).
* **Styling**:
  * **Tailwind CSS v4** với `@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));`.
  * **CSS Modules** (`wallet.module.css`, v.v.) cho các component giao dịch, hỗ trợ giao diện tối/sáng tách biệt hoàn toàn.
  * **Canvas 2D / WebGL** (`GlobalNetCanvas.tsx`): Mạng lưới hạt tương tác theo chuột (Interactive Particle Mesh) chạy cuộn toàn bộ trang.
* **Web3 Integration**:
  * `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `@solana/wallet-adapter-phantom`.
  * Kết nối ví Phantom, ký chữ ký ed25519 off-chain để xác thực tài khoản Web2.5 (Campus SSO + Solana Wallet Linking).
* **Hai môi trường triển khai song song**:
  * `frontend/`: Cổng production chạy tại `http://localhost:3000`.
  * `ui-preview/`: Cổng staging/preview phục vụ phát triển giao diện tức thì tại `http://localhost:3001`.

### B. Backend API Service (Port 8000)
* **Framework**: FastAPI (Python 3.12, Uvicorn ASGI server).
* **Database & ORM**: SQLite (`backend/unisynapse.db`) / PostgreSQL ready, Pydantic schemas.
* **Security & Auth**: JWT Tokens, Bcrypt password hashing, Solana Ed25519 signature verification.
* **Solana Treasury Worker**: Quản lý ví tổng hệ thống trên Solana Devnet để thực hiện Airdrop / On-Ramp SOL tự động cho sinh viên khi nhận được chuyển khoản ngân hàng.

---

## 3. Kiến trúc Cổng Thanh toán On-Ramp (VietQR ACB ➔ Solana Devnet)

### Luồng hoạt động (Workflow):
1. **Khách hàng chọn gói đổi SOL**:
   * Gói 10.000đ: Nhận 0.05 SOL (+500 UP).
   * Gói 20.000đ: Nhận 0.12 SOL (+1.100 UP, +20% SOL).
   * Gói 50.000đ: Nhận 0.35 SOL (+3.000 UP, +40% SOL - Gói Hot).
   * Gói 100.000đ: Nhận 0.80 SOL (+7.000 UP, +60% SOL - Gói Web3 Hacker).
   * Hoặc tự nhập số tiền VNĐ bất kỳ (tối thiểu 10.000đ).
2. **Hệ thống tạo mã VietQR**:
   * Ngân hàng thụ hưởng: **ACB (Á Châu)**.
   * Số tiền chính xác và **Nội dung chuyển khoản (Order Code duy nhất)**.
   * **Đếm ngược an toàn 10 phút (600s)**: Hết 10 phút, mã QR tự động bị ngắt kết nối và hiển thị màn hình hết hạn để tránh chuyển sai lệch.
3. **Đối soát tự động thời gian thực (Real-time Auto-Detection)**:
   * Frontend hiển thị radar quét polling mỗi 3 giây tới backend.
   * Ngay khi tài khoản ACB ghi nhận tiền, Treasury tự động ký giao dịch Solana Devnet chuyển thẳng SOL vào ví Phantom của người dùng.
   * Hiển thị bảng chứng nhận hoàn tất giao dịch kèm link Solana Explorer Devnet (`https://explorer.solana.com/tx/<signature>?cluster=devnet`).

---

## 4. Các Phân hệ Tính năng Chính
1. **Gán nhãn Dữ liệu (`DataLabeling`)**:
   * Nhiệm vụ kiểm định AI concepts (Chính xác, Sai lệch, Cần bổ sung).
   * Cơ chế đối chiếu chéo (Peer Majority Vote Consensus) với điểm uy tín (Reputation 0-100).
   * Thưởng UniPoints cho mỗi lượt gán nhãn thành công.
2. **Kho Tri thức & Góp Tài liệu (`DocumentUpload`)**:
   * Tải tài liệu học thuật (PDF, TXT, DOCX), tự động phân mảnh (chunking) và đưa vào pipeline thẩm định.
3. **Trợ lý Gia sư AI (`AITutorChat`)**:
   * Tiêu thụ UniPoints (80 UP/lượt hỏi) để giải bài tập, giải thích khái niệm học thuật.
4. **Sổ cái Minh chứng Bất biến (`Ledger / ProofExplorer`)**:
   * Toàn bộ biến động điểm UniPoints, lịch sử nạp rút, phần thưởng gán nhãn được lưu vết minh bạch.
