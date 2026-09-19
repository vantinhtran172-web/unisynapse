import pytest
import time
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.oracle_service import (
    OracleService,
    WarmBlockhashCache,
    find_program_address,
    is_on_curve,
)
from backend.core.database import get_db, init_db
from backend.core.security import create_member_session

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        # Seed test user and test document
        cursor.execute(
            """
            INSERT OR IGNORE INTO users (id, address, username, role, unipoints, reputation)
            VALUES ('test_user_oracle', '4BGn8zhheoBPo73yTZB4aXn4iYsnwGVBmPtHi5dARYoi', 'oracle_tester', 'student', 100, 100)
            """
        )
        cursor.execute(
            """
            INSERT OR REPLACE INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes, checksum,
                status, quality_check, chunk_count, created_at
            ) VALUES (
                'doc_oracle_test_01',
                'test_user_oracle',
                'giai_tich_1.pdf',
                'giai_tich_1.pdf',
                'application/pdf',
                1024,
                'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234',
                'approved',
                'passed (92/100)',
                15,
                1700000000.0
            )
            """
        )
        conn.commit()

    client.cookies.set("unisynapse_member_session", create_member_session("test_user_oracle"))
    client.get("/health")


@pytest.fixture()
def csrf_headers():
    return {"X-CSRF-Token": client.cookies["unisynapse_csrf"]}


def test_oracle_registry_endpoint():
    """Verify Oracle Registry endpoint returns 200 and valid on-chain configuration."""
    response = client.get("/api/v1/oracle/registry")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["program_id"] == "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
    assert data["oracle_registry_pda"] == "4BGn8zhheoBPo73yTZB4aXn4iYsnwGVBmPtHi5dARYoi"
    assert data["oracle_registry_bump"] == 255
    assert len(data["oracle_authority"]) >= 32
    assert data["network"] == "devnet"
    assert "explorer.solana.com" in data["explorer_url"]


def test_pda_derivation_deterministic():
    """Verify PDA mathematical derivation matches Solana specifications."""
    prog_id = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
    pda1, bump1 = find_program_address([b"oracle_registry"], prog_id)
    pda2, bump2 = find_program_address([b"oracle_registry"], prog_id)
    assert pda1 == pda2 == "4BGn8zhheoBPo73yTZB4aXn4iYsnwGVBmPtHi5dARYoi"
    assert bump1 == bump2 == 255


def test_fast_gate_latency_under_200ms(csrf_headers):
    """SLO Verification: Fast Gate must process and return 202 in under 200ms."""
    t0 = time.perf_counter()
    response = client.post(
        "/api/v1/oracle/attest",
        json={
            "document_id": "doc_oracle_test_01",
            "quality_score": 12,
        },
        headers=csrf_headers,
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000

    assert response.status_code == 202
    data = response.json()
    assert data["ok"] is True
    assert data["status"] == "queued"
    assert data["document_id"] == "doc_oracle_test_01"
    assert len(data["job_id"]) > 0
    assert len(data["attestation_pda"]) > 0

    # Strict SLO check: Fast gate response must be well below 200ms
    assert elapsed_ms < 200, f"Fast Gate took {elapsed_ms:.2f}ms, exceeding 200ms SLO!"
    assert data["fast_gate_latency_ms"] < 100


def test_job_status_retrieval(csrf_headers):
    """Verify querying an enqueued job returns valid state and server-side score."""
    attest_res = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_oracle_test_01", "quality_score": 1},
        headers=csrf_headers,
    )
    job_id = attest_res.json()["job_id"]

    status_res = client.get(f"/api/v1/oracle/jobs/{job_id}")
    assert status_res.status_code == 200
    job_data = status_res.json()["job"]
    assert job_data["id"] == job_id
    assert job_data["document_id"] == "doc_oracle_test_01"
    assert job_data["status"] in ("queued", "processed", "confirmed", "finalized")
    assert job_data["quality_score"] == 92


def test_attest_nonexistent_document_returns_404(csrf_headers):
    """Verify an authenticated user cannot attest a missing document."""
    response = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_does_not_exist_999"},
        headers=csrf_headers,
    )
    assert response.status_code == 404
    assert "Không tìm thấy" in response.json()["detail"]


def test_attest_ignores_client_quality_score(csrf_headers):
    """Verify the stored server-side score wins over client input."""
    response = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_oracle_test_01", "quality_score": 0},
        headers=csrf_headers,
    )
    assert response.status_code == 202
    job = OracleService.get_job(response.json()["job_id"])
    assert job["quality_score"] == 92


def test_oracle_attest_unauthenticated_returns_401():
    """Verify unauthenticated requests cannot queue an attestation."""
    unauth_client = TestClient(app)
    # Fetch CSRF token
    unauth_client.get("/health")
    csrf_token = unauth_client.cookies.get("unisynapse_csrf", "")
    response = unauth_client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_oracle_test_01"},
        headers={"X-CSRF-Token": csrf_token},
    )
    assert response.status_code == 401


def test_oracle_job_status_unauthenticated_returns_401():
    """Verify unauthenticated requests cannot inspect job status."""
    unauth_client = TestClient(app)
    response = unauth_client.get("/api/v1/oracle/jobs/some_job_id")
    assert response.status_code == 401


