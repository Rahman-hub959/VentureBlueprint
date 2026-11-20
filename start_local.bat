@echo off
setlocal
title VentureBlueprint Platform

echo ===================================================================
echo   VentureBlueprint: Regulatory Validation & Documentation System
echo   Single-Terminal Launcher (Localhost Only, No Network Exposure)
echo ===================================================================

:: Ensure backend venv python is used
set PYTHON_EXE=backend\.venv\Scripts\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

set PYTHONPATH=%CD%\backend

echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 (Background)...
start /B "" "%PYTHON_EXE%" -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000

:: Small wait for backend socket binding
timeout /t 2 /nobreak >nul

echo [2/2] Starting React Frontend on http://127.0.0.1:5173 (Foreground)...
echo.
echo ===================================================================
echo   Access the Application:
echo   - Web Application: http://127.0.0.1:5173
echo   - Backend Swagger: http://127.0.0.1:8000/docs
echo   - Standard Login:  founder@ventureblueprint.in / Founder@Venture2026!
echo   - Admin Portal:    admin@ventureblueprint.in / Admin@Venture2026!
echo ===================================================================
echo.
echo Running both backend and frontend inside this single terminal.
echo Press Ctrl+C to terminate both servers.
echo.

call npm run dev
