/**
 * VORTEX SYNTHESIS ENGINE - TYPE DEFINITIONS
 * Version: 1.0.0-SINGULARITY
 * 
 * Mathematical Model: Entropy-Stability Equilibrium
 * S(t) = S₀ * e^(-λt) + ∫₀ᵗ R(τ) * e^(-λ(t-τ)) dτ
 * Where:
 *   S(t) = System stability at time t
 *   S₀ = Initial stability coefficient
 *   λ = Entropy decay constant (configurable)
 *   R(τ) = Regeneration function (self-healing rate)
 * 
 * Entropy Model: E(t) = E_base + Σᵢ(load_i * complexity_i) / throughput
 * Target: E(t) < E_threshold for Zero Entropy condition
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/** Entropy measurement unit */
export type EntropyValue = number;

/** Stability coefficient (0.0 - 1.0) */
export type StabilityCoefficient = number;

/** Unique identifier for spawned assets */
export type AssetId = string;

/** Timestamp in milliseconds */
export type Timestamp = number;

// ============================================================================
// MATHEMATICAL MODEL INTERFACES
// ============================================================================

/**
 * Entropy-Stability Equilibrium Parameters
 * Governs the mutation loop dynamics
 */
export interface EntropyStabilityModel {
    /** Initial stability coefficient (S₀) */
    initialStability: StabilityCoefficient;
    
    /** Entropy decay constant (λ) - rate of entropy dissipation */
    entropyDecayConstant: number;
    
    /** Regeneration rate - self-healing capacity per cycle */
    regenerationRate: number;
    
    /** Threshold below which system achieves "Zero Entropy" */
    entropyThreshold: EntropyValue;
    
    /** Maximum entropy before emergency shutdown */
    criticalEntropyThreshold: EntropyValue;
    
    /** Mutation cycle interval in milliseconds */
    mutationCycleMs: number;
}

/**
 * Real-time system metrics
 */
export interface SystemMetrics {
    /** Current entropy level */
    entropy: EntropyValue;
    
    /** Current stability coefficient */
    stability: StabilityCoefficient;
    
    /** Active asset count */
    activeAssets: number;
    
    /** Operations per second */
    throughput: number;
    
    /** Memory utilization (0.0 - 1.0) */
    memoryUtilization: number;
    
    /** CPU utilization (0.0 - 1.0) */
    cpuUtilization: number;
    
    /** Last measurement timestamp */
    timestamp: Timestamp;
}

// ============================================================================
// SHARED MEMORY INTERFACES
// ============================================================================

/**
 * Shared Memory V2 Configuration
 * Supports Stale Lock Watchdog with <25ms recovery
 */
export interface SharedMemoryConfig {
    /** Maximum lock hold time before watchdog intervention */
    staleLockTimeoutMs: number;
    
    /** Watchdog check interval */
    watchdogIntervalMs: number;
    
    /** Number of retry attempts for lock acquisition */
    lockRetryAttempts: number;
    
    /** Delay between retry attempts */
    retryDelayMs: number;
}

/**
 * Memory segment for cross-component synchronization
 */
export interface MemorySegment<T = unknown> {
    /** Segment identifier */
    id: string;
    
    /** Stored data */
    data: T;
    
    /** Lock holder (null if unlocked) */
    lockHolder: string | null;
    
    /** Lock acquisition timestamp */
    lockTimestamp: Timestamp | null;
    
    /** Version for optimistic concurrency */
    version: number;
}

// ============================================================================
// ASSET SPAWNING INTERFACES
// ============================================================================

/**
 * Market void/gap detected by Neural Core Magnet
 */
export interface MarketVoid {
    /** Unique identifier */
    id: string;
    
    /** Market segment */
    segment: string;
    
    /** Detected demand score (0.0 - 1.0) */
    demandScore: number;
    
    /** Competition level (0.0 - 1.0, lower is better) */
    competitionLevel: number;
    
    /** Estimated revenue potential (EUR/month) */
    revenuePotential: number;
    
    /** Required features */
    features: string[];
    
    /** Detection timestamp */
    detectedAt: Timestamp;
}

/**
 * Micro-SaaS asset configuration
 */
export interface MicroSaaSConfig {
    /** Asset unique identifier */
    id: AssetId;
    
    /** Display name */
    name: string;
    
    /** Description */
    description: string;
    
    /** Target market void */
    targetVoid: MarketVoid;
    
