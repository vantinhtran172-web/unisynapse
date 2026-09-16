import pytest
from unittest.mock import patch
from backend.services.acb_service import ACBService
from backend.core.database import get_db, init_db
from backend.tests.test_auth import member_client  # noqa: F401


@pytest.fixture(autouse=True)
def setup_db():
    init_db()


def test_acb_service_vietqr_and_points():
    qr = ACBService.generate_vietqr(20000, "UPTEST01")
    assert "38038627" in qr
    assert "ACB" in qr
    assert "UPTEST01" in qr

    # Test points calculation with bonus tiers
    assert ACBService.calculate_points(10000) == 1000
    assert ACBService.calculate_points(20000) == 2200  # +10% bonus
    assert ACBService.calculate_points(50000) == 6000  # +20% bonus
    assert ACBService.calculate_points(100000) == 13000  # +30% bonus


def test_bank_deposit_strict_verification_flow(member_client):
    client, username, password, member_id = member_client

    try:
        login = client.post("/api/v1/auth/login", json={"username": username, "password": password})
        assert login.status_code == 200
        client.headers["X-CSRF-Token"] = client.cookies["unisynapse_csrf"]

        # 1. Validation for minimum amount (< 10000 VND rejected)
        res_bad = client.post("/api/v1/rewards/bank/create-intent", json={"amount_vnd": 5000})
        assert res_bad.status_code == 400

        # 2. Create valid deposit intent
        with patch.object(ACBService, "get_live_balance", return_value=10000.0):
            res = client.post("/api/v1/rewards/bank/create-intent", json={"amount_vnd": 20000})
            assert res.status_code == 200
            data = res.json()
            assert data["ok"] is True
            assert data["order_code"].startswith("UP")
            assert data["amount_vnd"] == 20000
            assert data["points"] == 2200
            order_code = data["order_code"]

        # 3. Check when bank has NOT received the money yet
        with patch.object(ACBService, "get_transaction_history", return_value=[]), \
             patch.object(ACBService, "get_live_balance", return_value=10000.0):
            chk1 = client.get(f"/api/v1/rewards/bank/check/{order_code}")
            assert chk1.status_code == 200
            res1 = chk1.json()
            assert res1["status"] == "pending"
            assert res1["credited"] is False

        # Verify no UniPoints were credited
        summary1 = client.get("/api/v1/rewards/summary").json()
        assert summary1["unipoints"] == 0

        # 4. Check when transaction arrives but with WRONG description/memo and balance not increased
        wrong_txs = [
            {
                "type": "IN",
                "amount": 20000,
                "description": "CHUYEN TIEN MUA HANG KHAC",
                "transactionNumber": "123456",
            }
        ]
        with patch.object(ACBService, "get_transaction_history", return_value=wrong_txs), \
             patch.object(ACBService, "get_live_balance", return_value=10000.0):
            chk2 = client.get(f"/api/v1/rewards/bank/check/{order_code}")
            assert chk2.status_code == 200
            res2 = chk2.json()
            assert res2["status"] == "pending"
            assert res2["credited"] is False

        summary2 = client.get("/api/v1/rewards/summary").json()
        assert summary2["unipoints"] == 0

        # 5. Check when transaction arrives with correct order_code but INSUFFICIENT amount
        underpaid_txs = [
            {
                "type": "IN",
                "amount": 10000,
                "description": f"NAP DIEM {order_code}",
                "transactionNumber": "123457",
            }
        ]
        with patch.object(ACBService, "get_transaction_history", return_value=underpaid_txs), \
             patch.object(ACBService, "get_live_balance", return_value=15000.0):
            chk3 = client.get(f"/api/v1/rewards/bank/check/{order_code}")
            assert chk3.status_code == 200
            res3 = chk3.json()
            assert res3["status"] == "pending"
            assert res3["credited"] is False

        # 6. Real match: Balance delta verification (+20,000 VND detected on ACB account)
        with patch.object(ACBService, "get_transaction_history", return_value=None), \
             patch.object(ACBService, "get_live_balance", return_value=30000.0):
            chk4 = client.get(f"/api/v1/rewards/bank/check/{order_code}")
            assert chk4.status_code == 200
            res4 = chk4.json()
            assert res4["status"] == "paid"
            assert res4["credited"] is True
            assert res4["points"] == 2200

        # 7. Verify ledger entry and points credited
        summary3 = client.get("/api/v1/rewards/summary").json()
        assert summary3["unipoints"] >= 2200

        # 8. Check bank history confirms status is paid
        history = client.get("/api/v1/rewards/bank/history").json()
        assert any(h["order_code"] == order_code and h["status"] == "paid" for h in history)

        # 9. Verify simulate-confirm endpoint is completely gone (404/405)
        sim_del = client.post(f"/api/v1/rewards/bank/simulate-confirm/{order_code}")
        assert sim_del.status_code in (404, 405)

    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM ledger_entries WHERE account_id = ?", (f"member:{member_id}",))
            conn.execute("DELETE FROM ledger_transactions WHERE source_type = 'acb_bank_deposit'")
            conn.execute("DELETE FROM ledger_accounts WHERE id = ?", (f"member:{member_id}",))
            conn.execute("DELETE FROM reward_ledger WHERE user_id = ?", (member_id,))
            conn.execute("DELETE FROM bank_deposits WHERE user_id = ?", (member_id,))
            conn.commit()


