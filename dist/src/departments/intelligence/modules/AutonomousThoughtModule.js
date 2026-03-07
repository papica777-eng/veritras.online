"use strict";
/**
 * Autonomous Thought Module Adapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutonomousThoughtModule = void 0;
const autonomous_thought_1 = require("../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisteMind-OMEGA/scripts/autonomous-thought");
class AutonomousThoughtModule {
    mind;
    constructor() {
        this.mind = autonomous_thought_1.AutonomousMind.getInstance();
    }
    // Complexity: O(1)
    async execute(payload) {
        const meditationPath = payload.meditationPath || './data/meditation-result.json';
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.mind.think(meditationPath);
    }
    // Complexity: O(1)
    getName() {
        return 'AutonomousThought';
    }
}
exports.AutonomousThoughtModule = AutonomousThoughtModule;
