import hashlib
from typing import Optional
from ..core.config import SOLANA_EXPLORER_BASE

class SolanaService:
    @staticmethod
    def create_proof_hash(data: str) -> str:
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    @staticmethod
    def generate_devnet_signature(proof_hash: str) -> Optional[str]:
        """Legacy compatibility: no transaction was submitted, so no signature exists."""
        return None

    @classmethod
    def get_explorer_url(cls, signature: Optional[str]) -> Optional[str]:
        if not signature:
            return None
        return f"{SOLANA_EXPLORER_BASE}/{signature}?cluster=devnet"

    @classmethod
    def format_memo_payload(cls, source_type: str, source_id: str, user_id: str, delta: int) -> str:
        h = cls.create_proof_hash(f"{source_type}:{source_id}:{user_id}:{delta}")
        return f"UniSynapse:v1:{h}"
