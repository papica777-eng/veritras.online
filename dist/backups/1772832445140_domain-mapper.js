"use strict";
/**
 * 🔭 QANTUM DOMAIN MAPPER - MACRO-LENS ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   ████████╗██╗  ██╗███████╗    ██████╗  ██████╗ ███╗   ███╗ █████╗ ██╗███╗   ██╗
 *   ╚══██╔══╝██║  ██║██╔════╝    ██╔══██╗██╔═══██╗████╗ ████║██╔══██╗██║████╗  ██║
 *      ██║   ███████║█████╗      ██║  ██║██║   ██║██╔████╔██║███████║██║██╔██╗ ██║
 *      ██║   ██╔══██║██╔══╝      ██║  ██║██║   ██║██║╚██╔╝██║██╔══██║██║██║╚██╗██║
 *      ██║   ██║  ██║███████╗    ██████╔╝╚██████╔╝██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
 *      ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 *   ███╗   ███╗ █████╗ ██████╗ ██████╗ ███████╗██████╗
 *   ████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
 *   ██╔████╔██║███████║██████╔╝██████╔╝█████╗  ██████╔╝
 *   ██║╚██╔╝██║██╔══██║██╔═══╝ ██╔═══╝ ██╔══╝  ██╔══██╗
 *   ██║ ╚═╝ ██║██║  ██║██║     ██║     ███████╗██║  ██║
 *   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   "QAntum Prime вече не чете код. Той управлява Домейни."
 *
 *   Macro-Lens Orchestration:
 *   - Сканира "гората", не "дърветата"
 *   - Поставя етикети на всеки домейн
 *   - Открива архитектурни аномалии
 *   - Валидира causal dependencies
 *
 * @version 1.0.0
 * @author QAntum AI Architect
 * @phase v1.2.0 Macro-Lens
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
exports.DomainMapper = void 0;
exports.createDomainMapper = createDomainMapper;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    rootPath: process.cwd(),
    generateManifests: true,
    strictMode: true,
    ignoredPaths: ['node_modules', 'dist', '.git', 'coverage']
};
/**
 * Layer hierarchy - defines valid dependency directions
 * A layer can only depend on layers BELOW it
 */
const LAYER_HIERARCHY = {
    'MATH': 1, // Foundation - depends on nothing
    'PHYSICS': 2, // Depends on Math
    'CHEMISTRY': 3, // Depends on Math, Physics
    'BIOLOGY': 4, // Depends on Math, Physics, Chemistry
    'REALITY': 5 // Depends on all
};
/**
 * Domain to Layer mapping
 */
const DOMAIN_LAYER_MAP = {
    // MATH Layer - Pure algorithms
    'chronos': 'MATH',
    'crypto': 'MATH',
    'algorithms': 'MATH',
    'math': 'MATH',
    // PHYSICS Layer - Hardware & threads
    'swarm': 'PHYSICS',
    'performance': 'PHYSICS',
    'queue': 'PHYSICS',
    'workers': 'PHYSICS',
    'physics': 'PHYSICS',
    // CHEMISTRY Layer - Transformations & APIs
    'ghost': 'CHEMISTRY',
    'network': 'CHEMISTRY',
    'api': 'CHEMISTRY',
    'adapters': 'CHEMISTRY',
    'chemistry': 'CHEMISTRY',
    // BIOLOGY Layer - Intelligence & healing
    'oracle': 'BIOLOGY',
    'intelligence': 'BIOLOGY',
    'cognitive': 'BIOLOGY',
    'healing': 'BIOLOGY',
    'security': 'BIOLOGY',
    'biology': 'BIOLOGY',
    // REALITY Layer - Output & manifestation
    'cli': 'REALITY',
    'reporters': 'REALITY',
    'visual': 'REALITY',
    'singularity': 'REALITY',
    'reality': 'REALITY'
};
/**
 * Purpose inference patterns
 */