    /** Database schema name */
    dbSchema: string;
    
    /** API route prefix */
    apiPrefix: string;
    
    /** Monthly subscription price (EUR) */
    priceEur: number;
    
    /** Creation timestamp */
    createdAt: Timestamp;
}

/**
 * Spawned asset lifecycle state
 */
export enum AssetLifecycleState {
    /** Being created */
    SPAWNING = 'SPAWNING',
    
    /** Deploying to infrastructure */
    DEPLOYING = 'DEPLOYING',
    
    /** Active and serving traffic */
    ACTIVE = 'ACTIVE',
    
    /** Temporarily suspended */
    SUSPENDED = 'SUSPENDED',
    
    /** Being terminated */
    TERMINATING = 'TERMINATING',
    
    /** Terminated and cleaned up */
    TERMINATED = 'TERMINATED',
    
    /** Error state requiring intervention */
    ERROR = 'ERROR'
}

/**
 * Spawned asset instance
 */
export interface SpawnedAsset {
    /** Configuration */
    config: MicroSaaSConfig;
    
    /** Current lifecycle state */
    state: AssetLifecycleState;
    
    /** Neon DB branch name */
    neonBranch: string;
    
    /** Deployment URL */
    deploymentUrl: string | null;
    
    /** Revenue accumulated (EUR) */
    revenueAccumulated: number;
    
    /** Active subscribers */
    subscriberCount: number;
    
    /** Health score (0.0 - 1.0) */
    healthScore: number;
    
    /** Last health check timestamp */
    lastHealthCheck: Timestamp;
    
    /** Error message if in ERROR state */
    errorMessage: string | null;
}

// ============================================================================
// REFACTOR ENGINE INTERFACES
// ============================================================================

/**
 * Swarm efficiency metrics for self-analysis
 */
export interface SwarmEfficiencyMetrics {
    /** Average operation latency (ms) */
    avgLatencyMs: number;
    
    /** 95th percentile latency (ms) */
    p95LatencyMs: number;
    
    /** 99th percentile latency (ms) */
    p99LatencyMs: number;
    
    /** Operations per second */
    operationsPerSecond: number;
    
    /** Error rate (0.0 - 1.0) */
    errorRate: number;
    
    /** Memory efficiency score (0.0 - 1.0) */
    memoryEfficiency: number;
    
    /** Cache hit ratio (0.0 - 1.0) */
    cacheHitRatio: number;
}

/**
 * Code bottleneck identified for optimization
 */
export interface CodeBottleneck {
    /** File path */
    filePath: string;
    
    /** Function/method name */
    functionName: string;
    
    /** Line number */
    lineNumber: number;
    
    /** Bottleneck type */
    type: 'cpu' | 'memory' | 'io' | 'latency';
    
    /** Severity (0.0 - 1.0) */
    severity: number;
    
    /** Suggested optimization */
    suggestion: string;
    
    /** Can be optimized via FFI to Rust */
    ffiCandidate: boolean;
}

/**
 * FFI bridge configuration for Rust optimization
 */
export interface FFIBridgeConfig {
    /** Rust library path */
    libraryPath: string;
    
    /** Function signatures */
    functions: Array<{
        name: string;
        returnType: string;
        parameters: Array<{ name: string; type: string }>;
    }>;
    
    /** AVX-512 alignment required */
    avx512Aligned: boolean;
    
    /** SIMD optimization level */
    simdLevel: 'none' | 'sse4' | 'avx2' | 'avx512';
}

// ============================================================================
// GHOST SHIELD INTERFACES
// ============================================================================

/**
 * Fingerprint signature for adaptive polymorphism
 */
export interface FingerprintSignature {
    /** Unique signature ID */
    id: string;
    
    /** TLS fingerprint components */
    tlsFingerprint: {
        cipherSuites: string[];
        extensions: string[];
        ellipticCurves: string[];
        ecPointFormats: string[];
    };
    
    /** HTTP/2 fingerprint */
    http2Fingerprint: {
        settings: Record<string, number>;
        windowUpdate: number;
        priorities: number[];
    };
    
    /** Generation timestamp */
    generatedAt: Timestamp;
    
    /** Expiration timestamp (50ms lifecycle) */
    expiresAt: Timestamp;
}

/**
 * Ghost Shield configuration
 */
export interface GhostShieldConfig {
    /** Fingerprint rotation interval (ms) */
    rotationIntervalMs: number;
    
