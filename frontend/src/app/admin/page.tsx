"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface AdminStats {
  users: number;
  total_tasks: number;
  open_tasks: number;
  total_documents: number;
  approved_documents: number;
  pending_documents: number;
  rejected_documents: number;
  indexed_chunks: number;
  solana_proofs: number;
  total_unipoints: number;
  total_labels_submitted: number;
}

interface AdminDocument {
  id: string;
  filename: string;
  status: string;
  quality_score?: number;
  proof_cid?: string;
  owner_name?: string;
  owner_wallet?: string;
  uploaded_at?: number;
}

interface AdminTask {
  id: string;
  title: string;
  domain: string;
  context_snippet: string;
  question: string;
  options: string[];
  gold_label?: string;
  reward_points: number;
  status: string;
  total_submissions?: number;
  valid_votes?: number;
  label_breakdown?: Array<{ label: string; count: number }>;
}

interface AdminUser {
  id: string;
  username: string;
  wallet_address?: string;
  role?: string;
  reputation?: number;
  unipoints?: number;
  docs_submitted?: number;
  tasks_completed?: number;
}

interface AdminLedgerEntry {
  id: string;
  user_id: string;
  username?: string;
  tx_type: string;
  amount: number;
  balance_after: number;
  memo?: string;
  solana_signature?: string;
  timestamp?: number;
}

interface AuditEvent {
  id: string;
  event_type: string;
  action?: string;
  entity_id: string;
  actor_id: string;
  details: string;
  created_at?: number;
  timestamp?: number;
}

type TabType = "overview" | "documents" | "tasks" | "users" | "ledger";

