"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

function translateRegisterError(cause: unknown): string {
  const raw = cause instanceof Error ? cause.message : String(cause || "");
  if (raw.includes("Tên tài khoản đã được sử dụng") || raw.includes("409")) return "Tên tài khoản đã tồn tại. Vui lòng chọn tên khác hoặc đăng nhập.";
  if (raw.includes("Mật khẩu") || raw.includes("14")) return "Mật khẩu cần tối thiểu 14 ký tự để đảm bảo an toàn.";
  if (raw.includes("500") || raw.includes("Failed to fetch")) return "Máy chủ chưa sẵn sàng. Hãy chắc rằng backend local đang chạy rồi thử lại.";
  return raw || "Không thể tạo tài khoản. Vui lòng thử lại.";
}

function AuthVisual() {
  return (
    <section className="preview-auth-visual">
      <Link href="/" className="preview-auth-back">← Quay về trang chủ</Link>
      <div className="preview-auth-brand"><Image src="/unisynapse-logo.jpg" alt="UniSynapse" width={48} height={48} priority /><div><strong>UniSynapse <b>v1.0</b></strong><span>Mạng lưới tri thức học thuật</span></div></div>
      <div className="preview-auth-copy"><span className="preview-auth-kicker"><i /> HỌC TẬP CÙNG NHAU · XÁC MINH MỌI ĐIỀU</span><h1>Bắt đầu hành trình<br /><em>tri thức của bạn.</em></h1><p>Tạo tài khoản để đóng góp dữ liệu, tích lũy UniPoints và xây dựng những câu trả lời học thuật đáng tin cậy cùng cộng đồng.</p><div className="preview-auth-proof"><span><b>01</b><small>Danh tính<br />của bạn</small></span><span><b>02</b><small>Đóng góp<br />được ghi nhận</small></span><span><b>03</b><small>Tri thức<br />được xác minh</small></span></div></div>
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
        <span className="preview-auth-chip chip-a">+50 UP</span>
        <span className="preview-auth-chip chip-b">VERIFIED</span>
      </div>
      <div className="preview-auth-visual-footer"><span><i /> Hệ thống đang hoạt động</span><span>Solana Devnet · Local Preview</span></div>
    </section>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { refreshState } = useAppState();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const username = String(data.get("username") || "").trim();
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password !== confirm) { setError("Mật khẩu xác nhận không khớp."); return; }
    if (password.length < 6) { setError("Mật khẩu phải chứa ít nhất 6 ký tự."); return; }
    setBusy(true); setError("");
    try {
      await api.register(username, password);
      setSuccess(true);
      try { await refreshState(); } catch {}
      router.push("/");
    } catch (cause) {
      setError(translateRegisterError(cause)); setBusy(false); setSuccess(false);
    }
  }

  return (
    <main className="preview-auth-shell">
      <AuthVisual />
      <section className="preview-auth-panel">
        <div className="preview-auth-panel-inner">
          <div className="preview-auth-panel-heading">
            <span className="preview-auth-panel-label">MEMBER ACCESS · 01</span>
            <h2>Tạo tài khoản</h2>
            <p>Bắt đầu xây dựng dấu vết tri thức của riêng bạn.</p>
          </div>

          <form onSubmit={submit} id="registration-form" className="preview-auth-form">
            <div className="preview-auth-field">
              <label htmlFor="register-username">Tên tài khoản</label>
              <span>3–32 ký tự · không dấu</span>
              <input
                id="register-username"
                name="username"
                required
                minLength={3}
                maxLength={32}
                pattern="[A-Za-z0-9_]{3,32}"
                placeholder="Ví dụ: nguyen_van_a"
                autoComplete="username"
              />
            </div>
            <div className="preview-auth-field">
              <label htmlFor="register-password">Mật khẩu</label>
              <span>Tối thiểu 6 ký tự</span>
              <input
                id="register-password"
                name="password"
                type="password"
                required
                minLength={6}
                maxLength={128}
                placeholder="Nhập mật khẩu an toàn"
                autoComplete="new-password"
              />
            </div>
            <div className="preview-auth-field">
              <label htmlFor="register-confirm">Xác nhận mật khẩu</label>
              <span>Nhập lại chính xác</span>
              <input
                id="register-confirm"
                name="confirm"
                type="password"
                required
                minLength={6}
                maxLength={128}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </div>
            {error && <p className="preview-auth-error" role="alert">{error}</p>}
            <button id="register-submit" type="submit" className="preview-auth-submit" disabled={busy}>
              {busy ? "Đang tạo tài khoản…" : success ? "Đăng ký thành công…" : "Tạo tài khoản ↗"}
            </button>
            <p className="preview-auth-terms">
              Bằng việc tiếp tục, bạn đồng ý với nguyên tắc đóng góp tri thức có nguồn và có kiểm chứng.
            </p>
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
              title="Đăng ký / Liên kết bằng Open Campus ID (Hệ sinh thái Corelia & EduChain)"
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
              title="Liên kết ví Phantom trên mạng Solana Devnet"
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
                router.push("/dang-nhap");
              }}
              title="Đăng nhập nhanh bằng Campus Student SSO"
            >
              <div className="preview-auth-sso-left">
                <span className="preview-auth-sso-icon">🏛️</span>
                <span>Campus Student SSO</span>
              </div>
              <span className="preview-auth-sso-tag campus">1-Click Demo</span>
            </button>
          </div>

          <div className="preview-auth-switch">
            Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập ngay →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}