@echo off
setlocal EnableExtensions
chcp 65001 >nul
title UniSynapse - Khoi Chay Toan Bo He Thong (1-Click)
color 0B
cd /d "%~dp0"

echo =========================================================================
echo       UNISYNAPSE - STUDENT-POWERED ACADEMIC KNOWLEDGE NETWORK
echo             KHOI CHAY TOAN BO DU AN VOI 1 CLICK DUY NHAT
echo           (FastAPI + Next.js + SQLite RAG + Solana Devnet)
echo =========================================================================
echo.

REM 1. Kiem tra Python
set "PY_CMD="
where py >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_CMD=py"
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=python"
    )
)

if "%PY_CMD%"=="" (
    echo [LOI] Khong tim thay Python. Vui long cai dat Python 3.10+ tu https://python.org/
    echo ^(Nho tich chon "Add python.exe to PATH" khi cai dat^)
    pause
    exit /b 1
)

REM 2. Kiem tra Node.js & npm
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Node.js. Vui long cai dat Node.js 18+ tu https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay npm. Vui long cai dat lai Node.js.
    pause
    exit /b 1
)

echo [1/4] Kiem tra moi truong Python (.venv)...
if not exist ".venv\Scripts\python.exe" (
    echo       Chua co moi truong .venv. Dang tu dong tao .venv va cai dat dependencies...
    %PY_CMD% -m venv .venv
    if errorlevel 1 (
        echo [LOI] Khong the tao moi truong ao Python.
        pause
        exit /b 1
    )
    call ".venv\Scripts\python.exe" -m pip install --upgrade pip
    call ".venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
    if errorlevel 1 (
        echo [LOI] Cai dat dependencies Python that bai.
        pause
        exit /b 1
    )
    echo       [OK] Da tao .venv va cai dat thu vien Backend thanh cong!
) else (
    echo       [OK] Moi truong Python .venv da san sang.
)

echo.
echo [2/4] Kiem tra thu vien Frontend (node_modules)...
if not exist "frontend\node_modules" (
    echo       Chua co node_modules. Dang tu dong chay npm install...
    cd /d "%~dp0frontend"
    call npm install
    if errorlevel 1 (
        echo [LOI] Cai dat dependencies Frontend that bai.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
    echo       [OK] Da cai dat thu vien Frontend thanh cong!
) else (
    echo       [OK] Thu vien Frontend node_modules da san sang.
)

echo.
echo [3/4] Kiem tra cau hinh moi truong (.env)...
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        echo       [OK] Da tao file .env tu .env.example
    )
) else (
    echo       [OK] File cau hinh .env da san sang.
)

echo.
echo [4/4] Dang khoi dong dong thoi Backend va Frontend...
echo.
echo       - Dang bat Backend FastAPI tai http://127.0.0.1:8000 ...
start "UniSynapse Backend (FastAPI)" cmd /k "cd /d "%~dp0" ^&^& .venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

ping 127.0.0.1 -n 3 >nul

echo       - Dang bat Frontend Next.js tai http://localhost:3000 ...
start "UniSynapse Frontend (Next.js)" cmd /k "cd /d "%~dp0frontend" ^&^& npm run dev"

echo.
echo =========================================================================
echo  HE THONG UNISYNAPSE DA DUOC KHOI CHAY THANH CONG!
echo.
echo  Ä‘Å¸Å’Â Giao dien Nguoi Dung : http://localhost:3000
echo  Ä‘Å¸â€â€˜ Trang Quan Tri Admin : http://localhost:3000/admin
echo  Ä‘Å¸â€œÂ Tai Lieu API Swagger : http://localhost:8000/docs
echo  Ă¢ÂÂ¡ Mang Blockchain     : Solana Devnet
echo.
echo  Dang tu dong mo trinh duyet web...
echo  (De dung he thong: Dong 2 cua so terminal Backend va Frontend)
echo =========================================================================
echo.

ping 127.0.0.1 -n 5 >nul
start "" http://localhost:3000
exit /b 0
