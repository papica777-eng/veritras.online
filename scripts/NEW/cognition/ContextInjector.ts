/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║   ██████╗ ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗                                ║
 * ║  ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝                                ║
 * ║  ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║                                   ║
 * ║  ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║                                   ║
 * ║  ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║                                   ║
 * ║   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝                                   ║
 * ║                                                                                               ║
 * ║  ██╗███╗   ██╗     ██╗███████╗ ██████╗████████╗ ██████╗ ██████╗                               ║
 * ║  ██║████╗  ██║     ██║██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗                              ║
 * ║  ██║██╔██╗ ██║     ██║█████╗  ██║        ██║   ██║   ██║██████╔╝                              ║
 * ║  ██║██║╚██╗██║██   ██║██╔══╝  ██║        ██║   ██║   ██║██╔══██╗                              ║
 * ║  ██║██║ ╚████║╚█████╔╝███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║                              ║
 * ║  ╚═╝╚═╝  ╚═══╝ ╚════╝ ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝                              ║
 * ║                                                                                               ║
 * ║                    NEURAL INTEGRATION - AUTOMATIC CONTEXT INJECTION                           ║
 * ║               "Всяка заявка автоматично включва дестилирано знание"                           ║
 * ║                                                                                               ║
 * ║   Features:                                                                                   ║
 * ║     • Auto-inject Distilled Knowledge from cognition/distiller.ts                             ║
 * ║     • Auto-inject Backpack (accumulated wisdom)                                               ║
 * ║     • Project structure awareness                                                             ║
 * ║     • Relevant file discovery                                                                 ║
 * ║                                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                        ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { ContextPayload, ErrorContext, FileContext, TaskType } from '../../physics/NeuralInference';
import { Assimilator, VerificationResult, SymbolRegistry } from '../../scripts/assimilator';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES - Context Injection Interface
// ═══════════════════════════════════════════════════════════════════════════════


/**
 * Backpack content structure
 */
export interface BackpackContent {
    version: string;
    lastUpdated: string;
    
    // Accumulated wisdom
    patterns: LearnedPattern[];
    antiPatterns: AntiPattern[];
    conventions: CodeConvention[];
    
    // Project-specific knowledge
    projectRules: ProjectRule[];
    selectorStrategies: SelectorStrategy[];
    errorSolutions: ErrorSolution[];
    
    // Statistics
    stats: BackpackStats;
}

/**
 * Learned pattern from successful operations
 */
export interface LearnedPattern {
    id: string;
    name: string;
    description: string;
    context: string;
    example: string;
    successRate: number;
    usageCount: number;
    lastUsed: string;
}

/**
 * Anti-pattern to avoid
 */
export interface AntiPattern {
    id: string;
    name: string;
    description: string;
    badExample: string;
    goodExample: string;
    detectedCount: number;
}

/**
 * Code convention
 */
export interface CodeConvention {
    id: string;
    category: string;
    rule: string;
    example: string;
    enforced: boolean;
}

/**
 * Project-specific rule
 */
export interface ProjectRule {
    id: string;
    scope: string;
    rule: string;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Selector strategy
 */
export interface SelectorStrategy {
    priority: number;
    type: 'data-testid' | 'aria' | 'role' | 'text' | 'css' | 'xpath';
    pattern: string;
    example: string;
    reliability: number;
}

/**
 * Error solution from history
 */
export interface ErrorSolution {
    errorPattern: string;
    solution: string;
    successRate: number;
    appliedCount: number;
}

/**
 * Backpack statistics
 */
export interface BackpackStats {
    totalPatterns: number;
    totalAntiPatterns: number;
    totalConventions: number;
    totalSolutions: number;
    learningIterations: number;
    lastLearningDate: string;
}

/**
 * Distilled knowledge summary
 */
export interface DistilledKnowledgeSummary {
    projectName: string;
    version: string;
    timestamp: string;
    
    // Architectural insights
    principles: { name: string; description: string; confidence: number }[];
    layers: { name: string; modules: string[] }[];
    
