"use strict";
/**
 * HybridHealer — Qantum Module
 * @module HybridHealer
 * @path src/core/sys/HybridHealer.ts
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
exports.hybridHealer = exports.HybridHealer = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
class HybridHealer extends events_1.EventEmitter {
    static instance;
    history = [];
    static getInstance() {
        if (!HybridHealer.instance)
            HybridHealer.instance = new HybridHealer();
        return HybridHealer.instance;
    }
    // 🧠 PERSISTENT MEMORY LAYER
    memoryFile = 'data/healing-history.json';
    constructor() {
        super();
        this.loadMemory();
    }
    // Complexity: O(1) — hash/map lookup
    loadMemory() {
        if (fs.existsSync(this.memoryFile)) {
            try {
                this.history = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
                console.log(`[HybridHealer] 🧠 Loaded ${this.history.length} memories.`);
            }
            catch (e) {
                console.warn('[HybridHealer] ⚠️ Memory corrupted. Starting fresh.');
            }
        }
    }
    // Complexity: O(1) — hash/map lookup
    saveMemory() {
        try {
            const dataDir = 'data';
            if (!fs.existsSync(dataDir))
                fs.mkdirSync(dataDir);
            fs.writeFileSync(this.memoryFile, JSON.stringify(this.history, null, 2));
        }
        catch (e) {
            console.error('[HybridHealer] ❌ Failed to save memory:', e);
        }
    }
    /**
     * 🚑 THE MAIN HEAL METHOD
     */
    // Complexity: O(1) — hash/map lookup
    async heal(context) {
        console.log(`[HybridHealer] 🚑 Emergency received from [${context.source}]`);
        console.log(`[HybridHealer] 📉 Error: ${context.error.message}`);
        const result = { strategy: 'NONE', confidence: 0, fix: '', action: 'IGNORE' };
        // 1. STRATEGY: LOGIC HEAL (From Source A)
        if (this.isLogicFailure(context.error)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const logicResult = await this.executeLogicHealing(context);
            if (logicResult.confidence > 0.7) {
                this.recordEvent(context, logicResult);
                return logicResult;
            }
        }
        // 2. STRATEGY: VISUAL/SEMANTIC HEAL (From Source B)
        if (context.domSnapshot) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const visualResult = await this.executeVisualHealing(context);
            if (visualResult.confidence > 0.6) {
                this.recordEvent(context, visualResult);
                return visualResult;
            }
        }
        this.recordEvent(context, result);
        return result;
    }
    // Complexity: O(1)
    recordEvent(ctx, sol) {
        this.history.push({
            timestamp: Date.now(),
            error: ctx.error.message,
            component: ctx.component,
            solution: sol
        });
        this.saveMemory();
    }
    // ─────────────────────────────────────────────────────────────
    // STRATEGY A: LOGIC (Selectors & Timeouts)
    // ─────────────────────────────────────────────────────────────
    // Complexity: O(1)
    isLogicFailure(err) {
        const msg = err.message.toLowerCase();
        return msg.includes('selector') || msg.includes('timeout') || msg.includes('found');
    }
    // Complexity: O(1) — hash/map lookup
    async executeLogicHealing(ctx) {
        // Simulating SelectorGenerator logic from Source A
        if (ctx.selector && ctx.selector.includes('#')) {
            // ID failed, try Class
            const newSelector = ctx.selector.replace('#', '.');
            console.log(`[HybridHealer] 🧠 Strategy A: ID -> Class conversion.`);
            return {
                strategy: 'ID_TO_CLASS',
                confidence: 0.8,
                fix: newSelector,
                action: 'RETRY'
            };
        }
        return { strategy: 'LOGIC_FAIL', confidence: 0, fix: '', action: 'IGNORE' };
    }
    // ─────────────────────────────────────────────────────────────
    // STRATEGY B: VISUAL (Semantic & Text)
    // ─────────────────────────────────────────────────────────────
    // Complexity: O(1) — hash/map lookup
    async executeVisualHealing(ctx) {
        // Simulating Semantic Match from Source B
        // e.g., finding button by text "Submit" instead of ID "btn-main"
        if (ctx.component === 'SubmitButton') {
            console.log(`[HybridHealer] 👁️ Strategy B: Visual/Text Match.`);
            return {
                strategy: 'SEMANTIC_TEXT_MATCH',
                confidence: 0.95,
                fix: `//button[contains(text(), "Submit")]`,
                action: 'REWRITE_CODE'
            };
        }
        return { strategy: 'VISUAL_FAIL', confidence: 0, fix: '', action: 'IGNORE' };
    }
}
exports.HybridHealer = HybridHealer;
// Global Export
exports.hybridHealer = HybridHealer.getInstance();
