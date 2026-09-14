import base64
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ...core.database import get_db
from ...core.security import require_member_session
from ...services.solana_service import SolanaService

router = APIRouter(prefix="/rewards", tags=["Rewards & Ledger"])


@router.get("/economy")
def economy():
    from ...core.config import DEVNET_TREASURY_ADDRESS, POINTS_PER_DEVNET_SOL, DEVNET_DEPOSITS_ENABLED, AI_CHAT_COST_POINTS
    return {
        "treasury": DEVNET_TREASURY_ADDRESS,
        "network": "devnet",
        "chat_cost": AI_CHAT_COST_POINTS,
        "chat_free": False,
        "points_per_sol": POINTS_PER_DEVNET_SOL,
        "deposits_enabled": DEVNET_DEPOSITS_ENABLED,
    }


class DepositRequest(BaseModel):
    signature: str
    intent_id: str


@router.post("/deposit-intent")
def deposit_intent(user: dict = Depends(require_member_session)):
    import time
    import uuid
    from ...core.config import DEVNET_TREASURY_ADDRESS, DEVNET_DEPOSITS_ENABLED
    if not DEVNET_DEPOSITS_ENABLED:
        raise HTTPException(503, "Tính năng nạp SOL Devnet đang tạm tắt.")
    with get_db() as conn:
        address = conn.execute("SELECT address FROM users WHERE id = ?", (user["id"],)).fetchone()[0]
        if not address or address == DEVNET_TREASURY_ADDRESS:
            raise HTTPException(400, "Đăng nhập bằng ví Phantom gửi tiền khác ví treasury.")
        intent = uuid.uuid4().hex
        conn.execute("INSERT INTO solana_deposits (id,user_id,sender,created_at) VALUES (?, ?, ?, ?)",
                     (intent, user["id"], address, time.time()))
        conn.commit()
    return {"intent_id": intent, "memo": f"UniSynapse:deposit:{intent}",
            "treasury": DEVNET_TREASURY_ADDRESS}


@router.post("/deposit-verify")
def deposit_verify(req: DepositRequest, user: dict = Depends(require_member_session)):
    import json
    import time
    import urllib.request
    from ...core.config import SOLANA_RPC_URL, SOLANA_NETWORK, DEVNET_TREASURY_ADDRESS
    from ...services.ledger_service import settle_reward
    if SOLANA_NETWORK != "devnet":
        raise HTTPException(503, "Chỉ hỗ trợ Devnet.")
    if not SolanaService.SIGNATURE_RE.fullmatch(req.signature):
        raise HTTPException(400, "Signature không hợp lệ.")
    def rpc(method, params):
        data = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
        try:
            with urllib.request.urlopen(urllib.request.Request(SOLANA_RPC_URL, data=data,
                    headers={"Content-Type": "application/json"}), timeout=20) as response:
                body = json.load(response)
            if "error" in body:
                raise ValueError("RPC error")
            return body.get("result")
        except Exception as exc:
            raise HTTPException(503, "RPC chưa sẵn sàng; thử đối soát lại, không gửi tiền lại.") from exc
    if rpc("getGenesisHash", []) != "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG":
        raise HTTPException(503, "RPC không phải Devnet.")
    tx = rpc("getTransaction", [req.signature, {"encoding": "jsonParsed", "commitment": "finalized", "maxSupportedTransactionVersion": 0}])
    if not tx:
        raise HTTPException(409, "Giao dịch chưa finalized. Thử đối soát lại.")
    if tx.get("meta", {}).get("err") is not None:
        raise HTTPException(400, "Giao dịch thất bại.")
    with get_db() as conn:
        conn.execute("BEGIN IMMEDIATE")
        intent = conn.execute("SELECT * FROM solana_deposits WHERE id = ? AND user_id = ?",
                              (req.intent_id, user["id"])).fetchone()
        if not intent:
            raise HTTPException(404, "Không tìm thấy yêu cầu nạp.")
        if intent["signature"]:
            if intent["signature"] != req.signature:
                raise HTTPException(409, "Yêu cầu đã dùng.")
            return {"credited": intent["points"], "signature": req.signature}
        if conn.execute("SELECT id FROM solana_deposits WHERE signature = ?", (req.signature,)).fetchone():
            raise HTTPException(409, "Giao dịch đã được ghi nhận.")
        message = tx["transaction"]["message"]
        instructions = message["instructions"]
        memo = f"UniSynapse:deposit:{req.intent_id}"
        def has_memo(instruction):
            if instruction.get("programId") != "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr":
                return False
            parsed = instruction.get("parsed")
            if isinstance(parsed, str):
                return parsed == memo
            if isinstance(parsed, dict):
                return parsed.get("info") == memo or parsed.get("memo") == memo
            return False
        # Older wallet flow versions could send the transfer without the Memo instruction.
        # Keep reconciliation safe through the intent ownership, sender, treasury,
        # timestamp, amount, and replay checks below instead of discarding a finalized deposit.
        if not any(k.get("pubkey") == intent["sender"] and k.get("signer") for k in message["accountKeys"]):
            raise HTTPException(400, "Sai ví gửi.")
        transfers = [i.get("parsed", {}).get("info", {}) for i in instructions
                     if i.get("programId") == "11111111111111111111111111111111"
                     and isinstance(i.get("parsed"), dict) and i["parsed"].get("type") == "transfer"]
        amount = sum(i.get("lamports", 0) for i in transfers
                     if i.get("source") == intent["sender"] and i.get("destination") == DEVNET_TREASURY_ADDRESS)
        if type(amount) is not int or amount < 1000000 or amount % 1000000:
            raise HTTPException(400, "Số nạp phải là bội số 0.001 SOL.")
        if not tx.get("blockTime") or tx["blockTime"] < intent["created_at"] - 60:
            raise HTTPException(400, "Giao dịch có trước yêu cầu nạp.")
        daily = conn.execute("SELECT COALESCE(SUM(lamports),0) FROM solana_deposits WHERE user_id = ? AND credited_at >= ?",
                             (user["id"], time.time() - 86400)).fetchone()[0]
        if daily + amount > 10000000000:
            raise HTTPException(400, "Vượt giới hạn 10 SOL trong 24 giờ.")
        points = amount // 1000000
        settle_reward(conn, user_id=user["id"], delta=points, reason="Nạp SOL Devnet",
                      source_type="sol_deposit", source_id=req.intent_id,
                      reward_event_key=f"deposit:{req.signature}", proof_hash=req.signature,
                      proof_status="verified", solana_signature=req.signature)
        conn.execute("UPDATE solana_deposits SET signature=?,points=?,lamports=?,credited_at=? WHERE id=?",
                     (req.signature, points, amount, time.time(), req.intent_id))
        conn.commit()
    return {"credited": points, "signature": req.signature}



