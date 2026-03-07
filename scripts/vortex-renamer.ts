/**
 * vortex-renamer — Qantum Module
 * @module vortex-renamer
 * @path scripts/vortex-renamer.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Vortex Cleaner & Renamer
 * Extracts real filenames from path-encoded names in the NEW folder
 * and moves them to tests/brutality-vortex/vortex
 */

const SRC_DIR = path.resolve('c:/Users/papic/Desktop/ALL-POSITIONS/Blockchain/QAntum-1/NEW');
const DST_DIR = path.resolve('c:/Users/papic/Desktop/ALL-POSITIONS/Blockchain/QAntum-1/tests/brutality-vortex/vortex');

function toPascalCase(str: string): string {
    return str
        .split(/[-_. \/\\]+/)
        .map(word => {
            if (!word) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
}

function extractRealName(filename: string): string {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const segments = base.split('__');

    // The actual filename is the LAST segment
    let rawName = segments[segments.length - 1];

    // If it's a versioned backup, the real name might be earlier
    if (/^\d{4}-\d{2}-\d{2}/.test(rawName)) {
        // Look for the next meaningful segment if the last one is a timestamp
        rawName = segments[segments.length - 2] || rawName;
    }

    return toPascalCase(rawName) + ext;
}

async function main() {
    console.log('🚀 Starting Vortex Renamer...');

    if (!fs.existsSync(SRC_DIR)) {
        console.error(`❌ Source directory not found: ${SRC_DIR}`);
        return;
    }

    if (!fs.existsSync(DST_DIR)) {
        fs.mkdirSync(DST_DIR, { recursive: true });
    }

    const files = fs.readdirSync(SRC_DIR).filter(f => fs.statSync(path.join(SRC_DIR, f)).isFile());
    console.log(`📂 Scanning ${files.length} files in NEW...`);

    let count = 0;
    for (const f of files) {
        const realName = extractRealName(f);
        const srcPath = path.join(SRC_DIR, f);
        const dstPath = path.join(DST_DIR, realName);

        console.log(`📄 Renaming: ${f.substring(0, 40)}... -> ${realName}`);

        try {
            fs.copyFileSync(srcPath, dstPath);
            count++;
        } catch (err) {
            console.error(`❌ Failed to rename ${f}:`, err);
        }
    }

    console.log(`\n✅ COMPLETED: ${count} files moved to ${DST_DIR}`);
}

    // Complexity: O(1)
main().catch(console.error);
