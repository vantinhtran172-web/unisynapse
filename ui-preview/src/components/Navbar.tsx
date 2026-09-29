"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAppState } from "../context/AppStateContext";
import { api } from "../lib/api";
import ThemeToggle from "./ThemeToggle";

const navTabs = [
  { id: "overview", label: "Tổng quan", icon: "■" },
  { id: "labeling", label: "Gán nhãn", icon: "◇" },
  { id: "upload", label: "Góp tài liệu", icon: "⇧" },
  { id: "tutor", label: "AI Tutor", icon: "✦" },
  { id: "ledger", label: "Solana", icon: "⬡" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { wallet, connect, disconnect, connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { activeTab, setActiveTab, user, refreshState } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const close = () => setMobileOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const selectTab = (tabId: string) => {
    const target = tabId === "overview" ? "dashboard" : tabId;
    setActiveTab(target);
    setMobileOpen(false);
    if (pathname !== "/") {
      router.push(`/?tab=${tabId}`);
    } else if (typeof window !== "undefined") {
      window.history.replaceState(null, "", tabId === "overview" ? "/" : `/?tab=${tabId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleWallet = () => {
    if (!user) {
      if (typeof window !== "undefined") {
        const wantsLogin = window.confirm(
          "Ràng buộc bảo mật: Bạn cần đăng nhập tài khoản trước khi liên kết ví Phantom.\n\nBấm OK để chuyển đến trang Đăng nhập."
        );
        if (wantsLogin) {
          router.push("/dang-nhap");
        }
      }
      return;
    }
    if (connected) {
      disconnect();
    } else if (wallet) {
      void connect().catch(() => undefined);
    } else {
      setVisible(true);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      await refreshState();
      setMobileOpen(false);
    }
  };

  const currentTab = activeTab === "dashboard" ? "overview" : activeTab;

  return (
    <>
      <header className="nav" role="banner">
        <div className="nav__row1">
          {/* Brand Logo */}
          <button
            type="button"
            className="nav__logo text-left cursor-pointer bg-transparent border-0"
            onClick={() => selectTab("overview")}
            aria-label="Về trang tổng quan UniSynapse"
          >
            <Image
              src="/unisynapse-logo.jpg"
              alt="UniSynapse"
              width={34}
              height={34}
              priority
              className="nav__logo-img rounded-full object-cover border border-indigo-500/40 shadow-xs"
            />
            <div className="nav__logo-text">
              <span className="nav__logo-name flex items-center gap-1">
                UniSynapse{" "}
                <b className="text-[10px] font-black text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-1 py-0.2 rounded font-mono">
                  v1.0
                </b>
              </span>
              <span className="nav__logo-sub">Mạng lưới tri thức học thuật</span>
            </div>
          </button>

          {/* Navigation Tabs (Desktop) */}
          <nav className="nav__tabs" aria-label="Điều hướng phân hệ">
            {navTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav__tab ${currentTab === item.id ? "active" : ""}`}
                onClick={() => selectTab(item.id)}
              >
                <span className="nav__tab-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action Cluster */}
          <div className="nav__right">
            {/* Theme Toggle */}
            <ThemeToggle compact />

            {/* Points HUD */}
            <Link
              href="/vi"
              className="nav__pts flex items-center gap-1"
              id="nav-pts-badge"
              title="Xem số dư & Nạp SOL đổi UniPoints"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{user ? user.unipoints.toLocaleString("vi-VN") : "—"} UP</span>
              <span className="text-amber-500 dark:text-amber-400 font-bold ml-0.5 text-[10px]">+ Nạp</span>
            </Link>

            {/* Gold Action Button: Đổi SOL */}
            <Link
              href="/vi"
              id="nav-sol-button"
              className="btn btn--sol hidden sm:inline-flex items-center gap-1 font-bold text-xs"
              title="Đổi SOL sang UniPoints trên Solana Devnet"
            >
              <span>⚡</span>
              <span>Đổi SOL</span>
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden md:inline-block text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-mono">
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn--nav-login text-xs py-1 px-2 text-slate-500 hover:text-red-500"
                  title="Đăng xuất"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <>
                <Link href="/dang-nhap" className="btn--nav-login">
                  Đăng nhập
                </Link>
                <Link href="/dang-ky" className="btn--nav-register">
                  Đăng ký
                </Link>
              </>
            )}

            {/* Primary Action: Web3 Phantom Wallet */}
            <button
              className="btn--phantom"
              id="btn-phantom"
              onClick={handleWallet}
              title={
                !user
                  ? "Cần đăng nhập tài khoản trước khi liên kết ví"
                  : connected && publicKey
                  ? `Ví đã kết nối: ${publicKey.toBase58()}`
                  : "Kết nối ví Phantom"
              }
            >
              <span className={`btn--phantom-dot ${connected ? "active" : ""}`} aria-hidden="true" />
              <span>
                {mounted && connected && publicKey && user
                  ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                  : "Ví Phantom"}
              </span>
            </button>

            {/* Mobile Hamburger */}
            <button
              className="btn--nav-icon nav__ham lg:hidden"
              id="btn-ham"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Mở menu"
              aria-expanded={mobileOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header: network status + command palette */}
      <div className="sub-header" id="sub-header">
        <div className="sub-header__inner">
          <div className="sub-header__left">
            <div className="net-status">
              <span className="net-dot" aria-hidden="true" />
              <span className="net-label">Trạng thái mạng: Đang hoạt động</span>
            </div>
            <span className="net-date">/ Sept 2026</span>
          </div>
          <button
            type="button"
            className="cmd-btn"
            id="btn-cmd"
            aria-label="Mở bảng lệnh (⌘K)"
            onClick={() => selectTab("challenges")}
          >
            <span className="cmd-key">⌘</span>
            <span className="cmd-key">K</span>
            <span>Bảng lệnh</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <nav className="mobile-menu lg:hidden" aria-label="Mobile navigation">
          <div className="flex items-center gap-2.5 p-2 pb-3 border-b border-slate-200 dark:border-white/10 mb-2">
            <Image
              src="/unisynapse-logo.jpg"
              alt="UniSynapse"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">UniSynapse</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {user ? `${user.username} (${user.unipoints} UP)` : "Chưa đăng nhập"}
              </span>
            </div>
          </div>
          {navTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav__tab w-full justify-start py-2.5 ${currentTab === item.id ? "active font-bold" : ""}`}
              onClick={() => selectTab(item.id)}
            >
              <span className="nav__tab-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <Link
            href="/vi"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 my-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 text-xs"
            onClick={() => setMobileOpen(false)}
          >
            <span>⚡ Đổi SOL sang UniPoints</span>
          </Link>
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex gap-2">
            {!user ? (
              <>
                <Link
                  href="/dang-nhap"
                  className="flex-1 py-2 text-center text-xs rounded-lg border border-slate-300 dark:border-white/10 font-bold text-slate-700 dark:text-slate-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  className="flex-1 py-2 text-center text-xs rounded-lg bg-indigo-600 text-white font-bold"
                  onClick={() => setMobileOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 text-center text-xs rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 font-bold"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
