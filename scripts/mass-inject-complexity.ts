/**
 * 💀 MASS COMPLEXITY INJECTOR — POLYGLOT
 * Automatically injects // Complexity: O(...) annotations across the codebase.
 * Uses static analysis heuristics to estimate Big O from method body patterns.
 * 
 * Supported: .ts .tsx .js .jsx .rs .py .mojo
 */

import * as fs from 'fs';
import * as path from 'path';

// Complexity: O(1)
const PROJECT_ROOT = process.cwd();
let totalInjected = 0;
let filesModified = 0;

interface InjectionTarget {
    filePath: string;
    language: 'ts' | 'rs' | 'py' | 'mojo';
}

// ─── HEURISTIC COMPLEXITY ANALYZER ──────────────────────────────────────────

// Complexity: O(L) where L = lines in method body
function inferComplexity(bodyLines: string[]): string {
    const body = bodyLines.join('\n');

    // Nested loops = O(N²) or O(N*M)
    const forCount = (body.match(/\bfor\b/g) || []).length;
    const whileCount = (body.match(/\bwhile\b/g) || []).length;
    const loopCount = forCount + whileCount;

    if (loopCount >= 2) return 'O(N*M) — nested iteration detected';

    // Sort operations = O(N log N)
    if (/\.sort\b|\bsort_by\b|\bsorted\b/.test(body)) return 'O(N log N) — sort operation';

    // Map/filter/reduce/forEach with iteration = O(N)
    if (/\.map\s*\(|\.filter\s*\(|\.forEach\s*\(|\.reduce\s*\(|\.find\s*\(/.test(body)) return 'O(N) — linear iteration';
    if (/for\s+.*\bin\b|for\s*\(|\.iter\(\)|for\s+.*of\b/.test(body)) return 'O(N) — linear iteration';
    if (/while\s*\(/.test(body)) return 'O(N) — loop-based';

    // Promise.all with array = O(N) parallel
    if (/Promise\.all/.test(body)) return 'O(N) — parallel execution';

    // Recursive calls
    if (/\bthis\.\w+\(/.test(body) && /\breturn\b/.test(body) && body.length < 300) {
        return 'O(N) — potential recursive descent';
    }

    // Hash lookups = O(1)
    if (/\.get\s*\(|\.has\s*\(|\.set\s*\(|\[\w+\]/.test(body) && loopCount === 0) return 'O(1) — hash/map lookup';

    // Simple property access, assignments, returns = O(1)
    if (loopCount === 0 && bodyLines.length < 20) return 'O(1)';

    // Moderate body without loops = O(1) amortized
    if (loopCount === 0) return 'O(1) — amortized';

    return 'O(N)';
}

// ─── TYPESCRIPT/JS INJECTOR ─────────────────────────────────────────────────

// Complexity: O(L) where L = total lines
function injectTypeScript(filePath: string): number {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let injected = 0;
    const newLines: string[] = [];

    const methodPattern = /^(\s*)(public|private|protected)?\s*(async\s+)?(\w+)\s*\(/;
    const skip = new Set(['if', 'for', 'while', 'switch', 'catch', 'import', 'from', 'return', 'new', 'constructor', 'super', 'else', 'typeof', 'require', 'console', 'describe', 'it', 'test', 'expect', 'beforeAll', 'afterAll', 'beforeEach', 'afterEach']);

    for (let i = 0; i < lines.length; i++) {
        // Check if previous line already has complexity annotation
        if (i > 0 && /\/\/\s*Complexity:/.test(lines[i - 1])) {
            newLines.push(lines[i]);
            continue;
        }
        // Check if this line already has it
        if (/\/\/\s*Complexity:/.test(lines[i])) {
            newLines.push(lines[i]);
            continue;
        }

        const match = lines[i].match(methodPattern);
        if (match && !skip.has(match[4])) {
            // Extract method body (find the opening { and count braces)
            const bodyLines: string[] = [];
            let braceCount = 0;
            let started = false;
            for (let j = i; j < Math.min(i + 60, lines.length); j++) {
                const line = lines[j];
                for (const ch of line) {
                    if (ch === '{') { braceCount++; started = true; }
                    if (ch === '}') braceCount--;
                }
                if (started) bodyLines.push(line);
                if (started && braceCount <= 0) break;
            }

            const complexity = inferComplexity(bodyLines);
            const indent = match[1] || '    ';
            newLines.push(`${indent}// Complexity: ${complexity}`);
            injected++;
        }
        newLines.push(lines[i]);
    }

    if (injected > 0) {
        fs.writeFileSync(filePath, newLines.join('\n'));
    }
    return injected;
}

// ─── RUST INJECTOR ──────────────────────────────────────────────────────────

// Complexity: O(L)
function injectRust(filePath: string): number {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let injected = 0;
    const newLines: string[] = [];

    const fnPattern = /^(\s*)(pub\s+)?(async\s+)?fn\s+(\w+)/;

    for (let i = 0; i < lines.length; i++) {
        if (i > 0 && /\/\/\s*Complexity:/.test(lines[i - 1])) {
            newLines.push(lines[i]);
            continue;
        }
        if (/\/\/\s*Complexity:/.test(lines[i])) {
            newLines.push(lines[i]);
            continue;
        }

        const match = lines[i].match(fnPattern);
        if (match) {
            const bodyLines: string[] = [];
            let braceCount = 0;
            let started = false;
            for (let j = i; j < Math.min(i + 80, lines.length); j++) {
                for (const ch of lines[j]) {
                    if (ch === '{') { braceCount++; started = true; }
                    if (ch === '}') braceCount--;
                }
                if (started) bodyLines.push(lines[j]);
                if (started && braceCount <= 0) break;
            }

            const complexity = inferComplexity(bodyLines);
            const indent = match[1] || '';
            newLines.push(`${indent}// Complexity: ${complexity}`);
            injected++;
        }
        newLines.push(lines[i]);
    }

    if (injected > 0) {
        fs.writeFileSync(filePath, newLines.join('\n'));
    }
    return injected;
}

// ─── PYTHON INJECTOR ────────────────────────────────────────────────────────

// Complexity: O(L)
function injectPython(filePath: string): number {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let injected = 0;
    const newLines: string[] = [];

    const defPattern = /^(\s*)(async\s+)?def\s+(\w+)\s*\(/;
    const skip = new Set(['__init__', '__str__', '__repr__', '__len__', '__getitem__', '__setitem__']);

    for (let i = 0; i < lines.length; i++) {
        if (i > 0 && /# Complexity:/.test(lines[i - 1])) {
            newLines.push(lines[i]);
            continue;
        }
        if (/# Complexity:/.test(lines[i])) {
            newLines.push(lines[i]);
            continue;
        }

        const match = lines[i].match(defPattern);
        if (match && !skip.has(match[3])) {
            // Scan body (indentation-based)
            const baseIndent = (match[1] || '').length;
            const bodyLines: string[] = [];
            for (let j = i + 1; j < Math.min(i + 50, lines.length); j++) {
                const lineIndent = lines[j].match(/^(\s*)/)?.[1]?.length || 0;
                if (lines[j].trim() === '') { bodyLines.push(lines[j]); continue; }
                if (lineIndent <= baseIndent) break;
                bodyLines.push(lines[j]);
            }

            const complexity = inferComplexity(bodyLines);
            const indent = match[1] || '';
            newLines.push(`${indent}# Complexity: ${complexity}`);
            injected++;
        }
        newLines.push(lines[i]);
    }

    if (injected > 0) {
        fs.writeFileSync(filePath, newLines.join('\n'));
    }
    return injected;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

function main() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  💀 MASS COMPLEXITY INJECTOR — POLYGLOT                                     ║
║  Heuristic-based Big O annotation injection                                 ║
║  Languages: TypeScript | JavaScript | Rust | Python                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);

    // Read neural map to find targets
    const mapPath = path.join(PROJECT_ROOT, 'public', 'qantum-neural-map.json');
    if (!fs.existsSync(mapPath)) {
        console.error('❌ Neural map not found. Run auto-document.ts first.');
        return;
    }

    const data = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

    // Find files with methods > 3 and zero annotations, exclude test files and shadow files
    const targets: Array<[string, any]> = Object.entries(data.registry)
        .filter(([k, v]: [string, any]) =>
            v.methods > 3 &&
            v.complexityAnnotations === 0 &&
            !k.includes('.test.') &&
            !k.includes('__tests__') &&
            !k.includes('.shadow.') &&
            !k.includes('node_modules')
        )
        .sort((a: any, b: any) => b[1].methods - a[1].methods);

    console.log(`📊 Found ${targets.length} production files without Big O annotations.`);
    console.log(`📊 Total methods to annotate: ${targets.reduce((s, [, v]: any) => s + v.methods, 0)}\n`);

    for (const [relPath, meta] of targets) {
        const absPath = path.join(PROJECT_ROOT, relPath);
        if (!fs.existsSync(absPath)) continue;

        const lang = (meta as any).language;
        let count = 0;

        try {
            switch (lang) {
                case 'typescript':
                    count = injectTypeScript(absPath);
                    break;
                case 'rust':
                    count = injectRust(absPath);
                    break;
                case 'python':
                    count = injectPython(absPath);
                    break;
            }
        } catch (e) {
            console.log(`⚠️ Skip ${relPath}: ${(e as Error).message}`);
            continue;
        }

        if (count > 0) {
            totalInjected += count;
            filesModified++;
            console.log(`  ✅ ${relPath} — ${count} annotations`);
        }
    }

    console.log(`
═══════════════════════════════════════════════════════════════════
  📊 INJECTION COMPLETE:
  Files modified:     ${filesModified}
  Annotations added:  ${totalInjected}
  Total target files: ${targets.length}
═══════════════════════════════════════════════════════════════════
    `);
}

main();
