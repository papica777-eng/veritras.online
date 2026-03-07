/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║   ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗     ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗          ║
 * ║  ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗    ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝          ║
 * ║  ██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝    ██║ █╗ ██║██║   ██║██████╔╝█████╔╝           ║
 * ║  ██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝     ██║███╗██║██║   ██║██╔══██╗██╔═██╗           ║
 * ║  ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║         ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗          ║
 * ║   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝          ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝          ║
 * ║                                                                                               ║
 * ║                      WORKPLACE GROUPING ENGINE                                                ║
 * ║              "Фокус = Памет. Памет = Точност. Точност = Успех."                              ║
 * ║                                                                                               ║
 * ║   QAntum Prime v28.1.0 SUPREME | 1,076,274 Lines | Memory Protection System                  ║
 * ║                                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                     ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ModuleFocus {
    name: string;
    primaryContext: string;
    dependencies: string[];
    interfaces: string[];
    estimatedLines: number;
    layer: number;
    layerName: string;
}

interface AgentFocusConfig {
    version: string;
    timestamp: string;
    activeModule: string;
    primaryContext: string;
    dependencies: string[];
    readOnlyMap: string;
    enforceAstOnLargeFiles: boolean;
    maxContextLines: number;
    symbolRegistryPath: string;
    rules: string[];
}

interface CursorRules {
    moduleName: string;
    layer: number;
    layerName: string;
    allowedImports: string[];
    forbiddenImports: string[];
    keyInterfaces: string[];
    contextBudget: number;
    validationRequired: boolean;
}

interface SymbolRegistry {
    classes: Record<string, string>;
    functions: Record<string, string>;
    interfaces: Record<string, string>;
    types: Record<string, string>;
    constants: Record<string, string>;
}

