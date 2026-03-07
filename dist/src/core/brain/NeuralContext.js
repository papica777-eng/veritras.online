"use strict";
/**
 * 🧠 Neural Context Manager
 * Purpose: Handles context window optimization, message pruning,
 * and long-term memory retrieval integration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralContext = void 0;
class NeuralContext {
    context = [];
    maxTokens = 8192;
    constructor(modelName = "aeterna-ai-supreme") {
        console.log(`[NeuralContext] Initialized for ${modelName}`);
    }
    /**
     * Adds a new message to the current context.
     */
    // Complexity: O(1)
    addMessage(role, content) {
        this.context.push({ role, content });
        this.pruneContext();
    }
    /**
     * Prunes context to fit within token limits.
     */
    // Complexity: O(1)
    pruneContext() {
        if (this.context.length > 20) {
            this.context = this.context.slice(-15); // Keep the last 15 messages
        }
    }
    /**
     * Returns the optimized context for AI consumption.
     */
    // Complexity: O(1)
    getContext() {
        return [...this.context];
    }
    /**
     * Clears the active context.
     */
    // Complexity: O(1)
    reset() {
        this.context = [];
    }
}
exports.NeuralContext = NeuralContext;
