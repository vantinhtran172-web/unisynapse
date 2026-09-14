// WIT Operations Console - Standalone Admin Portal Engine
(function() {
  // Configuration & State
  const config = window.WIT_ADMIN_CONFIG || {
    DEFAULT_API_BASE: "http://localhost:8000/api/v1",
    DEFAULT_KEY: "wit-admin-sec-9a8f4c2e1b7d5e3f01829475c8b6a12d"
  };

  const state = {
    apiBase: localStorage.getItem("wit_admin_api_base") || config.DEFAULT_API_BASE,
    adminKey: localStorage.getItem("wit_admin_security_key") || config.DEFAULT_KEY,
    stats: null,
    documents: [],
    tasks: [],
    users: [],
    ledger: [],
    auditEvents: [],
    activeTab: "overview",
    docFilter: "all",
    docToReject: null,
    userQuery: ""
  };

  // DOM Elements
  const el = {
    nodeStatusBadge: document.getElementById("nodeStatusBadge"),
    nodeStatusText: document.getElementById("nodeStatusText"),
    keyIndicatorBtn: document.getElementById("keyIndicatorBtn"),
    keyDisplay: document.getElementById("keyDisplay"),
    btnRefresh: document.getElementById("btnRefresh"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    panelSections: document.querySelectorAll(".panel-section"),
    pendingDocsBadge: document.getElementById("pendingDocsBadge"),
    lastUpdatedLabel: document.getElementById("lastUpdatedLabel"),
    toast: document.getElementById("toast"),

    // Stats
    statUsers: document.getElementById("statUsers"),
    statDocuments: document.getElementById("statDocuments"),
    statApprovedDocs: document.getElementById("statApprovedDocs"),
    statPendingDocs: document.getElementById("statPendingDocs"),
    statChunks: document.getElementById("statChunks"),
    statTasks: document.getElementById("statTasks"),
    statOpenTasks: document.getElementById("statOpenTasks"),
    statSolanaProofs: document.getElementById("statSolanaProofs"),
    statUniPoints: document.getElementById("statUniPoints"),
    statTotalLabels: document.getElementById("statTotalLabels"),

    // Tables
    documentsTableBody: document.getElementById("documentsTableBody"),
    tasksTableBody: document.getElementById("tasksTableBody"),
    usersTableBody: document.getElementById("usersTableBody"),
    ledgerTableBody: document.getElementById("ledgerTableBody"),
    auditTableBody: document.getElementById("auditTableBody"),

    // Filter Buttons
    docFilterBtns: document.querySelectorAll(".filter-btn"),
    countDocsAll: document.getElementById("countDocsAll"),
    countDocsPending: document.getElementById("countDocsPending"),
    countDocsApproved: document.getElementById("countDocsApproved"),
    countDocsRejected: document.getElementById("countDocsRejected"),
    userSearchInput: document.getElementById("userSearchInput"),

    // Subtabs
    subtabBtns: document.querySelectorAll(".subtab-btn"),
    subtabContents: document.querySelectorAll(".subtab-content"),

    // Modals
    modalSecurityKey: document.getElementById("modalSecurityKey"),
    inputSecurityKey: document.getElementById("inputSecurityKey"),
    inputApiBase: document.getElementById("inputApiBase"),
    btnToggleKeyVisibility: document.getElementById("btnToggleKeyVisibility"),
    btnSaveKey: document.getElementById("btnSaveKey"),
    btnCloseKeyModal: document.getElementById("btnCloseKeyModal"),
    btnCancelKeyModal: document.getElementById("btnCancelKeyModal"),
    keyValidationResult: document.getElementById("keyValidationResult"),

    modalRejectDoc: document.getElementById("modalRejectDoc"),
    inputRejectReason: document.getElementById("inputRejectReason"),
    btnConfirmReject: document.getElementById("btnConfirmReject"),
    btnCloseRejectModal: document.getElementById("btnCloseRejectModal"),
    btnCancelRejectModal: document.getElementById("btnCancelRejectModal"),

    modalCreateTask: document.getElementById("modalCreateTask"),
    btnOpenCreateTaskModal: document.getElementById("btnOpenCreateTaskModal"),
    btnSubmitCreateTask: document.getElementById("btnSubmitCreateTask"),
    btnCloseCreateTaskModal: document.getElementById("btnCloseCreateTaskModal"),
    btnCancelCreateTaskModal: document.getElementById("btnCancelCreateTaskModal"),
    taskTitle: document.getElementById("taskTitle"),
    taskDomain: document.getElementById("taskDomain"),
    taskContext: document.getElementById("taskContext"),
    taskQuestion: document.getElementById("taskQuestion"),
    taskOptions: document.getElementById("taskOptions"),
    taskGoldLabel: document.getElementById("taskGoldLabel"),
    taskPoints: document.getElementById("taskPoints")
  };

  // Toast Helper
  function showToast(msg, type = "success") {
    el.toast.textContent = msg;
    el.toast.className = `toast ${type}`;
    setTimeout(() => {
      el.toast.className = "toast hidden";
    }, 4500);
  }

  // API Call Wrapper with Security Header
  async function adminFetch(path, options = {}) {
    const url = `${state.apiBase}${path}`;
    const headers = {
      "Content-Type": "application/json",
      "X-Admin-Security-Key": state.adminKey,
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 403) {
        updateNodeStatus(false, "Khóa quản trị 403 (Không hợp lệ)");
        openKeyModal("Khóa bảo mật hiện tại không hợp lệ hoặc đã bị thay đổi trên server.");
        throw new Error("403 Forbidden: Khóa bảo mật không chính xác.");
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`[AdminFetch Error] ${path}:`, err);
      throw err;
    }
  }

  // Verify Key via backend /admin/verify-key
  async function verifyCurrentKey() {
    try {
      const res = await adminFetch("/admin/verify-key", { method: "POST" });
      if (res && res.valid) {
        updateNodeStatus(true, "Backend Đang Hoạt Động (200 OK)");
        const maskedKey = state.adminKey ? (state.adminKey.substring(0, 10) + "...") : "Chưa đặt";
        el.keyDisplay.textContent = `Khóa: ${maskedKey}`;
        return true;
      }
    } catch (err) {
      updateNodeStatus(false, "Lỗi kết nối / Khóa sai");
      el.keyDisplay.textContent = "Khóa: Không hợp lệ";
      return false;
    }
    return false;
  }

  function updateNodeStatus(online, text) {
    el.nodeStatusBadge.className = `node-status ${online ? "connected" : "error"}`;
    el.nodeStatusText.textContent = text;
  }

  // Load All Admin Data
  async function loadAllData() {
    try {
      el.btnRefresh.style.transform = "rotate(180deg)";
      setTimeout(() => el.btnRefresh.style.transform = "none", 400);

      const isValid = await verifyCurrentKey();
      if (!isValid) return;

      const [statsRes, docsRes, tasksRes, usersRes, ledgerRes, auditRes] = await Promise.all([
        adminFetch("/admin/stats").catch(() => null),
        adminFetch("/admin/documents").catch(() => []),
        adminFetch("/admin/tasks").catch(() => []),
        adminFetch("/admin/users").catch(() => []),
        adminFetch("/admin/ledger").catch(() => []),
        adminFetch("/admin/audit-events").catch(() => [])
      ]);

      state.stats = statsRes;
      state.documents = docsRes || [];
      state.tasks = tasksRes || [];
      state.users = usersRes || [];
      state.ledger = ledgerRes || [];
      state.auditEvents = auditRes || [];

      renderOverview();
      renderDocuments();
      renderTasks();
      renderUsers();
      renderLedger();
      renderAudit();

      el.lastUpdatedLabel.textContent = `Cập nhật: ${new Date().toLocaleTimeString("vi-VN")}`;
    } catch (err) {
      showToast("Lỗi nạp dữ liệu quản trị: " + err.message, "error");
    }
  }

  // 1. RENDER OVERVIEW
  function renderOverview() {
    if (!state.stats) return;
    const s = state.stats;

    el.statUsers.textContent = s.users?.toLocaleString() ?? "0";
    el.statDocuments.textContent = s.total_documents?.toLocaleString() ?? "0";
    el.statApprovedDocs.textContent = s.approved_documents?.toLocaleString() ?? "0";
    el.statPendingDocs.textContent = s.pending_documents?.toLocaleString() ?? "0";
    el.pendingDocsBadge.textContent = s.pending_documents ?? "0";
    el.statChunks.textContent = s.indexed_chunks?.toLocaleString() ?? "0";
    el.statTasks.textContent = s.total_tasks?.toLocaleString() ?? "0";
    el.statOpenTasks.textContent = s.open_tasks?.toLocaleString() ?? "0";
    el.statSolanaProofs.textContent = s.solana_proofs?.toLocaleString() ?? "0";
    el.statUniPoints.textContent = s.total_unipoints?.toLocaleString() ?? "0";
    el.statTotalLabels.textContent = s.total_labels_submitted?.toLocaleString() ?? "0";
  }

  // 2. RENDER DOCUMENTS
  function renderDocuments() {
    const docs = state.documents;
    
    // Counts
    const pending = docs.filter(d => d.status === "PENDING").length;
    const approved = docs.filter(d => d.status === "APPROVED").length;
    const rejected = docs.filter(d => d.status === "REJECTED").length;
    
    el.countDocsAll.textContent = docs.length;
    el.countDocsPending.textContent = pending;
    el.countDocsApproved.textContent = approved;
    el.countDocsRejected.textContent = rejected;
    el.pendingDocsBadge.textContent = pending;

    const filtered = state.docFilter === "all" ? docs : docs.filter(d => d.status === state.docFilter);

    if (filtered.length === 0) {
      el.documentsTableBody.innerHTML = `<tr><td colspan="7" class="empty-cell">Không có tài liệu nào trong danh mục này.</td></tr>`;
      return;
    }

    el.documentsTableBody.innerHTML = filtered.map(doc => {
      const statusClass = doc.status.toLowerCase();
      const statusText = doc.status === "APPROVED" ? "Đã duyệt" : doc.status === "PENDING" ? "Chờ duyệt" : "Từ chối";
      const timeStr = doc.uploaded_at ? new Date(doc.uploaded_at * 1000).toLocaleString("vi-VN") : "--";
      const score = doc.quality_score ? `${Math.round(doc.quality_score * 100)}%` : "Chưa chấm";
      const cid = doc.proof_cid ? `<a href="https://explorer.solana.com/address/${doc.proof_cid}?cluster=devnet" target="_blank" class="mono-hash">${doc.proof_cid.substring(0, 12)}...</a>` : `<span class="text-muted">Chưa mint</span>`;

      let actionHtml = `<span class="text-muted">Đã xử lý</span>`;
      if (doc.status === "PENDING") {
        actionHtml = `
          <button class="btn-sm-action approve" onclick="window.adminActions.approveDoc('${doc.id}')">Duyệt</button>
          <button class="btn-sm-action reject" onclick="window.adminActions.openRejectModal('${doc.id}')">Từ chối</button>
        `;
      }

      return `
        <tr>
          <td>
            <strong>${escapeHtml(doc.filename)}</strong>
            <div class="text-muted" style="font-size:0.7rem;">ID: ${doc.id}</div>
          </td>
          <td>
            <div>${escapeHtml(doc.owner_name || "Vô danh")}</div>
            <div class="mono-hash" style="font-size:0.7rem;">${doc.owner_wallet ? doc.owner_wallet.substring(0, 8) + '...' : '--'}</div>
          </td>
          <td><span class="status-chip ${statusClass}">${statusText}</span></td>
          <td><strong style="color:#60a5fa">${score}</strong></td>
          <td>${cid}</td>
          <td>${timeStr}</td>
          <td style="text-align: right;">${actionHtml}</td>
        </tr>
      `;
    }).join("");
  }

  // 3. RENDER TASKS
  function renderTasks() {
    const tasks = state.tasks;
    if (tasks.length === 0) {
      el.tasksTableBody.innerHTML = `<tr><td colspan="6" class="empty-cell">Chưa có bài toán gán nhãn nào được khởi tạo.</td></tr>`;
      return;
    }

    el.tasksTableBody.innerHTML = tasks.map(t => {
      const statusClass = t.status === "OPEN" ? "open" : "completed";
      const breakdown = (t.label_breakdown || []).map(b => `${escapeHtml(b.label)}: <strong>${b.count}</strong>`).join(" · ") || "Chưa có lượt gán";

      return `
        <tr>
          <td>
            <strong>${escapeHtml(t.title)}</strong>
            <div class="text-muted" style="font-size:0.7rem;">Lĩnh vực: ${escapeHtml(t.domain)}</div>
          </td>
          <td>
            <div style="max-width: 320px; white-space: normal;">${escapeHtml(t.question)}</div>
          </td>
          <td><strong class="text-green">+${t.reward_points} pts</strong></td>
          <td>
            <div>Tổng phiếu: <strong>${t.total_submissions || 0}</strong></div>
            <div style="font-size:0.7rem;" class="text-muted">Hợp lệ: ${t.valid_votes || 0}</div>
          </td>
          <td>
            <div style="font-size:0.75rem; color:#c7d2fe;">${breakdown}</div>
          </td>
          <td><span class="status-chip ${statusClass}">${t.status}</span></td>
        </tr>
      `;
    }).join("");
  }

  // 4. RENDER USERS
  function renderUsers() {
    let users = state.users;
    if (state.userQuery) {
      const q = state.userQuery.toLowerCase();
      users = users.filter(u => 
        (u.username && u.username.toLowerCase().includes(q)) || 
        (u.wallet_address && u.wallet_address.toLowerCase().includes(q))
      );
    }

    if (users.length === 0) {
      el.usersTableBody.innerHTML = `<tr><td colspan="6" class="empty-cell">Không tìm thấy thành viên phù hợp.</td></tr>`;
      return;
    }

    el.usersTableBody.innerHTML = users.map(u => {
      const walletShort = u.wallet_address ? `${u.wallet_address.substring(0, 6)}...${u.wallet_address.slice(-4)}` : "Chưa kết nối";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(u.username)}</strong>
            <div class="text-muted" style="font-size:0.7rem;">Role: ${u.role || "student"}</div>
          </td>
          <td><span class="mono-hash">${walletShort}</span></td>
          <td><strong style="color:#fbbf24;">★ ${u.reputation ?? 100}</strong></td>
          <td><strong class="text-green">${(u.unipoints ?? 0).toLocaleString()} UP</strong></td>
          <td>${u.docs_submitted ?? 0} tài liệu</td>
          <td>${u.tasks_completed ?? 0} nhiệm vụ</td>
        </tr>
      `;
    }).join("");
  }

  // 5. RENDER LEDGER & AUDIT
  function renderLedger() {
    const ledger = state.ledger;
    if (ledger.length === 0) {
      el.ledgerTableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">Sổ cái chưa có giao dịch nào được ghi nhận.</td></tr>`;
      return;
    }

    el.ledgerTableBody.innerHTML = ledger.map(entry => {
      const isPositive = entry.amount > 0;
      const amountColor = isPositive ? "text-green" : "text-rose";
      const timeStr = entry.timestamp ? new Date(entry.timestamp * 1000).toLocaleString("vi-VN") : "--";
      const sigShort = entry.solana_signature ? `<a href="https://explorer.solana.com/tx/${entry.solana_signature}?cluster=devnet" target="_blank" class="mono-hash">${entry.solana_signature.substring(0, 10)}...</a>` : `<span class="text-muted">Internal</span>`;

      return `
        <tr>
          <td class="mono-hash">${entry.id.substring(0, 8)}...</td>
          <td>${escapeHtml(entry.username || entry.user_id.substring(0, 8))}</td>
          <td><span class="status-chip open">${entry.tx_type}</span></td>
          <td><strong class="${amountColor}">${isPositive ? "+" : ""}${entry.amount} UP</strong></td>
          <td><strong>${(entry.balance_after ?? 0).toLocaleString()}</strong></td>
          <td>${escapeHtml(entry.memo || "")}</td>
          <td>${sigShort}</td>
          <td>${timeStr}</td>
        </tr>
      `;
    }).join("");
  }

  function renderAudit() {
    const events = state.auditEvents;
    if (events.length === 0) {
      el.auditTableBody.innerHTML = `<tr><td colspan="6" class="empty-cell">Không có sự kiện kiểm toán nào.</td></tr>`;
      return;
    }

    el.auditTableBody.innerHTML = events.map(evt => {
      const timeStr = (evt.created_at || evt.timestamp) ? new Date((evt.created_at || evt.timestamp) * 1000).toLocaleString("vi-VN") : "--";
      return `
        <tr>
          <td class="mono-hash">${evt.id.substring(0, 8)}...</td>
          <td><span class="status-chip completed">${escapeHtml(evt.action || evt.event_type)}</span></td>
          <td>${escapeHtml(evt.entity_id || "--")}</td>
          <td>${escapeHtml(evt.actor_id || "System")}</td>
          <td style="max-width: 300px; white-space: normal; font-size: 0.75rem;">${escapeHtml(evt.details || "")}</td>
          <td>${timeStr}</td>
        </tr>
      `;
    }).join("");
  }

  // GLOBAL ACTIONS FOR DOCUMENT APPROVAL / REJECTION
  window.adminActions = {
    approveDoc: async function(docId) {
      if (!confirm(`Xác nhận phê duyệt tài liệu [${docId}] và phát hành Merkle Proof?`)) return;
      try {
        const res = await adminFetch(`/admin/documents/${docId}/approve`, { method: "POST" });
        showToast("Phê duyệt tài liệu thành công!", "success");
        loadAllData();
      } catch (err) {
        showToast("Lỗi khi duyệt tài liệu: " + err.message, "error");
      }
    },

    openRejectModal: function(docId) {
      state.docToReject = docId;
      el.inputRejectReason.value = "";
      el.modalRejectDoc.classList.remove("hidden");
    }
  };

  // Helper Escape HTML
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Key Modal Handlers
  function openKeyModal(msg = "") {
    el.inputSecurityKey.value = state.adminKey;
    el.inputApiBase.value = state.apiBase;
    if (msg) {
      el.keyValidationResult.textContent = msg;
      el.keyValidationResult.className = "key-status-msg error";
      el.keyValidationResult.classList.remove("hidden");
    } else {
      el.keyValidationResult.classList.add("hidden");
    }
    el.modalSecurityKey.classList.remove("hidden");
  }

  function closeKeyModal() {
    el.modalSecurityKey.classList.add("hidden");
  }

  // EVENT LISTENERS INITIALIZATION
  function initEvents() {
    // Tab switching
    el.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        el.tabButtons.forEach(b => b.classList.remove("active"));
        el.panelSections.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const targetTab = btn.dataset.tab;
        state.activeTab = targetTab;
        const targetPanel = document.getElementById(`panel-${targetTab}`);
        if (targetPanel) targetPanel.classList.add("active");
      });
    });

    // Subtab switching (Ledger / Audit)
    el.subtabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        el.subtabBtns.forEach(b => b.classList.remove("active"));
        el.subtabContents.forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        const targetSub = document.getElementById(`subtab-${btn.dataset.subtab}`);
        if (targetSub) targetSub.classList.add("active");
      });
    });

    // Refresh
    el.btnRefresh.addEventListener("click", loadAllData);

    // Key Config Trigger
    el.keyIndicatorBtn.addEventListener("click", () => openKeyModal());
    el.btnCloseKeyModal.addEventListener("click", closeKeyModal);
    el.btnCancelKeyModal.addEventListener("click", closeKeyModal);

    // Toggle Key Visibility
    el.btnToggleKeyVisibility.addEventListener("click", () => {
      const isPass = el.inputSecurityKey.type === "password";
      el.inputSecurityKey.type = isPass ? "text" : "password";
    });

    // Save Security Key
    el.btnSaveKey.addEventListener("click", async () => {
      const newKey = el.inputSecurityKey.value.trim();
      const newApi = el.inputApiBase.value.trim();

      if (!newKey) {
        alert("Vui lòng nhập ADMIN_SECURITY_KEY");
        return;
      }

      state.adminKey = newKey;
      state.apiBase = newApi || config.DEFAULT_API_BASE;

      localStorage.setItem("wit_admin_security_key", newKey);
      localStorage.setItem("wit_admin_api_base", state.apiBase);

      el.keyValidationResult.textContent = "Đang kiểm tra khóa bảo mật...";
      el.keyValidationResult.className = "key-status-msg";
      el.keyValidationResult.classList.remove("hidden");

      const valid = await verifyCurrentKey();
      if (valid) {
        el.keyValidationResult.textContent = "✓ Khóa bảo mật Hợp lệ! Đang mở bảng điều khiển...";
        el.keyValidationResult.className = "key-status-msg success";
        setTimeout(() => {
          closeKeyModal();
          showToast("Xác thực quản trị viên thành công", "success");
          loadAllData();
        }, 800);
      } else {
        el.keyValidationResult.textContent = "✕ Khóa bảo mật không chính xác (403 Forbidden). Vui lòng kiểm tra lại file backend/.env";
        el.keyValidationResult.className = "key-status-msg error";
      }
    });

    // Document Filter Buttons
    el.docFilterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        el.docFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.docFilter = btn.dataset.filter;
        renderDocuments();
      });
    });

    // Reject Modal Handlers
    el.btnCloseRejectModal.addEventListener("click", () => el.modalRejectDoc.classList.add("hidden"));
    el.btnCancelRejectModal.addEventListener("click", () => el.modalRejectDoc.classList.add("hidden"));
    el.btnConfirmReject.addEventListener("click", async () => {
      const reason = el.inputRejectReason.value.trim();
      if (!reason) {
        alert("Vui lòng nhập lý do từ chối");
        return;
      }
      try {
        await adminFetch(`/admin/documents/${state.docToReject}/reject`, {
          method: "POST",
          body: JSON.stringify({ reason })
        });
        showToast("Đã từ chối tài liệu và thông báo cho tác giả", "success");
        el.modalRejectDoc.classList.add("hidden");
        loadAllData();
      } catch (err) {
        showToast("Lỗi khi từ chối tài liệu: " + err.message, "error");
      }
    });

    // User Search Input
    el.userSearchInput.addEventListener("input", (e) => {
      state.userQuery = e.target.value.trim();
      renderUsers();
    });

    // Create Task Modal Handlers
    el.btnOpenCreateTaskModal.addEventListener("click", () => {
      el.modalCreateTask.classList.remove("hidden");
    });
    el.btnCloseCreateTaskModal.addEventListener("click", () => el.modalCreateTask.classList.add("hidden"));
    el.btnCancelCreateTaskModal.addEventListener("click", () => el.modalCreateTask.classList.add("hidden"));

    el.btnSubmitCreateTask.addEventListener("click", async () => {
      const title = el.taskTitle.value.trim();
      const domain = el.taskDomain.value;
      const context_snippet = el.taskContext.value.trim();
      const question = el.taskQuestion.value.trim();
      const optionsRaw = el.taskOptions.value.trim();
      const gold_label = el.taskGoldLabel.value.trim();
      const reward_points = parseInt(el.taskPoints.value) || 15;

      if (!title || !context_snippet || !question || !optionsRaw) {
        alert("Vui lòng điền đầy đủ các thông tin bài toán bắt buộc.");
        return;
      }

      const options = optionsRaw.split(",").map(s => s.trim()).filter(Boolean);

      try {
        await adminFetch("/admin/tasks", {
          method: "POST",
          body: JSON.stringify({
            title,
            domain,
            context_snippet,
            question,
            options,
            gold_label: gold_label || undefined,
            reward_points
          })
        });

        showToast("Tạo bài toán gán nhãn thành công!", "success");
        el.modalCreateTask.classList.add("hidden");
        // Reset form
        el.taskTitle.value = "";
        el.taskContext.value = "";
        el.taskQuestion.value = "";
        el.taskGoldLabel.value = "";
        loadAllData();
      } catch (err) {
        showToast("Lỗi khi tạo bài toán: " + err.message, "error");
      }
    });
  }

  // Bootstrap
  document.addEventListener("DOMContentLoaded", () => {
    initEvents();
    loadAllData();
  });
})();
