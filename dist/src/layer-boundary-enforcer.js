"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * LAYER BOUNDARY ENFORCER - The Constitution of QAntum Prime
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * "Математиката е недосегаема. Физиката зависи само от нея."
 *                                                    — QANTUM
 *
 * This script enforces the IMMUTABLE LAW of Universal Synthesis:
 *
 *   [1] MATH       → Imports: NOTHING
 *   [2] PHYSICS    → Imports: MATH only
 *   [3] CHEMISTRY  → Imports: MATH, PHYSICS only
 *   [4] BIOLOGY    → Imports: MATH, PHYSICS, CHEMISTRY only
 *   [5] REALITY    → Imports: ALL (terminal layer)
 *
 * VIOLATION = BUILD FAILURE
 *
 * @module scripts/layer-boundary-enforcer
 * @version 1.0.0
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
exports.LAYERS = void 0;
exports.enforceLayerBoundaries = enforceLayerBoundaries;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LAYERS = [
    {
        name: 'MATH',
        level: 1,
        paths: ['src/layers/math', 'src/chronos'],
        allowedImports: [], // NOTHING - Pure foundation
    },
    {
        name: 'PHYSICS',
        level: 2,
        paths: ['src/layers/physics', 'src/swarm', 'src/queue', 'src/performance'],
        allowedImports: ['MATH'],
    },
    {
        name: 'CHEMISTRY',
        level: 3,
        paths: [
            'src/layers/chemistry',
            'src/adapters', 'src/api', 'src/behavior', 'src/browser',
            'src/core', 'src/data', 'src/error', 'src/fluent', 'src/forms',
            'src/fortress', 'src/future-practices', 'src/generators',
            'src/ghost', 'src/ghost-protocol', 'src/integrations',
            'src/maintenance', 'src/metrics', 'src/mobile', 'src/network',
            'src/plugins', 'src/pom', 'src/pre-cog', 'src/scenario',
            'src/scheduler', 'src/search', 'src/session', 'src/tests',
            'src/types', 'src/verification',
        ],
        allowedImports: ['MATH', 'PHYSICS'],
    },
    {
        name: 'BIOLOGY',
        level: 4,
        paths: [
            'src/layers/biology',
            'src/cognitive', 'src/healing', 'src/intelligence',
            'src/oracle', 'src/security', 'src/ai',
        ],
        allowedImports: ['MATH', 'PHYSICS', 'CHEMISTRY'],
    },
    {
        name: 'REALITY',
        level: 5,
        paths: [
            'src/layers/reality',
            'src/cli', 'src/reporters', 'src/reports',
            'src/singularity', 'src/visual',
        ],
        allowedImports: ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'],
    },
];
exports.LAYERS = LAYERS;
/**
 * Get layer for a file path
 */
function getLayerForPath(filePath) {
    const normalized = filePath.replace(/\\/g, '/');
    for (const layer of LAYERS) {
        for (const layerPath of layer.paths) {
            if (normalized.includes(layerPath)) {
                return layer;
            }
        }
    }
    return null;
}
/**
 * Get layer for an import path
 */
function getLayerForImport(importPath, currentFile) {
    // Handle relative imports
    if (importPath.startsWith('.')) {
        const dir = path.dirname(currentFile);
        const resolved = path.resolve(dir, importPath).replace(/\\/g, '/');
        return getLayerForPath(resolved);
    }
    // Handle absolute imports from src/
    if (importPath.startsWith('src/') || importPath.startsWith('../')) {
        return getLayerForPath(importPath);
    }
    // Handle layer imports
    for (const layer of LAYERS) {
        for (const layerPath of layer.paths) {
            if (importPath.includes(layerPath) ||
                importPath.includes(`layers/${layer.name.toLowerCase()}`)) {
                return layer;
            }
        }
    }
    return null; // External package, allow
}
/**
 * Check if import is allowed based on layer hierarchy
 */
function isImportAllowed(fromLayer, toLayer) {
    // Same layer is always allowed
    if (fromLayer.name === toLayer.name)
        return true;
    // Check if toLayer is in allowedImports
    return fromLayer.allowedImports.includes(toLayer.name);
}
/**
 * Extract imports from TypeScript file
 * Skips imports inside template strings (code generation)
 */
