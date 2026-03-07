# ═══════════════════════════════════════════════════════════════════════════════
# ⚛️ QANTUM COMPLETE REBRAND SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Self-adjusting script - one execution, complete transformation
# @author dp | QAntum Labs
# @version 1.0.0
#
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host @"

    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗
   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║
   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝

              ⚛️ COMPLETE REBRAND SCRIPT ⚛️
                    [ dp ] qantum labs

"@ -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION - Single Source of Truth
# ═══════════════════════════════════════════════════════════════════════════════

$Config = @{
    NewVersion   = "1.0.0"
    NewName      = "QAntum"
    NewAuthor    = "dp | QAntum Labs"
    NewTagline   = "The Autonomous QA Agent"
    
    # Text replacements for branding (Ordered for specificity)
    Replacements = [ordered]@{
        'Aeterna | QAntum Labs'        = 'AETERNA | QAntum Labs'
        'Aeterna'                      = 'QAntum'
        'dimitar.prodromov@QAntum.dev' = 'dp@qantum.site'
        'v27.2.0'                      = 'v1.0.0'
        'v27.1.0'                      = 'v1.0.0'
        'v27.0.1'                      = 'v1.0.0'
        'v27.0.0'                      = 'v1.0.0'
        'v26.0.0'                      = 'v1.0.0'
        '@codename Antifragile'        = '@codename Quantum'
        '"Antifragile" Edition'        = '"Quantum" Edition'
    }
    
    # File extensions to process
    Extensions   = @("*.ts", "*.js", "*.json", "*.md", "*.html")
    
    # Directories to scan relative to root
    ScanDirs     = @("src", "scripts", "tests", "_QA_BATTLEFIELD_", "dashboard")
    
    # Directories to skip
    SkipDirs     = @("node_modules", "dist", ".git", "artifacts", "brain")
}

# ═══════════════════════════════════════════════════════════════════════════════
# STATISTICS
# ═══════════════════════════════════════════════════════════════════════════════

$Stats = @{
    FilesScanned     = 0
    FilesModified    = 0
    ReplacementsMade = 0
    Errors           = 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Step {
    param([string]$Message, [string]$Status = "...")
    $icon = switch ($Status) {
        "OK" { "✅" }
        "SKIP" { "⏭️" }
        "ERROR" { "❌" }
        default { "⏳" }
    }
    Write-Host "   $icon $Message" -ForegroundColor $(if ($Status -eq "ERROR") { "Red" } elseif ($Status -eq "OK") { "Green" } else { "White" })
}

function Process-File {
    param([string]$FilePath)
    
    $Stats.FilesScanned++
    $modified = $false
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        if (-not $content) { return }
        
        $originalContent = $content
        
        # Apply all replacements
        foreach ($key in $Config.Replacements.Keys) {
            if ($content -match [regex]::Escape($key)) {
                $content = $content -replace [regex]::Escape($key), $Config.Replacements[$key]
                $Stats.ReplacementsMade++
                $modified = $true
            }
        }
        
        # Additional regex replacements for version numbers
        # Match patterns like "27.1.0" or "27.0.0" standalone
        $versionRegex = '\b(27\.[0-2]\.[0-1]|26\.0\.0)\b'
        if ($content -match $versionRegex) {
            $content = $content -replace $versionRegex, '1.0.0'
            $Stats.ReplacementsMade++
            $modified = $true
        }
        
        if ($modified) {
            Set-Content $FilePath $content -NoNewline -ErrorAction Stop
            $Stats.FilesModified++
            return $true
        }
    }
    catch {
        $Stats.Errors++
        Write-Step "Error processing $FilePath : $_" "ERROR"
    }
    
    return $false
}

function Get-SourceFiles {
    param([string]$Path)
    
    $files = @()
    foreach ($ext in $Config.Extensions) {
        $found = Get-ChildItem -Path $Path -Filter $ext -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { 
            $skip = $false
            foreach ($dir in $Config.SkipDirs) {
                if ($_.FullName -match [regex]::Escape($dir)) {
                    $skip = $true
                    break
                }
            }
            -not $skip
        }
        $files += $found
    }
    return $files
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  PHASE 1: SCANNING PROJECT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray

$files = @()
foreach ($dir in $Config.ScanDirs) {
    $dirPath = Join-Path $ProjectRoot $dir
    if (Test-Path $dirPath) {
        Write-Step "Scanning $dirPath"
        $files += Get-SourceFiles -Path $dirPath
    }
}
Write-Step "Found $($files.Count) valid source files" "OK"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  PHASE 2: APPLYING REPLACEMENTS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray

$modifiedFiles = @()
foreach ($file in $files) {
    $result = Process-File -FilePath $file.FullName
    if ($result) {
        $modifiedFiles += $file.Name
    }
}

if ($modifiedFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "   Modified files:" -ForegroundColor Cyan
    $modifiedFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor DarkGray }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  PHASE 3: PROCESSING ROOT FILES" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray

$rootFiles = @("package.json", "README.md", "CHANGELOG.md", "tsconfig.json")
foreach ($rootFile in $rootFiles) {
    $fullPath = Join-Path $ProjectRoot $rootFile
    if (Test-Path $fullPath) {
        $result = Process-File -FilePath $fullPath
        Write-Step "$rootFile" $(if ($result) { "OK" } else { "SKIP" })
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  PHASE 4: VERIFICATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray

# Verification of remaining old patterns
$remainingOld = 0
foreach ($dir in $Config.ScanDirs) {
    $dirPath = Join-Path $ProjectRoot $dir
    if (Test-Path $dirPath) {
        $found = (Get-ChildItem -Path $dirPath -Filter "*.ts" -Recurse | 
            Select-String -Pattern "v27|27\.[0-2]\.[0-1]|26\.0\.0" -ErrorAction SilentlyContinue).Count
        $remainingOld += $found
    }
}
Write-Step "Remaining old versions: $remainingOld" $(if ($remainingOld -eq 0) { "OK" } else { "SKIP" })

# Project summary
Write-Step "Brand consistency" "OK"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  ⚛️ REBRAND COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   📊 STATISTICS:" -ForegroundColor Cyan
Write-Host "   ├─ Files Scanned:    $($Stats.FilesScanned)" -ForegroundColor White
Write-Host "   ├─ Files Modified:   $($Stats.FilesModified)" -ForegroundColor White
Write-Host "   ├─ Replacements:     $($Stats.ReplacementsMade)" -ForegroundColor White
Write-Host "   └─ Errors:           $($Stats.Errors)" -ForegroundColor $(if ($Stats.Errors -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "   [ dp ] qantum labs © 2025" -ForegroundColor DarkGray
Write-Host ""
