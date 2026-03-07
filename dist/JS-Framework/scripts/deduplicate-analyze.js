#!/usr/bin/env node
"use strict";
/**
 * 🔥 PHASE 1: DEDUPLICATION + ANALYSIS
 *
 * This script performs:
 * 1. SHA-256 hashing of all source files
 * 2. Identifies and removes identical duplicates
 * 3. Groups files by similarity (>90% code overlap)
 * 4. Generates TAXONOMY.json with domain categorization
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
exports.DeduplicationAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class DeduplicationAnalyzer {
    fileMap = new Map();
    hashMap = new Map();
    rootDir;
    extensions = ['.ts', '.js', '.go', '.py'];
    constructor(rootDir) {
        this.rootDir = rootDir;
    }
    /**
     * Calculate SHA-256 hash of file content
     */
    hashContent(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    /**
     * Calculate Jaccard similarity between two sets of lines
     */
    calculateSimilarity(content1, content2) {
        const lines1 = new Set(content1.split('\n').map(l => l.trim()).filter(l => l));
        const lines2 = new Set(content2.split('\n').map(l => l.trim()).filter(l => l));
        const intersection = new Set([...lines1].filter(x => lines2.has(x)));
        const union = new Set([...lines1, ...lines2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }
    /**
     * Recursively scan directory for source files
     */
    scanDirectory(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            // Skip node_modules and .git
            if (entry.name === 'node_modules' || entry.name === '.git') {
                continue;
            }
            if (entry.isDirectory()) {
                this.scanDirectory(fullPath);
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (this.extensions.includes(ext)) {
                    this.processFile(fullPath);
                }
            }
        }
    }
    /**
     * Process individual file
     */
    processFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const hash = this.hashContent(content);
            const stats = fs.statSync(filePath);
            const lines = content.split('\n').length;
            const relativePath = path.relative(this.rootDir, filePath);
            const fileInfo = {
                path: relativePath,
                hash,
                size: stats.size,
                lines,
                content
            };
            this.fileMap.set(relativePath, fileInfo);
            if (!this.hashMap.has(hash)) {
                this.hashMap.set(hash, []);
            }
            this.hashMap.get(hash).push(relativePath);
        }
        catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }
    /**
     * Find similar files (>90% overlap)
     */
    findSimilarFiles() {
        const similarityGroups = [];
        const processed = new Set();
        const files = Array.from(this.fileMap.values());
        for (let i = 0; i < files.length; i++) {
            if (processed.has(files[i].path))
                continue;
            const group = [files[i].path];
            processed.add(files[i].path);
            for (let j = i + 1; j < files.length; j++) {
                if (processed.has(files[j].path))
                    continue;
                const similarity = this.calculateSimilarity(files[i].content, files[j].content);
                if (similarity > 0.9) {
                    group.push(files[j].path);
                    processed.add(files[j].path);
                }
            }
            if (group.length > 1) {
                similarityGroups.push({
                    files: group,
                    similarity: 0.9,
                    representativeFile: group[0]
                });
            }
        }
        return similarityGroups;
    }
    /**
     * Categorize files by domain
     */
    categorizeTaxonomy() {
        const taxonomy = {
            security: [],
            ai_core: [],
            test_automation: [],
            economy: [],
            swarm: [],
            cognitive: [],
            enterprise: [],
            infrastructure: [],
            healing: [],
            compliance: [],
            quantum: [],
            visualization: [],
            integration: [],
            other: []
        };
        for (const [filePath] of this.fileMap) {
            const lowerPath = filePath.toLowerCase();
            // Security-related
            if (lowerPath.includes('security') || lowerPath.includes('threat') ||
                lowerPath.includes('sentinel') || lowerPath.includes('zero-trust') ||
                lowerPath.includes('bastion') || lowerPath.includes('vault')) {
                taxonomy.security.push(filePath);
            }
            // AI/ML Core
            else if (lowerPath.includes('neural') || lowerPath.includes('ml-') ||
                lowerPath.includes('cognitive') || lowerPath.includes('persona') ||
                lowerPath.includes('model-') || lowerPath.includes('intelligence')) {
                taxonomy.ai_core.push(filePath);
            }
            // Test Automation
            else if (lowerPath.includes('test') || lowerPath.includes('selenium') ||
                lowerPath.includes('playwright') || lowerPath.includes('verification')) {
                taxonomy.test_automation.push(filePath);
            }
            // Economy/Business
            else if (lowerPath.includes('revenue') || lowerPath.includes('transaction') ||
                lowerPath.includes('business') || lowerPath.includes('white-label')) {
                taxonomy.economy.push(filePath);
            }
            // Swarm Intelligence
            else if (lowerPath.includes('swarm') || lowerPath.includes('hive') ||
                lowerPath.includes('agent')) {
                taxonomy.swarm.push(filePath);
            }
            // Enterprise Features
            else if (lowerPath.includes('enterprise') || lowerPath.includes('saas') ||
                lowerPath.includes('multi-tenant')) {
                taxonomy.enterprise.push(filePath);
            }
            // Self-Healing
            else if (lowerPath.includes('healing') || lowerPath.includes('recovery') ||
                lowerPath.includes('error-detector')) {
                taxonomy.healing.push(filePath);
            }
            // Compliance
            else if (lowerPath.includes('compliance') || lowerPath.includes('gdpr') ||
                lowerPath.includes('hipaa')) {
                taxonomy.compliance.push(filePath);
            }
            // Quantum/Scaling
            else if (lowerPath.includes('quantum') || lowerPath.includes('scaling')) {
                taxonomy.quantum.push(filePath);
            }
            // Infrastructure
            else if (lowerPath.includes('orchestrator') || lowerPath.includes('coordinator') ||
                lowerPath.includes('worker') || lowerPath.includes('pool') ||
                lowerPath.includes('circuit') || lowerPath.includes('chaos')) {
                taxonomy.infrastructure.push(filePath);
            }
            // Visualization
            else if (lowerPath.includes('visual') || lowerPath.includes('hud') ||
                lowerPath.includes('dashboard')) {
                taxonomy.visualization.push(filePath);
            }
            // Integrations
            else if (lowerPath.includes('integration') || lowerPath.includes('jira') ||
                lowerPath.includes('linear')) {
                taxonomy.integration.push(filePath);
            }
            else {
                taxonomy.other.push(filePath);
            }
        }
        // Remove empty categories
        Object.keys(taxonomy).forEach(key => {
            if (taxonomy[key].length === 0) {
                delete taxonomy[key];
            }
        });
        return taxonomy;
    }
    /**
     * Generate comprehensive deduplication report
     */
    analyze() {
        console.log('🔍 Scanning files...');
        this.scanDirectory(this.rootDir);
        console.log('🔢 Calculating statistics...');
        const totalFiles = this.fileMap.size;
        const duplicates = {};
        let uniqueFiles = 0;
        let totalSize = 0;
        let uniqueSize = 0;
        this.hashMap.forEach((files, hash) => {
            totalSize += this.fileMap.get(files[0]).size * files.length;
            uniqueSize += this.fileMap.get(files[0]).size;
            if (files.length > 1) {
                duplicates[hash] = files;
            }
            else {
                uniqueFiles++;
            }
        });
        uniqueFiles += Object.keys(duplicates).length;
        console.log('🔗 Finding similar files...');
        const similarityGroups = this.findSimilarFiles();
        console.log('📚 Generating taxonomy...');
        const taxonomy = this.categorizeTaxonomy();
        const report = {
            totalFiles,
            uniqueFiles,
            duplicates,
            similarityGroups,
            taxonomy,
            stats: {
                totalSize,
                uniqueSize,
                savedSpace: totalSize - uniqueSize
            }
        };
        return report;
    }
    /**
     * Save report to file
     */
    saveReport(report, outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Save full report
        const reportPath = path.join(outputDir, 'deduplication-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`✅ Full report saved to ${reportPath}`);
        // Save taxonomy
        const taxonomyPath = path.join(outputDir, 'TAXONOMY.json');
        fs.writeFileSync(taxonomyPath, JSON.stringify(report.taxonomy, null, 2));
        console.log(`✅ Taxonomy saved to ${taxonomyPath}`);
        // Save human-readable summary
        const summaryPath = path.join(outputDir, 'deduplication-summary.txt');
        const summary = this.generateSummary(report);
        fs.writeFileSync(summaryPath, summary);
        console.log(`✅ Summary saved to ${summaryPath}`);
    }
    /**
     * Generate human-readable summary
     */
    generateSummary(report) {
        const lines = [];
        lines.push('🔥 DEDUPLICATION & ANALYSIS REPORT');
        lines.push('═'.repeat(60));
        lines.push('');
        lines.push('📊 STATISTICS:');
        lines.push(`  Total Files: ${report.totalFiles}`);
        lines.push(`  Unique Files: ${report.uniqueFiles}`);
        lines.push(`  Duplicate Sets: ${Object.keys(report.duplicates).length}`);
        lines.push(`  Similar Groups (>90%): ${report.similarityGroups.length}`);
        lines.push('');
        lines.push('💾 STORAGE:');
        lines.push(`  Total Size: ${(report.stats.totalSize / 1024).toFixed(2)} KB`);
        lines.push(`  Unique Size: ${(report.stats.uniqueSize / 1024).toFixed(2)} KB`);
        lines.push(`  Space Saved: ${(report.stats.savedSpace / 1024).toFixed(2)} KB`);
        lines.push('');
        if (Object.keys(report.duplicates).length > 0) {
            lines.push('🔁 EXACT DUPLICATES:');
            Object.entries(report.duplicates).forEach(([hash, files]) => {
                lines.push(`  Hash: ${hash.substring(0, 12)}... (${files.length} copies)`);
                files.forEach(file => lines.push(`    - ${file}`));
            });
            lines.push('');
        }
        if (report.similarityGroups.length > 0) {
            lines.push('🔗 SIMILARITY GROUPS (>90% overlap):');
            report.similarityGroups.forEach((group, idx) => {
                lines.push(`  Group ${idx + 1} (${group.files.length} files):`);
                group.files.forEach(file => lines.push(`    - ${file}`));
            });
            lines.push('');
        }
        lines.push('📚 TAXONOMY BY DOMAIN:');
        Object.entries(report.taxonomy).forEach(([category, files]) => {
            lines.push(`  ${category.toUpperCase()}: ${files.length} files`);
        });
        return lines.join('\n');
    }
}
exports.DeduplicationAnalyzer = DeduplicationAnalyzer;
// Main execution
if (require.main === module) {
    const rootDir = process.argv[2] || process.cwd();
    const outputDir = process.argv[3] || path.join(rootDir, 'analysis-output');
    console.log('🚀 Starting Deduplication Analysis...');
    console.log(`📁 Root Directory: ${rootDir}`);
    console.log('');
    const analyzer = new DeduplicationAnalyzer(rootDir);
    const report = analyzer.analyze();
    console.log('');
    console.log('💾 Saving reports...');
    analyzer.saveReport(report, outputDir);
    console.log('');
    console.log('✨ Analysis complete!');
    console.log(`📊 Found ${report.totalFiles} files, ${report.uniqueFiles} unique`);
    console.log(`💰 Potential space savings: ${(report.stats.savedSpace / 1024).toFixed(2)} KB`);
}
