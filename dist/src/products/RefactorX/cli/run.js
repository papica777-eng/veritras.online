"use strict";
/**
 * run — Qantum Module
 * @module run
 * @path src/products/RefactorX/cli/run.ts
 * @auto-documented BrutalDocEngine v2.1
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
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Engine_1 = require("../core/Engine");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Simple CLI wrapper for RefactorX
async function main() {
    const targetPath = process.argv[2];
    const mode = process.argv[3] || 'scan'; // 'scan' or 'fix'
    if (!targetPath) {
        console.error('Usage: ts-node run.ts <file-or-directory> [scan|fix]');
        process.exit(1);
    }
    const absolutePath = path.resolve(process.cwd(), targetPath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: Path not found: ${absolutePath}`);
        process.exit(1);
    }
    const engine = Engine_1.Engine.getInstance();
    console.log('\n🔍 REFACTOR X (ISOLATED MODE) 🔍');
    console.log('-----------------------------------');
    console.log(`Target: ${absolutePath}`);
    console.log(`Mode:   ${mode.toUpperCase()}`);
    console.log('-----------------------------------\n');
    // Determine if target is directory or file
    const isDir = fs.statSync(absolutePath).isDirectory();
    // Scan
    // SAFETY: async operation — wrap in try-catch for production resilience
    const issues = await engine.scanLegacy(isDir ? absolutePath : path.dirname(absolutePath));
    // Filter issues for the specific file if target is a file
    const relevantIssues = isDir
        ? issues
        : issues.filter(i => i.file === path.basename(absolutePath));
    if (relevantIssues.length === 0) {
        console.log('✅ No legacy patterns found.');
        return;
    }
    console.log(engine.generatePlan(relevantIssues));
    if (mode === 'fix') {
        if (isDir) {
            console.error('⚠️  Fixing entire directories is disabled in Safety Mode. Please target specific files.');
            return;
        }
        console.log('\n[SURGEON] Attempting Auto-Fix...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, 1000));
        // SAFETY: async operation — wrap in try-catch for production resilience
        const success = await engine.fix(absolutePath, relevantIssues);
        if (success) {
            console.log('\n✅ FILE PATCHED SUCCESSFULLY.');
        }
        else {
            console.error('\n❌ Patch failed or no changes needed.');
        }
    }
}
// Complexity: O(1)
main();
