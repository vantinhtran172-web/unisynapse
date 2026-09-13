const API_BASE = typeof window !== "undefined" 
  ? "/api/v1" 
  : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1");

export interface UserProfile {
  id: string;
  address: string;
  username: string;
  unipoints: number;
  reputation: number;
  role: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: string;
  input_text: string;
  labels: string[];
  required_votes: number;
  consensus_threshold: number;
  reward_points: number;
  status: string;
  consensus?: string;
  user_submitted?: boolean;
  user_label?: string;
}

export interface PeerVote {
  username: string;
  label: string;
}

export interface TaskSubmissionResult {
  success: boolean;
  task_id: string;
  label: string;
  finalized: boolean;
  consensus_winner?: string;
  confidence: number;
  votes_count: number;
  required_votes: number;
  peer_votes: PeerVote[];
  user_rewarded: boolean;
  reward_points: number;
  is_gold_correct: boolean;
}


export interface DocumentItem {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  size_bytes: number;
  checksum: string;
  status: 'pending_review' | 'approved' | 'rejected';
  quality_check?: string;
  rejection_reason?: string;
  chunk_count: number;
  created_at: number;
  approved_at?: number;
}

export interface Citation {
  document_id: string;
  document_name: string;
  page: string;
  chunk_index: number;
  score: number;
  excerpt: string;
}

export interface TutorResponse {
  answer: string;
  citations: Citation[];
  grounded: boolean;
  engine?: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  delta: number;
  reason: string;
  source_type: string;
  source_id: string;
  proof_status: string;
  solana_signature?: string;
  proof_hash: string;
  created_at: number;
  explorer_url?: string;
}

export const api = {
  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
    return res.json();
  },

  async connectWallet(publicKey: string, signature?: string, message?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/connect-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ publicKey, signature, message }),
    });
    return res.json();
  },

  async getOpenTasks(): Promise<TaskItem[]> {
    const res = await fetch(`${API_BASE}/tasks/open`, { credentials: "include" });
    return res.json();
  },

  async submitTask(taskId: string, label: string): Promise<TaskSubmissionResult> {
    const res = await fetch(`${API_BASE}/tasks/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ taskId, label }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Lỗi khi gửi nhãn");
    }
    return res.json();
  },


  async uploadDocument(file: File, permissionConfirmed = true): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("permission_confirmed", permissionConfirmed ? "true" : "false");

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Không thể tải lên tài liệu");
    }
    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/documents`, { credentials: "include" });
    return res.json();
  },

  async askTutor(question: string, apiKey?: string, model?: string): Promise<TutorResponse> {
    const res = await fetch(`${API_BASE}/tutor/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question, apiKey, model }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Lỗi khi gọi AI Tutor");
    }
    return res.json();
  },

  async getKnowledgeBase(): Promise<any> {
    const res = await fetch(`${API_BASE}/tutor/knowledge-base`);
    return res.json();
  },

  async getLedger(): Promise<LedgerEntry[]> {
    const res = await fetch(`${API_BASE}/rewards/ledger`, { credentials: "include" });
    return res.json();
  },

  async getRewardsSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/rewards/summary`, { credentials: "include" });
    return res.json();
  },

  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, { credentials: "include" });
    return res.json();
  },

  // Admin Portal APIs
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, { credentials: "include" });
    if (!res.ok) throw new Error("Không thể tải thống kê hệ thống");
    return res.json();
  },

  async getAdminDocuments(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/documents`, { credentials: "include" });
    if (!res.ok) throw new Error("Không thể tải danh sách tài liệu kiểm duyệt");
    return res.json();
  },

  async approveDocument(docId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/documents/${docId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Lỗi khi phê duyệt tài liệu");
    }
    return res.json();
  },

  async rejectDocument(docId: string, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/documents/${docId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Lỗi khi từ chối tài liệu");
    }
    return res.json();
  },

  async getAdminTasks(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/tasks`, { credentials: "include" });
    if (!res.ok) throw new Error("Không thể tải danh sách bài toán");
    return res.json();
  },

  async createAdminTask(taskData: {
    title: string;
    domain: string;
    context_snippet: string;
    question: string;
    options: string[];
    gold_label?: string;
    reward_points?: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(taskData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Lỗi khi tạo bài toán gán nhãn");
    }
    return res.json();
  },

  async getAdminUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/users`, { credentials: "include" });
    if (!res.ok) throw new Error("Không thể tải danh sách thành viên");
    return res.json();
  },

  async getAdminLedger(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/ledger`, { credentials: "include" });
    if (!res.ok) throw new Error("Không thể tải sổ cái hệ thống");
    return res.json();
  },

  async getAdminAuditEvents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/audit-events`, { credentials: "include" });
    if (!res.ok) throw new Error("Không thể tải nhật ký kiểm toán");
    return res.json();
  }
};

