@echo off
setlocal EnableExtensions
chcp 65001 >nul
title UniSynapse — Khởi Chạy Toàn Bộ Hệ Thống (1-Click)
color 0B
cd /d "%~dp0"

echo =========================================================================
echo       UNISYNAPSE — STUDENT-POWERED ACADEMIC KNOWLEDGE NETWORK
echo             KHỞI CHẠY TOÀN BỘ DỰ ÁN VỚI 1 CLICK DUY NHẤT
echo           (FastAPI + Next.js + SQLite RAG + Solana Devnet)
echo =========================================================================
echo.

:: 1. Kiểm tra Python
where py >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_CMD=py"
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=python"
    ) else (
        echo [LỖI] Không tìm thấy Python. Vui lòng cài đặt Python 3.10+ từ https://python.org/
        echo (Nhớ tích chọn "Add python.exe to PATH" khi cài đặt)
        pause
        exit /b 1
    )
)

:: 2. Kiểm tra Node.js & npm
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy Node.js. Vui lòng cài đặt Node.js 18+ từ https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy npm. Vui lòng cài đặt lại Node.js.
    pause
    exit /b 1
)

echo [1/4] Kiểm tra môi trường Python (.venv)...
if not exist ".venv\Scripts\python.exe" (
    echo       Chưa có môi trường .venv. Đang tự động tạo .venv và cài đặt dependencies...
    %PY_CMD% -m venv .venv
    if %errorlevel% neq 0 (
        echo [LỖI] Không thể tạo môi trường ảo Python.
        pause
        exit /b 1
    )
    call ".venv\Scripts\python.exe" -m pip install --upgrade pip
    call ".venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
    if %errorlevel% neq 0 (
        echo [LỖI] Cài đặt dependencies Python thất bại.
        pause
        exit /b 1
    )
    echo       [OK] Đã tạo .venv và cài đặt thư viện Backend thành công!
) else (
    echo       [OK] Môi trường Python (.venv) đã sẵn sàng.
)

echo.
echo [2/4] Kiểm tra thư viện Frontend (node_modules)...
if not exist "frontend\node_modules" (
    echo       Chưa có node_modules. Đang tự động chạy npm install...
    cd /d "%~dp0frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo [LỖI] Cài đặt dependencies Frontend thất bại.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
    echo       [OK] Đã cài đặt thư viện Frontend thành công!
) else (
    echo       [OK] Thư viện Frontend (node_modules) đã sẵn sàng.
)

echo.
echo [3/4] Kiểm tra cấu hình môi trường (.env)...
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        echo       [OK] Đã tạo file .env từ .env.example
    )
) else (
    echo       [OK] File cấu hình .env đã sẵn sàng.
)

echo.
echo [4/4] Đang khởi động đồng thời Backend và Frontend...
echo.
echo       - Đang bật Backend FastAPI tại http://127.0.0.1:8000 ...
start "UniSynapse Backend (FastAPI)" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo       - Đang bật Frontend Next.js tại http://localhost:3000 ...
start "UniSynapse Frontend (Next.js)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =========================================================================
echo  HỆ THỐNG UNISYNAPSE ĐÃ ĐƯỢC KHỞI CHẠY THÀNH CÔNG!
echo.
echo  🌐 Giao diện Người Dùng : http://localhost:3000
echo  🔑 Trang Quản Trị Admin : http://localhost:3000/admin
echo  📚 Tài Liệu API Swagger : http://localhost:8000/docs
echo  ⚡ Mạng Blockchain     : Solana Devnet
echo.
echo  Đang tự động mở trình duyệt web...
echo  (Để dừng hệ thống: Đóng 2 cửa sổ terminal Backend và Frontend)
echo =========================================================================
echo.

timeout /t 3 /nobreak >nul
start "" http://localhost:3000
exit /b 0
