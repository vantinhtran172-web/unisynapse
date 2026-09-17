"""Idempotently seed safe demo tasks and learning documents."""
from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path

from backend.core.config import UPLOADS_DIR
from backend.core.database import get_db
from backend.services.rag_service import RAGService

DEMO_USER_ID = "demo_student_unisynapse"

TASKS = [
    {"id": "demo_task_sentiment_cs101", "title": "Phân loại cảm xúc phản hồi bài giảng CS101", "description": "Xác định cảm xúc chính của phản hồi sinh viên về bài giảng lập trình C.", "category": "Sentiment Analysis", "input_text": "Phần giải thích con trỏ khá rõ, nhưng em cần thêm ví dụ về cấp phát và giải phóng bộ nhớ.", "labels": ["positive", "neutral", "negative"], "gold_label": "neutral", "reward_points": 10},
    {"id": "demo_task_bfs_quality", "title": "Đánh giá chất lượng giải thích thuật toán BFS", "description": "Kiểm tra câu trả lời có chính xác, đủ ý và dễ hiểu hay không.", "category": "Quality Evaluation", "input_text": "BFS duyệt đồ thị theo từng lớp, dùng hàng đợi và đánh dấu đỉnh khi đưa vào hàng đợi.", "labels": ["clear", "unclear", "inaccurate"], "gold_label": "clear", "reward_points": 15},
    {"id": "demo_task_data_structure", "title": "Nhận diện chủ đề cấu trúc dữ liệu", "description": "Chọn chủ đề phù hợp nhất cho bài toán.", "category": "Topic Classification", "input_text": "Thiết kế cấu trúc dữ liệu hỗ trợ cập nhật một phần tử và tính tổng đoạn [L, R] trong O(log N).", "labels": ["Segment Tree / Fenwick", "Dynamic Programming", "Graph Theory"], "gold_label": "Segment Tree / Fenwick", "reward_points": 12},
    {"id": "demo_task_pointer_correctness", "title": "Kiểm tra mã C dùng con trỏ", "description": "Phát hiện lỗi quản lý bộ nhớ trong đoạn mã C.", "category": "Code Review", "input_text": "Đoạn mã cấp phát bằng malloc nhưng không gọi free sau khi sử dụng.", "labels": ["memory leak", "safe", "undefined behavior"], "gold_label": "memory leak", "reward_points": 18},
    {"id": "demo_task_algorithm_complexity", "title": "Phân loại độ phức tạp thuật toán", "description": "Chọn độ phức tạp thời gian phù hợp.", "category": "Algorithm Analysis", "input_text": "Một vòng lặp duyệt qua N phần tử và mỗi phần tử thực hiện thao tác hằng số.", "labels": ["O(1)", "O(log N)", "O(N)", "O(N²)"], "gold_label": "O(N)", "reward_points": 10},
    {"id": "demo_task_pseudocode_logic", "title": "Đánh giá mã giả tìm phần tử lớn nhất", "description": "Xác định mã giả có xử lý đúng mảng số nguyên không.", "category": "Logic Verification", "input_text": "Khởi tạo max bằng phần tử đầu tiên rồi cập nhật khi gặp giá trị lớn hơn.", "labels": ["correct", "incomplete", "incorrect"], "gold_label": "correct", "reward_points": 14},
    {"id": "demo_task_python_types", "title": "Nhận diện kiểu dữ liệu Python", "description": "Phân loại kiểu dữ liệu của biểu thức Python.", "category": "Programming Basics", "input_text": "Biểu thức [1, 2, 3] trong Python thuộc kiểu dữ liệu nào?", "labels": ["list", "tuple", "set"], "gold_label": "list", "reward_points": 8},
    {"id": "demo_task_sql_join", "title": "Chọn loại JOIN SQL phù hợp", "description": "Chọn phép nối giữ lại toàn bộ bản ghi bên trái.", "category": "Database", "input_text": "Cần lấy tất cả sinh viên kể cả người chưa có bài nộp.", "labels": ["INNER JOIN", "LEFT JOIN", "CROSS JOIN"], "gold_label": "LEFT JOIN", "reward_points": 12},
    {"id": "demo_task_http_status", "title": "Phân loại mã trạng thái HTTP", "description": "Xác định nhóm mã phản hồi HTTP.", "category": "Web Development", "input_text": "Mã trạng thái 404 cho biết tài nguyên được yêu cầu không tồn tại.", "labels": ["correct", "incorrect", "incomplete"], "gold_label": "correct", "reward_points": 9},
    {"id": "demo_task_git_branch", "title": "Đánh giá quy trình Git branch", "description": "Kiểm tra thao tác làm việc với nhánh Git.", "category": "Developer Tools", "input_text": "Tạo nhánh riêng trước khi phát triển tính năng mới giúp giảm ảnh hưởng đến main.", "labels": ["best practice", "risky", "unrelated"], "gold_label": "best practice", "reward_points": 10},
    {"id": "demo_task_recursion", "title": "Nhận diện điều kiện dừng đệ quy", "description": "Kiểm tra hàm đệ quy có điều kiện cơ sở hay chưa.", "category": "Algorithms", "input_text": "Một hàm gọi lại chính nó nhưng không có điều kiện dừng sẽ gây tràn ngăn xếp.", "labels": ["true", "false", "uncertain"], "gold_label": "true", "reward_points": 11},
    {"id": "demo_task_stack_queue", "title": "Phân biệt Stack và Queue", "description": "Chọn cấu trúc theo nguyên tắc hoạt động.", "category": "Data Structures", "input_text": "Cấu trúc hoạt động theo nguyên tắc vào trước ra trước là gì?", "labels": ["Stack", "Queue", "Heap"], "gold_label": "Queue", "reward_points": 10},
    {"id": "demo_task_binary_search", "title": "Kiểm tra điều kiện tìm kiếm nhị phân", "description": "Xác định điều kiện cần trước khi dùng binary search.", "category": "Algorithms", "input_text": "Tìm kiếm nhị phân hiệu quả nhất khi dữ liệu đã được sắp xếp.", "labels": ["true", "false", "depends"], "gold_label": "true", "reward_points": 12},
    {"id": "demo_task_normalization", "title": "Đánh giá chuẩn hóa dữ liệu", "description": "Nhận diện mục tiêu của normalization trong cơ sở dữ liệu.", "category": "Database", "input_text": "Chuẩn hóa giúp giảm dư thừa dữ liệu và hạn chế bất thường khi cập nhật.", "labels": ["accurate", "inaccurate", "partial"], "gold_label": "accurate", "reward_points": 13},
    {"id": "demo_task_api_auth", "title": "Kiểm tra bảo mật API", "description": "Đánh giá việc yêu cầu xác thực cho endpoint riêng tư.", "category": "Cybersecurity", "input_text": "Endpoint quản trị nên yêu cầu session hoặc token hợp lệ trước khi trả dữ liệu.", "labels": ["secure", "unsafe", "not applicable"], "gold_label": "secure", "reward_points": 16},
    {"id": "demo_task_password_hash", "title": "Phân loại cách lưu mật khẩu", "description": "Chọn phương pháp lưu mật khẩu an toàn.", "category": "Cybersecurity", "input_text": "Mật khẩu nên được băm bằng Argon2 hoặc thuật toán thích hợp thay vì lưu plaintext.", "labels": ["secure", "insecure", "unclear"], "gold_label": "secure", "reward_points": 17},
    {"id": "demo_task_json_schema", "title": "Đánh giá payload JSON", "description": "Kiểm tra payload có trường bắt buộc hay không.", "category": "Web APIs", "input_text": "Request tạo task cần có title và nội dung câu hỏi để backend xử lý.", "labels": ["valid", "invalid", "needs review"], "gold_label": "valid", "reward_points": 9},
    {"id": "demo_task_unit_test", "title": "Nhận diện mục tiêu unit test", "description": "Chọn phát biểu đúng về kiểm thử đơn vị.", "category": "Software Testing", "input_text": "Unit test tập trung kiểm tra một hàm hoặc một đơn vị logic nhỏ trong isolation.", "labels": ["correct", "incorrect", "ambiguous"], "gold_label": "correct", "reward_points": 11},
    {"id": "demo_task_ci_pipeline", "title": "Đánh giá pipeline CI", "description": "Kiểm tra thứ tự cơ bản của pipeline tích hợp liên tục.", "category": "DevOps", "input_text": "Pipeline nên chạy lint và test trước khi cho phép build hoặc deploy.", "labels": ["recommended", "risky", "unnecessary"], "gold_label": "recommended", "reward_points": 13},
    {"id": "demo_task_docker_image", "title": "Phân loại lợi ích Docker image", "description": "Chọn lợi ích của việc đóng gói bằng container.", "category": "DevOps", "input_text": "Docker giúp đóng gói ứng dụng cùng dependency để môi trường chạy nhất quán hơn.", "labels": ["true", "false", "partly true"], "gold_label": "true", "reward_points": 12},
    {"id": "demo_task_react_state", "title": "Kiểm tra trạng thái React", "description": "Đánh giá cách cập nhật state trong component.", "category": "Frontend", "input_text": "Không nên mutate trực tiếp state; nên dùng setter hoặc tạo giá trị mới.", "labels": ["best practice", "bad practice", "depends"], "gold_label": "best practice", "reward_points": 12},
    {"id": "demo_task_css_responsive", "title": "Đánh giá thiết kế responsive", "description": "Chọn giải pháp tránh overflow trên mobile.", "category": "Frontend", "input_text": "Dùng max-width: 100% và kiểm soát overflow giúp layout thích ứng màn hình nhỏ.", "labels": ["effective", "ineffective", "dangerous"], "gold_label": "effective", "reward_points": 10},
    {"id": "demo_task_accessibility", "title": "Kiểm tra khả năng tiếp cận giao diện", "description": "Nhận diện một thực hành accessibility đúng.", "category": "UX Accessibility", "input_text": "Nút tương tác nên có tên dễ hiểu và trạng thái focus nhìn thấy được.", "labels": ["accessible", "inaccessible", "optional only"], "gold_label": "accessible", "reward_points": 13},
    {"id": "demo_task_rag_citation", "title": "Đánh giá citation trong RAG", "description": "Kiểm tra câu trả lời có nguồn học liệu phù hợp.", "category": "AI Evaluation", "input_text": "Câu trả lời grounded nên hiển thị tài liệu và vị trí đoạn trích dùng làm căn cứ.", "labels": ["grounded", "ungrounded", "fabricated"], "gold_label": "grounded", "reward_points": 16},
    {"id": "demo_task_prompt_context", "title": "Phân loại vai trò context trong AI", "description": "Nhận diện tác dụng của context khi hỏi AI.", "category": "AI Literacy", "input_text": "Context liên quan giúp mô hình trả lời sát tài liệu và giảm suy đoán ngoài phạm vi.", "labels": ["accurate", "inaccurate", "unrelated"], "gold_label": "accurate", "reward_points": 12},
    {"id": "demo_task_privacy_pii", "title": "Nhận diện dữ liệu cá nhân PII", "description": "Đánh giá nội dung có chứa thông tin nhận dạng cá nhân không.", "category": "Data Privacy", "input_text": "Email cá nhân và số điện thoại có thể là dữ liệu cần bảo vệ khi đưa vào kho học liệu.", "labels": ["PII", "non-PII", "requires review"], "gold_label": "PII", "reward_points": 15},
    {"id": "demo_task_hash_integrity", "title": "Kiểm tra vai trò checksum", "description": "Chọn mục đích của SHA-256 checksum.", "category": "Data Integrity", "input_text": "Checksum giúp phát hiện nội dung thay đổi và hỗ trợ kiểm tra tài liệu trùng lặp.", "labels": ["integrity", "encryption", "authentication only"], "gold_label": "integrity", "reward_points": 14},
    {"id": "demo_task_solana_devnet", "title": "Phân biệt Solana Devnet và Mainnet", "description": "Đánh giá môi trường blockchain dùng cho thử nghiệm.", "category": "Blockchain", "input_text": "Devnet phù hợp thử nghiệm vì token không có giá trị như tài sản trên mainnet.", "labels": ["correct", "incorrect", "needs context"], "gold_label": "correct", "reward_points": 15},
    {"id": "demo_task_transaction_proof", "title": "Kiểm tra bằng chứng giao dịch", "description": "Đánh giá điều kiện xác minh proof.", "category": "Blockchain", "input_text": "Backend nên xác minh signature từ RPC trước khi đánh dấu proof là verified.", "labels": ["secure", "unsafe", "not enough information"], "gold_label": "secure", "reward_points": 17},
    {"id": "demo_task_sql_index", "title": "Nhận diện lợi ích database index", "description": "Chọn tác dụng chính của index.", "category": "Database", "input_text": "Index có thể tăng tốc truy vấn lọc nhưng làm tăng chi phí ghi và sử dụng bộ nhớ.", "labels": ["balanced", "always free", "incorrect"], "gold_label": "balanced", "reward_points": 13},
    {"id": "demo_task_error_handling", "title": "Đánh giá xử lý lỗi API", "description": "Kiểm tra phản hồi lỗi có hữu ích cho client hay không.", "category": "Backend Engineering", "input_text": "API nên trả status code phù hợp và thông báo lỗi không làm lộ secret nội bộ.", "labels": ["good practice", "bad practice", "incomplete"], "gold_label": "good practice", "reward_points": 14},
    {"id": "demo_task_cache_strategy", "title": "Phân loại chiến lược cache", "description": "Đánh giá khi nào cache cần được invalidation.", "category": "Systems", "input_text": "Cache cần được làm mới khi dữ liệu nguồn thay đổi để tránh trả nội dung cũ.", "labels": ["correct", "incorrect", "context dependent"], "gold_label": "correct", "reward_points": 11},
    {"id": "demo_task_graph_cycle", "title": "Nhận diện chu trình trong đồ thị", "description": "Chọn nhận định phù hợp về phát hiện chu trình.", "category": "Graph Theory", "input_text": "Trong đồ thị vô hướng, DFS có thể dùng tập đỉnh đang thăm để phát hiện cạnh quay về tổ tiên.", "labels": ["correct", "incorrect", "needs context"], "gold_label": "correct", "reward_points": 13},
    {"id": "demo_task_concurrency_race", "title": "Đánh giá hiện tượng race condition", "description": "Nhận diện rủi ro khi nhiều luồng cùng cập nhật dữ liệu.", "category": "Concurrency", "input_text": "Hai luồng cùng tăng một biến dùng chung mà không đồng bộ có thể làm mất cập nhật.", "labels": ["race condition", "safe", "deadlock only"], "gold_label": "race condition", "reward_points": 16},
    {"id": "demo_task_logging_secret", "title": "Kiểm tra an toàn log hệ thống", "description": "Xác định nội dung không nên ghi vào log.", "category": "Operations Security", "input_text": "Access token, mật khẩu và private key không nên xuất hiện trong log production.", "labels": ["safe practice", "unsafe practice", "not relevant"], "gold_label": "safe practice", "reward_points": 15},
    {"id": "demo_task_load_testing", "title": "Đánh giá mục tiêu load testing", "description": "Nhận diện mục tiêu của kiểm thử tải hệ thống.", "category": "Performance", "input_text": "Load testing giúp đo khả năng đáp ứng khi số lượng request đồng thời tăng lên.", "labels": ["correct", "incorrect", "only security testing"], "gold_label": "correct", "reward_points": 13},
]

