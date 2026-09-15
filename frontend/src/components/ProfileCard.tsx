"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAppState } from "../context/AppStateContext";
import { api } from "../lib/api";
import { useState } from "react";
import Link from "next/link";

export default function ProfileCard() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { 
    isVerifying, verifyWallet, 
  } = useUserProfile();
  const { user, unipoints, reputation, refreshState } = useAppState();
  const [unlinking, setUnlinking] = useState(false);

  const handleUnlink = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy liên kết ví Phantom khỏi tài khoản này?")) {
      return;
    }
    try {
      setUnlinking(true);
      await api.unlinkWallet();
      await refreshState();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Không thể hủy liên kết ví");
    } finally {
      setUnlinking(false);
    }
  };

  const handleLinkCurrentWallet = async () => {
    try {
      await verifyWallet();
      await refreshState();
    } catch {
      // Handled in verifyWallet
    }
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-cyan-500 p-1 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-sm font-bold">
              {user ? (
                <span className="text-cyan-500 font-extrabold">{user.username.slice(0, 2).toUpperCase()}</span>
              ) : (
                <span className="text-amber-500">🔒</span>
              )}
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {user ? user.username : "Khách vãng lai"}
              </h2>
              {user ? (
                <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  Campus SSO
                </span>
              ) : (
                <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                  Chưa đăng nhập
                </span>
              )}
            </div>
            
            {user ? (
              user.address ? (
                <div className="mt-1">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block cyber-pulsing-dot"></span>
                    <span>Ví liên kết: <b className="text-cyan-600 dark:text-cyan-400">{user.address.slice(0, 4)}...{user.address.slice(-4)}</b></span>
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    ✓ Solana Devnet Verified
                  </p>
                </div>
              ) : (
                <div className="mt-1">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    ⚠ Tài khoản chưa liên kết ví Phantom
                  </p>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cần có tài khoản sinh viên để liên kết ví Phantom
              </p>
            )}
          </div>
        </div>

        {/* Action button based on auth & wallet status */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/dang-nhap" 
                className="btn-cyber-primary text-xs py-1.5 px-3 font-bold"
              >
                Đăng nhập để liên kết ví
              </Link>
            </div>
          ) : user.address ? (
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-rose-500 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors"
              title="Hủy liên kết ví Phantom khỏi tài khoản này"
            >
              {unlinking ? "Đang hủy..." : "Hủy liên kết ví"}
            </button>
          ) : connected && publicKey ? (
            <button
              onClick={handleLinkCurrentWallet}
              disabled={isVerifying}
              className="btn-cyber-primary text-xs py-1.5 px-3 font-bold"
            >
              {isVerifying ? "Đang ký message…" : `Ký liên kết ví (${publicKey.toBase58().slice(0, 4)}...)`}
            </button>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="btn-cyber-secondary text-xs py-1.5 px-3 font-bold"
            >
              Kết nối ví Phantom
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <div className="bg-slate-100/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/5">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">UniPoints</p>
          <p className="text-xl font-bold text-blue-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-cyan-200">
            {user ? unipoints.toLocaleString("vi-VN") : "—"}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {user ? "Khép kín" : "Cần đăng nhập"}
          </span>
        </div>
        
        <div className="bg-slate-100/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/5">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Reputation</p>
          <div className="flex items-end gap-1">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{user ? reputation : "—"}</p>
            {user && <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-0.5">/ 100</p>}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            {user ? "Tin cậy cao" : "Cần đăng nhập"}
          </span>
        </div>

        <div className="bg-slate-100/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/5 relative overflow-hidden">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Quyền Lợi</p>
          <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
            AI Tutor VIP
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 block font-medium">
            {user ? "Đã mở khóa" : "Khóa"}
          </span>
        </div>
      </div>
    </div>
  );
}
