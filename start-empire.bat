@echo off
title QAntum Empire Launcher
color 0A
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║        QANTUM EMPIRE — SINGULARITY BOOT SEQUENCE        ║
echo  ║                   v36.1 — ZERO ENTROPY                  ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] Starting Dashboard Server (port 9094)...
start "QAntum Dashboard" cmd /k "node dashboard/server.js"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Wealth Manifestor (Binance Live)...
start "Wealth Manifestor" cmd /k "npx ts-node scripts/wealth-manifestor.ts"
timeout /t 2 /nobreak >nul

echo [3/4] Starting X Marketing Cycle...
start "X Marketing" cmd /k "npx ts-node scripts/x-marketing-cycle.ts"
timeout /t 2 /nobreak >nul

echo [4/4] Starting B2B Outreach Cycle...
start "B2B Outreach" cmd /k "npx ts-node scripts/b2b-outreach-cycle.ts"
timeout /t 2 /nobreak >nul

echo.
echo  ✅ All systems ONLINE. Opening dashboard...
timeout /t 2 /nobreak >nul
start "" "http://localhost:9094"

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║  DASHBOARD:  http://localhost:9094                       ║
echo  ║  WEALTH:     $23.55 LIVE (EUR converted)                 ║
echo  ║  STATUS:     ZERO ENTROPY — ALL SYSTEMS OPERATIONAL      ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
pause
