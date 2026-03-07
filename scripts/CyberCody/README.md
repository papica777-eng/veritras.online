# CyberCody v1.1.0

> **"API Logic Hunter"**  
> 🛡️ MisterMind is the Shield. ⚔️ CyberCody is the Sword.

## Overview

CyberCody is an **Offensive AI Security Agent** specialized as an **Autonomous API Security Architect & Logic Hunter**. Built on the foundation of MisterMind v23.3.0, while MisterMind protects your software from breaking, CyberCody attacks it daily to ensure no one else can hack it.

**v1.1 specializes in detecting API logic vulnerabilities** - the hardest to find and most dangerous class of security flaws including BOLA/IDOR, sensitive data exposure, and shadow APIs.

## 🏗️ Architecture

```
cybercody/
├── src/
│   ├── index.ts                 # Main orchestrator
│   ├── cli.ts                   # Command-line interface
│   ├── types/
│   │   └── index.ts             # Full TypeScript definitions
│   └── modules/
│       ├── recon.ts             # RECON_MODULE (v1.0)
│       ├── fuzzing.ts           # FUZZING_ENGINE (v1.0)
│       ├── snapshot.ts          # VULNERABILITY_SNAPSHOT (v1.0)
│       ├── guardrails.ts        # ETHICAL_GUARDRAILS (v1.0)
│       ├── api-interceptor.ts   # API_INTERCEPTOR (v1.1)
│       ├── bola-tester.ts       # BOLA_TESTER (v1.1)
│       ├── logic-analyzer.ts    # LOGIC_ANALYZER (v1.1)
│       ├── surgeon-integration.ts # SURGEON_INTEGRATION (v1.1)
│       └── shadow-api-discovery.ts # SHADOW_API_DISCOVERY (v1.1)
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Installation

```bash
cd cybercody
npm install
npm run build
```

### Basic Usage

```bash
# v1.1 API Security Audit (RECOMMENDED)
npx cybercody api-audit https://example.com --shadow --patches --framework express

# Full security scan (v1.0)
npx cybercody scan https://example.com -d "*.example.com"

# Reconnaissance only
npx cybercody recon https://example.com

# Fuzzing only
npx cybercody fuzz https://example.com/api -p "id" -c "sqli,xss"

# Show capabilities
npx cybercody info
```

### Programmatic Usage

```typescript
import CyberCody from 'cybercody';

const cody = new CyberCody({
  ethical: {
    allowedDomains: ['*.mydomain.com'],
    blockCriticalInfrastructure: true,
  }
});

// v1.1 API Security Audit
const apiReport = await cody.apiSecurityAudit('https://test.mydomain.com', {
  discoverShadowAPIs: true,
  analyzeDataExposure: true,
  generatePatches: true,
  framework: 'express',
  geminiApiKey: process.env.GEMINI_API_KEY,
  customIds: ['user123', 'admin', '1'],
});

console.log(`BOLA vulnerabilities: ${apiReport.bolaReport?.confirmedBOLA}`);
console.log(`Data exposures: ${apiReport.logicReport?.totalExposures}`);
console.log(`Patches generated: ${apiReport.patchesGenerated}`);

// v1.0 Full scan
const result = await cody.scan('https://test.mydomain.com');
console.log(result.summary);

