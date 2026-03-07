/**
 * generate-fingerprint — Qantum Module
 * @module generate-fingerprint
 * @path scripts/generate-fingerprint.ts
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env npx tsx
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

import { SovereignLock } from '../src/ide/SovereignLock';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🔐 SOVEREIGN FINGERPRINT GENERATOR 🔐                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);

  const lock = SovereignLock.getInstance();
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
  // SAFETY: async operation — wrap in try-catch for production resilience
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
  } else {
    console.error('❌ Verification failed. Check the logs above.');
  }
}

    // Complexity: O(1)
main().catch(console.error);
