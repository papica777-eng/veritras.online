/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Aeterna
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of Aeterna.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.prodromov@Aeterna.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎤 LOCAL WHISPER BRIDGE - Python faster-whisper Integration
// ═══════════════════════════════════════════════════════════════════════════════
// Lightweight Node.js bridge to local Python faster-whisper for speech-to-text.
// Keeps the main thread light while leveraging Ryzen 7's multi-core power.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Whisper transcription result
 */
export interface WhisperResult {
    /** Transcribed text */
    text: string;
    /** Detected language */
    language: string;
    /** Language confidence (0-1) */
    languageConfidence: number;
    /** Segments with timestamps */
    segments: WhisperSegment[];
    /** Processing duration (ms) */
    processingTime: number;
    /** Model used */
    model: string;
}

/**
 * Transcription segment with timing
 */
export interface WhisperSegment {
    /** Segment ID */
    id: number;
    /** Start time (seconds) */
    start: number;
    /** End time (seconds) */
    end: number;
    /** Segment text */
    text: string;
    /** Confidence score */
    confidence: number;
}

/**
 * Whisper service configuration
 */
export interface WhisperServiceConfig {
    /** Path to Python executable */
    pythonPath: string;
    /** Whisper model size */
    model: 'tiny' | 'base' | 'small' | 'medium' | 'large-v2' | 'large-v3';
    /** Device to use */
    device: 'cpu' | 'cuda' | 'auto';
    /** Compute type */
    computeType: 'int8' | 'float16' | 'float32' | 'auto';
    /** Default language (null for auto-detect) */
    language: string | null;
    /** Path to custom Python script */
    scriptPath?: string;
    /** Timeout in milliseconds */
    timeout: number;
    /** Number of worker threads */
    threads: number;
}

/**
 * Transcription request
 */
interface TranscriptionRequest {
    id: string;
    audioPath: string;
    language?: string;
    resolve: (result: WhisperResult) => void;
    reject: (error: Error) => void;
    startTime: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎤 WHISPER SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class WhisperService extends EventEmitter {
    private config: WhisperServiceConfig;
    private pythonProcess: ChildProcess | null = null;
    private isReady: boolean = false;
    private pendingRequests: Map<string, TranscriptionRequest> = new Map();
    private requestQueue: TranscriptionRequest[] = [];
    private isProcessing: boolean = false;
    private outputBuffer: string = ';

    constructor(config?: Partial<WhisperServiceConfig>) {
        super();
        this.config = {
            pythonPath: config?.pythonPath || 'python',
            model: config?.model || 'base',
            device: config?.device || 'auto',
            computeType: config?.computeType || 'auto',
            language: config?.language || null,
            scriptPath: config?.scriptPath,
            timeout: config?.timeout || 30000,
            threads: config?.threads || 4
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Initialize the Whisper service
     */
    // Complexity: O(N) — linear iteration
    async initialize(): Promise<void> {
        if (this.isReady) {
            return;
        }

        // Create Python script if not exists
        // SAFETY: async operation — wrap in try-catch for production resilience
        const scriptPath = this.config.scriptPath || await this.createPythonScript();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                // Complexity: O(1)
                reject(new Error('Whisper service initialization timeout'));
            }, this.config.timeout);

            // Spawn Python process
            this.pythonProcess = spawn(this.config.pythonPath, [
                scriptPath,
                '--model', this.config.model,
                '--device', this.config.device,
                '--compute-type', this.config.computeType,
                '--threads', this.config.threads.toString()
            ], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Handle stdout
            this.pythonProcess.stdout?.on('data', (data: Buffer) => {
                this.handlePythonOutput(data.toString());
            });

            // Handle stderr
            this.pythonProcess.stderr?.on('data', (data: Buffer) => {
                const message = data.toString();
                // Check for ready signal
                if (message.includes('WHISPER_READY')) {
                    // Complexity: O(1)
                    clearTimeout(timeout);
                    this.isReady = true;
                    this.emit('ready');
                    // Complexity: O(1)
                    resolve();
                } else if (message.includes('WHISPER_ERROR')) {
                    // Complexity: O(1)
                    clearTimeout(timeout);
                    // Complexity: O(1)
                    reject(new Error(message));
                } else {
                    this.emit('log', message);
                }
            });

            // Handle exit
            this.pythonProcess.on('exit', (code) => {
                this.isReady = false;
                this.emit('exit', code);

                // Reject all pending requests
                Array.from(this.pendingRequests.values()).forEach(request => {
                    request.reject(new Error(`Whisper process exited with code ${code}`));
                });
                this.pendingRequests.clear();
            });

            // Handle error
            this.pythonProcess.on('error', (error) => {
                // Complexity: O(1)
                clearTimeout(timeout);
                // Complexity: O(1)
                reject(error);
            });
        });
    }

