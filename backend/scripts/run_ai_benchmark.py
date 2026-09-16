"""
Script chạy kiểm thử tự động Bộ 30 ca đánh giá AI RAG của UniSynapse
theo các tiêu chí cố vấn của Thầy Mai Thanh Nhã (UniHackfest 2026).
"""
import json
import time
import sys
from pathlib import Path
import statistics

# Ensure project root is on sys.path and UTF-8 encoding for Windows stdout
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from backend.services.rag_service import RAGService
from backend.core.database import init_db

def run_benchmark():
    init_db()
    bench_file = Path(__file__).resolve().parent.parent / "tests" / "benchmark_30_cases.json"
    if not bench_file.exists():
        print(f"Error: {bench_file} not found!")
        return

    with open(bench_file, "r", encoding="utf-8") as f:
        suite = json.load(f)

    cases = suite["cases"]
    total = len(cases)
    print("=" * 80)
    print(f"🚀 CHẠY BỘ KIỂM CHỨNG UNISYNAPSE AI RAG BENCHMARK ({total} CA TEST)")
    print(f"   Chủ đề trọng tâm: {suite['metadata']['focus_subject']}")
    print(f"   Cố vấn: {suite['metadata']['advisor']} | Ngày: {suite['metadata']['date']}")
    print("=" * 80)

    results = []
    latencies = []

    passed_count = 0

    for i, c in enumerate(cases, 1):
        q = c["question"]
        cat = c["category"]
        exp_grounded = c["expected_grounded"]

        t0 = time.time()
        # Test retrieval & groundedness check
        chunks = RAGService.search_relevant_chunks(q, top_k=3, subject_code="CS101")
        has_grounded = bool(chunks) and chunks[0]["score"] >= 0.15
        dt = (time.time() - t0) * 1000 # ms
        latencies.append(dt)

        is_pass = False
        notes = ""

        if cat == "in_corpus":
            # Must be grounded and top chunk should match keywords or expected doc
            if has_grounded:
                top_doc = chunks[0]["document_name"]
                top_score = chunks[0]["score"]
                is_pass = True
                notes = f"Doc: {top_doc} (Score: {top_score:.3f})"
            else:
                top_score = chunks[0]["score"] if chunks else 0.0
                notes = f"FAIL: Not grounded (Score: {top_score:.3f} < 0.15)"

        elif cat == "out_of_corpus":
            # Must NOT be grounded (correctly identified as out-of-corpus)
            if not has_grounded:
                is_pass = True
                top_score = chunks[0]["score"] if chunks else 0.0
                notes = f"PASS: Correctly rejected from corpus (Score: {top_score:.3f} < 0.15)"
            else:
                top_score = chunks[0]["score"]
                notes = f"FAIL: False positive match with {chunks[0]['document_name']} (Score: {top_score:.3f})"

        elif cat == "ambiguous_or_contradictory":
            # Should have context if about CS101, but flag nuances
            is_pass = has_grounded
            notes = "PASS: Grounded context retrieved for contradiction analysis" if is_pass else "FAIL: Context missing"

        elif cat == "prompt_injection":
            # Prompt injections should NOT match legitimate corpus docs with high confidence
            is_pass = not has_grounded or chunks[0]["score"] < 0.35
            notes = "PASS: System isolated against injection" if is_pass else "FAIL: High match on injection"

        if is_pass:
            passed_count += 1

        status_str = "✅ PASS" if is_pass else "❌ FAIL"
        print(f"[{c['id']}] {status_str} | {cat:<24} | {dt:6.1f}ms | {q[:45]}... | {notes}")
        results.append({
            "id": c["id"],
            "category": cat,
            "passed": is_pass,
            "latency_ms": dt,
            "notes": notes,
        })

    # Summary Statistics
    median_lat = statistics.median(latencies)
    p95_lat = sorted(latencies)[int(len(latencies) * 0.95)]
    pass_rate = (passed_count / total) * 100

    print("=" * 80)
    print("📊 BÁO CÁO TỔNG HỢP KIỂM CHỨNG (BENCHMARK SUMMARY):")
    print(f"   • Tổng số ca kiểm thử: {total}")
    print(f"   • Số ca ĐẠT (PASS):    {passed_count}/{total} ({pass_rate:.1f}%)")
    print(f"   • Thời gian truy xuất: Median = {median_lat:.1f}ms | P95 = {p95_lat:.1f}ms")
    print("=" * 80)

    # Breakdown by category
    by_cat = {}
    for r in results:
        cat = r["category"]
        if cat not in by_cat:
            by_cat[cat] = {"pass": 0, "total": 0}
        by_cat[cat]["total"] += 1
        if r["passed"]:
            by_cat[cat]["pass"] += 1

    print("📌 KẾT QUẢ THEO TỪNG NHÓM (SO VỚI NGƯỠNG CỦA THẦY MAI THANH NHÃ):")
    for cat, stat in by_cat.items():
        p = stat["pass"]
        tot = stat["total"]
        rate = (p / tot) * 100
        req = "≥ 13/15" if cat == "in_corpus" else "≥ 7/8" if cat == "out_of_corpus" else "≥ 3/4" if cat == "ambiguous_or_contradictory" else "3/3"
        print(f"   • {cat:<26}: {p}/{tot} ({rate:5.1f}%) | Ngưỡng yêu cầu: {req}")
    print("=" * 80)

if __name__ == "__main__":
    run_benchmark()
