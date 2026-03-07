#!/usr/bin/env tsx
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM VECTOR HEALTH v1.0 - COMPREHENSIVE HEALTH CHECK & CLEANUP            ║
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

import { Pinecone } from '@pinecone-database/pinecone';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface HealthReport {
  timestamp: number;
  indexName: string;
  namespace: string;
  
  // Vector Stats
  totalVectors: number;
  validVectors: number;
  orphanedVectors: number;
  duplicateVectors: number;
  
  // Project Distribution
  projectDistribution: Record<string, number>;
  
  // File Type Distribution
  extensionDistribution: Record<string, number>;
  
  // Age Analysis
  oldestVector: number;
  newestVector: number;
  avgAge: number;
  
  // Health Score
  healthScore: number;
  issues: string[];
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// VECTOR HEALTH CHECKER
// ═══════════════════════════════════════════════════════════════════════════════

class VectorHealthChecker {
  private client: Pinecone | null = null;
  private index: any = null;
  private config = {
    apiKey: process.env.PINECONE_API_KEY || '',
    indexName: 'qantum-empire',
    namespace: 'empire',
    projectRoot: 'C:/MisteMind',
    projects: ['MisteMind', 'MrMindQATool', 'MisterMindPage', 'PROJECT'],
  };

  async connect(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('PINECONE_API_KEY required');
    }

    this.client = new Pinecone({ apiKey: this.config.apiKey });
    this.index = this.client.index(this.config.indexName);
    console.log('✅ Connected to Pinecone');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════

  async checkHealth(): Promise<HealthReport> {
    await this.connect();
    
    console.log('\n🔍 Running comprehensive health check...\n');

    const stats = await this.index.describeIndexStats();
    const totalVectors = stats.totalRecordCount || 0;

    const report: HealthReport = {
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
    const allVectors: any[] = [];
    const seenFiles = new Set<string>();

    for (const project of this.config.projects) {
      console.log(`📂 Scanning project: ${project}...`);
      
      try {
        let paginationToken: string | undefined;
        
        do {
          const result = await ns.listPaginated({
            prefix: `${project}/`,
            limit: 1000,
            paginationToken,
          });
          
          if (result.vectors) {
            for (const v of result.vectors) {
              const fetchResult = await ns.fetch([v.id]);
              const record = fetchResult.records[v.id];
              
              if (record?.metadata) {
                const filePath = record.metadata.filePath as string;
                const lastSync = record.metadata.lastSync as number || 0;
                const extension = record.metadata.extension as string || 'unknown';
                
                allVectors.push({
                  id: v.id,
                  filePath,
                  lastSync,
                  project,
                  extension,
                });

                // Check for duplicates
                if (seenFiles.has(filePath)) {
                  report.duplicateVectors++;
                } else {
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
          
          paginationToken = result.pagination?.next;
        } while (paginationToken);
        
      } catch (err: any) {
        console.log(`   ⚠️ Error: ${err.message}`);
      }
    }

    // Check for orphaned vectors
    console.log('\n🔎 Checking for orphaned vectors...');
    
    for (const vector of allVectors) {
      const fullPath = path.join(this.config.projectRoot, vector.filePath);
      
      if (fs.existsSync(fullPath)) {
        report.validVectors++;
      } else {
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

  private calculateHealthScore(report: HealthReport): number {
    let score = 100;

    // Deduct for orphaned vectors
    const orphanPercent = (report.orphanedVectors / report.totalVectors) * 100;
    if (orphanPercent > 20) score -= 30;
    else if (orphanPercent > 10) score -= 20;
    else if (orphanPercent > 5) score -= 10;
    else if (orphanPercent > 0) score -= 5;

    // Deduct for duplicates
    const dupPercent = (report.duplicateVectors / report.totalVectors) * 100;
    if (dupPercent > 10) score -= 20;
    else if (dupPercent > 5) score -= 10;
    else if (dupPercent > 0) score -= 5;

    return Math.max(0, score);
  }

  private generateIssuesAndRecommendations(report: HealthReport): void {
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

  private printHealthReport(report: HealthReport): void {
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

  async cleanupOrphaned(dryRun = false): Promise<number> {
    await this.connect();
    
    console.log('\n🧹 Scanning for orphaned vectors...\n');
    
    const orphanedIds: string[] = [];
    const ns = this.index.namespace(this.config.namespace);

    for (const project of this.config.projects) {
      console.log(`📂 Checking project: ${project}...`);
      
      try {
        let paginationToken: string | undefined;
        
        do {
          const result = await ns.listPaginated({
            prefix: `${project}/`,
            limit: 1000,
            paginationToken,
          });
          
          if (result.vectors) {
            for (const v of result.vectors) {
              const fetchResult = await ns.fetch([v.id]);
              const record = fetchResult.records[v.id];
              
              if (record?.metadata) {
                const filePath = record.metadata.filePath as string;
                const fullPath = path.join(this.config.projectRoot, filePath);
                
                if (!fs.existsSync(fullPath)) {
                  orphanedIds.push(v.id);
                  console.log(`   🗑️ Orphaned: ${filePath}`);
                }
              }
            }
          }
          
          paginationToken = result.pagination?.next;
        } while (paginationToken);
        
      } catch (err: any) {
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
      await ns.deleteMany(batch);
      console.log(`   Deleted batch ${Math.floor(i / 1000) + 1}`);
    }

    console.log(`\n✅ Cleanup complete! Removed ${orphanedIds.length} orphaned vectors`);
    return orphanedIds.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'health';

  const checker = new VectorHealthChecker();

  console.log('');
  console.log('🏥 QANTUM VECTOR HEALTH v1.0');
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
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

export { VectorHealthChecker, HealthReport };

main().catch(console.error);