class DepositRecoverRequest(BaseModel):
    signature: str


@router.post("/deposit-recover")
def deposit_recover(req: DepositRecoverRequest, user: dict = Depends(require_member_session)):
    """Recover a finalized treasury deposit when the original browser intent was lost."""
    import json
    import time
    import urllib.request
    import uuid
    from ...core.config import SOLANA_RPC_URL, SOLANA_NETWORK, DEVNET_TREASURY_ADDRESS

    if SOLANA_NETWORK != "devnet":
        raise HTTPException(503, "Chỉ hỗ trợ Devnet.")
    if not SolanaService.SIGNATURE_RE.fullmatch(req.signature):
        raise HTTPException(400, "Signature không hợp lệ.")

    def rpc(method, params):
        data = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
        try:
            with urllib.request.urlopen(urllib.request.Request(SOLANA_RPC_URL, data=data,
                    headers={"Content-Type": "application/json"}), timeout=20) as response:
                body = json.load(response)
            if "error" in body:
                raise ValueError("RPC error")
            return body.get("result")
        except Exception as exc:
            raise HTTPException(503, "RPC chưa sẵn sàng; thử lại, không gửi tiền lại.") from exc

    if rpc("getGenesisHash", []) != "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG":
        raise HTTPException(503, "RPC không phải Devnet.")
    tx = rpc("getTransaction", [req.signature, {"encoding": "jsonParsed", "commitment": "finalized", "maxSupportedTransactionVersion": 0}])
    if not tx:
        raise HTTPException(409, "Giao dịch chưa finalized. Thử lại sau, không gửi tiền lại.")
    if tx.get("meta", {}).get("err") is not None:
        raise HTTPException(400, "Giao dịch thất bại.")

    with get_db() as conn:
        sender_row = conn.execute("SELECT address FROM users WHERE id = ?", (user["id"],)).fetchone()
    sender = sender_row["address"] if sender_row else None
    message = tx.get("transaction", {}).get("message", {})
    if not sender or not any(k.get("pubkey") == sender and k.get("signer") for k in message.get("accountKeys", [])):
        raise HTTPException(400, "Giao dịch không được gửi từ ví đang đăng nhập.")
    transfers = [i.get("parsed", {}).get("info", {}) for i in message.get("instructions", [])
                 if i.get("programId") == "11111111111111111111111111111111"
                 and isinstance(i.get("parsed"), dict) and i["parsed"].get("type") == "transfer"]
    amount = sum(i.get("lamports", 0) for i in transfers
                 if i.get("source") == sender and i.get("destination") == DEVNET_TREASURY_ADDRESS)
    if type(amount) is not int or amount < 1_000_000 or amount % 1_000_000:
        raise HTTPException(400, "Không tìm thấy khoản chuyển hợp lệ tới ví hệ thống.")

    with get_db() as conn:
        existing = conn.execute("SELECT points FROM solana_deposits WHERE signature = ?", (req.signature,)).fetchone()
        if existing:
            return {"credited": existing["points"], "signature": req.signature}
        intent_id = uuid.uuid4().hex
        conn.execute("INSERT INTO solana_deposits (id,user_id,sender,created_at) VALUES (?, ?, ?, ?)",
                     (intent_id, user["id"], sender, tx.get("blockTime") or time.time()))
        conn.commit()
    return deposit_verify(DepositRequest(intent_id=intent_id, signature=req.signature), user)


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

        for row in rows:
            trusted = row.get("proof_status") == "verified"
            row["solana_signature"] = row.get("solana_signature") if trusted else None
            row["explorer_url"] = (
                SolanaService.get_explorer_url(row.get("solana_signature"))
                if trusted else None
            )
            row["verification_reason"] = (
                "Settlement verified against Devnet."
                if trusted
                else "Settlement has not been reconciled against Devnet."
            )
                
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

