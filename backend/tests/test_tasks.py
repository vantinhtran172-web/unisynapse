import json
import time
import uuid
from backend.api.v1.tasks import list_open_tasks
from backend.core.database import get_db
from backend.services.consensus_service import ConsensusService
from backend.tests.test_auth import member_client  # noqa: F401


def test_list_open_tasks_filters_completed(member_client):
    _, _, _, member_id = member_client
    session_user = {"id": member_id}
    task_open_id = f"task_test_open_{uuid.uuid4().hex[:8]}"
    task_done_id = f"task_test_done_{uuid.uuid4().hex[:8]}"
    now = time.time()

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO tasks (id, title, description, category, input_text, labels, required_votes, consensus_threshold, reward_points, gold_label, status, created_at)
            VALUES (?, 'Open Task', 'Desc', 'Sentiment', 'Input open', ?, 5, 0.8, 10, 'positive', 'open', ?)
            """,
            (task_open_id, json.dumps(["positive", "negative"]), now),
        )
        conn.execute(
            """
            INSERT INTO tasks (id, title, description, category, input_text, labels, required_votes, consensus_threshold, reward_points, gold_label, status, consensus, completed_at, created_at)
            VALUES (?, 'Completed Task', 'Desc', 'Sentiment', 'Input completed', ?, 5, 0.8, 10, 'positive', 'completed', 'positive', ?, ?)
            """,
            (task_done_id, json.dumps(["positive", "negative"]), now, now),
        )
        conn.commit()

    try:
        tasks = list_open_tasks(session_user)
        task_ids = [t["id"] for t in tasks]
        # Open task MUST be present
        assert task_open_id in task_ids
        # Completed task MUST NOT be present
        assert task_done_id not in task_ids
    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM tasks WHERE id IN (?, ?)", (task_open_id, task_done_id))
            conn.commit()


def test_submit_task_instant_reward(member_client):
    client, username, password, member_id = member_client
    login_res = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert login_res.status_code == 200
    task_id = f"task_test_reward_{uuid.uuid4().hex[:8]}"
    now = time.time()

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO tasks (id, title, description, category, input_text, labels, required_votes, consensus_threshold, reward_points, gold_label, status, created_at)
            VALUES (?, 'Test Task Instant Reward', 'Desc', 'Sentiment', 'Input reward', ?, 5, 0.8, 10, 'positive', 'open', ?)
            """,
            (task_id, json.dumps(["positive", "negative"]), now),
        )
        user_before = conn.execute("SELECT unipoints FROM users WHERE id = ?", (member_id,)).fetchone()
        points_before = user_before["unipoints"] if user_before else 0
        conn.commit()

    try:
        csrf = client.cookies["unisynapse_csrf"]
        res = client.post(
            "/api/v1/tasks/submit",
            json={
                "taskId": task_id,
                "label": "positive"
            },
            headers={"X-CSRF-Token": csrf},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["user_rewarded"] is True
        assert data["reward_points"] == 10

        with get_db() as conn:
            user_after = conn.execute("SELECT unipoints FROM users WHERE id = ?", (member_id,)).fetchone()
            assert user_after["unipoints"] == points_before + 10

            ledger = conn.execute(
                "SELECT * FROM reward_ledger WHERE user_id = ? AND source_id = ? AND source_type = 'task'",
                (member_id, task_id),
            ).fetchone()
            assert ledger is not None
            assert ledger["delta"] == 10
    finally:
        with get_db() as conn:
            conn.execute("DELETE FROM ledger_entries WHERE account_id IN (SELECT id FROM ledger_accounts WHERE user_id = ?)", (member_id,))
            conn.execute("DELETE FROM ledger_accounts WHERE user_id = ?", (member_id,))
            conn.execute("DELETE FROM reward_ledger WHERE user_id = ?", (member_id,))
            conn.execute("DELETE FROM task_submissions WHERE user_id = ?", (member_id,))
            conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            conn.commit()
