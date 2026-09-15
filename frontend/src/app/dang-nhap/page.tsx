"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function translateError(cause: unknown): string {
  const raw = cause instanceof Error ? cause.message : String(cause || "");
  if (raw.includes("Invalid member credentials")) {
    return "Tên tài khoản hoặc mật khẩu không chính xác. Bạn có thể sử dụng nút Đăng nhập Demo bên dưới.";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function performLogin(user: string, pass: string) {
    setBusy(true);
    setError("");
    try {
      await api.login(user, pass);
      await api.getMe();
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(translateError(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    await performLogin(username, password);
  }

  async function handleDemoLogin() {
    if (busy) return;
    setUsername("sinhvien_demo");
    setPassword("UniSynapse@2026");
    await performLogin("sinhvien_demo", "UniSynapse@2026");
  }

  return (
    <main className="client-shell">
      <div className="client-container">
        <section className="client-hero">
          <div className="hero-copy">
            <Link href="/">← Trang chủ</Link>
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
                  placeholder="Ví dụ: sinhvien_demo"
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
              <button id="login-submit" className="primary-action" disabled={busy}>
                {busy ? "Đang đăng nhập…" : "Đăng nhập →"}
              </button>
            </form>

            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(6, 182, 212, 0.08)",
              borderRadius: "0.75rem",
              border: "1px solid rgba(6, 182, 212, 0.25)"
            }}>
              <p style={{ margin: "0 0 0.35rem 0", fontWeight: 600, fontSize: "0.875rem", color: "#38bdf8" }}>
                💡 Tài khoản mẫu dùng thử (Demo):
              </p>
              <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8125rem", color: "#94a3b8" }}>
                Tài khoản: <strong style={{ color: "#f8fafc" }}>sinhvien_demo</strong> · Mật khẩu: <strong style={{ color: "#f8fafc" }}>UniSynapse@2026</strong>
              </p>
              <button
                type="button"
                className="secondary-action"
                disabled={busy}
                onClick={handleDemoLogin}
                style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem" }}
              >
                ⚡ 1-Click: Đăng nhập tài khoản Demo
              </button>
            </div>

            <p className="note" style={{ marginTop: "1rem" }}>
              Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản mới</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
