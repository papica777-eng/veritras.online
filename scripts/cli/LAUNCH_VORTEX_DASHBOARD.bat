@echo off
title VORTEX HIVE MIND - TACTICAL DASHBOARD
color 0A

echo ==================================================
echo      INITIALIZING VORTEX SYSTEM...
echo ==================================================
echo.
echo  Target: c:\Users\papic\Downloads\QAntumBVortex-main\QAntumBVortex-main
echo.

cd /d "c:\Users\papic\Downloads\QAntumBVortex-main\QAntumBVortex-main"

:: Set window size to be wide and tall (140 columns, 40 lines)
mode con: cols=140 lines=40

echo  Launching ThreadMaster...
echo.

call npx tsx src/core/concurrency/ThreadMaster.ts

echo.
echo ==================================================
echo      SYSTEM HALTED.
echo ==================================================
pause
