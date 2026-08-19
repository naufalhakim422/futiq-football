@echo off
title FUTIQ FOOTBALL - Dev Server (Localhost:3000)
echo ========================================================
echo   FUTIQ FOOTBALL - GLOBAL SPORTS INTELLIGENCE PLATFORM
echo ========================================================
echo.
echo Menjalankan server Next.js di http://localhost:3000 ...
echo Jangan tutup jendela terminal ini agar localhost tetap aktif terus menerus!
echo.
cd /d "%~dp0"
npm run dev
pause