DOCUMENTS = [
    {
        "id": "demo_doc_c_pointer",
        "title": "UniSynapse Demo - Lập trình C và con trỏ.txt",
        "content": """Con trỏ trong C là biến lưu địa chỉ của một vùng nhớ. Toán tử & lấy địa chỉ của biến, còn toán tử * dùng để truy cập giá trị tại địa chỉ đó. Khi dùng malloc, chương trình cần kiểm tra con trỏ trả về và gọi free khi không còn sử dụng để tránh memory leak. Con trỏ NULL không trỏ tới vùng nhớ hợp lệ và không được dereference.\n\nVí dụ: int *p = malloc(sizeof(int)); if (p != NULL) { *p = 42; free(p); p = NULL; }.\n""",
    },
    {
        "id": "demo_doc_bfs",
        "title": "UniSynapse Demo - Thuật toán BFS.txt",
        "content": """Breadth-First Search (BFS) duyệt đồ thị theo từng lớp bắt đầu từ một đỉnh nguồn. BFS thường dùng queue: đưa đỉnh nguồn vào hàng đợi, lấy từng đỉnh ra, rồi thêm các đỉnh kề chưa thăm. Với đồ thị biểu diễn bằng danh sách kề, độ phức tạp thường là O(V + E), trong đó V là số đỉnh và E là số cạnh. BFS có thể tìm đường đi ngắn nhất trên đồ thị không trọng số.\n""",
    },
    {
        "id": "demo_doc_data_structures",
        "title": "UniSynapse Demo - Cấu trúc dữ liệu nền tảng.txt",
        "content": """Fenwick Tree hỗ trợ cập nhật một điểm và tính tổng tiền tố trong O(log N), phù hợp khi cần tính tổng đoạn thông qua hai tổng tiền tố. Segment Tree cũng hỗ trợ truy vấn đoạn và cập nhật điểm trong O(log N), đồng thời có thể mở rộng cho min, max hoặc các phép gộp khác. Việc chọn cấu trúc dữ liệu phụ thuộc vào loại truy vấn, bộ nhớ và yêu cầu cập nhật.\n""",
    },
]


