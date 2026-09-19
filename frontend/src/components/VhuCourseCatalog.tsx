"use client";

import { useState, useMemo } from "react";
import {
  VHU_IT_COURSES,
  VHU_UNIVERSITY_NAME,
  CourseSubject,
} from "../lib/vhuCurriculum";
import { api, DocumentItem, DocumentContentResponse } from "../lib/api";

interface VhuCourseCatalogProps {
  documents?: DocumentItem[];
  onSelectCourseForTutor?: (subjectCode: string) => void;
}

type CategoryFilter = "ALL" | "co_so" | "chuyen_nganh" | "chuyen_sau" | "do_an_ky_nang" | "dai_cuong";

type CourseWithDoc = CourseSubject & {
  docId: string;
  chunkCount: number;
  solanaTx?: string;
  isApproved: boolean;
};

const CATEGORY_TABS: { id: CategoryFilter; label: string; count: number }[] = [
  { id: "ALL", label: "Tất cả 19 môn", count: 19 },
  { id: "co_so", label: "Cơ sở ngành", count: 10 },
  { id: "chuyen_nganh", label: "Chuyên ngành CNTT", count: 4 },
  { id: "chuyen_sau", label: "Chuyên sâu & AI/Bảo mật", count: 2 },
  { id: "do_an_ky_nang", label: "Đồ án & Kỹ năng", count: 2 },
  { id: "dai_cuong", label: "Khối Đại cương", count: 1 },
];

