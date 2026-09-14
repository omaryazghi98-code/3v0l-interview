@echo off
setlocal
cd /d "%~dp0"

echo.
echo ========================================
echo        3V0L INTERVIEW COPILOT
 echo ========================================
echo.

if not exist "copilot\.env" (
  echo [ERROR] copilot\.env is missing.
  echo Create it before starting 3V0L.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js was not found in PATH.
  pause
  exit /b 1
)

if not exist "copilot\node_modules" (
  echo [SETUP] Installing copilot dependencies...
  call npm.cmd --prefix copilot install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":38471" ^| findstr "LISTENING"') do set HTTPPID=%%P
if defined HTTPPID (
  echo [INFO] 3V0L relay already appears to be running as PID %HTTPPID%.
) else (
  echo [START] Starting 3V0L relay...
  start "3V0L Relay" cmd /k "cd /d "%~dp0copilot" && node --env-file=.env .\server.mjs"
  timeout /t 2 /nobreak >nul
)

echo [START] Opening 3V0L Command Center...
start "" "%~dp0index.html"

echo [INFO] Remote: http://localhost:38471/remote
 echo [INFO] Audio/STT port: 38472
 echo.
echo 3V0L is ready. Leave the relay window running during the interview.
echo.
pause
