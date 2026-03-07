/**
 * deduplicate — Qantum Module
 * @module deduplicate
 * @path scripts/deduplicate.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * 🧹 Content Deduplication Script
 * 
 * Scans the codebase for files with identical content (based on SHA-256 hash)
 * and removes duplicates, keeping the one with the shortest path.
 */

const ROOT_DIR = process.cwd();
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'coverage', '.gemini'];
const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.webp'];

async function calculateFileHash(filePath: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

async function getFiles(dir: string): Promise<string[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!IGNORE_DIRS.includes(entry.name)) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                files.push(...await getFiles(fullPath));
            }
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (!IGNORE_EXTENSIONS.includes(ext)) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

async function startDeduplication() {
    console.log('🧹 Starting deduplication scan...');
    console.log(`📂 Root directory: ${ROOT_DIR}`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const files = await getFiles(ROOT_DIR);
    console.log(`Found ${files.length} files to analyze.`);

    const contentMap = new Map<string, string[]>();

    // Analyze files
    for (const file of files) {
        try {
            const hash = await calculateFileHash(file);
            if (!contentMap.has(hash)) {
                contentMap.set(hash, []);
            }
            contentMap.get(hash)?.push(file);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    // Identify duplicates
    let duplicatesFound = 0;
    let bytesFreed = 0;

    for (const [hash, filePaths] of contentMap.entries()) {
        if (filePaths.length > 1) {
            duplicatesFound++;

            // Sort by path length (keep shortest)
            filePaths.sort((a, b) => a.length - b.length);

            const keeper = filePaths[0];
            const toDelete = filePaths.slice(1);

            console.log(`\nFound ${filePaths.length} copies of content (${hash.substring(0, 8)}...)`);
            console.log(`✅ Keeping: ${path.relative(ROOT_DIR, keeper)}`);

            for (const duplicate of toDelete) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const stat = await fs.stat(duplicate);
                bytesFreed += stat.size;

                console.log(`🗑️  Deleting: ${path.relative(ROOT_DIR, duplicate)}`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await fs.unlink(duplicate);
            }
        }
    }

    console.log('\n========================================');
    console.log('🎉 Deduplication Complete');
    console.log('========================================');
    console.log(`Duplicate sets found: ${duplicatesFound}`);
    console.log(`Space reclaimed: ${(bytesFreed / 1024).toFixed(2)} KB`);
}

    // Complexity: O(1)
startDeduplication().catch(console.error);
