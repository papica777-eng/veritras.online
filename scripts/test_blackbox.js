/**
 * 🧪 BlackBox Test Script
 * RUN: node scripts/test_blackbox.js
 */

import { createHash, randomBytes } from 'crypto';

class BlackBox {
    constructor() {
        this.buffers = new Map();
        this.reports = [];
    }

    // Complexity: O(N) — loop
    record(moduleId, data, entropyScore) {
        if (!this.buffers.has(moduleId)) this.buffers.set(moduleId, []);
        const buffer = this.buffers.get(moduleId);
        buffer.push({ timestamp: Date.now(), moduleId, data, entropyScore });

        // Keep last 10 records
        while (buffer.length > 10) buffer.shift();
    }

    // Complexity: O(1) — lookup
    captureDeathEvent(moduleId, reason, entropyScore, threshold) {
        const lastTelemetry = this.buffers.get(moduleId) ?? [];

        const report = {
            id: randomBytes(4).toString('hex'),
            killedAt: Date.now(),
            moduleId,
            reason,
            entropyScore,
            threshold,
            recordCount: lastTelemetry.length,
        };

        report.hash = createHash('sha256').update(JSON.stringify(report)).digest('hex').substring(0, 16);
        this.reports.push(report);
        this.buffers.delete(moduleId);

        return report;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║ 📼 BlackBox Recorder Test                                    ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const blackbox = new BlackBox();
const sensorId = 'SENSOR_TOXIC_01';

// Simulate 5 normal readings
console.log('[PHASE 1] Recording normal telemetry...');
for (let i = 1; i <= 5; i++) {
    blackbox.record(sensorId, { reading: i, value: 100 + i }, 0.05);
    console.log(`   📊 Record ${i}: value=${100 + i}, entropy=0.05`);
}

// Simulate toxic event
console.log('\n[PHASE 2] Toxic data detected, triggering death...');
blackbox.record(sensorId, { reading: 6, value: 9999 }, 0.85);

const report = blackbox.captureDeathEvent(
    sensorId,
    'COMPROMISED: entropy 0.85 > 0.3',
    0.85,
    0.3
);

console.log('\n📼 ════════════════════════════════════════════════════════');
console.log('   DEATH REPORT GENERATED');
console.log(`   ID: ${report.id}`);
console.log(`   Module: ${report.moduleId}`);
console.log(`   Reason: ${report.reason}`);
console.log(`   Entropy: ${report.entropyScore} (Limit: ${report.threshold})`);
console.log(`   Records Preserved: ${report.recordCount}`);
console.log(`   Hash: ${report.hash}...`);
console.log('════════════════════════════════════════════════════════\n');

console.log('✅ BlackBox Recorder: OPERATIONAL\n');
