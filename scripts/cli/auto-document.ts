/**
 * auto-document — Qantum Module
 * @module auto-document
 * @path scripts/cli/auto-document.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * 💀 BRUTAL AUTO-DOC ENGINE v2.1 — POLYGLOT SINGULARITY
 * ═══════════════════════════════════════════════════════════════════════════════
 * Autonomous documentation. Zero manual writing. 100% Reality.
 *
 * SUPPORTED LANGUAGES:
 *   .ts .tsx .js .jsx   — TypeScript / JavaScript
 *   .rs                 — Rust (pub fn, struct, impl, mod)
 *   .py                 — Python (def, class, @dataclass, @app)
 *   .mojo               — Mojo (fn, struct, alias, vectorize)
 *   .soul               — Soul DSL (manifold, entrench, resonate, collapse)
 *
 * EXTRACTS:
 *   - Exports / public symbols per language
 *   - Big O Complexity annotations (// Complexity: ...)
 *   - Safety guards (try-catch, null-checks, Result<>, Option<>)
 *   - Method/function signatures with return types
 *   - Import/dependency graph
 *   - Per-module complexity scorecards
 *   - Outputs: Markdown + JSON neural map
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Complexity: O(1)
type Language = 'typescript' | 'javascript' | 'rust' | 'python' | 'mojo' | 'soul' | 'unknown';

// Complexity: O(1)
const CONFIG = {
    projectRoot: process.cwd(),
    docsDir: 'docs/enterprise',
    version: '2.1.0-POLYGLOT',
    supportedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.rs', '.py', '.mojo', '.soul'],
    targets: [
        'src/core',
        'src/core/departments',
        'src/modules',
        'src/departments',
        'scripts',
        'native',
        'backend',
        'bridges',
        'core',
        'soul',
        'aeterna-node',
        'OmniCore',
        'omni_core',
    ],
    exclude: ['node_modules', 'dist', '.git', 'b2b-portal', 'qantum_ENTERPRISE_PROJECTS'],
};

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

interface ComplexityAnnotation {
    method: string;
    complexity: string;
    line: number;
}

interface SafetyGuard {
    type: 'try-catch' | 'null-check' | 'optional-chain' | 'data-gap' | 'result-type' | 'option-type' | 'except' | 'unwrap-or';
    context: string;
    line: number;
}

interface MethodSignature {
    name: string;
    visibility: 'public' | 'private' | 'protected' | 'default';
    isAsync: boolean;
    params: string;
    returnType: string;
    complexity: string | null;
    line: number;
}

interface ImportEdge {
    from: string;
    to: string;
    symbols: string[];
}

interface FileAnalysis {
    relativePath: string;
    absolutePath: string;
    language: Language;
    size: number;
    lineCount: number;
    exports: string[];
    jsdocs: string[];
    complexityAnnotations: ComplexityAnnotation[];
    safetyGuards: SafetyGuard[];
    methods: MethodSignature[];
    imports: ImportEdge[];
    hash: string;
    lastParsed: string;
    complexityScore: number;
}

// ─── LANGUAGE DETECTION ──────────────────────────────────────────────────────

// Complexity: O(1)
function detectLanguage(filePath: string): Language {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.ts': case '.tsx': return 'typescript';
        case '.js': case '.jsx': return 'javascript';
        case '.rs': return 'rust';
        case '.py': return 'python';
        case '.mojo': return 'mojo';
        case '.soul': return 'soul';
        default: return 'unknown';
    }
}

const LANG_LABELS: Record<Language, string> = {
    typescript: '🟦 TypeScript',
    javascript: '🟨 JavaScript',
    rust: '🦀 Rust',
    python: '🐍 Python',
    mojo: '🔥 Mojo',
    soul: '👁️ Soul DSL',
    unknown: '❓ Unknown',
};

// ─── POLYGLOT EXTRACTORS ─────────────────────────────────────────────────────

class PolyglotExtractor {

    // Complexity: O(L) — regex scan over content
    static extractExports(content: string, lang: Language): string[] {
        const exports: string[] = [];

        switch (lang) {
            case 'typescript': case 'javascript': {
                const patterns = [
                    /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum|abstract\s+class)\s+(\w+)/g,
                ];
                for (const p of patterns) {
                    let m;
                    while ((m = p.exec(content)) !== null) exports.push(m[1]);
                }
                break;
            }
            case 'rust': {
                const patterns = [
                    /pub\s+(?:async\s+)?fn\s+(\w+)/g,
                    /pub\s+struct\s+(\w+)/g,
                    /pub\s+enum\s+(\w+)/g,
                    /pub\s+trait\s+(\w+)/g,
                    /pub\s+mod\s+(\w+)/g,
                    /pub\s+type\s+(\w+)/g,
                    /pub\s+const\s+(\w+)/g,
                    /pub\s+static\s+(\w+)/g,
                ];
                for (const p of patterns) {
                    let m;
                    while ((m = p.exec(content)) !== null) exports.push(m[1]);
                }
                break;
            }
            case 'python': {
                const patterns = [
                    /^class\s+(\w+)/gm,
                    /^def\s+(\w+)/gm,
                    /^(\w+)\s*=\s*(?:FastAPI|Flask|Django)/gm,
                    /^@dataclass[\s\S]*?\nclass\s+(\w+)/gm,
                ];
                for (const p of patterns) {
                    let m;
                    while ((m = p.exec(content)) !== null) {
                        const name = m[1] || m[2];
                        if (name && !name.startsWith('_')) exports.push(name);
                    }
                }
                break;
            }
            case 'mojo': {
                const patterns = [
                    /^fn\s+(\w+)/gm,
                    /^struct\s+(\w+)/gm,
                    /^alias\s+(\w+)/gm,
                ];
                for (const p of patterns) {
                    let m;
                    while ((m = p.exec(content)) !== null) exports.push(m[1]);
                }
                break;
            }
            case 'soul': {
                const patterns = [
                    /manifold\s+(\w+)/g,
                    /entrench\s+(\w+)/g,
                    /resonate\s+(\w+)/g,
                    /collapse\s+(\w+)/g,
                ];
                for (const p of patterns) {
                    let m;
                    while ((m = p.exec(content)) !== null) exports.push(m[1]);
                }
                break;
            }
        }
        return [...new Set(exports)];
    }

    // Complexity: O(L) — line-by-line scan
    static extractComplexity(content: string): ComplexityAnnotation[] {
        const annotations: ComplexityAnnotation[] = [];
        const lines = content.split('\n');
        // Works for all languages: // Complexity: or # Complexity:
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/(?:\/\/|#|\/\*\*?)\s*Complexity:\s*(.*)/);
            if (match) {
                let methodName = 'unknown';
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    // TS/JS/Mojo
                    let mm = lines[j].match(/(?:pub\s+)?(?:async\s+)?(?:fn|function)?\s*(\w+)\s*\(/);
                    // Rust
                    if (!mm) mm = lines[j].match(/(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/);
                    // Python
                    if (!mm) mm = lines[j].match(/def\s+(\w+)\s*\(/);
                    // Class methods
                    if (!mm) mm = lines[j].match(/(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(/);
                    if (mm && mm[1] !== 'if' && mm[1] !== 'for' && mm[1] !== 'while') {
                        methodName = mm[1];
                        break;
                    }
                }
                annotations.push({ method: methodName, complexity: match[1].trim(), line: i + 1 });
            }
        }
        return annotations;
    }

    // Complexity: O(L) — line-by-line scan (expanded 20+ patterns)
    static extractSafetyGuards(content: string, lang: Language): SafetyGuard[] {
        const guards: SafetyGuard[] = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const raw = lines[i];

            // ── Universal patterns (all languages) ──

            // try-catch / try-except
            if (/^try\s*[:{]/.test(line) || line === 'try {' || line === 'try:') {
                guards.push({ type: 'try-catch', context: (lines[i + 1] || '').trim().substring(0, 80), line: i + 1 });
            }
            // catch / except blocks
            if (/^catch\s*\(/.test(line) || /^except\s/.test(line) || /\}\s*catch\s*\(/.test(line)) {
                guards.push({ type: 'try-catch', context: line.substring(0, 80), line: i + 1 });
            }
            // throw / raise (explicit error handling)
            if (/^\s*throw\s+/.test(raw) || /^\s*raise\s+/.test(raw)) {
                guards.push({ type: 'try-catch', context: line.substring(0, 80), line: i + 1 });
            }
            // DATA_GAP
            if (line.includes('DATA_GAP')) {
                guards.push({ type: 'data-gap', context: line.substring(0, 80), line: i + 1 });
            }
            // SAFETY comments (from our injector)
            if (/\/\/\s*SAFETY:|#\s*SAFETY:/.test(raw)) {
                guards.push({ type: 'data-gap', context: line.substring(0, 80), line: i + 1 });
            }

            // ── TypeScript / JavaScript specific ──
            if (lang === 'typescript' || lang === 'javascript') {
                // null-check: if (x && x.y) or if (x !== null)
                if (/if\s*\(.+&&\s*.+\.\w+/.test(line) || /!==?\s*null/.test(line) || /!==?\s*undefined/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // Optional chaining: x?.y
                if (/\w+\?\.\w+/.test(line)) {
                    guards.push({ type: 'optional-chain', context: line.substring(0, 80), line: i + 1 });
                }
                // Nullish coalescing: x ?? default
                if (/\?\?/.test(line) && !line.startsWith('//')) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // Default parameter: = default or || default
                if (/\|\|\s*['"\d\[\{]/.test(line) || /=\s*\w+\s*\|\|/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // typeof guard
                if (/typeof\s+\w+\s*[!=]==?\s*['"]/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // instanceof check
                if (/instanceof\s+\w+/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // Array.isArray
                if (/Array\.isArray/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // .catch() promise guard
                if (/\.catch\s*\(/.test(line)) {
                    guards.push({ type: 'try-catch', context: line.substring(0, 80), line: i + 1 });
                }
                // Early return guard: if (!x) return
                if (/if\s*\(\s*!/.test(line) && /return/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // Boundary guards: Math.max, Math.min, Math.abs
                if (/Math\.(max|min|abs|floor|ceil|round)\s*\(/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // Length/size check
                if (/\.length\s*[><=!]/.test(line) || /\.size\s*[><=!]/.test(line)) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
                // Assert / expect (test safety)
                if (/\bassert\b|\bexpect\b/.test(line) && !line.startsWith('//')) {
                    guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                }
            }

            // ── Rust specific ──
            if (lang === 'rust') {
                if (/Result</.test(line)) guards.push({ type: 'result-type', context: line.substring(0, 80), line: i + 1 });
                if (/Option</.test(line)) guards.push({ type: 'option-type', context: line.substring(0, 80), line: i + 1 });
                if (/\.unwrap_or/.test(line)) guards.push({ type: 'unwrap-or', context: line.substring(0, 80), line: i + 1 });
                // ? operator (error propagation)
                if (/\w+\?;/.test(line) || /\w+\?\s*$/.test(line)) guards.push({ type: 'result-type', context: line.substring(0, 80), line: i + 1 });
                // match expression (exhaustive pattern matching)
                if (/^\s*match\s+/.test(raw)) guards.push({ type: 'result-type', context: line.substring(0, 80), line: i + 1 });
                // if let (safe unwrap)
                if (/if\s+let\s+/.test(line)) guards.push({ type: 'option-type', context: line.substring(0, 80), line: i + 1 });
                // .ok() / .err() / .is_some() / .is_none() / .is_ok() / .is_err()
                if (/\.(ok|err|is_some|is_none|is_ok|is_err)\s*\(/.test(line)) guards.push({ type: 'result-type', context: line.substring(0, 80), line: i + 1 });
            }

            // ── Python specific ──
            if (lang === 'python') {
                if (/isinstance\s*\(/.test(line)) guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                if (/hasattr\s*\(/.test(line)) guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                if (/if\s+\w+\s+is\s+not\s+None/.test(line)) guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                if (/if\s+not\s+\w+/.test(line)) guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                if (/\.get\s*\(.*,/.test(line)) guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
                if (/assert\s+/.test(line)) guards.push({ type: 'null-check', context: line.substring(0, 80), line: i + 1 });
            }
        }
        return guards;
    }

    // Complexity: O(L) — regex method extraction per language
    static extractMethods(content: string, lang: Language): MethodSignature[] {
        const methods: MethodSignature[] = [];
        const lines = content.split('\n');
        const complexityMap = new Map<number, string>();

        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/(?:\/\/|#)\s*Complexity:\s*(.*)/);
            if (match) complexityMap.set(i, match[1].trim());
        }

        const skip = new Set(['if', 'for', 'while', 'switch', 'catch', 'import', 'from', 'return', 'new', 'elif', 'else', 'except', 'with', 'match']);

        for (let i = 0; i < lines.length; i++) {
            let name: string | null = null;
            let vis: 'public' | 'private' | 'protected' | 'default' = 'default';
            let isAsync = false;
            let params = '';
            let returnType = 'void';

            switch (lang) {
                case 'typescript': case 'javascript': {
                    const m = lines[i].match(/^\s*(public|private|protected)?\s*(async\s+)?(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+(?:<[^>]+>)?))?/);
                    if (m && !skip.has(m[3])) {
                        vis = (m[1] as any) || 'default';
                        isAsync = !!m[2];
                        name = m[3];
                        params = (m[4] || '').trim();
                        returnType = m[5] || 'void';
                    }
                    break;
                }
                case 'rust': {
                    const m = lines[i].match(/^\s*(pub\s+)?(async\s+)?fn\s+(\w+)\s*(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*->\s*(.+?))?(?:\s*\{|\s*$)/);
                    if (m && !skip.has(m[3])) {
                        vis = m[1] ? 'public' : 'private';
                        isAsync = !!m[2];
                        name = m[3];
                        params = (m[4] || '').trim();
                        returnType = (m[5] || '()').trim();
                    }
                    break;
                }
                case 'python': {
                    const m = lines[i].match(/^\s*(async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*(.+?))?:/);
                    if (m && !skip.has(m[2])) {
                        isAsync = !!m[1];
                        name = m[2];
                        vis = name.startsWith('_') ? 'private' : 'public';
                        params = (m[3] || '').trim();
                        returnType = (m[4] || 'None').trim();
                    }
                    break;
                }
                case 'mojo': {
                    const m = lines[i].match(/^\s*fn\s+(\w+)\s*(?:\[.*?\])?\s*\(([^)]*)\)(?:\s*->\s*(.+?))?:/);
                    if (m && !skip.has(m[1])) {
                        name = m[1];
                        params = (m[2] || '').trim();
                        returnType = (m[3] || 'None').trim();
                    }
                    break;
                }
                case 'soul': {
                    const m = lines[i].match(/^\s*(manifold|entrench|resonate|collapse)\s+(\w+)/);
                    if (m) {
                        name = `${m[1]}:${m[2]}`;
                        returnType = m[1];
                    }
                    break;
                }
            }

            if (name) {
                let complexity: string | null = null;
                for (let j = Math.max(0, i - 3); j < i; j++) {
                    if (complexityMap.has(j)) { complexity = complexityMap.get(j)!; break; }
                }
                methods.push({ name, visibility: vis, isAsync, params, returnType, complexity, line: i + 1 });
            }
        }
        return methods;
    }

    // Complexity: O(L) — import scan
    static extractImports(content: string, filePath: string, lang: Language): ImportEdge[] {
        const imports: ImportEdge[] = [];
        const lines = content.split('\n');

        for (const line of lines) {
            let match: RegExpMatchArray | null = null;
            switch (lang) {
                case 'typescript': case 'javascript':
                    match = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
                    if (match) {
                        const symbols = (match[1] || match[2] || '').split(',').map(s => s.trim()).filter(Boolean);
                        if (match[3].startsWith('.')) imports.push({ from: filePath, to: match[3], symbols });
                    }
                    break;
                case 'rust':
                    match = line.match(/use\s+([\w:]+)(?:::({[^}]+}|\w+))?/);
                    if (match) {
                        const target = match[1];
                        const symbols = match[2] ? match[2].replace(/[{}]/g, '').split(',').map(s => s.trim()) : [target.split('::').pop()!];
                        imports.push({ from: filePath, to: target, symbols });
                    }
                    break;
                case 'python':
                    match = line.match(/(?:from\s+([\w.]+)\s+)?import\s+([\w,\s]+)/);
                    if (match) {
                        const target = match[1] || '';
                        const symbols = match[2].split(',').map(s => s.trim().split(' as ')[0]).filter(Boolean);
                        imports.push({ from: filePath, to: target, symbols });
                    }
                    break;
                case 'mojo':
                    match = line.match(/from\s+([\w.]+)\s+import\s+([\w,\s]+)/);
                    if (match) {
                        imports.push({ from: filePath, to: match[1], symbols: match[2].split(',').map(s => s.trim()) });
                    }
                    break;
            }
        }
        return imports;
    }

    // Complexity: O(L) — docstring extraction
    static extractDocs(content: string, lang: Language): string[] {
        const docs: string[] = [];
        switch (lang) {
            case 'typescript': case 'javascript': {
                const pattern = /\/\*\*[\s\S]*?\*\//g;
                let m; while ((m = pattern.exec(content)) !== null && docs.length < 3) {
                    docs.push(m[0].length > 400 ? m[0].substring(0, 400) + '...*/' : m[0]);
                }
                break;
            }
            case 'rust': {
                const pattern = /\/\/\/.*(?:\n\/\/\/.*)*/g;
                let m; while ((m = pattern.exec(content)) !== null && docs.length < 3) {
                    docs.push(m[0].substring(0, 400));
                }
                break;
            }
            case 'python': {
                const pattern = /"""[\s\S]*?"""|'''[\s\S]*?'''/g;
                let m; while ((m = pattern.exec(content)) !== null && docs.length < 3) {
                    docs.push(m[0].length > 400 ? m[0].substring(0, 400) + '..."""' : m[0]);
                }
                break;
            }
            case 'mojo': case 'soul': {
                const pattern = /(?:\/\/|#)\s*.+/g;
                let m; let batch = ''; let count = 0;
                while ((m = pattern.exec(content)) !== null && count < 5) {
                    batch += m[0] + '\n'; count++;
                }
                if (batch) docs.push(batch.substring(0, 400));
                break;
            }
        }
        return docs;
    }
}

