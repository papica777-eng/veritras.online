@echo off
color 0a
title AETERNA-QANTUM ENTROPY PURGER
echo ════════════════════════════════════════════════════════════
echo ⚡ INITIATING QANTUM ENTROPY PURGER ⚡
echo ════════════════════════════════════════════════════════════
echo Scanning directory for duplicates... (+90%% Similarity)
echo Renaming files to Sovereign Title Case...
echo.

:: Гледаме дали Node.js е инсталиран
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b
)

:: Извикваме скрипта
node "%~dp0QantumCleaner.js"

echo.
echo /// [ENTROPY: 0.00] ///
pause
