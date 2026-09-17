"""
Script seed dữ liệu giáo trình chuyên ngành CNTT - Trường Đại học Văn Hiến (VHU)
Dựa trên cấu trúc thư mục Google Drive: https://drive.google.com/drive/folders/1f-4eRHZAyDY1mDPLRo4uWsA2i95GjeIZ
"""
import os
import sys
import time
import json
import hashlib
from pathlib import Path

# Setup encoding for Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.core.config import UPLOADS_DIR
from backend.core.database import get_db
from backend.services.rag_service import RAGService, extract_term_frequencies

VHU_COURSES = [
    {
        "code": "VHU_IT101",
        "name": "Nhập môn Công nghệ Thông tin",
        "folder": "NHẬP MÔN CNTT",
        "content": """
GIÁO TRÌNH NHẬP MÔN CÔNG NGHỆ THÔNG TIN - KHOA CÔNG NGHỆ THÔNG TIN - ĐẠI HỌC VĂN HIẾN (VHU)
1. Tổng quan về ngành Công nghệ Thông tin:
Ngành Công nghệ Thông tin (CNTT) tại Trường Đại học Văn Hiến (VHU) trang bị cho sinh viên kiến thức nền tảng về phần cứng, phần mềm, mạng máy tính và hệ thống thông tin.
2. Hệ thống máy tính:
Máy tính bao gồm hai thành phần chính: Phần cứng (Hardware) và Phần mềm (Software).
Phần cứng bao gồm: Khối xử lý trung tâm (CPU), Bộ nhớ chính (RAM, ROM), Thiết bị lưu trữ ngoài (HDD, SSD), Thiết bị vào (bàn phím, chuột) và Thiết bị ra (màn hình, máy in).
3. Biểu diễn dữ liệu:
Máy tính xử lý dữ liệu dưới dạng nhị phân (Binary: 0 và 1). Đơn vị nhỏ nhất là bit. 1 Byte = 8 bits.
4. Đạo đức nghề nghiệp kỹ sư phần mềm:
Sinh viên CNTT Văn Hiến phải tuân thủ nghiêm ngặt quyền sở hữu trí tuệ, an toàn thông tin và đạo đức chuyên môn trong kỷ nguyên số.
        """.strip()
    },
    {
        "code": "VHU_DSA",
        "name": "Cấu trúc Dữ liệu và Giải thuật",
        "folder": "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT",
        "content": """
GIÁO TRÌNH CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT - KHOA CNTT ĐẠI HỌC VĂN HIẾN (VHU)
Chương 1: Khái niệm cấu trúc dữ liệu và giải thuật.
Cấu trúc dữ liệu là cách tổ chức, quản lý và lưu trữ dữ liệu để truy xuất và sửa đổi hiệu quả.
Độ phức tạp thuật toán được đánh giá bằng Big-O Notation (O(1), O(log n), O(n), O(n log n), O(n^2)).
Chương 2: Danh sách tuyến tính.
- Danh sách liên kết đơn (Singly Linked List): Mỗi nút chứa dữ liệu và một con trỏ trỏ tới nút kế tiếp.
- Ngăn xếp (Stack): Hoạt động theo cơ chế LIFO (Last In First Out), thao tác chính: push() và pop().
- Hàng đợi (Queue): Hoạt động theo cơ chế FIFO (First In First Out), thao tác chính: enqueue() và dequeue().
Chương 3: Cây và Đồ thị.
- Cây nhị phân tìm kiếm (Binary Search Tree - BST): Nút con trái nhỏ hơn nút cha, nút con phải lớn hơn nút cha. Thời gian tìm kiếm trung bình O(log n).
- Bảng băm (Hash Table): Ánh xạ khóa thành chỉ số mảng bằng hàm băm (Hash function), giải quyết đụng độ bằng Chaining hoặc Open Addressing.
Chương 4: Thuật toán sắp xếp và tìm kiếm.
- QuickSort và MergeSort có độ phức tạp O(n log n). Tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp có độ phức tạp O(log n).
        """.strip()
    },
    {
        "code": "VHU_OOP",
        "name": "Lập trình Hướng đối tượng (OOP)",
        "folder": "LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG",
        "content": """
GIÁO TRÌNH LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP) - ĐẠI HỌC VĂN HIẾN (VHU)
Chương 1: 4 Trụ cột của Lập trình Hướng đối tượng.
1. Đóng gói (Encapsulation): Che giấu thông tin nội bộ của đối tượng và chỉ cho phép truy xuất qua các phương thức getter/setter với access modifier (private, protected, public).
2. Kế thừa (Inheritance): Cho phép lớp con (subclass) tái sử dụng thuộc tính và phương thức của lớp cha (superclass), tăng tính tái sử dụng mã nguồn.
3. Đa hình (Polymorphism): Cho phép một hành vi có nhiều biểu hiện khác nhau. Gồm đa hình tĩnh (Overloading) và đa hình động (Overriding qua phương thức ảo).
4. Trừu tượng (Abstraction): Tập trung vào tính năng cốt lõi của đối tượng và ẩn đi chi tiết cài đặt phức tạp thông qua Abstract Class và Interface.
Chương 2: Constructor, Destructor và Quản lý vòng đời đối tượng.
Hàm dựng (Constructor) được gọi tự động khi khởi tạo đối tượng, dùng để gán giá trị mặc định cho thuộc tính.
        """.strip()
    },
    {
        "code": "VHU_CPP",
        "name": "Lập trình C++",
        "folder": "LẬP TRÌNH C++",
        "content": """
GIÁO TRÌNH LẬP TRÌNH C++ CHUYÊN SÂU - KHOA CNTT ĐẠI HỌC VĂN HIẾN (VHU)
1. Con trỏ và Quản lý bộ nhớ:
Trong C++, con trỏ lưu trữ địa chỉ của biến khác. Sử dụng toán tử & để lấy địa chỉ và toán tử * để truy xuất giá trị tại địa chỉ.
Cấp phát bộ nhớ động trên vùng nhớ Heap bằng toán tử `new` và giải phóng bằng `delete` hoặc `delete[]` để tránh rò rỉ bộ nhớ (Memory Leak).
2. Con trỏ thông minh (Smart Pointers trong C++11 trở lên):
- std::unique_ptr: Sở hữu độc quyền vùng nhớ, tự giải phóng khi ra khỏi phạm vi.
- std::shared_ptr: Quản lý bộ nhớ bằng cơ chế đếm tham chiếu (Reference Counting).
3. Thư viện chuẩn STL (Standard Template Library):
Cung cấp các cấu trúc dữ liệu tối ưu: std::vector, std::map, std::set, std::queue, std::priority_queue, std::stack và các thuật toán trong `<algorithm>`.
        """.strip()
    },
    {
        "code": "VHU_JAVA",
        "name": "Lập trình Java",
        "folder": "LẬP TRÌNH JAVA",
        "content": """
GIÁO TRÌNH LẬP TRÌNH JAVA CĂN BẢN VÀ NÂNG CAO - ĐẠI HỌC VĂN HIẾN (VHU)
1. Nền tảng Java và Máy ảo JVM:
Java biên dịch mã nguồn thành Bytecode (.class) chạy trên máy ảo Java (JVM) theo triết lý "Write Once, Run Anywhere".
2. Thu gom rác tự động (Garbage Collection):
JVM tự động dọn dẹp các đối tượng không còn tham chiếu trên vùng nhớ Heap, giúp lập trình viên giảm thiểu lỗi bộ nhớ.
3. Java Collections Framework:
- List: ArrayList, LinkedList (cho phép trùng lặp, duy trì thứ tự).
- Set: HashSet, TreeSet (không trùng lặp, tập hợp duy nhất).
- Map: HashMap, TreeMap (lưu trữ cặp khóa - giá trị Key-Value).
4. Xử lý ngoại lệ (Exception Handling):
Sử dụng khối `try - catch - finally` để bắt các ngoại lệ Checked Exception và Unchecked Exception (RuntimeException).
        """.strip()
    },
    {
        "code": "VHU_PY",
        "name": "Lập trình Python",
        "folder": "LẬP TRÌNH PYTHON",
        "content": """
GIÁO TRÌNH LẬP TRÌNH PYTHON - ĐẠI HỌC VĂN HIẾN (VHU)
1. Kiểu dữ liệu và Cú pháp:
Python là ngôn ngữ thông dịch, kiểu dữ liệu động. Hỗ trợ các kiểu cấu trúc: list, tuple (bất biến), dictionary (key-value), set.
2. Hàm nâng cao và List Comprehension:
- List Comprehension: `[x*2 for x in my_list if x > 0]`
- Lambda function: `f = lambda a, b: a + b`
3. Thư viện Khoa học dữ liệu và AI:
- NumPy: Hỗ trợ mảng đa chiều n-dimensional array tối ưu tính toán ma trận.
- Pandas: Thao tác dữ liệu bảng với đối tượng DataFrame và Series.
- Matplotlib / Seaborn: Trực quan hóa dữ liệu biểu đồ.
        """.strip()
    },
    {
        "code": "VHU_WEB",
        "name": "Lập trình Web",
        "folder": "LẬP TRÌNH WEB",
        "content": """
GIÁO TRÌNH PHÁT TRIỂN ỨNG DỤNG WEB - KHOA CNTT ĐẠI HỌC VĂN HIẾN (VHU)
1. Kiến trúc Web và Mô hình Client - Server:
Giao tiếp giữa trình duyệt và máy chủ qua giao thức HTTP/HTTPS với các phương thức GET, POST, PUT, DELETE, PATCH.
2. Frontend Development:
- HTML5: Cấu trúc ngữ nghĩa (semantic tags: header, nav, main, article, section, footer).
- CSS3: Tạo giao diện đáp ứng (Responsive Design) với Flexbox và CSS Grid.
- JavaScript ES6+: Async/Await, Promise, DOM Manipulation, Fetch API.
3. Backend Development & RESTful API:
Xây dựng API RESTful trả dữ liệu chuẩn JSON, xác thực người dùng bằng JSON Web Token (JWT) hoặc Session Cookie.
Bảo mật web: Chống tấn công CSRF (Cross-Site Request Forgery), XSS (Cross-Site Scripting), và CORS configuration.
        """.strip()
    },
    {
        "code": "VHU_DIST",
        "name": "Lập trình Phân tán",
        "folder": "LẬP TRÌNH PHÂN TÁN",
        "content": """
GIÁO TRÌNH LẬP TRÌNH HỆ THỐNG PHÂN TÁN - ĐẠI HỌC VĂN HIẾN (VHU)
1. Khái niệm Hệ thống Phân tán (Distributed Systems):
Tập hợp các máy tính độc lập liên kết qua mạng truyền thông và phối hợp để người dùng nhìn nhận như một hệ thống đơn nhất.
2. Giao tiếp trong Hệ thống Phân tán:
- RPC (Remote Procedure Call) và gRPC dựa trên Protocol Buffers.
- Message Queue / Broker: Hàng đợi bất đồng bộ RabbitMQ, Apache Kafka giúp giải nén tải và đảm bảo tính sẵn sàng cao.
3. Định lý CAP:
Trong một hệ thống phân tán, chỉ có thể đồng thời thỏa mãn tối đa 2 trong 3 yếu tố:
- Consistency (Tính nhất quán dữ liệu)
- Availability (Tính sẵn sàng phục vụ)
- Partition Tolerance (Khả năng chịu đựng phân đoạn mạng)
        """.strip()
    },
    {
        "code": "VHU_DB",
        "name": "Cơ sở Dữ liệu",
        "folder": "CƠ SỞ DỮ LIỆU",
        "content": """
GIÁO TRÌNH CƠ SỞ DỮ LIỆU QUAN HỆ - KHOA CNTT ĐẠI HỌC VĂN HIẾN (VHU)
1. Mô hình Quan hệ và Chuẩn hóa dữ liệu:
- Dạng chuẩn 1NF: Tất cả các thuộc tính phải mang giá trị nguyên tố (nguyên tử), không chứa nhóm lặp.
- Dạng chuẩn 2NF: Đạt 1NF và mọi thuộc tính không khóa phụ thuộc hàm đầy đủ vào khóa chính.
- Dạng chuẩn 3NF: Đạt 2NF và không có thuộc tính không khóa nào phụ thuộc bắc cầu vào khóa chính.
2. Ngôn ngữ SQL (Structured Query Language):
- DDL (Data Definition Language): CREATE, ALTER, DROP.
- DML (Data Manipulation Language): SELECT, INSERT, UPDATE, DELETE.
- Kỹ thuật JOIN: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN.
3. Giao dịch (Transaction) và Thuộc tính ACID:
- Atomicity (Tính nguyên tử): Hoặc thành công toàn bộ, hoặc không làm gì cả.
- Consistency (Tính nhất quán): Dữ liệu luôn đúng theo mọi ràng buộc toàn vẹn.
- Isolation (Tính độc lập): Các giao dịch chạy đồng thời không can thiệp lẫn nhau.
- Durability (Tính bền vững): Dữ liệu đã commit sẽ được lưu trữ vĩnh viễn dù có sự cố điện.
        """.strip()
    },
    {
        "code": "VHU_OS",
        "name": "Hệ điều hành",
        "folder": "HỆ ĐIỀU HÀNH",
        "content": """
GIÁO TRÌNH HỆ ĐIỀU HÀNH - KHOA CNTT ĐẠI HỌC VĂN HIẾN (VHU)
1. Quản lý Tiến trình (Process) và Luồng (Thread):
Tiến trình là một chương trình đang trong quá trình thực thi, sở hữu không gian địa chỉ riêng. Luồng là đơn vị thực thi nhỏ nhất bên trong tiến trình, chia sẻ chung không gian bộ nhớ.
2. Lập lịch CPU:
Các thuật toán điều phối CPU: First-Come, First-Served (FCFS), Shortest Job First (SJF), Round Robin (RR) với lượng tử thời gian Time Quantum.
3. Đồng bộ hóa và Deadlock (Bế tắc):
Sử dụng Mutex và Semaphore để bảo vệ vùng tranh chấp (Critical Section).
Deadlock xảy ra khi thỏa mãn 4 điều kiện Coffman: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Giải thuật Banker dùng để tránh bế tắc.
4. Quản lý Bộ nhớ Ảo (Virtual Memory):
Cơ chế Phân trang (Paging) và Đoạn (Segmentation). Giải thuật thay thế trang: FIFO, LRU (Least Recently Used), Optimal.
        """.strip()
    },
    {
        "code": "VHU_ARC",
        "name": "Kiến trúc Máy tính",
        "folder": "KIẾN TRÚC MÁY TÍNH",
        "content": """
GIÁO TRÌNH KIẾN TRÚC MÁY TÍNH VÀ HỢP NGỮ - ĐẠI HỌC VĂN HIẾN (VHU)
1. Kiến trúc Von Neumann:
Bao gồm Đơn vị điều khiển (Control Unit), Đơn vị số học và logic (ALU), Bộ nhớ chính (Memory), Thanh ghi (Registers) và Hệ thống Bus (Data Bus, Address Bus, Control Bus).
2. Chu kỳ lệnh (Instruction Cycle):
Các pha thực thi lệnh: Fetch (Tìm nạp lệnh từ bộ nhớ) -> Decode (Giải mã lệnh) -> Execute (Thực thi) -> Writeback (Ghi kết quả vào thanh ghi/bộ nhớ).
3. Phân cấp bộ nhớ và Bộ nhớ đệm (Cache):
Thanh ghi (Register) -> Bộ nhớ đệm Cache L1/L2/L3 -> Bộ nhớ chính RAM -> Bộ nhớ phụ SSD/HDD. Tốc độ giảm dần nhưng dung lượng tăng dần.
        """.strip()
    },
    {
        "code": "VHU_NET",
        "name": "Mạng Máy tính",
        "folder": "MẠNG MÁY TÍNH",
        "content": """
GIÁO TRÌNH MẠNG MÁY TÍNH VÀ TRUYỀN THÔNG - ĐẠI HỌC VĂN HIẾN (VHU)
1. Mô hình 7 tầng OSI:
Tầng 7: Ứng dụng (Application - HTTP, FTP, DNS)
Tầng 6: Trình diễn (Presentation - SSL, mã hóa)
Tầng 5: Phiên (Session)
Tầng 4: Giao vận (Transport - TCP, UDP)
Tầng 3: Mạng (Network - IP, ICMP, Routing)
Tầng 2: Liên kết dữ liệu (Data Link - Ethernet, MAC)
Tầng 1: Vật lý (Physical - cáp, tín hiệu điện)
2. Tầng Giao vận TCP và UDP:
- TCP (Transmission Control Protocol): Hướng kết nối (Connection-oriented), bắt tay 3 bước (SYN, SYN-ACK, ACK), đảm bảo tin cậy và thứ tự gói tin.
- UDP (User Datagram Protocol): Không kết nối, tốc độ nhanh, chấp nhận mất gói, dùng cho video streaming, game trực tuyến.
3. Địa chỉ IP và Phân đoạn mạng (Subnetting):
Địa chỉ IPv4 gồm 32 bit chia làm 4 octet. Mặt nạ mạng Subnet Mask và ký hiệu CIDR (VD: /24).
        """.strip()
    },
    {
        "code": "VHU_SEC",
        "name": "An toàn Mạng và Thông tin",
        "folder": "AN TOÀN THÔNG TIN",
        "content": """
GIÁO TRÌNH AN TOÀN VÀ BẢO MẬT THÔNG TIN - KHOA CNTT ĐẠI HỌC VĂN HIẾN (VHU)
1. Tam giác bảo mật CIA:
- Confidentiality (Tính bí mật): Ngăn chặn truy cập trái phép vào dữ liệu.
- Integrity (Tính toàn vẹn): Đảm bảo dữ liệu không bị sửa đổi, thêm bớt trái phép.
- Availability (Tính sẵn sàng): Dữ liệu và dịch vụ luôn sẵn sàng phục vụ khi người dùng hợp lệ yêu cầu.
2. Mật mã học (Cryptography):
- Mã hóa đối xứng: Dùng chung một khóa bí mật để mã hóa và giải mã (AES, DES).
- Mã hóa bất đối xứng: Sử dụng cặp khóa công khai (Public Key) và khóa bí mật (Private Key) (RSA, Elliptic Curve Cryptography - ECC).
- Hàm băm mật mã (Cryptographic Hash): SHA-256, MD5 tạo mã băm một chiều, chống giả mạo.
3. Tấn công mạng phổ biến và Phòng thủ:
- Tấn công Web: SQL Injection, XSS (Cross-Site Scripting), CSRF.
- Tấn công Từ chối dịch vụ phân tán (DDoS): Làm tê liệt máy chủ bằng lưu lượng ảo khổng lồ.
- Tường lửa (Firewall), Hệ thống phát hiện xâm nhập (IDS), Hệ thống ngăn ngừa xâm nhập (IPS).
        """.strip()
    },
    {
        "code": "VHU_AI",
        "name": "Trí tuệ Nhân tạo",
        "folder": "TRÍ TUỆ NHÂN TẠO",
        "content": """
GIÁO TRÌNH TRÍ TUỆ NHÂN TẠO VÀ HỌC MÁY - ĐẠI HỌC VĂN HIẾN (VHU)
1. Thuật toán tìm kiếm trong không gian trạng thái:
- Tìm kiếm mù (Uninformed Search): BFS (Tìm kiếm theo chiều rộng), DFS (Tìm kiếm theo chiều sâu).
- Tìm kiếm có thông tin (Informed Search / Heuristic): Thuật toán A* sử dụng hàm đánh giá f(n) = g(n) + h(n) để tìm đường đi tối ưu.
2. Học máy (Machine Learning):
- Học có giám sát (Supervised Learning): Dữ liệu có nhãn. Bài toán Hồi quy (Linear Regression) và Phân loại (Logistic Regression, Decision Tree, SVM).
- Học không giám sát (Unsupervised Learning): Dữ liệu không có nhãn. Phân cụm K-Means, Giảm chiều dữ liệu PCA.
3. Mạng nơ-ron nhân tạo và Deep Learning:
Mô hình Perceptron, Mạng nơ-ron truyền thẳng (Feedforward Neural Network), Mạng tích chập (CNN) cho thị giác máy tính và Mô hình Transformer cho xử lý ngôn ngữ tự nhiên (NLP/LLM).
        """.strip()
    },
    {
        "code": "VHU_SAD",
        "name": "Phân tích và Thiết kế Hệ thống",
        "folder": "PHÂN TÍCH THIẾT KẾ HỆ THỐNG",
        "content": """
GIÁO TRÌNH PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG THÔNG TIN - ĐẠI HỌC VĂN HIẾN (VHU)
1. Vòng đời phát triển phần mềm (SDLC):
Các giai đoạn: Khảo sát hiện trạng -> Thu thập và phân tích yêu cầu -> Thiết kế hệ thống -> Cài đặt (Lập trình) -> Kiểm thử (Testing) -> Triển khai và Bảo trì.
2. Ngôn ngữ mô hình hóa thống nhất UML (Unified Modeling Language):
- Use Case Diagram: Mô tả chức năng hệ thống từ góc nhìn của tác nhân (Actor).
- Activity Diagram: Mô tả luồng hoạt động nghiệp vụ của quy trình.
- Class Diagram: Mô tả cấu trúc tĩnh, các lớp, thuộc tính, phương thức và mối quan hệ (Association, Aggregation, Composition, Generalization).
- Sequence Diagram: Mô tả tương tác động giữa các đối tượng theo thứ tự thời gian.
        """.strip()
    },
    {
        "code": "VHU_ALGO",
        "name": "Phân tích và Thiết kế Thuật toán",
        "folder": "PHÂN TÍCH THIẾT KẾ THUẬT TOÁN",
        "content": """
GIÁO TRÌNH THIẾT KẾ VÀ PHÂN TÍCH THUẬT TOÁN NÂNG CAO - ĐẠI HỌC VĂN HIẾN (VHU)
1. Phương pháp Chia để trị (Divide and Conquer):
Chia bài toán thành các bài toán con cùng dạng, giải quyết độc lập và kết hợp kết quả (Ví dụ: Merge Sort, Quick Sort, Nhân ma trận Strassen).
2. Quy hoạch động (Dynamic Programming):
Giải quyết bài toán tối ưu có tính chất bài toán con gối nhau (Overlapping Subproblems) và cấu trúc con tối ưu (Optimal Substructure). Kỹ thuật Memoization và Tabulation (Ví dụ: Bài toán cái túi Knapsack, Dãy con tăng dài nhất LIS).
3. Thuật toán Tham lam (Greedy Algorithm):
Đưa ra lựa chọn tối ưu cục bộ ở mỗi bước với hy vọng đạt được tối ưu toàn cục (Ví dụ: Cây khung nhỏ nhất Kruskal/Prim, Mã hóa Huffman).
        """.strip()
    },
    {
        "code": "VHU_PROJ",
        "name": "Đồ án Chuyên ngành & Tốt nghiệp CNTT",
        "folder": "ĐỒ ÁN IT",
        "content": """
QUY ĐỊNH ĐỒ ÁN VÀ KHÓA LUẬN TỐT NGHIỆP CNTT - ĐẠI HỌC VĂN HIẾN (VHU)
1. Mục tiêu và Tiêu chuẩn đánh giá:
Sinh viên năm cuối ngành Công nghệ Thông tin tại Trường Đại học Văn Hiến thực hiện đồ án tốt nghiệp nhằm áp dụng toàn diện kiến thức đã học vào giải quyết bài toán thực tế.
2. Cấu trúc báo cáo đồ án chuẩn VHU:
- Trang bìa chuẩn mẫu Đại học Văn Hiến (MẪU BÌA TIỂU LUẬN / ĐỒ ÁN VHU).
- Lời cảm ơn, Tóm tắt đề tài (Abstract tiếng Việt và tiếng Anh), Mục lục, Danh mục hình vẽ và bảng biểu.
- Chương 1: Giới thiệu bài toán và khảo sát các giải pháp hiện có.
- Chương 2: Cơ sở lý thuyết và các công nghệ sử dụng.
- Chương 3: Phân tích yêu cầu và thiết kế kiến trúc hệ thống (UML, Database Schema).
- Chương 4: Cài đặt và hiện thực hóa phần mềm (Demo kết quả, giao diện, API).
- Chương 5: Đánh giá, kiểm thử (Test case, Performance) và Hướng phát triển trong tương lai.
3. Tiêu chí bảo vệ trước Hội đồng:
Đúng hạn, bảo đảm tính trung thực học thuật (không đạo văn), phần mềm chạy ổn định và trả lời chất vấn tự tin trước hội đồng giảng viên VHU.
        """.strip()
    },
    {
        "code": "VHU_SOFT",
        "name": "Kỹ năng mềm sinh viên CNTT",
        "folder": "KỸ NĂNG MỀM",
        "content": """
TÀI LIỆU KỸ NĂNG MỀM DÀNH CHO KỸ SƯ CÔNG NGHỆ THÔNG TIN - ĐẠI HỌC VĂN HIẾN (VHU)
1. Kỹ năng làm việc nhóm (Teamwork):
Phối hợp hiệu quả trong mô hình Agile/Scrum. Giao tiếp cởi mở, lắng nghe tích cực, quản lý xung đột và tôn trọng ý kiến đồng đội.
2. Kỹ năng giải quyết vấn đề và Tư duy phản biện:
Tiếp cận bài toán phức tạp bằng phương pháp phân tích nguyên nhân gốc rễ (Root Cause Analysis - 5 Whys), chia nhỏ vấn đề thành các module giải quyết được.
3. Kỹ năng viết CV và Phỏng vấn tuyển dụng:
Trình bày CV chuyên nghiệp: Tóm tắt kinh nghiệm dự án (Projects), kỹ năng lập trình (Technical Skills), đóng góp thực tế và khả năng ngoại ngữ. Trả lời phỏng vấn theo phương pháp STAR (Situation, Task, Action, Result).
        """.strip()
    },
    {
        "code": "VHU_GEN",
        "name": "Môn Đại cương VHU",
        "folder": "MÔN ĐẠI CƯƠNG",
        "content": """
KHỐI KIẾN THỨC ĐẠI CƯƠNG VÀ KHOA HỌC XÃ HỘI - TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU)
1. Triết học Mác - Lênin:
Thế giới quan duy vật biện chứng và phương pháp luận biện chứng duy vật. Quy luật chuyển hóa từ những thay đổi về lượng dẫn đến những thay đổi về chất.
2. Kinh tế Chính trị Mác - Lênin và Chủ nghĩa Xã hội Khoa học:
Học thuyết giá trị thặng dư, quy luật thị trường, sứ mệnh lịch sử của giai cấp công nhân trong tiến trình phát triển xã hội.
3. Tư tưởng Hồ Chí Minh và Lịch sử Đảng Cộng sản Việt Nam:
Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh; truyền thống yêu nước và lịch sử cách mạng Việt Nam.
4. Tinh thần Văn Hiến Việt Nam:
Triết lý giáo dục "Thành nhân trước khi thành danh" của Trường Đại học Văn Hiến, đề cao đạo đức, truyền thống văn hóa và bản sắc dân tộc.
        """.strip()
    },
]