interface MeditationResult {
    assimilation: {
        totalFiles: number;
        totalLines: number;
        totalSymbols: number;
    };
    registry: SymbolRegistry;
    healthScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5-LAYER ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════

const LAYER_HIERARCHY: Record<string, number> = {
    // Layer 1: Mathematics (Foundation)
    'math': 1,
    
    // Layer 2: Physics (Hardware)
    'physics': 2,
    
    // Layer 3: Chemistry (Reactions/APIs)
    'chemistry': 3,
    'api': 3,
    'security': 3,
    
    // Layer 4: Biology (Organic/Evolution)
    'biology': 4,
    'cognition': 4,
    'ghost': 4,
    
    // Layer 5: Reality (External World)
    'reality': 5,
    'economy': 5,
    'sales': 5,
    'saas': 5,
    'swarm': 5,
    'oracle': 5,
    'dashboard': 5,
};

const LAYER_NAMES: Record<number, string> = {
    1: 'MATHEMATICS',
    2: 'PHYSICS',
    3: 'CHEMISTRY',
    4: 'BIOLOGY',
    5: 'REALITY'
};

// Module dependencies based on layer rules (can only import from lower layers)
const MODULE_DEPENDENCIES: Record<string, string[]> = {
    // Layer 1 - No dependencies
    'math': [],
    
    // Layer 2 - Can import from Layer 1
    'physics': ['math'],
    
    // Layer 3 - Can import from Layers 1-2
    'chemistry': ['math', 'physics'],
    'api': ['math', 'physics'],
    'security': ['math', 'physics'],
    
    // Layer 4 - Can import from Layers 1-3
    'biology': ['math', 'physics', 'chemistry', 'security'],
    'cognition': ['math', 'physics', 'chemistry'],
    'ghost': ['math', 'physics', 'chemistry', 'security'],
    
    // Layer 5 - Can import from all lower layers
    'reality': ['math', 'physics', 'chemistry', 'biology', 'cognition', 'security'],
    'economy': ['math', 'physics', 'chemistry', 'biology', 'security'],
    'sales': ['math', 'chemistry', 'biology', 'security'],
    'saas': ['math', 'chemistry', 'biology', 'security', 'economy'],
    'swarm': ['math', 'physics', 'chemistry', 'biology', 'cognition'],
    'oracle': ['math', 'physics', 'chemistry', 'biology', 'cognition', 'ghost'],
    'dashboard': ['math', 'biology', 'economy', 'swarm'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// WORKPLACE GROUPER
// ═══════════════════════════════════════════════════════════════════════════════

class WorkplaceGrouper {
    private static instance: WorkplaceGrouper;
    private projectRoot: string;
    private registry: SymbolRegistry | null = null;
    private meditationResult: MeditationResult | null = null;
    
    private constructor() {
        this.projectRoot = process.cwd();
        this.loadRegistry();
    }
    
    static getInstance(): WorkplaceGrouper {
        if (!WorkplaceGrouper.instance) {
            WorkplaceGrouper.instance = new WorkplaceGrouper();
        }
        return WorkplaceGrouper.instance;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // REGISTRY LOADING
    // ═══════════════════════════════════════════════════════════════════════════
    
    private loadRegistry(): void {
        const meditationPath = join(this.projectRoot, 'data/supreme-meditation/meditation-result.json');
        
        if (existsSync(meditationPath)) {
            try {
                const content = readFileSync(meditationPath, 'utf-8');
                this.meditationResult = JSON.parse(content);
                this.registry = this.meditationResult?.registry || null;
                console.log('✅ Loaded Symbol Registry from meditation-result.json');
                console.log(`   📊 ${this.meditationResult?.assimilation.totalSymbols || 0} symbols indexed`);
            } catch (error) {
                console.warn('⚠️ Could not load meditation result, will scan directories');
            }
        } else {
            console.warn('⚠️ meditation-result.json not found. Run supreme-meditation.ts first.');
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // MODULE ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    
    private getModuleInfo(moduleName: string): ModuleFocus {
        const layer = LAYER_HIERARCHY[moduleName] || 5;
        const layerName = LAYER_NAMES[layer] || 'UNKNOWN';
        const dependencies = MODULE_DEPENDENCIES[moduleName] || [];
        
        // Get interfaces from registry
        const interfaces: string[] = [];
        if (this.registry) {
            for (const [name, path] of Object.entries(this.registry.interfaces || {})) {
                if (path.includes(`/${moduleName}/`) || path.includes(`\\${moduleName}\\`)) {
                    interfaces.push(name);
                }
            }
        }
        
        // Estimate lines
        const modulePath = join(this.projectRoot, 'src', moduleName);
        const estimatedLines = this.countModuleLines(modulePath);
        
        return {
            name: moduleName,
            primaryContext: `./src/${moduleName}`,
            dependencies,
            interfaces,
            estimatedLines,
            layer,
            layerName
        };
    }
    
    private countModuleLines(modulePath: string): number {
        if (!existsSync(modulePath)) return 0;
        
        let totalLines = 0;
        const countDir = (dir: string) => {
            try {
                const entries = readdirSync(dir);
                for (const entry of entries) {
                    const fullPath = join(dir, entry);
                    const stat = statSync(fullPath);
                    if (stat.isDirectory()) {
                        countDir(fullPath);
                    } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
                        try {
                            const content = readFileSync(fullPath, 'utf-8');
                            totalLines += content.split('\n').length;
                        } catch {}
                    }
                }
            } catch {}
        };
        countDir(modulePath);
        return totalLines;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // AGENT FOCUS GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    setAgentFocus(moduleName: string): AgentFocusConfig {
        const moduleInfo = this.getModuleInfo(moduleName);
        
        const focusConfig: AgentFocusConfig = {
            version: '28.1.0-SUPREME',
            timestamp: new Date().toISOString(),
            activeModule: moduleName,
            primaryContext: moduleInfo.primaryContext,
            dependencies: moduleInfo.dependencies.map(dep => `./src/${dep}`),
            readOnlyMap: './data/supreme-meditation/meditation-result.json',
            enforceAstOnLargeFiles: true,
            maxContextLines: 15000,
            symbolRegistryPath: './data/supreme-meditation/meditation-result.json',
            rules: [
                `🎯 FOCUS: ${moduleName} (Layer ${moduleInfo.layer}: ${moduleInfo.layerName})`,
                `📦 PRIMARY: ${moduleInfo.primaryContext} (~${moduleInfo.estimatedLines} lines)`,
                `🔗 DEPENDENCIES: ${moduleInfo.dependencies.join(', ') || 'none'}`,
                `⛔ FORBIDDEN: Imports from higher layers (${this.getForbiddenLayers(moduleInfo.layer)})`,
                `✅ Assimilator First: Run scripts/assimilator.ts before any change`,
                `✅ Context Anchoring: Stay within ${moduleName} unless symbol missing`,
                `✅ Memory Grouping: Use AST skeleton for adjacent modules`,
                `✅ Validation: Run verifyGeneratedCode() after every change`,
                `🛡️ If symbol not in registry = HALLUCINATION → fix immediately`
            ]
        };
        
        // Save focus config
        writeFileSync(
            join(this.projectRoot, '.agent-focus.json'),
            JSON.stringify(focusConfig, null, 2)
        );
        
        console.log(`\n🛡️ Workplace групиран около модул: ${moduleName}`);
        console.log(`   📍 Layer: ${moduleInfo.layer} (${moduleInfo.layerName})`);
        console.log(`   📊 Lines: ~${moduleInfo.estimatedLines}`);
        console.log(`   🔗 Dependencies: ${moduleInfo.dependencies.length}`);
        console.log(`   🎯 Interfaces: ${moduleInfo.interfaces.length}`);
        console.log(`\n✅ Паметта на агента е защитена.`);
        
        return focusConfig;
    }
    
    private getForbiddenLayers(currentLayer: number): string {
        const forbidden: string[] = [];
        for (const [module, layer] of Object.entries(LAYER_HIERARCHY)) {
            if (layer > currentLayer) {
                forbidden.push(module);
            }
        }
        return forbidden.join(', ') || 'none';
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CURSORRULES GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    generateCursorRules(moduleName: string): CursorRules {
        const moduleInfo = this.getModuleInfo(moduleName);
        
        // Allowed imports = dependencies + same layer
        const allowedImports = [...moduleInfo.dependencies];
        
        // Forbidden imports = higher layers
        const forbiddenImports: string[] = [];
        for (const [mod, layer] of Object.entries(LAYER_HIERARCHY)) {
            if (layer > moduleInfo.layer && mod !== moduleName) {
                forbiddenImports.push(mod);
            }
        }
        
        return {
            moduleName,
            layer: moduleInfo.layer,
            layerName: moduleInfo.layerName,
            allowedImports,
            forbiddenImports,
            keyInterfaces: moduleInfo.interfaces.slice(0, 20), // Top 20
            contextBudget: Math.min(moduleInfo.estimatedLines + 5000, 15000),
            validationRequired: true
        };
    }
    
    generateAllCursorRules(): void {
        const srcPath = join(this.projectRoot, 'src');
        if (!existsSync(srcPath)) {
            console.error('❌ src/ directory not found');
            return;
        }
        
        const modules = readdirSync(srcPath).filter(name => {
            const fullPath = join(srcPath, name);
            return statSync(fullPath).isDirectory();
        });
        
        console.log('\n📝 Generating .cursorrules for all modules...\n');
        
        for (const moduleName of modules) {
            this.generateModuleCursorRules(moduleName);
        }
        
        // Generate root .cursorrules
        this.generateRootCursorRules(modules);
        
        console.log(`\n✅ Generated .cursorrules for ${modules.length} modules + root`);
    }
    
    private generateModuleCursorRules(moduleName: string): void {
        const rules = this.generateCursorRules(moduleName);
        const modulePath = join(this.projectRoot, 'src', moduleName);
        
        if (!existsSync(modulePath)) return;
        
        const content = `# 🎯 QANTUM PRIME - ${moduleName.toUpperCase()} MODULE RULES
# Layer ${rules.layer}: ${rules.layerName}
# Auto-generated by group-workplace.ts
# DO NOT EDIT MANUALLY

## 📋 MODULE INFO
- Name: ${rules.moduleName}
- Layer: ${rules.layer} (${rules.layerName})
- Context Budget: ${rules.contextBudget} lines

## ✅ ALLOWED IMPORTS (Lower Layers)
${rules.allowedImports.map(m => `- src/${m}/*`).join('\n') || '- (none - this is Layer 1)'}

## ⛔ FORBIDDEN IMPORTS (Higher Layers)
${rules.forbiddenImports.map(m => `- src/${m}/* ❌ LAYER VIOLATION`).join('\n') || '- (none - this is Layer 5)'}

## 🔑 KEY INTERFACES
${rules.keyInterfaces.map(i => `- ${i}`).join('\n') || '- (scan with assimilator)'}

## 📜 MANDATORY RULES

1. **Assimilator First**
   Before ANY edit, run:
   \`\`\`
   npx tsx scripts/assimilator.ts ./src/${moduleName}
   \`\`\`

2. **Symbol Verification**
   If you reference a symbol, verify it exists:
   \`\`\`typescript
   assimilator.verify('SymbolName') // Must return true
   \`\`\`

3. **Context Anchoring**
   - Stay within ./src/${moduleName}
   - Only expand to dependencies if symbol missing
   - Use AST skeleton for adjacent modules

4. **Validation Required**
   After EVERY change:
   \`\`\`typescript
   assimilator.verifyGeneratedCode(newCode)
   \`\`\`

5. **Hallucination Detection**
   - If symbol NOT in registry = YOU ARE HALLUCINATING
   - Fix immediately or ask for clarification
   - Never invent imports, classes, or methods

## 🛡️ MEMORY PROTECTION
- Max context: ${rules.contextBudget} lines
- Use meditation-result.json for O(1) symbol lookup
- Group by function, not by file
`;

        writeFileSync(join(modulePath, '.cursorrules'), content);
        console.log(`   ✅ src/${moduleName}/.cursorrules`);
    }
    
    private generateRootCursorRules(modules: string[]): void {
        const totalSymbols = this.meditationResult?.assimilation.totalSymbols || 0;
        const totalLines = this.meditationResult?.assimilation.totalLines || 0;
        
        const content = `# 🧠 QANTUM PRIME v28.1.0 SUPREME - ROOT RULES
# 1,076,274 Lines | ${modules.length} Modules | ${totalSymbols} Symbols
# Auto-generated by group-workplace.ts

## 🏛️ EMPIRE STRUCTURE

\`\`\`
MisteMind/     (704,116 lines) - Core Engine
MrMindQATool/  (366,435 lines) - QA Framework  
MisterMindPage/  (5,723 lines) - Landing Page
───────────────────────────────────────────
TOTAL:       1,076,274 lines
\`\`\`

## 🏗️ 5-LAYER ARCHITECTURE

\`\`\`
Layer 5 (REALITY):   reality, economy, sales, swarm, oracle, dashboard
Layer 4 (BIOLOGY):   biology, cognition, ghost
Layer 3 (CHEMISTRY): chemistry, api, security
Layer 2 (PHYSICS):   physics
Layer 1 (MATH):      math
\`\`\`

**RULE:** Higher layers can import from lower layers. NEVER the reverse.

## 📋 AVAILABLE MODULES
${modules.map(m => {
    const info = this.getModuleInfo(m);
    return `- **${m}** (Layer ${info.layer}: ${info.layerName}) ~${info.estimatedLines} lines`;
}).join('\n')}

## 🛡️ MANDATORY WORKFLOW

### Before ANY Code Change:
\`\`\`bash
# 1. Set agent focus to target module
npx tsx scripts/group-workplace.ts focus <module>

# 2. Load symbol registry
npx tsx scripts/assimilator.ts ./src/<module>
\`\`\`

### During Editing:
\`\`\`typescript
// Verify symbols exist before using
const assimilator = getAssimilator();
if (!assimilator.verify('ClassName')) {
    // HALLUCINATION DETECTED - do not proceed
}
\`\`\`

### After EVERY Change:
\`\`\`typescript
// Validate generated code
const result = assimilator.verifyGeneratedCode(code);
if (!result.valid) {
    // Fix errors immediately
}
\`\`\`

## 🎯 QUICK COMMANDS

| Command | Description |
|---------|-------------|
| \`npx tsx scripts/group-workplace.ts focus biology\` | Focus on biology module |
| \`npx tsx scripts/group-workplace.ts rules\` | Generate all .cursorrules |
| \`npx tsx scripts/assimilator.ts ./src\` | Full codebase scan |
| \`npx tsx scripts/supreme-meditation.ts\` | Complete system audit |

## ⚠️ HALLUCINATION PREVENTION

1. **Never invent** imports, classes, or methods
2. **Always verify** symbols in registry before use
3. **If unsure** - ask, don't guess
4. **Registry = Truth** - meditation-result.json is the source of truth

## 📊 SYMBOL REGISTRY

- Location: \`data/supreme-meditation/meditation-result.json\`
- Classes: ${Object.keys(this.registry?.classes || {}).length}
- Functions: ${Object.keys(this.registry?.functions || {}).length}
- Interfaces: ${Object.keys(this.registry?.interfaces || {}).length}
- Types: ${Object.keys(this.registry?.types || {}).length}
- Constants: ${Object.keys(this.registry?.constants || {}).length}

**O(1) Lookup** - No need to scan files, just query the registry!
`;

        writeFileSync(join(this.projectRoot, '.cursorrules'), content);
        console.log(`   ✅ .cursorrules (root)`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SKELETON MODE
    // ═══════════════════════════════════════════════════════════════════════════
    
    generateSkeleton(moduleName: string): string {
        const moduleInfo = this.getModuleInfo(moduleName);
        const skeleton: string[] = [
            `// ═══════════════════════════════════════════════════════════════`,
            `// AST SKELETON: ${moduleName} (Layer ${moduleInfo.layer}: ${moduleInfo.layerName})`,
            `// Lines: ~${moduleInfo.estimatedLines} | Dependencies: ${moduleInfo.dependencies.length}`,
            `// ═══════════════════════════════════════════════════════════════`,
            ``
        ];
        
        if (this.registry) {
            // Add classes
            const classes = Object.entries(this.registry.classes || {})
                .filter(([_, path]) => path.includes(`/${moduleName}/`))
                .map(([name]) => name);
            
            if (classes.length > 0) {
                skeleton.push(`// CLASSES (${classes.length}):`);
                classes.forEach(c => skeleton.push(`//   class ${c} { ... }`));
                skeleton.push('');
            }
            
            // Add interfaces
            const interfaces = Object.entries(this.registry.interfaces || {})
                .filter(([_, path]) => path.includes(`/${moduleName}/`))
                .map(([name]) => name);
            
            if (interfaces.length > 0) {
                skeleton.push(`// INTERFACES (${interfaces.length}):`);
                interfaces.forEach(i => skeleton.push(`//   interface ${i} { ... }`));
                skeleton.push('');
            }
            
            // Add functions
            const functions = Object.entries(this.registry.functions || {})
                .filter(([_, path]) => path.includes(`/${moduleName}/`))
                .map(([name]) => name);
            
            if (functions.length > 0) {
                skeleton.push(`// FUNCTIONS (${functions.length}):`);
                functions.slice(0, 20).forEach(f => skeleton.push(`//   function ${f}() { ... }`));
                if (functions.length > 20) {
                    skeleton.push(`//   ... and ${functions.length - 20} more`);
                }
            }
        }
        
        return skeleton.join('\n');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WORKSPACE JSON
    // ═══════════════════════════════════════════════════════════════════════════
    
    generateWorkspaceConfig(): void {
        const config = {
            "folders": [
                { "path": ".", "name": "MisteMind (Core)" },
                { "path": "../MrMindQATool", "name": "MrMindQATool (QA)" },
                { "path": "../MisterMindPage", "name": "MisterMindPage (Web)" }
            ],
            "settings": {
                "files.exclude": {
                    "**/node_modules": true,
                    "**/dist": true,
                    "**/.git": true
                },
                "search.exclude": {
                    "**/node_modules": true,
                    "**/dist": true,
                    "**/data/supreme-meditation": false // Keep searchable
                },
                "typescript.preferences.importModuleSpecifier": "relative"
            },
            "extensions": {
                "recommendations": [
                    "dbaeumer.vscode-eslint",
                    "esbenp.prettier-vscode"
                ]
            }
        };
        
        writeFileSync(
            join(this.projectRoot, 'qantum-empire.code-workspace'),
            JSON.stringify(config, null, 2)
        );
        
        console.log('✅ Generated qantum-empire.code-workspace');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════════════════════════════════════════
    
    printStats(): void {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║          🧠 QANTUM PRIME EMPIRE - STATISTICS                  ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        
        if (this.meditationResult) {
            const { assimilation } = this.meditationResult;
            console.log(`║  📊 Total Files:    ${String(assimilation.totalFiles).padStart(8)}                        ║`);
            console.log(`║  📝 Total Lines:    ${String(assimilation.totalLines).padStart(8)}                        ║`);
            console.log(`║  🔣 Total Symbols:  ${String(assimilation.totalSymbols).padStart(8)}                        ║`);
            console.log(`║  ❤️  Health Score:  ${String(this.meditationResult.healthScore).padStart(8)}/100                    ║`);
        }
        
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║  🏛️  FULL EMPIRE:                                             ║');
        console.log('║     MisteMind:      704,116 lines | 1,144 files              ║');
        console.log('║     MrMindQATool:   366,435 lines | 1,472 files              ║');
        console.log('║     MisterMindPage:   5,723 lines |     9 files              ║');
        console.log('║     ───────────────────────────────────────────              ║');
        console.log('║     TOTAL:       1,076,274 lines | 2,625 files               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const grouper = WorkplaceGrouper.getInstance();
    
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║          🛡️ QANTUM WORKPLACE GROUPER v28.1.0                  ║');
    console.log('║          "Фокус = Памет. Памет = Точност."                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    
    switch (command) {
        case 'focus':
            const moduleName = args[1];
            if (!moduleName) {
                console.error('❌ Usage: npx tsx scripts/group-workplace.ts focus <module>');
                console.error('   Example: npx tsx scripts/group-workplace.ts focus biology');
                process.exit(1);
            }
            grouper.setAgentFocus(moduleName);
            break;
            
        case 'rules':
            grouper.generateAllCursorRules();
            break;
            
        case 'skeleton':
            const skelModule = args[1];
            if (!skelModule) {
                console.error('❌ Usage: npx tsx scripts/group-workplace.ts skeleton <module>');
                process.exit(1);
            }
            console.log(grouper.generateSkeleton(skelModule));
            break;
            
        case 'workspace':
            grouper.generateWorkspaceConfig();
            break;
            
        case 'stats':
            grouper.printStats();
            break;
            
        default:
            console.log('\n📋 Available commands:');
            console.log('   focus <module>    - Set agent focus to module');
            console.log('   rules             - Generate .cursorrules for all modules');
            console.log('   skeleton <module> - Print AST skeleton for module');
            console.log('   workspace         - Generate .code-workspace file');
            console.log('   stats             - Print empire statistics');
            console.log('\n💡 Example:');
            console.log('   npx tsx scripts/group-workplace.ts focus biology');
            console.log('   npx tsx scripts/group-workplace.ts rules');
    }
}

main().catch(console.error);

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { WorkplaceGrouper };
export default WorkplaceGrouper;