def ensure_demo_user() -> str:
    from backend.core.security import hash_password
    now = time.time()
    demo_pass_hash = hash_password("UniSynapse@2026")
    with get_db() as conn:
        row = conn.execute("SELECT id FROM users WHERE id = ?", (DEMO_USER_ID,)).fetchone()
        if not row:
            conn.execute(
                """INSERT INTO users (id, address, username, password_hash, disabled, unipoints, reputation, role, created_at)
                   VALUES (?, ?, ?, ?, 0, 100, 100, 'student', ?)""",
                (DEMO_USER_ID, "demo-wallet-unisynapse", "demo_student", demo_pass_hash, now),
            )
        else:
            conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (demo_pass_hash, DEMO_USER_ID))

        sv_row = conn.execute("SELECT id FROM users WHERE username = 'sinhvien_demo'").fetchone()
        if not sv_row:
            conn.execute(
                """INSERT INTO users (id, address, username, password_hash, disabled, unipoints, reputation, role, created_at)
                   VALUES (?, ?, 'sinhvien_demo', ?, 0, 150, 120, 'student', ?)""",
                ("usr_demo_sinhvien", "demo-wallet-sinhvien", demo_pass_hash, now),
            )
        else:
            conn.execute("UPDATE users SET password_hash = ? WHERE username = 'sinhvien_demo'", (demo_pass_hash,))
        conn.commit()
    return DEMO_USER_ID


