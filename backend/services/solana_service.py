import hashlib
import re
from typing import Any, Callable, Dict, Optional

from ..core.config import SOLANA_COMMITMENT, SOLANA_EXPLORER_BASE, SOLANA_NETWORK


class SolanaService:
    """Solana proof primitives with no implicit network or secret fallback."""

    SIGNATURE_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,100}$")

    @staticmethod
    def create_proof_hash(data: str) -> str:
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    @classmethod
    def format_memo_payload(
        cls, source_type: str, source_id: str, user_id: str, delta: int
    ) -> str:
        digest = cls.create_proof_hash(f"{source_type}:{source_id}:{user_id}:{delta}")
        return f"UniSynapse:v1:{digest}"

    @staticmethod
    def generate_devnet_signature(proof_hash: str) -> Optional[str]:
        """Legacy compatibility: submission is intentionally not implicit."""
        return None

    @classmethod
    def get_explorer_url(cls, signature: Optional[str]) -> Optional[str]:
        if not signature or not cls.SIGNATURE_RE.fullmatch(signature):
            return None
        return f"{SOLANA_EXPLORER_BASE}/{signature}?cluster={SOLANA_NETWORK}"

    @classmethod
    def get_transaction(
        cls,
        signature: str,
        rpc_call: Callable[[str, list], Dict[str, Any]],
    ) -> Dict[str, Any]:
        if not cls.SIGNATURE_RE.fullmatch(signature):
            raise ValueError("Invalid Solana signature format")
        result = rpc_call("getTransaction", [signature, {"commitment": SOLANA_COMMITMENT}])
        if not isinstance(result, dict):
            raise ValueError("Malformed Solana RPC response")
        return result

