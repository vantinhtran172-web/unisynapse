"""
FastAPI router for Autonomous On-Chain Oracle.
Provides Fast Gate attestation trigger, job status lookup, SSE streaming, and registry metadata.
"""

import re
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from ...core.database import get_db
from ...core.security import require_member_session
from ...services.oracle_service import OracleService
from ...core.config import SOLANA_NETWORK, SOLANA_PROGRAM_ID

router = APIRouter(prefix="/oracle", tags=["oracle"])


class AttestRequest(BaseModel):
    document_id: str = Field(..., min_length=1, max_length=128, description="Unique ID of verified academic document")


def _stored_quality_score(quality_check: Optional[str]) -> int:
    """Extract the server-produced score; never trust an HTTP request value."""
    match = re.search(r"passed\s*\(\s*(\d{1,3})\s*/\s*100\s*\)", quality_check or "")
    if not match:
        raise HTTPException(status_code=409, detail="Tài liệu chưa có kết quả đánh giá chất lượng server-side")
    score = int(match.group(1))
    if not 0 <= score <= 100:
        raise HTTPException(status_code=409, detail="Điểm chất lượng lưu trữ không hợp lệ")
    return score


@router.get("/registry")
async def get_oracle_registry_info():
    """Returns Oracle Registry public configuration and derived PDAs."""
    registry_pda, bump = OracleService.derive_registry_pda()
    oracle_pubkey = OracleService.get_oracle_pubkey()
    return {
        "ok": True,
        "program_id": SOLANA_PROGRAM_ID,
        "oracle_registry_pda": registry_pda,
        "oracle_registry_bump": bump,
        "oracle_authority": oracle_pubkey,
        "network": SOLANA_NETWORK,
        "explorer_url": f"https://explorer.solana.com/address/{registry_pda}?cluster={SOLANA_NETWORK}",
    }


@router.post("/attest", status_code=status.HTTP_202_ACCEPTED)
async def submit_oracle_attestation(
    req: AttestRequest,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    session_user: dict = Depends(require_member_session),
):
    """
    FAST GATE (< 200 ms):
    Validates ownership and server-side evaluation, then queues the Oracle pipeline.
    The client cannot provide the academic score or recipient wallet.
    """
    if idempotency_key is not None and not 8 <= len(idempotency_key) <= 128:
        raise HTTPException(status_code=422, detail="Idempotency-Key không hợp lệ")

    with get_db() as conn:
        doc = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND owner_id = ?",
            (req.document_id, session_user["id"]),
        ).fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu hoặc bạn không có quyền truy cập")

        if doc["status"] != "approved":
            raise HTTPException(status_code=409, detail="Tài liệu chưa được phê duyệt để attestation")
        owner_wallet = conn.execute(
            "SELECT address FROM users WHERE id = ?",
            (session_user["id"],),
        ).fetchone()
        student_wallet = owner_wallet["address"] if owner_wallet and owner_wallet["address"] else None
        quality_score = _stored_quality_score(doc["quality_check"])
        checksum = doc["checksum"]
        chunk_count = doc["chunk_count"] or 1

    try:
        res = OracleService.submit_attestation_job(
            document_id=req.document_id,
            owner_id=session_user["id"],
            checksum_sha256=checksum,
            quality_score=quality_score,
            chunk_count=chunk_count,
            student_wallet=owner_wallet["address"],
            idempotency_key=idempotency_key,
        )
        return JSONResponse(status_code=status.HTTP_202_ACCEPTED, content=res)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=503, detail="Không thể xếp hàng Oracle job lúc này")


def _assert_job_owner(job: dict, session_user: dict) -> None:
    if job["owner_id"] != session_user["id"] and session_user.get("role") not in {"admin", "superadmin"}:
        raise HTTPException(status_code=404, detail="Không tìm thấy Oracle Job")


@router.get("/jobs/{job_id}")
async def get_oracle_job_status(job_id: str, session_user: dict = Depends(require_member_session)):
    """Retrieves full state, latencies and explorer links for an authorized job."""
    job = OracleService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy Oracle Job")
    _assert_job_owner(job, session_user)
    return {"ok": True, "job": job}


@router.get("/jobs/{job_id}/stream")
async def stream_oracle_job_status(job_id: str, session_user: dict = Depends(require_member_session)):
    """Server-Sent Events (SSE) live streaming of confirmation stages."""
    job = OracleService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy Oracle Job")
    _assert_job_owner(job, session_user)

    return StreamingResponse(
        OracleService.stream_job_updates(job_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
