import argparse
import json
from typing import Any, Dict

import requests

from ..core.config import (
    SOLANA_COMMITMENT,
    SOLANA_MAX_RETRIES,
    SOLANA_RPC_URL,
    SOLANA_SUBMISSION_ENABLED,
    validate_runtime_config,
)
from ..core.database import get_db
from ..services.solana_reconciliation_service import SolanaReconciliationService


def rpc_call(method: str, params: list) -> Dict[str, Any]:
    response = requests.post(
        SOLANA_RPC_URL,
        json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params},
        timeout=15,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get("error"):
        raise RuntimeError("Solana RPC returned an error")
    return payload.get("result") or {}


def main() -> int:
    parser = argparse.ArgumentParser(description="Reconcile UniSynapse Solana proofs once")
    parser.add_argument("--limit", type=int, default=25)
    parser.add_argument("--dry-run", action="store_true", default=False)
    args = parser.parse_args()
    if args.limit < 1 or args.limit > 500:
        parser.error("--limit must be between 1 and 500")

    validate_runtime_config()
    if args.dry_run or not SOLANA_SUBMISSION_ENABLED:
        with get_db() as conn:
            count = conn.cursor().execute(
                """
                SELECT COUNT(*) FROM reward_ledger
                WHERE proof_status IN ('unsubmitted', 'retryable', 'submitted')
                """,
            ).fetchone()[0]
        print(json.dumps({"dry_run": True, "eligible": count, "commitment": SOLANA_COMMITMENT}))
        return 0

    with get_db() as conn:
        service = SolanaReconciliationService(
            conn,
            rpc_call=rpc_call,
            submitter=None,
            max_retries=SOLANA_MAX_RETRIES,
        )
        result = service.run_once(limit=args.limit)
        conn.commit()
    print(json.dumps(result))
    return 0 if result["failed"] == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
