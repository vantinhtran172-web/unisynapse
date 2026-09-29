# UniSynapse — Kế Hoạch Triển Khai Chi Tiết (Roadmap & Implementation Plans)

Tài liệu này vạch rõ 4 giai đoạn phát triển của dự án UniSynapse: Đã hoàn thành, Đang triển khai, Sắp triển khai (Next Sprint) và Định hướng tương lai (Future Roadmap).

---

## 🚀 Giai đoạn 1: Đã Hoàn Thành (Completed Milestones)

- [x] **Kiến trúc Xác thực Đăng nhập / Đăng ký Cao cấp (Split-Screen Auth)**:
  - Trang `/dang-nhap` và `/dang-ky` với visual nghệ thuật mạng lưới tri thức kết hợp form chuẩn mực.
  - Tích hợp tài khoản Campus SSO và liên kết ví Phantom qua chữ ký Ed25519.
- [x] **Cổng On-Ramp Web2.5 VietQR (ACB) ➔ Solana Devnet (`/vi`)**:
  - Giao diện chọn nhanh 4 gói quy đổi (10k, 20k, 50k, 100k) hoặc nhập số tiền VNĐ tùy chọn.
  - Cơ chế đếm ngược an toàn 10 phút (600s), tự ngắt ảnh VietQR khi hết thời gian để bảo vệ giao dịch.
  - Radar quét đối soát tự động ACB theo thời gian thực (Polling 3 giây).
  - Tự động chuyển SOL Devnet vào ví Phantom và xuất liên kết kiểm tra giao dịch trên Solana Explorer.
- [x] **Hiệu ứng Mạng lưới Hạt Tương tác (Interactive Canvas - GlobalNetCanvas)**:
  - Mạng lưới hạt chuyển động và tạo đường nối tia sáng theo vị trí con trỏ chuột.
  - Hoạt động mượt mà xuyên suốt toàn trang từ Header đến tận Footer khi cuộn chuột.
  - Đã cân chỉnh độ tương phản trên nền sáng chuẩn mực (giảm nổi bật 2/3 để tinh tế và sang trọng).
- [x] **Chuẩn hóa Giao diện Tối & Sáng Độc lập (Pure Dual Theme Separation)**:
  - Khắc phục lỗi chữ tàng hình ở Dark Mode bằng cách cấu hình chuẩn `@custom-variant dark` của Tailwind CSS v4.
  - Tách bạch 100% mã màu cho trang đổi SOL: Dark Mode giữ phong cách Cyberpunk huyền bí; Light Mode chuyển sang tông trắng ngọc thanh lịch, không dùng màu chung gây chắp vá.
- [x] **Đồng bộ Song song Hai Môi trường**:
  - `frontend/` (Port 3000) và `ui-preview/` (Port 3001) đều vượt qua kiểm tra TypeScript (`tsc --noEmit` 0 lỗi).

---

## ⚡ Giai đoạn 2: Đã Triển Khai & Kiểm Chứng Hoàn Tất (Completed in Sprint)

- [x] **Tối ưu hóa Hiệu năng Canvas trên Thiết bị Di động (Mobile FPS Capping & Touch Events)**:
  - Tự động co giãn số hạt trên màn hình nhỏ (< 768px) xuống còn 14–26 hạt, giảm vận tốc trôi, khóa cứng 60 FPS giúp tiết kiệm pin tối đa.
  - Bổ sung cơ chế cảm ứng ngón tay (`touchmove`, `touchend`) phản hồi mượt mà theo thao tác vuốt trên điện thoại.
- [x] **Hệ thống Toast Notification & Copy Feedback (Haptic + Emerald Toast)**:
  - Hiển thị banner nổi glassmorphic `.copyToast` với icon tick xanh khi sao chép STK ACB hoặc Mã chuyển khoản.
  - Rung phản hồi vi mô `navigator.vibrate(15)` và tự động tắt sau 2.5 giây.
