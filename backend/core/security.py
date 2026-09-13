import hashlib
import os
import secrets
import time
from typing import Optional

import pyotp
from argon2 import PasswordHasher
from fastapi import Cookie, HTTPException, Response

from .database import get_db

_PASSWORDS = PasswordHasher()
_ADMIN_SESSION_COOKIE = "unisynapse_admin_session"
_MEMBER_SESSION_COOKIE = "unisynapse_member_session"
_SESSION_TTL = 8 * 60 * 60


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
