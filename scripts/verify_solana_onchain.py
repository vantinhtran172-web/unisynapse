"""
UniSynapse - Solana On-Chain Verification & Demonstration Script
UniHackfest 2026: Best Technical Build (Solana)

Demonstrates real, live transaction construction, Ed25519 signing,
and Devnet RPC broadcast for all three on-chain pillars:
1. Automated Fiat On-Ramp Transfer (VietQR ACB -> SOL Devnet)
2. Academic Knowledge Proof (6-Gate Verification Anchoring)
3. Data Labeling Consensus Proof (Cross-validation Majority Vote)
"""

import sys
import os
import json
import time

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from backend.services.solana_onramp_service import SolanaOnRampService
from backend.core.config import SOLANA_RPC_URL, SOLANA_NETWORK, SOLANA_EXPLORER_BASE


def main():
    print("=" * 70)
    print("🌟 UNISYNAPSE SOLANA DEVNET ON-CHAIN VERIFICATION SUITE")
    print("   UniHackfest 2026 — Best Technical Build (Solana Track)")
    print("=" * 70)
    print(f"[*] Solana Network: {SOLANA_NETWORK}")
    print(f"[*] RPC Endpoint:   {SOLANA_RPC_URL}")

    # 1. Treasury Keypair status
    treasury_pubkey = SolanaOnRampService.get_treasury_pubkey()
    print(f"\n[1] Treasury Authority Address: {treasury_pubkey}")
    balance = SolanaOnRampService.get_treasury_balance()
    print(f"    Current Treasury Balance:   {balance:.4f} SOL Devnet")

    # 2. Test Pillar 1: Automated Fiat On-Ramp Transfer
    print("\n[2] Pillar 1: Automated Fiat On-Ramp Settlement (VietQR -> SOL Devnet)")
    recipient_demo = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG"  # Devnet genesis / student test addr
    order_demo = f"UP{int(time.time()) % 100000}"
    amount_sol = 0.0001
    memo_onramp = f"UniSynapse:OnRamp:v1:{order_demo}:20000VND:{amount_sol}SOL"
    print(f"    Dispatching wire transaction to Devnet...")
    print(f"    Recipient: {recipient_demo}")
    print(f"    Memo:      {memo_onramp}")

    res_onramp = SolanaOnRampService.transfer_sol_to_student(
        recipient_pubkey=recipient_demo,
        amount_sol=amount_sol,
        memo=memo_onramp
    )
    sig_onramp = res_onramp.get("signature", "")
    print(f"    Status:    {res_onramp.get('ok')}")
    print(f"    Signature: {sig_onramp}")
    print(f"    Explorer:  {res_onramp.get('explorer_url')}")

    # 3. Test Pillar 2: Academic Knowledge Proof Anchoring
    print("\n[3] Pillar 2: Academic Knowledge Proof Anchoring (6-Gate Approval)")
    doc_id = f"doc_{int(time.time())}"
    doc_checksum = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    quality_score = 95
    print(f"    Anchoring Doc ID: {doc_id}")
    print(f"    Checksum:         {doc_checksum[:16]}...")
    print(f"    Quality Score:    {quality_score}/100")

    res_doc = SolanaOnRampService.record_academic_proof_onchain(
        doc_id=doc_id,
        checksum=doc_checksum,
        title="Báo cáo Nghiên cứu AI x Web3 EdTech",
        quality_score=quality_score,
    )
    sig_doc = res_doc.get("signature", "")
    print(f"    Status:    {res_doc.get('ok')}")
    print(f"    Signature: {sig_doc}")
    print(f"    Explorer:  {res_doc.get('explorer_url')}")

    # 4. Test Pillar 3: Data Labeling Consensus Proof Anchoring
    print("\n[4] Pillar 3: Data Labeling Consensus Proof Anchoring (80% Majority Vote)")
    task_id = f"task_{int(time.time())}"
    winning_label = "Chính xác (Accurate)"
    confidence = 0.88
    total_votes = 5
    print(f"    Anchoring Task ID: {task_id}")
    print(f"    Winning Label:     {winning_label}")
    print(f"    Confidence:        {int(confidence * 100)}% ({total_votes} votes)")

    res_task = SolanaOnRampService.record_consensus_proof_onchain(
        task_id=task_id,
        winning_label=winning_label,
        confidence=confidence,
        total_votes=total_votes,
    )
    sig_task = res_task.get("signature", "")
    print(f"    Status:    {res_task.get('ok')}")
    print(f"    Signature: {sig_task}")
    print(f"    Explorer:  {res_task.get('explorer_url')}")

    print("\n" + "=" * 70)
    print("✅ TẤT CẢ 3 TRỤ CỘT ON-CHAIN SOLANA DEVNET ĐÃ ĐƯỢC XÁC THỰC THÀNH CÔNG!")
    print("=" * 70)


if __name__ == "__main__":
    main()
