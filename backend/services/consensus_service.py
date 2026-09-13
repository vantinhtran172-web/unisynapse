import time
import uuid
import json
from typing import Dict, Any, List, Optional
from ..core.database import get_db
from .solana_service import SolanaService

class ConsensusService:
    @classmethod
    def submit_label(cls, task_id: str, user_id: str, label: str) -> Dict[str, Any]:
        now = time.time()
        with get_db() as conn:
            cursor = conn.cursor()
            
            # 1. Check task
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            task = cursor.fetchone()
            if not task:
                raise ValueError("Task không tồn tại.")
            if task["status"] != "open":
                raise ValueError("Task đã đóng hoặc đã đạt đồng thuận.")

            # 2. Check already submitted
            cursor.execute("SELECT * FROM task_submissions WHERE task_id = ? AND user_id = ?", (task_id, user_id))
            if cursor.fetchone():
                raise ValueError("Bạn đã gửi nhãn cho bài toán này rồi.")

            # 3. Check Gold Label
            gold_label = task["gold_label"]
            is_gold_correct = 1
            if gold_label and gold_label != label:
                is_gold_correct = 0

            # 4. Insert submission
            sub_id = f"sub_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
            INSERT INTO task_submissions (id, task_id, user_id, label, is_gold_correct, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (sub_id, task_id, user_id, label, is_gold_correct, now))

            # 5. Fetch all submissions for consensus check
            cursor.execute("""
            SELECT s.user_id, s.label, s.is_gold_correct, u.username
            FROM task_submissions s
            JOIN users u ON s.user_id = u.id
            WHERE s.task_id = ?
            """, (task_id,))
            submissions = cursor.fetchall()
            
            total_votes = len(submissions)
            counts: Dict[str, int] = {}
            for s in submissions:
                counts[s["label"]] = counts.get(s["label"], 0) + 1

            # Top label
            sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
            top_label, top_count = sorted_counts[0]
            confidence = round(top_count / total_votes, 2)
            
            req_votes = task["required_votes"] or 5
            threshold = task["consensus_threshold"] or 0.8
            
            finalized = False
            user_rewarded = False
            reward_points = task["reward_points"] or 10

            peer_votes_breakdown = [
                {"username": s["username"] or "Student", "label": s["label"]}
                for s in submissions
            ]

            # Check if consensus reached
            if total_votes >= req_votes and confidence >= threshold:
                finalized = True
                cursor.execute("""
                UPDATE tasks SET status = 'completed', consensus = ?, completed_at = ?
                WHERE id = ?
                """, (top_label, now, task_id))

                # Reward voters of top_label (excluding fraudulent gold failures)
                for s in submissions:
                    if s["label"] == top_label and s["is_gold_correct"] == 1:
                        voter_id = s["user_id"]
                        cursor.execute("UPDATE users SET unipoints = unipoints + ?, reputation = MIN(100, reputation + 1) WHERE id = ?",
                                       (reward_points, voter_id))
                        
                        # Ledger entry
                        proof_hash = SolanaService.create_proof_hash(
                            f"TASK_REWARD_{task_id}_{voter_id}_{reward_points}_{now}"
                        )
                        solana_sig = SolanaService.generate_devnet_signature(proof_hash)
                        
                        ledger_id = f"led_{uuid.uuid4().hex[:8]}"
                        cursor.execute("""
                        INSERT INTO reward_ledger (
                            id, user_id, delta, reason, source_type, source_id,
                            proof_status, solana_signature, proof_hash, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            ledger_id, voter_id, reward_points,
                            f"Consensus đạt: {task['title']}",
                            "task", task_id, "unsubmitted", solana_sig, proof_hash, now
                        ))
                        if voter_id == user_id:
                            user_rewarded = True
            else:
                # If task not yet closed by global consensus, but current user gave correct contribution,
                # we grant an instant participation bonus if it's the demo user!
                if is_gold_correct == 1:
                    user_rewarded = True
                    cursor.execute("UPDATE users SET unipoints = unipoints + ?, reputation = MIN(100, reputation + 1) WHERE id = ?",
                                   (reward_points, user_id))
                    proof_hash = SolanaService.create_proof_hash(
                        f"TASK_CONTRIB_{task_id}_{user_id}_{reward_points}_{now}"
                    )
                    solana_sig = SolanaService.generate_devnet_signature(proof_hash)
                    ledger_id = f"led_{uuid.uuid4().hex[:8]}"
                    cursor.execute("""
                    INSERT INTO reward_ledger (
                        id, user_id, delta, reason, source_type, source_id,
                        proof_status, solana_signature, proof_hash, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        ledger_id, user_id, reward_points,
                        f"Đóng góp gán nhãn: {task['title']}",
                        "task", task_id, "unsubmitted", solana_sig, proof_hash, now
                    ))

            conn.commit()

            return {
                "success": True,
                "task_id": task_id,
                "label": label,
                "finalized": finalized,
                "consensus_winner": top_label if finalized else None,
                "confidence": confidence,
                "votes_count": total_votes,
                "required_votes": req_votes,
                "peer_votes": peer_votes_breakdown,
                "user_rewarded": user_rewarded,
                "reward_points": reward_points if user_rewarded else 0,
                "is_gold_correct": bool(is_gold_correct)
            }
