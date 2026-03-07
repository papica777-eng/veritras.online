/**
 * CYBER CODY - AI Auditor for Trading Signal Validation
 * Version: 1.0.0-SINGULARITY
 * 
 * Features:
 * - Audits GOD_MODE trading signals before execution
 * - Detects logic holes and excessive risk
 * - Triggers self-healing asset termination
 * - Real-time market condition analysis
 */

import {
    TradingSignal,
    AuditResult,
    AuditIssue,
    AssetId
} from './types';
import { SharedMemoryV2, getSharedMemory } from './SharedMemoryV2';
import { getAssetSpawner } from './AssetSpawner';

/**
 * CyberCody Configuration
 */
interface CyberCodyConfig {
    /** Maximum allowed leverage */
    maxLeverage: number;
    
    /** Maximum position size (fraction of capital) */
    maxPositionSize: number;
    
    /** Minimum risk/reward ratio */
    minRiskRewardRatio: number;
    
    /** Maximum acceptable risk score */
    maxRiskScore: number;
    
    /** Enable self-healing */
    selfHealingEnabled: boolean;
    
    /** Confidence threshold for approval */
    confidenceThreshold: number;
}

/**
 * Default Configuration
 */
const DEFAULT_CONFIG: CyberCodyConfig = {
    maxLeverage: 20,
    maxPositionSize: 0.1, // 10% of capital
    minRiskRewardRatio: 2.0, // 1:2 minimum
    maxRiskScore: 0.5,
    selfHealingEnabled: true,
    confidenceThreshold: 0.7
};

/**
 * Audit Statistics
 */
interface AuditStats {
    totalAudits: number;
    passedAudits: number;
    failedAudits: number;
    selfHealingTriggered: number;
    avgConfidence: number;
    avgRiskScore: number;
}

/**
 * CyberCody - AI Auditor for Trading Signal Validation
 * 
 * Responsibilities:
 * - Validate GOD_MODE signals before they reach Binance
 * - Detect logic holes that could result in losses
 * - Calculate risk scores based on market conditions
 * - Trigger self-healing asset termination when needed
 */
export class CyberCody {
    private config: CyberCodyConfig;
    private sharedMemory: SharedMemoryV2;
    private auditHistory: AuditResult[] = [];
    private stats: AuditStats;
    private readonly historyLimit = 1000;

    constructor(config: Partial<CyberCodyConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.sharedMemory = getSharedMemory('cyber_cody');
        
        this.stats = {
            totalAudits: 0,
            passedAudits: 0,
            failedAudits: 0,
            selfHealingTriggered: 0,
            avgConfidence: 0,
            avgRiskScore: 0
        };
        
        this.initializeSharedMemory();
    }

    /**
     * Initialize shared memory segments
     */
    private initializeSharedMemory(): void {
        this.sharedMemory.createSegment('cyber_cody_state', {
            stats: this.stats,
            lastAudit: null as AuditResult | null,
            isActive: true
        });
    }

    /**
     * Audit a trading signal
     * Returns audit result with pass/fail and recommendations
     * 
     * @param signal The trading signal to audit
     * @param assetId Optional asset ID for self-healing termination
     */
    public async auditSignal(
        signal: TradingSignal,
        assetId?: AssetId
    ): Promise<AuditResult> {
        console.log(`[CyberCody] 🔍 Auditing signal ${signal.id} (${signal.type})...`);
        
        const issues: AuditIssue[] = [];
        const recommendations: string[] = [];
        
        // Run all validation checks
        this.validateLeverage(signal, issues, recommendations);
        this.validatePositionSize(signal, issues, recommendations);
        this.validateRiskReward(signal, issues, recommendations);
        this.validatePriceLogic(signal, issues, recommendations);
        this.validateMarketConditions(signal, issues, recommendations);
        
        // Calculate scores
        const riskScore = this.calculateRiskScore(signal, issues);
        const confidence = this.calculateConfidence(signal, issues);
        
        // Determine if signal passes
        const passed = this.determinePassFail(confidence, riskScore, issues);
        
        // Check if self-healing should be triggered
        const triggerSelfHealing = !passed && 
            this.config.selfHealingEnabled && 
            riskScore > this.config.maxRiskScore;

        const result: AuditResult = {
            signalId: signal.id,
            passed,
            confidence,
            riskScore,
            issues,
            recommendations,
            triggerSelfHealing,
            auditedAt: Date.now()
        };

        // Update statistics
        this.updateStats(result);
        
        // Store in history
        this.auditHistory.push(result);
        if (this.auditHistory.length > this.historyLimit) {
            this.auditHistory.shift();
        }

        // Sync to shared memory
        await this.syncToSharedMemory(result);

        // Trigger self-healing if needed
        if (triggerSelfHealing && assetId) {
            await this.triggerSelfHealing(assetId, result);
        }

        // Log result
        if (passed) {
            console.log(`[CyberCody] ✓ Signal ${signal.id} APPROVED (confidence: ${(confidence * 100).toFixed(1)}%)`);
        } else {
            console.warn(`[CyberCody] ✗ Signal ${signal.id} REJECTED (risk: ${(riskScore * 100).toFixed(1)}%)`);
            issues.forEach(issue => {
                console.warn(`[CyberCody]   → ${issue.type}: ${issue.description}`);
            });
        }

        return result;
    }