    // Code statistics
    stats: {
        totalFiles: number;
        totalLines: number;
        languages: Record<string, number>;
    };
    
    // Import graph summary
    dependencies: {
        internal: number;
        external: number;
        circular: string[][];
    };
}

/**
 * Context injection configuration
 */
export interface ContextInjectionConfig {
    maxDistilledPrinciples: number;
    maxBackpackPatterns: number;
    maxRelevantFiles: number;
    maxErrorHistory: number;
    includeProjectStructure: boolean;
    includeConventions: boolean;
    contextBudgetTokens: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ContextInjectionConfig = {
    maxDistilledPrinciples: 15,
    maxBackpackPatterns: 20,
    maxRelevantFiles: 5,
    maxErrorHistory: 3,
    includeProjectStructure: true,
    includeConventions: true,
    contextBudgetTokens: 4000
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT INJECTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ContextInjector - Automatic Knowledge Injection
 * 
 * Automatically enriches every AI request with:
 * - Distilled architectural knowledge
 * - Backpack accumulated wisdom
 * - Relevant file context
 * - Error history for learning
 * - ANTI-HALLUCINATION: Verified symbol registry from Assimilator
 */
export class ContextInjector extends EventEmitter {
    private static instance: ContextInjector;
    
    private config: ContextInjectionConfig;
    private projectRoot: string;
    
    // Cached knowledge
    private distilledKnowledge: DistilledKnowledgeSummary | null = null;
    private backpack: BackpackContent | null = null;
    private projectStructure: string | null = null;
    
    // File index for relevance search
    private fileIndex: Map<string, { path: string; keywords: string[] }> = new Map();
    
    // Error history for learning
    private errorHistory: ErrorContext[] = [];
    
    // 🛡️ ANTI-HALLUCINATION ENGINE
    private assimilator: Assimilator | null = null;
    private symbolRegistry: SymbolRegistry | null = null;

    private constructor(projectRoot: string, config: Partial<ContextInjectionConfig> = {}) {
        super();
        this.projectRoot = projectRoot;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Get singleton instance
     */
    static getInstance(projectRoot?: string, config?: Partial<ContextInjectionConfig>): ContextInjector {
        if (!ContextInjector.instance) {
            ContextInjector.instance = new ContextInjector(
                projectRoot || process.cwd(),
                config
            );
        }
        return ContextInjector.instance;
    }

    /**
     * Initialize the context injector
     */
    // Complexity: O(N)
    async initialize(): Promise<void> {
        console.log('🎒 Initializing Context Injector...');

        // Load distilled knowledge
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.loadDistilledKnowledge();
        console.log('   ✓ Distilled Knowledge loaded');

        // Load backpack
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.loadBackpack();
        console.log('   ✓ Backpack loaded');

        // Build project structure
        if (this.config.includeProjectStructure) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            this.projectStructure = await this.buildProjectStructure();
            console.log('   ✓ Project structure mapped');
        }

        // Index files for relevance search
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.indexFiles();
        console.log(`   ✓ ${this.fileIndex.size} files indexed`);

        // 🛡️ Initialize Anti-Hallucination Engine
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.initializeAssimilator();

        console.log('🎒 Context Injector READY\n');
        this.emit('initialized');
    }

    /**
     * Initialize the Assimilator for anti-hallucination
     */
    // Complexity: O(1)
    private async initializeAssimilator(): Promise<void> {
        try {
            this.assimilator = Assimilator.getInstance({
                targetFolder: path.join(this.projectRoot, 'src'),
                recursive: true,
                tokenBudget: this.config.contextBudgetTokens
            });
            
            const result = await this.assimilator.assimilate();
            this.symbolRegistry = result.registry;
            
            console.log(`   🛡️ Anti-Hallucination Engine: ${result.totalFiles} files, ${this.getRegistrySize()} symbols verified`);
        } catch (error) {
            console.log('   ⚠️ Assimilator not available:', error);
            this.assimilator = null;
        }
    }

    /**
     * Get the size of the symbol registry
     */
    // Complexity: O(1)
    private getRegistrySize(): number {
        if (!this.symbolRegistry) return 0;
        return (
            this.symbolRegistry.classes.size +
            this.symbolRegistry.functions.size +
            this.symbolRegistry.interfaces.size +
            this.symbolRegistry.types.size
        );
    }

    /**
     * 🛡️ ANTI-HALLUCINATION: Verify a symbol exists
     */
    // Complexity: O(1)
    verifySymbol(symbolName: string, expectedType?: string): VerificationResult {
        if (!this.assimilator) {
            return { valid: true, exists: false, suggestions: ['Assimilator not initialized'] };
        }
        return this.assimilator.verify(symbolName, expectedType);
    }

    /**
     * 🛡️ ANTI-HALLUCINATION: Verify imports in generated code
     */
    // Complexity: O(1)
    verifyGeneratedCode(code: string): { valid: boolean; issues: string[] } {
        const issues: string[] = [];
        
        if (!this.assimilator) {
            return { valid: true, issues: ['Assimilator not available'] };
        }

        // Extract imports from code
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]\.\.?[^'"]+['"]/g;
        let match;

        while ((match = importRegex.exec(code)) !== null) {
            const importedSymbols = match[1].split(',').map(s => s.trim().split(' as ')[0]);
            
            for (const symbol of importedSymbols) {
                const result = this.assimilator.verify(symbol);
                if (!result.valid) {
                    issues.push(`Import '${symbol}' does not exist in codebase${result.suggestions ? ` - ${result.suggestions[0]}` : ''}`);
                }
            }
        }

        // Extract class references
        const classRegex = /new\s+(\w+)\s*\(/g;
        while ((match = classRegex.exec(code)) !== null) {
            const className = match[1];
            // Skip built-in classes
            if (['Date', 'Error', 'Promise', 'Map', 'Set', 'Array', 'Object', 'RegExp'].includes(className)) continue;
            
            const result = this.assimilator.verify(className, 'class');
            if (!result.valid && !result.exists) {
                issues.push(`Class '${className}' does not exist${result.suggestions ? ` - ${result.suggestions[0]}` : ''}`);
            }
        }

        return { valid: issues.length === 0, issues };
    }

    /**
     * 🛡️ Get verified context for a query
     */
    // Complexity: O(1)
    getVerifiedContext(query: string, maxTokens: number = 10000): string {
        if (!this.assimilator) return '';
        return this.assimilator.getRelevantContext(query, maxTokens);
    }

    /**
     * Build full context payload for a request
     */
    // Complexity: O(N)
    async buildContext(
        task: TaskType,
        prompt: string,
        additionalContext?: Partial<ContextPayload>
    ): Promise<ContextPayload> {
        const context: ContextPayload = {};

        // 1. Inject distilled knowledge (always)
        if (this.distilledKnowledge) {
            context.distilledKnowledge = this.filterDistilledKnowledge(task);
        }

        // 2. Inject backpack content (always)
        if (this.backpack) {
            context.backpackContent = this.filterBackpackContent(task);
        }

        // 3. Inject project structure (if enabled)
        if (this.config.includeProjectStructure && this.projectStructure) {
            context.projectStructure = this.projectStructure;
        }

        // 4. Find and inject relevant files
        // SAFETY: async operation — wrap in try-catch for production resilience
        const relevantFiles = await this.findRelevantFiles(prompt, task);
        if (relevantFiles.length > 0) {
            context.relevantFiles = relevantFiles;
        }
        
        // 5. 🛡️ ANTI-HALLUCINATION: Add verified symbol context
        if (this.assimilator) {
            const verifiedContext = this.getVerifiedContext(prompt, 5000);
            if (verifiedContext) {
                context.verifiedCodebaseContext = verifiedContext;
            }
        }

        // 5. Inject error history (for bug fixes and self-correction)
        if (task === 'bug-fix' || task === 'selector-repair') {
            context.recentErrors = this.getRecentErrors();
        }

        // 6. Merge any additional context
        if (additionalContext) {
            Object.assign(context, additionalContext);
        }

        this.emit('context:built', { task, contextSize: this.estimateTokens(context) });
        return context;
    }

    /**
     * Record an error for learning
     */
    // Complexity: O(1)
    recordError(error: ErrorContext): void {
        this.errorHistory.unshift(error);
        
        // Keep only recent errors
        if (this.errorHistory.length > this.config.maxErrorHistory * 3) {
            this.errorHistory = this.errorHistory.slice(0, this.config.maxErrorHistory * 3);
        }

        // Update backpack with new error solution if available
        if (error.suggestion) {
            this.addErrorSolution(error);
        }

        this.emit('error:recorded', error);
    }

    /**
     * Add a learned pattern to backpack
     */
    // Complexity: O(1)
    addPattern(pattern: Omit<LearnedPattern, 'id' | 'lastUsed'>): void {
        if (!this.backpack) return;

        const newPattern: LearnedPattern = {
            ...pattern,
            id: `pattern_${Date.now()}`,
            lastUsed: new Date().toISOString()
        };

        this.backpack.patterns.push(newPattern);
        this.backpack.stats.totalPatterns++;
        this.saveBackpack();

        this.emit('pattern:added', newPattern);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // KNOWLEDGE LOADING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Load distilled knowledge from cognition/distiller.ts output
     */
    // Complexity: O(N) — linear iteration
    private async loadDistilledKnowledge(): Promise<void> {
        const knowledgePath = path.join(this.projectRoot, 'data', 'distilled-knowledge.json');
        
        try {
            if (fs.existsSync(knowledgePath)) {
                const raw = fs.readFileSync(knowledgePath, 'utf-8');
                const knowledge = JSON.parse(raw);
                
                this.distilledKnowledge = {
                    projectName: knowledge.projectName || 'QAntum',
                    version: knowledge.version || '1.0.0',
                    timestamp: knowledge.timestamp || new Date().toISOString(),
                    principles: (knowledge.principles || []).map((p: any) => ({
                        name: p.name,
                        description: p.description,
                        confidence: p.confidence || 0.8
                    })),
                    layers: knowledge.layers || [],
                    stats: knowledge.statistics || { totalFiles: 0, totalLines: 0, languages: {} },
                    dependencies: {
                        internal: knowledge.importGraph?.nodeCount || 0,
                        external: 0,
                        circular: knowledge.importGraph?.cycles || []
                    }
                };
            } else {
                // Create default distilled knowledge
                this.distilledKnowledge = this.createDefaultDistilledKnowledge();
            }
        } catch (error) {
            console.warn('⚠️ Could not load distilled knowledge, using defaults');
            this.distilledKnowledge = this.createDefaultDistilledKnowledge();
        }
    }

    /**
     * Create default distilled knowledge
     */
    // Complexity: O(N*M) — nested iteration detected
    private createDefaultDistilledKnowledge(): DistilledKnowledgeSummary {
        return {
            projectName: 'QAntum Prime',
            version: '28.4.0',
            timestamp: new Date().toISOString(),
            principles: [
                { name: 'Layered Architecture', description: 'Organize code in distinct layers: Foundation, Infrastructure, Domain, Intelligence, Synthesis, Presentation, Business', confidence: 0.95 },
                { name: 'Singleton Pattern', description: 'Use singletons for service classes that need single instance (getInstance pattern)', confidence: 0.9 },
                { name: 'Event-Driven', description: 'Extend EventEmitter for observable modules', confidence: 0.85 },
                { name: 'Type Safety', description: 'Define explicit TypeScript interfaces for all data structures', confidence: 0.95 },
                { name: 'Barrel Exports', description: 'Use index.ts files for clean module exports', confidence: 0.9 }
            ],
            layers: [
                { name: 'Foundation', modules: ['core', 'types', 'utils'] },
                { name: 'Infrastructure', modules: ['storage', 'events', 'config'] },
                { name: 'Domain', modules: ['validation', 'api', 'security'] },
                { name: 'Intelligence', modules: ['ai', 'cognition', 'oracle'] }
            ],
            stats: { totalFiles: 135, totalLines: 79290, languages: { typescript: 135 } },
            dependencies: { internal: 34, external: 10, circular: [] }
        };
    }

    /**
     * Load backpack content
     */
    // Complexity: O(1)
    private async loadBackpack(): Promise<void> {
        const backpackPath = path.join(this.projectRoot, 'data', 'backpack.json');
        
        try {
            if (fs.existsSync(backpackPath)) {
                const raw = fs.readFileSync(backpackPath, 'utf-8');
                this.backpack = JSON.parse(raw);
            } else {
                this.backpack = this.createDefaultBackpack();
                this.saveBackpack();
            }
        } catch (error) {
            console.warn('⚠️ Could not load backpack, using defaults');
            this.backpack = this.createDefaultBackpack();
        }
    }

    /**
     * Create default backpack
     */
    // Complexity: O(N*M) — nested iteration detected
    private createDefaultBackpack(): BackpackContent {
        return {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            patterns: [
                {
                    id: 'pattern_001',
                    name: 'Data-TestId First',
                    description: 'Always prefer data-testid attributes for selectors',
                    context: 'selector-repair',
                    example: '[data-testid="submit-button"]',
                    successRate: 0.95,
                    usageCount: 100,
                    lastUsed: new Date().toISOString()
                },
                {
                    id: 'pattern_002',
                    name: 'Async/Await Pattern',
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    description: 'Use async/await over .then() chains',
                    context: 'logic-refactor',
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    example: 'const result = await fetchData();',
                    successRate: 0.92,
                    usageCount: 85,
                    lastUsed: new Date().toISOString()
                }
            ],
            antiPatterns: [
                {
                    id: 'anti_001',
                    name: 'Positional Selectors',
                    description: 'Avoid nth-child, nth-of-type for dynamic content',
                    badExample: 'div:nth-child(3) > span',
                    goodExample: '[data-testid="item-3"]',
                    detectedCount: 15
                }
            ],
            conventions: [
                {
                    id: 'conv_001',
                    category: 'naming',
                    rule: 'Use PascalCase for classes, camelCase for methods',
                    example: 'class BrainRouter { executeTask() }',
                    enforced: true
                },
                {
                    id: 'conv_002',
                    category: 'exports',
                    rule: 'Export singleton getter alongside class',
                    example: 'export const getBrainRouter = () => BrainRouter.getInstance()',
                    enforced: true
                }
            ],
            projectRules: [
                {
                    id: 'rule_001',
                    scope: 'global',
                    rule: 'All modules must extend EventEmitter for observability',
                    reason: 'Enables event-driven architecture and debugging',
                    priority: 'high'
                }
            ],
            selectorStrategies: [
                { priority: 1, type: 'data-testid', pattern: '[data-testid="..."]', example: '[data-testid="login-btn"]', reliability: 0.98 },
                { priority: 2, type: 'aria', pattern: '[aria-label="..."]', example: '[aria-label="Submit form"]', reliability: 0.95 },
                { priority: 3, type: 'role', pattern: '[role="..."]', example: '[role="button"]', reliability: 0.90 },
                { priority: 4, type: 'text', pattern: 'text="..."', example: 'text="Sign In"', reliability: 0.85 },
                { priority: 5, type: 'css', pattern: '.class-name', example: '.btn-primary', reliability: 0.70 }
            ],
            errorSolutions: [],
            stats: {
                totalPatterns: 2,
                totalAntiPatterns: 1,
                totalConventions: 2,
                totalSolutions: 0,
                learningIterations: 1,
                lastLearningDate: new Date().toISOString()
            }
        };
    }

    /**
     * Save backpack to disk
     */
    // Complexity: O(1)
    private saveBackpack(): void {
        if (!this.backpack) return;
        
        const backpackPath = path.join(this.projectRoot, 'data', 'backpack.json');
        const dataDir = path.dirname(backpackPath);
        
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        this.backpack.lastUpdated = new Date().toISOString();
        fs.writeFileSync(backpackPath, JSON.stringify(this.backpack, null, 2));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTEXT FILTERING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Filter distilled knowledge based on task
     */
    // Complexity: O(N log N) — sort operation
    private filterDistilledKnowledge(task: TaskType): any {
        if (!this.distilledKnowledge) return null;

        // Get most relevant principles for the task
        const principles = this.distilledKnowledge.principles
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, this.config.maxDistilledPrinciples);

        return {
            projectName: this.distilledKnowledge.projectName,
            principles,
            stats: this.distilledKnowledge.stats
        };
    }

    /**
     * Filter backpack content based on task
     */
    // Complexity: O(N log N) — sort operation
    private filterBackpackContent(task: TaskType): any {
        if (!this.backpack) return null;

        // Get patterns relevant to task
        const patterns = this.backpack.patterns
            .filter(p => !p.context || p.context === task)
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, this.config.maxBackpackPatterns);

        // Get selector strategies for selector tasks
        const selectorStrategies = task === 'selector-repair' 
            ? this.backpack.selectorStrategies 
            : undefined;

        // Get conventions if enabled
        const conventions = this.config.includeConventions
            ? this.backpack.conventions.filter(c => c.enforced)
            : undefined;

        return {
            patterns,
            antiPatterns: this.backpack.antiPatterns.slice(0, 5),
            conventions,
            selectorStrategies
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FILE RELEVANCE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build project structure string
     */
    // Complexity: O(N) — linear iteration
    private async buildProjectStructure(): Promise<string> {
        const srcDir = path.join(this.projectRoot, 'src');
        if (!fs.existsSync(srcDir)) return '';

        const structure: string[] = ['Project Structure:', ''];
        
        const scanDir = (dir: string, prefix: string = '') => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.name.startsWith('.')) continue;
                
                if (entry.isDirectory()) {
                    structure.push(`${prefix}📁 ${entry.name}/`);
                    // Complexity: O(1)
                    scanDir(path.join(dir, entry.name), prefix + '  ');
                } else if (entry.name.endsWith('.ts')) {
                    structure.push(`${prefix}📄 ${entry.name}`);
                }
            }
        };

        // Complexity: O(1)
        scanDir(srcDir);
        return structure.join('\n');
    }

    /**
     * Index files for relevance search
     */
    // Complexity: O(N) — linear iteration
    private async indexFiles(): Promise<void> {
        const srcDir = path.join(this.projectRoot, 'src');
        if (!fs.existsSync(srcDir)) return;

        const indexDir = (dir: string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    // Complexity: O(1)
                    indexDir(fullPath);
                } else if (entry.name.endsWith('.ts')) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf-8');
                        const keywords = this.extractKeywords(content);
                        this.fileIndex.set(fullPath, { path: fullPath, keywords });
                    } catch {
                        // Skip unreadable files
                    }
                }
            }
        };

