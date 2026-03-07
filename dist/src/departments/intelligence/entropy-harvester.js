"use strict";
/**
 * entropy-harvester — Qantum Module
 * @module entropy-harvester
 * @path src/departments/intelligence/entropy-harvester.ts
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
exports.EntropyHarvester = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const neural_mesh_1 = require("./neural-mesh");
/**
 * @class EntropyHarvester
 * @description Distills raw network noise into strategic volatility markers.
 * Implements the SUB-ZERO Protocol: Silent Accumulation.
 */
class EntropyHarvester {
    vaultPath;
    mesh;
    constructor() {
        this.vaultPath = path.join(__dirname, '../_VAULT_/entropy_harvest.json');
        this.mesh = neural_mesh_1.NeuralMesh.getInstance();
    }
    // Complexity: O(N)
    async harvest() {
        const context = this.mesh.synchronize();
        const network = context['network_status'];
        if (!network || network.state !== 'ONLINE')
            return;
        // Logic: Extract high-order entropy (Latency + Slot Jitter)
        // In a real scenario, this would calc standard deviation of latency samples
        const marker = {
            timestamp: Date.now(),
            slot: network.slot || 0,
            latency: network.latency || '0ms',
            entropy_score: parseFloat((Math.random() * 10).toFixed(4)), // Placeholder for real volatility math
            signal_detected: false,
        };
        // Threshold check (referenced in briefing)
        if (marker.entropy_score > 8.5) {
            marker.signal_detected = true;
            console.log(`[\x1b[31mHARVESTER\x1b[0m] ⚠️ SIGNAL DETECTED: High Volatility (Score: ${marker.entropy_score})`);
        }
        this.updateVault(marker);
    }
    // Complexity: O(1)
    updateVault(marker) {
        let history = [];
        try {
            if (fs.existsSync(this.vaultPath)) {
                const fileContent = fs.readFileSync(this.vaultPath, 'utf8');
                const parsed = JSON.parse(fileContent);
                if (Array.isArray(parsed)) {
                    history = parsed;
                }
                else if (parsed && typeof parsed === 'object') {
                    // Start fresh if the format was the protocol object
                    history = [];
                }
            }
        }
        catch (e) {
            history = [];
        }
        history.push(marker);
        // Keep only the last 1000 markers to prevent file bloat
        if (history.length > 1000)
            history.shift();
        fs.writeFileSync(this.vaultPath, JSON.stringify(history, null, 2));
        // Log sparingly to avoid noise, only log periodically or on signal
        if (marker.signal_detected || Math.random() > 0.95) {
            console.log(`[\x1b[34mHARVESTER\x1b[0m] Entropy marker captured at slot ${marker.slot}`);
        }
    }
}
exports.EntropyHarvester = EntropyHarvester;
