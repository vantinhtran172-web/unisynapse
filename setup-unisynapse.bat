@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ================================================
echo   UniSynapse - Cai dat moi truong nhanh
echo ================================================
echo.

where py >nul 2>&1
if errorlevel 1 (
    echo [LOI] Chua tim thay Python Launcher ^(py^).
    echo Cai Python 3.11+ tu https://www.python.org/downloads/
    echo Nho chon "Add python.exe to PATH" khi cai dat.
    pause
    exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
    echo [LOI] Chua tim thay Node.js.
    echo Cai Node.js 20+ tu https://nodejs.org/
    pause
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [LOI] Chua tim thay npm. Hay cai lai Node.js.
    pause
    exit /b 1
)

echo [1/5] Kiem tra phien ban cong cu...
py --version
node --version
npm --version

if not exist ".venv\Scripts\python.exe" (
    echo [2/5] Tao moi truong Python .venv...
    py -3 -m venv .venv
    if errorlevel 1 (
        echo [LOI] Khong tao duoc moi truong Python.
        pause
        exit /b 1
    )
) else echo [2/5] .venv da ton tai - bo qua.

echo [3/5] Cai dependency backend...
call ".venv\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 goto :pip_error
call ".venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
if errorlevel 1 goto :pip_error

echo [4/5] Cai dependency frontend...
if not exist "frontend\package.json" (
    echo [LOI] Khong tim thay frontend\package.json.
    pause
    exit /b 1
)
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 goto :npm_error
cd /d "%~dp0"

echo [5/5] Chay migration database neu co...
if exist "alembic.ini" (
    call ".venv\Scripts\python.exe" -m alembic -c alembic.ini upgrade head
    if errorlevel 1 echo [CANH BAO] Migration that bai - kiem tra .env va database.
) else echo Khong tim thay alembic.ini - bo qua.

echo.
echo CAI DAT HOAN TAT
 echo Backend:  .venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
echo Frontend: cd frontend ^&^& npm run dev
echo Swagger:  http://localhost:8000/docs
echo.
pause
exit /b 0

:pip_error
echo [LOI] Cai dependency Python that bai.
pause
exit /b 1

:npm_error
echo [LOI] Cai dependency frontend that bai.
cd /d "%~dp0"
pause
exit /b 1
