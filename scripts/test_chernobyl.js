/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ ☣️  PROJECT HYGEIA: CHERNOBYL TEST (Bio-Liveness)            ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createHash, createHmac, randomBytes } from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// LivenessTokenManager
// ═══════════════════════════════════════════════════════════════════════════

class LivenessTokenManager {
    constructor(secret) {
        this.TOKEN_SECRET = secret || randomBytes(32).toString('hex');
    }

    // Complexity: O(1)
    generateBioToken(moduleId, status, telemetryData, entropyScore) {
        const timestamp = Date.now();
        const telemetryHash = createHash('sha256')
            .update(JSON.stringify(telemetryData))
            .digest('hex');

        const payloadString = `${moduleId}:${timestamp}:${status}:${telemetryHash}:${entropyScore}`;
        const signature = createHmac('sha256', this.TOKEN_SECRET)
            .update(payloadString)
            .digest('hex');

        const tokenData = `${moduleId}:${timestamp}:${status}:${telemetryHash}:${entropyScore}:${signature}`;
        return Buffer.from(tokenData).toString('base64');
    }

    // Complexity: O(1)
    getSecret() {
        return this.TOKEN_SECRET;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ApoptosisModule
// ═══════════════════════════════════════════════════════════════════════════

class ApoptosisModule {
    constructor(tokenManager) {
        this.tokenManager = tokenManager;
        this.maxEntropyThreshold = 0.3;
    }

    // Complexity: O(N)
    async registerVitality(moduleId, livenessToken) {
        try {
            const decoded = Buffer.from(livenessToken, 'base64').toString('utf-8');
            const parts = decoded.split(':');
            const isBioToken = parts.length === 6;

            const tokenModuleId = parts[0];
            const timestampStr = parts[1];
            const status = parts[2];

            let telemetryHash, entropyScore, providedSignature;

            if (isBioToken) {
                telemetryHash = parts[3];
                entropyScore = parseFloat(parts[4]);
                providedSignature = parts[5];
            } else {
                providedSignature = parts[3];
            }

            if (tokenModuleId !== moduleId) throw new Error(`Module ID mismatch`);

            const tokenTimestamp = parseInt(timestampStr, 10);
            if (Date.now() - tokenTimestamp > 5 * 60 * 1000) throw new Error(`Token expired`);

            const payload = isBioToken
                ? `${tokenModuleId}:${timestampStr}:${status}:${telemetryHash}:${parts[4]}`
                : `${tokenModuleId}:${timestampStr}:${status}`;

            const expectedSignature = createHmac('sha256', this.tokenManager.getSecret())
                .update(payload)
                .digest('hex');

            if (providedSignature !== expectedSignature) throw new Error('Signature FAILED');

            // 🧬 ENTROPY CHECK
            if (isBioToken && entropyScore > this.maxEntropyThreshold) {
                console.warn(`\n☣️  [APOPTOSIS] TOXIC DATA DETECTED from ${moduleId}`);
                console.warn(`   Entropy Score: ${entropyScore}`);
                console.warn(`   Threshold: ${this.maxEntropyThreshold}`);
                console.warn(`   Verdict: HALLUCINATORY/COMPROMISED`);
                throw new Error(`COMPROMISED: entropy ${entropyScore} > ${this.maxEntropyThreshold}`);
            }

            console.log(`\n💚 [APOPTOSIS] Vitality OK for ${moduleId} | Entropy: ${entropyScore || 'N/A'}`);
            return true;
        } catch (error) {
            console.error(`\n❌ [APOPTOSIS] REJECTED: ${error.message}`);
            return false;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHERNOBYL TEST
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║ ☣️  PROJECT HYGEIA: CHERNOBYL TEST                           ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

const manager = new LivenessTokenManager('VORTEX_SECRET_2026');
const apoptosis = new ApoptosisModule(manager);
const sensorId = 'SENSOR_AIR_SOFIA_01';

// PHASE 1: HEALTHY
console.log('\n[PHASE 1] 🌿 NORMAL OPERATION');
const cleanToken = manager.generateBioToken(sensorId, 'HEALTHY', { pm25: 12, co2: 400 }, 0.05);
    // SAFETY: async operation — wrap in try-catch for production resilience
const r1 = await apoptosis.registerVitality(sensorId, cleanToken);

// PHASE 2: TOXIC
console.log('\n[PHASE 2] ☣️  TOXIC ATTACK');
const toxicToken = manager.generateBioToken(sensorId, 'HEALTHY', { pm25: 9999, co2: -50 }, 0.85);
    // SAFETY: async operation — wrap in try-catch for production resilience
const r2 = await apoptosis.registerVitality(sensorId, toxicToken);

// RESULT
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`Phase 1: ${r1 ? '✅ ACCEPTED' : '❌ REJECTED'}`);
console.log(`Phase 2: ${r2 ? '✅ ACCEPTED' : '💀 APOPTOSIS'}`);
console.log('☢️  CHERNOBYL TEST COMPLETE\n');
