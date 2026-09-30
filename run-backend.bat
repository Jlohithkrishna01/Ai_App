@echo off
title LUMIQ AI - Backend
cd /d "%~dp0backend"
echo ==============================================
echo   Starting LUMIQ AI Backend Server...
echo ==============================================
".\venv\Scripts\python.exe" run.py
pause