- [x] **Xử lý Đơn giao dịch Treo (Pending Order Recovery qua localStorage)**:
  - Lưu mã đơn và thời gian tạo vào `localStorage`. Khi tải lại trang (F5), nếu đơn còn hạn (< 600s), hệ thống tự phục hồi mã QR và tiếp tục đếm ngược chính xác.
  - Tự động dọn sạch bộ nhớ khi đơn đã thanh toán thành công hoặc hết hạn an toàn.
- [x] **Tích hợp Open Campus ID (OCID · EduChain) & Web2.5 SSO**:
  - Bổ sung bộ nút đăng nhập/đăng ký một chạm: Open Campus ID (ghi điểm với ban tổ chức Corelia Academy), Ví Phantom (Solana Devnet), và Campus Student SSO (1-Click Demo cho BGK chấm thi).
- [x] **Triệt Tiêu Hoàn Toàn Lỗi Đỏ F12 & Cảnh Báo Extension Console**:
  - Bổ sung endpoint `/auth/session` (HTTP 200) thay vì polling gây lỗi 401 trên trình duyệt.
  - Tối ưu Solana Wallet Standard provider triệt tiêu xung đột adapter Phantom.
- [x] **Tối Ưu Hoạt Ảnh Quỹ Đạo Logo Hero (Hero Orbit Animation Rings)**:
  - 3 tầng quỹ đạo xoay 360 độ độc lập với vệ tinh dẫn đường phát sáng, hoạt động trơn tru bất kể thiết lập prefers-reduced-motion.
- [x] **Bỏ Giới Hạn Nạp 10 SOL Toàn Diện (Client & Backend)**:
  - Cho phép nạp linh hoạt từ 0.001 SOL trở lên, tính toán điểm UniPoints quy đổi theo thời gian thực không giới hạn trần.
- [x] **Chuẩn Hóa Thương Hiệu AI: GPT-6.0 Sol (Đồng bộ Giao diện & 9Router Gateway)**:
  - Cập nhật toàn bộ nhãn hiển thị thành GPT-6.0 Sol / AI Sol trên web, giữ nguyên backend router payload `cx/gpt-5.6-luna`.
- [x] **Cơ Chế Đối Soát Kép VietQR ACB (Dual-Verification & Live Balance Delta Fallback)**:
  - Kết hợp kiểm tra nội dung sao kê và theo dõi biến động số dư thực tế tức thời, khắc phục tình trạng đơn nạp bị treo khi API sao kê bị ngân hàng hạn chế, tự động giải ngân SOL on-chain.
- [x] **Bảo Mật & Chuẩn Hóa 20 Tiêu Chuẩn Sẵn Sàng Deploy (OrangeTec Pre-Public Checklist)**:
  - Hoàn thiện 20/20 tiêu chuẩn: Hashing Argon2, Rate limiting login + Cloudflare IP detection, HSTS/Security Headers, Session TTL, Parameterized SQL, Giới hạn file upload & MIME, tắt swagger ở production, và script backup tự động.
- [x] **Triển Khai Netlify Port 3001 (`https://unisynapse.netlify.app`), Đóng Gói Tài Liệu VHU Trên Render & Kích Hoạt Cloudflare Chống DDoS**:
  - [x] Xuất bản thành công bản Port 3001 (`ui-preview/`) lên Netlify (Deploy ID: `6abb99e646bdb100082ce0bb`), giữ nguyên bản `frontend/` (port 3000) an toàn.
  - [x] Đóng gói cam kết `tai-lieu-trac-nghiem-VHU.zip` (34.2 MB) và `backend/resources/tai-lieu-trac-nghiem-VHU.zip` để Render tự động giải nén và đánh chỉ mục 23 bộ đề PDF vào cơ sở dữ liệu.
  - [x] Bảo toàn cấu trúc cơ sở dữ liệu và dữ liệu kiểm toán (67 tài liệu, không drop bảng, không rò rỉ).
  - [x] Thiết lập cấu hình Cloudflare Anti-DDoS (Proxy CNAME, Under Attack Mode, WAF Rate Limiting, Bot Fight Mode, SSL Full Strict).
  - [x] Smoke test trình duyệt thực tế thành công trên cả trang Client (`/`), trang Admin (`/admin`), và trang Đăng nhập (`/dang-nhap`).
