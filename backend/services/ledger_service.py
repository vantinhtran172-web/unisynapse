import time
import uuid
from typing import Any, Dict, Optional


class LedgerInvariantError(ValueError):
    """Raised when a reward cannot be represented as a balanced settlement."""


def settle_reward(
    conn: Any,
    *,
    user_id: str,
    delta: int,
    reason: str,
    source_type: str,
    source_id: str,
    reward_event_key: str,
    proof_status: str = "unsubmitted",
    solana_signature: Optional[str] = None,
    proof_hash: str,
    created_at: Optional[float] = None,
) -> Dict[str, Any]:
    """Record one idempotent, balanced reward settlement in the caller transaction."""
    if type(delta) is not int or delta <= 0:
        raise LedgerInvariantError("Reward delta must be a positive integer.")
    if not reward_event_key.strip():
        raise LedgerInvariantError("Reward event key is required.")
    if not proof_hash.strip():
        raise LedgerInvariantError("Reward proof hash is required.")

    now = created_at if created_at is not None else time.time()
    cursor = conn.cursor()
    existing = cursor.execute(
        "SELECT id, delta FROM ledger_transactions WHERE transaction_key = ?",
        (reward_event_key,),
    ).fetchone()
    if existing:
        return {
            "created": False,
            "transaction_id": existing["id"],
            "delta": existing["delta"],
        }

    member_account_id = f"member:{user_id}"
    cursor.execute(
        """
        INSERT OR IGNORE INTO ledger_accounts (id, account_type, user_id, created_at)
        VALUES (?, 'member', ?, ?)
        """,
        (member_account_id, user_id, now),
    )
    cursor.execute(
        """
        INSERT OR IGNORE INTO ledger_accounts (id, account_type, user_id, created_at)
        VALUES ('platform:rewards', 'platform_liability', NULL, ?)
        """,
        (now,),
    )

    transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
    cursor.execute(
        """
        INSERT INTO ledger_transactions
            (id, transaction_key, source_type, source_id, delta, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (transaction_id, reward_event_key, source_type, source_id, delta, now),
    )
    cursor.execute(
        """
        INSERT INTO ledger_entries
            (id, transaction_id, account_id, debit, credit)
        VALUES (?, ?, 'platform:rewards', ?, 0)
        """,
        (f"entry_{uuid.uuid4().hex[:16]}", transaction_id, delta),
    )
    cursor.execute(
        """
        INSERT INTO ledger_entries
            (id, transaction_id, account_id, debit, credit)
        VALUES (?, ?, ?, 0, ?)
        """,
        (f"entry_{uuid.uuid4().hex[:16]}", transaction_id, member_account_id, delta),
    )

    legacy_insert = cursor.execute(
        """
        INSERT OR IGNORE INTO reward_ledger (
            id, user_id, delta, reason, source_type, source_id,
            reward_event_key, proof_status, solana_signature, proof_hash, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            f"led_{uuid.uuid4().hex[:16]}",
            user_id,
            delta,
            reason,
            source_type,
            source_id,
            reward_event_key,
            proof_status,
            solana_signature,
            proof_hash,
            now,
        ),
    )
    if legacy_insert.rowcount != 1:
        raise LedgerInvariantError("Reward projection was not inserted.")

    balance_update = cursor.execute(
        "UPDATE users SET unipoints = unipoints + ? WHERE id = ?",
        (delta, user_id),
    )
    if balance_update.rowcount != 1:
        raise LedgerInvariantError("Reward owner does not exist.")

    return {"created": True, "transaction_id": transaction_id, "delta": delta}


def debit_ai_points(conn, user_id: str, cost: int, usage_id: str) -> None:
    """Record a balanced debit inside a caller-owned serialized transaction."""
    if type(cost) is not int or cost <= 0:
        raise LedgerInvariantError("Invalid cost")
    key = f"ai:{user_id}:{usage_id}"
    updated = conn.execute(
        "UPDATE users SET unipoints = unipoints - ? "
        "WHERE id = ? AND disabled = 0 AND unipoints >= ?",
        (cost, user_id, cost),
    )
    if updated.rowcount != 1:
        raise LedgerInvariantError("Cần ít nhất 80 UniPoints để chat AI.")
    now = time.time()
    member = f"member:{user_id}"
    for account, kind, owner in (
        (member, "member", user_id), ("platform:ai", "platform_liability", None)
    ):
        conn.execute(
            "INSERT OR IGNORE INTO ledger_accounts "
            "(id, account_type, user_id, created_at) VALUES (?, ?, ?, ?)",
            (account, kind, owner, now),
        )
    tx = f"txn_{uuid.uuid4().hex}"
    conn.execute(
        "INSERT INTO ledger_transactions "
        "(id, transaction_key, source_type, source_id, delta, created_at) "
        "VALUES (?, ?, 'ai_usage', ?, ?, ?)", (tx, key, usage_id, cost, now),
    )
    for account, debit, credit in ((member, cost, 0), ("platform:ai", 0, cost)):
        conn.execute(
            "INSERT INTO ledger_entries "
            "(id, transaction_id, account_id, debit, credit) VALUES (?, ?, ?, ?, ?)",
            (uuid.uuid4().hex, tx, account, debit, credit),
        )
    conn.execute(
        "INSERT INTO reward_ledger "
        "(id,user_id,delta,reason,source_type,source_id,reward_event_key,"
        "proof_status,proof_hash,created_at) "
        "VALUES (?, ?, ?, 'Chat AI', 'ai_usage', ?, ?, 'internal', ?, ?)",
        (uuid.uuid4().hex, user_id, -cost, usage_id, key, key, now),
    )
