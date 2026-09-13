"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppState } from "../context/AppStateContext";

export default function Navbar() {
  const { wallet, connect, disconnect, connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const { activeTab, setActiveTab, user } = useAppState();

  useEffect(() => {
    setMounted(true);
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

  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: "❖" },
    { id: "labeling", label: "Gán nhãn", icon: "◈" },
    { id: "upload", label: "Góp tài liệu", icon: "⇪" },
    { id: "tutor", label: "AI Tutor", icon: "✦" },
    { id: "ledger", label: "Sổ cái Solana", icon: "⬡" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand with CyberCore Logo Accent */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_22px_rgba(0,240,255,0.6)] transition-all">
            <div className="w-full h-full bg-[#030712] rounded-lg flex items-center justify-center font-black text-cyan-400 text-sm">
              US
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white block leading-none font-sans">
                UniSynapse
              </span>
              <span className="cyber-badge-cyan text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                v1.0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono leading-none">
              Academic Knowledge Network
            </span>
          </div>
        </div>
        
        {/* Navigation Tabs (Cyber HUD pills) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#0a1128]/80 p-1 rounded-xl border border-cyan-500/20 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold shadow-[0_0_14px_rgba(0,240,255,0.4)]"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-[10px] opacity-70">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Action Bar: Points + Wallet + ADMIN Portal Link */}
        <div className="flex items-center gap-2.5">
          {/* Points HUD */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <span className="text-amber-400 font-bold">★</span>
            <span className="font-bold">{user?.unipoints ?? 50}</span>
            <span className="text-[10px] text-slate-400">pts</span>
          </div>

          {/* Wallet Button */}
          <button 
            onClick={handleWalletClick}
            className="btn-cyber-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 font-mono rounded-lg border border-slate-700"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 cyber-pulsing-dot"></span>
            <span>
              {mounted && connected && publicKey 
                ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                : mounted && user?.address
                ? `${user.address.slice(0, 4)}...${user.address.slice(-4)}`
                : 'Ví Solana'}
            </span>
          </button>

          {/* DEDICATED ADMIN PORTAL LINK */}
          <Link
            href="/admin"
            className="btn-cyber-admin px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
            title="Mở Cổng Quản Trị Hệ Thống & Hội Đồng Thẩm Định"
          >
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
            <span>CỔNG QUẢN TRỊ ↗</span>
          </Link>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 pt-2.5 mt-2 border-t border-cyan-500/10 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white bg-slate-900/60"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