    /**
     * Shutdown the Whisper service
     */
    // Complexity: O(N)
    async shutdown(): Promise<void> {
        if (this.pythonProcess) {
            // Send shutdown command
            this.sendCommand({ type: 'shutdown' });

            // Wait for graceful shutdown
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise<void>((resolve) => {
                const timeout = setTimeout(() => {
                    this.pythonProcess?.kill('SIGKILL');
                    // Complexity: O(1)
                    resolve();
                }, 5000);

                this.pythonProcess?.on('exit', () => {
                    // Complexity: O(1)
                    clearTimeout(timeout);
                    // Complexity: O(1)
                    resolve();
                });
            });

            this.pythonProcess = null;
            this.isReady = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎯 TRANSCRIPTION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Transcribe audio file
     */
    // Complexity: O(1) — hash/map lookup
    async transcribe(audioPath: string, language?: string): Promise<WhisperResult> {
        if (!this.isReady) {
            throw new Error('Whisper service not initialized. Call initialize() first.');
        }

        // Verify file exists
        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        return new Promise((resolve, reject) => {
            const requestId = this.generateRequestId();

            const request: TranscriptionRequest = {
                id: requestId,
                audioPath,
                language: language || this.config.language || undefined,
                resolve,
                reject,
                startTime: Date.now()
            };

            // Set timeout
            // Complexity: O(1) — hash/map lookup
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    // Complexity: O(1)
                    reject(new Error('Transcription timeout'));
                }
            }, this.config.timeout);

            // Add to queue
            this.requestQueue.push(request);
            this.processQueue();
        });
    }

    /**
     * Transcribe audio buffer
     */
    // Complexity: O(1)
    async transcribeBuffer(buffer: Buffer, format: string = 'wav', language?: string): Promise<WhisperResult> {
        // Save buffer to temp file
        const tempPath = path.join(process.cwd(), `.whisper_temp_${Date.now()}.${format}`);

        try {
            fs.writeFileSync(tempPath, buffer);
            const result = await this.transcribe(tempPath, language);
            return result;
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }

    /**
     * Process request queue
     */
    // Complexity: O(1) — hash/map lookup
    private processQueue(): void {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const request = this.requestQueue.shift()!;
        this.pendingRequests.set(request.id, request);

        // Send transcription command
        this.sendCommand({
            type: 'transcribe',
            id: request.id,
            audioPath: request.audioPath,
            language: request.language
        });
    }

    /**
     * Send command to Python process
     */
    // Complexity: O(1)
    private sendCommand(command: Record<string, unknown>): void {
        if (this.pythonProcess?.stdin) {
            this.pythonProcess.stdin.write(JSON.stringify(command) + '\n');
        }
    }

    /**
     * Handle Python output
     */
    // Complexity: O(N) — linear iteration
    private handlePythonOutput(data: string): void {
        this.outputBuffer += data;

        // Process complete JSON objects
        const lines = this.outputBuffer.split('\n');
        this.outputBuffer = lines.pop() || ';

        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                const response = JSON.parse(line) as {
                    type: string;
                    id: string;
                    result?: {
                        text: string;
                        language: string;
                        language_confidence: number;
                        segments: Array<{
                            id: number;
                            start: number;
                            end: number;
                            text: string;
                            confidence: number;
                        }>;
                    };
                    error?: string;
                };

                if (response.type === 'result' && response.id) {
                    const request = this.pendingRequests.get(response.id);
                    if (request) {
                        this.pendingRequests.delete(response.id);

                        if (response.result) {
                            const result: WhisperResult = {
                                text: response.result.text,
                                language: response.result.language,
                                languageConfidence: response.result.language_confidence,
                                segments: response.result.segments.map(s => ({
                                    id: s.id,
                                    start: s.start,
                                    end: s.end,
                                    text: s.text,
                                    confidence: s.confidence
                                })),
                                processingTime: Date.now() - request.startTime,
                                model: this.config.model
                            };

                            request.resolve(result);
                            this.emit('transcription', result);
                        } else if (response.error) {
                            request.reject(new Error(response.error));
                        }

                        // Process next in queue
                        this.isProcessing = false;
                        this.processQueue();
                    }
                }
            } catch {
                // Not JSON, probably a log message
                this.emit('log', line);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🐍 PYTHON SCRIPT GENERATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create the Python bridge script
     */
    // Complexity: O(1) — amortized
    private async createPythonScript(): Promise<string> {
        const scriptPath = path.join(process.cwd(), 'scripts', 'whisper_bridge.py');
        const scriptDir = path.dirname(scriptPath);

        if (!fs.existsSync(scriptDir)) {
            fs.mkdirSync(scriptDir, { recursive: true });
        }

        const pythonScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
═══════════════════════════════════════════════════════════════════════════════
Aeterna Whisper Bridge
═══════════════════════════════════════════════════════════════════════════════
© 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
═══════════════════════════════════════════════════════════════════════════════
"""

import sys
import json
import argparse
from typing import Optional

def main():
    parser = argparse.ArgumentParser(description='Aeterna Whisper Bridge')
    parser.add_argument('--model', default='base', help='Whisper model size')
    parser.add_argument('--device', default='auto', help='Device (cpu/cuda/auto)')
    parser.add_argument('--compute-type', default='auto', help='Compute type')
    parser.add_argument('--threads', type=int, default=4, help='Number of threads')
    args = parser.parse_args()

    # Try to import faster-whisper
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        // Complexity: O(1)
        print("WHISPER_ERROR: faster-whisper not installed. Run: pip install faster-whisper", file=sys.stderr)
        sys.exit(1)

    # Determine device
    device = args.device
    compute_type = args.compute_type

    if device == 'auto':
        try:
            import torch
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
        except ImportError:
            device = 'cpu'

    if compute_type == 'auto':
        compute_type = 'float16' if device == 'cuda' else 'int8'

    # Load model
    // Complexity: O(1)
    print(f"Loading Whisper model '{args.model}' on {device}...", file=sys.stderr)

    try:
        model = WhisperModel(
            args.model,
            device=device,
            compute_type=compute_type,
            cpu_threads=args.threads
        )
        // Complexity: O(1)
        print("WHISPER_READY", file=sys.stderr)
    except Exception as e:
        // Complexity: O(1)
        print(f"WHISPER_ERROR: Failed to load model: {e}", file=sys.stderr)
        sys.exit(1)

    # Process commands from stdin
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            command = json.loads(line)
            cmd_type = command.get('type')

            if cmd_type == 'shutdown':
                // Complexity: O(1)
                print("Shutting down...", file=sys.stderr)
                break

            elif cmd_type == 'transcribe':
                request_id = command.get('id')
                audio_path = command.get('audioPath')
                language = command.get('language')

                try:
                    # Transcribe
                    segments, info = model.transcribe(
                        audio_path,
                        language=language,
                        beam_size=5,
                        vad_filter=True
                    )

                    # Collect segments
                    segment_list = []
                    full_text = []

                    for i, segment in enumerate(segments):
                        segment_list.append({
                            'id': i,
                            'start': segment.start,
                            'end': segment.end,
                            'text': segment.text.strip(),
                            'confidence': segment.avg_logprob
                        })
                        full_text.append(segment.text.strip())

                    # Send result
                    result = {
                        'type': 'result',
                        'id': request_id,
                        'result': {
                            'text': ' '.join(full_text),
                            'language': info.language,
                            'language_confidence': info.language_probability,
                            'segments': segment_list
                        }
                    }
                    // Complexity: O(1)
                    print(json.dumps(result), flush=True)

                except Exception as e:
                    error_result = {
                        'type': 'result',
                        'id': request_id,
                        'error': str(e)
                    }
                    // Complexity: O(1)
                    print(json.dumps(error_result), flush=True)

        except json.JSONDecodeError:
            // Complexity: O(1)
            print(f"Invalid JSON: {line}", file=sys.stderr)
        except Exception as e:
            // Complexity: O(1)
            print(f"Error: {e}", file=sys.stderr)

if __name__ == '__main__':
    // Complexity: O(1)
    main()
`;

        fs.writeFileSync(scriptPath, pythonScript, 'utf-8');
        return scriptPath;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🛠️ UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
    private generateRequestId(): string {
        return `whisper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check if service is ready
     */
    // Complexity: O(1)
    isServiceReady(): boolean {
        return this.isReady;
    }

    /**
     * Get current configuration
     */
    // Complexity: O(1)
    getConfig(): WhisperServiceConfig {
        return { ...this.config };
    }

    /**
     * Update configuration (requires restart)
     */
    // Complexity: O(1)
    updateConfig(config: Partial<WhisperServiceConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get queue status
     */
    // Complexity: O(1)
    getQueueStatus(): { pending: number; processing: boolean } {
        return {
            pending: this.requestQueue.length + this.pendingRequests.size,
            processing: this.isProcessing
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default WhisperService;
