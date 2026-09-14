import hashlib
import os
import secrets
import time
from typing import Optional

import base58
import pyotp
from argon2 import PasswordHasher
from fastapi import Cookie, HTTPException, Response
from nacl.exceptions import BadSignatureError
from nacl.signing import VerifyKey

from .database import get_db

_PASSWORDS = PasswordHasher()
_ADMIN_SESSION_COOKIE = "unisynapse_admin_session"
_MEMBER_SESSION_COOKIE = "unisynapse_member_session"
_SESSION_TTL = 8 * 60 * 60
_WALLET_CHALLENGE_TTL = 5 * 60


def _wallet_message(wallet_address: str, nonce: str, issued_at: int) -> str:
    return (
        "UniSynapse wallet authentication\n"
        f"Address: {wallet_address}\n"
        f"Nonce: {nonce}\n"
        f"Issued-at: {issued_at}"
    )


def create_wallet_challenge(wallet_address: str) -> dict[str, str | int]:
    address = wallet_address.strip()
    if not address:
        raise ValueError("Wallet address is required")
    nonce = secrets.token_urlsafe(32)
    issued_at = int(time.time())
    expires_at = issued_at + _WALLET_CHALLENGE_TTL
    with get_db() as conn:
        conn.execute(
            "INSERT INTO wallet_challenges "
            "(nonce, wallet_address, issued_at, expires_at, consumed_at) "
            "VALUES (?, ?, ?, ?, NULL)",
            (nonce, address, issued_at, expires_at),
        )
        conn.commit()
    return {
        "nonce": nonce,
        "message": _wallet_message(address, nonce, issued_at),
        "expires_at": expires_at,
    }


def verify_wallet_challenge(wallet_address: str, nonce: str, message: str, signature: str) -> bool:
    address = wallet_address.strip()
    now = int(time.time())
    expected_message = None
    with get_db() as conn:
        challenge = conn.execute(
            "SELECT wallet_address, issued_at, expires_at, consumed_at "
            "FROM wallet_challenges WHERE nonce = ?",
            (nonce,),
        ).fetchone()
        if not challenge or challenge["wallet_address"] != address:
            return False
        if challenge["consumed_at"] is not None or challenge["expires_at"] < now:
            return False
        expected_message = _wallet_message(address, nonce, int(challenge["issued_at"]))
        if message != expected_message:
            return False
        try:
            public_key = VerifyKey(base58.b58decode(address))
            public_key.verify(message.encode("utf-8"), base58.b58decode(signature))
        except (ValueError, TypeError, BadSignatureError):
            return False
        updated = conn.execute(
            "UPDATE wallet_challenges SET consumed_at = ? "
            "WHERE nonce = ? AND consumed_at IS NULL AND expires_at >= ?",
            (now, nonce, now),
        )
        conn.commit()
        return updated.rowcount == 1




def hash_password(password: str) -> str:
    if len(password) < 14:
        raise ValueError("Password must contain at least 14 characters")
    return _PASSWORDS.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _PASSWORDS.verify(password_hash, password)
    except Exception:
        return False


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    return pyotp.TOTP(secret).verify(code, valid_window=0)


def create_session(admin_id: str) -> str:
    token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = time.time()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO admin_sessions (token_hash, admin_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (token_hash, admin_id, now + _SESSION_TTL, now),
        )
        conn.commit()
    return token


def create_member_session(member_id: str) -> str:
    token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = time.time()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO member_sessions (token_hash, member_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (token_hash, member_id, now + _SESSION_TTL, now),
        )
        conn.commit()
    return token


def revoke_session(token: Optional[str]) -> None:
    if not token:
        return
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    with get_db() as conn:
        conn.execute("DELETE FROM admin_sessions WHERE token_hash = ?", (token_hash,))
        conn.commit()


def revoke_member_session(token: Optional[str]) -> None:
    if not token:
        return
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    with get_db() as conn:
        conn.execute("UPDATE member_sessions SET revoked_at = ? WHERE token_hash = ?", (time.time(), token_hash))
        conn.commit()


def require_admin_session(session: Optional[str] = Cookie(None, alias=_ADMIN_SESSION_COOKIE)) -> dict:
    if not session:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    token_hash = hashlib.sha256(session.encode()).hexdigest()
    now = time.time()
    with get_db() as conn:
        row = conn.execute(
            "SELECT a.id, a.username, a.role FROM admin_sessions s "
            "JOIN admin_accounts a ON a.id = s.admin_id "
            "WHERE s.token_hash = ? AND s.expires_at > ? AND a.disabled = 0",
            (token_hash, now),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired admin session")
    return dict(row)


def require_member_session(session: Optional[str] = Cookie(None, alias=_MEMBER_SESSION_COOKIE)) -> dict:
    if not session:
        raise HTTPException(status_code=401, detail="Member authentication required")
    token_hash = hashlib.sha256(session.encode()).hexdigest()
    now = time.time()
    with get_db() as conn:
        row = conn.execute(
            "SELECT u.id, u.username, u.role FROM member_sessions s "
            "JOIN users u ON u.id = s.member_id "
            "WHERE s.token_hash = ? AND s.expires_at > ? AND s.revoked_at IS NULL AND u.disabled = 0",
            (token_hash, now),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired member session")
    return dict(row)


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        _ADMIN_SESSION_COOKIE,
        token,
        max_age=_SESSION_TTL,
        httponly=True,
        secure=os.getenv("COOKIE_SECURE", "0") == "1",
        samesite="strict",
        path="/",
    )


def set_member_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        _MEMBER_SESSION_COOKIE,
        token,
        max_age=_SESSION_TTL,
        httponly=True,
        secure=os.getenv("COOKIE_SECURE", "0") == "1",
        samesite="strict",
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(_ADMIN_SESSION_COOKIE, path="/")


def clear_member_session_cookie(response: Response) -> None:
    response.delete_cookie(_MEMBER_SESSION_COOKIE, path="/")
