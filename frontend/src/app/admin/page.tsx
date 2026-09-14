"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, AdminStats, AdminDocument, AdminTask, AdminUser, AdminLedgerEntry, AuditEvent } from "@/lib/api";

type AdminTab = "documents" | "tasks" | "users" | "ledger";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("documents");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ledger, setLedger] = useState<AdminLedgerEntry[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalDoc, setRejectModalDoc] = useState<AdminDocument | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDomain, setNewTaskDomain] = useState("Academic QA");
  const [newTaskContext, setNewTaskContext] = useState("");
  const [newTaskQuestion, setNewTaskQuestion] = useState("");
  const [newTaskOptions, setNewTaskOptions] = useState("Đồng ý, Không đồng ý, Cần xem xét thêm");
  const [newTaskGold, setNewTaskGold] = useState("");
  const [newTaskPoints, setNewTaskPoints] = useState(15);
  const [creatingTask, setCreatingTask] = useState(false);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [s, docs, t, u, l, a] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminDocuments().catch(() => []),
        api.getAdminTasks().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getAdminLedger().catch(() => []),
        api.getAdminAuditEvents().catch(() => []),
      ]);
      setStats(s);
      setDocuments(docs);
      setTasks(t);
      setUsers(u);
      setLedger(l);
      setAuditEvents(a);
    } catch (err: unknown) {
      showNotification("Lỗi khi tải dữ liệu admin: " + (err instanceof Error ? err.message : "Lỗi không xác định"), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleApproveDoc = async (docId: string) => {
    try {
      setActionLoading(`approve_${docId}`);
      const res = await api.approveDocument(docId);
      showNotification(res.message || "Đã phê duyệt tài liệu thành công!", "success");
      await loadData();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : "Lỗi không xác định", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectDoc = async () => {
    if (!rejectModalDoc) return;
    if (!rejectReason.trim()) {
      showNotification("Vui lòng nhập lý do từ chối tài liệu", "error");
      return;
    }
    try {
      setActionLoading(`reject_${rejectModalDoc.id}`);
      await api.rejectDocument(rejectModalDoc.id, rejectReason.trim());
      showNotification(`Đã từ chối tài liệu "${rejectModalDoc.original_name}"`, "success");
      setRejectModalDoc(null);
      setRejectReason("");
      await loadData();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : "Lỗi không xác định", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskQuestion.trim() || !newTaskContext.trim()) {
      showNotification("Vui lòng điền đầy đủ tiêu đề, ngữ cảnh và câu hỏi", "error");
      return;
    }
    const options = newTaskOptions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (options.length < 2) {
      showNotification("Cần ít nhất 2 phương án lựa chọn phân loại", "error");
      return;
    }

    try {
      setCreatingTask(true);
      const res = await api.createAdminTask({
        title: newTaskTitle.trim(),
        domain: newTaskDomain.trim(),
        context_snippet: newTaskContext.trim(),
        question: newTaskQuestion.trim(),
        options: options,
        gold_label: newTaskGold.trim() || undefined,
        reward_points: Number(newTaskPoints) || 15,
      });
      showNotification(res.message || "Tạo bài toán gán nhãn thành công!", "success");
      setNewTaskTitle("");
      setNewTaskContext("");
      setNewTaskQuestion("");
      setNewTaskGold("");
      await loadData();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : "Lỗi không xác định", "error");
    } finally {
      setCreatingTask(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 relative pb-20 cyber-grid-bg selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[130px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-purple-600/10 blur-[140px]"></div>
      </div>

      {/* Top Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl border flex items-center gap-3 backdrop-blur-md transition-all ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/90 border-rose-500/50 text-rose-300"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              notification.type === "success" ? "bg-emerald-400" : "bg-rose-400"
            }`}
          ></div>
          <p className="text-xs font-semibold">{notification.text}</p>
        </div>
      )}

      {/* Admin Top Command Header */}
      <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
              <div className="w-full h-full bg-[#030712] rounded-lg flex items-center justify-center">
                <span className="text-cyan-400 font-extrabold text-xs">WIT</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                  CYBER-ADMIN
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 font-semibold">
                  CONTROL HUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                UniSynapse Academic Oversight & Faculty Board Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 cyber-pulsing-dot"></span>
              <span>SOLANA DEVNET: CONNECTED</span>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="btn-cyber-secondary px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{loading ? "Đang tải..." : "Làm Mới"}</span>
            </button>

            <Link
              href="/"
              className="btn-cyber-primary px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1 shadow-lg"
            >
              <span>← Về Cổng Sinh Viên</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 relative z-10 space-y-6">
        {/* Realtime Metrics HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="cyber-panel p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              01 // Chờ Kiểm Định
            </div>
            <div className="text-2xl font-black text-amber-400">
              {stats?.pending_documents ?? documents.filter((d) => d.status === "pending_review").length}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Tài liệu học thuật</p>
          </div>

          <div className="cyber-panel p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              02 // Đã Phê Duyệt
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {stats?.approved_documents ?? documents.filter((d) => d.status === "approved").length}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {stats?.indexed_chunks ?? 0} Chunks trong RAG
            </p>
          </div>

          <div className="cyber-panel p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              03 // Task Đang Mở
            </div>
            <div className="text-2xl font-black text-cyan-400">
              {stats?.open_tasks ?? tasks.filter((t) => t.status === "open").length}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {stats?.total_labels_submitted ?? 0} lượt gán nhãn
            </p>
          </div>

          <div className="cyber-panel p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              04 // Solana Proofs
            </div>
            <div className="text-2xl font-black text-purple-400">
              {stats?.solana_proofs ?? ledger.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Giao dịch Devnet xác thực</p>
          </div>

          <div className="cyber-panel p-4 relative overflow-hidden col-span-2 sm:col-span-1">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              05 // Tổng UniPoints
            </div>
            <div className="text-2xl font-black text-white">
              {stats?.total_unipoints?.toLocaleString() ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Đã phân phối cho sinh viên</p>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex border-b border-cyan-500/20 gap-1 sm:gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x whitespace-nowrap flex items-center gap-2 ${
              activeTab === "documents"
                ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 border-b-transparent shadow-[0_-4px_12px_rgba(0,240,255,0.15)]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>THẨM ĐỊNH TÀI LIỆU ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tasks"
                ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 border-b-transparent shadow-[0_-4px_12px_rgba(0,240,255,0.15)]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>QUẢN LÝ BÀI TOÁN GÁN NHÃN ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x whitespace-nowrap flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 border-b-transparent shadow-[0_-4px_12px_rgba(0,240,255,0.15)]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>THÀNH VIÊN & UY TÍN ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x whitespace-nowrap flex items-center gap-2 ${
              activeTab === "ledger"
                ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 border-b-transparent shadow-[0_-4px_12px_rgba(0,240,255,0.15)]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>SỔ CÁI SOLANA & AUDIT ({ledger.length})</span>
          </button>
        </div>

        {/* TAB 1: Document Moderation */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="cyber-panel p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Hàng Đợi Thẩm Định 6 Cổng Tài Liệu</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                      FACULTY REVIEW
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hội đồng phê duyệt học liệu. Khi duyệt: Tự động trích xuất Chunks vào RAG, cộng +50 UniPoints và phát hành Solana Proof.
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  Chưa có tài liệu nào trong hệ thống.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="pb-3 font-semibold">Tên Học Liệu</th>
                        <th className="pb-3 font-semibold">Người Đóng Góp</th>
                        <th className="pb-3 font-semibold">Dung Lượng</th>
                        <th className="pb-3 font-semibold">6 Cổng Kiểm Định</th>
                        <th className="pb-3 font-semibold">Trạng Thái</th>
                        <th className="pb-3 font-semibold text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {documents.map((doc) => {
                        const isPending = doc.status === "pending_review";
                        const isApproved = doc.status === "approved";
                        const isRejected = doc.status === "rejected";

                        return (
                          <tr key={doc.id} className="hover:bg-cyan-950/20 transition-colors">
                            <td className="py-3 pr-2 font-sans font-medium text-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded bg-slate-800 text-cyan-400">
                                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </span>
                                <div>
                                  <div className="font-bold">{doc.original_name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    ID: {doc.id} • Chunks: {doc.chunk_count || 0}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-slate-400">
                              <div>{doc.owner_name || "Unverified owner"}</div>
                              <div className="text-[10px] text-slate-600 truncate max-w-[120px]">
                                {doc.owner_wallet || "Solana Wallet"}
                              </div>
                            </td>
                            <td className="py-3 text-slate-400">
                              {(doc.size_bytes / 1024).toFixed(1)} KB
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1 text-[10px]">
                                <span
                                  title="MIME File Type"
                                  className="px-1 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                                >
                                  MIME ✓
                                </span>
                                <span
                                  title="PII Data Safe"
                                  className="px-1 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                                >
                                  PII ✓
                                </span>
                                <span
                                  title="Deduplication"
                                  className="px-1 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                                >
                                  Dedupe ✓
                                </span>
                                <span
                                  title="Copyright"
                                  className="px-1 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                                >
                                  Copyr ✓
                                </span>
                              </div>
                            </td>
                            <td className="py-3">
                              {isPending && (
                                <span className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                                  Chờ duyệt
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                  Đã duyệt (RAG Active)
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                                  Bị từ chối
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleApproveDoc(doc.id)}
                                      disabled={actionLoading === `approve_${doc.id}`}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] shadow transition-all"
                                    >
                                      {actionLoading === `approve_${doc.id}` ? "Đang duyệt..." : "Duyệt ✓"}
                                    </button>
                                    <button
                                      onClick={() => setRejectModalDoc(doc)}
                                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 text-[11px] transition-all"
                                    >
                                      Từ chối ✕
                                    </button>
                                  </>
                                )}
                                {!isPending && (
                                  <span className="text-[11px] text-slate-500">
                                    {isApproved ? "Đã cấp +50 pts" : "Đã gửi phản hồi"}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Task Factory & Consensus */}
        {activeTab === "tasks" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create New Task Form */}
            <div className="lg:col-span-5 cyber-panel p-5 h-fit">
              <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <span>Tạo Bài Toán Gán Nhãn Mới</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                  FACTORY
                </span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Bài toán mới sẽ xuất hiện ngay trên giao diện của sinh viên để thu thập ý kiến chuyên môn và tính điểm đồng thuận.
              </p>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tiêu đề bài toán:
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="VD: Đánh giá giải thích Con trỏ C/C++"
                    className="w-full bg-[#030712] border border-slate-700 rounded-md p-2 text-slate-200 focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lĩnh vực:</label>
                  <input
                    type="text"
                    value={newTaskDomain}
                    onChange={(e) => setNewTaskDomain(e.target.value)}
                    placeholder="VD: Cấu trúc dữ liệu, Giải thuật, Học máy..."
                    className="w-full bg-[#030712] border border-slate-700 rounded-md p-2 text-slate-200 focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ngữ cảnh / Đoạn văn bản cần đánh giá:
                  </label>
                  <textarea
                    rows={3}
                    value={newTaskContext}
                    onChange={(e) => setNewTaskContext(e.target.value)}
                    placeholder="Nhập nội dung câu trả lời hoặc đoạn tài liệu sinh viên cần thẩm định..."
                    className="w-full bg-[#030712] border border-slate-700 rounded-md p-2 text-slate-200 focus:border-cyan-400 outline-none font-sans"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Câu hỏi đặt cho sinh viên:
                  </label>
                  <input
                    type="text"
                    value={newTaskQuestion}
                    onChange={(e) => setNewTaskQuestion(e.target.value)}
                    placeholder="VD: Lập luận trên có chính xác về con trỏ không?"
                    className="w-full bg-[#030712] border border-slate-700 rounded-md p-2 text-slate-200 focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Các phương án nhãn (cách nhau dấu phẩy):
                  </label>
                  <input
                    type="text"
                    value={newTaskOptions}
                    onChange={(e) => setNewTaskOptions(e.target.value)}
                    placeholder="Chính xác, Sai sót, Cần bổ sung"
                    className="w-full bg-[#030712] border border-slate-700 rounded-md p-2 text-slate-200 focus:border-cyan-400 outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Gold Label (nếu có):
                    </label>
                    <input
                      type="text"
                      value={newTaskGold}
                      onChange={(e) => setNewTaskGold(e.target.value)}
                      placeholder="Đáp án chuẩn (tùy chọn)"
                      className="w-full bg-[#030712] border border-slate-700 rounded-md p-2 text-slate-200 focus:border-cyan-400 outline-none font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Thưởng (UniPoints):
                    </label>
                    <input
                      type="number"
                      value={newTaskPoints}
                      onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                      className="w-full bg-[#030712] border border-slate-700 rounded-md p-2 text-slate-200 focus:border-cyan-400 outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingTask}
                  className="w-full btn-cyber-primary py-2.5 rounded-md font-bold text-xs mt-2"
                >
                  {creatingTask ? "Đang tạo bài toán..." : "+ Phát Hành Bài Toán Gán Nhãn"}
                </button>
              </form>
            </div>

            {/* Task List & Consensus Breakdown */}
            <div className="lg:col-span-7 cyber-panel p-5">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-4 flex items-center justify-between">
                <span>Danh Sách Bài Toán & Tỷ Lệ Đồng Thuận</span>
                <span className="text-xs text-slate-400 font-sans">
                  {tasks.length} bài toán đang quản lý
                </span>
              </h3>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg bg-[#070d1e] border border-slate-800">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold text-xs">
                            {task.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {task.domain || task.category || "CS101"}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-xs mt-1">{task.title}</h4>
                      </div>

                      <div className="text-right font-mono">
                        <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                          +{task.reward_points} UniPoints
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {task.total_submissions || 0} lượt sinh viên nộp
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic bg-[#030712] p-2.5 rounded border border-slate-800/80 mb-3">
                      &quot;{task.input_text || task.context_snippet}&quot;
                    </p>

                    {/* Breakdown votes */}
                    {task.label_breakdown && task.label_breakdown.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          Phân bố bình chọn đồng thuận (Consensus Distribution):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {task.label_breakdown.map((b, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 rounded bg-[#0a1128] border border-cyan-500/20 text-[10px] font-mono text-cyan-200 flex items-center gap-1.5"
                            >
                              <span className="font-semibold">{b.label}:</span>
                              <span className="text-cyan-400 font-bold">{b.count} phiếu</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: User Management */}
        {activeTab === "users" && (
          <div className="cyber-panel p-5">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-4 flex items-center justify-between">
              <span>Bảng Xếp Hạng & Quản Lý Thành Viên</span>
              <span className="text-xs text-slate-400 font-sans">
                {users.length} tài khoản sinh viên
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-3">Sinh Viên / Username</th>
                    <th className="pb-3">Địa Chỉ Ví Solana</th>
                    <th className="pb-3">Số Dư UniPoints</th>
                    <th className="pb-3">Chỉ Số Uy Tín (Reputation)</th>
                    <th className="pb-3">Task Gán Nhãn</th>
                    <th className="pb-3">Tài Liệu Đã Gửi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="py-3 font-sans font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{u.username}</span>
                        {u.role === "admin" && (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-400 text-[11px] truncate max-w-[180px]">
                        {u.address || "0xSolanaWallet..."}
                      </td>
                      <td className="py-3 font-bold text-cyan-300">
                        {u.unipoints?.toLocaleString()} pts
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full"
                              style={{ width: `${Math.min(100, u.reputation || 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-emerald-400 font-bold">{u.reputation || 100}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-300">{u.tasks_completed || 0}</td>
                      <td className="py-3 text-slate-300">{u.docs_submitted || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Ledger & Audit Stream */}
        {activeTab === "ledger" && (
          <div className="space-y-6">
            {/* Solana Double-Entry Ledger */}
            <div className="cyber-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono tracking-wider">
                    Sổ Cái Minh Bạch Điểm Thưởng & Chữ Ký Solana Devnet
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mọi giao dịch điểm thưởng đều được ghi nhận kèm Merkle Proof và mã băm Solana.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                  SOLANA DEVNET
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-3">Mã GD (Ledger ID)</th>
                      <th className="pb-3">Người Nhận</th>
                      <th className="pb-3">Điểm Thưởng</th>
                      <th className="pb-3">Lý Do Đóng Góp</th>
                      <th className="pb-3">Trạng Thái</th>
                      <th className="pb-3 text-right">Solana Signature / Explorer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ledger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-purple-950/20 transition-colors">
                        <td className="py-3 font-semibold text-cyan-300">{entry.id}</td>
                        <td className="py-3 text-slate-300 font-sans">{entry.username || entry.user_id}</td>
                        <td className="py-3 font-bold text-emerald-400">+{entry.delta} pts</td>
                        <td className="py-3 text-slate-400 font-sans">{entry.reason}</td>
                        <td className="py-3">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                            {entry.proof_status || "confirmed"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {entry.explorer_url ? (
                            <a
                              href={entry.explorer_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 underline text-[11px] font-mono inline-flex items-center gap-1"
                            >
                              <span>{entry.solana_signature?.slice(0, 16)}...</span>
                              <span>↗</span>
                            </a>
                          ) : (
                            <span className="text-slate-600">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Security Events */}
            <div className="cyber-panel p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <span>Nhật Ký Kiểm Toán Hệ Thống (Audit Security Events)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {auditEvents.length} bản ghi
                </span>
              </h3>

              <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs pr-2">
                {auditEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded bg-[#030712] border border-slate-800 flex items-center justify-between gap-3 text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">[{evt.action || evt.event_type}]</span>
                      <span className="font-sans text-[11px] text-slate-200">{evt.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date((evt.created_at || evt.timestamp || 0) * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-panel max-w-md w-full p-6 space-y-4 border-rose-500/40">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <span>Từ Chối Học Liệu:</span>
              <span className="text-xs text-slate-200 truncate">{rejectModalDoc.original_name}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Vui lòng nhập lý do từ chối để hệ thống gửi thông báo phản hồi cho sinh viên điều chỉnh.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Tài liệu có dấu hiệu vi phạm bản quyền giáo trình ngoài hoặc chất lượng scan quá mờ..."
              className="w-full bg-[#030712] border border-slate-700 rounded-md p-2.5 text-xs text-slate-200 outline-none focus:border-rose-400"
            ></textarea>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectModalDoc(null);
                  setRejectReason("");
                }}
                className="btn-cyber-secondary px-3 py-1.5 text-xs rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectDoc}
                disabled={actionLoading === `reject_${rejectModalDoc.id}`}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
              >
                {actionLoading === `reject_${rejectModalDoc.id}` ? "Đang xử lý..." : "Xác Nhận Từ Chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