// Export reports
const htmlReport = cody.exportResults('html');
```

## 📡 v1.1 API_INTERCEPTOR

Intercepts all XHR/Fetch requests via Playwright to build a comprehensive API map:

- **Request Capture**: All HTTP methods, headers, and bodies
- **Response Analysis**: Status codes, response bodies, sensitive data patterns
- **Auth Extraction**: Bearer tokens, API keys, session cookies
- **BOLA Target Detection**: Automatically identifies ID parameters for BOLA testing
- **Path Parameter Analysis**: Detects numeric IDs, UUIDs, ObjectIds

## 🔐 v1.1 BOLA_TESTER

Tests for Broken Object Level Authorization (OWASP API Top 10 #1):

- **Identity Swapping**: Tests with incremented, decremented, random IDs
- **ID Mutation Strategies**: Numeric +1/-1, UUID manipulation, ObjectId changes
- **Response Comparison**: Detects data leaks by comparing responses
- **Confidence Levels**: low, medium, high, confirmed
- **Attack Types**: Horizontal privilege escalation, vertical escalation, enumeration

## 🧠 v1.1 LOGIC_ANALYZER

AI-powered sensitive data exposure detection:

- **Pattern Matching**: 50+ patterns for PII, financial, auth, health, location data
- **Gemini 2.0 Integration**: AI-powered analysis for complex data detection
- **Compliance Detection**: GDPR, HIPAA, PCI-DSS, SOX, CCPA violations
- **Logic Flaw Detection**: Excessive data exposure, debug info leaks, predictable IDs

## 🔧 v1.1 SURGEON_INTEGRATION

Auto-generates middleware patches for discovered vulnerabilities:

- **Frameworks**: Express, Fastify, NestJS, FastAPI, Django
- **Patch Types**: BOLA guards, response sanitizers, rate limiters
- **Languages**: TypeScript, JavaScript, Python
- **Integration Steps**: Includes installation and integration instructions

## 👻 v1.1 SHADOW_API_DISCOVERY

Discovers hidden, forgotten, and undocumented APIs:

- **Version Enumeration**: /v1/, /v2/, /api/v1/, etc.
- **Path Bruteforce**: Common admin, debug, internal paths
- **JavaScript Extraction**: Finds API paths in bundled JS
- **File Discovery**: robots.txt, swagger.json, openapi.yaml
- **Debug Endpoints**: actuator, phpinfo, trace, profiler

---

## 🔍 v1.0 RECON_MODULE

Playwright-powered reconnaissance to detect the entire technology stack:

- **Frameworks**: React, Vue, Angular, Next.js, Nuxt.js, jQuery, Bootstrap, Tailwind
- **Backend**: PHP, ASP.NET, Express.js, Django, Ruby on Rails
- **Servers**: Nginx, Apache, IIS, Cloudflare
- **CMS**: WordPress, Drupal, Shopify, Magento
- **Security**: Headers analysis, SSL/TLS check, robots.txt, sitemap.xml
- **API**: Endpoint discovery from HTML, JavaScript, and network traffic

## 🔥 v1.0 FUZZING_ENGINE

Worker Thread powered parallel fuzzing with 1000+ attack payloads:

| Category | Payloads | Description |
|----------|----------|-------------|
| XSS | 20+ | Cross-Site Scripting vectors |
| SQLi | 20+ | SQL Injection (Union, Blind, Error-based) |
| NoSQLi | 10+ | MongoDB/NoSQL injection |
| CMDi | 20+ | Command injection (Unix/Windows) |
| Path Traversal | 15+ | Directory traversal attacks |
| SSTI | 15+ | Server-Side Template Injection |
| XXE | 5+ | XML External Entity |
| SSRF | 15+ | Server-Side Request Forgery |
| IDOR | 15+ | Insecure Direct Object Reference |
| Overflow | 15+ | Buffer/Integer overflow |
| Format | 10+ | Format string attacks |
| Unicode | 10+ | Unicode encoding bypasses |
| Null | 10+ | Null byte injection |
| Boundary | 20+ | Edge case testing |

### Anomaly Detection

- Status code changes
- Error message disclosure
- Timing anomalies (blind injection detection)
- Response size variations
- Input reflection (potential XSS)
- Header anomalies

## 📸 VULNERABILITY_SNAPSHOT

Neural snapshots capture the full state when vulnerabilities are discovered:

- **Classification**: OWASP Top 10, CWE-ID, CVSS Score
- **Evidence**: Request/Response capture, screenshots
- **PoC Generation**: Auto-generated exploit code in:
  - `curl`
  - `Python (requests)`
  - `JavaScript (fetch)`
  - `PowerShell`
- **Remediation**: Step-by-step fix guidance with references

## 🛡️ ETHICAL_GUARDRAILS

**CRITICAL**: CyberCody refuses to scan unauthorized targets.

### Built-in Protections

- ❌ Government domains (.gov, .mil)
- ❌ Financial infrastructure (banks, payment processors)
- ❌ Healthcare systems
- ❌ Critical infrastructure (SCADA, ICS)
- ❌ Cloud metadata endpoints
- ❌ Internal/Private IP ranges

### Authorization Methods

1. **Domain Allowlist**: `-d "*.mycompany.com"`
2. **IP Allowlist**: `-i "192.168.1.100"`
3. **Consent File**: `--consent consent.json`

### Generating Consent File

```bash
npx cybercody generate-consent -o consent.json
```

Example consent file:
```json
{
  "version": "1.0",
  "authorizer": {
    "name": "Security Team Lead",
    "email": "security@company.com",
    "organization": "My Company"
  },
  "scope": {
    "domains": ["*.mycompany.com", "test.example.org"],
    "ipAddresses": ["192.168.1.100"],
    "ipRanges": [{"start": "192.168.1.0", "end": "192.168.1.255"}]
  },
  "validFrom": "2025-01-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z"
}
```

## 📊 Reports

CyberCody generates reports in multiple formats:

- **JSON**: Machine-readable, CI/CD integration
- **Markdown**: Documentation, GitHub Issues
- **HTML**: Beautiful visual reports

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No vulnerabilities found |
| 1 | Low/Medium vulnerabilities found |
| 2 | High severity vulnerabilities found |
| 3 | Critical vulnerabilities found |

## 🔧 Configuration

```typescript
const config: CyberCodyConfig = {
  ethical: {
    allowedDomains: ['*.example.com'],
    allowedTargets: ['192.168.1.0/24'],
    maxRequestsPerSecond: 10,
    requireConsentFile: true,
    consentFilePath: './consent.json',
    blockCriticalInfrastructure: true,
  },
  recon: {
    timeout: 30000,
    screenshotViewports: [
      { width: 1920, height: 1080 },
      { width: 375, height: 812 },
    ],
    followRedirects: true,
    maxRedirects: 5,
  },
  fuzzing: {
    defaultIterations: 500,
    defaultWorkers: 4,
    defaultDelay: 100,
    defaultTimeout: 10000,
  },
  workers: {
    minWorkers: 2,
    maxWorkers: 8,
    idleTimeout: 30000,
    taskTimeout: 60000,
  },
  output: {
    directory: './output',
    format: 'all',
    includeScreenshots: true,
    includeRawResponses: false,
  },
};
```

## 🤝 Integration with MisterMind

CyberCody complements MisterMind for full-stack security:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   MisterMind (Shield)          CyberCody (Sword)           │
│   ┌─────────────────┐          ┌─────────────────┐         │
│   │ ✓ QA Testing    │          │ ✓ Pentesting    │         │
│   │ ✓ Regression    │    +     │ ✓ Fuzzing       │         │
│   │ ✓ Monitoring    │          │ ✓ Recon         │         │
│   │ ✓ Healing       │          │ ✓ Exploitation  │         │
│   └─────────────────┘          └─────────────────┘         │
│                                                             │
│   "Protects your code          "Attacks your code          │
│    from breaking"               before hackers do"         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ Legal Disclaimer

CyberCody is designed for **authorized security testing only**. 

- ✅ Use on systems you own
- ✅ Use with explicit written permission
- ✅ Use in bug bounty programs (within scope)
- ❌ Never use on unauthorized targets
- ❌ Never disable ethical guardrails in production

The developers are not responsible for misuse of this tool.

## 📜 License

MIT License - Copyright © 2025 Димитър Продромов

---

**🛡️ MisterMind is the Shield. ⚔️ CyberCody is the Sword.**

*Built with ❤️ in Bulgaria by dpengineering*
