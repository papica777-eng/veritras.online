
# 🛡️ QANTUM DEDUPLICATOR v1.0
# Identifies and isolates duplicate applications based on deep signature matching
# ------------------------------------------------------------------------------

$TargetDir = "C:\Users\papic\Desktop\ULTIMATE_QANTUM_SHOWCASE"
$TrashDir = Join-Path $TargetDir "_DUPLICATES_TRASH"

if (!(Test-Path $TrashDir)) { New-Item -ItemType Directory -Path $TrashDir | Out-Null }

Write-Host "🕵️ DETECTING CLONES IN SECTOR: $TargetDir" -ForegroundColor Cyan

$Apps = Get-ChildItem -Path $TargetDir -Directory | Where-Object { $_.Name -ne "_DUPLICATES_TRASH" }
$Signatures = @{}

foreach ($App in $Apps) {
    $PkgPath = Join-Path $App.FullName "package.json"
    
    if (Test-Path $PkgPath) {
        # Create a signature based on critical content: dependencies + scripts
        # We ignore version/description/name slightly to catch forks, but strictly matching dep versions is safest for 'duplicate' definition
        
        try {
            $Json = Get-Content $PkgPath -Raw | ConvertFrom-Json
            
            # Create a deterministic object for hashing
            $SigObj = [PSCustomObject]@{
                Deps    = ($Json.dependencies | ConvertTo-Json -Depth 1 -Compress)
                DevDeps = ($Json.devDependencies | ConvertTo-Json -Depth 1 -Compress)
                Scripts = ($Json.scripts | ConvertTo-Json -Depth 1 -Compress)
            }
            
            # Simple string hash of the core structure
            $Signature = ($SigObj | ConvertTo-Json -Compress).GetHashCode()
            
            if ($Signatures.ContainsKey($Signature)) {
                # DUPLICATE DETECTED
                $Original = $Signatures[$Signature]
                Write-Host "⚠️ CLONE DETECTED: $($App.Name)" -ForegroundColor Red
                Write-Host "   -> Matches: $($Original.Name)" -ForegroundColor DarkGray
                
                # Move to Trash
                $Dest = Join-Path $TrashDir $App.Name
                Move-Item -Path $App.FullName -Destination $Dest
                Write-Host "   -> MOVED TO TRASH" -ForegroundColor Yellow
            }
            else {
                # REGISTER ORIGINAL
                $Signatures[$Signature] = $App
                Write-Host "✅ REGISTERED UNIQUE: $($App.Name)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "❌ CORRUPT/INVALID PACKAGE.JSON: $($App.Name)" -ForegroundColor Magenta
        }
    }
    else {
        Write-Host "💨 SKIPPING (No package.json): $($App.Name)" -ForegroundColor DarkGray
    }
}

$TrashCount = (Get-ChildItem $TrashDir).Count
if ($TrashCount -gt 0) {
    Write-Host "`n🧹 CLEANUP COMPLETE. $TrashCount duplicates moved to '_DUPLICATES_TRASH'." -ForegroundColor Cyan
    Write-Host "   Verify contents, then delete the folder manually or tell me to 'PURGE'." -ForegroundColor Yellow
    Invoke-Item $TrashDir
}
else {
    Write-Host "`n✨ NO DUPLICATES FOUND. SYSTEM IS PRISTINE." -ForegroundColor Green
}
