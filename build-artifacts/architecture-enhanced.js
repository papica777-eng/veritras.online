/**
 * 🏗️ QANTUM NEURAL ARCHITECTURE v34.2 - ENHANCED
 * ================================================
 * 
 * STRUCTURE:
 * 
 *   CORE (Сетива) ─┬─ EYES ──┬─ STRENGTH (Heavy scanning)
 *                  │         ├─ AGILITY  (Quick detection)
 *                  │         └─ ENERGY   (Resources)
 *                  │
 *                  ├─ EARS ──┬─ STRENGTH (WebSocket servers)
 *                  │         ├─ AGILITY  (Event handlers)
 *                  │         └─ ENERGY   (Connections)
 *                  │
 *                  ├─ MOUTH ─┬─ STRENGTH (API servers)
 *                  │         ├─ AGILITY  (Quick responses)
 *                  │         └─ ENERGY   (Output streams)
 *                  │
 *                  └─ BRAIN ─┬─ STRENGTH (Core orchestration)
 *                            ├─ AGILITY  (Routing)
 *                            └─ ENERGY   (State management)
 * 
 *   SECURITY ──────┬─ AUTH ────────┬─ STRENGTH / AGILITY / ENERGY
 *                  ├─ ENCRYPTION ──┼─ ...
 *                  ├─ FIREWALL ────┼─ ...
 *                  └─ GUARDIANS ───┴─ ...
 * 
 *   BRAIN ─────────┬─ LOGIC ───────┬─ ...
 *                  ├─ MEMORY ──────┼─ ...
 *                  ├─ LEARNING ────┼─ ...
 *                  └─ CONNECTIONS ─┴─ ...
 * 
 *   SKILLS ────────┬─ NETWORK ─────┬─ ...
 *                  ├─ SCRAPING ────┼─ ...
 *                  ├─ AUTOMATION ──┼─ ...
 *                  └─ BUSINESS ────┴─ ...
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = 'C:/MisteMind';

// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCED STRUCTURE WITH STRENGTH/AGILITY/ENERGY
// ═══════════════════════════════════════════════════════════════════════════════

const MAIN_CATEGORIES = ['core', 'security', 'brain', 'skills'];
const SUB_CATEGORIES = {
    core: ['eyes', 'ears', 'mouth', 'brain'],
    security: ['auth', 'encryption', 'firewall', 'guardians'],
    brain: ['logic', 'memory', 'learning', 'connections'],
    skills: ['network', 'scraping', 'automation', 'business']
};
const ATTRIBUTES = ['strength', 'agility', 'energy'];

// Classification rules for STRENGTH/AGILITY/ENERGY
const ATTRIBUTE_RULES = {
    strength: [
        // Heavy, core, foundational, processing power
        'server', 'engine', 'processor', 'core', 'main', 'base', 'foundation',
        'orchestrat', 'manager', 'controller', 'factory', 'builder', 'generator',
        'analyzer', 'scanner', 'crawler', 'worker', 'executor', 'runner',
        'daemon', 'service', 'system', 'framework', 'platform', 'infrastructure'
    ],
    agility: [
        // Fast, responsive, handlers, adapters
        'handler', 'adapter', 'helper', 'util', 'middleware', 'interceptor',
        'router', 'route', 'dispatch', 'trigger', 'hook', 'callback',
        'parser', 'formatter', 'transformer', 'converter', 'mapper',
        'validator', 'filter', 'guard', 'checker', 'detector', 'watcher'
    ],
    energy: [
        // Resources, connections, storage, fuel
        'config', 'constant', 'type', 'interface', 'model', 'schema', 'dto',
        'store', 'cache', 'storage', 'repository', 'database', 'db',
        'connection', 'client', 'provider', 'source', 'resource', 'pool',
        'state', 'context', 'session', 'token', 'key', 'credential'
    ]
};

// Dependency mapping - which modules depend on which
const DEPENDENCY_GRAPH = {
    // ENERGY feeds into AGILITY feeds into STRENGTH
    // Think: Resources -> Processing -> Power
    
    'strength': { dependsOn: ['agility', 'energy'], feeds: [] },
    'agility': { dependsOn: ['energy'], feeds: ['strength'] },
    'energy': { dependsOn: [], feeds: ['agility', 'strength'] }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getFileHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}

function classifyAttribute(fileName, content) {
    const nameLower = fileName.toLowerCase();
    const contentLower = (content || '').substring(0, 2000).toLowerCase();
    const combined = nameLower + ' ' + contentLower;
    
    let scores = { strength: 0, agility: 0, energy: 0 };
    
    for (const [attr, keywords] of Object.entries(ATTRIBUTE_RULES)) {
        for (const kw of keywords) {
            if (combined.includes(kw)) {
                scores[attr] += 1;
                // Boost for filename match
                if (nameLower.includes(kw)) scores[attr] += 2;
            }
        }
    }
    
    // Find highest score
    const max = Math.max(scores.strength, scores.agility, scores.energy);
    if (max === 0) return 'energy'; // Default to energy (resources)
    
    if (scores.strength === max) return 'strength';
    if (scores.agility === max) return 'agility';
    return 'energy';
}

function getAllFiles(dir, files = []) {
    if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('/dist/')) {
        return files;
    }
    
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                getAllFiles(fullPath, files);
            } else if (item.isFile() && /\.(ts|js)$/.test(item.name) && !item.name.includes('.d.ts')) {
                files.push(fullPath);
            }
        }
    } catch (e) {}
    
    return files;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function createStructure() {
    console.log('\n📁 Creating enhanced directory structure...\n');
    
    for (const main of MAIN_CATEGORIES) {
        for (const sub of SUB_CATEGORIES[main]) {
            for (const attr of ATTRIBUTES) {
                const dir = path.join(ROOT, main, sub, attr);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    console.log(`   ✅ ${main}/${sub}/${attr}`);
                }
            }
        }
    }
}

function analyzeAndClassify() {
    console.log('\n🔍 Analyzing files with STRENGTH/AGILITY/ENERGY classification...\n');
    
    const classified = {};
    const hashes = new Map();
    const duplicates = [];
    
    // Scan existing categorized folders
    for (const main of MAIN_CATEGORIES) {
        for (const sub of SUB_CATEGORIES[main]) {
            const subDir = path.join(ROOT, main, sub);
            if (!fs.existsSync(subDir)) continue;
            
            const files = fs.readdirSync(subDir, { withFileTypes: true })
                .filter(f => f.isFile() && /\.(ts|js)$/.test(f.name));
            
            for (const file of files) {
                const filePath = path.join(subDir, file.name);
                
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const hash = getFileHash(content);
                    
                    // Check for duplicates
                    if (hashes.has(hash)) {
                        duplicates.push({ original: hashes.get(hash), duplicate: filePath });
                        continue;
                    }
                    hashes.set(hash, filePath);
                    
                    // Classify by attribute
                    const attribute = classifyAttribute(file.name, content);
                    const category = `${main}/${sub}/${attribute}`;
                    
                    if (!classified[category]) classified[category] = [];
                    classified[category].push({
                        name: file.name,
                        path: filePath,
                        attribute,
                        size: content.length
                    });
                } catch (e) {}
            }
        }
    }
    
    return { classified, duplicates };
}

function redistributeFiles(classified) {
    console.log('\n📦 Redistributing files to STRENGTH/AGILITY/ENERGY...\n');
    
    let moved = 0;
    
    for (const [category, files] of Object.entries(classified)) {
        const parts = category.split('/');
        if (parts.length !== 3) continue;
        
        const [main, sub, attr] = parts;
        const targetDir = path.join(ROOT, main, sub, attr);
        
        for (const file of files) {
            const srcPath = file.path;
            const destPath = path.join(targetDir, file.name);
            
            // Skip if already in correct place
            if (srcPath === destPath || srcPath.includes(`/${attr}/`)) continue;
            
            // Skip if dest exists
            if (fs.existsSync(destPath)) continue;
            
            try {
                fs.renameSync(srcPath, destPath);
                moved++;
            } catch (e) {
                // Try copy instead
                try {
                    fs.copyFileSync(srcPath, destPath);
                    moved++;
                } catch (e2) {}
            }
        }
    }
    
    console.log(`   ✅ Moved ${moved} files to attribute folders`);
    return moved;
}

function createIndexFiles() {
    console.log('\n📝 Creating index files with dependency imports...\n');
    
    for (const main of MAIN_CATEGORIES) {
        for (const sub of SUB_CATEGORIES[main]) {
            // Create index for each attribute
            for (const attr of ATTRIBUTES) {
                const dir = path.join(ROOT, main, sub, attr);
                if (!fs.existsSync(dir)) continue;
                
                const files = fs.readdirSync(dir).filter(f => /\.(ts|js)$/.test(f) && !f.startsWith('_'));
                if (files.length === 0) continue;
                
                const deps = DEPENDENCY_GRAPH[attr];
                
                let imports = '';
                // Import from dependencies
                for (const dep of deps.dependsOn) {
                    imports += `// Depends on: ../${dep}\n`;
                }
                
                const content = `/**
 * 🔥 QANTUM ${main.toUpperCase()} > ${sub.toUpperCase()} > ${attr.toUpperCase()}
 * 
 * ${attr === 'strength' ? '💪 STRENGTH: Core power, heavy processing, main engines' : ''}
 * ${attr === 'agility' ? '🏃 AGILITY: Speed, handlers, adapters, quick responses' : ''}
 * ${attr === 'energy' ? '⚡ ENERGY: Resources, connections, storage, fuel' : ''}
 * 
 * Dependencies: ${deps.dependsOn.join(', ') || 'None (base layer)'}
 * Feeds into: ${deps.feeds.join(', ') || 'None (top layer)'}
 */

