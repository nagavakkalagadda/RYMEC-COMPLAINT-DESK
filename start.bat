@echo off
TITLE RYMEC Grievance Desk - Launch Server
echo ===================================================================
echo     RAO BAHADUR Y. MAHABALESWARAPPA ENGINEERING COLLEGE (RYMEC)
echo                   RYMEC GRIEVANCE DESK
echo ===================================================================
echo.
echo Starting Backend API on http://localhost:5000 ...
start "RYMEC Backend" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:5173 ...
start "RYMEC Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================================
echo   System running:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo   - PostgreSQL Cloud DB: Connected to Neon DB
echo ===================================================================