def test_oracle_attest_other_user_document_returns_404(csrf_headers):
    """Verify an authenticated user cannot attest a document belonging to someone else."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO users (id, address, username, role, unipoints, reputation)
            VALUES ('victim_user', '6BGn8zhheoBPo73yTZB4aXn4iYsnwGVBmPtHi5dARYoi', 'victim', 'student', 50, 50)
            """
        )
        cursor.execute(
            """
            INSERT OR REPLACE INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes, checksum,
                status, quality_check, chunk_count, created_at
            ) VALUES (
                'doc_victim_01',
                'victim_user',
                'secret.pdf',
                'secret.pdf',
                'application/pdf',
                2048,
                'b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234',
                'approved',
                'passed (88/100)',
                5,
                1700000000.0
            )
            """
        )
        conn.commit()

    # test_user_oracle attempts to attest victim's document
    response = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_victim_01"},
        headers=csrf_headers,
    )
    assert response.status_code == 404
    assert "Không tìm thấy tài liệu" in response.json()["detail"]


def test_oracle_job_status_other_user_job_returns_404(csrf_headers):
    """Verify an authenticated user cannot inspect another user's job."""
    # Create a job for victim_user
    victim_job = OracleService.submit_attestation_job(
        document_id="doc_victim_01",
        owner_id="victim_user",
        checksum_sha256="b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234",
        quality_score=88,
        chunk_count=5,
        student_wallet="6BGn8zhheoBPo73yTZB4aXn4iYsnwGVBmPtHi5dARYoi",
    )
    victim_job_id = victim_job["job_id"]

    # test_user_oracle queries victim's job
    response = client.get(f"/api/v1/oracle/jobs/{victim_job_id}")
    assert response.status_code == 404
    assert "Không tìm thấy Oracle Job" in response.json()["detail"]


def test_oracle_attest_unapproved_document_returns_409(csrf_headers):
    """Verify documents not in 'approved' status are rejected."""
    with get_db() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes, checksum,
                status, quality_check, chunk_count, created_at
            ) VALUES (
                'doc_unapproved_01',
                'test_user_oracle',
                'draft.pdf',
                'draft.pdf',
                'application/pdf',
                100,
                'c1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234',
                'pending',
                'passed (80/100)',
                1,
                1700000000.0
            )
            """
        )
        conn.commit()

    response = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_unapproved_01"},
        headers=csrf_headers,
    )
    assert response.status_code == 409
    assert "chưa được phê duyệt" in response.json()["detail"]


def test_oracle_attest_missing_quality_check_returns_409(csrf_headers):
    """Verify documents without valid server-side quality check score are rejected."""
    with get_db() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes, checksum,
                status, quality_check, chunk_count, created_at
            ) VALUES (
                'doc_no_score_01',
                'test_user_oracle',
                'no_score.pdf',
                'no_score.pdf',
                'application/pdf',
                100,
                'd1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234',
                'approved',
                'evaluation failed',
                1,
                1700000000.0
            )
            """
        )
        conn.commit()

    response = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_no_score_01"},
        headers=csrf_headers,
    )
    assert response.status_code == 409
    assert "chưa có kết quả đánh giá" in response.json()["detail"]


def test_oracle_attest_idempotency_replay(csrf_headers):
    """Verify submitting with same Idempotency-Key returns 202 replay response with identical job_id."""
    headers = {**csrf_headers, "Idempotency-Key": "test-idemp-key-oracle-12345"}
    res1 = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_oracle_test_01"},
        headers=headers,
    )
    assert res1.status_code == 202
    job_id_1 = res1.json()["job_id"]

    res2 = client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_oracle_test_01"},
        headers=headers,
    )
    assert res2.status_code == 202
    data2 = res2.json()
    assert data2["job_id"] == job_id_1
    assert data2.get("idempotent_replay") is True


def test_oracle_attest_without_wallet_succeeds():
    """Verify an authenticated user can have documents certified autonomously even before linking a wallet."""
    with get_db() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO users (id, address, username, role, unipoints, reputation)
            VALUES ('no_wallet_user', NULL, 'nowallet', 'student', 0, 0)
            """
        )
        conn.execute(
            """
            INSERT OR REPLACE INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes, checksum,
                status, quality_check, chunk_count, created_at
            ) VALUES (
                'doc_no_wallet',
                'no_wallet_user',
                'doc_no_wallet.pdf',
                'doc_no_wallet.pdf',
                'application/pdf',
                100,
                'e1e2e3e4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01234',
                'approved',
                'passed (90/100)',
                1,
                1700000000.0
            )
            """
        )
        conn.commit()

    nowallet_client = TestClient(app)
    nowallet_client.cookies.set("unisynapse_member_session", create_member_session("no_wallet_user"))
    nowallet_client.get("/health")
    csrf_token = nowallet_client.cookies["unisynapse_csrf"]

    response = nowallet_client.post(
        "/api/v1/oracle/attest",
        json={"document_id": "doc_no_wallet"},
        headers={"X-CSRF-Token": csrf_token},
    )
    assert response.status_code == 202
    assert response.json()["ok"] is True
    assert response.json()["status"] == "queued"


def test_oracle_invalid_checksum_rejected():
    """Verify service validates 64-char hex SHA256 checksum."""
    with pytest.raises(ValueError, match="64-character hex SHA-256"):
        OracleService.submit_attestation_job(
            document_id="doc_any",
            owner_id="test_user_oracle",
            checksum_sha256="not-a-valid-sha256",
            quality_score=90,
            chunk_count=1,
            student_wallet="4BGn8zhheoBPo73yTZB4aXn4iYsnwGVBmPtHi5dARYoi",
        )