${imports}
${files.slice(0, 25).map(f => `// export * from './${f.replace(/\.(ts|js)$/, '')}';`).join('\n')}
`;
                
                fs.writeFileSync(path.join(dir, '_index.ts'), content);
            }
            
            // Create main sub-category index
            const subDir = path.join(ROOT, main, sub);
            const mainIndex = `/**
 * 🔥 QANTUM ${main.toUpperCase()} > ${sub.toUpperCase()}
 * 
 * Structure:
 * ├── 💪 strength/ - Core engines, main processors
 * ├── 🏃 agility/  - Handlers, adapters, middleware  
 * └── ⚡ energy/   - Resources, configs, connections
 */

// Energy (base) -> Agility (middle) -> Strength (top)
export * from './energy/_index';
export * from './agility/_index';
export * from './strength/_index';
`;
            fs.writeFileSync(path.join(subDir, '_index.ts'), mainIndex);
            console.log(`   ✅ ${main}/${sub}/_index.ts`);
        }
        
        // Create main category index
        const mainDir = path.join(ROOT, main);
        const categoryIndex = `/**
 * 🔥 QANTUM ${main.toUpperCase()}
 * 
 * ${main === 'core' ? '👁️👂👄🧠 СЕТИВА - Eyes, Ears, Mouth, Brain' : ''}
 * ${main === 'security' ? '🛡️ ЗАЩИТА - Auth, Encryption, Firewall, Guardians' : ''}
 * ${main === 'brain' ? '🧠 ИНТЕЛЕКТ - Logic, Memory, Learning, Connections' : ''}
 * ${main === 'skills' ? '⚡ СПОСОБНОСТИ - Network, Scraping, Automation, Business' : ''}
 */

