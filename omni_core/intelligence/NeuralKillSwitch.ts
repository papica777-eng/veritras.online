/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEURAL KILL-SWITCH - IP Protection System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "Ако някой се опита да копира защитените файлове, логиката автоматично
 *  се променя, за да стане неизползваема за външни лица."
 * 
 * Protection Levels:
 * - Level 1: Obfuscation warning
 * - Level 2: Logic scrambling
 * - Level 3: Full destruction
 * 
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 28.5.0 - THE AWAKENING
 */

import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync, watch, FSWatcher } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL KILL-SWITCH
// ═══════════════════════════════════════════════════════════════════════════════

export class NeuralKillSwitch extends EventEmitter {
  private static instance: NeuralKillSwitch;
  
  private protectedFiles = new Map<string, ProtectedFile>();
  private intrusionLog: IntrusionEvent[] = [];
  private watchers = new Map<string, FSWatcher>();
  private isArmed = false;

  // Protected file patterns
  private readonly PROTECTED_PATTERNS = [
    'src/fortress/tls-phantom.ts',
    'src/fortress/ghost-executor.ts',
    'src/physics/NeuralInference.ts',
    'src/omega/ChronosOmegaArchitect.ts',
    'src/intelligence/ImmuneSystem.ts',
  ];

  // Authorized environment signatures
  private readonly AUTHORIZED_SIGNATURES = [
    'DIMITAR_PRODROMOV_NEURAL_HUB',
    'QANTUM_EMPIRE_AUTHORIZED',
    'MISTER_MIND_APPROVED',
  ];

  private constructor() {
    super();
    console.log('🔐 [KILL-SWITCH] Neural protection system initialized');
  }

  static getInstance(): NeuralKillSwitch {
    if (!NeuralKillSwitch.instance) {
      NeuralKillSwitch.instance = new NeuralKillSwitch();
    }
    return NeuralKillSwitch.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARMING & DISARMING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Arm the kill-switch protection system
   */
  // Complexity: O(N) — linear iteration
  arm(config?: Partial<KillSwitchConfig>): void {
    if (this.isArmed) {
      console.log('⚠️ [KILL-SWITCH] Already armed');
      return;
    }

    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    NEURAL KILL-SWITCH ARMED                                   ║
║                                                                               ║
║  Protection Level: ${(config?.protectionLevel || 2).toString().padEnd(49)}║
║  Files Protected: ${this.PROTECTED_PATTERNS.length.toString().padEnd(50)}║
║                                                                               ║
║  "Копиращите ще намерят само пепел."                                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);

    // Register protected files
    for (const pattern of config?.enabledFiles || this.PROTECTED_PATTERNS) {
      this.registerProtectedFile(pattern, config?.protectionLevel || 2);
    }

    // Start file watchers
    this.startWatching();

    this.isArmed = true;
    this.emit('armed', { timestamp: new Date(), filesProtected: this.protectedFiles.size });
  }

  /**
   * Disarm with authorization
   */
  // Complexity: O(1)
  disarm(authorizationKey: string): boolean {
    if (!this.verifyAuthorization(authorizationKey)) {
      this.logIntrusion({
        type: 'access',
        filePath: 'KILL_SWITCH_SYSTEM',
        details: 'Unauthorized disarm attempt',
      });
      console.log('❌ [KILL-SWITCH] Unauthorized disarm attempt logged');
      return false;
    }

    this.stopWatching();
    this.isArmed = false;
    console.log('🔓 [KILL-SWITCH] Disarmed by authorized user');
    this.emit('disarmed', { timestamp: new Date() });
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE PROTECTION
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1) — hash/map lookup
  private registerProtectedFile(filePath: string, level: 1 | 2 | 3): void {
    if (!existsSync(filePath)) {
      console.log(`⚠️ [KILL-SWITCH] File not found: ${filePath}`);
      return;
    }

    const content = readFileSync(filePath, 'utf-8');
    const hash = this.hashContent(content);

    this.protectedFiles.set(filePath, {
      path: filePath,
      hash,
      protectionLevel: level,
      lastVerified: new Date(),
      integrityStatus: 'valid',
    });

    console.log(`🛡️ [PROTECTED] ${filePath} (Level ${level})`);
  }

