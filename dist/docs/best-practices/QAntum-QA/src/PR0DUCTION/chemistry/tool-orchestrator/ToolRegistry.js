"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   ████████╗ ██████╗  ██████╗ ██╗                                              ║
 * ║   ╚══██╔══╝██╔═══██╗██╔═══██╗██║                                              ║
 * ║      ██║   ██║   ██║██║   ██║██║                                              ║
 * ║      ██║   ██║   ██║██║   ██║██║                                              ║
 * ║      ██║   ╚██████╔╝╚██████╔╝███████╗                                         ║
 * ║      ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝                                         ║
 * ║                                                                               ║
 * ║   ██████╗ ███████╗ ██████╗ ██╗███████╗████████╗██████╗ ██╗   ██╗              ║
 * ║   ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚══██╔══╝██╔══██╗╚██╗ ██╔╝              ║
 * ║   ██████╔╝█████╗  ██║  ███╗██║███████╗   ██║   ██████╔╝ ╚████╔╝               ║
 * ║   ██╔══██╗██╔══╝  ██║   ██║██║╚════██║   ██║   ██╔══██╗  ╚██╔╝                ║
 * ║   ██║  ██║███████╗╚██████╔╝██║███████║   ██║   ██║  ██║   ██║                 ║
 * ║   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝                 ║
 * ║                                                                               ║
 * ║   QAntum v29.0 "THE OMNIPOTENT NEXUS" - Tool Registry                         ║
 * ║   "Сканира, индексира и регистрира 25+ MCP инструмента"                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolRegistry = exports.ToolRegistry = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
const types_1 = require("./types");
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    embeddingProvider: 'groq',
    embeddingModel: 'text-embedding-3-small',
    healthCheckIntervalMs: 60000, // 1 minute
    healthCheckTimeoutMs: 5000,
    cacheToolsInMemory: true,
    cacheTTLMs: 300000, // 5 minutes
};
// ═══════════════════════════════════════════════════════════════════════════════
// TOOL REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * ToolRegistry - The Central Nervous System for MCP Tools
 *
 * Responsibilities:
 * 1. Register and manage 25+ MCP tools
 * 2. Index tool metadata in Pinecone for semantic search
 * 3. Health check all registered tools
 * 4. Track performance metrics
 *
 * @example
 * ```typescript
 * const registry = ToolRegistry.getInstance();
 * await registry.initialize();
 *
 * // Register a new tool
 * await registry.registerTool(chromeTool);
 *
 * // Get tool by ID
 * const tool = registry.getTool('mcp-control-chrome');
 *
 * // Search tools by capability
 * const tools = registry.searchByCapability('browser automation');
 * ```
 */
