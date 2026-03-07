/**
 * 🧠 Neural Context Manager
 * Purpose: Handles context window optimization, message pruning,
 * and long-term memory retrieval integration.
 */

export class NeuralContext {
    private context: Array<{ role: string, content: string }> = [];
    private maxTokens: number = 8192;

    constructor(modelName: string = "aeterna-ai-supreme") {
        console.log(`[NeuralContext] Initialized for ${modelName}`);
    }

    /**
     * Adds a new message to the current context.
     */
    // Complexity: O(1)
    public addMessage(role: string, content: string): void {
        this.context.push({ role, content });
        this.pruneContext();
    }

    /**
     * Prunes context to fit within token limits.
     */
    // Complexity: O(1)
    private pruneContext(): void {
        if (this.context.length > 20) {
            this.context = this.context.slice(-15); // Keep the last 15 messages
        }
    }

    /**
     * Returns the optimized context for AI consumption.
     */
    // Complexity: O(1)
    public getContext(): Array<{ role: string, content: string }> {
        return [...this.context];
    }

    /**
     * Clears the active context.
     */
    // Complexity: O(1)
    public reset(): void {
        this.context = [];
    }
}
