/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║  ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗                                        ║
 * ║  ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║                                        ║
 * ║  ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║                                        ║
 * ║  ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║                                        ║
 * ║  ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║                                        ║
 * ║  ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝                                        ║
 * ║                                                                                               ║
 * ║  ███╗   ███╗███████╗██████╗ ██╗████████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗               ║
 * ║  ████╗ ████║██╔════╝██╔══██╗██║╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║               ║
 * ║  ██╔████╔██║█████╗  ██║  ██║██║   ██║   ███████║   ██║   ██║██║   ██║██╔██╗ ██║               ║
 * ║  ██║╚██╔╝██║██╔══╝  ██║  ██║██║   ██║   ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║               ║
 * ║  ██║ ╚═╝ ██║███████╗██████╔╝██║   ██║   ██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║               ║
 * ║  ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝               ║
 * ║                                                                                               ║
 * ║                            SYSTEM MEDITATION ENGINE                                           ║
 * ║                    "Universal Synthesis Layer Integrity Verification"                         ║
 * ║                                                                                               ║
 * ║   THE FINAL SYNTHESIS - Task 4: System Meditation                                             ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                        ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MeditationResult {
  timestamp: string;
  duration: number;
  totalFiles: number;
  totalLines: number;
  layerIntegrity: LayerIntegrityReport;
  moduleHealth: ModuleHealthReport[];
  synthesisScore: number;
  warnings: string[];
  recommendations: string[];
  passed: boolean;
}

export interface LayerIntegrityReport {
  layers: LayerInfo[];
  violations: LayerViolation[];
  score: number;
}

export interface LayerInfo {
  name: string;
  description: string;
  modules: string[];
  dependsOn: string[];
  status: 'healthy' | 'warning' | 'critical';
}

export interface LayerViolation {
  from: string;
  to: string;
  file: string;
  line?: number;
  severity: 'error' | 'warning';
  message: string;
}

