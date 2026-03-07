# ⚛️ QANTUM BRUTALITY VORTEX v1.0.0 (PowerShell Engine)
# Scans for scripts > 750 lines and manifests them into the project via SYMLINKS
# This allows all QAntum tools (script-god, know-thyself) to process external behemoths.

$extensions = @("*.ts", "*.js", "*.rs", "*.py", "*.cs", "*.cpp", "*.go", "*.java", "*.php", "*.sh")
$ignoreDirs = @("node_modules", "dist", ".git", "target", "vendor", "__pycache__", "temp", "bin", "obj", "Windows", "Program Files", "Program Files (x86)", "AppData", "ProgramData", "brutality-vortex")
$threshold = 750
$roots = @("C:\MAGICSTICK", "C:\Users\papic\Downloads") 

# Target directory in project for symlinks
$vortexDir = Join-Path (Get-Location) "src\brutality-vortex"
if (!(Test-Path $vortexDir)) { 
    New-Item -ItemType Directory -Path $vortexDir 
    Write-Host "📁 Created Vortex directory: $vortexDir" -ForegroundColor Cyan
}

Write-Host "🚀 Initiating QANTUM BRUTALITY VORTEX SCAN..." -ForegroundColor Magenta

$brutalFiles = New-Object System.Collections.Generic.List[PSCustomObject]
$scannedCount = 0
$vortexCount = 0

foreach ($root in $roots) {
    if (Test-Path $root) {
        Write-Host "📍 Scanning root: $root" -ForegroundColor Yellow
        $files = Get-ChildItem -Path $root -Recurse -Include $extensions -File -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            $scannedCount++
            $dir = $file.DirectoryName
            $skip = $false
            foreach ($ignore in $ignoreDirs) {
                if ($dir -like "*\$ignore*") { $skip = $true; break }
            }
            if ($skip) { continue }

            # Quick check for size (scripts > 750 lines are usually > 15KB)
            if ($file.Length -lt 5kb) { continue }

            try {
                $lines = (Get-Content $file.FullName -TotalCount 2000 -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
                # Note: Exact line count for very large files might be higher, 
                # but we just need to know if it's > 750.
                
                if ($lines -ge $threshold) {
                    $lines = (Get-Content $file.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
                    
                    if ($lines -ge $threshold) {
                        # Create unique symlink name based on full path
                        # Replace invalid chars: C:\foo\bar.ts -> C__foo__bar.ts
                        $safeName = $file.FullName -replace ':', '' -replace '[\\\/]', '__'
                        $targetLink = Join-Path $vortexDir $safeName
                        
                        if (!(Test-Path $targetLink)) {
                            # Using mklink /H (Hardlink) - Does not require Admin on same volume
                            $targetPath = $file.FullName
                            cmd /c "mklink /H `"$targetLink`" `"$targetPath`"" | Out-Null
                            
                            if (Test-Path $targetLink) {
                                $vortexCount++
                                Write-Host "🔗 Manifested (Hardlink): $($file.Name) ($lines lines)" -ForegroundColor Green
                            }
                            else {
                                # If Hardlink fails (cross-volume), fall back to copy
                                Copy-Item -Path $targetPath -Destination $targetLink -Force
                                if (Test-Path $targetLink) {
                                    $vortexCount++
                                    Write-Host "💾 Manifested (Copy): $($file.Name) ($lines lines)" -ForegroundColor Yellow
                                }
                            }
                        }

                        $entry = [PSCustomObject]@{
                            Name   = $file.Name
                            Lines  = $lines
                            SizeMB = [math]::Round($file.Length / 1MB, 2)
                            Path   = $file.FullName
                        }
                        $brutalFiles.Add($entry)
                    }
                }
            }
            catch {}

            if ($scannedCount % 500 -eq 0) {
                Write-Host -NoNewline "`r🔍 Progress: $scannedCount files analyzed... Vortex: $vortexCount"
            }
        }
    }
}

Write-Host "`n✅ Vortex Sync Complete." -ForegroundColor Green
Write-Host "💀 Behemoths Manifested: $vortexCount" -ForegroundColor Red
Write-Host "📂 Path: $vortexDir" -ForegroundColor Cyan

# Update Report
$reportPath = Join-Path (Get-Location) "BRUTALITY_REPORT.md"
$reportHeader = @"
# 👹 QAntum Brutality Report: THE VORTEX MANIFEST

> **"Behold the behemoths of the disk. They are now linked to the singularity."**
> Analysis of scripts with 750+ lines. All safely symlinked in `src/brutality-vortex`.

---

## 📊 METRICS
- **Timestamp:** $(Get-Date)
- **Total Magnitude:** $(( $brutalFiles | Measure-Object Lines -Sum ).Sum.ToString("N0")) lines of code
- **Vortex Entry Count:** $vortexCount
- **Status:** STEEL

---

## 🏆 BRUTALITY LEADERBOARD

| # | File Name | Lines | Size (MB) | Full Path |
| :--- | :--- | :--- | :--- | :--- |
"@

$reportRows = ""
$sortedFiles = $brutalFiles | Sort-Object Lines -Descending
$i = 1
foreach ($f in $sortedFiles) {
    if ($f.Lines -ge 1) {
        $reportRows += "| $i | ``$($f.Name)`` | **$($f.Lines)** | $($f.SizeMB) | ``$($f.Path)`` |`n"
        $i++
    }
}

$reportFooter = @"

---

## 🧬 CONCLUSION
The Vortex is active. Tools like `script-god.js` and `know-thyself.ts` can now access these files as if they were local components.

*Generated by QANTUM VORTEX ENGINE v1.0.0*
"@

$finalReport = $reportHeader + "`n" + $reportRows + $reportFooter
$finalReport | Set-Content $reportPath -Encoding UTF8