- [x] **Tối Ưu Hóa Giao Diện Mobile Port 3001 Toàn Diện (Awwwards-Standard Mobile UX & Off-Canvas Drawer)**:
  - [x] Khắc phục triệt để lỗi tràn ngang navbar, ẩn desktop clutter, chuẩn hóa header 52px với badge UniPoints và nút Hamburger SVG.
  - [x] Thiết lập thanh tab học thuật cố định (44px) cuộn ngang cảm ứng mượt mà.
  - [x] Xây dựng Mobile Drawer trượt mượt mà với backdrop blur: Định danh học viên, điều hướng học thuật, kết nối ví Phantom, đổi SOL, đăng nhập/đăng ký và theme switcher.
  - [x] Đảo thứ tự Hero Section trên mobile: Đưa khẩu hiệu và nút bấm lên đầu (`order: 1`), thu nhỏ 3D Orbit Mandala làm nền bên dưới (`order: 2`).
  - [x] Triệt tiêu lỗi phình to 800px trên trang ví `/vi`, căn chỉnh toàn bộ ô thẻ vừa vặn màn hình điện thoại.
  - [x] Khắc phục chữ đè lên chữ trên trang Xác thực `/dang-nhap`, form nhập liệu sẵn sàng tương tác ngay.
  - [x] Kiểm chứng thực tế qua CDP Mobile Emulation 390×844: Chụp 5 ảnh màn hình kiểm chứng chuẩn xác (`cdp_mobile_home.png`, `cdp_mobile_drawer.png`, `cdp_mobile_vi.png`, `cdp_mobile_login.png`, `cdp_mobile_tutor.png`).

---

## 🔮 Giai đoạn 3: Đang & Sắp Triển Khai (Next Sprint)

1. **Bảng Vinh Danh Sinh viên & Compressed NFT (Weekly Leaderboard + Solana cNFT)**:
   - Hiển thị Top 10 sinh viên có điểm uy tín (Reputation) cao nhất và đóng góp nhiều nhãn kiểm định nhất.
   - Cơ chế mint tự động huy hiệu học thuật on-chain dạng cNFT trên Solana Devnet cho sinh viên tiêu biểu.
2. **Mở rộng Ngân hàng VietQR Đa kênh (Multi-Bank NAPAS 247)**:
   - Ngoài ACB, tích hợp thêm mã VietQR chuẩn liên ngân hàng cho Vietcombank, MB Bank, Techcombank, TPBank và ví MoMo.
3. **Cơ chế Rút SOL về VNĐ (Web2.5 Off-Ramp)**:
   - Cho phép sinh viên tích lũy UniPoints từ việc gán nhãn dữ liệu có thể đổi ngược lại thành SOL hoặc rút về tài khoản ngân hàng sinh viên.
3. **Mở rộng Nhiệm vụ Gán nhãn Đa phương tiện (Multimedia Data Labeling)**:
   - Bổ sung gán nhãn cho sơ đồ bài giảng, trích xuất công thức toán LaTeX từ ảnh chụp bảng, và kiểm định tóm tắt tài liệu của AI.
4. **Bảng Vinh danh Sinh viên (Weekly Academic Leaderboard)**:
   - Vinh danh top sinh viên có điểm uy tín (Reputation) cao nhất và đóng góp nhiều nhãn chính xác nhất hàng tuần.
   - Thưởng huy hiệu On-chain (Solana Compressed NFT - cNFT).

---

## 🌐 Giai đoạn 4: Định Hướng Tương Lai (Future Long-term Vision)