    /**
     * Validate leverage limits
     */
    private validateLeverage(
        signal: TradingSignal,
        issues: AuditIssue[],
        recommendations: string[]
    ): void {
        if (signal.leverage > this.config.maxLeverage) {
            issues.push({
                type: 'RISK_EXCESSIVE',
                severity: 0.8,
                description: `Leverage ${signal.leverage}x exceeds maximum allowed ${this.config.maxLeverage}x`,
                suggestedFix: `Reduce leverage to ${this.config.maxLeverage}x or below`
            });
            recommendations.push(`Consider reducing leverage to ${Math.min(signal.leverage, this.config.maxLeverage)}x`);
        }
    }

    /**
     * Validate position size
     */
    private validatePositionSize(
        signal: TradingSignal,
        issues: AuditIssue[],
        recommendations: string[]
    ): void {
        if (signal.positionSize > this.config.maxPositionSize) {
            issues.push({
                type: 'RISK_EXCESSIVE',
                severity: 0.7,
                description: `Position size ${(signal.positionSize * 100).toFixed(1)}% exceeds maximum ${(this.config.maxPositionSize * 100).toFixed(1)}%`,
                suggestedFix: `Reduce position size to ${(this.config.maxPositionSize * 100).toFixed(1)}% or below`
            });
            recommendations.push('Implement proper position sizing for risk management');
        }
    }

    /**
     * Validate risk/reward ratio
     */
    private validateRiskReward(
        signal: TradingSignal,
        issues: AuditIssue[],
        recommendations: string[]
    ): void {
        const risk = Math.abs(signal.entryPrice - signal.stopLossPrice);
        const reward = Math.abs(signal.takeProfitPrice - signal.entryPrice);
        const ratio = reward / risk;

        if (ratio < this.config.minRiskRewardRatio) {
            issues.push({
                type: 'LOGIC_HOLE',
                severity: 0.6,
                description: `Risk/Reward ratio ${ratio.toFixed(2)} below minimum ${this.config.minRiskRewardRatio}`,
                suggestedFix: `Adjust TP/SL to achieve at least ${this.config.minRiskRewardRatio}:1 ratio`
            });
            recommendations.push(`Consider widening take profit or tightening stop loss`);
        }
    }

