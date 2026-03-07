#!/usr/bin/env node
/**
 * 🔥 MASTER ORCHESTRATOR - 3-PHASE EXECUTION
 * 
 * Orchestrates all 3 phases:
 * Phase 1: Deduplication + Analysis
 * Phase 2: Neural Absorption
 * Phase 3: QAntum Integration
 */

import * as fs from 'fs';
import * as path from 'path';
import { DeduplicationAnalyzer } from './deduplicate-analyze';
import { NeuralCoreMagnet } from './neural-core-magnet';
import { QAntumIntegrator } from './QAntum-integrator';

interface OrchestratorConfig {
  rootDir: string;
  outputDir: string;
  topModulesCount: number;
  skipPhase1: boolean;
  skipPhase2: boolean;
  skipPhase3: boolean;
}

class MasterOrchestrator {
  private config: OrchestratorConfig;
  private startTime: number;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = {
      rootDir: config.rootDir || process.cwd(),
      outputDir: config.outputDir || path.join(config.rootDir || process.cwd(), 'analysis-output'),
      topModulesCount: config.topModulesCount || 50,
      skipPhase1: config.skipPhase1 || false,
      skipPhase2: config.skipPhase2 || false,
      skipPhase3: config.skipPhase3 || false
    };
    this.startTime = Date.now();
  }

  /**
   * Log with timestamp
   */
  private log(message: string): void {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[${elapsed}s] ${message}`);
  }

  /**
   * Phase 1: Deduplication + Analysis
   */
  private async runPhase1(): Promise<void> {
    if (this.config.skipPhase1) {
      this.log('⏭️  Skipping Phase 1 (Deduplication)');
      return;
    }

    console.log('');
    console.log('═'.repeat(60));
    console.log('🔥 PHASE 1: DEDUPLICATION + ANALYSIS');
    console.log('═'.repeat(60));
    console.log('');

    this.log('Starting deduplication analysis...');
    
    const analyzer = new DeduplicationAnalyzer(this.config.rootDir);
    const report = analyzer.analyze();
    
    this.log('Saving reports...');
    analyzer.saveReport(report, this.config.outputDir);
    
    this.log(`Phase 1 Complete - Found ${report.uniqueFiles} unique files`);
    this.log(`Saved ${(report.stats.savedSpace / 1024).toFixed(2)} KB through deduplication`);
  }

  /**
   * Phase 2: Neural Absorption
   */
  private async runPhase2(): Promise<void> {
    if (this.config.skipPhase2) {
      this.log('⏭️  Skipping Phase 2 (Neural Absorption)');
      return;
    }

    console.log('');
    console.log('═'.repeat(60));
    console.log('🧲 PHASE 2: NEURAL CORE MAGNET');
    console.log('═'.repeat(60));
    console.log('');

    this.log('Starting neural absorption...');
    
    const taxonomyPath = path.join(this.config.outputDir, 'TAXONOMY.json');
    const magnet = new NeuralCoreMagnet(taxonomyPath);
    
    const result = await magnet.absorb(this.config.rootDir, true);
    
    this.log('Saving neural absorption results...');
    magnet.saveResults(result, this.config.outputDir);
    
    this.log(`Phase 2 Complete - Vectorized ${result.vectors.length} modules`);
    this.log(`Detected ${result.patterns.length} architectural patterns`);
  }

  /**
   * Phase 3: QAntum Integration
   */
  private async runPhase3(): Promise<void> {
    if (this.config.skipPhase3) {
      this.log('⏭️  Skipping Phase 3 (Integration)');
      return;
    }

    console.log('');
    console.log('═'.repeat(60));
    console.log('🚀 PHASE 3: QAntum INTEGRATION');
    console.log('═'.repeat(60));
    console.log('');

    this.log('Starting QAntum integration...');
    
    const integrator = new QAntumIntegrator(this.config.outputDir);
    const plan = integrator.integrate(this.config.outputDir);
    
    this.log('Saving integration plan...');
    integrator.saveIntegrationPlan(plan, this.config.outputDir);
    
    this.log(`Phase 3 Complete - Selected ${plan.topModules.length} top modules`);
    this.log(`Generated ${plan.trainingDataset.length} training examples`);
  }

  /**
   * Run all phases
   */
  public async execute(): Promise<void> {
    console.log('');
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(10) + '🔥 MASTER ORCHESTRATOR - 3 PHASES' + ' '.repeat(15) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');
    console.log('');
    
    this.log(`Root Directory: ${this.config.rootDir}`);
    this.log(`Output Directory: ${this.config.outputDir}`);
    console.log('');

    try {
      // Phase 1
      await this.runPhase1();
      
      // Phase 2
      await this.runPhase2();
      
      // Phase 3
      await this.runPhase3();

      // Final summary
      this.printFinalSummary();
      
    } catch (error) {
      console.error('');
      console.error('❌ ERROR:', error);
      process.exit(1);
    }
  }

  /**
   * Print final summary
   */
  private printFinalSummary(): void {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log('');
    console.log('═'.repeat(60));
    console.log('✨ ALL PHASES COMPLETE!');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`⏱️  Total Time: ${elapsed}s`);
    console.log(`📁 Output Directory: ${this.config.outputDir}`);
    console.log('');
    console.log('📊 Generated Files:');
    console.log('  ✅ TAXONOMY.json - Domain categorization');
    console.log('  ✅ deduplication-report.json - Deduplication analysis');
    console.log('  ✅ architectural-patterns.json - Pattern recognition');
    console.log('  ✅ auto-documentation.json - Module documentation');
    console.log('  ✅ code-vectors.json - Semantic vectors');
    console.log('  ✅ integration-plan.json - Integration roadmap');
    console.log('  ✅ training-dataset.jsonl - Code-gen training data');
    console.log('  ✅ OMNICORE-INTEGRATION-GUIDE.md - Integration guide');
    console.log('  ✅ QAntum-core-utils/ - Shared library structure');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('  1. Review TAXONOMY.json to understand code organization');
    console.log('  2. Check OMNICORE-INTEGRATION-GUIDE.md for integration plan');
    console.log('  3. Explore QAntum-core-utils/ for shared library');
    console.log('  4. Use training-dataset.jsonl for AI model training');
    console.log('');
    console.log('🚀 Ready for deployment!');
    console.log('');
  }

  /**
   * Get analysis stats
   */
  public getStats(): any {
    const taxonomyPath = path.join(this.config.outputDir, 'TAXONOMY.json');
    const reportPath = path.join(this.config.outputDir, 'deduplication-report.json');
    const planPath = path.join(this.config.outputDir, 'integration-plan.json');

    const stats: any = {
      outputDir: this.config.outputDir,
      filesGenerated: []
    };

    if (fs.existsSync(taxonomyPath)) {
      const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));
      stats.categories = Object.keys(taxonomy).length;
      stats.filesGenerated.push('TAXONOMY.json');
    }

    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      stats.totalFiles = report.totalFiles;
      stats.uniqueFiles = report.uniqueFiles;
      stats.filesGenerated.push('deduplication-report.json');
    }

    if (fs.existsSync(planPath)) {
      const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
      stats.topModules = plan.topModules?.length || 0;
      stats.filesGenerated.push('integration-plan.json');
    }

    return stats;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const config: Partial<OrchestratorConfig> = {
    rootDir: process.cwd(),
    outputDir: path.join(process.cwd(), 'analysis-output'),
    topModulesCount: 50,
    skipPhase1: false,
    skipPhase2: false,
    skipPhase3: false
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--root' && i + 1 < args.length) {
      config.rootDir = args[++i];
    } else if (arg === '--output' && i + 1 < args.length) {
      config.outputDir = args[++i];
    } else if (arg === '--top' && i + 1 < args.length) {
      config.topModulesCount = parseInt(args[++i], 10);
    } else if (arg === '--skip-phase1') {
      config.skipPhase1 = true;
    } else if (arg === '--skip-phase2') {
      config.skipPhase2 = true;
    } else if (arg === '--skip-phase3') {
      config.skipPhase3 = true;
    } else if (arg === '--help') {
      console.log(`
Usage: node master-orchestrator.js [options]

Options:
  --root <path>       Root directory to analyze (default: current directory)
  --output <path>     Output directory for results (default: ./analysis-output)
  --top <number>      Number of top modules to extract (default: 50)
  --skip-phase1       Skip Phase 1 (Deduplication)
  --skip-phase2       Skip Phase 2 (Neural Absorption)
  --skip-phase3       Skip Phase 3 (Integration)
  --help              Show this help message

Example:
  node master-orchestrator.js --root /path/to/project --output ./results --top 100
      `);
      process.exit(0);
    }
  }

  const orchestrator = new MasterOrchestrator(config);
  orchestrator.execute().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { MasterOrchestrator, OrchestratorConfig };
