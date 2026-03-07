/**
 * 🔬 COMPLEXITY INJECTION SCRIPT
 * Injects Big O annotations into department files via Shadow Protocol.
 * STATUS: ATOMIC SURGERY
 */
import * as fs from 'fs';
import * as path from 'path';

interface InjectionRule {
    methodSignature: string;
    complexity: string;
}

interface FileInjection {
    file: string;
    rules: InjectionRule[];
}

// Complexity: O(F * R) where F = files, R = rules per file
const injections: FileInjection[] = [
    {
        file: 'src/core/departments/Biology.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(W) where W = watchList services to register' },
            { methodSignature: 'private async simulateLoading(ms: number)', complexity: '// Complexity: O(1) — timer delegation' },
            { methodSignature: 'private startHealthMonitor()', complexity: '// Complexity: O(1) — registers interval; each tick is O(W)' },
            { methodSignature: 'private async performCheck(service: string)', complexity: '// Complexity: O(1) — single service health check' },
            { methodSignature: 'private async triggerSelfHealing(service: string)', complexity: '// Complexity: O(1) — single service restoration' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(1) — status update' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(W) where W = watched services (Map.entries conversion)' },
            { methodSignature: 'public async fullIntegrityCheck(): Promise<any>', complexity: '// Complexity: O(F) where F = files to scan' },
            { methodSignature: 'public async optimizeResources(): Promise<void>', complexity: '// Complexity: O(1) — resource reallocation command' },
            { methodSignature: 'public watch(serviceName: string)', complexity: '// Complexity: O(W) where W = watchList length (includes() scan)' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
    {
        file: 'src/core/departments/Intelligence.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(1) — initialization sequence' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(1) — status update' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(1) — cached metrics retrieval' },
            { methodSignature: 'public async processQuery(', complexity: '// Complexity: O(T) where T = token count in query' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
    {
        file: 'src/core/departments/Fortress.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(1) — initialization + key rotation' },
            { methodSignature: 'private async simulateLoading(ms: number)', complexity: '// Complexity: O(1) — timer delegation' },
            { methodSignature: 'private setupDefaultFirewall()', complexity: '// Complexity: O(1) — static rule registration' },
            { methodSignature: 'private rotateMasterKeys()', complexity: '// Complexity: O(1) — single key generation' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(S) where S = active sessions to clear' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(I) where I = intrusion logs in last hour' },
            { methodSignature: 'private calculateThreatLevel(): string', complexity: '// Complexity: O(I) where I = intrusion log entries (filter scan)' },
            { methodSignature: 'public async authenticate(', complexity: '// Complexity: O(1) — HashMap insert + crypto operation' },
            { methodSignature: 'private logIntrusion(', complexity: '// Complexity: O(1) — amortized push (bounded at 1000)' },
            { methodSignature: 'public encrypt(data: string): string', complexity: '// Complexity: O(D) where D = data length (AES-256-CBC)' },
            { methodSignature: 'public decrypt(encrypted: string): string', complexity: '// Complexity: O(D) where D = encrypted data length' },
            { methodSignature: 'public async securityScan(): Promise<any>', complexity: '// Complexity: O(1) — system-wide scan command' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
    {
        file: 'src/core/departments/Omega.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(A) where A = mock assets to register' },
            { methodSignature: 'private async simulateLoading(ms: number)', complexity: '// Complexity: O(1) — timer delegation' },
            { methodSignature: 'private setupMockAssets()', complexity: '// Complexity: O(1) — static asset registration' },
            { methodSignature: 'private startMarketSimulation()', complexity: '// Complexity: O(1) — registers interval; each tick is O(1)' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(1) — status update + array clear' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(A) where A = assets (calculateTotalValue)' },
            { methodSignature: 'private calculateTotalValue(): number', complexity: '// Complexity: O(A) where A = number of assets in portfolio' },
            { methodSignature: 'private getCurrentPrice(symbol: string): number', complexity: '// Complexity: O(M) where M = marketFeed length (linear scan)' },
            { methodSignature: 'public async executeTrade(', complexity: '// Complexity: O(M) where M = marketFeed (getCurrentPrice call)' },
            { methodSignature: 'public async getPerformanceReport(): Promise<any>', complexity: '// Complexity: O(A) where A = assets + recent trades slice' },
            { methodSignature: 'private calculatePNL(): number', complexity: '// Complexity: O(A * M) where A = assets, M = marketFeed per asset' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
    {
        file: 'src/core/departments/Physics.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(1) — oracle setup + entropy init' },
            { methodSignature: 'private async simulateLoading(ms: number)', complexity: '// Complexity: O(1) — timer delegation' },
            { methodSignature: 'private setupOracles()', complexity: '// Complexity: O(1) — static oracle registration' },
            { methodSignature: 'private startEntropyCalculation()', complexity: '// Complexity: O(1) — registers interval' },
            { methodSignature: 'private detectArbitrage()', complexity: '// Complexity: O(1) — conditional push (bounded at 50)' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(1) — status update' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(1) — cached metrics retrieval' },
            { methodSignature: 'public getConsolidatedPrice(', complexity: '// Complexity: O(P) where P = number of price oracles' },
            { methodSignature: 'public calculateRiskProfile(): any', complexity: '// Complexity: O(1) — entropy-based calculation' },
            { methodSignature: 'public async executeAtomicArb(', complexity: '// Complexity: O(A) where A = arbitrage opportunities (find + filter)' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
    {
        file: 'src/core/departments/Guardians.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(1) — policy setup' },
            { methodSignature: 'private async simulateLoading(ms: number)', complexity: '// Complexity: O(1) — timer delegation' },
            { methodSignature: 'private setupDefaultPolicies()', complexity: '// Complexity: O(1) — static policy array' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(1) — status update' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(1) — cached metrics retrieval' },
            { methodSignature: 'public logAction(', complexity: '// Complexity: O(1) — amortized push (bounded at 5000)' },
            { methodSignature: 'private calculateHash(', complexity: '// Complexity: O(D) where D = data length (hex encoding)' },
            { methodSignature: 'public async runAudit(): Promise<any>', complexity: '// Complexity: O(A) where A = audit trail entries (filter scan)' },
            { methodSignature: 'public updatePolicy(', complexity: '// Complexity: O(P) where P = policies (find scan)' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
    {
        file: 'src/core/departments/Reality.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(1) — world state initialization' },
            { methodSignature: 'private async simulateLoading(ms: number)', complexity: '// Complexity: O(1) — timer delegation' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(S) where S = active simulations to clear' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(1) — cached metrics retrieval' },
            { methodSignature: 'public async startSimulation(', complexity: '// Complexity: O(1) — HashMap insert' },
            { methodSignature: 'public async syncFrontend(', complexity: '// Complexity: O(S) where S = simulations (Map.values conversion)' },
            { methodSignature: 'public updateWorldState(', complexity: '// Complexity: O(K) where K = keys in update object (spread merge)' },
            { methodSignature: 'public async generateSystemProjection(): Promise<any>', complexity: '// Complexity: O(1) — render command delegation' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
    {
        file: 'src/core/departments/Chemistry.ts',
        rules: [
            { methodSignature: 'constructor()', complexity: '// Complexity: O(1) — super delegation' },
            { methodSignature: 'public async initialize(): Promise<void>', complexity: '// Complexity: O(1) — cable setup' },
            { methodSignature: 'private async simulateLoading(ms: number)', complexity: '// Complexity: O(1) — timer delegation' },
            { methodSignature: 'private setupDefaultCables()', complexity: '// Complexity: O(1) — static cable registration' },
            { methodSignature: 'public async shutdown(): Promise<void>', complexity: '// Complexity: O(1) — status update' },
            { methodSignature: 'public async getHealth(): Promise<any>', complexity: '// Complexity: O(1) — cached metrics retrieval' },
            { methodSignature: 'public dispatch(', complexity: '// Complexity: O(1) — amortized push (bounded at 2000)' },
            { methodSignature: 'public async createBond(', complexity: '// Complexity: O(1) — bond registration' },
            { methodSignature: 'public async routeRequest(', complexity: '// Complexity: O(1) — static route resolution' },
            { methodSignature: 'public async sync(): Promise<void>', complexity: '// Complexity: O(1) — no-op sync' },
        ],
    },
];

// Complexity: O(1) per injection
function injectComplexity(content: string, rule: InjectionRule): string {
    const idx = content.indexOf(rule.methodSignature);
    if (idx === -1) return content;

    // Check if already annotated
    const lineStart = content.lastIndexOf('\n', idx);
    const previousLine = content.substring(
        content.lastIndexOf('\n', lineStart - 1) + 1,
        lineStart
    );
    if (previousLine.includes('// Complexity:')) return content;

    // Find the indentation
    const methodLine = content.substring(lineStart + 1, idx);
    const indent = methodLine.match(/^\s*/)?.[0] || '  ';

    // Insert before the method
    return content.substring(0, lineStart + 1) + indent + rule.complexity + '\n' + content.substring(lineStart + 1);
}

// MAIN EXECUTION
console.log('═══════════════════════════════════════════════════');
console.log('  🔬 COMPLEXITY INJECTION — SHADOW PROTOCOL v2.0');
console.log('═══════════════════════════════════════════════════');

let totalInjected = 0;
let totalFiles = 0;
const results: { file: string; injected: number; status: string }[] = [];

for (const injection of injections) {
    const filePath = path.resolve(injection.file);
    const shadowPath = filePath.replace('.ts', '.shadow.ts');

    if (!fs.existsSync(filePath)) {
        console.log(`❌ FILE NOT FOUND: ${injection.file}`);
        results.push({ file: injection.file, injected: 0, status: 'NOT_FOUND' });
        continue;
    }

    // Step 1: Create shadow
    let content = fs.readFileSync(filePath, 'utf8');
    let injectedCount = 0;

    // Step 2: Inject annotations
    for (const rule of injection.rules) {
        const before = content;
        content = injectComplexity(content, rule);
        if (content !== before) injectedCount++;
    }

    // Step 3: Write shadow
    fs.writeFileSync(shadowPath, content, 'utf8');

    // Step 4: Overwrite original (skip tsc in script, we'll verify after)
    fs.writeFileSync(filePath, content, 'utf8');

    // Step 5: Clean shadow
    fs.unlinkSync(shadowPath);

    totalInjected += injectedCount;
    totalFiles++;
    results.push({ file: injection.file, injected: injectedCount, status: 'STEEL' });
    console.log(`✅ ${injection.file} — ${injectedCount} annotations injected`);
}

console.log('\n═══════════════════════════════════════════════════');
console.log(`  TOTAL: ${totalFiles} files | ${totalInjected} annotations`);
console.log('═══════════════════════════════════════════════════');
console.log('\nRESULTS:');
console.table(results);
