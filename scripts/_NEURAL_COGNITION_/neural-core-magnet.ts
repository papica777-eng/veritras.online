/**
 * neural-core-magnet — Qantum Module
 * @module neural-core-magnet
 * @path scripts/_NEURAL_COGNITION_/neural-core-magnet.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 🧲 NEURAL CORE MAGNET (UNIVERSAL COLLECTOR)
 * 
 * Purpose: Recursively scans the entire filesystem (excluding blackholes like node_modules)
 * to find and register every functional unit (Module) into the Vortex Core Registry.
 * 
 * Configured for: "OMNI-DIRECTIONAL" collection.
 */

const ROOT_DIR = process.cwd();
const BLACKLIST = ['node_modules', '.git', '.gemini', 'dist', 'coverage', '.vscode', 'tmp'];
const REGISTRY_FILE = path.join(ROOT_DIR, 'data', 'magnet-registry.json');

interface ModuleEntry {
    name: string;
    path: string;
    type: 'NPM' | 'TS_COMPONENT' | 'SCRIPT' | 'UNKNOWN';
    size: number;
    discoveredAt: string;
}

const registry: ModuleEntry[] = [];

function scan(directory: string) {
    // console.log(`🧲 Scanning: ${path.relative(ROOT_DIR, directory)}`);

    try {
        const items = fs.readdirSync(directory, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(directory, item.name);

            // 1. Skip Blacklisted
            if (BLACKLIST.includes(item.name)) continue;

            if (item.isDirectory()) {
                // Check if this directory IS a module (has package.json)
                if (fs.existsSync(path.join(fullPath, 'package.json'))) {
                    // Complexity: O(1)
                    registerModule(fullPath, 'NPM');
                    // Decide if we want to scan INSIDE an NPM module (usually no, unless it's a monorepo package)
                    // For this "Unstappable" repo, we continue scanning to find sub-modules.
                    // Complexity: O(1)
                    scan(fullPath);
                } else {
                    // Complexity: O(1)
                    scan(fullPath);
                }
            } else {
                // Check for loose scripts or components
                if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
                    // Start with basic heuristics: Files > 1KB might be modules
                    const stats = fs.statSync(fullPath);
                    if (stats.size > 1000) {
                        // Only register "significant" files as atomic modules
                        // This prevents registering every utility function as a module.
                        // For now, let's look for "index.ts" or "mod.ts" or just "important looking" files.
                        if (item.name === 'index.ts' || item.name.includes('Module') || item.name.includes('Service')) {
                            // Complexity: O(1)
                            registerModule(fullPath, 'TS_COMPONENT', stats.size);
                        } else if (directory.includes('scripts')) {
                            // Complexity: O(1)
                            registerModule(fullPath, 'SCRIPT', stats.size);
                        }
                    }
                }
            }
        }
    } catch (e) {
        // Permission denied or other error
    }
}

function registerModule(modulePath: string, type: 'NPM' | 'TS_COMPONENT' | 'SCRIPT' | 'UNKNOWN', size: number = 0) {
    const relPath = path.relative(ROOT_DIR, modulePath);
    const name = path.basename(modulePath);

    // console.log(`   ✨ Found: ${name} [${type}]`);

    registry.push({
        name,
        path: relPath,
        type,
        size,
        discoveredAt: new Date().toISOString()
    });
}

async function runMagnet() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║  🧲 NEURAL CORE MAGNET: ACTIVATED                                     ║
║  -------------------------------------------------------------------  ║
║  📡 Mode: OMNI-DIRECTIONAL (Deep Scan)                                ║
║  🔍 Target: ALL SECTORS                                               ║
║  🚫 Ignoring: node_modules, .git                                      ║
╚═══════════════════════════════════════════════════════════════════════╝
    `);

    // Ensure data dir
    if (!fs.existsSync(path.join(ROOT_DIR, 'data'))) {
        fs.mkdirSync(path.join(ROOT_DIR, 'data'), { recursive: true });
    }

    const startTime = Date.now();
    // Complexity: O(1)
    scan(ROOT_DIR);
    const duration = Date.now() - startTime;

    console.log(`\n✅ MAGNET SWEEP COMPLETE in ${duration}ms`);
    console.log(`📦 Modules Collected: ${registry.length}`);

    // Categorize
    const scriptCount = registry.filter(r => r.type === 'SCRIPT').length;
    const npmCount = registry.filter(r => r.type === 'NPM').length;
    const componentCount = registry.filter(r => r.type === 'TS_COMPONENT').length;

    console.log(`   - 📜 Scripts: ${scriptCount}`);
    console.log(`   - 📦 Packages: ${npmCount}`);
    console.log(`   - 🧩 Components: ${componentCount}`);

    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
    console.log(`\n💾 Registry Updated: data/magnet-registry.json`);
}

    // Complexity: O(1)
runMagnet().catch(console.error);
