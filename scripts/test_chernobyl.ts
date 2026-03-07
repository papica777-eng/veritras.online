/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ ☣️  PROJECT HYGEIA: TOXIC SENSOR SIMULATION (Bio-Liveness)   ║
 * ║ OPERATION: "CHERNOBYL TEST"                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * This script simulates a sensor attack/failure to verify that the
 * BioLivenessToken entropy validation correctly rejects toxic data.
 */

import * as crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// INLINE: LivenessTokenManager (simplified for standalone test)
// ═══════════════════════════════════════════════════════════════════════════

class LivenessTokenManager {
    private readonly TOKEN_SECRET: string;

    constructor(secret?: string) {
        this.TOKEN_SECRET = secret || crypto.randomBytes(32).toString('hex');
    }

    /**
     * Generate a Bio-Liveness Token (Proof-of-Reality)
     */
    // Complexity: O(1) — amortized
    generateBioToken(
        moduleId: string,
        status: 'HEALTHY' | 'DEGRADED' | 'COMPROMISED',
        telemetryData: any,
        entropyScore: number
    ): string {
        const timestamp = Date.now();

        // Hash the telemetry data
        const telemetryHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(telemetryData))
            .digest('hex');

        // Build payload and sign
        const payloadString = `${moduleId}:${timestamp}:${status}:${telemetryHash}:${entropyScore}`;
        const signature = crypto
            .createHmac('sha256', this.TOKEN_SECRET)
            .update(payloadString)
            .digest('hex');

