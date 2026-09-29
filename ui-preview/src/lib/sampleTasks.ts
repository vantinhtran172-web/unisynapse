// 44 Standardized Labeling Tasks extracted from local database
export interface TaskItemData {
  id: string;
  title: string;
  description: string;
  category: string;
  domain?: string;
  input_text: string;
  context_snippet?: string;
  labels: string[];
  options?: string[];
  required_votes: number;
  consensus_threshold: number;
  reward_points: number;
  gold_label?: string;
  status: string;
  total_submissions?: number;
  created_at?: number;
  solana_tx?: string;
}

export const sampleTasks: TaskItemData[] = [
  {
    "id": "task_101",
    "title": "Phân loại phản hồi bài giảng CS101",
    "description": "Gán nhãn cảm xúc và tính hữu ích từ đánh giá của sinh viên về bài giảng Con trỏ (Pointers) và Cấp phát động.",
    "category": "Sentiment Analysis",
    "domain": "Sentiment Analysis",
    "input_text": "The explanation of pointers in the recent lecture notes was confusing and lacked practical memory-leak examples.",
    "context_snippet": "Trích tài liệu học phần Sentiment Analysis",
    "labels": [
      "neutral",
      "positive",
      "negative"
    ],
    "options": [
      "neutral",
      "positive",
      "negative"
    ],
    "required_votes": 5,
    "consensus_threshold": 0.8,
    "reward_points": 10,
    "gold_label": "negative",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789266252,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "task_102",
    "title": "Đánh giá độ rõ ràng của giải thích thuật toán BFS",
    "description": "Kiểm tra câu trả lời của AI giải thích thuật toán Tìm kiếm theo chiều rộng (BFS) có chính xác và dễ hiểu không.",
    "category": "Quality Evaluation",
    "domain": "Quality Evaluation",
    "input_text": "Thuật toán BFS duyệt cây theo từng tầng bằng cách sử dụng hàng đợi (Queue). Đỉnh bắt đầu được đưa vào hàng đợi trước, sau đó lần lượt lấy từng đỉnh ra và thêm các đỉnh kề chưa duyệt vào hàng đợi.",
    "context_snippet": "Trích tài liệu học phần Quality Evaluation",
    "labels": [
      "clear",
      "unclear",
      "inaccurate"
    ],
    "options": [
      "clear",
      "unclear",
      "inaccurate"
    ],
    "required_votes": 4,
    "consensus_threshold": 0.75,
    "reward_points": 15,
    "gold_label": "clear",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789266253,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "task_103",
    "title": "Phân loại dạng bài tập Cấu trúc dữ liệu",
    "description": "Gán nhãn thể loại bài toán để hệ thống gợi ý bài tập tương ứng cho sinh viên ôn thi.",
    "category": "Topic Classification",
    "domain": "Topic Classification",
    "input_text": "Cho một mảng số nguyên A gồm N phần tử. Hãy thiết kế cấu trúc dữ liệu cho phép cập nhật một phần tử và tính tổng một đoạn [L, R] với độ phức tạp O(log N).",
    "context_snippet": "Trích tài liệu học phần Topic Classification",
    "labels": [
      "Segment Tree / Fenwick",
      "Dynamic Programming",
      "Graph Theory"
    ],
    "options": [
      "Segment Tree / Fenwick",
      "Dynamic Programming",
      "Graph Theory"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.66,
    "reward_points": 12,
    "gold_label": "Segment Tree / Fenwick",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789266254,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_sentiment_cs101",
    "title": "Phân loại cảm xúc phản hồi bài giảng CS101",
    "description": "Xác định cảm xúc chính của phản hồi sinh viên về bài giảng lập trình C.",
    "category": "Sentiment Analysis",
    "domain": "Sentiment Analysis",
    "input_text": "Phần giải thích con trỏ khá rõ, nhưng em cần thêm ví dụ về cấp phát và giải phóng bộ nhớ.",
    "context_snippet": "Trích tài liệu học phần Sentiment Analysis",
    "labels": [
      "positive",
      "neutral",
      "negative"
    ],
    "options": [
      "positive",
      "neutral",
      "negative"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 10,
    "gold_label": "neutral",
    "status": "completed",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_bfs_quality",
    "title": "Đánh giá chất lượng giải thích thuật toán BFS",
    "description": "Kiểm tra câu trả lời có chính xác, đủ ý và dễ hiểu hay không.",
    "category": "Quality Evaluation",
    "domain": "Quality Evaluation",
    "input_text": "BFS duyệt đồ thị theo từng lớp, dùng hàng đợi và đánh dấu đỉnh khi đưa vào hàng đợi.",
    "context_snippet": "Trích tài liệu học phần Quality Evaluation",
    "labels": [
      "clear",
      "unclear",
      "inaccurate"
    ],
    "options": [
      "clear",
      "unclear",
      "inaccurate"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 15,
    "gold_label": "clear",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_data_structure",
    "title": "Nhận diện chủ đề cấu trúc dữ liệu",
    "description": "Chọn chủ đề phù hợp nhất cho bài toán.",
    "category": "Topic Classification",
    "domain": "Topic Classification",
    "input_text": "Thiết kế cấu trúc dữ liệu hỗ trợ cập nhật một phần tử và tính tổng đoạn [L, R] trong O(log N).",
    "context_snippet": "Trích tài liệu học phần Topic Classification",
    "labels": [
      "Segment Tree / Fenwick",
      "Dynamic Programming",
      "Graph Theory"
    ],
    "options": [
      "Segment Tree / Fenwick",
      "Dynamic Programming",
      "Graph Theory"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 12,
    "gold_label": "Segment Tree / Fenwick",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_pointer_correctness",
    "title": "Kiểm tra mã C dùng con trỏ",
    "description": "Phát hiện lỗi quản lý bộ nhớ trong đoạn mã C.",
    "category": "Code Review",
    "domain": "Code Review",
    "input_text": "Đoạn mã cấp phát bằng malloc nhưng không gọi free sau khi sử dụng.",
    "context_snippet": "Trích tài liệu học phần Code Review",
    "labels": [
      "memory leak",
      "safe",
      "undefined behavior"
    ],
    "options": [
      "memory leak",
      "safe",
      "undefined behavior"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 18,
    "gold_label": "memory leak",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_algorithm_complexity",
    "title": "Phân loại độ phức tạp thuật toán",
    "description": "Chọn độ phức tạp thời gian phù hợp.",
    "category": "Algorithm Analysis",
    "domain": "Algorithm Analysis",
    "input_text": "Một vòng lặp duyệt qua N phần tử và mỗi phần tử thực hiện thao tác hằng số.",
    "context_snippet": "Trích tài liệu học phần Algorithm Analysis",
    "labels": [
      "O(1)",
      "O(log N)",
      "O(N)",
      "O(N²)"
    ],
    "options": [
      "O(1)",
      "O(log N)",
      "O(N)",
      "O(N²)"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 10,
    "gold_label": "O(N)",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_pseudocode_logic",
    "title": "Đánh giá mã giả tìm phần tử lớn nhất",
    "description": "Xác định mã giả có xử lý đúng mảng số nguyên không.",
    "category": "Logic Verification",
    "domain": "Logic Verification",
    "input_text": "Khởi tạo max bằng phần tử đầu tiên rồi cập nhật khi gặp giá trị lớn hơn.",
    "context_snippet": "Trích tài liệu học phần Logic Verification",
    "labels": [
      "correct",
      "incomplete",
      "incorrect"
    ],
    "options": [
      "correct",
      "incomplete",
      "incorrect"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 14,
    "gold_label": "correct",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_python_types",
    "title": "Nhận diện kiểu dữ liệu Python",
    "description": "Phân loại kiểu dữ liệu của biểu thức Python.",
    "category": "Programming Basics",
    "domain": "Programming Basics",
    "input_text": "Biểu thức [1, 2, 3] trong Python thuộc kiểu dữ liệu nào?",
    "context_snippet": "Trích tài liệu học phần Programming Basics",
    "labels": [
      "list",
      "tuple",
      "set"
    ],
    "options": [
      "list",
      "tuple",
      "set"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 8,
    "gold_label": "list",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_sql_join",
    "title": "Chọn loại JOIN SQL phù hợp",
    "description": "Chọn phép nối giữ lại toàn bộ bản ghi bên trái.",
    "category": "Database",
    "domain": "Database",
    "input_text": "Cần lấy tất cả sinh viên kể cả người chưa có bài nộp.",
    "context_snippet": "Trích tài liệu học phần Database",
    "labels": [
      "INNER JOIN",
      "LEFT JOIN",
      "CROSS JOIN"
    ],
    "options": [
      "INNER JOIN",
      "LEFT JOIN",
      "CROSS JOIN"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 12,
    "gold_label": "LEFT JOIN",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_http_status",
    "title": "Phân loại mã trạng thái HTTP",
    "description": "Xác định nhóm mã phản hồi HTTP.",
    "category": "Web Development",
    "domain": "Web Development",
    "input_text": "Mã trạng thái 404 cho biết tài nguyên được yêu cầu không tồn tại.",
    "context_snippet": "Trích tài liệu học phần Web Development",
    "labels": [
      "correct",
      "incorrect",
      "incomplete"
    ],
    "options": [
      "correct",
      "incorrect",
      "incomplete"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 9,
    "gold_label": "correct",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_git_branch",
    "title": "Đánh giá quy trình Git branch",
    "description": "Kiểm tra thao tác làm việc với nhánh Git.",
    "category": "Developer Tools",
    "domain": "Developer Tools",
    "input_text": "Tạo nhánh riêng trước khi phát triển tính năng mới giúp giảm ảnh hưởng đến main.",
    "context_snippet": "Trích tài liệu học phần Developer Tools",
    "labels": [
      "best practice",
      "risky",
      "unrelated"
    ],
    "options": [
      "best practice",
      "risky",
      "unrelated"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 10,
    "gold_label": "best practice",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_recursion",
    "title": "Nhận diện điều kiện dừng đệ quy",
    "description": "Kiểm tra hàm đệ quy có điều kiện cơ sở hay chưa.",
    "category": "Algorithms",
    "domain": "Algorithms",
    "input_text": "Một hàm gọi lại chính nó nhưng không có điều kiện dừng sẽ gây tràn ngăn xếp.",
    "context_snippet": "Trích tài liệu học phần Algorithms",
    "labels": [
      "true",
      "false",
      "uncertain"
    ],
    "options": [
      "true",
      "false",
      "uncertain"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 11,
    "gold_label": "true",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_stack_queue",
    "title": "Phân biệt Stack và Queue",
    "description": "Chọn cấu trúc theo nguyên tắc hoạt động.",
    "category": "Data Structures",
    "domain": "Data Structures",
    "input_text": "Cấu trúc hoạt động theo nguyên tắc vào trước ra trước là gì?",
    "context_snippet": "Trích tài liệu học phần Data Structures",
    "labels": [
      "Stack",
      "Queue",
      "Heap"
    ],
    "options": [
      "Stack",
      "Queue",
      "Heap"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 10,
    "gold_label": "Queue",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_binary_search",
    "title": "Kiểm tra điều kiện tìm kiếm nhị phân",
    "description": "Xác định điều kiện cần trước khi dùng binary search.",
    "category": "Algorithms",
    "domain": "Algorithms",
    "input_text": "Tìm kiếm nhị phân hiệu quả nhất khi dữ liệu đã được sắp xếp.",
    "context_snippet": "Trích tài liệu học phần Algorithms",
    "labels": [
      "true",
      "false",
      "depends"
    ],
    "options": [
      "true",
      "false",
      "depends"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 12,
    "gold_label": "true",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_normalization",
    "title": "Đánh giá chuẩn hóa dữ liệu",
    "description": "Nhận diện mục tiêu của normalization trong cơ sở dữ liệu.",
    "category": "Database",
    "domain": "Database",
    "input_text": "Chuẩn hóa giúp giảm dư thừa dữ liệu và hạn chế bất thường khi cập nhật.",
    "context_snippet": "Trích tài liệu học phần Database",
    "labels": [
      "accurate",
      "inaccurate",
      "partial"
    ],
    "options": [
      "accurate",
      "inaccurate",
      "partial"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 13,
    "gold_label": "accurate",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_api_auth",
    "title": "Kiểm tra bảo mật API",
    "description": "Đánh giá việc yêu cầu xác thực cho endpoint riêng tư.",
    "category": "Cybersecurity",
    "domain": "Cybersecurity",
    "input_text": "Endpoint quản trị nên yêu cầu session hoặc token hợp lệ trước khi trả dữ liệu.",
    "context_snippet": "Trích tài liệu học phần Cybersecurity",
    "labels": [
      "secure",
      "unsafe",
      "not applicable"
    ],
    "options": [
      "secure",
      "unsafe",
      "not applicable"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 16,
    "gold_label": "secure",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_password_hash",
    "title": "Phân loại cách lưu mật khẩu",
    "description": "Chọn phương pháp lưu mật khẩu an toàn.",
    "category": "Cybersecurity",
    "domain": "Cybersecurity",
    "input_text": "Mật khẩu nên được băm bằng Argon2 hoặc thuật toán thích hợp thay vì lưu plaintext.",
    "context_snippet": "Trích tài liệu học phần Cybersecurity",
    "labels": [
      "secure",
      "insecure",
      "unclear"
    ],
    "options": [
      "secure",
      "insecure",
      "unclear"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 17,
    "gold_label": "secure",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_json_schema",
    "title": "Đánh giá payload JSON",
    "description": "Kiểm tra payload có trường bắt buộc hay không.",
    "category": "Web APIs",
    "domain": "Web APIs",
    "input_text": "Request tạo task cần có title và nội dung câu hỏi để backend xử lý.",
    "context_snippet": "Trích tài liệu học phần Web APIs",
    "labels": [
      "valid",
      "invalid",
      "needs review"
    ],
    "options": [
      "valid",
      "invalid",
      "needs review"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 9,
    "gold_label": "valid",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_ci_pipeline",
    "title": "Đánh giá pipeline CI",
    "description": "Kiểm tra thứ tự cơ bản của pipeline tích hợp liên tục.",
    "category": "DevOps",
    "domain": "DevOps",
    "input_text": "Pipeline nên chạy lint và test trước khi cho phép build hoặc deploy.",
    "context_snippet": "Trích tài liệu học phần DevOps",
    "labels": [
      "recommended",
      "risky",
      "unnecessary"
    ],
    "options": [
      "recommended",
      "risky",
      "unnecessary"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 13,
    "gold_label": "recommended",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_docker_image",
    "title": "Phân loại lợi ích Docker image",
    "description": "Chọn lợi ích của việc đóng gói bằng container.",
    "category": "DevOps",
    "domain": "DevOps",
    "input_text": "Docker giúp đóng gói ứng dụng cùng dependency để môi trường chạy nhất quán hơn.",
    "context_snippet": "Trích tài liệu học phần DevOps",
    "labels": [
      "true",
      "false",
      "partly true"
    ],
    "options": [
      "true",
      "false",
      "partly true"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 12,
    "gold_label": "true",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_react_state",
    "title": "Kiểm tra trạng thái React",
    "description": "Đánh giá cách cập nhật state trong component.",
    "category": "Frontend",
    "domain": "Frontend",
    "input_text": "Không nên mutate trực tiếp state; nên dùng setter hoặc tạo giá trị mới.",
    "context_snippet": "Trích tài liệu học phần Frontend",
    "labels": [
      "best practice",
      "bad practice",
      "depends"
    ],
    "options": [
      "best practice",
      "bad practice",
      "depends"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 12,
    "gold_label": "best practice",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_css_responsive",
    "title": "Đánh giá thiết kế responsive",
    "description": "Chọn giải pháp tránh overflow trên mobile.",
    "category": "Frontend",
    "domain": "Frontend",
    "input_text": "Dùng max-width: 100% và kiểm soát overflow giúp layout thích ứng màn hình nhỏ.",
    "context_snippet": "Trích tài liệu học phần Frontend",
    "labels": [
      "effective",
      "ineffective",
      "dangerous"
    ],
    "options": [
      "effective",
      "ineffective",
      "dangerous"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 10,
    "gold_label": "effective",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_accessibility",
    "title": "Kiểm tra khả năng tiếp cận giao diện",
    "description": "Nhận diện một thực hành accessibility đúng.",
    "category": "UX Accessibility",
    "domain": "UX Accessibility",
    "input_text": "Nút tương tác nên có tên dễ hiểu và trạng thái focus nhìn thấy được.",
    "context_snippet": "Trích tài liệu học phần UX Accessibility",
    "labels": [
      "accessible",
      "inaccessible",
      "optional only"
    ],
    "options": [
      "accessible",
      "inaccessible",
      "optional only"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 13,
    "gold_label": "accessible",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_rag_citation",
    "title": "Đánh giá citation trong RAG",
    "description": "Kiểm tra câu trả lời có nguồn học liệu phù hợp.",
    "category": "AI Evaluation",
    "domain": "AI Evaluation",
    "input_text": "Câu trả lời grounded nên hiển thị tài liệu và vị trí đoạn trích dùng làm căn cứ.",
    "context_snippet": "Trích tài liệu học phần AI Evaluation",
    "labels": [
      "grounded",
      "ungrounded",
      "fabricated"
    ],
    "options": [
      "grounded",
      "ungrounded",
      "fabricated"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 16,
    "gold_label": "grounded",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_prompt_context",
    "title": "Phân loại vai trò context trong AI",
    "description": "Nhận diện tác dụng của context khi hỏi AI.",
    "category": "AI Literacy",
    "domain": "AI Literacy",
    "input_text": "Context liên quan giúp mô hình trả lời sát tài liệu và giảm suy đoán ngoài phạm vi.",
    "context_snippet": "Trích tài liệu học phần AI Literacy",
    "labels": [
      "accurate",
      "inaccurate",
      "unrelated"
    ],
    "options": [
      "accurate",
      "inaccurate",
      "unrelated"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 12,
    "gold_label": "accurate",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_privacy_pii",
    "title": "Nhận diện dữ liệu cá nhân PII",
    "description": "Đánh giá nội dung có chứa thông tin nhận dạng cá nhân không.",
    "category": "Data Privacy",
    "domain": "Data Privacy",
    "input_text": "Email cá nhân và số điện thoại có thể là dữ liệu cần bảo vệ khi đưa vào kho học liệu.",
    "context_snippet": "Trích tài liệu học phần Data Privacy",
    "labels": [
      "PII",
      "non-PII",
      "requires review"
    ],
    "options": [
      "PII",
      "non-PII",
      "requires review"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 15,
    "gold_label": "PII",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_hash_integrity",
    "title": "Kiểm tra vai trò checksum",
    "description": "Chọn mục đích của SHA-256 checksum.",
    "category": "Data Integrity",
    "domain": "Data Integrity",
    "input_text": "Checksum giúp phát hiện nội dung thay đổi và hỗ trợ kiểm tra tài liệu trùng lặp.",
    "context_snippet": "Trích tài liệu học phần Data Integrity",
    "labels": [
      "integrity",
      "encryption",
      "authentication only"
    ],
    "options": [
      "integrity",
      "encryption",
      "authentication only"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 14,
    "gold_label": "integrity",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_solana_devnet",
    "title": "Phân biệt Solana Devnet và Mainnet",
    "description": "Đánh giá môi trường blockchain dùng cho thử nghiệm.",
    "category": "Blockchain",
    "domain": "Blockchain",
    "input_text": "Devnet phù hợp thử nghiệm vì token không có giá trị như tài sản trên mainnet.",
    "context_snippet": "Trích tài liệu học phần Blockchain",
    "labels": [
      "correct",
      "incorrect",
      "needs context"
    ],
    "options": [
      "correct",
      "incorrect",
      "needs context"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 15,
    "gold_label": "correct",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_transaction_proof",
    "title": "Kiểm tra bằng chứng giao dịch",
    "description": "Đánh giá điều kiện xác minh proof.",
    "category": "Blockchain",
    "domain": "Blockchain",
    "input_text": "Backend nên xác minh signature từ RPC trước khi đánh dấu proof là verified.",
    "context_snippet": "Trích tài liệu học phần Blockchain",
    "labels": [
      "secure",
      "unsafe",
      "not enough information"
    ],
    "options": [
      "secure",
      "unsafe",
      "not enough information"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 17,
    "gold_label": "secure",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_sql_index",
    "title": "Nhận diện lợi ích database index",
    "description": "Chọn tác dụng chính của index.",
    "category": "Database",
    "domain": "Database",
    "input_text": "Index có thể tăng tốc truy vấn lọc nhưng làm tăng chi phí ghi và sử dụng bộ nhớ.",
    "context_snippet": "Trích tài liệu học phần Database",
    "labels": [
      "balanced",
      "always free",
      "incorrect"
    ],
    "options": [
      "balanced",
      "always free",
      "incorrect"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 13,
    "gold_label": "balanced",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_error_handling",
    "title": "Đánh giá xử lý lỗi API",
    "description": "Kiểm tra phản hồi lỗi có hữu ích cho client hay không.",
    "category": "Backend Engineering",
    "domain": "Backend Engineering",
    "input_text": "API nên trả status code phù hợp và thông báo lỗi không làm lộ secret nội bộ.",
    "context_snippet": "Trích tài liệu học phần Backend Engineering",
    "labels": [
      "good practice",
      "bad practice",
      "incomplete"
    ],
    "options": [
      "good practice",
      "bad practice",
      "incomplete"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 14,
    "gold_label": "good practice",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_cache_strategy",
    "title": "Phân loại chiến lược cache",
    "description": "Đánh giá khi nào cache cần được invalidation.",
    "category": "Systems",
    "domain": "Systems",
    "input_text": "Cache cần được làm mới khi dữ liệu nguồn thay đổi để tránh trả nội dung cũ.",
    "context_snippet": "Trích tài liệu học phần Systems",
    "labels": [
      "correct",
      "incorrect",
      "context dependent"
    ],
    "options": [
      "correct",
      "incorrect",
      "context dependent"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 11,
    "gold_label": "correct",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_graph_cycle",
    "title": "Nhận diện chu trình trong đồ thị",
    "description": "Chọn nhận định phù hợp về phát hiện chu trình.",
    "category": "Graph Theory",
    "domain": "Graph Theory",
    "input_text": "Trong đồ thị vô hướng, DFS có thể dùng tập đỉnh đang thăm để phát hiện cạnh quay về tổ tiên.",
    "context_snippet": "Trích tài liệu học phần Graph Theory",
    "labels": [
      "correct",
      "incorrect",
      "needs context"
    ],
    "options": [
      "correct",
      "incorrect",
      "needs context"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 13,
    "gold_label": "correct",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_concurrency_race",
    "title": "Đánh giá hiện tượng race condition",
    "description": "Nhận diện rủi ro khi nhiều luồng cùng cập nhật dữ liệu.",
    "category": "Concurrency",
    "domain": "Concurrency",
    "input_text": "Hai luồng cùng tăng một biến dùng chung mà không đồng bộ có thể làm mất cập nhật.",
    "context_snippet": "Trích tài liệu học phần Concurrency",
    "labels": [
      "race condition",
      "safe",
      "deadlock only"
    ],
    "options": [
      "race condition",
      "safe",
      "deadlock only"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 16,
    "gold_label": "race condition",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_logging_secret",
    "title": "Kiểm tra an toàn log hệ thống",
    "description": "Xác định nội dung không nên ghi vào log.",
    "category": "Operations Security",
    "domain": "Operations Security",
    "input_text": "Access token, mật khẩu và private key không nên xuất hiện trong log production.",
    "context_snippet": "Trích tài liệu học phần Operations Security",
    "labels": [
      "safe practice",
      "unsafe practice",
      "not relevant"
    ],
    "options": [
      "safe practice",
      "unsafe practice",
      "not relevant"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 15,
    "gold_label": "safe practice",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789441260,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_unit_test",
    "title": "Nhận diện mục tiêu unit test",
    "description": "Chọn phát biểu đúng về kiểm thử đơn vị.",
    "category": "Software Testing",
    "domain": "Software Testing",
    "input_text": "Unit test tập trung kiểm tra một hàm hoặc một đơn vị logic nhỏ trong isolation.",
    "context_snippet": "Trích tài liệu học phần Software Testing",
    "labels": [
      "correct",
      "incorrect",
      "ambiguous"
    ],
    "options": [
      "correct",
      "incorrect",
      "ambiguous"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 11,
    "gold_label": "correct",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789473763,
    "solana_tx": "2TXUUcJ8BzYHP83z5hDHjzJCEV2A2TBqaroK1SZBurVMAKRDirxpfKiSM8LMiXm7DnBULpoy8HQ5wvB4fNtXHZgj"
  },
  {
    "id": "demo_task_load_testing",
    "title": "Đánh giá mục tiêu load testing",
    "description": "Nhận diện mục tiêu của kiểm thử tải hệ thống.",
    "category": "Performance",
    "domain": "Performance",
    "input_text": "Load testing giúp đo khả năng đáp ứng khi số lượng request đồng thời tăng lên.",
    "context_snippet": "Trích tài liệu học phần Performance",
    "labels": [
      "correct",
      "incorrect",
      "only security testing"
    ],
    "options": [
      "correct",
      "incorrect",
      "only security testing"
    ],
    "required_votes": 3,
    "consensus_threshold": 0.67,
    "reward_points": 13,
    "gold_label": "correct",
    "status": "completed",
    "total_submissions": 1,
    "created_at": 1789473763,
    "solana_tx": "4NxZsgYge9thoDvPGnyNRaJhRdFxgQHrimvxkbHGAaR4WzkobfMJ1a7386iZqaRMXQYi8pumGGSnb664fMu1HTe1"
  },
  {
    "id": "task_5976fd0f",
    "title": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "description": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "category": "AI Concept",
    "domain": "AI Concept",
    "input_text": "Thuật toán A* sử dụng hàm đánh giá heuristic để tìm đường tối ưu.",
    "context_snippet": "Trích tài liệu học phần AI Concept",
    "labels": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "options": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "required_votes": 2,
    "consensus_threshold": 0.8,
    "reward_points": 15,
    "gold_label": "",
    "status": "completed",
    "total_submissions": 1,
    "created_at": 1789537474,
    "solana_tx": "3mXiHNS837xVZt1T55gmiWXY2hHjybzKUasEPEDyduhe4g2XKjXEyfVVWdrVyAcYCdTV55NdduCoHrfGFZMdDZv"
  },
  {
    "id": "task_aa1daec8",
    "title": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "description": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "category": "AI Concept",
    "domain": "AI Concept",
    "input_text": "Thuật toán A* sử dụng hàm đánh giá heuristic để tìm đường tối ưu.",
    "context_snippet": "Trích tài liệu học phần AI Concept",
    "labels": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "options": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "required_votes": 2,
    "consensus_threshold": 0.8,
    "reward_points": 15,
    "gold_label": "",
    "status": "completed",
    "total_submissions": 1,
    "created_at": 1789537522,
    "solana_tx": "pYcJMyVBiPptRqo8gRjd49eauiD7rD8dxw2EjUxsVGcJuhGFR1it4CAxrcrh7rxfmLd9aQkrZ1Sj7Tb9kSarbKN"
  },
  {
    "id": "task_b48a82b2",
    "title": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "description": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "category": "AI Concept",
    "domain": "AI Concept",
    "input_text": "Thuật toán A* sử dụng hàm đánh giá heuristic để tìm đường tối ưu.",
    "context_snippet": "Trích tài liệu học phần AI Concept",
    "labels": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "options": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "required_votes": 2,
    "consensus_threshold": 0.8,
    "reward_points": 15,
    "gold_label": "",
    "status": "completed",
    "total_submissions": 1,
    "created_at": 1789537544,
    "solana_tx": "32vfGPejVcEDrTf8AyVsYWirWkiqtnLsg6vt5XvDEY1JSuK9E6LWt571WVNLizZvKQiHgMZ5WpNgjqKNGnPzGRAo"
  },
  {
    "id": "task_f4c9be2e",
    "title": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "description": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "category": "AI Concept",
    "domain": "AI Concept",
    "input_text": "Thuật toán A* sử dụng hàm đánh giá heuristic để tìm đường tối ưu.",
    "context_snippet": "Trích tài liệu học phần AI Concept",
    "labels": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "options": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "required_votes": 2,
    "consensus_threshold": 0.8,
    "reward_points": 15,
    "gold_label": "",
    "status": "open",
    "total_submissions": 1,
    "created_at": 1789537566,
    "solana_tx": "dC6Mgx8xiZfB9vnpVd9vdzFRyDzxePoNs89v66HYnSNffvAnPnvmTcbdwsMrSU2fboCm4pQUVunGDHfU4SDKhqR"
  },
  {
    "id": "task_6891923e",
    "title": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "description": "Phân loại bài giảng môn Trí Tuệ Nhân Tạo",
    "category": "AI Concept",
    "domain": "AI Concept",
    "input_text": "Thuật toán A* sử dụng hàm đánh giá heuristic để tìm đường tối ưu.",
    "context_snippet": "Trích tài liệu học phần AI Concept",
    "labels": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "options": [
      "Chính xác",
      "Sai lệch",
      "Cần bổ sung"
    ],
    "required_votes": 2,
    "consensus_threshold": 0.8,
    "reward_points": 15,
    "gold_label": "",
    "status": "completed",
    "total_submissions": 1,
    "created_at": 1789537638,
    "solana_tx": "3eVZ6asqFc8rRqfeKFAippi1wMhaFum3uFe2c41ujNYyrvorrGmeczuZbLKfJ7PRCZUbPxjgA7xVeN4kPvgjLHjH"
  }
];
