"use client";

import { useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { TaskSubmissionResult } from "../lib/api";

export default function DataLabeling() {
  const { tasks, submitTask, user } = useAppState();
  const { publicKey } = useWallet();

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<TaskSubmissionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  if (tasks.length === 0) {
    return (
      <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-[320px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl mb-3 shadow-lg shadow-emerald-500/10">
          🎉
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
          Tất cả nhiệm vụ đã hoàn thành!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Các bài toán gán nhãn hiện có đều đã đạt đồng thuận hoặc hoàn tất. Vui lòng quay lại sau khi giảng viên hoặc quản trị viên mở thêm nhiệm vụ mới!
        </p>
      </div>
    );
  }

  const safeIndex = currentTaskIndex < tasks.length ? currentTaskIndex : 0;
  const activeTask = tasks[safeIndex];

  const handleSelectLabel = async (label: string) => {
    if (!activeTask) return;
    setIsSubmitting(true);
    setErrorMessage("");
    setResult(null);

    try {
      const res = await submitTask(activeTask.id, label);
      setResult(res);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Lỗi khi gửi kết quả gán nhãn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTask = () => {
    setResult(null);
    setErrorMessage("");
    setCurrentTaskIndex((prev) => (prev + 1) % tasks.length);
  };

  const handlePrevTask = () => {
    setResult(null);
    setErrorMessage("");
    setCurrentTaskIndex((prev) => (prev - 1 + tasks.length) % tasks.length);
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nhiệm Vụ Gán Nhãn Dữ Liệu</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevTask}
                className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 transition"
                title="Bài trước"
              >
                ←
              </button>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 font-mono">
                {safeIndex + 1}/{tasks.length}
              </span>
              <button
                type="button"
                onClick={handleNextTask}
                className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 transition"
                title="Bài tiếp theo"
              >
                →
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeTask.title}</p>
        </div>
        <span className="bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-500/30 font-semibold">
          +{activeTask.reward_points} UniPoints
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/90 p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-5 flex-grow">
        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider block mb-1">
          {activeTask.category}
        </span>
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed italic">
          &quot;{activeTask.input_text}&quot;
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleNextTask}
            className="underline hover:text-red-300 text-[11px] whitespace-nowrap cursor-pointer font-semibold"
          >
            Bỏ qua bài này →
          </button>
        </div>
      )}

      {!result ? (
        <div className="space-y-3 mt-auto">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Chọn phân loại của bạn:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeTask.labels.map((lbl) => (
              <button
                key={lbl}
                onClick={() => handleSelectLabel(lbl)}
                disabled={isSubmitting || activeTask.user_submitted}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all duration-200 capitalize flex items-center justify-center gap-1.5 ${
                  activeTask.user_label === lbl
                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25"
                    : "bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-blue-500 shadow-xs"
                } disabled:opacity-50`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {activeTask.user_submitted && !result && (
            <div className="mt-3 text-center space-y-2">
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                ✓ Bạn đã đóng góp cho bài toán này (Đang chờ thêm phiếu đối chiếu chéo).
              </p>
              <button
                type="button"
                onClick={handleNextTask}
                className="btn-cyber-secondary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1 shadow-sm"
              >
                Chuyển bài toán tiếp theo →
              </button>
            </div>
          )}

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              Đang xác thực và đối chiếu chéo (Consensus)...
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 mt-auto">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {result.finalized ? "Xác Thực Đối Chiếu Chéo Hoàn Tất" : "Hoàn Thành Gán Nhãn Nhiệm Vụ"}
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">
                +{((result.reward_points && result.reward_points > 0) ? result.reward_points : (activeTask?.reward_points || 10))} UniPoints
              </span>
            </div>

            <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg mb-2.5 border border-slate-200/60 dark:border-transparent">
              <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Kết quả từ các sinh viên đối chiếu:</p>
              {result.peer_votes.map((pv, idx) => (
                <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                  <span>{pv.username}:</span>
                  <span className={pv.label === result.label ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                    {pv.label}
                  </span>
                </div>
              ))}
              <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700/60 flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                <span>Tỷ lệ đồng thuận:</span>
                <span>{(result.confidence * 100).toFixed(0)}% Majority Vote</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono space-y-1 pt-1.5 border-t border-slate-200 dark:border-white/5">
              <p><span className="text-slate-400 dark:text-slate-500">Mã nhiệm vụ:</span> #{result.task_id}</p>
              <p><span className="text-slate-400 dark:text-slate-500">Người đóng góp:</span> {publicKey ? publicKey.toBase58().slice(0, 10) + "..." : user?.id}</p>
              {(result.explorer_url || result.solana_signature) ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                    <span>⛓️</span> Neo bằng chứng Solana:
                  </span>
                  <a
                    href={result.explorer_url || `https://explorer.solana.com/tx/${result.solana_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>Explorer ({result.solana_signature?.slice(0, 8)}...)</span>
                    <span>↗</span>
                  </a>
                </div>
              ) : (
                <p><span className="text-slate-400 dark:text-slate-500">Bằng chứng:</span> Đã ghi nhận vào Sổ cái bất biến</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextTask}
            className="btn-cyber-secondary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
          >
            Chuyển Bài Toán Tiếp Theo →
          </button>
        </div>
      )}
    </div>
  );
}
