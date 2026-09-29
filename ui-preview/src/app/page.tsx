"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import PreviewNavbar from "@/components/PreviewNavbar";
import ProfileCard from "@/components/ProfileCard";
import DataLabeling from "@/components/DataLabeling";
import DocumentUpload from "@/components/DocumentUpload";
import AITutorChat from "@/components/AITutorChat";
import ProofExplorer from "@/components/ProofExplorer";
import { useAppState } from "@/context/AppStateContext";

type PublicTab = "overview" | "challenges" | "learning" | "tutor" | "ledger" | "upload" | "labeling";
type Challenge = { title: string; domain: string; reward: string; difficulty: string; progress: number; color: string; icon: string };
type Activity = { id?: string; title: string; meta: string; amount?: string; tone: string; icon: string };

function SectionHeader({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return (
    <header className="preview-section-header">
      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
    </header>
  );
}

function Metric({ value, label, detail, tone, href }: { value: string; label: string; detail: React.ReactNode; tone: string; href?: string }) {
  const content = (
    <article className="preview-stat" style={{ "--stat-color": `var(--preview-${tone})` } as React.CSSProperties}>
      <span className="label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        {content}
      </Link>
    );
  }
  return content;
}

function ActivityRow({ item }: { item: Activity }) {
  return (
    <div className="preview-activity-row">
      <span className={`preview-activity-icon ${item.tone}`}>{item.icon}</span>
      <div>
        <strong>{item.title}</strong>
        <span>{item.meta}</span>
      </div>
      <b>{item.amount}</b>
    </div>
  );
}

function ChallengeCard({ challenge, onSelect }: { challenge: Challenge; onSelect: () => void }) {
  return (
    <button className="preview-challenge" onClick={onSelect}>
      <div>
        <span className={`preview-challenge-icon ${challenge.color}`}>{challenge.icon}</span>
        <small>{challenge.reward}</small>
      </div>
      <span className="preview-challenge-domain">{challenge.domain}</span>
      <h3>{challenge.title}</h3>
      <div className="preview-challenge-meta">
        <span>{challenge.difficulty}</span>
        <span>{challenge.progress}% hoàn tất</span>
      </div>
      <div className="preview-progress">
        <i style={{ width: `${challenge.progress}%` }} />
      </div>
      <strong>Xem nhiệm vụ →</strong>
    </button>
  );
}

