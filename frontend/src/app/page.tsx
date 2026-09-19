"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import DataLabeling from "@/components/DataLabeling";
import DocumentUpload from "@/components/DocumentUpload";
import AITutorChat from "@/components/AITutorChat";
import ProofExplorer from "@/components/ProofExplorer";
import VhuCourseCatalog from "@/components/VhuCourseCatalog";
import { useAppState } from "@/context/AppStateContext";


type PublicTab = "overview" | "challenges" | "learning" | "tutor" | "ledger" | "upload" | "labeling";
type Challenge = { title: string; domain: string; reward: string; difficulty: string; progress: number; color: string; icon: string };
type Track = { 
  title: string; 
  description: string; 
  lessons: number; 
  level: string; 
  accent: string; 
  icon: string;
  university?: string;
  subject_code?: string;
  subject_name?: string;
};
type Activity = { id?: string; title: string; meta: string; amount?: string; tone: string; icon: string };



function IconBubble({ children, tone = "cyan" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`icon-bubble icon-${tone}`}>{children}</span>;
}

function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <button className="text-action" onClick={onAction}>{action} <span>↗</span></button>}</div>;
}

function Metric({ value, label, detail, tone }: { value: string; label: string; detail: string; tone: string }) {
  return <article className={`metric-card metric-${tone}`}><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small><div className="metric-spark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></article>;
}

function ChallengeCard({ challenge, onSelect }: { challenge: Challenge; onSelect: () => void }) {
  return <button className={`challenge-card challenge-${challenge.color}`} onClick={onSelect}><div className="challenge-top"><IconBubble tone={challenge.color}>{challenge.icon}</IconBubble><span className="challenge-reward">{challenge.reward}</span></div><div className="challenge-copy"><span>{challenge.domain}</span><h3>{challenge.title}</h3></div><div className="challenge-meta"><span>{challenge.difficulty}</span><span>{challenge.progress}% hoàn tất</span></div><div className="progress-track"><i style={{ width: `${challenge.progress}%` }} /></div><div className="challenge-cta">Xem nhiệm vụ <span>→</span></div></button>;
}

function TrackCard({ track, onAction }: { track: Track; onAction?: () => void }) {
  return (
    <article className={`track-card track-${track.accent}`}>
      <div className="track-icon"><span>{track.icon}</span></div>
      <div className="track-body">
        <div className="track-line">
          <span className="eyebrow">{track.level}</span>
          <span>{track.lessons} đoạn tài liệu</span>
        </div>
        <h3>{track.title}</h3>
        {(track.university || track.subject_code) && (
          <div className="flex flex-wrap gap-1.5 my-1.5 text-[10px]">
            {track.university && (
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-medium">
                🏛️ {track.university}
              </span>
            )}
            {track.subject_code && (
              <span className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-medium">
                📚 {track.subject_code} {track.subject_name ? `- ${track.subject_name}` : ""}
              </span>
            )}
          </div>
        )}
        <p>{track.description}</p>
        <button className="track-button" onClick={onAction}>Tiếp tục lộ trình <span>→</span></button>
      </div>
    </article>
  );
}

function ActivityRow({ item }: { item: Activity }) {
  return <div className="activity-row"><IconBubble tone={item.tone}>{item.icon}</IconBubble><div className="activity-copy"><strong>{item.title}</strong><span>{item.meta}</span></div><b className={`activity-amount amount-${item.tone}`}>{item.amount}</b></div>;
}

