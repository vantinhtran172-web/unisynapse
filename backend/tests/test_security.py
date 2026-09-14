import uuid

from fastapi.testclient import TestClient

from backend.core.rate_limit import LOGIN_LIMITER, SlidingWindowLimiter
from backend.core.csrf import token_matches
from backend.main import app


def test_csrf_token_comparison_is_exact():
    assert token_matches("token", "token")
    assert not token_matches("token", "other")
    assert not token_matches(None, "token")


def test_sliding_window_limiter_has_retry_after():
    limiter = SlidingWindowLimiter(limit=1, window_seconds=60)
    assert limiter.allow("client", now=100)[0]
    allowed, retry_after = limiter.allow("client", now=101)
    assert not allowed
    assert retry_after == 59
    assert limiter.allow("client", now=161)[0]


def test_authenticated_mutation_requires_csrf_token():
    with TestClient(app) as client:
        client.cookies.set("unisynapse_member_session", f"forged-{uuid.uuid4().hex}")
        missing = client.post("/api/v1/auth/logout")
        invalid = client.post(
            "/api/v1/auth/logout",
            headers={"X-CSRF-Token": "wrong"},
        )
    assert missing.status_code == 403
    assert invalid.status_code == 403


def test_login_rate_limit_returns_retry_after(monkeypatch):
    LOGIN_LIMITER.reset()
    monkeypatch.setattr("backend.main.LOGIN_LIMITER", SlidingWindowLimiter(1, 60))
    with TestClient(app) as client:
        first = client.post(
            "/api/v1/auth/login",
            json={"username": "missing", "password": "invalid-password"},
        )
        second = client.post(
            "/api/v1/auth/login",
            json={"username": "missing", "password": "invalid-password"},
        )
    assert first.status_code == 401
    assert second.status_code == 429
    assert second.headers["Retry-After"]


def test_document_mime_gate_rejects_extension_spoofing():
    from backend.services.verification_service import VerificationService

    passed, message = VerificationService.verify_mime(b"not-a-pdf", "notes.pdf")
    assert not passed
    assert "%PDF-" in message


def test_document_pii_gate_rejects_phone_and_citizen_id():
    from backend.services.verification_service import VerificationService

    passed, findings = VerificationService.scan_pii(
        "Lien he 0987654321, CCCD 012345678901"
    )
    assert not passed
    assert len(findings) == 2


def test_document_upload_requires_explicit_copyright_confirmation():
    import inspect
    from backend.api.v1.documents import upload_document

    parameter = inspect.signature(upload_document).parameters["permission_confirmed"]
    assert parameter.default.default is False


def test_document_filename_normalization_removes_parent_path():
    from pathlib import Path

    assert Path("../../private/lesson.txt").name == "lesson.txt"


def test_quarantine_cleanup_removes_only_old_orphans(tmp_path, monkeypatch):
    import os
    from contextlib import contextmanager

    from backend.services import storage_cleanup_service as cleanup

    orphan = tmp_path / "orphan.pdf"
    pending = tmp_path / "pending.pdf"
    fresh = tmp_path / "fresh.pdf"
    for path in (orphan, pending, fresh):
        path.write_bytes(b"content")
    old_timestamp = 100.0
    os.utime(orphan, (old_timestamp, old_timestamp))
    os.utime(pending, (old_timestamp, old_timestamp))

    class FakeRow:
        def __init__(self, status):
            self.status = status

        def __getitem__(self, key):
            return self.status if key == "status" else None

    class FakeConnection:
        def __init__(self):
            self.filename = None

        def execute(self, _sql, params):
            self.filename = params[0]
            return self

        def fetchone(self):
            if self.filename == "pending.pdf":
                return FakeRow("pending_review")
            return None

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

    @contextmanager
    def fake_db():
        yield FakeConnection()

    monkeypatch.setattr(cleanup, "get_db", fake_db)
    removed = cleanup.cleanup_quarantine(tmp_path, retention_seconds=50, now=200)

    assert removed == 1
    assert not orphan.exists()
    assert pending.exists()
    assert fresh.exists()


