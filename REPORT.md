# Báo cáo khảo sát dự án UniSynapse

> Báo cáo kỹ thuật hiện trạng repository `unisynapse`, khảo sát ngày 13/09/2026. Không thay đổi mã nguồn.

## Phạm vi sản phẩm

UniSynapse hiện được xác định là **một website web full-stack**, chạy trên trình duyệt với frontend Next.js và backend FastAPI. Dự án **không bao gồm ứng dụng mobile Android/iOS, ứng dụng desktop hoặc native app**. Solana wallet chỉ là một tích hợp trong website; chương trình Anchor là backend/on-chain support, không phải một ứng dụng riêng cho người dùng.

Những phần dưới đây được phân loại rõ theo hiện trạng:

- **Đã có bản web để chạy/thử nghiệm:** dashboard, gán nhãn, upload tài liệu, AI Tutor, ledger viewer, wallet connect và admin portal.
- **Mới ở mức prototype hoặc mô phỏng:** tiến trình 6 cổng trên giao diện, fallback profile khi contract lỗi, một phần RAG và việc polling trạng thái.
- **Chưa hoàn thiện:** settlement Solana thật, RPC reconciliation, reward ledger idempotency đầy đủ, hardening production, PostgreSQL production và bộ kiểm thử hoàn chỉnh.

## 1. Tóm tắt

UniSynapse là website mạng tri thức học thuật do sinh viên đóng góp. Website kết hợp đóng góp học liệu, gán nhãn và consensus, AI Tutor grounded RAG có trích dẫn, sổ cái reward double-entry và tích hợp Solana Devnet.

Bản web hiện có vertical slice:

```text
Đóng góp học thuật -> Kiểm định -> Consensus/RAG -> Reward ledger -> Proof
```

Đây là luồng prototype có thể trình diễn, chưa phải toàn bộ luồng production đã được xác minh end-to-end. Settlement Solana thực tế chưa hoàn thiện: ledger nội bộ có proof hash nhưng giao dịch on-chain còn `unsubmitted` hoặc chưa được RPC reconciliation xác nhận. Production cũng cần PostgreSQL thay SQLite.

## 2. Cấu trúc repository

Các thư mục `backend`, `frontend`, `data`, `docs` và `program` phục vụ website và hạ tầng hỗ trợ website. Không có mục tiêu phát hành mobile/desktop app trong phạm vi hiện tại.