1. **Triển khai Solana Mainnet-Beta**:
   - Triển khai chương trình Anchor Smart Contract từ `program/` lên mạng chính thức của Solana, thiết lập pool thanh khoản chính thức cho token UniPoints/SOL.
2. **Lưu trữ Bất biến Phân tán (Decentralized Storage)**:
   - Tích hợp Arweave / IPFS để lưu trữ toàn bộ các luận văn, giáo trình nghiên cứu của sinh viên mà không phụ thuộc vào bất kỳ máy chủ tập trung nào.
3. **UniSynapse Telegram Mini App (TMA)**:
   - Phát triển ứng dụng Web Mini App ngay trong Telegram giúp sinh viên nhận thông báo có bài toán gán nhãn mới và làm nhiệm vụ nhận UP tức thì ngay trên điện thoại.
4. **Mô hình Trợ lý Gia sư Tự huấn luyện (Continuous RLHF AI Tutor)**:
   - Dùng chính tập dữ liệu đồng thuận từ hàng ngàn sinh viên gán nhãn để tinh chỉnh (Fine-tune) mô hình ngôn ngữ mã nguồn mở, tạo thành gia sư AI chuyên biệt cho từng trường đại học tại Việt Nam.

- [x] **Đồng bộ hóa 100% hai cổng Port 3000 (`frontend/`) và Port 3001 (`ui-preview/`)**:
  - [x] Khôi phục Quy trình 6 Cổng kiểm định & Autonomous On-Chain Oracle trên `DocumentUpload`.
  - [x] Khôi phục động cơ AI Tutor (GPT-5.6 Luna) và danh mục 19 giáo trình CNTT ĐH Văn Hiến.
  - [x] Bổ sung banner xác thực bằng chứng Solana Devnet trên `DataLabeling`.
  - [x] Khôi phục link Solana Explorer và Oracle Registry PDA trên `ProofExplorer`.
  - [x] Đạt 0 lỗi TypeScript trên cả hai cổng và kiểm thử trình duyệt hoàn tất.

- [x] **Tích hợp Bảng Xếp Hạng Sinh Viên Đóng Góp (Leaderboard)**:
  - [x] Tạo `Leaderboard.tsx` đồng bộ giữa `frontend/` và `ui-preview/`.
  - [x] Hiển thị Top 1-3 với huy chương 🥇🥈🥉, avatar gradient, UniPoints và thanh tiến trình.
  - [x] Tích hợp vị trí người dùng hiện tại (`Bạn (username)`) theo thời gian thực.
  - [x] Tách biệt 100% phong cách hiển thị Dark/Light Mode.
