import unittest
import json
import time
from pathlib import Path


@unittest.skip(
    "Legacy demo tests mutate the application database and assume mock auth/rewards. "
    "Replace with isolated production-contract tests before enabling."
)
class TestUniSynapseBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from fastapi.testclient import TestClient
        from backend.main import app
        from backend.core.database import init_db, seed_initial_data, get_db
        from backend.api.v1.admin import seed_sample_syllabus

        # Reset tables for clean test run
        init_db()
        with get_db() as conn:
            c = conn.cursor()
            c.execute("DELETE FROM task_submissions")
            c.execute("DELETE FROM reward_ledger")
            c.execute("DELETE FROM document_chunks")
            c.execute("DELETE FROM documents")
            c.execute("DELETE FROM tasks")
            c.execute("DELETE FROM users")
            conn.commit()
            
        seed_initial_data()
        seed_sample_syllabus()
        cls.client = TestClient(app)

    def test_01_root_and_stats(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "online")
        
        stats = self.client.get("/api/v1/admin/stats")
        self.assertEqual(stats.status_code, 200)
        data = stats.json()
        self.assertGreaterEqual(data["open_tasks"], 1)
        self.assertGreaterEqual(data["approved_documents"], 1)
        self.assertGreaterEqual(data["indexed_chunks"], 1)
        print("[OK] Test 1 Passed: Root & Stats OK ->", data)

    def test_02_current_user(self):
        res = self.client.get("/api/v1/auth/me?user_id=usr_demo")
        self.assertEqual(res.status_code, 200)
        user = res.json()
        self.assertEqual(user["id"], "usr_demo")
        print("[OK] Test 2 Passed: User Auth OK ->", user["username"], "Points:", user["unipoints"])

    def test_03_data_labeling_and_consensus(self):
        # 1. Fetch open tasks
        res = self.client.get("/api/v1/tasks/open?user_id=usr_demo")
        self.assertEqual(res.status_code, 200)
        tasks = res.json()
        self.assertGreater(len(tasks), 0)
        
        # Pick task_101 which has peer votes and gold_label = 'negative'
        t = next((item for item in tasks if item["id"] == "task_101"), tasks[0])
        
        # 2. Submit label for task
        res_submit = self.client.post("/api/v1/tasks/submit", json={
            "taskId": t["id"],
            "userId": "usr_demo",
            "label": "negative"
        })
        self.assertEqual(res_submit.status_code, 200)
        sub_data = res_submit.json()
        self.assertTrue(sub_data["success"])
        self.assertTrue(sub_data["user_rewarded"])
        self.assertGreater(sub_data["votes_count"], 1)
        print("[OK] Test 3 Passed: Data Labeling & Consensus OK -> Confidence:", sub_data["confidence"], "Votes:", sub_data["votes_count"])

    def test_04_document_upload_and_verification(self):
        # Test valid document upload
        doc_content = b"""BAI GIANG CAU TRUC DU LIEU NANG CAO
Phan 1: Cay do den (Red-Black Tree) la cay nhi phan tim kiem tu can bang.
Moi nut co mau do hoac den. Nut goc luon luon co mau den.
Moi la (NIL) deu la nut mau den. Neu mot nut la mau do thi ca hai con cua no phai la mau den.
Chieu cao den cua tat ca cac nut la bang nhau."""
        
        files = {
            "file": ("RedBlackTree_Notes.txt", doc_content, "text/plain")
        }
        res = self.client.post("/api/v1/documents/upload", files=files, data={"owner_id": "usr_demo", "permission_confirmed": "true"})
        self.assertEqual(res.status_code, 200)
        d = res.json()
        self.assertEqual(d["status"], "approved")
        self.assertGreaterEqual(d["chunk_count"], 1)
        self.assertTrue("solana_signature" in d)
        print("[OK] Test 4 Passed: Document 6-step Verification & Indexing OK -> Doc ID:", d["document_id"], "Chunks:", d["chunk_count"])

        # Test duplicate detection rejection
        res_dup = self.client.post("/api/v1/documents/upload", files=files, data={"owner_id": "usr_demo", "permission_confirmed": "true"})
        self.assertEqual(res_dup.status_code, 400)
        self.assertTrue("trùng lặp" in res_dup.json()["detail"].lower())
        print("[OK] Test 4b Passed: Duplicate Prevention Verified!")

        # Test PII rejection
        pii_doc = b"So dien thoai lien he: 0987654321, CCCD: 012345678901. Bai giang CS101."
        files_pii = {"file": ("pii_doc.txt", pii_doc, "text/plain")}
        res_pii = self.client.post("/api/v1/documents/upload", files=files_pii, data={"owner_id": "usr_demo", "permission_confirmed": "true"})
        self.assertEqual(res_pii.status_code, 400)
        self.assertTrue("PII" in res_pii.json()["detail"])
        print("[OK] Test 4c Passed: PII Protection Gate Verified!")

    def test_05_rag_ai_tutor(self):
        # 1. Ask question present in indexed CS101 syllabus
        res_q1 = self.client.post("/api/v1/tutor/ask", json={
            "question": "Con trỏ và hàm malloc, free trong ngôn ngữ C hoạt động như thế nào?"
        })
        self.assertEqual(res_q1.status_code, 200)
        ans1 = res_q1.json()
        self.assertTrue(ans1["grounded"])
        self.assertGreater(len(ans1["citations"]), 0)
        ans_lower = ans1["answer"].lower()
        self.assertTrue("con trỏ" in ans_lower or "free" in ans_lower or "c++" in ans_lower)
        print("[OK] Test 5 Passed: Grounded RAG Answer OK ->", ans1["citations"][0]["document_name"], ans1["citations"][0]["page"])

        # 2. Ask question outside knowledge base
        res_q2 = self.client.post("/api/v1/tutor/ask", json={
            "question": "Ai là người phát minh ra tàu vũ trụ Apollo 11 hạ cánh mặt trăng năm 1969?"
        })
        self.assertEqual(res_q2.status_code, 200)
        ans2 = res_q2.json()
        self.assertFalse(ans2["grounded"])
        self.assertEqual(len(ans2["citations"]), 0)
        self.assertIn("từ chối", ans2["answer"].lower())
        print("[OK] Test 5b Passed: Anti-Hallucination Refusal Verified!")

    def test_06_idle_compute(self):
        res_jobs = self.client.get("/api/v1/compute/jobs")
        self.assertEqual(res_jobs.status_code, 200)
        jobs = res_jobs.json()
        self.assertGreater(len(jobs), 0)
        job_id = jobs[0]["id"]

        # Start job
        res_start = self.client.post("/api/v1/compute/start", json={"jobId": job_id, "cpuLimitPct": 25})
        self.assertEqual(res_start.status_code, 200)
        self.assertEqual(res_start.json()["status"], "running")

        # Complete job
        res_comp = self.client.post("/api/v1/compute/complete", json={"jobId": job_id})
        self.assertEqual(res_comp.status_code, 200)
        comp_data = res_comp.json()
        self.assertEqual(comp_data["status"], "completed")
        self.assertTrue("solana_signature" in comp_data)
        print("[OK] Test 6 Passed: Idle Compute Runner & Proof OK ->", comp_data["explorer_url"])

    def test_07_rewards_and_solana_ledger(self):
        res = self.client.get("/api/v1/rewards/ledger?user_id=usr_demo")
        self.assertEqual(res.status_code, 200)
        ledger = res.json()
        self.assertGreater(len(ledger), 0)
        first_tx = ledger[0]
        self.assertIn("explorer_url", first_tx)
        print("[OK] Test 7 Passed: Double-Entry Ledger & Solana Explorer Proofs OK ->", len(ledger), "entries.")

