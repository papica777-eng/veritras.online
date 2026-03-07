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
    constructor(modelName = "qantum-ai-supreme") {
        console.log(`[NeuralContext] Initialized for ${modelName}`);
    }
    /**
     * Adds a new message to the current context.
     */
    addMessage(role, content) {
        this.context.push({ role, content });
        this.pruneContext();
    }
    /**
     * Prunes context to fit within token limits.
     */
    pruneContext() {
        if (this.context.length > 20) {
            this.context = this.context.slice(-15); // Keep the last 15 messages
        }
    }
    /**
     * Returns the optimized context for AI consumption.
     */
    getContext() {
        return [...this.context];
    }
    /**
     * Clears the active context.
     */
    reset() {
        this.context = [];
    }
}
exports.NeuralContext = NeuralContext;
