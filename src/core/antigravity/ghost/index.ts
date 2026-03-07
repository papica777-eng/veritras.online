/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 👻 GHOST MODULE - Unified Stealth System Export
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * The Ghost Module unifies all stealth capabilities into a single, coherent API.
 * This is the entry point for all anti-detection and anonymity features.
 *
 * @author Dimitar Prodromov
 * @version 17.0.0
 */

export { GhostProtocol } from './protocol';
export { AntiDetection } from './anti-detection';
export { NetworkInterceptor } from './network-interceptor';
export { ProxyChain } from './proxy-chain';

// Re-export types
export type {
  StealthLevel,
  FingerprintConfig,
  NetworkObfuscationConfig,
  ProxyConfig,
  ProxyNode,
} from '../../types/security.types';

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 UNIFIED GHOST FACADE
// ═══════════════════════════════════════════════════════════════════════════════════════

import { GhostProtocol } from './protocol';
import { AntiDetection } from './anti-detection';
import { NetworkInterceptor } from './network-interceptor';
import { ProxyChain } from './proxy-chain';
import type { StealthLevel, FingerprintConfig, NetworkObfuscationConfig } from '../../types/security.types';

/**
 * Unified Ghost System - Combines all stealth modules
 *
 * Provides a single interface for complete anonymity and anti-detection.
 */
export class Ghost {
  public readonly protocol: GhostProtocol;
  public readonly antiDetection: AntiDetection;
  public readonly networkInterceptor: NetworkInterceptor;
  public readonly proxyChain: ProxyChain;

  private initialized: boolean = false;

  constructor() {
    this.protocol = new GhostProtocol();
    this.antiDetection = new AntiDetection();
    this.networkInterceptor = new NetworkInterceptor();
    this.proxyChain = new ProxyChain();
  }

  /**
   * Initialize all ghost systems with specified stealth level
   */
  // Complexity: O(1) — amortized
  public initialize(level: StealthLevel = 'standard'): void {
    // Enable ghost protocol
    this.protocol.enable(level);

    // Configure anti-detection based on level
    const fingerprintConfig = this.getFingerprintConfigForLevel(level);
    this.antiDetection.randomizeFingerprint(fingerprintConfig);

    // Configure network obfuscation
    const networkConfig = this.getNetworkConfigForLevel(level);
    this.networkInterceptor.obfuscatePatterns(networkConfig);

    // Configure proxy chain
    this.proxyChain.configure({
      hops: level === 'ghost' ? 5 : level === 'paranoid' ? 4 : 3,
      rotation: 'auto',
      rotationInterval: level === 'ghost' ? 60000 : 300000,
    });

    this.initialized = true;
  }

  /**
   * Get fingerprint configuration based on stealth level
   */
  // Complexity: O(1) — hash/map lookup
  private getFingerprintConfigForLevel(level: StealthLevel): FingerprintConfig {
    const configs: Record<StealthLevel, FingerprintConfig> = {
      minimal: {
        userAgent: true,
        canvas: false,
        webGL: false,
        fonts: false,
        plugins: false,
        timezone: true,
        language: true,
        screen: false,
      },
      standard: {
        userAgent: true,
        canvas: true,
        webGL: true,
        fonts: true,
        plugins: false,
        timezone: true,
        language: true,
        screen: true,
      },
      paranoid: {
        userAgent: true,
        canvas: true,
        webGL: true,
        fonts: true,
        plugins: true,
        timezone: true,
        language: true,
        screen: true,
        hardwareConcurrency: true,
        deviceMemory: true,
      },
      ghost: {
        userAgent: true,
        canvas: true,
        webGL: true,
        fonts: true,
        plugins: true,
        timezone: true,
        language: true,
        screen: true,
        hardwareConcurrency: true,
        deviceMemory: true,
        audioContext: true,
      },
    };

    return configs[level];
  }

  /**
   * Get network configuration based on stealth level
   */
  // Complexity: O(1) — hash/map lookup
  private getNetworkConfigForLevel(level: StealthLevel): NetworkObfuscationConfig {
    const configs: Record<StealthLevel, NetworkObfuscationConfig> = {
      minimal: {
        timing: true,
        headers: false,
        payloadSize: false,
        compression: false,
      },
      standard: {
        timing: true,
        headers: true,
        payloadSize: false,
        compression: true,
      },
      paranoid: {
        timing: true,
        headers: true,
        payloadSize: true,
        compression: true,
      },
      ghost: {
        timing: true,
        headers: true,
        payloadSize: true,
        compression: true,
        tlsFingerprint: true,
      },
    };

    return configs[level];
  }

  /**
   * Enable anti-detection features
   */
  // Complexity: O(1)
  public enableAntiDetection(): void {
    if (!this.initialized) {
      this.initialize('standard');
    }
  }

  /**
   * Get comprehensive status report
   */
  // Complexity: O(1)
  public getStatus(): Record<string, unknown> {
    return {
      initialized: this.initialized,
      protocol: this.protocol.getStatistics(),
      antiDetection: {
        profile: this.antiDetection.getProfile(),
        rating: this.antiDetection.getResistanceRating(),
      },
      network: this.networkInterceptor.getStatistics(),
      proxy: this.proxyChain.getChainInfo(),
    };
  }

  /**
   * Force complete identity refresh
   */
  // Complexity: O(1)
  public refreshIdentity(): void {
    this.protocol.forceMutation();
    this.antiDetection.mutateOnRisk('medium');
    this.proxyChain.rotate();
  }

  /**
   * Clean up all resources
   */
  // Complexity: O(1)
  public destroy(): void {
    this.protocol.destroy();
    this.antiDetection.destroy();
    this.networkInterceptor.destroy();
    this.proxyChain.destroy();
    this.initialized = false;
  }
}

export default Ghost;
