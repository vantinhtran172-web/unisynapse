"use client";

import { useTheme, ThemeMode } from "../context/ThemeContext";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with identical geometry to avoid layout shift
    return (
      <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/60 dark:border-white/10 w-[108px] h-[34px]" />
    );
  }

  const options: { mode: ThemeMode; label: string; icon: string; title: string }[] = [
    {
      mode: "system",
      label: "Hệ thống",
      icon: "💻",
      title: `Theo hệ thống (${resolvedTheme === "dark" ? "Đang tối" : "Đang sáng"})`,
    },
    {
      mode: "light",
      label: "Sáng",
      icon: "☀️",
      title: "Chế độ sáng (Dễ nhìn ban ngày)",
    },
    {
      mode: "dark",
      label: "Tối",
      icon: "🌙",
      title: "Chế độ tối (Dịu mắt ban đêm)",
    },
  ];

  return (
    <div
      role="group"
      aria-label="Tùy chọn giao diện: Hệ thống, Sáng hoặc Tối"
      className="inline-flex items-center p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-800/90 border border-slate-300/80 dark:border-white/10 shadow-inner backdrop-blur-sm transition-colors"
    >
      {options.map((opt) => {
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setTheme(opt.mode)}
            title={opt.title}
            aria-pressed={isActive}
            className={`flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-white dark:bg-cyan-500/20 text-slate-900 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-cyan-400/30 font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-300/40 dark:hover:bg-slate-700/50"
            }`}
          >
            <span className="text-xs leading-none">{opt.icon}</span>
            <span className="hidden md:inline text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