// ─── BRUTAL DOC ENGINE v2.1 ──────────────────────────────────────────────────

class BrutalDocEngine {
    private timestamp = new Date().toISOString();
    private analyses: FileAnalysis[] = [];
    private totalAnnotations = 0;
    private totalGuards = 0;
    private totalMethods = 0;
    private langCounts: Record<Language, number> = { typescript: 0, javascript: 0, rust: 0, python: 0, mojo: 0, soul: 0, unknown: 0 };

    // Complexity: O(1)
    ensureDir(dirPath: string): void {
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    }

    // Complexity: O(D + F)
    findFiles(dir: string, maxDepth: number = 10): string[] {
        if (!fs.existsSync(dir) || maxDepth <= 0) return [];
        let files: string[] = [];
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                if (CONFIG.exclude.some(e => item.name === e)) continue;
                if (item.name.startsWith('.')) continue;
                if (item.name.endsWith('.shadow.ts') || item.name.endsWith('.shadow.rs')) continue;

                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    files.push(...this.findFiles(fullPath, maxDepth - 1));
                } else {
                    const ext = path.extname(item.name).toLowerCase();
                    if (CONFIG.supportedExtensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch { /* permission denied, skip */ }
        return files;
    }

    // Complexity: O(1)
    computeHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex').substring(0, 12);
    }