    /**
     * Validate price logic (detect impossible scenarios)
     */
    private validatePriceLogic(
        signal: TradingSignal,
        issues: AuditIssue[],
        _recommendations: string[]
    ): void {
        // Check for logical price inconsistencies
        if (signal.direction === 'LONG') {
            if (signal.stopLossPrice >= signal.entryPrice) {
                issues.push({
                    type: 'LOGIC_HOLE',
                    severity: 1.0,
                    description: 'LONG position has stop loss above entry price',
                    suggestedFix: 'Set stop loss below entry price for LONG positions'
                });
            }
            if (signal.takeProfitPrice <= signal.entryPrice) {
                issues.push({
                    type: 'LOGIC_HOLE',
                    severity: 1.0,
                    description: 'LONG position has take profit below entry price',
                    suggestedFix: 'Set take profit above entry price for LONG positions'
                });
            }
        } else if (signal.direction === 'SHORT') {
            if (signal.stopLossPrice <= signal.entryPrice) {
                issues.push({
                    type: 'LOGIC_HOLE',
                    severity: 1.0,
                    description: 'SHORT position has stop loss below entry price',
                    suggestedFix: 'Set stop loss above entry price for SHORT positions'
                });
            }
            if (signal.takeProfitPrice >= signal.entryPrice) {
                issues.push({
                    type: 'LOGIC_HOLE',
                    severity: 1.0,
                    description: 'SHORT position has take profit above entry price',
                    suggestedFix: 'Set take profit below entry price for SHORT positions'
                });
            }
        }

        // Check for zero or negative prices
        if (signal.entryPrice <= 0 || signal.stopLossPrice <= 0 || signal.takeProfitPrice <= 0) {
            issues.push({
                type: 'PARAMETER_INVALID',
                severity: 1.0,
                description: 'One or more prices are zero or negative',
                suggestedFix: 'Ensure all prices are positive values'
            });
        }
    }

    /**
     * Validate market conditions (simulated)
     * In production, would check real market data
     */
    private validateMarketConditions(
        signal: TradingSignal,
        issues: AuditIssue[],
        recommendations: string[]
    ): void {
        // Simulate market volatility check
        const simulatedVolatility = Math.random();
        
        if (simulatedVolatility > 0.8 && signal.type === 'HIGH_CONFIDENCE') {
            issues.push({
                type: 'MARKET_CONDITION',
                severity: 0.5,
                description: 'High market volatility detected during GOD_MODE signal',
                suggestedFix: 'Consider reducing position size or waiting for lower volatility'
            });
            recommendations.push('Market conditions suggest caution - consider partial position');
        }

        // Check signal age
        const signalAge = Date.now() - signal.generatedAt;
        if (signalAge > 60000) { // 1 minute old
            issues.push({
                type: 'MARKET_CONDITION',
                severity: 0.3,
                description: `Signal is ${Math.floor(signalAge / 1000)}s old, market may have moved`,
                suggestedFix: 'Regenerate signal with current market data'
            });
        }
    }

    /**
     * Calculate overall risk score
     */
    private calculateRiskScore(signal: TradingSignal, issues: AuditIssue[]): number {
        // Base risk from leverage and position size
        const leverageRisk = signal.leverage / 100; // Normalized to 0-1 for 100x max
        const positionRisk = signal.positionSize;
        
        // Risk from detected issues
        const issueRisk = issues.reduce((sum, issue) => sum + issue.severity, 0) / 
                         Math.max(issues.length, 1);
        
        // GOD_MODE signals get extra scrutiny
        const modeMultiplier = signal.type === 'HIGH_CONFIDENCE' ? 1.2 : 1.0;
        
        // Calculate weighted risk score
        const rawRisk = (leverageRisk * 0.3 + positionRisk * 0.3 + issueRisk * 0.4) * modeMultiplier;
        
        return Math.min(rawRisk, 1.0);
    }

    /**
     * Calculate confidence score
     */
    private calculateConfidence(signal: TradingSignal, issues: AuditIssue[]): number {
        // Start with base confidence
        let confidence = 0.9;
        
        // Reduce for each issue based on severity
        for (const issue of issues) {
            confidence -= issue.severity * 0.15;
        }
        
        // Bonus for proper risk/reward
        const risk = Math.abs(signal.entryPrice - signal.stopLossPrice);
        const reward = Math.abs(signal.takeProfitPrice - signal.entryPrice);
        const ratio = reward / risk;
        
        if (ratio >= 3) {
            confidence += 0.1;
        }
        
        // Penalty for high leverage
        if (signal.leverage > 10) {
            confidence -= (signal.leverage - 10) * 0.01;
        }
        
        return Math.max(0, Math.min(confidence, 1.0));
    }

    /**
     * Determine if signal passes audit
     */
    private determinePassFail(
        confidence: number,
        riskScore: number,
        issues: AuditIssue[]
    ): boolean {
        // Automatic fail for critical logic holes
        const hasCriticalIssue = issues.some(i => 
            i.type === 'LOGIC_HOLE' && i.severity >= 1.0
        );
        
        if (hasCriticalIssue) {
            return false;
        }
        
        // Check confidence threshold
        if (confidence < this.config.confidenceThreshold) {
            return false;
        }
        
        // Check risk score
        if (riskScore > this.config.maxRiskScore) {
            return false;
        }
        
        return true;
    }

