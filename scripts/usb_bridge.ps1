$adbPath = "C:\Users\papic\Documents\SamsunS24\scrcpy_v3\scrcpy-win64-v3.0.2\adb.exe"

Write-Host "🔍 QANTUM USB SENTINEL: Searching for Samsung S24 Ultra..." -ForegroundColor Cyan

while ($true) {
    $devices = & $adbPath devices
    if ($devices -match "\tdevice") {
        Write-Host "✅ S24 DETECTED! INJECTING TACTICAL BRIDGE..." -ForegroundColor Green
        
        # Tactical Bridge: PC -> Phone (Task Offload)
        & $adbPath forward tcp:3001 tcp:3001
        
        # Reverse Bridge: Phone -> PC (Dashboard Access)
        & $adbPath reverse tcp:8890 tcp:8890
        & $adbPath reverse tcp:3847 tcp:3847
        
        Write-Host "🚀 BRIDGE ESTABLISHED via USB!" -ForegroundColor Yellow
        Write-Host "👉 OPEN ON PHONE: http://localhost:8890/SovereignBinance.html" -ForegroundColor White
        break
    }
    else {
        Write-Host "⏳ Waiting for USB Debugging authorization..." -NoNewline
        Start-Sleep -Seconds 2
    }
}
