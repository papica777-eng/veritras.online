
# 🕵️ QANTUM HTML ARCHIVIST v1.0
# Scans system sectors for HTML assets and consolidates them into a central vault.
# ------------------------------------------------------------------------------

$DestDir = "C:\Users\papic\Desktop\QANTUM_HTML_VAULT"
if (!(Test-Path $DestDir)) { New-Item -ItemType Directory -Path $DestDir | Out-Null }

$ScanPaths = @(
    "C:\Users\papic\Documents\GitHub",
    "C:\Users\papic\Desktop"
)

# Exclude noise/artifact sectors
$Excludes = @("node_modules", ".git", ".next", "dist", "build", "coverage", ".vscode", "target", "vendor")

Write-Host "🌌 INITIALIZING HTML HARVEST..." -ForegroundColor Cyan

$Manifest = "C:\Users\papic\Desktop\QANTUM_HTML_VAULT\HTML_MANIFEST.md"
"# 📜 QANTUM HTML VAULT MANIFEST`nGenerated on: $(Get-Date)`n`n" | Out-File -FilePath $Manifest

$FileCount = 0

foreach ($RootPath in $ScanPaths) {
    if (!(Test-Path $RootPath)) { continue }
    
    Write-Host "🔍 SCANNING: $RootPath" -ForegroundColor DarkGray
    
    # Get all HTML files, filtering out excluded directories
    $Files = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $path = $_.FullName
        $keep = $true
        foreach ($ex in $Excludes) {
            if ($path -like "*\$ex\*") { $keep = $false; break }
        }
        return $keep
    }

    foreach ($File in $Files) {
        $ParentName = $File.Directory.Name
        # Create a unique name to avoid collisions (e.g., index.html vs index.html)
        $NewName = "$ParentName`_$($File.Name)"
        $TargetFile = Join-Path $DestDir $NewName
        
        try {
            Copy-Item -Path $File.FullName -Destination $TargetFile -Force -ErrorAction Stop
            "- **$NewName** (Origin: `$($File.FullName)`)`n" | Out-File -FilePath $Manifest -Append
            $FileCount++
            Write-Host "✅ COLLECTED: $NewName" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️ FAILED: $($File.Name)" -ForegroundColor Red
        }
    }
}

Write-Host "`n✨ HARVEST COMPLETE! $FileCount HTML files secured in: $DestDir" -ForegroundColor Cyan
Invoke-Item $DestDir
