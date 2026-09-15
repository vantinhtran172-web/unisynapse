"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "../context/AppStateContext";
import { api } from "../lib/api";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const { wallet, connect, disconnect, connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab, user, refreshState } = useAppState();

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Close mobile menu when active tab changes or on escape
  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleWalletClick = () => {
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
      connect().catch(() => {});
    } else {
      setVisible(true);
    }
  };

  async function handleLogout() {
    try {
      await api.logout();
    } finally {
      await refreshState();
      setMobileMenuOpen(false);
    }
  }

  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: "❖" },
    { id: "labeling", label: "Gán nhãn", icon: "◈" },
    { id: "upload", label: "Góp tài liệu", icon: "⇪" },
    { id: "tutor", label: "AI Tutor", icon: "✦" },
    { id: "ledger", label: "Solana", icon: "⬡" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full max-w-full overflow-hidden bg-white/95 dark:bg-[#030712]/95 backdrop-blur-2xl border-b border-slate-200/90 dark:border-cyan-500/20 px-3 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-colors duration-200">
        <div className="w-full max-w-[1780px] 2xl:max-w-[1920px] mx-auto flex justify-between items-center gap-2 sm:gap-4">
          {/* Brand with CyberCore Logo Accent */}
          <div 
            onClick={() => handleSelectTab("dashboard")}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:shadow-[0_0_22px_rgba(0,240,255,0.5)] transition-all">
              <div className="w-full h-full bg-slate-900 dark:bg-[#030712] rounded-lg flex items-center justify-center font-black text-cyan-400 text-[10px] sm:text-xs tracking-tight">
                WIT
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white block leading-none font-sans">
                  UniSynapse
                </span>
                <span className="cyber-badge-cyan text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none hidden xl:block mt-0.5">
                Mạng lưới tri thức học thuật
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation Tabs (Spacious & centered) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-[#0a1128]/80 p-1 rounded-xl border border-slate-200/80 dark:border-cyan-500/20 shadow-inner">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white dark:text-slate-950 font-bold shadow-sm dark:shadow-[0_0_14px_rgba(0,240,255,0.4)]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                }`}
              >
                <span className="text-[10px] opacity-70">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Theme Selector (Desktop / Tablet) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Points HUD - Always visible or compact on mobile */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-xs font-mono text-cyan-900 dark:text-cyan-300 shadow-sm">
              <span className="text-amber-500 font-bold text-xs">★</span>
              <span className="font-bold">{user ? user.unipoints.toLocaleString("vi-VN") : "—"}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden xs:inline">pts</span>
            </div>

            {/* Desktop Auth Links */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium truncate max-w-[110px]">
                  {user.username}
                </span>
                <button 
                  id="nav-logout" 
                  onClick={() => void handleLogout()} 
                  className="btn-cyber-secondary text-xs py-1.5 px-2.5"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Link id="nav-login" href="/dang-nhap" className="btn-cyber-secondary text-xs py-1.5 px-2.5">
                  Đăng nhập
                </Link>
                <Link id="nav-register" href="/dang-ky" className="btn-cyber-primary text-xs py-1.5 px-2.5 font-bold">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Exchange SOL */}
            <div className="hidden lg:block">
              <Link 
                id="nav-sol-transfer" 
                href="/vi" 
                className="btn-cyber-secondary text-xs py-1.5 px-2.5"
              >
                Đổi SOL
              </Link>
            </div>

            {/* Solana Wallet Button */}
            <button 
              id="nav-wallet-button"
              onClick={handleWalletClick}
              className={`btn-cyber-secondary py-1.5 px-2 sm:px-3 text-xs flex items-center gap-1.5 font-mono rounded-lg border shadow-sm ${
                !user 
                  ? "border-amber-400/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:border-amber-500"
                  : "border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200"
              }`}
              title={
                !user 
                  ? "Yêu cầu có tài khoản đăng nhập để liên kết ví Phantom"
                  : connected && publicKey 
                  ? `Ví đã kết nối: ${publicKey.toBase58()}` 
                  : user.address 
                  ? `Ví đã liên kết: ${user.address}`
                  : "Kết nối và liên kết ví Phantom với tài khoản"
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                !user
                  ? 'bg-amber-400'
                  : connected 
                  ? 'bg-emerald-500 cyber-pulsing-dot' 
                  : user?.address
                  ? 'bg-cyan-400'
                  : 'bg-slate-400'
              }`}></span>
              <span className="hidden sm:inline">
                {mounted && !user
                  ? 'Ví Phantom (Cần đăng nhập)'
                  : mounted && connected && publicKey 
                  ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                  : mounted && user?.address
                  ? `${user.address.slice(0, 4)}...${user.address.slice(-4)}`
                  : 'Liên kết ví Phantom'}
              </span>
              <span className="sm:hidden">
                {mounted && !user
                  ? 'Khóa ví'
                  : mounted && connected && publicKey 
                  ? `${publicKey.toBase58().slice(0, 3)}..`
                  : mounted && user?.address
                  ? `${user.address.slice(0, 3)}..`
                  : 'Ví Phantom'}
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors"
              aria-label="Mở trình đơn"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Quick Tabs Bar (Smooth horizontal scroll) */}
        <div className="flex lg:hidden w-full max-w-full overflow-x-auto gap-1.5 pt-2 mt-1.5 border-t border-slate-200/80 dark:border-cyan-500/10 scrollbar-none touch-pan-x">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white dark:text-slate-950 font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 bg-slate-100/90 dark:text-slate-300 dark:hover:text-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800"
              }`}
            >
              <span className="text-[10px] opacity-70">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Full Dropdown Menu / Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Drawer content */}
          <div className="fixed top-[92px] sm:top-[68px] left-0 right-0 max-h-[calc(100vh-100px)] overflow-y-auto bg-white dark:bg-[#030712] border-b border-slate-200 dark:border-cyan-500/30 p-4 sm:p-6 shadow-2xl transition-all">
            {/* User & Wallet Status Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 mb-4">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {user ? user.username.slice(0, 2).toUpperCase() : "WIT"}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {user ? user.username : "Khách vãng lai"}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {user ? `Điểm danh tiếng: ${user.reputation}` : "Chưa đăng nhập"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-100/70 dark:bg-cyan-950/60 border border-cyan-300/50 dark:border-cyan-500/40 text-xs font-mono text-cyan-900 dark:text-cyan-300 font-bold">
                  <span className="text-amber-500">★</span>
                  <span>{user ? user.unipoints.toLocaleString("vi-VN") : "0"} UP</span>
                </div>
              </div>

              {/* Login / Register or Logout buttons */}
              {user ? (
                <button
                  onClick={() => void handleLogout()}
                  className="w-full btn-cyber-secondary text-xs py-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 mt-1"
                >
                  Đăng xuất tài khoản
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    href="/dang-nhap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-cyber-secondary text-center text-xs py-2 font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-cyber-primary text-center text-xs py-2 font-bold"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions & Links */}
            <div className="space-y-1.5 mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1">
                Điều hướng trang
              </div>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-blue-50 dark:bg-cyan-950/40 text-blue-600 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="opacity-70 font-mono">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {activeTab === item.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}

              <Link
                href="/vi"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-amber-500">⚡</span>
                  <span>Đổi SOL sang UniPoints</span>
                </span>
                <span className="text-xs text-slate-400">↗</span>
              </Link>
            </div>

            {/* Theme switcher segment */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-2">
                Chế độ hiển thị
              </div>
              <ThemeToggle showLabels className="w-full justify-around py-1.5" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