| Khu vực | Vai trò |
|---|---|
| [`backend`](file:///C:/Users/TGDD/Downloads/unisynapse/backend) | FastAPI, API v1, services, security, database |
| [`frontend`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend) | Website Next.js/React, wallet, dashboard, Tutor, admin |
| [`program`](file:///C:/Users/TGDD/Downloads/unisynapse/program) | Solana Anchor support cho website |
| [`worker`](file:///C:/Users/TGDD/Downloads/unisynapse/worker) | Xử lý nền, hiện chưa được mô tả là app người dùng |
| [`shared`](file:///C:/Users/TGDD/Downloads/unisynapse/shared) | Thành phần dùng chung |
| [`data`](file:///C:/Users/TGDD/Downloads/unisynapse/data) | SQLite local/runtime data |
| [`docs`](file:///C:/Users/TGDD/Downloads/unisynapse/docs) | Tài liệu |
| [`README.md`](file:///C:/Users/TGDD/Downloads/unisynapse/README.md) | Tầm nhìn và hướng dẫn |
| [`Dockerfile`](file:///C:/Users/TGDD/Downloads/unisynapse/Dockerfile) | Đóng gói web backend |
| [`render.yaml`](file:///C:/Users/TGDD/Downloads/unisynapse/render.yaml) | Deployment web |

`cloudflared.exe` và script expose local chỉ phù hợp phát triển/demo website, không phải giải pháp production. Chưa có quy trình deployment web production hoàn chỉnh được xác minh trong báo cáo này.

## 3. Kiến trúc website

Entry backend là [`backend/main.py`](file:///C:/Users/TGDD/Downloads/unisynapse/backend/main.py). Frontend gọi REST `/api/v1` qua client [`frontend/src/lib/api.ts`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/lib/api.ts).

```text
Trình duyệt + Solana Wallet extension
        |
Website Next.js dashboard/admin
        | REST + cookie session
FastAPI backend
        +-- SQLite local / PostgreSQL production
        +-- RAG TF-IDF + Gemini tùy chọn
        +-- reward ledger + proof hash
        +-- Solana Devnet/RPC (chưa hoàn thiện)
```

Backend có các nhóm Auth, Documents, Tasks, Tutor, Rewards và Admin. Database nằm ở [`backend/core/database.py`](file:///C:/Users/TGDD/Downloads/unisynapse/backend/core/database.py), migration dùng Alembic. Local dùng SQLite `data/unisynapse.db`; production nên dùng `DATABASE_URL` trỏ PostgreSQL.

**Chưa làm được hoàn chỉnh:** chưa có bằng chứng rằng toàn bộ chuỗi từ browser đến backend, worker, database và Solana đã được kiểm thử liên tục trên môi trường production. Vì vậy sơ đồ trên là kiến trúc mục tiêu kết hợp với các phần prototype đang có, không phải cam kết mọi nhánh đều đã vận hành ổn định.

## 4. Backend và security

[`backend/core/security.py`](file:///C:/Users/TGDD/Downloads/unisynapse/backend/core/security.py) có Argon2, TOTP/2FA, session cookie và admin guards. Khi triển khai cần bổ sung/kiểm tra CORS allowlist, CSRF, rate limiting, secret rotation, cookie flags và PII-safe logging.

Các service chính:

- [`backend/services/rag_service.py`](file:///C:/Users/TGDD/Downloads/unisynapse/backend/services/rag_service.py): retrieval TF-IDF/cosine, Gemini và extractive fallback.
- [`backend/services/consensus_service.py`](file:///C:/Users/TGDD/Downloads/unisynapse/backend/services/consensus_service.py): vote, threshold, peer consensus và reward event.
- [`backend/services/reward_service.py`](file:///C:/Users/TGDD/Downloads/unisynapse/backend/services/reward_service.py): ledger/proof.
- [`backend/api/v1/documents.py`](file:///C:/Users/TGDD/Downloads/unisynapse/backend/api/v1/documents.py): upload và pipeline tài liệu.

## 5. Gán nhãn và consensus

UI nằm ở [`DataLabeling.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/DataLabeling.tsx).

Luồng web: tải task mở -> chọn label -> backend ghi vote -> đối chiếu peer votes -> tính confidence/majority -> chốt reward -> hiển thị vào ledger.

Frontend có `user_submitted`, loading, peer votes, confidence và reward. Tuy nhiên duplicate submission, eligibility, threshold và finalization phải được bảo vệ ở backend, không dựa vào UI.

**Phần còn dang dở:** giao diện có thể hiển thị kết quả consensus, nhưng báo cáo chưa xác nhận hệ thống đã có cơ chế chống gian lận hoàn chỉnh như giới hạn vote theo user/device, phát hiện collusion, xử lý timeout khi không đủ vote, rollback reward hoặc retry không tạo bút toán trùng. Đây là chức năng backend cần hoàn thiện trước khi coi điểm thưởng là đáng tin cậy.

## 6. Sáu cổng kiểm định tài liệu

UI tại [`DocumentUpload.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/DocumentUpload.tsx). Pipeline backend dùng để đưa học liệu vào RAG gồm:

1. File structure và MIME header.
2. Privacy/PII scanner.
3. SHA-256 duplicate check.
4. Copyright/share permission.
5. Quality assessment và chunking.
6. Approval/indexing vào kho tri thức.

Frontend hiển thị tiến trình upload, privacy, duplicate, copyright, quality và approved. Backend mới là nguồn sự thật. Kết quả có checksum, trạng thái, chunk count và reward; admin có thể duyệt/từ chối.

Rủi ro cần kiểm soát: file polyglot, MIME spoofing, file quá lớn, PII lọt qua scanner, prompt injection trong tài liệu và tài liệu không có quyền chia sẻ.

## 7. Grounded AI Tutor

UI tại [`AITutorChat.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/AITutorChat.tsx). Luồng:

1. Nhận câu hỏi.
2. Tìm chunks đã kiểm định.
3. Tính cosine similarity bằng TF-IDF.
4. Chọn context.
5. Gemini tổng hợp nếu có key.
6. Extractive RAG fallback nếu Gemini không có.
7. Trả `answer`, `citations`, `grounded`, `engine`.

Citation có document name, page, chunk index, score và excerpt; UI cho phép mở đoạn trích. Có anti-hallucination guard và câu hỏi thử nghiệm ngoài miền.

**Phần chưa hoàn thiện:** AI Tutor hiện là tính năng web prototype, chưa phải hệ thống đảm bảo không hallucination 100%. TF-IDF mới là retrieval baseline; chưa có đánh giá định lượng precision/recall, citation entailment, context rỗng và refusal trên bộ câu hỏi chuẩn. Gemini key còn có thể lưu localStorage/gửi từ client; chưa phù hợp production. Chưa có quy trình đầy đủ chống prompt injection từ tài liệu upload. Khi retrieval sai hoặc không đủ nguồn, hệ thống có thể trả fallback/refusal nhưng chưa có SLA hay dashboard chất lượng để chứng minh độ tin cậy.

## 8. Reward ledger double-entry

Ledger được hiển thị tại [`ProofExplorer.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/ProofExplorer.tsx). Entry gồm user, delta, reason, source type/id, proof status, Solana signature nếu có, proof hash, timestamp và explorer URL.

Nguyên tắc đúng: reward phải có source nghiệp vụ, browser không được tự cộng điểm, có thể truy từ reward về task/document, hash chống sửa đổi và retry phải idempotent.

Hiện trạng: `reward_ledger` chưa ghi giao dịch on-chain thật đầy đủ; endpoint `record-onchain` cũ đã retired/410. UI đã nêu đúng quy tắc chỉ hiển thị giao dịch sau backend submit và RPC verify thành công. Không nên gọi mọi ledger entry là immutable on-chain.

## 9. Solana/Anchor

Client gồm [`frontend/src/lib/anchorClient.ts`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/lib/anchorClient.ts), [`frontend/src/lib/idl.ts`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/lib/idl.ts) và [`frontend/src/hooks/useUserProfile.ts`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/hooks/useUserProfile.ts).

Program nằm tại [`program/programs/unisynapse/src/lib.rs`](file:///C:/Users/TGDD/Downloads/unisynapse/program/programs/unisynapse/src/lib.rs), có:

- `initialize_user`: PDA `user + signer`, khởi tạo điểm và reputation.
- `record_contribution`: PDA contribution, lưu task/type/quality/data hash, cộng điểm theo quality.

Đây là **tích hợp hỗ trợ cho website**, không phải app Solana độc lập.

**Phần chưa làm được hoặc đang dở:**

- Chưa xác nhận đầy đủ program đã deploy và khớp với program ID/IDL mà website sử dụng.
- Chưa hoàn thiện instruction settlement từ reward ledger nội bộ sang chain.
- Chưa có RPC reconciliation đáng tin cậy cho trạng thái submitted/confirmed/failed.
- Chưa chứng minh retry worker là idempotent, nên retry có nguy cơ tạo record hoặc reward trùng nếu thiết kế không khóa chặt.
- `useUserProfile` có mock fallback khi transaction lỗi; điều này giúp xem website nhưng không thể coi là xác thực on-chain thật.
- Chưa hoàn thiện giới hạn String, chống replay, error handling và quy trình xử lý RPC timeout.

Vì vậy hiện chỉ nên mô tả Solana là **Devnet integration đang hoàn thiện**, không phải proof production đã hoàn tất.

## 10. Frontend/state

Dashboard tại [`frontend/src/app/page.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/app/page.tsx). Các component chính là [`Navbar.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/Navbar.tsx), [`ProfileCard.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/ProfileCard.tsx), [`DataLabeling.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/DataLabeling.tsx), [`DocumentUpload.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/DocumentUpload.tsx), [`AITutorChat.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/AITutorChat.tsx) và [`ProofExplorer.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/components/ProofExplorer.tsx).

[`AppStateContext.tsx`](file:///C:/Users/TGDD/Downloads/unisynapse/frontend/src/context/AppStateContext.tsx) tải user/tasks/documents/ledger song song và poll 10 giây. Prototype phù hợp; production có thể thay bằng SSE/WebSocket.

Giao diện dark cyber/glassmorphism, responsive navigation, loading/error state và wallet adapter.

## 11. Vận hành

Script chính gồm [`start-unisynapse.bat`](file:///C:/Users/TGDD/Downloads/unisynapse/start-unisynapse.bat), [`deploy-internet.bat`](file:///C:/Users/TGDD/Downloads/unisynapse/deploy-internet.bat), [`Dockerfile`](file:///C:/Users/TGDD/Downloads/unisynapse/Dockerfile) và [`render.yaml`](file:///C:/Users/TGDD/Downloads/unisynapse/render.yaml).

Production checklist: PostgreSQL managed, secret manager, HTTPS/domain, không tunnel tạm, reverse proxy, CORS, backup/restore, monitoring upload/RAG/ledger/RPC và audit log không chứa secret/PII.

## 12. Kiểm thử cần có

- Auth/session/authorization.
- Upload sai MIME, quá dung lượng, duplicate, PII và permission.
- Duplicate vote, threshold, reward idempotency.
- RAG citation, context rỗng, ngoài miền và refusal.
- Ledger hash, double-entry balance và retry.
- Admin guards/audit.
- Wallet hydration, upload UI, citation modal, explorer link, polling cleanup.
- PDA seeds, IDL/program ID, RPC timeout, confirmation và reconciliation.

**Hiện trạng kiểm thử chưa hoàn chỉnh:** danh sách trên là test plan cần có, không có nghĩa tất cả đã chạy đạt. Chưa có bằng chứng đầy đủ về integration test giữa website, backend, database và Solana; chưa có kiểm thử tải, bảo mật upload, khôi phục database, replay worker, browser cross-device và kiểm thử chất lượng RAG định lượng. Cần chạy lint, typecheck, unit/integration tests và frontend build trước release; thêm test backup/restore và worker replay cho production.

## 13. Điểm mạnh, phần còn thiếu và ưu tiên

### Điểm mạnh của website

1. Tầm nhìn sản phẩm rõ.
2. 6-port verification tạo trust boundary.
3. Grounded Tutor có citations.
4. Consensus nâng chất lượng nhãn.
5. Double-entry ledger hỗ trợ audit.
6. Có nền tảng wallet/Anchor/Devnet.
7. Có admin portal và fallback RAG.

### Những phần chưa làm được hoặc mới làm dở

| Phần | Hiện trạng thực tế | Chưa đạt |
|---|---|---|
| Website core | Có dashboard, task, upload, Tutor, ledger và admin để thử nghiệm | Chưa chứng minh production-ready end-to-end |
| 6 cổng kiểm định | UI hiển thị 6 bước; backend có pipeline liên quan | Một số bước còn phụ thuộc rule/backend cần hardening, chưa có bộ test an toàn đầy đủ |
| Consensus | Có vote, confidence, peer result và reward flow | Chưa hoàn thiện chống collusion, timeout, rollback và idempotency |
| AI Tutor | Có TF-IDF RAG, Gemini tùy chọn, citation và fallback | Chưa đảm bảo chống hallucination 100%, chưa có đánh giá định lượng và secret handling production |
| Reward ledger | Có ledger nội bộ, proof hash và viewer | Chưa đảm bảo double-entry/retry/reconciliation ở mức production |
| Solana | Có Anchor program, wallet adapter, PDA và Devnet UI | Settlement on-chain và RPC reconciliation chưa hoàn tất; có mock fallback |
| Database | SQLite chạy local, có migration | Chưa chuyển và kiểm chứng PostgreSQL production |
| Security | Có Argon2, session, TOTP/guards | Chưa hoàn thiện toàn bộ CORS/CSRF/rate-limit/secret/upload hardening |
| Testing | Có test plan và một số cấu trúc test | Chưa có chứng cứ toàn bộ unit/integration/load/security test đã pass |
| Deployment | Có Docker/Render/script local | Chưa có quy trình production web được xác minh đầy đủ |

### Ưu tiên

| Mức | Việc | Lý do |
|---|---|---|
| P0 | Solana settlement + RPC reconciliation | Không tuyên bố proof khi chưa xác nhận |
| P0 | Ledger idempotency và double-entry validation | Không cộng reward trùng hoặc lệch sổ |
| P0 | Secrets khỏi client/localStorage | Bảo mật key |
| P0 | Upload security và prompt-injection defense | Bề mặt tấn công lớn |
| P1 | PostgreSQL + backup/restore | SQLite không phù hợp production đa instance |
| P1 | Regenerate/pin Anchor IDL | Tránh client-contract mismatch |
| P1 | Grounding/citation evaluation | Kiểm soát hallucination bằng số liệu |
| P2 | SSE/WebSocket và vector store | Scale website tốt hơn |

## 14. Kết luận

UniSynapse hiện là **website full-stack prototype**, không phải mobile app, desktop app hay native application. Website đã có các màn hình và luồng chính để trình diễn chuỗi **đóng góp -> kiểm định -> consensus/RAG -> reward -> proof**.

Tuy nhiên, không nên mô tả các phần đang dở như đã hoàn thành. Đặc biệt, 6 cổng kiểm định hiện có phần hiển thị tiến trình và pipeline backend nhưng cần hardening; AI Tutor có citation nhưng chưa được chứng minh không hallucination; reward ledger có record nội bộ nhưng chưa hoàn thiện settlement on-chain; Solana mới là Devnet integration; SQLite, mock fallback, localStorage key và test coverage chưa phù hợp production.

Bước tiếp theo nên ưu tiên hoàn thiện backend và vận hành cho website: ledger idempotency, PostgreSQL, upload security, citation evaluation, secrets management và Solana settlement/reconciliation. Chỉ sau khi các mục này được kiểm thử đạt mới nên tuyên bố website production-ready.