- [x] **Khôi phục và chuẩn hóa toàn diện giao diện Tổng quan (Hero Orbit Mandala + Dashboard + Leaderboard) theo ảnh người dùng cung cấp** (Hoàn thành 29/09/2026).
- [x] **Mở rộng giao diện 100% Full-Width toàn màn hình và xử lý triệt để vệt trắng lề ngoài cùng bên trái (Port 3001)** (Hoàn thành 29/09/2026).
- [x] **Gỡ bỏ hoàn toàn giới hạn nạp 10 SOL / 24 giờ cho Client & Backend** (Hoàn thành 29/09/2026).
- [x] **Triệt tiêu toàn bộ lỗi đỏ F12 (Console 401 & Extension Crashes) khi duyệt khách và đăng ký** (Hoàn thành 29/09/2026).
- [x] **Kiểm định & Tối ưu Toàn diện 20 Tiêu chuẩn An ninh Triển khai Internet (OrangeTec Pre-Public Checklist)** (Hoàn thành 29/09/2026).
- [x] **Khóa Cứng Đối Soát Chống Trùng Đơn Nạp (Strict Memo Isolation & Bank Ref De-duplication)** (Hoàn thành 29/09/2026).
- [x] **Lập Chỉ Mục Toàn Văn 19 Giáo Trình VHU (Full RAG Indexing 247 Chunks)** (Hoàn thành 29/09/2026).
- [x] **Vượt Qua 100% Test Suite Backend (76/76 Pytest Pass) & Frontend TypeScript (0 Error)** (Hoàn thành 29/09/2026).
- [x] **Khắc Phục Toàn Diện Bằng Chứng Solana Devnet & Link Explorer Cho Phân Hệ Gán Nhãn Dữ Liệu** (Hoàn thành 29/09/2026).
- [x] **Thiết Lập Bản Port 3001 (`ui-preview/`) Làm Bản Deploy & Xử Lý Triệt Để 3 Điểm Yếu Cốt Lõi** (Hoàn thành 29/09/2026):
  - [x] Loại bỏ 100% bí mật mặc định (Admin key, Solana treasury seed, ACB credentials, 9Router key) khỏi mã nguồn; thiết lập fail-closed ở production.
  - [x] Loại bỏ hoàn toàn chữ ký giả lập Ed25519 offline; chỉ tạo link Solana Explorer khi RPC xác nhận giao dịch đã ghi vào block.
  - [x] Sửa đường chạy PostgreSQL: bỏ nuốt lỗi `init_db()`, sửa `BEGIN IMMEDIATE` thành `SELECT ... FOR UPDATE`, chuẩn hóa driver `psycopg` trên Alembic, thêm kiểm thử biên dịch DDL tĩnh độc lập.
  - [x] Giữ nguyên vẹn bản gốc `frontend/` (Port 3000), cấu hình `netlify.toml` và `render.yaml` trỏ chính xác vào `ui-preview/`.
- [x] **Khắc Phục Lỗi Lệch Tâm Vòng Quỹ Đạo Logo Trang Đăng Ký & Đăng Nhập (/dang-ky, /dang-nhap)** (Hoàn thành 29/09/2026):
  - [x] Tạo riêng `@keyframes preview-auth-breathe` bảo toàn `transform: translate(-50%, -50%) scale(...)`, sửa triệt để lỗi ghi đè animation làm văng tâm logo +74px.
  - [x] Thiết kế 3 vòng quỹ đạo đồng tâm (Cyan, Indigo, Amber) chuyển động 360° đồng quy quanh logo emblem trung tâm.
  - [x] Định vị cân bằng `top: 50%; transform: translateY(-46%);` hài hòa tuyệt đối với văn bản giới thiệu bên trái.
  - [x] Tối ưu hiển thị thạch anh phát quang đồng thời cho cả Dark Mode và Light Mode.

- [x] **Triển Khai Bản Mobile Port 3001 Lên Netlify, Sửa Triệt Để Lỗi 404 Auth & Tối Ưu Nút Đăng Nhập/Đăng Xuất Góc Phải Mobile** (Hoàn thành 29/09/2026):
  - [x] Gỡ bỏ rewrite mù sang Render trong `next.config.ts`, tạo Resilient Next.js Route Handler tại `ui-preview/src/app/api/v1/[...slug]/route.ts`.
  - [x] Bổ sung nút `.preview-mobile-top-auth` (`[Đăng nhập]` / `[Thoát]`) trên góc phải thanh header điện thoại.
  - [x] Ẩn triệt để desktop clutter trên mobile, triệt tiêu 100% lỗi cắt góc biểu tượng ⚡.
  - [x] Giảm độ dài mật khẩu tối thiểu xuống 6 ký tự (`backend/` và `ui-preview/`).
  - [x] Bổ sung 301 redirects cho lỗi gõ nhầm URL (`/dant-ky` ➔ `/dang-ky`).
  - [x] Đẩy thành công commit `fed6ae1` & `baeaa4b` lên `origin/master`, xuất bản Netlify thành công.
  - [x] Kiểm thử tự động E2E trên trình duyệt mobile thành công 100%: Đăng ký tài khoản mới, chuyển hướng mượt mà, hiển thị phiên đăng nhập chuẩn mực.
