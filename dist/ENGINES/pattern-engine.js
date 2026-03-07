"use strict";
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
exports.PatternEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const event_bus_1 = require("../core/event-bus");
/**
 * @class PatternEngine
 * @description Analyzes the Entropy Vault to detect "The Signal" (High-Volatility Breach).
 * Performs Time-Series Analysis on harvested network markers.
 */
class PatternEngine {
    vaultPath;
    bus;
    SIGNAL_THRESHOLD = 8.5;
    constructor() {
        this.vaultPath = path.join(__dirname, '../_VAULT_/entropy_harvest.json');
        this.bus = event_bus_1.EventBus.getInstance();
    }
    async analyze() {
        if (!fs.existsSync(this.vaultPath))
            return;
        try {
            const fileContent = fs.readFileSync(this.vaultPath, 'utf8');
            const history = JSON.parse(fileContent);
            if (!Array.isArray(history) || history.length < 5)
                return; // Need a baseline
            const latest = history[history.length - 1];
            // Calculate Moving Average (SMA-5)
            const averageEntropy = history
                .slice(-5)
                .reduce((acc, h) => acc + parseFloat(h.entropy_score || 0), 0) / 5;
            // Only log if significant or periodically (to reduce noise)
            if (Math.random() > 0.9) {
                console.log(`[\x1b[34mPATTERN-ENGINE\x1b[0m] Entropy Analysis: Current [${latest.entropy_score}] | Avg [${averageEntropy.toFixed(2)}]`);
            }
            // DETECT THE SIGNAL
            if (parseFloat(latest.entropy_score) > this.SIGNAL_THRESHOLD) {
                console.log(`[\x1b[31mSIGNAL-DETECTED\x1b[0m] ⚠️ THRESHOLD BREACH! Entropy: ${latest.entropy_score}`);
                // Emit Critical Event
                await this.bus.emit('SIGNAL_BREACH', {
                    slot: latest.slot,
                    entropy: latest.entropy_score,
                    timestamp: latest.timestamp,
                    type: 'HIGH_VOLATILITY_STRIKE_READY',
                });
            }
        }
        catch (error) {
            console.error('[\x1b[31mPATTERN-ENGINE\x1b[0m] Analysis Failed:', error);
        }
    }
}
exports.PatternEngine = PatternEngine;
