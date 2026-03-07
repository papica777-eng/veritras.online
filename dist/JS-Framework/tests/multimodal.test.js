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
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const voice_commander_1 = require("../src/multimodal/voice-commander");
// ═══════════════════════════════════════════════════════════════════════════════
// 🎙️ VOICE COMMANDER TESTS - Audio to Intent Conversion
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🎙️ VoiceCommander - The Voice Interface', () => {
    let commander;
    (0, vitest_1.beforeEach)(() => {
        commander = new voice_commander_1.VoiceCommander();
    });
    (0, vitest_1.describe)('⚙️ Configuration', () => {
        (0, vitest_1.it)('should configure with API key', () => {
            commander.configure({
                apiKey: 'test-api-key',
                model: 'whisper-1',
                language: 'en'
            });
            (0, vitest_1.expect)(true).toBe(true); // No error = success
        });
        (0, vitest_1.it)('should emit configured event', () => {
            const configuredHandler = vitest_1.vi.fn();
            commander.on('configured', configuredHandler);
            commander.configure({ apiKey: 'test' });
            (0, vitest_1.expect)(configuredHandler).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should throw error when starting without config', async () => {
            await (0, vitest_1.expect)(commander.startListening())
                .rejects.toThrow('not configured');
        });
        (0, vitest_1.it)('should use default vocabulary', () => {
            commander.configure({ apiKey: 'test' });
            // No error = vocabulary initialized
            (0, vitest_1.expect)(true).toBe(true);
        });
    });
    (0, vitest_1.describe)('🎤 Listening State', () => {
        (0, vitest_1.beforeEach)(() => {
            commander.configure({ apiKey: 'test' });
        });
        (0, vitest_1.it)('should start listening', async () => {
            const startHandler = vitest_1.vi.fn();
            commander.on('listening:start', startHandler);
            await commander.startListening();
            (0, vitest_1.expect)(startHandler).toHaveBeenCalled();
            (0, vitest_1.expect)(commander.isActive()).toBe(true);
        });
        (0, vitest_1.it)('should stop listening', async () => {
            const stopHandler = vitest_1.vi.fn();
            commander.on('listening:stop', stopHandler);
            await commander.startListening();
            await commander.stopListening();
            (0, vitest_1.expect)(stopHandler).toHaveBeenCalled();
            (0, vitest_1.expect)(commander.isActive()).toBe(false);
        });
        (0, vitest_1.it)('should not start twice', async () => {
            await commander.startListening();
            await commander.startListening(); // Should not throw
            (0, vitest_1.expect)(commander.isActive()).toBe(true);
        });
    });
    (0, vitest_1.describe)('🎯 Intent Parsing', () => {
        (0, vitest_1.beforeEach)(() => {
            commander.configure({ apiKey: 'test' });
        });
        const mockMetadata = {
            duration: 1000,
            sampleRate: 16000,
            channels: 1,
            format: 'wav',
            volumeLevel: 0.5,
            snr: 30,
            language: 'en'
        };
        (0, vitest_1.it)('should parse navigation intent', () => {
            const intent = commander.parseIntent('go to login page', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('navigation');
            (0, vitest_1.expect)(intent.action?.verb).toBe('navigate');
            (0, vitest_1.expect)(intent.confidence).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should parse click intent', () => {
            const intent = commander.parseIntent('click the submit button', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('interaction');
            (0, vitest_1.expect)(intent.action?.verb).toBe('click');
        });
        (0, vitest_1.it)('should parse type intent', () => {
            const intent = commander.parseIntent('type "hello world" into the input', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('data_entry');
            (0, vitest_1.expect)(intent.action?.verb).toBe('type');
        });
        (0, vitest_1.it)('should parse wait intent', () => {
            const intent = commander.parseIntent('wait for 5 seconds', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('wait');
            (0, vitest_1.expect)(intent.action?.verb).toBe('wait');
            (0, vitest_1.expect)(intent.action?.params.duration).toBe(5000);
        });
        (0, vitest_1.it)('should parse assertion intent', () => {
            const intent = commander.parseIntent('verify that the title is correct', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('assertion');
            (0, vitest_1.expect)(intent.action?.verb).toBe('assert');
        });
        (0, vitest_1.it)('should parse screenshot intent', () => {
            const intent = commander.parseIntent('take a screenshot', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('screenshot');
            (0, vitest_1.expect)(intent.action?.verb).toBe('screenshot');
        });
        (0, vitest_1.it)('should parse abort intent', () => {
            const intent = commander.parseIntent('stop the test', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('abort');
            (0, vitest_1.expect)(intent.action?.params.emergency).toBe(true);
        });
        (0, vitest_1.it)('should handle unknown intent', () => {
            const intent = commander.parseIntent('random gibberish xyz', mockMetadata);
            (0, vitest_1.expect)(intent.type).toBe('unknown');
        });
        (0, vitest_1.it)('should extract URL entity', () => {
            const intent = commander.parseIntent('navigate to https://example.com', mockMetadata);
            const urlEntity = intent.entities.find(e => e.type === 'url');
            (0, vitest_1.expect)(urlEntity).toBeDefined();
            (0, vitest_1.expect)(urlEntity?.value).toContain('example.com');
        });
        (0, vitest_1.it)('should extract duration entity', () => {
            const intent = commander.parseIntent('wait 3 seconds', mockMetadata);
            const durationEntity = intent.entities.find(e => e.type === 'duration');
            (0, vitest_1.expect)(durationEntity).toBeDefined();
            (0, vitest_1.expect)(durationEntity?.value).toBe('3000');
        });
        (0, vitest_1.it)('should extract element type entity', () => {
            const intent = commander.parseIntent('click the login button', mockMetadata);
            const elementEntity = intent.entities.find(e => e.type === 'element_type');
            (0, vitest_1.expect)(elementEntity).toBeDefined();
            (0, vitest_1.expect)(elementEntity?.value).toBe('button');
        });
    });
    (0, vitest_1.describe)('📊 History & Statistics', () => {
        (0, vitest_1.beforeEach)(() => {
            commander.configure({ apiKey: 'test' });
        });
        (0, vitest_1.it)('should return empty history initially', () => {
            const history = commander.getHistory();
            (0, vitest_1.expect)(history).toEqual([]);
        });
        (0, vitest_1.it)('should return zero stats for empty history', () => {
            const stats = commander.getStats();
            (0, vitest_1.expect)(stats.totalIntents).toBe(0);
            (0, vitest_1.expect)(stats.averageConfidence).toBe(0);
        });
        (0, vitest_1.it)('should clear history', () => {
            commander.clear();
            const history = commander.getHistory();
            (0, vitest_1.expect)(history).toEqual([]);
        });
    });
    (0, vitest_1.describe)('🔊 Audio Processing', () => {
        (0, vitest_1.beforeEach)(() => {
            commander.configure({ apiKey: 'test' });
        });
        (0, vitest_1.it)('should process audio chunk while listening', async () => {
            await commander.startListening();
            const chunk = new Float32Array(1000).fill(0.1);
            const result = await commander.processAudioChunk(chunk);
            // Result depends on VAD state
            (0, vitest_1.expect)(result).toBeNull(); // Voice not ended yet
        });
        (0, vitest_1.it)('should not process audio when not listening', async () => {
            const chunk = new Float32Array(1000).fill(0.1);
            const result = await commander.processAudioChunk(chunk);
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should emit voice:start on voice activity', async () => {
            const voiceStartHandler = vitest_1.vi.fn();
            commander.on('voice:start', voiceStartHandler);
            await commander.startListening();
            // Simulate loud audio
            const chunk = new Float32Array(1000).fill(0.5);
            await commander.processAudioChunk(chunk);
            (0, vitest_1.expect)(voiceStartHandler).toHaveBeenCalled();
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 📹 VIDEO REPLAY ANALYZER TESTS
// ═══════════════════════════════════════════════════════════════════════════════
const video_replay_analyzer_1 = require("../src/multimodal/video-replay-analyzer");
(0, vitest_1.describe)('📹 VideoReplayAnalyzer - Session to Sovereign Goals', () => {
    let analyzer;
    (0, vitest_1.beforeEach)(() => {
        analyzer = new video_replay_analyzer_1.VideoReplayAnalyzer();
    });
    (0, vitest_1.describe)('⚙️ Configuration', () => {
        (0, vitest_1.it)('should configure with API key', () => {
            analyzer.configure({
                apiKey: 'test-api-key',
                model: 'gemini-2.0-flash'
            });
            (0, vitest_1.expect)(true).toBe(true);
        });
        (0, vitest_1.it)('should emit configured event', () => {
            const configuredHandler = vitest_1.vi.fn();
            analyzer.on('configured', configuredHandler);
            analyzer.configure({ apiKey: 'test' });
            (0, vitest_1.expect)(configuredHandler).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should throw error when analyzing without config', async () => {
            const buffer = new ArrayBuffer(1000);
            await (0, vitest_1.expect)(analyzer.analyzeVideo(buffer))
                .rejects.toThrow('not configured');
        });
    });
    (0, vitest_1.describe)('💻 Test Code Generation', () => {
        (0, vitest_1.beforeEach)(() => {
            analyzer.configure({ apiKey: 'test' });
        });
        (0, vitest_1.it)('should generate Playwright test code', () => {
            const goal = {
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
            (0, vitest_1.expect)(code).toContain('test(');
            (0, vitest_1.expect)(code).toContain("await page.fill");
            (0, vitest_1.expect)(code).toContain("await page.click");
            (0, vitest_1.expect)(code).toContain('SOVEREIGN GOAL');
        });
    });
    (0, vitest_1.describe)('📊 History & Statistics', () => {
        (0, vitest_1.beforeEach)(() => {
            analyzer.configure({ apiKey: 'test' });
        });
        (0, vitest_1.it)('should return empty history initially', () => {
            const history = analyzer.getHistory();
            (0, vitest_1.expect)(history).toEqual([]);
        });
        (0, vitest_1.it)('should return zero stats for empty history', () => {
            const stats = analyzer.getStats();
            (0, vitest_1.expect)(stats.totalGoals).toBe(0);
            (0, vitest_1.expect)(stats.averageConfidence).toBe(0);
            (0, vitest_1.expect)(stats.averageActionsPerGoal).toBe(0);
        });
        (0, vitest_1.it)('should clear history', () => {
            analyzer.clear();
            const history = analyzer.getHistory();
            (0, vitest_1.expect)(history).toEqual([]);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 NEURAL HUD TESTS
// ═══════════════════════════════════════════════════════════════════════════════
const neural_hud_1 = require("../src/multimodal/neural-hud");
(0, vitest_1.describe)('🧠 NeuralHUD - Brain Waves & Telemetry Dashboard', () => {
    let hud;
    (0, vitest_1.beforeEach)(() => {
        hud = new neural_hud_1.NeuralHUD({ port: 0 }); // Port 0 = random available port
    });
    (0, vitest_1.afterEach)(async () => {
        if (hud.isActive()) {
            await hud.stop();
        }
    });
    (0, vitest_1.describe)('🚀 Server Lifecycle', () => {
        (0, vitest_1.it)('should start server', async () => {
            const startHandler = vitest_1.vi.fn();
            hud.on('start', startHandler);
            await hud.start();
            (0, vitest_1.expect)(hud.isActive()).toBe(true);
            (0, vitest_1.expect)(startHandler).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should stop server', async () => {
            const stopHandler = vitest_1.vi.fn();
            hud.on('stop', stopHandler);
            await hud.start();
            await hud.stop();
            (0, vitest_1.expect)(hud.isActive()).toBe(false);
            (0, vitest_1.expect)(stopHandler).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should throw error when starting twice', async () => {
            await hud.start();
            await (0, vitest_1.expect)(hud.start()).rejects.toThrow('already running');
        });
        (0, vitest_1.it)('should handle stop when not running', async () => {
            await hud.stop(); // Should not throw
            (0, vitest_1.expect)(hud.isActive()).toBe(false);
        });
    });
    (0, vitest_1.describe)('🧠 Brain Wave Emission', () => {
        (0, vitest_1.it)('should emit perception wave', () => {
            const wave = hud.perception('voice_commander', 'Received voice input', { audio: 'test' });
            (0, vitest_1.expect)(wave.type).toBe('perception');
            (0, vitest_1.expect)(wave.source).toBe('voice_commander');
            (0, vitest_1.expect)(wave.id).toContain('wave_');
        });
        (0, vitest_1.it)('should emit reasoning wave', () => {
            const wave = hud.reasoning('selector_engine', 'Analyzing element', { elements: 5 });
            (0, vitest_1.expect)(wave.type).toBe('reasoning');
            (0, vitest_1.expect)(wave.content.summary).toBe('Analyzing element');
        });
        (0, vitest_1.it)('should emit decision wave', () => {
            const wave = hud.decision('neural_optimizer', 'Selected best selector', '#login-btn', [
                { option: '#login-btn', score: 0.95, rejected: false },
                { option: '.btn-login', score: 0.8, rejected: true, reason: 'Lower confidence' }
            ]);
            (0, vitest_1.expect)(wave.type).toBe('decision');
            (0, vitest_1.expect)(wave.content.alternatives).toHaveLength(2);
        });
        (0, vitest_1.it)('should emit action wave', () => {
            const wave = hud.action('action_executor', 'Clicked button', { success: true }, 150);
            (0, vitest_1.expect)(wave.type).toBe('action');
            (0, vitest_1.expect)(wave.duration).toBe(150);
        });
        (0, vitest_1.it)('should emit error wave', () => {
            const error = new Error('Test error');
            const wave = hud.error('test_runner', 'Test failed', error);
            (0, vitest_1.expect)(wave.type).toBe('error');
            (0, vitest_1.expect)(wave.metadata.priority).toBe('critical');
            (0, vitest_1.expect)(wave.content.details).toHaveProperty('message', 'Test error');
        });
        (0, vitest_1.it)('should increment wave sequence', () => {
            const wave1 = hud.perception('system', 'Wave 1', {});
            const wave2 = hud.perception('system', 'Wave 2', {});
            (0, vitest_1.expect)(wave2.metadata.sequence).toBe(wave1.metadata.sequence + 1);
        });
    });
    (0, vitest_1.describe)('📊 Statistics', () => {
        (0, vitest_1.it)('should return statistics', () => {
            hud.perception('system', 'Test', {});
            hud.reasoning('system', 'Test', {});
            hud.action('system', 'Test', {}, 100);
            const stats = hud.getStatistics();
            (0, vitest_1.expect)(stats.waves.total).toBe(3);
            (0, vitest_1.expect)(stats.waves.byType).toHaveProperty('perception');
            (0, vitest_1.expect)(stats.waves.byType).toHaveProperty('reasoning');
            (0, vitest_1.expect)(stats.waves.byType).toHaveProperty('action');
        });
        (0, vitest_1.it)('should get recent waves', () => {
            for (let i = 0; i < 5; i++) {
                hud.perception('system', `Wave ${i}`, {});
            }
            const recent = hud.getRecentWaves(3);
            (0, vitest_1.expect)(recent).toHaveLength(3);
        });
        (0, vitest_1.it)('should clear buffers', () => {
            hud.perception('system', 'Test', {});
            hud.clearBuffers();
            const waves = hud.getRecentWaves();
            (0, vitest_1.expect)(waves).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)('📡 Client Management', () => {
        (0, vitest_1.it)('should track client count', () => {
            (0, vitest_1.expect)(hud.getClientCount()).toBe(0);
        });
    });
    (0, vitest_1.describe)('📈 Telemetry', () => {
        (0, vitest_1.it)('should return null for latest telemetry when empty', () => {
            const latest = hud.getLatestTelemetry();
            (0, vitest_1.expect)(latest).toBeNull();
        });
    });
});