class TestIsolatedStartup(unittest.TestCase):
    def test_startup_has_no_seed_calls(self):
        import ast

        source = Path(__file__).resolve().parents[1] / "main.py"
        tree = ast.parse(source.read_text(encoding="utf-8"))
        calls = {
            node.func.id
            for node in ast.walk(tree)
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
        }
        self.assertNotIn("seed_initial_data", calls)
        self.assertNotIn("seed_sample_syllabus", calls)

    def test_repeated_initialization_is_empty_and_isolated(self):
        import os
        import subprocess
        import sys
        import tempfile

        root = Path(__file__).resolve().parents[2]
        with tempfile.TemporaryDirectory(prefix="unisynapse-test-") as directory:
            env = dict(os.environ, UNISYNAPSE_DATA_DIR=directory)
            script = """
import os
from pathlib import Path
from backend.core.config import DB_PATH, UPLOADS_DIR
from backend.core.database import init_db, get_db
assert DB_PATH.parent == Path(os.environ['UNISYNAPSE_DATA_DIR']).resolve()
assert UPLOADS_DIR.parent == DB_PATH.parent
init_db()
init_db()
conn = get_db()
try:
    for table in ('users', 'tasks', 'documents', 'reward_ledger'):
        assert conn.execute('SELECT COUNT(*) FROM ' + table).fetchone()[0] == 0
finally:
    conn.close()
from fastapi.testclient import TestClient
from backend.main import app
with TestClient(app) as client:
    from backend.services.solana_service import SolanaService
    assert SolanaService.generate_devnet_signature('test-proof') is None
    assert SolanaService.get_explorer_url(None) is None
    assert client.post('/api/v1/rewards/record-onchain', json={
        'signature': 'invalid', 'memo': 'test', 'delta': 10
    }).status_code == 410
    with get_db() as connection:
        assert connection.execute('SELECT COUNT(*) FROM reward_ledger').fetchone()[0] == 0
    paths = client.get('/openapi.json').json()['paths']
    assert not any('/compute' in path for path in paths)
    assert client.get('/api/v1/compute/jobs').status_code == 404
    for action in ('start', 'stop', 'complete'):
        assert client.post('/api/v1/compute/' + action, json={}).status_code == 404
"""
            result = subprocess.run(
                [sys.executable, "-c", script],
                cwd=root, env=env, capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
