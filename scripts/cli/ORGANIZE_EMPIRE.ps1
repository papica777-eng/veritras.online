# ═══════════════════════════════════════════════════════════════════════════════
# 🏛️ QANTUM EMPIRE ORGANIZER
# ═══════════════════════════════════════════════════════════════════════════════
# Based on: QAntumEmpire-Project-Inventory.md
# Goal: Consolidate scattered projects into the defined Golden Structure.
# ═══════════════════════════════════════════════════════════════════════════════

$root = $PSScriptRoot

# 1. Define The Golden Structure
$structure = @(
    "MisteMind\PRODUCTS",
    "MisteMind\PROJECT\PRIVATE",
    "MisteMind\PROJECT\PUBLIC",
    "MisteMind\PROJECT\QA-SAAS",
    "MisteMind\PROJECT\QANTUM-NEXUS",
    "MisteMind\TRAINING",
    "MisteMind\docs\archive",
    "MrMindQATool",
    "QAntumGalaxy"
)

Write-Host "🏗️  Constructing Identity Pillars..." -ForegroundColor Cyan

foreach ($path in $structure) {
    $fullPath = Join-Path $root $path
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "   + Created: $path" -ForegroundColor Gray
    }
}

# 2. Define Mapping Rules (FolderName -> Destination)
# We search for these folder names in the root or _ARCHIVE and move them.
$mappings = @{
    # PRODUCTS
    "chronosync-sdk"      = "MisteMind\PRODUCTS"
    "ghostshield-landing" = "MisteMind\PRODUCTS"
    "ghostshield-sdk"     = "MisteMind\PRODUCTS"
    "qantum-debugger"     = "MisteMind\PRODUCTS"

    # TRAINING
    "extreme-mml"         = "MisteMind\TRAINING"
    "knowledge-base"      = "MisteMind\TRAINING"
    "training-framework"  = "MisteMind\TRAINING"

    # PROJECT
    "QANTUM-NEXUS"        = "MisteMind\PROJECT\QANTUM-NEXUS"
    "QA-SAAS"             = "MisteMind\PROJECT\QA-SAAS"
    
    # ROOT LEVEL
    "MrMindQATool"        = "MrMindQATool"
    "QAntumGalaxy"        = "QAntumGalaxy"
}

Write-Host "`n🔍 Searching and Relocating Assets..." -ForegroundColor Yellow

# Function to move a folder if found
function Move-Asset ($name, $destRelative) {
    # Search recursively for the folder (limiting depth to avoid insane waits)
    # Actually, let's look in likely places: Root, _ARCHIVE, and current dir.
    
    $dest = Join-Path $root $destRelative
    
    # We use Get-ChildItem to find directories with this name
    $found = Get-ChildItem -Path $root -Recurse -Directory -Filter $name -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($found) {
        $currentPath = $found.FullName
        $finalPath = Join-Path $dest $name

        # Avoid moving if already in the right place
        if ($currentPath -eq $finalPath) {
            Write-Host "   ✅ $name is already in position." -ForegroundColor DarkGray
            return
        }

        Write-Host "   📦 Moving $name..." -ForegroundColor White
        Write-Host "      From: $currentPath" -ForegroundColor DarkGray
        Write-Host "      To:   $finalPath" -ForegroundColor DarkGray
        
        try {
            Move-Item -Path $currentPath -Destination $dest -Force
        }
        catch {
            Write-Host "      ❌ Failed to move: $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "   ⚠️  Could not locate asset: $name" -ForegroundColor DarkYellow
    }
}

foreach ($key in $mappings.Keys) {
    Move-Asset $key $mappings[$key]
}

Write-Host "`n✅ EMPIRE ORGANIZATION COMPLETE." -ForegroundColor Green
Write-Host "   The file structure now matches 'QAntumEmpire-Project-Inventory.md'."
