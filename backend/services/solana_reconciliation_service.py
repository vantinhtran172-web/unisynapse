import time
from typing import Any, Callable, Dict, Optional

from .solana_service import SolanaService


class ProofReconciliationError(RuntimeError):
    """Raised when a proof cannot be safely reconciled."""


class SolanaReconciliationService:
    """Claim and reconcile reward proofs without mutating the internal reward amount."""

    def __init__(
        self,
        conn: Any,
        rpc_call: Callable[[str, list], Dict[str, Any]],
        submitter: Optional[Callable[[Dict[str, Any]], str]] = None,
        now: Optional[Callable[[], float]] = None,
        max_retries: int = 5,
    ) -> None:
        self.conn = conn
        self.rpc_call = rpc_call
        self.submitter = submitter
        self.now = now or time.time
        self.max_retries = max_retries

    def claim_one(self) -> Optional[Dict[str, Any]]:
        """Claim one due proof; the compare-and-set prevents duplicate workers."""
        cursor = self.conn.cursor()
        current_time = self.now()
        row = cursor.execute(
            """
            SELECT * FROM reward_ledger
            WHERE proof_status IN ('unsubmitted', 'retryable', 'submitted')
              AND (proof_next_retry_at IS NULL OR proof_next_retry_at <= ?)
            ORDER BY created_at ASC
            LIMIT 1
            """,
            (current_time,),
        ).fetchone()
        if not row:
            return None
        row_id = row["id"]
        updated = cursor.execute(
            """
            UPDATE reward_ledger
            SET proof_status = 'processing', proof_attempts = proof_attempts + 1,
                proof_last_error = NULL
            WHERE id = ?
              AND proof_status IN ('unsubmitted', 'retryable', 'submitted')
              AND (proof_next_retry_at IS NULL OR proof_next_retry_at <= ?)
            """,
            (row_id, current_time),
        )
        if updated.rowcount != 1:
            return None
        claimed = cursor.execute(
            "SELECT * FROM reward_ledger WHERE id = ?", (row_id,)
        ).fetchone()
        return dict(claimed) if claimed else None

    def reconcile_one(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Submit or verify one claimed proof and return its terminal/current state."""
        try:
            signature = row.get("solana_signature")
            if not signature:
                if not self.submitter:
                    raise ProofReconciliationError("No server-side Solana submitter configured")
                signature = self.submitter(row)
                if not signature:
                    raise ProofReconciliationError("Solana submitter returned no signature")
                self._mark_submitted(row["id"], signature)

            transaction = SolanaService.get_transaction(signature, self.rpc_call)
            if not self._transaction_matches(transaction, row):
                raise ProofReconciliationError("Solana transaction memo or status did not match proof")
            self._mark_verified(row["id"], signature)
            return {"id": row["id"], "status": "verified", "signature": signature}
        except Exception as exc:
            return self._mark_failure(row, str(exc))

    def run_once(self, limit: int = 25) -> Dict[str, int]:
        result = {"claimed": 0, "verified": 0, "retryable": 0, "failed": 0}
        for _ in range(limit):
            row = self.claim_one()
            if not row:
                break
            result["claimed"] += 1
            outcome = self.reconcile_one(row)
            result[outcome["status"]] += 1
        return result

    def _transaction_matches(self, transaction: Dict[str, Any], row: Dict[str, Any]) -> bool:
        if transaction.get("confirmationStatus") not in ("confirmed", "finalized"):
            return False
        meta = transaction.get("meta") or {}
        if meta.get("err") is not None:
            return False
        expected = SolanaService.format_memo_payload(
            row["source_type"], row["source_id"], row["user_id"], row["delta"]
        )
        memo = transaction.get("memo") or meta.get("memo")
        return memo == expected or memo == row.get("proof_hash")

    def _mark_submitted(self, row_id: str, signature: str) -> None:
        self.conn.cursor().execute(
            """
            UPDATE reward_ledger
            SET proof_status = 'submitted', solana_signature = ?,
                proof_submitted_at = ?, proof_next_retry_at = ?
            WHERE id = ? AND proof_status = 'processing'
            """,
            (signature, self.now(), self.now(), row_id),
        )

    def _mark_verified(self, row_id: str, signature: str) -> None:
        self.conn.cursor().execute(
            """
            UPDATE reward_ledger
            SET proof_status = 'verified', solana_signature = ?,
                proof_verified_at = ?, proof_next_retry_at = NULL,
                proof_last_error = NULL
            WHERE id = ? AND proof_status IN ('processing', 'submitted')
            """,
            (signature, self.now(), row_id),
        )

    def _mark_failure(self, row: Dict[str, Any], message: str) -> Dict[str, Any]:
        attempts = int(row.get("proof_attempts") or 0)
        terminal = attempts >= self.max_retries
        status = "failed" if terminal else "retryable"
        retry_at = None if terminal else self.now() + min(3600, 2 ** min(attempts, 10))
        safe_message = message[:500]
        self.conn.cursor().execute(
            """
            UPDATE reward_ledger
            SET proof_status = ?, proof_last_error = ?, proof_next_retry_at = ?
            WHERE id = ? AND proof_status IN ('processing', 'submitted')
            """,
            (status, safe_message, retry_at, row["id"]),
        )
        return {"id": row["id"], "status": status, "error": safe_message}
