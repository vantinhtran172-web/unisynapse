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
  original_name?: string;
  status: string;
  quality_score?: number;
  proof_cid?: string;
  owner_name?: string;
  owner_wallet?: string;
  uploaded_at?: number;
  created_at?: number;
  rejection_reason?: string;
  chunk_count?: number;
}

interface AdminTask {
  id: string;
  title: string;
  domain?: string;
  category?: string;
  context_snippet?: string;
  description?: string;
  question?: string;
  input_text?: string;
  options?: string[];
  labels?: string[];
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
  address?: string;
  role?: string;
  reputation?: number;
  unipoints?: number;
  disabled?: number;
  docs_submitted?: number;
  tasks_completed?: number;
  created_at?: number;
}

interface AdminChunk {
  id: string;
  document_id: string;
  document_name: string;
  chunk_index: number;
  page_number: number;
  content: string;
  created_at: number;
}

interface AdminLedgerEntry {
  id: string;
  user_id: string;
  username?: string;
  tx_type: string;
  amount: number;
  balance_after?: number;
  memo?: string;
  solana_signature?: string;
  timestamp?: number;
  created_at?: number;
}

interface AuditEvent {
  id: string;
  event_type?: string;
  action?: string;
  entity_id?: string;
  actor_id?: string;
  user_id?: string;
  details?: string;
  created_at?: number;
  timestamp?: number;
}

