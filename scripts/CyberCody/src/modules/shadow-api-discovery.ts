/**
 * shadow-api-discovery — Qantum Module
 * @module shadow-api-discovery
 * @path scripts/CyberCody/src/modules/shadow-api-discovery.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.1.0 - SHADOW API DISCOVERY                                     ║
// ║  "The Ghost Hunter" - Find Hidden & Forgotten API Endpoints                  ║
// ║  Specialization: Autonomous API Security Architect & Logic Hunter            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import { chromium, Browser, BrowserContext } from 'playwright';
import type { HTTPMethod } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 SHADOW API TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Configuration for Shadow API Discovery
 */
export interface ShadowAPIConfig {
  /** Target URL */
  target: string;
  /** Browser to use */
  headless?: boolean;
  /** Request timeout */
  timeout?: number;
  /** Maximum discovery depth */
  maxDepth?: number;
  /** Request delay (ms) */
  delayMs?: number;
  /** Include common admin paths */
  includeAdmin?: boolean;
  /** Include version discovery */
  includeVersions?: boolean;
  /** Custom wordlist */
  customPaths?: string[];
  /** Authentication headers */
  authHeaders?: Record<string, string>;
}

/**
 * Discovered shadow endpoint
 */
export interface ShadowEndpoint {
  path: string;
  method: HTTPMethod;
  statusCode: number;
  responseSize: number;
  discoveryMethod: DiscoveryMethod;
  risk: ShadowRisk;
  category: EndpointCategory;
  evidence: string[];
  details?: Record<string, unknown>;
}

export type DiscoveryMethod = 
  | 'version_enum'      // Found via version enumeration (v1, v2, etc)
  | 'path_bruteforce'   // Found via path wordlist
  | 'js_extraction'     // Extracted from JavaScript
  | 'response_leak'     // Leaked in response (HATEOAS, errors)
  | 'sitemap'           // Found in robots.txt/sitemap
  | 'api_docs'          // Found in OpenAPI/Swagger
  | 'common_pattern';   // Common API pattern match

export type ShadowRisk = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EndpointCategory =
  | 'deprecated'        // Old API version
  | 'debug'             // Debug/diagnostic endpoints
  | 'admin'             // Administrative functions
  | 'internal'          // Internal APIs
  | 'undocumented'      // Not in documentation
  | 'backup'            // Backup/restore endpoints
  | 'test'              // Test/staging endpoints
  | 'legacy';           // Legacy functionality

/**
 * Shadow API Discovery Report
 */
export interface ShadowAPIReport {
  target: string;
  startTime: Date;
  endTime: Date;
  totalEndpointsFound: number;
  
  endpoints: ShadowEndpoint[];
  
  summary: {
    criticalFindings: ShadowEndpoint[];
    deprecatedAPIs: ShadowEndpoint[];
    debugEndpoints: ShadowEndpoint[];
    adminEndpoints: ShadowEndpoint[];
    versionMatrix: Map<string, string[]>;
  };
  
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 WORDLISTS
// ═══════════════════════════════════════════════════════════════════════════════

const API_VERSIONS = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5', 'v1.0', 'v1.1', 'v2.0', 'v2.1', 
  'api/v1', 'api/v2', 'api/v3', 'rest/v1', 'rest/v2'];

const COMMON_API_PATHS = [
  // Users
  'users', 'user', 'accounts', 'account', 'profile', 'profiles', 'members',
  // Auth
  'auth', 'login', 'logout', 'register', 'signup', 'signin', 'oauth', 'token', 'tokens',
  'refresh', 'password', 'reset', 'verify', 'activate', 'session', 'sessions',
  // Admin
  'admin', 'administrator', 'management', 'manager', 'dashboard', 'console',
  'panel', 'control', 'settings', 'config', 'configuration',
  // Data
  'data', 'export', 'import', 'backup', 'restore', 'dump', 'download', 'upload',
  'files', 'documents', 'attachments', 'media', 'images', 'assets',
  // Debug
  'debug', 'test', 'testing', 'dev', 'development', 'staging', 'sandbox',
  'health', 'healthcheck', 'status', 'ping', 'info', 'version', 'metrics',
  'logs', 'trace', 'traces', 'profiler', 'monitor', 'monitoring',
  // Internal
  'internal', 'private', 'system', 'core', 'engine', 'service', 'services',
  'worker', 'workers', 'job', 'jobs', 'queue', 'queues', 'task', 'tasks',
  // Common resources
  'orders', 'products', 'items', 'cart', 'checkout', 'payment', 'payments',
  'transactions', 'invoices', 'billing', 'subscriptions', 'plans',
  'posts', 'articles', 'comments', 'reviews', 'ratings', 'feedback',
  'messages', 'notifications', 'alerts', 'events', 'webhooks',
  // GraphQL
  'graphql', 'graphiql', 'playground',
  // Documentation
  'docs', 'documentation', 'swagger', 'openapi', 'api-docs', 'redoc',
  'schema', 'schemas', 'spec', 'specification',
];

