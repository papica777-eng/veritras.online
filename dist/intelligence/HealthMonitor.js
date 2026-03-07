"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.1.0 SUPREME - HEALTH MONITOR                            ║
 * ║  "Преди да полетиш, провери горивото"                                     ║
 * ║                                                                           ║
 * ║  Проверява: .env конфигурация, Pinecone връзка, DeepSeek връзка           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
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
exports.healthMonitor = exports.HealthMonitor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const ENV_REQUIREMENTS = [
    {
        key: 'DEEPSEEK_API_KEY',
        required: true,
        description: 'DeepSeek V3 API Key for Cloud AI',
        validator: (v) => v.length > 10 && !v.includes('your_'),
    },
    {
        key: 'PINECONE_API_KEY',
        required: true,
        description: 'Pinecone API Key for Vector Database',
        validator: (v) => v.length > 10 && !v.includes('your_'),
    },
    {
        key: 'PINECONE_ENV',
        required: true,
        description: 'Pinecone Environment (e.g., us-east-1)',
        validator: (v) => v.length > 0 && !v.includes('your_'),
    },
    {
        key: 'STRIPE_SECRET_KEY',
        required: false,
        description: 'Stripe Secret Key for Payments',
        validator: (v) => v.startsWith('sk_'),
    },
    {
        key: 'GITHUB_TOKEN',
        required: false,
        description: 'GitHub Token for CI/CD',
        validator: (v) => v.startsWith('ghp_') || v.startsWith('github_pat_'),
    },
];
const EMPIRE_PATHS = {
    core: process.env.EMPIRE_CORE || 'C:\\MisteMind',
    shield: process.env.EMPIRE_SHIELD || 'C:\\MrMindQATool',
    voice: process.env.EMPIRE_VOICE || 'C:\\MisterMindPage',
};
// ═══════════════════════════════════════════════════════════════════════════
// HEALTH MONITOR CLASS
// ═══════════════════════════════════════════════════════════════════════════
class HealthMonitor {
    envPath;
    checks = [];
    constructor() {
        this.envPath = path.join(EMPIRE_PATHS.core, '.env');
    }
    // ═══════════════════════════════════════════════════════════════════════
    // MAIN HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════════════
    async runFullHealthCheck() {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║  🏥 HEALTH MONITOR - System Pre-Flight Check                  ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        this.checks = [];
        // 1. Check .env file exists
        await this.checkEnvFile();
        // 2. Check required environment variables
        await this.checkEnvVariables();
        // 3. Check DeepSeek API connection
        await this.checkDeepSeekConnection();
        // 4. Check Pinecone connection
        await this.checkPineconeConnection();
        // 5. Check Empire paths
        await this.checkEmpirePaths();
        // 6. Check npm scripts
        await this.checkNpmScripts();
        // Calculate overall health
        const health = this.calculateOverallHealth();
        // Print report
        this.printReport(health);
        return health;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // INDIVIDUAL CHECKS
    // ═══════════════════════════════════════════════════════════════════════
    async checkEnvFile() {
        console.log('📋 Checking .env file...');
        if (fs.existsSync(this.envPath)) {
            const stats = fs.statSync(this.envPath);
            this.checks.push({
                name: '.env File',
                status: 'healthy',
                message: '.env file exists and is readable',
                details: {
                    path: this.envPath,
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                },
            });
            console.log('   ✅ .env file found');
        }
        else {
            this.checks.push({
                name: '.env File',
                status: 'critical',
                message: '.env file not found. Copy .env.template to .env and fill in your keys.',
                details: {
                    templatePath: path.join(EMPIRE_PATHS.core, '.env.template'),
                },
            });
            console.log('   ❌ .env file NOT found');
        }
    }
    async checkEnvVariables() {
        console.log('🔑 Checking environment variables...');
        // Load .env file if exists
        this.loadEnvFile();
        let requiredMissing = 0;
        let optionalMissing = 0;
        for (const req of ENV_REQUIREMENTS) {
            const value = process.env[req.key];
            if (!value || value.trim() === '') {
                if (req.required) {
                    requiredMissing++;
                    console.log(`   ❌ ${req.key}: MISSING (required)`);
                }
                else {
                    optionalMissing++;
                    console.log(`   ⚠️ ${req.key}: MISSING (optional)`);
                }
            }
            else if (req.validator && !req.validator(value)) {
                if (req.required) {
                    requiredMissing++;
                    console.log(`   ❌ ${req.key}: INVALID (still has placeholder)`);
                }
                else {
                    console.log(`   ⚠️ ${req.key}: INVALID (optional)`);
                }
            }
            else {
                console.log(`   ✅ ${req.key}: SET`);
            }
        }
        if (requiredMissing === 0) {
            this.checks.push({
                name: 'Environment Variables',
                status: optionalMissing > 0 ? 'degraded' : 'healthy',
                message: optionalMissing > 0
                    ? `All required keys set. ${optionalMissing} optional keys missing.`
                    : 'All environment variables configured correctly',
                details: { requiredMissing, optionalMissing },
            });
        }
        else {
            this.checks.push({
                name: 'Environment Variables',
                status: 'critical',
                message: `${requiredMissing} required environment variable(s) missing`,
                details: { requiredMissing, optionalMissing },
            });
        }
    }
    async checkDeepSeekConnection() {
        console.log('🧠 Checking DeepSeek API connection...');
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey || apiKey.includes('your_')) {
            this.checks.push({
                name: 'DeepSeek API',
                status: 'critical',
                message: 'DeepSeek API key not configured',
            });
            console.log('   ❌ API key not set');
            return;
        }
        try {
            const startTime = Date.now();
            const result = await this.testDeepSeekAPI(apiKey);
            const latency = Date.now() - startTime;
            if (result.success) {
                this.checks.push({
                    name: 'DeepSeek API',
                    status: 'healthy',
                    message: 'DeepSeek API connection successful',
                    latency,
                    details: { model: 'deepseek-chat' },
                });
                console.log(`   ✅ Connected (${latency}ms)`);
            }
            else {
                this.checks.push({
                    name: 'DeepSeek API',
                    status: 'degraded',
                    message: `DeepSeek API error: ${result.error}`,
                    latency,
                });
                console.log(`   ⚠️ Error: ${result.error}`);
            }
        }
        catch (error) {
            this.checks.push({
                name: 'DeepSeek API',
                status: 'critical',
                message: `DeepSeek connection failed: ${error.message}`,
            });
            console.log(`   ❌ Connection failed: ${error.message}`);
        }
    }
    async checkPineconeConnection() {
        console.log('📌 Checking Pinecone connection...');
        const apiKey = process.env.PINECONE_API_KEY;
        const env = process.env.PINECONE_ENV;
        if (!apiKey || apiKey.includes('your_')) {
            this.checks.push({
                name: 'Pinecone API',
                status: 'critical',
                message: 'Pinecone API key not configured',
            });
            console.log('   ❌ API key not set');
            return;
        }
        try {
            const startTime = Date.now();
            const result = await this.testPineconeAPI(apiKey);
            const latency = Date.now() - startTime;
            if (result.success) {
                this.checks.push({
                    name: 'Pinecone API',
                    status: 'healthy',
                    message: 'Pinecone API connection successful',
                    latency,
                    details: { indexes: result.indexes || [] },
                });
                console.log(`   ✅ Connected (${latency}ms)`);
            }
            else {
                this.checks.push({
                    name: 'Pinecone API',
                    status: 'degraded',
                    message: `Pinecone API error: ${result.error}`,
                    latency,
                });
                console.log(`   ⚠️ Error: ${result.error}`);
            }
        }
        catch (error) {
            this.checks.push({
                name: 'Pinecone API',
                status: 'critical',
                message: `Pinecone connection failed: ${error.message}`,
            });
            console.log(`   ❌ Connection failed: ${error.message}`);
        }
    }
    async checkEmpirePaths() {
        console.log('🏛️ Checking Empire paths...');
        let allExist = true;
        const details = {};
        for (const [name, empPath] of Object.entries(EMPIRE_PATHS)) {
            const exists = fs.existsSync(empPath);
            details[name] = exists;
            if (exists) {
                console.log(`   ✅ ${name}: ${empPath}`);
            }
            else {
                console.log(`   ❌ ${name}: ${empPath} (NOT FOUND)`);
                allExist = false;
            }
        }
        this.checks.push({
            name: 'Empire Paths',
            status: allExist ? 'healthy' : 'degraded',
            message: allExist
                ? 'All empire paths accessible'
                : 'Some empire paths not found',
            details,
        });
    }
    async checkNpmScripts() {
        console.log('📜 Checking npm scripts...');
        const packagePath = path.join(EMPIRE_PATHS.core, 'package.json');
        const requiredScripts = [
            'production:launch',
            'empire:sync',
            'empire:audit',
            'loc:count',
        ];
        try {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
            const scripts = pkg.scripts || {};
            let missing = 0;
            for (const script of requiredScripts) {
                if (scripts[script]) {
                    console.log(`   ✅ ${script}: ${scripts[script].substring(0, 40)}...`);
                }
                else {
                    console.log(`   ❌ ${script}: MISSING`);
                    missing++;
                }
            }
            this.checks.push({
                name: 'NPM Scripts',
                status: missing === 0 ? 'healthy' : 'degraded',
                message: missing === 0
                    ? 'All required npm scripts present'
                    : `${missing} npm script(s) missing`,
                details: { requiredScripts, missing },
            });
        }
        catch (error) {
            this.checks.push({
                name: 'NPM Scripts',
                status: 'critical',
                message: `Cannot read package.json: ${error.message}`,
            });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // API TEST HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    testDeepSeekAPI(apiKey) {
        return new Promise((resolve) => {
            const data = JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 5,
            });
            const options = {
                hostname: 'api.deepseek.com',
                port: 443,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Length': data.length,
                },
                timeout: 10000,
            };
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve({ success: true });
                    }
                    else if (res.statusCode === 401) {
                        resolve({ success: false, error: 'Invalid API key' });
                    }
                    else {
                        resolve({ success: false, error: `HTTP ${res.statusCode}` });
                    }
                });
            });
            req.on('error', (e) => resolve({ success: false, error: e.message }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ success: false, error: 'Request timeout' });
            });
            req.write(data);
            req.end();
        });
    }
    testPineconeAPI(apiKey) {
        return new Promise((resolve) => {
            const options = {
                hostname: 'api.pinecone.io',
                port: 443,
                path: '/indexes',
                method: 'GET',
                headers: {
                    'Api-Key': apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            };
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const data = JSON.parse(body);
                            resolve({ success: true, indexes: data.indexes?.map((i) => i.name) || [] });
                        }
                        catch {
                            resolve({ success: true });
                        }
                    }
                    else if (res.statusCode === 401) {
                        resolve({ success: false, error: 'Invalid API key' });
                    }
                    else {
                        resolve({ success: false, error: `HTTP ${res.statusCode}` });
                    }
                });
            });
            req.on('error', (e) => resolve({ success: false, error: e.message }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ success: false, error: 'Request timeout' });
            });
            req.end();
        });
    }
    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    loadEnvFile() {
        if (!fs.existsSync(this.envPath))
            return;
        const content = fs.readFileSync(this.envPath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
                const key = trimmed.substring(0, eqIndex).trim();
                const value = trimmed.substring(eqIndex + 1).trim();
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    }
    calculateOverallHealth() {
        const critical = this.checks.filter(c => c.status === 'critical').length;
        const degraded = this.checks.filter(c => c.status === 'degraded').length;
        let overall = 'healthy';
        if (critical > 0)
            overall = 'critical';
        else if (degraded > 0)
            overall = 'degraded';
        // Ready for sync requires DeepSeek OR Pinecone
        const deepSeekOk = this.checks.find(c => c.name === 'DeepSeek API')?.status === 'healthy';
        const pineconeOk = this.checks.find(c => c.name === 'Pinecone API')?.status === 'healthy';
        const envOk = this.checks.find(c => c.name === '.env File')?.status === 'healthy';
        const readyForSync = envOk && (deepSeekOk || pineconeOk);
        const readyForProduction = envOk && deepSeekOk && pineconeOk;
        const recommendations = [];
        if (!envOk) {
            recommendations.push('Copy .env.template to .env and fill in your API keys');
        }
        if (!deepSeekOk) {
            recommendations.push('Get DeepSeek API key from https://platform.deepseek.com/');
        }
        if (!pineconeOk) {
            recommendations.push('Get Pinecone API key from https://www.pinecone.io/');
        }
        return {
            timestamp: new Date().toISOString(),
            overall,
            checks: this.checks,
            readyForSync,
            readyForProduction,
            recommendations,
        };
    }
    printReport(health) {
        console.log('\n════════════════════════════════════════════════════════════════');
        console.log('📊 HEALTH REPORT:');
        console.log('════════════════════════════════════════════════════════════════\n');
        const statusEmoji = {
            healthy: '🟢',
            degraded: '🟡',
            critical: '🔴',
            unknown: '⚪',
        };
        for (const check of health.checks) {
            const emoji = statusEmoji[check.status];
            const latency = check.latency ? ` (${check.latency}ms)` : '';
            console.log(`   ${emoji} ${check.name}: ${check.message}${latency}`);
        }
        console.log('\n────────────────────────────────────────────────────────────────');
        console.log(`   Overall Status: ${statusEmoji[health.overall]} ${health.overall.toUpperCase()}`);
        console.log(`   Ready for Sync: ${health.readyForSync ? '✅ YES' : '❌ NO'}`);
        console.log(`   Ready for Production: ${health.readyForProduction ? '✅ YES' : '❌ NO'}`);
        if (health.recommendations.length > 0) {
            console.log('\n   📋 Recommendations:');
            for (const rec of health.recommendations) {
                console.log(`      → ${rec}`);
            }
        }
        console.log('\n════════════════════════════════════════════════════════════════');
    }
    // ═══════════════════════════════════════════════════════════════════════
    // QUICK CHECKS
    // ═══════════════════════════════════════════════════════════════════════
    isEnvConfigured() {
        this.loadEnvFile();
        return !!(process.env.DEEPSEEK_API_KEY && process.env.PINECONE_API_KEY);
    }
    hasValidDeepSeekKey() {
        this.loadEnvFile();
        const key = process.env.DEEPSEEK_API_KEY;
        return !!(key && key.length > 10 && !key.includes('your_'));
    }
    hasValidPineconeKey() {
        this.loadEnvFile();
        const key = process.env.PINECONE_API_KEY;
        return !!(key && key.length > 10 && !key.includes('your_'));
    }
}
exports.HealthMonitor = HealthMonitor;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.healthMonitor = new HealthMonitor();
exports.default = HealthMonitor;
// ═══════════════════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    const monitor = new HealthMonitor();
    monitor.runFullHealthCheck().then(health => {
        process.exit(health.overall === 'critical' ? 1 : 0);
    });
}
