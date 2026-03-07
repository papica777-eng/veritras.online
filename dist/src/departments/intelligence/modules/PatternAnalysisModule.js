"use strict";
/**
 * Pattern Analysis Module Adapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternAnalysisModule = void 0;
const pattern_recognizer_1 = require("../../ai/pattern-recognizer");
class PatternAnalysisModule {
    recognizer;
    constructor() {
        this.recognizer = pattern_recognizer_1.PatternRecognizer.getInstance();
    }
    // Complexity: O(N*M) — nested iteration
    async execute(payload) {
        // The pattern recognizer can register, learn, and recognize patterns
        const action = payload.action || 'status';
        switch (action) {
            case 'register':
                if (payload.name && payload.features) {
                    const id = this.recognizer.register(payload.name, payload.type || 'execution', payload.features, payload.metadata);
                    return { registered: true, id };
                }
                return { error: 'Missing name or features for registration' };
            case 'recognize':
                if (payload.features) {
                    const result = this.recognizer.recognize(payload.features);
                    return result;
                }
                return { error: 'Missing features for recognition' };
            case 'learn':
                if (payload.features) {
                    const pattern = this.recognizer.learn(payload.features, payload.type || 'execution', payload.name);
                    return { learned: true, pattern };
                }
                return { error: 'Missing features for learning' };
            default:
                return {
                    status: 'Pattern recognizer available',
                    capabilities: [
                        'Register patterns',
                        'Learn from execution data',
                        'Recognize similar patterns',
                        'Cluster analysis',
                    ],
                    actions: ['register', 'recognize', 'learn'],
                };
        }
    }
    // Complexity: O(1)
    getName() {
        return 'PatternAnalysis';
    }
}
exports.PatternAnalysisModule = PatternAnalysisModule;
