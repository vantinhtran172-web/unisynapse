"""
Benchmark script for Autonomous On-Chain Oracle Pipeline.
Measures Fast Gate p50, p90, p95, p99 latency distributions against project SLOs.
"""

import statistics
import time
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.database import init_db, get_db

def run_benchmark(iterations: int = 50):
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        user_row = cursor.execute("SELECT id FROM users LIMIT 1").fetchone()
        if user_row:
            user_id = user_row["id"]
        else:
            user_id = "bench_user_id_42"
            cursor.execute(
                """
                INSERT INTO users (id, address, username, role, unipoints, reputation)
                VALUES (?, 'SolanaBenchUser111111111111111111111111111', 'solana_benchmarker', 'student', 100, 100)
                """,
                (user_id,)
            )
        cursor.execute(
            """
            INSERT OR REPLACE INTO documents (
                id, owner_id, filename, original_name, file_type, size_bytes, checksum,
                status, chunk_count, created_at
            ) VALUES (
                'doc_bench_01',
                ?,
                'bench_doc.pdf',
                'bench_doc.pdf',
                'application/pdf',
                2048,
                '1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
                'approved',
                10,
                1700000000.0
            )
            """,
            (user_id,)
        )
        conn.commit()

    client = TestClient(app)

    # Warmup
    for _ in range(5):
        client.post("/api/v1/oracle/attest", json={"document_id": "doc_bench_01", "quality_score": 85})

    latencies_ms = []
    print(f"Executing {iterations} Fast Gate benchmark runs...")
    for i in range(iterations):
        t0 = time.perf_counter()
        res = client.post("/api/v1/oracle/attest", json={"document_id": "doc_bench_01", "quality_score": 90})
        t1 = time.perf_counter()
        assert res.status_code == 202
        latencies_ms.append((t1 - t0) * 1000)

    latencies_ms.sort()
    p50 = statistics.median(latencies_ms)
    p90 = statistics.quantiles(latencies_ms, n=10)[8] if len(latencies_ms) >= 10 else p50
    p95 = statistics.quantiles(latencies_ms, n=20)[18] if len(latencies_ms) >= 20 else p90
    p99 = statistics.quantiles(latencies_ms, n=100)[98] if len(latencies_ms) >= 100 else latencies_ms[-1]

    print("\n=======================================================")
    print("   UNISYNAPSE ORACLE FAST GATE LATENCY BENCHMARK RESULTS")
    print("=======================================================")
    print(f"Total Iterations: {iterations}")
    print(f"Min Latency:      {min(latencies_ms):.2f} ms")
    print(f"Median (p50):     {p50:.2f} ms  (SLO Target: < 50 ms)   --> {'PASS' if p50 < 50 else 'FAIL'}")
    print(f"p90 Latency:      {p90:.2f} ms")
    print(f"p95 Latency:      {p95:.2f} ms  (SLO Target: < 200 ms)  --> {'PASS' if p95 < 200 else 'FAIL'}")
    print(f"p99 Latency:      {p99:.2f} ms  (SLO Target: < 400 ms)  --> {'PASS' if p99 < 400 else 'FAIL'}")
    print(f"Max Latency:      {max(latencies_ms):.2f} ms")
    print("=======================================================\n")

if __name__ == "__main__":
    run_benchmark(50)
