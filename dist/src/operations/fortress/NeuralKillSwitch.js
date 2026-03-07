"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEURAL KILL-SWITCH - IP Protection System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Ако някой се опита да копира защитените файлове, логиката автоматично
 *  се променя, за да стане неизползваема за външни лица."
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
exports.killSwitch = exports.NeuralKillSwitch = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const crypto = __importStar(require("crypto"));
class NeuralKillSwitch extends events_1.EventEmitter {
    static instance;
    protectedFiles = new Map();
    intrusionLog = [];
    watchers = new Map();
    isArmed = false;
    PROTECTED_PATTERNS = [
        'src/fortress/tls-phantom.ts',
        'src/fortress/ghost-executor.ts',
        'src/physics/NeuralInference.ts',
        'src/omega/ChronosOmegaArchitect.ts',
        'src/intelligence/ImmuneSystem.ts',
    ];
    AUTHORIZED_SIGNATURES = [
        'DIMITAR_PRODROMOV_NEURAL_HUB',
        'QANTUM_EMPIRE_AUTHORIZED',
        'MISTER_MIND_APPROVED',
    ];
    constructor() {
        super();
    }
    static getInstance() {
        if (!NeuralKillSwitch.instance) {
            NeuralKillSwitch.instance = new NeuralKillSwitch();
        }
        return NeuralKillSwitch.instance;
    }
    // Complexity: O(N) — loop
    arm(config) {
        if (this.isArmed)
            return;
        for (const pattern of config?.enabledFiles || this.PROTECTED_PATTERNS) {
            this.registerProtectedFile(pattern, config?.protectionLevel || 2);
        }
        this.startWatching();
        this.isArmed = true;
        this.emit('armed', { timestamp: new Date(), filesProtected: this.protectedFiles.size });
    }
    // Complexity: O(1)
    disarm(authorizationKey) {
        if (!this.verifyAuthorization(authorizationKey)) {
            this.logIntrusion({ type: 'access', filePath: 'KILL_SWITCH_SYSTEM', details: 'Unauthorized disarm attempt' });
            return false;
        }
        this.stopWatching();
        this.isArmed = false;
        this.emit('disarmed', { timestamp: new Date() });
        return true;
    }
    // Complexity: O(1) — lookup
    registerProtectedFile(filePath, level) {
        if (!(0, fs_1.existsSync)(filePath))
            return;
        const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        this.protectedFiles.set(filePath, { path: filePath, hash, protectionLevel: level, lastVerified: new Date(), integrityStatus: 'valid' });
    }
    // Complexity: O(N) — loop
    startWatching() {
        for (const [filePath, info] of this.protectedFiles) {
            try {
                const watcher = (0, fs_1.watch)(filePath, (eventType) => this.handleFileEvent(filePath, eventType));
                this.watchers.set(filePath, watcher);
            }
            catch (error) { }
        }
    }
    // Complexity: O(N) — loop
    stopWatching() {
        for (const [path, watcher] of this.watchers)
            watcher.close();
        this.watchers.clear();
    }
    // Complexity: O(1) — lookup
    handleFileEvent(filePath, eventType) {
        if (!this.isArmed || this.isAuthorizedEnvironment())
            return;
        const currentContent = (0, fs_1.readFileSync)(filePath, 'utf-8');
        const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
        const protected_file = this.protectedFiles.get(filePath);
        if (protected_file && currentHash !== protected_file.hash) {
            this.logIntrusion({ type: 'modification', filePath, details: 'File modified externally' });
            this.executeProtection(filePath, protected_file.protectionLevel);
        }
    }
    // Complexity: O(1) — lookup
    executeProtection(filePath, level) {
        const protected_file = this.protectedFiles.get(filePath);
        if (!protected_file)
            return;
        if (level === 2)
            this.scrambleFile(filePath);
        else if (level === 3)
            this.destroyFile(filePath);
        protected_file.integrityStatus = level === 2 ? 'tampered' : 'destroyed';
    }
    // Complexity: O(1)
    scrambleFile(filePath) {
        const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
        let scrambled = `/* QANTUM KILL-SWITCH ACTIVATED */\nthrow new Error("UNAUTHORIZED_ACCESS");\n${content}`;
        // Complexity: O(1)
        (0, fs_1.writeFileSync)(filePath, scrambled);
    }
    // Complexity: O(1)
    destroyFile(filePath) {
        // Complexity: O(1)
        (0, fs_1.writeFileSync)(filePath, 'throw new Error("FILE_DESTROYED_BY_NEURAL_KILL_SWITCH");');
    }
    // Complexity: O(1)
    isAuthorizedEnvironment() {
        const authorizedMachines = ['DIMITAR-PC', 'NEURAL-HUB', 'QANTUM-DEV'];
        const hostname = process.env.COMPUTERNAME || process.env.HOSTNAME || '';
        return authorizedMachines.some(m => hostname.toUpperCase().includes(m));
    }
    // Complexity: O(1)
    verifyAuthorization(key) {
        return this.AUTHORIZED_SIGNATURES.includes(key);
    }
    // Complexity: O(1)
    logIntrusion(event) {
        const fullEvent = { ...event, timestamp: new Date(), action: 'logged' };
        this.intrusionLog.push(fullEvent);
        this.emit('intrusion', fullEvent);
    }
}
exports.NeuralKillSwitch = NeuralKillSwitch;
exports.killSwitch = NeuralKillSwitch.getInstance();
exports.default = NeuralKillSwitch;
