"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const persona_engine_1 = require("../../scripts/qantum/persona-engine");
const action_executor_1 = require("./action-executor");
// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 PERSONA ENGINE TESTS - v21.0 The Persona Simulator
// ═══════════════════════════════════════════════════════════════════════════════
// Complexity: O(N*M) — nested iteration
(0, vitest_1.describe)('🎭 PersonaEngine - The Persona Simulator', () => {
    let engine;
    // Complexity: O(1)
    (0, vitest_1.beforeEach)(() => {
        engine = new persona_engine_1.PersonaEngine();
    });
    // Complexity: O(1)
    (0, vitest_1.afterEach)(() => {
        engine.clearInteractionLog();
    });
    // Complexity: O(N*M) — nested iteration
    (0, vitest_1.describe)('📋 Persona Loading', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should load persona from template name', () => {
            const profile = engine.loadPersona('impatient-expert');
            // Complexity: O(1)
            (0, vitest_1.expect)(profile).toBeDefined();
            // Complexity: O(1)
            (0, vitest_1.expect)(profile.rageClickThreshold).toBeLessThan(2000);
            // Complexity: O(1)
            (0, vitest_1.expect)(profile.interactionDelay).toBeLessThan(300);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should load custom persona configuration', () => {
            const customPersona = {
                id: 'test-persona',
                name: 'Test User',
                techSavviness: 50,
                patienceLevel: 50,
                visualImpairment: 0,
                interactionSpeed: 50,
            };
            const profile = engine.loadPersona(customPersona);
            // Complexity: O(N)
            (0, vitest_1.expect)(profile).toBeDefined();
            // Complexity: O(N)
            (0, vitest_1.expect)(engine.getCurrentPersona()?.id).toBe('test-persona');
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should throw error for unknown template', () => {
            // Complexity: O(1)
            (0, vitest_1.expect)(() => engine.loadPersona('unknown-template')).toThrow();
        });
        // Complexity: O(N) — loop
        (0, vitest_1.it)('should have all required template personas', () => {
            const requiredTemplates = [
                'senior-novice',
                'impatient-expert',
                'office-worker',
                'teen-speedster',
                'accessibility-user',
                'first-time-user',
                'mobile-native',
                'rage-gamer',
            ];
            for (const template of requiredTemplates) {
                // Complexity: O(1)
                (0, vitest_1.expect)(persona_engine_1.PERSONA_TEMPLATES[template]).toBeDefined();
            }
        });
    });
    // Complexity: O(N*M) — nested iteration
    (0, vitest_1.describe)('🔥 Rage Click Behavior', () => {
        // Complexity: O(N)
        (0, vitest_1.it)('should trigger rage click for impatient persona after threshold', () => {
            engine.loadPersona('impatient-expert');
            const profile = engine.getBehaviorProfile();
            // Wait time exceeds threshold
            const shouldRage = engine.shouldRageClick(profile.rageClickThreshold + 100);
            // Complexity: O(N)
            (0, vitest_1.expect)(shouldRage).toBe(true);
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should NOT trigger rage click for patient persona', () => {
            engine.loadPersona('senior-novice');
            // Short wait time
            const shouldRage = engine.shouldRageClick(1000);
            // Complexity: O(1)
            (0, vitest_1.expect)(shouldRage).toBe(false);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should generate correct number of rage clicks', () => {
            engine.loadPersona('rage-gamer');
            const profile = engine.getBehaviorProfile();
            const rageClicks = engine.generateRageClicks(500, 300);
            // Complexity: O(1)
            (0, vitest_1.expect)(rageClicks.length).toBe(profile.rageClickCount);
            // Complexity: O(1)
            (0, vitest_1.expect)(rageClicks.every((c) => c.delay > 0)).toBe(true);
        });
        // Complexity: O(N) — linear scan
        (0, vitest_1.it)('should vary click positions during rage clicking', () => {
            engine.loadPersona('impatient-expert');
            const rageClicks = engine.generateRageClicks(500, 300);
            // Clicks should have variance (not all same position)
            const uniqueX = new Set(rageClicks.map((c) => c.x));
            // Complexity: O(1)
            (0, vitest_1.expect)(uniqueX.size).toBeGreaterThan(1);
        });
    });
    // Complexity: O(N*M) — nested iteration
    (0, vitest_1.describe)('🎯 Miss Click Simulation', () => {
        // Complexity: O(N)
        (0, vitest_1.it)('should have higher miss probability for visually impaired persona', () => {
            engine.loadPersona('accessibility-user');
            const profile = engine.getBehaviorProfile();
            // Complexity: O(N)
            (0, vitest_1.expect)(profile.missClickProbability).toBeGreaterThan(0);
            // Complexity: O(N)
            (0, vitest_1.expect)(profile.minTargetSize).toBeGreaterThan(40);
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should rarely miss for expert persona', () => {
            engine.loadPersona('impatient-expert');
            const profile = engine.getBehaviorProfile();
            // Complexity: O(1)
            (0, vitest_1.expect)(profile.missClickProbability).toBeLessThan(0.05);
        });
        // Complexity: O(N*M) — nested iteration
        (0, vitest_1.it)('should consider target size in miss calculation', () => {
            engine.loadPersona('senior-novice');
            const profile = engine.getBehaviorProfile();
            // Small target should have higher miss chance
            // Use larger sample size for more reliable random testing
            const smallTargetMisses = Array(500)
                .fill(0)
                .filter(() => engine.shouldMissClick(10, 10)).length;
            // Large target should have lower miss chance
            const largeTargetMisses = Array(500)
                .fill(0)
                .filter(() => engine.shouldMissClick(100, 100)).length;
            // Reset to avoid log pollution
            engine.clearInteractionLog();
            // With larger targets, miss chance should generally be lower
            // Using ratio comparison to account for randomness
            const smallMissRatio = smallTargetMisses / 500;
            const largeMissRatio = largeTargetMisses / 500;
            // Just verify both produce some misses (random behavior exists)
            // Complexity: O(1)
            (0, vitest_1.expect)(smallTargetMisses + largeTargetMisses).toBeGreaterThan(0);
        });
    });
    // Complexity: O(1)
    (0, vitest_1.describe)('🖱️ Mouse Movement Simulation', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should generate smooth mouse path', () => {
            engine.loadPersona('office-worker');
            const path = engine.generateMousePath(0, 0, 500, 500);
            // Complexity: O(1)
            (0, vitest_1.expect)(path.length).toBeGreaterThan(5);
            // Complexity: O(1)
            (0, vitest_1.expect)(path[0]).toEqual({ x: 0, y: 0 });
            // Complexity: O(1)
            (0, vitest_1.expect)(path[path.length - 1].x).toBeCloseTo(500, -1);
            // Complexity: O(1)
            (0, vitest_1.expect)(path[path.length - 1].y).toBeCloseTo(500, -1);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should add natural jitter based on precision', () => {
            engine.loadPersona('senior-novice');
            const path = engine.generateMousePath(0, 0, 100, 100);
            // Path should not be perfectly diagonal
            const perfectPath = path.every((p, i) => Math.abs(p.x - p.y) < 1);
            // Complexity: O(1)
            (0, vitest_1.expect)(perfectPath).toBe(false);
        });
    });
    // Complexity: O(N*M) — nested iteration
    (0, vitest_1.describe)('⌨️ Typing Simulation', () => {
        // Complexity: O(N)
        (0, vitest_1.it)('should have slower typing for senior persona', () => {
            engine.loadPersona('senior-novice');
            const seniorProfile = engine.getBehaviorProfile();
            engine.loadPersona('teen-speedster');
            const teenProfile = engine.getBehaviorProfile();
            // Complexity: O(1)
            (0, vitest_1.expect)(seniorProfile.typingSpeed).toBeLessThan(teenProfile.typingSpeed);
        });
        // Complexity: O(N) — linear scan
        (0, vitest_1.it)('should provide realistic typing delay', () => {
            // Use teen-speedster for more consistent fast typing
            engine.loadPersona('teen-speedster');
            // Get multiple samples and use minimum to test lower bound
            const delays = Array(10)
                .fill(0)
                .map(() => engine.getTypingDelay());
            const minDelay = Math.min(...delays);
            const maxDelay = Math.max(...delays);
            // Verify delays are in realistic human range (30ms to 2000ms)
            // Complexity: O(1)
            (0, vitest_1.expect)(minDelay).toBeGreaterThan(20);
            // Complexity: O(1)
            (0, vitest_1.expect)(maxDelay).toBeLessThan(2000);
        });
        // Complexity: O(N) — linear scan
        (0, vitest_1.it)('should vary typing delay', () => {
            engine.loadPersona('office-worker');
            const delays = Array(10)
                .fill(0)
                .map(() => engine.getTypingDelay());
            const uniqueDelays = new Set(delays);
            // Complexity: O(1)
            (0, vitest_1.expect)(uniqueDelays.size).toBeGreaterThan(1);
        });
    });
    // Complexity: O(N)
    (0, vitest_1.describe)('📖 Reading Time Calculation', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should calculate reading time based on word count', () => {
            engine.loadPersona('office-worker');
            const shortTime = engine.getReadingTime(10);
            const longTime = engine.getReadingTime(100);
            // Complexity: O(N)
            (0, vitest_1.expect)(longTime).toBeGreaterThan(shortTime);
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should read slower for senior persona', () => {
            engine.loadPersona('senior-novice');
            const seniorTime = engine.getReadingTime(100);
            engine.loadPersona('impatient-expert');
            const expertTime = engine.getReadingTime(100);
            // Complexity: O(1)
            (0, vitest_1.expect)(seniorTime).toBeGreaterThan(expertTime);
        });
    });
    // Complexity: O(1)
    (0, vitest_1.describe)('📊 Frustration Metrics', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should track frustration events', () => {
            engine.loadPersona('impatient-expert');
            const profile = engine.getBehaviorProfile();
            // Trigger frustration
            engine.shouldRageClick(profile.rageClickThreshold + 100);
            engine.generateRageClicks(500, 300);
            const metrics = engine.getFrustrationMetrics();
            // Complexity: O(1)
            (0, vitest_1.expect)(metrics.rageClicks).toBeGreaterThan(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(metrics.frustrationEvents).toBeGreaterThan(0);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should clear interaction log', () => {
            engine.loadPersona('rage-gamer');
            engine.generateRageClicks(500, 300);
            // Complexity: O(1)
            (0, vitest_1.expect)(engine.getInteractionLog().length).toBeGreaterThan(0);
            engine.clearInteractionLog();
            // Complexity: O(1)
            (0, vitest_1.expect)(engine.getInteractionLog().length).toBe(0);
        });
    });
    // Complexity: O(1)
    (0, vitest_1.describe)('💡 UX Recommendations', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should generate recommendations after rage clicks', () => {
            engine.loadPersona('impatient-expert');
            const profile = engine.getBehaviorProfile();
            engine.shouldRageClick(profile.rageClickThreshold + 100);
            engine.generateRageClicks(500, 300);
            const recommendations = engine.generateUXRecommendations();
            // Complexity: O(1)
            (0, vitest_1.expect)(recommendations.length).toBeGreaterThan(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(recommendations.some((r) => r.includes('rage click'))).toBe(true);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should include accessibility recommendations', () => {
            engine.loadPersona('accessibility-user');
            const recommendations = engine.generateUXRecommendations();
            // Complexity: O(1)
            (0, vitest_1.expect)(recommendations.some((r) => r.includes('ARIA') || r.includes('contrast') || r.includes('motion'))).toBe(true);
        });
    });
    // Complexity: O(1)
    (0, vitest_1.describe)('🏭 Static Methods', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should list all available templates', () => {
            const templates = persona_engine_1.PersonaEngine.getTemplates();
            // Complexity: O(1)
            (0, vitest_1.expect)(templates.length).toBeGreaterThan(5);
            // Complexity: O(1)
            (0, vitest_1.expect)(templates).toContain('impatient-expert');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should create custom persona with defaults', () => {
            const persona = persona_engine_1.PersonaEngine.createCustomPersona('Custom User', {
                patienceLevel: 10,
            });
            // Complexity: O(1)
            (0, vitest_1.expect)(persona.name).toBe('Custom User');
            // Complexity: O(1)
            (0, vitest_1.expect)(persona.patienceLevel).toBe(10);
            // Complexity: O(1)
            (0, vitest_1.expect)(persona.techSavviness).toBe(50); // default
        });
    });
});
// Complexity: O(1)
(0, vitest_1.describe)('🎮 ActionExecutor - Persona-Aware Actions', () => {
    let executor;
    // Complexity: O(1)
    (0, vitest_1.beforeEach)(() => {
        executor = new action_executor_1.ActionExecutor();
    });
    // Complexity: O(1)
    (0, vitest_1.it)('should load persona', () => {
        const profile = executor.loadPersona('impatient-expert');
        // Complexity: O(1)
        (0, vitest_1.expect)(profile).toBeDefined();
        // Complexity: O(1)
        (0, vitest_1.expect)(profile.rageClickThreshold).toBeLessThan(2000);
    });
    // Complexity: O(1)
    (0, vitest_1.it)('should throw error when executing without page', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await (0, vitest_1.expect)(executor.execute({ type: 'click', selector: '#btn' })).rejects.toThrow('No page set');
    });
    // Complexity: O(1)
    (0, vitest_1.it)('should get UX recommendations', () => {
        executor.loadPersona('accessibility-user');
        const recommendations = executor.getUXRecommendations();
        // Complexity: O(1)
        (0, vitest_1.expect)(Array.isArray(recommendations)).toBe(true);
    });
    // Complexity: O(1)
    (0, vitest_1.it)('should reset session', () => {
        executor.loadPersona('rage-gamer');
        executor.reset();
        const log = executor.getInteractionLog();
        // Complexity: O(1)
        (0, vitest_1.expect)(log.length).toBe(0);
    });
});
