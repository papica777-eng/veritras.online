$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\AETERNA.lnk")
$Shortcut.TargetPath = "c:\RUST-LANGUAGE\QANTUM-JULES\IGNITE_AETERNA.bat"
$Shortcut.WorkingDirectory = "c:\RUST-LANGUAGE\QANTUM-JULES"
$Shortcut.Description = "Ignite AETERNA Sovereign Organism"
$Shortcut.IconLocation = "shell32.dll,243" # Default futuristic icon, user can change to the generated one
$Shortcut.Save()

Write-Host "⚡ AETERNA SHORTCUT MANIFESTED ON DESKTOP." -ForegroundColor Cyan
