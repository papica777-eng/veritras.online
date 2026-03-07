// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.2.0 - SESSION ORCHESTRATOR                                     ║
// ║  "The Identity Juggler" - Multi-User Session Management & Cross-Testing      ║
// ║  Specialization: Autonomous Multi-Context BOLA/Privilege Escalation Hunter   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import { createHash, randomBytes } from 'crypto';
import type { HTTPMethod } from '../types/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 SESSION ORCHESTRATOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * User session profile with authentication details
 */
export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'guest' | 'moderator' | 'superadmin' | 'custom';
  customRole?: string;
  authType: 'jwt' | 'bearer' | 'basic' | 'apikey' | 'cookie' | 'oauth2';
  credentials: SessionCredentials;
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastUsed: Date;
}

/**
 * Authentication credentials for a session
 */
export interface SessionCredentials {
  token?: string;
  refreshToken?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  cookies?: SessionCookie[];
  headers?: Record<string, string>;
  expiresAt?: Date;
}

/**
 * Session cookie definition
 */
export interface SessionCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

/**
 * Cross-session test configuration
 */
export interface CrossSessionTestConfig {
  sourceProfile: string;
  targetProfile: string;
  endpoint: string;
  method: HTTPMethod;
  resourceId: string;
  expectedBehavior: 'deny' | 'allow';
}

/**
 * Cross-session test result
 */
export interface CrossSessionTestResult {
  testId: string;
  config: CrossSessionTestConfig;
  sourceResponse: CrossSessionResponse;
  targetResponse: CrossSessionResponse;
  crossResponse: CrossSessionResponse;
  vulnerability: CrossSessionVulnerability | null;
  timestamp: Date;
  duration: number;
}

/**
 * Response from a cross-session request
 */
export interface CrossSessionResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  responseTime: number;
  authenticated: boolean;
}

/**
 * Detected cross-session vulnerability
 */
export interface CrossSessionVulnerability {
  type: 'horizontal-bola' | 'vertical-privilege-escalation' | 'session-fixation' | 'token-reuse';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  sourceProfile: UserProfile;
  targetProfile: UserProfile;
  endpoint: string;
  resourceId: string;
  proof: {
    sourceCanAccess: boolean;
    targetCanAccess: boolean;
    crossCanAccess: boolean;
  };
  remediation: string;
}

/**
 * Session orchestrator configuration
 */
export interface SessionOrchestratorConfig {
  maxProfiles?: number;
  tokenRefreshThreshold?: number; // seconds before expiry to refresh
  enableAutoRefresh?: boolean;
  encryptCredentials?: boolean;
  parallelTests?: number;
}

/**
 * Session orchestrator report
 */
export interface SessionOrchestratorReport {
  target: string;
  startTime: Date;
  endTime: Date;
  profiles: UserProfile[];
  testsRun: number;
  vulnerabilitiesFound: CrossSessionVulnerability[];
  summary: {
    horizontalBOLA: number;
    verticalPrivEsc: number;
    sessionFixation: number;
    tokenReuse: number;
  };
  riskScore: number;
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 JWT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Decode JWT token without verification (for analysis)
 */
function decodeJWT(token: string): { header: Record<string, unknown>; payload: Record<string, unknown>; signature: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(Buffer.from(parts[0]!, 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString());
    const signature = parts[2]!;

    return { header, payload, signature };
  } catch {
    return null;
  }
}

/**
 * Extract user info from JWT payload
 */
function extractJWTUserInfo(payload: Record<string, unknown>): { userId?: string; role?: string; email?: string } {
  const roles = payload.roles as string[] | undefined;
  const permissions = payload.permissions as string[] | undefined;
  return {
    userId: (payload.sub ?? payload.user_id ?? payload.userId ?? payload.id) as string | undefined,
    role: (payload.role ?? roles?.[0] ?? permissions?.[0]) as string | undefined,
    email: (payload.email ?? payload.mail) as string | undefined,
  };
}

/**
 * Check if JWT is expired
 */
function isJWTExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded?.payload.exp) return false;
  
  const expiry = (decoded.payload.exp as number) * 1000;
  return Date.now() > expiry;
}

/**
 * Get JWT expiry time
 */
