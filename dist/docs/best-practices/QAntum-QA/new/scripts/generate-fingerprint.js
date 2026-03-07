#!/usr/bin/env npx tsx
"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GENERATE FINGERPRINT - Lock Extension to This Machine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Run this ONCE on your machine to generate your unique fingerprint.
 * This fingerprint will be used to ensure the extension ONLY works here.
 *
 * Usage:
 *   npx tsx scripts/generate-fingerprint.ts
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. ЛИЧЕН. НЕ ЗА РАЗПРОСТРАНЕНИЕ.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const SovereignLock_1 = require("../src/ide/SovereignLock");
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🔐 SOVEREIGN FINGERPRINT GENERATOR 🔐                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    const lock = SovereignLock_1.SovereignLock.getInstance();
    const fingerprint = lock.getFingerprint();
    console.log(`
Machine Details:
  Hostname:  ${os.hostname()}
  Username:  ${os.userInfo().username}
  Platform:  ${os.platform()} (${os.arch()})
  CPU:       ${os.cpus()[0]?.model || 'unknown'}
  Cores:     ${os.cpus().length}
  Memory:    ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB

═══════════════════════════════════════════════════════════════════════════════

🔑 YOUR UNIQUE FINGERPRINT:

${fingerprint}

═══════════════════════════════════════════════════════════════════════════════
  `);
    // Save to .env file for backup
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = `# QAntum Sovereign Lock - DO NOT SHARE
# Generated: ${new Date().toISOString()}
# Machine: ${os.hostname()}

QANTUM_CREATOR_HASH=${fingerprint}
`;
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Fingerprint saved to ${envPath}`);
    // Verify the lock
    console.log('\n🔒 Verifying Sovereign Lock...\n');
    const verified = await lock.verify();
    if (verified) {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ✅ SOVEREIGN LOCK ACTIVATED ✅                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Your machine is now the ONLY machine that can run QAntum OMEGA.              ║
║                                                                               ║
║  If anyone copies this extension to another computer:                         ║
║    - It will refuse to start                                                  ║
║    - After 3 attempts, Tombstone Protocol activates                           ║
║    - The extension becomes permanently disabled                               ║
║                                                                               ║
║  "В QAntum не лъжем."                                                         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
    }
    else {
        console.error('❌ Verification failed. Check the logs above.');
    }
}
main().catch(console.error);
