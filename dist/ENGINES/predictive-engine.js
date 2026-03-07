"use strict";
/**
 * 🔮 PRE-COG ENGINE - Predictive Test Analysis
 *
 * Uses git diff analysis and historical test data to predict
 * which tests are likely to fail based on code changes.
 *
 * Features:
 * - Git integration for change detection
 * - File-to-test correlation mapping
 * - Risk scoring algorithm
 * - CLI warnings for high-risk changes
 * - Smart test prioritization
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase 66-70
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
exports.RiskScorer = exports.GitAnalyzer = exports.CorrelationEngine = exports.PredictiveEngine = void 0;
exports.formatPredictionReport = formatPredictionReport;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// CORRELATION DATABASE
// ============================================================
class CorrelationEngine {
    correlations = new Map();
    dbPath;
    constructor(dbPath = './pre-cog-data/correlations.json') {
        this.dbPath = dbPath;
        this.loadCorrelations();
    }
    /**
     * Load correlation data from disk
     */
    loadCorrelations() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
                this.correlations = new Map(Object.entries(data));
                logger_1.logger.debug(`🔮 [PRE-COG] Loaded ${this.correlations.size} correlations`);
            }
        }
        catch (e) {
            logger_1.logger.warn('🔮 [PRE-COG] No existing correlations found, starting fresh');
        }
    }
    /**
     * Save correlation data to disk
     */
    save() {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = Object.fromEntries(this.correlations);
        fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    }
    /**
     * Record a test result and update correlations
     */
    recordTestResult(testFile, testName, result, changedFiles, duration, errorMessage) {
        for (const sourceFile of changedFiles) {
            if (!this.correlations.has(sourceFile)) {
                this.correlations.set(sourceFile, []);
            }
            const correlations = this.correlations.get(sourceFile);
            let correlation = correlations.find(c => c.testFile === testFile && c.testName === testName);
            if (!correlation) {
                correlation = {
                    testFile,
                    testName,
                    sourceFiles: [sourceFile],
                    lastRun: Date.now(),
                    lastResult: result,
                    failureHistory: [],
                    avgDuration: duration
                };
                correlations.push(correlation);
            }
            // Update correlation
            correlation.lastRun = Date.now();
            correlation.lastResult = result;
            correlation.avgDuration = (correlation.avgDuration + duration) / 2;
            // Record failure
            if (result === 'fail') {
                correlation.failureHistory.push({
                    timestamp: Date.now(),
                    changedFiles,
                    errorMessage: errorMessage || 'Unknown error',
                    gitCommit: this.getCurrentCommit()
                });
                // Keep only last 50 failures
                if (correlation.failureHistory.length > 50) {
                    correlation.failureHistory = correlation.failureHistory.slice(-50);
                }
            }
        }
        this.save();
    }
    /**
     * Get tests correlated with a source file
     */
    getCorrelatedTests(sourceFile) {
        return this.correlations.get(sourceFile) || [];
    }
    /**
     * Get failure probability for a test given changed files
     */
    getFailureProbability(testFile, testName, changedFiles) {
        let totalScore = 0;
        let relevantCorrelations = 0;
        for (const sourceFile of changedFiles) {
            const correlations = this.getCorrelatedTests(sourceFile);
            const correlation = correlations.find(c => c.testFile === testFile && c.testName === testName);
            if (correlation) {
                relevantCorrelations++;
                // Calculate failure rate from history
                const recentFailures = correlation.failureHistory.filter(f => Date.now() - f.timestamp < 30 * 24 * 60 * 60 * 1000 // Last 30 days
                );
                const failureRate = recentFailures.length /
                    Math.max(correlation.failureHistory.length, 1);
                // Weight by recency
                const lastFailure = recentFailures[recentFailures.length - 1];
                const recencyWeight = lastFailure
                    ? Math.exp(-(Date.now() - lastFailure.timestamp) / (7 * 24 * 60 * 60 * 1000))
                    : 0.1;
                totalScore += failureRate * recencyWeight;
            }
        }
        if (relevantCorrelations === 0)
            return 0.1; // Default low probability
        return Math.min(totalScore / relevantCorrelations, 1.0);
    }
    getCurrentCommit() {
        try {
            return (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8' }).trim().slice(0, 8);
        }
        catch {
            return 'unknown';
        }
    }
}
exports.CorrelationEngine = CorrelationEngine;
// ============================================================
// GIT ANALYZER
// ============================================================
class GitAnalyzer {
    repoPath;
    constructor(repoPath = '.') {
        this.repoPath = repoPath;
    }
    /**
     * Get changed files since a reference point
     */
    getChangedFiles(base = 'HEAD~1') {
        try {
            const diff = (0, child_process_1.execSync)(`git diff ${base} --name-status`, { cwd: this.repoPath, encoding: 'utf-8' });
            const changes = [];
            for (const line of diff.split('\n').filter(Boolean)) {
                const [status, filePath] = line.split('\t');
                // Get detailed diff
                const details = this.getFileDetails(filePath, base);
                changes.push({
                    path: filePath,
                    status: this.parseStatus(status),
                    additions: details.additions,
                    deletions: details.deletions,
                    hunks: details.hunks
                });
            }
            return changes;
        }
        catch (e) {
            logger_1.logger.error('🔮 [PRE-COG] Git analysis failed:', e);
            return [];
        }
    }
    /**
     * Get current branch name
     */
    getCurrentBranch() {
        try {
            return (0, child_process_1.execSync)('git branch --show-current', { encoding: 'utf-8' }).trim();
        }
        catch {
            return 'unknown';
        }
    }
    /**
     * Get current commit hash
     */
    getCurrentCommit() {
        try {
            return (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
        }
        catch {
            return 'unknown';
        }
    }
    /**
     * Check if file exists in git history
     */
    isTracked(filePath) {
        try {
            (0, child_process_1.execSync)(`git ls-files --error-unmatch ${filePath}`, {
                cwd: this.repoPath,
                stdio: 'ignore'
            });
            return true;
        }
        catch {
            return false;
        }
    }
    getFileDetails(filePath, base) {
        try {
            const diffStat = (0, child_process_1.execSync)(`git diff ${base} --numstat -- "${filePath}"`, { cwd: this.repoPath, encoding: 'utf-8' });
            const [additions, deletions] = diffStat.split('\t').map(Number);
            // Get hunks with function names
            const diffOutput = (0, child_process_1.execSync)(`git diff ${base} -U3 --function-context -- "${filePath}"`, { cwd: this.repoPath, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
            const hunks = this.parseHunks(diffOutput);
            return { additions: additions || 0, deletions: deletions || 0, hunks };
        }
        catch {
            return { additions: 0, deletions: 0, hunks: [] };
        }
    }
    parseStatus(status) {
        switch (status.charAt(0)) {
            case 'A': return 'added';
            case 'M': return 'modified';
            case 'D': return 'deleted';
            case 'R': return 'renamed';
            default: return 'modified';
        }
    }
    parseHunks(diffOutput) {
        const hunks = [];
        const hunkRegex = /@@ -(\d+),?\d* \+(\d+),?\d* @@ ?(.*)?/g;
        let match;
        while ((match = hunkRegex.exec(diffOutput)) !== null) {
            const startLine = parseInt(match[2], 10);
            const functionContext = match[3] || '';
            // Extract function names from context
            const functions = this.extractFunctionNames(functionContext);
            hunks.push({
                startLine,
                endLine: startLine + 10, // Approximate
                content: functionContext,
                functions
            });
        }
        return hunks;
    }
    extractFunctionNames(context) {
        const patterns = [
            /function\s+(\w+)/g, // function name()
            /(\w+)\s*[=:]\s*(?:async\s+)?function/g, // name = function
            /(\w+)\s*[=:]\s*(?:async\s+)?\([^)]*\)\s*=>/g, // name = () =>
            /(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g, // name() {
            /class\s+(\w+)/g, // class Name
        ];
        const functions = [];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(context)) !== null) {
                if (match[1] && !functions.includes(match[1])) {
                    functions.push(match[1]);
                }
            }
        }
        return functions;
    }
}
exports.GitAnalyzer = GitAnalyzer;
// ============================================================
// RISK SCORER
// ============================================================
class RiskScorer {
    correlationEngine;
    constructor(correlationEngine) {
        this.correlationEngine = correlationEngine;
    }
    /**
     * Calculate risk score for a file change
     */
    assessRisk(change) {
        const reasons = [];
        let baseScore = 0;
        // Factor 1: Change magnitude (additions + deletions)
        const changeSize = change.additions + change.deletions;
        if (changeSize > 100) {
            baseScore += 30;
            reasons.push(`Large change: ${changeSize} lines modified`);
        }
        else if (changeSize > 50) {
            baseScore += 20;
            reasons.push(`Medium change: ${changeSize} lines modified`);
        }
        else if (changeSize > 10) {
            baseScore += 10;
            reasons.push(`Small change: ${changeSize} lines modified`);
        }
        // Factor 2: File type risk
        const fileRisk = this.getFileTypeRisk(change.path);
        baseScore += fileRisk.score;
        if (fileRisk.reason)
            reasons.push(fileRisk.reason);
        // Factor 3: Function-level changes
        const affectedFunctions = change.hunks.flatMap(h => h.functions);
        if (affectedFunctions.length > 0) {
            baseScore += Math.min(affectedFunctions.length * 5, 20);
            reasons.push(`Modified functions: ${affectedFunctions.join(', ')}`);
        }
        // Factor 4: Historical correlation
        const correlatedTests = this.correlationEngine.getCorrelatedTests(change.path);
        const historicalFailures = correlatedTests.reduce((sum, c) => sum + c.failureHistory.length, 0);
        if (historicalFailures > 10) {
            baseScore += 25;
            reasons.push(`High failure history: ${historicalFailures} past failures`);
        }
        else if (historicalFailures > 5) {
            baseScore += 15;
            reasons.push(`Moderate failure history: ${historicalFailures} past failures`);
        }
        // Calculate affected tests
        const affectedTests = this.predictAffectedTests(change, correlatedTests);
        // Determine risk level
        const riskScore = Math.min(baseScore, 100);
        const riskLevel = this.scoreToLevel(riskScore);
        return {
            file: change.path,
            riskScore,
            riskLevel,
            affectedTests,
            reasons
        };
    }
    getFileTypeRisk(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath).toLowerCase();
        // Critical files
        if (fileName.includes('config') || fileName.includes('auth')) {
            return { score: 25, reason: 'Critical configuration file' };
        }
        if (fileName.includes('database') || fileName.includes('migration')) {
            return { score: 30, reason: 'Database-related change' };
        }
        if (fileName.includes('security') || fileName.includes('encrypt')) {
            return { score: 35, reason: 'Security-critical file' };
        }
        // By extension
        switch (ext) {
            case '.sql':
                return { score: 25, reason: 'SQL schema change' };
            case '.env':
            case '.yaml':
            case '.yml':
                return { score: 20, reason: 'Configuration change' };
            case '.json':
                if (fileName === 'package.json') {
                    return { score: 15, reason: 'Dependencies changed' };
                }
                break;
        }
        return { score: 0 };
    }
    predictAffectedTests(change, correlations) {
        return correlations.map(correlation => {
            const failureProbability = this.correlationEngine.getFailureProbability(correlation.testFile, correlation.testName, [change.path]);
            const correlationStrength = Math.min(correlation.failureHistory.length / 10, 1.0);
            return {
                testFile: correlation.testFile,
                testName: correlation.testName,
                failureProbability,
                correlationStrength,
                historicalFailures: correlation.failureHistory.length,
                recommendation: (failureProbability > 0.7 ? 'prioritize' :
                    failureProbability > 0.3 ? 'run' : 'skip')
            };
        }).sort((a, b) => b.failureProbability - a.failureProbability);
    }
    scoreToLevel(score) {
        if (score >= 80)
            return 'critical';
        if (score >= 50)
            return 'high';
        if (score >= 25)
            return 'medium';
        return 'low';
    }
}
exports.RiskScorer = RiskScorer;
// ============================================================
// PREDICTIVE ENGINE (Main Class)
// ============================================================
class PredictiveEngine {
    gitAnalyzer;
    correlationEngine;
    riskScorer;
    constructor(options = {}) {
        this.gitAnalyzer = new GitAnalyzer(options.repoPath || '.');
        this.correlationEngine = new CorrelationEngine(options.correlationsDb || './pre-cog-data/correlations.json');
        this.riskScorer = new RiskScorer(this.correlationEngine);
    }
    /**
     * Generate a full prediction report for current changes
     */
    async predict(base = 'HEAD~1') {
        logger_1.logger.debug('🔮 [PRE-COG] Analyzing changes...');
        const changedFiles = this.gitAnalyzer.getChangedFiles(base);
        logger_1.logger.debug(`🔮 [PRE-COG] Found ${changedFiles.length} changed files`);
        // Assess risk for each file
        const riskAssessments = changedFiles.map(change => this.riskScorer.assessRisk(change));
        // Aggregate test recommendations
        const allTests = new Map();
        for (const assessment of riskAssessments) {
            for (const test of assessment.affectedTests) {
                const key = `${test.testFile}::${test.testName}`;
                const existing = allTests.get(key);
                if (!existing || test.failureProbability > existing.failureProbability) {
                    allTests.set(key, test);
                }
            }
        }
        // Sort by priority
        const recommendedTests = Array.from(allTests.values())
            .sort((a, b) => b.failureProbability - a.failureProbability);
        // Estimate time
        const estimatedTime = recommendedTests.reduce((sum, test) => {
            const correlation = this.correlationEngine.getCorrelatedTests(test.testFile)[0];
            return sum + (correlation?.avgDuration || 5000);
        }, 0);
        // Calculate confidence
        const confidence = this.calculateConfidence(riskAssessments);
        return {
            timestamp: Date.now(),
            gitBranch: this.gitAnalyzer.getCurrentBranch(),
            gitCommit: this.gitAnalyzer.getCurrentCommit(),
            changedFiles,
            riskAssessments,
            recommendedTests,
            estimatedTime,
            confidence
        };
    }
    /**
     * Record test results to improve future predictions
     */
    recordResults(results) {
        const changedFiles = this.gitAnalyzer.getChangedFiles().map(f => f.path);
        for (const result of results) {
            this.correlationEngine.recordTestResult(result.testFile, result.testName, result.result, changedFiles, result.duration, result.errorMessage);
        }
        logger_1.logger.debug(`🔮 [PRE-COG] Recorded ${results.length} test results`);
    }
    /**
     * Get CLI-friendly warning messages
     */
    getWarnings(report) {
        const warnings = [];
        // Critical risk files
        const criticalFiles = report.riskAssessments.filter(r => r.riskLevel === 'critical');
        if (criticalFiles.length > 0) {
            warnings.push(`⚠️  CRITICAL: ${criticalFiles.length} high-risk files modified`);
            for (const file of criticalFiles) {
                warnings.push(`   └─ ${file.file} (score: ${file.riskScore})`);
            }
        }
        // High probability failures
        const likelyFailures = report.recommendedTests.filter(t => t.failureProbability > 0.7);
        if (likelyFailures.length > 0) {
            warnings.push(`🔴 ${likelyFailures.length} tests likely to fail:`);
            for (const test of likelyFailures.slice(0, 5)) {
                warnings.push(`   └─ ${test.testName} (${Math.round(test.failureProbability * 100)}% chance)`);
            }
        }
        // Untested changes
        const untestedFiles = report.riskAssessments.filter(r => r.affectedTests.length === 0 && r.riskScore > 20);
        if (untestedFiles.length > 0) {
            warnings.push(`📝 ${untestedFiles.length} changed files have no test coverage`);
        }
        return warnings;
    }
    calculateConfidence(assessments) {
        // Confidence based on correlation data availability
        const testsWithHistory = assessments.flatMap(a => a.affectedTests)
            .filter(t => t.historicalFailures > 3);
        const totalTests = assessments.flatMap(a => a.affectedTests).length;
        if (totalTests === 0)
            return 0.3; // No data
        return Math.min(testsWithHistory.length / totalTests + 0.3, 0.95);
    }
}
exports.PredictiveEngine = PredictiveEngine;
// ============================================================
// CLI OUTPUT FORMATTER
// ============================================================
function formatPredictionReport(report) {
    const lines = [];
    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════════╗');
    lines.push('║  🔮 PRE-COG PREDICTIVE ANALYSIS                                  ║');
    lines.push('║                                                                  ║');
    lines.push('║  "Know what breaks before it breaks"                             ║');
    lines.push('╚══════════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push(`📊 Branch: ${report.gitBranch}`);
    lines.push(`📌 Commit: ${report.gitCommit.slice(0, 8)}`);
    lines.push(`🎯 Confidence: ${Math.round(report.confidence * 100)}%`);
    lines.push('');
    // Risk Summary
    const riskCounts = {
        critical: report.riskAssessments.filter(r => r.riskLevel === 'critical').length,
        high: report.riskAssessments.filter(r => r.riskLevel === 'high').length,
        medium: report.riskAssessments.filter(r => r.riskLevel === 'medium').length,
        low: report.riskAssessments.filter(r => r.riskLevel === 'low').length,
    };
    lines.push('┌─────────────────────────────────────────────────────────────────┐');
    lines.push('│ RISK ASSESSMENT                                                 │');
    lines.push('├─────────────────────────────────────────────────────────────────┤');
    lines.push(`│ 🔴 Critical: ${riskCounts.critical.toString().padEnd(3)} │ 🟠 High: ${riskCounts.high.toString().padEnd(3)} │ 🟡 Medium: ${riskCounts.medium.toString().padEnd(3)} │ 🟢 Low: ${riskCounts.low.toString().padEnd(3)} │`);
    lines.push('└─────────────────────────────────────────────────────────────────┘');
    lines.push('');
    // High Risk Files
    const highRiskFiles = report.riskAssessments
        .filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high')
        .sort((a, b) => b.riskScore - a.riskScore);
    if (highRiskFiles.length > 0) {
        lines.push('⚠️  HIGH RISK CHANGES:');
        for (const file of highRiskFiles.slice(0, 5)) {
            const icon = file.riskLevel === 'critical' ? '🔴' : '🟠';
            lines.push(`   ${icon} ${file.file}`);
            for (const reason of file.reasons.slice(0, 2)) {
                lines.push(`      └─ ${reason}`);
            }
        }
        lines.push('');
    }
    // Recommended Tests
    const testsToRun = report.recommendedTests.filter(t => t.recommendation !== 'skip');
    lines.push('┌─────────────────────────────────────────────────────────────────┐');
    lines.push('│ RECOMMENDED TEST EXECUTION                                      │');
    lines.push('├─────────────────────────────────────────────────────────────────┤');
    lines.push(`│ Tests to run: ${testsToRun.length.toString().padEnd(48)} │`);
    lines.push(`│ Estimated time: ${Math.round(report.estimatedTime / 1000)}s${' '.repeat(47 - Math.round(report.estimatedTime / 1000).toString().length)} │`);
    lines.push('└─────────────────────────────────────────────────────────────────┘');
    lines.push('');
    // Priority Tests
    const priorityTests = report.recommendedTests
        .filter(t => t.recommendation === 'prioritize')
        .slice(0, 10);
    if (priorityTests.length > 0) {
        lines.push('🎯 PRIORITY TESTS (run these first):');
        for (const test of priorityTests) {
            const prob = Math.round(test.failureProbability * 100);
            const bar = '█'.repeat(Math.round(prob / 10)) + '░'.repeat(10 - Math.round(prob / 10));
            lines.push(`   ${bar} ${prob}% │ ${test.testName}`);
        }
        lines.push('');
    }
    lines.push('════════════════════════════════════════════════════════════════════');
    return lines.join('\n');
}
