"use client";

import { useMemo, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import Link from "next/link";

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  university: string;
  contributions: number;
  unipoints: number;
  reputation: number;
  isCurrentUser?: boolean;
  avatarText: string;
  avatarGradient: string;
}

export default function Leaderboard() {
  const { user, unipoints, reputation } = useAppState();
  const [timeframe, setTimeframe] = useState<"week" | "all">("week");

  const leaderboardData = useMemo<LeaderboardUser[]>(() => {
    const rawPresets = [
      {
        id: "preset_1",
        name: "Nguyễn Anh",
        university: "UIT · CNTT",
        contributions: 48,
        unipoints: 7240,
        reputation: 98,
        avatarText: "NA",
        avatarGradient: "from-amber-500 to-amber-700",
      },
      {
        id: "preset_2",
        name: "Tuấn Kiệt",
        university: "HCMUT · CS",
        contributions: 41,
        unipoints: 6580,
        reputation: 95,
        avatarText: "TK",
        avatarGradient: "from-blue-600 to-indigo-700",
      },
      {
        id: "preset_3",
        name: "Phương Vy",
        university: "HUFLIT · IS",
        contributions: 37,
        unipoints: 5920,
        reputation: 94,
        avatarText: "PV",
        avatarGradient: "from-emerald-500 to-teal-700",
      },
      {
        id: "preset_4",
        name: "Minh Trí",
        university: "VHU · CNTT",
        contributions: 32,
        unipoints: 4810,
        reputation: 92,
        avatarText: "MT",
        avatarGradient: "from-violet-600 to-purple-800",
      },
      {
        id: "preset_5",
        name: "Bảo Ngọc",
        university: "UEH · AI",
        contributions: 28,
        unipoints: 4200,
        reputation: 90,
        avatarText: "BN",
        avatarGradient: "from-rose-500 to-pink-700",
      },
    ];

    // If user is logged in, insert user into leaderboard
    const userPoints = user ? Math.max(unipoints, 228) : 0;
    const userRep = user ? reputation : 100;
    const userContributions = user ? Math.max(12, Math.floor(userPoints / 50)) : 0;

    const list: Array<{
      id: string;
      name: string;
      university: string;
      contributions: number;
      unipoints: number;
      reputation: number;
      isCurrentUser?: boolean;
      avatarText: string;
      avatarGradient: string;
    }> = [...rawPresets];

    if (user) {
      list.push({
        id: user.id || "current_user",
        name: `Bạn (${user.username})`,
        university: "VHU · CNTT",
        contributions: userContributions,
        unipoints: userPoints,
        reputation: userRep,
        isCurrentUser: true,
        avatarText: user.username.slice(0, 2).toUpperCase(),
        avatarGradient: "from-cyan-500 to-blue-600",
      });
    }

    // Sort descending by unipoints
    list.sort((a, b) => b.unipoints - a.unipoints);

    // Limit to top 5 and assign rank
    return list.slice(0, 5).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [user, unipoints, reputation]);

  const maxPoints = leaderboardData[0]?.unipoints || 7240;

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-white/10 p-5 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 block mb-0.5">
            Bảng vinh danh sinh viên
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>🏆</span> Top Tri Thức Đóng Góp
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200 dark:border-white/5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setTimeframe("week")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              timeframe === "week"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Tuần này
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("all")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              timeframe === "all"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Toàn khóa
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2.5" role="list">
        {leaderboardData.map((item) => {
          const progressPercent = Math.min(100, Math.round((item.unipoints / maxPoints) * 100));

          return (
            <div
              key={item.id}
              role="listitem"
              className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                item.isCurrentUser
                  ? "bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-400/80 dark:border-cyan-500/50 shadow-xs ring-1 ring-cyan-400/30"
                  : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15"
              }`}
            >
              {/* Rank Medal / Number */}
              <div className="w-6 flex items-center justify-center flex-shrink-0 font-black font-mono">
                {item.rank === 1 ? (
                  <span className="text-amber-500 text-base" title="Hạng 1">🥇</span>
                ) : item.rank === 2 ? (
                  <span className="text-slate-400 text-base" title="Hạng 2">🥈</span>
                ) : item.rank === 3 ? (
                  <span className="text-amber-700 dark:text-amber-600 text-base" title="Hạng 3">🥉</span>
                ) : (
                  <span className={`text-xs ${item.isCurrentUser ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-slate-400 dark:text-slate-500"}`}>
                    #{item.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0`}
              >
                {item.avatarText}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  {item.isCurrentUser && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500 text-white uppercase tracking-wider">
                      Bạn
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {item.university} · {item.contributions} lượt đóng góp
                </p>
              </div>

              {/* Score & Energy Bar */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                  +{item.unipoints.toLocaleString("vi-VN")} <span className="text-[10px] text-slate-500 dark:text-slate-400">UP</span>
                </div>
                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1 ml-auto">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.rank === 1
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : item.rank === 2
                        ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                        : item.rank === 3
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                        : "bg-gradient-to-r from-cyan-400 to-blue-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Đóng góp nhãn hoặc tài liệu để thăng hạng</span>
        <Link
          href="/?tab=labeling"
          className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-0.5"
        >
          <span>Đóng góp ngay</span>
          <span>↗</span>
        </Link>
      </div>
    </div>
  );
}