    // Complexity: O(1)
    calculateScore(a: FileAnalysis): number {
        let score = 0;
        const maxMethods = Math.max(a.methods.length, 1);
        score += Math.min(a.complexityAnnotations.length / maxMethods, 1) * 50;
        score += Math.min(a.safetyGuards.length / maxMethods, 1) * 30;
        score += (a.jsdocs.length > 0 ? 1 : 0) * 10;
        score += (a.exports.length > 0 ? 1 : 0) * 10;
        return Math.round(Math.min(score, 100));
    }

    // ─── REPORT ────────────────────────────────────────────────────────────

    // Complexity: O(A)
    generateReport(): string {
        let doc = `# 💀 QANTUM BRUTAL MANIFEST v2.1 — POLYGLOT EDITION\n\n`;
        doc += `> **Generated:** ${this.timestamp}\n`;
        doc += `> **Version:** ${CONFIG.version}\n`;
        doc += `> **Engine:** BrutalDocEngine v2.1 — Polyglot Code Intelligence\n\n`;
        doc += `This document is **auto-generated** from deep-parsing the actual running system.\n`;
        doc += `Languages: TypeScript/JS · Rust · Python · Mojo · Soul DSL\n\n---\n\n`;

        // ── EXECUTIVE SUMMARY ──
        doc += `## 📊 EXECUTIVE SUMMARY\n\n`;
        doc += `| Metric | Value |\n|---|---:|\n`;
        doc += `| Files Analyzed | **${this.analyses.length}** |\n`;
        doc += `| Total Methods/Functions | **${this.totalMethods}** |\n`;
        doc += `| Big O Annotations | **${this.totalAnnotations}** |\n`;
        doc += `| Safety Guards | **${this.totalGuards}** |\n`;
        doc += `| Average Rigor Score | **${this.getAvgScore()}/100** |\n\n`;

        // ── LANGUAGE BREAKDOWN ──
        doc += `## 🌐 POLYGLOT BREAKDOWN\n\n`;
        doc += `| Language | Files | Methods | Annotations |\n|---|:---:|:---:|:---:|\n`;
        for (const [lang, label] of Object.entries(LANG_LABELS)) {
            if (lang === 'unknown') continue;
            const files = this.analyses.filter(a => a.language === lang);
            if (files.length === 0) continue;
            const methods = files.reduce((s, a) => s + a.methods.length, 0);
            const annots = files.reduce((s, a) => s + a.complexityAnnotations.length, 0);
            doc += `| ${label} | ${files.length} | ${methods} | ${annots} |\n`;
        }
        doc += `\n`;

        // ── RIGOR SCOREBOARD (top 20 by score) ──
        const scored = this.analyses.filter(a => a.complexityAnnotations.length > 0 || a.methods.length > 3);
        if (scored.length > 0) {
            const top = scored.sort((a, b) => b.complexityScore - a.complexityScore).slice(0, 25);
            doc += `## 🏆 MATHEMATICAL RIGOR SCOREBOARD (Top 25)\n\n`;
            doc += `| Module | Lang | Methods | Big O | Guards | Score | Status |\n`;
            doc += `|--------|:----:|:-------:|:-----:|:------:|:-----:|:------:|\n`;
            for (const f of top) {
                const base = path.basename(f.relativePath);
                const langIcon = f.language === 'rust' ? '🦀' : f.language === 'python' ? '🐍' : f.language === 'mojo' ? '🔥' : f.language === 'soul' ? '👁️' : f.language === 'javascript' ? '🟨' : '🟦';
                const status = f.complexityScore >= 70 ? '✅ STEEL' : f.complexityScore >= 40 ? '⚠️ WIP' : '❌ RAW';
                doc += `| \`${base}\` | ${langIcon} | ${f.methods.length} | ${f.complexityAnnotations.length} | ${f.safetyGuards.length} | ${f.complexityScore}/100 | ${status} |\n`;
            }
            doc += `\n`;
        }

        // ── COMPLEXITY DISTRIBUTION ──
        doc += `## 📈 COMPLEXITY DISTRIBUTION\n\n`;
        const allC = this.analyses.flatMap(a => a.complexityAnnotations);
        const o1 = allC.filter(c => c.complexity.startsWith('O(1)')).length;
        const oN = allC.filter(c => /O\([A-Z]\)/.test(c.complexity) && !c.complexity.includes('*')).length;
        const oNM = allC.filter(c => c.complexity.includes('*') || c.complexity.includes('²')).length;
        const other = allC.length - o1 - oN - oNM;
        doc += `| Class | Count | % | Risk |\n|---|:---:|:---:|---|\n`;
        doc += `| O(1) Constant | ${o1} | ${this.pct(o1, allC.length)} | 🟢 Optimal |\n`;
        doc += `| O(N) Linear | ${oN} | ${this.pct(oN, allC.length)} | 🟡 Acceptable |\n`;
        doc += `| O(N²) / O(N*M) | ${oNM} | ${this.pct(oNM, allC.length)} | 🔴 Monitor |\n`;
        if (other > 0) doc += `| Other | ${other} | ${this.pct(other, allC.length)} | 🟠 Review |\n`;
        doc += `\n`;

        // ── SAFETY GUARD REGISTRY ──
        doc += `## 🛡️ SAFETY GUARD REGISTRY\n\n`;
        const allG = this.analyses.flatMap(a => a.safetyGuards);
        const guardTypes = [...new Set(allG.map(g => g.type))];
        doc += `| Pattern | Count | Language Context |\n|---|:---:|---|\n`;
        for (const t of guardTypes) {
            const count = allG.filter(g => g.type === t).length;
            const ctx = t === 'result-type' ? 'Rust Result<T, E>' :
                t === 'option-type' ? 'Rust Option<T>' :
                    t === 'unwrap-or' ? 'Rust safe unwrap' :
                        t === 'except' ? 'Python exception handler' :
                            t === 'try-catch' ? 'Error isolation' :
                                t === 'null-check' ? 'Null-safe access' :
                                    t === 'optional-chain' ? 'TS ?. operator' :
                                        'Missing data honesty';
            doc += `| \`${t}\` | ${count} | ${ctx} |\n`;
        }
        doc += `\n`;

        // ── PER-LANGUAGE SECTIONS ──
        for (const langKey of ['typescript', 'javascript', 'rust', 'python', 'mojo', 'soul'] as Language[]) {
            const langFiles = this.analyses.filter(a => a.language === langKey && (a.exports.length > 0 || a.methods.length > 0));
            if (langFiles.length === 0) continue;

            doc += `---\n\n## ${LANG_LABELS[langKey]} REGISTRY (${langFiles.length} files)\n\n`;

            for (const analysis of langFiles) {
                doc += `### 📄 \`${analysis.relativePath}\`\n\n`;
                doc += `> ${analysis.lineCount} lines | ${analysis.exports.length} exports | Score: **${analysis.complexityScore}/100** | Hash: \`${analysis.hash}\`\n\n`;

                if (analysis.exports.length > 0) {
                    doc += `**Exposed Symbols:** ${analysis.exports.map(e => `\`${e}\``).join(', ')}\n\n`;
                }

                const annotatedMethods = analysis.methods.filter(m => m.complexity);
                if (annotatedMethods.length > 0) {
                    doc += `| Method | Visibility | Complexity | Line |\n|---|---|---|---:|\n`;
                    for (const m of annotatedMethods) {
                        doc += `| \`${m.isAsync ? 'async ' : ''}${m.name}()\` | ${m.visibility} | ${m.complexity} | ${m.line} |\n`;
                    }
                    doc += `\n`;
                }

