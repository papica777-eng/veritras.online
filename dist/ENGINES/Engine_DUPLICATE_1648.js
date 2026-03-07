"use strict";
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
exports.Engine = void 0;
// @ts-nocheck
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Engine {
    static instance;
    patterns = {};
    constructor() {
        this.loadPatterns();
    }
    static getInstance() {
        if (!Engine.instance) {
            Engine.instance = new Engine();
        }
        return Engine.instance;
    }
    loadPatterns() {
        try {
            const patternsPath = path.join(__dirname, '../data/patterns.json');
            const data = fs.readFileSync(patternsPath, 'utf-8');
            this.patterns = JSON.parse(data);
            console.log('[RefactorX] Patterns loaded successfully.');
        }
        catch (error) {
            console.error('[RefactorX] FAILED TO LOAD PATTERNS:', error);
            // Fallback empty state
            this.patterns = {};
        }
    }
    async scanLegacy(dirPath) {
        const issues = [];
        const files = this.getFiles(dirPath);
        console.log(`[RefactorX] Scanning ${files.length} files in ${dirPath}...`);
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const ext = path.extname(file).replace('.', '');
            if (this.patterns[ext]) {
                this.checkPatterns(file, content, this.patterns[ext], issues);
            }
            else if (['ts', 'tsx'].includes(ext) && this.patterns['js']) {
                this.checkPatterns(file, content, this.patterns['js'], issues);
            }
        }
        return issues;
    }
    async fix(filePath, issues) {
        if (!fs.existsSync(filePath))
            return false;
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;
        const lines = content.split('\n');
        // Sort issues by line number descending to avoid offset drift
        issues.sort((a, b) => b.line - a.line);
        for (const issue of issues) {
            let replacement = '';
            // Flatten patterns manually without .flat() for compatibility
            let allPatterns = [];
            Object.keys(this.patterns).forEach(key => {
                allPatterns = allPatterns.concat(this.patterns[key]);
            });
            // Find matching pattern
            // We use the stored regex string in issue.pattern
            const matchedPattern = allPatterns.find(p => p.regex && new RegExp(p.regex).toString() === issue.pattern);
            if (matchedPattern) {
                replacement = matchedPattern.replace;
            }
            if (replacement && lines[issue.line - 1]) {
                // Re-create regex from the stored string pattern
                // issue.pattern comes from match.toString() which wraps in /.../
                const regexParts = issue.pattern.match(/\/(.*)\//);
                if (regexParts) {
                    const regex = new RegExp(regexParts[1]);
                    console.log(`[RefactorX] Fixing ${path.basename(filePath)} Line ${issue.line}: ${issue.pattern} -> ${replacement}`);
                    lines[issue.line - 1] = lines[issue.line - 1].replace(regex, replacement);
                    modified = true;
                }
            }
        }
        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
            return true;
        }
        return false;
    }
    checkPatterns(file, content, patterns, issues) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            patterns.forEach(p => {
                const regex = new RegExp(p.regex);
                if (regex.test(line)) {
                    issues.push({
                        file: path.basename(file),
                        line: index + 1,
                        pattern: regex.toString(),
                        suggestion: p.msg,
                        severity: p.severity
                    });
                }
            });
        });
    }
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
    generatePlan(issues) {
        if (issues.length === 0)
            return "✅ System is Clean & Modern.";
        const critical = issues.filter(i => i.severity === 'critical').length;
        const high = issues.filter(i => i.severity === 'high').length;
        return `
# 🏗️ REFACTOR X REPORT
**Autonomous Analysis**

## 🚨 Critical Violations: ${critical} (Auto-Fix Ready)
## ⚠️ High Debt: ${high}
## ℹ️ Total Issues: ${issues.length}

RefactorX is ready to perform surgical remediation.
        `.trim();
    }
}
exports.Engine = Engine;
