/**
 * 🔮 PRE-COG ENGINE - Predictive Test & Change Analysis
 * Uses git diff analysis and historical data to predict failures.
 * Features: Git integration, file-to-test correlation, risk scoring, CLI warnings
 * @version 1.0.0-QANTUM-PRIME
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

import { logger } from '../utils/logger';

interface FileChange { path: string; status: 'added' | 'modified' | 'deleted' | 'renamed'; additions: number; deletions: number; hunks: CodeHunk[]; }
interface CodeHunk { startLine: number; endLine: number; content: string; functions: string[]; }
interface TestCorrelation { testFile: string; testName: string; sourceFiles: string[]; lastRun: number; lastResult: 'pass' | 'fail' | 'skip'; failureHistory: FailureRecord[]; avgDuration: number; }
interface FailureRecord { timestamp: number; changedFiles: string[]; errorMessage: string; gitCommit: string; }
interface RiskAssessment { file: string; riskScore: number; riskLevel: 'low' | 'medium' | 'high' | 'critical'; affectedTests: TestPrediction[]; reasons: string[]; }
interface TestPrediction { testFile: string; testName: string; failureProbability: number; correlationStrength: number; historicalFailures: number; recommendation: 'run' | 'skip' | 'prioritize'; }
interface PredictionReport { timestamp: number; gitBranch: string; gitCommit: string; changedFiles: FileChange[]; riskAssessments: RiskAssessment[]; recommendedTests: TestPrediction[]; estimatedTime: number; confidence: number; }

class CorrelationEngine {
    private correlations: Map<string, TestCorrelation[]> = new Map();
    private dbPath: string;

    constructor(dbPath: string = './pre-cog-data/correlations.json') {
        this.dbPath = dbPath;
        this.loadCorrelations();
    }

    // Complexity: O(1)
    private loadCorrelations(): void {
        try { if (fs.existsSync(this.dbPath)) { const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8')); this.correlations = new Map(Object.entries(data)); logger.debug(`🔮 [PRE-COG] Loaded ${this.correlations.size} correlations`); } }
        catch (e) { logger.warn('🔮 [PRE-COG] No existing correlations found, starting fresh'); }
    }

    // Complexity: O(1)
    save(): void {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.dbPath, JSON.stringify(Object.fromEntries(this.correlations), null, 2));
    }

    // Complexity: O(N) — linear iteration
    recordTestResult(testFile: string, testName: string, result: 'pass' | 'fail' | 'skip', changedFiles: string[], duration: number, errorMessage?: string): void {
        for (const sourceFile of changedFiles) {
            if (!this.correlations.has(sourceFile)) this.correlations.set(sourceFile, []);
            const correlations = this.correlations.get(sourceFile)!;
            let correlation = correlations.find(c => c.testFile === testFile && c.testName === testName);
            if (!correlation) { correlation = { testFile, testName, sourceFiles: [sourceFile], lastRun: Date.now(), lastResult: result, failureHistory: [], avgDuration: duration }; correlations.push(correlation); }
            correlation.lastRun = Date.now(); correlation.lastResult = result; correlation.avgDuration = (correlation.avgDuration + duration) / 2;
            if (result === 'fail') { correlation.failureHistory.push({ timestamp: Date.now(), changedFiles, errorMessage: errorMessage || 'Unknown error', gitCommit: this.getCurrentCommit() }); if (correlation.failureHistory.length > 50) correlation.failureHistory = correlation.failureHistory.slice(-50); }
        }
        this.save();
    }

    // Complexity: O(1) — hash/map lookup
    getCorrelatedTests(sourceFile: string): TestCorrelation[] { return this.correlations.get(sourceFile) || []; }

    // Complexity: O(N) — linear iteration
    getFailureProbability(testFile: string, testName: string, changedFiles: string[]): number {
        let totalScore = 0, relevantCorrelations = 0;
        for (const sourceFile of changedFiles) {
            const correlation = this.getCorrelatedTests(sourceFile).find(c => c.testFile === testFile && c.testName === testName);
            if (correlation) {
                relevantCorrelations++;
                const recentFailures = correlation.failureHistory.filter(f => Date.now() - f.timestamp < 30 * 24 * 60 * 60 * 1000);
                const failureRate = recentFailures.length / Math.max(correlation.failureHistory.length, 1);
                const lastFailure = recentFailures[recentFailures.length - 1];
                const recencyWeight = lastFailure ? Math.exp(-(Date.now() - lastFailure.timestamp) / (7 * 24 * 60 * 60 * 1000)) : 0.1;
                totalScore += failureRate * recencyWeight;
            }
        }
        return relevantCorrelations === 0 ? 0.1 : Math.min(totalScore / relevantCorrelations, 1.0);
    }

    // Complexity: O(1)
    private getCurrentCommit(): string { try { return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim().slice(0, 8); } catch { return 'unknown'; } }
}

class GitAnalyzer {
    private repoPath: string;
    constructor(repoPath: string = '.') { this.repoPath = repoPath; }

    // Complexity: O(N) — linear iteration
    getChangedFiles(base: string = 'HEAD~1'): FileChange[] {
        try {
            const diff = execSync(`git diff ${base} --name-status`, { cwd: this.repoPath, encoding: 'utf-8' });
            return diff.split('\n').filter(Boolean).map(line => {
                const [status, filePath] = line.split('\t');
                const details = this.getFileDetails(filePath, base);
                return { path: filePath, status: this.parseStatus(status), ...details };
            });
        } catch (e) { logger.error('🔮 [PRE-COG] Git analysis failed:', e); return []; }
    }

    // Complexity: O(1)
    getCurrentBranch(): string { try { return execSync('git branch --show-current', { encoding: 'utf-8' }).trim(); } catch { return 'unknown'; } }
    // Complexity: O(1)
    getCurrentCommit(): string { try { return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim(); } catch { return 'unknown'; } }

    // Complexity: O(N) — linear iteration
    private getFileDetails(filePath: string, base: string): { additions: number; deletions: number; hunks: CodeHunk[] } {
        try {
            const diffStat = execSync(`git diff ${base} --numstat -- "${filePath}"`, { cwd: this.repoPath, encoding: 'utf-8' });
            const [additions, deletions] = diffStat.split('\t').map(Number);
            const diffOutput = execSync(`git diff ${base} -U3 --function-context -- "${filePath}"`, { cwd: this.repoPath, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
            return { additions: additions || 0, deletions: deletions || 0, hunks: this.parseHunks(diffOutput) };
        } catch { return { additions: 0, deletions: 0, hunks: [] }; }
    }

    // Complexity: O(1)
    private parseStatus(status: string): FileChange['status'] {
        switch (status.charAt(0)) { case 'A': return 'added'; case 'M': return 'modified'; case 'D': return 'deleted'; case 'R': return 'renamed'; default: return 'modified'; }
    }

    // Complexity: O(N) — loop-based
    private parseHunks(diffOutput: string): CodeHunk[] {
        const hunks: CodeHunk[] = [];
        const hunkRegex = /@@ -(\d+),?\d* \+(\d+),?\d* @@ ?(.*)?/g;
        let match;
        while ((match = hunkRegex.exec(diffOutput)) !== null) {
            hunks.push({ startLine: parseInt(match[2], 10), endLine: parseInt(match[2], 10) + 10, content: match[3] || '', functions: this.extractFunctionNames(match[3] || '') });
        }
        return hunks;
    }

    // Complexity: O(N*M) — nested iteration detected
    private extractFunctionNames(context: string): string[] {
        const functions: string[] = [];
        const patterns = [/function\s+(\w+)/g, /(\w+)\s*[=:]\s*(?:async\s+)?function/g, /(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g, /class\s+(\w+)/g];
        for (const pattern of patterns) { let match; while ((match = pattern.exec(context)) !== null) { if (match[1] && !functions.includes(match[1])) functions.push(match[1]); } }
        return functions;
    }
}

class RiskScorer {
    private correlationEngine: CorrelationEngine;
    constructor(correlationEngine: CorrelationEngine) { this.correlationEngine = correlationEngine; }

    // Complexity: O(N) — linear iteration
    assessRisk(change: FileChange): RiskAssessment {
        const reasons: string[] = [];
        let baseScore = 0;
        const changeSize = change.additions + change.deletions;
        if (changeSize > 100) { baseScore += 30; reasons.push(`Large change: ${changeSize} lines modified`); }
        else if (changeSize > 50) { baseScore += 20; reasons.push(`Medium change: ${changeSize} lines modified`); }
        else if (changeSize > 10) { baseScore += 10; reasons.push(`Small change: ${changeSize} lines modified`); }

        const fileRisk = this.getFileTypeRisk(change.path);
        baseScore += fileRisk.score; if (fileRisk.reason) reasons.push(fileRisk.reason);

        const affectedFunctions = change.hunks.flatMap(h => h.functions);
        if (affectedFunctions.length > 0) { baseScore += Math.min(affectedFunctions.length * 5, 20); reasons.push(`Modified functions: ${affectedFunctions.join(', ')}`); }

        const correlatedTests = this.correlationEngine.getCorrelatedTests(change.path);
        const historicalFailures = correlatedTests.reduce((sum, c) => sum + c.failureHistory.length, 0);
        if (historicalFailures > 10) { baseScore += 25; reasons.push(`High failure history: ${historicalFailures} past failures`); }
        else if (historicalFailures > 5) { baseScore += 15; reasons.push(`Moderate failure history: ${historicalFailures} past failures`); }

        const riskScore = Math.min(baseScore, 100);
        return { file: change.path, riskScore, riskLevel: riskScore >= 80 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low', affectedTests: this.predictAffectedTests(change, correlatedTests), reasons };
    }

    // Complexity: O(1)
    private getFileTypeRisk(filePath: string): { score: number; reason?: string } {
        const fileName = path.basename(filePath).toLowerCase();
        if (fileName.includes('config') || fileName.includes('auth')) return { score: 25, reason: 'Critical configuration file' };
        if (fileName.includes('database') || fileName.includes('migration')) return { score: 30, reason: 'Database-related change' };
        if (fileName.includes('security') || fileName.includes('encrypt')) return { score: 35, reason: 'Security-critical file' };
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.sql') return { score: 25, reason: 'SQL schema change' };
        if (['.env', '.yaml', '.yml'].includes(ext)) return { score: 20, reason: 'Configuration change' };
        if (ext === '.json' && fileName === 'package.json') return { score: 15, reason: 'Dependencies changed' };
        return { score: 0 };
    }

    // Complexity: O(N log N) — sort operation
    private predictAffectedTests(change: FileChange, correlations: TestCorrelation[]): TestPrediction[] {
        return correlations.map(c => {
            const fp = this.correlationEngine.getFailureProbability(c.testFile, c.testName, [change.path]);
            return { testFile: c.testFile, testName: c.testName, failureProbability: fp, correlationStrength: Math.min(c.failureHistory.length / 10, 1.0), historicalFailures: c.failureHistory.length, recommendation: (fp > 0.7 ? 'prioritize' : fp > 0.3 ? 'run' : 'skip') as TestPrediction['recommendation'] };
        }).sort((a, b) => b.failureProbability - a.failureProbability);
    }
}

export class PredictiveEngine {
    private gitAnalyzer: GitAnalyzer;
    private correlationEngine: CorrelationEngine;
    private riskScorer: RiskScorer;

    constructor(options: { repoPath?: string; correlationsDb?: string } = {}) {
        this.gitAnalyzer = new GitAnalyzer(options.repoPath || '.');
        this.correlationEngine = new CorrelationEngine(options.correlationsDb || './pre-cog-data/correlations.json');
        this.riskScorer = new RiskScorer(this.correlationEngine);
    }

    // Complexity: O(N*M) — nested iteration detected
    async predict(base: string = 'HEAD~1'): Promise<PredictionReport> {
        logger.debug('🔮 [PRE-COG] Analyzing changes...');
        const changedFiles = this.gitAnalyzer.getChangedFiles(base);
        logger.debug(`🔮 [PRE-COG] Found ${changedFiles.length} changed files`);
        const riskAssessments = changedFiles.map(c => this.riskScorer.assessRisk(c));
        const allTests = new Map<string, TestPrediction>();
        for (const a of riskAssessments) for (const t of a.affectedTests) { const key = `${t.testFile}::${t.testName}`; const existing = allTests.get(key); if (!existing || t.failureProbability > existing.failureProbability) allTests.set(key, t); }
        const recommendedTests = Array.from(allTests.values()).sort((a, b) => b.failureProbability - a.failureProbability);
        const estimatedTime = recommendedTests.reduce((sum, t) => { const c = this.correlationEngine.getCorrelatedTests(t.testFile)[0]; return sum + (c?.avgDuration || 5000); }, 0);
        const testsWithHistory = riskAssessments.flatMap(a => a.affectedTests).filter(t => t.historicalFailures > 3);
        const totalTests = riskAssessments.flatMap(a => a.affectedTests).length;
        const confidence = totalTests === 0 ? 0.3 : Math.min(testsWithHistory.length / totalTests + 0.3, 0.95);

        return { timestamp: Date.now(), gitBranch: this.gitAnalyzer.getCurrentBranch(), gitCommit: this.gitAnalyzer.getCurrentCommit(), changedFiles, riskAssessments, recommendedTests, estimatedTime, confidence };
    }

    // Complexity: O(N) — linear iteration
    recordResults(results: Array<{ testFile: string; testName: string; result: 'pass' | 'fail' | 'skip'; duration: number; errorMessage?: string }>): void {
        const changedFiles = this.gitAnalyzer.getChangedFiles().map(f => f.path);
        for (const r of results) this.correlationEngine.recordTestResult(r.testFile, r.testName, r.result, changedFiles, r.duration, r.errorMessage);
        logger.debug(`🔮 [PRE-COG] Recorded ${results.length} test results`);
    }

    // Complexity: O(N*M) — nested iteration detected
    getWarnings(report: PredictionReport): string[] {
        const warnings: string[] = [];
        const criticalFiles = report.riskAssessments.filter(r => r.riskLevel === 'critical');
        if (criticalFiles.length > 0) { warnings.push(`⚠️  CRITICAL: ${criticalFiles.length} high-risk files modified`); for (const f of criticalFiles) warnings.push(`   └─ ${f.file} (score: ${f.riskScore})`); }
        const likelyFailures = report.recommendedTests.filter(t => t.failureProbability > 0.7);
        if (likelyFailures.length > 0) { warnings.push(`🔴 ${likelyFailures.length} tests likely to fail:`); for (const t of likelyFailures.slice(0, 5)) warnings.push(`   └─ ${t.testName} (${Math.round(t.failureProbability * 100)}% chance)`); }
        const untestedFiles = report.riskAssessments.filter(r => r.affectedTests.length === 0 && r.riskScore > 20);
        if (untestedFiles.length > 0) warnings.push(`📝 ${untestedFiles.length} changed files have no test coverage`);
        return warnings;
    }
}

export { CorrelationEngine, GitAnalyzer, RiskScorer };