function extractImports(content) {
    const imports = [];
    const lines = content.split('\n');
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    // Track if we're inside a template string
    let inTemplateString = false;
    lines.forEach((line, index) => {
        // Check for template string boundaries
        const backtickCount = (line.match(/`/g) || []).length;
        // Simple heuristic: odd number of backticks toggles template state
        // Also check if line starts with template content (no leading code)
        if (backtickCount % 2 === 1) {
            inTemplateString = !inTemplateString;
        }
        // Skip lines that appear to be inside template strings
        // Additional check: if line contains "import" but is part of generated code
        const trimmed = line.trim();
        const looksLikeTemplate = inTemplateString ||
            trimmed.startsWith('${') ||
            (trimmed.includes('import') && trimmed.includes('${')) ||
            (trimmed.includes('import') && !trimmed.startsWith('import'));
        if (looksLikeTemplate) {
            return; // Skip this line
        }
        let match;
        // Check import statements - only at start of line (real imports)
        if (trimmed.startsWith('import ') || trimmed.startsWith('import{')) {
            importRegex.lastIndex = 0;
            while ((match = importRegex.exec(line)) !== null) {
                imports.push({ line: index + 1, path: match[1] });
            }
        }
        // Check require statements - only if it's a real require (not in string)
        if (trimmed.includes('require(') && !trimmed.includes("'require") && !trimmed.includes('"require')) {
            requireRegex.lastIndex = 0;
            while ((match = requireRegex.exec(line)) !== null) {
                imports.push({ line: index + 1, path: match[1] });
            }
        }
    });
    return imports;
}
/**
 * Scan a single file for violations
 */
function scanFile(filePath) {
    const violations = [];
    const fromLayer = getLayerForPath(filePath);
    if (!fromLayer)
        return []; // File not in a layer
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const imports = extractImports(content);
        for (const imp of imports) {
            const toLayer = getLayerForImport(imp.path, filePath);
            if (toLayer && !isImportAllowed(fromLayer, toLayer)) {
                violations.push({
                    file: filePath,
                    line: imp.line,
                    fromLayer: fromLayer.name,
                    toLayer: toLayer.name,
                    importPath: imp.path,
                    message: `${fromLayer.name} (Layer ${fromLayer.level}) cannot import from ${toLayer.name} (Layer ${toLayer.level})`,
                });
            }
        }
    }
    catch (error) {
        // Skip unreadable files
    }
    return violations;
}
/**
 * Recursively get all TypeScript files
 */
function getTypeScriptFiles(dir) {
    const files = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                files.push(...getTypeScriptFiles(fullPath));
            }
            else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                files.push(fullPath);
            }
        }
    }
    catch (error) {
        // Skip unreadable directories
    }
    return files;
}
// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Run the layer boundary enforcement
 */
function enforceLayerBoundaries(srcDir) {
    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                                       ║');
    console.log('║   ██╗      █████╗ ██╗   ██╗███████╗██████╗     ██╗      █████╗ ██╗    ██╗            ║');
    console.log('║   ██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗    ██║     ██╔══██╗██║    ██║            ║');
    console.log('║   ██║     ███████║ ╚████╔╝ █████╗  ██████╔╝    ██║     ███████║██║ █╗ ██║            ║');
    console.log('║   ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗    ██║     ██╔══██║██║███╗██║            ║');
    console.log('║   ███████╗██║  ██║   ██║   ███████╗██║  ██║    ███████╗██║  ██║╚███╔███╔╝            ║');
    console.log('║   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝             ║');
    console.log('║                                                                                       ║');
    console.log('║                    BOUNDARY ENFORCER - The Constitution                               ║');
    console.log('║                                                                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════════════╝\n');
    console.log('📜 LAYER HIERARCHY (Immutable Law):');
    console.log('   [1] MATH       → Imports: NOTHING');
    console.log('   [2] PHYSICS    → Imports: MATH only');
    console.log('   [3] CHEMISTRY  → Imports: MATH, PHYSICS');
    console.log('   [4] BIOLOGY    → Imports: MATH, PHYSICS, CHEMISTRY');
    console.log('   [5] REALITY    → Imports: ALL\n');
    const files = getTypeScriptFiles(srcDir);
    const allViolations = [];
    let checkedFiles = 0;
    console.log(`🔍 Scanning ${files.length} TypeScript files...\n`);
    for (const file of files) {
        const layer = getLayerForPath(file);
        if (layer) {
            checkedFiles++;
            const violations = scanFile(file);
            allViolations.push(...violations);
        }
    }
    // Calculate health score
    const healthScore = checkedFiles > 0
        ? Math.round(((checkedFiles - allViolations.length) / checkedFiles) * 100)
        : 100;
    // Print results
    if (allViolations.length === 0) {
        console.log('╔═══════════════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                     ✅ ALL LAYER BOUNDARIES RESPECTED                                 ║');
        console.log('║                                                                                       ║');
        console.log('║                      "Математиката е недосегаема!"                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════════════════════╝');
    }
    else {
        console.log('╔═══════════════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                     🚨 LAYER BOUNDARY VIOLATIONS DETECTED                             ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════════════════════╝\n');
        // Group by from layer
        const byLayer = new Map();
        for (const v of allViolations) {
            const key = v.fromLayer;
            if (!byLayer.has(key))
                byLayer.set(key, []);
            byLayer.get(key).push(v);
        }
        for (const [layer, violations] of byLayer) {
            console.log(`\n🔴 ${layer} Layer Violations (${violations.length}):`);
            for (const v of violations.slice(0, 10)) { // Show first 10 per layer
                const shortFile = v.file.replace(/\\/g, '/').split('src/')[1] || v.file;
                console.log(`   ${shortFile}:${v.line}`);
                console.log(`   └── Cannot import "${v.importPath}" from ${v.toLayer}`);
            }
            if (violations.length > 10) {
                console.log(`   ... and ${violations.length - 10} more violations`);
            }
        }
    }
    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                              ENFORCEMENT SUMMARY                                       ║');
    console.log('╠═══════════════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Total Files:        ${files.length.toString().padEnd(45)}║`);
    console.log(`║  Files in Layers:    ${checkedFiles.toString().padEnd(45)}║`);
    console.log(`║  Violations Found:   ${allViolations.length.toString().padEnd(45)}║`);
    console.log(`║  Clean Files:        ${(checkedFiles - new Set(allViolations.map(v => v.file)).size).toString().padEnd(45)}║`);
    console.log(`║  Health Score:       ${healthScore}% ${healthScore === 100 ? '🟢' : healthScore >= 80 ? '🟡' : '🔴'}`.padEnd(50) + '║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════════════╝');
    return {
        totalFiles: files.length,
        checkedFiles,
        violations: allViolations,
        cleanFiles: checkedFiles - new Set(allViolations.map(v => v.file)).size,
        healthScore,
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    const srcDir = process.argv[2] || path.join(process.cwd(), 'src');
    const result = enforceLayerBoundaries(srcDir);
    // Exit with error code if violations found (for CI/CD)
    if (result.violations.length > 0) {
        console.log('\n❌ BUILD BLOCKED: Fix layer violations before commit!\n');
        process.exit(1);
    }
    console.log('\n✅ Layer boundaries enforced. Build may proceed.\n');
    process.exit(0);
}