const ADMIN_PATHS = [
  'admin/users', 'admin/accounts', 'admin/settings', 'admin/config',
  'admin/logs', 'admin/audit', 'admin/permissions', 'admin/roles',
  'admin/backup', 'admin/restore', 'admin/database', 'admin/cache',
  'admin/jobs', 'admin/queues', 'admin/metrics', 'admin/health',
  'manage', 'manager', 'management', 'superuser', 'root',
  '_admin', '__admin', '.admin', 'adm', 'administrator',
];

const DEBUG_PATHS = [
  'debug', 'debug/info', 'debug/config', 'debug/env', 'debug/vars',
  'test', 'testing', 'test/api', '_test', '__test',
  'dev', 'development', '_dev', '__dev',
  'staging', 'sandbox', 'demo',
  'actuator', 'actuator/env', 'actuator/health', 'actuator/info',
  'metrics', 'prometheus', 'grafana',
  'phpinfo', 'info.php', 'test.php',
  'elmah', 'trace.axd', 'glimpse',
  'console', 'shell', 'terminal',
  'dump', 'memory', 'heap', 'profile',
];

const FILE_PATHS = [
  'robots.txt', 'sitemap.xml', 'sitemap.txt', 'sitemap_index.xml',
  '.well-known/security.txt', '.well-known/openid-configuration',
  'swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml',
  'api-docs.json', 'api-docs.yaml', 'spec.json', 'spec.yaml',
  '.env', '.env.local', '.env.production', 'config.json', 'settings.json',
  'package.json', 'composer.json', 'Gemfile', 'requirements.txt',
  'web.config', 'app.config', 'database.yml',
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 DISCOVERY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if endpoint exists
 */
async function probeEndpoint(
  url: string,
  method: HTTPMethod,
  headers: Record<string, string>,
  timeout: number
): Promise<{ statusCode: number; body: string; size: number } | null> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'CyberCody/1.1 Shadow-API-Discovery',
        'Accept': 'application/json, text/plain, */*',
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    });

    const body = await response.text();
    
    return {
      statusCode: response.status,
      body,
      size: body.length,
    };
  } catch {
    return null;
  }
}

/**
 * Extract API paths from JavaScript files
 */
function extractPathsFromJS(content: string): string[] {
  const paths: string[] = [];
  
  // URL patterns in JS
  const patterns = [
    /['"`]\/api\/[^'"`\s]+['"`]/g,           // "/api/..."
    /['"`]\/v\d+\/[^'"`\s]+['"`]/g,          // "/v1/..."
    /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,     // fetch("...")
    /axios\.[a-z]+\s*\(\s*['"`]([^'"`]+)['"`]/g,  // axios.get("...")
    /\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /\.post\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /\.put\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /\.delete\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /url\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
    /endpoint\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const path = match[1] || match[0]?.replace(/['"`]/g, '');
      if (path && path.startsWith('/')) {
        paths.push(path);
      }
    }
  }

  return [...new Set(paths)];
}

/**
 * Extract endpoints from API documentation
 */
function extractFromOpenAPI(content: string): string[] {
  const paths: string[] = [];
  
  try {
    const spec = JSON.parse(content);
    if (spec.paths) {
      paths.push(...Object.keys(spec.paths));
    }
  } catch {
    // Try YAML-like extraction
    const pathMatches = content.matchAll(/^\s{2}(\/[^:\s]+):/gm);
    for (const match of pathMatches) {
      if (match[1]) paths.push(match[1]);
    }
  }

  return paths;
}

/**
 * Assess risk level of discovered endpoint
 */
