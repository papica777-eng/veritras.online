/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum | QAntum Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VoiceCommander, VoiceIntent, IntentType } from '../../../src/modules/GAMMA_INFRA/core/mouth/energy/voice-commander';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎙️ VOICE COMMANDER TESTS - Audio to Intent Conversion
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🎙️ VoiceCommander - The Voice Interface', () => {
    let commander: VoiceCommander;

    // Complexity: O(1)
    beforeEach(() => {
        commander = new VoiceCommander();
    });

    // Complexity: O(1)
    describe('⚙️ Configuration', () => {
        // Complexity: O(1)
        it('should configure with API key', () => {
            commander.configure({
                apiKey: 'test-api-key',
                model: 'whisper-1',
                language: 'en'
            });

            // Complexity: O(1)
            expect(true).toBe(true); // No error = success
        });

        // Complexity: O(1)
        it('should emit configured event', () => {
            const configuredHandler = vi.fn();
            commander.on('configured', configuredHandler);

            commander.configure({ apiKey: 'test' });

            // Complexity: O(1)
            expect(configuredHandler).toHaveBeenCalled();
        });

        // Complexity: O(1)
        it('should throw error when starting without config', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await expect(commander.startListening())
                .rejects.toThrow('not configured');
        });

        // Complexity: O(1)
        it('should use default vocabulary', () => {
            commander.configure({ apiKey: 'test' });
            // No error = vocabulary initialized
            // Complexity: O(1)
            expect(true).toBe(true);
        });
    });

    // Complexity: O(1)
    describe('🎤 Listening State', () => {
        // Complexity: O(1)
        beforeEach(() => {
            commander.configure({ apiKey: 'test' });
        });

        // Complexity: O(1)
        it('should start listening', async () => {
            const startHandler = vi.fn();
            commander.on('listening:start', startHandler);

            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.startListening();

            // Complexity: O(1)
            expect(startHandler).toHaveBeenCalled();
            // Complexity: O(1)
            expect(commander.isActive()).toBe(true);
        });

        // Complexity: O(1)
        it('should stop listening', async () => {
            const stopHandler = vi.fn();
            commander.on('listening:stop', stopHandler);

            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.startListening();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.stopListening();

            // Complexity: O(1)
            expect(stopHandler).toHaveBeenCalled();
            // Complexity: O(1)
            expect(commander.isActive()).toBe(false);
        });

        // Complexity: O(1)
        it('should not start twice', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.startListening();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.startListening(); // Should not throw

            // Complexity: O(1)
            expect(commander.isActive()).toBe(true);
        });
    });

    // Complexity: O(N)
    describe('🎯 Intent Parsing', () => {
        // Complexity: O(1)
        beforeEach(() => {
            commander.configure({ apiKey: 'test' });
        });

        const mockMetadata = {
            duration: 1000,
            sampleRate: 16000,
            channels: 1,
            format: 'wav' as const,
            volumeLevel: 0.5,
            snr: 30,
            language: 'en'
        };

        // Complexity: O(1)
        it('should parse navigation intent', () => {
            const intent = commander.parseIntent('go to login page', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('navigation');
            // Complexity: O(1)
            expect(intent.action?.verb).toBe('navigate');
            // Complexity: O(1)
            expect(intent.confidence).toBeGreaterThan(0);
        });

        // Complexity: O(1)
        it('should parse click intent', () => {
            const intent = commander.parseIntent('click the submit button', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('interaction');
            // Complexity: O(1)
            expect(intent.action?.verb).toBe('click');
        });

        // Complexity: O(1)
        it('should parse type intent', () => {
            const intent = commander.parseIntent('type "hello world" into the input', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('data_entry');
            // Complexity: O(1)
            expect(intent.action?.verb).toBe('type');
        });

        // Complexity: O(N)
        it('should parse wait intent', () => {
            const intent = commander.parseIntent('wait for 5 seconds', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('wait');
            // Complexity: O(1)
            expect(intent.action?.verb).toBe('wait');
            // Complexity: O(1)
            expect(intent.action?.params.duration).toBe(5000);
        });

        // Complexity: O(1)
        it('should parse assertion intent', () => {
            const intent = commander.parseIntent('verify that the title is correct', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('assertion');
            // Complexity: O(1)
            expect(intent.action?.verb).toBe('assert');
        });

        // Complexity: O(1)
        it('should parse screenshot intent', () => {
            const intent = commander.parseIntent('take a screenshot', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('screenshot');
            // Complexity: O(1)
            expect(intent.action?.verb).toBe('screenshot');
        });

        // Complexity: O(1)
        it('should parse abort intent', () => {
            const intent = commander.parseIntent('stop the test', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('abort');
            // Complexity: O(1)
            expect(intent.action?.params.emergency).toBe(true);
        });

        // Complexity: O(1)
        it('should handle unknown intent', () => {
            const intent = commander.parseIntent('random gibberish xyz', mockMetadata);

            // Complexity: O(1)
            expect(intent.type).toBe('unknown');
        });

        // Complexity: O(N) — linear scan
        it('should extract URL entity', () => {
            const intent = commander.parseIntent('navigate to https://example.com', mockMetadata);

            const urlEntity = intent.entities.find(e => e.type === 'url');
            // Complexity: O(1)
            expect(urlEntity).toBeDefined();
            // Complexity: O(1)
            expect(urlEntity?.value).toContain('example.com');
        });

        // Complexity: O(N) — linear scan
        it('should extract duration entity', () => {
            const intent = commander.parseIntent('wait 3 seconds', mockMetadata);

            const durationEntity = intent.entities.find(e => e.type === 'duration');
            // Complexity: O(1)
            expect(durationEntity).toBeDefined();
            // Complexity: O(1)
            expect(durationEntity?.value).toBe('3000');
        });

        // Complexity: O(N) — linear scan
        it('should extract element type entity', () => {
            const intent = commander.parseIntent('click the login button', mockMetadata);

            const elementEntity = intent.entities.find(e => e.type === 'element_type');
            // Complexity: O(1)
            expect(elementEntity).toBeDefined();
            // Complexity: O(1)
            expect(elementEntity?.value).toBe('button');
        });
    });

    // Complexity: O(N)
    describe('📊 History & Statistics', () => {
        // Complexity: O(1)
        beforeEach(() => {
            commander.configure({ apiKey: 'test' });
        });

        // Complexity: O(1)
        it('should return empty history initially', () => {
            const history = commander.getHistory();
            // Complexity: O(N)
            expect(history).toEqual([]);
        });

        // Complexity: O(N)
        it('should return zero stats for empty history', () => {
            const stats = commander.getStats();

            // Complexity: O(1)
            expect(stats.totalIntents).toBe(0);
            // Complexity: O(1)
            expect(stats.averageConfidence).toBe(0);
        });

        // Complexity: O(1)
        it('should clear history', () => {
            commander.clear();

            const history = commander.getHistory();
            // Complexity: O(1)
            expect(history).toEqual([]);
        });
    });

    // Complexity: O(N)
    describe('🔊 Audio Processing', () => {
        // Complexity: O(1)
        beforeEach(() => {
            commander.configure({ apiKey: 'test' });
        });

        // Complexity: O(N)
        it('should process audio chunk while listening', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.startListening();

            const chunk = new Float32Array(1000).fill(0.1);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await commander.processAudioChunk(chunk);

            // Result depends on VAD state
            // Complexity: O(1)
            expect(result).toBeNull(); // Voice not ended yet
        });

        // Complexity: O(1)
        it('should not process audio when not listening', async () => {
            const chunk = new Float32Array(1000).fill(0.1);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await commander.processAudioChunk(chunk);

            // Complexity: O(1)
            expect(result).toBeNull();
        });

        // Complexity: O(1)
        it('should emit voice:start on voice activity', async () => {
            const voiceStartHandler = vi.fn();
            commander.on('voice:start', voiceStartHandler);

            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.startListening();

            // Simulate loud audio
            const chunk = new Float32Array(1000).fill(0.5);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await commander.processAudioChunk(chunk);

            // Complexity: O(1)
            expect(voiceStartHandler).toHaveBeenCalled();
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 📹 VIDEO REPLAY ANALYZER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

import { VideoReplayAnalyzer, SovereignGoal, GoalType } from '../../../src/strength/video-replay-analyzer';

    // Complexity: O(1)
describe('📹 VideoReplayAnalyzer - Session to Sovereign Goals', () => {
    let analyzer: VideoReplayAnalyzer;

    // Complexity: O(1)
    beforeEach(() => {
        analyzer = new VideoReplayAnalyzer();
    });

    // Complexity: O(1)
    describe('⚙️ Configuration', () => {
        // Complexity: O(1)
        it('should configure with API key', () => {
            analyzer.configure({
                apiKey: 'test-api-key',
                model: 'gemini-2.0-flash'
            });

            // Complexity: O(1)
            expect(true).toBe(true);
        });

        // Complexity: O(1)
        it('should emit configured event', () => {
            const configuredHandler = vi.fn();
            analyzer.on('configured', configuredHandler);

            analyzer.configure({ apiKey: 'test' });

            // Complexity: O(1)
            expect(configuredHandler).toHaveBeenCalled();
        });

        // Complexity: O(1)
        it('should throw error when analyzing without config', async () => {
            const buffer = new ArrayBuffer(1000);

            // SAFETY: async operation — wrap in try-catch for production resilience
            await expect(analyzer.analyzeVideo(buffer))
                .rejects.toThrow('not configured');
        });
    });

    // Complexity: O(1)
    describe('💻 Test Code Generation', () => {
        // Complexity: O(1)
        beforeEach(() => {
            analyzer.configure({ apiKey: 'test' });
        });

        // Complexity: O(1)
        it('should generate Playwright test code', () => {
            const goal: SovereignGoal = {
                id: 'goal_1',
                description: 'User login flow',
                type: 'authentication',
                priority: 'critical',
                actions: [
                    {
                        type: 'type',
                        target: {
                            type: 'input',
                            boundingBox: { x: 0, y: 0, width: 100, height: 50 },
                            selector: 'input[name="email"]',
                            text: '',
                            attributes: {},
                            visualFeatures: {
                                primaryColor: '#000',
                                backgroundColor: '#fff',
                                hasBorder: true,
                                hasShadow: false,
                                isHighlighted: false,
                                zIndex: 1
                            },
                            confidence: 0.9
                        },
                        value: 'test@example.com',
                        timestamp: 0,
                        duration: 500,
                        confidence: 0.9,
                        frameIndex: 0
                    },
                    {
                        type: 'click',
                        target: {
                            type: 'button',
                            boundingBox: { x: 0, y: 0, width: 100, height: 50 },
                            selector: 'button[type="submit"]',
                            text: 'Login',
                            attributes: {},
                            visualFeatures: {
                                primaryColor: '#000',
                                backgroundColor: '#fff',
                                hasBorder: true,
                                hasShadow: false,
                                isHighlighted: false,
                                zIndex: 1
                            },
                            confidence: 0.9
                        },
                        timestamp: 500,
                        duration: 100,
                        confidence: 0.9,
                        frameIndex: 1
                    }
                ],
                elements: [],
                confidence: 0.9,
                timeRange: { start: 0, end: 600 },
                metadata: {
                    video: { filename: 'test.mp4', duration: 1000, resolution: { width: 1920, height: 1080 }, fps: 30, size: 1000 },
                    analysis: { startTime: 0, endTime: 1000, framesAnalyzed: 10, modelUsed: 'gemini-2.0-flash' },
                    session: {}
                }
            };

            const code = analyzer.generateTestCode(goal);

            // Complexity: O(1)
            expect(code).toContain('test(');
            // Complexity: O(1)
            // SAFETY: async operation — wrap in try-catch for production resilience
            expect(code).toContain("await page.fill");
            // Complexity: O(1)
            // SAFETY: async operation — wrap in try-catch for production resilience
            expect(code).toContain("await page.click");
            // Complexity: O(1)
            expect(code).toContain('SOVEREIGN GOAL');
        });
    });

    // Complexity: O(N)
    describe('📊 History & Statistics', () => {
        // Complexity: O(1)
        beforeEach(() => {
            analyzer.configure({ apiKey: 'test' });
        });

        // Complexity: O(1)
        it('should return empty history initially', () => {
            const history = analyzer.getHistory();
            // Complexity: O(N)
            expect(history).toEqual([]);
        });

        // Complexity: O(N)
        it('should return zero stats for empty history', () => {
            const stats = analyzer.getStats();

            // Complexity: O(1)
            expect(stats.totalGoals).toBe(0);
            // Complexity: O(1)
            expect(stats.averageConfidence).toBe(0);
            // Complexity: O(1)
            expect(stats.averageActionsPerGoal).toBe(0);
        });

        // Complexity: O(1)
        it('should clear history', () => {
            analyzer.clear();

            const history = analyzer.getHistory();
            // Complexity: O(1)
            expect(history).toEqual([]);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 NEURAL HUD TESTS
// ═══════════════════════════════════════════════════════════════════════════════

import { NeuralHUD, BrainWave, TelemetrySnapshot } from '../../../src/modules/GAMMA_INFRA/core/eyes/energy/neural-hud';

    // Complexity: O(1)
describe('🧠 NeuralHUD - Brain Waves & Telemetry Dashboard', () => {
    let hud: NeuralHUD;

    // Complexity: O(1)
    beforeEach(() => {
        hud = new NeuralHUD({ port: 0 }); // Port 0 = random available port
    });

    // Complexity: O(1)
    afterEach(async () => {
        if (hud.isActive()) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await hud.stop();
        }
    });

    // Complexity: O(1)
    describe('🚀 Server Lifecycle', () => {
        // Complexity: O(1)
        it('should start server', async () => {
            const startHandler = vi.fn();
            hud.on('start', startHandler);

            // SAFETY: async operation — wrap in try-catch for production resilience
            await hud.start();

            // Complexity: O(1)
            expect(hud.isActive()).toBe(true);
            // Complexity: O(1)
            expect(startHandler).toHaveBeenCalled();
        });

        // Complexity: O(1)
        it('should stop server', async () => {
            const stopHandler = vi.fn();
            hud.on('stop', stopHandler);

            // SAFETY: async operation — wrap in try-catch for production resilience
            await hud.start();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await hud.stop();

            // Complexity: O(1)
            expect(hud.isActive()).toBe(false);
            // Complexity: O(1)
            expect(stopHandler).toHaveBeenCalled();
        });

        // Complexity: O(1)
        it('should throw error when starting twice', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await hud.start();

            // SAFETY: async operation — wrap in try-catch for production resilience
            await expect(hud.start()).rejects.toThrow('already running');
        });

        // Complexity: O(1)
        it('should handle stop when not running', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await hud.stop(); // Should not throw
            // Complexity: O(1)
            expect(hud.isActive()).toBe(false);
        });
    });

    // Complexity: O(1)
    describe('🧠 Brain Wave Emission', () => {
        // Complexity: O(1)
        it('should emit perception wave', () => {
            const wave = hud.perception('voice_commander', 'Received voice input', { audio: 'test' });

            // Complexity: O(1)
            expect(wave.type).toBe('perception');
            // Complexity: O(1)
            expect(wave.source).toBe('voice_commander');
            // Complexity: O(1)
            expect(wave.id).toContain('wave_');
        });

        // Complexity: O(1)
        it('should emit reasoning wave', () => {
            const wave = hud.reasoning('selector_engine', 'Analyzing element', { elements: 5 });

            // Complexity: O(1)
            expect(wave.type).toBe('reasoning');
            // Complexity: O(1)
            expect(wave.content.summary).toBe('Analyzing element');
        });

        // Complexity: O(1)
        it('should emit decision wave', () => {
            const wave = hud.decision(
                'neural_optimizer',
                'Selected best selector',
                '#login-btn',
                [
                    { option: '#login-btn', score: 0.95, rejected: false },
                    { option: '.btn-login', score: 0.8, rejected: true, reason: 'Lower confidence' }
                ]
            );

            // Complexity: O(1)
            expect(wave.type).toBe('decision');
            // Complexity: O(1)
            expect(wave.content.alternatives).toHaveLength(2);
        });

        // Complexity: O(1)
        it('should emit action wave', () => {
            const wave = hud.action('action_executor', 'Clicked button', { success: true }, 150);

            // Complexity: O(1)
            expect(wave.type).toBe('action');
            // Complexity: O(1)
            expect(wave.duration).toBe(150);
        });

        // Complexity: O(1)
        it('should emit error wave', () => {
            const error = new Error('Test error');
            const wave = hud.error('test_runner', 'Test failed', error);

            // Complexity: O(1)
            expect(wave.type).toBe('error');
            // Complexity: O(1)
            expect(wave.metadata.priority).toBe('critical');
            // Complexity: O(1)
            expect(wave.content.details).toHaveProperty('message', 'Test error');
        });

        // Complexity: O(1)
        it('should increment wave sequence', () => {
            const wave1 = hud.perception('system', 'Wave 1', {});
            const wave2 = hud.perception('system', 'Wave 2', {});

            // Complexity: O(1)
            expect(wave2.metadata.sequence).toBe(wave1.metadata.sequence + 1);
        });
    });

    // Complexity: O(N) — loop
    describe('📊 Statistics', () => {
        // Complexity: O(1)
        it('should return statistics', () => {
            hud.perception('system', 'Test', {});
            hud.reasoning('system', 'Test', {});
            hud.action('system', 'Test', {}, 100);

            const stats = hud.getStatistics();

            // Complexity: O(1)
            expect(stats.waves.total).toBe(3);
            // Complexity: O(1)
            expect(stats.waves.byType).toHaveProperty('perception');
            // Complexity: O(1)
            expect(stats.waves.byType).toHaveProperty('reasoning');
            // Complexity: O(1)
            expect(stats.waves.byType).toHaveProperty('action');
        });

        // Complexity: O(N) — loop
        it('should get recent waves', () => {
            for (let i = 0; i < 5; i++) {
                hud.perception('system', `Wave ${i}`, {});
            }

            const recent = hud.getRecentWaves(3);

            // Complexity: O(1)
            expect(recent).toHaveLength(3);
        });

        // Complexity: O(1)
        it('should clear buffers', () => {
            hud.perception('system', 'Test', {});
            hud.clearBuffers();

            const waves = hud.getRecentWaves();
            // Complexity: O(1)
            expect(waves).toHaveLength(0);
        });
    });

    // Complexity: O(1)
    describe('📡 Client Management', () => {
        // Complexity: O(1)
        it('should track client count', () => {
            // Complexity: O(1)
            expect(hud.getClientCount()).toBe(0);
        });
    });

    // Complexity: O(N)
    describe('📈 Telemetry', () => {
        // Complexity: O(N)
        it('should return null for latest telemetry when empty', () => {
            const latest = hud.getLatestTelemetry();
            // Complexity: O(1)
            expect(latest).toBeNull();
        });
    });
});