const PURPOSE_PATTERNS = {
    'ghost': 'Invisibility & Stealth Layer - Zero-detection automation',
    'oracle': 'Autonomous Discovery & Analysis - Site intelligence',
    'chronos': 'Time-Paradox & Predictive Simulation - Future prediction',
    'swarm': 'Parallel Execution Engine - Distributed power',
    'intelligence': 'Neural Backpack & Context - Second brain',
    'security': 'FATALITY Defense System - Predatory protection',
    'cognitive': 'AI Intelligence Core - Neural mapping',
    'healing': 'Self-Healing System - Autonomous recovery',
    'core': 'QAntum Core Engine - Central nervous system',
    'api': 'API Integration Layer - External communication',
    'visual': 'Visual Testing Module - Screenshot comparison',
    'cli': 'Command Line Interface - User interaction',
    'singularity': 'Auto-Optimization Engine - Self-improvement'
};
// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN MAPPER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🔭 DomainMapper - Macro-Lens Orchestration Engine
 */
class DomainMapper extends events_1.EventEmitter {
    config;
    manifests = new Map();
    dependencyGraph = { nodes: [], edges: [], cycles: [] };
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * 🚀 Execute full domain mapping
     */
    // Complexity: O(N) — linear iteration
    async mapProjectDomains() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║   ████████╗██╗  ██╗███████╗    ██████╗  ██████╗ ███╗   ███╗ █████╗ ██╗███╗   ██╗      ║
║   ╚══██╔══╝██║  ██║██╔════╝    ██╔══██╗██╔═══██╗████╗ ████║██╔══██╗██║████╗  ██║      ║
║      ██║   ███████║█████╗      ██║  ██║██║   ██║██╔████╔██║███████║██║██╔██╗ ██║      ║
║      ██║   ██╔══██║██╔══╝      ██║  ██║██║   ██║██║╚██╔╝██║██╔══██║██║██║╚██╗██║      ║
║      ██║   ██║  ██║███████╗    ██████╔╝╚██████╔╝██║ ╚═╝ ██║██║  ██║██║██║ ╚████║      ║
║      ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝      ║
║                                                                                       ║
║                    MACRO-LENS ORCHESTRATION ACTIVATED                                 ║
║                         "Сканираме гората, не дърветата"                              ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        const startTime = Date.now();
        // Phase 1: Discover all domains
        console.log('\n[DomainMapper] 📡 Phase 1: Discovering domains...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const domains = await this.discoverDomains();
        console.log(`  → Found ${domains.length} domains`);
        // Phase 2: Analyze each domain
        console.log('\n[DomainMapper] 🔬 Phase 2: Analyzing domain internals...');
        for (const domain of domains) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const manifest = await this.analyzeDomain(domain);
            this.manifests.set(domain, manifest);
            console.log(`  → ${domain}: ${manifest.fileCount} files, ${manifest.lineCount} lines [${manifest.layer}]`);
        }
        // Phase 3: Build dependency graph
        console.log('\n[DomainMapper] 🕸️ Phase 3: Building dependency graph...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.buildDependencyGraph();
        console.log(`  → ${this.dependencyGraph.edges.length} dependencies found`);
        // Phase 4: Detect violations
        console.log('\n[DomainMapper] 🚨 Phase 4: Detecting architectural violations...');
        const violations = this.detectViolations();
        console.log(`  → ${violations.length} violations detected`);
        // Phase 5: Generate manifests
        if (this.config.generateManifests) {
            console.log('\n[DomainMapper] 📝 Phase 5: Generating domain manifests...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.generateManifests();
            console.log(`  → Generated ${this.manifests.size} .domain.json files`);
        }
        // Phase 6: Generate Big Lens Report
        console.log('\n[DomainMapper] 📊 Phase 6: Generating Big Lens Report...');
        const report = this.generateBigLensReport();
        const duration = Date.now() - startTime;
        console.log(`\n[DomainMapper] ✅ Mapping complete in ${(duration / 1000).toFixed(1)}s`);
        this.printBigLensReport(report);
        return report;
    }
    /**
     * Discover all domains (folders) in src/
     */
    // Complexity: O(N) — linear iteration
    async discoverDomains() {
        const srcPath = path.join(this.config.rootPath, 'src');
        const domains = [];
        if (!fs.existsSync(srcPath)) {
            return domains;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const entries = await fs.promises.readdir(srcPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && !this.config.ignoredPaths.includes(entry.name)) {
                domains.push(entry.name);
            }
        }
        return domains;
    }
    /**
     * Analyze a single domain
     */
    // Complexity: O(1) — amortized
    async analyzeDomain(domainName) {
        const domainPath = path.join(this.config.rootPath, 'src', domainName);
        // Count files and lines
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { fileCount, lineCount } = await this.countDomainStats(domainPath);
        // Determine layer
        const layer = this.inferLayer(domainName);
        // Infer purpose
        const purpose = this.inferPurpose(domainName);
        // Determine criticality
        const criticality = this.inferCriticality(domainName, fileCount);
        // Generate integrity hash
        // SAFETY: async operation — wrap in try-catch for production resilience
        const integrityHash = await this.generateDomainHash(domainPath);
        return {
            domainName,
            layer,
            purpose,
            criticality,
            dependencies: [],
            dependents: [],
            fileCount,
            lineCount,
            healthScore: 100, // Will be calculated later
            integrityHash,
            lastUpdated: new Date().toISOString(),
            violations: []
        };
    }
    /**
     * Count files and lines in a domain
     */
    // Complexity: O(N) — linear iteration
    async countDomainStats(domainPath) {
        let fileCount = 0;
        let lineCount = 0;
        const countRecursive = async (dir) => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await countRecursive(fullPath);
                    }
                    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
                        fileCount++;
                        try {
                            const content = await fs.promises.readFile(fullPath, 'utf-8');
                            lineCount += content.split('\n').length;
                        }
                        catch {
                            // Skip unreadable files
                        }
                    }
                }
            }
            catch {
                // Skip unreadable directories
            }
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await countRecursive(domainPath);
        return { fileCount, lineCount };
    }
    /**
     * Infer the universal layer for a domain
     */
    // Complexity: O(1) — hash/map lookup
    inferLayer(domainName) {
        const lower = domainName.toLowerCase();
        // Check direct mapping
        if (DOMAIN_LAYER_MAP[lower]) {
            return DOMAIN_LAYER_MAP[lower];
        }
        // Pattern matching
        if (lower.includes('math') || lower.includes('algo') || lower.includes('chrono'))
            return 'MATH';
        if (lower.includes('swarm') || lower.includes('thread') || lower.includes('perf'))
            return 'PHYSICS';
        if (lower.includes('ghost') || lower.includes('api') || lower.includes('network'))
            return 'CHEMISTRY';
        if (lower.includes('neural') || lower.includes('heal') || lower.includes('cogn'))
            return 'BIOLOGY';
        if (lower.includes('ui') || lower.includes('report') || lower.includes('cli'))
            return 'REALITY';
        // Default to CHEMISTRY (middle layer)
        return 'CHEMISTRY';
    }
    /**
     * Infer purpose from domain name
     */
    // Complexity: O(1) — hash/map lookup
    inferPurpose(domainName) {
        const lower = domainName.toLowerCase();
        return PURPOSE_PATTERNS[lower] || `${domainName} Module - General functionality`;
    }
    /**
     * Infer criticality based on domain characteristics
     */
    // Complexity: O(1)
    inferCriticality(domainName, fileCount) {
        const lower = domainName.toLowerCase();
        // Supreme criticality domains
        if (['security', 'core', 'intelligence'].includes(lower))
            return 'SUPREME';
        // High criticality domains
        if (['oracle', 'ghost', 'chronos', 'swarm'].includes(lower))
            return 'HIGH';
        // Based on size
        if (fileCount > 10)
            return 'HIGH';
        if (fileCount > 5)
            return 'MEDIUM';
        return 'LOW';
    }
    /**
     * Generate integrity hash for a domain
     */
    // Complexity: O(N log N) — sort operation
    async generateDomainHash(domainPath) {
        const hash = crypto.createHash('sha256');
        const hashRecursive = async (dir) => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                entries.sort((a, b) => a.name.localeCompare(b.name));
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await hashRecursive(fullPath);
                    }
                    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
                        try {
                            const content = await fs.promises.readFile(fullPath, 'utf-8');
                            hash.update(content);
                        }
                        catch {
                            // Skip
                        }
                    }
                }
            }
            catch {
                // Skip
            }
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await hashRecursive(domainPath);
        return hash.digest('hex').substring(0, 16);
    }
    /**
     * Build dependency graph by analyzing imports
     */
    // Complexity: O(N*M) — nested iteration detected
    async buildDependencyGraph() {
        const nodes = [];
        const edges = [];
        const edgeMap = new Map();
        // Create nodes
        for (const [name, manifest] of this.manifests) {
            nodes.push({
                id: name,
                layer: manifest.layer,
                weight: manifest.fileCount * (manifest.criticality === 'SUPREME' ? 4 : manifest.criticality === 'HIGH' ? 3 : manifest.criticality === 'MEDIUM' ? 2 : 1)
            });
        }
        // Analyze imports to create edges
        for (const [domainName] of this.manifests) {
            const domainPath = path.join(this.config.rootPath, 'src', domainName);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const imports = await this.analyzeImports(domainPath);
            for (const [targetDomain, count] of Object.entries(imports)) {
                if (targetDomain !== domainName && this.manifests.has(targetDomain)) {
                    const key = `${domainName}->${targetDomain}`;
                    edgeMap.set(key, (edgeMap.get(key) || 0) + count);
                    // Update dependencies
                    const sourceManifest = this.manifests.get(domainName);
                    const targetManifest = this.manifests.get(targetDomain);
                    if (sourceManifest && !sourceManifest.dependencies.includes(targetDomain)) {
                        sourceManifest.dependencies.push(targetDomain);
                    }
                    if (targetManifest && !targetManifest.dependents.includes(domainName)) {
                        targetManifest.dependents.push(domainName);
                    }
                }
            }
        }
        // Create edges with validation
        for (const [key, strength] of edgeMap) {
            const [source, target] = key.split('->');
            const sourceManifest = this.manifests.get(source);
            const targetManifest = this.manifests.get(target);
            const valid = sourceManifest && targetManifest
                ? LAYER_HIERARCHY[sourceManifest.layer] >= LAYER_HIERARCHY[targetManifest.layer]
                : true;
            edges.push({ source, target, strength, valid });
        }
        // Detect cycles
        const cycles = this.detectCycles(edges);
        this.dependencyGraph = { nodes, edges, cycles };
    }
    /**
     * Analyze imports in a domain
     */
    // Complexity: O(N*M) — nested iteration detected
    async analyzeImports(domainPath) {
        const imports = {};
        const analyzeFile = async (filePath) => {
            try {
                const content = await fs.promises.readFile(filePath, 'utf-8');
                // Match import statements
                const importRegex = /from\s+['"]\.\.\/([^/'"\s]+)/g;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    const importedDomain = match[1];
                    imports[importedDomain] = (imports[importedDomain] || 0) + 1;
                }
            }
            catch {
                // Skip
            }
        };
        const analyzeRecursive = async (dir) => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await analyzeRecursive(fullPath);
                    }
                    else if (entry.name.endsWith('.ts')) {
                        await analyzeFile(fullPath);
                    }
                }
            }
            catch {
                // Skip
            }
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await analyzeRecursive(domainPath);
        return imports;
    }
    /**
     * Detect cycles in dependency graph
     */
    // Complexity: O(N*M) — nested iteration detected
    detectCycles(edges) {
        const cycles = [];
        const adjacency = new Map();
        // Build adjacency list
        for (const edge of edges) {
            if (!adjacency.has(edge.source)) {
                adjacency.set(edge.source, []);
            }
            adjacency.get(edge.source).push(edge.target);
        }
        // DFS for cycle detection
        const visited = new Set();
        const recursionStack = new Set();
        const path = [];
        const dfs = (node) => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const neighbors = adjacency.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (dfs(neighbor))
                        return true;
                }
                else if (recursionStack.has(neighbor)) {
                    // Found cycle
                    const cycleStart = path.indexOf(neighbor);
                    cycles.push(path.slice(cycleStart));
                    return true;
                }
            }
            path.pop();
            recursionStack.delete(node);
            return false;
        };
        for (const node of adjacency.keys()) {
            if (!visited.has(node)) {
                // Complexity: O(1)
                dfs(node);
            }
        }
        return cycles;
    }
    /**
     * Detect architectural violations
     */
    // Complexity: O(N*M) — nested iteration detected
    detectViolations() {
        const violations = [];
        // Check for circular dependencies
        for (const cycle of this.dependencyGraph.cycles) {
            violations.push({
                type: 'CIRCULAR_DEPENDENCY',
                severity: 'CRITICAL',
                message: `Circular dependency detected: ${cycle.join(' -> ')} -> ${cycle[0]}`,
                source: cycle[0],
                target: cycle[cycle.length - 1]
            });
        }
        // Check for layer violations
        for (const edge of this.dependencyGraph.edges) {
            if (!edge.valid) {
                const sourceManifest = this.manifests.get(edge.source);
                const targetManifest = this.manifests.get(edge.target);
                violations.push({
                    type: 'LAYER_VIOLATION',
                    severity: 'ERROR',
                    message: `${edge.source} (${sourceManifest?.layer}) depends on ${edge.target} (${targetManifest?.layer}) - violates causal hierarchy`,
                    source: edge.source,
                    target: edge.target
                });
            }
        }
        // Check for orphan domains
        for (const [name, manifest] of this.manifests) {
            if (manifest.dependencies.length === 0 && manifest.dependents.length === 0 && manifest.fileCount > 0) {
                violations.push({
                    type: 'ORPHAN_DOMAIN',
                    severity: 'WARNING',
                    message: `${name} is isolated - no dependencies or dependents`,
                    source: name
                });
            }
        }
        // Update manifests with violations
        for (const violation of violations) {
            const manifest = this.manifests.get(violation.source);
            if (manifest) {
                manifest.violations.push(violation);
                manifest.healthScore -= violation.severity === 'CRITICAL' ? 30 : violation.severity === 'ERROR' ? 20 : 10;
            }
        }
        return violations;
    }
    /**
     * Generate .domain.json manifests
     */
    // Complexity: O(N*M) — nested iteration detected
    async generateManifests() {
        for (const [domainName, manifest] of this.manifests) {
            const domainPath = path.join(this.config.rootPath, 'src', domainName);
            const manifestPath = path.join(domainPath, '.domain.json');
            try {
                await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
            }
            catch (error) {
                console.error(`  ⚠️ Failed to write manifest for ${domainName}`);
            }
        }
    }
    /**
     * Generate Big Lens Report
     */
    // Complexity: O(N) — linear iteration
    generateBigLensReport() {
        let totalFiles = 0;
        let totalLines = 0;
        let totalHealth = 0;
        const layerDistribution = {
            'MATH': 0,
            'PHYSICS': 0,
            'CHEMISTRY': 0,
            'BIOLOGY': 0,
            'REALITY': 0
        };
        const criticalityMap = {};
        const overloadedDomains = [];
        const optimizedDomains = [];
        const orphanDomains = [];
        const allViolations = [];
        for (const [name, manifest] of this.manifests) {
            totalFiles += manifest.fileCount;
            totalLines += manifest.lineCount;
            totalHealth += manifest.healthScore;
            layerDistribution[manifest.layer]++;
            criticalityMap[name] = manifest.criticality;
            // Overloaded: > 1000 lines or > 10 files
            if (manifest.lineCount > 1000 || manifest.fileCount > 10) {
                overloadedDomains.push(name);
            }
            // Optimized: health 90+
            if (manifest.healthScore >= 90) {
                optimizedDomains.push(name);
            }
            // Orphan
            if (manifest.violations.some(v => v.type === 'ORPHAN_DOMAIN')) {
                orphanDomains.push(name);
            }
            allViolations.push(...manifest.violations);
        }
        const healthScore = this.manifests.size > 0
            ? Math.round(totalHealth / this.manifests.size)
            : 100;
        // Generate recommendations
        const recommendations = [];
        if (allViolations.some(v => v.type === 'CIRCULAR_DEPENDENCY')) {
            recommendations.push('🔴 CRITICAL: Break circular dependencies to ensure clean architecture');
        }
        if (allViolations.some(v => v.type === 'LAYER_VIOLATION')) {
            recommendations.push('🟠 HIGH: Fix layer violations - ensure Math→Physics→Chemistry→Biology→Reality flow');
        }
        if (overloadedDomains.length > 0) {
            recommendations.push(`🟡 MEDIUM: Consider splitting overloaded domains: ${overloadedDomains.join(', ')}`);
        }
        if (orphanDomains.length > 0) {
            recommendations.push(`🟢 LOW: Review orphan domains for integration or removal: ${orphanDomains.join(', ')}`);
        }
        return {
            timestamp: new Date().toISOString(),
            totalDomains: this.manifests.size,
            totalFiles,
            totalLines,
            healthScore,
            layerDistribution,
            criticalityMap,
            overloadedDomains,
            optimizedDomains,
            orphanDomains,
            violations: allViolations,
            recommendations
        };
    }
    /**
     * Print Big Lens Report
     */
    // Complexity: O(N*M) — nested iteration detected
    printBigLensReport(report) {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                         🔭 THE BIG LENS REPORT                                        ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  "Какво виждам в гората?"                                                             ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  📊 MACRO STATISTICS                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────────────    ║
║  Total Domains:    ${report.totalDomains.toString().padEnd(60)}║
║  Total Files:      ${report.totalFiles.toString().padEnd(60)}║
║  Total Lines:      ${report.totalLines.toString().padEnd(60)}║
║  Health Score:     ${report.healthScore}/100${' '.repeat(55)}║
║                                                                                       ║
║  🏛️ UNIVERSAL LAYER DISTRIBUTION                                                      ║
║  ─────────────────────────────────────────────────────────────────────────────────    ║
║  MATH (DNA):       ${report.layerDistribution.MATH.toString().padEnd(60)}║
║  PHYSICS (Body):   ${report.layerDistribution.PHYSICS.toString().padEnd(60)}║
║  CHEMISTRY (React):${report.layerDistribution.CHEMISTRY.toString().padEnd(60)}║
║  BIOLOGY (Org):    ${report.layerDistribution.BIOLOGY.toString().padEnd(60)}║
║  REALITY (Output): ${report.layerDistribution.REALITY.toString().padEnd(60)}║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        // Print violations
        if (report.violations.length > 0) {
            console.log('🚨 ARCHITECTURAL VIOLATIONS:');
            for (const v of report.violations) {
                const icon = v.severity === 'CRITICAL' ? '🔴' : v.severity === 'ERROR' ? '🟠' : '🟡';
                console.log(`  ${icon} [${v.type}] ${v.message}`);
            }
        }
        else {
            console.log('✅ No architectural violations detected!');
        }
        // Print recommendations
        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            for (const rec of report.recommendations) {
                console.log(`  ${rec}`);
            }
        }
        // Print domain status
        console.log('\n📋 DOMAIN STATUS:');
        if (report.overloadedDomains.length > 0) {
            console.log(`  ⚠️ Overloaded: ${report.overloadedDomains.join(', ')}`);
        }
        if (report.optimizedDomains.length > 0) {
            console.log(`  ✅ Optimized: ${report.optimizedDomains.join(', ')}`);
        }
        if (report.orphanDomains.length > 0) {
            console.log(`  🔍 Orphan: ${report.orphanDomains.join(', ')}`);
        }
    }
    /**
     * Get all manifests
     */
    // Complexity: O(1)
    getManifests() {
        return this.manifests;
    }
    /**
     * Get dependency graph
     */
    // Complexity: O(1)
    getDependencyGraph() {
        return this.dependencyGraph;
    }
}
exports.DomainMapper = DomainMapper;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createDomainMapper(config) {
    return new DomainMapper(config);
}
exports.default = DomainMapper;
