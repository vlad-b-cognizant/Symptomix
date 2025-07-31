@echo off
echo Starting Symptomix Healthcare App...
echo.

echo 1. Starting Backend Server...
cd /d "%~dp0server"
start "Symptomix Server" cmd /k "dotnet run --launch-profile http"

echo 2. Waiting for server startup...
timeout /t 3 /nobreak

echo 3. Opening Web Client...
start "" "%~dp0client\symptomix-web.html"

echo.
echo Symptomix is now running!
echo - Backend: http://localhost:5226
echo - Client: Opened in browser
echo.
pause
