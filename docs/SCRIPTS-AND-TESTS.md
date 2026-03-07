# Scripts & test suite

Short reference for scripts and tests in the repo.

---

## Scripts (`scripts/`)

### Orchestration & branch management

| Command | Description |
|--------|-------------|
| `npm run analyze` | Phase 1: deduplication + analysis (SHA-256, TAXONOMY.json) |
| `npm run absorb` | Phase 2: neural absorption (vectorization, pattern recognition) |
| `npm run integrate` | Phase 3: QAntum integration (top modules, training dataset) |
| `npm run orchestrate` | Runs all 3 phases (master orchestrator) |
| `npm run branch:setup` | Setup branch structure (main, dev, vortex-raw) |
| `npm run branch:status` | Show branch status |
| `npm run branch:promote` | Promote verified modules from vortex-raw to dev |
| `npm run branch:cleanup` | Clean up merged branches |

### Security, performance, deploy

| Command | Description |
|--------|-------------|
| `npm run security:check` | Security scan (`scripts/security-scan.js`) |
| `npm run test:perf` | Performance benchmark |
| `npm run test:mutation` | Mutation testing |
| `npm run update:deps` | Auto-update dependencies |
| `npm run deploy` | Auto-sync deploy (self-healing) |
| `npm run deploy:status` | Deploy status |

### Advanced modules (under `scripts/`)

- **Brain**: BrainRouter, GeminiBrain, MetaLogicEngine, NeuralContext, VortexAI  
- **Departments**: Biology, Chemistry, Fortress, Guardians, Intelligence, Omega, Physics, Reality  
- **Memory**: HybridSearch, LanceVectorStore, PineconeVectorStore, neural-vault, neural-backpack  
- **Guardians**: EternalWatchdog, StrictCollar  
- **Tools**: autonomous-bug-fixer, fuzzing, logic-analyzer, pii-scanner, predictive-attack-surface, stealth-engine, visual-phishing-detector, guardrails, hot-swap-selector, session-orchestrator  

See `scripts/README.md` for the 3-phase workflow and output layout.

---

## Tests (`tests/`)

### Unit tests (`tests/unit/`)

- **Phase 1**: phase1-core, phase1-architecture, phase1-async-healing, phase1-cognitive, phase1-selectors  
- **Phase 2**: phase2-evolution-auto, phase2-nlu-shadow, phase2-security-quantum, phase2-visual-swarm  
- **Phase 3**: phase3-infrastructure, phase3-intelligence, phase3-production  
- **Other**: corporate-integration, crypto-fallback, math-utils  

### Chaos tests (`tests/chaos/`)

- flaky-infrastructure.test.ts  
- malicious-intent.test.ts  
- resource-exhaustion.test.ts  

### Integration / feature tests (root of `tests/`)

- bastion, core, local, multimodal, neural, persona, phase2, phase3, segc, telemetry, ux-auditor  
- auto-sync-deploy.test.js  

### Running tests

| Command | Description |
|--------|-------------|
| `npm test` | Default unit (phase1-core) |
| `npm run test:unit` | Same as above |
| `npm run test:phase1` | Phase 1 orchestrator tests |
| `npm run test:phase2` | Phase 2 orchestrator tests |
| `npm run test:phase3` | Phase 3 orchestrator tests |
| `npm run test:all` | Full framework test suite |
| `npm run test:deploy` | Auto-sync deploy test |
| `node tests/run-all.js` | Run unit tests via run-all runner |

---

**See also**: `scripts/README.md`, `BRANCHING-STRATEGY.md`, main `README.md`.