  // Complexity: O(N) — linear iteration
  private startWatching(): void {
    for (const [filePath, info] of this.protectedFiles) {
      try {
        const watcher = watch(filePath, (eventType, filename) => {
          this.handleFileEvent(filePath, eventType);
        });
        this.watchers.set(filePath, watcher);
      } catch (error) {
        console.log(`⚠️ [KILL-SWITCH] Could not watch: ${filePath}`);
      }
    }
  }

  // Complexity: O(N) — linear iteration
  private stopWatching(): void {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
    }
    this.watchers.clear();
  }

  // Complexity: O(1) — hash/map lookup
  private handleFileEvent(filePath: string, eventType: string): void {
    if (!this.isArmed) return;

    const protected_file = this.protectedFiles.get(filePath);
    if (!protected_file) return;

    // Check if running in authorized environment
    if (this.isAuthorizedEnvironment()) {
      return; // Allow modifications by authorized users
    }

    // Verify integrity
    const currentContent = readFileSync(filePath, 'utf-8');
    const currentHash = this.hashContent(currentContent);

    if (currentHash !== protected_file.hash) {
      // INTRUSION DETECTED
      this.logIntrusion({
        type: 'modification',
        filePath,
        details: `File modified externally. Original hash: ${protected_file.hash.substring(0, 8)}... Current: ${currentHash.substring(0, 8)}...`,
      });

      // Execute protection based on level
      this.executeProtection(filePath, protected_file.protectionLevel);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTECTION EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1) — hash/map lookup
  private executeProtection(filePath: string, level: 1 | 2 | 3): void {
    const protected_file = this.protectedFiles.get(filePath);
    if (!protected_file) return;

    switch (level) {
      case 1:
        // Level 1: Warning only
        console.log(`⚠️ [KILL-SWITCH] WARNING: Unauthorized access to ${filePath}`);
        this.emit('warning', { filePath, level: 1 });
        break;

      case 2:
        // Level 2: Scramble the logic
        console.log(`🔀 [KILL-SWITCH] SCRAMBLING: ${filePath}`);
        this.scrambleFile(filePath);
        protected_file.integrityStatus = 'tampered';
        this.emit('scrambled', { filePath, level: 2 });
        break;

      case 3:
        // Level 3: Full destruction
        console.log(`💀 [KILL-SWITCH] DESTROYING: ${filePath}`);
        this.destroyFile(filePath);
        protected_file.integrityStatus = 'destroyed';
        this.emit('destroyed', { filePath, level: 3 });
        break;
    }
  }

  // Complexity: O(1) — hash/map lookup
  private scrambleFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      // Scramble the code by:
      // 1. Renaming variables to garbage
      // 2. Inserting dead code
      // 3. Breaking critical logic paths
      
      let scrambled = content;
      
      // Replace function names with garbage
      scrambled = scrambled.replace(
        /function\s+(\w+)/g,
        (_, name) => `function _PROTECTED_${this.randomString(8)}`
      );

      // Insert fake return statements
      scrambled = scrambled.replace(
        /export\s+/g,
        `/* QANTUM KILL-SWITCH ACTIVATED - IP PROTECTED */\nthrow new Error("UNAUTHORIZED_ACCESS");\nexport `
      );

      // Add honeypot data
      scrambled = `
/**
 * ⚠️ QANTUM NEURAL KILL-SWITCH ACTIVATED ⚠️
 * 
 * This file has been scrambled due to unauthorized access.
 * Original functionality has been destroyed.
 * 
 * Contact: security@qantum.dev
 */

const _HONEYPOT_DATA = "${this.randomString(256)}";
const _TRACKING_ID = "${crypto.randomUUID()}";

// Send beacon (disabled in scrambled mode)
// fetch('https://qantum.dev/api/intrusion', { method: 'POST', body: JSON.stringify({ tracking: _TRACKING_ID }) });

${scrambled}
      `;

      // Complexity: O(1) — hash/map lookup
      writeFileSync(filePath, scrambled);
      console.log(`🔀 [SCRAMBLED] ${filePath}`);
    } catch (error) {
      console.error(`❌ [KILL-SWITCH] Scramble failed:`, error);
    }
  }

  // Complexity: O(1) — hash/map lookup
  private destroyFile(filePath: string): void {
    try {
      const tombstone = `
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💀 THIS FILE HAS BEEN DESTROYED BY QANTUM NEURAL KILL-SWITCH 💀
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Reason: Unauthorized access/extraction attempt detected
 * Timestamp: ${new Date().toISOString()}
 * 
 * The original content has been permanently erased.
 * All intellectual property has been protected.
 * 
 * "В QAntum не лъжем. И не прощаваме кражбата."
 * 
 * Contact: legal@qantum.dev
 * 
 * © ${new Date().getFullYear()} QAntum Empire. All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

throw new Error("FILE_DESTROYED_BY_NEURAL_KILL_SWITCH");
      `;

      // Complexity: O(1) — hash/map lookup
      writeFileSync(filePath, tombstone);
      console.log(`💀 [DESTROYED] ${filePath}`);
    } catch (error) {
      console.error(`❌ [KILL-SWITCH] Destroy failed:`, error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHORIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N*M) — nested iteration detected
  private isAuthorizedEnvironment(): boolean {
    // Check for authorized environment signatures
    const authorizedEnvVars = [
      'QANTUM_NEURAL_HUB',
      'MISTER_MIND_AUTHORIZED',
      'DIMITAR_PRODROMOV_KEY',
    ];

    for (const envVar of authorizedEnvVars) {
      if (process.env[envVar]) {
        return this.AUTHORIZED_SIGNATURES.includes(process.env[envVar]!);
      }
    }

    // Check machine fingerprint (simplified)
    const hostname = process.env.COMPUTERNAME || process.env.HOSTNAME || '';
    const authorizedMachines = ['DIMITAR-PC', 'NEURAL-HUB', 'QANTUM-DEV'];
    
    return authorizedMachines.some(m => hostname.toUpperCase().includes(m));
  }

  // Complexity: O(1)
  private verifyAuthorization(key: string): boolean {
    // Hash the provided key and check against authorized hashes
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    
    // Pre-computed hashes of authorized keys
    const authorizedKeyHashes = [
      '7e4a7b3c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a', // Master key
      // Add more authorized key hashes here
    ];

    return authorizedKeyHashes.includes(keyHash) || 
           this.AUTHORIZED_SIGNATURES.includes(key);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTRUSION LOGGING
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N)
  private logIntrusion(event: Omit<IntrusionEvent, 'timestamp' | 'action'>): void {
    const fullEvent: IntrusionEvent = {
      ...event,
      timestamp: new Date(),
      action: 'logged',
    };

    this.intrusionLog.push(fullEvent);
    this.emit('intrusion', fullEvent);

    // Save to disk
    try {
      const logPath = './data/intrusion-log.json';
      const existingLog = existsSync(logPath) 
        ? JSON.parse(readFileSync(logPath, 'utf-8')) 
        : [];
      existingLog.push(fullEvent);
      // Complexity: O(1)
      writeFileSync(logPath, JSON.stringify(existingLog, null, 2));
    } catch {
      // Silent fail for logging
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Complexity: O(1)
  private randomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  isSystemArmed(): boolean {
    return this.isArmed;
  }

  // Complexity: O(1)
  getProtectedFiles(): ProtectedFile[] {
    return Array.from(this.protectedFiles.values());
  }

  // Complexity: O(1)
  getIntrusionLog(): IntrusionEvent[] {
    return [...this.intrusionLog];
  }

  // Complexity: O(N) — linear iteration
  verifyIntegrity(): { valid: number; tampered: number; destroyed: number } {
    const result = { valid: 0, tampered: 0, destroyed: 0 };
    
    for (const [filePath, info] of this.protectedFiles) {
      if (info.integrityStatus === 'valid') {
        // Re-verify
        if (existsSync(filePath)) {
          const currentHash = this.hashContent(readFileSync(filePath, 'utf-8'));
          if (currentHash === info.hash) {
            result.valid++;
          } else {
            result.tampered++;
          }
        } else {
          result.destroyed++;
        }
      } else {
        result[info.integrityStatus]++;
      }
    }

    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const killSwitch = NeuralKillSwitch.getInstance();
export default NeuralKillSwitch;
