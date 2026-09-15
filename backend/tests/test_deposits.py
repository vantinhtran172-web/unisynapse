import json
import time
import urllib.request

import pytest
from fastapi import HTTPException

from backend.api.v1.rewards import DepositRequest, deposit_intent, deposit_verify
from backend.core import config
from backend.core.database import get_db
from backend.tests.test_auth import member_client  # noqa: F401


def test_deposit_disabled_before_database(monkeypatch):
    monkeypatch.setattr(config, "DEVNET_DEPOSITS_ENABLED", False)
    with pytest.raises(HTTPException) as error:
        deposit_intent({"id": "missing"})
    assert error.value.status_code == 503


def test_deposit_replay_returns_same_credit(member_client, monkeypatch):
    _, _, _, member_id = member_client
    sender = "11111111111111111111111111111112"
    monkeypatch.setattr(config, "DEVNET_DEPOSITS_ENABLED", True)
    with get_db() as conn:
        conn.execute("UPDATE users SET address = ? WHERE id = ?", (sender, member_id))
        conn.commit()
    user = {"id": member_id}
    intent = deposit_intent(user)
    signature = "2" * 88
    transaction = {
        "meta": {"err": None}, "blockTime": int(time.time()),
        "transaction": {"message": {"accountKeys": [{"pubkey": sender, "signer": True}], "instructions": [
            {"programId": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr", "parsed": intent["memo"]},
            {"programId": "11111111111111111111111111111111", "parsed": {"type": "transfer", "info": {
                "source": sender, "destination": config.DEVNET_TREASURY_ADDRESS, "lamports": 80_000_000}}},
        ]}},
    }

    def rpc(request, timeout):
        method = json.loads(request.data)["method"]
        result = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG" if method == "getGenesisHash" else transaction
        class Response:
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self): return json.dumps({"result": result}).encode()
        return Response()

    monkeypatch.setattr(urllib.request, "urlopen", rpc)
    request = DepositRequest(intent_id=intent["intent_id"], signature=signature)
    try:
        assert deposit_verify(request, user)["credited"] == 80
        assert deposit_verify(request, user)["credited"] == 80
        with get_db() as conn:
            assert conn.execute("SELECT unipoints FROM users WHERE id = ?", (member_id,)).fetchone()[0] == 80
    finally:
        with get_db() as conn:
            conn.execute(
                "DELETE FROM ledger_entries WHERE transaction_id IN "
                "(SELECT id FROM ledger_transactions WHERE source_id = ?)",
                (intent["intent_id"],),
            )
            conn.execute(
                "DELETE FROM reward_ledger WHERE user_id = ? AND source_type = 'sol_deposit'",
                (member_id,),
            )
            conn.execute("DELETE FROM ledger_transactions WHERE source_id = ?", (intent["intent_id"],))
            conn.execute("DELETE FROM ledger_accounts WHERE id = ?", (f"member:{member_id}",))
            conn.execute("DELETE FROM solana_deposits WHERE user_id = ?", (member_id,))
            conn.commit()


def test_deposit_sync_credits_matching_transfers(member_client, monkeypatch):
    import uuid
    from backend.api.v1.rewards import deposit_sync
    _, _, _, member_id = member_client
    sender = f"TestSender{uuid.uuid4().hex[:20]}"
    monkeypatch.setattr(config, "DEVNET_DEPOSITS_ENABLED", True)
    with get_db() as conn:
        conn.execute("UPDATE users SET address = ?, unipoints = 0 WHERE id = ?", (sender, member_id))
        conn.commit()
    user = {"id": member_id}
    sig1 = "4" + uuid.uuid4().hex * 2
    sig1 = (sig1 + "1" * 88)[:88]
    tx1 = {
        "meta": {"err": None}, "blockTime": int(time.time()),
        "transaction": {"message": {"accountKeys": [{"pubkey": sender, "signer": True}], "instructions": [
            {"programId": "11111111111111111111111111111111", "parsed": {"type": "transfer", "info": {
                "source": sender, "destination": config.DEVNET_TREASURY_ADDRESS, "lamports": 80_000_000}}},
        ]}},
    }

    def rpc(request, timeout):
        method = json.loads(request.data)["method"]
        if method == "getGenesisHash":
            result = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG"
        elif method == "getSignaturesForAddress":
            result = [{"signature": sig1, "err": None, "blockTime": int(time.time())}]
        else:
            result = tx1

        class Response:
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self): return json.dumps({"result": result}).encode()
        return Response()

    monkeypatch.setattr(urllib.request, "urlopen", rpc)
    try:
        res = deposit_sync(user)
        assert res["credited"] == 80
        assert res["count"] == 1
        with get_db() as conn:
            assert conn.execute("SELECT unipoints FROM users WHERE id = ?", (member_id,)).fetchone()[0] == 80
        # Re-syncing should not double credit
        res2 = deposit_sync(user)
        assert res2["credited"] == 0
        assert res2["count"] == 0
    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM ledger_entries WHERE account_id = ?", (f"member:{member_id}",))
            conn.execute("DELETE FROM ledger_transactions WHERE source_type = 'sol_deposit'")
            conn.execute("DELETE FROM ledger_accounts WHERE id = ?", (f"member:{member_id}",))
            conn.execute("DELETE FROM reward_ledger WHERE user_id = ?", (member_id,))
            conn.execute("DELETE FROM solana_deposits WHERE user_id = ?", (member_id,))
            conn.execute("UPDATE users SET address = NULL WHERE id = ?", (member_id,))
            conn.commit()


