@echo off
chcp 65001 >nul
title UniSynapse — Public Internet Tunnel
color 0A

echo =========================================================================
echo       UNISYNAPSE — PHÁT HÀNH RA MẠNG INTERNET (CLOUDFLARE TUNNEL)
echo =========================================================================
echo.
echo Đang mở tunnel bảo mật ra internet toàn cầu...
cd /d "%~dp0"
.\cloudflared.exe tunnel --url http://localhost:3000
pause
