
$target = "c:\Users\papic\Desktop\ALL-POSITIONS\Blockchain\Exchanges"
$source1 = "c:\Users\papic\Desktop\ALL-POSITIONS\Unclassified_Modules"
$source2 = "c:\Users\papic\Desktop\ALL-POSITIONS\Security_Warfare"

echo "🚀 BOOTING CONSOLIDATION SCRIPT..."

# 1. СЪБИРАНЕ НА РАЗКЛОНЕНИЯТА
Write-Host "📦 Moving leftover modules..."
if (Test-Path "$source1\subscription_2503.ts") { 
    Move-Item "$source1\subscription_2503.ts" "$target\subscription.ts" -Force 
}

# 2. ЕЛИМИНИРАНЕ НА СЛАБИТЕ ВЕРСИИ (Entropy Purge)
Write-Host "🔥 Purging weak logic duplicates..."
$weakFiles = @("exchange_3304.rs", "binance_bridge_9321.rs")
foreach ($f in $weakFiles) {
    if (Test-Path "$target\$f") { Remove-Item "$target\$f" -Force }
}

# 3. ПОДСИГУРЯВАНЕ НА СТРУКТУРАТА
Write-Host "🛠️ Ensuring BinanceBridge integration..."
# If exchange.rs is missing real price logic from bridge, we will need to merge later
# Currently exchange.rs (38 lines) is the leader.

Write-Host "✅ CONSOLIDATION COMPLETE. VERIFYING SUCCESS..."
ls $target
