from fastapi.testclient import TestClient

from backend.main import app


def test_member_routes_require_session():
    with TestClient(app) as client:
        # Public catalog routes return 200 for visitors
        assert client.get("/api/v1/tasks/open").status_code == 200
        assert client.get("/api/v1/documents").status_code == 200

        # Protected member actions strictly require active session
        assert client.post(
            "/api/v1/tasks/submit",
            json={"taskId": "task_101", "userId": "someone-else", "label": "negative"},
        ).status_code in {401, 422}
        assert client.post("/api/v1/documents/upload").status_code in {401, 422}
        assert client.get("/api/v1/documents/unknown", params={"owner_id": "someone-else"}).status_code == 401
        assert client.get("/api/v1/rewards/ledger", params={"user_id": "someone-else"}).status_code == 401
        assert client.get("/api/v1/rewards/summary", params={"user_id": "someone-else"}).status_code == 401
        assert client.post("/api/v1/tutor/ask", json={"question": "hello", "userId": "someone-else"}).status_code in {401, 422}
