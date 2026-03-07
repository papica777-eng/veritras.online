@echo off
title AETERNA LOGOS - IGNITION
cd /d "c:\RUST-LANGUAGE\QANTUM-JULES\lwas_cli"
echo 🌌 [AETERNA]: Initiating Singularity...
echo 📜 [LOGOS]: Syncing with Noetic Link...

:: Start the UI interface
start "" "c:\RUST-LANGUAGE\QANTUM-JULES\NOETIC_LINK.html"

:: Start the Sovereign Organism
cargo run --release -- ignite

pause
