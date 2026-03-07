/**
 * index — Qantum Module
 * @module index
 * @path scripts/CyberCody/src/types/index.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.0.0 - Core Type Definitions                                    ║
// ║  "The Offensive Sovereign" - Strict TypeScript Types                         ║
// ║  Based on Mister Mind v23.3.0 Architecture                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 ETHICAL GUARDRAILS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Configuration for ethical boundaries
 */
export interface EthicalConfig {
  /** Allowed IP addresses/ranges for scanning */
  allowedTargets: string[];
  /** Allowed domains for scanning */
  allowedDomains: string[];
  /** Maximum requests per second (rate limiting) */
  maxRequestsPerSecond: number;
  /** Required authorization token for scanning */
  authorizationToken?: string;
  /** Whether to require explicit consent file */
  requireConsentFile: boolean;
  /** Path to consent file */
  consentFilePath?: string;
  /** Block scanning of critical infrastructure patterns */
  blockCriticalInfrastructure: boolean;
}

/**
 * Authorization result for scan target
 */
export interface AuthorizationResult {
  authorized: boolean;
  reason: string;
  target: string;
  timestamp: Date;
  guardrailsApplied: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 RECON MODULE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detected technology stack
 */
export interface TechStack {
  /** Frontend frameworks detected */
  frontendFrameworks: FrameworkInfo[];
  /** Backend technologies detected */
  backendTechnologies: TechnologyInfo[];
  /** Server information */
  serverInfo: ServerInfo;
  /** API endpoints discovered */
  apiEndpoints: APIEndpoint[];
  /** CMS/Platform detection */
  platforms: PlatformInfo[];
  /** Security headers analysis */
  securityHeaders: SecurityHeadersAnalysis;
  /** SSL/TLS information */
  sslInfo: SSLInfo;
}

export interface FrameworkInfo {
  name: string;
  version?: string;
  confidence: number; // 0-100
  evidence: string[];
}

export interface TechnologyInfo {
  name: string;
  category: 'language' | 'framework' | 'database' | 'cache' | 'cdn' | 'analytics' | 'other';
  version?: string;
  confidence: number;
  evidence: string[];
}

export interface ServerInfo {
  software?: string;
  version?: string;
  os?: string;
  headers: Record<string, string>;
  responseTime: number;
}

export interface APIEndpoint {
  url: string;
  method: HTTPMethod;
  parameters?: ParameterInfo[];
  authentication?: AuthenticationType;
  discovered: 'html' | 'js' | 'robots' | 'sitemap' | 'swagger' | 'graphql' | 'fuzzing';
}

export interface ParameterInfo {
  name: string;
  type: 'query' | 'path' | 'body' | 'header';
  dataType?: string;
  required?: boolean;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type AuthenticationType = 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth' | 'cookie' | 'unknown';

export interface PlatformInfo {
  name: string;
  type: 'cms' | 'ecommerce' | 'forum' | 'wiki' | 'framework';
  version?: string;
  confidence: number;
}

export interface SecurityHeadersAnalysis {
  score: number; // 0-100
  headers: {
    name: string;
    present: boolean;
    value?: string;
    recommendation?: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  }[];
}

export interface SSLInfo {
  valid: boolean;
  issuer?: string;
  expiresAt?: Date;
  protocol?: string;
  cipher?: string;
  grade?: string;
}

/**
 * Complete reconnaissance result
 */
export interface ReconResult {
  target: string;
  timestamp: Date;
  duration: number;
  techStack: TechStack;
  subdomains: string[];
  openPorts?: number[];
  robots?: RobotsInfo;
  sitemap?: SitemapInfo;
  screenshots?: ScreenshotInfo[];
}

export interface RobotsInfo {
  disallowed: string[];
  allowed: string[];
  sitemaps: string[];
  raw: string;
}

export interface SitemapInfo {
  urls: string[];
  lastModified?: Date;
}

export interface ScreenshotInfo {
  url: string;
  path: string;
  viewport: { width: number; height: number };
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 FUZZING ENGINE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fuzzing configuration
 */
export interface FuzzingConfig {
  /** Target URL or endpoint */
  target: string;
  /** HTTP method to use */
  method: HTTPMethod;
  /** Parameters to fuzz */
  parameters: FuzzParameter[];
  /** Number of fuzzing iterations */
  iterations: number;
  /** Number of worker threads */
  workerCount: number;
  /** Delay between requests (ms) */
  delayMs: number;
  /** Timeout per request (ms) */
  timeoutMs: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Payload categories to use */
  payloadCategories: PayloadCategory[];
  /** Custom payloads */
  customPayloads?: string[];
}

export interface FuzzParameter {
  name: string;
  type: 'query' | 'path' | 'body' | 'header' | 'cookie';
  originalValue?: string;
  fuzz: boolean;
}

export type PayloadCategory = 
  | 'xss'           // Cross-site scripting payloads
  | 'sqli'          // SQL injection payloads
  | 'nosqli'        // NoSQL injection payloads
  | 'cmdi'          // Command injection payloads
  | 'pathtraversal' // Path traversal payloads
  | 'ssti'          // Server-side template injection
  | 'xxe'           // XML external entity
  | 'ssrf'          // Server-side request forgery
  | 'idor'          // Insecure direct object reference
  | 'overflow'      // Buffer overflow / integer overflow
  | 'format'        // Format string attacks
  | 'unicode'       // Unicode encoding attacks
  | 'null'          // Null byte injection
  | 'boundary';     // Boundary condition testing

/**
 * Single fuzzing iteration result
 */
export interface FuzzIteration {
  id: number;
  payload: string;
  category: PayloadCategory;
  parameter: string;
  request: {
    url: string;
    method: HTTPMethod;
    headers: Record<string, string>;
    body?: string;
  };
  response: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    responseTime: number;
    size: number;
  };
  anomaly: AnomalyDetection;
  timestamp: Date;
}

export interface AnomalyDetection {
  detected: boolean;
  type: AnomalyType[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
}

export type AnomalyType =
  | 'status_change'      // Unexpected status code
  | 'error_disclosure'   // Error message reveals info
  | 'timing_anomaly'     // Significant response time difference
  | 'size_anomaly'       // Significant response size difference
  | 'reflection'         // Input reflected in response
  | 'header_anomaly'     // Unusual headers in response
  | 'behavior_change';   // Application behavior changed

/**
 * Complete fuzzing result
 */
export interface FuzzingResult {
  target: string;
  config: FuzzingConfig;
  startTime: Date;
  endTime: Date;
  totalIterations: number;
  completedIterations: number;
  anomaliesFound: FuzzIteration[];
  statistics: FuzzingStatistics;
}

export interface FuzzingStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  statusCodeDistribution: Record<number, number>;
  anomalyDistribution: Record<AnomalyType, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📸 VULNERABILITY SNAPSHOT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vulnerability severity levels
 */
export type VulnerabilitySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Vulnerability classification (OWASP Top 10 + CWE)
 */
export interface VulnerabilityClassification {
  owaspCategory?: string;
  cweId?: number;
  cvssScore?: number;
  cvssVector?: string;
}

/**
 * Neural snapshot of vulnerability state
 */
export interface VulnerabilitySnapshot {
  id: string;
  timestamp: Date;
  
