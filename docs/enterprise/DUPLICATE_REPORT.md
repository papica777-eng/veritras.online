# 💀 QANTUM DUPLICATE FILE REPORT

> Generated: 2026-03-05T21:59:12.051Z
> Engine: DRY Enforcement Scanner v1.0

## Summary

| Metric | Value |
|---|---:|
| Duplicate Groups | **15** |
| Total Duplicate Files | **15** |
| Wasted Bytes | **381.8 KB** |
| Wasted Methods (duplicated logic) | **494** |

## Duplicate Groups

For each group, the **canonical** file (recommended source of truth) is marked with ✅.
Copies (marked ❌) can be replaced with re-exports or symlinks.

### Hash: `8c2e23f5c643` (116 methods, 35.4 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `OmniCore/memory/SeleniumAdapter.ts` |
| ❌ DUPLICATE | `OmniCore/adapters/SeleniumAdapter.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'OmniCore/memory/SeleniumAdapter';
```

### Hash: `8cfc06eea38e` (19 methods, 33.6 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `src/departments/finance/arbitrage/binance/autonomous-explorer.ts` |
| ❌ DUPLICATE | `scripts/tests/Autonomous-Explorer.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'src/departments/finance/arbitrage/binance/autonomous-explorer';
```

### Hash: `0f8f05cc9ebd` (28 methods, 31.7 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `src/departments/reality/gateway/AutoOnboarder.ts` |
| ❌ DUPLICATE | `scripts/tests/Autoonboarder_Vunsorted.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'src/departments/reality/gateway/AutoOnboarder';
```

### Hash: `2138e1744e41` (52 methods, 31.2 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `omni_core/memory/neural-backpack.ts` |
| ❌ DUPLICATE | `scripts/qantum/intelligence/neural-backpack.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'omni_core/memory/neural-backpack';
```

### Hash: `4638bd2cdd86` (40 methods, 31.1 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `scripts/tests/Behavioranalysis.ts` |
| ❌ DUPLICATE | `scripts/qantum/behavior/BehaviorAnalysis.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'scripts/tests/Behavioranalysis';
```

### Hash: `9d15941a661a` (22 methods, 29.7 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `scripts/tests/Billingpulse.ts` |
| ❌ DUPLICATE | `scripts/qantum/biology/metabolism/BillingPulse.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'scripts/tests/Billingpulse';
```

### Hash: `e3d6c567576b` (50 methods, 29.2 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `scripts/tests/Aiintegration.ts` |
| ❌ DUPLICATE | `scripts/qantum/AIIntegration.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'scripts/tests/Aiintegration';
```

### Hash: `7caea1dc7029` (22 methods, 27.5 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `scripts/tests/Apoptosismodule.ts` |
| ❌ DUPLICATE | `omni_core/evolution/ApoptosisModule.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'scripts/tests/Apoptosismodule';
```

### Hash: `c000a53b7bb4` (22 methods, 25.7 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `scripts/tests/Automation.ts` |
| ❌ DUPLICATE | `scripts/OTHERS/automation.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'scripts/tests/Automation';
```

### Hash: `8b606445b592` (25 methods, 24.6 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `src/departments/reality/binance/Arbitrage/binance/biometric-engine.ts` |
| ❌ DUPLICATE | `scripts/tests/Biometric-Engine.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'src/departments/reality/binance/Arbitrage/binance/biometric-engine';
```

### Hash: `44bf17405271` (29 methods, 23.9 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `src/departments/finance/arbitrage/binance/Bridge/noise-protocol-bridge.ts` |
| ❌ DUPLICATE | `bridges/noise-protocol-bridge.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'src/departments/finance/arbitrage/binance/Bridge/noise-protocol-bridge';
```

### Hash: `3364bc1f4486` (27 methods, 21.0 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `src/core/antigravity/ghost/anti-detection.ts` |
| ❌ DUPLICATE | `scripts/tests/Anti-Detection.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'src/core/antigravity/ghost/anti-detection';
```

### Hash: `37476e5fa136` (15 methods, 19.8 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `src/departments/reality/binance/Arbitrage/binance/CognitiveBridge.ts` |
| ❌ DUPLICATE | `bridges/CognitiveBridge.ts` |

**Action:** Replace duplicates with:
```typescript
export * from 'src/departments/reality/binance/Arbitrage/binance/CognitiveBridge';
```

### Hash: `f12bc416f006` (23 methods, 16.9 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `bridges/PineconeContextBridge.js` |
| ❌ DUPLICATE | `scripts/qantum/PineconeContextBridge.js` |

**Action:** Replace duplicates with:
```typescript
export * from 'bridges/PineconeContextBridge';
```

### Hash: `c0f99ceabd33` (4 methods, 0.4 KB)

| Status | Path |
|:---:|---|
| ✅ CANONICAL | `soul/authorize.soul` |
| ❌ DUPLICATE | `aeterna-node/authorize.soul` |

**Action:** Replace duplicates with:
```typescript
export * from 'soul/authorize';
```

---

> Generated by DRY Enforcement Scanner | Zero Entropy Policy
