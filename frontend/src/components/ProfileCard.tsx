"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAppState } from "../context/AppStateContext";
import { useEffect } from "react";

export default function ProfileCard() {
  const { publicKey, connected } = useWallet();
  const { 
    isVerified, isVerifying, verifyWallet, 
    hasProfile, initializeProfile, isInitializing 
  } = useUserProfile();
  const { user, unipoints, reputation, setWalletAddress } = useAppState();

  const address = publicKey ? publicKey.toBase58() : (user?.address || "");
  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Chưa kết nối ví";

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toBase58());
    }
  }, [publicKey, setWalletAddress]);

  return (
    <div className="glass-panel p-6 relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-blue-500 p-1 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold truncate">
            {connected || address ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ) : (
              <span className="text-slate-600 dark:text-slate-300">?</span>
            )}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user?.username || "Sinh viên UniHackFest"}</h2>
            <span className="bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 font-medium">
              Campus SSO
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
            Ví: {shortAddress}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block"></span> Solana Devnet Verified
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <div className="bg-slate-100/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/5">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">UniPoints</p>
          <p className="text-xl font-bold text-blue-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-cyan-200">
            {unipoints.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Khép kín</span>
        </div>
        
        <div className="bg-slate-100/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/5">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Reputation</p>
          <div className="flex items-end gap-1">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{reputation}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-0.5">/ 100</p>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">Tin cậy cao</span>
        </div>

        <div className="bg-slate-100/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-white/5 relative overflow-hidden">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Quyền Lợi</p>
          <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
            AI Tutor VIP
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 block font-medium">Đã mở khóa</span>
        </div>
      </div>
    </div>
  );
}
