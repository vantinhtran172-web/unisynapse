const configuredApiBase = (process.env.API_UPSTREAM_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const API_BASE = typeof window !== "undefined"
  ? "/api/v1"
  : (configuredApiBase.endsWith("/api/v1") ? configuredApiBase : `${configuredApiBase}/api/v1`);

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function csrfHeaders(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((part) => part.startsWith("unisynapse_csrf="))
    ?.split("=")[1];
  return token ? { "X-CSRF-Token": decodeURIComponent(token) } : {};
}

async function parseErrorResponse(response: Response): Promise<{ payload: unknown; text: string }> {
  const text = await response.text();
  if (!text.trim()) return { payload: null, text: "" };
  try {
    return { payload: JSON.parse(text), text };
  } catch {
    // Proxy/upstream có thể trả HTML hoặc plain text thay vì JSON.
    const compact = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return { payload: null, text: compact.slice(0, 300) };
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  Object.entries(csrfHeaders()).forEach(([key, value]) => headers.set(key, value));
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload && typeof payload === "object" && "detail" in payload
      ? String(payload.detail)
      : `Request failed (${response.status})`;
    throw new ApiError(response.status, detail);
  }
  return payload as T;
}

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
  domain?: string;
  input_text: string;
  context_snippet?: string;
  labels: string[];
  required_votes: number;
  consensus_threshold: number;
  reward_points: number;
  status: string;
  total_submissions?: number;
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
  points_cost?: number;
  points_debited?: boolean;
  source_type?: string;
  source_label?: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  delta: number;
  reason: string;
  source_type: string;
  source_id: string;
  proof_status: "unsubmitted" | "processing" | "submitted" | "retryable" | "failed" | "verified" | string;
  solana_signature?: string | null;
  proof_hash: string;
  proof_attempts?: number;
  proof_last_error?: string;
  proof_submitted_at?: number;
  proof_verified_at?: number;
  proof_next_retry_at?: number;
  created_at: number;
  explorer_url?: string | null;
  verification_reason?: string;
}

export interface WalletChallengeResponse {
  nonce: string;
  message: string;
  expires_at: number;
}

export interface ApiUserResponse {
  authenticated: boolean;
  user?: UserProfile;
  id?: string;
  username?: string;
  role?: string;
  address?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  document_id: string;
  filename: string;
  status: string;
  chunk_count: number;
  reward_points: number;
  reputation_gain: number;
  solana_signature?: string;
  explorer_url?: string;
  steps: Record<string, string>;
}

export interface KnowledgeBaseResponse {
  [key: string]: unknown;
}

export interface RewardsSummary {
  unipoints: number;
  reputation: number;
  total_transactions: number;
  total_earned: number;
}

