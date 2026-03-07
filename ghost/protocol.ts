/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 👻 GHOST PROTOCOL - Core Stealth Engine
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Metaphysical Principle: The Ghost Protocol embodies the concept of "being without being 
 * observed" - the quantum superposition of existence. Like Schrödinger's cat, the system 
 * exists in a state where its presence remains undetermined until observed, at which point 
 * it has already shifted to a new state.
 * 
 * This is the art of digital invisibility - not merely hiding, but transcending the very
 * concept of detectability. We don't just avoid detection; we redefine what can be detected.
 * 
 * @author Dimitar Prodromov
 * @version 17.0.0
 */

import { EventEmitter } from 'events';
import type {
  StealthLevel,
  FingerprintConfig,
  NetworkObfuscationConfig,
  ThreatEvent,
} from '../../types/security.types';

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 STEALTH STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GhostState {
  active: boolean;
  level: StealthLevel;
  entropyPool: number[];
  lastMutation: number;
  detectionAttempts: number;
  evasionSuccess: number;
  sessionId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 👻 MAIN GHOST PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

export class GhostProtocol extends EventEmitter {
  private state: GhostState;
  private mutationInterval: ReturnType<typeof setInterval> | null = null;
  private readonly ENTROPY_POOL_SIZE = 256;

  constructor() {
    super();
    this.state = this.initializeState();
    this.seedEntropyPool();
  }

  /**
   * Initialize the ghost state with quantum-inspired randomness
   * 
   * Metaphysical Note: The initial state represents the "potential" of the system -
   * all possible states collapsed into one moment of initialization.
   */
  private initializeState(): GhostState {
    return {
      active: false,
      level: 'standard',
      entropyPool: [],
      lastMutation: Date.now(),
      detectionAttempts: 0,
      evasionSuccess: 0,
      sessionId: this.generateSessionId(),
    };
  }

  /**
   * Generate cryptographically secure session ID
   * Uses multiple entropy sources for maximum unpredictability
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const hrTime = process.hrtime();
    const processEntropy = (hrTime[0] * 1e9 + hrTime[1]).toString(36);

    // Combine multiple entropy sources
    const combined = `${timestamp}-${random}-${processEntropy}`;
    return this.hashString(combined).substring(0, 32);
  }

  /**
   * Simple but effective string hashing (FNV-1a variant)
   * Used for internal state management, not cryptographic security
   */
  private hashString(str: string): string {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, '0') +
      Date.now().toString(16) +
      Math.random().toString(16).substring(2);
  }

  /**
   * Seed the entropy pool with high-quality randomness
   * 
   * Metaphysical Foundation: Entropy is the measure of disorder - the fuel of unpredictability.
   * A rich entropy pool enables true randomness, making pattern detection impossible.
   */
  private seedEntropyPool(): void {
    this.state.entropyPool = [];

    for (let i = 0; i < this.ENTROPY_POOL_SIZE; i++) {
      // Combine multiple sources of entropy
      const hrTime = process.hrtime();
      const timeEntropy = Date.now() ^ (hrTime[0] * 1e9 + hrTime[1]);
      const mathEntropy = Math.random() * Number.MAX_SAFE_INTEGER;
      const combined = (timeEntropy ^ Math.floor(mathEntropy)) >>> 0;
      this.state.entropyPool.push(combined % 256);
    }

    // Stir the pool using Fisher-Yates shuffle
    this.stirEntropyPool();
  }

  /**
   * Stir the entropy pool to increase randomness
   * Fisher-Yates shuffle provides uniform distribution
   */
  private stirEntropyPool(): void {
    const pool = this.state.entropyPool;
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  /**
   * Extract entropy from the pool
   * Automatically reseeds when depleted
   */
  private extractEntropy(bytes: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < bytes; i++) {
      if (this.state.entropyPool.length === 0) {
        this.seedEntropyPool();
      }
      result.push(this.state.entropyPool.pop()!);
    }

    return result;
  }

  /**
   * Enable Ghost Protocol with specified stealth level
   * 
   * @param level - The stealth level ('minimal' | 'standard' | 'paranoid' | 'ghost')
   * 
   * 'minimal' - Basic fingerprint variation
   * 'standard' - Full fingerprint randomization + timing variance
   * 'paranoid' - All protections + aggressive mutation
   * 'ghost' - Maximum stealth, quantum state fluctuation
   */
  public enable(level: StealthLevel = 'standard'): void {
    this.state.active = true;
    this.state.level = level;
    this.state.sessionId = this.generateSessionId();

    // Start continuous mutation based on level
    const mutationRate = this.getMutationRate(level);
    this.startMutation(mutationRate);

    this.emit('enabled', { level, sessionId: this.state.sessionId });
  }

  /**
   * Disable Ghost Protocol
   * Cleans up all mutation intervals and resets state
   */
  public disable(): void {
    this.state.active = false;
    this.stopMutation();
    this.emit('disabled', { sessionId: this.state.sessionId });
  }

  /**
   * Get mutation rate based on stealth level
   */
  private getMutationRate(level: StealthLevel): number {
    const rates: Record<StealthLevel, number> = {
      minimal: 30000,    // Every 30 seconds
      standard: 10000,   // Every 10 seconds
      paranoid: 3000,    // Every 3 seconds
      ghost: 1000,       // Every second
    };
    return rates[level];
  }

  /**
   * Start continuous state mutation
   * 
   * Metaphysical Principle: Constant change prevents pattern formation.
   * Like a river that is never the same twice, the ghost state flows
   * through configurations, making detection attempts futile.
   */
  private startMutation(intervalMs: number): void {
    this.stopMutation(); // Clean up any existing interval

    this.mutationInterval = setInterval(() => {
      this.mutateState();
    }, intervalMs);
  }

  /**
   * Stop mutation interval
   */
  private stopMutation(): void {
    if (this.mutationInterval) {
      clearInterval(this.mutationInterval);
      this.mutationInterval = null;
    }
  }

  /**
   * Mutate internal state to prevent pattern detection
   * 
   * The mutation includes:
   * - Entropy pool refresh
   * - Session ID regeneration (in ghost mode)
   * - Timing variance injection
   */
  private mutateState(): void {
    this.stirEntropyPool();
    this.state.lastMutation = Date.now();

    // In ghost mode, regenerate session ID on each mutation
    if (this.state.level === 'ghost') {
      this.state.sessionId = this.generateSessionId();
    }

    this.emit('mutation', {
      timestamp: this.state.lastMutation,
      level: this.state.level,
    });
  }

  /**
   * Generate randomized fingerprint configuration
   * Each call produces a unique, valid fingerprint
   */
  public generateFingerprint(config: FingerprintConfig): Record<string, unknown> {
    const fingerprint: Record<string, unknown> = {};
    const entropy = this.extractEntropy(32);

    if (config.userAgent) {
      fingerprint.userAgent = this.generateUserAgent(entropy.slice(0, 4));
    }

    if (config.canvas) {
      fingerprint.canvasNoise = this.generateCanvasNoise(entropy.slice(4, 8));
    }

    if (config.webGL) {
      fingerprint.webGLVendor = this.generateWebGLInfo(entropy.slice(8, 12));
    }

    if (config.fonts) {
      fingerprint.fonts = this.generateFontList(entropy.slice(12, 16));
    }

    if (config.plugins) {
      fingerprint.plugins = this.generatePluginList(entropy.slice(16, 20));
    }

    if (config.timezone) {
      fingerprint.timezone = this.generateTimezone(entropy.slice(20, 24));
    }

    if (config.language) {
      fingerprint.language = this.generateLanguage(entropy.slice(24, 28));
    }

    if (config.screen) {
      fingerprint.screen = this.generateScreenResolution(entropy.slice(28, 32));
    }

    if (config.hardwareConcurrency) {
      fingerprint.hardwareConcurrency = this.generateHardwareConcurrency(entropy[0]);
    }

    if (config.deviceMemory) {
      fingerprint.deviceMemory = this.generateDeviceMemory(entropy[1]);
    }

    return fingerprint;
  }

  /**
   * Generate realistic user agent string
   */
  private generateUserAgent(entropy: number[]): string {
    const browsers = [
      { name: 'Chrome', versions: ['120', '121', '122', '123', '124', '125'] },
      { name: 'Firefox', versions: ['120', '121', '122', '123', '124'] },
      { name: 'Safari', versions: ['17.0', '17.1', '17.2', '17.3', '17.4'] },
      { name: 'Edge', versions: ['120', '121', '122', '123', '124', '125'] },
    ];

    const platforms = [
      'Windows NT 10.0; Win64; x64',
      'Macintosh; Intel Mac OS X 10_15_7',
      'X11; Linux x86_64',
      'Windows NT 11.0; Win64; x64',
    ];

    const browserIdx = entropy[0] % browsers.length;
    const versionIdx = entropy[1] % browsers[browserIdx].versions.length;
    const platformIdx = entropy[2] % platforms.length;

    const browser = browsers[browserIdx];
    const version = browser.versions[versionIdx];
    const platform = platforms[platformIdx];

    if (browser.name === 'Chrome' || browser.name === 'Edge') {
      return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser.name}/${version}.0.0.0 Safari/537.36`;
    } else if (browser.name === 'Firefox') {
      return `Mozilla/5.0 (${platform}; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`;
    } else {
      return `Mozilla/5.0 (${platform}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version} Safari/605.1.15`;
    }
  }

  /**
   * Generate canvas noise parameters for fingerprint poisoning
   */
  private generateCanvasNoise(entropy: number[]): Record<string, number> {
    return {
      noiseLevel: (entropy[0] / 255) * 0.01, // 0-1% noise
      colorShift: entropy[1] - 128, // -128 to 127
      pixelOffset: entropy[2] % 3, // 0-2 pixels
      seed: (entropy[3] << 8) | entropy[0],
    };
  }

  /**
   * Generate WebGL vendor/renderer information
   */
  private generateWebGLInfo(entropy: number[]): Record<string, string> {
    const vendors = ['Google Inc.', 'Intel Inc.', 'NVIDIA Corporation', 'AMD'];
    const renderers = [
      'ANGLE (Intel(R) UHD Graphics 620 Direct3D11)',
      'ANGLE (NVIDIA GeForce GTX 1080 Direct3D11)',
      'ANGLE (AMD Radeon RX 580 Direct3D11)',
      'Mesa Intel(R) UHD Graphics 620',
    ];

    return {
      vendor: vendors[entropy[0] % vendors.length],
      renderer: renderers[entropy[1] % renderers.length],
      unmaskedVendor: `WebGL ${vendors[entropy[2] % vendors.length]}`,
      unmaskedRenderer: renderers[entropy[3] % renderers.length],
    };
  }

  /**
   * Generate realistic font list
   */
  private generateFontList(entropy: number[]): string[] {
    const commonFonts = [
      'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Georgia',
      'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
      'Arial Black', 'Impact', 'Lucida Console', 'Tahoma', 'Lucida Sans',
      'Courier New', 'Monaco', 'Segoe UI', 'Roboto', 'Open Sans',
    ];

    const count = 10 + (entropy[0] % 10); // 10-19 fonts
    const selected = new Set<string>();

    for (let i = 0; i < count && selected.size < commonFonts.length; i++) {
      const idx = (entropy[i % entropy.length] + i) % commonFonts.length;
      selected.add(commonFonts[idx]);
    }

    return Array.from(selected);
  }

  /**
   * Generate plugin list
   */
  private generatePluginList(entropy: number[]): string[] {
    const plugins = [
      'Chrome PDF Plugin',
      'Chrome PDF Viewer',
      'Native Client',
      'Widevine Content Decryption Module',
    ];

    const count = 1 + (entropy[0] % plugins.length);
    return plugins.slice(0, count);
  }

  /**
   * Generate timezone offset
   */
  private generateTimezone(entropy: number[]): Record<string, unknown> {
    const timezones = [
      { name: 'America/New_York', offset: -5 },
      { name: 'America/Los_Angeles', offset: -8 },
      { name: 'Europe/London', offset: 0 },
      { name: 'Europe/Paris', offset: 1 },
      { name: 'Europe/Berlin', offset: 1 },
      { name: 'Asia/Tokyo', offset: 9 },
      { name: 'Asia/Shanghai', offset: 8 },
      { name: 'Australia/Sydney', offset: 11 },
    ];

    const tz = timezones[entropy[0] % timezones.length];
    return {
      name: tz.name,
      offset: tz.offset * 60, // In minutes
      dstObserved: entropy[1] > 128,
    };
  }

  /**
   * Generate language preference
   */
  private generateLanguage(entropy: number[]): string[] {
    const languages = [
      ['en-US', 'en'],
      ['en-GB', 'en'],
      ['de-DE', 'de', 'en'],
      ['fr-FR', 'fr', 'en'],
      ['es-ES', 'es', 'en'],
      ['zh-CN', 'zh', 'en'],
      ['ja-JP', 'ja', 'en'],
      ['ko-KR', 'ko', 'en'],
    ];

    return languages[entropy[0] % languages.length];
  }

  /**
   * Generate screen resolution
   */
  private generateScreenResolution(entropy: number[]): Record<string, number> {
    const resolutions = [
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 },
      { width: 3840, height: 2160 },
      { width: 1280, height: 720 },
    ];

    const res = resolutions[entropy[0] % resolutions.length];
    const colorDepths = [24, 32];

    return {
      width: res.width,
      height: res.height,
      availWidth: res.width,
      availHeight: res.height - (entropy[1] % 60), // Taskbar variance
      colorDepth: colorDepths[entropy[2] % colorDepths.length],
      pixelRatio: [1, 1.25, 1.5, 2][entropy[3] % 4],
    };
  }

  /**
   * Generate hardware concurrency (CPU cores)
   */
  private generateHardwareConcurrency(entropy: number): number {
    const cores = [4, 6, 8, 12, 16];
    return cores[entropy % cores.length];
  }

  /**
   * Generate device memory
   */
  private generateDeviceMemory(entropy: number): number {
    const memory = [4, 8, 16, 32];
    return memory[entropy % memory.length];
  }

  /**
   * Apply network obfuscation to outgoing request
   */
  public obfuscateRequest(
    request: Record<string, unknown>,
    config: NetworkObfuscationConfig
  ): Record<string, unknown> {
    const obfuscated = { ...request };
    const entropy = this.extractEntropy(16);

    if (config.timing) {
      // Add random delay metadata
      obfuscated._timingVariance = entropy[0] + entropy[1];
    }

    if (config.headers) {
      obfuscated.headers = this.obfuscateHeaders(
        (request.headers as Record<string, string>) || {},
        entropy.slice(2, 6)
      );
    }

    if (config.payloadSize) {
      // Add padding to normalize payload size
      const paddingSize = (entropy[6] % 100) + 50;
      obfuscated._padding = 'x'.repeat(paddingSize);
    }

    return obfuscated;
  }

  /**
   * Obfuscate HTTP headers
   */
  private obfuscateHeaders(
    headers: Record<string, string>,
    entropy: number[]
  ): Record<string, string> {
    const result = { ...headers };

    // Randomize header order by recreating object
    const entries = Object.entries(result);
    for (let i = entries.length - 1; i > 0; i--) {
      const j = entropy[i % entropy.length] % (i + 1);
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    // Add common headers with variance
    const acceptLanguages = ['en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en;q=0.8'];
    result['Accept-Language'] = acceptLanguages[entropy[0] % acceptLanguages.length];

    return Object.fromEntries(entries);
  }

  /**
   * Record a detection attempt for analytics
   */
  public recordDetectionAttempt(detected: boolean): void {
    this.state.detectionAttempts++;
    if (!detected) {
      this.state.evasionSuccess++;
    }

    const event: ThreatEvent = {
      id: this.generateSessionId(),
      type: 'unknown',
      severity: detected ? 'medium' : 'none',
      timestamp: Date.now(),
      source: 'ghost_protocol',
      mitigated: !detected,
    };

    this.emit('detectionAttempt', event);
  }

  /**
   * Get current stealth statistics
   */
  public getStatistics(): Record<string, unknown> {
    const evasionRate = this.state.detectionAttempts > 0
      ? (this.state.evasionSuccess / this.state.detectionAttempts) * 100
      : 100;

    return {
      active: this.state.active,
      level: this.state.level,
      sessionId: this.state.sessionId,
      detectionAttempts: this.state.detectionAttempts,
      evasionSuccess: this.state.evasionSuccess,
      evasionRate: `${evasionRate.toFixed(2)}%`,
      lastMutation: this.state.lastMutation,
      entropyPoolSize: this.state.entropyPool.length,
    };
  }

  /**
   * Check if protocol is currently active
   */
  public isActive(): boolean {
    return this.state.active;
  }

  /**
   * Get current stealth level
   */
  public getLevel(): StealthLevel {
    return this.state.level;
  }

  /**
   * Force immediate mutation (useful when detection suspected)
   */
  public forceMutation(): void {
    this.seedEntropyPool();
    this.mutateState();
    this.state.sessionId = this.generateSessionId();
    this.emit('forcedMutation', { timestamp: Date.now() });
  }

  /**
   * Clean up resources on shutdown
   */
  public destroy(): void {
    this.disable();
    this.state.entropyPool = [];
    this.removeAllListeners();
  }
}

export default GhostProtocol;
