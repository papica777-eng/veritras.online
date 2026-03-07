"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SOVEREIGN LEDGER - The Immutable Truth
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Всяко решение е запечатано с хеш. Бъдещето се гради върху неизтриваемо минало."
 *
 * This module implements:
 * - Content Hashing (SHA-512) for every system decision.
 * - Chained Integrity: Each block contains the hash of the previous one.
 * - Local Persistence: Sealed ledger file `./data/sovereign.ledger`.
 * - Veritas Integration: Critical validation results are automatically logged.
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
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
exports.SovereignLedger = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SovereignLedger {
    static instance;
    LEDGER_PATH = path.join(process.cwd(), 'data', 'sovereign.ledger');
    lastHash = '0'.repeat(128);
    currentIndex = 0;
    constructor() {
        this.ensureDataDirectory();
        this.loadLastState();
        console.log(`📜 [LEDGER] Sovereign Ledger active. Integrity chain at block #${this.currentIndex}`);
    }
    static getInstance() {
        if (!SovereignLedger.instance) {
            SovereignLedger.instance = new SovereignLedger();
        }
        return SovereignLedger.instance;
    }
    // Complexity: O(1)
    ensureDataDirectory() {
        const dir = path.dirname(this.LEDGER_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    // Complexity: O(1) — hash/map lookup
    loadLastState() {
        if (fs.existsSync(this.LEDGER_PATH)) {
            try {
                const lines = fs.readFileSync(this.LEDGER_PATH, 'utf8').trim().split('\n');
                if (lines.length > 0) {
                    const lastBlock = JSON.parse(lines[lines.length - 1]);
                    this.lastHash = lastBlock.hash;
                    this.currentIndex = lastBlock.index + 1;
                }
            }
            catch (e) {
                console.error('⚠️ [LEDGER] Corruption detected in ledger file. Initializing emergency recovery...');
                this.backupCorruptedLedger();
            }
        }
    }
    // Complexity: O(1)
    backupCorruptedLedger() {
        const backupPath = `${this.LEDGER_PATH}.corrupted.${Date.now()}`;
        if (fs.existsSync(this.LEDGER_PATH)) {
            fs.renameSync(this.LEDGER_PATH, backupPath);
        }
        this.lastHash = '0'.repeat(128);
        this.currentIndex = 0;
    }
    /**
     * Append a new decision to the ledger
     */
    // Complexity: O(1) — amortized
    async append(action, payload) {
        const timestamp = new Date().toISOString();
        const previousHash = this.lastHash;
        const index = this.currentIndex;
        // Create block content string with guaranteed field order
        const blockContent = JSON.stringify({
            index,
            timestamp,
            action,
            payload,
            previousHash
        });
        // Hash with SHA-512
        const hash = crypto.createHash('sha512').update(blockContent).digest('hex');
        // Simulate Dimitar's signature (In production, this would be a real RSA/ECDSA signature)
        const signature = crypto.createHmac('sha256', 'DIMITAR_SIGNATURE_KEY').update(hash).digest('hex');
        const block = {
            index,
            timestamp,
            action,
            payload,
            previousHash,
            hash,
            signature
        };
        // Atomic append to file
        fs.appendFileSync(this.LEDGER_PATH, JSON.stringify(block) + '\n');
        this.lastHash = hash;
        this.currentIndex++;
        return block;
    }
    /**
     * Comprehensive integrity check of the entire chain
     */
    // Complexity: O(N) — linear iteration
    verifyIntegrity() {
        if (!fs.existsSync(this.LEDGER_PATH))
            return { valid: true, processedBlocks: 0 };
        const lines = fs.readFileSync(this.LEDGER_PATH, 'utf8').trim().split('\n');
        let expectedPreviousHash = '0'.repeat(128);
        for (let i = 0; i < lines.length; i++) {
            const block = JSON.parse(lines[i]);
            // 1. Verify index
            if (block.index !== i)
                return { valid: false, error: `Index mismatch at line ${i}`, processedBlocks: i };
            // 2. Verify previous hash link
            if (block.previousHash !== expectedPreviousHash) {
                return { valid: false, error: `Hash chain broken at block #${i}`, processedBlocks: i };
            }
            // 3. Recalculate and verify current hash with same field order
            const blockContent = JSON.stringify({
                index: block.index,
                timestamp: block.timestamp,
                action: block.action,
                payload: block.payload,
                previousHash: block.previousHash
            });
            const recalculatedHash = crypto.createHash('sha512').update(blockContent).digest('hex');
            if (recalculatedHash !== block.hash) {
                return { valid: false, error: `Data corruption at block #${i}`, processedBlocks: i };
            }
            expectedPreviousHash = block.hash;
        }
        return { valid: true, processedBlocks: lines.length };
    }
    // Complexity: O(N) — linear iteration
    getHistory(limit = 50) {
        if (!fs.existsSync(this.LEDGER_PATH))
            return [];
        const lines = fs.readFileSync(this.LEDGER_PATH, 'utf8').trim().split('\n');
        return lines.slice(-limit).map(l => JSON.parse(l));
    }
}
exports.SovereignLedger = SovereignLedger;
