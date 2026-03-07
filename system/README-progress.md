# QAntum Singularity – README (Workspace State)

> Последно обновено: **24 февруари 2026**

Пълна карта на PRIVATE-CORE след портиране на 11 уникални qantum модула. Всичко е локално.

---

## 🗂️ Пълна карта на модулите

### Entry Points

| Файл | Описание |
|------|----------|
| [run-singularity.ts](run-singularity.ts) | CLI стартер — God Loop + Pinecone + NeuralHUD + Sales Force |
| [qantum-singularity.ts](qantum-singularity.ts) | God Loop оркестратор (4 фази: target → scan → pitch → send) |
| [system/qantum-awakening.ts](system/qantum-awakening.ts) | 6-phase system bootstrap (NeuralCore → BrainRouter → ImmuneSystem → ProposalEngine → KillSwitch → ChronosOmega) |

### AI / Cognition Layer

| Файл | Описание |
|------|----------|
| [cognition/inference-engine.ts](cognition/inference-engine.ts) | Core inference engine |
| [cognition/logical-inference-engine.ts](cognition/logical-inference-engine.ts) | Формална логика — modus ponens/tollens, syllogism, abduction, forward/backward chaining |
| [cognition/reinforcement-learning-bridge.ts](cognition/reinforcement-learning-bridge.ts) | Q-Learning + Thompson Sampling + UCB1, Bellman updates, персистентност в `knowledge/q-learning.json` |
| [cognition/rl-types.ts](cognition/rl-types.ts) | Type stubs за RL bridge (SelectorDNA, QLearningConfig, ActionOutcome) |
| [cognition/n-step-simulator.ts](cognition/n-step-simulator.ts) | N-step lookahead симулатор |
| [cognition/semantic-memory.ts](cognition/semantic-memory.ts) | Семантична памет |
| [cognition/thought-chain.ts](cognition/thought-chain.ts) | Chain-of-thought reasoning |
| [cognition/self-critique.ts](cognition/self-critique.ts) | Self-critique loop |
| [cognition/VisionEngine.ts](cognition/VisionEngine.ts) | Visual AI |
| [cognition/SessionMemory.ts](cognition/SessionMemory.ts) | Session state персистентност |

### Intelligence Layer

| Файл | Описание |
|------|----------|
| [intelligence/DeepSeekLink.ts](intelligence/DeepSeekLink.ts) | DeepSeek API + Ollama fallback chain |
| [intelligence/OllamaManager.ts](intelligence/OllamaManager.ts) | Auto-detect най-добрия локален LLM (`deepseek-r1:8b`) |
| [intelligence/NeuralHUD.ts](intelligence/NeuralHUD.ts) | Real-time SSE dashboard (порт **3847**) |
| [intelligence/VectorSync.ts](intelligence/VectorSync.ts) | Pinecone vector sync (747 реда) |
| [intelligence/predictive-engine.ts](intelligence/predictive-engine.ts) | Pre-Cog — git diff анализ, test-to-file корелация, CorrelationEngine, RiskScorer |
| [intelligence/cross-engine-synergy.ts](intelligence/cross-engine-synergy.ts) | CrossEngineSynergyAnalyzer — synergy pattern detection, Ghost Protocol подобрения |
| [intelligence/CrossProjectSynergy.ts](intelligence/CrossProjectSynergy.ts) | Кроспроектна синергия |
| [intelligence/PricingSyncEngine.ts](intelligence/PricingSyncEngine.ts) | Динамично ценообразуване |
| [intelligence/HealthMonitor.ts](intelligence/HealthMonitor.ts) | System health checks |

### Pinecone / Vector Store

| Файл | Описание |
|------|----------|
| [pinecone-bridge/src/PineconeContextBridge.ts](pinecone-bridge/src/PineconeContextBridge.ts) | 620-ред Pinecone клиент — сесии, caching, queryByText/Vector/Contextual |
| [pinecone-bridge/src/EmbeddingEngine.ts](pinecone-bridge/src/EmbeddingEngine.ts) | Universal Sentence Encoder, 512-dim вектори |
| [pinecone-bridge/src/PersistentContextStore.ts](pinecone-bridge/src/PersistentContextStore.ts) | Контекст персистентност |
| [pinecone-bridge/src/server.ts](pinecone-bridge/src/server.ts) | HTTP сървър за vector операции |

### Market / Trading

| Файл | Описание |
|------|----------|
| [market-reaper.ts](market-reaper.ts) | Binance market scanner |
| [sovereign-market/OrderBookDepthEngine.ts](sovereign-market/OrderBookDepthEngine.ts) | L2 order book depth, execution simulation, arbitrage profit calc, Binance WS |
| [singularity-market-bridge.ts](singularity-market-bridge.ts) | Market bridge към singularity |

