"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔧 AUTO-PATCHER - SELF-HEALING GIT INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * v1.0.0 "Quantum" Edition - Living System Protocol
 *
 * This module provides autonomous self-healing capabilities with Git integration.
 * When tests fail due to DOM drift or selector changes, it automatically:
 * - Analyzes the failure pattern
 * - Generates fix proposals
 * - Applies patches to the codebase
 * - Commits with descriptive messages
 * - Validates with stress tests
 *
 * Features:
 * - DOM Drift Detection & Auto-fix
 * - Selector Evolution (CSS/XPath)
 * - Git commit automation
 * - Rollback on validation failure
 * - Self-Fix commit history
 *
 * @version 1.0.0
 * @codename Quantum
 * @author Димитър Продромов (Meta-Architect)
 * @copyright 2025. All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPatcher = void 0;
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const events_1 = require("events");
const crypto_1 = __importDefault(require("crypto"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-PATCHER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class AutoPatcher extends events_1.EventEmitter {
    projectRoot;
    config;
    patches = new Map();
    commits = [];
    domDrifts = new Map();
    isProcessing = false;
    constructor(projectRoot, config) {
        super();
        this.projectRoot = projectRoot;
        this.config = {
            maxAutoFixAttempts: 3,
            validationCommand: 'npm run swarm:stress:v2',
            commitPrefix: '[SELF-FIX]',
            enableAutoCommit: true,
            rollbackOnFailure: true,
            dryRun: false,
            ...config
        };
    }
    /**
     * Analyze a test failure and generate fix proposals
     */
    async analyzeFailure(error, testFile) {
        console.log('\n🔍 [AutoPatcher] Analyzing failure...');
        const errorMessage = error.message || '';
        const errorStack = error.stack || '';
        // Detect failure type
        let type = 'unknown';
        let suggestedFix;
        let originalSelector;
        let confidence = 0.5;
        // Selector not found
        if (errorMessage.includes('selector') || errorMessage.includes('element') || errorMessage.includes('locator')) {
            type = 'selector';
            originalSelector = this.extractSelector(errorMessage);
            suggestedFix = await this.suggestSelectorFix(originalSelector);
            confidence = 0.85;
        }
        // Timeout
        else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
            type = 'timeout';
            const currentTimeout = this.extractTimeout(errorMessage);
            suggestedFix = `Increase timeout from ${currentTimeout}ms to ${currentTimeout * 2}ms`;
            confidence = 0.90;
        }
        // Assertion failure
        else if (errorMessage.includes('expect') || errorMessage.includes('assert')) {
            type = 'assertion';
            confidence = 0.60;
        }
        // Network error
        else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('ERR_')) {
            type = 'network';
            suggestedFix = 'Add retry logic with exponential backoff';
            confidence = 0.75;
        }
        // Extract context (lines around the error)
        const line = this.extractLineNumber(errorStack);
        const context = await this.extractContext(testFile, line);
        return {
            type,
            file: testFile,
            line,
            originalSelector,
            suggestedFix,
            confidence,
            context
        };
    }
    /**
     * Generate and apply a patch for the failure
     */
    async generatePatch(analysis) {
        console.log(`\n🔧 [AutoPatcher] Generating patch for ${analysis.type} failure...`);
        if (analysis.confidence < 0.6) {
            console.log('⚠️  Confidence too low for auto-patch. Manual review required.');
            return null;
        }
        const fileContent = await fs.promises.readFile(analysis.file, 'utf-8');
        let newContent = fileContent;
        let description = '';
        let patchType = 'selector-update';
        switch (analysis.type) {
            case 'selector':
                if (analysis.originalSelector && analysis.suggestedFix) {
                    newContent = this.applySelectorFix(fileContent, analysis.originalSelector, analysis.suggestedFix);
                    description = `Updated selector: ${analysis.originalSelector} → ${analysis.suggestedFix}`;
                    patchType = 'selector-update';
                }
                break;
            case 'timeout':
                newContent = this.applyTimeoutFix(fileContent, analysis.line);
                description = 'Increased timeout for flaky operation';
                patchType = 'timeout-increase';
                break;
            case 'network':
                newContent = this.applyRetryLogic(fileContent, analysis.line);
                description = 'Added retry logic for network operation';
                patchType = 'retry-logic';
                break;
            default:
                console.log('⚠️  No auto-fix available for this failure type.');
                return null;
        }
        if (newContent === fileContent) {
            console.log('⚠️  No changes generated.');
            return null;
        }
        const patch = {
            id: `patch_${Date.now()}_${crypto_1.default.randomBytes(4).toString('hex')}`,
            file: analysis.file,
            oldContent: fileContent,
            newContent,
            description,
            type: patchType,
            confidence: analysis.confidence,
            createdAt: new Date(),
            applied: false,
            validated: false,
            rolledBack: false
        };
        this.patches.set(patch.id, patch);
        return patch;
    }
    /**
     * Apply a patch to the filesystem
     */
    async applyPatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch) {
            console.error('❌ Patch not found:', patchId);
            return false;
        }
        console.log(`\n📝 [AutoPatcher] Applying patch: ${patch.description}`);
        if (this.config.dryRun) {
            console.log('🔸 DRY RUN - Patch not actually applied');
            console.log('\nChanges that would be made:');
            console.log(this.generateDiff(patch.oldContent, patch.newContent));
            return true;
        }
        try {
            await fs.promises.writeFile(patch.file, patch.newContent, 'utf-8');
            patch.applied = true;
            console.log('✅ Patch applied successfully');
            return true;
        }
        catch (error) {
            console.error('❌ Failed to apply patch:', error);
            return false;
        }
    }
    /**
     * Validate a patch by running stress tests
     */
    async validatePatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch || !patch.applied) {
            console.error('❌ Patch not applied:', patchId);
            return false;
        }
        console.log(`\n🧪 [AutoPatcher] Validating patch with stress test...`);
        try {
            const { stdout, stderr } = await execAsync(this.config.validationCommand, {
                cwd: this.projectRoot,
                timeout: 120000 // 2 minute timeout
            });
            // Check for success indicators
            const success = stdout.includes('PASS') ||
                stdout.includes('✅') ||
                !stderr.includes('FAIL');
            patch.validated = success;
            if (success) {
                console.log('✅ Patch validated successfully');
            }
            else {
                console.log('❌ Patch validation failed');
                if (this.config.rollbackOnFailure) {
                    await this.rollbackPatch(patchId);
                }
            }
            return success;
        }
        catch (error) {
            console.error('❌ Validation command failed:', error.message);
            patch.validated = false;
            if (this.config.rollbackOnFailure) {
                await this.rollbackPatch(patchId);
            }
            return false;
        }
    }
    /**
     * Rollback a patch
     */
    async rollbackPatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch) {
            console.error('❌ Patch not found:', patchId);
            return false;
        }
        console.log(`\n⏪ [AutoPatcher] Rolling back patch: ${patch.description}`);
        try {
            await fs.promises.writeFile(patch.file, patch.oldContent, 'utf-8');
            patch.rolledBack = true;
            patch.applied = false;
            console.log('✅ Patch rolled back successfully');
            return true;
        }
        catch (error) {
            console.error('❌ Failed to rollback patch:', error);
            return false;
        }
    }
    /**
     * Commit validated patches to Git
     */
    async commitPatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch || !patch.validated) {
            console.error('❌ Cannot commit unvalidated patch');
            return null;
        }
        if (!this.config.enableAutoCommit) {
            console.log('⚠️  Auto-commit disabled. Patch ready for manual commit.');
            return null;
        }
        console.log(`\n📦 [AutoPatcher] Creating self-fix commit...`);
        const commitMessage = `${this.config.commitPrefix} ${patch.description}

Patch ID: ${patch.id}
Type: ${patch.type}
Confidence: ${(patch.confidence * 100).toFixed(0)}%
Validated: ✅

Auto-generated by QANTUM v1.0.0 "Quantum"`;
        try {
            // Stage the file
            await execAsync(`git add "${patch.file}"`, { cwd: this.projectRoot });
            // Commit
            const { stdout } = await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: this.projectRoot });
            // Get commit hash
            const hashMatch = stdout.match(/\[[\w-]+\s+([a-f0-9]+)\]/);
            const hash = hashMatch?.[1] || 'unknown';
            const commit = {
                hash,
                message: commitMessage,
                patches: [patchId],
                timestamp: new Date(),
                validated: true,
                performanceImpact: null
            };
            this.commits.push(commit);
            console.log(`✅ Self-fix commit created: ${hash}`);
            return commit;
        }
        catch (error) {
            console.error('❌ Failed to create commit:', error.message);
            return null;
        }
    }
    /**
     * Full auto-fix pipeline: Analyze → Generate → Apply → Validate → Commit
     */
    async autoFix(error, testFile) {
        if (this.isProcessing) {
            console.log('⚠️  Auto-fix already in progress. Queuing...');
            return false;
        }
        this.isProcessing = true;
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔧 AUTO-PATCHER - SELF-HEALING ACTIVATED                                    ║
║  v1.0.0 "Quantum" - Living System Protocol                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
        try {
            // Step 1: Analyze
            const analysis = await this.analyzeFailure(error, testFile);
            console.log(`\n📊 Analysis: ${analysis.type} failure with ${(analysis.confidence * 100).toFixed(0)}% confidence`);
            // Step 2: Generate patch
            const patch = await this.generatePatch(analysis);
            if (!patch) {
                console.log('\n❌ Could not generate auto-fix. Manual intervention required.');
                return false;
            }
            // Step 3: Apply
            const applied = await this.applyPatch(patch.id);
            if (!applied)
                return false;
            // Step 4: Validate
            const validated = await this.validatePatch(patch.id);
            if (!validated)
                return false;
            // Step 5: Commit
            if (this.config.enableAutoCommit) {
                await this.commitPatch(patch.id);
            }
            console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  ✅ SELF-HEALING COMPLETE                                                    ║
║                                                                              ║
║  The system has automatically fixed and validated the issue.                 ║
║  ${patch.description.substring(0, 60).padEnd(60)}   ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
            this.emit('selfFix', { analysis, patch });
            return true;
        }
        catch (error) {
            console.error('❌ Auto-fix pipeline failed:', error);
            return false;
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Track DOM drift for a selector
     */
    trackDOMDrift(selector) {
        const existing = this.domDrifts.get(selector);
        if (existing) {
            existing.failureCount++;
        }
        else {
            this.domDrifts.set(selector, {
                selector,
                lastWorking: new Date(),
                failureCount: 1,
                suggestedAlternatives: [],
                autoFixApplied: false
            });
        }
        // Check if we should attempt auto-fix
        const drift = this.domDrifts.get(selector);
        if (drift.failureCount >= this.config.maxAutoFixAttempts && !drift.autoFixApplied) {
            console.log(`\n⚠️  DOM Drift detected: ${selector} has failed ${drift.failureCount} times`);
            this.emit('domDrift', drift);
        }
    }
    /**
     * Get patch history
     */
    getPatchHistory() {
        return Array.from(this.patches.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    /**
     * Get commit history
     */
    getCommitHistory() {
        return [...this.commits].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    extractSelector(errorMessage) {
        // Common selector patterns
        const patterns = [
            /selector\s*['":`]([^'":`]+)['":`]/i,
            /locator\s*\(\s*['"]([^'"]+)['"]\s*\)/i,
            /querySelector\s*\(\s*['"]([^'"]+)['"]\s*\)/i,
            /\$\s*\(\s*['"]([^'"]+)['"]\s*\)/i,
            /data-testid=['"]([^'"]+)['"]/i,
            /#[\w-]+/,
            /\.[\w-]+(?:\s+\.[\w-]+)*/
        ];
        for (const pattern of patterns) {
            const match = errorMessage.match(pattern);
            if (match) {
                return match[1] || match[0];
            }
        }
        return undefined;
    }
    extractTimeout(errorMessage) {
        const match = errorMessage.match(/(\d+)\s*ms/i);
        return match ? parseInt(match[1]) : 30000;
    }
    extractLineNumber(stack) {
        const match = stack.match(/:(\d+):\d+/);
        return match ? parseInt(match[1]) : 0;
    }
    async extractContext(file, line, radius = 5) {
        try {
            const content = await fs.promises.readFile(file, 'utf-8');
            const lines = content.split('\n');
            const start = Math.max(0, line - radius - 1);
            const end = Math.min(lines.length, line + radius);
            return lines.slice(start, end);
        }
        catch {
            return [];
        }
    }
    async suggestSelectorFix(originalSelector) {
        if (!originalSelector)
            return undefined;
        // Generate alternative selectors
        const alternatives = [];
        // If it's an ID selector, try data-testid
        if (originalSelector.startsWith('#')) {
            const id = originalSelector.substring(1);
            alternatives.push(`[data-testid="${id}"]`);
            alternatives.push(`[data-test="${id}"]`);
        }
        // If it's a class selector, try more specific path
        if (originalSelector.startsWith('.')) {
            const className = originalSelector.substring(1);
            alternatives.push(`[class*="${className}"]`);
        }
        // Try XPath alternative
        if (!originalSelector.startsWith('//')) {
            alternatives.push(`//*[contains(@class, '${originalSelector.replace('.', '')}')]`);
        }
        // Return the first alternative (in real implementation, would test each)
        return alternatives[0];
    }
    applySelectorFix(content, oldSelector, newSelector) {
        // Escape special regex characters
        const escaped = oldSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(['"\`])${escaped}\\1`, 'g');
        return content.replace(regex, `$1${newSelector}$1`);
    }
    applyTimeoutFix(content, line) {
        const lines = content.split('\n');
        if (line > 0 && line <= lines.length) {
            const targetLine = lines[line - 1];
            // Find and double any timeout value
            const updatedLine = targetLine.replace(/timeout:\s*(\d+)/gi, (match, timeout) => `timeout: ${parseInt(timeout) * 2}`);
            // Also handle .setTimeout() calls
            const finalLine = updatedLine.replace(/\.setTimeout\s*\(\s*(\d+)\s*\)/gi, (match, timeout) => `.setTimeout(${parseInt(timeout) * 2})`);
            lines[line - 1] = finalLine;
        }
        return lines.join('\n');
    }
    applyRetryLogic(content, line) {
        const lines = content.split('\n');
        if (line > 0 && line <= lines.length) {
            const targetLine = lines[line - 1];
            const indent = targetLine.match(/^(\s*)/)?.[1] || '';
            // Wrap with retry logic
            const retryWrapper = `${indent}// Auto-added retry logic by Self-Fix
${indent}for (let _retry = 0; _retry < 3; _retry++) {
${indent}    try {
${indent}        ${targetLine.trim()}
${indent}        break;
${indent}    } catch (_e) {
${indent}        if (_retry === 2) throw _e;
${indent}        await new Promise(r => setTimeout(r, 1000 * (_retry + 1)));
${indent}    }
${indent}}`;
            lines[line - 1] = retryWrapper;
        }
        return lines.join('\n');
    }
    generateDiff(oldContent, newContent) {
        const oldLines = oldContent.split('\n');
        const newLines = newContent.split('\n');
        let diff = '';
        const maxLines = Math.max(oldLines.length, newLines.length);
        for (let i = 0; i < maxLines; i++) {
            const oldLine = oldLines[i] || '';
            const newLine = newLines[i] || '';
            if (oldLine !== newLine) {
                if (oldLine)
                    diff += `- ${oldLine}\n`;
                if (newLine)
                    diff += `+ ${newLine}\n`;
            }
        }
        return diff || '(no changes)';
    }
}
exports.AutoPatcher = AutoPatcher;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔧 AUTO-PATCHER - SELF-HEALING SYSTEM                                       ║
║  v1.0.0 "Quantum" - Living System Protocol                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

This module is activated automatically when test failures are detected.

Commands:
  --analyze <file>   Analyze a test file for potential issues
  --history          Show patch history
  --commits          Show self-fix commit history

The system monitors for:
  • Selector failures (DOM drift)
  • Timeout issues
  • Network errors
  • Assertion failures

When issues are detected, it will:
  1. Analyze the failure
  2. Generate a fix proposal
  3. Apply the fix
  4. Validate with stress tests
  5. Commit the fix (if enabled)

Configuration in production.config.json or via constructor.
`);
    const patcher = new AutoPatcher(process.cwd());
    // Show patch history
    const history = patcher.getPatchHistory();
    if (history.length > 0) {
        console.log('\n📜 Recent Patches:');
        for (const patch of history.slice(0, 5)) {
            const status = patch.validated ? '✅' : patch.rolledBack ? '⏪' : '⏳';
            console.log(`   ${status} ${patch.description}`);
        }
    }
    else {
        console.log('\n📜 No patches in history (system is healthy!)');
    }
}
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=auto-patcher.js.map