import { EventEmitter } from 'events';
import type { HTTPMethod } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
/**
 * Captured API request with full details
 */
export interface CapturedRequest {
    id: string;
    timestamp: Date;
    url: string;
    method: HTTPMethod;
    headers: Record<string, string>;
    body?: string;
    bodyType: 'json' | 'form' | 'text' | 'binary' | 'none';
    queryParams: Record<string, string>;
    pathParams: PathParameter[];
    cookies: Record<string, string>;
    authentication: AuthenticationInfo;
    response?: CapturedResponse;
    endpoint?: string;
}
/**
 * Captured API response
 */
export interface CapturedResponse {
    requestId: string;
    timestamp: Date;
    statusCode: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    bodyType: 'json' | 'html' | 'xml' | 'text' | 'binary';
    responseTime: number;
    size: number;
}
/**
 * Path parameter detected in URL
 */
export interface PathParameter {
    name: string;
    value: string;
    position: number;
    type: 'id' | 'uuid' | 'slug' | 'numeric' | 'unknown';
    potentialBOLA: boolean;
}
/**
 * Authentication information extracted from request
 */
export interface AuthenticationInfo {
    type: 'none' | 'bearer' | 'basic' | 'apikey' | 'cookie' | 'custom';
    token?: string;
    location: 'header' | 'query' | 'cookie' | 'body';
    headerName?: string;
}
/**
 * Complete API endpoint mapping
 */
export interface APIEndpointMap {
    baseUrl: string;
    path: string;
    fullUrl: string;
    methods: HTTPMethod[];
    parameters: {
        query: ParameterDefinition[];
        path: ParameterDefinition[];
        body: ParameterDefinition[];
        header: ParameterDefinition[];
    };
    authentication: AuthenticationInfo;
    responses: ResponsePattern[];
    sensitiveDataDetected: boolean;
    bolaRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    requestCount: number;
    firstSeen: Date;
    lastSeen: Date;
}
export interface ParameterDefinition {
    name: string;
    type: string;
    required: boolean;
    examples: string[];
    isIdentifier: boolean;
    sensitiveData: boolean;
}
export interface ResponsePattern {
    statusCode: number;
    contentType: string;
    schema?: object;
    sensitiveFields: string[];
    exampleCount: number;
}
/**
 * Complete API Map for a target
 */
export interface APIMap {
    target: string;
    scanStarted: Date;
    scanEnded?: Date;
    endpoints: Map<string, APIEndpointMap>;
    requests: CapturedRequest[];
    authTokens: AuthenticationInfo[];
    sensitiveEndpoints: string[];
    bolaTargets: BOLATarget[];
    statistics: APIMapStatistics;
}
export interface BOLATarget {
    endpoint: string;
    method: HTTPMethod;
    parameter: string;
    parameterType: 'path' | 'query' | 'body';
    originalValue: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
}
export interface APIMapStatistics {
    totalEndpoints: number;
    totalRequests: number;
    uniquePaths: number;
    authenticatedEndpoints: number;
    sensitiveEndpoints: number;
    bolaTargets: number;
}
export interface APIInterceptorConfig {
    /** Target URL to scan */
    target: string;
    /** Maximum time to intercept (ms) */
    timeout?: number;
    /** Include static resources in map */
    includeStatic?: boolean;
    /** Domains to intercept (default: same origin) */
    interceptDomains?: string[];
    /** User agent */
    userAgent?: string;
    /** Initial cookies to set */
    cookies?: Array<{
        name: string;
        value: string;
        domain: string;
    }>;
    /** Initial authentication token */
    authToken?: string;
    /** Headless mode */
    headless?: boolean;
}
/**
 * API Interceptor - The All-Seeing Eye
 *
 * Captures and maps all API traffic while navigating a web application.
 * Identifies BOLA targets, sensitive data leaks, and authentication patterns.
 */
export declare class APIInterceptor extends EventEmitter {
    private browser;
    private page;
    private config;
    private apiMap;
    private requestQueue;
    isIntercepting: boolean;
    constructor(config: APIInterceptorConfig);
    /**
     * Initialize empty API map
     */
    private initializeAPIMap;
    /**
     * Start intercepting API traffic
     */
    startInterception(): Promise<void>;
    /**
     * Check if request should be intercepted
     */
    private shouldIntercept;
    /**
     * Capture and analyze request
     */
    private captureRequest;
    /**
     * Capture and analyze response
     */
    private captureResponse;
    /**
     * Extract path parameters from URL path
     */
    private extractPathParameters;
    /**
     * Extract authentication information from request
     */
    private extractAuthentication;
    /**
     * Extract cookies from cookie header
     */
    private extractCookies;
    /**
     * Detect body type
     */
    private detectBodyType;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
    /**
     * Update API map with captured request/response
     */
    private updateAPIMap;
    /**
     * Normalize endpoint path (replace IDs with placeholders)
     */
    private normalizeEndpointPath;
    /**
     * Infer parameter type from value
     */
    private inferParameterType;
    /**
     * Extract body parameters recursively
     */
    private extractBodyParameters;
    /**
     * Analyze request for BOLA potential
     */
    private analyzeBOLAPotential;
    /**
     * Assess BOLA risk level
     */
    private assessBOLARisk;
    /**
     * Analyze response for sensitive data
     */
    private analyzeSensitiveData;
    /**
     * Find sensitive fields in JSON object
     */
    private findSensitiveFields;
    /**
     * Navigate and interact with page to discover more APIs
     */
    explore(options?: {
        maxClicks?: number;
        maxDepth?: number;
        clickSelectors?: string[];
    }): Promise<void>;
    /**
     * Stop interception and return API map
     */
    stopInterception(): Promise<APIMap>;
    /**
     * Intercept API traffic with optional interaction steps
     * This is the main entry point for API interception
     */
    intercept(interactionSteps?: Array<{
        action: string;
        selector?: string;
        value?: string;
        url?: string;
    }>): Promise<APIMap>;
    /**
     * Get current API map
     */
    getAPIMap(): APIMap;
    /**
     * Export API map to JSON
     */
    exportToJSON(): string;
    /**
     * Print API map summary
     */
    printSummary(): void;
}
export default APIInterceptor;
//# sourceMappingURL=api-interceptor.d.ts.map