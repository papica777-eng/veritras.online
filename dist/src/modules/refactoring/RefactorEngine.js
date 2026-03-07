"use strict";
/**
 * RefactorEngine — Qantum Module
 * @module RefactorEngine
 * @path src/modules/refactoring/RefactorEngine.ts
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
exports.RefactorEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class RefactorEngine {
    static instance;
    memoryBank = new Map();
    // LEGACY PATTERNS DATABASE
    patterns = {
        php: [
            { regex: /mysql_query\(/, replace: 'pdo->query(', msg: "Deprecated MySQL extension. Use PDO or MySQLi.", severity: 'critical' },
            { regex: /die\(/, replace: 'throw new Exception(', msg: "Uncontrolled termination. Use Exceptions.", severity: 'high' },
            { regex: /\$_GET\[/, replace: 'filter_input(INPUT_GET, ', msg: "Direct Input Access. Potential XSS/SQLi.", severity: 'critical' }
        ],
        java: [
            { regex: /Vector</, replace: 'ArrayList<', msg: "Legacy Collection. Use ArrayList.", severity: 'medium' },
            { regex: /Hashtable</, replace: 'HashMap<', msg: "Legacy Map. Use HashMap.", severity: 'medium' },
            { regex: /StringBuffer/, replace: 'StringBuilder', msg: "Synchronized overhead. Use StringBuilder.", severity: 'low' }
        ],
        js: [
            { regex: /var\s+/, replace: 'let ', msg: "Scope leakage. Use let/const.", severity: 'medium' },
            { regex: /function\s*\(/, replace: '(', msg: "Legacy syntax. Consider Arrow Functions.", severity: 'low' },
            { regex: /document\.write/, replace: 'document.body.append', msg: "Performance killer. Use DOM manipulation.", severity: 'high' }
        ]
    };
    static getInstance() {
        if (!RefactorEngine.instance) {
            RefactorEngine.instance = new RefactorEngine();
        }
        return RefactorEngine.instance;
    }
    /**
     * Scans a directory for legacy code patterns
     */
    // Complexity: O(N) — linear iteration
    async scanLegacy(dirPath) {
        const issues = [];
        const files = this.getFiles(dirPath);
        console.log(`[ReferactorEngine] Scanning ${files.length} files in ${dirPath}...`);
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const ext = path.extname(file).replace('.', '');
            // Check PHP
            if (ext === 'php') {
                this.checkPatterns(file, content, this.patterns.php, issues);
            }
            // Check Java
            else if (ext === 'java') {
                this.checkPatterns(file, content, this.patterns.java, issues);
            }
            // Check JS/TS
            else if (['js', 'ts', 'tsx'].includes(ext)) {
                this.checkPatterns(file, content, this.patterns.js, issues);
            }
        }
        return issues;
    }
    /**
     * Automatically fixes the identified issues in a file
     */
    // Complexity: O(N*M) — nested iteration detected
    async fix(filePath, issues) {
        if (!fs.existsSync(filePath))
            return false;
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;
        for (const issue of issues) {
            // Find the replacement logic from the database based on the pattern
            // This is a simplified "Smart Match" for the demo
            let replacement = '';
            // Search in all languages for the pattern match
            [...this.patterns.php, ...this.patterns.java, ...this.patterns.js].forEach(p => {
                if (p.regex.toString() === issue.pattern) {
                    replacement = p.replace;
                }
            });
            if (replacement) {
                // Perform the surgical replacement on the specific line
                const lines = content.split('\n');
                if (lines[issue.line - 1]) {
                    // We construct a regex from the string pattern stored in the issue
                    // Note: This is an emulation of the complex AST logic for reliability in the demo
                    const regexParts = issue.pattern.match(/\/(.*)\//);
                    if (regexParts) {
                        const regex = new RegExp(regexParts[1]);
                        console.log(`[RefactorEngine] Fixing ${path.basename(filePath)} Line ${issue.line}: ${issue.pattern} -> ${replacement}`);
                        lines[issue.line - 1] = lines[issue.line - 1].replace(regex, replacement);
                        content = lines.join('\n');
                        modified = true;
                    }
                }
            }
        }
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf-8');
            return true;
        }
        return false;
    }
    // Complexity: O(N) — linear iteration
    checkPatterns(file, content, patterns, issues) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            patterns.forEach(p => {
                if (p.regex.test(line)) {
                    issues.push({
                        file: path.basename(file),
                        line: index + 1,
                        pattern: p.regex.toString(),
                        suggestion: p.msg,
                        severity: p.severity
                    });
                }
            });
        });
    }
    // Complexity: O(N) — linear iteration
    getFiles(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                if (!file.includes('node_modules') && !file.includes('.git')) {
                    results = results.concat(this.getFiles(file));
                }
            }
            else {
                results.push(file);
            }
        });
        return results;
    }
    /**
     * Generates a Modernization Plan based on findings
     */
    // Complexity: O(N) — linear iteration
    generatePlan(issues) {
        if (issues.length === 0)
            return "✅ System is Clean & Modern.";
        const critical = issues.filter(i => i.severity === 'critical').length;
        const high = issues.filter(i => i.severity === 'high').length;
        return `
# 🏗️ QAntum REFACTOR PLAN (ACTIVE SURGERY)
**Target System Health Analysis**

## 🚨 Critical Architecture Violations: ${critical} (Auto-Fix Ready)
## ⚠️ High Priority Debt: ${high}
## ℹ️ Total Improvements: ${issues.length}

### Enabled Auto-Refactoring Actions:
1. **Security Hardening:** Immediate migration of ${critical} database interactions (SQLi Risk) -> PDO.
2. **Performance Optimization:** Replacing legacy Collections with fast ArrayList/HashMap.
3. **Modernization:** Upgrading variable scope handling (var -> let).

*Generated by QAntum Prime Refactor Engine v2.0*
        `.trim();
    }
}
exports.RefactorEngine = RefactorEngine;
