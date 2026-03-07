# QAntum DEBUGGER

**Self-Healing TypeScript/JavaScript Debugger with Auto-Fix & Machine Learning**

> "Identifies, Neutralizes, Prevents."

[![npm version](https://badge.fury.io/js/QAntum-debugger.svg)](https://www.npmjs.com/package/QAntum-debugger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why QAntum DEBUGGER?

| Traditional Linters | QAntum DEBUGGER |
|---------------------|-----------------|
| Find errors | Find AND fix errors |
| Static rules | Learning system |
| One-time scan | Real-time watching |
| Report problems | Prevent problems |

---

## Installation

```bash
npm install -g QAntum-debugger
# or
npx QAntum-debugger scan
```

---

## Quick Start

```bash
# Scan your project
qd scan

# Watch for errors in real-time
qd watch

# View statistics
qd stats
```

---

## Features

### FREE Tier
- Scan up to 10 files
- TypeScript error detection
- ESLint integration
- Basic pattern matching

### PRO ($29/mo)
- Unlimited file scanning
- Auto-fix engine
- Learning system
- Pattern recognition
- Prevention rules
- Statistics dashboard

### TEAM ($99/mo)
- Everything in PRO
- API access
- Dashboard integration
- Shared patterns (10 developers)
- Custom webhooks

### ENTERPRISE ($299/mo)
- Everything in TEAM
- Unlimited developers
- Custom rules engine
- Priority support
- On-premise deployment

---

## Activate License

```bash
qd license activate <your-license-key>
qd license status
```

---

## How It Works

1. **SCAN** - Analyzes your code for TypeScript, ESLint, and pattern errors
2. **FIX** - Automatically applies fixes with rollback capability
3. **LEARN** - Remembers successful fixes
4. **PREVENT** - Creates rules to prevent similar errors

---

## Example Output

```

  QAntum DEBUGGER v1.0                                         
  "Identifies, Neutralizes, Prevents."                         


[INFO] Starting full project scan...
[FIX] Auto-fixed: Missing semicolon in src/index.ts:42
[FIX] Auto-fixed: Unused import in src/utils.ts:3
[WARN] Manual fix required: Type error in src/api.ts:156

SCAN RESULTS:
  Errors Found:    12
  Auto-Fixed:      9
  Manual Review:   3
  Prevented:       5
```

---

## API Reference

```typescript
import { QAntumDebugger } from "QAntum-debugger";

const debugger = new QAntumDebugger({
  projectRoot: process.cwd(),
  autoFix: true,
  learningEnabled: true
});

// Scan once
const results = await debugger.scan();

// Watch continuously
debugger.startWatching();
```

---

## Links

- Website: https://QAntum.dev/debugger
- Pricing: https://QAntum.dev/debugger/pricing
- Documentation: https://QAntum.dev/debugger/docs
- GitHub: https://github.com/QAntum-dev/QAntum-debugger

---

## Support

- Email: dimitar@QAntum.dev
- Discord: https://discord.gg/QAntum
- Issues: https://github.com/QAntum-dev/QAntum-debugger/issues

---

## Author

**Dimitar Prodromov** - QAntum Empire

---

## License

MIT (Free tier) | Commercial (Pro/Team/Enterprise)