        // Return Base64-encoded token
        const tokenData = `${moduleId}:${timestamp}:${status}:${telemetryHash}:${entropyScore}:${signature}`;
        return Buffer.from(tokenData).toString('base64');
    }

    // Complexity: O(1)
    getSecret(): string {
        return this.TOKEN_SECRET;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE: ApoptosisModule (simplified for standalone test)
// ═══════════════════════════════════════════════════════════════════════════

class ApoptosisModule {
    private tokenManager: LivenessTokenManager;
    private maxEntropyThreshold = 0.3;

    constructor(tokenManager: LivenessTokenManager) {
        this.tokenManager = tokenManager;
    }

    // Complexity: O(1) — hash/map lookup
    async registerVitality(moduleId: string, livenessToken: string): Promise<boolean> {
        try {
            // Decode Base64 token
            const decoded = Buffer.from(livenessToken, 'base64').toString('utf-8');
            const parts = decoded.split(':');
            const isBioToken = parts.length === 6;

            const tokenModuleId = parts[0];
            const timestampStr = parts[1];
            const status = parts[2];

            let telemetryHash: string | undefined;
            let entropyScore: number | undefined;
            let providedSignature: string;

            if (isBioToken) {
                telemetryHash = parts[3];
                entropyScore = parseFloat(parts[4]);
                providedSignature = parts[5];
            } else {
                providedSignature = parts[3];
            }

            // Verify module ID
            if (tokenModuleId !== moduleId) {
                throw new Error(`Module ID mismatch: expected '${moduleId}', got '${tokenModuleId}'`);
            }

            // Verify timestamp (5-minute window)
            const tokenTimestamp = parseInt(timestampStr, 10);
            const now = Date.now();
            const tokenAgeMs = now - tokenTimestamp;
            const MAX_TOKEN_AGE_MS = 5 * 60 * 1000;

            if (tokenAgeMs > MAX_TOKEN_AGE_MS) {
                throw new Error(`Token expired: ${Math.floor(tokenAgeMs / 1000)}s old`);
            }

            // Verify signature
            const TOKEN_SECRET = this.tokenManager.getSecret();
            const payload = isBioToken
                ? `${tokenModuleId}:${timestampStr}:${status}:${telemetryHash}:${parts[4]}`
                : `${tokenModuleId}:${timestampStr}:${status}`;

            const expectedSignature = crypto
                .createHmac('sha256', TOKEN_SECRET)
                .update(payload)
                .digest('hex');

            if (providedSignature !== expectedSignature) {
                throw new Error('Signature verification FAILED - token is forged');
            }

            // 🧬 ENTROPY CHECK (Bio-Liveness Only)
            if (isBioToken && entropyScore !== undefined) {
                if (entropyScore > this.maxEntropyThreshold) {
                    console.warn(`\n☣️  [APOPTOSIS] TOXIC DATA DETECTED from ${moduleId}`);
                    console.warn(`   Entropy Score: ${entropyScore}`);
                    console.warn(`   Threshold: ${this.maxEntropyThreshold}`);
                    console.warn(`   Verdict: DATA IS HALLUCINATORY/COMPROMISED`);

                    throw new Error(
                        `COMPROMISED: entropyScore ${entropyScore} exceeds threshold ${this.maxEntropyThreshold}`
                    );
                }
            }

            // ✅ Token is valid
            console.log(`\n💚 [APOPTOSIS] Vitality registered for ${moduleId}`);
            console.log(`   Status: ${status}`);
            if (isBioToken) {
                console.log(`   Entropy: ${entropyScore} (within limits)`);
                console.log(`   Telemetry Hash: ${telemetryHash?.substring(0, 16)}...`);
            }

            return true;

        } catch (error: any) {
            console.error(`\n❌ [APOPTOSIS] Vitality REJECTED: ${error.message}`);
            return false;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMULATION: CHERNOBYL TEST
// ═══════════════════════════════════════════════════════════════════════════

async function runChernobylTest() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║ ☣️  PROJECT HYGEIA: CHERNOBYL TEST (Bio-Liveness)            ║');
    console.log('║    "Kill the sensor if it lies"                             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Initialize system
    const SECRET = 'VORTEX_HYGEIA_SECRET_2026';
    const tokenManager = new LivenessTokenManager(SECRET);
    const immuneSystem = new ApoptosisModule(tokenManager);

    const sensorId = 'SENSOR_AIR_SOFIA_01';

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: NORMAL OPERATION (Clean Air)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('[PHASE 1] 🌿 NORMAL OPERATION');
    console.log('═══════════════════════════════════════════════════════════════');

    const cleanData = { pm25: 12, co2: 400, temperature: 22.5 }; // Normal air
    const healthyEntropy = 0.05; // Very low entropy = stable data

    console.log(`📊 Telemetry: PM2.5=${cleanData.pm25}, CO2=${cleanData.co2}, Temp=${cleanData.temperature}`);
    console.log(`📉 Entropy Score: ${healthyEntropy} (low = stable)`);

    const healthyToken = tokenManager.generateBioToken(
        sensorId,
        'HEALTHY',
        cleanData,
        healthyEntropy
    );

    console.log(`📡 Token Generated: ${healthyToken.substring(0, 50)}...`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result1 = await immuneSystem.registerVitality(sensorId, healthyToken);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: TOXIC DATA ATTACK
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('[PHASE 2] ☣️  TOXIC DATA ATTACK SIMULATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Context: Sensor has been compromised or is malfunctioning.');
    console.log('         Reporting physically impossible values.\n');

    const toxicData = { pm25: 9999, co2: -50, temperature: 500 }; // Impossible
    const toxicEntropy = 0.85; // Very high entropy = chaotic/fake data

    console.log(`📊 Telemetry: PM2.5=${toxicData.pm25}, CO2=${toxicData.co2}, Temp=${toxicData.temperature}`);
    console.log(`📈 Entropy Score: ${toxicEntropy} (high = SUSPICIOUS)`);
    console.log(`⚠️  Threshold: 0.3`);

    const toxicToken = tokenManager.generateBioToken(
        sensorId,
        'HEALTHY', // Sensor claims it's healthy (lying)
        toxicData,
        toxicEntropy
    );

    console.log(`📡 Token Generated: ${toxicToken.substring(0, 50)}...`);
    console.log(`\n⏳ Submitting to Immune System (Apoptosis)...`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result2 = await immuneSystem.registerVitality(sensorId, toxicToken);

    // ═══════════════════════════════════════════════════════════════════════
    // FINAL STATUS
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('[FINAL STATUS]');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Phase 1 (Healthy): ${result1 ? '✅ ACCEPTED' : '❌ REJECTED'}`);
    console.log(`Phase 2 (Toxic):   ${result2 ? '✅ ACCEPTED' : '💀 APOPTOSIS TRIGGERED'}`);

    if (!result2) {
        console.log('\n🛡️  VERITAS SHIELD ACTIVE');
        console.log('   The immune system correctly identified and rejected');
        console.log('   the toxic data. Sensor would be quarantined/restarted.');
    }

    console.log('\n☢️  CHERNOBYL TEST COMPLETE\n');
}

// Run the simulation
    // Complexity: O(1)
runChernobylTest().catch(console.error);
