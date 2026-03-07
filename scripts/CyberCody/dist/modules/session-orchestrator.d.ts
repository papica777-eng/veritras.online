import { EventEmitter } from 'events';
import type { HTTPMethod } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
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
    tokenRefreshThreshold?: number;
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
/**
 * Decode JWT token without verification (for analysis)
 */
declare function decodeJWT(token: string): {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
} | null;
/**
 * Extract user info from JWT payload
 */
declare function extractJWTUserInfo(payload: Record<string, unknown>): {
    userId?: string;
    role?: string;
    email?: string;
};
/**
 * Check if JWT is expired
 */
declare function isJWTExpired(token: string): boolean;
/**
 * Get JWT expiry time
 */
declare function getJWTExpiry(token: string): Date | null;
/**
 * Session Orchestrator - The Identity Juggler
 *
 * Manages multiple user sessions and performs cross-context security testing.
 * Designed for advanced BOLA and privilege escalation detection.
 */
export declare class SessionOrchestrator extends EventEmitter {
    private profiles;
    private config;
    private testResults;
    private encryptionKey;
    constructor(config?: SessionOrchestratorConfig);
    /**
     * Get the encryption key (reserved for future credential encryption)
     */
    getEncryptionKeyLength(): number;
    /**
     * Add a new user profile with JWT token
     */
    addProfile(name: string, token: string, role?: UserProfile['role'], authType?: UserProfile['authType']): UserProfile;
    /**
     * Add profile with full credentials
     */
    addFullProfile(name: string, credentials: SessionCredentials, role?: UserProfile['role'], authType?: UserProfile['authType']): UserProfile;
    /**
     * Get profile by ID or name
     */
    getProfile(idOrName: string): UserProfile | undefined;
    /**
     * Get all profiles
     */
    getAllProfiles(): UserProfile[];
    /**
     * Remove profile
     */
    removeProfile(idOrName: string): boolean;
    /**
     * Update profile token (for refresh)
     */
    updateToken(idOrName: string, newToken: string, refreshToken?: string): boolean;
    /**
     * Run comprehensive cross-session security audit
     */
    runCrossSessionAudit(target: string, endpoints: Array<{
        endpoint: string;
        method: HTTPMethod;
        resourceIds: string[];
    }>): Promise<SessionOrchestratorReport>;
    /**
     * Run a single cross-session test
     */
    private runCrossSessionTest;
    /**
     * Make an authenticated HTTP request
     */
    private makeAuthenticatedRequest;
    /**
     * Build URL with resource ID substitution
     */
    private buildUrl;
    /**
     * Determine expected behavior based on roles
     */
    private determineExpectedBehavior;
    /**
     * Analyze responses for vulnerabilities
     */
    private analyzeForVulnerability;
    /**
     * Check if this is vertical privilege escalation
     */
    private isVerticalPrivilegeEscalation;
    /**
     * Detect potential token reuse issues
     */
    private detectTokenReuse;
    /**
     * Generate remediation advice
     */
    private generateRemediation;
    /**
     * Generate comprehensive report
     */
    private generateReport;
    /**
     * Print vulnerability to console
     */
    private printVulnerability;
    /**
     * Print final report
     */
    private printReport;
    /**
     * Check if any tokens need refresh
     */
    checkAndRefreshTokens(): Promise<void>;
    /**
     * Clear all test results
     */
    clearResults(): void;
    /**
     * Export profiles for backup
     */
    exportProfiles(): string;
}
export { decodeJWT, isJWTExpired, getJWTExpiry, extractJWTUserInfo };
//# sourceMappingURL=session-orchestrator.d.ts.map