function assessRisk(endpoint: ShadowEndpoint): ShadowRisk {
  // Critical: Admin, debug, or sensitive endpoints that return data
  if (endpoint.statusCode === 200) {
    if (endpoint.category === 'debug' || endpoint.category === 'admin') {
      return 'critical';
    }
    if (endpoint.category === 'internal' || endpoint.category === 'backup') {
      return 'high';
    }
    if (endpoint.category === 'deprecated' || endpoint.category === 'test') {
      return 'medium';
    }
  }

  // High: Endpoints that don't require auth
  if (endpoint.statusCode === 200 && endpoint.responseSize > 100) {
    return 'high';
  }

  // Medium: Deprecated versions
  if (endpoint.category === 'deprecated' || endpoint.category === 'legacy') {
    return 'medium';
  }

  return 'low';
}

/**
 * Categorize endpoint
 */
function categorizeEndpoint(path: string, body: string): EndpointCategory {
  const lowerPath = path.toLowerCase();
  const lowerBody = body.toLowerCase();

  if (/debug|trace|profil|dump|memory|heap/.test(lowerPath)) return 'debug';
  if (/admin|manage|control|panel|dashboard/.test(lowerPath)) return 'admin';
  if (/internal|private|system|core/.test(lowerPath)) return 'internal';
  if (/backup|restore|export|dump/.test(lowerPath)) return 'backup';
  if (/test|staging|sandbox|dev|mock/.test(lowerPath)) return 'test';
  if (/v\d+|version/.test(lowerPath)) return 'deprecated';
  
  // Check response for clues
  if (/deprecated|sunset|obsolete/.test(lowerBody)) return 'deprecated';
  if (/debug|stack.trace|error\.stack/.test(lowerBody)) return 'debug';
  
  return 'undocumented';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 👻 SHADOW API DISCOVERY CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Shadow API Discovery - The Ghost Hunter
 * 
 * Discovers hidden, forgotten, and undocumented API endpoints
 * through version enumeration, path fuzzing, and JS analysis.
 */
export class ShadowAPIDiscovery extends EventEmitter {
  private config: Required<ShadowAPIConfig>;
  private discoveries: ShadowEndpoint[] = [];
  private browser?: Browser;
  private context?: BrowserContext;

  constructor(config: ShadowAPIConfig) {
    super();
    
    this.config = {
      target: config.target.replace(/\/$/, ''), // Remove trailing slash
      headless: config.headless ?? true,
      timeout: config.timeout ?? 10000,
      maxDepth: config.maxDepth ?? 3,
      delayMs: config.delayMs ?? 100,
      includeAdmin: config.includeAdmin ?? true,
      includeVersions: config.includeVersions ?? true,
      customPaths: config.customPaths ?? [],
      authHeaders: config.authHeaders ?? {},
    };
  }

  /**
   * Run full discovery scan
   */
  // Complexity: O(N)
  async discover(): Promise<ShadowAPIReport> {
    const startTime = new Date();
    console.log('\n👻 [SHADOW_API] Starting shadow API discovery...');
    console.log(`   Target: ${this.config.target}`);
    console.log(`   Admin paths: ${this.config.includeAdmin ? 'Yes' : 'No'}`);
    console.log(`   Version enum: ${this.config.includeVersions ? 'Yes' : 'No'}\n`);

    try {
      // Initialize browser for JS extraction
      this.browser = await chromium.launch({ headless: this.config.headless });
      this.context = await this.browser.newContext();

      // Phase 1: Check common files (robots.txt, swagger, etc.)
      await this.checkCommonFiles();

      // Phase 2: Extract paths from JS
      await this.extractFromJavaScript();

      // Phase 3: Version enumeration
      if (this.config.includeVersions) {
        await this.enumerateVersions();
      }

      // Phase 4: Path bruteforce
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.bruteforcePaths();

      // Phase 5: Admin paths
      if (this.config.includeAdmin) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.checkAdminPaths();
      }

      // Phase 6: Debug paths
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.checkDebugPaths();

    } finally {
      if (this.browser) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.browser.close();
      }
    }

    const report = this.generateReport(startTime);
    this.printReport(report);
    
    return report;
  }

  /**
   * Phase 1: Check common files
   */
  // Complexity: O(N*M) — nested iteration detected
  private async checkCommonFiles(): Promise<void> {
    console.log('   📄 Checking common files...');
    
    for (const file of FILE_PATHS) {
      const url = `${this.config.target}/${file}`;
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await probeEndpoint(url, 'GET', this.config.authHeaders, this.config.timeout);
      
      if (result && result.statusCode === 200 && result.size > 10) {
        const endpoint: ShadowEndpoint = {
          path: `/${file}`,
          method: 'GET',
          statusCode: result.statusCode,
          responseSize: result.size,
          discoveryMethod: 'sitemap',
          risk: 'info',
          category: 'undocumented',
          evidence: [`File found: ${file}`],
        };

        // Extract additional paths from files
        if (file.includes('swagger') || file.includes('openapi')) {
          const paths = extractFromOpenAPI(result.body);
          endpoint.evidence.push(`Found ${paths.length} paths in API docs`);
          endpoint.category = 'undocumented';
          
          // Add discovered paths for later probing
          for (const path of paths) {
            this.config.customPaths.push(path);
          }
        }

        if (file === 'robots.txt') {
          const disallowed = result.body.match(/Disallow:\s*(.+)/gi);
          if (disallowed) {
            endpoint.evidence.push(`Found ${disallowed.length} disallowed paths`);
            for (const d of disallowed) {
              const path = d.replace(/Disallow:\s*/i, '').trim();
              if (path && path !== '/') {
                this.config.customPaths.push(path);
              }
            }
          }
        }

        endpoint.risk = assessRisk(endpoint);
        this.discoveries.push(endpoint);
        this.emit('discovery', endpoint);
      }

      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.delay();
    }
  }

  /**
   * Phase 2: Extract paths from JavaScript
   */
  // Complexity: O(N*M) — nested iteration detected
  private async extractFromJavaScript(): Promise<void> {
    console.log('   🔍 Extracting paths from JavaScript...');
    
    if (!this.context) return;
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const page = await this.context.newPage();
    
    try {
      // Intercept JS responses
      const jsContents: string[] = [];
      
      page.on('response', async (response) => {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('javascript') || response.url().endsWith('.js')) {
          try {
            const body = await response.text();
            jsContents.push(body);
          } catch {}
        }
      });

      // SAFETY: async operation — wrap in try-catch for production resilience
      await page.goto(this.config.target, { waitUntil: 'networkidle', timeout: this.config.timeout });

      // Extract paths from all JS
      const extractedPaths = new Set<string>();
      for (const js of jsContents) {
        const paths = extractPathsFromJS(js);
        for (const p of paths) extractedPaths.add(p);
      }

      // Probe extracted paths
      for (const path of extractedPaths) {
        const url = `${this.config.target}${path}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await probeEndpoint(url, 'GET', this.config.authHeaders, this.config.timeout);
        
        if (result && (result.statusCode === 200 || result.statusCode === 401 || result.statusCode === 403)) {
          const endpoint: ShadowEndpoint = {
            path,
            method: 'GET',
            statusCode: result.statusCode,
            responseSize: result.size,
            discoveryMethod: 'js_extraction',
            risk: 'low',
            category: categorizeEndpoint(path, result.body),
            evidence: ['Extracted from JavaScript source'],
          };
          
          endpoint.risk = assessRisk(endpoint);
          this.discoveries.push(endpoint);
          this.emit('discovery', endpoint);
        }

        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.delay();
      }

      console.log(`      Found ${extractedPaths.size} paths in JavaScript`);
      
    } finally {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await page.close();
    }
  }

  /**
   * Phase 3: Version enumeration
   */
  // Complexity: O(N*M) — nested iteration detected
  private async enumerateVersions(): Promise<void> {
    console.log('   🔢 Enumerating API versions...');
    
    // Get a baseline endpoint to test versions against
    const baseEndpoints = this.discoveries
      .filter(d => d.statusCode === 200)
      .map(d => d.path);

    // Also test common patterns
    const testPaths = [...new Set([...baseEndpoints, '/users', '/api', '/data', '/resource'])];

    for (const version of API_VERSIONS) {
      for (const testPath of testPaths.slice(0, 5)) { // Limit to avoid too many requests
        // Try: /v1/users, /api/v1/users, etc.
        const variations = [
          `/${version}${testPath}`,
          `/${version}/${testPath.replace(/^\//, '')}`,
        ];

        for (const path of variations) {
          const url = `${this.config.target}${path}`;
          // SAFETY: async operation — wrap in try-catch for production resilience
          const result = await probeEndpoint(url, 'GET', this.config.authHeaders, this.config.timeout);
          
          if (result && result.statusCode === 200 && result.size > 20) {
            const endpoint: ShadowEndpoint = {
              path,
              method: 'GET',
              statusCode: result.statusCode,
              responseSize: result.size,
              discoveryMethod: 'version_enum',
              risk: 'medium',
              category: 'deprecated',
              evidence: [`Found API version: ${version}`],
            };
            
            // Check if this is a different version than current
            if (result.body !== this.discoveries.find(d => d.path === testPath)?.details?.body) {
              endpoint.evidence.push('Returns different data than current version');
              endpoint.risk = 'high';
            }

            endpoint.risk = assessRisk(endpoint);
            this.discoveries.push(endpoint);
            this.emit('discovery', endpoint);
          }

          // SAFETY: async operation — wrap in try-catch for production resilience
          await this.delay();
        }
      }
    }
  }

  /**
   * Phase 4: Path bruteforce
   */
  // Complexity: O(N*M) — nested iteration detected
  private async bruteforcePaths(): Promise<void> {
    console.log('   🔨 Bruteforcing common paths...');
    
    const allPaths = [...new Set([...COMMON_API_PATHS, ...this.config.customPaths])];
    
    for (const pathPart of allPaths) {
      const variations = [
        `/${pathPart}`,
        `/api/${pathPart}`,
      ];

      for (const path of variations) {
        if (this.discoveries.some(d => d.path === path)) continue;

        const url = `${this.config.target}${path}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await probeEndpoint(url, 'GET', this.config.authHeaders, this.config.timeout);
        
        if (result && (result.statusCode === 200 || result.statusCode === 401 || result.statusCode === 403)) {
          const endpoint: ShadowEndpoint = {
            path,
            method: 'GET',
            statusCode: result.statusCode,
            responseSize: result.size,
            discoveryMethod: 'path_bruteforce',
            risk: 'low',
            category: categorizeEndpoint(path, result.body),
            evidence: ['Discovered via path enumeration'],
          };
          
          endpoint.risk = assessRisk(endpoint);
          this.discoveries.push(endpoint);
          this.emit('discovery', endpoint);
        }

        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.delay();
      }
    }
  }

  /**
   * Phase 5: Admin paths
   */
  // Complexity: O(N) — linear iteration
  private async checkAdminPaths(): Promise<void> {
    console.log('   👑 Checking admin paths...');
    
    for (const path of ADMIN_PATHS) {
      const url = `${this.config.target}/${path}`;
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await probeEndpoint(url, 'GET', this.config.authHeaders, this.config.timeout);
      
      if (result && (result.statusCode === 200 || result.statusCode === 401 || result.statusCode === 403)) {
        const endpoint: ShadowEndpoint = {
          path: `/${path}`,
          method: 'GET',
          statusCode: result.statusCode,
          responseSize: result.size,
          discoveryMethod: 'path_bruteforce',
          risk: result.statusCode === 200 ? 'critical' : 'high',
          category: 'admin',
          evidence: ['Admin endpoint discovered'],
        };
        
        if (result.statusCode === 200) {
          endpoint.evidence.push('⚠️ ACCESSIBLE WITHOUT AUTHENTICATION');
          endpoint.risk = 'critical';
        }
        
        this.discoveries.push(endpoint);
        this.emit('discovery', endpoint);
      }

      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.delay();
    }
  }

  /**
   * Phase 6: Debug paths
   */
  // Complexity: O(N*M) — nested iteration detected
  private async checkDebugPaths(): Promise<void> {
    console.log('   🐛 Checking debug paths...');
    
    for (const path of DEBUG_PATHS) {
      const url = `${this.config.target}/${path}`;
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await probeEndpoint(url, 'GET', this.config.authHeaders, this.config.timeout);
      
      if (result && result.statusCode === 200 && result.size > 20) {
        const endpoint: ShadowEndpoint = {
          path: `/${path}`,
          method: 'GET',
          statusCode: result.statusCode,
          responseSize: result.size,
          discoveryMethod: 'path_bruteforce',
          risk: 'critical',
          category: 'debug',
          evidence: ['🔴 DEBUG ENDPOINT EXPOSED'],
        };
        
        // Check for sensitive data in response
        if (/password|secret|key|token|database|connection/i.test(result.body)) {
          endpoint.evidence.push('Contains potentially sensitive configuration');
        }
        
        this.discoveries.push(endpoint);
        this.emit('discovery', endpoint);
      }

      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.delay();
    }
  }

  /**
   * Rate limiting delay
   */
  // Complexity: O(1)
  private async delay(): Promise<void> {
    if (this.config.delayMs > 0) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(resolve => setTimeout(resolve, this.config.delayMs));
    }
  }

  /**
   * Generate report
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateReport(startTime: Date): ShadowAPIReport {
    const criticalFindings = this.discoveries.filter(d => d.risk === 'critical');
    const deprecatedAPIs = this.discoveries.filter(d => d.category === 'deprecated');
    const debugEndpoints = this.discoveries.filter(d => d.category === 'debug');
    const adminEndpoints = this.discoveries.filter(d => d.category === 'admin');

    // Build version matrix
    const versionMatrix = new Map<string, string[]>();
    for (const endpoint of this.discoveries.filter(d => d.discoveryMethod === 'version_enum')) {
      const versionMatch = endpoint.path.match(/v\d+(\.\d+)?/);
      if (versionMatch) {
        const version = versionMatch[0];
        const basePath = endpoint.path.replace(version, 'vX');
        const existing = versionMatrix.get(basePath) || [];
        existing.push(version);
        versionMatrix.set(basePath, existing);
      }
    }

    const recommendations: string[] = [];
    
    if (criticalFindings.length > 0) {
      recommendations.push('🔴 CRITICAL: Disable or protect exposed debug/admin endpoints immediately');
    }
    
    if (deprecatedAPIs.length > 0) {
      recommendations.push('🟡 Deprecate and eventually remove old API versions');
      recommendations.push('🟡 Implement API versioning strategy with sunset dates');
    }
    
    if (debugEndpoints.length > 0) {
      recommendations.push('🔴 Remove debug endpoints from production');
      recommendations.push('🟡 Use environment-based feature flags');
    }
    
    if (adminEndpoints.filter(e => e.statusCode === 200).length > 0) {
      recommendations.push('🔴 Implement authentication for all admin endpoints');
    }

    recommendations.push('💡 Implement endpoint inventory and documentation');
    recommendations.push('💡 Use API gateway for centralized access control');

    return {
      target: this.config.target,
      startTime,
      endTime: new Date(),
      totalEndpointsFound: this.discoveries.length,
      endpoints: this.discoveries,
      summary: {
        criticalFindings,
        deprecatedAPIs,
        debugEndpoints,
        adminEndpoints,
        versionMatrix,
      },
      recommendations,
    };
  }

  /**
   * Print report
   */
  // Complexity: O(N*M) — nested iteration detected
  private printReport(report: ShadowAPIReport): void {
    const duration = (report.endTime.getTime() - report.startTime.getTime()) / 1000;

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    👻 SHADOW API DISCOVERY REPORT                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.substring(0, 65).padEnd(65)}║
║ Duration: ${duration.toFixed(2)}s                                                          ║
║ Endpoints Found: ${report.totalEndpointsFound.toString().padStart(5)}                                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ FINDINGS:                                                                    ║
║   🔴 Critical: ${report.summary.criticalFindings.length.toString().padStart(3)} endpoints                                             ║
║   🟠 Debug:    ${report.summary.debugEndpoints.length.toString().padStart(3)} endpoints                                             ║
║   👑 Admin:    ${report.summary.adminEndpoints.length.toString().padStart(3)} endpoints                                             ║
║   📦 Deprecated: ${report.summary.deprecatedAPIs.length.toString().padStart(3)} API versions                                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ CRITICAL FINDINGS:                                                           ║`);

    for (const finding of report.summary.criticalFindings.slice(0, 5)) {
      console.log(`║   🔴 ${finding.path.substring(0, 50).padEnd(52)} [${finding.statusCode}]     ║`);
    }

    if (report.summary.criticalFindings.length === 0) {
      console.log(`║   ✅ No critical shadow APIs found                                          ║`);
    }

    console.log(`╠══════════════════════════════════════════════════════════════════════════════╣
║ RECOMMENDATIONS:                                                             ║`);

    for (const rec of report.recommendations.slice(0, 4)) {
      console.log(`║ ${rec.substring(0, 72).padEnd(72)}║`);
    }

    console.log(`╚══════════════════════════════════════════════════════════════════════════════╝`);
  }

  /**
   * Get discoveries
   */
  // Complexity: O(1)
  getDiscoveries(): ShadowEndpoint[] {
    return this.discoveries;
  }

  /**
   * Export to JSON
   */
  // Complexity: O(1)
  exportToJSON(): string {
    return JSON.stringify(this.discoveries, null, 2);
  }
}

export default ShadowAPIDiscovery;