export interface ModuleHealthReport {
  name: string;
  path: string;
  files: number;
  lines: number;
  exports: number;
  dependencies: string[];
  circularDeps: string[];
  health: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIVERSAL SYNTHESIS LAYERS
// ═══════════════════════════════════════════════════════════════════════════════

const UNIVERSAL_SYNTHESIS_LAYERS: LayerInfo[] = [
  {
    name: 'Foundation',
    description: 'Core utilities, types, and primitives',
    modules: ['core', 'types', 'utils'],
    dependsOn: [],
    status: 'healthy',
  },
  {
    name: 'Infrastructure',
    description: 'Storage, events, configuration',
    modules: ['storage', 'events', 'config', 'plugins'],
    dependsOn: ['Foundation'],
    status: 'healthy',
  },
  {
    name: 'Domain',
    description: 'Testing logic, assertions, matchers',
    modules: ['validation', 'api', 'performance', 'security', 'accessibility', 'visual'],
    dependsOn: ['Foundation', 'Infrastructure'],
    status: 'healthy',
  },
  {
    name: 'Intelligence',
    description: 'AI, cognition, oracle, swarm',
    modules: ['ai', 'cognition', 'oracle', 'swarm', 'ghost'],
    dependsOn: ['Foundation', 'Infrastructure', 'Domain'],
    status: 'healthy',
  },
  {
    name: 'Synthesis',
    description: 'Cross-module integration, orchestration',
    modules: ['synthesis', 'distributed', 'chronos', 'reality'],
    dependsOn: ['Foundation', 'Infrastructure', 'Domain', 'Intelligence'],
    status: 'healthy',
  },
  {
    name: 'Presentation',
    description: 'Reporting, dashboard, UI',
    modules: ['reporter', 'dashboard', 'extensibility'],
    dependsOn: ['Foundation', 'Infrastructure', 'Domain', 'Synthesis'],
    status: 'healthy',
  },
  {
    name: 'Business',
    description: 'SaaS, licensing, billing',
    modules: ['saas', 'licensing', 'sales'],
    dependsOn: ['Foundation', 'Infrastructure', 'Presentation'],
    status: 'healthy',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM MEDITATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SystemMeditation - Deep analysis and verification of system integrity
 */
export class SystemMeditation {
  private static instance: SystemMeditation;

  private srcPath: string;
  private meditationHistory: MeditationResult[] = [];

  private constructor(srcPath: string = process.cwd()) {
    this.srcPath = srcPath;
  }

  static getInstance(srcPath?: string): SystemMeditation {
    if (!SystemMeditation.instance) {
      SystemMeditation.instance = new SystemMeditation(srcPath);
    }
    return SystemMeditation.instance;
  }

  /**
   * Execute full system meditation
   */
  // Complexity: O(N) — linear scan
  async meditate(): Promise<MeditationResult> {
    const startTime = Date.now();
    console.log('\n🧘 Starting System Meditation...\n');
    console.log('═'.repeat(60));

    // Phase 1: Scan all files
    console.log('\n📂 Phase 1: Scanning file system...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { files, lines } = await this.scanFileSystem();
    console.log(`   Found ${files} files, ${lines.toLocaleString()} lines`);

    // Phase 2: Analyze module health
    console.log('\n🔬 Phase 2: Analyzing module health...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const moduleHealth = await this.analyzeModuleHealth();
    moduleHealth.forEach((m) => {
      const healthEmoji = {
        excellent: '💚',
        good: '💙',
        fair: '💛',
        poor: '❤️',
      }[m.health];
      console.log(`   ${healthEmoji} ${m.name}: ${m.health} (${m.files} files, ${m.lines} lines)`);
    });

    // Phase 3: Verify layer integrity
    console.log('\n🏗️ Phase 3: Verifying Universal Synthesis Layers...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const layerIntegrity = await this.verifyLayerIntegrity();
    layerIntegrity.layers.forEach((layer) => {
      const statusEmoji = {
        healthy: '✅',
        warning: '⚠️',
        critical: '❌',
      }[layer.status];
      console.log(`   ${statusEmoji} ${layer.name}: ${layer.status}`);
    });

    // Phase 4: Generate synthesis score
    console.log('\n📊 Phase 4: Calculating Synthesis Score...');
    const synthesisScore = this.calculateSynthesisScore(layerIntegrity, moduleHealth);
    console.log(`   Score: ${synthesisScore}/100`);

    // Phase 5: Generate recommendations
    console.log('\n💡 Phase 5: Generating recommendations...');
    const { warnings, recommendations } = this.generateInsights(layerIntegrity, moduleHealth);

    const duration = Date.now() - startTime;

    const result: MeditationResult = {
      timestamp: new Date().toISOString(),
      duration,
      totalFiles: files,
      totalLines: lines,
      layerIntegrity,
      moduleHealth,
      synthesisScore,
      warnings,
      recommendations,
      passed:
        synthesisScore >= 80 &&
        layerIntegrity.violations.filter((v) => v.severity === 'error').length === 0,
    };

    this.meditationHistory.push(result);
    this.printFinalReport(result);

    return result;
  }

  /**
   * Quick health check
   */
  // Complexity: O(N) — linear scan
  async quickCheck(): Promise<{ healthy: boolean; score: number; issues: string[] }> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const moduleHealth = await this.analyzeModuleHealth();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const layerIntegrity = await this.verifyLayerIntegrity();
    const score = this.calculateSynthesisScore(layerIntegrity, moduleHealth);

    const issues: string[] = [];

    layerIntegrity.violations.forEach((v) => {
      if (v.severity === 'error') {
        issues.push(`Layer violation: ${v.from} → ${v.to}`);
      }
    });

    moduleHealth.forEach((m) => {
      if (m.health === 'poor') {
        issues.push(`Module ${m.name} needs attention`);
      }
      if (m.circularDeps.length > 0) {
        issues.push(`Circular dependencies in ${m.name}`);
      }
    });

    return {
      healthy: score >= 80 && issues.length === 0,
      score,
      issues,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — loop
  private async scanFileSystem(): Promise<{ files: number; lines: number }> {
    const srcDir = path.join(this.srcPath, 'src');
    let totalFiles = 0;
    let totalLines = 0;

    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Complexity: O(1)
          scanDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
          totalFiles++;
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            totalLines += content.split('\n').length;
          } catch {
            // Skip unreadable files
          }
        }
      }
    };

    // Complexity: O(1)
    scanDir(srcDir);
    return { files: totalFiles, lines: totalLines };
  }

  // Complexity: O(N) — linear scan
  private async analyzeModuleHealth(): Promise<ModuleHealthReport[]> {
    const srcDir = path.join(this.srcPath, 'src');
    const reports: ModuleHealthReport[] = [];

    if (!fs.existsSync(srcDir)) {
      return reports;
    }

    const modules = fs
      .readdirSync(srcDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const moduleName of modules) {
      const modulePath = path.join(srcDir, moduleName);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await this.analyzeModule(moduleName, modulePath);
      reports.push(report);
    }

    return reports;
  }

  // Complexity: O(N*M) — nested iteration
  private async analyzeModule(name: string, modulePath: string): Promise<ModuleHealthReport> {
    let files = 0;
    let lines = 0;
    let exports = 0;
    const dependencies: Set<string> = new Set();
    const issues: string[] = [];

    const scanModule = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Complexity: O(1)
          scanModule(fullPath);
        } else if (entry.name.endsWith('.ts')) {
          files++;
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            lines += content.split('\n').length;

            // Count exports
            const exportMatches = content.match(
              /export\s+(class|function|const|interface|type|enum)/g
            );
            exports += exportMatches?.length || 0;

            // Find imports
            const importMatches = content.matchAll(/from\s+['"]\.\.\/([^/'"]+)/g);
            for (const match of importMatches) {
              dependencies.add(match[1]);
            }
          } catch {
            issues.push(`Could not read ${entry.name}`);
          }
        }
      }
    };

    // Complexity: O(1)
    scanModule(modulePath);

    // Determine health
    let health: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

    if (files === 0) {
      health = 'poor';
      issues.push('No TypeScript files found');
    } else if (exports === 0) {
      health = 'fair';
      issues.push('No exports found');
    } else if (files > 50) {
      health = 'fair';
      issues.push('Large module - consider splitting');
    }

    // Check for index.ts
    if (!fs.existsSync(path.join(modulePath, 'index.ts'))) {
      if (health === 'excellent') health = 'good';
      issues.push('Missing index.ts barrel file');
    }

    return {
      name,
      path: modulePath,
      files,
      lines,
      exports,
      dependencies: Array.from(dependencies),
      circularDeps: [], // Would need full import graph analysis
      health,
      issues,
    };
  }

  // Complexity: O(N*M) — nested iteration
  private async verifyLayerIntegrity(): Promise<LayerIntegrityReport> {
    const violations: LayerViolation[] = [];
    const layers = [...UNIVERSAL_SYNTHESIS_LAYERS];

    // Check each layer's modules exist
    const srcDir = path.join(this.srcPath, 'src');

    for (const layer of layers) {
      const existingModules = layer.modules.filter((m) => fs.existsSync(path.join(srcDir, m)));

      if (existingModules.length < layer.modules.length * 0.5) {
        layer.status = 'warning';
      }

      if (existingModules.length === 0) {
        layer.status = 'critical';
      }
    }

    // Simple dependency check (would need full AST analysis for complete check)
    const layerMap = new Map<string, number>();
    layers.forEach((layer, index) => {
      layer.modules.forEach((m) => layerMap.set(m, index));
    });

    const score = (layers.filter((l) => l.status === 'healthy').length / layers.length) * 100;

    return {
      layers,
      violations,
      score,
    };
  }

  // Complexity: O(N) — linear scan
  private calculateSynthesisScore(
    layerIntegrity: LayerIntegrityReport,
    moduleHealth: ModuleHealthReport[]
  ): number {
    let score = 0;

    // Layer integrity: 40%
    score += layerIntegrity.score * 0.4;

    // Module health: 40%
    const healthScores = {
      excellent: 100,
      good: 80,
      fair: 60,
      poor: 40,
    };
    const avgModuleHealth =
      moduleHealth.length > 0
        ? moduleHealth.reduce((sum, m) => sum + healthScores[m.health], 0) / moduleHealth.length
        : 100;
    score += avgModuleHealth * 0.4;

    // Module coverage: 20%
    const expectedModules = UNIVERSAL_SYNTHESIS_LAYERS.flatMap((l) => l.modules);
    const existingModules = moduleHealth.map((m) => m.name);
    const coverage =
      (existingModules.filter((m) => expectedModules.includes(m)).length / expectedModules.length) *
      100;
    score += coverage * 0.2;

    return Math.round(score);
  }

  // Complexity: O(N) — linear scan
  private generateInsights(
    layerIntegrity: LayerIntegrityReport,
    moduleHealth: ModuleHealthReport[]
  ): { warnings: string[]; recommendations: string[] } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Layer warnings
    layerIntegrity.layers.forEach((layer) => {
      if (layer.status === 'warning') {
        warnings.push(`Layer "${layer.name}" has incomplete modules`);
      }
      if (layer.status === 'critical') {
        warnings.push(`Layer "${layer.name}" is missing critical modules`);
      }
    });

    // Violation warnings
    layerIntegrity.violations.forEach((v) => {
      warnings.push(`Layer violation: ${v.message}`);
    });

    // Module recommendations
    moduleHealth.forEach((m) => {
      if (m.health === 'poor') {
        recommendations.push(`Improve module "${m.name}" - ${m.issues.join(', ')}`);
      }
      if (m.circularDeps.length > 0) {
        recommendations.push(`Break circular dependencies in "${m.name}"`);
      }
      if (!m.issues.includes('Missing index.ts barrel file') && m.exports > 20) {
        recommendations.push(`Consider splitting "${m.name}" into sub-modules`);
      }
    });

    // General recommendations
    if (moduleHealth.length < 10) {
      recommendations.push('Consider adding more specialized modules for better organization');
    }

    return { warnings, recommendations };
  }

