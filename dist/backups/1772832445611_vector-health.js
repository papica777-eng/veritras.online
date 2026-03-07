"use strict";
/**
 * vector-health — Qantum Module
 * @module vector-health
 * @path src/pinecone-bridge/src/scripts/vector-health.ts
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
exports.VectorHealthChecker = void 0;
!/usr/bin / env;
tsx;
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   AETERNA VECTOR HEALTH v1.0 - COMPREHENSIVE HEALTH CHECK & CLEANUP            ║
 * ║   "Clean Vectors. Healthy Empire."                                            ║
 * ║                                                                               ║
 * ║   • Проверява здравето на вектор базата                                       ║
 * ║   • Открива и премахва orphaned вектори                                       ║
 * ║   • Генерира детайлен health report                                           ║
 * ║   • Оптимизира namespace-и                                                    ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
const pinecone_1 = require("@pinecone-database/pinecone");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
// Complexity: O(1)
(0, dotenv_1.config)();
// ═══════════════════════════════════════════════════════════════════════════════
// VECTOR HEALTH CHECKER
// ═══════════════════════════════════════════════════════════════════════════════
class VectorHealthChecker {
    client = null;
    index = null;
    config = {
        apiKey: process.env.PINECONE_API_KEY || '',
        indexName: process.env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX || 'qantum-empire',
        namespace: process.env.PINECONE_NAMESPACE || 'empire',
        projectRoot: process.env.PROJECT_ROOT || process.cwd(),
        projects: (process.env.PROJECTS || 'src,core,dashboard,backend,scripts').split(',').map(p => p.trim()),
    };
    // Complexity: O(1)
    async connect() {
        if (!this.config.apiKey) {
            throw new Error('PINECONE_API_KEY required');
        }
        this.client = new pinecone_1.Pinecone({ apiKey: this.config.apiKey });
        this.index = this.client.index(this.config.indexName);
        console.log('✅ Connected to Pinecone');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration
    async checkHealth() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.connect();
        console.log('\n🔍 Running comprehensive health check...\n');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stats = await this.index.describeIndexStats();
        const totalVectors = stats.totalRecordCount || 0;
        const report = {
            timestamp: Date.now(),
            indexName: this.config.indexName,
            namespace: this.config.namespace,
            totalVectors,
            validVectors: 0,
            orphanedVectors: 0,
            duplicateVectors: 0,
            projectDistribution: {},
            extensionDistribution: {},
            oldestVector: Date.now(),
            newestVector: 0,
            avgAge: 0,
            healthScore: 100,
            issues: [],
            recommendations: [],
        };
        // Scan vectors by project
        const ns = this.index.namespace(this.config.namespace);
        const allVectors = [];
        const seenFiles = new Set();
        for (const project of this.config.projects) {
            console.log(`📂 Scanning project: ${project}...`);
            try {
                let paginationToken;
                do {
                    const result = await ns.listPaginated({
                        prefix: `${project}-`,
                        limit: 100,
                        paginationToken,
                    });
                    if (result.vectors) {
                        const allIds = result.vectors.map(v => v.id);
                        for (let i = 0; i < allIds.length; i += 100) {
                            const batchIds = allIds.slice(i, i + 100);
                            const fetchResult = await ns.fetch({ ids: batchIds });
                            for (const id of batchIds) {
                                const record = fetchResult.records[id];
                                if (record?.metadata) {
                                    const filePath = record.metadata.filePath;
                                    const lastSync = record.metadata.lastSync || 0;
                                    const extension = record.metadata.extension || 'unknown';
                                    allVectors.push({
                                        id,
                                        filePath,
                                        lastSync,
                                        project,
                                        extension,
                                    });
                                    // Check for duplicates
                                    if (seenFiles.has(filePath)) {
                                        report.duplicateVectors++;
                                    }
                                    else {
                                        seenFiles.add(filePath);
                                    }
                                    // Track distribution
                                    report.projectDistribution[project] = (report.projectDistribution[project] || 0) + 1;
                                    report.extensionDistribution[extension] = (report.extensionDistribution[extension] || 0) + 1;
                                    // Track age
                                    if (lastSync > 0) {
                                        report.oldestVector = Math.min(report.oldestVector, lastSync);
                                        report.newestVector = Math.max(report.newestVector, lastSync);
                                    }
                                }
                            }
                        }
                    }
                    paginationToken = result.pagination?.next;
                } while (paginationToken);
            }
            catch (err) {
                console.log(`   ⚠️ Error: ${err.message}`);
            }
        }
        // Check for orphaned vectors
        console.log('\n🔎 Checking for orphaned vectors...');
        for (const vector of allVectors) {
            const fullPath = path.join(this.config.projectRoot, vector.filePath);
            if (fs.existsSync(fullPath)) {
                report.validVectors++;
            }
            else {
                report.orphanedVectors++;
            }
        }
        // Calculate health score
        report.healthScore = this.calculateHealthScore(report);
        // Generate issues and recommendations
        this.generateIssuesAndRecommendations(report);
        // Print report
        this.printHealthReport(report);
        return report;
    }
    // Complexity: O(N*M) — nested iteration
    calculateHealthScore(report) {
        let score = 100;
        // Deduct for orphaned vectors
        const orphanPercent = (report.orphanedVectors / report.totalVectors) * 100;
        if (orphanPercent > 20)
            score -= 30;
        else if (orphanPercent > 10)
            score -= 20;
        else if (orphanPercent > 5)
            score -= 10;
        else if (orphanPercent > 0)
            score -= 5;
        // Deduct for duplicates
        const dupPercent = (report.duplicateVectors / report.totalVectors) * 100;
        if (dupPercent > 10)
            score -= 20;
        else if (dupPercent > 5)
            score -= 10;
        else if (dupPercent > 0)
            score -= 5;
        return Math.max(0, score);
    }
    // Complexity: O(1)
    generateIssuesAndRecommendations(report) {
        if (report.orphanedVectors > 0) {
            report.issues.push(`Found ${report.orphanedVectors} orphaned vectors (files no longer exist)`);
            report.recommendations.push('Run "npm run sync:cleanup" to remove orphaned vectors');
        }
        if (report.duplicateVectors > 0) {
            report.issues.push(`Found ${report.duplicateVectors} duplicate vectors`);
            report.recommendations.push('Run deduplication to remove duplicate entries');
        }
        if (report.totalVectors === 0) {
            report.issues.push('Index is empty!');
            report.recommendations.push('Run "npm run sync:all" to populate vectors');
        }
        if (report.healthScore === 100) {
            report.recommendations.push('✨ Everything looks great! No action needed.');
        }
    }
    // Complexity: O(N*M) — nested iteration
    printHealthReport(report) {
        const scoreEmoji = report.healthScore >= 90 ? '🟢' :
            report.healthScore >= 70 ? '🟡' : '🔴';
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                      VECTOR HEALTH REPORT                                    ║');
        console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
        console.log(`║  Index: ${report.indexName.padEnd(20)} Namespace: ${report.namespace.padEnd(20)}   ║`);
        console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
        console.log(`║  ${scoreEmoji} HEALTH SCORE: ${report.healthScore.toString().padStart(3)}%                                                       ║`);
        console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
        console.log('║  VECTOR STATISTICS                                                           ║');
        console.log(`║    📊 Total Vectors:     ${report.totalVectors.toString().padStart(8)}                                         ║`);
        console.log(`║    ✅ Valid Vectors:     ${report.validVectors.toString().padStart(8)}                                         ║`);
        console.log(`║    ⚠️  Orphaned Vectors:  ${report.orphanedVectors.toString().padStart(8)}                                         ║`);
        console.log(`║    📋 Duplicate Vectors: ${report.duplicateVectors.toString().padStart(8)}                                         ║`);
        console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
        console.log('║  PROJECT DISTRIBUTION                                                        ║');
        for (const [project, count] of Object.entries(report.projectDistribution)) {
            const percent = ((count / report.totalVectors) * 100).toFixed(1);
            console.log(`║    📁 ${project.padEnd(20)} ${count.toString().padStart(6)} (${percent.padStart(5)}%)                       ║`);
        }
        console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
        console.log('║  FILE TYPE DISTRIBUTION                                                      ║');
        const sortedExt = Object.entries(report.extensionDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        for (const [ext, count] of sortedExt) {
            const percent = ((count / report.totalVectors) * 100).toFixed(1);
            console.log(`║    📄 ${ext.padEnd(10)} ${count.toString().padStart(6)} (${percent.padStart(5)}%)                               ║`);
        }
        if (report.issues.length > 0) {
            console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
            console.log('║  ⚠️  ISSUES                                                                   ║');
            for (const issue of report.issues) {
                console.log(`║    • ${issue.substring(0, 70).padEnd(70)} ║`);
            }
        }
        if (report.recommendations.length > 0) {
            console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
            console.log('║  💡 RECOMMENDATIONS                                                          ║');
            for (const rec of report.recommendations) {
                console.log(`║    • ${rec.substring(0, 70).padEnd(70)} ║`);
            }
        }
        console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
        console.log('');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CLEANUP ORPHANED
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration
    async cleanupOrphaned(dryRun = false) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.connect();
        console.log('\n🧹 Scanning for orphaned vectors...\n');
        const orphanedIds = [];
        const ns = this.index.namespace(this.config.namespace);
        for (const project of this.config.projects) {
            console.log(`📂 Checking project: ${project}...`);
            try {
                let paginationToken;
                do {
                    const result = await ns.listPaginated({
                        prefix: `${project}-`,
                        limit: 100,
                        paginationToken,
                    });
                    if (result.vectors) {
                        const allIds = result.vectors.map(v => v.id);
                        for (let i = 0; i < allIds.length; i += 100) {
                            const batchIds = allIds.slice(i, i + 100);
                            const fetchResult = await ns.fetch({ ids: batchIds });
                            for (const id of batchIds) {
                                const record = fetchResult.records[id];
                                if (record?.metadata) {
                                    const filePath = record.metadata.filePath;
                                    const fullPath = path.join(this.config.projectRoot, filePath);
                                    if (!fs.existsSync(fullPath)) {
                                        orphanedIds.push(id);
                                        console.log(`   🗑️ Orphaned: ${filePath}`);
                                    }
                                }
                            }
                        }
                    }
                    paginationToken = result.pagination?.next;
                } while (paginationToken);
            }
            catch (err) {
                console.log(`   ⚠️ Error: ${err.message}`);
            }
        }
        console.log(`\n📊 Found ${orphanedIds.length} orphaned vectors`);
        if (orphanedIds.length === 0) {
            console.log('✨ No cleanup needed!');
            return 0;
        }
        if (dryRun) {
            console.log('🔍 DRY RUN - No vectors will be deleted');
            return orphanedIds.length;
        }
        // Delete orphaned vectors
        console.log(`\n🗑️ Deleting ${orphanedIds.length} orphaned vectors...`);
        for (let i = 0; i < orphanedIds.length; i += 1000) {
            const batch = orphanedIds.slice(i, i + 1000);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await ns.deleteMany(batch);
            console.log(`   Deleted batch ${Math.floor(i / 1000) + 1}`);
        }
        console.log(`\n✅ Cleanup complete! Removed ${orphanedIds.length} orphaned vectors`);
        return orphanedIds.length;
    }
}
exports.VectorHealthChecker = VectorHealthChecker;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'health';
    const checker = new VectorHealthChecker();
    console.log('');
    console.log('🏥 AETERNA VECTOR HEALTH v1.0');
    console.log('═══════════════════════════════════════════════════════════════════');
    try {
        switch (command) {
            case 'health':
            case 'check':
                await checker.checkHealth();
                break;
            case 'cleanup':
                await checker.cleanupOrphaned(args.includes('--dry-run'));
                break;
            default:
                console.log('Usage: vector-health <command>');
                console.log('');
                console.log('Commands:');
                console.log('  health, check    Run comprehensive health check');
                console.log('  cleanup          Remove orphaned vectors');
                console.log('');
                console.log('Options:');
                console.log('  --dry-run        Show what would be deleted without deleting');
        }
    }
    catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
// Complexity: O(1)
main().catch(console.error);
