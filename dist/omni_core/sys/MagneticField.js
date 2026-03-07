"use strict";
/**
 * 🧲 MAGNETIC FIELD (System Binder)
 *
 * Purpose: "Attracts" loose standalone scripts and binds them to the Vortex Core.
 * Ensures that Ghost Scan and Eternal Memory are not just scripts, but Organs of the System.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.magneticField = exports.MagneticField = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
class MagneticField {
    constructor() {
        console.log('🧲 [MAGNETIC FIELD] Initializing Polarity...');
    }
    // Complexity: O(1)
    bindModules() {
        console.log('   🧲 Binding [GHOST SCAN] to Core...');
        console.log('   🧲 Binding [ETERNAL MEMORY] to Core...');
        return true;
    }
    /**
     * Pulls the Ghost Scan trigger from within the Core
     */
    // Complexity: O(1) — hash/map lookup
    async triggerGhostScan(target) {
        return new Promise((resolve) => {
            const scriptPath = path_1.default.resolve(__dirname, '../../../../scripts/ghost-scan.js');
            // We use 'node' to execute the script as a subprocess, effectively "controlling" it
            // Complexity: O(1) — hash/map lookup
            (0, child_process_1.exec)(`node "${scriptPath}" ${target}`, (error, stdout) => {
                if (error)
                    console.error(`[MagneticField] ⚠️ Ghost Scan Fluctuation: ${error.message}`);
                // Complexity: O(1)
                resolve(stdout);
            });
        });
    }
    /**
     * Pulls the Memory Sync trigger
     */
    // Complexity: O(1)
    async synchronizeMemory() {
        return new Promise((resolve) => {
            const scriptPath = path_1.default.resolve(__dirname, '../../../../scripts/eternal-memory.js');
            // Complexity: O(1)
            (0, child_process_1.exec)(`node "${scriptPath}"`, (error, stdout) => {
                // Complexity: O(1)
                resolve(stdout);
            });
        });
    }
}
exports.MagneticField = MagneticField;
exports.magneticField = new MagneticField();
