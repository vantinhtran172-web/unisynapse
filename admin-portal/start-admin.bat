@echo off
title WIT Enterprise Admin Portal
echo ========================================================
echo   WIT ENTERPRISE ADMIN OPERATIONS CONSOLE (ISOLATED)
echo ========================================================
echo.
echo Dang khoi dong cong quan tri rieng biet tren cong 8088...
echo.

cd /d "%~dp0"
if exist "..\.venv\Scripts\python.exe" (
    ..\.venv\Scripts\python.exe server.py --open
) else (
    python server.py --open
)

pause
