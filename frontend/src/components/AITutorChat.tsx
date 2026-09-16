"use client";

import { useState, useRef, useEffect } from "react";
import { api, Citation } from "../lib/api";

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  citations?: Citation[];
  grounded?: boolean;
  engine?: string;
  sourceType?: string;
  sourceLabel?: string;
};

export default function AITutorChat() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'ai', 
      content: "Chào bạn! Tôi là UniSynapse AI Tutor vận hành bởi mô hình GPT-5.6 Luna. Hãy đặt câu hỏi về bài giảng, tài liệu học tập hoặc kiến thức chung (chi phí: 80 UniPoints/lượt).",
      grounded: false
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [ragStatus, setRagStatus] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  // AI model selection (default: GPT-5.6 Luna)
  const [geminiModel, setGeminiModel] = useState<string>("cx/gpt-5.6-luna");
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const handleSaveGeminiConfig = () => {
    setShowConfigModal(false);
  };

  const handleClearGeminiConfig = () => {
    setShowConfigModal(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isTyping) return;

    const userMsg: Message = { id: `user-${++messageIdRef.current}`, role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Realistic RAG pipeline status feedback
    setRagStatus("Đang chờ phản hồi từ máy chủ…");

    try {
      const res = await api.askTutor(q, geminiModel);
      const aiMsg: Message = {
        id: `ai-${++messageIdRef.current}`,
        role: 'ai',
        content: res.answer,
        citations: res.citations,
        grounded: res.grounded,
        engine: res.engine,
        sourceType: res.source_type,
        sourceLabel: res.source_label,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setMessages(prev => [
        ...prev,
        {
          id: `error-${++messageIdRef.current}`,
          role: 'ai',
          content: errorMessage.toLowerCase().includes("unipoints") || errorMessage.toLowerCase().includes("điểm")
            ? `⚠️ ${errorMessage} Bạn hãy đóng góp thêm tài liệu học tập hoặc nạp SOL Devnet để nhận UniPoints!`
            : `Lỗi kết nối tới máy chủ AI Tutor: ${errorMessage}. Vui lòng thử lại sau!`,
          grounded: false
        }
      ]);
    } finally {
      setIsTyping(false);
      setRagStatus(null);
    }
  };

  const sampleQuestions = [
    "Bản chất của con trỏ (pointers) trong C là gì?",
    "Hàm malloc() và free() hoạt động ra sao và tại sao cần giải phóng bộ nhớ?",
    "Điều kiện tối thiểu để qua môn CS101 là gì?",
    "Tàu Apollo 11 bay lên mặt trăng năm nào? (Câu hỏi thử nghiệm từ chối)"
  ];

  return (
    <div className="glass-panel flex flex-col h-[660px] overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-slate-800/60 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 p-[1px] shadow-sm flex-shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center font-black text-cyan-400 text-[10px]">
              WIT
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">UniSynapse AI Tutor (GPT-5.6 Luna)</h2>
            </div>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 inline-block animate-pulse"></span>
              Vận hành bởi GPT-5.6 Luna • Đối chiếu kho học liệu kiểm định
            </p>
          </div>
        </div>

        {/* Server-managed AI engine settings & Cost badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1 shadow-sm">
            🪙 80 UniPoints/lượt
          </span>
          <button
            onClick={() => setShowConfigModal(true)}
            className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all shadow-sm bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-200 border-cyan-200 dark:border-cyan-500/40"
            title="Cấu hình mô hình AI"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></span>
            <span className="font-semibold">⚡ GPT-5.6 Luna</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                : 'bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</div>

              {/* Source attribution */}
              {msg.sourceType === "ai_outside_knowledge_base" && msg.role === 'ai' && (
                <div className="mt-2.5 pt-2 border-t border-amber-300/40 dark:border-amber-500/20 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-400/50 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span>
                      ⚠️ Nguồn từ AI — Không có trong tài liệu
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 pl-1 font-medium">
                    {msg.sourceLabel || "Câu trả lời từ GPT-5.6 Luna (ngoài kho tài liệu học liệu UniSynapse — cần kiểm chứng thêm)"}
                  </p>
                </div>
              )}

              {/* Engine Badge */}
              {msg.engine && msg.role === 'ai' && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center">
                  {msg.engine.includes("Luna") || msg.engine.includes("5.6") || msg.engine.includes("cx/") || msg.engine.includes("9router") ? (
                    msg.sourceType === "ai_outside_knowledge_base" ? (
                      <span className="text-[10px] text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        ⚡ GPT-5.6 Luna • Trả lời tự do ngoài tài liệu
                      </span>
                    ) : (
                      <span className="text-[10px] text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        ⚡ GPT-5.6 Luna (Grounded RAG)
                      </span>
                    )
                  ) : msg.sourceType === "ai_outside_knowledge_base" ? (
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
                      🤖 Google Gemini ({msg.engine}) • Trả lời tự do ngoài tài liệu
                    </span>
                  ) : msg.engine.includes("gemini") ? (
                    <span className="text-[10px] text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400"></span>
                      🧠 Trợ lý Sư phạm Google {msg.engine} (Grounded RAG)
                    </span>
                  ) : (
                    <span className="text-[10px] text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                      📚 Trích xuất Trực tiếp Học liệu Kiểm định
                    </span>
                  )}
                </div>
              )}

              {/* Citations list */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">
                    Nguồn Kiểm Định (Citations):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCitation(c)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-500/40 hover:border-blue-400 text-blue-700 dark:text-blue-300 py-1 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors text-left"
                      >
                        <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <span className="font-medium truncate max-w-[180px]">{c.document_name}</span>
                        <span className="text-[10px] bg-blue-200/60 dark:bg-blue-500/20 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200 font-mono">
                          {c.page}
                        </span>
                        {(c.solana_tx || c.explorer_url) && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-mono font-semibold border border-emerald-500/20" title="Đã neo bằng chứng trên Solana Devnet">
                            ⛓️ SOL
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start gap-2">
            {ragStatus && (
              <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 max-w-[85%] animate-pulse shadow-sm">
                <div className="w-3.5 h-3.5 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                {ragStatus}
              </div>
            )}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-sm p-3.5 flex gap-1 w-14 shadow-sm">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Citation Modal / Detail Popup */}
      {activeCitation && (
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-blue-200 dark:border-blue-500/30 flex items-start justify-between gap-3 text-xs">
          <div className="overflow-hidden flex-grow">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                📄 Đoạn trích từ: {activeCitation.document_name} ({activeCitation.page})
              </span>
              {(activeCitation.explorer_url || activeCitation.solana_tx) && (
                <a
                  href={activeCitation.explorer_url || `https://explorer.solana.com/tx/${activeCitation.solana_tx}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full hover:underline flex items-center gap-1 font-mono font-semibold"
                  title="Mở giao dịch trên Solana Explorer Devnet"
                >
                  <span>⛓️</span> Verified on Solana Devnet ↗
                </a>
              )}
            </div>
            <p className="text-slate-700 dark:text-slate-300 mt-1 italic line-clamp-2">
               &quot;{activeCitation.excerpt}&quot;
            </p>
          </div>
          <button 
            onClick={() => setActiveCitation(null)}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Prompt Pills */}
      <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/5 overflow-x-auto flex gap-2">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="text-[11px] bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white py-1 px-2.5 rounded-full whitespace-nowrap border border-slate-200 dark:border-white/5 transition-colors shadow-xs"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-slate-800/40">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI Tutor (GPT-5.6 Luna) về bài giảng, thuật toán, câu hỏi ôn tập..."
            className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-full py-2.5 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 shadow-sm transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 bg-blue-600 hover:bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>

      {/* Server-managed AI Configuration Modal */}
      {showConfigModal && (
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Cấu hình AI Tutor</h3>
                <p className="text-[11px] text-cyan-700 dark:text-cyan-300">Vận hành bởi GPT-5.6 Luna kết hợp kho học liệu kiểm định</p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm p-1"
                aria-label="Đóng cấu hình AI Tutor"
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              API credentials được quản lý an toàn ở backend và không được nhập, lưu hoặc gửi từ trình duyệt.
              Mặc định hệ thống sử dụng mô hình <strong>GPT-5.6 Luna</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block text-xs" htmlFor="tutor-model">Mô hình:</label>
              <select
                id="tutor-model"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="cx/gpt-5.6-luna">⚡ GPT-5.6 Luna (Mặc định)</option>
                <option value="gemini-flash-latest">✦ Google Gemini Flash</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={handleClearGeminiConfig}
                className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 transition-colors"
              >
                Đặt lại
              </button>
              <button
                onClick={handleSaveGeminiConfig}
                className="bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-4 text-xs font-semibold rounded-lg shadow-md transition-colors"
              >
                Lưu model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
