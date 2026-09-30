@echo off
title LUMIQ AI - Launcher
cd /d "%~dp0"
echo ==============================================
echo   Launching LUMIQ AI (Backend + Frontend)...
echo ==============================================
start "LUMIQ AI - Backend" cmd /c "run-backend.bat"
timeout /t 2 /nobreak >nul
start "LUMIQ AI - Frontend" cmd /c "run-frontend.bat"
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo Application launched!
