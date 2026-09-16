"""
UniSynapse ACB Bank Deposit Auto-Watcher Service.
Runs as a continuous background daemon inside the FastAPI application lifespan.
Continuously scans pending deposits, queries ACB real-time bank status,
and automatically settles rewards into the dual-entry ledger immediately upon receipt.
"""

import asyncio
import logging
import time
from typing import Optional

from ..core.database import get_db
from ..services.acb_service import ACBService
from ..services.ledger_service import settle_reward

logger = logging.getLogger("bank_watcher")

_WATCHER_RUNNING = False


async def bank_deposit_watcher_loop(interval_seconds: float = 4.0):
    """
    Background worker loop that continuously monitors pending ACB bank deposits.
    Automatically checks live ACB account balance and transaction statement.
    Immediately settles the reward and credits UniPoints without requiring manual user clicks.
    """
    global _WATCHER_RUNNING
    _WATCHER_RUNNING = True
    logger.info("ACB Bank Deposit Auto-Watcher started (polling every %.1fs)", interval_seconds)

    while _WATCHER_RUNNING:
        try:
            await asyncio.to_thread(_check_and_settle_pending_bank_deposits)
        except asyncio.CancelledError:
            logger.info("ACB Bank Deposit Auto-Watcher cancelled.")
            break
        except Exception as err:
            logger.warning("ACB Bank Deposit Auto-Watcher tick warning: %s", err)

        try:
            await asyncio.sleep(interval_seconds)
        except asyncio.CancelledError:
            break


def stop_bank_watcher():
    """Stop the background watcher loop."""
    global _WATCHER_RUNNING
    _WATCHER_RUNNING = False


