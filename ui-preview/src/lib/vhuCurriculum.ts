/**
 * Khối chương trình đào tạo chuyên ngành Công nghệ Thông tin - Đại học Văn Hiến (VHU)
 * Trích xuất từ Google Drive: https://drive.google.com/drive/folders/1f-4eRHZAyDY1mDPLRo4uWsA2i95GjeIZ
 */

export interface CourseSubject {
  code: string;
  name: string;
  icon: string;
  category: "co_so" | "chuyen_nganh" | "chuyen_sau" | "do_an_ky_nang" | "dai_cuong";
  categoryName: string;
  description: string;
}

export const VHU_UNIVERSITY_NAME = "Đại học Văn Hiến (VHU)";

export const VHU_IT_COURSES: CourseSubject[] = [
  {
    code: "VHU_IT101",
    name: "Nhập môn Công nghệ Thông tin",
    icon: "💻",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Tổng quan phần cứng, phần mềm, hệ thống nhị phân, chuẩn đạo đức nghề nghiệp CNTT VHU."
  },
  {
    code: "VHU_DSA",
    name: "Cấu trúc Dữ liệu và Giải thuật",
    icon: "🌳",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Mảng, danh sách liên kết, Stack, Queue, Cây nhị phân, Đồ thị, QuickSort, Dijkstra, độ phức tạp O(n)."
  },
  {
    code: "VHU_OOP",
    name: "Lập trình Hướng đối tượng (OOP)",
    icon: "🧩",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "4 nguyên lý OOP: Đóng gói, Kế thừa, Đa hình, Trừu tượng; Design Patterns & SOLID."
  },
  {
    code: "VHU_CPP",
    name: "Lập trình C++",
    icon: "⚡",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Con trỏ, quản lý bộ nhớ heap/stack, STL vector/map, generic templates C++ hiện đại."
  },
  {
    code: "VHU_JAVA",
    name: "Lập trình Java",
    icon: "☕",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "JVM, Garbage Collection, Java Collections Framework, Đa luồng (Multithreading), JDBC kết nối CSDL."
  },
  {
    code: "VHU_PY",
    name: "Lập trình Python",
    icon: "🐍",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Cú pháp Python chuẩn, xử lý dữ liệu NumPy, Pandas, ứng dụng tự động hóa và AI/ML."
  },
  {
    code: "VHU_WEB",
    name: "Lập trình Web",
    icon: "🌐",
    category: "chuyen_nganh",
    categoryName: "Chuyên ngành CNTT",
    description: "Frontend HTML5/CSS3/JavaScript, React/Next.js, Backend REST API NodeJS/FastAPI, bảo mật CSRF/XSS."
  },
  {
    code: "VHU_DIST",
    name: "Lập trình Phân tán",
    icon: "☁️",
    category: "chuyen_nganh",
    categoryName: "Chuyên ngành CNTT",
    description: "RPC, RMI, Message Queue (Kafka/RabbitMQ), Microservices, định lý CAP và tính nhất quán dữ liệu."
  },
  {
    code: "VHU_DB",
    name: "Cơ sở Dữ liệu",
    icon: "🗄️",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Đại số quan hệ, Chuẩn hóa 1NF/2NF/3NF/BCNF, Truy vấn SQL nâng cao, Index B-Tree, ACID Transactions."
  },
  {
    code: "VHU_OS",
    name: "Hệ điều hành",
    icon: "🖥️",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Process & Thread, Định thời CPU (Round Robin, SRTF), Đồng bộ hóa Mutex/Semaphore, Quản lý bộ nhớ ảo Paging."
  },
  {
    code: "VHU_ARC",
    name: "Kiến trúc Máy tính",
    icon: "⚙️",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Kiến trúc Von Neumann, Tập lệnh RISC/CISC, Pipeline chỉ lệnh, Hệ thống phân cấp bộ nhớ Cache L1/L2/L3."
  },
  {
    code: "VHU_NET",
    name: "Mạng Máy tính",
    icon: "🔌",
    category: "co_so",
    categoryName: "Cơ sở ngành",
    description: "Mô hình OSI 7 tầng & TCP/IP, Chia mạng con Subnetting IPv4/IPv6, Định tuyến OSPF/BGP, Giao thức TCP/UDP."
  },
  {
    code: "VHU_SEC",
    name: "An toàn Mạng và Thông tin",
    icon: "🛡️",
    category: "chuyen_sau",
    categoryName: "Chuyên sâu & Bảo mật",
    description: "Tam giác bảo mật CIA, Mã hóa AES/RSA, Chữ ký số, Phòng chống tấn công SQLi, XSS, DDoS, Tường lửa Firewall."
  },
  {
    code: "VHU_AI",
    name: "Trí tuệ Nhân tạo",
    icon: "🤖",
    category: "chuyen_sau",
    categoryName: "Chuyên sâu & AI",
    description: "Thuật toán tìm kiếm A*, Minimax Alpha-Beta, Mạng nơ-ron học sâu (Deep Learning), Xử lý ngôn ngữ tự nhiên NLP."
  },
  {
    code: "VHU_SAD",
    name: "Phân tích và Thiết kế Hệ thống",
    icon: "📐",
    category: "chuyen_nganh",
    categoryName: "Chuyên ngành CNTT",
    description: "Mô hình hóa UML (Use Case, Class, Sequence), Luồng dữ liệu DFD, Kiến trúc phần mềm theo chuẩn công nghiệp."
  },
  {
    code: "VHU_ALGO",
    name: "Phân tích và Thiết kế Thuật toán",
    icon: "🧠",
    category: "chuyen_nganh",
    categoryName: "Chuyên ngành CNTT",
    description: "Chia để trị (Divide & Conquer), Quy hoạch động (Dynamic Programming), Thuật toán tham lam (Greedy), NP-Complete."
  },
  {
    code: "VHU_PROJ",
    name: "Đồ án Chuyên ngành & Tốt nghiệp CNTT",
    icon: "🎓",
    category: "do_an_ky_nang",
    categoryName: "Đồ án & Tốt nghiệp",
    description: "Quy trình phát triển đồ án Agile/Scrum, kiểm thử tự động, triển khai CI/CD, chuẩn bị hồ sơ bảo vệ tại Hội đồng VHU."
  },
  {
    code: "VHU_SOFT",
    name: "Kỹ năng mềm sinh viên CNTT",
    icon: "🤝",
    category: "do_an_ky_nang",
    categoryName: "Kỹ năng mềm",
    description: "Giao tiếp thuyết trình kỹ thuật, làm việc nhóm Git/Jira, quản lý thời gian, đạo đức kỹ sư công nghệ Văn Hiến."
  },
  {
    code: "VHU_GEN",
    name: "Môn Đại cương VHU (Triết học, PLĐC, VHVN)",
    icon: "📕",
    category: "dai_cuong",
    categoryName: "Khối Đại cương",
    description: "Triết học Mác-Lênin, Pháp luật đại cương, Cơ sở văn hóa Việt Nam và bản sắc văn hóa Văn Hiến."
  },
];

