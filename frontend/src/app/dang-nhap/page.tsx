"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api.login(String(data.get("username") || ""), String(data.get("password") || ""));
      await api.getMe();
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đăng nhập.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="client-shell">
      <div className="client-container">
        <section className="client-hero">
          <div className="hero-copy">
            <Link href="/">← Trang chủ</Link>
            <p className="eyebrow">UNISYNAPSE · MEMBER ACCESS</p>
            <h1>Chào mừng<br /><em>quay trở lại.</em></h1>
            <p>Đăng nhập để xem UniPoints, nhiệm vụ và AI Tutor từ đúng tài khoản của bạn.</p>
            <form onSubmit={submit} id="login-form">
              <p>
                <label htmlFor="login-username">Tên tài khoản</label><br />
                <input id="login-username" name="username" required autoComplete="username" />
              </p>
              <p>
                <label htmlFor="login-password">Mật khẩu</label><br />
                <input id="login-password" name="password" type="password" required autoComplete="current-password" />
              </p>
              {error && <p role="alert">{error}</p>}
              <button id="login-submit" className="primary-action" disabled={busy}>
                {busy ? "Đang đăng nhập…" : "Đăng nhập →"}
              </button>
            </form>
            <p className="note">Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