def _check_and_settle_pending_bank_deposits():
    """
    Scan recent pending deposits and settle them automatically upon ACB payment receipt.
    Uses dual-verification: statement memo match or real-time balance delta on account 38038627.
    """
    now = time.time()
    cutoff = now - 600  # Orders older than 10 minutes (600s) are expired

    with get_db() as conn:
        # 1. Automatically expire pending orders older than 10 minutes
        expired_rows = conn.execute("""
            SELECT order_code FROM bank_deposits
            WHERE status = 'pending' AND created_at < ?
        """, (cutoff,)).fetchall()
        if expired_rows:
            conn.execute("""
                UPDATE bank_deposits
                SET status = 'expired'
                WHERE status = 'pending' AND created_at < ?
            """, (cutoff,))
            conn.commit()
            for er in expired_rows:
                logger.info("⌛ [ACB TIMEOUT] Order %s marked as expired (> 10 mins).", er["order_code"])

        # 1.5. Self-heal: Retry any paid sol_swap orders missing solana_signature
        retry_rows = conn.execute("""
            SELECT id, user_id, order_code, amount_vnd, points, status, created_at,
                   payout_mode, sol_amount, target_wallet, solana_signature
            FROM bank_deposits
            WHERE status = 'paid' AND payout_mode = 'sol_swap' AND (solana_signature IS NULL OR solana_signature = '')
            ORDER BY created_at ASC
            LIMIT 5
        """).fetchall()
        for rr in retry_rows:
            r_dict = dict(rr)
            code = r_dict["order_code"]
            wallet = r_dict.get("target_wallet")
            amount = r_dict.get("sol_amount", 0.0)
            if code == "UPM10Z7":
                known_sig = "5TQexW6sXxZq5sGQGidT3RMUa3zTwhRuS26Y3kUWYrrcVrHJbVEjYoK2TZsoyuLkJhQErUp3PRgPoGbVo67c2YUq"
                conn.execute("UPDATE bank_deposits SET solana_signature = ? WHERE order_code = ?", (known_sig, code))
                conn.execute("UPDATE reward_ledger SET solana_signature = ? WHERE reward_event_key = ?", (known_sig, f"acb_deposit:{code}"))
                conn.commit()
                logger.info("⚡ [SOL ON-RAMP RECOVERY] Linked known tx %s to order %s", known_sig, code)
            elif wallet and amount > 0:
                from ..services.solana_onramp_service import SolanaOnRampService
                try:
                    t_res = SolanaOnRampService.transfer_sol_to_student(
                        recipient_pubkey=wallet,
                        amount_sol=amount,
                        memo=f"UniSynapse:OnRamp:{code}"
                    )
                    if t_res.get("onchain_confirmed") or (t_res.get("ok") and t_res.get("signature")):
                        new_sig = t_res.get("signature")
                        conn.execute("UPDATE bank_deposits SET solana_signature = ? WHERE order_code = ?", (new_sig, code))
                        conn.execute("UPDATE reward_ledger SET solana_signature = ? WHERE reward_event_key = ?", (new_sig, f"acb_deposit:{code}"))
                        conn.commit()
                        logger.info("⚡ [SOL ON-RAMP RECOVERY] Transferred %.3f SOL to %s: Tx %s", amount, wallet, new_sig)
                except Exception as ex:
                    logger.error("Error in bank_watcher SOL recovery for %s: %s", code, ex)

        # 2. Fetch only active pending orders within 10-minute window
        rows = conn.execute("""
            SELECT id, user_id, order_code, amount_vnd, points, status, created_at, initial_balance,
                   payout_mode, sol_amount, target_wallet, solana_signature
            FROM bank_deposits
            WHERE status = 'pending' AND created_at >= ?
            ORDER BY created_at ASC
        """, (cutoff,)).fetchall()

    if not rows:
        return

    for r in rows:
        order = dict(r)
        order_code = order["order_code"]
        amount_vnd = order["amount_vnd"]
        points = order["points"]
        user_id = order["user_id"]
        initial_bal = order.get("initial_balance")

        try:
            check_res = ACBService.verify_transaction(
                order_code=order_code,
                amount_vnd=amount_vnd,
                initial_balance=initial_bal
            )

            if check_res.get("matched"):
                solana_sig = order.get("solana_signature")
                if order.get("payout_mode") == "sol_swap" and order.get("target_wallet") and not solana_sig:
                    from ..services.solana_onramp_service import SolanaOnRampService
                    try:
                        transfer_res = SolanaOnRampService.transfer_sol_to_student(
                            recipient_pubkey=order["target_wallet"],
                            amount_sol=order.get("sol_amount", 0.0),
                            memo=f"UniSynapse:OnRamp:{order_code}"
                        )
                        solana_sig = transfer_res.get("signature")
                        logger.info("⚡ [SOL ON-RAMP] Sent %.3f SOL to %s: Tx %s", order.get("sol_amount", 0.0), order["target_wallet"], solana_sig)
                    except Exception as err:
                        logger.error("Error transferring On-Ramp SOL: %s", err)

                with get_db() as conn:
                    # Atomic lock check
                    curr = conn.execute(
                        "SELECT status FROM bank_deposits WHERE order_code = ?",
                        (order_code,)
                    ).fetchone()
                    if curr and curr[0] == "paid":
                        continue

                    settle_reward(
                        conn,
                        user_id=user_id,
                        delta=points,
                        reason=f"Nạp qua Ngân hàng ACB (Mã {order_code}) - {order.get('payout_mode', 'unipoints')}",
                        source_type="acb_bank_deposit",
                        source_id=order["id"],
                        reward_event_key=f"acb_deposit:{order_code}",
                        proof_hash=order_code,
                        solana_signature=solana_sig,
                    )
                    tx_meta = check_res.get("transaction") or {}
                    final_bal = tx_meta.get("live_balance") if isinstance(tx_meta, dict) else None
                    conn.execute("""
                        UPDATE bank_deposits 
                        SET status = 'paid', credited_at = ?, final_balance = ?, solana_signature = ?
                        WHERE order_code = ?
                    """, (time.time(), final_bal, solana_sig, order_code))
                    if solana_sig:
                        conn.execute("UPDATE reward_ledger SET solana_signature = ? WHERE reward_event_key = ?", (solana_sig, f"acb_deposit:{order_code}"))
                    conn.commit()

                logger.info(
                    "🎉 [ACB AUTO-SETTLE] Order %s for user %s: automatically settled (%s, Method: %s)!",
                    order_code, user_id, order.get("payout_mode", "unipoints"), check_res.get("method")
                )
        except Exception as e:
            logger.error("Error in auto-settling order %s: %s", order_code, e)
