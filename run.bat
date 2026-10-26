@echo off
title MiraverseOSx Launcher
echo ========================================================
echo   Starting MiraverseOSx (Backend Port 5000 + Frontend Port 3000)
echo ========================================================
echo.

cd /d "%~dp0"

echo The backend will be built before both servers start.
echo Open http://localhost:3000 when Vite reports that it is ready.
echo Press Ctrl+C here to stop the game servers.
echo.

:: Use the shared startup command so a failed build stops startup and
:: both servers remain attached to this launcher instead of orphaned windows.
call npm start
if errorlevel 1 (
    echo.
    echo Startup failed. Review the error above.
    pause
    exit /b 1
)