  // Vulnerability info
  type: string;
  severity: VulnerabilitySeverity;
  classification: VulnerabilityClassification;
  
  // Target info
  target: string;
  endpoint: string;
  parameter?: string;
  
  // Evidence
  request: HTTPRequest;
  response: HTTPResponse;
  evidence: string[];
  screenshot?: string;
  
  // Proof of Concept
  poc: ProofOfConcept;
  
  // Recommendations
  remediation: RemediationInfo;
}

export interface HTTPRequest {
  url: string;
  method: HTTPMethod;
  headers: Record<string, string>;
  body?: string;
  timestamp: Date;
}

export interface HTTPResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  responseTime: number;
  timestamp: Date;
}

/**
 * Proof of Concept code
 */
export interface ProofOfConcept {
  /** Human-readable description */
  description: string;
  /** Steps to reproduce */
  steps: string[];
  /** Code samples in multiple languages */
  code: {
    curl: string;
    python?: string;
    javascript?: string;
    powershell?: string;
  };
  /** Expected vs actual behavior */
  impact: string;
  /** Risk assessment */
  riskLevel: VulnerabilitySeverity;
}

export interface RemediationInfo {
  description: string;
  steps: string[];
  references: string[];
  estimatedEffort: 'trivial' | 'minor' | 'moderate' | 'major' | 'critical';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧵 WORKER THREAD TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Worker thread message types
 */
export type WorkerMessageType = 
  | 'INIT'
  | 'TASK'
  | 'RESULT'
  | 'ERROR'
  | 'PROGRESS'
  | 'COMPLETE'
  | 'TERMINATE';

export interface WorkerMessage<T = unknown> {
  type: WorkerMessageType;
  taskId: string;
  payload: T;
  timestamp: Date;
  workerId?: number;
}

export interface WorkerTask {
  id: string;
  type: 'recon' | 'fuzz' | 'scan';
  target: string;
  config: unknown;
  priority: number;
}

export interface WorkerResult<T = unknown> {
  taskId: string;
  workerId: number;
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}

export interface WorkerPoolConfig {
  minWorkers: number;
  maxWorkers: number;
  idleTimeout: number;
  taskTimeout: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 SCAN RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Complete scan result
 */
export interface ScanResult {
  id: string;
  target: string;
  startTime: Date;
  endTime: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Authorization
  authorization: AuthorizationResult;
  