def test_bank_deposit_10min_timeout(member_client):
    """Test that bank deposits expire after 10 minutes (600s) and QR is cut off."""
    import time
    from backend.services.bank_watcher import _check_and_settle_pending_bank_deposits

    client, username, password, member_id = member_client

    try:
        login = client.post("/api/v1/auth/login", json={"username": username, "password": password})
        assert login.status_code == 200
        client.headers["X-CSRF-Token"] = client.cookies["unisynapse_csrf"]

        # 1. Create order
        with patch.object(ACBService, "get_live_balance", return_value=50000.0):
            res = client.post("/api/v1/rewards/bank/create-intent", json={"amount_vnd": 20000})
            assert res.status_code == 200
            data = res.json()
            assert data["expires_in_seconds"] == 600
            assert data["status"] == "pending"
            assert "created_at" in data
            order_code = data["order_code"]

        # 2. Initially active and pending (< 600s)
        with patch.object(ACBService, "get_transaction_history", return_value=[]), \
             patch.object(ACBService, "get_live_balance", return_value=50000.0):
            chk = client.get(f"/api/v1/rewards/bank/check/{order_code}")
            assert chk.status_code == 200
            assert chk.json()["status"] == "pending"

        # 3. Simulate passage of > 10 minutes (e.g. 605 seconds ago)
        ten_mins_ago = time.time() - 605
        with get_db() as conn:
            conn.execute(
                "UPDATE bank_deposits SET created_at = ? WHERE order_code = ?",
                (ten_mins_ago, order_code)
            )
            conn.commit()

        # 4. Check endpoint detects timeout and marks expired
        chk_expired = client.get(f"/api/v1/rewards/bank/check/{order_code}")
        assert chk_expired.status_code == 200
        res_exp = chk_expired.json()
        assert res_exp["status"] == "expired"
        assert res_exp["credited"] is False
        assert "hết thời gian chờ" in res_exp["message"].lower()

        # 5. Verify database status is expired
        with get_db() as conn:
            row = conn.execute("SELECT status FROM bank_deposits WHERE order_code = ?", (order_code,)).fetchone()
            assert row["status"] == "expired"

        # 6. Test watcher also auto-expires old pending orders
        with patch.object(ACBService, "get_live_balance", return_value=50000.0):
            res2 = client.post("/api/v1/rewards/bank/create-intent", json={"amount_vnd": 10000})
            order_code2 = res2.json()["order_code"]

        with get_db() as conn:
            conn.execute(
                "UPDATE bank_deposits SET created_at = ? WHERE order_code = ?",
                (time.time() - 700, order_code2)
            )
            conn.commit()

        # Run watcher tick
        _check_and_settle_pending_bank_deposits()

        with get_db() as conn:
            row2 = conn.execute("SELECT status FROM bank_deposits WHERE order_code = ?", (order_code2,)).fetchone()
            assert row2["status"] == "expired"

    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM bank_deposits WHERE user_id = ?", (member_id,))
            conn.commit()