### System / Security

| Файл | Описание |
|------|----------|
| [system/DynamicLoader.ts](system/DynamicLoader.ts) | Recursive file discovery + dynamic import |
| [system/KnoxVaultSigner.ts](system/KnoxVaultSigner.ts) | Samsung Knox TEE signing — HMAC-SHA256/512, Binance/Kraken/Coinbase подписване, audit trail |
| [system/obfuscation-engine.ts](system/obfuscation-engine.ts) | AES-256-CBC криптиране на стрингове, variable mangling, control flow flattening, dead code injection |
| [system/self-optimizing-engine.ts](system/self-optimizing-engine.ts) | Auto-performance tuning, latency anomaly detection, auto-refactoring suggestions |
| [system/purge-engine.ts](system/purge-engine.ts) | Dead code elimination — safe removal с backup и Markdown репорт |
| [system/qantum-awakening.ts](system/qantum-awakening.ts) | 6-phase full system bootstrap |

### SaaS / Revenue

| Файл | Описание |
|------|----------|
| [saas/subscription.ts](saas/subscription.ts) | Stripe subscription management |
| [saas/telemetry.ts](saas/telemetry.ts) | Usage телеметрия |
| [saas/feature-flags.ts](saas/feature-flags.ts) | Feature flag система |
| [sales/SelfHealingSales.ts](sales/SelfHealingSales.ts) | Autonomous sales агент |

### UI

| Файл | Описание |
|------|----------|
| [src/ui/theme-engine.ts](src/ui/theme-engine.ts) | CSS variable theming, light/dark теми, design tokens, theme extension API |

### Utilities

| Файл | Описание |
|------|----------|
| [utils/logger.ts](utils/logger.ts) | Споделен logger (debug/info/warn/error) за всички модули |
| [utils/TwoFactorManager.ts](utils/TwoFactorManager.ts) | 2FA management |

---

## 🚀 Как да стартираш

```powershell
# God Loop + NeuralHUD + Pinecone + Sales Force
cd "C:\Users\papic\Documents\SamsunS24\binance\PRIVATE-CORE"
npx ts-node run-singularity.ts
```

- HUD: http://localhost:3847
- Market Reaper Dashboard: http://localhost:3333

```powershell
# Full System Awakening (6 фази)
npx ts-node system/qantum-awakening.ts
# Опции:
# --arm-protection   → Knox Kill-Switch Level 2
# --evolve           → Chronos-Omega self-evolution
# --harvest          → The Harvester
```

---

## 🤖 Моделен fallback

```
DeepSeek (sk-ce40d70d...) → "Insufficient Balance"
         ↓ auto-fallback
Ollama (http://127.0.0.1:11434) → deepseek-r1:8b
         ↓ ако Ollama не върви
Локален placeholder
```

---

## 📡 Pinecone интеграция

При стартиране на `run-singularity.ts`:
1. `PineconeContextBridge.connect()` → проверка на индексите (`vortex-oracle`, `lwas-memory`)
2. Създава session с ID + timestamp
3. Upsell events се embedват (512-dim USE) и се записват като вектори

---

## 📊 Telemetry / Upsell логика (mock)

На всеки 15s върху три mock лида:
- `usage ≥ 90%` → upsell wave (A/B вариант)
- `latency > 450ms` → предложение за скалиране
- `неплащане ≥ 3 дни` → throttling (billing wave)

---

## 🔑 API ключове (локално в `.env`)

| Сервис | Статус |
|--------|--------|
| DeepSeek | ❌ Insufficient Balance (→ Ollama fallback) |
| Ollama | ✅ `deepseek-r1:8b` |
| Gemini | ✅ `gemini-2.0-flash` |
| Pinecone | ✅ `vortex-oracle` + `lwas-memory` |
| Binance | ✅ dry-run / kill switch активен |
| Stripe | ✅ `rk_live_...` |

Пази `.env` локално — при споделяне/бекъп ротирай ключовете.

---

## 📈 Следващи стъпки

- [ ] Подай реален lead feed (замени mock масива в `run-singularity.ts`)
- [ ] Добави DeepSeek кредити за cloud reasoning
- [ ] Включи Gemini в God Loop като вторичен модел
- [ ] Wire Pinecone в `qantum-singularity.ts` (vector store за всяка от 4-те фази)
- [ ] Дефинирай Starter/Pro/Enterprise пакети за реален upsell
- [ ] Тествай `system/purge-engine.ts` с реален `meditation-result.json`
- [ ] Включи `system/self-optimizing-engine.ts` monitoring в `run-singularity.ts`
- [ ] Docker, rate-limit, cors, helmet, Winston/Sentry (infrastructure checklist)
