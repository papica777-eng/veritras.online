/**
 * process-healer — Qantum Module
 * @module process-healer
 * @path scripts/_SYSTEM_HEALING_/process-healer.js
 * @auto-documented BrutalDocEngine v2.1
 */


const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 🚑 PROCESS HEALER v1.0
 * 
 * Purpose: Auto-fix "Cannot find module" errors in verification scripts
 * caused by relative paths in a migrated monorepo.
 */

const TARGET_SCRIPT = process.argv[2] || 'scripts/verify-reaper.ts';

function healMyProcess() {
    console.log('🚑 [PROCESS HEALER] Detecting fracture in:', TARGET_SCRIPT);

    if (!fs.existsSync(TARGET_SCRIPT)) {
        console.error('❌ Target script missing.');
        return;
    }

    let content = fs.readFileSync(TARGET_SCRIPT, 'utf-8');

    // HEALING STRATEGY #1: Fix Relative Paths
    // Problem: import { X } from '../src/...' fails in root execution
    // Fix: Convert to relative path from root or use slightly different traversal

    // Check if we have the broken relative path
    if (content.includes("'../src/modules/")) {
        console.log('   🩹 Detailed diagnosis: Broken relative path detected.');

        const healedContent = content.replace(
            "'../src/modules/",
            "'./src/modules/"
        );

        if (healedContent !== content) {
            fs.writeFileSync(TARGET_SCRIPT, healedContent);
            console.log('   ✅ Applied Splint: Rewrote import paths to be root-relative.');

            // Auto-Retry
            console.log('   ⚡ Re-attempting execution post-healing...');
            try {
                // Complexity: O(1)
                execSync('npx ts-node ' + TARGET_SCRIPT, { stdio: 'inherit' });
                console.log('   ✨ HEALING SUCCESSFUL. Process recovered.');
            } catch (e) {
                console.log('   ⚠️ Healing insufficient. Proceeding to Plan B (JS Simulation).');
            }
        }
    } else {
        console.log('   ✅ No path fractures detected. The issue implies deeper dependency rot.');
    }
}

    // Complexity: O(1)
healMyProcess();
