"use strict";
/**
 * PrecogModule — Qantum Module
 * @module PrecogModule
 * @path src/departments/intelligence/modules/PrecogModule.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecogModule = void 0;
const predictive_engine_1 = require("../../../scripts/qantum/predictive-engine");
/**
 * @class PrecogModule
 * @description Adapter for the Pre-Cognitive Engine.
 * Allows the Cognitive Bridge to look into the future of test stability.
 */
class PrecogModule {
    engine;
    constructor() {
        this.engine = new predictive_engine_1.PredictiveEngine({
            repoPath: '.',
        });
    }
    // Complexity: O(N) — linear scan
    async execute(payload) {
        console.log('[\x1b[35mPRE-COG\x1b[0m] Consulting the Oracle...');
        try {
            const report = await this.engine.predict(payload.base || 'HEAD~1');
            // Log formatted report to console for user visibility
            console.log((0, predictive_engine_1.formatPredictionReport)(report));
            return {
                confidence: report.confidence,
                riskLevel: report.riskAssessments.some((r) => r.riskLevel === 'critical')
                    ? 'CRITICAL'
                    : 'SAFE',
                recommendedTests: report.recommendedTests.map((t) => t.testName).slice(0, 5),
                summary: `Risk: ${Math.round(report.confidence * 100)}% confidence`,
            };
        }
        catch (error) {
            return { error: String(error) };
        }
    }
    // Complexity: O(1)
    getName() {
        return 'PreCogEngine (Predictive Analysis)';
    }
}
exports.PrecogModule = PrecogModule;