    /** Enable hardware-level TLS modification */
    hardwareLevelModification: boolean;
    
    /** Shared memory segment for sync */
    sharedMemorySegmentId: string;
    
    /** Fingerprint pool size */
    fingerprintPoolSize: number;
}

// ============================================================================
// ORCHESTRATOR INTERFACES
// ============================================================================

/**
 * Orchestrator event types
 */
export enum OrchestratorEventType {
    ASSET_SPAWNED = 'ASSET_SPAWNED',
    ASSET_DEPLOYED = 'ASSET_DEPLOYED',
    ASSET_TERMINATED = 'ASSET_TERMINATED',
    ENTROPY_WARNING = 'ENTROPY_WARNING',
    ENTROPY_CRITICAL = 'ENTROPY_CRITICAL',
    STABILITY_RESTORED = 'STABILITY_RESTORED',
    BOTTLENECK_DETECTED = 'BOTTLENECK_DETECTED',
    OPTIMIZATION_COMPLETE = 'OPTIMIZATION_COMPLETE',
    REVENUE_CAPTURED = 'REVENUE_CAPTURED',
    HEALTH_CHECK_FAILED = 'HEALTH_CHECK_FAILED'
}

/**
 * Orchestrator event
 */
export interface OrchestratorEvent {
    type: OrchestratorEventType;
    timestamp: Timestamp;
    payload: unknown;
    assetId?: AssetId;
}

/**
 * Event handler function type
 */
export type EventHandler = (event: OrchestratorEvent) => void | Promise<void>;

/**
 * Vortex Orchestrator configuration
 */
export interface VortexOrchestratorConfig {
    /** Entropy-Stability model parameters */
    entropyStabilityModel: EntropyStabilityModel;
    
    /** Shared memory configuration */
    sharedMemoryConfig: SharedMemoryConfig;
    
    /** Ghost Shield configuration */
    ghostShieldConfig: GhostShieldConfig;
    
    /** Maximum concurrent assets */
    maxConcurrentAssets: number;
    
    /** Health check interval (ms) */
    healthCheckIntervalMs: number;
    
    /** Enable auto-scaling */
    autoScalingEnabled: boolean;
    
    /** Wealth Bridge ledger endpoint */
    wealthBridgeLedgerEndpoint: string;
}

// ============================================================================
// WEALTH BRIDGE LEDGER INTERFACES
// ============================================================================

/**
 * Ledger transaction record
 */
export interface LedgerTransaction {
    /** Transaction ID */
    id: string;
    
    /** Source asset ID */
    assetId: AssetId;
    
    /** Amount in EUR */
    amountEur: number;
    
    /** Transaction type */
    type: 'subscription' | 'one_time' | 'refund';
    
    /** Payment provider */
    provider: 'stripe' | 'paypal';
    
    /** Provider transaction ID */
    providerTransactionId: string;
    
    /** Timestamp */
    timestamp: Timestamp;
}

/**
 * Asset revenue summary
 */
export interface AssetRevenueSummary {
    /** Asset ID */
    assetId: AssetId;
    
    /** Total revenue (EUR) */
    totalRevenue: number;
    
    /** Monthly recurring revenue (EUR) */
    mrr: number;
    
    /** Active subscribers */
    activeSubscribers: number;
    
    /** Churn rate (0.0 - 1.0) */
    churnRate: number;
    
    /** Last 30 days revenue */
    last30DaysRevenue: number;
}

// ============================================================================
// HARDWARE TELEMETRY INTERFACES
// ============================================================================

/**
 * CPU Telemetry Data
 * Real-time CPU metrics from sysinfo Rust bridge
 */
export interface CPUTelemetry {
    /** CPU model name */
    model: string;
    
    /** Physical core count */
    cores: number;
    
    /** Thread count */
    threads: number;
    
    /** Base clock speed (MHz) */
    baseClockMhz: number;
    
    /** Boost clock speed (MHz) */
    boostClockMhz: number;
    
    /** Current clock speed (MHz) */
    currentClockMhz: number;
    
    /** Utilization percentage (0-100) */
    utilizationPercent: number;
    
    /** Temperature in Celsius */
    temperatureCelsius: number;
}

/**
 * Memory Telemetry Data
 */
export interface MemoryTelemetry {
    /** Total physical memory (bytes) */
    totalBytes: number;
    
    /** Used memory (bytes) */
    usedBytes: number;
    
    /** Available memory (bytes) */
    availableBytes: number;
    
