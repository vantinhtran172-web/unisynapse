"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import ThemeToggle from "@/components/ThemeToggle";

function translateError(cause: unknown): string {
  const raw = cause instanceof Error ? cause.message : String(cause || "");
  if (raw.includes("Invalid member credentials")) {
    return "Tên tài khoản hoặc mật khẩu không chính xác. Bạn có thể bấm nút Đăng nhập Demo 1-Click bên dưới.";
  }
  if (raw.includes("Too many login attempts")) {
    return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi trong giây lát rồi thử lại.";
  }
  if (raw.includes("401") || raw.includes("Unauthorized")) {
    return "Xác thực thất bại. Vui lòng kiểm tra lại thông tin.";
  }
  return raw || "Không thể đăng nhập.";
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
    setBusy(true);
    setError("");
    try {
      await api.login(user, pass);
      await api.getMe();
      setSuccess(true);
      try {
        await refreshState();
      } catch {
        // Proceed with navigation
      }
      router.push("/");
    } catch (cause) {
      setError(translateError(cause));
      setBusy(false);
      setSuccess(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    await performLogin(username, password);
  }

  return (
    <main className="client-shell">
      <div className="client-container">
        <section className="client-hero">
          <div className="hero-copy">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <Link href="/" style={{ color: "#d7f4df", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>← Trang chủ</Link>
              <ThemeToggle compact />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0 0.5rem 0" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #22d3ee, #2563eb, #4f46e5)",
                padding: "1px",
                boxShadow: "0 0 15px rgba(0,240,255,0.25)"
              }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "#030712",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  color: "#22d3ee",
                  fontSize: "11px",
                  letterSpacing: "-0.5px"
                }}>
                  WIT
                </div>
              </div>
              <p className="eyebrow" style={{ margin: 0 }}>UNISYNAPSE · MEMBER ACCESS</p>
            </div>
            <h1>Chào mừng<br /><em>quay trở lại.</em></h1>
            <p>Đăng nhập để xem UniPoints, nhiệm vụ và AI Tutor từ đúng tài khoản của bạn.</p>

            <form onSubmit={submit} id="login-form">
              <p>
                <label htmlFor="login-username">Tên tài khoản</label><br />
                <input
                  id="login-username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản"
                  required
                  autoComplete="username"
                />
              </p>
              <p>
                <label htmlFor="login-password">Mật khẩu</label><br />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </p>
              {error && <p role="alert" style={{ color: "#ef4444", fontSize: "0.875rem" }}>{error}</p>}
              <button id="login-submit" type="submit" className="primary-action" disabled={busy}>
                {busy ? "Đang xác thực và đăng nhập…" : success ? "Đăng nhập thành công! Đang vào hệ thống…" : "Đăng nhập →"}
              </button>
            </form>

            <p className="note" style={{ marginTop: "1.5rem" }}>
              Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản mới</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