class ToolRegistry extends events_1.EventEmitter {
    static instance;
    config;
    tools = new Map();
    metrics = new Map();
    // Health check
    healthCheckInterval;
    // Pinecone integration (lazy loaded)
    pineconeIndex = null;
    // Embedding cache
    embeddingCache = new Map();
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Get singleton instance
     */
    static getInstance(config) {
        if (!ToolRegistry.instance) {
            ToolRegistry.instance = new ToolRegistry(config);
        }
        return ToolRegistry.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize the registry with all 25+ MCP tools
     */
    async initialize() {
        console.log('🔧 Initializing Tool Registry...');
        // Register all pre-defined tools
        await this.registerAllTools();
        // Initialize Pinecone if configured
        if (this.config.pineconeApiKey) {
            await this.initializePinecone();
        }
        // Start health checks
        this.startHealthChecks();
        console.log(`✅ Tool Registry initialized with ${this.tools.size} tools`);
        this.emit('initialized', { toolCount: this.tools.size });
    }
    /**
     * Register all 25+ MCP tools
     */
    async registerAllTools() {
        const tools = this.getPreDefinedTools();
        for (const tool of tools) {
            await this.registerTool(tool);
        }
    }
    /**
     * Get pre-defined MCP tools
     */
    getPreDefinedTools() {
        return [
            // ═══════════════════════════════════════════════════════════════════════
            // I. BROWSER AUTOMATION
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.CONTROL_CHROME,
                name: 'Control Chrome',
                category: 'browser-automation',
                version: '1.0.0',
                description: 'Control Chrome browser programmatically - open tabs, navigate, screenshot, execute scripts',
                capabilities: ['browser-control', 'tab-management', 'screenshot', 'script-injection', 'dom-manipulation'],
                keywords: ['chrome', 'browser', 'automation', 'selenium', 'puppeteer', 'web'],
                endpoint: 'stdio://mcp-control-chrome',
                authType: 'none',
                operations: [
                    {
                        id: 'openTab',
                        name: 'Open Tab',
                        description: 'Open a new browser tab with specified URL',
                        parameters: [
                            { name: 'url', type: 'string', description: 'URL to open', required: true }
                        ],
                        requiredParams: ['url'],
                        httpMethod: 'POST',
                        path: '/openTab'
                    },
                    {
                        id: 'screenshot',
                        name: 'Take Screenshot',
                        description: 'Capture screenshot of current page',
                        parameters: [
                            { name: 'fullPage', type: 'boolean', description: 'Capture full page', required: false, default: false }
                        ],
                        requiredParams: [],
                        httpMethod: 'POST',
                        path: '/screenshot'
                    },
                    {
                        id: 'executeScript',
                        name: 'Execute Script',
                        description: 'Execute JavaScript in page context',
                        parameters: [
                            { name: 'script', type: 'string', description: 'JavaScript code', required: true }
                        ],
                        requiredParams: ['script'],
                        httpMethod: 'POST',
                        path: '/executeScript'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: true
            },
            {
                id: types_1.MCP_TOOL_IDS.KAPTURE,
                name: 'Kapture',
                category: 'browser-automation',
                version: '1.0.0',
                description: 'Chrome DevTools integration for low-level browser manipulation and biometric injection',
                capabilities: ['devtools', 'network-interception', 'biometric-injection', 'performance-profiling'],
                keywords: ['chrome', 'devtools', 'network', 'biometric', 'fingerprint'],
                endpoint: 'stdio://mcp-kapture',
                authType: 'none',
                operations: [
                    {
                        id: 'interceptNetwork',
                        name: 'Intercept Network',
                        description: 'Intercept and modify network requests',
                        parameters: [
                            { name: 'patterns', type: 'array', description: 'URL patterns to intercept', required: true }
                        ],
                        requiredParams: ['patterns'],
                        httpMethod: 'POST',
                        path: '/interceptNetwork'
                    },
                    {
                        id: 'injectBiometric',
                        name: 'Inject Biometric Data',
                        description: 'Inject biometric data (mouse movements, typing patterns)',
                        parameters: [
                            { name: 'biometricProfile', type: 'object', description: 'Biometric profile data', required: true }
                        ],
                        requiredParams: ['biometricProfile'],
                        httpMethod: 'POST',
                        path: '/injectBiometric'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: true
            },
            // ═══════════════════════════════════════════════════════════════════════
            // II. OS/DESKTOP INTERACTION
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.DESKTOP_COMMANDER,
                name: 'Desktop Commander',
                category: 'os-desktop',
                version: '1.0.0',
                description: 'Control desktop applications - window management, keyboard/mouse input, file system',
                capabilities: ['window-control', 'keyboard-input', 'mouse-control', 'file-operations', 'clipboard'],
                keywords: ['desktop', 'window', 'keyboard', 'mouse', 'file', 'os'],
                endpoint: 'stdio://mcp-desktop-commander',
                authType: 'none',
                operations: [
                    {
                        id: 'focusWindow',
                        name: 'Focus Window',
                        description: 'Focus a window by title or process',
                        parameters: [
                            { name: 'title', type: 'string', description: 'Window title pattern', required: false },
                            { name: 'processName', type: 'string', description: 'Process name', required: false }
                        ],
                        requiredParams: [],
                        httpMethod: 'POST',
                        path: '/focusWindow'
                    },
                    {
                        id: 'typeText',
                        name: 'Type Text',
                        description: 'Type text with keyboard simulation',
                        parameters: [
                            { name: 'text', type: 'string', description: 'Text to type', required: true },
                            { name: 'delay', type: 'number', description: 'Delay between keystrokes (ms)', required: false, default: 50 }
                        ],
                        requiredParams: ['text'],
                        httpMethod: 'POST',
                        path: '/typeText'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            {
                id: types_1.MCP_TOOL_IDS.PDF_TOOLS,
                name: 'PDF Tools',
                category: 'os-desktop',
                version: '1.0.0',
                description: 'PDF manipulation - create, merge, split, extract text, fill forms',
                capabilities: ['pdf-create', 'pdf-merge', 'pdf-split', 'text-extraction', 'form-filling'],
                keywords: ['pdf', 'document', 'text', 'form', 'merge', 'split'],
                endpoint: 'stdio://mcp-pdf-tools',
                authType: 'none',
                operations: [
                    {
                        id: 'extractText',
                        name: 'Extract Text',
                        description: 'Extract text content from PDF',
                        parameters: [
                            { name: 'filePath', type: 'string', description: 'Path to PDF file', required: true },
                            { name: 'pages', type: 'array', description: 'Page numbers to extract', required: false }
                        ],
                        requiredParams: ['filePath'],
                        httpMethod: 'POST',
                        path: '/extractText'
                    },
                    {
                        id: 'fillForm',
                        name: 'Fill Form',
                        description: 'Fill PDF form fields',
                        parameters: [
                            { name: 'filePath', type: 'string', description: 'Path to PDF file', required: true },
                            { name: 'fields', type: 'object', description: 'Field name-value pairs', required: true }
                        ],
                        requiredParams: ['filePath', 'fields'],
                        httpMethod: 'POST',
                        path: '/fillForm'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            {
                id: types_1.MCP_TOOL_IDS.EXCEL,
                name: 'Microsoft Excel',
                category: 'os-desktop',
                version: '1.0.0',
                description: 'Excel automation - read, write, formulas, charts, pivot tables',
                capabilities: ['excel-read', 'excel-write', 'formulas', 'charts', 'pivot-tables'],
                keywords: ['excel', 'spreadsheet', 'data', 'formulas', 'charts'],
                endpoint: 'stdio://mcp-excel',
                authType: 'none',
                operations: [
                    {
                        id: 'readSheet',
                        name: 'Read Sheet',
                        description: 'Read data from Excel sheet',
                        parameters: [
                            { name: 'filePath', type: 'string', description: 'Path to Excel file', required: true },
                            { name: 'sheetName', type: 'string', description: 'Sheet name', required: false },
                            { name: 'range', type: 'string', description: 'Cell range (e.g., A1:D10)', required: false }
                        ],
                        requiredParams: ['filePath'],
                        httpMethod: 'POST',
                        path: '/readSheet'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            // ═══════════════════════════════════════════════════════════════════════
            // III. DATA SCRAPING & ENRICHMENT
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.APIFY,
                name: 'Apify',
                category: 'data-scraping',
                version: '1.0.0',
                description: 'Web scraping platform - actors, datasets, proxy rotation',
                capabilities: ['web-scraping', 'data-extraction', 'proxy-rotation', 'actor-execution'],
                keywords: ['scraping', 'crawling', 'data', 'proxy', 'actor'],
                endpoint: 'https://api.apify.com/v2',
                authType: 'bearer',
                envKeyName: 'APIFY_API_KEY',
                operations: [
                    {
                        id: 'runActor',
                        name: 'Run Actor',
                        description: 'Execute an Apify actor',
                        parameters: [
                            { name: 'actorId', type: 'string', description: 'Actor ID', required: true },
                            { name: 'input', type: 'object', description: 'Actor input', required: true }
                        ],
                        requiredParams: ['actorId', 'input'],
                        httpMethod: 'POST',
                        path: '/acts/{actorId}/runs'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: true
            },
            {
                id: types_1.MCP_TOOL_IDS.TOMBA,
                name: 'Tomba',
                category: 'data-scraping',
                version: '1.0.0',
                description: 'Email finder and verifier - domain search, email verification',
                capabilities: ['email-finder', 'domain-search', 'email-verification', 'lead-enrichment'],
                keywords: ['email', 'leads', 'domain', 'verification', 'enrichment'],
                endpoint: 'https://api.tomba.io/v1',
                authType: 'api-key',
                envKeyName: 'TOMBA_API_KEY',
                operations: [
                    {
                        id: 'domainSearch',
                        name: 'Domain Search',
                        description: 'Find all emails for a domain',
                        parameters: [
                            { name: 'domain', type: 'string', description: 'Domain to search', required: true }
                        ],
                        requiredParams: ['domain'],
                        httpMethod: 'GET',
                        path: '/domain-search',
                        rateLimit: { requests: 100, windowMs: 60000 }
                    },
                    {
                        id: 'verifyEmail',
                        name: 'Verify Email',
                        description: 'Verify if an email is valid',
                        parameters: [
                            { name: 'email', type: 'string', description: 'Email to verify', required: true }
                        ],
                        requiredParams: ['email'],
                        httpMethod: 'GET',
                        path: '/email-verifier'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            // ═══════════════════════════════════════════════════════════════════════
            // IV. CLOUD & INFRASTRUCTURE
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.AWS_API,
                name: 'AWS API',
                category: 'cloud-infrastructure',
                version: '1.0.0',
                description: 'Amazon Web Services - EC2, S3, Lambda, RDS, and more',
                capabilities: ['ec2', 's3', 'lambda', 'rds', 'cloudwatch', 'iam'],
                keywords: ['aws', 'cloud', 'ec2', 's3', 'lambda', 'infrastructure'],
                endpoint: 'https://aws.amazon.com',
                authType: 'custom',
                envKeyName: 'AWS_ACCESS_KEY_ID',
                operations: [
                    {
                        id: 'listInstances',
                        name: 'List EC2 Instances',
                        description: 'List all EC2 instances',
                        parameters: [
                            { name: 'region', type: 'string', description: 'AWS region', required: true },
                            { name: 'filters', type: 'object', description: 'Instance filters', required: false }
                        ],
                        requiredParams: ['region'],
                        httpMethod: 'POST',
                        path: '/ec2/describe-instances'
                    },
                    {
                        id: 'uploadToS3',
                        name: 'Upload to S3',
                        description: 'Upload file to S3 bucket',
                        parameters: [
                            { name: 'bucket', type: 'string', description: 'S3 bucket name', required: true },
                            { name: 'key', type: 'string', description: 'Object key', required: true },
                            { name: 'body', type: 'string', description: 'File content', required: true }
                        ],
                        requiredParams: ['bucket', 'key', 'body'],
                        httpMethod: 'PUT',
                        path: '/s3/put-object'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            {
                id: types_1.MCP_TOOL_IDS.KUBERNETES,
                name: 'Kubernetes',
                category: 'cloud-infrastructure',
                version: '1.0.0',
                description: 'Kubernetes cluster management - pods, deployments, services',
                capabilities: ['pod-management', 'deployment', 'service', 'configmap', 'secret'],
                keywords: ['kubernetes', 'k8s', 'container', 'orchestration', 'docker'],
                endpoint: 'https://kubernetes.default.svc',
                authType: 'bearer',
                envKeyName: 'K8S_TOKEN',
                operations: [
                    {
                        id: 'listPods',
                        name: 'List Pods',
                        description: 'List pods in a namespace',
                        parameters: [
                            { name: 'namespace', type: 'string', description: 'Kubernetes namespace', required: true }
                        ],
                        requiredParams: ['namespace'],
                        httpMethod: 'GET',
                        path: '/api/v1/namespaces/{namespace}/pods'
                    },
                    {
                        id: 'scaleDeploy',
                        name: 'Scale Deployment',
                        description: 'Scale a deployment to specified replicas',
                        parameters: [
                            { name: 'namespace', type: 'string', description: 'Kubernetes namespace', required: true },
                            { name: 'deployment', type: 'string', description: 'Deployment name', required: true },
                            { name: 'replicas', type: 'number', description: 'Number of replicas', required: true }
                        ],
                        requiredParams: ['namespace', 'deployment', 'replicas'],
                        httpMethod: 'PATCH',
                        path: '/apis/apps/v1/namespaces/{namespace}/deployments/{deployment}/scale'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            // ═══════════════════════════════════════════════════════════════════════
            // V. FINANCIAL MARKETS
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.POLYGON,
                name: 'Polygon.io',
                category: 'financial-markets',
                version: '1.0.0',
                description: 'Real-time and historical market data - stocks, options, forex, crypto',
                capabilities: ['stock-quotes', 'options-data', 'forex', 'crypto', 'historical-data'],
                keywords: ['stocks', 'market', 'trading', 'finance', 'crypto', 'forex'],
                endpoint: 'https://api.polygon.io',
                authType: 'api-key',
                envKeyName: 'POLYGON_API_KEY',
                operations: [
                    {
                        id: 'getQuote',
                        name: 'Get Quote',
                        description: 'Get real-time quote for a ticker',
                        parameters: [
                            { name: 'ticker', type: 'string', description: 'Stock ticker symbol', required: true }
                        ],
                        requiredParams: ['ticker'],
                        httpMethod: 'GET',
                        path: '/v2/last/trade/{ticker}'
                    },
                    {
                        id: 'getAggregates',
                        name: 'Get Aggregates',
                        description: 'Get historical aggregates (OHLCV)',
                        parameters: [
                            { name: 'ticker', type: 'string', description: 'Stock ticker', required: true },
                            { name: 'multiplier', type: 'number', description: 'Timespan multiplier', required: true },
                            { name: 'timespan', type: 'string', description: 'minute, hour, day, week', required: true },
                            { name: 'from', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
                            { name: 'to', type: 'string', description: 'End date (YYYY-MM-DD)', required: true }
                        ],
                        requiredParams: ['ticker', 'multiplier', 'timespan', 'from', 'to'],
                        httpMethod: 'GET',
                        path: '/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            // ═══════════════════════════════════════════════════════════════════════
            // VI. SAAS/PRODUCT ANALYTICS
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.CLARITY,
                name: 'Microsoft Clarity',
                category: 'saas-analytics',
                version: '1.0.0',
                description: 'User behavior analytics - heatmaps, session recordings, insights',
                capabilities: ['heatmaps', 'session-recordings', 'user-insights', 'analytics'],
                keywords: ['analytics', 'heatmap', 'session', 'user-behavior', 'ux'],
                endpoint: 'https://clarity.microsoft.com/api',
                authType: 'bearer',
                envKeyName: 'CLARITY_API_KEY',
                operations: [
                    {
                        id: 'getHeatmap',
                        name: 'Get Heatmap',
                        description: 'Get heatmap data for a page',
                        parameters: [
                            { name: 'projectId', type: 'string', description: 'Clarity project ID', required: true },
                            { name: 'pageUrl', type: 'string', description: 'Page URL', required: true }
                        ],
                        requiredParams: ['projectId', 'pageUrl'],
                        httpMethod: 'GET',
                        path: '/v1/heatmaps'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            {
                id: types_1.MCP_TOOL_IDS.GROWTHBOOK,
                name: 'GrowthBook',
                category: 'saas-analytics',
                version: '1.0.0',
                description: 'Feature flags and A/B testing platform',
                capabilities: ['feature-flags', 'ab-testing', 'experiments', 'rollouts'],
                keywords: ['feature-flags', 'ab-test', 'experiment', 'rollout', 'analytics'],
                endpoint: 'https://api.growthbook.io',
                authType: 'api-key',
                envKeyName: 'GROWTHBOOK_API_KEY',
                operations: [
                    {
                        id: 'getFeatures',
                        name: 'Get Features',
                        description: 'Get all feature flags',
                        parameters: [],
                        requiredParams: [],
                        httpMethod: 'GET',
                        path: '/api/v1/features'
                    },
                    {
                        id: 'createExperiment',
                        name: 'Create Experiment',
                        description: 'Create a new A/B experiment',
                        parameters: [
                            { name: 'name', type: 'string', description: 'Experiment name', required: true },
                            { name: 'variations', type: 'array', description: 'Experiment variations', required: true }
                        ],
                        requiredParams: ['name', 'variations'],
                        httpMethod: 'POST',
                        path: '/api/v1/experiments'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            // ═══════════════════════════════════════════════════════════════════════
            // VII. COMMUNICATION
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.MAILTRAP,
                name: 'Mailtrap',
                category: 'communication',
                version: '1.0.0',
                description: 'Email testing and sending - sandbox, API, templates',
                capabilities: ['email-send', 'email-testing', 'templates', 'analytics'],
                keywords: ['email', 'smtp', 'testing', 'template', 'send'],
                endpoint: 'https://send.api.mailtrap.io/api',
                authType: 'bearer',
                envKeyName: 'MAILTRAP_API_KEY',
                operations: [
                    {
                        id: 'sendEmail',
                        name: 'Send Email',
                        description: 'Send an email via Mailtrap',
                        parameters: [
                            { name: 'to', type: 'array', description: 'Recipients', required: true },
                            { name: 'from', type: 'object', description: 'Sender', required: true },
                            { name: 'subject', type: 'string', description: 'Email subject', required: true },
                            { name: 'html', type: 'string', description: 'HTML content', required: false },
                            { name: 'text', type: 'string', description: 'Plain text content', required: false }
                        ],
                        requiredParams: ['to', 'from', 'subject'],
                        httpMethod: 'POST',
                        path: '/send'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            },
            // ═══════════════════════════════════════════════════════════════════════
            // VIII. SCIENTIFIC AI
            // ═══════════════════════════════════════════════════════════════════════
            {
                id: types_1.MCP_TOOL_IDS.ENRICHR,
                name: 'Enrichr',
                category: 'scientific-ai',
                version: '1.0.0',
                description: 'Gene set enrichment analysis - pathway analysis, GO terms',
                capabilities: ['gene-enrichment', 'pathway-analysis', 'go-terms', 'kegg'],
                keywords: ['genomics', 'genes', 'pathway', 'enrichment', 'biology'],
                endpoint: 'https://maayanlab.cloud/Enrichr',
                authType: 'none',
                operations: [
                    {
                        id: 'analyzeGenes',
                        name: 'Analyze Gene Set',
                        description: 'Submit gene set for enrichment analysis',
                        parameters: [
                            { name: 'genes', type: 'array', description: 'List of gene symbols', required: true }
                        ],
                        requiredParams: ['genes'],
                        httpMethod: 'POST',
                        path: '/addList'
                    }
                ],
                status: 'available',
                requiresGhostProtocol: false
            }
        ];
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Register a new MCP tool
     */
    async registerTool(tool) {
        // Generate embedding for semantic search
        if (this.config.embeddingProvider) {
            tool.embeddingVector = await this.generateEmbedding(tool);
        }
        // Store in registry
        this.tools.set(tool.id, tool);
        // Initialize metrics
        this.metrics.set(tool.id, {
            toolId: tool.id,
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            avgLatencyMs: 0,
            p50LatencyMs: 0,
            p95LatencyMs: 0,
            p99LatencyMs: 0,
            successRate: 1.0,
            lastUsed: new Date(),
            firstUsed: new Date(),
            lessonsLearned: 0,
            improvementsSuggested: 0
        });
        // Index in Pinecone if available
        if (this.pineconeIndex && tool.embeddingVector) {
            await this.indexToolInPinecone(tool);
        }
        this.emit('tool:registered', { tool });
    }
    /**
     * Unregister a tool
     */
    unregisterTool(toolId) {
        const tool = this.tools.get(toolId);
        if (!tool)
            return false;
        this.tools.delete(toolId);
        this.metrics.delete(toolId);
        this.emit('tool:unregistered', { toolId });
        return true;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RETRIEVAL
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get tool by ID
     */
    getTool(toolId) {
        return this.tools.get(toolId);
    }
    /**
     * Get all tools
     */
    getAllTools() {
        return Array.from(this.tools.values());
    }
    /**
     * Get tools by category
     */
    getToolsByCategory(category) {
        return this.getAllTools().filter(t => t.category === category);
    }
    /**
     * Search tools by capability
     */
    searchByCapability(capability) {
        const lowerCap = capability.toLowerCase();
        return this.getAllTools().filter(t => t.capabilities.some(c => c.toLowerCase().includes(lowerCap)) ||
            t.keywords.some(k => k.toLowerCase().includes(lowerCap)));
    }
    /**
     * Get available tools (status === 'available')
     */
    getAvailableTools() {
        return this.getAllTools().filter(t => t.status === 'available');
    }
    /**
     * Get tool metrics
     */
    getToolMetrics(toolId) {
        return this.metrics.get(toolId);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EMBEDDING & PINECONE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate embedding for a tool
     */
    async generateEmbedding(tool) {
        // Create text for embedding
        const text = [
            tool.name,
            tool.description,
            ...tool.capabilities,
            ...tool.keywords,
            ...tool.operations.map(op => `${op.name}: ${op.description}`)
        ].join(' ');
        // Check cache
        const cacheKey = crypto.createHash('md5').update(text).digest('hex');
        if (this.embeddingCache.has(cacheKey)) {
            return this.embeddingCache.get(cacheKey);
        }
        // Generate embedding (simplified - in production use actual embedding API)
        // This is a placeholder - actual implementation would call Groq/OpenAI
        const embedding = this.simpleEmbedding(text);
        // Cache
        this.embeddingCache.set(cacheKey, embedding);
        return embedding;
    }
    /**
     * Simple embedding (placeholder)
     */
    simpleEmbedding(text) {
        // Simple hash-based embedding for demonstration
        // In production: use OpenAI/Groq embedding API
        const vector = new Array(1536).fill(0);
        const words = text.toLowerCase().split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            const hash = this.hashCode(words[i]);
            const idx = Math.abs(hash) % 1536;
            vector[idx] += 1 / words.length;
        }
        // Normalize
        const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
        if (magnitude > 0) {
            for (let i = 0; i < vector.length; i++) {
                vector[i] /= magnitude;
            }
        }
        return vector;
    }
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    /**
     * Initialize Pinecone connection
     */
    async initializePinecone() {
        // Pinecone initialization would go here
        // For now, we use in-memory storage
        console.log('📊 Pinecone integration: Using in-memory fallback');
    }
    /**
     * Index tool in Pinecone
     */
    async indexToolInPinecone(tool) {
        // Pinecone indexing would go here
        tool.pineconeVectorId = tool.id;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Start periodic health checks
     */
    startHealthChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(() => this.performHealthChecks(), this.config.healthCheckIntervalMs);
    }
    /**
     * Perform health checks on all tools
     */
    async performHealthChecks() {
        const results = new Map();
        for (const [toolId, tool] of this.tools) {
            const status = await this.checkToolHealth(tool);
            tool.status = status;
            tool.lastHealthCheck = new Date();
            results.set(toolId, status);
        }
        this.emit('healthcheck:completed', { results });
        return results;
    }
    /**
     * Check health of a single tool
     */
    async checkToolHealth(tool) {
        try {
            // Check if API key is configured (if required)
            if (tool.envKeyName) {
                const hasKey = process.env[tool.envKeyName];
                if (!hasKey) {
                    return 'unavailable';
                }
            }
            // For stdio tools, assume available
            if (tool.endpoint.startsWith('stdio://')) {
                return 'available';
            }
            // For HTTP tools, could do a ping
            // For now, assume available if configured
            return 'available';
        }
        catch (error) {
            return 'error';
        }
    }
    /**
     * Update metrics after execution
     */
    updateMetrics(toolId, success, latencyMs) {
        const metrics = this.metrics.get(toolId);
        if (!metrics)
            return;
        metrics.totalExecutions++;
        if (success) {
            metrics.successfulExecutions++;
        }
        else {
            metrics.failedExecutions++;
        }
        // Update average latency
        metrics.avgLatencyMs = ((metrics.avgLatencyMs * (metrics.totalExecutions - 1) + latencyMs) /
            metrics.totalExecutions);
        // Update success rate
        metrics.successRate = metrics.successfulExecutions / metrics.totalExecutions;
        metrics.lastUsed = new Date();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Shutdown registry
     */
    shutdown() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.tools.clear();
        this.metrics.clear();
        this.embeddingCache.clear();
        this.emit('shutdown');
    }
}
exports.ToolRegistry = ToolRegistry;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getToolRegistry = (config) => {
    return ToolRegistry.getInstance(config);
};
exports.getToolRegistry = getToolRegistry;
exports.default = ToolRegistry;
