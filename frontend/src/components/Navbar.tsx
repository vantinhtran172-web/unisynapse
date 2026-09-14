"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppState } from "../context/AppStateContext";
import { api } from "../lib/api";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { wallet, connect, disconnect, connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const { activeTab, setActiveTab, user, refreshState } = useAppState();

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleWalletClick = () => {
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#030712]/90 backdrop-blur-xl border-b border-slate-200 dark:border-cyan-500/20 px-3 sm:px-6 py-2.5 shadow-sm dark:shadow-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
        {/* Brand with CyberCore Logo Accent */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:shadow-[0_0_22px_rgba(0,240,255,0.5)] transition-all">
            <div className="w-full h-full bg-slate-900 dark:bg-[#030712] rounded-lg flex items-center justify-center font-black text-cyan-400 text-xs sm:text-sm">
              US
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white block leading-none font-sans">
                UniHackFest
              </span>
              <span className="cyber-badge-cyan text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                v1.0
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none hidden sm:block">
              Mạng lưới tri thức học thuật
            </span>
          </div>
        </div>
        
        {/* Navigation Tabs (Pill style) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-[#0a1128]/80 p-1 rounded-xl border border-slate-200/80 dark:border-cyan-500/20 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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

        {/* Right Action Bar: ThemeToggle + Points + Auth + Wallet */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Selector Pill (System / Light / Dark) */}
          <ThemeToggle />

          {/* Points HUD */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-xs font-mono text-cyan-900 dark:text-cyan-300 shadow-sm">
            <span className="text-amber-500 font-bold">★</span>
            <span className="font-bold">{user ? user.unipoints.toLocaleString("vi-VN") : "—"}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">pts</span>
          </div>

          {user ? (
            <>
              <span className="hidden xl:inline text-xs text-slate-700 dark:text-slate-300 font-mono">{user.username}</span>
              <button id="nav-logout" onClick={() => void handleLogout()} className="btn-cyber-secondary text-xs py-1.5 px-2.5">Đăng xuất</button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link id="nav-login" href="/dang-nhap" className="btn-cyber-secondary text-xs py-1.5 px-2.5">Đăng nhập</Link>
              <Link id="nav-register" href="/dang-ky" className="btn-cyber-secondary text-xs py-1.5 px-2.5">Đăng ký</Link>
            </div>
          )}

          <Link id="nav-sol-transfer" href="/vi" className="btn-cyber-secondary hidden md:inline-flex text-xs py-1.5 px-2.5">
            Đổi SOL
          </Link>

          {/* Wallet Button */}
          <button 
            onClick={handleWalletClick}
            className="btn-cyber-secondary py-1.5 px-2.5 sm:px-3 text-xs flex items-center gap-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 cyber-pulsing-dot"></span>
              {mounted && connected && publicKey 
                ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                : mounted && user?.address
                ? `${user.address.slice(0, 4)}...${user.address.slice(-4)}`
                : 'Ví Solana'}
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 pt-2.5 mt-2 border-t border-slate-200 dark:border-cyan-500/10 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white dark:text-slate-950 font-bold"
                : "text-slate-600 hover:text-slate-900 bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:bg-slate-900/60"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