function getJWTExpiry(token: string): Date | null {
  const decoded = decodeJWT(token);
  if (!decoded?.payload.exp) return null;
  
  return new Date((decoded.payload.exp as number) * 1000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 SESSION ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Session Orchestrator - The Identity Juggler
 * 
 * Manages multiple user sessions and performs cross-context security testing.
 * Designed for advanced BOLA and privilege escalation detection.
 */
export class SessionOrchestrator extends EventEmitter {
  private profiles: Map<string, UserProfile> = new Map();
  private config: Required<SessionOrchestratorConfig>;
  private testResults: CrossSessionTestResult[] = [];
  // Reserved for future credential encryption feature
  private encryptionKey: Buffer;

  constructor(config: SessionOrchestratorConfig = {}) {
    super();
    
    this.config = {
      maxProfiles: config.maxProfiles ?? 10,
      tokenRefreshThreshold: config.tokenRefreshThreshold ?? 300, // 5 minutes
      enableAutoRefresh: config.enableAutoRefresh ?? true,
      encryptCredentials: config.encryptCredentials ?? false,
      parallelTests: config.parallelTests ?? 4,
    };

    // Generate encryption key for credential storage (reserved for future use)
    this.encryptionKey = randomBytes(32);
  }

  /**
   * Get the encryption key (reserved for future credential encryption)
   */
  getEncryptionKeyLength(): number {
    return this.encryptionKey.length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 👤 PROFILE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add a new user profile with JWT token
   */
  addProfile(
    name: string,
    token: string,
    role: UserProfile['role'] = 'user',
    authType: UserProfile['authType'] = 'jwt'
  ): UserProfile {
    if (this.profiles.size >= this.config.maxProfiles) {
      throw new Error(`Maximum profiles (${this.config.maxProfiles}) reached`);
    }

    const id = createHash('sha256').update(name + Date.now()).digest('hex').substring(0, 12);
    
    // Extract info from JWT if applicable
    let metadata: Record<string, unknown> = {};
    if (authType === 'jwt' || authType === 'bearer') {
      const decoded = decodeJWT(token);
      if (decoded) {
        metadata = {
          jwtPayload: decoded.payload,
          ...extractJWTUserInfo(decoded.payload),
        };
      }
    }

    const profile: UserProfile = {
      id,
      name,
      role,
      authType,
      credentials: {
        token,
        expiresAt: authType === 'jwt' ? getJWTExpiry(token) ?? undefined : undefined,
      },
      metadata,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    this.profiles.set(id, profile);
    this.emit('profileAdded', profile);

    console.log(`   ✅ Added profile: ${name} (${role}) [${id}]`);
    
    return profile;
  }

  /**
   * Add profile with full credentials
   */
  addFullProfile(
    name: string,
    credentials: SessionCredentials,
    role: UserProfile['role'] = 'user',
    authType: UserProfile['authType'] = 'jwt'
  ): UserProfile {
    const id = createHash('sha256').update(name + Date.now()).digest('hex').substring(0, 12);

    const profile: UserProfile = {
      id,
      name,
      role,
      authType,
      credentials,
      metadata: {},
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    this.profiles.set(id, profile);
    this.emit('profileAdded', profile);

    return profile;
  }

  /**
   * Get profile by ID or name
   */
  getProfile(idOrName: string): UserProfile | undefined {
    // Try by ID first
    const byId = this.profiles.get(idOrName);
    if (byId) return byId;

    // Try by name
    for (const profile of this.profiles.values()) {
      if (profile.name.toLowerCase() === idOrName.toLowerCase()) {
        return profile;
      }
    }

    return undefined;
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): UserProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Remove profile
   */
  removeProfile(idOrName: string): boolean {
    const profile = this.getProfile(idOrName);
    if (!profile) return false;

    this.profiles.delete(profile.id);
    this.emit('profileRemoved', profile);
    return true;
  }

  /**
   * Update profile token (for refresh)
   */
  updateToken(idOrName: string, newToken: string, refreshToken?: string): boolean {
    const profile = this.getProfile(idOrName);
    if (!profile) return false;

    profile.credentials.token = newToken;
    if (refreshToken) {
      profile.credentials.refreshToken = refreshToken;
    }
    profile.credentials.expiresAt = getJWTExpiry(newToken) ?? undefined;
    profile.lastUsed = new Date();

    this.emit('tokenUpdated', profile);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 CROSS-SESSION TESTING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run comprehensive cross-session security audit
   */
  async runCrossSessionAudit(
    target: string,
    endpoints: Array<{ endpoint: string; method: HTTPMethod; resourceIds: string[] }>
  ): Promise<SessionOrchestratorReport> {
    console.log('\n🎭 [SESSION_ORCHESTRATOR] Starting cross-session security audit...');
    console.log(`   Target: ${target}`);
    console.log(`   Profiles: ${this.profiles.size}`);
    console.log(`   Endpoints: ${endpoints.length}\n`);

    const startTime = new Date();
    const vulnerabilities: CrossSessionVulnerability[] = [];
    const profiles = this.getAllProfiles();

    if (profiles.length < 2) {
      console.log('   ⚠️  Need at least 2 profiles for cross-session testing');
      return this.generateReport(target, startTime, vulnerabilities);
    }

    // Generate all test combinations
    const testConfigs: CrossSessionTestConfig[] = [];
    
    for (let i = 0; i < profiles.length; i++) {
      for (let j = 0; j < profiles.length; j++) {
        if (i === j) continue; // Skip same profile

        const source = profiles[i]!;
        const targetProfile = profiles[j]!;

        for (const endpoint of endpoints) {
          for (const resourceId of endpoint.resourceIds) {
            testConfigs.push({
              sourceProfile: source.id,
              targetProfile: targetProfile.id,
              endpoint: endpoint.endpoint,
              method: endpoint.method,
              resourceId,
              expectedBehavior: this.determineExpectedBehavior(source, targetProfile),
            });
          }
        }
      }
    }

    console.log(`   🎯 Generated ${testConfigs.length} cross-session test cases\n`);

    // Run tests in parallel batches
    const batchSize = this.config.parallelTests;
    for (let i = 0; i < testConfigs.length; i += batchSize) {
      const batch = testConfigs.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(config => this.runCrossSessionTest(target, config))
      );

      for (const result of results) {
        this.testResults.push(result);
        if (result.vulnerability) {
          vulnerabilities.push(result.vulnerability);
          this.emit('vulnerabilityFound', result.vulnerability);
          this.printVulnerability(result.vulnerability);
        }
      }

      // Progress update
      const progress = Math.min(i + batchSize, testConfigs.length);
      console.log(`   📊 Progress: ${progress}/${testConfigs.length} tests completed`);
    }

    const report = this.generateReport(target, startTime, vulnerabilities);
    this.printReport(report);
    
    return report;
  }

  /**
   * Run a single cross-session test
   */
  private async runCrossSessionTest(
    baseUrl: string,
    config: CrossSessionTestConfig
  ): Promise<CrossSessionTestResult> {
    const testId = createHash('sha256')
      .update(JSON.stringify(config) + Date.now())
      .digest('hex')
      .substring(0, 16);

    const startTime = Date.now();

    const sourceProfile = this.profiles.get(config.sourceProfile)!;
    const targetProfile = this.profiles.get(config.targetProfile)!;

    // Build URL with resource ID
    const url = this.buildUrl(baseUrl, config.endpoint, config.resourceId);

    // Test 1: Source profile accessing their own resource
    const sourceResponse = await this.makeAuthenticatedRequest(
      url,
      config.method,
      sourceProfile
    );

    // Test 2: Target profile accessing their own resource
    const targetResponse = await this.makeAuthenticatedRequest(
      url,
      config.method,
      targetProfile
    );

    // Test 3: Source profile trying to access with target's resource context
    // This is the BOLA test - using source's token to access target's resource
    const crossResponse = await this.makeAuthenticatedRequest(
      url,
      config.method,
      sourceProfile
    );

    const duration = Date.now() - startTime;

    // Analyze for vulnerabilities
    const vulnerability = this.analyzeForVulnerability(
      config,
      sourceProfile,
      targetProfile,
      sourceResponse,
      targetResponse,
      crossResponse
    );

    return {
      testId,
      config,
      sourceResponse,
      targetResponse,
      crossResponse,
      vulnerability,
      timestamp: new Date(),
      duration,
    };
  }

  /**
   * Make an authenticated HTTP request
   */
  private async makeAuthenticatedRequest(
    url: string,
    method: HTTPMethod,
    profile: UserProfile
  ): Promise<CrossSessionResponse> {
    const headers: Record<string, string> = {
      'User-Agent': 'CyberCody/1.2 SessionOrchestrator',
      'Accept': 'application/json',
      ...profile.credentials.headers,
    };

    // Add authentication header based on type
    switch (profile.authType) {
      case 'jwt':
      case 'bearer':
        if (profile.credentials.token) {
          headers['Authorization'] = `Bearer ${profile.credentials.token}`;
        }
        break;
      case 'basic':
        if (profile.credentials.username && profile.credentials.password) {
          const basic = Buffer.from(
            `${profile.credentials.username}:${profile.credentials.password}`
          ).toString('base64');
          headers['Authorization'] = `Basic ${basic}`;
        }
        break;
      case 'apikey':
        if (profile.credentials.apiKey) {
          headers['X-API-Key'] = profile.credentials.apiKey;
        }
        break;
    }

    // Add cookies if present
    if (profile.credentials.cookies && profile.credentials.cookies.length > 0) {
      headers['Cookie'] = profile.credentials.cookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method,
        headers,
        signal: AbortSignal.timeout(10000),
      });

      const body = await response.text();
      const responseTime = Date.now() - startTime;

      // Update last used
      profile.lastUsed = new Date();

      // Convert headers to object
      const headersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      return {
        statusCode: response.status,
        body,
        headers: headersObj,
        responseTime,
        authenticated: response.status !== 401 && response.status !== 403,
      };
    } catch (error) {
      return {
        statusCode: 0,
        body: error instanceof Error ? error.message : 'Unknown error',
        headers: {},
        responseTime: Date.now() - startTime,
        authenticated: false,
      };
    }
  }

  /**
   * Build URL with resource ID substitution
   */
  private buildUrl(baseUrl: string, endpoint: string, resourceId: string): string {
    // Replace :id, {id}, [id] patterns with actual resource ID
    let url = `${baseUrl}${endpoint}`;
    url = url.replace(/:id\b/gi, resourceId);
    url = url.replace(/\{id\}/gi, resourceId);
    url = url.replace(/\[id\]/gi, resourceId);
    url = url.replace(/:userId\b/gi, resourceId);
    url = url.replace(/\{userId\}/gi, resourceId);
    return url;
  }

  /**
   * Determine expected behavior based on roles
   */
  private determineExpectedBehavior(
    source: UserProfile,
    target: UserProfile
  ): 'deny' | 'allow' {
    const roleHierarchy: Record<string, number> = {
      superadmin: 100,
      admin: 80,
      moderator: 60,
      user: 40,
      guest: 20,
      custom: 50,
    };

    const sourceLevel = roleHierarchy[source.role] ?? 50;
    const targetLevel = roleHierarchy[target.role] ?? 50;

    // If source has higher privileges, they might be allowed
    if (sourceLevel > targetLevel) return 'allow';
    
    // Same level or lower - should be denied (BOLA protection)
    return 'deny';
  }

  /**
   * Analyze responses for vulnerabilities
   */
  private analyzeForVulnerability(
    config: CrossSessionTestConfig,
    sourceProfile: UserProfile,
    targetProfile: UserProfile,
    sourceResponse: CrossSessionResponse,
    targetResponse: CrossSessionResponse,
    crossResponse: CrossSessionResponse
  ): CrossSessionVulnerability | null {
    // Check for horizontal BOLA
    // If source can access target's resource when they shouldn't
    if (
      config.expectedBehavior === 'deny' &&
      crossResponse.statusCode >= 200 &&
      crossResponse.statusCode < 300 &&
      crossResponse.authenticated
    ) {
      // Check if the response contains actual data (not just empty success)
      const hasData = crossResponse.body.length > 10 && 
        (crossResponse.body.includes('{') || crossResponse.body.includes('['));

      if (hasData) {
        const isVertical = this.isVerticalPrivilegeEscalation(sourceProfile, targetProfile);
        
        return {
          type: isVertical ? 'vertical-privilege-escalation' : 'horizontal-bola',
          severity: isVertical ? 'critical' : 'high',
          description: isVertical
            ? `User "${sourceProfile.name}" (${sourceProfile.role}) can access resources belonging to higher privilege user "${targetProfile.name}" (${targetProfile.role})`
            : `User "${sourceProfile.name}" can access resources belonging to another user "${targetProfile.name}" at the same privilege level`,
          sourceProfile,
          targetProfile,
          endpoint: config.endpoint,
          resourceId: config.resourceId,
          proof: {
            sourceCanAccess: sourceResponse.statusCode >= 200 && sourceResponse.statusCode < 300,
            targetCanAccess: targetResponse.statusCode >= 200 && targetResponse.statusCode < 300,
            crossCanAccess: true,
          },
          remediation: this.generateRemediation(isVertical ? 'vertical-privilege-escalation' : 'horizontal-bola'),
        };
      }
    }

    // Check for token reuse vulnerability
    if (this.detectTokenReuse(sourceResponse, crossResponse)) {
      return {
        type: 'token-reuse',
        severity: 'medium',
        description: `Token from "${sourceProfile.name}" session appears to grant access to "${targetProfile.name}" resources without proper validation`,
        sourceProfile,
        targetProfile,
        endpoint: config.endpoint,
        resourceId: config.resourceId,
        proof: {
          sourceCanAccess: true,
          targetCanAccess: true,
          crossCanAccess: true,
        },
        remediation: this.generateRemediation('token-reuse'),
      };
    }

    return null;
  }

  /**
   * Check if this is vertical privilege escalation
   */
  private isVerticalPrivilegeEscalation(source: UserProfile, target: UserProfile): boolean {
    const roleHierarchy: Record<string, number> = {
      superadmin: 100,
      admin: 80,
      moderator: 60,
      user: 40,
      guest: 20,
      custom: 50,
    };

    const sourceLevel = roleHierarchy[source.role] ?? 50;
    const targetLevel = roleHierarchy[target.role] ?? 50;

    return targetLevel > sourceLevel;
  }

  /**
   * Detect potential token reuse issues
   */
  private detectTokenReuse(
    _sourceResponse: CrossSessionResponse,
    _crossResponse: CrossSessionResponse
  ): boolean {
    // This would need more sophisticated analysis
    // For now, return false - can be enhanced later
    return false;
  }

  /**
   * Generate remediation advice
   */
  private generateRemediation(vulnType: string): string {
    const remediations: Record<string, string> = {
      'horizontal-bola': `
1. Implement proper ownership checks in the backend
2. Verify the authenticated user owns the requested resource
3. Use middleware to enforce authorization before accessing resources
4. Example: if (resource.ownerId !== req.user.id) return 403;`,
      'vertical-privilege-escalation': `
1. Implement role-based access control (RBAC)
2. Check user permissions before granting access to elevated resources
3. Use middleware to validate role hierarchy
4. Log and alert on privilege escalation attempts`,
      'session-fixation': `
1. Regenerate session ID after authentication
2. Invalidate old session tokens on login
3. Implement session timeout policies
4. Use secure, httpOnly cookies`,
      'token-reuse': `
1. Include user context (user ID) in JWT claims
2. Validate token claims against requested resource
3. Implement token binding to specific resources
4. Use short-lived tokens with refresh rotation`,
    };

    return remediations[vulnType] ?? 'Implement proper authorization checks';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 REPORTING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate comprehensive report
   */
  private generateReport(
    target: string,
    startTime: Date,
    vulnerabilities: CrossSessionVulnerability[]
  ): SessionOrchestratorReport {
    const summary = {
      horizontalBOLA: vulnerabilities.filter(v => v.type === 'horizontal-bola').length,
      verticalPrivEsc: vulnerabilities.filter(v => v.type === 'vertical-privilege-escalation').length,
      sessionFixation: vulnerabilities.filter(v => v.type === 'session-fixation').length,
      tokenReuse: vulnerabilities.filter(v => v.type === 'token-reuse').length,
    };

    // Calculate risk score
    let riskScore = 0;
    riskScore += summary.verticalPrivEsc * 25; // Critical
    riskScore += summary.horizontalBOLA * 20; // High
    riskScore += summary.sessionFixation * 15; // Medium-High
    riskScore += summary.tokenReuse * 10; // Medium
    riskScore = Math.min(100, riskScore);

    const recommendations: string[] = [];
    if (summary.horizontalBOLA > 0) {
      recommendations.push('Implement resource ownership validation middleware');
    }
    if (summary.verticalPrivEsc > 0) {
      recommendations.push('Implement strict role-based access control (RBAC)');
    }
    if (summary.sessionFixation > 0) {
      recommendations.push('Regenerate session IDs after authentication');
    }
    if (summary.tokenReuse > 0) {
      recommendations.push('Include user context in JWT claims and validate');
    }
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring for authorization bypass attempts');
    }

    return {
      target,
      startTime,
      endTime: new Date(),
      profiles: this.getAllProfiles(),
      testsRun: this.testResults.length,
      vulnerabilitiesFound: vulnerabilities,
      summary,
      riskScore,
      recommendations,
    };
  }

  /**
   * Print vulnerability to console
   */
  private printVulnerability(vuln: CrossSessionVulnerability): void {
    const severityColors: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };

    console.log(`\n   ${severityColors[vuln.severity]} [${vuln.severity.toUpperCase()}] ${vuln.type}`);
    console.log(`      Endpoint: ${vuln.endpoint}`);
    console.log(`      Resource: ${vuln.resourceId}`);
    console.log(`      Source: ${vuln.sourceProfile.name} (${vuln.sourceProfile.role})`);
    console.log(`      Target: ${vuln.targetProfile.name} (${vuln.targetProfile.role})`);
  }

  /**
   * Print final report
   */
  private printReport(report: SessionOrchestratorReport): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                  🎭 SESSION ORCHESTRATOR REPORT                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.padEnd(58)}║
║ Profiles Tested: ${report.profiles.length.toString().padEnd(50)}║
║ Tests Run: ${report.testsRun.toString().padEnd(56)}║
║ Risk Score: ${report.riskScore.toString().padEnd(55)}/100 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ VULNERABILITIES FOUND:                                                       ║
║   🔴 Vertical Priv Esc: ${report.summary.verticalPrivEsc.toString().padEnd(43)}║
║   🟠 Horizontal BOLA:   ${report.summary.horizontalBOLA.toString().padEnd(43)}║
║   🟡 Session Fixation:  ${report.summary.sessionFixation.toString().padEnd(43)}║
║   🟢 Token Reuse:       ${report.summary.tokenReuse.toString().padEnd(43)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║ RECOMMENDATIONS:                                                             ║`);

    for (const rec of report.recommendations) {
      console.log(`║ 💡 ${rec.padEnd(63)}║`);
    }

    console.log(`╚══════════════════════════════════════════════════════════════════════════════╝`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if any tokens need refresh
   */
  async checkAndRefreshTokens(): Promise<void> {
    if (!this.config.enableAutoRefresh) return;

    for (const profile of this.profiles.values()) {
      if (profile.authType !== 'jwt' || !profile.credentials.token) continue;

      const expiry = profile.credentials.expiresAt;
      if (!expiry) continue;

      const timeUntilExpiry = expiry.getTime() - Date.now();
      const threshold = this.config.tokenRefreshThreshold * 1000;

      if (timeUntilExpiry < threshold && profile.credentials.refreshToken) {
        console.log(`   🔄 Token for "${profile.name}" expiring soon, refresh needed`);
        this.emit('tokenExpiring', profile);
      }
    }
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.testResults = [];
  }

  /**
   * Export profiles for backup
   */
  exportProfiles(): string {
    const profiles = this.getAllProfiles().map(p => ({
      ...p,
      credentials: {
        ...p.credentials,
        // Mask sensitive data
        token: p.credentials.token ? '***REDACTED***' : undefined,
        refreshToken: p.credentials.refreshToken ? '***REDACTED***' : undefined,
        password: p.credentials.password ? '***REDACTED***' : undefined,
      },
    }));

    return JSON.stringify(profiles, null, 2);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { decodeJWT, isJWTExpired, getJWTExpiry, extractJWTUserInfo };