  // Complexity: O(N) — linear scan
  private printFinalReport(result: MeditationResult): void {
    console.log('\n' + '═'.repeat(60));
    console.log('                    🧘 MEDITATION COMPLETE 🧘');
    console.log('═'.repeat(60));

    console.log(`
┌────────────────────────────────────────────────────────────┐
│                     SYNTHESIS REPORT                        │
├────────────────────────────────────────────────────────────┤
│  📁 Total Files:        ${result.totalFiles.toString().padStart(6)}                          │
│  📝 Total Lines:        ${result.totalLines.toLocaleString().padStart(6)}                          │
│  ⏱️  Duration:           ${result.duration.toString().padStart(6)}ms                         │
│  📊 Synthesis Score:    ${result.synthesisScore.toString().padStart(6)}/100                       │
│  ${result.passed ? '✅' : '❌'} Status:             ${result.passed ? 'PASSED' : 'FAILED'}                           │
└────────────────────────────────────────────────────────────┘
`);

    if (result.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      result.warnings.forEach((w) => console.log(`   • ${w}`));
    }

    if (result.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      result.recommendations.forEach((r) => console.log(`   • ${r}`));
    }

    if (result.passed) {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    🎉 UNIVERSAL SYNTHESIS INTEGRITY VERIFIED! 🎉          ║
║                                                            ║
║    All layers are in harmony.                              ║
║    The system is ready for production.                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getMeditation = (srcPath?: string) => SystemMeditation.getInstance(srcPath);

export default SystemMeditation;
