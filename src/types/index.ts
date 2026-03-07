/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║   QAntum v15.1 - Core Type Definitions                                                       ║
 * ║   TypeScript Migration - Base Types for All Modules                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📦 MODULE STATUS
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface ModuleStatus {
  chronos: boolean;
  apiSensei: boolean;
  omniscient: boolean;
  sovereign: boolean;
  neuroSentinel: boolean;
  nexus: boolean;
  quantum: boolean;
  playwright: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔧 BASE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface BaseConfig {
  silent?: boolean;
  debug?: boolean;
  timeout?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🥋 API SENSEI TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface APIConfig extends BaseConfig {
  baseURL: string;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
}

export interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// ═══════════════════════════════════════════════════════════════════════════════════════
// ⏰ CHRONOS ENGINE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface ChronosConfig extends BaseConfig {
  dataDir?: string;
  predictionThreshold?: number;
  learningRate?: number;
}

export interface TimePattern {
  pattern: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
}

export interface FuturePrediction {
  timestamp: Date;
  probability: number;
  type: 'error' | 'slowdown' | 'failure' | 'success';
  description: string;
  suggestedAction?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧠 NEURO-SENTINEL TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface SentinelConfig extends BaseConfig {
  chaosLevel?: number;
  autoHeal?: boolean;
  cloneCount?: number;
}

export interface AnomalyReport {
  id: string;
  type: 'performance' | 'error' | 'memory' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: string;
  metrics?: Record<string, number>;
}

export interface HealingAction {
  id: string;
  target: string;
  action: 'restart' | 'rollback' | 'scale' | 'patch';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 👑 SOVEREIGN CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface SecurityConfig extends BaseConfig {
  targetURL: string;
  crawlDepth?: number;
  payloads?: string[];
}

export interface SecurityFinding {
  id: string;
  type: 'xss' | 'sqli' | 'csrf' | 'ssrf' | 'lfi' | 'rfi' | 'other';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  url: string;
  payload: string;
  evidence: string;
  recommendation: string;
}

export interface SecurityReport {
  scanId: string;
  target: string;
  startTime: Date;
  endTime: Date;
  findings: SecurityFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧠 OMNISCIENT CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface OmniscientConfig extends BaseConfig {
  agents?: number;
  memorySize?: number;
  learningEnabled?: boolean;
}

export interface AgentState {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'error' | 'learning';
  lastAction?: string;
  metrics: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
  };
}

export interface CollectiveMemory {
  patterns: Map<string, number>;
  heuristics: Map<string, unknown>;
  learned: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🚀 NEXUS ENGINE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface NexusConfig extends BaseConfig {
  videoPath?: string;
  voiceEnabled?: boolean;
  language?: 'en' | 'bg';
}

export interface GeneratedTest {
  id: string;
  name: string;
  source: 'video' | 'screenshot' | 'voice' | 'ai';
  code: string;
  framework: 'playwright' | 'selenium' | 'cypress';
  confidence: number;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ⚛️ QUANTUM CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface QuantumConfig extends BaseConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface NaturalLanguageCommand {
  raw: string;
  parsed: {
    action: string;
    target?: string;
    params?: Record<string, unknown>;
  };
  confidence: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🏭 FACTORY FUNCTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface QAntumFactory {
  createChronos: (config?: ChronosConfig) => unknown;
  createAPISensei: (config?: APIConfig) => unknown;
  createSentinel: (config?: SentinelConfig) => unknown;
  createSovereign: (config?: SecurityConfig) => unknown;
  createOmniscient: (config?: OmniscientConfig) => unknown;
  createNexus: (config?: NexusConfig) => unknown;
  createQuantum: (config?: QuantumConfig) => unknown;
  getModuleStatus: () => ModuleStatus;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 TEST RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: {
    message: string;
    stack?: string;
  };
  screenshots?: string[];
  video?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  tests: TestResult[];
  startTime: Date;
  endTime: Date;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔄 EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type EventType =
  | 'test:start'
  | 'test:end'
  | 'test:pass'
  | 'test:fail'
  | 'anomaly:detected'
  | 'healing:start'
  | 'healing:complete'
  | 'prediction:made';

export interface QAntumEvent<T = unknown> {
  type: EventType;
  timestamp: Date;
  source: string;
  data: T;
}

export type EventHandler<T = unknown> = (event: QAntumEvent<T>) => void | Promise<void>;
