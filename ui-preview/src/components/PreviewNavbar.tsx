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
    const close = () => setMobileOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <ThemeToggle compact />
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
              aria-label="Mở menu"
            >
              {mobileOpen ? "×" : "☰"}
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
        <div className="preview-mobile-menu">
          <div className="preview-mobile-user">
            <strong>{user?.username || "Khách vãng lai"}</strong>
            <span>{user ? `${user.reputation} reputation` : "Chưa đăng nhập"}</span>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeTab === item.id ? "active" : ""}
              onClick={() => selectTab(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link href="/vi" onClick={() => setMobileOpen(false)}>
            ⚡ Đổi SOL sang UniPoints
          </Link>
          <ThemeToggle showLabels className="preview-mobile-theme" />
        </div>
      )}
    </>
  );
}
