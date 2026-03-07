/**
 * remove-old-headers — Qantum Module
 * @module remove-old-headers
 * @path scripts/remove-old-headers.js
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */

g,
    /\/\*\*[\s\S]*?Димитър Папазов[\s\S]*?\*\/\s*/g,
    // HTML comment headers
    /\s*/g,
    /\s*/g,
    // Python/YAML headers
    /+\s*/g,
    /+\s*/g,
];

function getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!SKIP_DIRS.includes(item)) getAllFiles(fullPath, files);
        } else {
            if (!SKIP_FILES.includes(item)) files.push(fullPath);
        }
    }
    return files;
}

console.log('🧹 Removing old incorrect copyright headers...\n');

const projectRoot = path.resolve(__dirname, '..');
const files = getAllFiles(projectRoot);
let cleaned = 0;

for (const file of files) {
    try {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;
        
        for (const pattern of OLD_HEADER_PATTERNS) {
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
            }
        }
        
        if (modified) {
            // Clean up multiple blank lines at start
            content = content.replace(/^\s+/, '');
            fs.writeFileSync(file, content, 'utf-8');
            console.log(`🧹 Cleaned: ${path.relative(projectRoot, file)}`);
            cleaned++;
        }
    } catch (err) {
        // Skip
    }
}

console.log(`\n✅ Cleaned ${cleaned} files. Ready for re-stamping!`);