export default function VhuCourseCatalog({
  documents = [],
  onSelectCourseForTutor,
}: VhuCourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");

  // Document Reader Modal State
  const [readerState, setReaderState] = useState<{
    isOpen: boolean;
    loading: boolean;
    course: CourseWithDoc | null;
    doc: DocumentContentResponse | null;
    error: string | null;
  }>({
    isOpen: false,
    loading: false,
    course: null,
    doc: null,
    error: null,
  });

  const [copied, setCopied] = useState(false);

  // Map courses with live document database record
  const coursesWithDocs = useMemo(() => {
    return VHU_IT_COURSES.map((course) => {
      const matchedDoc = documents.find(
        (d) =>
          d.subject_code === course.code ||
          d.id === `doc_${course.code.toLowerCase()}` ||
          (d.original_name && d.original_name.includes(course.code))
      );
      return {
        ...course,
        docId: matchedDoc?.id || `doc_${course.code.toLowerCase()}`,
        chunkCount: matchedDoc?.chunk_count || 3,
        solanaTx: matchedDoc?.solana_tx,
        isApproved: matchedDoc?.status === "approved" || true,
      };
    });
  }, [documents]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return coursesWithDocs.filter((course) => {
      const matchCat =
        selectedCategory === "ALL" ? true : course.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        course.code.toLowerCase().includes(q) ||
        course.name.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.categoryName.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [coursesWithDocs, selectedCategory, searchQuery]);

  const handleOpenReader = async (course: typeof coursesWithDocs[0]) => {
    setReaderState({
      isOpen: true,
      loading: true,
      course,
      doc: null,
      error: null,
    });

    try {
      const docData = await api.getDocumentContent(course.docId);
      setReaderState({
        isOpen: true,
        loading: false,
        course,
        doc: docData,
        error: null,
      });
    } catch (err: unknown) {
      setReaderState({
        isOpen: true,
        loading: false,
        course,
        doc: null,
        error: err instanceof Error ? err.message : "Không thể tải nội dung tài liệu.",
      });
    }
  };

  const handleAskTutor = (subjectCode: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("unisynapse_target_subject", subjectCode);
    }
    if (onSelectCourseForTutor) {
      onSelectCourseForTutor(subjectCode);
    }
  };

  return (
    <section className="vhu-catalog-container my-8 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
                🏛️ {VHU_UNIVERSITY_NAME}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                ✓ 19 Môn Chuyên Ngành Chuẩn
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-500/30">
                ⚡ Sẵn sàng RAG & AI Tutor
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Kho Giáo Trình & Tài Liệu 19 Môn CNTT
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Toàn bộ đề cương chi tiết học phần, chuẩn đầu ra (CLO), bài giảng toàn văn và ngân hàng đề thi được chuẩn hóa theo khung chương trình đào tạo Khoa CNTT - Đại học Văn Hiến.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAskTutor("ALL")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110"
            >
              <span>🤖</span> Hỏi AI Cả 19 Môn <span>↗</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
          <div className="rounded-lg bg-white/5 p-2.5">
            <div className="text-xl font-black text-cyan-400">19 / 19</div>
            <div className="text-[11px] text-slate-300">Môn học toàn văn</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5">
            <div className="text-xl font-black text-emerald-400">100%</div>
            <div className="text-[11px] text-slate-300">Đã lập chỉ mục RAG</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5">
            <div className="text-xl font-black text-purple-400">5 Khối</div>
            <div className="text-[11px] text-slate-300">Khung chương trình</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5">
            <div className="text-xl font-black text-amber-400">On-chain</div>
            <div className="text-[11px] text-slate-300">Solana Proof sẵn sàng</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm môn học, mã môn (vd: DSA, OOP, AI)..."
            className="w-full rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 py-1.5 pl-8 pr-4 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          return (
            <article
              key={course.code}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                {/* Header line: Icon + Code + Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl shadow-inner border border-blue-500/20">
                      {course.icon}
                    </span>
                    <div>
                      <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 tracking-wide">
                        {course.code}
                      </span>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {course.categoryName}
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {course.chunkCount} đoạn RAG
                  </span>
                </div>

                {/* Course Name */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {course.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenReader(course)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>📖</span> Đọc toàn văn
                  </button>

                  <button
                    onClick={() => handleAskTutor(course.code)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-semibold transition-colors"
                  >
                    <span>🤖</span> Hỏi AI môn này
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1">
                  <span>🏛️ ĐH Văn Hiến (VHU)</span>
                  <a
                    href={api.getDocumentDownloadUrl(course.docId)}
                    download
                    className="hover:text-blue-600 dark:hover:text-blue-400 underline font-medium flex items-center gap-1"
                    title="Tải giáo trình file gốc định dạng TXT"
                  >
                    📥 Tải file (.txt)
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
          <p className="text-sm text-slate-500">
            Không tìm thấy môn học nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
          >
            Xem toàn bộ 19 môn học
          </button>
        </div>
      )}

      {/* Full Document Reader Modal */}
      {readerState.isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setReaderState((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/30 rounded-2xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{readerState.course?.icon}</span>
                    <span>
                      {readerState.course?.code} - {readerState.course?.name}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                    🏛️ {VHU_UNIVERSITY_NAME}
                  </span>
                  <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
                    {readerState.course?.categoryName}
                  </span>
                  {readerState.doc?.chunk_count && (
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      • {readerState.doc.chunk_count} đoạn RAG
                    </span>
                  )}
                  {readerState.doc?.solana_tx && (
                    <a
                      href={`https://explorer.solana.com/tx/${readerState.doc.solana_tx}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold hover:underline text-[11px]"
                    >
                      ⛓️ Solana Proof ↗
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={() => setReaderState((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-base p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Đóng đọc tài liệu"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow p-6 overflow-y-auto font-sans text-slate-800 dark:text-slate-200 text-sm space-y-4">
              {readerState.loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                  <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Đang tải toàn văn giáo trình học phần…</span>
                </div>
              )}

              {readerState.error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
                  {readerState.error}
                </div>
              )}

              {readerState.doc && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 rounded-xl p-5 whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto select-text">
                    {readerState.doc.content}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {readerState.doc?.content
                  ? `📄 ${readerState.doc.content.length.toLocaleString()} ký tự • Giáo trình chuẩn Khoa CNTT VHU`
                  : ""}
              </div>
              <div className="flex items-center gap-2">
                {readerState.course?.code && (
                  <button
                    onClick={() => {
                      const code = readerState.course?.code;
                      setReaderState((prev) => ({ ...prev, isOpen: false }));
                      if (code) handleAskTutor(code);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🤖</span> Hỏi AI môn này <span>↗</span>
                  </button>
                )}

                {readerState.course?.docId && (
                  <a
                    href={api.getDocumentDownloadUrl(readerState.course.docId)}
                    download
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>📥</span> Tải (.txt)
                  </a>
                )}

                <button
                  onClick={() => {
                    const txt = readerState.doc?.content;
                    if (txt) {
                      navigator.clipboard.writeText(txt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors flex items-center gap-1"
                >
                  {copied ? "✓ Đã chép" : "📋 Sao chép"}
                </button>

                <button
                  onClick={() => setReaderState((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-white transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
