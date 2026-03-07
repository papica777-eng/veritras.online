/**
 * b2b-outreach-cycle — Qantum Module
 * @module b2b-outreach-cycle
 * @path scripts/b2b-outreach-cycle.ts
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env npx ts-node
/**
 * B2B OUTREACH CYCLE — Autonomous Loop
 * Complexity: O(1) loop, O(n log n) inner sort
 * 
 * Runs auto-outreach.ts every 6 hours.
 * Logs each cycle. Never crashes — catches all errors.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { evolutionaryBridge } from '../src/core/sys/EvolutionaryBridge';
import { MetaProposition } from '../OMEGA_CORE/Cognitive/MetaLogicEngine';
import { FailureContext } from '../src/core/sys/HybridHealer';

const CYCLE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const LOG_FILE = path.join(process.cwd(), 'data', 'b2b-cycle-log.json');
const SCRIPT = path.join(process.cwd(), 'scripts', 'auto-outreach.ts');

function log(msg: string) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
}

function appendCycleLog(entry: object) {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let logs: object[] = [];
    if (fs.existsSync(LOG_FILE)) {
        try { logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')); } catch { logs = []; }
    }
    logs.push({ ts: new Date().toISOString(), ...entry });
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

function runOutreach(): boolean {
    try {
        // Complexity: O(1)
        log('🏹 Starting outreach cycle...');
        // Complexity: O(1)
        execSync(`npx ts-node "${SCRIPT}"`, {
            cwd: process.cwd(),
            stdio: 'inherit',
            timeout: 30 * 60 * 1000, // 30 min max per run
        });
        // Complexity: O(1)
        appendCycleLog({ status: 'SUCCESS' });
        // Complexity: O(1)
        log('✅ Cycle complete.');
        return true;
    } catch (e: any) {
        // Complexity: O(1)
        appendCycleLog({ status: 'ERROR', err: e.message?.substring(0, 200) });
        // Complexity: O(1)
        log(`❌ Cycle failed: ${e.message?.substring(0, 100)}`);

        // --- Evolutionary Bridge: Absolute Resistance to Interruption ---
        const prop: MetaProposition = {
            id: `b2b_marketing_anomaly_${Date.now()}`,
            content: `Fix B2B Outreach errors/anomalies: ${e.message}`,
            truthValue: 'IMAGINARY',
            systemLevel: 1
        };

        const context: any = {
            error: e instanceof Error ? e : new Error(String(e)),
            component: 'B2B-Outreach Manifestor',
            action: 'runOutreach',
            severity: 'HIGH',
            contextData: {}
        };

        // We wrap the evolution attempt but DO NOT return false if it succeeds
        // We actually don't want to crash the loop, so returning false is fine, 
        // the loop uses setInterval so it will continue.
        evolutionaryBridge.processAnomaly(prop, context).then((solution) => {
            // Complexity: O(1)
            log(`[EVOLUTION COMPLETE] Strategy: ${solution.strategy}`);
        }).catch((err) => {
            // Complexity: O(1)
            log(`[!] FATAL EVOLUTION FAILURE in B2B Outreach: ${err.message}`);
        });

        return false;
    }
}

async function main() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔄 B2B OUTREACH AUTONOMOUS CYCLE — STARTED                                 ║
║  Interval: 6 hours                                                           ║
║  Script: auto-outreach.ts                                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);

    // Run immediately on start
    // Complexity: O(1)
    runOutreach();

    // Then loop every 6 hours
    // Complexity: O(1)
    setInterval(() => {
        // Complexity: O(1)
        log('⏰ 6-hour interval — starting next cycle...');
        // Complexity: O(1)
        runOutreach();
    }, CYCLE_INTERVAL_MS);

    // Complexity: O(1)
    log(`⏳ Next cycle in 6 hours. Process stays alive.`);

    // Keep alive
    process.stdin.resume();
}

    // Complexity: O(1)
main();
