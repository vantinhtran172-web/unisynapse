"""
Script sinh TOÀN VĂN FILE NGUỒN (Full Comprehensive Textbooks & Syllabi)
cho toàn bộ 19 môn học chuyên ngành Công nghệ Thông tin - Trường Đại học Văn Hiến (VHU)
Dựa trên cấu trúc thư mục Google Drive: https://drive.google.com/drive/folders/1f-4eRHZAyDY1mDPLRo4uWsA2i95GjeIZ
"""
import os
import sys
import time
import hashlib
from pathlib import Path

# Setup encoding for Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.core.config import UPLOADS_DIR
from backend.core.database import get_db
from backend.services.rag_service import RAGService

# Define comprehensive, authentic academic source documents for each of the 19 courses
FULL_VHU_SOURCES = [
    {
        "code": "VHU_IT101",
        "name": "Nhập môn Công nghệ Thông tin",
        "folder": "NHẬP MÔN CNTT",
        "credits": 3,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: NHẬP MÔN CÔNG NGHỆ THÔNG TIN
MÃ HỌC PHẦN: VHU_IT101 | SỐ TÍN CHỈ: 3 TÍN CHỈ (30 LT + 30 TH)
ĐỐI TƯỢNG: SINH VIÊN NĂM NHẤT CHUYÊN NGÀNH CÔNG NGHỆ THÔNG TIN

================================================================================
PHẦN I: MỤC TIÊU HỌC PHẦN VÀ CHUẨN ĐẦU RA (CLO)
- CLO1: Hiểu rõ cấu trúc phần cứng, phần mềm của máy tính điện tử hiện đại.
- CLO2: Nắm vững hệ thống số (Binary, Octal, Hexadecimal) và biểu diễn dữ liệu.
- CLO3: Hiểu kiến trúc mạng Internet, điện toán đám mây và an ninh số căn bản.
- CLO4: Thấu triệt đạo đức nghề nghiệp kỹ sư CNTT và triết lý "Thành nhân trước khi thành danh" của Đại học Văn Hiến.

================================================================================
CHƯƠNG 1: TỔNG QUAN VỀ NGÀNH CÔNG NGHỆ THÔNG TIN
1.1. Lịch sử phát triển của máy tính điện tử:
Từ thế hệ đèn điện tử chân không (ENIAC - 1946), bóng bán dẫn Transistor, mạch tích hợp IC, đến vi xử lý siêu tích hợp VLSI và kỷ nguyên AI/Quantum Computing ngày nay.
1.2. Định nghĩa Công nghệ Thông tin (Information Technology - IT):
IT là tập hợp các ngành khoa học và kỹ thuật nghiên cứu phương pháp thu thập, lưu trữ, xử lý, truyền tải và bảo vệ thông tin số.
1.3. Cơ hội nghề nghiệp sinh viên CNTT Văn Hiến:
Kỹ sư phần mềm (Software Engineer), Chuyên viên an toàn thông tin (Cybersecurity), Kỹ sư dữ liệu (Data Engineer), Quản trị mạng và hệ thống (DevOps / System Admin), Chuyên viên AI & Machine Learning.

================================================================================
CHƯƠNG 2: KIẾN TRÚC PHẦN CỨNG VÀ HỆ THỐNG MÁY TÍNH
2.1. Khối xử lý trung tâm (Central Processing Unit - CPU):
- Khối số học và logic (ALU - Arithmetic Logic Unit): Thực hiện các phép tính số học (+, -, *, /) và phép so sánh logic (AND, OR, NOT, XOR).
- Khối điều khiển (CU - Control Unit): Điều phối giải mã lệnh, tạo tín hiệu nhịp xung clock đồng bộ.
- Các thanh ghi (Registers): Vùng nhớ tốc độ cao nhất nằm ngay trong vi xử lý (PC, IR, Accumulator, SP).
2.2. Hệ thống bộ nhớ máy tính:
- Bộ nhớ chính: RAM (Random Access Memory - lưu trữ tạm thời, mất dữ liệu khi mất điện) và ROM (Read Only Memory - chứa firmware BIOS/UEFI).
- Bộ nhớ đệm (Cache L1/L2/L3): Thu hẹp khoảng cách tốc độ giữa CPU siêu nhanh và RAM.
- Bộ nhớ phụ: Ổ cứng thể rắn SSD (giao tiếp NVMe PCIe cho tốc độ 7000MB/s) và HDD từ tính.
2.3. Hệ thống Bus truyền thông:
Data Bus (truyền dữ liệu), Address Bus (xác định địa chỉ ô nhớ), Control Bus (truyền tín hiệu đọc/ghi).

================================================================================
CHƯƠNG 3: BIỂU DIỄN DỮ LIỆU TRONG HỆ THỐNG SỐ
3.1. Các hệ cơ số thông dụng:
- Hệ nhị phân (Base-2 / Binary): Chỉ dùng 2 ký số 0 và 1. Đơn vị cơ sở: 1 Byte = 8 bits.
- Hệ thập lục phân (Base-16 / Hexadecimal): Ký tự từ 0-9 và A-F, dùng rút gọn biểu diễn byte địa chỉ ô nhớ và mã màu HTML.
3.2. Biểu diễn số nguyên có dấu:
Phương pháp Bù 2 (Two's Complement): Đảo toàn bộ bit (bù 1) rồi cộng thêm 1. Giúp mạch ALU thực hiện phép trừ thông qua phép cộng số học một cách tối ưu.
3.3. Biểu diễn số thực dấu phẩy động (IEEE 754):
Gồm 3 trường: Bit dấu (Sign), Phần mũ (Exponent), và Phần định trị (Mantissa/Fraction).

================================================================================
CHƯƠNG 4: PHẦN MỀM, MẠNG INTERNET VÀ AN NINH THÔNG TIN
4.1. Phân loại phần mềm:
- Phần mềm hệ thống (System Software): Hệ điều hành (Windows, Linux, macOS), trình điều khiển Driver quản lý thiết bị.
- Phần mềm ứng dụng (Application Software): Trình duyệt web, cơ sở dữ liệu, bộ công cụ văn phòng.
4.2. Khái niệm mạng máy tính và Internet:
Mô hình Client-Server, điện toán đám mây (Cloud Computing - IaaS, PaaS, SaaS), giao thức TCP/IP và hệ thống phân giải tên miền DNS.

================================================================================
CHƯƠNG 5: ĐẠO ĐỨC NGHỀ NGHIỆP VÀ BẢN QUYỀN SỐ
5.1. Quy tắc đạo đức kỹ sư phần mềm (ACM / IEEE Code of Ethics):
Tuyệt đối bảo mật thông tin người dùng, không cài mã độc, không lợi dụng lỗ hổng bảo mật để trục lợi.
5.2. Văn hóa và triết lý Đại học Văn Hiến:
"Thành nhân trước khi thành danh" - Kỹ sư CNTT Văn Hiến phải có trách nhiệm xã hội, thượng tôn pháp luật và tinh thần phụng sự cộng đồng.

================================================================================
NGÂN HÀNG CÂU HỎI ÔN TẬP VÀ ĐỀ THI KẾT THÚC HỌC PHẦN
Câu 1 (Trắc nghiệm): Đơn vị nhỏ nhất để đo lường thông tin trong máy tính là gì?
Đáp án: Bit (Binary digit). 1 Byte tương đương 8 bits.
Câu 2 (Trắc nghiệm): CPU gồm những thành phần cốt lõi nào?
Đáp án: ALU (Khối số học logic), CU (Khối điều khiển), và Registers (Tập thanh ghi).
Câu 3 (Tự luận): Trình bày sự khác biệt giữa bộ nhớ RAM và ROM? Giải thích tại sao máy tính cần bộ nhớ Cache?
Trả lời: RAM là bộ nhớ truy xuất ngẫu nhiên khả biến (mất dữ liệu khi mất nguồn điện), dùng nạp chương trình đang chạy. ROM là bộ nhớ chỉ đọc bất biến (chứa mã khởi động firmware). Cache là bộ nhớ đệm SRAM siêu nhanh đặt cạnh CPU nhằm giảm thiểu độ trễ chờ đợi dữ liệu từ DRAM chính.

TÀI LIỆU THAM KHẢO CHÍNH THỨC:
1. Khoa CNTT - Đại học Văn Hiến, "Giáo trình Nhập môn Công nghệ Thông tin", NXB Đại học Văn Hiến.
2. J. Glenn Brookshear, "Computer Science: An Overview", 13th Edition, Pearson.
"""
    },
    {
        "code": "VHU_DSA",
        "name": "Cấu trúc Dữ liệu và Giải thuật",
        "folder": "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT (DATA STRUCTURES & ALGORITHMS)
MÃ HỌC PHẦN: VHU_DSA | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: PHÂN TÍCH ĐỘ PHỨC TẠP THUẬT TOÁN (ALGORITHM ANALYSIS)
1.1. Ký pháp tiệm cận (Asymptotic Notation):
- Big-O (O): Chặn trên tiệm cận (Worst-case complexity).
- Big-Omega (Ω): Chặn dưới tiệm cận (Best-case complexity).
- Big-Theta (Θ): Chặn chặt tiệm cận (Average-case complexity).
1.2. Thang đo độ phức tạp phổ biến:
O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!).

================================================================================
CHƯƠNG 2: DANH SÁCH TUYẾN TÍNH (LINEAR DATA STRUCTURES)
2.1. Danh sách liên kết đơn (Singly Linked List):
Mỗi phần tử (Node) gồm 2 vùng: Data và Con trỏ next trỏ đến phần tử kế tiếp.
Ưu điểm: Thêm/xóa phần tử đầu O(1), không cần cấp phát vùng nhớ liên tục như mảng.
Nhược điểm: Không truy cập ngẫu nhiên theo chỉ số O(1), tốn bộ nhớ lưu con trỏ.
2.2. Ngăn xếp (Stack - LIFO):
Cơ chế "Vào sau ra trước". Thao tác chính: push(x) thêm phần tử đỉnh, pop() lấy phần tử đỉnh, peek() xem đỉnh. Thời gian O(1).
Ứng dụng: Khử đệ quy, kiểm tra dấu ngoặc hợp lệ, chuyển biểu thức Trung tố sang Hậu tố (Infix to Postfix).
2.3. Hàng đợi (Queue - FIFO):
Cơ chế "Vào trước ra trước". Thao tác enqueue(x) vào đuôi (rear), dequeue() ra đầu (front).
Hàng đợi vòng (Circular Queue) và Hàng đợi ưu tiên (Priority Queue cài bằng Heap).

================================================================================
CHƯƠNG 3: CÂY VÀ CÂY NHỊ PHÂN TÌM KIẾM (BST & BALANCED TREES)
3.1. Cây nhị phân tìm kiếm (Binary Search Tree - BST):
Tính chất: Với mọi nút N, tất cả khóa cây con trái < N.key < tất cả khóa cây con phải.
Duyệt cây: Tiền thứ tự (NLR), Trung thứ tự (LNR - cho dãy tăng dần), Hậu thứ tự (LRN).
Độ phức tạp: Tìm kiếm, thêm, xóa trung bình O(log n). Trường hợp suy biến thành đường thẳng: O(n).
3.2. Cây cân bằng AVL Tree:
Chỉ số cân bằng Balance Factor = Height(Left) - Height(Right) thuộc {-1, 0, 1}.
Khi mất cân bằng, thực hiện 4 phép quay: Quay đơn trái (LL), Quay đơn phải (RR), Quay kép trái-phải (LR), Quay kép phải-trái (RL). Đảm bảo thời gian tra cứu luôn là O(log n).

================================================================================
CHƯƠNG 4: BẢNG BĂM VÀ ĐỒ THỊ (HASH TABLES & GRAPHS)
4.1. Bảng băm (Hash Table):
Ánh xạ khóa k thành chỉ số index = h(k) trong mảng.
Xử lý đụng độ (Collision Resolution):
- Phương pháp kết nối ngoài (Separate Chaining): Dùng danh sách liên kết tại mỗi ô.
- Phương pháp địa chỉ mở (Open Addressing): Dò tuyến tính (Linear Probing), dò bậc hai, băm kép (Double Hashing).
Thời gian trung bình O(1) cho các thao tác tra cứu, thêm, xóa.
4.2. Đồ thị (Graph Data Structure):
- Biểu diễn: Ma trận kề (Adjacency Matrix - tốn O(V^2)) và Danh sách kề (Adjacency List - tốn O(V + E)).
- Thuật toán duyệt: BFS (Breadth-First Search - dùng Queue) và DFS (Depth-First Search - dùng Stack/Đệ quy).
- Thuật toán Dijkstra tìm đường đi ngắn nhất đồ thị trọng số không âm: O((V + E) log V).

================================================================================
CHƯƠNG 5: CÁC GIẢI THUẬT SẮP XẾP VÀ TÌM KIẾM NÂNG CAO
- QuickSort: Chọn phần tử chốt (Pivot), phân hoạch Lomuto/Hoare. Độ phức tạp trung bình O(n log n).
- MergeSort: Chia để trị, chia đôi mảng, trộn 2 mảng con đã sắp xếp. Ổn định (Stable), luôn đạt O(n log n).
- Binary Search: Tìm kiếm trên mảng đã sắp xếp, độ phức tạp O(log n).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT VHU:
Câu 1: Phân tích sự khác biệt giữa Mảng (Array) và Danh sách liên kết (Linked List)?
Đáp án: Mảng cấp phát bộ nhớ liên tục, truy cập O(1) qua chỉ số nhưng kích thước cố định hoặc tốn chi phí mở rộng O(n). Danh sách liên kết cấp phát động rải rác, thêm/xóa O(1) ở vị trí đã biết nhưng truy xuất ngẫu nhiên tốn O(n).
Câu 2: Tại sao QuickSort có độ phức tạp trường hợp xấu nhất là O(n^2) và cách khắc phục?
Đáp án: Xảy ra khi chọn Pivot luôn là phần tử nhỏ nhất hoặc lớn nhất trên mảng đã sắp xếp. Khắc phục bằng kỹ thuật Median-of-Three hoặc Randomized Pivot.

TÀI LIỆU THAM KHẢO:
1. Thomas H. Cormen, "Introduction to Algorithms", 4th Edition, MIT Press.
2. Khoa CNTT - ĐH Văn Hiến, "Bài giảng Cấu trúc dữ liệu và giải thuật".
"""
    },
    {
        "code": "VHU_OOP",
        "name": "Lập trình Hướng đối tượng (OOP)",
        "folder": "LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OBJECT-ORIENTED PROGRAMMING)
MÃ HỌC PHẦN: VHU_OOP | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: TỔNG QUAN VÀ TƯ DUY HƯỚNG ĐỐI TƯỢNG
1.1. So sánh Lập trình cấu trúc (Procedural) và Lập trình Hướng đối tượng (OOP):
Lập trình thủ tục lấy hàm/thủ tục làm trung tâm, dữ liệu tách rời. Lập trình OOP gom thuộc tính (dữ liệu) và hành vi (phương thức) vào một thực thể duy nhất gọi là Đối tượng (Object).
1.2. Lớp (Class) và Đối tượng (Object):
- Class là khuôn mẫu (Blueprint) định nghĩa thuộc tính và phương thức.
- Object là thể hiện cụ thể (Instance) của lớp chiếm vùng nhớ trong thời gian chạy.

================================================================================
CHƯƠNG 2: 4 NGUYÊN LÝ TRỤ CỘT CỦA OOP
2.1. Tính Đóng gói (Encapsulation):
Che giấu trạng thái nội bộ của đối tượng bằng phạm vi truy cập (Access Modifiers: private, protected, public). Chỉ cho phép tương tác qua các phương thức công khai getter và setter. Giúp bảo vệ dữ liệu khỏi bị can thiệp trái phép.
2.2. Tính Kế thừa (Inheritance):
Cho phép lớp con (Derived/Subclass) tái sử dụng mã nguồn và mở rộng tính năng của lớp cha (Base/Superclass). Biểu diễn quan hệ "is-a".
2.3. Tính Đa hình (Polymorphism):
Một thông điệp gửi đến các đối tượng khác nhau sẽ được xử lý theo cách thức khác nhau.
- Đa hình thời điểm biên dịch (Compile-time / Static): Nạp chồng phương thức (Method Overloading) và Nạp chồng toán tử (Operator Overloading).
- Đa hình thời điểm thực thi (Runtime / Dynamic): Ghi đè phương thức (Method Overriding) thông qua cơ chế liên kết động (Dynamic Binding) và Bảng phương thức ảo (vtable).
2.4. Tính Trừu tượng (Abstraction):
Ẩn giấu các chi tiết cài đặt phức tạp, chỉ hiển thị những tính năng cốt lõi cần thiết đối với người sử dụng thông qua Lớp trừu tượng (Abstract Class) và Giao diện (Interface).

================================================================================
CHƯƠNG 3: VÒNG ĐỜI ĐỐI TƯỢNG VÀ QUẢN LÝ BỘ NHỚ
3.1. Phương thức khởi tạo (Constructor):
Được triệu gọi tự động khi đối tượng được tạo ra. Khởi tạo giá trị mặc định cho thuộc tính. Gồm Constructor mặc định, Constructor có tham số, và Copy Constructor.
3.2. Phương thức hủy (Destructor):
Được gọi tự động khi đối tượng ra khỏi phạm vi sống (Scope) hoặc khi giải phóng con trỏ. Dùng dọn dẹp tài nguyên (File, Socket, Bộ nhớ động Heap).

================================================================================
CHƯƠNG 4: NGUYÊN LÝ THIẾT KẾ SOLID VÀ DESIGN PATTERNS
4.1. Bộ 5 nguyên lý SOLID:
- S (Single Responsibility Principle): Mỗi lớp chỉ có một lý do duy nhất để thay đổi.
- O (Open/Closed Principle): Mở cho việc mở rộng tính năng, đóng đối với việc sửa đổi mã nguồn sẵn có.
- L (Liskov Substitution Principle): Đối tượng lớp con có thể thay thế đối tượng lớp cha mà không làm sai logic chương trình.
- I (Interface Segregation Principle): Tách nhỏ interface chuyên biệt thay vì tạo interface quá lớn.
- D (Dependency Inversion Principle): Module cấp cao không phụ thuộc module cấp thấp, cả hai cùng phụ thuộc abstraction.
4.2. Mẫu thiết kế thông dụng:
Singleton Pattern (đảm bảo lớp chỉ có 1 instance), Factory Pattern (khởi tạo đối tượng linh hoạt), Observer Pattern (mô hình thông báo sự kiện Publish-Subscribe).

CÂU HỎI ÔN TẬP VÀ BÀI TẬP VẬN DỤNG VHU:
Câu 1: Phân biệt sự khác nhau giữa Overloading và Overriding?
Đáp án: Overloading diễn ra trong cùng một lớp, cùng tên phương thức nhưng khác tham số truyền vào (số lượng, kiểu dữ liệu), giải quyết tại compile-time. Overriding diễn ra giữa lớp cha và lớp con, cùng tên và cùng danh sách tham số, ghi đè hành vi lớp cha, giải quyết tại runtime qua virtual table.
Câu 2: Tại sao nên khai báo Destructor của lớp cha là virtual trong C++?
Đáp án: Khi xóa đối tượng lớp con thông qua con trỏ lớp cha (Polymorphism), nếu destructor lớp cha không phải là virtual thì chỉ có destructor của lớp cha được gọi, gây rò rỉ bộ nhớ (Memory Leak) cho các tài nguyên mà lớp con cấp phát.

TÀI LIỆU THAM KHẢO CHÍNH THỨC:
1. Robert C. Martin, "Clean Code: A Handbook of Agile Software Craftsmanship", Prentice Hall.
2. Erich Gamma et al., "Design Patterns: Elements of Reusable Object-Oriented Software".
"""
    },
    {
        "code": "VHU_CPP",
        "name": "Lập trình C++",
        "folder": "LẬP TRÌNH C++",
        "credits": 3,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: LẬP TRÌNH C++ CHUYÊN SÂU (ADVANCED C++ PROGRAMMING)
MÃ HỌC PHẦN: VHU_CPP | SỐ TÍN CHỈ: 3 TÍN CHỈ (30 LT + 30 TH)

================================================================================
CHƯƠNG 1: QUẢN LÝ BỘ NHỚ VÀ CON TRỎ CHUYÊN SÂU
1.1. Kiến trúc phân vùng nhớ của tiến trình C++:
- Vùng nhớ Stack: Tự động cấp phát và thu hồi khi hàm thoát, tốc độ cực nhanh, kích thước hạn chế.
- Vùng nhớ Heap (Free Store): Cấp phát động thông qua toán tử `new` và `delete`. Do lập trình viên kiểm soát.
1.2. Con trỏ (Pointers) và Tham chiếu (References):
- Con trỏ lưu địa chỉ ô nhớ, có thể gán nullptr, có thể thay đổi địa chỉ trỏ tới.
- Tham chiếu là bí danh (Alias) cho biến sẵn có, phải khởi tạo ngay lập tức và không thể đổi biến tham chiếu.
1.3. Các lỗi bộ nhớ nguy hiểm:
- Memory Leak: Cấp phát bộ nhớ `new` mà quên gọi `delete`.
- Dangling Pointer: Con trỏ trỏ tới vùng nhớ đã bị giải phóng.
- Wild Pointer: Con trỏ chưa được khởi tạo mang giá trị rác.

================================================================================
CHƯƠNG 2: CON TRỎ THÔNG MINH (SMART POINTERS TRONG C++11/14/17)
2.1. std::unique_ptr:
Cơ chế sở hữu độc quyền (Exclusive Ownership). Không thể sao chép (Copy Disabled), chỉ có thể chuyển nhượng quyền sở hữu bằng `std::move()`. Tự động giải phóng khi ra khỏi scope.
2.2. std::shared_ptr:
Cơ chế sở hữu chia sẻ (Shared Ownership) dựa trên đếm tham chiếu (Reference Counting). Vùng nhớ chỉ bị giải phóng khi bộ đếm tham chiếu giảm về 0.
2.3. std::weak_ptr:
Con trỏ không tăng bộ đếm tham chiếu, dùng để giải quyết bài toán tham chiếu vòng tròn (Circular Dependency) giữa các `shared_ptr`.

================================================================================
CHƯƠNG 3: THƯ VIỆN CHUẨN STL (STANDARD TEMPLATE LIBRARY)
3.1. Các cấu trúc dữ liệu Containers:
- Tuần tự: `std::vector` (mảng động tự mở rộng gấp đôi capacity), `std::deque`, `std::list` (danh sách liên kết đôi).
- Ánh xạ liên kết: `std::map` và `std::set` (cài bằng cây Đỏ Đen Red-Black Tree, trật tự tăng dần, tra cứu O(log n)).
- Bảng băm: `std::unordered_map` và `std::unordered_set` (tra cứu trung bình O(1)).
3.2. Thuật toán STL (<algorithm>):
`std::sort` (thuật toán Introsort kết hợp QuickSort, HeapSort, InsertionSort), `std::binary_search`, `std::transform`, `std::find_if`.

================================================================================
CHƯƠNG 4: TEMPLATES, LAMBDA VÀ XỬ LÝ NGOẠI LỆ
4.1. Lập trình tổng quát (Generic Programming):
Function Template và Class Template giúp viết mã nguồn hoạt động trên nhiều kiểu dữ liệu mà không làm giảm hiệu năng thực thi tại runtime.
4.2. Lambda Expressions:
Cú pháp `[capture](params) -> return_type { body }`. Ứng dụng mạnh mẽ trong hàm sắp xếp custom và thuật toán STL.
4.3. Ngoại lệ trong C++:
Cơ chế `try - catch - throw` đảm bảo Exception Safety và giải phóng tài nguyên theo nguyên lý RAII (Resource Acquisition Is Initialization).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Phân tích nguyên lý RAII (Resource Acquisition Is Initialization) trong C++?
Đáp án: RAII gắn liền vòng đời của tài nguyên (bộ nhớ, file, mutex) với vòng đời của đối tượng trên Stack. Tài nguyên được cấp phát trong Constructor và được giải phóng tự động trong Destructor ngay khi đối tượng rời khỏi phạm vi, kể cả khi có ngoại lệ xảy ra.
Câu 2: So sánh `std::vector::size()` và `std::vector::capacity()`?
Đáp án: `size()` là số lượng phần tử thực tế đang chứa. `capacity()` là tổng số lượng phần tử mà vector có thể lưu trữ trước khi cần cấp phát lại vùng nhớ mới và sao chép dữ liệu.

TÀI LIỆU THAM KHẢO:
1. Bjarne Stroustrup, "The C++ Programming Language", 4th Edition, Addison-Wesley.
2. Scott Meyers, "Effective Modern C++", O'Reilly Media.
"""
    },
    {
        "code": "VHU_JAVA",
        "name": "Lập trình Java",
        "folder": "LẬP TRÌNH JAVA",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: LẬP TRÌNH NỀN TẢNG VÀ NÂNG CAO VỚI JAVA
MÃ HỌC PHẦN: VHU_JAVA | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: KIẾN TRÚC MÁY ẢO JAVA (JVM) VÀ VÒNG ĐỜI ỨNG DỤNG
1.1. Triết lý "Write Once, Run Anywhere":
Mã nguồn Java (.java) được trình biên dịch `javac` dịch thành mã Bytecode trung gian (.class). Bytecode chạy trên bất kỳ hệ điều hành nào cài đặt Máy ảo Java (Java Virtual Machine - JVM).
1.2. Phân vùng bộ nhớ trong JVM:
- Heap Memory: Chứa tất cả đối tượng (Objects) được khởi tạo bằng từ khóa `new`. Được chia thành Young Generation (Eden, S0, S1) và Old Generation.
- Stack Memory: Lưu trữ lời gọi hàm (Stack Frame) và biến nguyên thủy cục bộ.
- Metaspace: Lưu trữ cấu trúc lớp (Metadata), hằng số tĩnh.
1.3. Cơ chế thu gom rác tự động (Garbage Collection - GC):
GC tự động phát hiện và thu hồi các đối tượng không còn tham chiếu sống (Reachability Analysis), thuật toán Mark and Sweep, G1 GC, ZGC giúp hạn chế dừng ứng dụng (Stop-the-world).

================================================================================
CHƯƠNG 2: JAVA COLLECTIONS FRAMEWORK
2.1. Phân cấp giao diện:
- `List`: Danh sách duy trì thứ tự chèn, cho phép phần tử trùng lặp.
  * `ArrayList`: Mảng động, truy cập O(1), chèn/xóa ở giữa tốn O(n).
  * `LinkedList`: Danh sách liên kết đôi, thêm/xóa O(1) tại vị trí con trỏ, truy cập ngẫu nhiên O(n).
- `Set`: Tập hợp không chứa phần tử trùng lặp.
  * `HashSet`: Dựa trên bảng băm, không duy trì thứ tự, tra cứu O(1).
  * `TreeSet`: Dựa trên cây Đỏ Đen, sắp xếp tăng dần, tra cứu O(log n).
- `Map`: Tập hợp các cặp Khóa - Giá trị (Key - Value). Khóa là duy nhất.
  * `HashMap`: Dùng băm, từ Java 8 chuyển thành cây Red-Black khi bucket > 8 phần tử để tránh suy biến O(n).
  * `ConcurrentHashMap`: Hỗ trợ truy cập đa luồng an toàn bằng cơ chế Lock Striping.

================================================================================
CHƯƠNG 3: ĐA LUỒNG VÀ ĐỒNG BỘ HÓA (MULTITHREADING & CONCURRENCY)
3.1. Khởi tạo Thread: Kế thừa lớp `Thread` hoặc cài đặt giao diện `Runnable` / `Callable<T>`.
3.2. Cơ chế đồng bộ hóa:
Từ khóa `synchronized` đảm bảo chỉ một luồng được truy cập phương thức hoặc khối lệnh Critical Section tại một thời điểm.
Sử dụng `ReentrantLock` và `AtomicInteger` cho xử lý Lock-free hiệu năng cao.
3.3. Thread Pool và ExecutorService:
Tránh chi phí tạo thread mới liên tục bằng cách tái sử dụng nhóm worker thread (`Executors.newFixedThreadPool()`).

================================================================================
CHƯƠNG 4: STREAM API, LAMBDA EXPRESSIONS VÀ KẾT NỐI JDBC
4.1. Java Streams API (Java 8+):
Thao tác xử lý dữ liệu theo phong cách khai báo: `filter()`, `map()`, `sorted()`, `collect(Collectors.toList())`. Hỗ trợ xử lý song song với `parallelStream()`.
4.2. Kết nối cơ sở dữ liệu JDBC:
Sử dụng `DriverManager`, `Connection`, `PreparedStatement` (phòng chống tấn công SQL Injection) và `ResultSet`.

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT VHU:
Câu 1: So sánh Checked Exception và Unchecked Exception trong Java?
Đáp án: Checked Exception (kế thừa từ `Exception`) bắt buộc phải khai báo trong `throws` hoặc xử lý bằng `try-catch` ngay tại thời điểm biên dịch (VD: `IOException`, `SQLException`). Unchecked Exception (kế thừa từ `RuntimeException`) xảy ra tại runtime do lỗi lập trình và không bắt buộc xử lý tại compile-time (VD: `NullPointerException`, `ArrayIndexOutOfBoundsException`).
Câu 2: Tại sao nên dùng `PreparedStatement` thay vì `Statement` trong JDBC?
Đáp án: `PreparedStatement` biên dịch trước câu lệnh SQL trên DB server, giúp tăng tốc độ thực thi cho các truy vấn lặp lại và tự động escape dữ liệu đầu vào, ngăn chặn triệt để lỗ hổng bảo mật SQL Injection.

TÀI LIỆU THAM KHẢO:
1. Joshua Bloch, "Effective Java", 3rd Edition, Addison-Wesley.
2. Cay S. Horstmann, "Core Java Volume I – Fundamentals", 12th Edition, Prentice Hall.
"""
    },
    {
        "code": "VHU_PY",
        "name": "Lập trình Python",
        "folder": "LẬP TRÌNH PYTHON",
        "credits": 3,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: LẬP TRÌNH PYTHON VÀ PHÂN TÍCH DỮ LIỆU
MÃ HỌC PHẦN: VHU_PY | SỐ TÍN CHỈ: 3 TÍN CHỈ (30 LT + 30 TH)

================================================================================
CHƯƠNG 1: ĐẶC TRƯNG NGÔN NGỮ PYTHON VÀ CẤU TRÚC DỮ LIỆU
1.1. Bản chất ngôn ngữ:
Python là ngôn ngữ thông dịch (Interpreted), định kiểu động (Dynamically Typed), cú pháp dựa trên thụt đầu dòng (Indentation).
Cơ chế Quản lý bộ nhớ thông qua Reference Counting kết hợp chu trình phát hiện rác tuần hoàn (Generational Cycle Detector).
1.2. Các kiểu dữ liệu tích hợp:
- `List`: Danh sách có thể thay đổi (Mutable), chỉ mục âm, slicing `list[start:end:step]`.
- `Tuple`: Bộ dữ liệu bất biến (Immutable), dùng làm khóa cho dictionary.
- `Dictionary`: Bảng băm Key-Value, độ phức tạp trung bình O(1).
- `Set`: Tập hợp các phần tử duy nhất, hỗ trợ phép toán tập hợp (Hợp, Giao, Hiệu).
1.3. List Comprehension & Generator Expressions:
Cú pháp tinh gọn tạo danh sách `[x**2 for x in range(10) if x % 2 == 0]`.
Generator dùng từ khóa `yield` giúp tiết kiệm bộ nhớ khi làm việc với tập dữ liệu khổng lồ (Lazy Evaluation).

================================================================================
CHƯƠNG 2: LẬP TRÌNH HÀM VÀ HƯỚNG ĐỐI TƯỢNG NÂNG CAO
2.1. Decorators trong Python:
Hàm nhận một hàm khác làm tham số và mở rộng hành vi của nó mà không sửa đổi mã nguồn gốc (thường dùng cho Logging, Authentication, Caching `@lru_cache`).
2.2. Magic Methods (Dunder Methods):
`__init__`, `__str__`, `__repr__`, `__eq__`, `__len__`, `__enter__`, `__exit__` hỗ trợ quản lý ngữ cảnh (Context Manager với câu lệnh `with`).

================================================================================
CHƯƠNG 3: XỬ LÝ VÀ PHÂN TÍCH DỮ LIỆU VỚI NUMPY & PANDAS
3.1. Thư viện NumPy:
Đối tượng mảng đa chiều `ndarray`, hỗ trợ tính toán vector hóa (Vectorization) chạy bằng C dưới nền tảng, nhanh hơn hàng chục lần so với vòng lặp Python thuần.
3.2. Thư viện Pandas:
Đối tượng `Series` (1 chiều) và `DataFrame` (2 chiều có nhãn). Thao tác lọc dữ liệu, xử lý dữ liệu khuyết tật (NaN), nhóm dữ liệu `groupby()`, gộp bảng `merge()`, xoay trục `pivot_table()`.

================================================================================
CHƯƠNG 4: XÂY DỰNG WEB SERVICE VÀ AUTOMATION VỚI PYTHON
Xây dựng RESTful API bất đồng bộ với FastAPI và Uvicorn, tự động sinh tài liệu Swagger UI, xác thực dữ liệu qua Pydantic.

CÂU HỎI ÔN TẬP VÀ BÀI TẬP VHU:
Câu 1: Giải thích cơ chế GIL (Global Interpreter Lock) trong CPython?
Đáp án: GIL là khóa luồng trong bộ thông dịch CPython chuẩn, chỉ cho phép một luồng bytecode thực thi tại một thời điểm, ngăn cản việc tận dụng tối đa CPU đa nhân cho các tác vụ tính toán nặng (CPU-bound). Khắc phục bằng mô đun `multiprocessing` thay vì `threading`.
Câu 2: Phân biệt sự khác nhau giữa `is` và `==` trong Python?
Đáp án: `==` so sánh giá trị tương đương giữa 2 đối tượng. `is` so sánh định danh ô nhớ (Identity - kiểm tra xem 2 biến có cùng trỏ tới cùng một địa chỉ đối tượng trong bộ nhớ hay không).

TÀI LIỆU THAM KHẢO:
1. Luciano Ramalho, "Fluent Python: Clear, Concise, and Effective Programming", 2nd Edition, O'Reilly Media.
2. Wes McKinney, "Python for Data Analysis", 3rd Edition, O'Reilly Media.
"""
    },
    {
        "code": "VHU_WEB",
        "name": "Lập trình Web",
        "folder": "LẬP TRÌNH WEB",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: PHÁT TRIỂN ỨNG DỤNG WEB HIỆN ĐẠI (FULLSTACK WEB DEVELOPMENT)
MÃ HỌC PHẦN: VHU_WEB | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: NỀN TẢNG FRONTEND HTML5, CSS3 VÀ JAVASCRIPT ES6+
1.1. HTML5 Ngữ nghĩa (Semantic HTML):
Sử dụng thẻ `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` tối ưu cấu trúc DOM cho trợ năng (Accessibility) và chỉ mục tìm kiếm (SEO).
1.2. CSS3 Hiện đại:
Hệ thống dàn trang linh hoạt Flexbox (1 chiều) và CSS Grid (2 chiều). Biến CSS Custom Properties (`var(--primary-color)`), kỹ thuật Responsive Design với Media Queries.
1.3. JavaScript ES6+:
Arrow functions, Destructuring, Spread/Rest Operator, Modules `import/export`, Xử lý bất đồng bộ với `Promise` và `async/await`.

================================================================================
CHƯƠNG 2: KIẾN TRÚC FRONTEND FRAMEWORK (REACT.JS & NEXT.JS)
2.1. Bản chất React.js:
Mô hình Component-based, Virtual DOM giúp tối ưu hóa việc vẽ lại giao diện (Re-rendering) thông qua giải thuật phân biệt (Diffing Algorithm).
2.2. React Hooks chuyên sâu:
- `useState`: Quản lý trạng thái cục bộ của component.
- `useEffect`: Xử lý các tác vụ phụ (Side Effects) như gọi API, đăng ký sự kiện.
- `useMemo` và `useCallback`: Tối ưu hiệu năng, ghi nhớ giá trị tính toán và tham chiếu hàm để ngăn chặn re-render thừa.
2.3. Server-side Rendering (SSR) vs Client-side Rendering (CSR):
Next.js hỗ trợ SSR kết xuất HTML ngay trên máy chủ cho tốc độ tải trang ban đầu FCP cực nhanh và chuẩn SEO vượt trội.

================================================================================
CHƯƠNG 3: BACKEND VÀ THIẾT KẾ RESTFUL API
3.1. Nguyên tắc thiết kế REST API:
Sử dụng chuẩn danh từ số nhiều cho tài nguyên (VD: `/api/v1/documents`), các phương thức HTTP chuẩn: GET (đọc dữ liệu), POST (tạo mới), PUT (cập nhật toàn phần), PATCH (cập nhật một phần), DELETE (xóa).
Mã trạng thái HTTP: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error.
3.2. Cơ chế xác thực JWT (JSON Web Token):
Cấu trúc 3 phần: Header (thuật toán), Payload (dữ liệu claims), Signature (chữ ký số). Sử dụng Access Token thời hạn ngắn kết hợp Refresh Token lưu trong HttpOnly Cookie.

================================================================================
CHƯƠNG 4: AN TOÀN VÀ BẢO MẬT ỨNG DỤNG WEB
- Phòng chống XSS (Cross-Site Scripting): Mã hóa đầu ra (Output Encoding), sử dụng Content Security Policy (CSP).
- Phòng chống CSRF (Cross-Site Request Forgery): Sử dụng Anti-CSRF Token và cờ `SameSite=Strict` trên Cookie.
- Phòng chống SQL Injection: Bắt buộc dùng ORM hoặc Parameterized Queries.

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT VHU:
Câu 1: So sánh Client-side Rendering (CSR) và Server-side Rendering (SSR)?
Đáp án: CSR trình duyệt tải mã JS trống về rồi mới gọi API vẽ HTML, ban đầu màn hình trắng lâu và SEO kém. SSR máy chủ biên dịch sẵn HTML hoàn chỉnh gửi về trình duyệt, người dùng xem được nội dung ngay tức thì, tối ưu tuyệt đối cho SEO và thiết bị yếu.
Câu 2: CORS (Cross-Origin Resource Sharing) là gì và cách trình duyệt thực thi?
Đáp án: CORS là cơ chế bảo mật trên trình duyệt ngăn chặn trang web nguồn này gọi API tới một domain khác. Trình duyệt gửi request `OPTIONS` (Preflight) để hỏi máy chủ xem có chấp thuận Header `Access-Control-Allow-Origin` hay không trước khi gửi request thực tế.

TÀI LIỆU THAM KHẢO:
1. Alex Banks & Eve Porcello, "Learning React", 2nd Edition, O'Reilly Media.
2. MDN Web Docs (Mozilla Developer Network), Official Web Documentation.
"""
    },
    {
        "code": "VHU_DIST",
        "name": "Lập trình Phân tán",
        "folder": "LẬP TRÌNH PHÂN TÁN",
        "credits": 3,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: HỆ THỐNG VÀ LẬP TRÌNH PHÂN TÁN (DISTRIBUTED SYSTEMS)
MÃ HỌC PHẦN: VHU_DIST | SỐ TÍN CHỈ: 3 TÍN CHỈ (30 LT + 30 TH)

================================================================================
CHƯƠNG 1: NỀN TẢNG HỆ THỐNG PHÂN TÁN
1.1. Định nghĩa và Đặc trưng:
Hệ thống phân tán là tập hợp các máy tính độc lập (Nodes) kết nối qua mạng máy tính, nhưng xuất hiện trước người dùng như một hệ thống thống nhất duy nhất.
Thách thức cốt lõi: Tính không đồng bộ thời gian (Clock Drift), độ trễ mạng không thể dự đoán, và lỗi phân vùng mạng (Network Partition).
1.2. Mô hình kiến trúc:
Client-Server, Peer-to-Peer (P2P - như BitTorrent, Blockchain), Kiến trúc hướng dịch vụ vi mô (Microservices).

================================================================================
CHƯƠNG 2: GIAO TIẾP VÀ HÀNG ĐỢI THÔNG ĐIỆP (RPC & MESSAGE BROKERS)
2.1. Triệu gọi thủ tục từ xa (Remote Procedure Call - RPC & gRPC):
Cho phép một chương trình gọi hàm thực thi trên máy tính từ xa như thể đang gọi hàm cục bộ. gRPC sử dụng giao thức HTTP/2 và định dạng nhị phân Protocol Buffers (protobuf) cho hiệu năng truyền tải vượt trội so với JSON REST.
2.2. Hàng đợi thông điệp bất đồng bộ (Message Queues):
Hệ thống Apache Kafka và RabbitMQ giúp tách rời (Decoupling) giữa bên sản xuất (Producer) và bên tiêu thụ (Consumer), san phẳng lưu lượng tăng đột biến (Traffic Spikes) và đảm bảo tính sẵn sàng cao.

================================================================================
CHƯƠNG 3: ĐỊNH LÝ CAP VÀ CÁC MÔ HÌNH NHẤT QUÁN
3.1. Định lý CAP (Eric Brewer):
Trong bất kỳ hệ thống dữ liệu phân tán nào, chỉ có thể thỏa mãn tối đa 2 trong 3 yếu tố:
- C (Consistency): Mọi nút đều đọc được cùng một dữ liệu mới nhất tại cùng một thời điểm.
- A (Availability): Mọi yêu cầu không bị lỗi đều nhận được phản hồi (không đảm bảo là dữ liệu mới nhất).
- P (Partition Tolerance): Hệ thống vẫn tiếp tục hoạt động bất chấp mạng bị ngắt kết nối giữa các nút.
Vì mạng thực tế luôn có khả năng bị lỗi phân đoạn (P), hệ thống bắt buộc phải đánh đổi giữa CP (chấp nhận từ chối phục vụ để bảo vệ nhất quán) hoặc AP (chấp nhận trả về dữ liệu cũ để duy trì phục vụ).
3.2. Mô hình nhất quán:
- Nhất quán mạnh (Strong Consistency): Dùng 2PC (Two-Phase Commit).
- Nhất quán cuối cùng (Eventual Consistency): Chấp nhận dữ liệu cập nhật trễ một khoảng thời gian ngắn (Mô hình BASE: Basically Available, Soft state, Eventual consistency).

================================================================================
CHƯƠNG 4: THUẬT TOÁN ĐỒNG THUẬN PHÂN TÁN (CONSENSUS ALGORITHMS)
4.1. Thuật toán Raft:
Cơ chế đồng thuận dễ hiểu, bầu chọn Leader (Leader Election), sao chép nhật ký (Log Replication), và đảm bảo an toàn trạng thái giữa cụm máy chủ.
4.2. Đồng thuận trong Blockchain:
Proof of Work (PoW - Bitcoin) và Proof of Stake (PoS - Solana/Ethereum), ngăn chặn gian lận chi tiêu kép (Double Spending).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT VHU:
Câu 1: Trình bày ý nghĩa định lý CAP trong việc lựa chọn cơ sở dữ liệu phân tán?
Đáp án: Khi mạng phân đoạn xảy ra (Partition P), hệ thống RDBMS truyền thống (PostgreSQL, MySQL) ưu tiên tính nhất quán (CP), sẵn sàng từ chối ghi để không sai lệch dữ liệu tài chính. Trong khi hệ thống NoSQL (Cassandra, DynamoDB) ưu tiên tính sẵn sàng (AP), cho phép người dùng tiếp tục thao tác và đồng bộ dữ liệu sau.
Câu 2: Saga Pattern giải quyết bài toán giao dịch phân tán trong Microservices như thế nào?
Đáp án: Thay vì khóa toàn bộ các bảng trên nhiều dịch vụ bằng Two-Phase Commit (gây nghẽn cổ chai), Saga chia giao dịch lớn thành chuỗi các giao dịch cục bộ. Nếu một bước thất bại, Saga sẽ kích hoạt chuỗi các giao dịch bù trừ (Compensating Transactions) để hoàn nguyên trạng thái.

TÀI LIỆU THAM KHẢO:
1. Martin Kleppmann, "Designing Data-Intensive Applications", O'Reilly Media.
2. Andrew S. Tanenbaum & Maarten van Steen, "Distributed Systems: Principles and Paradigms".
"""
    },
    {
        "code": "VHU_DB",
        "name": "Cơ sở Dữ liệu",
        "folder": "CƠ SỞ DỮ LIỆU",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: HỆ CƠ SỞ DỮ LIỆU QUAN HỆ VÀ TỐI ƯU HÓA TRUY VẤN
MÃ HỌC PHẦN: VHU_DB | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: MÔ HÌNH DỮ LIỆU QUAN HỆ VÀ ĐẠI SỐ QUAN HỆ
1.1. Khái niệm quan hệ, thuộc tính và bộ (Tuple):
Một bảng (Relation) gồm tập hợp các cột mang tên gọi Thuộc tính (Attribute) và các hàng gọi là Bộ (Tuple).
Khóa chính (Primary Key): Thuộc tính duy nhất xác định một bộ trong bảng, không được phép mang giá trị NULL.
Khóa ngoại (Foreign Key): Thuộc tính trỏ tới khóa chính của bảng khác để thiết lập mối liên kết toàn vẹn tham chiếu.
1.2. Các phép toán đại số quan hệ:
- Phép chọn (Select - σ): Lọc các dòng thỏa điều kiện.
- Phép chiếu (Project - π): Chọn các cột mong muốn.
- Phép kết nối (Join - ⋈): Kết hợp các bộ từ 2 quan hệ dựa trên điều kiện khóa chung.

================================================================================
CHƯƠNG 2: LÝ THUYẾT THIẾT KẾ VÀ CHUẨN HÓA DỮ LIỆU (NORMALIZATION)
Mục tiêu: Loại bỏ dư thừa dữ liệu, tránh các bất thường khi Thêm (Insertion Anomaly), Xóa (Deletion Anomaly), Sửa (Update Anomaly).
2.1. Chuẩn 1NF (Đệ nhất chuẩn):
Mọi giá trị thuộc tính trong bảng phải là giá trị nguyên tử (Atomic value), không chứa danh sách lặp lại hoặc mảng.
2.2. Chuẩn 2NF (Đệ nhị chuẩn):
Đạt 1NF và mọi thuộc tính không khóa phải phụ thuộc hàm đầy đủ vào khóa chính (không phụ thuộc vào một phần của khóa chính hợp thành).
2.3. Chuẩn 3NF (Đệ tam chuẩn):
Đạt 2NF và không tồn tại phụ thuộc hàm bắc cầu giữa các thuộc tính không khóa (X -> Y và Y -> Z).
2.4. Chuẩn Boyce-Codd (BCNF):
Đạt 3NF và với mọi phụ thuộc hàm không tầm thường X -> Y, X bắt buộc phải là một siêu khóa (Superkey).

================================================================================
CHƯƠNG 3: TRUY VẤN SQL NÂNG CAO VÀ CHỈ MỤC INDEX
3.1. Kỹ thuật truy vấn nâng cao:
Mệnh đề WITH (Common Table Expressions - CTE), các hàm phân tích cửa sổ (Window Functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LEAD()`, `LAG()` kết hợp mệnh đề `OVER(PARTITION BY ... ORDER BY ...)`).
3.2. Cấu trúc Chỉ mục B-Tree (B-Tree Index):
B-Tree tổ chức các nút khóa dạng cây tự cân bằng. Tra cứu dữ liệu theo phạm vi hoặc so sánh bằng với độ phức tạp O(log n), giảm thiểu tối đa số lần đọc ổ đĩa (Disk I/O). Phân biệt Clustered Index (sắp xếp vật lý bảng) và Non-Clustered Index.

================================================================================
CHƯƠNG 4: GIAO DỊCH VÀ BỐN ĐẶC TRƯNG ACID
Giao dịch (Transaction) là tập hợp các thao tác SQL được thực thi như một khối thống nhất:
- A (Atomicity - Tính nguyên tử): Hoặc thực hiện thành công toàn bộ, hoặc không thực hiện thao tác nào (`COMMIT` hoặc `ROLLBACK`).
- C (Consistency - Tính nhất quán): Chuyển cơ sở dữ liệu từ trạng thái hợp lệ này sang trạng thái hợp lệ khác, tuân thủ mọi ràng buộc dữ liệu.
- I (Isolation - Tính cô lập): Các giao dịch chạy đồng thời không can thiệp lẫn nhau. Các cấp độ cô lập: Read Uncommitted, Read Committed, Repeatable Read, Serializable.
- D (Durability - Tính bền vững): Khi giao dịch đã commit thành công, dữ liệu được ghi vĩnh viễn vào đĩa và cơ chế Write-Ahead Log (WAL) đảm bảo không mất mát kể cả khi máy chủ sập nguồn.

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Chuẩn hóa cơ sở dữ liệu từ 2NF lên 3NF được thực hiện như thế nào? Cho ví dụ?
Đáp án: Để đạt 3NF từ 2NF, ta tách các thuộc tính phụ thuộc bắc cầu ra thành một bảng riêng. Ví dụ: Bảng `SinhVien(MSSV, HoTen, MaLop, TenLop)` có phụ thuộc hàm `MSSV -> MaLop` và `MaLop -> TenLop`. Tách thành 2 bảng: `SinhVien(MSSV, HoTen, MaLop)` và `LopHoc(MaLop, TenLop)`.
Câu 2: So sánh Index B-Tree và Index Hash trong cơ sở dữ liệu?
Đáp án: Index Hash tính mã băm cực nhanh cho phép so sánh bằng `=` với thời gian O(1), nhưng hoàn toàn vô dụng cho truy vấn khoảng `<`, `>`, `BETWEEN` hoặc sắp xếp `ORDER BY`. Index B-Tree duy trì thứ tự khóa, tối ưu tuyệt đối cho cả truy vấn bằng, truy vấn khoảng và truy vấn tiền tố `LIKE 'abc%'`.

TÀI LIỆU THAM KHẢO:
1. Abraham Silberschatz et al., "Database System Concepts", 7th Edition, McGraw-Hill.
2. C.J. Date, "An Introduction to Database Systems", 8th Edition, Pearson.
"""
    },
    {
        "code": "VHU_OS",
        "name": "Hệ điều hành",
        "folder": "HỆ ĐIỀU HÀNH",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: NGUYÊN LÝ HỆ ĐIỀU HÀNH (OPERATING SYSTEMS PRINCIPLES)
MÃ HỌC PHẦN: VHU_OS | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: QUẢN LÝ TIẾN TRÌNH VÀ LUỒNG (PROCESS & THREAD)
1.1. Tiến trình (Process):
Tiến trình là một chương trình đang thực thi. Khối điều khiển tiến trình PCB (Process Control Block) lưu trữ: Định danh PID, Trạng thái (New, Ready, Running, Waiting, Terminated), Bộ đếm chương trình PC, Các thanh ghi CPU, Danh sách tài nguyên mở.
1.2. Luồng (Thread):
Đơn vị cơ bản sử dụng CPU, một tiến trình có thể chứa nhiều luồng cùng chia sẻ không gian địa chỉ bộ nhớ, vùng code, dữ liệu và tệp mở, nhưng mỗi luồng sở hữu thanh ghi và Stack riêng biệt.
1.3. Chuyển đổi ngữ cảnh (Context Switching):
Hệ điều hành lưu trạng thái của tiến trình hiện tại vào PCB và khôi phục trạng thái tiến trình mới được cấp phát CPU. Gây ra chi phí tiêu hao (Overhead).

================================================================================
CHƯƠNG 2: CÁC THUẬT TOÁN ĐỊNH THỜI CPU (CPU SCHEDULING)
2.1. Tiêu chuẩn đánh giá:
Tối đa hóa thông lượng (Throughput), tối thiểu hóa Thời gian hoàn thành (Turnaround Time), Thời gian chờ (Waiting Time), Thời gian đáp ứng (Response Time).
2.2. Các thuật toán định thời phổ biến:
- FCFS (First-Come, First-Served): Không ưu tiên độc quyền, dễ gặp hiệu ứng đoàn tàu (Convoy Effect).
- SJF (Shortest Job First) & SRTF (Shortest Remaining Time First): Tối ưu thời gian chờ trung bình, nhưng khó ước tính trước thời gian burst CPU.
- Round Robin (RR): Phân phối đều cho mỗi tiến trình một định mức thời gian (Time Quantum `q`). Nếu `q` quá lớn biến thành FCFS, nếu `q` quá nhỏ chi phí Context Switch sẽ làm tê liệt hệ thống.
- Hàng đợi đa mức phản hồi (Multilevel Feedback Queue - MLFQ).

================================================================================
CHƯƠNG 3: ĐỒNG BỘ HÓA TIẾN TRÌNH VÀ BẾ TẮC (SYNCHRONIZATION & DEADLOCK)
3.1. Vùng tương tranh (Critical Section):
Đoạn mã truy xuất dữ liệu dùng chung. Phải thỏa mãn 3 yêu cầu: Loại trừ lẫn nhau (Mutual Exclusion), Tiến triển (Progress), Chờ đợi có hạn (Bounded Waiting).
3.2. Công cụ đồng bộ:
- Khóa Mutex (Binary Lock): Khóa nhị phân chỉ cho phép 1 tiến trình sở hữu.
- Semaphore: Biến số nguyên đếm số lượng tài nguyên khả dụng. Thao tác `wait()` giảm bộ đếm, `signal()` tăng bộ đếm.
3.3. Bế tắc hệ thống (Deadlock):
Trạng thái mà hai hoặc nhiều tiến trình vĩnh viễn không thể tiếp tục thực thi vì mỗi tiến trình đang giữ tài nguyên và chờ tài nguyên do tiến trình kia nắm giữ.
4 điều kiện cần của Coffman để xảy ra Deadlock:
1. Loại trừ lẫn nhau (Mutual Exclusion).
2. Nắm giữ và chờ đợi (Hold and Wait).
3. Không thu hồi độc quyền (No Preemption).
4. Chờ đợi vòng tròn (Circular Wait).
Phòng tránh Deadlock bằng Thuật toán Banker của Dijkstra.

================================================================================
CHƯƠNG 4: QUẢN LÝ BỘ NHỚ ẢO (VIRTUAL MEMORY & PAGING)
4.1. Cơ chế Phân trang (Paging):
Không gian địa chỉ logic chia thành các Trang (Pages), bộ nhớ vật lý chia thành các Khung trang (Frames) cùng kích thước.
Bảng trang (Page Table) ánh xạ Page thành Frame. Bộ đệm dịch địa chỉ TLB (Translation Lookaside Buffer) tăng tốc ánh xạ địa chỉ.
4.2. Lỗi trang (Page Fault) và Thuật toán thay thế trang:
Khi trang yêu cầu chưa có trong RAM, hệ điều hành nạp từ đĩa.
Thuật toán thay thế: FIFO, LRU (Least Recently Used - xấp xỉ tối ưu), Optimal (lý thuyết).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Phân tích sự khác biệt cốt lõi giữa Process và Thread?
Đáp án: Process có không gian địa chỉ bộ nhớ riêng biệt và độc lập, lỗi crash của process này không ảnh hưởng process khác nhưng tốn kém chi phí khởi tạo và giao tiếp IPC. Thread chia sẻ chung không gian bộ nhớ của Process cha, tạo và giao tiếp cực nhanh nhưng nếu một luồng gây lỗi bộ nhớ có thể làm sập toàn bộ tiến trình.
Câu 2: Hiện tượng Thrashing trong quản lý bộ nhớ ảo là gì và cách khắc phục?
Đáp án: Thrashing là tình trạng hệ thống dành phần lớn thời gian để nạp và đẩy trang nhớ giữa RAM và đĩa thay vì thực thi lệnh thực tế, làm hiệu suất CPU giảm mạnh gần về 0. Khắc phục bằng mô hình tập làm việc (Working-Set Model) hoặc giảm bớt mức độ đa chương trình (Degree of Multiprogramming).

TÀI LIỆU THAM KHẢO:
1. Abraham Silberschatz et al., "Operating System Concepts", 10th Edition, Wiley.
2. Andrew S. Tanenbaum & Herbert Bos, "Modern Operating Systems", 4th Edition, Pearson.
"""
    },
    {
        "code": "VHU_ARC",
        "name": "Kiến trúc Máy tính",
        "folder": "KIẾN TRÚC MÁY TÍNH",
        "credits": 3,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: KIẾN TRÚC MÁY TÍNH VÀ HỢP NGỮ (COMPUTER ARCHITECTURE)
MÃ HỌC PHẦN: VHU_ARC | SỐ TÍN CHỈ: 3 TÍN CHỈ (30 LT + 30 TH)

================================================================================
CHƯƠNG 1: KIẾN TRÚC VON NEUMANN VÀ TẬP LỆNH MÁY
1.1. Mô hình kiến trúc Von Neumann:
Kiến trúc lưu trữ chương trình (Stored-program concept), gồm 5 thành phần chính: Khối tính toán ALU, Khối điều khiển CU, Bộ nhớ chính lưu trữ cả lệnh và dữ liệu trên cùng một không gian Bus, Thiết bị Nhập (Input) và Thiết bị Xuất (Output).
Hiện tượng Nghẽn cổ chai Von Neumann (Von Neumann Bottleneck): Tốc độ truyền tải của Bus không theo kịp tốc độ xử lý của CPU.
1.2. Chu trình thực thi lệnh (Instruction Cycle):
1. Fetch: Đọc mã lệnh từ ô nhớ mà con trỏ lệnh PC đang trỏ tới vào thanh ghi lệnh IR, tăng PC.
2. Decode: Bộ điều khiển giải mã mã máy Opcode thành tín hiệu vi lệnh.
3. Execute: ALU thực hiện tính toán số học/logic.
4. Memory: Truy xuất đọc/ghi bộ nhớ nếu lệnh yêu cầu.
5. Writeback: Ghi kết quả vào thanh ghi đích.

================================================================================
CHƯƠNG 2: KIẾN TRÚC TẬP LỆNH RISC VÀ CISC
- CISC (Complex Instruction Set Computer - x86 Intel/AMD): Tập lệnh phức tạp, nhiều chế độ địa chỉ hóa, kích thước lệnh thay đổi, một lệnh có thể thực hiện nhiều thao tác cấp thấp.
- RISC (Reduced Instruction Set Computer - ARM, Apple Silicon, RISC-V): Tập lệnh thu gọn, kích thước lệnh cố định (32-bit), chỉ có lệnh `LOAD` và `STORE` mới được truy xuất bộ nhớ, tối ưu hóa cho đường ống lệnh Pipeline.

================================================================================
CHƯƠNG 3: KỸ THUẬT ĐƯỜNG ỐNG LỆNH (PIPELINING)
Kỹ thuật cho phép thực thi gối đầu nhiều chỉ lệnh cùng lúc trên 5 chặng (IF, ID, EX, MEM, WB).
Các xung đột đường ống (Pipeline Hazards):
- Xung đột cấu trúc (Structural Hazard): Nhiều chỉ lệnh cùng tranh chấp một phần cứng (VD: Cùng truy xuất bộ nhớ).
- Xung đột dữ liệu (Data Hazard): Lệnh sau cần dữ liệu kết quả từ lệnh trước chưa kịp ghi về. Giải pháp: Kỹ thuật chuyển tiếp đường dẫn (Data Forwarding / Bypassing).
- Xung đột điều khiển (Control Hazard): Do lệnh nhảy có điều kiện làm sai lệch luồng lệnh nạp sẵn. Giải pháp: Dự đoán rẽ nhánh (Branch Prediction).

================================================================================
CHƯƠNG 4: HỆ THỐNG PHÂN CẤP BỘ NHỚ VÀ BỘ ĐỆM CACHE
4.1. Phân cấp bộ nhớ:
Registers -> Cache L1 -> Cache L2 -> Cache L3 -> RAM -> Ổ đĩa SSD/HDD.
4.2. Nguyên lý cục bộ (Locality of Reference):
- Cục bộ thời gian (Temporal Locality): Dữ liệu vừa truy cập có khả năng cao sẽ được truy cập lại sớm.
- Cục bộ không gian (Spatial Locality): Dữ liệu ở các ô nhớ lân cận ô nhớ vừa truy cập có khả năng cao sẽ được truy cập tiếp theo.
4.3. Tổ chức ánh xạ Cache:
Ánh xạ trực tiếp (Direct Mapped), Ánh xạ kết hợp đầy đủ (Fully Associative), và Ánh xạ kết hợp tập hợp (Set-Associative).
Chính sách ghi: Write-Through (ghi đồng thời cả Cache và RAM) và Write-Back (chỉ ghi vào Cache, ghi xuống RAM khi block bị thay thế).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT VHU:
Câu 1: Kỹ thuật Data Forwarding giải quyết xung đột dữ liệu (Data Hazard) trong Pipeline như thế nào?
Đáp án: Thay vì bắt các lệnh sau phải dừng hoạt động (Stall) chờ lệnh trước ghi kết quả về thanh ghi ở chặng Writeback (WB), Forwarding lấy trực tiếp kết quả ngay từ đầu ra của khối ALU chặng Execute (EX) đưa thẳng sang đầu vào chặng EX của lệnh kế tiếp.
Câu 2: So sánh chính sách ghi Cache Write-Through và Write-Back?
Đáp án: Write-Through ghi tức thì xuống bộ nhớ chính, đảm bảo dữ liệu luôn đồng nhất nhưng tốc độ ghi chậm do phụ thuộc băng thông bus. Write-Back chỉ đánh dấu bit bẩn (Dirty bit) và ghi xuống bộ nhớ chính khi block bị đẩy ra ngoài, tốc độ ghi cực nhanh nhưng phức tạp và có nguy cơ mất dữ liệu nếu mất điện đột ngột.

TÀI LIỆU THAM KHẢO:
1. David A. Patterson & John L. Hennessy, "Computer Organization and Design: The Hardware/Software Interface", 6th Edition, Morgan Kaufmann.
2. William Stallings, "Computer Organization and Architecture", 11th Edition, Pearson.
"""
    },
    {
        "code": "VHU_NET",
        "name": "Mạng Máy tính",
        "folder": "MẠNG MÁY TÍNH",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: MẠNG MÁY TÍNH VÀ TRUYỀN THÔNG SỐ (COMPUTER NETWORKING)
MÃ HỌC PHẦN: VHU_NET | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: MÔ HÌNH THAM CHIẾU 7 TẦNG OSI VÀ MÔ HÌNH TCP/IP
1.1. Mô hình OSI (Open Systems Interconnection):
- Tầng 7 - Ứng dụng (Application): HTTP/HTTPS, FTP, SMTP, DNS, SSH.
- Tầng 6 - Trình diễn (Presentation): Nén dữ liệu, mã hóa và định dạng SSL/TLS.
- Tầng 5 - Phiên (Session): Thiết lập, duy trì và giải phóng phiên truyền thông.
- Tầng 4 - Giao vận (Transport): Đóng gói Segment, điều khiển truyền tin đầu cuối (TCP, UDP).
- Tầng 3 - Mạng (Network): Đóng gói Packet, định địa chỉ logic IP và định tuyến gói tin (IP, ICMP, OSPF, BGP).
- Tầng 2 - Liên kết dữ liệu (Data Link): Đóng gói Frame, quản lý địa chỉ vật lý MAC, phát hiện lỗi CRC (Ethernet, Wi-Fi).
- Tầng 1 - Vật lý (Physical): Truyền tải dòng bit nhị phân qua môi trường truyền dẫn (cáp quang, cáp xoắn đôi, sóng radio).
1.2. Quá trình Đóng gói dữ liệu (Encapsulation) và Mở gói (Decapsulation):
Dữ liệu di chuyển từ tầng 7 xuống tầng 1 được bổ sung Header/Trailer tương ứng tại mỗi tầng.

================================================================================
CHƯƠNG 2: TẦNG GIAO VẬN (TRANSPORT LAYER: TCP VS UDP)
2.1. Giao thức TCP (Transmission Control Protocol):
- Hướng kết nối (Connection-oriented), quá trình bắt tay 3 bước (Three-way Handshake):
  1. Client gửi cờ `SYN` (Sequence Number x).
  2. Server phản hồi cờ `SYN-ACK` (Sequence Number y, Ack x + 1).
  3. Client gửi cờ `ACK` (Ack y + 1) để hoàn tất kết nối.
- Đảm bảo độ tin cậy: Đánh số thứ tự gói tin, truyền lại gói tin mất (Retransmission), kiểm soát luồng (Flow Control qua Sliding Window) và kiểm soát nghẽn (Congestion Control: Slow Start, Congestion Avoidance).
2.2. Giao thức UDP (User Datagram Protocol):
Phi kết nối (Connectionless), không có bắt tay, không đảm bảo thứ tự và không gửi lại khi mất gói. Ưu điểm: Tiêu đề nhẹ (8 bytes so với 20 bytes của TCP), độ trễ cực thấp, tối ưu cho Video streaming, VoIP, Gaming trực tuyến và truy vấn DNS.

================================================================================
CHƯƠNG 3: TẦNG MẠNG VÀ PHÂN ĐỊA CHỈ IP (IP ADDRESSING & SUBNETTING)
3.1. Địa chỉ IPv4:
Độ dài 32 bit, chia làm 4 Octet (VD: `192.168.1.1`).
Kỹ thuật phân đoạn mạng con CIDR (Classless Inter-Domain Routing): Sử dụng Subnet Mask xác định phần Network ID và Host ID (VD: `/24` tương ứng `255.255.255.0` cho phép tối đa 254 máy tính).
Phân biệt IP công cộng (Public IP) và IP cục bộ riêng tư (Private IP: dải 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).
3.2. Cơ chế NAT (Network Address Translation):
Ánh xạ nhiều địa chỉ IP Private trong mạng nội bộ ra một hoặc một vài địa chỉ IP Public duy nhất khi ra ngoài Internet.
3.3. Địa chỉ IPv6:
Độ dài 128 bit, viết dưới dạng 8 nhóm số thập lục phân ngăn cách bằng dấu hai chấm. Giải quyết triệt để vấn đề cạn kiệt địa chỉ IPv4 toàn cầu.

================================================================================
CHƯƠNG 4: CÁC DỊCH VỤ ỨNG DỤNG MẠNG THÔNG DỤNG
Hệ thống phân giải tên miền DNS (Domain Name System - chuyển đổi URL thành IP), Giao thức cấp phát địa chỉ IP động DHCP, Giao thức truyền tải web bảo mật HTTPS (HTTP over TLS port 443).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Giải thích chi tiết quá trình bắt tay 3 bước (3-way handshake) của giao thức TCP?
Đáp án: Mục đích của bắt tay 3 bước là đồng bộ hóa số thứ tự khởi tạo (Initial Sequence Number - ISN) và cấp phát bộ nhớ đệm kết nối ở cả 2 phía. Bước 1: Client gửi gói tin có cờ SYN và số thứ tự seq=x. Bước 2: Server nhận được, cấp phát buffer và phản hồi lại cờ SYN-ACK với seq=y và ack=x+1. Bước 3: Client nhận được và gửi gói tin xác nhận ACK với ack=y+1. Kết nối chính thức chuyển sang trạng thái ESTABLISHED.
Câu 2: Subnetting mạng `192.168.10.0/26` có bao nhiêu địa chỉ IP khả dụng cho các thiết bị host?
Đáp án: Mask `/26` có 26 bit mạng và 32 - 26 = 6 bit dành cho host. Tổng số địa chỉ là 2^6 = 64. Trừ đi 2 địa chỉ đặc biệt là Network Address (địa chỉ đầu) và Broadcast Address (địa chỉ cuối), số địa chỉ IP khả dụng thực tế là 64 - 2 = 62 địa chỉ.

TÀI LIỆU THAM KHẢO:
1. James F. Kurose & Keith W. Ross, "Computer Networking: A Top-Down Approach", 8th Edition, Pearson.
2. Andrew S. Tanenbaum & David J. Wetherall, "Computer Networks", 5th Edition, Pearson.
"""
    },
    {
        "code": "VHU_SEC",
        "name": "An toàn Mạng và Thông tin",
        "folder": "AN TOÀN THÔNG TIN",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: AN TOÀN VÀ BẢO MẬT HỆ THỐNG THÔNG TIN (CYBERSECURITY)
MÃ HỌC PHẦN: VHU_SEC | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: NGUYÊN LÝ BẢO MẬT VÀ TAM GIÁC AN TOÀN THÔNG TIN (CIA TRIAD)
1.1. Tam giác CIA:
- Confidentiality (Tính bí mật): Ngăn chặn rò rỉ dữ liệu cho các đối tượng không có thẩm quyền. Giải pháp: Mã hóa, kiểm soát truy cập (Access Control Lists).
- Integrity (Tính toàn vẹn): Đảm bảo thông tin không bị sửa đổi, chèn ép hay giả mạo bất hợp pháp. Giải pháp: Hàm băm mật mã, Chữ ký số.
- Availability (Tính sẵn sàng): Đảm bảo hệ thống và dữ liệu luôn có thể truy cập khi người dùng hợp lệ yêu cầu. Giải pháp: Hệ thống dự phòng (Redundancy), cân bằng tải, giải pháp chống tấn công từ chối dịch vụ DDoS.
1.2. Xác thực (Authentication) và Cấp quyền (Authorization):
Xác thực xác nhận danh tính ("Bạn là ai?" - qua mật khẩu, MFA, sinh trắc học). Cấp quyền xác định quyền hạn ("Bạn được làm gì?" - qua RBAC Role-Based Access Control).

================================================================================
CHƯƠNG 2: MẬT MÃ HỌC HIỆN ĐẠI (MODERN CRYPTOGRAPHY)
2.1. Mã hóa đối xứng (Symmetric Encryption):
Dùng chung một khóa bí mật cho cả quá trình mã hóa và giải mã.
Tiêu chuẩn mã hóa tiên tiến AES (Advanced Encryption Standard - kích thước khóa 128/192/256 bits, cấu trúc mạng thay thế hoán vị SPN). Chế độ hoạt động: CBC (Cipher Block Chaining) và GCM (Galois/Counter Mode - mã hóa có kèm xác thực AEAD).
2.2. Mã hóa bất đối xứng (Asymmetric Encryption):
Sử dụng cặp khóa công khai (Public Key - dùng mã hóa) và khóa riêng tư (Private Key - dùng giải mã).
Thuật toán RSA (dựa trên độ khó của bài toán phân tích số nguyên tố cực lớn), Mật mã đường cong Elliptic (ECC - kích thước khóa nhỏ hơn hàng chục lần RSA nhưng cùng độ an toàn).
2.3. Hàm băm mật mã và Chữ ký số:
Hàm băm một chiều (SHA-256): Tính chất chống tiền ảnh (Pre-image Resistance) và chống đụng độ (Collision Resistance).
Chữ ký số (Digital Signature): Người gửi băm văn bản rồi mã hóa mã băm bằng Private Key của mình. Người nhận dùng Public Key của người gửi để xác thực danh tính và tính toàn vẹn văn bản.

================================================================================
CHƯƠNG 3: CÁC KỸ THUẬT TẤN CÔNG MẠNG VÀ CƠ CHẾ PHÒNG THỦ
3.1. Tấn công ứng dụng Web (OWASP Top 10):
- SQL Injection (SQLi): Kẻ tấn công tiêm mã SQL độc hại qua ô nhập liệu. Phòng thủ: Luôn sử dụng Parameterized Query / ORM.
- Cross-Site Scripting (XSS): Tiêm mã JavaScript độc hại thực thi trên trình duyệt nạn nhân nhằm đánh cắp Cookie phiên làm việc.
- Cross-Site Request Forgery (CSRF): Đánh lừa trình duyệt người dùng đã đăng nhập gửi request gian lận.
3.2. Tấn công từ chối dịch vụ phân tán (DDoS):
SYN Flood (làm tràn bộ nhớ hàng đợi kết nối TCP của máy chủ), UDP Flood, HTTP GET/POST Flood. Giải pháp: Sử dụng Cloudflare, hệ thống Anycast DNS, tường lửa phân tích gói tin sâu DPI.

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Trình bày cơ chế hoạt động của Chữ ký số (Digital Signature) và cách nó đảm bảo cả tính toàn vẹn lẫn tính chống chối bỏ?
Đáp án: Để tạo chữ ký số, người gửi dùng thuật toán băm (SHA-256) tạo thông điệp digest rồi mã hóa digest này bằng Private Key của chính mình. Người nhận lấy Public Key của người gửi để giải mã chữ ký thành digest ban đầu, đồng thời tự băm văn bản nhận được để so sánh 2 digest. Nếu trùng nhau: đảm bảo văn bản không bị sửa đổi (Tính toàn vẹn) và chứng minh duy nhất người gửi sở hữu Private Key đã ký văn bản này (Tính chống chối bỏ).
Câu 2: So sánh tốc độ và trường hợp ứng dụng giữa mã hóa đối xứng (AES) và mã hóa bất đối xứng (RSA)?
Đáp án: Mã hóa đối xứng AES có tốc độ tính toán phần cứng cực nhanh (hơn RSA hàng nghìn lần), phù hợp mã hóa khối lượng dữ liệu khổng lồ (ổ đĩa, video streaming). Mã hóa bất đối xứng RSA tốn tài nguyên tính toán số mũ lớn nên chỉ được dùng để trao đổi an toàn khóa đối xứng phiên (Symmetric Session Key) và ký số trong giao thức TLS/HTTPS.

TÀI LIỆU THAM KHẢO:
1. William Stallings, "Cryptography and Network Security: Principles and Practice", 8th Edition, Pearson.
2. OWASP Foundation, "OWASP Top 10 Web Application Security Risks".
"""
    },
    {
        "code": "VHU_AI",
        "name": "Trí tuệ Nhân tạo",
        "folder": "TRÍ TUỆ NHÂN TẠO",
        "credits": 4,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: TRÍ TUỆ NHÂN TẠO VÀ HỌC MÁY (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)
MÃ HỌC PHẦN: VHU_AI | SỐ TÍN CHỈ: 4 TÍN CHỈ (45 LT + 30 TH)

================================================================================
CHƯƠNG 1: TỔNG QUAN VỀ TRÍ TUỆ NHÂN TẠO VÀ TÌM KIẾM KHÔNG GIAN TRẠNG THÁI
1.1. Khái niệm và Định nghĩa:
Trí tuệ Nhân tạo (AI) là phân ngành khoa học máy tính nhằm xây dựng các hệ thống tác tử thông minh (Intelligent Agents) có khả năng nhận thức môi trường và hành động tối ưu để đạt mục tiêu.
1.2. Các giải thuật tìm kiếm mù (Uninformed Search):
- Tìm kiếm theo chiều rộng (Breadth-First Search - BFS): Sử dụng hàng đợi FIFO, bảo đảm tìm ra đường đi ngắn nhất nếu mọi bước có cùng chi phí. Nhược điểm: Tốn bộ nhớ O(b^d).
- Tìm kiếm theo chiều sâu (Depth-First Search - DFS): Sử dụng Stack/Đệ quy, tiết kiệm bộ nhớ O(b*m) nhưng không bảo đảm tính tối ưu và dễ rơi vào vòng lặp vô tận.
1.3. Giải thuật tìm kiếm có thông tin (Heuristic Search) và Thuật toán A*:
Thuật toán A* sử dụng hàm đánh giá chi phí tổng thể:
f(n) = g(n) + h(n)
Trong đó:
- g(n): Chi phí thực tế đã đi từ trạng thái bắt đầu đến nút n hiện tại.
- h(n): Chi phí Heuristic ước lượng từ nút n đến trạng thái đích (Goal).
ĐIỀU KIỆN TỐI ƯU CỦA THUẬT TOÁN A*:
- Tính chấp nhận được (Admissibility): Hàm h(n) không bao giờ đánh giá vượt quá chi phí thực tế (0 <= h(n) <= h*(n)).
- Tính nhất quán (Consistency / Monotonicity): Với mọi nút n và nút kế tiếp n' qua hành động có chi phí c: h(n) <= c(n, a, n') + h(n'). Khi h(n) nhất quán, A* chạy trên đồ thị đảm bảo tìm ra đường đi tối ưu nhất mà không cần phải duyệt lại các nút đã đóng.

================================================================================
CHƯƠNG 2: HỌC MÁY CƠ BẢN (MACHINE LEARNING ALGORITHMS)
2.1. Học có giám sát (Supervised Learning - Dữ liệu có gán nhãn):
- Bài toán Hồi quy (Regression): Dự đoán giá trị liên tục. Hồi quy tuyến tính (Linear Regression) với hàm mất mát MSE và giải thuật hạ độ dốc (Gradient Descent).
- Bài toán Phân loại (Classification): Dự đoán nhãn rời rạc. Hồi quy Logistic (Sigmoid function), Cây quyết định (Decision Tree dựa trên Entropy và Information Gain), Support Vector Machines (SVM tối đa hóa lề Margin bằng Kernel trick).
2.2. Học không giám sát (Unsupervised Learning - Dữ liệu không nhãn):
- Phân cụm K-Means: Phân chia tập dữ liệu thành K cụm dựa trên khoảng cách Euclidean đến tâm cụm Centroid.
- Giảm chiều dữ liệu PCA (Principal Component Analysis): Chiếu dữ liệu lên các trục thành phần chính bảo toàn phương sai tối đa.
2.3. Đánh giá mô hình và Hiện tượng Overfitting:
- Độ đo: Accuracy, Precision, Recall, F1-Score, ROC-AUC.
- Overfitting: Mô hình học vẹt thuộc lòng tập huấn luyện nhưng dự đoán kém trên tập kiểm thử. Khắc phục bằng: Regularization L1 (Lasso) / L2 (Ridge), Dropout, Early Stopping, Thu thập thêm dữ liệu hoặc Data Augmentation.

================================================================================
CHƯƠNG 3: HỌC SÂU VÀ MÔ HÌNH NGÔN NGỮ LỚN (DEEP LEARNING & LLMS)
3.1. Mạng nơ-ron nhân tạo:
Mô hình Perceptron, Mạng nơ-ron nhiều tầng (MLP), Hàm kích hoạt phi tuyến tính (ReLU, Sigmoid, Softmax), Lan truyền ngược (Backpropagation) tính đạo hàm riêng điều chỉnh trọng số Weights.
3.2. Mạng nơ-ron tích chập (CNN - Convolutional Neural Networks):
Sử dụng các lớp tích chập (Convolution Layers), lớp gộp (Pooling) trích xuất đặc trưng không gian, ứng dụng hàng đầu trong Thị giác máy tính (Computer Vision - nhận diện khuôn mặt, phân loại ảnh y tế).
3.3. Kiến trúc Transformer và Attention Mechanism:
Cơ chế tự chú ý (Self-Attention) tính toán mối tương quan ngữ nghĩa giữa tất cả các từ trong câu đồng thời, vượt qua giới hạn tuần tự của mạng RNN/LSTM, tạo nền móng cho các Mô hình Ngôn ngữ Lớn LLM (GPT, Gemini, Claude, LLaMA).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Phân tích nguyên lý hoạt động của thuật toán A* và giải thích tại sao hàm Heuristic phải thỏa mãn tính chấp nhận được (Admissible)?
Đáp án: Thuật toán A* chọn nút có giá trị f(n) = g(n) + h(n) nhỏ nhất trong tập Open list để mở rộng. Nếu hàm Heuristic h(n) chấp nhận được (không bao giờ ước lượng chi phí lớn hơn chi phí thực tế h*(n)), A* bảo đảm tìm ra đường đi ngắn nhất đến đích vì nó không bao giờ bỏ qua một nhánh đi tối ưu tiềm năng do ước tính chi phí quá đắt đỏ.
Câu 2: Phân biệt hiện tượng Overfitting và Underfitting trong học máy và các giải pháp khắc phục tương ứng?
Đáp án: Underfitting xảy ra khi mô hình quá đơn giản (độ lệch Bias cao), không học được cấu trúc của dữ liệu ngay trên tập train. Khắc phục bằng cách tăng độ phức tạp mô hình, thêm đặc trưng. Overfitting xảy ra khi mô hình quá phức tạp (phương sai Variance cao), khớp cả nhiễu của tập train. Khắc phục bằng Regularization L2, kỹ thuật K-Fold Cross Validation, Dropout trong mạng nơ-ron và giảm bớt số chiều đặc trưng.

TÀI LIỆU THAM KHẢO:
1. Stuart Russell & Peter Norvig, "Artificial Intelligence: A Modern Approach", 4th Edition, Pearson.
2. Ian Goodfellow, Yoshua Bengio & Aaron Courville, "Deep Learning", MIT Press.
"""
    },
    {
        "code": "VHU_SAD",
        "name": "Phân tích và Thiết kế Hệ thống",
        "folder": "PHÂN TÍCH THIẾT KẾ HỆ THỐNG",
        "credits": 3,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG THÔNG TIN (SYSTEM ANALYSIS & DESIGN)
MÃ HỌC PHẦN: VHU_SAD | SỐ TÍN CHỈ: 3 TÍN CHỈ (30 LT + 30 TH)

================================================================================
CHƯƠNG 1: VÒNG ĐỜI PHÁT TRIỂN PHẦN MỀM (SDLC) VÀ MÔ HÌNH AGILE/SCRUM
1.1. Các pha cơ bản trong SDLC:
1. Khảo sát hiện trạng và Phân tích tính khả thi (Feasibility Study: Kỹ thuật, Kinh tế, Pháp lý).
2. Thu thập và Phân tích yêu cầu nghiệp vụ (Requirements Engineering).
3. Thiết kế kiến trúc và hệ thống (Architecture & System Design).
4. Cài đặt và Lập trình (Implementation / Coding).
5. Kiểm thử phần mềm (Testing: Unit Test, Integration Test, System Test, UAT).
6. Triển khai và Bảo trì (Deployment & Maintenance).
1.2. Mô hình Waterfall vs Mô hình Agile/Scrum:
Mô hình Thác nước (Waterfall) tuần tự tuyến tính phù hợp dự án có yêu cầu bất biến. Phương pháp Agile chia dự án thành các chu kỳ ngắn Sprint (1-4 tuần), thích ứng linh hoạt trước thay đổi nghiệp vụ của khách hàng.

================================================================================
CHƯƠNG 2: NGÔN NGỮ MÔ HÌNH HÓA THỐNG NHẤT (UML CHUYÊN SÂU)
2.1. Biểu đồ Use Case (Use Case Diagram):
Mô tả chức năng từ góc nhìn của tác nhân (Actor).
Quan hệ giữa các Use Case:
- Quan hệ `<<include>>`: Hành vi bắt buộc phải có của Use Case cha (VD: "Đặt hàng" luôn include "Thanh toán").
- Quan hệ `<<extend>>`: Hành vi mở rộng tùy chọn khi thỏa mãn điều kiện mở rộng Extension Point (VD: "Đặt hàng" extend "Nhập mã khuyến mãi").
2.2. Biểu đồ Lớp (Class Diagram):
Mô tả cấu trúc tĩnh của hệ thống.
Các loại quan hệ giữa các lớp:
- Association (Liên kết): Quan hệ thông thường giữa 2 thực thể độc lập.
- Aggregation (Thu nạp - Hình thoi rỗng): Quan hệ "has-a", phần tử con có thể tồn tại độc lập khi phần tử cha bị hủy (VD: "Lớp học" và "Sinh viên").
- Composition (Hợp thành - Hình thoi đặc): Quan hệ sở hữu chặt chẽ, phần tử con chết theo khi phần tử cha bị hủy (VD: "Hóa đơn" và "Chi tiết hóa đơn").
- Generalization (Tổng quát hóa - Kế thừa).
2.3. Biểu đồ Tuần tự (Sequence Diagram):
Mô tả sự tương tác động giữa các đối tượng theo dòng thời gian. Thành phần: Đường sống (Lifeline), Hộp kích hoạt (Activation Box), Thông điệp đồng bộ/bất đồng bộ.
2.4. Biểu đồ Hoạt động (Activity Diagram):
Mô tả luồng điều khiển nghiệp vụ, các nhánh rẽ điều kiện (Decision) và các điểm phân nhánh song song (Fork/Join).

================================================================================
CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC PHẦN MỀM VÀ CƠ SỞ DỮ LIỆU
Thiết kế kiến trúc phân lớp (3-Tier: Presentation, Business Logic, Data Access), Kiến trúc hướng sự kiện (Event-Driven), và Thiết kế sơ đồ quan hệ thực thể (ERD).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT VHU:
Câu 1: Phân biệt rõ sự khác nhau giữa quan hệ `<<include>>` và `<<extend>>` trong biểu đồ Use Case?
Đáp án: Quan hệ `<<include>>` thể hiện một chức năng con bắt buộc phải chạy mỗi khi Use Case cơ sở được thực thi; luồng xử lý không thể hoàn tất nếu thiếu Use Case include. Trong khi đó, quan hệ `<<extend>>` chỉ kích hoạt chức năng mở rộng khi xảy ra một điều kiện ngoại lệ hoặc hành động tự nguyện tùy chọn của người dùng tại điểm mở rộng.
Câu 2: Phân biệt quan hệ Aggregation (Thu nạp) và Composition (Hợp thành) trong biểu đồ Class Diagram?
Đáp án: Aggregation biểu thị sự kết hợp yếu, vòng đời của đối tượng thành phần độc lập với đối tượng chứa nó. Composition biểu thị sự sở hữu mạnh mẽ và độc quyền, đối tượng thành phần sinh ra cùng đối tượng chứa và sẽ bị tiêu hủy ngay khi đối tượng chứa bị xóa khỏi bộ nhớ.

TÀI LIỆU THAM KHẢO:
1. Ian Sommerville, "Software Engineering", 10th Edition, Pearson.
2. Martin Fowler, "UML Distilled: A Brief Guide to the Standard Object Modeling Language".
"""
    },
    {
        "code": "VHU_ALGO",
        "name": "Phân tích và Thiết kế Thuật toán",
        "folder": "PHÂN TÍCH THIẾT KẾ THUẬT TOÁN",
        "credits": 3,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: PHÂN TÍCH VÀ THIẾT KẾ THUẬT TOÁN NÂNG CAO (ALGORITHM DESIGN & ANALYSIS)
MÃ HỌC PHẦN: VHU_ALGO | SỐ TÍN CHỈ: 3 TÍN CHỈ (30 LT + 30 TH)

================================================================================
CHƯƠNG 1: CHIẾN LƯỢC CHIA ĐỂ TRỊ VÀ ĐỊNH LÝ MASTER THEOREM
1.1. Bản chất phương pháp Chia để trị (Divide and Conquer):
1. Divide: Chia bài toán lớn thành các bài toán con cùng dạng có kích thước nhỏ hơn.
2. Conquer: Giải đệ quy các bài toán con. Nếu bài toán con đủ nhỏ (Base case), giải trực tiếp.
3. Combine: Kết hợp nghiệm của các bài toán con thành nghiệm của bài toán gốc.
1.2. Định lý Thợ (Master Theorem):
Áp dụng giải hệ thức truy hồi dạng: T(n) = a * T(n/b) + f(n) (với a >= 1, b > 1):
- Trường hợp 1: Nếu f(n) = O(n^(log_b(a) - ε)) với ε > 0 thì T(n) = Θ(n^log_b(a)).
- Trường hợp 2: Nếu f(n) = Θ(n^log_b(a) * log^k(n)) thì T(n) = Θ(n^log_b(a) * log^(k+1)(n)).
- Trường hợp 3: Nếu f(n) = Ω(n^(log_b(a) + ε)) và thỏa điều kiện đều thì T(n) = Θ(f(n)).

================================================================================
CHƯƠNG 2: PHƯƠNG PHÁP QUY HOẠCH ĐỘNG (DYNAMIC PROGRAMMING)
2.1. Hai điều kiện bắt buộc để áp dụng Quy hoạch động:
1. Cấu trúc con tối ưu (Optimal Substructure): Nghiệm tối ưu của bài toán chứa trong nó nghiệm tối ưu của các bài toán con cấp thấp hơn.
2. Các bài toán con gối nhau (Overlapping Subproblems): Quá trình tính toán đệ quy phải tính đi tính lại cùng một bài toán con nhiều lần.
2.2. Kỹ thuật tiếp cận:
- Top-Down có nhớ (Memoization): Sử dụng đệ quy tự nhiên kết hợp lưu mảng/bảng băm kết quả đã tính.
- Bottom-Up bảng tính (Tabulation): Khởi tạo mảng nghiệm từ cơ sở rồi duyệt vòng lặp tính dần lên nghiệm bài toán lớn.
2.3. Các bài toán kinh điển:
Dãy con tăng dài nhất (Longest Increasing Subsequence - LIS O(n log n)), Xâu con chung dài nhất (LCS), Bài toán chiếc Balo 0/1 (0/1 Knapsack Problem).

================================================================================
CHƯƠNG 3: THUẬT TOÁN THAM LAM, QUAY LUI VÀ NHÁNH CẬN
3.1. Thuật toán Tham lam (Greedy Strategy):
Đưa ra lựa chọn tối ưu cục bộ tại mỗi bước với hy vọng dẫn tới nghiệm tối ưu toàn cục. Đạt hiệu quả cao trên Bài toán Cây khung nhỏ nhất (Kruskal, Prim) và Mã hóa nén dữ liệu Huffman.
3.2. Quay lui (Backtracking) và Nhánh cận (Branch and Bound):
Duyệt không gian trạng thái dạng cây, tỉa bớt các nhánh không thỏa mãn ràng buộc (Pruning) để tiết kiệm thời gian. Ứng dụng giải bài toán N-Queens, Sudoku, Người du lịch (Traveling Salesman Problem - TSP).

================================================================================
CHƯƠNG 4: LÝ THUYẾT ĐỘ PHỨC TẠP BÀI TOÁN (P, NP, NP-COMPLETE)
- Lớp P: Các bài toán quyết định giải được trong thời gian đa thức O(n^k).
- Lớp NP: Các bài toán có thể kiểm tra tính đúng đắn của một nghiệm đề xuất trong thời gian đa thức.
- Lớp NP-Complete: Các bài toán khó nhất trong NP mà mọi bài toán NP khác đều có thể quy dẫn đa thức về nó (VD: SAT, Knapsack, TSP).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Phân biệt sự khác nhau giữa thuật toán Tham lam (Greedy) và Quy hoạch động (Dynamic Programming)?
Đáp án: Thuật toán Tham lam đưa ra quyết định tối ưu cục bộ tại mỗi bước mà không bao giờ thay đổi lại quyết định cũ, chạy nhanh hơn nhưng không phải lúc nào cũng ra kết quả tối ưu toàn cục. Quy hoạch động xem xét toàn diện tất cả các bài toán con gối nhau, đảm bảo tuyệt đối tìm ra nghiệm tối ưu toàn cục nhờ lưu trữ bảng nghiệm con.
Câu 2: Dùng Master Theorem tính độ phức tạp của giải thuật MergeSort: T(n) = 2T(n/2) + O(n)?
Đáp án: Ta có a = 2, b = 2, f(n) = n. Tính n^(log_b(a)) = n^(log_2(2)) = n^1 = n. Vì f(n) = Θ(n^1) tương ứng trường hợp 2 của Master Theorem (k=0), suy ra độ phức tạp T(n) = Θ(n log n).

TÀI LIỆU THAM KHẢO:
1. Jon Kleinberg & Éva Tardos, "Algorithm Design", Pearson.
2. Sanjoy Dasgupta et al., "Algorithms", McGraw-Hill.
"""
    },
    {
        "code": "VHU_PROJ",
        "name": "Đồ án Chuyên ngành & Tốt nghiệp CNTT",
        "folder": "ĐỒ ÁN TỐT NGHIỆP",
        "credits": 10,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
QUY CHẾ VÀ HƯỚNG DẪN BẢO VỆ ĐỒ ÁN CHUYÊN NGÀNH VÀ KHÓA LUẬN TỐT NGHIỆP
TÊN HỌC PHẦN: ĐỒ ÁN TỐT NGHIỆP CÔNG NGHỆ THÔNG TIN
MÃ HỌC PHẦN: VHU_PROJ | SỐ TÍN CHỈ: 10 TÍN CHỈ

================================================================================
PHẦN 1: ĐIỀU KIỆN ĐĂNG KÝ VÀ QUY TRÌNH THỰC HIỆN ĐỒ ÁN VHU
1.1. Điều kiện sinh viên được nhận đồ án tốt nghiệp:
- Đã tích lũy tối thiểu 110 tín chỉ trong chương trình đào tạo kỹ sư CNTT Văn Hiến.
- Điểm trung bình tích lũy CPA đạt từ 2.0 trở lên, không vi phạm kỷ luật hay nợ học phí.
1.2. Quy trình thực hiện qua các mốc thời gian:
- Tuần 1 - 2: Đăng ký tên đề tài và nhận phân công Giảng viên hướng dẫn (GVHD).
- Tuần 3 - 4: Nộp đề cương chi tiết (Outline) và sơ đồ kiến trúc hệ thống sơ bộ.
- Tuần 8 (Báo cáo tiến độ lần 1): Trình bày thiết kế CSDL, giao diện mẫu và API backend cốt lõi.
- Tuần 12 (Báo cáo tiến độ lần 2): Demo tính năng thực tế, kiểm thử tải và mã nguồn trên GitHub.
- Tuần 14: Nộp toàn văn cuốn báo cáo và mã nguồn để Giảng viên phản biện (GVPB) chấm duyệt.
- Tuần 16: Bảo vệ chính thức trước Hội đồng chấm khóa luận tốt nghiệp cấp Khoa.

================================================================================
PHẦN 2: QUY CHUẨN ĐỊNH DẠNG VÀ CẤU TRÚC CUỐN BÁO CÁO
2.1. Quy chuẩn văn bản:
Font chữ Times New Roman kích thước 13pt, giãn dòng 1.5 lines, lề trái 3.5cm (để đóng gáy), lề phải 2.0cm, lề trên 2.0cm, lề dưới 2.0cm.
2.2. Bố cục 5 chương bắt buộc:
- Lời cam đoan và Lời cảm ơn.
- Mục lục, Danh mục bảng biểu, Danh mục hình vẽ, Danh mục từ viết tắt.
- CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ MÔI TRƯỜNG ỨNG DỤNG (Lý do chọn đề tài, khảo sát hệ thống tương tự, mục tiêu và phạm vi đề tài).
- CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ ÁP DỤNG (Kiến trúc công nghệ sử dụng, giải thuật AI/Blockchain/Web).
- CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG (Biểu đồ Use Case, Class Diagram, Sequence Diagram, Thiết kế CSDL quan hệ ERD).
- CHƯƠNG 4: CÀI ĐẶT THỬ NGHIỆM VÀ ĐÁNH GIÁ KẾT QUẢ (Hình ảnh giao diện, kịch bản kiểm thử Test Cases, đo lường hiệu năng).
- CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (Các mục tiêu đã đạt được, hạn chế tồn tại, hướng mở rộng).
- TÀI LIỆU THAM KHẢO (Định dạng chuẩn IEEE).

================================================================================
PHẦN 3: TIÊU CHÍ VÀ BAREME ĐÁNH GIÁ CỦA HỘI ĐỒNG CHẤM TỐT NGHIỆP
1. Sản phẩm phần mềm thực tế (40 điểm): Hệ thống chạy mượt mà, đầy đủ tính năng chính, xử lý ngoại lệ tốt, giao diện UI/UX trực quan, bảo mật an toàn.
2. Báo cáo tài liệu và Thiết kế hệ thống (20 điểm): Trình bày đúng quy chuẩn, sơ đồ UML logic, thiết kế CSDL chuẩn hóa không dư thừa.
3. Kỹ năng thuyết trình và Bảo vệ phản biện (30 điểm): Nắm vững công nghệ cốt lõi, tự tin trả lời chính xác các câu hỏi hóc búa của Hội đồng.
4. Tác phong và Đạo đức chuyên nghiệp (10 điểm): Tuân thủ tiến độ hướng dẫn, thái độ nghiêm túc, không sao chép đạo văn (Plagiarism dưới 20%).

CÂU HỎI HỘI ĐỒNG THƯỜNG HỎI TRONG LỄ BẢO VỆ TỐT NGHIỆP VHU:
Câu 1: Điểm mới và đóng góp nổi bật nhất của đề tài đồ án của bạn so với các sản phẩm sẵn có trên thị trường là gì?
Câu 2: Khi hệ thống của bạn có 10.000 người dùng đồng thời, thành phần nào trong kiến trúc sẽ gặp sự cố nghẽn cổ chai đầu tiên và giải pháp mở rộng (Scale-out) của bạn là gì?

TÀI LIỆU QUY ĐỊNH CHÍNH THỨC:
1. Trường Đại học Văn Hiến, "Sổ tay hướng dẫn làm Khóa luận tốt nghiệp ngành Công nghệ Thông tin".
2. Ban Đảm bảo chất lượng giáo dục VHU, "Quy định trích dẫn và kiểm tra liêm chính học thuật".
"""
    },
    {
        "code": "VHU_SOFT",
        "name": "Kỹ năng mềm sinh viên CNTT",
        "folder": "KỸ NĂNG MỀM",
        "credits": 2,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN
BỘ MÔN KỸ THUẬT PHẦN MỀM & KHOA HỌC MÁY TÍNH
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
TÊN MÔN HỌC: KỸ NĂNG MỀM VÀ ĐẠO ĐỨC NGHỀ NGHIỆP KỸ SƯ CÔNG NGHỆ THÔNG TIN
MÃ HỌC PHẦN: VHU_SOFT | SỐ TÍN CHỈ: 2 TÍN CHỈ (30 LT)

================================================================================
CHƯƠNG 1: KỸ NĂNG LÀM VIỆC NHÓM VÀ QUẢN LÝ MÃ NGUỒN VỚI GIT/GITHUB
1.1. Tầm quan trọng của tinh thần đồng đội trong ngành IT:
Dự án phần mềm không bao giờ là nỗ lực của một cá nhân duy nhất. Kỹ sư giỏi là người biết lắng nghe, chia sẻ trách nhiệm và phối hợp nhịp nhàng.
1.2. Git Workflow chuẩn doanh nghiệp:
- Các lệnh thao tác nhánh: `git checkout -b feature/login`, `git add .`, `git commit -m "feat: add user authentication"`.
- Quy trình Pull Request (PR) và Code Review: Cách viết mô tả PR mạch lạc, kỹ năng nhận xét phản hồi mang tính xây dựng, tuân thủ Clean Code.
- Giải quyết xung đột mã nguồn (Merge Conflicts) bình tĩnh và an toàn.

================================================================================
CHƯƠNG 2: KỸ NĂNG THUYẾT TRÌNH VÀ BẢO VỆ Ý TƯỞNG CÔNG NGHỆ
2.1. Cấu trúc bài thuyết trình kỹ thuật:
Mô hình Hook (Thu hút sự chú ý) -> Problem (Nêu bài toán nhức nhối) -> Solution (Giải pháp công nghệ độc đáo) -> Demo (Trình diễn trực quan sản phẩm sống) -> Q&A (Lắng nghe và giải đáp phản biện).
2.2. Quy tắc thiết kế slide chuyên nghiệp 10-20-30 của Guy Kawasaki:
Không quá 10 slide, không nói quá 20 phút, và không dùng cỡ chữ nhỏ hơn 30pt. Tối giản chữ, tối đa hóa sơ đồ kiến trúc và biểu đồ trực quan.

================================================================================
CHƯƠNG 3: QUẢN LÝ THỜI GIAN VÀ CÔNG VIỆC CÁ NHÂN
- Ma trận Eisenhower: Phân loại công việc theo Khẩn cấp / Quan trọng.
- Phương pháp Pomodoro: Tập trung cao độ 25 phút, nghỉ ngắn 5 phút để duy trì sự tỉnh táo và hạn chế mệt mỏi kiệt sức (Burnout).
- Sử dụng công cụ quản lý dự án Agile: Trello, Jira, Notion, GitHub Projects.

================================================================================
CHƯƠNG 4: KỸ NĂNG VIẾT CV VÀ PHỎNG VẤN ỨNG TUYỂN DOANH NGHIỆP IT
Cấu trúc CV kỹ sư phần mềm chuẩn quốc tế: Dự án thực tế (Projects kèm link GitHub live demo), Kỹ năng công nghệ (Tech stack phân loại rõ ràng), Trình độ học vấn tại ĐH Văn Hiến.
Phương pháp trả lời phỏng vấn STAR: Situation (Tình huống) - Task (Nhiệm vụ) - Action (Hành động cụ thể) - Result (Kết quả đo lường được).

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA CNTT ĐH VĂN HIẾN:
Câu 1: Khi xảy ra xung đột mã nguồn (Merge Conflict) trong Git, quy trình xử lý an toàn gồm những bước nào?
Đáp án: 1. Giữ bình tĩnh, thông báo cho đồng nghiệp sở hữu đoạn code xung đột. 2. Mở file xung đột, phân tích các khối `<<<<<<< HEAD`, `=======`, `>>>>>>>`. 3. Thảo luận thống nhất chọn giữ mã nguồn nào hoặc kết hợp cả hai. 4. Xóa các ký tự đánh dấu conflict, chạy kiểm thử ứng dụng cục bộ để bảo đảm code không lỗi. 5. Thực hiện `git add`, `git commit` và push lại lên nhánh làm việc.
Câu 2: Phương pháp phỏng vấn STAR giúp ứng viên trình bày kinh nghiệm như thế nào?
Đáp án: STAR giúp trả lời gãy gọn, có bằng chứng thực tế: S nêu bối cảnh bài toán, T chỉ rõ trách nhiệm của mình, A mô tả chi tiết công nghệ và giải pháp kỹ thuật mình đã tự tay áp dụng, và R đưa ra con số định lượng kết quả thành công đạt được (VD: giảm độ trễ 40%, phục vụ 5000 người dùng).

TÀI LIỆU THAM KHẢO:
1. Dale Carnegie, "Đắc Nhân Tâm (How to Win Friends and Influence People)".
2. Scott Chacon & Ben Straub, "Pro Git", 2nd Edition, Apress.
"""
    },
    {
        "code": "VHU_GEN",
        "name": "Môn Đại cương VHU",
        "folder": "MÔN ĐẠI CƯƠNG",
        "credits": 6,
        "content": """TRƯỜNG ĐẠI HỌC VĂN HIẾN (VHU) - KHOA CÔNG NGHỆ THÔNG TIN & KHOA KHOA HỌC XÃ HỘI
BỘ MÔN LÝ LUẬN CHÍNH TRỊ VÀ VĂN HÓA VĂN HIẾN
GIÁO TRÌNH TOÀN VĂN VÀ ĐỀ CƯƠNG HỌC PHẦN ĐẠI CƯƠNG
TÊN HỌC PHẦN: TRIẾT HỌC MÁC - LÊNIN, TƯ TƯỞNG HỒ CHÍ MINH VÀ VĂN HÓA VĂN HIẾN
MÃ HỌC PHẦN: VHU_GEN | SỐ TÍN CHỈ: 6 TÍN CHỈ

================================================================================
PHẦN 1: TRIẾT HỌC MÁC - LÊNIN
1.1. Chủ nghĩa duy vật biện chứng:
- Vật chất và ý thức: Vật chất là thực tại khách quan có trước, quyết định ý thức; ý thức có tính độc lập tương đối và tác động trở lại vật chất thông qua hoạt động thực tiễn của con người.
- Hai nguyên lý cơ bản: Nguyên lý về mối liên hệ phổ biến và Nguyên lý về sự phát triển.
- Ba quy luật cơ bản của phép biện chứng duy vật:
  1. Quy luật chuyển hóa từ những thay đổi về lượng dẫn đến những thay đổi về chất và ngược lại (Tích lũy tri thức đủ về lượng sẽ tạo bước nhảy vọt về chất).
  2. Quy luật thống nhất và đấu tranh giữa các mặt đối lập (Nguồn gốc và động lực nội tại của mọi sự vận động, phát triển).
  3. Quy luật phủ định của phủ định (Khuynh hướng phát triển theo đường xoắn ốc đi lên).
1.2. Chủ nghĩa duy vật lịch sử:
Học thuyết hình thái kinh tế - xã hội, Biện chứng giữa Lực lượng sản xuất và Quan hệ sản xuất, Cơ sở hạ tầng và Kiến trúc thượng tầng.

================================================================================
PHẦN 2: TƯ TƯỞNG HỒ CHÍ MINH VÀ LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM
2.1. Nguồn gốc tư tưởng Hồ Chí Minh:
Chủ nghĩa Mác - Lênin, Tinh hoa văn hóa truyền thống yêu nước của dân tộc Việt Nam, Tinh hoa văn hóa tiến bộ của nhân loại.
Độc lập dân tộc gắn liền với Chủ nghĩa xã hội là sợi chỉ đỏ xuyên suốt tư tưởng cách mạng Việt Nam.
2.2. Đạo đức cách mạng:
"Cần, Kiệm, Liêm, Chính, Chí công vô tư". Sinh viên Văn Hiến không ngừng tu dưỡng đạo đức, rèn luyện bản lĩnh để phụng sự Tổ quốc.

================================================================================
PHẦN 3: VĂN HÓA VĂN HIẾN VÀ TRIẾT LÝ GIÁO DỤC VĂN HIẾN
3.1. Ý nghĩa danh xưng "Văn Hiến":
Văn Hiến là sự kết tinh của truyền thống văn hóa tốt đẹp và đội ngũ nhân tài hiền tài của đất nước ("Đất nước ngàn năm văn hiến").
3.2. Triết lý giáo dục Đại học Văn Hiến:
"THÀNH NHÂN TRƯỚC KHI THÀNH DANH"
- Đề cao giáo dục nhân cách, đạo làm người, lòng hiếu thảo, tinh thần nhân ái, trách nhiệm đối với gia đình và xã hội trước khi vươn tới danh vọng, sự nghiệp thành đạt.
- Hệ giá trị cốt lõi của sinh viên Văn Hiến: Năng động - Sáng tạo - Tri thức - Nhân ái - Hội nhập.

CÂU HỎI ÔN TẬP VÀ ĐỀ THI KHOA HỌC XÃ HỘI & CNTT VHU:
Câu 1: Vận dụng quy luật "Lượng đổi dẫn đến Chất đổi" của Triết học Mác-Lênin vào quá trình học tập và rèn luyện của sinh viên CNTT Đại học Văn Hiến?
Đáp án: Để trở thành một kỹ sư phần mềm xuất sắc (bước nhảy vọt về Chất), sinh viên cần kiên trì tích lũy kiến thức từng dòng code, từng thuật toán, bài giảng mỗi ngày (tích lũy về Lượng). Khi lượng kiến thức vượt qua điểm nút, sinh viên sẽ đạt bước nhảy về tư duy logic, làm chủ công nghệ và sẵn sàng đáp ứng tiêu chuẩn khắt khe của doanh nghiệp.
Câu 2: Trình bày ý nghĩa của triết lý giáo dục "Thành nhân trước khi thành danh" của Trường Đại học Văn Hiến đối với sinh viên trong kỷ nguyên số?
Đáp án: Trong kỷ nguyên AI phát triển bùng nổ, tri thức kỹ thuật có thể được hỗ trợ bởi máy móc, nhưng nhân cách đạo đức, lòng trắc ẩn, tính liêm chính và trách nhiệm xã hội là những phẩm chất không một cỗ máy nào thay thế được. Triết lý "Thành nhân trước khi thành danh" nhắc nhở người học luôn trau dồi đạo đức nghề nghiệp, bảo vệ sự thật, dùng công nghệ để phục vụ nhân loại và làm rạng danh truyền thống Văn Hiến Việt Nam.

TÀI LIỆU THAM KHẢO CHÍNH THỨC:
1. Bộ Giáo dục và Đào tạo, "Giáo trình Triết học Mác - Lênin", NXB Chính trị Quốc gia Sự thật.
2. Trường Đại học Văn Hiến, "Kỷ yếu và Cẩm nang Văn hóa Đại học Văn Hiến".
"""
    }
]


def seed_full_vhu_sources():
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 75)
    print("🚀 BẮT ĐẦU TẠO TOÀN VĂN FILE NGUỒN (FULL COMPREHENSIVE CURRICULUM SOURCES)")
    print(f"   Tổng số môn học: {len(FULL_VHU_SOURCES)}")
    print(f"   Thư mục lưu trữ: {UPLOADS_DIR}")
    print("=" * 75)

    total_chunks = 0
    total_bytes = 0

    with get_db() as conn:
        cursor = conn.cursor()
        
        # Ensure owner exists
        cursor.execute("SELECT id FROM users WHERE id = 'usr_demo'")
        if not cursor.fetchone():
            now = time.time()
            cursor.execute("""
                INSERT OR IGNORE INTO users (id, username, email, role, reputation, created_at)
                VALUES ('usr_demo', 'Giáo Trình ĐH Văn Hiến', 'giaotrinh@vhu.edu.vn', 'student', 100, ?)
            """, (now,))
            conn.commit()

        for course in FULL_VHU_SOURCES:
            code = course["code"]
            name = course["name"]
            doc_id = f"doc_{code.lower()}"
            filename = f"{code}_GiaoTrinh_VHU.txt"
            original_name = f"VHU - {name} ({code}).txt"
            file_path = UPLOADS_DIR / filename
            content = course["content"].strip()
            
            # Write full text raw source file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            size_bytes = os.path.getsize(file_path)
            total_bytes += size_bytes
            checksum = hashlib.sha256(content.encode("utf-8")).hexdigest()
            now = time.time()
            
            # Update or Insert document in database
            cursor.execute("SELECT id FROM documents WHERE id = ?", (doc_id,))
            exists = cursor.fetchone()
            
            if exists:
                cursor.execute("""
                    UPDATE documents
                    SET original_name = ?, filename = ?, university = ?, subject_code = ?, subject_name = ?,
                        status = 'approved', size_bytes = ?, checksum = ?, file_type = 'text/plain'
                    WHERE id = ?
                """, (original_name, filename, "Đại học Văn Hiến (VHU)", code, name, size_bytes, checksum, doc_id))
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
            print(f"  ✓ [{code:10}] {name:38} | {size_bytes:6} bytes | {chunk_count:2} chunks")

    print("=" * 75)
    print(f"🎉 ĐÃ TẠO VÀ LẬP CHỈ MỤC THÀNH CÔNG {len(FULL_VHU_SOURCES)} FILE NGUỒN CHUẨN ĐH VĂN HIẾN!")
    print(f"   Tổng dung lượng: {round(total_bytes / 1024, 1)} KB")
    print(f"   Tổng chunks RAG: {total_chunks} chunks")
    print("=" * 75)


if __name__ == "__main__":
    seed_full_vhu_sources()
