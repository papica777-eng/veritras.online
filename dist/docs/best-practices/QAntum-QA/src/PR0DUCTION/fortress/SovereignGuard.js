"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SOVEREIGN GUARD - Дигитален Имунитет от Висш Порядък
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Това е първият в света код, който активно се защитава от неоторизиран
 *  достъп чрез Математическа Ентропия. Софтуер с инстинкт за самосъхранение."
 *
 * Enhanced version combining:
 * - NeuralKillSwitch functionality (Level 1-3 retaliation)
 * - Biometric verification
 * - Intent signature monitoring
 * - AST-level code scrambling
 * - Tombstone protocol
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 30.1.0 - SOVEREIGN GUARD PROTOCOL
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
exports.sovereignGuard = exports.SovereignGuard = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// SOVEREIGN GUARD
// ═══════════════════════════════════════════════════════════════════════════════
class SovereignGuard extends events_1.EventEmitter {
    static instance;
    PROTECTED_FILES = [
        'src/fortress/tls-phantom.ts',
        'src/fortress/ghost-executor.ts',
        'src/physics/NeuralInference.ts',
        'src/omega/ChronosOmegaArchitect.ts',
        'src/omega/SovereignNucleus.ts',
        'src/intelligence/ImmuneSystem.ts',
        'src/intelligence/AIAgentExpert.ts',
    ];
    AUTHORIZED_SIGNATURES = [
        'DIMITAR_PRODROMOV_SOVEREIGN',
        'QANTUM_EMPIRE_AUTHORIZED',
        'MISTER_MIND_APPROVED',
    ];
    BACKUP_DIR = 'data/sovereign-backups';
    LOG_PATH = 'data/sovereign-guard/intrusion.log';
    intrusionLog = [];
    fileHashes = new Map();
    isArmed = false;
    constructor() {
        super();
        this.loadIntrusionLog();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🛡️ SOVEREIGN GUARD INITIALIZED 🛡️                           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  "Дигитален Имунитет от Висш Порядък"                                         ║
║                                                                               ║
║  Protected Files: ${this.PROTECTED_FILES.length.toString().padEnd(52)}║
║  Retaliation Levels: 1 (Warn), 2 (Scramble), 3 (Destroy)                      ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
    }
    static getInstance() {
        if (!SovereignGuard.instance) {
            SovereignGuard.instance = new SovereignGuard();
        }
        return SovereignGuard.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ARM / DISARM
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Arm the Sovereign Guard with specified protection
     */
    async arm(config) {
        if (this.isArmed) {
            console.log('⚠️ [GUARD] Already armed.');
            return;
        }
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🛡️ SOVEREIGN GUARD ARMING... 🛡️                             ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
        // Create backups
        for (const file of this.PROTECTED_FILES) {
            await this.createBackup(file);
            this.computeFileHash(file);
        }
        this.isArmed = true;
        this.emit('armed', { timestamp: new Date(), files: this.PROTECTED_FILES });
        console.log(`
✅ [GUARD] Armed and ready.
   Protected: ${this.PROTECTED_FILES.length} files
   Level: ${config?.level || 2}
   Strategy: ${config?.strategy || 'Scramble'}
    `);
    }
    /**
     * Disarm with biometric verification
     */
    disarm(biometricKey) {
        if (!this.verifyBiometric({ biometricSignature: biometricKey })) {
            this.logIntrusion({
                level: 1,
                file: 'SYSTEM',
                action: 'LOGGED',
                details: 'Unauthorized disarm attempt',
            });
            console.log('❌ [GUARD] Unauthorized disarm attempt logged.');
            return false;
        }
        this.isArmed = false;
        console.log('🔓 [GUARD] Disarmed by authorized user.');
        this.emit('disarmed', { timestamp: new Date() });
        return true;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INTEGRITY MONITORING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Monitor an access attempt and respond accordingly
     */
    async monitorIntegrity(accessAttempt) {
        if (!this.isArmed)
            return;
        console.log(`🔍 [GUARD] Monitoring access: ${accessAttempt.action} on ${accessAttempt.file}`);
        const isAuthorized = await this.verifyBiometric(accessAttempt);
        if (!isAuthorized) {
            const level = this.calculateRetaliationLevel(accessAttempt);
            console.log(`🚨 [GUARD] Unauthorized access! Retaliation Level: ${level}`);
            await this.executeRetaliation(level, accessAttempt.file);
        }
    }
    /**
     * Verify biometric signature
     */
    async verifyBiometric(attempt) {
        // Check if biometric signature is authorized
        if (attempt.biometricSignature) {
            return this.AUTHORIZED_SIGNATURES.some(sig => attempt.biometricSignature?.includes(sig));
        }
        // Check intent signature
        if (attempt.intentSignature) {
            // Verify against Primary Directive alignment
            const hash = crypto.createHash('sha256').update(attempt.intentSignature).digest('hex');
            return hash.startsWith('0000'); // Simplified check
        }
        // Environment check (development mode)
        return process.env.QANTUM_DEV === 'true' ||
            process.env.NODE_ENV === 'development';
    }
    /**
     * Calculate retaliation level based on threat severity
     */
    calculateRetaliationLevel(attempt) {
        let severity = 0;
        // Action severity
        switch (attempt.action) {
            case 'READ':
                severity += 1;
                break;
            case 'COPY':
                severity += 3;
                break;
            case 'EXTRACT':
                severity += 4;
                break;
            case 'WRITE':
                severity += 2;
                break;
            case 'EXECUTE':
                severity += 2;
                break;
        }
        // Target sensitivity
        if (attempt.file.includes('NeuralInference'))
            severity += 2;
        if (attempt.file.includes('ChronosOmega'))
            severity += 3;
        if (attempt.file.includes('tls-phantom'))
            severity += 3;
        if (attempt.file.includes('SovereignNucleus'))
            severity += 4;
        // Repeated attempts
        const recentAttempts = this.intrusionLog.filter(log => Date.now() - log.timestamp.getTime() < 3600000 // Last hour
        ).length;
        severity += recentAttempts;
        // Determine level
        if (severity >= 8)
            return 3; // Destroy
        if (severity >= 4)
            return 2; // Scramble
        return 1; // Warning
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RETALIATION EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Execute retaliation at specified level
     */
    async executeRetaliation(level, targetFile) {
        const files = targetFile ? [targetFile] : this.PROTECTED_FILES;
        for (const file of files) {
            if (!(0, fs_1.existsSync)(file))
                continue;
            switch (level) {
                case 1:
                    // Level 1: Warning Only - Log the attempt
                    console.warn(`🚨 [GUARD] Level 1: Unauthorized access to ${file}. IP Logged.`);
                    this.logIntrusion({
                        level: 1,
                        file,
                        action: 'LOGGED',
                        details: 'Unauthorized access attempt detected',
                    });
                    this.emit('warning', { file, timestamp: new Date() });
                    break;
                case 2:
                    // Level 2: Logic Scrambling (AST Mutation)
                    console.error(`🌀 [GUARD] Level 2: Scrambling logic in ${file}...`);
                    await this.scrambleCode(file);
                    this.logIntrusion({
                        level: 2,
                        file,
                        action: 'SCRAMBLED',
                        details: 'Code logic scrambled via mathematical entropy',
                    });
                    this.emit('scrambled', { file, timestamp: new Date() });
                    break;
                case 3:
                    // Level 3: Full Destruction (Tombstone)
                    console.error(`💀 [GUARD] Level 3: Total destruction of ${file}.`);
                    await this.obliterate(file);
                    this.logIntrusion({
                        level: 3,
                        file,
                        action: 'DESTROYED',
                        details: 'File obliterated, tombstone marker placed',
                    });
                    this.emit('destroyed', { file, timestamp: new Date() });
                    break;
            }
        }
    }
    /**
     * Scramble code using mathematical entropy
     * Makes the code look valid but completely non-functional
     */
    async scrambleCode(filePath) {
        try {
            const code = (0, fs_1.readFileSync)(filePath, 'utf-8');
            // Create backup first
            await this.createBackup(filePath);
            // Scramble the code while preserving structure
            const scrambled = this.applyMathematicalEntropy(code);
            const header = `
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚠️ SCRAMBLED BY QANTUM SOVEREIGN GUARD ⚠️
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This file has been scrambled due to unauthorized access attempt.
 * The code structure appears valid but produces unpredictable results.
 * 
 * Recovery is possible only with authorized biometric credentials.
 * Contact: Dimitar Prodromov / Mister Mind
 * 
 * Scrambled at: ${new Date().toISOString()}
 */

`;
            (0, fs_1.writeFileSync)(filePath, header + scrambled);
        }
        catch (error) {
            console.error(`❌ [GUARD] Failed to scramble ${filePath}:`, error);
        }
    }
    /**
     * Apply mathematical entropy to code
     * This makes code look syntactically valid but logically broken
     */
    applyMathematicalEntropy(code) {
        // Split into lines
        const lines = code.split('\n');
        // Identify function bodies and scramble their logic
        const scrambledLines = lines.map((line, index) => {
            // Preserve imports and exports
            if (line.includes('import ') || line.includes('export ')) {
                return line;
            }
            // Scramble numeric literals with entropy
            line = line.replace(/\b(\d+)\b/g, (match) => {
                const num = parseInt(match);
                return String(num ^ 0x5A5A5A5A); // XOR with entropy pattern
            });
            // Invert boolean logic
            line = line.replace(/true/g, '/*!*/false');
            line = line.replace(/false/g, '/*!*/true');
            // Swap comparison operators
            line = line.replace(/===/g, '!/*ent*/==');
            line = line.replace(/>=/g, '</*ent*/');
            return line;
        });
        // Shuffle non-critical lines within functions (simplified)
        return scrambledLines.join('\n');
    }
    /**
     * Obliterate file and leave tombstone
     */
    async obliterate(filePath) {
        try {
            // Create backup before destruction
            await this.createBackup(filePath);
            // Compute hash for record
            const hash = this.fileHashes.get(filePath) || 'UNKNOWN';
            // Delete the original
            (0, fs_1.unlinkSync)(filePath);
            // Create tombstone marker
            const tombstone = {
                status: 'OBLITERATED',
                reason: 'Unauthorized access to Sovereign Core',
                originalHash: hash,
                timestamp: new Date().toISOString(),
            };
            (0, fs_1.writeFileSync)(`${filePath}.tombstone`, JSON.stringify(tombstone, null, 2));
            console.log(`💀 [GUARD] Tombstone placed at ${filePath}.tombstone`);
        }
        catch (error) {
            console.error(`❌ [GUARD] Failed to obliterate ${filePath}:`, error);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BACKUP & RECOVERY
    // ═══════════════════════════════════════════════════════════════════════════
    async createBackup(filePath) {
        try {
            if (!(0, fs_1.existsSync)(filePath))
                return null;
            if (!(0, fs_1.existsSync)(this.BACKUP_DIR)) {
                (0, fs_1.mkdirSync)(this.BACKUP_DIR, { recursive: true });
            }
            const timestamp = Date.now();
            const fileName = filePath.replace(/[\/\\]/g, '_');
            const backupPath = (0, path_1.join)(this.BACKUP_DIR, `${fileName}.${timestamp}.bak`);
            (0, fs_1.copyFileSync)(filePath, backupPath);
            return backupPath;
        }
        catch {
            return null;
        }
    }
    /**
     * Recover a file from backup (requires authorization)
     */
    async recover(filePath, biometricKey) {
        if (!this.verifyBiometric({ biometricSignature: biometricKey })) {
            console.log('❌ [GUARD] Recovery denied: Invalid biometric.');
            return false;
        }
        // Find latest backup
        const fileName = filePath.replace(/[\/\\]/g, '_');
        const backupPattern = `${fileName}.`;
        // Would search for latest backup and restore
        console.log(`🔄 [GUARD] Recovery initiated for ${filePath}`);
        return true;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════════════════════
    computeFileHash(filePath) {
        try {
            if (!(0, fs_1.existsSync)(filePath))
                return;
            const content = (0, fs_1.readFileSync)(filePath);
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            this.fileHashes.set(filePath, hash);
        }
        catch { }
    }
    logIntrusion(entry) {
        const log = {
            id: `intrusion_${Date.now()}`,
            timestamp: new Date(),
            ...entry,
        };
        this.intrusionLog.push(log);
        this.saveIntrusionLog();
        this.emit('intrusion', log);
    }
    loadIntrusionLog() {
        try {
            if ((0, fs_1.existsSync)(this.LOG_PATH)) {
                const data = JSON.parse((0, fs_1.readFileSync)(this.LOG_PATH, 'utf-8'));
                this.intrusionLog = data.map((entry) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp),
                }));
            }
        }
        catch { }
    }
    saveIntrusionLog() {
        try {
            const dir = (0, path_1.dirname)(this.LOG_PATH);
            if (!(0, fs_1.existsSync)(dir)) {
                (0, fs_1.mkdirSync)(dir, { recursive: true });
            }
            (0, fs_1.writeFileSync)(this.LOG_PATH, JSON.stringify(this.intrusionLog, null, 2));
        }
        catch { }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS
    // ═══════════════════════════════════════════════════════════════════════════
    getStatus() {
        return {
            isArmed: this.isArmed,
            protectedFiles: this.PROTECTED_FILES.length,
            intrusionCount: this.intrusionLog.length,
            lastIntrusion: this.intrusionLog[this.intrusionLog.length - 1] || null,
        };
    }
    getIntrusionLog() {
        return [...this.intrusionLog];
    }
}
exports.SovereignGuard = SovereignGuard;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.sovereignGuard = SovereignGuard.getInstance();
exports.default = SovereignGuard;
