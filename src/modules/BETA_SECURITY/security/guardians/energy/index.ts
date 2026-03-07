/**
 * ⚛️🏰 QAntum SECURITY FORTRESS - UNIFIED PROTECTION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *   ███████╗ ██████╗ ██████╗ ████████╗██████╗ ███████╗███████╗███████╗
 *   ██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔════╝██╔════╝██╔════╝
 *   █████╗  ██║   ██║██████╔╝   ██║   ██████╔╝█████╗  ███████╗███████╗
 *   ██╔══╝  ██║   ██║██╔══██╗   ██║   ██╔══██╗██╔══╝  ╚════██║╚════██║
 *   ██║     ╚██████╔╝██║  ██║   ██║   ██║  ██║███████╗███████║███████║
 *   ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *   Unified IP Protection Layer
 *
 *   Layer 1: Obsidian Shield    - Code obfuscation & transformation
 *   Layer 2: Genetic Lock       - Hardware fingerprint verification
 *   Layer 3: Anti-Tamper        - Debug/VM detection & evasion
 *   Layer 4: dSENTINELp Heartbeat - Cloud verification & kill switch
 *   Layer 5: Logic Decoupling   - Critical logic separation
 *
 *   "Five walls stand between your code and those who would steal it."
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'events';
import { HardwareLock, HardwareLockConfig, getHardwareLock } from '../../../../../../scripts/qantum/security/hardware-lock';
import { AntiTamper, AntiTamperConfig, getAntiTamper } from '../../../../../../scripts/qantum/security/anti-tamper';
import { SentinelConfig, getSentinelLink } from '../../../../../../scripts/qantum/security/sentinel-link';
import { FatalityEngine, FatalityConfig, getFatalityEngine } from '../../../../../../scripts/qantum/security/fatality-engine';

// Re-export existing modules
export * from '../../../../../../scripts/qantum/security/SecurityTesting';

// Re-export all security modules
export * from '../../../../../../scripts/qantum/security/hardware-lock';
export * from '../../../../../../scripts/qantum/security/anti-tamper';
export * from '../../../../../../scripts/qantum/security/sentinel-link';
export * from '../../../../../../scripts/qantum/security/fatality-engine';

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface FortressConfig {
  enableHardwareLock: boolean;
  enableAntiTamper: boolean;
  enableSentinelLink: boolean;
  enableFatality: boolean;

  hardwareLockConfig?: Partial<HardwareLockConfig>;
  antiTamperConfig?: Partial<AntiTamperConfig>;
  sentinelConfig?: Partial<SentinelConfig>;
  fatalityConfig?: Partial<FatalityConfig>;

  strictMode: boolean; // Fail if any protection fails
  logLevel: 'silent' | 'minimal' | 'verbose';
}

export interface SecurityStatus {
  isSecure: boolean;
  hardwareLock: {
    enabled: boolean;
    status: 'active' | 'locked' | 'error';
    machineId?: string;
  };
  antiTamper: {
    enabled: boolean;
    status: 'clean' | 'evasion' | 'compromised' | 'error';
    detections: number;
  };
  sentinel: {
    enabled: boolean;
    status: 'active' | 'dormant' | 'offline' | 'error';
    lastVerification?: number;
    offlineTimeRemaining?: number;
  };
  fatality: {
    enabled: boolean;
    status: 'armed' | 'disarmed' | 'triggered';
    honeyPotActive: boolean;
    attackersProfiled: number;
  };
  overallThreatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SECURITY FORTRESS
// ═══════════════════════════════════════════════════════════════════════════════════════

export class SecurityFortress extends EventEmitter {
  private config: FortressConfig;
  private hardwareLock: HardwareLock | null = null;
  private antiTamper: AntiTamper | null = null;
  private sentinelLink: dSENTINELpLink | null = null;
  private fatalityEngine: FatalityEngine | null = null;
  private isInitialized = false;
  private isSecure = false;

  constructor(config?: Partial<FortressConfig>) {
    super();

    this.config = {
      enableHardwareLock: config?.enableHardwareLock ?? true,
      enableAntiTamper: config?.enableAntiTamper ?? true,
      enableSentinelLink: config?.enableSentinelLink ?? true,
      enableFatality: config?.enableFatality ?? true,
      hardwareLockConfig: config?.hardwareLockConfig,
      antiTamperConfig: config?.antiTamperConfig,
      sentinelConfig: config?.sentinelConfig,
      fatalityConfig: config?.fatalityConfig,
      strictMode: config?.strictMode ?? true,
      logLevel: config?.logLevel ?? 'verbose',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────────────

  /**
   * 🏰 Initialize the Security Fortress
   */
  // Complexity: O(1) — amortized
  async initialize(): Promise<boolean> {
    if (this.config.logLevel !== 'silent') {
      console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                               ║
║   ███████╗███████╗ ██████╗██╗   ██╗██████╗ ██╗████████╗██╗   ██╗    ███████╗ ██████╗ ██████╗ ║
║   ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝    ██╔════╝██╔═══██╗██╔══██╗║
║   ███████╗█████╗  ██║     ██║   ██║██████╔╝██║   ██║    ╚████╔╝     █████╗  ██║   ██║██████╔╝║
║   ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██║   ██║     ╚██╔╝      ██╔══╝  ██║   ██║██╔══██╗║
║   ███████║███████╗╚██████╗╚██████╔╝██║  ██║██║   ██║      ██║       ██║     ╚██████╔╝██║  ██║║
║   ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝       ╚═╝      ╚═════╝ ╚═╝  ╚═╝║
║                                                                                               ║
║                         ⚛️ QAntum INTELLECTUAL PROPERTY FORTRESS ⚛️                          ║
║                                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Layer 1: 🔮 Obsidian Shield    │  Code obfuscation & transformation               │   ║
║   │  Layer 2: 🧬 Genetic Lock       │  Hardware fingerprint verification               │   ║
║   │  Layer 3: 🛡️ Anti-Tamper        │  Debug/VM detection & evasion                    │   ║
║   │  Layer 4: 📡 Sentinel Heartbeat │  Cloud verification & kill switch               │   ║
║   │  Layer 5: 🔐 Logic Decoupling   │  Critical logic separation                       │   ║
║   │  Layer 6: 💀 FATALITY           │  Predatory defense & attacker profiling          │   ║
║   └─────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                               ║
║                    "557,000+ lines of code, protected by 6 walls of steel"                   ║
║                                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
`);
    }

    const results: { layer: string; success: boolean }[] = [];

    // Layer 2: Hardware Lock
    if (this.config.enableHardwareLock) {
      this.log('🧬 Initializing Genetic Lock (Hardware Fingerprint)...');

      try {
        this.hardwareLock = getHardwareLock(this.config.hardwareLockConfig);

        this.hardwareLock.on('locked', (data) => {
          this.handleSecurityEvent('hardware_locked', data);
        });

        this.hardwareLock.on('violation', (data) => {
          this.handleSecurityEvent('hardware_violation', data);
        });

        const hwResult = await this.hardwareLock.initialize();
        results.push({ layer: 'Hardware Lock', success: hwResult });

        if (hwResult) {
          this.log('   ✅ Genetic Lock active');
        } else {
          this.log('   ❌ Genetic Lock failed');
        }
      } catch (error) {
        results.push({ layer: 'Hardware Lock', success: false });
        this.log(`   ❌ Genetic Lock error: ${error}`);
      }
    }

    // Layer 3: Anti-Tamper
    if (this.config.enableAntiTamper) {
      this.log('🛡️ Initializing Anti-Tamper (Debug/VM Detection)...');

      try {
        this.antiTamper = getAntiTamper(this.config.antiTamperConfig);

        this.antiTamper.on('detection', (data) => {
          this.handleSecurityEvent('tamper_detected', data);
        });

        this.antiTamper.on('evasion_activated', () => {
          this.handleSecurityEvent('evasion_mode', {});
        });

        const atResult = await this.antiTamper.initialize();
        results.push({ layer: 'Anti-Tamper', success: atResult });

        if (atResult) {
          this.log('   ✅ Anti-Tamper active');
        } else {
          this.log('   ❌ Anti-Tamper failed');
        }
      } catch (error) {
        results.push({ layer: 'Anti-Tamper', success: false });
        this.log(`   ❌ Anti-Tamper error: ${error}`);
      }
    }

    // Layer 4: dSENTINELp Link
    if (this.config.enableSentinelLink) {
      this.log('📡 Initializing Sentinel Link (Cloud Verification)...');

      try {
        // Get machine ID from hardware lock if available
        const machineId = this.hardwareLock?.getFingerprint()
          ? this.hardwareLock['generateMachineId'](this.hardwareLock.getFingerprint()!)
          : 'UNKNOWN';

        this.sentinelLink = getSentinelLink({
          ...this.config.sentinelConfig,
          machineId,
        });

        this.sentinelLink.on('verification_failed', (data) => {
          this.handleSecurityEvent('verification_failed', data);
        });

        this.sentinelLink.on('dormant', () => {
          this.handleSecurityEvent('dormant_mode', {});
        });

        this.sentinelLink.on('kill_switch', () => {
          this.handleSecurityEvent('kill_switch', {});
        });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const slResult = await this.sentinelLink.initialize();
        results.push({ layer: 'Sentinel Link', success: slResult });

        if (slResult) {
          this.log('   ✅ Sentinel Link active');
        } else {
          this.log('   ⚠️ Sentinel Link offline (grace period active)');
        }
      } catch (error) {
        results.push({ layer: 'Sentinel Link', success: false });
        this.log(`   ⚠️ Sentinel Link error (will retry): ${error}`);
      }
    }

    // Layer 6: FATALITY Engine
    if (this.config.enableFatality) {
      this.log('💀 Initializing FATALITY Engine (Predatory Defense)...');

      try {
        this.fatalityEngine = getFatalityEngine({
          ...this.config.fatalityConfig,
          silentMode: this.config.logLevel === 'silent',
        });

        this.fatalityEngine.on('fatality_executing', (data) => {
          this.handleSecurityEvent('fatality_triggered', data);
        });

        this.fatalityEngine.on('attacker_siphoned', (profile) => {
          this.handleSecurityEvent('attacker_profiled', { profileId: profile.id });
        });

        await this.fatalityEngine.arm();
        results.push({ layer: 'FATALITY', success: true });

        this.log('   ✅ FATALITY Engine armed');
      } catch (error) {
        results.push({ layer: 'FATALITY', success: false });
        this.log(`   ❌ FATALITY Engine error: ${error}`);
      }
    }

    // Evaluate overall security
    const failedLayers = results.filter((r) => !r.success);

    if (this.config.strictMode && failedLayers.length > 0) {
      this.log(`\n❌ SECURITY FORTRESS COMPROMISED`);
      this.log(`   Failed layers: ${failedLayers.map((l) => l.layer).join(', ')}`);
      this.isSecure = false;
    } else if (failedLayers.length === 0) {
      this.log(`\n✅ SECURITY FORTRESS FULLY ARMED`);
      this.isSecure = true;
    } else {
      this.log(`\n⚠️ SECURITY FORTRESS PARTIALLY ARMED`);
      this.log(
        `   Active layers: ${results
          .filter((r) => r.success)
          .map((l) => l.layer)
          .join(', ')}`
      );
      this.isSecure = true; // Continue with warning in non-strict mode
    }

    this.isInitialized = true;
    this.emit('initialized', { isSecure: this.isSecure, results });

    return this.isSecure;
  }

  // ─────────────────────────────────────────────────────────────────────────────────────
  // EVENT HANDLING
  // ─────────────────────────────────────────────────────────────────────────────────────

  /**
   * 🚨 Handle security events
   */
  // Complexity: O(1)
  private handleSecurityEvent(type: string, data: any): void {
    this.log(`🚨 Security Event: ${type}`);
    this.emit('security_event', { type, data, timestamp: Date.now() });

    // Re-evaluate security status
    const status = this.getStatus();

    if (status.overallThreatLevel === 'critical') {
      this.log(`💀 CRITICAL THREAT LEVEL - Initiating lockdown`);
      this.initiateEmergencyLockdown();
    }
  }

  /**
   * 🔒 Emergency lockdown
   */
  // Complexity: O(1)
  private initiateEmergencyLockdown(): void {
    this.isSecure = false;

    // Stop all operations
    this.hardwareLock?.stop();
    this.antiTamper?.stop();
    this.sentinelLink?.stop();

    this.emit('lockdown');
  }

  // ─────────────────────────────────────────────────────────────────────────────────────
  // STATUS & MONITORING
  // ─────────────────────────────────────────────────────────────────────────────────────

  /**
   * 📊 Get security status
   */
  // Complexity: O(1) — amortized
  getStatus(): SecurityStatus {
    let threatScore = 0;

    const hwStatus: SecurityStatus['hardwareLock'] = {
      enabled: this.config.enableHardwareLock,
      status: 'active',
      machineId: undefined,
    };

    if (this.hardwareLock) {
      if (this.hardwareLock.isSystemLocked()) {
        hwStatus.status = 'locked';
        threatScore += 40;
      }
      const fp = this.hardwareLock.getFingerprint();
      if (fp) {
        hwStatus.machineId = this.hardwareLock['generateMachineId'](fp);
      }
    }

    const atStatus: SecurityStatus['antiTamper'] = {
      enabled: this.config.enableAntiTamper,
      status: 'clean',
      detections: 0,
    };

    if (this.antiTamper) {
      if (this.antiTamper.isSystemCompromised()) {
        atStatus.status = 'compromised';
        threatScore += 50;
      } else if (this.antiTamper.isInEvasionMode()) {
        atStatus.status = 'evasion';
        threatScore += 20;
      }
      atStatus.detections = this.antiTamper.getDetections().length;
    }

    const slStatus: SecurityStatus['sentinel'] = {
      enabled: this.config.enableSentinelLink,
      status: 'active',
      lastVerification: undefined,
      offlineTimeRemaining: undefined,
    };

    if (this.sentinelLink) {
      if (this.sentinelLink.isInDormantMode()) {
        slStatus.status = 'dormant';
        threatScore += 30;
      } else if (this.sentinelLink.isOffline()) {
        slStatus.status = 'offline';
        threatScore += 10;
        slStatus.offlineTimeRemaining = this.sentinelLink.getOfflineTimeRemaining();
      }
    }

    const ftStatus: SecurityStatus['fatality'] = {
      enabled: this.config.enableFatality,
      status: 'disarmed',
      honeyPotActive: false,
      attackersProfiled: 0,
    };

    if (this.fatalityEngine) {
      if (this.fatalityEngine.isSystemArmed()) {
        ftStatus.status = 'armed';
      }
      if (this.fatalityEngine.isHoneyPotActive()) {
        ftStatus.status = 'triggered';
        ftStatus.honeyPotActive = true;
      }
      ftStatus.attackersProfiled = this.fatalityEngine.getAttackerProfiles().length;
    }

    let threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
    if (threatScore === 0) threatLevel = 'safe';
    else if (threatScore < 20) threatLevel = 'low';
    else if (threatScore < 40) threatLevel = 'medium';
    else if (threatScore < 70) threatLevel = 'high';
    else threatLevel = 'critical';

    // If critical threat, execute FATALITY
    if (threatLevel === 'critical' && this.fatalityEngine && this.fatalityEngine.isSystemArmed()) {
      this.fatalityEngine.executeFatality('critical_threat_detected', { threatScore, threatLevel });
    }

    return {
      isSecure: this.isSecure,
      hardwareLock: hwStatus,
      antiTamper: atStatus,
      sentinel: slStatus,
      fatality: ftStatus,
      overallThreatLevel: threatLevel,
    };
  }

  /**
   * Check if system is secure
   */
  // Complexity: O(N) — potential recursive descent
  isSystemSecure(): boolean {
    if (!this.isInitialized) return false;

    const status = this.getStatus();
    return status.overallThreatLevel === 'safe' || status.overallThreatLevel === 'low';
  }

  /**
   * 💀 Manually execute FATALITY
   */
  // Complexity: O(1)
  async executeFatality(reason: string): Promise<void> {
    if (this.fatalityEngine) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.fatalityEngine.executeFatality(reason);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────────────────

  /**
   * Logging utility
   */
  // Complexity: O(1) — hash/map lookup
  private log(message: string): void {
    if (this.config.logLevel === 'silent') return;
    console.log(`[FORTRESS] ${message}`);
  }

  /**
   * Stop all security systems
   */
  // Complexity: O(1)
  stop(): void {
    this.hardwareLock?.stop();
    this.antiTamper?.stop();
    this.sentinelLink?.stop();
    this.fatalityEngine?.disarm();
    this.emit('stopped');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SINGLETON & FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

let defaultFortress: SecurityFortress | null = null;

export function getSecurityFortress(config?: Partial<FortressConfig>): SecurityFortress {
  if (!defaultFortress) {
    defaultFortress = new SecurityFortress(config);
  }
  return defaultFortress;
}

export function createSecurityFortress(config?: Partial<FortressConfig>): SecurityFortress {
  return new SecurityFortress(config);
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// QUICK START
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * 🚀 Quick start - Initialize all security systems
 */
export async function activateFortress(
  config?: Partial<FortressConfig>
): Promise<SecurityFortress> {
  const fortress = getSecurityFortress(config);
  // SAFETY: async operation — wrap in try-catch for production resilience
  await fortress.initialize();
  return fortress;
}

export default SecurityFortress;
