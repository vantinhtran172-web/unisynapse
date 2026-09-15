from typing import Optional
import hmac
import time

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel

from ...core.security import (
    clear_member_session_cookie,
    clear_session_cookie,
    create_member_session,
    create_session,
    require_admin_session,
    require_member_session,
    revoke_member_session,
    revoke_session,
    set_member_session_cookie,
    set_session_cookie,
    verify_password,
    verify_totp,
)
from ...core.config import ADMIN_ACCESS_KEY

router = APIRouter(prefix="/auth", tags=["Auth"])


class AdminLoginRequest(BaseModel):
    username: str
    password: str
    totp_code: str
    access_key: str


class MemberLoginRequest(BaseModel):
    username: str
    password: str


class MemberRegisterRequest(BaseModel):
    username: str
    password: str


@router.post("/register", status_code=201)
def member_register(payload: MemberRegisterRequest, response: Response):
    import re
    import sqlite3
    import uuid
    from ...core.database import get_db
    from ...core.security import hash_password

    username = payload.username.strip()
    if not re.fullmatch(r"[A-Za-z0-9_]{3,32}", username):
        raise HTTPException(400, "Tên tài khoản gồm 3–32 chữ, số hoặc dấu gạch dưới.")
    if not 14 <= len(payload.password) <= 128:
        raise HTTPException(400, "Mật khẩu cần từ 14 đến 128 ký tự.")
    member_id = f"usr_{uuid.uuid4().hex}"
    password_hash = hash_password(payload.password)
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (id, username, password_hash, role, disabled, created_at) "
                "VALUES (?, ?, ?, 'student', 0, ?)",
                (member_id, username, password_hash, time.time()),
            )
            conn.commit()
    except sqlite3.IntegrityError as exc:
        raise HTTPException(409, "Tên tài khoản đã được sử dụng.") from exc
    token = create_member_session(member_id)
    set_member_session_cookie(response, token)
    return {"authenticated": True, "id": member_id, "username": username, "role": "student"}


class WalletChallengeRequest(BaseModel):
    publicKey: str


class WalletVerifyRequest(BaseModel):
    publicKey: str
    nonce: str
    message: str
    signature: str


class SSORequest(BaseModel):
    studentId: str
    email: str
    fullName: str


@router.post("/wallet/challenge")
def wallet_challenge(
    request: WalletChallengeRequest,
    session_user: dict = Depends(require_member_session),
):
    from ...core.security import create_wallet_challenge

    try:
        return create_wallet_challenge(request.publicKey)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/wallet/verify")
def wallet_verify(
    request: WalletVerifyRequest,
    response: Response,
    session_user: dict = Depends(require_member_session),
):
    from ...core.database import get_db
    from ...core.security import verify_wallet_challenge

    if not verify_wallet_challenge(
        request.publicKey,
        request.nonce,
        request.message,
        request.signature,
    ):
        raise HTTPException(status_code=401, detail="Invalid or expired wallet challenge")

    wallet_address = request.publicKey.strip()
    with get_db() as conn:
        # Ràng buộc: Kiểm tra ví đã liên kết với tài khoản khác chưa
        existing = conn.execute(
            "SELECT id, username FROM users WHERE address = ? AND id != ? AND disabled = 0",
            (wallet_address, session_user["id"]),
        ).fetchone()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Ví Phantom này đã được liên kết với tài khoản '{existing['username']}'. Mỗi tài khoản chỉ dùng một ví riêng biệt.",
            )

        # Cập nhật địa chỉ ví cho tài khoản đang đăng nhập
        conn.execute(
            "UPDATE users SET address = ? WHERE id = ?",
            (wallet_address, session_user["id"]),
        )
        conn.commit()

        member = conn.execute(
            "SELECT id, username, role, address, unipoints, reputation FROM users WHERE id = ?",
            (session_user["id"],),
        ).fetchone()

    return {
        "authenticated": True,
        "id": member["id"],
        "username": member["username"],
        "role": member["role"],
        "address": member["address"],
        "unipoints": member["unipoints"],
        "reputation": member["reputation"],
    }


