"use client";

import React, { useState, useRef, useEffect } from "react";
import { api, NineRouterChatResponse } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  model?: string;
  elapsed?: number;
  tokens?: number;
  citations?: { document_name: string; page?: string }[];
  isError?: boolean;
}

const PRESET_PROMPTS = [
  {
    title: "⚡ Solana Smart Contract",
    prompt: "Viết một Anchor smart contract trên Solana cho phép chuyển UniPoints với kiểm tra quyền sở hữu.",
    mode: "coding" as const,
  },
  {
    title: "🔍 Tối ưu Thuật toán RAG",
    prompt: "Giải thích thuật toán Cosine Similarity kết hợp TF-IDF để tìm kiếm vector tài liệu trong cơ sở dữ liệu.",
    mode: "coding" as const,
  },
  {
    title: "📚 Tóm tắt Tri thức Học liệu",
    prompt: "Dựa vào kho tri thức UniSynapse, tóm tắt các luận điểm cốt lõi trong môn học Tư tưởng Hồ Chí Minh.",
    mode: "academic" as const,
  },
  {
    title: "🛡️ Chống lỗi Concurrency DB",
    prompt: "Làm thế nào để dùng BEGIN IMMEDIATE và atomic locks trong SQLite để chống race condition khi nạp điểm?",
    mode: "coding" as const,
  },
];

export default function AiStudio() {
  const { user, refreshState } = useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Tôi là **Codex GPT-5** được kết nối trực tiếp qua **9Router AI Gateway** (`cx/gpt-5.6-luna`). Tôi có thể hỗ trợ bạn viết code, giải thuật, debug, và truy vấn tri thức học thuật sâu. Hãy chọn chế độ làm việc và đặt câu hỏi bên dưới!",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      model: "cx/gpt-5.6-luna",
    },
  ]);

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"coding" | "academic" | "general">("coding");
  const [includeContext, setIncludeContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string, customMode?: "coding" | "academic" | "general") => {
    if (e) e.preventDefault();
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend || loading) return;

    const currentMode = customMode || mode;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");

    if (!user) {
      setMessages((prev) => [
        ...prev,
        {
          id: `auth-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Bạn cần **Đăng nhập** tài khoản hoặc kết nối ví để sử dụng 9Router AI Studio (mỗi câu hỏi cần 80 UniPoints).",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          model: "cx/gpt-5.6-luna",
          isError: true,
        },
      ]);
      return;
    }

    if (user.unipoints < 80) {
      setMessages((prev) => [
        ...prev,
        {
          id: `pts-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Số dư của bạn hiện tại là **${user.unipoints} UniPoints**, trong khi cần ít nhất **80 UniPoints** cho mỗi lượt hỏi. Hãy đóng góp học liệu hoặc nạp thêm điểm!`,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          model: "cx/gpt-5.6-luna",
          isError: true,
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      const res: NineRouterChatResponse = await api.askNineRouter(
        promptToSend,
        currentMode,
        "cx/gpt-5.6-luna",
        includeContext
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.content,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        model: res.model || "cx/gpt-5.6-luna",
        elapsed: res.elapsed_sec,
        tokens: res.usage?.total_tokens,
        citations: res.citations,
        isError: !res.success,
      };

      setMessages((prev) => [...prev, aiMsg]);
      await refreshState();
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: err instanceof Error ? err.message : "Lỗi kết nối tới 9Router AI Gateway.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        model: "cx/gpt-5.6-luna",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-5xl mx-auto">
      {/* 9Router Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,240,255,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] flex-shrink-0">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white">9Router Neural Studio</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                cx/gpt-5.6-luna
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Codex GPT-5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Định tuyến cục bộ qua <code className="text-cyan-300">9Router Gateway</code> • Phản hồi độ trễ thấp • Hỗ trợ RAG tri thức
            </p>
          </div>
        </div>

        {/* User Balance & Mode Switch */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-amber-400 text-sm">✦</span>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Số dư ví</div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 font-mono">
                {user ? `${user.unipoints} UP` : "Chưa đăng nhập"}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 rounded-xl font-mono">
            Chi phí: <span className="text-cyan-400 font-bold">80 UP</span>/lượt
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("coding")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === "coding"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>💻</span> Lập trình & Code
          </button>
          <button
            type="button"
            onClick={() => setMode("academic")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === "academic"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>📚</span> Học thuật & Lý thuyết
          </button>
          <button
            type="button"
            onClick={() => setMode("general")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === "general"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>💡</span> Đa năng
          </button>
        </div>

        {/* RAG Context Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 font-medium select-none px-2 py-1">
          <input
            type="checkbox"
            checked={includeContext}
            onChange={(e) => setIncludeContext(e.target.checked)}
            className="w-4 h-4 rounded border-slate-400 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 bg-slate-800"
          />
          <span>Kèm ngữ cảnh tài liệu UniSynapse</span>
        </label>
      </div>

      {/* Preset Prompts (Quick Click) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSubmit(undefined, p.prompt, p.mode)}
            disabled={loading}
            className="text-left bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/90 rounded-xl p-3 transition-all hover:border-cyan-500/40 group flex flex-col justify-between"
          >
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-400 transition-colors">
              {p.title}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {p.prompt}
            </p>
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="bg-white/95 dark:bg-[#050914]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl min-h-[480px] max-h-[640px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-1 sm:pr-2 flex-grow">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex-shrink-0 mt-0.5">
                  9R
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 transition-all ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-md shadow-blue-500/10"
                    : msg.isError
                    ? "bg-red-500/10 border border-red-500/30 text-red-300 rounded-bl-none"
                    : "bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 rounded-bl-none shadow-sm"
                }`}
              >
                {/* Header for assistant message */}
                {msg.role === "assistant" && (
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono">
                        {msg.model || "cx/gpt-5.6-luna"}
                      </span>
                      {msg.elapsed !== undefined && (
                        <span>• {msg.elapsed}s</span>
                      )}
                      {msg.tokens !== undefined && (
                        <span>• {msg.tokens} tokens</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === msg.id ? "✓ Đã sao chép" : "Sao chép"}
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                  {msg.content}
                </div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Trích dẫn tài liệu:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] border border-cyan-500/20"
                        >
                          📄 {c.document_name} {c.page ? `(${c.page})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.role === "user" ? "text-blue-200" : "text-slate-400"
                  } text-right`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex-shrink-0 animate-pulse">
                9R
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>9Router đang xử lý qua <strong className="text-cyan-400 font-mono">cx/gpt-5.6-luna</strong>...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => handleSubmit(e)} className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="relative rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi Codex GPT-5 về code, bài toán giải thuật hoặc tóm tắt tài liệu... (Enter để gửi, Shift+Enter xuống dòng)"
              rows={2}
              disabled={loading}
              className="w-full bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 px-1 py-1"
            />
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Nhấn <strong>Enter</strong> để gửi • <strong>Shift+Enter</strong> xuống dòng
              </span>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="ml-auto btn-cyber-primary py-1.5 px-4 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang suy nghĩ...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi câu hỏi</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
