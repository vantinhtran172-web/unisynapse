import sqlite3

from backend.services.solana_reconciliation_service import SolanaReconciliationService
from backend.services.solana_service import SolanaService


def make_db(status="unsubmitted", signature=None, attempts=0):
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE reward_ledger (
            id TEXT PRIMARY KEY, user_id TEXT, delta INTEGER, source_type TEXT,
            source_id TEXT, proof_hash TEXT, proof_status TEXT,
            solana_signature TEXT, proof_attempts INTEGER,
            proof_last_error TEXT, proof_next_retry_at REAL,
            proof_submitted_at REAL, proof_verified_at REAL, created_at REAL
        )
    """)
    conn.execute(
        """INSERT INTO reward_ledger
        (id,user_id,delta,source_type,source_id,proof_hash,proof_status,
         solana_signature,proof_attempts,created_at)
        VALUES ('r1','u1',10,'task','t1',?,?,?, ?, 1)""",
        (SolanaService.create_proof_hash("legacy"), status, signature, attempts),
    )
    conn.commit()
    return conn


def rpc_for(memo, status="confirmed", error=None):
    def call(method, params):
        assert method == "getTransaction"
        return {"confirmationStatus": status, "meta": {"err": error, "memo": memo}}
    return call


def test_reconciliation_verifies_matching_memo():
    conn = make_db(signature="5" * 44)
    memo = SolanaService.format_memo_payload("task", "t1", "u1", 10)
    service = SolanaReconciliationService(conn, rpc_for(memo))
    row = service.claim_one()
    outcome = service.reconcile_one(row)
    assert outcome["status"] == "verified"
    assert conn.execute("SELECT proof_status FROM reward_ledger").fetchone()[0] == "verified"


def test_reconciliation_rejects_unconfirmed_transaction_and_retries():
    conn = make_db(signature="5" * 44)
    service = SolanaReconciliationService(
        conn,
        rpc_for("wrong", status="processed"),
        now=lambda: 100,
        max_retries=3,
    )
    outcome = service.reconcile_one(service.claim_one())
    assert outcome["status"] == "retryable"
    row = conn.execute("SELECT proof_last_error, proof_next_retry_at FROM reward_ledger").fetchone()
    assert row["proof_last_error"]
    assert row["proof_next_retry_at"] > 100


def test_reconciliation_fails_closed_without_submitter():
    conn = make_db()
    service = SolanaReconciliationService(conn, rpc_for("unused"), max_retries=1)
    outcome = service.reconcile_one(service.claim_one())
    assert outcome["status"] == "failed"
    assert conn.execute("SELECT proof_status FROM reward_ledger").fetchone()[0] == "failed"


def test_solona_explorer_url_rejects_untrusted_signature_shape():
    assert SolanaService.get_explorer_url("not-a-signature") is None
    assert SolanaService.get_explorer_url("5" * 44)
