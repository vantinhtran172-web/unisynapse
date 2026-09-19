"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { api, OracleJobStatus, OracleRegistryInfo } from "../lib/api";

interface OracleLiveAttestationProps {
  documentId: string;
  documentTitle?: string;
  checksumSha256?: string;
  chunkCount?: number;
  initialJobId?: string;
  autoTrigger?: boolean;
  onFinalized?: (pda: string, signature: string) => void;
}

export default function OracleLiveAttestation({
  documentId,
  documentTitle,
  checksumSha256,
  chunkCount,
  initialJobId,
  autoTrigger = true,
  onFinalized,
}: OracleLiveAttestationProps) {
  const [jobId, setJobId] = useState<string | null>(initialJobId || null);
  const [job, setJob] = useState<OracleJobStatus | null>(null);
  const [registry, setRegistry] = useState<OracleRegistryInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const autoTriggerAttempted = useRef(false);

  // Load Oracle Registry metadata on mount
  useEffect(() => {
    api.getOracleRegistry()
      .then(setRegistry)
      .catch((err) => console.warn("Could not load Oracle registry info:", err));
  }, []);

  const handleTriggerAttestation = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.submitOracleAttestation(documentId);
      if (res.ok && res.job_id) {
        setJobId(res.job_id);
        // Pre-populate with fast gate response immediately
        setJob({
          id: res.job_id,
          document_id: documentId,
          owner_id: "",
          checksum_sha256: checksumSha256 || "",
          quality_score: 90,
          chunk_count: chunkCount || 1,
          nonce: 1,
          status: (res.status as "queued" | "processed" | "confirmed" | "finalized" | "failed") || "queued",
          attestation_pda: res.attestation_pda,
          fast_gate_latency_ms: res.fast_gate_latency_ms,
          created_at: Date.now() / 1000,
          updated_at: Date.now() / 1000,
          explorer_url: res.explorer_url,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể kích hoạt chứng thực Oracle";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [documentId, checksumSha256, chunkCount]);

  // Auto-trigger attestation on mount
  useEffect(() => {
    if (autoTrigger && !jobId && !isSubmitting && !autoTriggerAttempted.current && documentId) {
      autoTriggerAttempted.current = true;
      handleTriggerAttestation();
    }
  }, [autoTrigger, jobId, isSubmitting, documentId, handleTriggerAttestation]);

  // Listen for SSE updates and run active 1.5s polling loop when jobId is present
  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchLatest = async () => {
      try {
        const res = await api.getOracleJob(jobId);
        if (isMounted && res.ok && res.job) {
          setJob(res.job);
          if (res.job.status === "finalized" && res.job.tx_signature) {
            onFinalized?.(res.job.attestation_pda, res.job.tx_signature);
            if (pollInterval) clearInterval(pollInterval);
          }
          if (res.job.status === "failed") {
            setError(res.job.error_message || "Xác thực Oracle thất bại");
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.debug("Job poll sync:", err);
      }
    };

    // Immediate initial fetch
    fetchLatest();

    // Active polling interval (1500ms) guarantees quick updates across any network/proxy state
    pollInterval = setInterval(fetchLatest, 1500);

    // Open SSE connection with credentials
    try {
      const es = new EventSource(`/api/v1/oracle/jobs/${jobId}/stream`, { withCredentials: true });
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!isMounted) return;
          setJob((prev) => ({ ...(prev || ({} as OracleJobStatus)), ...data }));
          if (data.status === "finalized" && data.tx_signature) {
            onFinalized?.(data.attestation_pda, data.tx_signature);
            if (pollInterval) clearInterval(pollInterval);
            es.close();
          }
          if (data.status === "failed") {
            setError(data.error_message || "Xác thực Oracle thất bại");
            if (pollInterval) clearInterval(pollInterval);
            es.close();
          }
        } catch (e) {
          console.error("SSE parse error", e);
        }
      };

      es.onerror = () => {
        // SSE disconnected or unsupported in proxy -> close SSE cleanly, active polling handles updates!
        es.close();
      };
    } catch (err) {
      console.warn("SSE not available, relying on active polling", err);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      eventSourceRef.current?.close();
    };
  }, [jobId, onFinalized]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const stageOrder = ["queued", "processed", "confirmed", "finalized"];
  const currentStageIndex = job ? stageOrder.indexOf(job.status) : -1;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900/95 via-indigo-950/70 to-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl">
      {/* Subtle background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-violet-200 via-white to-blue-200 bg-clip-text text-transparent">
                Autonomous On-Chain Oracle
              </h3>
              <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                Solana Devnet
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Chứng thực học liệu tự trị ký bằng Agent Ed25519 & neo vào Anchor PDA
            </p>
          </div>
        </div>

        {!jobId && (
          <button
            onClick={handleTriggerAttestation}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] hover:shadow-violet-500/40 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang tự động kích hoạt...</span>
              </>
            ) : (
              <>
                <span>⚡ Kích Hoạt Chứng Thực Oracle</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Document Meta Pill */}
      {(documentTitle || checksumSha256 || chunkCount !== undefined) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-300/80 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
          {documentTitle && <span className="font-medium text-slate-200 truncate max-w-[200px]">{documentTitle}</span>}
          {chunkCount !== undefined && <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-300">{chunkCount} chunks</span>}
          {checksumSha256 && (
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">
              SHA: {checksumSha256.slice(0, 10)}...
            </span>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Real-time 4-Stage Pipeline Tracker */}
      {jobId && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Stage 1: Fast Gate */}
            <div className={`relative rounded-xl border p-3 transition-all ${
              currentStageIndex >= 0
                ? "border-emerald-500/40 bg-emerald-950/20"
                : "border-white/5 bg-white/[0.02] opacity-50"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">1. Fast Gate</span>
                {currentStageIndex >= 0 ? (
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                ) : (
                  <span className="flex h-2 w-2 rounded-full bg-slate-600" />
                )}
              </div>
              <p className="mt-1 text-xs font-bold text-white">202 Accepted</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                {job?.fast_gate_latency_ms ? `${job.fast_gate_latency_ms} ms` : "< 200 ms"}
              </p>
            </div>

            {/* Stage 2: Agent Dispatch */}
            <div className={`relative rounded-xl border p-3 transition-all ${
              currentStageIndex >= 1
                ? "border-violet-500/40 bg-violet-950/20"
                : currentStageIndex === 0
                ? "border-violet-500/30 bg-violet-950/10 animate-pulse"
                : "border-white/5 bg-white/[0.02] opacity-50"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">2. Agent Ký Tx</span>
                {currentStageIndex >= 1 ? (
                  <span className="flex h-2 w-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                ) : (
                  <span className="flex h-2 w-2 rounded-full bg-slate-600" />
                )}
              </div>
              <p className="mt-1 text-xs font-bold text-white">
                {currentStageIndex >= 1 ? "Đã Ký & Dispatch" : "Đang ký Ed25519..."}
              </p>
              <p className="text-[10px] text-violet-400 font-mono mt-0.5">
                {job?.submit_latency_ms ? `${job.submit_latency_ms} ms` : (currentStageIndex >= 1 ? "Đã gửi RPC" : "Đang đo...")}
              </p>
            </div>

            {/* Stage 3: Cluster Consensus */}
            <div className={`relative rounded-xl border p-3 transition-all ${
              currentStageIndex >= 2
                ? "border-blue-500/40 bg-blue-950/20"
                : currentStageIndex === 1
                ? "border-blue-500/30 bg-blue-950/10 animate-pulse"
                : "border-white/5 bg-white/[0.02] opacity-50"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">3. Xác Nhận</span>
                {currentStageIndex >= 2 ? (
                  <span className="flex h-2 w-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                ) : (
                  <span className="flex h-2 w-2 rounded-full bg-slate-600" />
                )}
              </div>
              <p className="mt-1 text-xs font-bold text-white">
                {currentStageIndex >= 2 ? "Confirmed" : "Chờ consensus..."}
              </p>
              <p className="text-[10px] text-blue-400 font-mono mt-0.5">
                {job?.confirmed_latency_ms ? `${(job.confirmed_latency_ms / 1000).toFixed(2)} s` : (currentStageIndex >= 1 ? "Đang xác thực..." : "p95 < 4 s")}
              </p>
            </div>

            {/* Stage 4: Finalized Root */}
            <div className={`relative rounded-xl border p-3 transition-all ${
              currentStageIndex >= 3
                ? "border-fuchsia-500/40 bg-fuchsia-950/20"
                : currentStageIndex === 2
                ? "border-fuchsia-500/30 bg-fuchsia-950/10 animate-pulse"
                : "border-white/5 bg-white/[0.02] opacity-50"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">4. Root Finality</span>
                {currentStageIndex >= 3 ? (
                  <span className="flex h-2 w-2 rounded-full bg-fuchsia-400 shadow-sm shadow-fuchsia-400" />
                ) : (
                  <span className="flex h-2 w-2 rounded-full bg-slate-600" />
                )}
              </div>
              <p className="mt-1 text-xs font-bold text-white">
                {currentStageIndex >= 3 ? "Finalized PDA" : "Đang chốt root..."}
              </p>
              <p className="text-[10px] text-fuchsia-400 font-mono mt-0.5">
                {job?.finalized_latency_ms ? `${(job.finalized_latency_ms / 1000).toFixed(2)} s` : (currentStageIndex >= 2 ? "Đang chốt root..." : "p95 < 15 s")}
              </p>
            </div>
          </div>

          {/* Success Banner when Finalized */}
          {job?.status === "finalized" && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-300 shadow-lg shadow-emerald-500/10">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold shrink-0">✓</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 flex-1">
                <span>Chứng thực học liệu tự trị đã được neo bất biến vào Anchor PDA trên Solana Devnet!</span>
                {job.explorer_url && (
                  <a
                    href={job.explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 font-semibold underline text-[11px] shrink-0 hover:text-emerald-300"
                  >
                    Xem Solana Explorer ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* On-Chain Evidence & Verification Card */}
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400 text-[11px]">Trạng Thái Hiện Tại:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                job?.status === "finalized"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : job?.status === "confirmed"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : job?.status === "processed"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {job?.status || "ĐANG KHỞI TẠO"}
              </span>
            </div>

            {/* Oracle Attestation PDA */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 shrink-0">Attestation PDA:</span>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-indigo-300 truncate max-w-[200px] sm:max-w-[320px]">
                  {job?.attestation_pda || "Đang tính toán..."}
                </span>
                {job?.attestation_pda && (
                  <button
                    onClick={() => copyToClipboard(job.attestation_pda, "pda")}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === "pda" ? "✓" : "📋"}
                  </button>
                )}
              </div>
            </div>

            {/* Oracle Registry PDA */}
            {registry && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 shrink-0">Oracle Registry:</span>
                <div className="flex items-center gap-1.5 truncate">
                  <a
                    href={registry.explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-300 hover:underline truncate max-w-[200px] sm:max-w-[320px]"
                  >
                    {registry.oracle_registry_pda}
                  </a>
                  <button
                    onClick={() => copyToClipboard(registry.oracle_registry_pda, "reg")}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === "reg" ? "✓" : "📋"}
                  </button>
                </div>
              </div>
            )}

            {/* Transaction Signature */}
            {job?.tx_signature && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <span className="text-slate-400 shrink-0">Solana Tx Sig:</span>
                <a
                  href={job.explorer_url || `https://explorer.solana.com/tx/${job.tx_signature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:underline truncate max-w-[220px] sm:max-w-[340px]"
                >
                  <span className="truncate">{job.tx_signature}</span>
                  <span className="shrink-0 text-[10px]">↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
