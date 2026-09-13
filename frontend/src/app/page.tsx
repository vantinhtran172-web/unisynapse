"use client";

import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import DataLabeling from "@/components/DataLabeling";
import DocumentUpload from "@/components/DocumentUpload";
import AITutorChat from "@/components/AITutorChat";
import ProofExplorer from "@/components/ProofExplorer";
import { useAppState } from "@/context/AppStateContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { activeTab, setActiveTab } = useAppState();

  useEffect(() => {
    setMounted(true);
    api.getStats().then(setStats).catch(() => {});
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#030712] text-slate-50 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-cyan-400 font-bold tracking-wider">
            UNISYNAPSE CORE INITIALIZING...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 relative pb-20 cyber-grid-bg selection:bg-cyan-400 selection:text-black">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[150px]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-700/10 blur-[160px]"></div>
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 lg:pt-24 relative z-10 space-y-6">
        {/* CyberCore HUD Hero Banner */}
        <div className="cyber-panel p-6 border-cyan-500/30 relative overflow-hidden">
          {/* Top corner accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="cyber-badge-cyan text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                  Đề Án Đổi Mới Sáng Tạo Quốc Gia 2026
                </span>
                <span className="cyber-badge-purple text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                  Solana Settlement Layer
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 cyber-pulsing-dot"></span>
                  DEVNET READY
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                UniSynapse — Student-Powered Academic Knowledge Network
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Sinh viên đổi thời gian rảnh qua các bài toán <strong className="text-cyan-300">gán nhãn dữ liệu</strong> và <strong className="text-cyan-300">đóng góp tài liệu học tập</strong> thành điểm thưởng <strong className="text-amber-400">UniPoints</strong>. Học liệu qua 6 cổng kiểm duyệt tự động tạo ra <strong className="text-purple-300">AI Tutor</strong> trả lời thông minh có trích dẫn nguồn thực tế.
              </p>
            </div>

            {/* Quick Action Matrix */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab("tutor")}
                className="btn-cyber-primary py-2.5 px-5 text-xs font-bold rounded-lg text-center"
              >
                ✦ Hỏi AI Tutor Ngay →
              </button>

              <Link
                href="/admin"
                className="btn-cyber-admin py-2 px-4 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5"
              >
                <span>Hội Đồng Thẩm Định (Admin) ↗</span>
              </Link>
            </div>
          </div>

          {/* Quick HUD Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-cyan-500/15 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-[#070d1e] border border-cyan-500/20">
              <div className="text-[10px] text-slate-400 uppercase">Học Liệu RAG</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">
                {stats?.indexed_chunks ? `${stats.indexed_chunks} Chunks` : "7 Chunks Chuẩn"}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070d1e] border border-cyan-500/20">
              <div className="text-[10px] text-slate-400 uppercase">Độ Đồng Thuận</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                98.4% Consensus
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070d1e] border border-cyan-500/20">
              <div className="text-[10px] text-slate-400 uppercase">Mạng Blockchain</div>
              <div className="text-base font-bold text-purple-400 mt-0.5">
                Solana Devnet
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070d1e] border border-cyan-500/20">
              <div className="text-[10px] text-slate-400 uppercase">Thời Gian Phản Hồi</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                &lt; 350ms TF-IDF
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Student Profile & Contribution Inputs) */}
            <div className="lg:col-span-4 space-y-6">
              <ProfileCard />
              <div className="min-h-[380px]">
                <DataLabeling />
              </div>
              <div className="min-h-[350px]">
                <DocumentUpload />
              </div>
            </div>

            {/* Right Column (AI Tutor & Solana Ledger Proofs) */}
            <div className="lg:col-span-8 space-y-6">
              <AITutorChat />
              
              <div>
                <ProofExplorer />
              </div>

              {/* Cyber Value Loop Graphic */}
              <div className="cyber-panel p-6">
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4 text-center">
                  VÒNG LẶP GIÁ TRỊ BỀN VỮNG (UNISYNAPSE VALUE CYCLE)
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-center flex-1">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto mb-2 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <p className="text-xs text-white font-bold font-sans">1. Đóng Góp</p>
                    <p className="text-[10px] text-slate-400 font-mono">Gán Nhãn & Học Liệu</p>
                  </div>

                  <div className="h-px w-10 bg-gradient-to-r from-cyan-500/10 via-cyan-500/60 to-cyan-500/10"></div>

                  <div className="text-center flex-1">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <p className="text-xs text-white font-bold font-sans">2. Kiểm Định 6 Cổng</p>
                    <p className="text-[10px] text-slate-400 font-mono">MIME, PII, Trùng, Quyền</p>
                  </div>

                  <div className="h-px w-10 bg-gradient-to-r from-emerald-500/10 via-purple-500/60 to-purple-500/10"></div>

                  <div className="text-center flex-1">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center mx-auto mb-2 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                    </div>
                    <p className="text-xs text-white font-bold font-sans">3. AI Tutor & Thưởng</p>
                    <p className="text-[10px] text-slate-400 font-mono">Trích Dẫn & Solana Proof</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "labeling" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <ProfileCard />
            </div>
            <div className="lg:col-span-8">
              <DataLabeling />
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <ProfileCard />
            </div>
            <div className="lg:col-span-8">
              <DocumentUpload />
            </div>
          </div>
        )}

        {activeTab === "tutor" && (
          <div className="max-w-4xl mx-auto">
            <AITutorChat />
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <ProfileCard />
            </div>
            <div className="lg:col-span-8">
              <ProofExplorer />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
