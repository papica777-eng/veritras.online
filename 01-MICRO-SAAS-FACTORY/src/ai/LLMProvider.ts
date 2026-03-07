// @ts-nocheck
import { GoogleGenerativeAI } from '@google/generative-ai';

// Fallback to Ollama if Gemini is unavailable or quota exceeded
interface LLMOptions {
    model?: string;
    temperature?: number;
    responseFormat?: 'text' | 'json';
}

export class LLMProvider {
    private genAI: GoogleGenerativeAI;
    private geminiModel: string;
    private ollamaModel: string;
    private ollamaUrl: string;

    constructor() {
        // Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY || ''; // The user will provide this or it's in the environment
        this.genAI = new GoogleGenerativeAI(apiKey);

        // Use flash model for speed and lower quota usage as requested
        this.geminiModel = 'gemini-1.5-flash';

        // Ollama configuration
        this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
    }

    /**
     * Generate text using Gemini with automatic fallback to Ollama
     */
    public async generateText(prompt: string, options: LLMOptions = {}): Promise<string> {
        try {
            return await this.generateWithGemini(prompt, options);
        } catch (error: any) {
            console.warn(`[LLM] Gemini generation failed: ${error.message}. Falling back to Ollama...`);
            try {
                return await this.generateWithOllama(prompt, options);
            } catch (ollamaError: any) {
                console.error(`[LLM] Ollama fallback failed: ${ollamaError.message}`);
                throw new Error(`Both primary (Gemini) and fallback (Ollama) LLMs failed. System offline.`);
            }
        }
    }

    /**
     * Generate JSON using Gemini with automatic fallback to Ollama
     */
    public async generateJSON<T>(prompt: string, options: LLMOptions = {}): Promise<T> {
        const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. Do not include markdown codeblocks (\`\`\`json) or any other text before or after the JSON.`;

        const responseText = await this.generateText(jsonPrompt, { ...options, responseFormat: 'json' });

        try {
            // Clean up the response in case the model ignored instructions and wrapped it in markdown
            const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanedResponse) as T;
        } catch (error) {
            console.error(`[LLM] Failed to parse JSON response:`, responseText);
            throw new Error('Failed to generate valid JSON response from LLM.');
        }
    }

    private async generateWithGemini(prompt: string, options: LLMOptions): Promise<string> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured.');
        }

        const modelConfig: any = { model: this.geminiModel };

        const model = this.genAI.getGenerativeModel(modelConfig);

        const generationConfig = {
            temperature: options.temperature ?? 0.7,
        };

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig,
        });

        const response = result.response;
        return response.text();
    }

    private async generateWithOllama(prompt: string, options: LLMOptions): Promise<string> {
        const response = await fetch(this.ollamaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.ollamaModel,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: options.temperature ?? 0.7,
                },
                format: options.responseFormat === 'json' ? 'json' : undefined,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
//         return data.response;
    }
}

export const llm = new LLMProvider();