def seed_vhu_curriculum():
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 70)
    print("🏛️ BẮT ĐẦU NẠP GIÁO TRÌNH CHUYÊN NGÀNH CNTT - ĐẠI HỌC VĂN HIẾN (VHU)")
    print(f"   Tổng số môn học: {len(VHU_COURSES)}")
    print("=" * 70)

    total_chunks = 0
    with get_db() as conn:
        cursor = conn.cursor()
        
        for course in VHU_COURSES:
            code = course["code"]
            name = course["name"]
            doc_id = f"doc_{code.lower()}"
            filename = f"{code}_GiaoTrinh_VHU.txt"
            original_name = f"VHU - {name} ({code}).txt"
            file_path = UPLOADS_DIR / filename
            
            # Write file content
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(course["content"])
            
            size_bytes = os.path.getsize(file_path)
            checksum = hashlib.sha256(course["content"].encode("utf-8")).hexdigest()
            now = time.time()
            
            # Ensure owner exists
            cursor.execute("SELECT id FROM users WHERE id = 'usr_demo'")
            if not cursor.fetchone():
                cursor.execute("INSERT OR IGNORE INTO users (id, username, email, role, reputation, created_at) VALUES ('usr_demo', 'Giáo Trình VHU', 'giaotrinh@vhu.edu.vn', 'student', 100, ?)", (now,))

            # Check or insert document record
            cursor.execute("SELECT id FROM documents WHERE id = ?", (doc_id,))
            exists = cursor.fetchone()
            
            if exists:
                cursor.execute("""
                    UPDATE documents
                    SET original_name = ?, university = ?, subject_code = ?, subject_name = ?, status = 'approved', size_bytes = ?, checksum = ?
                    WHERE id = ?
                """, (original_name, "Đại học Văn Hiến (VHU)", code, name, size_bytes, checksum, doc_id))
            else:
                cursor.execute("""
                    INSERT INTO documents (
                        id, owner_id, filename, original_name, file_type, size_bytes,
                        checksum, status, university, subject_code, subject_name,
                        chunk_count, created_at, approved_at
                    ) VALUES (?, 'usr_demo', ?, ?, 'text/plain', ?, ?, 'approved', 'Đại học Văn Hiến (VHU)', ?, ?, 0, ?, ?)
                """, (doc_id, filename, original_name, size_bytes, checksum, code, name, now, now))
            
            conn.commit()
            
            # Index through RAGService
            chunk_count = RAGService.index_document(
                document_id=doc_id,
                document_name=original_name,
                file_path=file_path,
                file_type="text/plain",
            )
            total_chunks += chunk_count
            print(f"  ✓ [{code}] {name:38} -> Đã lập chỉ mục {chunk_count} chunks")

    print("=" * 70)
    print(f"🎉 NẠP THÀNH CÔNG TOÀN BỘ {len(VHU_COURSES)} MÔN HỌC CNTT ĐẠI HỌC VĂN HIẾN (VHU)!")
    print(f"   Tổng số chunks RAG được tạo: {total_chunks}")
    print("=" * 70)


if __name__ == "__main__":
    seed_vhu_curriculum()