    /** Utilization percentage (0-100) */
    utilizationPercent: number;
}

/**
 * GPU Telemetry Data
 */
export interface GPUTelemetry {
    /** GPU model name */
    model: string;
    
    /** Total VRAM (bytes) */
    vramTotalBytes: number;
    
    /** Used VRAM (bytes) */
    vramUsedBytes: number;
    
    /** Utilization percentage (0-100) */
    utilizationPercent: number;
    
    /** Temperature in Celsius */
    temperatureCelsius: number;
}

/**
 * System Information
 */
export interface SystemInfo {
    /** Operating system name */
    osName: string;
    
    /** OS version */
    osVersion: string;
    
    /** Hostname */
    hostname: string;
    
    /** Uptime in seconds */
    uptimeSeconds: number;
    
    /** Running process count */
    processCount: number;
}

/**
 * Complete Hardware Telemetry Package
 * Streamed via SharedMemoryV2 with <25ms latency
 */
export interface HardwareTelemetry {
    /** CPU metrics */
    cpu: CPUTelemetry;
    
    /** Memory metrics */
    memory: MemoryTelemetry;
    
    /** GPU metrics */
    gpu: GPUTelemetry;
    
    /** System information */
    system: SystemInfo;
    
    /** Telemetry timestamp */
    timestamp: Timestamp;
}

// ============================================================================
// BROWSER POOL INTERFACES
// ============================================================================

/**
 * Browser instance with GhostShield protection
 */
export interface GhostBrowserInstance {
    /** Unique instance ID */
    id: string;
    
    /** Browser type */
    browserType: 'chromium' | 'firefox' | 'webkit';
    
    /** Current fingerprint signature ID */
    currentFingerprintId: string;
    
    /** Last TLS rotation timestamp */
    lastTlsRotation: Timestamp;
    
    /** Request count since creation */
    requestCount: number;
    
    /** Is currently active */
    isActive: boolean;
    
    /** Creation timestamp */
    createdAt: Timestamp;
}

/**
 * Browser Pool Configuration
 */
export interface BrowserPoolConfig {
    /** Maximum concurrent browsers */
    maxBrowsers: number;
    
    /** TLS rotation interval (ms) - default 50ms */
    tlsRotationIntervalMs: number;
    
    /** Browser idle timeout (ms) */
    idleTimeoutMs: number;
    
    /** Enable GhostShield protection */
    ghostShieldEnabled: boolean;
}

// ============================================================================
// CYBER CODY AI AUDITOR INTERFACES
// ============================================================================

/**
 * Trading signal to be audited
 */
export interface TradingSignal {
    /** Signal ID */
    id: string;
    
    /** Signal type - HIGH_CONFIDENCE for algorithmic high-probability signals */
    type: 'HIGH_CONFIDENCE' | 'STANDARD' | 'SCALP';
    
    /** Trading pair */
    pair: string;
    
    /** Direction */
    direction: 'LONG' | 'SHORT';
    
    /** Entry price */
    entryPrice: number;
    
    /** Take profit price */
    takeProfitPrice: number;
    
    /** Stop loss price */
    stopLossPrice: number;
    
    /** Position size (fraction of capital) */
    positionSize: number;
    
    /** Leverage */
    leverage: number;
    
    /** Signal generation timestamp */
    generatedAt: Timestamp;
}

/**
 * Audit result from CyberCody
 */
export interface AuditResult {
    /** Signal ID that was audited */
    signalId: string;
    
    /** Audit passed */
    passed: boolean;
    
    /** Confidence score (0.0 - 1.0) */
    confidence: number;
    
    /** Risk score (0.0 - 1.0, lower is better) */
    riskScore: number;
    
    /** Detected issues */
    issues: AuditIssue[];
    
    /** Recommendations */
    recommendations: string[];
    
    /** Should trigger self-healing */
    triggerSelfHealing: boolean;
    
    /** Audit timestamp */
    auditedAt: Timestamp;
}

/**
 * Audit issue detected by CyberCody
 */
export interface AuditIssue {
    /** Issue type */
    type: 'LOGIC_HOLE' | 'RISK_EXCESSIVE' | 'MARKET_CONDITION' | 'PARAMETER_INVALID';
    
    /** Severity (0.0 - 1.0) */
    severity: number;
    
    /** Issue description */
    description: string;
    
    /** Suggested fix */
    suggestedFix: string;
}
