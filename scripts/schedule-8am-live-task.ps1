$root = "C:\Users\papic\Desktop\ALL-POSITIONS\Blockchain"
$taskName = "QAntum-8h-Live"
$script = "$root\scripts\run-live-8h.js"

$action = "node $script"

schtasks /Delete /TN $taskName /F 2>$null | Out-Null
schtasks /Create /SC DAILY /ST 08:00 /TN $taskName /TR $action /F

Write-Host "Task created: $taskName"
Write-Host "Runs daily at 08:00"
Write-Host "Command: $action"
