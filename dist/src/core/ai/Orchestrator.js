"use strict";
/**
 * Orchestrator — Qantum Module
 * @module Orchestrator
 * @path src/core/ai/Orchestrator.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const OllamaManager_1 = require("./OllamaManager");
class Orchestrator {
    ollama;
    constructor() {
        this.ollama = OllamaManager_1.OllamaManager.getInstance();
    }
    // Complexity: O(1)
    async ask(prompt) {
        console.log(`[Orchestrator] Sending prompt to Ollama: ${prompt.substring(0, 50)}...`);
        try {
            const response = await this.ollama.ask(prompt);
            return response;
        }
        catch (error) {
            console.error('[Orchestrator] AI Execution failed:', error.message);
            return `[System Error] AI failure: ${error.message}`;
        }
    }
}
exports.Orchestrator = Orchestrator;