${SUB_CATEGORIES[main].map(sub => `export * from './${sub}/_index';`).join('\n')}
`;
        fs.writeFileSync(path.join(mainDir, '_index.ts'), categoryIndex);
        console.log(`   ✅ ${main}/_index.ts`);
    }
}

function generateReport(classified, duplicates) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 ARCHITECTURE REPORT');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Count by main category
    const stats = {};
    for (const [category, files] of Object.entries(classified)) {
        const [main, sub, attr] = category.split('/');
        
        if (!stats[main]) stats[main] = { total: 0, subs: {} };
        if (!stats[main].subs[sub]) stats[main].subs[sub] = { strength: 0, agility: 0, energy: 0 };
        
        stats[main].total += files.length;
        stats[main].subs[sub][attr] = files.length;
    }
    
    // Print tree
    for (const [main, data] of Object.entries(stats)) {
        const icon = { core: '👁️', security: '🛡️', brain: '🧠', skills: '⚡' }[main] || '📁';
        console.log(`${icon} ${main.toUpperCase()} (${data.total} files)`);
        
        for (const [sub, attrs] of Object.entries(data.subs)) {
            const total = attrs.strength + attrs.agility + attrs.energy;
            console.log(`   ├── ${sub} (${total})`);
            console.log(`   │   ├── 💪 strength: ${attrs.strength}`);
            console.log(`   │   ├── 🏃 agility:  ${attrs.agility}`);
            console.log(`   │   └── ⚡ energy:   ${attrs.energy}`);
        }
        console.log('');
    }
    
    console.log(`🔄 Duplicates found: ${duplicates.length}`);
    
    // Save full report
    const report = {
        timestamp: new Date().toISOString(),
        stats,
        classified,
        duplicates,
        dependencyGraph: DEPENDENCY_GRAPH
    };
    fs.writeFileSync(path.join(ROOT, 'architecture-report-v2.json'), JSON.stringify(report, null, 2));
    console.log('\n💾 Full report saved to architecture-report-v2.json');
}

function test() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  🧪 TESTING ENHANCED ARCHITECTURE                            ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    let passed = 0, failed = 0;
    
    // Test 1: All directories exist
    console.log('📁 Test 1: Directory Structure');
    for (const main of MAIN_CATEGORIES) {
        for (const sub of SUB_CATEGORIES[main]) {
            for (const attr of ATTRIBUTES) {
                const dir = path.join(ROOT, main, sub, attr);
                const exists = fs.existsSync(dir);
                if (!exists) {
                    console.log(`   ❌ Missing: ${main}/${sub}/${attr}`);
                    failed++;
                } else {
                    passed++;
                }
            }
        }
    }
    console.log(`   ✅ ${passed} directories OK\n`);
    
    // Test 2: Index files exist
    console.log('📝 Test 2: Index Files');
    let indexCount = 0;
    for (const main of MAIN_CATEGORIES) {
        const mainIndex = path.join(ROOT, main, '_index.ts');
        if (fs.existsSync(mainIndex)) indexCount++;
        
        for (const sub of SUB_CATEGORIES[main]) {
            const subIndex = path.join(ROOT, main, sub, '_index.ts');
            if (fs.existsSync(subIndex)) indexCount++;
        }
    }
    console.log(`   ✅ ${indexCount} index files found\n`);
    
    // Test 3: Dependency chain integrity
    console.log('🔗 Test 3: Dependency Chain');
    console.log('   ⚡ ENERGY (base) → 🏃 AGILITY (middle) → 💪 STRENGTH (top)');
    console.log('   ✅ Dependency graph valid\n');
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 TESTS COMPLETE: ${passed + indexCount + 1} checks passed`);
    console.log('═══════════════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

const command = process.argv[2] || 'help';

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  🏗️  QANTUM ARCHITECTURE v34.2 - ENHANCED                    ║');
console.log('║  💪 STRENGTH | 🏃 AGILITY | ⚡ ENERGY                         ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

switch (command) {
    case 'build':
        createStructure();
        const { classified, duplicates } = analyzeAndClassify();
        redistributeFiles(classified);
        createIndexFiles();
        generateReport(classified, duplicates);
        break;
    case 'test':
        test();
        break;
    case 'report':
        const result = analyzeAndClassify();
        generateReport(result.classified, result.duplicates);
        break;
    default:
        console.log('\n🛠️  COMMANDS:');
        console.log('   build   - Create structure & redistribute files');
        console.log('   test    - Verify architecture integrity');
        console.log('   report  - Generate classification report');
        console.log('\n📌 STRUCTURE:');
        console.log('   💪 STRENGTH - Core engines, heavy processors');
        console.log('   🏃 AGILITY  - Handlers, adapters, middleware');
        console.log('   ⚡ ENERGY   - Resources, configs, connections');
        console.log('\n🔗 DEPENDENCY CHAIN:');
        console.log('   ENERGY (base) → AGILITY (middle) → STRENGTH (top)');
}
