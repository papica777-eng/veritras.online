@echo off
title QANTUM VORTEX: GOD MODE ENGINE (PERMANENT)
color 0a
echo.
echo    /$$$$$$   /$$$$$$  /$$   /$$ /$$$$$$$$ /$$   /$$ /$$      /$$
echo   /$$__  $$ /$$__  $$| $$$ | $$|__  $$__/| $$  | $$| $$$    /$$$
echo  | $$  \ $$| $$  \ $$| $$$$| $$   | $$   | $$  | $$| $$$$  /$$$$
echo  | $$  | $$| $$$$$$$$| $$ $$ $$   | $$   | $$  | $$| $$ $$/$$ $$
echo  | $$  | $$| $$__  $$| $$  $$$$   | $$   | $$  | $$| $$  $$$| $$
echo  | $OPTIM$$| $$  | $$| $$\  $$$   | $$   | $$  | $$| $$\  $ | $$
echo  |  $$$$$$/| $$  | $$| $$ \  $$   | $$   |  $$$$$$/| $$ \/  | $$
echo   \______/ |__/  |__/|__/  \__/   |__/    \______/ |__/     |__/
echo.
echo [SYSTEM] INITIATING INFINITE LOOP...
echo [MODE] TURBO HFT (High Frequency Trading)
echo [TARGET] BINANCE / KRAKEN / COINBASE
echo.

cd "C:\Users\papic\Downloads\QAntumBVortex-main\QAntumBVortex-main"

:LOOP
:: Run for 1 hour (3600s) then restart to clear memory
node scripts/2_AGILITY/integrated-runner.js --duration 3600 --turbo --verbose
goto LOOP
