/**
 * Orchestrator — Qantum Module
 * @module Orchestrator
 * @path src/ai/Orchestrator.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { OllamaManager } from './OllamaManager';

export class Orchestrator {
  private ollama: OllamaManager;

  constructor() {
    this.ollama = OllamaManager.getInstance();
  }

  // Complexity: O(1)
  async ask(prompt: string): Promise<string> {
    console.log(`[Orchestrator] Sending prompt to Ollama: ${prompt.substring(0, 50)}...`);

    try {
      const response = await this.ollama.ask(prompt);
      return response;
    } catch (error: any) {
      console.error('[Orchestrator] AI Execution failed:', error.message);
      return `[System Error] AI failure: ${error.message}`;
    }
  }
}