def seed_tasks() -> int:
    inserted = 0
    with get_db() as conn:
        for task in TASKS:
            exists = conn.execute("SELECT id FROM tasks WHERE id = ?", (task["id"],)).fetchone()
            if exists:
                continue
            conn.execute(
                """INSERT INTO tasks (id, title, description, category, input_text, labels,
                   required_votes, consensus_threshold, reward_points, gold_label, status, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, 3, 0.67, ?, ?, 'open', ?)""",
                (
                    task["id"], task["title"], task["description"], task["category"],
                    task["input_text"], json.dumps(task["labels"], ensure_ascii=False),
                    task["reward_points"], task["gold_label"], time.time(),
                ),
            )
            inserted += 1
        conn.commit()
    return inserted


def seed_documents(owner_id: str) -> int:
    inserted = 0
    for doc in DOCUMENTS:
        raw = doc["content"].encode("utf-8")
        checksum = hashlib.sha256(raw).hexdigest()
        with get_db() as conn:
            existing = conn.execute("SELECT id FROM documents WHERE checksum = ?", (checksum,)).fetchone()
            if existing:
                continue
            UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
            filename = f"{doc['id']}.txt"
            (UPLOADS_DIR / filename).write_text(doc["content"], encoding="utf-8")
            now = time.time()
            conn.execute(
                """INSERT INTO documents (id, owner_id, filename, original_name, file_type, size_bytes,
                   checksum, status, mime_check, pii_check, dedupe_check, copyright_check,
                   quality_check, chunk_count, created_at, approved_at)
                   VALUES (?, ?, ?, ?, 'text/plain', ?, ?, 'approved', 'pass', 'pass', 'pass', 'pass',
                   'Demo educational material', 0, ?, ?)""",
                (doc["id"], owner_id, filename, doc["title"], len(raw), checksum, now, now),
            )
            conn.commit()
        RAGService.index_document(doc["id"], doc["title"], UPLOADS_DIR / filename, "text/plain")
        inserted += 1
    return inserted


def main() -> None:
    owner_id = ensure_demo_user()
    task_count = seed_tasks()
    document_count = seed_documents(owner_id)
    try:
        from backend.scripts.seed_vhu_curriculum import seed_vhu_curriculum
        seed_vhu_curriculum()
    except Exception as err:
        import logging
        logging.getLogger("uvicorn.error").warning("VHU curriculum seed failed: %s", err)
    print(f"Seed complete: {task_count} tasks inserted, {document_count} documents inserted.")


if __name__ == "__main__":
    main()