        // Complexity: O(1)
        indexDir(srcDir);
    }

    /**
     * Extract keywords from file content
     */
    // Complexity: O(N*M) — nested iteration detected
    private extractKeywords(content: string): string[] {
        const keywords: Set<string> = new Set();

        // Extract class names
        const classMatches = content.matchAll(/class\s+(\w+)/g);
        for (const match of classMatches) {
            keywords.add(match[1].toLowerCase());
        }

        // Extract function names
        const funcMatches = content.matchAll(/(?:function|async)\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s*)?\(/g);
        for (const match of funcMatches) {
            const name = match[1] || match[2];
            if (name && name.length > 2) {
                keywords.add(name.toLowerCase());
            }
        }

        // Extract interface names
        const interfaceMatches = content.matchAll(/interface\s+(\w+)/g);
        for (const match of interfaceMatches) {
            keywords.add(match[1].toLowerCase());
        }

        // Extract type names
        const typeMatches = content.matchAll(/type\s+(\w+)/g);
        for (const match of typeMatches) {
            keywords.add(match[1].toLowerCase());
        }

        return Array.from(keywords);
    }

    /**
     * Find relevant files based on prompt
     */
    // Complexity: O(N*M) — nested iteration detected
    private async findRelevantFiles(prompt: string, task: TaskType): Promise<FileContext[]> {
        const promptLower = prompt.toLowerCase();
        const promptWords = promptLower.split(/\W+/).filter(w => w.length > 2);
        
        const scores: { path: string; score: number }[] = [];

        for (const [filePath, index] of this.fileIndex) {
            let score = 0;
            
            // Check keyword matches
            for (const word of promptWords) {
                if (index.keywords.includes(word)) {
                    score += 10;
                }
                if (index.keywords.some(k => k.includes(word))) {
                    score += 5;
                }
            }

            // Boost files in relevant directories
            if (task === 'selector-repair' && filePath.includes('/visual')) score += 20;
            if (task === 'logic-refactor' && filePath.includes('/core')) score += 20;
            if (task === 'security-audit' && filePath.includes('/security')) score += 30;
            if (task === 'test-generation' && filePath.includes('/tests')) score += 25;

            if (score > 0) {
                scores.push({ path: filePath, score });
            }
        }

        // Sort by score and take top N
        const topFiles = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, this.config.maxRelevantFiles);

        // Read file contents
        const relevantFiles: FileContext[] = [];
        
        for (const { path: filePath, score } of topFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const relativePath = path.relative(this.projectRoot, filePath);
                
                relevantFiles.push({
                    path: relativePath,
                    content: content.slice(0, 3000), // Limit content size
                    language: 'typescript',
                    relevance: score / 100
                });
            } catch {
                // Skip unreadable files
            }
        }

        return relevantFiles;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERROR HANDLING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get recent errors for context
     */
    // Complexity: O(1)
    private getRecentErrors(): ErrorContext[] {
        return this.errorHistory.slice(0, this.config.maxErrorHistory);
    }

    /**
     * Add error solution to backpack
     */
    // Complexity: O(N) — linear iteration
    private addErrorSolution(error: ErrorContext): void {
        if (!this.backpack || !error.suggestion) return;

        const existing = this.backpack.errorSolutions.find(
            s => s.errorPattern === error.error
        );

        if (existing) {
            existing.appliedCount++;
        } else {
            this.backpack.errorSolutions.push({
                errorPattern: error.error,
                solution: error.suggestion,
                successRate: 0.8,
                appliedCount: 1
            });
            this.backpack.stats.totalSolutions++;
        }

        this.saveBackpack();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Estimate token count for context
     */
    // Complexity: O(1)
    private estimateTokens(context: ContextPayload): number {
        const json = JSON.stringify(context);
        return Math.ceil(json.length / 4);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get current distilled knowledge
     */
    // Complexity: O(1)
    getDistilledKnowledge(): DistilledKnowledgeSummary | null {
        return this.distilledKnowledge;
    }

    /**
     * Get current backpack
     */
    // Complexity: O(1)
    getBackpack(): BackpackContent | null {
        return this.backpack;
    }

    /**
     * Get configuration
     */
    // Complexity: O(1)
    getConfig(): ContextInjectionConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    // Complexity: O(1)
    updateConfig(updates: Partial<ContextInjectionConfig>): void {
        this.config = { ...this.config, ...updates };
    }

    /**
     * Get error history
     */
    // Complexity: O(1)
    getErrorHistory(): ErrorContext[] {
        return [...this.errorHistory];
    }

    /**
     * Clear error history
     */
    // Complexity: O(1)
    clearErrorHistory(): void {
        this.errorHistory = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getContextInjector = (
    projectRoot?: string,
    config?: Partial<ContextInjectionConfig>
) => ContextInjector.getInstance(projectRoot, config);

export default ContextInjector;
