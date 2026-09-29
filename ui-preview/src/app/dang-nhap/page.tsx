"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

function translateError(cause: unknown): string {
  const raw = cause instanceof Error ? cause.message : String(cause || "");
  if (raw.includes("Invalid member credentials")) return "Tên tài khoản hoặc mật khẩu không chính xác.";
  if (raw.includes("Too many login attempts")) return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi trong giây lát.";
  if (raw.includes("401") || raw.includes("Unauthorized")) return "Xác thực thất bại. Vui lòng kiểm tra lại thông tin.";
  if (raw.includes("500") || raw.includes("Failed to fetch")) return "Máy chủ chưa sẵn sàng. Hãy chắc rằng backend local đang chạy.";
  return raw || "Không thể đăng nhập.";
}

function AuthVisual() {
  return (
    <section className="preview-auth-visual">
      <Link href="/" className="preview-auth-back">← Quay về trang chủ</Link>
      <div className="preview-auth-brand"><Image src="/unisynapse-logo.jpg" alt="UniSynapse" width={48} height={48} priority /><div><strong>UniSynapse <b>v1.0</b></strong><span>Mạng lưới tri thức học thuật</span></div></div>
      <div className="preview-auth-copy"><span className="preview-auth-kicker"><i /> KHÔNG GIAN HỌC TẬP CỦA BẠN</span><h1>Chào mừng<br /><em>quay trở lại.</em></h1><p>Đăng nhập để tiếp tục đóng góp, theo dõi UniPoints và hỏi AI Tutor từ đúng tài khoản của bạn.</p><div className="preview-auth-proof"><span><b>01</b><small>Tài khoản<br />được bảo vệ</small></span><span><b>02</b><small>Nhiệm vụ<br />cá nhân hóa</small></span><span><b>03</b><small>Proof<br />minh bạch</small></span></div></div>
      <div className="preview-auth-orbit" aria-hidden="true">
        <div className="preview-auth-ring ring-a" />
        <div className="preview-auth-ring ring-b" />
        <div className="preview-auth-ring ring-c" />
        <div className="preview-auth-core">
          <Image src="/unisynapse-logo.jpg" alt="" width={76} height={76} />
        </div>
        <span className="preview-auth-node node-a">AI</span>
        <span className="preview-auth-node node-b">✓</span>
        <span className="preview-auth-node node-c">◈</span>
        <span className="preview-auth-chip chip-a">SYNCED</span>
        <span className="preview-auth-chip chip-b">+80 UP</span>
      </div>
      <div className="preview-auth-visual-footer"><span><i /> Hệ thống đang hoạt động</span><span>Solana Devnet · Local Preview</span></div>
    </section>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { refreshState } = useAppState();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function performLogin(user: string, pass: string) {
    setBusy(true); setError("");
    try {
      await api.login(user, pass); await api.getMe(); setSuccess(true);
      try { await refreshState(); } catch {}
      router.push("/");
    } catch (cause) { setError(translateError(cause)); setBusy(false); setSuccess(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!busy) await performLogin(username, password); }

  return (
    <main className="preview-auth-shell">
      <AuthVisual />
      <section className="preview-auth-panel">
        <div className="preview-auth-panel-inner">
          <div className="preview-auth-panel-heading">
            <span className="preview-auth-panel-label">MEMBER ACCESS · 02</span>
            <h2>Đăng nhập</h2>
            <p>Kết nối với không gian đóng góp tri thức của bạn.</p>
          </div>

          <form onSubmit={submit} id="login-form" className="preview-auth-form">
            <div className="preview-auth-field">
              <label htmlFor="login-username">Tên tài khoản</label>
              <span>Tài khoản UniSynapse</span>
              <input
                id="login-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản"
                required
                autoComplete="username"
              />
            </div>
            <div className="preview-auth-field">
              <label htmlFor="login-password">Mật khẩu</label>
              <span>Bảo mật phiên đăng nhập</span>
              <input
                id="login-password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="preview-auth-error" role="alert">{error}</p>}
            <button id="login-submit" type="submit" className="preview-auth-submit" disabled={busy}>
              {busy ? "Đang xác thực…" : success ? "Đăng nhập thành công…" : "Đăng nhập ↗"}
            </button>
          </form>

          <div className="preview-auth-divider">
            <span>HOẶC TIẾP TỤC VỚI</span>
          </div>

          <div className="preview-auth-sso-grid">
            <button
              type="button"
              className="preview-auth-sso-btn"
              onClick={() => {
                setError("");
                alert("Đang chuẩn bị xác thực Open Campus ID (OCID) qua mạng EduChain & Corelia...");
              }}
              title="Đăng nhập bằng Open Campus ID (Hệ sinh thái Corelia & EduChain)"
            >
              <div className="preview-auth-sso-left">
                <span className="preview-auth-sso-icon">🎓</span>
                <span>Open Campus ID</span>
              </div>
              <span className="preview-auth-sso-tag ocid">OCID · EduChain</span>
            </button>

            <button
              type="button"
              className="preview-auth-sso-btn"
              onClick={() => {
                setError("");
                router.push("/vi");
              }}
              title="Kết nối ví Phantom trên mạng Solana Devnet"
            >
              <div className="preview-auth-sso-left">
                <span className="preview-auth-sso-icon">🟣</span>
                <span>Ví Phantom</span>
              </div>
              <span className="preview-auth-sso-tag solana">Solana Devnet</span>
            </button>

            <button
              type="button"
              className="preview-auth-sso-btn"
              onClick={() => {
                setError("");
                performLogin("demo_student", "DemoStudent@2026!Sec");
              }}
              title="Đăng nhập 1-Click bằng tài khoản Sinh viên Demo để trải nghiệm ngay"
            >
              <div className="preview-auth-sso-left">
                <span className="preview-auth-sso-icon">🏛️</span>
                <span>Campus Student SSO</span>
              </div>
              <span className="preview-auth-sso-tag campus">1-Click Demo</span>
            </button>
          </div>

          <div className="preview-auth-switch">
            Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản mới →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}