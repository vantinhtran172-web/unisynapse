@echo off
setlocal EnableExtensions
chcp 65001 >nul
title UniSynapse - Start Server
cd /d "%~dp0"

echo ================================================
echo   UniSynapse - Khoi dong nhanh Backend + Frontend
echo ================================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo [LOI] Chua co moi truong Python. Hay chay setup-unisynapse.bat truoc.
    pause
    exit /b 1
)
if not exist "frontend\node_modules" (
    echo [LOI] Chua co frontend dependencies. Hay chay setup-unisynapse.bat truoc.
    pause
    exit /b 1
)

if exist "backend\.env" set "BACKEND_ENV=backend\.env"

echo [1/2] Khoi dong Backend FastAPI tai http://localhost:8000 ...
start "UniSynapse Backend" cmd /k "cd /d "%~dp0" ^&^& .venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Khoi dong Frontend Next.js tai http://localhost:3000 ...
start "UniSynapse Frontend" cmd /k "cd /d "%~dp0frontend" ^&^& npm run dev"

timeout /t 4 /nobreak >nul
start "" http://localhost:3000

echo.
echo Da khoi dong xong.
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3000/admin
echo API Docs: http://localhost:8000/docs
echo.
echo Dong 2 cua so Backend va Frontend de dung server.
pause
exit /b 0