type TabType = "overview" | "documents" | "tasks" | "users" | "chunks" | "ledger";

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
  const [chunks, setChunks] = useState<AdminChunk[]>([]);
  const [ledger, setLedger] = useState<AdminLedgerEntry[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [docFilter, setDocFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState<string>("");
  const [chunkSearch, setChunkSearch] = useState<string>("");
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals - Security & Document Reject
  const [showKeyConfigModal, setShowKeyConfigModal] = useState<boolean>(false);
  const [rejectModalDoc, setRejectModalDoc] = useState<AdminDocument | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  // Modals - Document CRUD
  const [showCreateDocModal, setShowCreateDocModal] = useState<boolean>(false);
  const [createDocTitle, setCreateDocTitle] = useState<string>("");
  const [createDocContent, setCreateDocContent] = useState<string>("");
  const [createDocType, setCreateDocType] = useState<string>("text/plain");
  const [isCreatingDoc, setIsCreatingDoc] = useState<boolean>(false);

  const [editDocModal, setEditDocModal] = useState<AdminDocument | null>(null);
  const [editDocTitle, setEditDocTitle] = useState<string>("");
  const [editDocStatus, setEditDocStatus] = useState<string>("approved");
  const [editDocReason, setEditDocReason] = useState<string>("");
  const [isUpdatingDoc, setIsUpdatingDoc] = useState<boolean>(false);

  // Modals - Task CRUD
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDomain, setNewTaskDomain] = useState("Academic QA");
  const [newTaskContext, setNewTaskContext] = useState("");
  const [newTaskQuestion, setNewTaskQuestion] = useState("");
  const [newTaskOptions, setNewTaskOptions] = useState("Đồng ý, Không đồng ý, Cần bổ sung tài liệu");
  const [newTaskGold, setNewTaskGold] = useState("");
  const [newTaskPoints, setNewTaskPoints] = useState(15);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [editTaskModal, setEditTaskModal] = useState<AdminTask | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDomain, setEditTaskDomain] = useState("");
  const [editTaskContext, setEditTaskContext] = useState("");
  const [editTaskQuestion, setEditTaskQuestion] = useState("");
  const [editTaskOptions, setEditTaskOptions] = useState("");
  const [editTaskGold, setEditTaskGold] = useState("");
  const [editTaskPoints, setEditTaskPoints] = useState(15);
  const [editTaskStatus, setEditTaskStatus] = useState("open");
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  // Modals - User CRUD
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("UniSynapse@2026");
  const [newUserRole, setNewUserRole] = useState("student");
  const [newUserPoints, setNewUserPoints] = useState(100);
  const [newUserReputation, setNewUserReputation] = useState(100);
  const [newUserWallet, setNewUserWallet] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [editUserModal, setEditUserModal] = useState<AdminUser | null>(null);
  const [editUserRole, setEditUserRole] = useState("student");
  const [editUserReputation, setEditUserReputation] = useState(100);
  const [editUserDisabled, setEditUserDisabled] = useState<number>(0);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const [adjustPointsUser, setAdjustPointsUser] = useState<AdminUser | null>(null);
  const [adjustPointsAmount, setAdjustPointsAmount] = useState<number>(50);
  const [adjustPointsReason, setAdjustPointsReason] = useState<string>("Thưởng đóng góp học thuật xuất sắc");
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);

  // Modals - Chunks CRUD
  const [showCreateChunkModal, setShowCreateChunkModal] = useState<boolean>(false);
  const [newChunkDocName, setNewChunkDocName] = useState("Giáo trình chuẩn hóa CS101");
  const [newChunkPage, setNewChunkPage] = useState<number>(1);
  const [newChunkContent, setNewChunkContent] = useState("");
  const [isCreatingChunk, setIsCreatingChunk] = useState(false);

  const [editChunkModal, setEditChunkModal] = useState<AdminChunk | null>(null);
  const [editChunkDocName, setEditChunkDocName] = useState("");
  const [editChunkPage, setEditChunkPage] = useState<number>(1);
  const [editChunkContent, setEditChunkContent] = useState("");
  const [isUpdatingChunk, setIsUpdatingChunk] = useState(false);

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

  // Verify Security Key
  const handleVerifyKey = async (overrideKey?: string, overrideBase?: string) => {
    const keyToTest = (overrideKey !== undefined ? overrideKey : securityKey).trim();
    const baseToTest = (overrideBase !== undefined ? overrideBase : apiBase).trim();

    if (!keyToTest) {
      setAuthError("Vui lòng nhập mã bảo mật ADMIN_SECURITY_KEY!");
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const cleanBase = baseToTest.replace(/\/+$/, "");
      const res = await fetch(`${cleanBase}/admin/verify-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Security-Key": keyToTest,
        },
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Mã bảo mật không hợp lệ (HTTP ${res.status})`);
      }

      const verifiedData = await res.json();
      setIsAuthenticated(true);
      setSecurityKey(keyToTest);
      setApiBase(baseToTest);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("wit_online_admin_key", keyToTest);
        sessionStorage.setItem("wit_online_admin_base", baseToTest);
      }

      showToast(`Đã mở khóa phiên quản trị viên [${verifiedData.username || "Superadmin"}]!`, "success");
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
      const [s, docs, t, u, c, l, a] = await Promise.all([
        adminRequest("/admin/stats").catch(() => null),
        adminRequest("/admin/documents").catch(() => []),
        adminRequest("/admin/tasks").catch(() => []),
        adminRequest("/admin/users").catch(() => []),
        adminRequest("/admin/chunks?limit=100").catch(() => ({ chunks: [] })),
        adminRequest("/admin/ledger").catch(() => []),
        adminRequest("/admin/audit-events").catch(() => [])
      ]);

      setStats(s);
      setDocuments(docs || []);
      setTasks(t || []);
      setUsers(u || []);
      setChunks(c?.chunks || []);
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

  // ==========================================
  // DOCUMENT HANDLERS
  // ==========================================
  const handleApproveDoc = async (docId: string) => {
    if (!confirm(`Xác nhận phê duyệt tài liệu [${docId}] và tạo Merkle Proof on-chain?`)) return;
    try {
      await adminRequest(`/admin/documents/${docId}/approve`, { method: "POST" });
      showToast("Phê duyệt tài liệu thành công!", "success");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi khi duyệt: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

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
      showToast("Đã từ chối tài liệu và lưu lý do", "success");
      setRejectModalDoc(null);
      setRejectReason("");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi khi từ chối: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createDocTitle.trim() || !createDocContent.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung tài liệu");
      return;
    }
    setIsCreatingDoc(true);
    try {
      const res = await adminRequest("/admin/documents", {
        method: "POST",
        body: JSON.stringify({
          title: createDocTitle.trim(),
          content: createDocContent.trim(),
          file_type: createDocType
        })
      });
      showToast(res.message || "Đã thêm tài liệu và nạp vector RAG thành công!", "success");
      setShowCreateDocModal(false);
      setCreateDocTitle("");
      setCreateDocContent("");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi tạo tài liệu: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const openEditDoc = (doc: AdminDocument) => {
    setEditDocModal(doc);
    setEditDocTitle(doc.original_name || doc.filename);
    setEditDocStatus(doc.status || "approved");
    setEditDocReason(doc.rejection_reason || "");
  };

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDocModal) return;
    setIsUpdatingDoc(true);
    try {
      await adminRequest(`/admin/documents/${editDocModal.id}`, {
        method: "PUT",
        body: JSON.stringify({
          original_name: editDocTitle.trim(),
          status: editDocStatus,
          rejection_reason: editDocReason.trim() || undefined
        })
      });
      showToast("Cập nhật thông tin tài liệu thành công!", "success");
      setEditDocModal(null);
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi cập nhật: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsUpdatingDoc(false);
    }
  };

  const handleDeleteDoc = async (doc: AdminDocument) => {
    const name = doc.original_name || doc.filename;
    if (!confirm(`XÁC NHẬN XÓA TÀI LIỆU:\n\n"${name}"\n\nToàn bộ các đoạn vector chunks trong RAG AI Tutor của tài liệu này cũng sẽ bị xóa vĩnh viễn!`)) return;
    try {
      await adminRequest(`/admin/documents/${doc.id}`, { method: "DELETE" });
      showToast(`Đã xóa tài liệu '${name}' thành công!`, "success");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi khi xóa: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

  // ==========================================
  // TASK HANDLERS
  // ==========================================
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskContext.trim() || !newTaskQuestion.trim()) {
      alert("Vui lòng nhập đầy đủ các trường thông tin bài toán");
      return;
    }
    setIsCreatingTask(true);
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
      setIsCreatingTask(false);
    }
  };

  const openEditTask = (task: AdminTask) => {
    setEditTaskModal(task);
    setEditTaskTitle(task.title);
    setEditTaskDomain(task.domain || task.category || "General");
    setEditTaskContext(task.context_snippet || task.description || "");
    setEditTaskQuestion(task.question || task.input_text || "");
    const opts = task.options || task.labels || [];
    setEditTaskOptions(opts.join(", "));
    setEditTaskGold(task.gold_label || "");
    setEditTaskPoints(task.reward_points || 15);
    setEditTaskStatus(task.status || "open");
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskModal) return;
    setIsUpdatingTask(true);
    try {
      const options = editTaskOptions.split(",").map(o => o.trim()).filter(Boolean);
      await adminRequest(`/admin/tasks/${editTaskModal.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTaskTitle.trim(),
          domain: editTaskDomain,
          context_snippet: editTaskContext.trim(),
          question: editTaskQuestion.trim(),
          options,
          gold_label: editTaskGold.trim() || undefined,
          reward_points: editTaskPoints,
          status: editTaskStatus
        })
      });
      showToast("Cập nhật bài toán gán nhãn thành công!", "success");
      setEditTaskModal(null);
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi cập nhật: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (task: AdminTask) => {
    if (!confirm(`XÁC NHẬN XÓA:\n\nBài toán: "${task.title}"\n\nToàn bộ kết quả biểu quyết gán nhãn của sinh viên cho bài toán này sẽ bị xóa!`)) return;
    try {
      await adminRequest(`/admin/tasks/${task.id}`, { method: "DELETE" });
      showToast(`Đã xóa bài toán '${task.title}' thành công!`, "success");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi xóa bài toán: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

  // ==========================================
  // USER HANDLERS
  // ==========================================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      alert("Vui lòng nhập tên người dùng");
      return;
    }
    setIsCreatingUser(true);
    try {
      await adminRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newUserPassword.trim() || undefined,
          role: newUserRole,
          unipoints: newUserPoints,
          reputation: newUserReputation,
          wallet_address: newUserWallet.trim() || undefined
        })
      });
      showToast(`Đã tạo thành viên '${newUsername}' thành công!`, "success");
      setShowCreateUserModal(false);
      setNewUsername("");
      setNewUserWallet("");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi tạo thành viên: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const openEditUser = (user: AdminUser) => {
    setEditUserModal(user);
    setEditUserRole(user.role || "student");
    setEditUserReputation(user.reputation ?? 100);
    setEditUserDisabled(user.disabled ? 1 : 0);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    setIsUpdatingUser(true);
    try {
      await adminRequest(`/admin/users/${editUserModal.id}`, {
        method: "PUT",
        body: JSON.stringify({
          role: editUserRole,
          reputation: editUserReputation,
          disabled: editUserDisabled
        })
      });
      showToast(`Đã cập nhật thông tin thành viên '${editUserModal.username}'!`, "success");
      setEditUserModal(null);
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi cập nhật thành viên: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const openAdjustPoints = (user: AdminUser) => {
    setAdjustPointsUser(user);
    setAdjustPointsAmount(50);
    setAdjustPointsReason("Thưởng đóng góp học thuật xuất sắc");
  };

  const handleConfirmAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPointsUser) return;
    if (adjustPointsAmount === 0) {
      alert("Số điểm điều chỉnh phải khác 0 (+ để cộng, - để trừ)");
      return;
    }
    setIsAdjustingPoints(true);
    try {
      const res = await adminRequest(`/admin/users/${adjustPointsUser.id}/adjust-points`, {
        method: "POST",
        body: JSON.stringify({
          amount: adjustPointsAmount,
          reason: adjustPointsReason.trim() || "Admin điều chỉnh số dư"
        })
      });
      showToast(res.message || "Đã cập nhật điểm và ghi Sổ cái thành công!", "success");
      setAdjustPointsUser(null);
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi điều chỉnh điểm: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsAdjustingPoints(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`XÁC NHẬN XÓA THÀNH VIÊN:\n\nTài khoản: "${user.username}" (ID: ${user.id})\n\nHành động này không thể hoàn tác!`)) return;
    try {
      await adminRequest(`/admin/users/${user.id}`, { method: "DELETE" });
      showToast(`Đã xóa thành viên '${user.username}'!`, "success");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi xóa người dùng: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

  // ==========================================
  // KNOWLEDGE CHUNKS HANDLERS
  // ==========================================
  const handleCreateChunk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChunkContent.trim()) {
      alert("Vui lòng nhập nội dung đoạn tri thức");
      return;
    }
    setIsCreatingChunk(true);
    try {
      await adminRequest("/admin/chunks", {
        method: "POST",
        body: JSON.stringify({
          document_name: newChunkDocName.trim(),
          page_number: newChunkPage,
          content: newChunkContent.trim()
        })
      });
      showToast("Đã thêm đoạn tri thức vào RAG AI Tutor!", "success");
      setShowCreateChunkModal(false);
      setNewChunkContent("");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi thêm tri thức: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsCreatingChunk(false);
    }
  };

  const openEditChunk = (chunk: AdminChunk) => {
    setEditChunkModal(chunk);
    setEditChunkDocName(chunk.document_name);
    setEditChunkPage(chunk.page_number || 1);
    setEditChunkContent(chunk.content);
  };

  const handleUpdateChunk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editChunkModal) return;
    setIsUpdatingChunk(true);
    try {
      await adminRequest(`/admin/chunks/${editChunkModal.id}`, {
        method: "PUT",
        body: JSON.stringify({
          document_name: editChunkDocName.trim(),
          page_number: editChunkPage,
          content: editChunkContent.trim()
        })
      });
      showToast("Đã cập nhật nội dung đoạn tri thức!", "success");
      setEditChunkModal(null);
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi cập nhật: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    } finally {
      setIsUpdatingChunk(false);
    }
  };

  const handleDeleteChunk = async (chunk: AdminChunk) => {
    if (!confirm(`Xác nhận xóa đoạn tri thức [${chunk.id}] khỏi kho RAG AI?`)) return;
    try {
      await adminRequest(`/admin/chunks/${chunk.id}`, { method: "DELETE" });
      showToast("Đã xóa đoạn tri thức thành công!", "success");
      loadAllData();
    } catch (err: unknown) {
      showToast("Lỗi khi xóa: " + (err instanceof Error ? err.message : "Lỗi"), "error");
    }
  };

  // ==========================================
  // VIEW 1: ZERO-TRUST LOCK SCREEN BARRIER
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 backdrop-blur-xl relative overflow-hidden">
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
            <span>WIT Secure Console 2.5</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNLOCKED ADMIN DASHBOARD CONSOLE
  // ==========================================
  const pendingCount = documents.filter(d => (d.status || "").toLowerCase().includes("pending")).length;
  const approvedCount = documents.filter(d => (d.status || "").toLowerCase().includes("approved")).length;
  const rejectedCount = documents.filter(d => (d.status || "").toLowerCase().includes("rejected")).length;

  const filteredDocs = docFilter === "all"
    ? documents
    : documents.filter(d => (d.status || "").toLowerCase().includes(docFilter.toLowerCase()));

  const filteredUsers = users.filter(u =>
    (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.wallet_address && u.wallet_address.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.address && u.address.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredChunks = chunks.filter(c =>
    (c.content && c.content.toLowerCase().includes(chunkSearch.toLowerCase())) ||
    (c.document_name && c.document_name.toLowerCase().includes(chunkSearch.toLowerCase())) ||
    (c.id && c.id.toLowerCase().includes(chunkSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-16">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all border ${
          notification.type === "success"
            ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20"
            : "bg-rose-500 text-white border-rose-400 shadow-rose-500/20"
        }`}>
          <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/20">
              WIT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Cổng Quản Trị Hệ Thống
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  ● Đã Xác Thực
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Quản lý CRUD dữ liệu: Tài liệu, Bài toán gán nhãn, Thành viên & Kho tri thức RAG AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAllData()}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-1.5 transition-all"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={() => setShowKeyConfigModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-1.5 transition-all"
            >
              <span>🔑</span>
              <span className="hidden sm:inline">Khóa API</span>
            </button>

            <button
              onClick={handleLockConsole}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
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
            <span>Tài liệu ({documents.length})</span>
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
            <span>Nhiệm vụ Gán nhãn ({tasks.length})</span>
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
            <span>Thành viên & Điểm ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("chunks")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "chunks"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>🧩</span>
            <span>Kho Tri Thức RAG ({chunks.length})</span>
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
                    {stats?.users?.toLocaleString() ?? users.length}
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
                    {stats?.total_documents?.toLocaleString() ?? documents.length}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="text-emerald-500 font-semibold">{approvedCount} đã duyệt</span> · <span className="text-amber-500 font-semibold">{pendingCount} chờ</span>
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
                    {stats?.indexed_chunks?.toLocaleString() ?? chunks.length}
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
                    {stats?.total_tasks?.toLocaleString() ?? tasks.length}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="text-emerald-500 font-semibold">{stats?.open_tasks ?? tasks.length} bài mở</span>
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
                    {stats?.solana_proofs?.toLocaleString() ?? ledger.length}
                  </div>
                  <div className="text-[11px] text-slate-500">Proof-of-Contribution on-chain</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl">
                  🪙
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Điểm UniPoints</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {stats?.total_unipoints?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">Đã phân phối cho sinh viên</div>
                </div>
              </div>
            </div>

            {/* Quick CRUD Shortcut Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/30 shadow-lg">
              <h3 className="text-base font-bold text-white mb-2">⚡ Thao Tác Quản Trị Trực Tiếp (CRUD Console)</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Hệ thống hỗ trợ toàn quyền <strong>Thêm, Sửa, Xóa</strong> trực tuyến đối với toàn bộ dữ liệu hệ thống:
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setShowCreateDocModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  + Thêm Tài Liệu Mới
                </button>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  + Tạo Bài Toán Gán Nhãn
                </button>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  + Thêm Thành Viên Mới
                </button>
                <button
                  onClick={() => setShowCreateChunkModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
                >
                  + Nạp Đoạn Tri Thức RAG
                </button>
              </div>
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
                  onClick={() => setDocFilter("pending")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    docFilter === "pending" ? "bg-amber-500 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Chờ duyệt ({pendingCount})
                </button>
                <button
                  onClick={() => setDocFilter("approved")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    docFilter === "approved" ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Đã duyệt ({approvedCount})
                </button>
                <button
                  onClick={() => setDocFilter("rejected")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    docFilter === "rejected" ? "bg-rose-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Từ chối ({rejectedCount})
                </button>
              </div>

              <button
                onClick={() => setShowCreateDocModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <span>+ Thêm Tài Liệu Mới</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Tài liệu</th>
                      <th className="py-3.5 px-4">Tác giả / Ví</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Chunks RAG</th>
                      <th className="py-3.5 px-4">Thời gian</th>
                      <th className="py-3.5 px-4 text-right">Thao tác (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Không có tài liệu nào trong danh mục này.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => {
                        const st = (doc.status || "").toLowerCase();
                        const isPending = st.includes("pending");
                        const isApproved = st.includes("approved");

                        return (
                          <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                                {doc.original_name || doc.filename}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">{doc.id}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800 dark:text-slate-200">{doc.owner_name || "Admin"}</div>
                              <div className="font-mono text-[10px] text-slate-400">
                                {doc.owner_wallet ? `${doc.owner_wallet.substring(0, 6)}...` : "--"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isApproved
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : isPending
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              }`}>
                                {isApproved ? "Đã duyệt" : isPending ? "Chờ duyệt" : "Từ chối"}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {doc.chunk_count ?? 0} đoạn
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {doc.created_at || doc.uploaded_at ? new Date(((doc.created_at || doc.uploaded_at) as number) * 1000).toLocaleDateString("vi-VN") : "--"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleApproveDoc(doc.id)}
                                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                                      title="Phê duyệt giáo trình và mint proof"
                                    >
                                      ✓ Duyệt
                                    </button>
                                    <button
                                      onClick={() => setRejectModalDoc(doc)}
                                      className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-colors"
                                      title="Từ chối tài liệu"
                                    >
                                      ✕ Từ chối
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => openEditDoc(doc)}
                                  className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-colors"
                                  title="Chỉnh sửa thông tin tài liệu"
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc)}
                                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-colors"
                                  title="Xóa tài liệu và vector chunks"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
                Quản lý bài toán gán nhãn RLHF
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
                      <th className="py-3.5 px-4">Phương án</th>
                      <th className="py-3.5 px-4">Thưởng</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4 text-right">Thao tác (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Chưa có bài toán gán nhãn nào được tạo.
                        </td>
                      </tr>
                    ) : (
                      tasks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                            <div className="text-[10px] text-slate-400">{t.domain || t.category || "Academic QA"}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                            {t.question || t.input_text || "--"}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500">
                            {(t.options || t.labels || []).join(", ") || "--"}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-500 whitespace-nowrap">
                            +{t.reward_points} UP
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              (t.status || "").toLowerCase() === "open"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openEditTask(t)}
                                className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-colors"
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t)}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-colors"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm kiếm username hoặc địa chỉ ví..."
                className="w-full max-w-sm px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <span>+ Thêm Thành Viên Mới</span>
              </button>
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
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4 text-right">Thao tác (CRUD)</th>
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
                      filteredUsers.map((u) => {
                        const addr = u.wallet_address || u.address;
                        const isBlocked = !!u.disabled;

                        return (
                          <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{u.username}</span>
                                {isBlocked && (
                                  <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black">
                                    ĐÃ KHÓA
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">Vai trò: <strong>{u.role || "student"}</strong></div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-blue-500">
                              {addr ? `${addr.substring(0, 6)}...${addr.slice(-4)}` : "Chưa kết nối"}
                            </td>
                            <td className="py-3 px-4 font-bold text-amber-500">
                              ★ {u.reputation ?? 100}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-500">
                              {(u.unipoints ?? 0).toLocaleString()} UP
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                !isBlocked
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              }`}>
                                {!isBlocked ? "Hoạt động" : "Bị khóa"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openAdjustPoints(u)}
                                  className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] transition-colors"
                                  title="Cộng hoặc trừ UniPoints ghi sổ cái"
                                >
                                  💰 ± Điểm
                                </button>
                                <button
                                  onClick={() => openEditUser(u)}
                                  className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-colors"
                                  title="Sửa vai trò, điểm uy tín hoặc khóa tài khoản"
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-colors"
                                  title="Xóa tài khoản người dùng"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. KNOWLEDGE CHUNKS (RAG) PANEL */}
        {activeTab === "chunks" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="text"
                value={chunkSearch}
                onChange={(e) => setChunkSearch(e.target.value)}
                placeholder="Tìm kiếm nội dung vector chunks, tài liệu..."
                className="w-full max-w-sm px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={() => setShowCreateChunkModal(true)}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all"
              >
                <span>+ Thêm Đoạn Tri Thức Trực Tiếp</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Mã Chunk</th>
                      <th className="py-3.5 px-4">Tài liệu Nguồn</th>
                      <th className="py-3.5 px-4">Trang</th>
                      <th className="py-3.5 px-4">Trích đoạn Tri thức</th>
                      <th className="py-3.5 px-4 text-right">Thao tác (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredChunks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Không có đoạn vector nào trong kho tri thức RAG.
                        </td>
                      </tr>
                    ) : (
                      filteredChunks.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                            {c.id}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                            {c.document_name || c.document_id}
                          </td>
                          <td className="py-3 px-4 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                            Trang {c.page_number || 1}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md line-clamp-2 leading-relaxed">
                            {c.content}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openEditChunk(c)}
                                className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-[11px] transition-colors"
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteChunk(c)}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-colors"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
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

        {/* 6. LEDGER & AUDIT PANEL */}
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
                        <th className="py-3.5 px-4">Nội dung (Memo)</th>
                        <th className="py-3.5 px-4">Solana Tx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
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
                        <th className="py-3.5 px-4">Người thực hiện</th>
                        <th className="py-3.5 px-4">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {auditEvents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 font-sans">
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
                            <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">{evt.actor_id || evt.user_id || "System"}</td>
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

      {/* ========================================== */}
      {/* MODAL: CONFIG SECURITY KEY */}
      {/* ========================================== */}
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

      {/* ========================================== */}
      {/* MODAL: REJECT DOCUMENT */}
      {/* ========================================== */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>Từ chối tài liệu</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vui lòng nhập lý do từ chối tài liệu <strong>{rejectModalDoc.original_name || rejectModalDoc.filename}</strong>:
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

      {/* ========================================== */}
      {/* MODAL: CREATE DOCUMENT */}
      {/* ========================================== */}
      {showCreateDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📚</span>
                <span>Thêm Giáo Trình / Tài Liệu Mới</span>
              </h3>
              <button onClick={() => setShowCreateDocModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên tài liệu / Giáo trình:</label>
                <input
                  type="text"
                  value={createDocTitle}
                  onChange={(e) => setCreateDocTitle(e.target.value)}
                  placeholder="VD: Giáo trình Giải tích 1 - ĐHBK 2026.txt"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Định dạng:</label>
                <select
                  value={createDocType}
                  onChange={(e) => setCreateDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="text/plain">Văn bản thuần (text/plain)</option>
                  <option value="application/pdf">Tài liệu PDF (application/pdf)</option>
                  <option value="text/markdown">Markdown (text/markdown)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nội dung học thuật (Tự động băm & nạp vector RAG):</label>
                <textarea
                  value={createDocContent}
                  onChange={(e) => setCreateDocContent(e.target.value)}
                  rows={8}
                  placeholder="Dán toàn bộ nội dung giáo trình học phần hoặc tài liệu bài giảng vào đây..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateDocModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDoc}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {isCreatingDoc ? "Đang lập chỉ mục RAG..." : "Lập chỉ mục & Phê duyệt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EDIT DOCUMENT */}
      {/* ========================================== */}
      {editDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✏️</span>
                <span>Chỉnh Sửa Thông Tin Tài Liệu</span>
              </h3>
              <button onClick={() => setEditDocModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateDoc} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên tài liệu:</label>
                <input
                  type="text"
                  value={editDocTitle}
                  onChange={(e) => setEditDocTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trạng thái phê duyệt:</label>
                <select
                  value={editDocStatus}
                  onChange={(e) => setEditDocStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="approved">Đã duyệt (approved)</option>
                  <option value="pending_review">Chờ duyệt (pending_review)</option>
                  <option value="rejected">Từ chối (rejected)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi chú / Lý do từ chối:</label>
                <textarea
                  value={editDocReason}
                  onChange={(e) => setEditDocReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditDocModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingDoc}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {isUpdatingDoc ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE TASK */}
      {/* ========================================== */}
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
                  placeholder="VD: Kiểm tra tính đúng đắn của giải thuật..."
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
                  disabled={isCreatingTask}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {isCreatingTask ? "Đang tạo..." : "Tạo & Phát hành"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EDIT TASK */}
      {/* ========================================== */}
      {editTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✏️</span>
                <span>Sửa Bài Toán Gán Nhãn</span>
              </h3>
              <button onClick={() => setEditTaskModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu đề:</label>
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lĩnh vực:</label>
                  <input
                    type="text"
                    value={editTaskDomain}
                    onChange={(e) => setEditTaskDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trạng thái:</label>
                  <select
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="open">Đang mở (open)</option>
                    <option value="completed">Đã hoàn thành (completed)</option>
                    <option value="closed">Đã đóng (closed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngữ cảnh:</label>
                <textarea
                  value={editTaskContext}
                  onChange={(e) => setEditTaskContext(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Câu hỏi:</label>
                <input
                  type="text"
                  value={editTaskQuestion}
                  onChange={(e) => setEditTaskQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Các lựa chọn (phân tách bởi dấu phẩy):</label>
                <input
                  type="text"
                  value={editTaskOptions}
                  onChange={(e) => setEditTaskOptions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gold Label (Đáp án):</label>
                  <input
                    type="text"
                    value={editTaskGold}
                    onChange={(e) => setEditTaskGold(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thưởng UniPoints:</label>
                  <input
                    type="number"
                    value={editTaskPoints}
                    onChange={(e) => setEditTaskPoints(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditTaskModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTask}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {isUpdatingTask ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE USER */}
      {/* ========================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>👤</span>
                <span>Thêm Thành Viên Mới</span>
              </h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên đăng nhập (Username):</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="student_bk_2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu khởi tạo:</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vai trò (Role):</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="student">student (Sinh viên)</option>
                    <option value="validator">validator (Kiểm định viên)</option>
                    <option value="faculty">faculty (Giảng viên)</option>
                    <option value="admin">admin (Quản trị viên)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số dư UniPoints:</label>
                  <input
                    type="number"
                    value={newUserPoints}
                    onChange={(e) => setNewUserPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Điểm Uy Tín Khởi Đầu:</label>
                <input
                  type="number"
                  value={newUserReputation}
                  onChange={(e) => setNewUserReputation(parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ Ví Solana (Tùy chọn):</label>
                <input
                  type="text"
                  value={newUserWallet}
                  onChange={(e) => setNewUserWallet(e.target.value)}
                  placeholder="Để trống hệ thống sẽ tự sinh ví ảo Devnet"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {isCreatingUser ? "Đang tạo..." : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EDIT USER */}
      {/* ========================================== */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✏️</span>
                <span>Sửa Thông Tin Thành Viên: {editUserModal.username}</span>
              </h3>
              <button onClick={() => setEditUserModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vai trò:</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="student">student</option>
                  <option value="validator">validator</option>
                  <option value="faculty">faculty</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Điểm Uy Tín (Reputation):</label>
                <input
                  type="number"
                  value={editUserReputation}
                  onChange={(e) => setEditUserReputation(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Khóa / Mở khóa tài khoản:</label>
                <select
                  value={editUserDisabled}
                  onChange={(e) => setEditUserDisabled(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value={0}>Hoạt động bình thường (Mở khóa)</option>
                  <option value={1}>Khóa tài khoản (Vô hiệu hóa đăng nhập)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {isUpdatingUser ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADJUST POINTS */}
      {/* ========================================== */}
      {adjustPointsUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>💰</span>
                <span>Điều Chỉnh UniPoints: {adjustPointsUser.username}</span>
              </h3>
              <button onClick={() => setAdjustPointsUser(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustPoints} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400">Số dư hiện tại:</div>
                <div className="text-lg font-black text-emerald-500 font-mono">
                  {(adjustPointsUser.unipoints ?? 0).toLocaleString()} UP
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số điểm điều chỉnh (+ để cộng, - để trừ):
                </label>
                <input
                  type="number"
                  value={adjustPointsAmount}
                  onChange={(e) => setAdjustPointsAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lý do điều chỉnh (Memo ghi Sổ cái):</label>
                <input
                  type="text"
                  value={adjustPointsReason}
                  onChange={(e) => setAdjustPointsReason(e.target.value)}
                  placeholder="VD: Thưởng giải nhất Hackathon, phạt vi phạm..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjustPointsUser(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAdjustingPoints}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isAdjustingPoints ? "Đang xử lý..." : "Xác Nhận & Ghi Sổ Cái"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE CHUNK */}
      {/* ========================================== */}
      {showCreateChunkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🧩</span>
                <span>Nạp Đoạn Tri Thức Trực Tiếp Vào RAG</span>
              </h3>
              <button onClick={() => setShowCreateChunkModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateChunk} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên tài liệu / Chuyên đề:</label>
                  <input
                    type="text"
                    value={newChunkDocName}
                    onChange={(e) => setNewChunkDocName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số trang:</label>
                  <input
                    type="number"
                    value={newChunkPage}
                    onChange={(e) => setNewChunkPage(parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung đoạn tri thức (Vector Embedding sẽ được tính tự động):
                </label>
                <textarea
                  value={newChunkContent}
                  onChange={(e) => setNewChunkContent(e.target.value)}
                  rows={6}
                  placeholder="Nhập định nghĩa, định lý, công thức hoặc đoạn văn học thuật muốn AI Tutor trả lời..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChunkModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingChunk}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {isCreatingChunk ? "Đang tính vector..." : "Nạp Tri Thức"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EDIT CHUNK */}
      {/* ========================================== */}
      {editChunkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✏️</span>
                <span>Sửa Đoạn Tri Thức: {editChunkModal.id}</span>
              </h3>
              <button onClick={() => setEditChunkModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateChunk} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên tài liệu / Chuyên đề:</label>
                  <input
                    type="text"
                    value={editChunkDocName}
                    onChange={(e) => setEditChunkDocName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số trang:</label>
                  <input
                    type="number"
                    value={editChunkPage}
                    onChange={(e) => setEditChunkPage(parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nội dung đoạn tri thức:</label>
                <textarea
                  value={editChunkContent}
                  onChange={(e) => setEditChunkContent(e.target.value)}
                  rows={7}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditChunkModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingChunk}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {isUpdatingChunk ? "Đang lưu..." : "Cập Nhật Vector"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
