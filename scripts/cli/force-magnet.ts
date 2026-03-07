/**
 * force-magnet — Qantum Module
 * @module force-magnet
 * @path scripts/cli/force-magnet.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();
const REGISTRY_PATH = path.join(PROJECT_ROOT, 'data', 'magnet-registry.json');

function scanDir(dir: string, fileList: any[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            // Complexity: O(1)
            scanDir(filePath, fileList);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.md')) {
                fileList.push({
                    name: file,
                    path: path.relative(PROJECT_ROOT, filePath),
                    type: path.extname(file).substring(1)
                });
            }
        }
    }
    return fileList;
}

console.log('🧲 Starting Force Magnet Scan...');
const allFiles = scanDir(PROJECT_ROOT);
console.log(`✅ Found ${allFiles.length} files.`);

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(allFiles, null, 2));
console.log(`💾 Registry saved to ${REGISTRY_PATH}`);