    /**
     * Trigger self-healing asset termination
     */
    private async triggerSelfHealing(
        assetId: AssetId,
        auditResult: AuditResult
    ): Promise<void> {
        console.warn(`[CyberCody] 🚨 SELF-HEALING: Terminating asset ${assetId}`);
        console.warn(`[CyberCody] Reason: Risk score ${(auditResult.riskScore * 100).toFixed(1)}% exceeds threshold`);
        
        try {
            const spawner = getAssetSpawner();
            const terminated = await spawner.terminateAsset(assetId);
            
            if (terminated) {
                console.log(`[CyberCody] ✓ Asset ${assetId} terminated successfully`);
                this.stats.selfHealingTriggered++;
            } else {
                console.error(`[CyberCody] ✗ Failed to terminate asset ${assetId}`);
            }
        } catch (error) {
            console.error(`[CyberCody] Self-healing error:`, error);
        }
    }

    /**
     * Update statistics
     */
    private updateStats(result: AuditResult): void {
        this.stats.totalAudits++;
        
        if (result.passed) {
            this.stats.passedAudits++;
        } else {
            this.stats.failedAudits++;
        }
        
        // Update rolling averages
        const n = this.stats.totalAudits;
        this.stats.avgConfidence = 
            ((this.stats.avgConfidence * (n - 1)) + result.confidence) / n;
        this.stats.avgRiskScore = 
            ((this.stats.avgRiskScore * (n - 1)) + result.riskScore) / n;
    }

    /**
     * Sync state to shared memory
     */
    private async syncToSharedMemory(lastResult: AuditResult): Promise<void> {
        const acquired = await this.sharedMemory.acquireLock('cyber_cody_state');
        
        if (acquired) {
            this.sharedMemory.write('cyber_cody_state', {
                stats: this.stats,
                lastAudit: lastResult,
                isActive: true
            });
            this.sharedMemory.releaseLock('cyber_cody_state');
        }
    }

    /**
     * Get audit statistics
     */
    public getStats(): AuditStats {
        return { ...this.stats };
    }

    /**
     * Get audit history
     */
    public getAuditHistory(limit?: number): AuditResult[] {
        const history = [...this.auditHistory];
        return limit ? history.slice(-limit) : history;
    }

    /**
     * Get last audit result
     */
    public getLastAudit(): AuditResult | null {
        return this.auditHistory.length > 0 
            ? this.auditHistory[this.auditHistory.length - 1] 
            : null;
    }

    /**
     * Generate audit report
     */
    public generateReport(): string {
        const passRate = this.stats.totalAudits > 0 
            ? (this.stats.passedAudits / this.stats.totalAudits * 100).toFixed(1)
            : '0.0';

        return `
╔══════════════════════════════════════════════════════════════╗
║               CYBER CODY - AI AUDITOR REPORT                 ║
╠══════════════════════════════════════════════════════════════╣
║  Total Audits:         ${this.stats.totalAudits.toString().padStart(10)}                       ║
║  Passed:               ${this.stats.passedAudits.toString().padStart(10)} (${passRate}%)                  ║
║  Failed:               ${this.stats.failedAudits.toString().padStart(10)}                       ║
║  Self-Healing Triggered: ${this.stats.selfHealingTriggered.toString().padStart(8)}                       ║
║                                                              ║
║  Average Confidence:   ${(this.stats.avgConfidence * 100).toFixed(1).padStart(10)}%                      ║
║  Average Risk Score:   ${(this.stats.avgRiskScore * 100).toFixed(1).padStart(10)}%                      ║
╚══════════════════════════════════════════════════════════════╝
`;
    }
}

/**
 * Singleton factory
 */
let globalCody: CyberCody | null = null;

export function getCyberCody(config?: Partial<CyberCodyConfig>): CyberCody {
    if (!globalCody) {
        globalCody = new CyberCody(config);
    }
    return globalCody;
}

export function resetCyberCody(): void {
    globalCody = null;
}
