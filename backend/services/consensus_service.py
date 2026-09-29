import json
import time
import uuid
from typing import Any, Dict

from ..core.database import get_db
from .solana_service import SolanaService
from .ledger_service import settle_reward


class ConsensusService:
    @classmethod
    def submit_label(cls, task_id: str, user_id: str, label: str) -> Dict[str, Any]:
        now = time.time()
        normalized_label = label.strip()
        if not normalized_label:
            raise ValueError("Nhãn không được để trống.")

        with get_db() as conn:
            cursor = conn.cursor()
            task = cursor.execute(
                "SELECT * FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()
            if not task:
                raise ValueError("Task không tồn tại.")
            if task["status"] != "open":
                raise ValueError("Task đã đóng hoặc đã đạt đồng thuận.")

            try:
                allowed_labels = json.loads(task["labels"] or "[]")
            except (TypeError, json.JSONDecodeError) as exc:
                raise ValueError("Task có cấu hình nhãn không hợp lệ.") from exc
            if normalized_label not in allowed_labels:
                raise ValueError("Nhãn không thuộc danh sách được phép của task.")

            existing = cursor.execute(
                "SELECT id FROM task_submissions WHERE task_id = ? AND user_id = ?",
                (task_id, user_id),
            ).fetchone()
            if existing:
                raise ValueError("Bạn đã gửi nhãn cho bài toán này rồi.")

            is_gold_correct = int(
                not task["gold_label"] or task["gold_label"] == normalized_label
            )
            submission_id = f"sub_{uuid.uuid4().hex[:16]}"
            cursor.execute(
                """
                INSERT INTO task_submissions
                    (id, task_id, user_id, label, is_gold_correct, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    submission_id,
                    task_id,
                    user_id,
                    normalized_label,
                    is_gold_correct,
                    now,
                ),
            )

            rows = cursor.execute(
                """
                SELECT s.user_id, s.label, s.is_gold_correct, u.username
                FROM task_submissions s
                JOIN users u ON s.user_id = u.id
                WHERE s.task_id = ?
                ORDER BY s.created_at ASC, s.id ASC
                """,
                (task_id,),
            ).fetchall()
            total_votes = len(rows)
            counts: Dict[str, int] = {}
            for row in rows:
                counts[row["label"]] = counts.get(row["label"], 0) + 1
            top_label, top_count = sorted(
                counts.items(), key=lambda item: (-item[1], item[0])
            )[0]
            confidence = round(top_count / total_votes, 2)
            required_votes = task["required_votes"] or 5
            threshold = task["consensus_threshold"] or 0.8
            reward_points = task["reward_points"] or 10
            finalized = False
            user_rewarded = False

            # Award instant UniPoints reward and generate Solana Devnet proof
            reward_event_key = f"task-submission:{task_id}:user:{user_id}"
            proof_hash = SolanaService.create_proof_hash(
                f"TASK_REWARD:{reward_event_key}:{reward_points}"
            )
            from .solana_onramp_service import SolanaOnRampService
            user_row = cursor.execute("SELECT address FROM users WHERE id = ?", (user_id,)).fetchone()
            user_wallet = user_row["address"] if user_row and user_row["address"] else None

            sub_proof = SolanaOnRampService.record_label_submission_proof_onchain(
                task_id=task_id,
                user_id=user_id,
                label=normalized_label,
                recipient_pubkey=user_wallet,
            )
            solana_signature = sub_proof.get("signature") if sub_proof.get("onchain_confirmed") else None
            submission_proof_status = "verified" if solana_signature else "unsubmitted"

            submission_settlement = settle_reward(
                conn,
                user_id=user_id,
                delta=reward_points,
                reason=f"Hoàn thành gán nhãn: {task['title'][:30]}",
                source_type="task",
                source_id=task_id,
                reward_event_key=reward_event_key,
                proof_status=submission_proof_status,
                solana_signature=solana_signature,
                proof_hash=proof_hash,
                created_at=now,
            )
            user_rewarded = submission_settlement["created"]
            if solana_signature:
                cursor.execute(
                    "UPDATE reward_ledger SET proof_verified_at = ? WHERE reward_event_key = ? AND solana_signature = ?",
                    (now, reward_event_key, solana_signature),
                )


            consensus_sig = None
            if total_votes >= required_votes and confidence >= threshold:
                update = cursor.execute(
                    """
                    UPDATE tasks
                    SET status = 'completed', consensus = ?, completed_at = ?
                    WHERE id = ? AND status = 'open'
                    """,
                    (top_label, now, task_id),
                )
                finalized = update.rowcount == 1

                if finalized:
                    from .solana_onramp_service import SolanaOnRampService
                    consensus_proof = SolanaOnRampService.record_consensus_proof_onchain(
                        task_id=task_id,
                        winning_label=top_label,
                        confidence=confidence,
                        total_votes=total_votes,
                    )
                    consensus_sig = consensus_proof.get("signature") if consensus_proof.get("onchain_confirmed") else None
                    cursor.execute(
                        "UPDATE tasks SET solana_tx = ? WHERE id = ?",
                        (consensus_sig, task_id)
                    )

                    for row in rows:
                        if row["label"] != top_label or not row["is_gold_correct"]:
                            continue
                        voter_id = row["user_id"]
                        consensus_event_key = f"task-consensus:{task_id}:user:{voter_id}"
                        consensus_proof_hash = SolanaService.create_proof_hash(
                            f"TASK_REWARD:{consensus_event_key}:{reward_points}"
                        )
                        settle_reward(
                            conn,
                            user_id=voter_id,
                            delta=reward_points,
                            reason=f"Consensus đạt: {task['title']}",
                            source_type="task",
                            source_id=task_id,
                            reward_event_key=consensus_event_key,
                            proof_status="verified" if consensus_sig else "unsubmitted",
                            solana_signature=consensus_sig,
                            proof_hash=consensus_proof_hash,
                            created_at=now,
                        )

            conn.commit()
            active_sig = solana_signature
            return {
                "success": True,
                "task_id": task_id,
                "label": normalized_label,
                "finalized": finalized,
                "consensus_winner": top_label if finalized else None,
                "confidence": confidence,
                "votes_count": total_votes,
                "required_votes": required_votes,
                "peer_votes": [
                    {
                        "username": row["username"] or "Student",
                        "label": row["label"],
                    }
                    for row in rows
                ],
                "user_rewarded": user_rewarded,
                "reward_points": reward_points,
                "is_gold_correct": bool(is_gold_correct),
                "proof_status": submission_proof_status,
                "solana_signature": active_sig,
                "explorer_url": SolanaService.get_explorer_url(active_sig),
            }
