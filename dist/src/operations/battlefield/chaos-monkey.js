"use strict";
/**
 * chaos-monkey — Qantum Module
 * @module chaos-monkey
 * @path src/operations/battlefield/chaos-monkey.ts
 * @auto-documented BrutalDocEngine v2.1
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
// @ts-nocheck
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║   CHAOS MONKEY - Anti-Fragility Testing Engine                               ║
 * ║   "What doesn't kill the system makes it stronger"                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * Purpose: Randomly terminate modules to prove system resilience.
 * Integration: Uses CrossModuleSyncOrchestrator for module registry and health checks.
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cross_module_sync_1 = require("../synthesis/cross-module-sync");
class ChaosMonkey {
    modules = [];
    results = [];
    killedModules = new Set();
    intervalId = null;
    constructor() {
        this.loadModules();
    }
    // Complexity: O(1)
    loadModules() {
        const mapPath = path.join(process.cwd(), 'mega-map.json');
        if (!fs.existsSync(mapPath)) {
            console.error('❌ mega-map.json not found. Run cartographer first.');
            process.exit(1);
        }
        this.modules = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
        console.log(`🐒 [ChaosMonkey] Loaded ${this.modules.length} potential victims`);
    }
    // Complexity: O(N) — linear scan
    selectVictim() {
        const aliveModules = this.modules.filter(m => !this.killedModules.has(m.id));
        const randomIndex = Math.floor(Math.random() * aliveModules.length);
        return aliveModules[randomIndex];
    }
    // Complexity: O(1)
    killModule(module) {
        console.log(`💀 [ChaosMonkey] KILLING: ${module.id} (${module.type})`);
        this.killedModules.add(module.id);
        // Broadcast death event
        // Complexity: O(1)
        (0, cross_module_sync_1.getSync)().broadcast({
            source: 'ChaosMonkey',
            type: 'MODULE_DEATH',
            payload: {
                moduleId: module.id,
                moduleType: module.type,
                reason: 'Chaos injection'
            },
            timestamp: Date.now(),
            correlationId: `CHAOS-${Date.now()}`
        });
        this.results.push({
            moduleId: module.id,
            action: 'KILLED',
            timestamp: new Date()
        });
    }
    // Complexity: O(N) — linear scan
    checkSystemHealth() {
        const orchestrator = (0, cross_module_sync_1.getSync)();
        const health = orchestrator.healthCheck();
        const alive = health.filter(h => h.status === 'healthy').length;
        const dead = health.filter(h => h.status === 'offline').length;
        return { alive, dead, total: health.length };
    }
    // Complexity: O(1)
    async runChaos(durationSeconds = 30, intervalMs = 3000) {
        console.log('\n╔═══════════════════════════════════════════╗');
        console.log('║   🐒 CHAOS MONKEY: ANTI-FRAGILITY TEST    ║');
        console.log('╚═══════════════════════════════════════════╝\n');
        console.log(`Duration: ${durationSeconds}s | Attack interval: ${intervalMs}ms\n`);
        const startTime = Date.now();
        const endTime = startTime + (durationSeconds * 1000);
        let attackCount = 0;
        return new Promise((resolve) => {
            this.intervalId = setInterval(() => {
                if (Date.now() >= endTime) {
                    this.stopChaos();
                    this.printReport();
                    // Complexity: O(1)
                    resolve();
                    return;
                }
                // Select and kill a victim
                const victim = this.selectVictim();
                if (victim) {
                    this.killModule(victim);
                    attackCount++;
                }
                // Check system health
                const health = this.checkSystemHealth();
                console.log(`   📊 System: ${health.alive}/${health.total} modules alive (${health.dead} dead)`);
                // Check if core is still alive (system resilience)
                if (health.alive < health.total * 0.3) {
                    console.log('🚨 CRITICAL: System below 30% capacity!');
                }
            }, intervalMs);
        });
    }
    // Complexity: O(1)
    stopChaos() {
        if (this.intervalId) {
            // Complexity: O(1)
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('\n🛑 [ChaosMonkey] Chaos injection stopped.\n');
        }
    }
    // Complexity: O(N) — linear scan
    printReport() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 CHAOS MONKEY - FINAL REPORT\n');
        const killed = this.results.filter(r => r.action === 'KILLED').length;
        const recovered = this.results.filter(r => r.action === 'RECOVERED').length;
        const health = this.checkSystemHealth();
        console.log(`   Total Attacks: ${killed}`);
        console.log(`   Modules Killed: ${this.killedModules.size}`);
        console.log(`   Auto-Recovered: ${recovered}`);
        console.log(`   System Health: ${health.alive}/${health.total} (${((health.alive / health.total) * 100).toFixed(1)}%)`);
        console.log('\n   Killed Modules:');
        [...this.killedModules].slice(0, 10).forEach(id => {
            console.log(`     💀 ${id}`);
        });
        if (this.killedModules.size > 10) {
            console.log(`     ... and ${this.killedModules.size - 10} more`);
        }
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (health.alive / health.total >= 0.7) {
            console.log('✅ VERDICT: SYSTEM IS ANTI-FRAGILE');
            console.log('   Core remained operational under chaos conditions.');
        }
        else {
            console.log('⚠️ VERDICT: SYSTEM NEEDS IMPROVEMENT');
            console.log('   Too many critical dependencies. Consider redundancy.');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}
// Main execution
async function main() {
    const monkey = new ChaosMonkey();
    // Default: 15 seconds of chaos, attack every 2 seconds
    const duration = parseInt(process.argv[2] || '15', 10);
    const interval = parseInt(process.argv[3] || '2000', 10);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await monkey.runChaos(duration, interval);
}
// Complexity: O(1)
main().catch(console.error);
