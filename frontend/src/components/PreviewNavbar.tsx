"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAppState } from "../context/AppStateContext";
import { api } from "../lib/api";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { id: "dashboard", label: "Tổng quan", icon: "▦" },
  { id: "labeling", label: "Gán nhãn", icon: "◇" },
  { id: "upload", label: "Góp tài liệu", icon: "⇧" },
  { id: "tutor", label: "AI Tutor", icon: "✦" },
  { id: "ledger", label: "Solana", icon: "⬡" },
];

export default function PreviewNavbar() {
  const router = useRouter();
  const { wallet, connect, disconnect, connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { activeTab, setActiveTab, user, refreshState } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("menu") === "1" || params.get("menu") === "open") {
        setMobileOpen(true);
      }
    }
    const close = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      router.push(`/?tab=${id}`);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleWallet = () => {
    if (!user) {
      if (window.confirm("Bạn cần đăng nhập tài khoản trước khi liên kết ví Phantom. Đến trang đăng nhập?")) {
        router.push("/dang-nhap");
      }
      return;
    }
    if (connected) disconnect();
    else if (wallet) void connect().catch(() => undefined);
    else setVisible(true);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      await refreshState();
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header className="preview-nav-wrap">
        <div className="preview-nav">
          <button type="button" className="preview-brand" onClick={() => selectTab("dashboard")} aria-label="Về tổng quan">
            <Image src="/unisynapse-logo.jpg" alt="UniSynapse" width={34} height={34} priority />
            <span>
              <strong>
                UniSynapse <b>v1.0</b>
              </strong>
              <span>Mạng lưới tri thức học thuật</span>
            </span>
          </button>
          <nav className="preview-tabs" aria-label="Điều hướng chính">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? "active" : ""}
                onClick={() => selectTab(item.id)}
              >
                <i aria-hidden="true">{item.icon}</i>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="preview-actions">
            <ThemeToggle compact className="preview-nav-theme-toggle" />
            <Link
              href="/vi"
              className="preview-points preview-points-link"
              title="Xem số dư & Nạp SOL đổi UniPoints"
            >
              ★ {user ? user.unipoints.toLocaleString("vi-VN") : "—"} UP
              <span className="preview-points-add">+ Nạp</span>
            </Link>
            <Link
              id="preview-nav-sol"
              href="/vi"
              className="preview-sol-btn"
              title="Đổi SOL thành UniPoints trên Solana Devnet"
            >
              <span className="preview-sol-icon">⚡</span>
              <span>Đổi SOL</span>
            </Link>
            {user ? (
              <button type="button" className="preview-ghost preview-user" onClick={() => void logout()} title="Đăng xuất">
                {user.username} · Thoát
              </button>
            ) : (
              <Link className="preview-ghost" href="/dang-nhap">
                Đăng nhập
              </Link>
            )}
            {!user && (
              <Link className="preview-primary preview-register" href="/dang-ky">
                Đăng ký
              </Link>
            )}
            {user ? (
              <button
                type="button"
                className="preview-mobile-top-auth preview-mobile-top-logout"
                onClick={() => void logout()}
                title="Đăng xuất tài khoản"
              >
                Thoát
              </button>
            ) : (
              <Link
                className="preview-mobile-top-auth preview-mobile-top-login"
                href="/dang-nhap"
                title="Đăng nhập tài khoản"
              >
                Đăng nhập
              </Link>
            )}
            <button
              id="preview-wallet-button"
              type="button"
              className="preview-phantom"
              onClick={handleWallet}
              title={!user ? "Cần đăng nhập để liên kết ví" : "Kết nối hoặc ngắt kết nối Phantom"}
            >
              <i aria-hidden="true" />
              {connected && publicKey
                ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`
                : "Ví Phantom"}
            </button>
            <button
              type="button"
              className="preview-menu-button"
              onClick={() => setMobileOpen((value) => !value)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="preview-subnav-bar">
          <div className="preview-subnav-inner">
            <span>
              <b className="online">●</b> Trạng thái mạng: Đang hoạt động <em>/ Sept 2026</em>
            </span>
            <span className="preview-cmd-badge">⌘ K &nbsp; Bảng lệnh</span>
          </div>
        </div>
      </header>
      {mobileOpen && (
        <>
          <div
            className="preview-mobile-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="preview-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu điều hướng di động">
            <div className="preview-mobile-user">
              <div>
                <strong>{user?.username || "Khách vãng lai"}</strong>
                <span>{user ? `${user.reputation} reputation` : "Chưa đăng nhập"}</span>
              </div>
              <Link
                href="/vi"
                className="preview-points preview-points-link"
                onClick={() => setMobileOpen(false)}
              >
                ★ {user ? user.unipoints.toLocaleString("vi-VN") : "0"} UP
                <span className="preview-points-add">+ Nạp</span>
              </Link>
            </div>

            <div className="preview-mobile-nav-group">
              <span className="preview-mobile-group-title">PHÂN HỆ HỌC THUẬT</span>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={activeTab === item.id ? "active" : ""}
                  onClick={() => selectTab(item.id)}
                >
                  <span className="preview-mobile-nav-icon">{item.icon}</span>
                  <span className="preview-mobile-nav-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="preview-mobile-nav-group">
              <span className="preview-mobile-group-title">TÀI KHOẢN & VÍ WEB3</span>
              <button
                type="button"
                className="preview-mobile-wallet-btn"
                onClick={() => {
                  handleWallet();
                  setMobileOpen(false);
                }}
              >
                <span>🟣</span>
                {connected && publicKey
                  ? `Ví Phantom (${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)})`
                  : "Kết nối Ví Phantom"}
              </button>
              <Link
                href="/vi"
                className="preview-mobile-wallet-btn"
                onClick={() => setMobileOpen(false)}
              >
                <span>⚡</span>
                Đổi SOL ➔ UniPoints
              </Link>
              <Link
                href="/admin"
                className="preview-mobile-wallet-btn"
                onClick={() => setMobileOpen(false)}
              >
                <span>🛡️</span>
                Cổng Quản Trị WIT
              </Link>
            </div>

            <div className="preview-mobile-footer-actions">
              {user ? (
                <button
                  type="button"
                  className="preview-mobile-auth-btn preview-mobile-logout"
                  onClick={() => void logout()}
                >
                  Đăng xuất ({user.username})
                </button>
              ) : (
                <div className="preview-mobile-auth-row">
                  <Link
                    href="/dang-nhap"
                    className="preview-mobile-auth-btn preview-mobile-login"
                    onClick={() => setMobileOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    className="preview-mobile-auth-btn preview-mobile-register"
                    onClick={() => setMobileOpen(false)}
                  >
                    Đăng ký tài khoản
                  </Link>
                </div>
              )}
              <div className="preview-mobile-theme-row">
                <span className="preview-mobile-theme-label">Giao diện</span>
                <ThemeToggle showLabels className="preview-mobile-theme" />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
