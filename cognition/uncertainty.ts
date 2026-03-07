/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM UNCERTAINTY QUANTIFIER                                               ║
 * ║   "Измерване на несигурност в изводи и прогнози"                             ║
 * ║                                                                               ║
 * ║   TODO A #7 - Uncertainty Quantification                                      ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ТИПОВЕ
// ═══════════════════════════════════════════════════════════════════════════════

export interface UncertaintyEstimate {
    value: number;              // Оценената стойност
    confidence: number;         // 0-1 колко сме сигурни
    variance: number;           // Статистическа дисперсия
    credibleInterval: [number, number];  // 95% интервал на доверие
    sources: UncertaintySource[];
    qualitative: UncertaintyLevel;
}

export interface UncertaintySource {
    name: string;
    type: UncertaintyType;
    contribution: number;  // 0-1 колко допринася за несигурността
    reducible: boolean;    // Може ли да се намали с повече данни?
    description: string;
}

export type UncertaintyType = 
    | 'epistemic'     // Липса на знание (може да се намали)
    | 'aleatoric'     // Inherent randomness (не може да се намали)
    | 'model'         // Модела може да е грешен
    | 'measurement'   // Грешки в измерванията
    | 'sampling';     // Извадката може да не е представителна

export type UncertaintyLevel = 
    | 'very_low'      // < 10% uncertainty
    | 'low'           // 10-25%
    | 'moderate'      // 25-50%
    | 'high'          // 50-75%
    | 'very_high'     // > 75%
    | 'unknown';      // Cannot estimate

export interface Prediction {
    outcome: string;
    probability: number;
    uncertainty: UncertaintyEstimate;
}

export interface CalibrationResult {
    expectedProbability: number;
    observedFrequency: number;
    calibrationError: number;
    isOverconfident: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNCERTAINTY QUANTIFIER
// ═══════════════════════════════════════════════════════════════════════════════

export class UncertaintyQuantifier {
    private calibrationHistory: CalibrationResult[] = [];
    private overconfidenceBias: number = 0;

    constructor() {}

    // ─────────────────────────────────────────────────────────────────────────
    // ОСНОВНИ МЕТОДИ
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Оценява несигурността на дадена стойност
     */
    estimate(
        value: number,
        samples: number[] = [],
        sources: Partial<UncertaintySource>[] = []
    ): UncertaintyEstimate {
        // Изчисляване на variance ако има samples
        const variance = samples.length > 1 ? this.calculateVariance(samples) : 0.25;
        
        // Изчисляване на confidence
        const sampleConfidence = Math.min(1, Math.log(samples.length + 1) / 5);
        const sourceConfidence = 1 - this.calculateSourceUncertainty(sources);
        const confidence = Math.max(0.1, (sampleConfidence + sourceConfidence) / 2);

        // Credible interval (95%)
        const margin = 1.96 * Math.sqrt(variance);
        const credibleInterval: [number, number] = [
            Math.max(0, value - margin),
            Math.min(1, value + margin)
        ];

        // Пълни source обекти
        const fullSources: UncertaintySource[] = sources.map(s => ({
            name: s.name || 'Unknown source',
            type: s.type || 'epistemic',
            contribution: s.contribution || 0.2,
            reducible: s.reducible ?? (s.type !== 'aleatoric'),
            description: s.description || ''
        }));

        // Определяне на qualitative level
        const uncertainty = 1 - confidence;
        const qualitative = this.toQualitative(uncertainty);

        return {
            value,
            confidence: this.calibrate(confidence),
            variance,
            credibleInterval,
            sources: fullSources,
            qualitative
        };
    }

    /**
     * Прави прогноза с оценка на несигурността
     */
    predict(outcome: string, baseProbability: number, factors: PredictionFactor[] = []): Prediction {
        // Adjust probability based on factors
        let adjustedProbability = baseProbability;
        const sources: UncertaintySource[] = [];

        for (const factor of factors) {
            adjustedProbability *= factor.impact;
            sources.push({
                name: factor.name,
                type: factor.uncertaintyType || 'epistemic',
                contribution: Math.abs(1 - factor.impact) * factor.confidence,
                reducible: factor.uncertaintyType !== 'aleatoric',
                description: factor.description || ''
            });
        }

        adjustedProbability = Math.min(1, Math.max(0, adjustedProbability));

        const uncertainty = this.estimate(
            adjustedProbability,
            factors.map(f => f.impact),
            sources
        );

        return {
            outcome,
            probability: this.calibrate(adjustedProbability),
            uncertainty
        };
    }

