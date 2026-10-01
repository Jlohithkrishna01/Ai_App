@echo off
title LUMIQ AI - Frontend
cd /d "%~dp0frontend"
echo ==============================================
echo   Starting LUMIQ AI Frontend (Vite)...
echo ==============================================
if not exist "node_modules\" (
    echo [INFO] Dependencies not detected. Running npm install...
    call npm install
)
call npm run dev
pause