def test_bank_deposit_sol_swap_onramp(member_client):
    """Test that paying via VietQR with payout_mode='sol_swap' automatically transfers SOL to Phantom wallet."""
    from backend.services.solana_onramp_service import SolanaOnRampService

    client, username, password, member_id = member_client
    student_wallet = "FEdvEMCedQ2xonCfGLNKAyqdbeyP6HJz6bVHqYQE2hgq"

    try:
        login = client.post("/api/v1/auth/login", json={"username": username, "password": password})
        assert login.status_code == 200
        client.headers["X-CSRF-Token"] = client.cookies["unisynapse_csrf"]

        # 1. Create On-Ramp order (20,000 VND -> 0.12 SOL)
        with patch.object(ACBService, "get_live_balance", return_value=10000.0):
            res = client.post("/api/v1/rewards/bank/create-intent", json={
                "amount_vnd": 20000,
                "payout_mode": "sol_swap",
                "target_wallet": student_wallet
            })
            assert res.status_code == 200
            data = res.json()
            assert data["payout_mode"] == "sol_swap"
            assert data["sol_amount"] == 0.12
            assert data["target_wallet"] == student_wallet
            order_code = data["order_code"]

        # 2. Bank settlement with ACB verification
        mock_sol_transfer = {
            "ok": True,
            "signature": "5TestSolanaSignatureOnRamp111111111111111111111111111111111111111111111111111111111111111111",
            "explorer_url": "https://explorer.solana.com/tx/5TestSolanaSignatureOnRamp111111111111111111111111111111111111111111111111111111111111111111?cluster=devnet",
            "amount_sol": 0.12,
            "recipient": student_wallet
        }

        with patch.object(ACBService, "get_transaction_history", return_value=None), \
             patch.object(ACBService, "get_live_balance", return_value=30000.0), \
             patch.object(SolanaOnRampService, "transfer_sol_to_student", return_value=mock_sol_transfer) as mock_transfer:
            chk = client.get(f"/api/v1/rewards/bank/check/{order_code}")
            assert chk.status_code == 200
            res_data = chk.json()
            assert res_data["status"] == "paid"
            assert res_data["payout_mode"] == "sol_swap"
            assert res_data["sol_amount"] == 0.12
            assert res_data["solana_signature"] == mock_sol_transfer["signature"]
            assert "explorer.solana.com" in res_data["solana_explorer_url"]
            assert mock_transfer.called

        # 3. Verify history record has solana_signature and sol_amount
        history = client.get("/api/v1/rewards/bank/history").json()
        target = next((h for h in history if h["order_code"] == order_code), None)
        assert target is not None
        assert target["solana_signature"] == mock_sol_transfer["signature"]
        assert target["sol_amount"] == 0.12

    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM ledger_entries WHERE account_id = ?", (f"member:{member_id}",))
            conn.execute("DELETE FROM ledger_transactions WHERE source_type = 'acb_bank_deposit'")
            conn.execute("DELETE FROM ledger_accounts WHERE id = ?", (f"member:{member_id}",))
            conn.execute("DELETE FROM reward_ledger WHERE user_id = ?", (member_id,))
            conn.execute("DELETE FROM bank_deposits WHERE user_id = ?", (member_id,))
            conn.commit()