export default function Home() {
  const [mounted] = useState(true);

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const { activeTab, setActiveTab, user, tasks, documents, ledger, loading, error, authRequired } = useAppState();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const hashParam = window.location.hash.replace("#", "");
      const target = tabParam || hashParam;
      if (target && ["dashboard", "overview", "challenges", "learning", "tutor", "ledger", "upload", "labeling"].includes(target)) {
        setActiveTab(target === "overview" ? "dashboard" : target);
      }
    };
    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, [setActiveTab]);

  const liveChallenges = useMemo<Challenge[]>(() => tasks.map((task, index) => ({
    title: task.title,
    domain: task.domain || task.category,
    reward: `+${task.reward_points} UP`,
    difficulty: task.required_votes > 3 ? "Nâng cao" : task.required_votes > 1 ? "Trung bình" : "Cơ bản",
    progress: task.total_submissions && task.required_votes ? Math.min(100, Math.round(task.total_submissions / task.required_votes * 100)) : 0,
    color: (["cyan", "violet", "emerald", "amber"] as const)[index % 4],
    icon: (["✦", "⌁", "◈", "◎"] as const)[index % 4],
  })), [tasks]);
  const liveActivities: Activity[] = useMemo(() => [
    ...documents.slice(0, 3).map((doc, idx) => ({ id: `doc-${doc.id || idx}`, title: doc.original_name, meta: doc.solana_tx ? `Solana Devnet (${doc.solana_tx.slice(0, 8)}...) · ${doc.chunk_count} đoạn` : `${doc.status} · ${doc.chunk_count} đoạn tri thức`, amount: doc.status === "approved" ? "⛓️ On-chain" : "Đang xử lý", tone: doc.status === "approved" ? "emerald" : "amber", icon: "◉" })),
    ...ledger.slice(0, 3).map((entry, idx) => ({ id: `led-${entry.id || idx}`, title: entry.reason, meta: entry.solana_signature ? `Solana Devnet (${entry.solana_signature.slice(0, 8)}...)` : `${entry.proof_status} · ${new Date(entry.created_at * 1000).toLocaleDateString("vi-VN")}`, amount: `${entry.delta > 0 ? "+" : ""}${entry.delta} UP`, tone: entry.delta >= 0 ? "cyan" : "amber", icon: "✓" })),
  ], [documents, ledger]);
  const challenges = liveChallenges;
  const tracks: Track[] = useMemo(() => {
    const vhuDocs = documents.filter(d => d.subject_code?.startsWith("VHU_") || d.id?.startsWith("doc_vhu"));
    const otherDocs = documents.filter(d => !d.subject_code?.startsWith("VHU_") && !d.id?.startsWith("doc_vhu"));
    return [...vhuDocs, ...otherDocs].map(doc => ({
      title: doc.original_name,
      description: `${doc.size_bytes} bytes`,
      lessons: doc.chunk_count,
      level: doc.status,
      accent: doc.subject_code?.startsWith("VHU_") ? "cyan" : "violet",
      icon: "◉",
      university: doc.university,
      subject_code: doc.subject_code,
      subject_name: doc.subject_name,
    }));
  }, [documents]);
  const activeView = activeTab === "dashboard" ? "overview" : activeTab;
  const visibleActivities = useMemo(() => showAllActivity ? liveActivities : liveActivities.slice(0, 3), [showAllActivity, liveActivities]);
  const goToTab = (tab: PublicTab) => {
    const tabId = tab === "overview" ? "dashboard" : tab;
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", tabId === "dashboard" ? "/" : `/?tab=${tabId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  if (!mounted) return <main className="loading-screen"><div className="loading-mark">WIT</div><span>Đang chuẩn bị không gian tri thức…</span></main>;
  return <main className="client-shell"><div className="client-glow client-glow-one" /><div className="client-glow client-glow-two" /><Navbar /><div className="client-container">
    <section className="welcome-bar"><div><span className="live-dot" /> <span>TRẠNG THÁI MẠNG: ĐANG HOẠT ĐỘNG</span><span className="welcome-divider">/</span><span>SEPT 14, 2026</span></div><button className="command-button">⌘ K <span>Bảng lệnh</span></button></section>
    {activeView === "overview" && (
      <>
        <section className="client-hero">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="kicker-line" /> LỚP TRI THỨC MỞ <span className="kicker-line" />
            </div>
            <h1>Học tập cùng nhau.<br /><em>Xác minh mọi điều.</em></h1>
            <p>UniSynapse turns focused student contribution into a living academic network. Label data, share knowledge, and build an AI tutor you can trust.</p>
            <div className="hero-actions">
              <button className="primary-action" onClick={() => goToTab("challenges")}>Khám phá nhiệm vụ <span>↗</span></button>
              <button className="secondary-action" onClick={() => goToTab("learning")}>Xem lộ trình học</button>
            </div>
            <div className="hero-trust">
              <span>Được cộng đồng ngày càng lớn tin dùng</span>
              <div className="avatar-stack"><i>AL</i><i>MK</i><i>TN</i><i>+</i></div>
              <b>Đóng góp và kiểm định tri thức</b>
            </div>
          </div>
          <div className="hero-orbit">
            <div className="orbit-ring orbit-ring-a" />
            <div className="orbit-ring orbit-ring-b" />
            <div className="orbit-center">
              <span>WIT</span>
              <small>LIVE<br />NETWORK</small>
            </div>
            <div className="orbit-node orbit-node-a">AI</div>
            <div className="orbit-node orbit-node-b">◎</div>
            <div className="orbit-node orbit-node-c">↗</div>
          </div>
        </section>

        {authRequired && (
          <section className="guest-access-banner" role="status">
            <div>
              <span className="eyebrow">KHÔNG GIAN CÁ NHÂN</span>
              <h2>Đăng nhập để xem dữ liệu của bạn</h2>
              <p>Nhiệm vụ, UniPoints, tài liệu và AI Tutor sẽ được tải theo đúng tài khoản của bạn.</p>
            </div>
            <div className="hero-actions">
              <Link className="primary-action" href="/dang-nhap">Đăng nhập <span>↗</span></Link>
              <Link className="secondary-action" href="/dang-ky">Tạo tài khoản</Link>
            </div>
          </section>
        )}

        <section className="metrics-grid">
          <Metric label="Đóng góp của bạn" value={authRequired ? "—" : `${ledger.filter((entry) => entry.delta > 0).length}`} detail={loading ? "Đang tải dữ liệu thật…" : authRequired ? "Đăng nhập để xem" : error ? "Dữ liệu chưa tải được" : "Từ sổ cái thật"} tone="cyan" />
          <Metric label="Điểm tri thức" value={authRequired ? "—" : `${user?.reputation ?? 0}`} detail={authRequired ? "Đăng nhập để xem" : "Reputation từ database"} tone="violet" />
          <Metric label="Số dư UniPoints" value={authRequired ? "—" : `${user?.unipoints ?? 0}`} detail={authRequired ? "Đăng nhập để xem" : "Số dư hiện tại"} tone="amber" />
          <Metric label="Tài liệu đã nộp" value={authRequired ? "—" : `${documents.length}`} detail={authRequired ? "Đăng nhập để xem" : "Tài liệu từ API"} tone="emerald" />
        </section>

        <section className="content-section">
          <SectionHeader eyebrow="Nhiệm vụ mở" title="Chọn đóng góp tiếp theo" action="Xem tất cả" />
          <div className="challenge-grid">
            {challenges.map((challenge, index) => (
              <ChallengeCard key={`${challenge.title}-${index}`} challenge={challenge} onSelect={() => setSelectedChallenge(challenge)} />
            ))}
          </div>
        </section>

        <section className="split-section">
          <div className="learning-column">
            <SectionHeader
              eyebrow="Kho học liệu chuẩn"
              title="19 Môn Chuyên Ngành CNTT (VHU)"
              action="Xem tất cả 19 môn"
              onAction={() => goToTab("learning")}
            />
            <div className="track-list">
              {tracks.slice(0, 4).map((track, index) => (
                <TrackCard
                  key={`${track.title}-${index}`}
                  track={track}
                  onAction={() => goToTab("learning")}
                />
              ))}
            </div>
            <button
              className="primary-action w-full mt-4 justify-center"
              onClick={() => goToTab("learning")}
            >
              Xem toàn bộ 19 giáo trình CNTT VHU <span>↗</span>
            </button>
          </div>
          <div className="activity-column">
            <SectionHeader
              eyebrow="Mạng lưới của bạn"
              title="Hoạt động gần đây"
              action={showAllActivity ? "Thu gọn" : "Xem tất cả"}
              onAction={() => setShowAllActivity(!showAllActivity)}
            />
            <div className="activity-list">
              {visibleActivities.map((item, index) => (
                <ActivityRow key={item.id || `${item.title}-${index}`} item={item} />
              ))}
            </div>
            <button className="activity-more" onClick={() => setShowAllActivity(!showAllActivity)}>
              {showAllActivity ? "Thu gọn" : "Tải thêm hoạt động"} <span>↓</span>
            </button>
          </div>
        </section>

        <section className="bottom-cta">
          <div>
            <span className="eyebrow">Do sinh viên xây dựng, dành cho mọi người</span>
            <h2>Tri thức của bạn có thể thúc đẩy mạng lưới.</h2>
            <p>Mỗi nhãn, nguồn và câu trả lời giúp trải nghiệm học tiếp theo đáng tin cậy hơn.</p>
          </div>
          <button className="primary-action" onClick={() => goToTab("tutor")}>Hỏi AI Tutor <span>↗</span></button>
        </section>
      </>
    )}
     {activeView === "challenges" && <section className="workspace-view"><SectionHeader eyebrow="Không gian nhiệm vụ" title="Chọn nhiệm vụ đóng góp" /><div className="challenge-grid">{liveChallenges.length ? liveChallenges.map((challenge, index) => <ChallengeCard key={`${challenge.title}-${index}`} challenge={challenge} onSelect={() => setSelectedChallenge(challenge)} />) : <div className="empty-state">Không có nhiệm vụ thật đang mở.</div>}</div></section>}
    {activeView === "labeling" && <section className="workspace-view"><SectionHeader eyebrow="Đóng góp dữ liệu" title="Gán nhãn dữ liệu" action="Nhiệm vụ đang mở" /><div className="workspace-tools workspace-tools-single"><ProfileCard /><DataLabeling /></div></section>}
    {activeView === "upload" && <section className="workspace-view"><SectionHeader eyebrow="Kho tri thức cộng đồng" title="Góp tài liệu" action="Tài liệu được kiểm định" /><div className="workspace-tools workspace-tools-single"><ProfileCard /><DocumentUpload /></div></section>}
    {activeView === "learning" && (
      <section className="workspace-view">
        <SectionHeader
          eyebrow="Trung tâm học tập"
          title="Chương Trình Đào Tạo 19 Môn Chuyên Ngành CNTT - Đại học Văn Hiến"
        />
        <VhuCourseCatalog
          documents={documents}
          onSelectCourseForTutor={(subjectCode) => {
            goToTab("tutor");
          }}
        />
        <div className="learning-callout">
          <IconBubble tone="violet">✦</IconBubble>
          <div>
            <h3>Tri thức học thuật mở, minh bạch và có thể kiểm chứng.</h3>
            <p>
              Toàn bộ 19 môn học chuyên ngành CNTT được chia nhỏ thành các đoạn tri thức chuẩn (RAG chunks), lưu trữ vĩnh viễn trên kho dữ liệu và bảo chứng tính toàn vẹn bằng chữ ký Solana Devnet.
            </p>
          </div>
        </div>
      </section>
    )}
    {activeView === "tutor" && <section className="workspace-view tutor-view"><SectionHeader eyebrow="Câu trả lời đã kiểm chứng" title="Hỏi AI Tutor (GPT-5.6 Luna)" /><AITutorChat /></section>}
    {activeView === "ledger" && <section className="workspace-view"><SectionHeader eyebrow="Nguồn gốc công khai" title="Khám phá proof của bạn" /><div className="ledger-layout"><ProfileCard /><ProofExplorer /></div></section>}
    <footer className="client-footer"><div className="footer-brand"><span className="brand-badge">WIT</span><strong>UniSynapse</strong><span>Trí tuệ học thuật mở.</span></div><div className="footer-links"><button onClick={() => goToTab("overview")}>Trang chủ</button><button onClick={() => goToTab("learning")}>Học tập</button><button onClick={() => goToTab("tutor")}>AI Tutor</button><button onClick={() => goToTab("ledger")}>Proof</button></div><span className="footer-copy">© 2026 · Solana Devnet</span></footer>
  </div>{selectedChallenge && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedChallenge(null)}><div className="challenge-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedChallenge(null)}>×</button><span className={`modal-icon icon-${selectedChallenge.color}`}>{selectedChallenge.icon}</span><span className="eyebrow">{selectedChallenge.domain}</span><h2>{selectedChallenge.title}</h2><p>Nhiệm vụ đã sẵn sàng để bạn đóng góp. Hãy xem ngữ cảnh, gửi nhãn và nhận UniPoints có thể xác minh.</p><div className="modal-stats"><span><b>{selectedChallenge.reward}</b> phần thưởng</span><span><b>{selectedChallenge.difficulty}</b> cấp độ</span><span><b>{selectedChallenge.progress}%</b> tiến độ mạng lưới</span></div><button className="primary-action modal-action" onClick={() => { setSelectedChallenge(null); setActiveTab("labeling"); }}>Bắt đầu đóng góp <span>↗</span></button></div></div>}</main>;
}
