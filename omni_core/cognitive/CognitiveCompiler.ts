/**
 * CognitiveCompiler — Qantum Module
 * @module CognitiveCompiler
 * @path omni_core/cognitive/CognitiveCompiler.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { spawn } from 'child_process';
import { z } from 'zod';
import { NeuralInference, neuralEngine } from '../intelligence/NeuralInference';

/**
 * 🔬 COGNITIVE COMPILER v2.0
 * 🌀 BIO-DIGITAL ORGANISM - REASONING CORE
 * 
 * Bridges high-level Neural Inference (Groq/DeepSeek) with 
 * low-level Neuro-Symbolic optimization (DSPy/Python).
 */
export class CognitiveCompiler {
    private static instance: CognitiveCompiler;
    private engine: NeuralInference;

    private constructor() {
        this.engine = neuralEngine;
    }

    public static getInstance(): CognitiveCompiler {
        if (!this.instance) {
            this.instance = new CognitiveCompiler();
        }
        return this.instance;
    }

    /**
     * Compilation Cycle: High-level inference refined by DSPy.
     */
    public async compileAndExecute<T>(
        intent: string,
        context: any,
        schema: z.ZodSchema<T>
    ): Promise<T> {
        console.log(`🧠 [COGNITIVE_COMPILER] Initiating Reason-Optimize-Execute cycle for: ${intent}`);

        // 1. High-Level Reasoning (NeuralInference / Mister Mind)
        // SAFETY: async operation — wrap in try-catch for production resilience
        const inferenceResult = await this.engine.infer(intent, context, { temperature: 0.1 });

        // 2. Symbolic Optimization (DSPy Bridge)
        // Passes the raw inference to the Python harness for surgical refinement
        // SAFETY: async operation — wrap in try-catch for production resilience
        const dspyOptimized = await this.optimizeViaDSPy(intent, inferenceResult || '');

        // 3. Schema Enforcement (Zod Security Armor)
        const parsed = schema.parse(JSON.parse(dspyOptimized));

        return parsed;
    }

    // Complexity: O(1)
    private async optimizeViaDSPy(task: string, inputData: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const py = spawn('python', [
                'src/core/cognitive/compiler.py',
                JSON.stringify({ signature: task, data: inputData })
            ]);

            let output = '';
            py.stdout.on('data', (data) => output += data.toString());
            py.stderr.on('data', (data) => console.error(`[DSPy-ERROR] ${data}`));

            py.on('close', (code) => {
                if (code === 0) resolve(output);
                else reject(new Error(`DSPy Optimization failed with code ${code}`));
            });
        });
    }
}
