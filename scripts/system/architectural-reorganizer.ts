/**
 * architectural-reorganizer — Qantum Module
 * @module architectural-reorganizer
 * @path scripts/system/architectural-reorganizer.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      QANTUM ARCHITECTURAL RE-ORGANIZER                       ║
 * ║             Mathematical sorting of stray directories to ZERO ENTROPY        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

interface MoveOperation {
    source: string;
    target: string;
    category: string;
}

const ROOT_DIR = process.cwd();

// Mathematical definition of the Target Architecture
const TARGET_ARCHITECTURE = {
    CORE_AI: path.join(ROOT_DIR, 'src', 'core', 'ai'),
    CORE_ANTIGRAVITY: path.join(ROOT_DIR, 'src', 'core', 'antigravity'),
    AUTOMATION: path.join(ROOT_DIR, 'src', 'automation', 'execution'),
    DOCS_STANDARDS: path.join(ROOT_DIR, 'docs', 'best-practices'),
    DEPARTMENTS: path.join(ROOT_DIR, 'src', 'departments'),
    SCRIPTS: path.join(ROOT_DIR, 'scripts'),
    APPS: path.join(ROOT_DIR, 'src', 'apps')
};

const STRAY_FOLDERS = [
    { name: 'ai', target: TARGET_ARCHITECTURE.CORE_AI },
    { name: 'antigravity', target: TARGET_ARCHITECTURE.CORE_ANTIGRAVITY },
    { name: 'AUTOMATION_EXECUTION', target: TARGET_ARCHITECTURE.AUTOMATION },
    { name: 'best-practices', target: TARGET_ARCHITECTURE.DOCS_STANDARDS },
    { name: 'Aeterna-Anima', target: path.join(TARGET_ARCHITECTURE.DEPARTMENTS, 'biology') },
    { name: 'Arbitrage', target: path.join(TARGET_ARCHITECTURE.DEPARTMENTS, 'finance', 'arbitrage') },
    { name: 'Exchanges', target: path.join(TARGET_ARCHITECTURE.DEPARTMENTS, 'reality', 'exchanges') },
    { name: 'LwaS', target: path.join(TARGET_ARCHITECTURE.DEPARTMENTS, 'reality', 'lwas') },
    { name: 'BINANCE_TRADING_LAYER', target: path.join(TARGET_ARCHITECTURE.DEPARTMENTS, 'reality', 'binance') },
    { name: 'scripts/_NEURAL_COGNITION_/MisterMindPage', target: path.join(TARGET_ARCHITECTURE.APPS, 'mister-mind') }
];

// Complexity: O(n)
async function ensureTargetInfrastructure() {
    console.log(`[INFRA] Validating target infrastructure...`);
    Object.values(TARGET_ARCHITECTURE).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`[INFRA] 📁 Created: ${path.relative(ROOT_DIR, dir)}`);
        }
    });
}

// Complexity: O(n)
async function migrateFolders() {
    console.log(`\n[SURGERY] Evaluating stray directories for migration...`);
    let migrations = 0;

    for (const folder of STRAY_FOLDERS) {
        const sourcePath = path.isAbsolute(folder.name) ? folder.name : path.join(ROOT_DIR, folder.name);

        if (!fs.existsSync(sourcePath)) {
            console.log(`[SKIP] ⚠️ Source not found: ${folder.name}`);
            continue;
        }

        try {
            const targetPath = folder.target;
            if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });

            const items = fs.readdirSync(sourcePath);
            let movedItems = 0;

            for (const item of items) {
                const iSource = path.join(sourcePath, item);
                const iTarget = path.join(targetPath, item);

                if (fs.existsSync(iTarget)) {
                    console.warn(`[CONFLICT] ⚠️ Overwriting: ${item}`);
                    // For directories, we'd need recursive move, but keeping it simple for now
                }
                fs.renameSync(iSource, iTarget);
                movedItems++;
            }

            // Cleanup source folder if empty
            if (fs.readdirSync(sourcePath).length === 0) {
                fs.rmdirSync(sourcePath);
            }

            console.log(`[MIGRATION] 🟩 Successfully moved '${folder.name}' -> '${path.relative(ROOT_DIR, targetPath)}' (${movedItems} items)`);
            migrations++;
        } catch (e: any) {
            console.error(`[MIGRATION] ❌ Failed to migrate '${folder.name}': ${e.message}`);
        }
    }
    return migrations;
}

// Complexity: O(n)
async function migrateRootFiles() {
    console.log(`\n[FILES] Migrating stray files from root...`);
    const items = fs.readdirSync(ROOT_DIR);
    let movedFiles = 0;

    for (const item of items) {
        const fullPath = path.join(ROOT_DIR, item);
        const stats = fs.statSync(fullPath);

        if (stats.isFile()) {
            let targetDir = '';
            if (item.endsWith('.ts') && item !== 'index.ts' && item !== '_index.ts') {
                targetDir = TARGET_ARCHITECTURE.SCRIPTS;
            } else if (item.endsWith('.md') && item !== 'README.md' && item !== 'DOCUMENTATION.md') {
                targetDir = TARGET_ARCHITECTURE.DOCS_STANDARDS;
            }

            if (targetDir) {
                const targetPath = path.join(targetDir, item);
                fs.renameSync(fullPath, targetPath);
                console.log(`[FILE] 📄 Moved ${item} -> ${path.relative(ROOT_DIR, targetDir)}`);
                movedFiles++;
            }
        }
    }
    return movedFiles;
}

// Complexity: O(n)
async function run() {
    console.log(`\n/// INIT: QANTUM ARCHITECTURAL RE-ORGANIZER ///`);
    console.log(`[VERITAS] Rebuilding project tree to strictly standard patterns...\n`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await ensureTargetInfrastructure();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const folderMigrations = await migrateFolders();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const fileMigrations = await migrateRootFiles();

    console.log(`\n/// STATUS: COMPLETED ///`);
    console.log(`/// FOLDER MIGRATIONS: ${folderMigrations} ///`);
    console.log(`/// FILE MIGRATIONS: ${fileMigrations} ///`);
    console.log(`/// ENTROPY MAINTAINED: 0.00 ///\n`);
}

run().catch(console.error);
