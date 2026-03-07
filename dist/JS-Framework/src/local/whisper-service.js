"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhisperService = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// ═══════════════════════════════════════════════════════════════════════════════
// 🎤 WHISPER SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class WhisperService extends events_1.EventEmitter {
    config;
    pythonProcess = null;
    isReady = false;
    pendingRequests = new Map();
    requestQueue = [];
    isProcessing = false;
    outputBuffer = '';
    constructor(config) {
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
    async initialize() {
        if (this.isReady) {
            return;
        }
        // Create Python script if not exists
        const scriptPath = this.config.scriptPath || await this.createPythonScript();
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Whisper service initialization timeout'));
            }, this.config.timeout);
            // Spawn Python process
            this.pythonProcess = (0, child_process_1.spawn)(this.config.pythonPath, [
                scriptPath,
                '--model', this.config.model,
                '--device', this.config.device,
                '--compute-type', this.config.computeType,
                '--threads', this.config.threads.toString()
            ], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            // Handle stdout
            this.pythonProcess.stdout?.on('data', (data) => {
                this.handlePythonOutput(data.toString());
            });
            // Handle stderr
            this.pythonProcess.stderr?.on('data', (data) => {
                const message = data.toString();
                // Check for ready signal
                if (message.includes('WHISPER_READY')) {
                    clearTimeout(timeout);
                    this.isReady = true;
                    this.emit('ready');
                    resolve();
                }
                else if (message.includes('WHISPER_ERROR')) {
                    clearTimeout(timeout);
                    reject(new Error(message));
                }
                else {
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
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    /**
     * Shutdown the Whisper service
     */
    async shutdown() {
        if (this.pythonProcess) {
            // Send shutdown command
            this.sendCommand({ type: 'shutdown' });
            // Wait for graceful shutdown
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    this.pythonProcess?.kill('SIGKILL');
                    resolve();
                }, 5000);
                this.pythonProcess?.on('exit', () => {
                    clearTimeout(timeout);
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
    async transcribe(audioPath, language) {
        if (!this.isReady) {
            throw new Error('Whisper service not initialized. Call initialize() first.');
        }
        // Verify file exists
        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }
        return new Promise((resolve, reject) => {
            const requestId = this.generateRequestId();
            const request = {
                id: requestId,
                audioPath,
                language: language || this.config.language || undefined,
                resolve,
                reject,
                startTime: Date.now()
            };
            // Set timeout
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
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
    async transcribeBuffer(buffer, format = 'wav', language) {
        // Save buffer to temp file
        const tempPath = path.join(process.cwd(), `.whisper_temp_${Date.now()}.${format}`);
        try {
            fs.writeFileSync(tempPath, buffer);
            const result = await this.transcribe(tempPath, language);
            return result;
        }
        finally {
            // Clean up temp file
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
    /**
     * Process request queue
     */
    processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }
        this.isProcessing = true;
        const request = this.requestQueue.shift();
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
    sendCommand(command) {
        if (this.pythonProcess?.stdin) {
            this.pythonProcess.stdin.write(JSON.stringify(command) + '\n');
        }
    }
    /**
     * Handle Python output
     */
    handlePythonOutput(data) {
        this.outputBuffer += data;
        // Process complete JSON objects
        const lines = this.outputBuffer.split('\n');
        this.outputBuffer = lines.pop() || '';
        for (const line of lines) {
            if (!line.trim())
                continue;
            try {
                const response = JSON.parse(line);
                if (response.type === 'result' && response.id) {
                    const request = this.pendingRequests.get(response.id);
                    if (request) {
                        this.pendingRequests.delete(response.id);
                        if (response.result) {
                            const result = {
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
                        }
                        else if (response.error) {
                            request.reject(new Error(response.error));
                        }
                        // Process next in queue
                        this.isProcessing = false;
                        this.processQueue();
                    }
                }
            }
            catch {
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
    async createPythonScript() {
        const scriptPath = path.join(process.cwd(), 'scripts', 'whisper_bridge.py');
        const scriptDir = path.dirname(scriptPath);
        if (!fs.existsSync(scriptDir)) {
            fs.mkdirSync(scriptDir, { recursive: true });
        }
        const pythonScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
═══════════════════════════════════════════════════════════════════════════════
QAntum Whisper Bridge
═══════════════════════════════════════════════════════════════════════════════
© 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
═══════════════════════════════════════════════════════════════════════════════
"""

import sys
import json
import argparse
from typing import Optional

def main():
    parser = argparse.ArgumentParser(description='QAntum Whisper Bridge')
    parser.add_argument('--model', default='base', help='Whisper model size')
    parser.add_argument('--device', default='auto', help='Device (cpu/cuda/auto)')
    parser.add_argument('--compute-type', default='auto', help='Compute type')
    parser.add_argument('--threads', type=int, default=4, help='Number of threads')
    args = parser.parse_args()
    
    # Try to import faster-whisper
    try:
        from faster_whisper import WhisperModel
    except ImportError:
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
    print(f"Loading Whisper model '{args.model}' on {device}...", file=sys.stderr)
    
    try:
        model = WhisperModel(
            args.model,
            device=device,
            compute_type=compute_type,
            cpu_threads=args.threads
        )
        print("WHISPER_READY", file=sys.stderr)
    except Exception as e:
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
                    print(json.dumps(result), flush=True)
                    
                except Exception as e:
                    error_result = {
                        'type': 'result',
                        'id': request_id,
                        'error': str(e)
                    }
                    print(json.dumps(error_result), flush=True)
        
        except json.JSONDecodeError:
            print(f"Invalid JSON: {line}", file=sys.stderr)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)

if __name__ == '__main__':
    main()
`;
        fs.writeFileSync(scriptPath, pythonScript, 'utf-8');
        return scriptPath;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🛠️ UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    generateRequestId() {
        return `whisper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Check if service is ready
     */
    isServiceReady() {
        return this.isReady;
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration (requires restart)
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            pending: this.requestQueue.length + this.pendingRequests.size,
            processing: this.isProcessing
        };
    }
}
exports.WhisperService = WhisperService;
// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = WhisperService;
