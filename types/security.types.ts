/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ QANTUM SECURITY TYPES - Core Type Definitions
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Metaphysical Foundation: Types define the ESSENCE of security - the boundary between
 * the observable (public interfaces) and the hidden (internal state). Like Plato's Forms,
 * these types represent the ideal structure that implementations must embody.
 * 
 * @author Dimitar Prodromov
 * @version 17.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔐 ENCRYPTION & VAULT TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type EncryptionAlgorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
export type KeyDerivationFunction = 'PBKDF2' | 'Argon2id' | 'scrypt';

export interface VaultConfig {
  algorithm: EncryptionAlgorithm;
  keyDerivation: KeyDerivationFunction;
  iterations: number;
  saltSize: number;
  memoryWipe?: boolean;
  autoRotation?: AutoRotationConfig;
}

export interface AutoRotationConfig {
  interval: string;
  backupCount: number;
  notifyOnRotation: boolean;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  algorithm: EncryptionAlgorithm;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 👻 GHOST PROTOCOL TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type StealthLevel = 'minimal' | 'standard' | 'paranoid' | 'ghost';

export interface FingerprintConfig {
  userAgent: boolean;
  canvas: boolean;
  webGL: boolean;
  fonts: boolean;
  plugins: boolean;
  timezone: boolean;
  language: boolean;
  screen: boolean;
  hardwareConcurrency?: boolean;
  deviceMemory?: boolean;
  audioContext?: boolean;
}

export interface NetworkObfuscationConfig {
  timing: boolean;
  headers: boolean;
  payloadSize: boolean;
  compression: boolean;
  tlsFingerprint?: boolean;
}

export interface ProxyConfig {
  hops: number;
  rotation: 'manual' | 'auto' | 'adaptive';
  rotationInterval?: number;
  countries?: string[];
  protocols: ('HTTP' | 'HTTPS' | 'SOCKS4' | 'SOCKS5')[];
  failoverEnabled?: boolean;
}

export interface ProxyNode {
  id: string;
  host: string;
  port: number;
  protocol: 'HTTP' | 'HTTPS' | 'SOCKS4' | 'SOCKS5';
  country?: string;
  latency?: number;
  lastUsed?: number;
  failures: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🛡️ SECURITY & SANITIZATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type SanitizationType = 'xss' | 'sql' | 'path' | 'command' | 'ldap' | 'xml';

export interface SanitizationResult {
  original: string;
  sanitized: string;
  type: SanitizationType;
  threatLevel: ThreatLevel;
  modifications: string[];
}

export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface CSRFToken {
  token: string;
  timestamp: number;
  expiresAt: number;
  fingerprint: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
  blocked: boolean;
  blockedUntil?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🚨 THREAT DETECTION & RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type ThreatType = 
  | 'injection'
  | 'xss'
  | 'csrf'
  | 'path_traversal'
  | 'brute_force'
  | 'dos'
  | 'memory_tampering'
  | 'debugger_attachment'
  | 'unusual_network'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'unknown';

export interface ThreatEvent {
  id: string;
  type: ThreatType;
  severity: ThreatLevel;
  timestamp: number;
  source: string;
  target?: string;
  payload?: unknown;
  mitigated: boolean;
  mitigationAction?: string;
}

export interface ShutdownConfig {
  mode: 'graceful' | 'immediate' | 'force';
  wipeMemory: boolean;
  notifyAdmin: boolean;
  saveState?: boolean;
  timeout?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 MONITORING & ANOMALY DETECTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface MonitoringConfig {
  cpuUsage: boolean;
  memoryLeaks: boolean;
  networkSpikes: boolean;
  apiRateLimits: boolean;
  fileSystemChanges?: boolean;
  processSpawning?: boolean;
}

export interface AnomalyEvent {
  id: string;
  type: string;
  severity: ThreatLevel;
  timestamp: number;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  context?: Record<string, unknown>;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  openFiles: number;
  uptime: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION & LOADING TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface SecureLoadConfig {
  validateChecksum: boolean;
  encryptionRequired: boolean;
  allowRemote: boolean;
  maxSize?: number;
  allowedSources?: string[];
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  checksum?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔄 AUTONOMOUS FEEDBACK LOOP TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface AutoScanConfig {
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  scope: 'full' | 'critical' | 'changed';
  autoFix: boolean;
  excludePatterns?: string[];
}

export interface DependencyAuditConfig {
  checkNPM: boolean;
  checkCVE: boolean;
  autoUpdate: 'none' | 'patch' | 'minor' | 'all';
  ignoredPackages?: string[];
}

export interface VulnerabilityReport {
  id: string;
  package: string;
  version: string;
  severity: ThreatLevel;
  cve?: string;
  description: string;
  fixAvailable: boolean;
  fixVersion?: string;
  autoFixed?: boolean;
}

export interface BreachAttempt {
  id: string;
  timestamp: number;
  ip: string;
  vulnerability: string;
  payload: string;
  blocked: boolean;
  patched: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 IDENTITY & VERIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface Identity {
  id: string;
  type: 'user' | 'service' | 'system';
  permissions: string[];
  sessionId?: string;
  fingerprint?: string;
  lastVerified?: number;
}

export type Action = 'READ' | 'WRITE' | 'DELETE' | 'EXECUTE' | 'ADMIN';

export interface VerificationRequest {
  identity: Identity;
  action: Action;
  resource: string;
  context?: Record<string, unknown>;
}

export interface VerificationResult {
  allowed: boolean;
  reason: string;
  verifiedAt: number;
  expiresAt?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📝 AUDIT & LOGGING TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface AuditLog {
  id: string;
  timestamp: number;
  eventType: string;
  actor: string;
  action: string;
  resource?: string;
  outcome: 'success' | 'failure' | 'blocked';
  details?: Record<string, unknown>;
  checksum: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: string;
  severity: ThreatLevel;
  message: string;
  source: string;
  metadata?: Record<string, unknown>;
}
