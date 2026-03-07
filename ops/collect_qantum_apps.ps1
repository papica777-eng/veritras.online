
# 🌌 QANTUM APP COLLECTOR v1.0
# Aggregates Fullstack Web Apps for LLM Context Ingestion
# -------------------------------------------------------

$TargetDir = "C:\Users\papic\Desktop\ULTIMATE_QANTUM_SHOWCASE"
$SearchRoots = @(
    "C:\Users\papic\Documents\GitHub", 
    "C:\Users\papic\Desktop"
    # "C:\Users\papic\Downloads" # Skipping Downloads to avoid transient garbage, unless authorized
)

# Initialize Target
if (!(Test-Path $TargetDir)) { New-Item -ItemType Directory -Path $TargetDir | Out-Null }
$ManifestPath = "$TargetDir\QANTUM_MANIFEST.md"
"# 🌌 QANTUM APPS MANIFEST`n" | Out-File -FilePath $ManifestPath -Encoding UTF8

Write-Host "🚀 INITIALIZING QANTUM COLLECTOR..." -ForegroundColor Cyan

function Get-AppSignature {
    param ($Path)
    $PkgPath = Join-Path $Path "package.json"
    if (Test-Path $PkgPath) {
        try {
            $Json = Get-Content $PkgPath -Raw | ConvertFrom-Json
            if ($Json.dependencies.next -or $Json.dependencies.react -or $Json.dependencies.vite -or $Json.dependencies.express -or $Json.dependencies.nestjs -or $Json.dependencies.vue) {
                return $Json.name
            }
        } catch { return $null }
    }
    return $null
}

$Count = 0

foreach ($root in $SearchRoots) {
    if (Test-Path $root) {
        Write-Host "🔍 Scannning Sector: $root" -ForegroundColor Yellow
        $PotentialApps = Get-ChildItem -Path $root -Recurse -Filter "package.json" -ErrorAction SilentlyContinue | 
                        Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "dist" -and $_.FullName -notmatch "\.next" }

        foreach ($pkg in $PotentialApps) {
            $AppPath = $pkg.DirectoryName
            $AppName = Get-AppSignature -Path $AppPath

            if ($AppName) {
                $ParentName = (Get-Item $AppPath).Parent.Name
                $UniqueId = "$($AppName)_$($ParentName)" -replace "[^a-zA-Z0-9_-]", "_"
                
                # Deduplication logic could go here, but USER said "VSICHKITE" (ALL OF THEM)
                
                $Dest = Join-Path $TargetDir $UniqueId
                
                Write-Host "⚡ Teleporting: $AppName -> $UniqueId" -ForegroundColor Green
                
                # Add to Manifest
                "## 📦 $UniqueId`n- **Name:** $AppName`n- **Origin:** $AppPath`n- **Tech Stack:** Fullstack`n" | Out-File -FilePath $ManifestPath -Append -Encoding UTF8

                # RoboCopy for Speed & Exclusion
                # Exclude heavy artifacts
                $Excludes = @("node_modules", ".git", ".next", "dist", "build", "coverage", ".vscode", "tmp", "*.log", "*.zip", "*.exe")
                
                # Construct Robocopy Command
                # /S = Subdirectories, /E = Empty too (maybe not), /XD = Exclude Dirs, /XF = Exclude Files
                $RoboArgs = @($AppPath, $Dest, "/MIR", "/XD") + $Excludes + @("/XF", "*.lock", "*.tsbuildinfo")
                
                # Execute quietly
                Start-Process -FilePath "robocopy" -ArgumentList $RoboArgs -NoNewWindow -Wait
                
                $Count++
            }
        }
    }
}

Write-Host "`n✅ COLLECTION COMPLETE. $Count Apps Secured in $TargetDir" -ForegroundColor Cyan
Invoke-Item $TargetDir