export const api = {
  economy: () => request<{treasury:string;network:string;chat_cost:number;points_per_sol:number;deposits_enabled:boolean}>("/rewards/economy"),
  createDeposit: () => request<{intent_id:string;memo:string;treasury:string}>("/rewards/deposit-intent", {method:"POST"}),
  verifyDeposit: (intent_id:string, signature:string) => request<{credited:number}>("/rewards/deposit-verify", {method:"POST",body:JSON.stringify({intent_id,signature})}),
  recoverDeposit: (signature:string) => request<{credited:number}>("/rewards/deposit-recover", {method:"POST",body:JSON.stringify({signature})}),
  syncDeposits: () => request<{credited:number;count:number;transactions:Array<{signature:string;points:number;lamports:number}>}>("/rewards/deposit-sync", {method:"POST"}),
  register: (username: string, password: string) =>
    request<{ authenticated: boolean; id: string; username: string; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ authenticated: boolean; id: string; username: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () =>
    request<{ authenticated: false }>("/auth/logout", { method: "POST" }),
  async getMe(): Promise<UserProfile> {
    const profile = await request<UserProfile>("/auth/me");
    if (!profile || typeof profile.id !== "string" ||
        typeof profile.username !== "string" || typeof profile.role !== "string" ||
        typeof profile.unipoints !== "number" || !Number.isFinite(profile.unipoints) ||
        typeof profile.reputation !== "number" || !Number.isFinite(profile.reputation)) {
      throw new Error("Hồ sơ trả về không hợp lệ. Không thể xác định số dư điểm.");
    }
    return { ...profile, address: typeof profile.address === "string" ? profile.address : "" };
  },

  async challengeWallet(publicKey: string): Promise<WalletChallengeResponse> {
    const res = await fetch(`${API_BASE}/auth/wallet/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      credentials: "include",
      body: JSON.stringify({ publicKey }),
    });
    if (!res.ok) {
      const { payload, text } = await parseErrorResponse(res);
      const detail = payload && typeof payload === "object" && "detail" in payload
        ? String(payload.detail)
        : text || `Không thể tạo wallet challenge (${res.status})`;
      throw new ApiError(res.status, detail);
    }
    return res.json();
  },

  async verifyWallet(publicKey: string, nonce: string, message: string, signature: string): Promise<ApiUserResponse> {
    const res = await fetch(`${API_BASE}/auth/wallet/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      credentials: "include",
      body: JSON.stringify({ publicKey, nonce, message, signature }),
    });
    if (!res.ok) {
      const { payload, text } = await parseErrorResponse(res);
      const detail = payload && typeof payload === "object" && "detail" in payload
        ? String(payload.detail)
        : text || `Xác thực wallet thất bại (${res.status})`;
      throw new ApiError(res.status, detail);
    }
    return res.json();
  },

  async unlinkWallet(): Promise<{ authenticated: boolean; unlinked: boolean }> {
    const res = await fetch(`${API_BASE}/auth/wallet/unlink`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      credentials: "include",
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Không thể hủy liên kết ví");
    return res.json();
  },

  async getOpenTasks(): Promise<TaskItem[]> {
    const res = await fetch(`${API_BASE}/tasks/open`, { credentials: "include" });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      const detail = payload && typeof payload === "object" && "detail" in payload
        ? String(payload.detail)
        : `Không thể tải nhiệm vụ (${res.status})`;
      throw new Error(detail);
    }
    if (Array.isArray(payload)) return payload as TaskItem[];
    if (payload && typeof payload === "object" && Array.isArray((payload as { tasks?: unknown }).tasks)) {
      return (payload as { tasks: TaskItem[] }).tasks;
    }
    throw new Error("Dữ liệu nhiệm vụ từ máy chủ không hợp lệ.");
  },

  async submitTask(taskId: string, label: string): Promise<TaskSubmissionResult> {
    const res = await fetch(`${API_BASE}/tasks/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      credentials: "include",
      body: JSON.stringify({ taskId, label }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Lỗi khi gửi nhãn");
    }
    return res.json();
  },


  async uploadDocument(file: File, permissionConfirmed = true): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("permission_confirmed", permissionConfirmed ? "true" : "false");

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      headers: csrfHeaders(),
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
    const payload = await request<unknown>("/documents");
    if (!Array.isArray(payload)) throw new Error("Dữ liệu tài liệu không hợp lệ.");
    return payload as DocumentItem[];
  },

  async askTutor(question: string, model?: string): Promise<TutorResponse> {
    const res = await fetch(`${API_BASE}/tutor/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      credentials: "include",
      body: JSON.stringify({ question, model, request_id: crypto.randomUUID() }),
    });
    if (!res.ok) {
      const { payload, text } = await parseErrorResponse(res);
      const detail = payload && typeof payload === "object" && "detail" in payload
        ? String(payload.detail)
        : text || `Lỗi khi gọi AI Tutor (${res.status})`;
      throw new ApiError(res.status, detail);
    }
    return res.json();
  },

  async getKnowledgeBase(): Promise<KnowledgeBaseResponse> {
    const res = await fetch(`${API_BASE}/tutor/knowledge-base`);
    return res.json();
  },

  async getLedger(): Promise<LedgerEntry[]> {
    return request<LedgerEntry[]>("/rewards/ledger");
  },

  async getRewardsSummary(): Promise<RewardsSummary> {
    return request<RewardsSummary>("/rewards/summary");
  }
};