export default function Home() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { activeTab, setActiveTab, user, tasks, documents, ledger, loading, error, authRequired } = useAppState();
  const activeView = activeTab === "dashboard" ? "overview" : activeTab;

  const challenges = useMemo<Challenge[]>(
    () =>
      tasks.map((task, index) => ({
        title: task.title,
        domain: task.domain || task.category,
        reward: `+${task.reward_points} UP`,
        difficulty: task.required_votes > 3 ? "Nâng cao" : task.required_votes > 1 ? "Trung bình" : "Cơ bản",
        progress:
          task.total_submissions && task.required_votes
            ? Math.min(100, Math.round((task.total_submissions / task.required_votes) * 100))
            : 0,
        color: (["violet", "cyan", "green", "amber"] as const)[index % 4],
        icon: (["✦", "⌁", "◈", "◎"] as const)[index % 4],
      })),
    [tasks]
  );

  const activities: Activity[] = useMemo(
    () => [
      ...documents.slice(0, 3).map((doc, idx) => ({
        id: `doc-${doc.id || idx}`,
        title: doc.original_name,
        meta: `${doc.status} · ${doc.chunk_count} đoạn tri thức`,
        amount: doc.status === "approved" ? "Đã duyệt" : "Đang xử lý",
        tone: doc.status === "approved" ? "green" : "amber",
        icon: "◉",
      })),
      ...ledger.slice(0, 3).map((entry, idx) => ({
        id: `led-${entry.id || idx}`,
        title: entry.reason,
        meta: `${entry.proof_status} · ${new Date(entry.created_at * 1000).toLocaleDateString("vi-VN")}`,
        amount: `${entry.delta > 0 ? "+" : ""}${entry.delta} UP`,
        tone: entry.delta >= 0 ? "cyan" : "amber",
        icon: "✓",
      })),
    ],
    [documents, ledger]
  );

  const go = (tab: PublicTab) => {
    setActiveTab(tab === "overview" ? "dashboard" : tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const empty = <div className="preview-empty">Chưa có dữ liệu thật cho khu vực này.</div>;

  return (
    <main className="preview-shell">
      <PreviewNavbar />
      <div className="preview-container">
        {activeView === "overview" && (
          <>
            <section className="preview-hero">
              <div className="preview-hero-copy">
                <span className="preview-eyebrow">
                  <i /> Lớp tri thức mở · Beta
                </span>
                <h1>
                  <span>Học tập cùng nhau.</span>
                  <br />
                  Xác minh mọi điều.
                </h1>
                <p>
                  UniSynapse biến đóng góp có chủ đích của sinh viên thành một mạng lưới tri thức học thuật sống động.
                  Gán nhãn dữ liệu, chia sẻ kiến thức và xây dựng AI Tutor bạn có thể tin tưởng.
                </p>
                <div className="preview-hero-actions">
                  <button className="preview-primary" onClick={() => go("challenges")}>
                    ▶ &nbsp;Khám phá nhiệm vụ ↗
                  </button>
                  <button className="preview-ghost" onClick={() => go("learning")}>
                    Xem lộ trình học
                  </button>
                </div>
                <div className="preview-hero-trust">
                  <div className="preview-avatars">
                    <i>AL</i>
                    <i>MK</i>
                    <i>TN</i>
                    <i>DL</i>
                    <i>+</i>
                  </div>
                  <span>
                    Được cộng đồng ngày càng lớn tin dùng — <b>Đóng góp và kiểm định tri thức</b>
                  </span>
                </div>
              </div>

              <div className="preview-network" aria-label="UniSynapse Orbital Knowledge Network">
                {/* 3 Active Orbital Rings with revolving light beacons */}
                <div className="preview-orbit-track track-1" aria-hidden="true">
                  <span className="preview-orbit-beacon beacon-cyan" />
                </div>
                <div className="preview-orbit-track track-2" aria-hidden="true">
                  <span className="preview-orbit-beacon beacon-green" />
                </div>
                <div className="preview-orbit-track track-3" aria-hidden="true">
                  <span className="preview-orbit-beacon beacon-amber" />
                </div>

                <div className="preview-core">
                  <Image src="/unisynapse-logo.jpg" alt="UniSynapse logo" width={88} height={88} priority />
                </div>
                <span className="preview-node preview-node-a">AI</span>
                <span className="preview-node preview-node-b">✓</span>
                <span className="preview-node preview-node-c">◈</span>
                <span className="preview-node preview-node-d">◎</span>
                <span className="preview-float one">✓ Đã xác minh</span>
                <span className="preview-float two">★ +50 pts earned</span>
              </div>
            </section>

            <section className="preview-section">
              <SectionHeader
                eyebrow="Không gian cá nhân"
                title="Dashboard của bạn"
                detail="Theo dõi tiến độ và đóng góp cá nhân"
              />
              {authRequired && (
                <div className="preview-auth-banner">
                  <div>
                    <strong>Đăng nhập để xem dữ liệu của bạn</strong>
                    <p>Kết nối tài khoản và ví Phantom để theo dõi đóng góp</p>
                  </div>
                  <div className="preview-hero-actions">
                    <Link className="preview-primary" href="/dang-nhap">
                      Đăng nhập ↗
                    </Link>
                    <Link className="preview-ghost" href="/dang-ky">
                      Tạo tài khoản
                    </Link>
                  </div>
                </div>
              )}
              <div className="preview-stat-grid">
                <Metric
                  label="Đóng góp của bạn"
                  value={authRequired ? "—" : `${ledger.filter((entry) => entry.delta > 0).length}`}
                  detail={loading ? "Đang tải dữ liệu thật…" : error ? "Dữ liệu chưa tải được" : "Từ sổ cái thật"}
                  tone="accent"
                />
                <Metric
                  label="Điểm tri thức"
                  value={authRequired ? "—" : `${user?.reputation ?? 0}`}
                  detail="Reputation từ database"
                  tone="green"
                />
                <Metric
                  label="Số dư UniPoints"
                  value={authRequired ? "—" : `${user?.unipoints ?? 0}`}
                  detail={<span>1 SOL = 1.000 UP · <b style={{ color: "var(--preview-amber)" }}>Nạp SOL ↗</b></span>}
                  tone="amber"
                  href="/vi"
                />
                <Metric
                  label="Tài liệu đã nộp"
                  value={authRequired ? "—" : `${documents.length}`}
                  detail="Tài liệu từ API"
                  tone="cyan"
                />
              </div>
            </section>

            <section className="preview-section">
              <SectionHeader eyebrow="Nhiệm vụ mở" title="Chọn đóng góp tiếp theo" />
              {challenges.length ? (
                <div className="preview-challenge-grid">
                  {challenges.map((challenge, index) => (
                    <ChallengeCard
                      key={`${challenge.title}-${index}`}
                      challenge={challenge}
                      onSelect={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </div>
              ) : (
                empty
              )}
            </section>

            <section className="preview-section preview-workspace-grid">
              <div className="preview-workspace">
                <SectionHeader eyebrow="Mạng lưới của bạn" title="Hoạt động gần đây" />
                {activities.length ? (
                  <div className="preview-activity-list">
                    {(showAll ? activities : activities.slice(0, 3)).map((item, index) => (
                      <ActivityRow key={item.id || index} item={item} />
                    ))}
                  </div>
                ) : (
                  empty
                )}
                <button className="preview-ghost" onClick={() => setShowAll((value) => !value)}>
                  {showAll ? "Thu gọn" : "Xem tất cả"}
                </button>
              </div>

              <div className="preview-workspace">
                <SectionHeader
                  eyebrow="Do sinh viên xây dựng"
                  title="Tri thức tăng giá trị khi được chia sẻ."
                  detail="Mỗi nhãn, nguồn và câu trả lời giúp trải nghiệm học tiếp theo đáng tin cậy hơn."
                />
                <button className="preview-primary" onClick={() => go("tutor")}>
                  Hỏi AI Tutor ↗
                </button>
              </div>
            </section>
          </>
        )}

        {activeView === "challenges" && (
          <section className="preview-section">
            <SectionHeader eyebrow="Không gian nhiệm vụ" title="Chọn nhiệm vụ đóng góp" />
            {challenges.length ? (
              <div className="preview-challenge-grid">
                {challenges.map((challenge, index) => (
                  <ChallengeCard
                    key={`${challenge.title}-${index}`}
                    challenge={challenge}
                    onSelect={() => setSelectedChallenge(challenge)}
                  />
                ))}
              </div>
            ) : (
              empty
            )}
          </section>
        )}

        {activeView === "labeling" && (
          <section className="preview-section">
            <SectionHeader
              eyebrow="Đóng góp dữ liệu"
              title="Gán nhãn dữ liệu"
              detail="Mỗi lựa chọn được gửi qua API và đối chiếu consensus thật."
            />
            <div className="preview-feature-grid">
              <ProfileCard />
              <DataLabeling />
            </div>
          </section>
        )}

        {activeView === "upload" && (
          <section className="preview-section">
            <SectionHeader
              eyebrow="Kho tri thức cộng đồng"
              title="Góp tài liệu"
              detail="Tài liệu đi qua pipeline kiểm định hiện tại."
            />
            <div className="preview-feature-grid">
              <ProfileCard />
              <DocumentUpload />
            </div>
          </section>
        )}

        {activeView === "learning" && (
          <section className="preview-section">
            <SectionHeader eyebrow="Trung tâm học tập" title="Xây dựng kỹ năng nghiên cứu bền vững" />
            <div className="preview-workspace">
              <h3>Tiếp tục lộ trình</h3>
              {documents.length ? (
                <div className="preview-doc-grid">
                  {documents.map((doc) => (
                    <article key={doc.id} className="preview-doc-card">
                      <small>{doc.status}</small>
                      <h3>{doc.original_name}</h3>
                      <p>
                        {doc.chunk_count} đoạn tri thức · {doc.size_bytes} bytes
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                empty
              )}
            </div>
          </section>
        )}

        {activeView === "tutor" && (
          <section className="preview-section">
            <SectionHeader
              eyebrow="Câu trả lời đã kiểm chứng"
              title="Hỏi AI Tutor"
              detail="Không thay đổi model, chi phí hay API hiện tại."
            />
            <AITutorChat />
          </section>
        )}

        {activeView === "ledger" && (
          <section className="preview-section">
            <SectionHeader eyebrow="Nguồn gốc công khai" title="Khám phá proof của bạn" />
            <div className="preview-feature-grid">
              <ProfileCard />
              <ProofExplorer />
            </div>
          </section>
        )}

        <footer className="preview-footer">
          <span>UniSynapse · Trí tuệ học thuật mở</span>
          <span>© 2026 · Solana Devnet · Preview UI</span>
        </footer>
      </div>

      {selectedChallenge && (
        <div className="preview-modal-backdrop" onClick={() => setSelectedChallenge(null)}>
          <div className="preview-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setSelectedChallenge(null)}>×</button>
            <small>{selectedChallenge.domain}</small>
            <h2>{selectedChallenge.title}</h2>
            <p>Nhiệm vụ đã sẵn sàng. Bạn có thể bắt đầu đóng góp bằng flow gán nhãn thật.</p>
            <button
              className="preview-primary"
              onClick={() => {
                setSelectedChallenge(null);
                go("labeling");
              }}
            >
              Bắt đầu đóng góp ↗
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
