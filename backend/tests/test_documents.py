import io
import time
import uuid
from backend.core.config import UPLOADS_DIR
from backend.core.database import get_db
from backend.tests.test_auth import member_client  # noqa: F401


def test_upload_document_instant_approval_and_reward(member_client):
    client, username, password, member_id = member_client
    login_res = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert login_res.status_code == 200
    unique_suffix = uuid.uuid4().hex[:8]

    # Academic text without PII that satisfies quality evaluation
    academic_content = f"""
    GIAO TRINH CAU TRUC DU LIEU VA GIAI THUAT NANG CAO {unique_suffix}
    Chuong 1: Cay do den (Red-Black Tree) va ung dung trong he thong chi muc vector.
    Cay do den la mot dang cay tim kiem nhi phan tu can bang, dam bao do phuc tap thoi gian
    cho cac thao tac tim kiem, them va xoa luon dat muc O(log n) trong truong hop xau nhat.
    Moi nut tren cay co thuoc tinh mau la Do hoac Den.
    Nut goc luon luon phai la nut mau Den.
    Moi la la nut NIL mau Den.
    Neu mot nut la mau Do thi ca hai nut con cua no deu phai la mau Den.
    So luong nut den tren moi duong di tu mot nut den cac la con deu bang nhau.
    """.strip().encode("utf-8")

    with get_db() as conn:
        user_before = conn.execute("SELECT unipoints, reputation FROM users WHERE id = ?", (member_id,)).fetchone()
        points_before = user_before["unipoints"] if user_before else 0
        rep_before = user_before["reputation"] if user_before else 0

    filename = f"RBTree_Lecture_{unique_suffix}.txt"
    files = {
        "file": (filename, io.BytesIO(academic_content), "text/plain")
    }
    data = {
        "permission_confirmed": "true"
    }

    doc_id = None
    try:
        csrf = client.cookies["unisynapse_csrf"]
        res = client.post("/api/v1/documents/upload", files=files, data=data, headers={"X-CSRF-Token": csrf})
        assert res.status_code == 200, res.text
        res_data = res.json()
        assert res_data["success"] is True
        assert res_data["status"] == "approved"
        assert res_data["chunk_count"] >= 1
        assert res_data["reward_points"] == 50
        assert res_data["reputation_gain"] == 5
        assert "solana_signature" in res_data
        assert "explorer_url" in res_data
        assert res_data["steps"]["approval"] == "approved"

        doc_id = res_data["document_id"]

        with get_db() as conn:
            # Check user balance
            user_after = conn.execute("SELECT unipoints, reputation FROM users WHERE id = ?", (member_id,)).fetchone()
            assert user_after["unipoints"] == points_before + 50
            assert user_after["reputation"] == rep_before + 5

            # Check document state
            doc_row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
            assert doc_row is not None
            assert doc_row["status"] == "approved"
            assert doc_row["chunk_count"] >= 1
            assert doc_row["approved_at"] is not None

            # Check ledger entry
            ledger = conn.execute(
                "SELECT * FROM reward_ledger WHERE user_id = ? AND source_id = ? AND source_type = 'document_upload'",
                (member_id, doc_id),
            ).fetchone()
            assert ledger is not None
            assert ledger["delta"] == 50

            # Check document chunks
            chunks = conn.execute("SELECT * FROM document_chunks WHERE document_id = ?", (doc_id,)).fetchall()
            assert len(chunks) == res_data["chunk_count"]

    finally:
        with get_db() as conn:
            if doc_id:
                conn.execute("DELETE FROM document_chunks WHERE document_id = ?", (doc_id,))
                conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
            conn.execute("DELETE FROM ledger_entries WHERE account_id IN (SELECT id FROM ledger_accounts WHERE user_id = ?)", (member_id,))
            conn.execute("DELETE FROM ledger_accounts WHERE user_id = ?", (member_id,))
            conn.execute("DELETE FROM reward_ledger WHERE user_id = ?", (member_id,))
            conn.commit()

        # Clean uploaded file if exists
        if doc_id:
            for p in UPLOADS_DIR.glob(f"{doc_id}*"):
                try:
                    p.unlink(missing_ok=True)
                except OSError:
                    pass