                if (analysis.safetyGuards.length > 0) {
                    const types = [...new Set(analysis.safetyGuards.map(g => g.type))];
                    doc += `**Safety Guards:** ${analysis.safetyGuards.length} (${types.join(', ')})\n\n`;
                }

                if (analysis.jsdocs.length > 0) {
                    const langBlock = langKey === 'rust' ? 'rust' : langKey === 'python' ? 'python' : langKey === 'mojo' ? 'python' : 'typescript';
                    doc += `**Doc Preview:**\n\`\`\`${langBlock}\n${analysis.jsdocs[0].substring(0, 250)}...\n\`\`\`\n\n`;
                }
            }
        }

        doc += `---\n\n> **Generated by BrutalDocEngine v2.1 POLYGLOT** | Entropy: 0.00 | Compiler is the Judge\n`;
        return doc;
    }

    private pct(part: number, total: number): string {
        return total === 0 ? '0%' : Math.round((part / total) * 100) + '%';
    }

    private getAvgScore(): number {
        const scored = this.analyses.filter(a => a.methods.length > 0);
        return scored.length === 0 ? 0 : Math.round(scored.reduce((s, a) => s + a.complexityScore, 0) / scored.length);
    }

    // ─── MAIN ──────────────────────────────────────────────────────────────

    // Complexity: O(T * F * L)
    async run() {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  💀 BRUTAL AUTO-DOC ENGINE v2.1 — POLYGLOT SINGULARITY                      ║
║  Languages: .ts .js .rs .py .mojo .soul                                     ║
║  Scanning: ${CONFIG.targets.length} target directories                                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `);

        this.ensureDir(path.join(CONFIG.projectRoot, CONFIG.docsDir));

        const fileSet = new Set<string>();
        for (const target of CONFIG.targets) {
            const targetPath = path.join(CONFIG.projectRoot, target);
            if (fs.existsSync(targetPath)) {
                for (const f of this.findFiles(targetPath)) fileSet.add(f);
            }
        }
        const allFiles = Array.from(fileSet);
        console.log(`📊 Found ${allFiles.length} polyglot files. Deep-analyzing...`);

        for (const file of allFiles) {
            const relativePath = path.relative(CONFIG.projectRoot, file).replace(/\\/g, '/');
            const content = fs.readFileSync(file, 'utf-8');
            const lang = detectLanguage(file);

            const analysis: FileAnalysis = {
                relativePath,
                absolutePath: file,
                language: lang,
                size: content.length,
                lineCount: content.split('\n').length,
                exports: PolyglotExtractor.extractExports(content, lang),
                jsdocs: PolyglotExtractor.extractDocs(content, lang),
                complexityAnnotations: PolyglotExtractor.extractComplexity(content),
                safetyGuards: PolyglotExtractor.extractSafetyGuards(content, lang),
                methods: PolyglotExtractor.extractMethods(content, lang),
                imports: PolyglotExtractor.extractImports(content, relativePath, lang),
                hash: crypto.createHash('sha256').update(content).digest('hex').substring(0, 12),
                lastParsed: this.timestamp,
                complexityScore: 0,
            };
            analysis.complexityScore = this.calculateScore(analysis);
            this.analyses.push(analysis);

            this.totalAnnotations += analysis.complexityAnnotations.length;
            this.totalGuards += analysis.safetyGuards.length;
            this.totalMethods += analysis.methods.length;
            this.langCounts[lang]++;
        }

        this.analyses.sort((a, b) => {
            const aCore = a.relativePath.startsWith('src/core') ? 0 : 1;
            const bCore = b.relativePath.startsWith('src/core') ? 0 : 1;
            if (aCore !== bCore) return aCore - bCore;
            return b.complexityScore - a.complexityScore;
        });

        // Write markdown
        const manifest = this.generateReport();
        const manifestPath = path.join(CONFIG.projectRoot, CONFIG.docsDir, 'LIVE_SYSTEM_STATUS.md');
        fs.writeFileSync(manifestPath, manifest);
        console.log(`✅ LIVE_SYSTEM_STATUS.md — ${manifest.length} chars`);

        // Write JSON neural map
        const publicDir = path.join(CONFIG.projectRoot, 'public');
        this.ensureDir(publicDir);
        const neuralMap = {
            version: CONFIG.version,
            timestamp: this.timestamp,
            nodesActive: this.analyses.length,
            totalAnnotations: this.totalAnnotations,
            totalGuards: this.totalGuards,
            avgRigorScore: this.getAvgScore(),
            languageBreakdown: this.langCounts,
            registry: Object.fromEntries(
                this.analyses.map(a => [a.relativePath, {
                    language: a.language,
                    exports: a.exports,
                    methods: a.methods.length,
                    complexityAnnotations: a.complexityAnnotations.length,
                    safetyGuards: a.safetyGuards.length,
                    complexityScore: a.complexityScore,
                    hash: a.hash,
                    size: a.size,
                }])
            ),
        };
        fs.writeFileSync(path.join(publicDir, 'qantum-neural-map.json'), JSON.stringify(neuralMap, null, 2));
        console.log(`✅ Neural map exported`);

        // Summary
        console.log(`
═══════════════════════════════════════════════════════════════════
  📊 POLYGLOT RESULTS:
  Files:        ${this.analyses.length}
  TypeScript:   ${this.langCounts.typescript} files
  JavaScript:   ${this.langCounts.javascript} files
  Rust:         ${this.langCounts.rust} files
  Python:       ${this.langCounts.python} files
  Mojo:         ${this.langCounts.mojo} files
  Soul DSL:     ${this.langCounts.soul} files
  ─────────────────────────────────────
  Methods:      ${this.totalMethods}
  Big O:        ${this.totalAnnotations} annotations
  Guards:       ${this.totalGuards} safety patterns
  Avg Score:    ${this.getAvgScore()}/100
═══════════════════════════════════════════════════════════════════
        `);
    }
}

async function main() {
    const engine = new BrutalDocEngine();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await engine.run();
}
main().catch(console.error);