export const VHU_SAMPLE_QUESTIONS: Record<string, string[]> = {
  ALL: [
    "Sinh viên CNTT Đại học Văn Hiến (VHU) được trang bị những khối kiến thức nào?",
    "Các nguyên lý cốt lõi của Lập trình Hướng đối tượng (OOP) theo giáo trình VHU?",
    "Sinh viên VHU học Cấu trúc Dữ liệu và Giải thuật cần nắm vững những cấu trúc nào?",
    "Quy trình thực hiện Đồ án chuyên ngành & Tốt nghiệp CNTT tại Đại học Văn Hiến?",
  ],
  VHU_IT101: [
    "Hệ thống máy tính bao gồm các thành phần phần cứng và phần mềm nào?",
    "Đạo đức nghề nghiệp của kỹ sư công nghệ thông tin Văn Hiến gồm những nguyên tắc nào?",
  ],
  VHU_DSA: [
    "Cấu trúc Cây nhị phân tìm kiếm (BST) và AVL tại VHU có độ phức tạp tìm kiếm là bao nhiêu?",
    "Khi nào sinh viên nên dùng Danh sách liên kết thay vì Mảng tĩnh?",
    "Giải thuật QuickSort hoạt động như thế nào và độ phức tạp trung bình là gì?",
  ],
  VHU_OOP: [
    "Giải thích 4 tính chất OOP: Đóng gói, Kế thừa, Đa hình, Trừu tượng kèm ví dụ?",
    "Sự khác nhau giữa Overloading và Overriding trong lập trình hướng đối tượng?",
  ],
  VHU_CPP: [
    "Con trỏ (pointers) và quản lý bộ nhớ động malloc/free và new/delete trong C++?",
    "Sự khác biệt giữa con trỏ (pointer) và tham chiếu (reference) trong C++?",
  ],
  VHU_JAVA: [
    "Cơ chế Garbage Collection và Java Virtual Machine (JVM) vận hành như thế nào?",
    "Sự khác biệt giữa interface và abstract class trong ngôn ngữ Java?",
  ],
  VHU_PY: [
    "Ưu điểm của ngôn ngữ Python và các thư viện cốt lõi cho phân tích dữ liệu và AI?",
    "Kiểu dữ liệu List và Tuple trong Python khác nhau như thế nào?",
  ],
  VHU_WEB: [
    "Mô hình RESTful API và các phương thức GET, POST, PUT, DELETE chuẩn?",
    "Sự khác biệt giữa Client-side Rendering (CSR) và Server-side Rendering (SSR)?",
  ],
  VHU_DIST: [
    "Định lý CAP (Consistency, Availability, Partition Tolerance) trong hệ thống phân tán?",
    "Cơ chế Message Queue (Kafka/RabbitMQ) giải quyết bài toán tải lớn như thế nào?",
  ],
  VHU_DB: [
    "Chuẩn hóa cơ sở dữ liệu 1NF, 2NF, 3NF và BCNF mục đích để làm gì?",
    "Thuộc tính ACID trong giao dịch cơ sở dữ liệu quan hệ có ý nghĩa gì?",
  ],
  VHU_OS: [
    "Sự khác biệt giữa Process và Thread trong hệ điều hành?",
    "Cơ chế điều phối CPU Round Robin hoạt động ra sao và ưu điểm là gì?",
  ],
  VHU_ARC: [
    "Kiến trúc máy tính Von Neumann gồm những thành phần cơ bản nào?",
    "Hệ thống phân cấp bộ nhớ máy tính từ Registers đến Ổ đĩa hoạt động ra sao?",
  ],
  VHU_NET: [
    "Mô hình OSI 7 tầng và so sánh với mô hình TCP/IP 4 tầng?",
    "Sự khác biệt giữa hai giao thức TCP (tin cậy) và UDP (tốc độ cao)?",
  ],
  VHU_SEC: [
    "Mô hình bảo mật CIA (Confidentiality, Integrity, Availability) là gì?",
    "Các phương pháp phòng chống tấn công SQL Injection và Cross-Site Scripting (XSS)?",
  ],
  VHU_AI: [
    "Thuật toán tìm kiếm A* sử dụng hàm Heuristic như thế nào để tìm đường đi ngắn nhất?",
    "Khái niệm Overfitting trong huấn luyện Machine Learning và cách khắc phục?",
  ],
  VHU_SAD: [
    "Các loại biểu đồ UML quan trọng trong thiết kế hệ thống phần mềm?",
    "Sự khác nhau giữa Phân tích chức năng và Thiết kế kiến trúc hệ thống?",
  ],
  VHU_ALGO: [
    "Phương pháp Quy hoạch động (Dynamic Programming) áp dụng khi bài toán thỏa mãn điều kiện gì?",
    "Độ phức tạp thuật toán O(n log n) so với O(n^2) biểu thị điều gì?",
  ],
  VHU_PROJ: [
    "Quy trình bảo vệ Đồ án tốt nghiệp và nộp báo cáo chuyên ngành CNTT tại VHU?",
    "Tiêu chí chấm điểm và đánh giá đề tài đồ án tốt nghiệp sinh viên VHU?",
  ],
  VHU_SOFT: [
    "Kỹ năng làm việc nhóm và sử dụng Git/GitHub hiệu quả trong dự án phần mềm?",
    "Kỹ năng thuyết trình bảo vệ đề tài trước hội đồng giảng viên Văn Hiến?",
  ],
  VHU_GEN: [
    "Quy luật thống nhất và đấu tranh giữa các mặt đối lập trong Triết học Mác-Lênin?",
    "Đặc trưng của văn hóa ứng xử truyền thống Việt Nam và triết lý giáo dục Văn Hiến?",
  ],
};