    /**
     * Комбинира несигурности от множество източници
     */
    combine(estimates: UncertaintyEstimate[]): UncertaintyEstimate {
        if (estimates.length === 0) {
            return this.createUnknown();
        }

        if (estimates.length === 1) {
            return estimates[0];
        }

        // Weighted average based on confidence
        const totalWeight = estimates.reduce((sum, e) => sum + e.confidence, 0);
        const weightedValue = estimates.reduce((sum, e) => sum + e.value * e.confidence, 0) / totalWeight;
        
        // Combined variance (assuming independence)
        const combinedVariance = estimates.reduce((sum, e) => sum + e.variance * e.confidence, 0) / totalWeight;
        
        // Combined confidence (pessimistic - use minimum adjusted by count)
        const minConfidence = Math.min(...estimates.map(e => e.confidence));
        const combinedConfidence = minConfidence * (1 + Math.log(estimates.length) / 10);

        // Merge sources
        const allSources = estimates.flatMap(e => e.sources);

        return this.estimate(weightedValue, estimates.map(e => e.value), allSources);
    }

    /**
     * Пропагира несигурност през функция
     */
    propagate(
        inputs: UncertaintyEstimate[],
        func: (...values: number[]) => number
    ): UncertaintyEstimate {
        // Monte Carlo simulation
        const simulations = 1000;
        const results: number[] = [];

        for (let i = 0; i < simulations; i++) {
            const sampledInputs = inputs.map(input => this.sampleFromEstimate(input));
            results.push(func(...sampledInputs));
        }

        const mean = results.reduce((a, b) => a + b) / results.length;
        const variance = this.calculateVariance(results);
        
        const combinedSources = inputs.flatMap(i => i.sources);
        combinedSources.push({
            name: 'Propagation uncertainty',
            type: 'model',
            contribution: 0.1,
            reducible: true,
            description: 'Uncertainty from combining multiple sources'
        });

        return this.estimate(mean, results, combinedSources);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // КАЛИБРИРАНЕ
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Добавя резултат за калибриране
     */
    recordOutcome(predictedProbability: number, actuallyHappened: boolean): void {
        const bucket = Math.floor(predictedProbability * 10) / 10;
        
        // Find or create calibration record for this bucket
        const existing = this.calibrationHistory.find(
            c => Math.abs(c.expectedProbability - bucket) < 0.05
        );

        if (existing) {
            const total = existing.observedFrequency * 10 + (actuallyHappened ? 1 : 0);
            existing.observedFrequency = total / 11;
            existing.calibrationError = Math.abs(existing.expectedProbability - existing.observedFrequency);
            existing.isOverconfident = existing.observedFrequency < existing.expectedProbability;
        } else {
            this.calibrationHistory.push({
                expectedProbability: bucket,
                observedFrequency: actuallyHappened ? 1 : 0,
                calibrationError: Math.abs(bucket - (actuallyHappened ? 1 : 0)),
                isOverconfident: !actuallyHappened && bucket > 0.5
            });
        }

        // Update overconfidence bias
        this.updateOverconfidenceBias();
    }

    /**
     * Връща калибрационен репорт
     */
    getCalibrationReport(): {
        overconfidenceBias: number;
        avgCalibrationError: number;
        buckets: CalibrationResult[];
        recommendation: string;
    } {
        const avgError = this.calibrationHistory.length > 0
            ? this.calibrationHistory.reduce((sum, c) => sum + c.calibrationError, 0) / this.calibrationHistory.length
            : 0;

        let recommendation = '';
        if (this.overconfidenceBias > 0.1) {
            recommendation = 'You are overconfident. Consider wider confidence intervals.';
        } else if (this.overconfidenceBias < -0.1) {
            recommendation = 'You are underconfident. Your estimates are better than you think.';
        } else {
            recommendation = 'Calibration is good. Keep tracking outcomes.';
        }

        return {
            overconfidenceBias: this.overconfidenceBias,
            avgCalibrationError: avgError,
            buckets: this.calibrationHistory,
            recommendation
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ПОМОЩНИ МЕТОДИ
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Преобразува числова несигурност в качествена оценка
     */
    toQualitative(uncertainty: number): UncertaintyLevel {
        if (isNaN(uncertainty)) return 'unknown';
        if (uncertainty < 0.1) return 'very_low';
        if (uncertainty < 0.25) return 'low';
        if (uncertainty < 0.5) return 'moderate';
        if (uncertainty < 0.75) return 'high';
        return 'very_high';
    }

    /**
     * Генерира човешки четимо описание
     */
    describe(estimate: UncertaintyEstimate): string {
        const percentage = (estimate.confidence * 100).toFixed(0);
        const range = `[${estimate.credibleInterval[0].toFixed(2)}-${estimate.credibleInterval[1].toFixed(2)}]`;
        
        const qualDescriptions: Record<UncertaintyLevel, string> = {
            'very_low': 'highly confident',
            'low': 'fairly confident',
            'moderate': 'moderately uncertain',
            'high': 'quite uncertain',
            'very_high': 'very uncertain',
            'unknown': 'unable to estimate'
        };

        const reducibleSources = estimate.sources.filter(s => s.reducible);
        const reduction = reducibleSources.length > 0
            ? ` Uncertainty could be reduced by addressing: ${reducibleSources.map(s => s.name).join(', ')}.`
            : '';

        return `${qualDescriptions[estimate.qualitative]} (${percentage}% confidence). Value: ${estimate.value.toFixed(3)} with 95% CI ${range}.${reduction}`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private calculateVariance(samples: number[]): number {
        if (samples.length < 2) return 0;
        const mean = samples.reduce((a, b) => a + b) / samples.length;
        return samples.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / (samples.length - 1);
    }

    private calculateSourceUncertainty(sources: Partial<UncertaintySource>[]): number {
        if (sources.length === 0) return 0.3; // Default epistemic uncertainty
        return Math.min(1, sources.reduce((sum, s) => sum + (s.contribution || 0.2), 0));
    }

    private calibrate(probability: number): number {
        // Adjust for known overconfidence bias
        if (this.overconfidenceBias > 0.05) {
            // We're overconfident - pull probabilities toward 0.5
            return probability + (0.5 - probability) * this.overconfidenceBias;
        }
        return probability;
    }

    private updateOverconfidenceBias(): void {
        if (this.calibrationHistory.length === 0) return;
        
        const avgExpected = this.calibrationHistory.reduce((sum, c) => sum + c.expectedProbability, 0) / this.calibrationHistory.length;
        const avgObserved = this.calibrationHistory.reduce((sum, c) => sum + c.observedFrequency, 0) / this.calibrationHistory.length;
        
        this.overconfidenceBias = avgExpected - avgObserved;
    }

    private sampleFromEstimate(estimate: UncertaintyEstimate): number {
        // Box-Muller for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        const stdDev = Math.sqrt(estimate.variance);
        return Math.min(1, Math.max(0, estimate.value + z * stdDev));
    }

    private createUnknown(): UncertaintyEstimate {
        return {
            value: 0.5,
            confidence: 0,
            variance: 1,
            credibleInterval: [0, 1],
            sources: [{
                name: 'No data',
                type: 'epistemic',
                contribution: 1,
                reducible: true,
                description: 'Complete uncertainty due to lack of information'
            }],
            qualitative: 'unknown'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTION FACTOR TYPE
// ═══════════════════════════════════════════════════════════════════════════════

export interface PredictionFactor {
    name: string;
    impact: number;  // Multiplier: 1.0 = no effect, >1 = increases, <1 = decreases
    confidence: number;
    uncertaintyType?: UncertaintyType;
    description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const createUncertaintyQuantifier = (): UncertaintyQuantifier => {
    return new UncertaintyQuantifier();
};

export default UncertaintyQuantifier;
