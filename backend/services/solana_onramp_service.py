"""
UniSynapse Solana On-Ramp Service.
Enables instant, automated Fiat-to-Solana Devnet conversion:
When students pay via VietQR ACB, the Treasury wallet automatically transfers SOL
directly to the student's Phantom wallet address on Solana Devnet.
"""

import base58
import base64
import json
import logging
import nacl.signing
import os
import urllib.request
from typing import Any, Dict, Optional

from ..core.config import (
    SOLANA_RPC_URL,
    SOLANA_NETWORK,
    SOLANA_EXPLORER_BASE,
    SOLANA_SUBMISSION_ENABLED,
    SOLANA_AUTHORITY_SECRET_REF,
)

logger = logging.getLogger("solana_onramp")

TREASURY_KEYPAIR_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "treasury_keypair.json")


def compact_u16(n: int) -> bytes:
    out = bytearray()
    while True:
        elem = n & 0x7F
        n >>= 7
        if n == 0:
            out.append(elem)
            break
        else:
            elem |= 0x80
            out.append(elem)
    return bytes(out)


class SolanaOnRampService:
    _keypair: Optional[nacl.signing.SigningKey] = None
    _pubkey: Optional[str] = None

    @classmethod
    def get_keypair(cls) -> nacl.signing.SigningKey:
        if cls._keypair is not None:
            return cls._keypair

        referenced_secret = (
            os.getenv(SOLANA_AUTHORITY_SECRET_REF, "")
            if SOLANA_AUTHORITY_SECRET_REF
            else ""
        )
        secret = (
            os.getenv("SOLANA_TREASURY_SECRET_KEY")
            or os.getenv("SOLANA_SIGNER_SECRET_KEY")
            or referenced_secret
            or ""
        ).strip()
        configured_pubkey = None
        if not secret and os.getenv("ENVIRONMENT", "development").lower() != "production":
            if os.path.exists(TREASURY_KEYPAIR_FILE):
                with open(TREASURY_KEYPAIR_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                secret = data.get("seed") or data.get("secret_key") or ""
                configured_pubkey = data.get("pubkey")
        if not secret:
            raise RuntimeError("Solana Treasury secret is not configured")
        try:
            secret_bytes = base58.b58decode(secret)
            if len(secret_bytes) not in (32, 64):
                raise ValueError("invalid secret length")
            key = nacl.signing.SigningKey(secret_bytes[:32])
            derived_pubkey = base58.b58encode(bytes(key.verify_key)).decode("ascii")
            if len(secret_bytes) == 64 and secret_bytes[32:] != bytes(key.verify_key):
                raise ValueError("secret public key does not match seed")
            if configured_pubkey and configured_pubkey != derived_pubkey:
                raise ValueError("keypair file public key does not match seed")
            expected_pubkey = os.getenv("DEVNET_TREASURY_ADDRESS", "").strip()
            if expected_pubkey and expected_pubkey != derived_pubkey:
                raise ValueError("DEVNET_TREASURY_ADDRESS does not match signing key")
        except Exception as exc:
            raise RuntimeError("Invalid Solana Treasury signing key configuration") from exc
        cls._keypair = key
        cls._pubkey = derived_pubkey
        logger.info("Loaded configured Solana Treasury: %s", derived_pubkey)
        return key

    @classmethod
    def get_treasury_pubkey(cls) -> str:
        if cls._pubkey:
            return cls._pubkey
        cls.get_keypair()
        return cls._pubkey

    @classmethod
    def rpc(cls, method: str, params: list) -> Any:
        payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
        req = urllib.request.Request(
            SOLANA_RPC_URL,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "UniSynapse/1.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode())
            if "error" in data:
                raise ValueError(f"RPC error: {data['error']}")
            return data.get("result")

    @classmethod
    def get_treasury_balance(cls) -> float:
        try:
            pubkey = cls.get_treasury_pubkey()
            res = cls.rpc("getBalance", [pubkey, {"commitment": "confirmed"}])
            lamports = res.get("value", 0) if isinstance(res, dict) else 0
            return lamports / 1_000_000_000.0
        except Exception as e:
            logger.warning("Could not fetch treasury balance: %s", e)
            return 0.0

    @classmethod
    def request_airdrop(cls, amount_sol: float = 1.0) -> bool:
        try:
            pubkey = cls.get_treasury_pubkey()
            lamports = int(amount_sol * 1_000_000_000)
            cls.rpc("requestAirdrop", [pubkey, lamports])
            return True
        except Exception as e:
            logger.warning("Devnet airdrop request failed: %s", e)
            return False

    @classmethod
    def transfer_sol_to_student(
        cls,
        recipient_pubkey: str,
        amount_sol: float,
        memo: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Build, sign with Treasury Keypair, and dispatch a real Solana Devnet transfer
        directly to the student's Phantom wallet address.
        """
        keypair = cls.get_keypair()
        sender_pubkey_bytes = bytes(keypair.verify_key)
        lamports = int(amount_sol * 1_000_000_000)

        try:
            recipient_pubkey_bytes = base58.b58decode(recipient_pubkey)
            if len(recipient_pubkey_bytes) != 32:
                raise ValueError("Invalid recipient public key length")
        except Exception as e:
            raise ValueError(f"Địa chỉ ví Solana không hợp lệ: {recipient_pubkey}") from e

        # Fetch recent blockhash from Devnet
        blockhash_info = cls.rpc("getLatestBlockhash", [{"commitment": "confirmed"}])
        recent_blockhash = blockhash_info["value"]["blockhash"]

        is_self = (recipient_pubkey_bytes == sender_pubkey_bytes) or lamports == 0

        # Build deduplicated accounts list adhering to Solana wire format
        # 1. Writable signers: sender
        accounts = [sender_pubkey_bytes]
        # 2. Writable non-signers: recipient (if different from sender)
        if not is_self and recipient_pubkey_bytes != sender_pubkey_bytes:
            accounts.append(recipient_pubkey_bytes)

        # 3. Readonly non-signers: program accounts
        system_program_bytes = bytes(32)  # 11111111111111111111111111111111
        memo_program_bytes = base58.b58decode("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")

        if not is_self:
            accounts.append(system_program_bytes)
        if memo:
            accounts.append(memo_program_bytes)

        account_map = {k: i for i, k in enumerate(accounts)}
        instructions = []

        # System Program Transfer instruction (only if not self/zero)
        if not is_self:
            inst_data = (2).to_bytes(4, "little") + lamports.to_bytes(8, "little")
            instructions.append(
                (account_map[system_program_bytes], [account_map[sender_pubkey_bytes], account_map[recipient_pubkey_bytes]], inst_data)
            )

        # Memo Instruction
        if memo:
            instructions.append(
                (account_map[memo_program_bytes], [account_map[sender_pubkey_bytes]], memo.encode("utf-8"))
            )

        # Header
        num_required_signatures = 1
        num_readonly_signed_accounts = 0
        num_readonly_unsigned_accounts = (1 if not is_self else 0) + (1 if memo else 0)
        header = bytes([num_required_signatures, num_readonly_signed_accounts, num_readonly_unsigned_accounts])

        # Compact accounts array
        account_keys_bytes = compact_u16(len(accounts)) + b"".join(accounts)
        blockhash_bytes = base58.b58decode(recent_blockhash)

        # Instructions
        compiled_insts = bytearray()
        compiled_insts.extend(compact_u16(len(instructions)))
        for prog_idx, acc_indices, data in instructions:
            compiled_insts.append(prog_idx)
            compiled_insts.extend(compact_u16(len(acc_indices)))
            compiled_insts.extend(bytes(acc_indices))
            compiled_insts.extend(compact_u16(len(data)))
            compiled_insts.extend(data)

        message = header + account_keys_bytes + blockhash_bytes + bytes(compiled_insts)
        signed_obj = keypair.sign(message)
        wire_tx = compact_u16(1) + signed_obj.signature + message
        signature_b58 = base58.b58encode(signed_obj.signature).decode()

        # A sendTransaction response only means accepted; verify before exposing a proof.
        b64_tx = base64.b64encode(wire_tx).decode("ascii")
        rpc_error = None
        signature = None
        confirmed = False
        try:
            tx_sig = cls.rpc("sendTransaction", [b64_tx, {"encoding": "base64", "preflightCommitment": "confirmed"}])
            if not isinstance(tx_sig, str) or tx_sig != signature_b58:
                raise ValueError("Invalid Solana sendTransaction signature")
            status_result = cls.rpc("getSignatureStatuses", [[tx_sig], {"searchTransactionHistory": True}])
            statuses = status_result.get("value") if isinstance(status_result, dict) else None
            status = statuses[0] if isinstance(statuses, list) and statuses else None
            confirmed = bool(
                isinstance(status, dict)
                and status.get("err") is None
                and status.get("confirmationStatus") in ("confirmed", "finalized")
            )
            if confirmed:
                signature = tx_sig
            else:
                rpc_error = "Solana transaction is not yet confirmed"
        except Exception as err:
            logger.warning("Solana transaction confirmation unavailable: %s", err)
            rpc_error = str(err)

        return {
            "ok": confirmed,
            "onchain_confirmed": confirmed,
            "signature": signature,
            "explorer_url": f"{SOLANA_EXPLORER_BASE}/{signature}?cluster={SOLANA_NETWORK}" if confirmed else None,
            "amount_sol": amount_sol,
            "recipient": recipient_pubkey,
            "memo": memo or "",
            "error": rpc_error,
        }

    @classmethod
    def record_academic_proof_onchain(
        cls,
        doc_id: str,
        checksum: str,
        title: str,
        quality_score: int,
        owner_pubkey: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Records verified academic knowledge proof on Solana Devnet.
        Creates a Memo payload: UniSynapse:DocProof:v1:{doc_id}:{checksum[:16]}:q{quality_score}
        Dispatches an on-chain transaction signed by Treasury Keypair.
        Returns base58 signature and Solana Explorer Devnet URL.
        """
        if not SOLANA_SUBMISSION_ENABLED:
            return {"ok": False, "onchain_confirmed": False, "signature": None,
                    "explorer_url": None, "error": "Solana submission disabled"}
        try:
            recipient = owner_pubkey if (owner_pubkey and len(owner_pubkey) >= 32) else cls.get_treasury_pubkey()
            memo = f"UniSynapse:DocProof:v1:{doc_id}:{checksum[:16]}:q{quality_score}"
            lamports_sol = 0.00001 if (owner_pubkey and len(owner_pubkey) >= 32) else 0.000001
            return cls.transfer_sol_to_student(
                recipient_pubkey=recipient,
                amount_sol=lamports_sol,
                memo=memo
            )
        except Exception as err:
            logger.warning("Failed to record document proof on Solana: %s", err)
            return {"ok": False, "onchain_confirmed": False, "signature": None,
                    "explorer_url": None, "error": "Solana proof unavailable"}

    @classmethod
    def record_consensus_proof_onchain(
        cls,
        task_id: str,
        winning_label: str,
        confidence: float,
        total_votes: int,
        recipient_pubkey: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Records verified labeling consensus proof on Solana Devnet.
        Creates a Memo payload: UniSynapse:Consensus:v1:{task_id[:12]}:{winning_label}:{int(confidence*100)}pct:{total_votes}v
        Dispatches an on-chain transaction signed by Treasury Keypair.
        Returns base58 signature and Solana Explorer Devnet URL.
        """
        if not SOLANA_SUBMISSION_ENABLED:
            return {"ok": False, "onchain_confirmed": False, "signature": None,
                    "explorer_url": None, "error": "Solana submission disabled"}
        try:
            recipient = recipient_pubkey if (recipient_pubkey and len(recipient_pubkey) >= 32) else cls.get_treasury_pubkey()
            memo = f"UniSynapse:Consensus:v1:{task_id[:12]}:{winning_label}:{int(confidence * 100)}pct:{total_votes}v"
            return cls.transfer_sol_to_student(
                recipient_pubkey=recipient,
                amount_sol=0.000001,
                memo=memo
            )
        except Exception as err:
            logger.warning("Failed to record consensus proof on Solana: %s", err)
            return {"ok": False, "onchain_confirmed": False, "signature": None,
                    "explorer_url": None, "error": "Solana proof unavailable"}

    @classmethod
    def record_label_submission_proof_onchain(
        cls,
        task_id: str,
        user_id: str,
        label: str,
        recipient_pubkey: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Records student data labeling submission proof on Solana Devnet.
        Creates a Memo payload: UniSynapse:LabelSub:v1:{task_id[:12]}:{label}:{user_id[:8]}
        Dispatches an on-chain transaction signed by Treasury Keypair.
        Returns base58 signature and Solana Explorer Devnet URL.
        """
        if not SOLANA_SUBMISSION_ENABLED:
            return {"ok": False, "onchain_confirmed": False, "signature": None,
                    "explorer_url": None, "error": "Solana submission disabled"}
        memo = f"UniSynapse:LabelSub:v1:{task_id[:12]}:{label[:10]}:{user_id[:8]}"
        try:
            recipient = recipient_pubkey if (recipient_pubkey and len(recipient_pubkey) >= 32) else cls.get_treasury_pubkey()
            res = cls.transfer_sol_to_student(
                recipient_pubkey=recipient,
                amount_sol=0.000001,
                memo=memo
            )
            return res
        except Exception as err:
            logger.warning("Failed to dispatch label submission transaction to Solana Devnet: %s", err)
            return {"ok": False, "onchain_confirmed": False, "signature": None,
                    "explorer_url": None, "error": "Solana proof unavailable"}


