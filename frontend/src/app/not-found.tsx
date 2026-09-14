import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-4xl shadow-xl backdrop-blur-xl">
          🔍
        </div>
        <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold tracking-wide uppercase">
          404
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
        Không tìm thấy trang yêu cầu
      </h1>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Đường dẫn bạn truy cập không tồn tại hoặc đã được tách biệt bảo mật khỏi hệ thống web client.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
      >
        <span>← Về trang chủ UniSynapse</span>
      </Link>
    </div>
  );
}
