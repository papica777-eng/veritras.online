/**
 * organize-modules — Qantum Module
 * @module organize-modules
 * @path scripts/_SYSTEM_HEALING_/organize-modules.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import * as fs from 'fs';
import * as path from 'path';

// 🗺️ THE GREAT RESTRUCTURING MAP
// 5 SECTORS (~100 modules each)

const SECTORS = {
    'ALPHA_FINANCE': [
        'sales', 'saas', 'products', 'market', 'sovereign', 'dashboard', 'sales-index', 'saas-index',
        'SovereignAudit', 'ReaperDashboard', 'SelfHealingSales'
    ],
    'BETA_SECURITY': [
        'security', 'ghost', 'guardians', 'protection', 'vault', 'encryption', 'StrictCollar', 'SecureConfigLoader',
        'TurnstileBypassAnalysis', 'process-killer-log', 'api-gateway', 'validation-index'
    ],
    'GAMMA_INFRA': [
        'core', 'config', 'utils', 'tools', 'types', 'tools_root', 'api-index', 'data-index', 'visual-index',
        'Run-Agent-bat', 'Start-Server-bat', 'Start-bat', 'Status-bat', 'Stop-bat', 'staging', 'staging_root'
    ],
    'DELTA_SCIENCE': [
        'biology', 'healing', 'evolution', 'metabolism', 'self-healing', 'physics', 'quantum', 'mechanics', 'chaos',
        'synthesis-index', 'scan', 'scanner', 'SelfHealing', 'cross-module-sync' // Healing is biological
    ],
    'OMEGA_MIND': [
        'brain', 'cognition', 'intelligence', 'training', 'ai', 'neural', 'chronos', 'omega', 'time-traveler',
        'agents', 'SwarmAgents', 'SwarmMesh', 'JULES', 'MAGICSTICK', 'MisterMindPage', 'QANTUM_ARCHITECT'
    ]
};

const SOURCE_ROOT = path.join(process.cwd(), 'src/modules/_root_migrated');
const TARGET_ROOT = path.join(process.cwd(), 'src/modules');

async function structure() {
    console.log('🏗️ STARTING ECOSYSTEM RESTRUCTURING...');

    if (!fs.existsSync(SOURCE_ROOT)) {
        console.error('❌ Source root not found!');
        return;
    }

    // 1. Create Sector Dirs
    for (const sector of Object.keys(SECTORS)) {
        const sectorPath = path.join(TARGET_ROOT, sector);
        if (!fs.existsSync(sectorPath)) fs.mkdirSync(sectorPath, { recursive: true });
    }

    // 2. Scan and Move
    const items = fs.readdirSync(SOURCE_ROOT, { withFileTypes: true });

    for (const item of items) {
        if (!item.isDirectory()) continue;

        const folderName = item.name;
        let assignedSector = 'GAMMA_INFRA'; // Default fallback

        // Find Sector
        for (const [sector, keywords] of Object.entries(SECTORS)) {
            // Check exact match or keyword inclusion
            if (keywords.some(k => folderName.toLowerCase().includes(k.toLowerCase()))) {
                assignedSector = sector;
                break;
            }
        }

        // Move
        const srcPath = path.join(SOURCE_ROOT, folderName);
        const destPath = path.join(TARGET_ROOT, assignedSector, folderName);

        console.log(`➡️ Moving [${folderName}] to [${assignedSector}]...`);

        try {
            fs.renameSync(srcPath, destPath);
        } catch (e) {
            console.error(`❌ Failed to move ${folderName}:`, e.message);
            // Try copy-delete if rename fails (cross-device)
            try {
                fs.cpSync(srcPath, destPath, { recursive: true });
                fs.rmSync(srcPath, { recursive: true, force: true });
                console.log(`   (Cp+Rm Success)`);
            } catch (e2) {
                console.error(`   (Fatal Error)`);
            }
        }
    }

    // 3. Clean up empty root
    try {
        fs.rmdirSync(SOURCE_ROOT);
        console.log('🧹 Removed empty _root_migrated container.');
    } catch (e) {
        console.log('⚠️ Could not remove root container (might not be empty).');
    }

    console.log('✅ RESTRUCTURING COMPLETE.');
}

    // Complexity: O(1)
structure();
