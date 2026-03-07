/**
 * cartographer — Qantum Module
 * @module cartographer
 * @path scripts/_AUTONOMOUS_HUNTER_/cartographer.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║   CARTOGRAPHER - The Empire's Mapper                                         ║
 * ║   Scans the entire codebase and generates `mega-map.json`                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

interface ModuleEntry {
    id: string;
    path: string;
    type: 'Core' | 'Product' | 'Security' | 'FinTech' | 'Utility' | 'Unknown';
    status: '🟢 ALIVE' | '🔴 DEAD' | '🟡 UNKNOWN';
    exports: string[];
    loc: number;
}

const SCAN_DIRS = [
    'src/modules',
    'src/products',
    'scripts'
];

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build'];

function getFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!SKIP_DIRS.some(skip => fullPath.includes(skip))) {
                results = results.concat(getFiles(fullPath));
            }
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            results.push(fullPath);
        }
    });
    return results;
}

function inferType(filePath: string): ModuleEntry['type'] {
    const lowerPath = filePath.toLowerCase();
    if (lowerPath.includes('security') || lowerPath.includes('auth') || lowerPath.includes('shield')) return 'Security';
    if (lowerPath.includes('fintech') || lowerPath.includes('hft') || lowerPath.includes('trading')) return 'FinTech';
    if (lowerPath.includes('products')) return 'Product';
    if (lowerPath.includes('scripts') || lowerPath.includes('util')) return 'Utility';
    if (lowerPath.includes('core') || lowerPath.includes('engine')) return 'Core';
    return 'Unknown';
}

function analyzeFile(filePath: string): ModuleEntry | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const loc = lines.length;

        // Simple export detection (class, function, const)
        const exports: string[] = [];
        const classMatch = content.match(/export\s+class\s+(\w+)/g);
        const funcMatch = content.match(/export\s+(async\s+)?function\s+(\w+)/g);
        const constMatch = content.match(/export\s+const\s+(\w+)/g);

        if (classMatch) {
            classMatch.forEach(m => {
                const name = m.replace(/export\s+(class\s+)?/, '').trim();
                exports.push(name);
            });
        }
        if (funcMatch) {
            funcMatch.forEach(m => {
                const name = m.replace(/export\s+(async\s+)?function\s+/, '').trim();
                exports.push(name);
            });
        }
        if (constMatch) {
            constMatch.forEach(m => {
                const name = m.replace(/export\s+const\s+/, '').trim();
                exports.push(name);
            });
        }

        // If no exports found, skip
        if (exports.length === 0 && loc < 50) return null;

        const id = path.basename(filePath, path.extname(filePath));

        return {
            id,
            path: filePath.replace(/\\/g, '/'),
            type: inferType(filePath),
            status: exports.length > 0 ? '🟢 ALIVE' : '🟡 UNKNOWN',
            exports,
            loc
        };
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   CARTOGRAPHER: Mapping the Empire        ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    const rootDir = process.cwd();
    let allFiles: string[] = [];

    SCAN_DIRS.forEach(dir => {
        const fullDir = path.join(rootDir, dir);
        console.log(`[SCAN] ${fullDir}...`);
        allFiles = allFiles.concat(getFiles(fullDir));
    });

    console.log(`\n[TOTAL FILES FOUND] ${allFiles.length}`);

    const megaMap: ModuleEntry[] = [];
    let totalLoc = 0;

    allFiles.forEach(file => {
        const entry = analyzeFile(file);
        if (entry) {
            megaMap.push(entry);
            totalLoc += entry.loc;
        }
    });

    // Summary
    const typeCounts = megaMap.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('\n--- ANALYSIS COMPLETE ---');
    console.log(`[MODULES MAPPED] ${megaMap.length}`);
    console.log(`[TOTAL LOC SCANNED] ${totalLoc.toLocaleString()}`);
    console.log('[BY TYPE]', typeCounts);

    // Write output
    const outputPath = path.join(rootDir, 'mega-map.json');
    fs.writeFileSync(outputPath, JSON.stringify(megaMap, null, 2), 'utf-8');
    console.log(`\n✅ Output written to: ${outputPath}`);
}

    // Complexity: O(1)
main();
