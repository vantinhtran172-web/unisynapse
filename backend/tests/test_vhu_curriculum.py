import pytest
from backend.services.rag_service import RAGService

def test_vhu_curriculum_search_with_university_filter():
    """Verify that RAG retrieves VHU IT curriculum chunks when filtered by university and subject."""
    # 1. Search with University filter for VHU
    chunks = RAGService.search_relevant_chunks(
        question="Cấu trúc dữ liệu cây nhị phân và độ phức tạp",
        top_k=3,
        subject_code="VHU_DSA",
        university="Đại học Văn Hiến (VHU)"
    )
    assert len(chunks) > 0, "Should retrieve relevant VHU DSA chunks"
    for chunk in chunks:
        assert chunk["university"] == "Đại học Văn Hiến (VHU)"
        assert chunk["subject_code"] == "VHU_DSA"

def test_vhu_curriculum_cross_course_isolation():
    """Ensure subject_code isolation works properly between VHU courses."""
    chunks_sec = RAGService.search_relevant_chunks(
        question="Mã hóa AES và bảo mật mạng CIA",
        top_k=3,
        subject_code="VHU_SEC",
        university="Đại học Văn Hiến (VHU)"
    )
    assert len(chunks_sec) > 0
    for chunk in chunks_sec:
        assert chunk["subject_code"] == "VHU_SEC"
        assert "VHU_SEC" in chunk["document_name"]

def test_vhu_all_courses_search():
    """Search across all VHU IT courses when subject_code is not specified or None."""
    chunks = RAGService.search_relevant_chunks(
        question="Đại học Văn Hiến công nghệ thông tin",
        top_k=5,
        university="Đại học Văn Hiến (VHU)"
    )
    assert len(chunks) > 0
    for chunk in chunks:
        assert chunk["university"] == "Đại học Văn Hiến (VHU)"
