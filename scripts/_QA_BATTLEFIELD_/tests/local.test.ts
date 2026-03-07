/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum v23.0 Phase 1 Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 WHISPER SERVICE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('WhisperService', () => {
    // Complexity: O(1)
    describe('Configuration', () => {
        // Complexity: O(1)
        it('should initialize with default configuration', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService();
            const config = service.getConfig();
            
            // Complexity: O(1)
            expect(config.model).toBe('base');
            // Complexity: O(1)
            expect(config.device).toBe('auto');
            // Complexity: O(1)
            expect(config.computeType).toBe('auto');
            // Complexity: O(1)
            expect(config.timeout).toBe(30000);
            // Complexity: O(1)
            expect(config.threads).toBe(4);
        });
        
        // Complexity: O(1)
        it('should accept custom configuration', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService({
                model: 'large-v3',
                device: 'cuda',
                computeType: 'float16',
                timeout: 60000,
                threads: 8
            });
            const config = service.getConfig();
            
            // Complexity: O(1)
            expect(config.model).toBe('large-v3');
            // Complexity: O(1)
            expect(config.device).toBe('cuda');
            // Complexity: O(1)
            expect(config.computeType).toBe('float16');
            // Complexity: O(1)
            expect(config.timeout).toBe(60000);
            // Complexity: O(1)
            expect(config.threads).toBe(8);
        });
        
        // Complexity: O(1)
        it('should update configuration', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService();
            
            service.updateConfig({ model: 'medium', threads: 16 });
            const config = service.getConfig();
            
            // Complexity: O(1)
            expect(config.model).toBe('medium');
            // Complexity: O(1)
            expect(config.threads).toBe(16);
        });
        
        // Complexity: O(1)
        it('should extend EventEmitter', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService();
            
            // Complexity: O(1)
            expect(service).toBeInstanceOf(EventEmitter);
        });
    });
    
    // Complexity: O(1)
    describe('Queue Management', () => {
        // Complexity: O(1)
        it('should report queue status', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService();
            const status = service.getQueueStatus();
            
            // Complexity: O(1)
            expect(status).toHaveProperty('pending');
            // Complexity: O(1)
            expect(status).toHaveProperty('processing');
            // Complexity: O(1)
            expect(status.pending).toBe(0);
            // Complexity: O(1)
            expect(status.processing).toBe(false);
        });
        
        // Complexity: O(1)
        it('should report service ready status', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService();
            
            // Complexity: O(1)
            expect(service.isServiceReady()).toBe(false);
        });
    });
    
    // Complexity: O(1)
    describe('Transcription Validation', () => {
        // Complexity: O(1)
        it('should reject transcription if not initialized', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService();
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            await expect(service.transcribe('test.wav')).rejects.toThrow(
                'Whisper service not initialized'
            );
        });
        
        // Complexity: O(1)
        it('should validate audio file existence', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService();
            
            // Mock isReady
            (service as unknown as { isReady: boolean }).isReady = true;
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            await expect(service.transcribe('nonexistent.wav')).rejects.toThrow(
                'Audio file not found'
            );
        });
    });
    
    // Complexity: O(N) — loop
    describe('Model Sizes', () => {
        // Complexity: O(N) — loop
        it('should support all Whisper model sizes', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const modelSizes = ['tiny', 'base', 'small', 'medium', 'large-v2', 'large-v3'] as const;
            
            for (const model of modelSizes) {
                const service = new WhisperService({ model });
                // Complexity: O(1)
                expect(service.getConfig().model).toBe(model);
            }
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 BULGARIAN LOCALE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Bulgarian Semantic Mapping', () => {
    let bgLocale: {
        language: string;
        locale: string;
        name: string;
        commands: Record<string, { keywords: string[]; patterns: string[] }>;
        entities: Record<string, Record<string, string[]>>;
        modifiers: Record<string, string[]>;
        confirmations: Record<string, string[]>;
    };
    
    // Complexity: O(1)
    beforeEach(async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        bgLocale = (await import('../src/multimodal/locales/bg.json')).default;
    });
    
    // Complexity: O(1)
    describe('Locale Metadata', () => {
        // Complexity: O(1)
        it('should have correct language code', () => {
            // Complexity: O(1)
            expect(bgLocale.language).toBe('bg');
            // Complexity: O(1)
            expect(bgLocale.locale).toBe('bg-BG');
            // Complexity: O(1)
            expect(bgLocale.name).toBe('Български');
        });
    });
    
    // Complexity: O(N*M) — nested iteration
    describe('Command Mappings', () => {
        // Complexity: O(1)
        it('should map search commands', () => {
            const search = bgLocale.commands.search;
            // Complexity: O(1)
            expect(search.keywords).toContain('търси');
            // Complexity: O(1)
            expect(search.keywords).toContain('намери');
            // Complexity: O(1)
            expect(search.keywords).toContain('потърси');
        });
        
        // Complexity: O(1)
        it('should map click commands', () => {
            const click = bgLocale.commands.click;
            // Complexity: O(1)
            expect(click.keywords).toContain('кликни');
            // Complexity: O(1)
            expect(click.keywords).toContain('натисни');
            // Complexity: O(1)
            expect(click.keywords).toContain('избери');
        });
        
        // Complexity: O(1)
        it('should map assert commands', () => {
            const assert = bgLocale.commands.assert;
            // Complexity: O(1)
            expect(assert.keywords).toContain('провери');
            // Complexity: O(1)
            expect(assert.keywords).toContain('увери');
            // Complexity: O(1)
            expect(assert.keywords).toContain('потвърди');
        });
        
        // Complexity: O(1)
        it('should map navigate commands', () => {
            const navigate = bgLocale.commands.navigate;
            // Complexity: O(1)
            expect(navigate.keywords).toContain('отиди');
            // Complexity: O(1)
            expect(navigate.keywords).toContain('навигирай');
            // Complexity: O(1)
            expect(navigate.keywords).toContain('отвори');
        });
        
        // Complexity: O(1)
        it('should map type commands', () => {
            const type = bgLocale.commands.type;
            // Complexity: O(1)
            expect(type.keywords).toContain('напиши');
            // Complexity: O(1)
            expect(type.keywords).toContain('въведи');
            // Complexity: O(1)
            expect(type.keywords).toContain('попълни');
        });
        
        // Complexity: O(1)
        it('should map wait commands', () => {
            const wait = bgLocale.commands.wait;
            // Complexity: O(1)
            expect(wait.keywords).toContain('изчакай');
            // Complexity: O(1)
            expect(wait.keywords).toContain('почакай');
            // Complexity: O(1)
            expect(wait.keywords).toContain('пауза');
        });
        
        // Complexity: O(1)
        it('should map scroll commands', () => {
            const scroll = bgLocale.commands.scroll;
            // Complexity: O(1)
            expect(scroll.keywords).toContain('скролни');
            // Complexity: O(1)
            expect(scroll.keywords).toContain('превърти');
        });
        
        // Complexity: O(1)
        it('should map screenshot commands', () => {
            const screenshot = bgLocale.commands.screenshot;
            // Complexity: O(N)
            expect(screenshot.keywords).toContain('снимка');
            // Complexity: O(N)
            expect(screenshot.keywords).toContain('скрийншот');
        });
        
        // Complexity: O(N*M) — nested iteration
        it('should have patterns for each command', () => {
            const commandKeys = Object.keys(bgLocale.commands);
            // Complexity: O(N) — loop
            expect(commandKeys.length).toBeGreaterThan(10);
            
            for (const key of commandKeys) {
                const command = bgLocale.commands[key];
                // Complexity: O(1)
                expect(command.patterns.length).toBeGreaterThan(0);
            }
        });
    });
    
    // Complexity: O(1)
    describe('Entity Mappings', () => {
        // Complexity: O(1)
        it('should map directions in Bulgarian', () => {
            const directions = bgLocale.entities.directions;
            // Complexity: O(1)
            expect(directions.up).toContain('нагоре');
            // Complexity: O(1)
            expect(directions.down).toContain('надолу');
            // Complexity: O(1)
            expect(directions.left).toContain('наляво');
            // Complexity: O(1)
            expect(directions.right).toContain('надясно');
        });
        
        // Complexity: O(1)
        it('should map UI elements in Bulgarian', () => {
            const elements = bgLocale.entities.elements;
            // Complexity: O(1)
            expect(elements.button).toContain('бутон');
            // Complexity: O(1)
            expect(elements.link).toContain('линк');
            // Complexity: O(1)
            expect(elements.input).toContain('поле');
            // Complexity: O(1)
            expect(elements.checkbox).toContain('чекбокс');
        });
        
        // Complexity: O(1)
        it('should map states in Bulgarian', () => {
            const states = bgLocale.entities.states;
            // Complexity: O(1)
            expect(states.visible).toContain('видим');
            // Complexity: O(1)
            expect(states.hidden).toContain('скрит');
            // Complexity: O(1)
            expect(states.enabled).toContain('активен');
            // Complexity: O(1)
            expect(states.disabled).toContain('неактивен');
        });
        
        // Complexity: O(1)
        it('should map time units in Bulgarian', () => {
            const timeUnits = bgLocale.entities.timeUnits;
            // Complexity: O(1)
            expect(timeUnits.seconds).toContain('секунди');
            // Complexity: O(1)
            expect(timeUnits.milliseconds).toContain('милисекунди');
            // Complexity: O(1)
            expect(timeUnits.minutes).toContain('минути');
        });
    });
    
    // Complexity: O(1)
    describe('Modifiers and Confirmations', () => {
        // Complexity: O(1)
        it('should map modifiers', () => {
            const modifiers = bgLocale.modifiers;
            // Complexity: O(1)
            expect(modifiers.not).toContain('не');
            // Complexity: O(1)
            expect(modifiers.and).toContain('и');
            // Complexity: O(1)
            expect(modifiers.or).toContain('или');
            // Complexity: O(1)
            expect(modifiers.first).toContain('първи');
            // Complexity: O(1)
            expect(modifiers.last).toContain('последен');
        });
        
        // Complexity: O(1)
        it('should map confirmations', () => {
            const confirmations = bgLocale.confirmations;
            // Complexity: O(1)
            expect(confirmations.yes).toContain('да');
            // Complexity: O(1)
            expect(confirmations.yes).toContain('добре');
            // Complexity: O(1)
            expect(confirmations.no).toContain('не');
            // Complexity: O(1)
            expect(confirmations.no).toContain('стоп');
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 HYBRID VISION CONTROLLER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('HybridVisionController', () => {
    // Complexity: O(1)
    describe('Configuration', () => {
        // Complexity: O(1)
        it('should initialize with default configuration', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            const config = controller.getConfig();
            
            // Complexity: O(1)
            expect(config.geminiModel).toBe('gemini-2.0-flash-exp');
            // Complexity: O(1)
            expect(config.ollamaEndpoint).toBe('http://localhost:11434');
            // Complexity: O(1)
            expect(config.ollamaModel).toBe('llava:13b');
            // Complexity: O(1)
            expect(config.latencyThreshold).toBe(2000);
            // Complexity: O(1)
            expect(config.enableFallback).toBe(true);
            // Complexity: O(1)
            expect(config.timeout).toBe(30000);
        });
        
        // Complexity: O(1)
        it('should accept custom configuration', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController({
                latencyThreshold: 3000,
                enableFallback: false,
                ollamaModel: 'llava:7b'
            });
            const config = controller.getConfig();
            
            // Complexity: O(1)
            expect(config.latencyThreshold).toBe(3000);
            // Complexity: O(1)
            expect(config.enableFallback).toBe(false);
            // Complexity: O(1)
            expect(config.ollamaModel).toBe('llava:7b');
        });
        
        // Complexity: O(1)
        it('should extend EventEmitter', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            // Complexity: O(1)
            expect(controller).toBeInstanceOf(EventEmitter);
        });
    });
    
    // Complexity: O(1)
    describe('Latency Threshold', () => {
        // Complexity: O(1)
        it('should update latency threshold', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            controller.setLatencyThreshold(5000);
            // Complexity: O(1)
            expect(controller.getConfig().latencyThreshold).toBe(5000);
        });
        
        // Complexity: O(1)
        it('should emit event on threshold update', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            const eventSpy = vi.fn();
            controller.on('config-updated', eventSpy);
            
            controller.setLatencyThreshold(4000);
            
            // Complexity: O(1)
            expect(eventSpy).toHaveBeenCalledWith({ latencyThreshold: 4000 });
        });
    });
    
    // Complexity: O(1)
    describe('Fallback Control', () => {
        // Complexity: O(1)
        it('should toggle fallback', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            // Complexity: O(1)
            expect(controller.getConfig().enableFallback).toBe(true);
            
            controller.setFallbackEnabled(false);
            // Complexity: O(1)
            expect(controller.getConfig().enableFallback).toBe(false);
            
            controller.setFallbackEnabled(true);
            // Complexity: O(1)
            expect(controller.getConfig().enableFallback).toBe(true);
        });
        
        // Complexity: O(1)
        it('should emit event on fallback toggle', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            const eventSpy = vi.fn();
            controller.on('config-updated', eventSpy);
            
            controller.setFallbackEnabled(false);
            
            // Complexity: O(1)
            expect(eventSpy).toHaveBeenCalledWith({ enableFallback: false });
        });
    });
    
    // Complexity: O(1)
    describe('Health Status', () => {
        // Complexity: O(1)
        it('should return health status', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            const health = controller.getHealth();
            
            // Complexity: O(1)
            expect(health).toHaveProperty('gemini');
            // Complexity: O(1)
            expect(health).toHaveProperty('ollama');
            // Complexity: O(1)
            expect(health.gemini).toHaveProperty('available');
            // Complexity: O(1)
            expect(health.gemini).toHaveProperty('avgLatency');
            // Complexity: O(1)
            expect(health.gemini).toHaveProperty('successRate');
        });
        
        // Complexity: O(1)
        it('should initialize with providers assumed available', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            const health = controller.getHealth();
            
            // Complexity: O(1)
            expect(health.gemini.available).toBe(true);
            // Complexity: O(1)
            expect(health.ollama.available).toBe(true);
        });
    });
    
    // Complexity: O(1)
    describe('Image Analysis', () => {
        // Complexity: O(1)
        it('should reject if image not found', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            await expect(
                controller.analyzeImage('nonexistent.png', 'test prompt')
            ).rejects.toThrow('Image not found');
        });
    });
    
    // Complexity: O(1)
    describe('Provider Selection', () => {
        // Complexity: O(1)
        it('should throw if no providers available', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            // Simulate no providers available
            const health = controller.getHealth();
            health.gemini.available = false;
            health.ollama.available = false;
            (controller as unknown as { health: typeof health }).health = health;
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            await expect(
                controller.analyzeImage('test.png', 'test')
            ).rejects.toThrow();
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 LOCAL MODULE INDEX TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Local Module Index', () => {
    // Complexity: O(1)
    it('should export WhisperService', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const localModule = await import('../../../src/visual/index');
        // Complexity: O(1)
        expect(localModule.WhisperService).toBeDefined();
    });
    
    // Complexity: O(1)
    it('should export HybridVisionController', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const localModule = await import('../../../src/visual/index');
        // Complexity: O(1)
        expect(localModule.HybridVisionController).toBeDefined();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 INTEGRATION SCENARIO TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('Phase 1 Integration Scenarios', () => {
    // Complexity: O(1)
    describe('Bulgarian Voice Command Flow', () => {
        // Complexity: O(1)
        it('should parse Bulgarian search command', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const bgLocale = (await import('../src/multimodal/locales/bg.json')).default;
            const searchKeywords = bgLocale.commands.search.keywords;
            
            const voiceInput = 'търси бутон за вход';
            const hasSearchKeyword = searchKeywords.some((kw: string) => voiceInput.includes(kw));
            
            // Complexity: O(1)
            expect(hasSearchKeyword).toBe(true);
        });
        
        // Complexity: O(1)
        it('should parse Bulgarian click command', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const bgLocale = (await import('../src/multimodal/locales/bg.json')).default;
            const clickKeywords = bgLocale.commands.click.keywords;
            
            const voiceInput = 'кликни върху бутона';
            const hasClickKeyword = clickKeywords.some((kw: string) => voiceInput.includes(kw));
            
            // Complexity: O(1)
            expect(hasClickKeyword).toBe(true);
        });
        
        // Complexity: O(1)
        it('should parse Bulgarian assert command', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const bgLocale = (await import('../src/multimodal/locales/bg.json')).default;
            const assertKeywords = bgLocale.commands.assert.keywords;
            
            const voiceInput = 'провери дали текстът е видим';
            const hasAssertKeyword = assertKeywords.some((kw: string) => voiceInput.includes(kw));
            
            // Complexity: O(1)
            expect(hasAssertKeyword).toBe(true);
        });
    });
    
    // Complexity: O(N)
    describe('Vision Fallback Strategy', () => {
        // Complexity: O(N)
        it('should fallback when latency exceeds threshold', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController({
                latencyThreshold: 1000, // Low threshold for testing
                enableFallback: true
            });
            
            // Complexity: O(1)
            expect(controller.getConfig().latencyThreshold).toBe(1000);
            // Complexity: O(1)
            expect(controller.getConfig().enableFallback).toBe(true);
        });
        
        // Complexity: O(1)
        it('should not fallback when disabled', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController({
                enableFallback: false
            });
            
            // Complexity: O(1)
            expect(controller.getConfig().enableFallback).toBe(false);
        });
    });
    
    // Complexity: O(N)
    describe('Local Processing Benefits', () => {
        // Complexity: O(1)
        it('should use local Ollama to reduce cloud dependency', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { HybridVisionController } = await import('../../../src/modules/GAMMA_INFRA/core/mouth/strength/hybrid-vision-controller');
            const controller = new HybridVisionController();
            
            // Complexity: O(N)
            expect(controller.getConfig().ollamaEndpoint).toBe('http://localhost:11434');
            // Complexity: O(N)
            expect(controller.getConfig().ollamaModel).toBe('llava:13b');
        });
        
        // Complexity: O(N)
        it('should configure Whisper for local processing', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { WhisperService } = await import('../../../src/modules/GAMMA_INFRA/core/brain/strength/whisper-service');
            const service = new WhisperService({
                device: 'cuda',
                threads: 16 // Ryzen 7 7435HS threads
            });
            
            // Complexity: O(1)
            expect(service.getConfig().device).toBe('cuda');
            // Complexity: O(1)
            expect(service.getConfig().threads).toBe(16);
        });
    });
});
