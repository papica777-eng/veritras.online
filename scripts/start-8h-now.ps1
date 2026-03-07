$root = "C:\Users\papic\Desktop\ALL-POSITIONS\Blockchain"
Set-Location $root

Write-Host "Starting QAntum 8h live runner..."
Write-Host "Project: $root"

Start-Process -FilePath "node" -ArgumentList "scripts/run-live-8h.js" -WorkingDirectory $root
Write-Host "Started in background."
Write-Host "Check logs in dashboard/trades/live-run-*.log"
