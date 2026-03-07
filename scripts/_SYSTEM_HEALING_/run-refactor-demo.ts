/**
 * run-refactor-demo — Qantum Module
 * @module run-refactor-demo
 * @path scripts/_SYSTEM_HEALING_/run-refactor-demo.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import { RefactorEngine } from '../../src/modules/refactoring/RefactorEngine';
import * as fs from 'fs';
import * as path from 'path';

async function runDemo() {
    const targetFile = path.resolve(__dirname, '../demo-legacy.php');
    const engine = RefactorEngine.getInstance();

    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   QANTUM PRIME: REFACTOR ENGINE DEMO      ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    // 1. Initial Scan
    console.log(`[1] Scanning ${path.basename(targetFile)} for legacy patterns...`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const issues = await engine.scanLegacy(path.dirname(targetFile));
    const fileIssues = issues.filter(i => i.file === 'demo-legacy.php');

    if (fileIssues.length === 0) {
        console.log('No issues found? Something is wrong with the test.');
        return;
    }

    console.log(`    Found ${fileIssues.length} issues in demo file.`);
    fileIssues.forEach(i => {
        console.log(`    ⚠️  [${i.severity.toUpperCase()}] Line ${i.line}: ${i.pattern} -> ${i.suggestion}`);
    });

    // 2. Generate Plan
    console.log('\n[2] Generating Modernization Strategy...');
    console.log(engine.generatePlan(fileIssues));

    // 3. Execution (Surgeon Mode)
    console.log('\n[3] ACTIVATING SURGEON MODE (Auto-Fix)...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise(r => setTimeout(r, 2000)); // Dramatic pause

    // SAFETY: async operation — wrap in try-catch for production resilience
    const success = await engine.fix(targetFile, fileIssues);

    if (success) {
        console.log('\n✅ REFACTORING COMPLETE.');
        console.log('    Verifying file content...');
        const newContent = fs.readFileSync(targetFile, 'utf-8');
        console.log('\n--- [ NEW CONTENT ] ---');
        console.log(newContent);
        console.log('-----------------------');
        console.log('\nResult: Legacy code eliminated. System modernized.');
    } else {
        console.error('❌ Refactoring failed.');
    }
}

    // Complexity: O(1)
runDemo();
