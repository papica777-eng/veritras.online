/**
 * OllamaManager — Qantum Module
 * @module OllamaManager
 * @path src/ai/OllamaManager.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import axios from 'axios';
import { spawn } from 'child_process';

export class OllamaManager {
  private static instance: OllamaManager;
  private readonly baseUrl = 'http://localhost:11434';
  private modelName = 'qantum-ai-supreme';
  private preferredModels = [
    'qantum-ai-supreme',
    'qwen2.5-coder',
    'gemma3',
    'llama3',
    'mistral',
    'phi3',
    'gemma',
  ];
  private initialized = false;

  private constructor() {}

  public static getInstance(): OllamaManager {
    if (!OllamaManager.instance) {
      OllamaManager.instance = new OllamaManager();
    }
    return OllamaManager.instance;
  }

  // Complexity: O(N) — linear scan
  async getAvailableModels(): Promise<{ name: string; base: string }[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models.map((m: any) => ({
        name: m.name,
        base: m.name.split(':')[0],
      }));
    } catch (error) {
      return [];
    }
  }

  // Complexity: O(N) — linear scan
  async adaptModel(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const available = await this.getAvailableModels();
    const availableBases = available.map((m) => m.base);
    console.log('[OllamaManager] Available model bases:', availableBases);

    for (const preferred of this.preferredModels) {
      const found = available.find((m) => m.base === preferred);
      if (found) {
        this.modelName = found.name;
        console.log(`[OllamaManager] Adapted to model: ${this.modelName}`);
        return this.modelName;
      }
    }

    if (available.length > 0) {
      // Avoid cloud models if possible as they might cause 404
      const localOnly = available.filter((m) => !m.name.includes('cloud'));
      const target = localOnly.length > 0 ? localOnly[0] : available[0];
      this.modelName = target.name;
      console.log(`[OllamaManager] No preferred model found. Using: ${this.modelName}`);
      return this.modelName;
    }

    console.warn('[OllamaManager] No models found. AI features will likely fail.');
    return this.modelName;
  }

  // Complexity: O(1) — lookup
  async checkStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Complexity: O(N*M) — nested iteration
  async ensureRunning(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const isRunning = await this.checkStatus();
    if (isRunning) return true;

    console.log('[OllamaManager] Ollama not detected. Attempting to start...');

    // Attempt to start Ollama in background
    const ollama = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    ollama.unref();

    // Wait for it to start
    for (let i = 0; i < 5; i++) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // SAFETY: async operation — wrap in try-catch for production resilience
      if (await this.checkStatus()) {
        console.log('[OllamaManager] Ollama started successfully.');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.adaptModel();
        return true;
      }
    }

    return false;
  }

  // Complexity: O(1)
  async ask(prompt: string): Promise<string> {
    try {
      await this.ensureRunning();

      if (!this.initialized) {
        await this.adaptModel();
        this.initialized = true;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = process.env.OLLAMA_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.modelName,
          prompt: prompt,
          stream: false,
        },
        { headers }
      );

      return response.data.response;
    } catch (error: any) {
      console.error('[OllamaManager] Error calling Ollama:', error.message);

      // Fallback or self-healing logic could go here
      if (error.code === 'ECONNREFUSED') {
        return '[OllamaManager Error] Ollama connection refused. Please ensure Ollama is installed and running.';
      }

      return `[OllamaManager Error] ${error.message}`;
    }
  }

  // Complexity: O(1)
  setModel(name: string) {
    this.modelName = name;
  }
}
