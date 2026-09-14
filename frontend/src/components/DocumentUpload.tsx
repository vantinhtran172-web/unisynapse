"use client";

import { useState, useRef } from "react";
import { useAppState } from "../context/AppStateContext";

import { DocumentUploadResponse } from "../lib/api";

type VerificationStep = 'idle' | 'upload' | 'privacy' | 'duplicate' | 'copyright' | 'quality' | 'approved';

export default function DocumentUpload() {
  const [step, setStep] = useState<VerificationStep>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<DocumentUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadDocument, refreshState } = useAppState();

  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setErrorMessage("");
    setSuccessInfo(null);
    setStep('upload');

    // Visual step sequence while server processes
    const stepTimer1 = setTimeout(() => setStep('privacy'), 600);
    const stepTimer2 = setTimeout(() => setStep('duplicate'), 1200);
    const stepTimer3 = setTimeout(() => setStep('copyright'), 1800);
    const stepTimer4 = setTimeout(() => setStep('quality'), 2400);

    try {
      const res = await uploadDocument(file);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setStep('approved');
      setSuccessInfo(res);
      await refreshState();
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setStep('idle');
      setErrorMessage(err instanceof Error ? err.message : "Lỗi khi kiểm định tài liệu");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Đóng Góp Học Liệu (6 Cổng)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Tải lên ghi chú, tóm tắt tự soạn để huấn luyện AI Tutor</p>
      </div>

      <div 
        className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500 bg-slate-50/70 dark:bg-slate-800/30'
        } ${step !== 'idle' ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => step === 'idle' && fileInputRef.current?.click()}
      >
        <svg className="w-10 h-10 text-slate-400 dark:text-slate-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <p className="text-slate-800 dark:text-slate-200 font-medium text-xs text-center">Kéo & thả tập tin hoặc bấm để chọn</p>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">Hỗ trợ .PDF, .TXT (Tối đa 15MB)</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }} 
          className="btn-cyber-secondary py-1.5 px-3 text-xs mt-3 shadow-sm"
        >
          Chọn Tập Tin
        </button>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }} 
          accept=".pdf,.txt"
        />
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Tài liệu bị từ chối tại cổng kiểm định:
          </p>
          <p className="text-slate-700 dark:text-slate-300">{errorMessage}</p>
        </div>
      )}

      {step !== 'idle' && (
        <div className="mt-4 bg-slate-50 dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Quy Trình 6 Cổng Kiểm Định</h3>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 truncate max-w-[120px] font-mono">{fileName}</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Step 1: MIME */}
            <div className="flex items-center gap-2.5">
              {step === 'upload' ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              )}
              <span className={step === 'upload' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>1. Kiểm tra cấu trúc tập tin & MIME header...</span>
            </div>

            {/* Step 2: Privacy */}
            <div className={`flex items-center gap-2.5 ${step === 'upload' ? 'opacity-40' : ''}`}>
              {step === 'privacy' ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : step === 'duplicate' || step === 'copyright' || step === 'quality' || step === 'approved' ? (
                <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 dark:border-slate-600 rounded-full" />
              )}
              <span className={step === 'privacy' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>2. Quét bảo mật riêng tư (PII scanner)...</span>
            </div>

            {/* Step 3: Duplicate */}
            <div className={`flex items-center gap-2.5 ${step === 'upload' || step === 'privacy' ? 'opacity-40' : ''}`}>
              {step === 'duplicate' ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : step === 'copyright' || step === 'quality' || step === 'approved' ? (
                <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 dark:border-slate-600 rounded-full" />
              )}
              <span className={step === 'duplicate' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>3. Đối soát mã băm SHA-256 (Chống trùng lặp)...</span>
            </div>

            {/* Step 4: Copyright */}
            <div className={`flex items-center gap-2.5 ${step === 'upload' || step === 'privacy' || step === 'duplicate' ? 'opacity-40' : ''}`}>
              {step === 'copyright' ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : step === 'quality' || step === 'approved' ? (
                <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 dark:border-slate-600 rounded-full" />
              )}
              <span className={step === 'copyright' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>4. Xác thực cam kết quyền chia sẻ...</span>
            </div>

            {/* Step 5: Quality */}
            <div className={`flex items-center gap-2.5 ${step !== 'quality' && step !== 'approved' ? 'opacity-40' : ''}`}>
              {step === 'quality' ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : step === 'approved' ? (
                <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 dark:border-slate-600 rounded-full" />
              )}
              <span className={step === 'quality' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>5. Đánh giá chất lượng & phân đoạn (Chunking)...</span>
            </div>

            {/* Step 6: Approval */}
            {step === 'approved' && successInfo && (
              <div className="mt-3 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-xl space-y-1.5">
                <p className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-between text-xs">
                  <span>✓ Tài Liệu Đã Được Phê Duyệt & Lập Chỉ Mục!</span>
                  <span className="font-mono">+{successInfo.reward_points} UniPoints</span>
                </p>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Đã tạo <strong>{successInfo.chunk_count} đoạn tri thức</strong> đưa vào kho vector RAG cho AI Tutor.
                </p>
                {successInfo.explorer_url && (
                  <a
                    href={successInfo.explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono block truncate"
                  >
                    Xem bằng chứng Solana Devnet: {successInfo.solana_signature?.slice(0, 16)}...
                  </a>
                )}
                <button
                  onClick={() => {
                    setStep('idle');
                    setSuccessInfo(null);
                  }}
                  className="btn-cyber-secondary w-full py-2 text-[11px] mt-2 shadow-sm"
                >
                  Đóng Góp Tài Liệu Khác
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
