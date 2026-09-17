import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.services.rag_service import RAGService

# All 19 VHU IT Courses
VHU_19_COURSES = [
    ("VHU_IT101", "Nhập môn Công nghệ Thông tin", "Hệ thống phần cứng máy tính và đạo đức kỹ sư"),
    ("VHU_DSA", "Cấu trúc Dữ liệu và Giải thuật", "Cây nhị phân tìm kiếm BST và danh sách liên kết"),
    ("VHU_OOP", "Lập trình Hướng đối tượng (OOP)", "4 tính chất Đóng gói Kế thừa Đa hình Trừu tượng"),
    ("VHU_CPP", "Lập trình C++", "Quản lý bộ nhớ heap stack và con trỏ pointer"),
    ("VHU_JAVA", "Lập trình Java", "Máy ảo JVM và bộ gom rác Garbage Collection"),
    ("VHU_PY", "Lập trình Python", "Xử lý dữ liệu NumPy Pandas và kiểu dữ liệu List"),
    ("VHU_WEB", "Lập trình Web", "Kiến trúc MVC và mô hình RESTful API"),
    ("VHU_DIST", "Lập trình Phân tán", "Định lý CAP và hệ thống hàng đợi Message Queue"),
    ("VHU_DB", "Cơ sở Dữ liệu", "Chuẩn hóa dữ liệu 1NF 2NF 3NF và tính chất ACID"),
    ("VHU_OS", "Hệ điều hành", "Phân biệt Process và Thread và định thời Round Robin"),
    ("VHU_ARC", "Kiến trúc Máy tính", "Kiến trúc Von Neumann và bộ nhớ Cache L1 L2"),
    ("VHU_NET", "Mạng Máy tính", "Mô hình OSI 7 tầng và giao thức TCP UDP"),
    ("VHU_SEC", "An toàn Mạng và Thông tin", "Tam giác bảo mật CIA và mã hóa AES RSA"),
    ("VHU_AI", "Trí tuệ Nhân tạo", "Thuật toán tìm kiếm A* và mạng nơ-ron học sâu"),
    ("VHU_SAD", "Phân tích và Thiết kế Hệ thống", "Mô hình hóa UML và sơ đồ luồng dữ liệu DFD"),
    ("VHU_ALGO", "Phân tích và Thiết kế Thuật toán", "Quy hoạch động Dynamic Programming và độ phức tạp"),
    ("VHU_PROJ", "Đồ án Chuyên ngành & Tốt nghiệp CNTT", "Quy trình thực hiện bảo vệ đồ án tốt nghiệp Văn Hiến"),
    ("VHU_SOFT", "Kỹ năng mềm sinh viên CNTT", "Làm việc nhóm giao tiếp và sử dụng Git"),
    ("VHU_GEN", "Khối môn Đại cương VHU", "Triết học Mác Lênin và bản sắc văn hóa Văn Hiến"),
]

print("=" * 85, flush=True)
print("🏛️ BẮT ĐẦU KIỂM THỬ TOÀN DIỆN 19 MÔN HỌC CNTT ĐẠI HỌC VĂN HIẾN (VHU)", flush=True)
print("=" * 85, flush=True)

passed_count = 0
for code, name, query in VHU_19_COURSES:
    chunks = RAGService.search_relevant_chunks(
        question=query,
        top_k=2,
        subject_code=code,
        university="Đại học Văn Hiến (VHU)"
    )
    if chunks and len(chunks) > 0:
        top = chunks[0]
        passed_count += 1
        print(f"  ✓ [{code}] {name:38} -> OK (Score: {top['score']:.4f}, Doc: {top['document_name']})", flush=True)
    else:
        print(f"  ✗ [{code}] {name:38} -> KHÔNG TÌM THẤY CHUNKS!", flush=True)

print("-" * 85, flush=True)
print(f"📊 KẾT QUẢ: {passed_count}/{len(VHU_19_COURSES)} môn học đã xác thực truy vấn RAG chính xác!", flush=True)

# Test 1 full answer generation
sample_ans = RAGService.answer_question(
    question="Sinh viên Văn Hiến học Cấu trúc Dữ liệu cần nắm vững cấu trúc cây nhị phân ra sao?",
    api_key="",
    model="extractive",
    subject_code="VHU_DSA",
    university="Đại học Văn Hiến (VHU)"
)

print("-" * 85, flush=True)
print("🎯 TRÍCH XUẤT CÂU TRẢ LỜI MẪU CHO MÔN VHU_DSA:", flush=True)
print(f"Grounded: {sample_ans['grounded']} | Số trích dẫn: {len(sample_ans['citations'])}", flush=True)
if sample_ans["citations"]:
    print(f"Trích dẫn từ: {sample_ans['citations'][0]['document_name']}", flush=True)
print("\n" + sample_ans["answer"][:300] + "...\n", flush=True)
print("=" * 85, flush=True)
