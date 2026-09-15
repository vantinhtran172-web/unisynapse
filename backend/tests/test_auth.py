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
    assert current.json()["unipoints"] == 0
    assert current.json()["reputation"] == 100
    assert "address" in current.json()
    assert "password_hash" not in current.json()

    with get_db() as conn:
        conn.execute("UPDATE users SET unipoints = 920 WHERE id = ?", (member_id,))
        conn.commit()
    assert client.get("/api/v1/auth/me").json()["unipoints"] == 920

    logout = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": client.cookies["unisynapse_csrf"]},
    )
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


def test_wallet_endpoints_require_member_session():
    with TestClient(app) as client:
        assert client.post("/api/v1/auth/wallet/challenge", json={"publicKey": "11111111111111111111111111111111"}).status_code == 401
        assert client.post("/api/v1/auth/wallet/verify", json={"publicKey": "11111111111111111111111111111111", "signature": "xxx", "nonce": "yyy", "message": "zzz"}).status_code == 401
        assert client.post("/api/v1/auth/wallet/unlink").status_code == 401


def test_wallet_link_and_unlink_flow(member_client):
    import base58
    import nacl.signing

    client, username, password, member_id = member_client
    # Log in first
    login = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert login.status_code == 200
    csrf = client.cookies["unisynapse_csrf"]

    # Generate test keypair
    signing_key = nacl.signing.SigningKey.generate()
    verify_key = signing_key.verify_key
    pubkey_b58 = base58.b58encode(verify_key.encode()).decode("utf-8")

    # Request challenge
    challenge_res = client.post(
        "/api/v1/auth/wallet/challenge",
        json={"publicKey": pubkey_b58},
        headers={"X-CSRF-Token": csrf},
    )
    assert challenge_res.status_code == 200
    challenge_data = challenge_res.json()
    nonce = challenge_data["nonce"]
    message = challenge_data["message"]

    # Sign message
    signed = signing_key.sign(message.encode("utf-8"))
    signature_b58 = base58.b58encode(signed.signature).decode("utf-8")

    # Verify & link wallet
    verify_res = client.post(
        "/api/v1/auth/wallet/verify",
        json={
            "publicKey": pubkey_b58,
            "signature": signature_b58,
            "nonce": nonce,
            "message": message,
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["authenticated"] is True
    assert verify_res.json()["address"] == pubkey_b58
    assert verify_res.json()["id"] == member_id

    # Check /me reflects new wallet address
    me_res = client.get("/api/v1/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["address"] == pubkey_b58

    # Unlink wallet
    unlink_res = client.post(
        "/api/v1/auth/wallet/unlink",
        headers={"X-CSRF-Token": csrf},
    )
    assert unlink_res.status_code == 200
    assert unlink_res.json()["unlinked"] is True

    # Check /me has no address now
    assert client.get("/api/v1/auth/me").json()["address"] is None


def test_wallet_link_rejects_already_claimed_address(member_client):
    import base58
    import nacl.signing

    client, username, password, member_id = member_client

    signing_key = nacl.signing.SigningKey.generate()
    pubkey_b58 = base58.b58encode(signing_key.verify_key.encode()).decode("utf-8")

    # Assign pubkey to a different user in DB
    other_user_id = f"other_{uuid.uuid4().hex[:8]}"
    with get_db() as conn:
        conn.execute(
            "INSERT INTO users (id, username, role, address, disabled, created_at) "
            "VALUES (?, ?, 'student', ?, 0, strftime('%s','now'))",
            (other_user_id, f"claimed_user_{uuid.uuid4().hex[:6]}", pubkey_b58),
        )
        conn.commit()

    try:
        # Member logs in
        login = client.post("/api/v1/auth/login", json={"username": username, "password": password})
        assert login.status_code == 200
        csrf = client.cookies["unisynapse_csrf"]

        # Challenge
        challenge_res = client.post(
            "/api/v1/auth/wallet/challenge",
            json={"publicKey": pubkey_b58},
            headers={"X-CSRF-Token": csrf},
        )
        assert challenge_res.status_code == 200
        ch = challenge_res.json()

        # Sign
        signed = signing_key.sign(ch["message"].encode("utf-8"))
        sig_b58 = base58.b58encode(signed.signature).decode("utf-8")

        # Verify should be rejected with 400 because address is already claimed
        verify_res = client.post(
            "/api/v1/auth/wallet/verify",
            json={
                "publicKey": pubkey_b58,
                "signature": sig_b58,
                "nonce": ch["nonce"],
                "message": ch["message"],
            },
            headers={"X-CSRF-Token": csrf},
        )
        assert verify_res.status_code == 400
        assert "đã được liên kết" in verify_res.json()["detail"]
    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM users WHERE id = ?", (other_user_id,))
            conn.commit()

