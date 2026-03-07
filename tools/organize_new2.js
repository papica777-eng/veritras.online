/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ QANTUM ARCHITECT - FOLDER STRUCTURIZER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Reorganizes the chaotic "new-2" directory into a highly structured 
 * architectural pattern, categorizing files by their cognitive domains.
 * 
 * @author dp | QAntum Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.resolve(__dirname, '../new-2');

// Categories based on Qantum Singularity Architecture
const STRUCTURE = {
    'Cognitive': [
        'MetaLogicEngine.ts',
        'LogicEvolutionDB.ts',
        'OntoGenerator.ts',
        'PhenomenonWeaver.ts',
        'TranscendenceCore.ts'
    ],
    'Neural': [
        'neural-backpack.ts',
        'neural-core-magnet.ts',
        'stream-processor.ts'
    ],
    'Singularity': [
        'SingularityLogic.ts',
        'SingularityServer.ts',
        'index.ts'
    ],
    'Security': [
        'enterprise-security.ts'
    ],
    'Testing': [
        'LocalSovereigntest.ts',
        'Sovereign-AI-Agent.spec.ts'
    ]
};

console.log(`
    🏛️ QANTUM ARCHITECT ACTIVATED
    ════════════════════════════════════════
    Target: ${TARGET_DIR}
    Action: Structuring Entropy into Order
`);

if (!fs.existsSync(TARGET_DIR)) {
    console.error(`[ERROR] Directory ${TARGET_DIR} does not exist.`);
    process.exit(1);
}

// 1. Create Directories
Object.keys(STRUCTURE).forEach(category => {
    const categoryPath = path.join(TARGET_DIR, category);
    if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath);
        console.log(`[+] Created Domain: /${category}`);
    }
});

// 2. Move Files
let filesMoved = 0;

Object.entries(STRUCTURE).forEach(([category, files]) => {
    const categoryPath = path.join(TARGET_DIR, category);

    files.forEach(file => {
        const sourcePath = path.join(TARGET_DIR, file);
        const destPath = path.join(categoryPath, file);

        if (fs.existsSync(sourcePath)) {
            // Keep track of exports - if it's index.ts, it might need to update imports.
            // But for now, we just physically structure them.
            fs.renameSync(sourcePath, destPath);
            console.log(`  ↪ Moved: ${file} -> /${category}`);
            filesMoved++;
        }
    });
});

console.log(`
    ✅ ORGANIZATION COMPLETE
    ════════════════════════════════════════
    Files Categorized: ${filesMoved}
    Domains Created:  ${Object.keys(STRUCTURE).length}
    Entropy Level:    0.00
`);
