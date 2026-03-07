/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEURAL KILL-SWITCH - IP Protection System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Ако някой се опита да копира защитените файлове, логиката автоматично
 *  се променя, за да стане неизползваема за външни лица."
 */

import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync, watch, FSWatcher } from 'fs';
import * as crypto from 'crypto';

export interface ProtectedFile {
    path: string;
    hash: string;
    protectionLevel: 1 | 2 | 3;
    lastVerified: Date;
    integrityStatus: 'valid' | 'tampered' | 'destroyed';
}

export interface IntrusionEvent {
    timestamp: Date;
    type: 'access' | 'copy' | 'modification' | 'extraction';
    filePath: string;
    action: 'logged' | 'scrambled' | 'destroyed';
    details: string;
}

export interface KillSwitchConfig {
    enabledFiles: string[];
    protectionLevel: 1 | 2 | 3;
    alertOnIntrusion: boolean;
    autoScramble: boolean;
    authorizedHashes: string[];
}

export class NeuralKillSwitch extends EventEmitter {
    private static instance: NeuralKillSwitch;

    private protectedFiles = new Map<string, ProtectedFile>();
    private intrusionLog: IntrusionEvent[] = [];
    private watchers = new Map<string, FSWatcher>();
    private isArmed = false;

    private readonly PROTECTED_PATTERNS = [
        'src/fortress/tls-phantom.ts',
        'src/fortress/ghost-executor.ts',
        'src/physics/NeuralInference.ts',
        'src/omega/ChronosOmegaArchitect.ts',
        'src/intelligence/ImmuneSystem.ts',
    ];

    private readonly AUTHORIZED_SIGNATURES = [
        'DIMITAR_PRODROMOV_NEURAL_HUB',
        'QANTUM_EMPIRE_AUTHORIZED',
        'MISTER_MIND_APPROVED',
    ];

    private constructor() {
        super();
    }

    static getInstance(): NeuralKillSwitch {
        if (!NeuralKillSwitch.instance) {
            NeuralKillSwitch.instance = new NeuralKillSwitch();
        }
        return NeuralKillSwitch.instance;
    }

    // Complexity: O(N) — loop
    arm(config?: Partial<KillSwitchConfig>): void {
        if (this.isArmed) return;
        for (const pattern of config?.enabledFiles || this.PROTECTED_PATTERNS) {
            this.registerProtectedFile(pattern, config?.protectionLevel || 2);
        }
        this.startWatching();
        this.isArmed = true;
        this.emit('armed', { timestamp: new Date(), filesProtected: this.protectedFiles.size });
    }

    // Complexity: O(1)
    disarm(authorizationKey: string): boolean {
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
    private registerProtectedFile(filePath: string, level: 1 | 2 | 3): void {
        if (!existsSync(filePath)) return;
        const content = readFileSync(filePath, 'utf-8');
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        this.protectedFiles.set(filePath, { path: filePath, hash, protectionLevel: level, lastVerified: new Date(), integrityStatus: 'valid' });
    }

    // Complexity: O(N) — loop
    private startWatching(): void {
        for (const [filePath, info] of this.protectedFiles) {
            try {
                const watcher = watch(filePath, (eventType) => this.handleFileEvent(filePath, eventType));
                this.watchers.set(filePath, watcher);
            } catch (error) { }
        }
    }

    // Complexity: O(N) — loop
    private stopWatching(): void {
        for (const [path, watcher] of this.watchers) watcher.close();
        this.watchers.clear();
    }

    // Complexity: O(1) — lookup
    private handleFileEvent(filePath: string, eventType: string): void {
        if (!this.isArmed || this.isAuthorizedEnvironment()) return;
        const currentContent = readFileSync(filePath, 'utf-8');
        const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
        const protected_file = this.protectedFiles.get(filePath);
        if (protected_file && currentHash !== protected_file.hash) {
            this.logIntrusion({ type: 'modification', filePath, details: 'File modified externally' });
            this.executeProtection(filePath, protected_file.protectionLevel);
        }
    }

    // Complexity: O(1) — lookup
    private executeProtection(filePath: string, level: 1 | 2 | 3): void {
        const protected_file = this.protectedFiles.get(filePath);
        if (!protected_file) return;
        if (level === 2) this.scrambleFile(filePath);
        else if (level === 3) this.destroyFile(filePath);
        protected_file.integrityStatus = level === 2 ? 'tampered' : 'destroyed';
    }

    // Complexity: O(1)
    private scrambleFile(filePath: string): void {
        const content = readFileSync(filePath, 'utf-8');
        let scrambled = `/* QANTUM KILL-SWITCH ACTIVATED */\nthrow new Error("UNAUTHORIZED_ACCESS");\n${content}`;
        // Complexity: O(1)
        writeFileSync(filePath, scrambled);
    }

    // Complexity: O(1)
    private destroyFile(filePath: string): void {
        // Complexity: O(1)
        writeFileSync(filePath, 'throw new Error("FILE_DESTROYED_BY_NEURAL_KILL_SWITCH");');
    }

    // Complexity: O(1)
    private isAuthorizedEnvironment(): boolean {
        const authorizedMachines = ['DIMITAR-PC', 'NEURAL-HUB', 'QANTUM-DEV'];
        const hostname = process.env.COMPUTERNAME || process.env.HOSTNAME || '';
        return authorizedMachines.some(m => hostname.toUpperCase().includes(m));
    }

    // Complexity: O(1)
    private verifyAuthorization(key: string): boolean {
        return this.AUTHORIZED_SIGNATURES.includes(key);
    }

    // Complexity: O(1)
    private logIntrusion(event: Omit<IntrusionEvent, 'timestamp' | 'action'>): void {
        const fullEvent: IntrusionEvent = { ...event, timestamp: new Date(), action: 'logged' };
        this.intrusionLog.push(fullEvent);
        this.emit('intrusion', fullEvent);
    }
}

export const killSwitch = NeuralKillSwitch.getInstance();
export default NeuralKillSwitch;
