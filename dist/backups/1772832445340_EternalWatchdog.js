"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   ETERNAL WATCHDOG - Zero Entropy Enforcer                                    ║
 * ║   "Automated Self-Healing & Debris Annihilation"                              ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.eternalWatchdog = exports.EternalWatchdog = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const ApoptosisModule_1 = require("./ApoptosisModule");
class EternalWatchdog {
    static instance;
    config;
    isRunning = false;
    intervalTimer = null;
    // Complexity: O(1)
    constructor() {
        this.config = {
            targetDirectories: [
                path.join(process.cwd(), 'data/purge-backup'),
                path.join(process.cwd(), '.tmp'),
                path.join(process.cwd(), '.apoptosis/graveyard'),
                path.join(process.cwd(), 'logs/old')
            ],
            // Default max age: 24 hours (86,400,000 ms)
            // But for Zero Entropy, we can set it to a strict 1 hour: 3,600,000 ms
            maxAgeMs: 3600000,
            scanIntervalMs: 600000, // Every 10 minutes
            runOnStartup: true
        };
    }
    static getInstance() {
        if (!EternalWatchdog.instance) {
            EternalWatchdog.instance = new EternalWatchdog();
        }
        return EternalWatchdog.instance;
    }
    configure(configOverrides) {
        this.config = { ...this.config, ...configOverrides };
    }
    // Complexity: O(1) start operation
    start() {
        if (this.isRunning)
            return;
        console.log('👁️ [ETERNAL WATCHDOG] Awakened. Zero Entropy Enforcement Active.');
        this.isRunning = true;
        if (this.config.runOnStartup) {
            this.executePurge()
                .catch(err => console.error('👁️ [ETERNAL WATCHDOG] Error on startup purge:', err));
        }
        this.intervalTimer = setInterval(() => {
            this.executePurge()
                .catch(err => console.error('👁️ [ETERNAL WATCHDOG] Error during purge cycle:', err));
        }, this.config.scanIntervalMs);
    }
    stop() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
        this.isRunning = false;
        console.log('👁️ [ETERNAL WATCHDOG] Slumbering.');
    }
    // Complexity: O(D * F) where D is directories, F is files per directory
    async executePurge() {
        console.log(`\n👁️ [ETERNAL WATCHDOG] Scanning for debris across ${this.config.targetDirectories.length} domains...`);
        let totalDeleted = 0;
        let totalBytesFreed = 0;
        const now = Date.now();
        for (const dir of this.config.targetDirectories) {
            try {
                // Check if directory exists
                await fs.access(dir);
                const stats = await this.purgeDirectory(dir, now);
                totalDeleted += stats.deleted;
                totalBytesFreed += stats.freedBytes;
            }
            catch (err) {
                // If directory doesn't exist, just skip
                if (err.code !== 'ENOENT') {
                    console.warn(`👁️ [ETERNAL WATCHDOG] Failed to access ${dir}: ${err.message}`);
                }
            }
        }
        if (totalDeleted > 0) {
            console.log(`👁️ [ETERNAL WATCHDOG] Purge Complete. Eradicated ${totalDeleted} files.`);
            console.log(`👁️ [ETERNAL WATCHDOG] Reclaimed Entropy Space: ${(totalBytesFreed / 1024 / 1024).toFixed(2)} MB`);
            // Advance apoptosis cycle as a self-healing systemic interaction
            try {
                ApoptosisModule_1.apoptosis.advanceCycle();
            }
            catch (e) {
                // Ignore if apoptosis fails
            }
        }
        else {
            console.log('👁️ [ETERNAL WATCHDOG] No debris found. System is in perfect Zero Entropy equilibrium.');
        }
    }
    // Recursively purge directory
    async purgeDirectory(dir, now) {
        let deleted = 0;
        let freedBytes = 0;
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    const subStats = await this.purgeDirectory(fullPath, now);
                    deleted += subStats.deleted;
                    freedBytes += subStats.freedBytes;
                    // Try to remove directory if it is now empty
                    try {
                        const remaining = await fs.readdir(fullPath);
                        if (remaining.length === 0) {
                            await fs.rmdir(fullPath);
                        }
                    }
                    catch (e) { }
                }
                else {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const stats = await fs.stat(fullPath);
                    const ageMs = now - stats.mtimeMs;
                    if (ageMs > this.config.maxAgeMs) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await fs.unlink(fullPath);
                        deleted++;
                        freedBytes += stats.size;
                    }
                }
            }
        }
        catch (error) {
            // Error handling for locked files
        }
        return { deleted, freedBytes };
    }
}
exports.EternalWatchdog = EternalWatchdog;
exports.eternalWatchdog = EternalWatchdog.getInstance();
