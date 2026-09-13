from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ...core.database import get_db
from ...core.security import require_member_session

router = APIRouter(prefix="/rewards", tags=["Rewards & Ledger"])

class RecordOnChainRequest(BaseModel):
    signature: str
    memo: str
    delta: int = 10

@router.post("/record-onchain")
def record_onchain_proof(req: RecordOnChainRequest):
    raise HTTPException(
        status_code=410,
        detail="Legacy proof submission retired. Rewards require a server-approved award and verified Devnet settlement.",
    )

@router.get("/ledger")
def get_user_ledger(session_user: dict = Depends(require_member_session)):
    user_id = session_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM reward_ledger
        WHERE user_id = ?
        ORDER BY created_at DESC
        """, (user_id,))
        rows = [dict(r) for r in cursor.fetchall()]
        
        for r in rows:
            # Legacy rows have no trusted settlement receipt yet.
            r["proof_status"] = "unverified"
            r["solana_signature"] = None
            r["explorer_url"] = None
            r["verification_reason"] = "Settlement has not been reconciled against Devnet."
                
    return rows

@router.get("/summary")
def get_rewards_summary(session_user: dict = Depends(require_member_session)):
    user_id = session_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT unipoints, reputation FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        cursor.execute("SELECT COUNT(*) FROM reward_ledger WHERE user_id = ?", (user_id,))
        total_txs = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(delta) FROM reward_ledger WHERE user_id = ? AND delta > 0", (user_id,))
        earned = cursor.fetchone()[0] or 0
        
    return {
        "unipoints": user["unipoints"] if user else 0,
        "reputation": user["reputation"] if user else 100,
        "total_transactions": total_txs,
        "total_earned": earned
    }

