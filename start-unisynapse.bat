@echo off
chcp 65001 >nul
title UniSynapse — Student-Powered Knowledge Network
color 0B

echo =========================================================================
echo       UNISYNAPSE — STUDENT-POWERED ACADEMIC KNOWLEDGE NETWORK
echo          (Backend FastAPI + Frontend Next.js + Solana Devnet)
echo =========================================================================
echo.
echo [1/3] Đang kiểm tra môi trường Python và Node.js...
py --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy Python 3. Vui lòng cài đặt Python 3.10+.
    pause
    exit /b
)
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy Node.js. Vui lòng cài đặt Node.js 18+.
    pause
    exit /b
)

echo [OK] Python và Node.js đã sẵn sàng.
echo.
echo [2/3] Đang khởi động Backend FastAPI Server tại http://127.0.0.1:8000 ...
start "UniSynapse Backend (FastAPI)" cmd /k "py -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [3/3] Đang khởi động Frontend Next.js tại http://localhost:3000 ...
cd /d "%~dp0frontend"
start "UniSynapse Frontend (Next.js)" cmd /k "npm run dev"

echo.
echo =========================================================================
echo  UniSynapse đã được khởi chạy thành công!
echo.
echo  - Frontend Web UI : http://localhost:3000
echo  - Admin Portal UI : http://localhost:3000/admin
echo  - Backend API Docs: http://127.0.0.1:8000/docs
echo  - Mạng Blockchain : Solana Devnet
echo =========================================================================
echo.
echo Đang mở trình duyệt web...
timeout /t 3 >nul
start http://localhost:3000
exit
