"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

function translateRegisterError(cause: unknown): string {
  const raw = cause instanceof Error ? cause.message : String(cause || "");
  if (raw.includes("Tên tài khoản đã được sử dụng") || raw.includes("409")) {
    return "Tên tài khoản đã tồn tại. Vui lòng chọn tên khác hoặc đăng nhập.";
  }
  if (raw.includes("Mật khẩu") || raw.includes("14")) {
    return "Mật khẩu cần tối thiểu 14 ký tự để đảm bảo an toàn.";
  }
  return raw || "Không thể tạo tài khoản. Vui lòng thử lại.";
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

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 14) {
      setError("Mật khẩu phải chứa ít nhất 14 ký tự.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await api.register(username, password);
      setSuccess(true);
      try {
        await refreshState();
      } catch {}
      router.push("/");
    } catch (cause) {
      setError(translateRegisterError(cause));
      setBusy(false);
      setSuccess(false);
    }
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
              <p className="eyebrow" style={{ margin: 0 }}>UNISYNAPSE · TÀI KHOẢN SINH VIÊN</p>
            </div>
            <h1>Bắt đầu hành trình<br /><em>tri thức của bạn.</em></h1>
            <p>Tạo tài khoản cá nhân. Dữ liệu và điểm đóng góp sẽ được lưu trữ an toàn.</p>

            <form onSubmit={submit} id="registration-form">
              <p>
                <label htmlFor="register-username">Tên tài khoản (3–32 ký tự, không dấu)</label><br />
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
              </p>
              <p>
                <label htmlFor="register-password">Mật khẩu (tối thiểu 14 ký tự)</label><br />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  minLength={14}
                  maxLength={128}
                  placeholder="Nhập ít nhất 14 ký tự..."
                  autoComplete="new-password"
                />
              </p>
              <p>
                <label htmlFor="register-confirm">Nhập lại mật khẩu</label><br />
                <input
                  id="register-confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={14}
                  maxLength={128}
                  placeholder="Nhập lại mật khẩu trên..."
                  autoComplete="new-password"
                />
              </p>
              {error && <p role="alert" style={{ color: "#ef4444", fontSize: "0.875rem" }}>{error}</p>}
              <button id="register-submit" type="submit" className="primary-action" disabled={busy}>
                {busy ? "Đang tạo tài khoản…" : success ? "Đăng ký thành công! Đang vào hệ thống…" : "Tạo tài khoản →"}
              </button>
            </form>

            <p className="note" style={{ marginTop: "1rem" }}>
              Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập ngay</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