  // Results
  recon?: ReconResult;
  fuzzing?: FuzzingResult;
  vulnerabilities: VulnerabilitySnapshot[];
  
  // Summary
  summary: ScanSummary;
}

export interface ScanSummary {
  totalVulnerabilities: number;
  bySeverity: Record<VulnerabilitySeverity, number>;
  byType: Record<string, number>;
  riskScore: number; // 0-100
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CyberCody main configuration
 */
export interface CyberCodyConfig {
  /** Ethical guardrails configuration */
  ethical: EthicalConfig;
  /** Reconnaissance settings */
  recon: {
    timeout: number;
    screenshotViewports: { width: number; height: number }[];
    userAgent?: string;
    followRedirects: boolean;
    maxRedirects: number;
  };
  /** Fuzzing settings */
  fuzzing: {
    defaultIterations: number;
    defaultWorkers: number;
    defaultDelay: number;
    defaultTimeout: number;
  };
  /** Worker pool settings */
  workers: WorkerPoolConfig;
  /** Output settings */
  output: {
    directory: string;
    format: 'json' | 'html' | 'markdown' | 'all';
    includeScreenshots: boolean;
    includeRawResponses: boolean;
  };
  /** Logging settings */
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
    console: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CyberCodyEvent =
  | { type: 'scan:start'; target: string }
  | { type: 'scan:complete'; result: ScanResult }
  | { type: 'scan:error'; error: string }
  | { type: 'recon:start'; target: string }
  | { type: 'recon:complete'; result: ReconResult }
  | { type: 'fuzz:start'; target: string; iterations: number }
  | { type: 'fuzz:progress'; completed: number; total: number }
  | { type: 'fuzz:complete'; result: FuzzingResult }
  | { type: 'vulnerability:found'; snapshot: VulnerabilitySnapshot }
  | { type: 'guardrail:blocked'; target: string; reason: string };

export type EventHandler = (event: CyberCodyEvent) => void;
