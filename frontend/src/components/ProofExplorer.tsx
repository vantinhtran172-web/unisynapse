"use client";

import { useState, useEffect } from "react";
import { useAppState } from "../context/AppStateContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function ProofExplorer() {
  const { ledger, unipoints, refreshState } = useAppState();
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then((lamports) => {
        setSolBalance(lamports / LAMPORTS_PER_SOL);
      }).catch((err) => {
        console.warn("Could not fetch balance:", err);
      });
    } else {
      setSolBalance(null);
    }
  }, [connected, publicKey, connection]);

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Sổ Cái Bất Biến & Bằng Chứng Solana</h2>
          <p className="text-xs text-slate-400">Mọi đóng góp được lưu vết kép (Double-Entry) và đối soát trên Solana Devnet</p>
        </div>
        <button
          onClick={refreshState}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-3 rounded-lg border border-white/5 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/80 p-3 rounded-xl border border-white/5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tổng Bút Toán</p>
          <p className="text-xl font-bold text-white font-mono">{ledger.length}</p>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-xl border border-white/5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tổng UniPoints</p>
          <p className="text-xl font-bold text-blue-400 font-mono">+{unipoints}</p>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-xl border border-white/5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mạng Khởi Tạo</p>
          <p className="text-xs font-bold text-emerald-400 mt-1 font-mono">Solana Devnet</p>
        </div>
      </div>

      <div className="mb-4 p-4 bg-gradient-to-r from-purple-950/50 to-blue-950/50 border border-purple-500/30 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="text-xs font-bold text-purple-200">Settlement Solana Devnet</span>
        </div>
        <p className="text-xs text-slate-300">
          Giao dịch chỉ hiển thị sau khi backend contract gửi và RPC xác minh thành công.
          Không cho trình duyệt tự ghi memo hoặc tự cộng điểm.
        </p>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-purple-500/20 text-slate-300">
          <div className="flex items-center gap-2">
            <span>Ví Devnet:</span>
            {connected && publicKey ? (
              <span className="font-mono text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-400/20">
                {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-6)}
              </span>
            ) : (
              <span className="text-slate-400 italic">Chưa kết nối ví</span>
            )}
            {solBalance !== null && (
              <span className="text-emerald-400 font-mono font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                {solBalance.toFixed(4)} SOL
              </span>
            )}
          </div>
          <a href="https://faucet.solana.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">
            Faucet Devnet ↗
          </a>
        </div>

      </div>

      {/* Ledger list */}
      <div className="flex-grow overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
        {ledger.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Chưa có bút toán nào trong sổ cái. Hãy hoàn thành 1 nhiệm vụ hoặc tải lên tài liệu để nhận bằng chứng đầu tiên!
          </div>
        ) : (
          ledger.map((entry) => (
            <div 
              key={entry.id}
              className="bg-slate-800/60 hover:bg-slate-800 border border-white/5 p-3.5 rounded-xl transition-colors space-y-1.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-white text-xs block">{entry.reason}</span>
                  <span className="text-[10px] text-slate-400">Nguồn: {entry.source_type.toUpperCase()} • {new Date(entry.created_at * 1000).toLocaleTimeString()}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  +{entry.delta} Pts
                </span>
              </div>

              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[200px]" title={entry.proof_hash}>
                  Hash: {entry.proof_hash.slice(0, 14)}...{entry.proof_hash.slice(-8)}
                </span>
                {entry.explorer_url && (
                  <a
                    href={entry.explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                  >
                    Solana Explorer ↗
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
