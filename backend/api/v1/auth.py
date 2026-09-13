from typing import Optional

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

router = APIRouter(prefix="/auth", tags=["Auth"])


class AdminLoginRequest(BaseModel):
    username: str
    password: str
    totp_code: str


class MemberLoginRequest(BaseModel):
    username: str
    password: str


class WalletConnectRequest(BaseModel):
    publicKey: str
    message: Optional[str] = None
    signature: Optional[str] = None


class SSORequest(BaseModel):
    studentId: str
    email: str
    fullName: str


@router.post("/admin/login")
def admin_login(payload: AdminLoginRequest, response: Response):
    from ...core.database import get_db

    with get_db() as conn:
        admin = conn.execute(
            "SELECT id, username, password_hash, totp_secret, role "
            "FROM admin_accounts WHERE username = ? AND disabled = 0",
            (payload.username.strip(),),
        ).fetchone()

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
    return {"authenticated": True, **session_user}


@router.post("/wallet-connect")
def wallet_connect(request: WalletConnectRequest):
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
