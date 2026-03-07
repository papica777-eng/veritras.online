/**
 * nexus — Qantum Module
 * @module nexus
 * @path src/nexus.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { ModuleRegistry } from './core/ModuleRegistry';
import { HealthMonitor } from '../scripts/NEW/intelligence/HealthMonitor';
import { MegaSupremeDaemon } from './pinecone-bridge/src/daemon/MegaSupremeDaemon';
import { immuneSystem } from '../MrMindQATool/src/intelligence/ImmuneSystem';
import { getHardwareLock } from '../scripts/qantum/security/hardware-lock';

export class QAntumNexus {
  private static instance: QAntumNexus;

  public readonly registry: ModuleRegistry;
  public readonly monitor: HealthMonitor;
  public readonly daemon: MegaSupremeDaemon;

  private constructor() {
    this.registry = new ModuleRegistry(process.cwd());
    this.monitor = new HealthMonitor();
    this.daemon = MegaSupremeDaemon.getInstance();
  }

  public static getInstance(): QAntumNexus {
    if (!QAntumNexus.instance) {
      QAntumNexus.instance = new QAntumNexus();
    }
    return QAntumNexus.instance;
  }

  // Complexity: O(1)
  async AWAKEN() {
    console.log('🌌 [NEXUS] Awakening the QAntum Empire...');

    // 0. 🧬 GENETIC LOCK VERIFICATION
    console.log('🔐 [NEXUS] Verifying Hardware DNA...');
    const lock = getHardwareLock({ strictMode: true, onViolation: 'destroy' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const isAuthorized = await lock.initialize();

    if (!isAuthorized) {
      console.error('⛔ FATAL: UNAUTHORIZED HARDWARE CLONE DETECTED.');
      console.error('⛔ SYSTEM SELF-DESTRUCT SEQUENCE INITIATED.');
      process.exit(1);
    }
    console.log('✅ [NEXUS] Genetic Signature Verified: Lenovo Ryzen 7 Master Node.');

    // 1. Discover modules
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.registry.discoverModules();
    console.log(`📦 [NEXUS] ${this.registry.getAllModules().length} modules mapped.`);

    // 2. Perform health check
    // SAFETY: async operation — wrap in try-catch for production resilience
    const health = await this.monitor.runFullHealthCheck();
    if (health.overall === 'critical') {
      console.log('🚨 [NEXUS] System critical. Initiating Immune System healing...');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await immuneSystem.healAll();
    }

    // 3. Start the Orchestrator
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.daemon.awaken();

    console.log('🌟 [NEXUS] QAntum Empire is SYNCHRONIZED.');
  }
}

// Global invocation if run directly
if (require.main === module) {
  QAntumNexus.getInstance().AWAKEN().catch(console.error);
}