export default function OnlineAdminPage() {
  // Authentication State
  const [securityKey, setSecurityKey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [apiBase, setApiBase] = useState<string>("/api/v1");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [ledgerSubTab, setLedgerSubTab] = useState<"ledger" | "audit">("ledger");
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ledger, setLedger] = useState<AdminLedgerEntry[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [docFilter, setDocFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState<string>("");
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [showKeyConfigModal, setShowKeyConfigModal] = useState<boolean>(false);
  const [rejectModalDoc, setRejectModalDoc] = useState<AdminDocument | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<boolean>(false);

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDomain, setNewTaskDomain] = useState("Academic QA");
  const [newTaskContext, setNewTaskContext] = useState("");
  const [newTaskQuestion, setNewTaskQuestion] = useState("");
  const [newTaskOptions, setNewTaskOptions] = useState("Đồng ý, Không đồng ý, Cần bổ sung tài liệu");
  const [newTaskGold, setNewTaskGold] = useState("");
  const [newTaskPoints, setNewTaskPoints] = useState(15);
  const [creatingTask, setCreatingTask] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Helper fetch with X-Admin-Security-Key header
  const adminRequest = useCallback(async (path: string, options: RequestInit = {}) => {
    const cleanBase = apiBase.replace(/\/+$/, "");
    const url = `${cleanBase}${path}`;
    const headers = new Headers(options.headers || {});
    headers.set("X-Admin-Security-Key", securityKey);
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include"
    });

    if (res.status === 403) {
      setIsAuthenticated(false);
      throw new Error("403 Forbidden: Khóa bảo mật không chính xác hoặc hết hạn.");
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Lỗi HTTP ${res.status}`);
    }
    return res.json();
  }, [apiBase, securityKey]);

  // Verify Key handler
  const handleVerifyKey = async (overrideKey?: string, overrideBase?: string) => {
    const keyToTest = (overrideKey !== undefined ? overrideKey : securityKey).trim();
    const baseToTest = (overrideBase !== undefined ? overrideBase : apiBase).trim();

    if (!keyToTest) {
      setAuthError("Vui lòng nhập ADMIN_SECURITY_KEY");
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const cleanBase = baseToTest.replace(/\/+$/, "");
      const res = await fetch(`${cleanBase}/admin/verify-key`, {
        headers: { "X-Admin-Security-Key": keyToTest },
        credentials: "include"
      });

      if (res.status === 403) {
        throw new Error("Khóa bảo mật không chính xác (403 Forbidden). Vui lòng kiểm tra lại file .env.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Không thể kết nối Backend (${res.status})`);
      }

      // Success
      setIsAuthenticated(true);
      setSecurityKey(keyToTest);
      setApiBase(baseToTest);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wit_online_admin_key", keyToTest);
        sessionStorage.setItem("wit_online_admin_base", baseToTest);
      }
      showToast("Xác thực quản trị viên thành công!", "success");
      setShowKeyConfigModal(false);
    } catch (err: unknown) {
      setIsAuthenticated(false);
      const msg = err instanceof Error ? err.message : "Xác thực thất bại";
      setAuthError(msg);
      showToast(msg, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  // Load dashboard data
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated || !securityKey) return;
    setLoading(true);
    try {
      const [s, docs, t, u, l, a] = await Promise.all([
        adminRequest("/admin/stats").catch(() => null),
        adminRequest("/admin/documents").catch(() => []),
        adminRequest("/admin/tasks").catch(() => []),
        adminRequest("/admin/users").catch(() => []),
        adminRequest("/admin/ledger").catch(() => []),
        adminRequest("/admin/audit-events").catch(() => [])
      ]);

      setStats(s);
      setDocuments(docs || []);
      setTasks(t || []);
      setUsers(u || []);
      setLedger(l || []);
      setAuditEvents(a || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi tải dữ liệu";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [adminRequest, isAuthenticated, securityKey]);

  // Initial check on mount from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = sessionStorage.getItem("wit_online_admin_key") || localStorage.getItem("wit_online_admin_key") || "";
      const savedBase = sessionStorage.getItem("wit_online_admin_base") || localStorage.getItem("wit_online_admin_base") || "/api/v1";
      if (savedKey) {
        setSecurityKey(savedKey);
        setApiBase(savedBase);
        handleVerifyKey(savedKey, savedBase);
      }
    }
  }, []);

  // Reload data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // Lock Console
  const handleLockConsole = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("wit_online_admin_key");
    }
    showToast("Đã khóa cổng quản trị an toàn", "success");
  };

  // Approve Document
  const handleApproveDoc = async (docId: string) => {
    if (!confirm(`Xác nhận phê duyệt tài liệu [${docId}] và tạo Merkle Proof on-chain?`)) return;
    try {
      await adminRequest(`/admin/documents/${docId}/approve`, { method: "POST" });
      showToast("Phê duyệt tài liệu thành công!", "success");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi khi duyệt tài liệu: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectModalDoc) return;
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await adminRequest(`/admin/documents/${rejectModalDoc.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() })
      });
      showToast("Đã từ chối tài liệu và gửi lý do cho tác giả", "success");
      setRejectModalDoc(null);
      setRejectReason("");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi khi từ chối: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskContext.trim() || !newTaskQuestion.trim()) {
      alert("Vui lòng nhập đầy đủ các trường thông tin bài toán");
      return;
    }
    setCreatingTask(true);
    try {
      const options = newTaskOptions.split(",").map(o => o.trim()).filter(Boolean);
      await adminRequest("/admin/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          domain: newTaskDomain,
          context_snippet: newTaskContext.trim(),
          question: newTaskQuestion.trim(),
          options,
          gold_label: newTaskGold.trim() || undefined,
          reward_points: newTaskPoints
        })
      });
      showToast("Tạo bài toán gán nhãn thành công!", "success");
      setShowCreateTaskModal(false);
      setNewTaskTitle("");
      setNewTaskContext("");
      setNewTaskQuestion("");
      setNewTaskGold("");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi khi tạo bài toán: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setCreatingTask(false);
    }
  };

  // ==========================================
  // VIEW 1: ZERO-TRUST LOCK SCREEN BARRIER
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Top glow decoration */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-3xl shadow-lg shadow-indigo-500/30 mb-4">
              🛡️
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold tracking-wider uppercase mb-2">
              Khóa Bảo Mật Riêng
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Cổng Quản Trị WIT
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Trang này yêu cầu <strong>ADMIN_SECURITY_KEY</strong> được định nghĩa trong file môi trường (.env).
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1">{authError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyKey();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Khóa bảo mật quản trị viên
              </label>
              <div className="relative">
                <input
                  type={showKeyText ? "text" : "password"}
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="wit-admin-sec-..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1"
                >
                  {showKeyText ? "🔒" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Backend API Endpoint
              </label>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="/api/v1 hoặc https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mặc định <code>/api/v1</code> trên Netlify hoặc điền URL backend tùy chỉnh.
              </span>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Đang xác thực khóa...</span>
                </>
              ) : (
                <>
                  <span>🔓 Mở khóa Cổng Quản trị</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-indigo-500 transition-colors">
              ← Về trang chủ
            </Link>
            <span>WIT Secure Console 2.4</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNLOCKED ADMIN DASHBOARD CONSOLE
  // ==========================================
  const pendingCount = documents.filter(d => d.status === "PENDING").length;
  const approvedCount = documents.filter(d => d.status === "APPROVED").length;
  const rejectedCount = documents.filter(d => d.status === "REJECTED").length;

  const filteredDocs = docFilter === "all" ? documents : documents.filter(d => d.status === docFilter);
  const filteredUsers = users.filter(u =>
    (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.wallet_address && u.wallet_address.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-16">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-md transition-all ${
          notification.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
        }`}>
          {notification.text}
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="sticky top-16 z-30 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-8 mb-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-sm tracking-wider shadow-sm">
              WIT
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>ADMIN OPERATIONS</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ONLINE AUTHENTICATED
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Khóa: {securityKey.substring(0, 8)}...{securityKey.slice(-4)} · {apiBase}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyConfigModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
            >
              🔑 Đổi Khóa
            </button>
            <button
              onClick={loadAllData}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors flex items-center gap-1.5"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              <span>Làm mới</span>
            </button>
            <button
              onClick={handleLockConsole}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              🔒 Khóa lại
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>📊</span>
            <span>Tổng quan</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "documents"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>📑</span>
            <span>Duyệt Tài liệu</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "tasks"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>🎯</span>
            <span>Nhiệm vụ Gán nhãn</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>👥</span>
            <span>Thành viên & Điểm</span>
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "ledger"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>⛓️</span>
            <span>Sổ cái & Audit Log</span>
          </button>
        </div>

        {/* 1. OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Thành Viên</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {stats?.users?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">Tài khoản sinh viên đăng ký</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl">
                  📚
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tài Liệu Kho Tri Thức</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {stats?.total_documents?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="text-emerald-500 font-semibold">{stats?.approved_documents ?? 0} đã duyệt</span> · <span className="text-amber-500 font-semibold">{stats?.pending_documents ?? 0} chờ</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-2xl">
                  🧩
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Vector Embeddings</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {stats?.indexed_chunks?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">Đoạn dữ liệu nạp vào RAG Tutor</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Bài Toán Gán Nhãn</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {stats?.total_tasks?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="text-emerald-500 font-semibold">{stats?.open_tasks ?? 0} bài đang mở</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Chứng Minh Solana</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {stats?.solana_proofs?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">Proof-of-Contribution on-chain</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl">
                  🪙
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">UniPoints Lưu Hành</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {stats?.total_unipoints?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {stats?.total_labels_submitted ?? 0} lượt gán nhãn hợp lệ
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Online Zero-Trust Architecture
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight mb-2">
                Cổng Quản Trị Trực Tuyến Đã Được Khóa Bảo Mật
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Cổng quản trị này chỉ có thể thao tác khi cung cấp khóa <code>ADMIN_SECURITY_KEY</code> hợp lệ. Mọi API admin đều được kiểm soát nghiêm ngặt qua header xác thực độc quyền, bảo đảm quyền riêng tư và an toàn dữ liệu học thuật.
              </p>
            </div>
          </div>
        )}

        {/* 2. DOCUMENTS PANEL */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    docFilter === "all" ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Tất cả ({documents.length})
                </button>
                <button
                  onClick={() => setDocFilter("PENDING")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    docFilter === "PENDING" ? "bg-amber-500 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Chờ duyệt ({pendingCount})
                </button>
                <button
                  onClick={() => setDocFilter("APPROVED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    docFilter === "APPROVED" ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Đã duyệt ({approvedCount})
                </button>
                <button
                  onClick={() => setDocFilter("REJECTED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    docFilter === "REJECTED" ? "bg-rose-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Từ chối ({rejectedCount})
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Tài liệu</th>
                      <th className="py-3.5 px-4">Tác giả / Ví</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Điểm AI</th>
                      <th className="py-3.5 px-4">Solana / IPFS CID</th>
                      <th className="py-3.5 px-4">Thời gian</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không có tài liệu nào trong danh mục này.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                              {doc.filename}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{doc.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{doc.owner_name || "Vô danh"}</div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {doc.owner_wallet ? `${doc.owner_wallet.substring(0, 6)}...` : "--"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              doc.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : doc.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}>
                              {doc.status === "APPROVED" ? "Đã duyệt" : doc.status === "PENDING" ? "Chờ duyệt" : "Từ chối"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {doc.quality_score ? `${Math.round(doc.quality_score * 100)}%` : "--"}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            {doc.proof_cid ? (
                              <a
                                href={`https://explorer.solana.com/address/${doc.proof_cid}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {doc.proof_cid.substring(0, 8)}...
                              </a>
                            ) : (
                              <span className="text-slate-400">Chưa mint</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {doc.uploaded_at ? new Date(doc.uploaded_at * 1000).toLocaleDateString("vi-VN") : "--"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {doc.status === "PENDING" ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleApproveDoc(doc.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => setRejectModalDoc(doc)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-colors"
                                >
                                  Từ chối
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Đã xử lý</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. TASKS PANEL */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Danh sách bài toán gán nhãn RLHF
              </h2>
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <span>+ Tạo Bài toán Mới</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Tiêu đề / Lĩnh vực</th>
                      <th className="py-3.5 px-4">Câu hỏi</th>
                      <th className="py-3.5 px-4">Thưởng</th>
                      <th className="py-3.5 px-4">Tiến độ Bỏ phiếu</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Chưa có bài toán gán nhãn nào được tạo.
                        </td>
                      </tr>
                    ) : (
                      tasks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                            <div className="text-[10px] text-slate-400">{t.domain}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                            {t.question}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-500">
                            +{t.reward_points} UP
                          </td>
                          <td className="py-3 px-4">
                            <div>Tổng phiếu: <strong>{t.total_submissions ?? 0}</strong></div>
                            <div className="text-[10px] text-slate-400">Hợp lệ: {t.valid_votes ?? 0}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              t.status === "OPEN"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. USERS PANEL */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm kiếm username hoặc địa chỉ ví..."
                className="w-full max-w-sm px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Thành viên</th>
                      <th className="py-3.5 px-4">Ví Solana</th>
                      <th className="py-3.5 px-4">Điểm Uy Tín</th>
                      <th className="py-3.5 px-4">Số dư UniPoints</th>
                      <th className="py-3.5 px-4">Tài liệu tải lên</th>
                      <th className="py-3.5 px-4">Nhiệm vụ hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Không tìm thấy thành viên nào.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{u.username}</div>
                            <div className="text-[10px] text-slate-400">Vai trò: {u.role || "student"}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-blue-500">
                            {u.wallet_address ? `${u.wallet_address.substring(0, 6)}...${u.wallet_address.slice(-4)}` : "Chưa kết nối"}
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-500">
                            ★ {u.reputation ?? 100}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-500">
                            {(u.unipoints ?? 0).toLocaleString()} UP
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {u.docs_submitted ?? 0}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {u.tasks_completed ?? 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. LEDGER & AUDIT PANEL */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setLedgerSubTab("ledger")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  ledgerSubTab === "ledger" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Sổ cái Giao dịch Điểm ({ledger.length})
              </button>
              <button
                onClick={() => setLedgerSubTab("audit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  ledgerSubTab === "audit" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Nhật ký Kiểm toán An ninh ({auditEvents.length})
              </button>
            </div>

            {ledgerSubTab === "ledger" ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Mã GD</th>
                        <th className="py-3.5 px-4">Thành viên</th>
                        <th className="py-3.5 px-4">Loại GD</th>
                        <th className="py-3.5 px-4">Biến động</th>
                        <th className="py-3.5 px-4">Số dư sau</th>
                        <th className="py-3.5 px-4">Nội dung (Memo)</th>
                        <th className="py-3.5 px-4">Solana Tx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                            Sổ cái chưa ghi nhận giao dịch nào.
                          </td>
                        </tr>
                      ) : (
                        ledger.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 text-slate-500">{entry.id.substring(0, 8)}...</td>
                            <td className="py-3 px-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                              {entry.username || entry.user_id.substring(0, 8)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                                {entry.tx_type}
                              </span>
                            </td>
                            <td className={`py-3 px-4 font-bold ${entry.amount > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                              {entry.amount > 0 ? `+${entry.amount}` : entry.amount} UP
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                              {entry.balance_after.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-sans text-slate-500 max-w-xs truncate">
                              {entry.memo || "--"}
                            </td>
                            <td className="py-3 px-4">
                              {entry.solana_signature ? (
                                <a
                                  href={`https://explorer.solana.com/tx/${entry.solana_signature}?cluster=devnet`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {entry.solana_signature.substring(0, 8)}...
                                </a>
                              ) : (
                                <span className="text-slate-400 font-sans">Internal</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Mã Sự Kiện</th>
                        <th className="py-3.5 px-4">Hành động</th>
                        <th className="py-3.5 px-4">Đối tượng</th>
                        <th className="py-3.5 px-4">Người thực hiện</th>
                        <th className="py-3.5 px-4">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {auditEvents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                            Chưa có sự kiện kiểm toán nào.
                          </td>
                        </tr>
                      ) : (
                        auditEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 text-slate-400">{evt.id.substring(0, 8)}...</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                                {evt.action || evt.event_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{evt.entity_id || "--"}</td>
                            <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">{evt.actor_id || "System"}</td>
                            <td className="py-3 px-4 font-sans text-slate-500 max-w-sm truncate">{evt.details || "--"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: CHANGE SECURITY KEY */}
      {showKeyConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔐</span>
                <span>Cấu hình Khóa Quản trị</span>
              </h3>
              <button onClick={() => setShowKeyConfigModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Khóa ADMIN_SECURITY_KEY:</label>
                <input
                  type="password"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Backend API Base:</label>
                <input
                  type="text"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowKeyConfigModal(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Đóng
              </button>
              <button
                onClick={() => handleVerifyKey()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
              >
                Xác thực lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT DOCUMENT */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>Từ chối tài liệu</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vui lòng nhập lý do từ chối tài liệu <strong>{rejectModalDoc.filename}</strong> để phản hồi cho tác giả:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="VD: Tài liệu mờ, không đầy đủ hoặc chứa thông tin không chính xác..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModalDoc(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TASK */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎯</span>
                <span>Tạo Bài toán Gán nhãn RLHF</span>
              </h3>
              <button onClick={() => setShowCreateTaskModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu đề nhiệm vụ:</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="VD: Kiểm tra tính đúng đắn của định lý..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lĩnh vực:</label>
                  <select
                    value={newTaskDomain}
                    onChange={(e) => setNewTaskDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Academic QA">Academic QA</option>
                    <option value="Toán học & Giải tích">Toán học & Giải tích</option>
                    <option value="Khoa học Máy tính">Khoa học Máy tính</option>
                    <option value="Vật lý Đại cương">Vật lý Đại cương</option>
                    <option value="Kinh tế & Tài chính">Kinh tế & Tài chính</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thưởng (UniPoints):</label>
                  <input
                    type="number"
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(parseInt(e.target.value) || 15)}
                    min={5}
                    max={100}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đoạn văn ngữ cảnh (Context):</label>
                <textarea
                  value={newTaskContext}
                  onChange={(e) => setNewTaskContext(e.target.value)}
                  rows={3}
                  placeholder="Trích đoạn tài liệu hoặc bối cảnh cần đánh giá..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Câu hỏi thẩm định:</label>
                <input
                  type="text"
                  value={newTaskQuestion}
                  onChange={(e) => setNewTaskQuestion(e.target.value)}
                  placeholder="VD: Nhận định trên có chính xác về mặt học thuật không?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Các phương án (cách nhau bằng dấu phẩy):</label>
                <input
                  type="text"
                  value={newTaskOptions}
                  onChange={(e) => setNewTaskOptions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đáp án chuẩn (Gold Label - tùy chọn):</label>
                <input
                  type="text"
                  value={newTaskGold}
                  onChange={(e) => setNewTaskGold(e.target.value)}
                  placeholder="Đồng ý"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {creatingTask ? "Đang tạo..." : "Tạo & Phát hành"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
