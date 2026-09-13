import uuid

import pytest
from fastapi.testclient import TestClient

from backend.core.database import get_db, init_db
from backend.core.security import hash_password
from backend.main import app


@pytest.fixture()
def member_client():
    init_db()
    member_id = f"member_test_{uuid.uuid4().hex[:10]}"
    username = f"member_{uuid.uuid4().hex[:10]}"
    password = "test-member-password-2026"
    with get_db() as conn:
        conn.execute(
            "INSERT INTO users (id, username, password_hash, role, disabled, created_at) "
            "VALUES (?, ?, ?, 'student', 0, strftime('%s','now'))",
            (member_id, username, hash_password(password)),
        )
        conn.commit()

    try:
        with TestClient(app) as client:
            yield client, username, password, member_id
    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM member_sessions WHERE member_id = ?", (member_id,))
            conn.execute("DELETE FROM users WHERE id = ?", (member_id,))
            conn.commit()


def test_member_login_me_and_logout(member_client):
    client, username, password, member_id = member_client

    login = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert login.status_code == 200
    assert login.json() == {
        "authenticated": True,
        "id": member_id,
        "username": username,
        "role": "student",
    }
    assert "unisynapse_member_session" in client.cookies

    current = client.get("/api/v1/auth/me")
    assert current.status_code == 200
    assert current.json()["id"] == member_id
    assert "password_hash" not in current.json()

    logout = client.post("/api/v1/auth/logout")
    assert logout.status_code == 200
    assert logout.json() == {"authenticated": False}
    assert client.get("/api/v1/auth/me").status_code == 401


def test_member_login_rejects_invalid_credentials(member_client):
    client, username, password, _ = member_client
    assert client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password + "-wrong"},
    ).status_code == 401


def test_member_me_rejects_forged_session():
    with TestClient(app) as client:
        client.cookies.set("unisynapse_member_session", "forged-token")
        response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
