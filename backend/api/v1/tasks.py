import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from ...core.database import get_db
from ...core.security import require_member_session, get_optional_member_session
from ...services.consensus_service import ConsensusService
from ...services.solana_service import SolanaService

router = APIRouter(prefix="/tasks", tags=["Data Labeling Tasks"])

class TaskSubmitRequest(BaseModel):
    taskId: str
    label: str

@router.get("/open")
def list_open_tasks(session_user: Optional[dict] = Depends(get_optional_member_session)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE status = 'open' ORDER BY created_at DESC")
        tasks = [dict(r) for r in cursor.fetchall()]
        
        user_subs = {}
        user_sigs = {}
        if session_user:
            user_id = session_user["id"]
            cursor.execute("SELECT task_id, label FROM task_submissions WHERE user_id = ?", (user_id,))
            user_subs = {r["task_id"]: r["label"] for r in cursor.fetchall()}
            cursor.execute(
                "SELECT source_id, solana_signature FROM reward_ledger WHERE user_id = ? AND source_type = 'task' AND reward_event_key LIKE 'task-submission:%' AND proof_status = 'verified' AND proof_verified_at IS NOT NULL AND solana_signature IS NOT NULL",
                (user_id,)
            )
            for r in cursor.fetchall():
                if r["source_id"] and r["solana_signature"]:
                    user_sigs[r["source_id"]] = r["solana_signature"]

        # Parse labels json
        for t in tasks:
            try:
                t["labels"] = json.loads(t["labels"]) if isinstance(t["labels"], str) else t["labels"]
            except Exception:
                t["labels"] = []
            t["user_submitted"] = t["id"] in user_subs
            t["user_label"] = user_subs.get(t["id"])
            sig = user_sigs.get(t["id"])
            t["user_solana_signature"] = sig
            t["user_explorer_url"] = SolanaService.get_explorer_url(sig)
            t["user_proof_status"] = "verified" if sig else "unsubmitted"

        # Prioritize tasks the user has not submitted yet
        if session_user:
            tasks.sort(key=lambda t: (1 if t.get("user_submitted") else 0, -t.get("created_at", 0)))

    return tasks


@router.post("/submit")
def submit_task_label(
    payload: TaskSubmitRequest,
    session_user: dict = Depends(require_member_session),
):
    try:
        result = ConsensusService.submit_label(
            task_id=payload.taskId,
            user_id=session_user["id"],
            label=payload.label
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý submission: {str(e)}")