@router.post("/wallet/unlink")
def wallet_unlink(
    session_user: dict = Depends(require_member_session),
):
    from ...core.database import get_db

    with get_db() as conn:
        conn.execute(
            "UPDATE users SET address = NULL WHERE id = ?",
            (session_user["id"],),
        )
        conn.commit()
    return {"authenticated": True, "unlinked": True}


@router.post("/wallet-connect")
def wallet_connect(request: WalletVerifyRequest):
    raise HTTPException(
        status_code=410,
        detail="Use /auth/wallet/challenge and /auth/wallet/verify for signed wallet authentication.",
    )


@router.post("/admin/login")
def admin_login(payload: AdminLoginRequest, response: Response):
    from ...core.database import get_db

    with get_db() as conn:
        admin = conn.execute(
            "SELECT id, username, password_hash, totp_secret, role "
            "FROM admin_accounts WHERE username = ? AND disabled = 0",
            (payload.username.strip(),),
        ).fetchone()

    if not ADMIN_ACCESS_KEY or not hmac.compare_digest(payload.access_key, ADMIN_ACCESS_KEY):
        raise HTTPException(status_code=401, detail="Invalid admin access key")
    if not admin or not verify_password(admin["password_hash"], payload.password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if not verify_totp(admin["totp_secret"], payload.totp_code):
        raise HTTPException(status_code=401, detail="Invalid MFA code")

    token = create_session(admin["id"])
    set_session_cookie(response, token)
    return {"authenticated": True, "username": admin["username"], "role": admin["role"]}


@router.post("/admin/logout")
def admin_logout(
    response: Response,
    session: Optional[str] = Cookie(None, alias="unisynapse_admin_session"),
):
    revoke_session(session)
    clear_session_cookie(response)
    return {"authenticated": False}


@router.get("/admin/me")
def admin_me(session_user: dict = Depends(require_admin_session)):
    return {"authenticated": True, **session_user}


@router.post("/login")
def member_login(payload: MemberLoginRequest, response: Response):
    from ...core.database import get_db

    username = payload.username.strip()
    with get_db() as conn:
        member = conn.execute(
            "SELECT id, username, password_hash, role FROM users "
            "WHERE username = ? AND disabled = 0",
            (username,),
        ).fetchone()

    if not member or not member["password_hash"] or not verify_password(member["password_hash"], payload.password):
        raise HTTPException(status_code=401, detail="Invalid member credentials")

    token = create_member_session(member["id"])
    set_member_session_cookie(response, token)
    return {"authenticated": True, "id": member["id"], "username": member["username"], "role": member["role"]}


@router.post("/logout")
def member_logout(
    response: Response,
    session: Optional[str] = Cookie(None, alias="unisynapse_member_session"),
):
    revoke_member_session(session)
    clear_member_session_cookie(response)
    return {"authenticated": False}


@router.get("/me")
def get_current_user(session_user: dict = Depends(require_member_session)):
    from ...core.database import get_db

    # Session identity is not a profile: fetch current balances on every refresh.
    with get_db() as conn:
        profile = conn.execute(
            "SELECT id, username, role, address, unipoints, reputation "
            "FROM users WHERE id = ? AND disabled = 0",
            (session_user["id"],),
        ).fetchone()
    if profile is None:
        raise HTTPException(status_code=401, detail="Member account unavailable")
    return {"authenticated": True, **dict(profile)}


@router.post("/wallet-connect")
def wallet_connect(request: WalletVerifyRequest):
    raise HTTPException(
        status_code=410,
        detail="Wallet login is not enabled until signed challenge verification is configured.",
    )


@router.post("/sso")
def sso(request: SSORequest):
    raise HTTPException(
        status_code=410,
        detail="Campus SSO is disabled. Use internal account bootstrap and MFA.",
    )