def test_tutor_request_contract_does_not_expose_client_api_key():
    from backend.api.v1.tutor import AskQuestionRequest

    request = AskQuestionRequest(question="Explain pointers", apiKey="client-secret")
    assert not hasattr(request, "apiKey")


def test_rag_uses_general_gemini_for_no_approved_context(monkeypatch):
    from backend.services.rag_service import RAGService

    monkeypatch.setattr(RAGService, "search_relevant_chunks", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(
        RAGService,
        "call_gemini_api",
        lambda question, context, api_key, model, grounded=False: ("Câu trả lời kiến thức chung.", "gemini-flash-latest"),
    )
    result = RAGService.answer_question("Apollo 11 hạ cánh xuống Mặt Trăng năm nào?", api_key="test-key")

    assert result["grounded"] is False
    assert result["citations"] == []
    assert result["engine"] == "gemini-flash-latest"
    assert result["source_type"] == "ai_outside_knowledge_base"
    assert "không có trong tài liệu" in result["source_label"].lower()


def test_rag_returns_safe_unavailable_response_without_gemini(monkeypatch):
    from backend.services.rag_service import RAGService

    monkeypatch.setattr("backend.core.config.GEMINI_API_KEY", "")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    monkeypatch.setattr(RAGService, "search_relevant_chunks", lambda *_args, **_kwargs: [])
    result = RAGService.answer_question("Unrelated question", api_key="")

    assert result["grounded"] is False
    assert result["citations"] == []
    assert result["source_type"] == "unavailable"


def test_rag_citations_exclude_below_threshold_context(monkeypatch):
    from backend.services.rag_service import RAGService

    monkeypatch.setattr("backend.core.config.GEMINI_API_KEY", "")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    chunks = [
        {
            "document_id": "doc-1",
            "document_name": "CS101.pdf",
            "chunk_index": 0,
            "page_number": 3,
            "content": "Con trỏ lưu địa chỉ của một vùng nhớ.",
            "score": 0.8,
        },
        {
            "document_id": "doc-2",
            "document_name": "noise.pdf",
            "chunk_index": 1,
            "page_number": 8,
            "content": "Nội dung không đủ tương thích.",
            "score": 0.1,
        },
    ]
    monkeypatch.setattr(RAGService, "search_relevant_chunks", lambda *_args, **_kwargs: chunks)
    result = RAGService.answer_question("Con trỏ là gì?")

    assert result["grounded"] is True
    assert [citation["document_id"] for citation in result["citations"]] == ["doc-1"]
    assert result["citations"][0]["page"] == "Trang 3"
    assert result["engine"] == "extractive_rag"


def test_admin_requires_security_key():
    from fastapi.testclient import TestClient
    from backend.main import app
    from backend.core.config import ADMIN_SECURITY_KEY

    with TestClient(app) as client:
        # 1. Access without key or session must fail with 403
        res = client.get("/api/v1/admin/stats")
        assert res.status_code == 403
        assert "Khoá bảo mật quản trị" in res.json()["detail"] or "Admin Security Key" in res.json()["detail"]

        # 2. Access with wrong key must fail with 403
        res_wrong = client.get("/api/v1/admin/stats", headers={"X-Admin-Security-Key": "wrong-key"})
        assert res_wrong.status_code == 403

        # 3. Access with valid ADMIN_SECURITY_KEY header must succeed
        res_ok = client.get("/api/v1/admin/stats", headers={"X-Admin-Security-Key": ADMIN_SECURITY_KEY})
        assert res_ok.status_code == 200
        assert "users" in res_ok.json()

        # 4. Verify-key endpoint
        res_verify = client.post("/api/v1/admin/verify-key", headers={"X-Admin-Security-Key": ADMIN_SECURITY_KEY})
        assert res_verify.status_code == 200
        assert res_verify.json()["valid"] is True

