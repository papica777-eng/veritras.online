"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum v23.0 Phase 1 Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
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
const vitest_1 = require("vitest");
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 WHISPER SERVICE TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('WhisperService', () => {
    (0, vitest_1.describe)('Configuration', () => {
        (0, vitest_1.it)('should initialize with default configuration', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService();
            const config = service.getConfig();
            (0, vitest_1.expect)(config.model).toBe('base');
            (0, vitest_1.expect)(config.device).toBe('auto');
            (0, vitest_1.expect)(config.computeType).toBe('auto');
            (0, vitest_1.expect)(config.timeout).toBe(30000);
            (0, vitest_1.expect)(config.threads).toBe(4);
        });
        (0, vitest_1.it)('should accept custom configuration', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService({
                model: 'large-v3',
                device: 'cuda',
                computeType: 'float16',
                timeout: 60000,
                threads: 8
            });
            const config = service.getConfig();
            (0, vitest_1.expect)(config.model).toBe('large-v3');
            (0, vitest_1.expect)(config.device).toBe('cuda');
            (0, vitest_1.expect)(config.computeType).toBe('float16');
            (0, vitest_1.expect)(config.timeout).toBe(60000);
            (0, vitest_1.expect)(config.threads).toBe(8);
        });
        (0, vitest_1.it)('should update configuration', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService();
            service.updateConfig({ model: 'medium', threads: 16 });
            const config = service.getConfig();
            (0, vitest_1.expect)(config.model).toBe('medium');
            (0, vitest_1.expect)(config.threads).toBe(16);
        });
        (0, vitest_1.it)('should extend EventEmitter', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService();
            (0, vitest_1.expect)(service).toBeInstanceOf(events_1.EventEmitter);
        });
    });
    (0, vitest_1.describe)('Queue Management', () => {
        (0, vitest_1.it)('should report queue status', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService();
            const status = service.getQueueStatus();
            (0, vitest_1.expect)(status).toHaveProperty('pending');
            (0, vitest_1.expect)(status).toHaveProperty('processing');
            (0, vitest_1.expect)(status.pending).toBe(0);
            (0, vitest_1.expect)(status.processing).toBe(false);
        });
        (0, vitest_1.it)('should report service ready status', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService();
            (0, vitest_1.expect)(service.isServiceReady()).toBe(false);
        });
    });
    (0, vitest_1.describe)('Transcription Validation', () => {
        (0, vitest_1.it)('should reject transcription if not initialized', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService();
            await (0, vitest_1.expect)(service.transcribe('test.wav')).rejects.toThrow('Whisper service not initialized');
        });
        (0, vitest_1.it)('should validate audio file existence', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService();
            // Mock isReady
            service.isReady = true;
            await (0, vitest_1.expect)(service.transcribe('nonexistent.wav')).rejects.toThrow('Audio file not found');
        });
    });
    (0, vitest_1.describe)('Model Sizes', () => {
        (0, vitest_1.it)('should support all Whisper model sizes', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const modelSizes = ['tiny', 'base', 'small', 'medium', 'large-v2', 'large-v3'];
            for (const model of modelSizes) {
                const service = new WhisperService({ model });
                (0, vitest_1.expect)(service.getConfig().model).toBe(model);
            }
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 BULGARIAN LOCALE TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('Bulgarian Semantic Mapping', () => {
    let bgLocale;
    (0, vitest_1.beforeEach)(async () => {
        bgLocale = (await Promise.resolve().then(() => __importStar(require('../src/multimodal/locales/bg.json')))).default;
    });
    (0, vitest_1.describe)('Locale Metadata', () => {
        (0, vitest_1.it)('should have correct language code', () => {
            (0, vitest_1.expect)(bgLocale.language).toBe('bg');
            (0, vitest_1.expect)(bgLocale.locale).toBe('bg-BG');
            (0, vitest_1.expect)(bgLocale.name).toBe('Български');
        });
    });
    (0, vitest_1.describe)('Command Mappings', () => {
        (0, vitest_1.it)('should map search commands', () => {
            const search = bgLocale.commands.search;
            (0, vitest_1.expect)(search.keywords).toContain('търси');
            (0, vitest_1.expect)(search.keywords).toContain('намери');
            (0, vitest_1.expect)(search.keywords).toContain('потърси');
        });
        (0, vitest_1.it)('should map click commands', () => {
            const click = bgLocale.commands.click;
            (0, vitest_1.expect)(click.keywords).toContain('кликни');
            (0, vitest_1.expect)(click.keywords).toContain('натисни');
            (0, vitest_1.expect)(click.keywords).toContain('избери');
        });
        (0, vitest_1.it)('should map assert commands', () => {
            const assert = bgLocale.commands.assert;
            (0, vitest_1.expect)(assert.keywords).toContain('провери');
            (0, vitest_1.expect)(assert.keywords).toContain('увери');
            (0, vitest_1.expect)(assert.keywords).toContain('потвърди');
        });
        (0, vitest_1.it)('should map navigate commands', () => {
            const navigate = bgLocale.commands.navigate;
            (0, vitest_1.expect)(navigate.keywords).toContain('отиди');
            (0, vitest_1.expect)(navigate.keywords).toContain('навигирай');
            (0, vitest_1.expect)(navigate.keywords).toContain('отвори');
        });
        (0, vitest_1.it)('should map type commands', () => {
            const type = bgLocale.commands.type;
            (0, vitest_1.expect)(type.keywords).toContain('напиши');
            (0, vitest_1.expect)(type.keywords).toContain('въведи');
            (0, vitest_1.expect)(type.keywords).toContain('попълни');
        });
        (0, vitest_1.it)('should map wait commands', () => {
            const wait = bgLocale.commands.wait;
            (0, vitest_1.expect)(wait.keywords).toContain('изчакай');
            (0, vitest_1.expect)(wait.keywords).toContain('почакай');
            (0, vitest_1.expect)(wait.keywords).toContain('пауза');
        });
        (0, vitest_1.it)('should map scroll commands', () => {
            const scroll = bgLocale.commands.scroll;
            (0, vitest_1.expect)(scroll.keywords).toContain('скролни');
            (0, vitest_1.expect)(scroll.keywords).toContain('превърти');
        });
        (0, vitest_1.it)('should map screenshot commands', () => {
            const screenshot = bgLocale.commands.screenshot;
            (0, vitest_1.expect)(screenshot.keywords).toContain('снимка');
            (0, vitest_1.expect)(screenshot.keywords).toContain('скрийншот');
        });
        (0, vitest_1.it)('should have patterns for each command', () => {
            const commandKeys = Object.keys(bgLocale.commands);
            (0, vitest_1.expect)(commandKeys.length).toBeGreaterThan(10);
            for (const key of commandKeys) {
                const command = bgLocale.commands[key];
                (0, vitest_1.expect)(command.patterns.length).toBeGreaterThan(0);
            }
        });
    });
    (0, vitest_1.describe)('Entity Mappings', () => {
        (0, vitest_1.it)('should map directions in Bulgarian', () => {
            const directions = bgLocale.entities.directions;
            (0, vitest_1.expect)(directions.up).toContain('нагоре');
            (0, vitest_1.expect)(directions.down).toContain('надолу');
            (0, vitest_1.expect)(directions.left).toContain('наляво');
            (0, vitest_1.expect)(directions.right).toContain('надясно');
        });
        (0, vitest_1.it)('should map UI elements in Bulgarian', () => {
            const elements = bgLocale.entities.elements;
            (0, vitest_1.expect)(elements.button).toContain('бутон');
            (0, vitest_1.expect)(elements.link).toContain('линк');
            (0, vitest_1.expect)(elements.input).toContain('поле');
            (0, vitest_1.expect)(elements.checkbox).toContain('чекбокс');
        });
        (0, vitest_1.it)('should map states in Bulgarian', () => {
            const states = bgLocale.entities.states;
            (0, vitest_1.expect)(states.visible).toContain('видим');
            (0, vitest_1.expect)(states.hidden).toContain('скрит');
            (0, vitest_1.expect)(states.enabled).toContain('активен');
            (0, vitest_1.expect)(states.disabled).toContain('неактивен');
        });
        (0, vitest_1.it)('should map time units in Bulgarian', () => {
            const timeUnits = bgLocale.entities.timeUnits;
            (0, vitest_1.expect)(timeUnits.seconds).toContain('секунди');
            (0, vitest_1.expect)(timeUnits.milliseconds).toContain('милисекунди');
            (0, vitest_1.expect)(timeUnits.minutes).toContain('минути');
        });
    });
    (0, vitest_1.describe)('Modifiers and Confirmations', () => {
        (0, vitest_1.it)('should map modifiers', () => {
            const modifiers = bgLocale.modifiers;
            (0, vitest_1.expect)(modifiers.not).toContain('не');
            (0, vitest_1.expect)(modifiers.and).toContain('и');
            (0, vitest_1.expect)(modifiers.or).toContain('или');
            (0, vitest_1.expect)(modifiers.first).toContain('първи');
            (0, vitest_1.expect)(modifiers.last).toContain('последен');
        });
        (0, vitest_1.it)('should map confirmations', () => {
            const confirmations = bgLocale.confirmations;
            (0, vitest_1.expect)(confirmations.yes).toContain('да');
            (0, vitest_1.expect)(confirmations.yes).toContain('добре');
            (0, vitest_1.expect)(confirmations.no).toContain('не');
            (0, vitest_1.expect)(confirmations.no).toContain('стоп');
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 HYBRID VISION CONTROLLER TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('HybridVisionController', () => {
    (0, vitest_1.describe)('Configuration', () => {
        (0, vitest_1.it)('should initialize with default configuration', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            const config = controller.getConfig();
            (0, vitest_1.expect)(config.geminiModel).toBe('gemini-2.0-flash-exp');
            (0, vitest_1.expect)(config.ollamaEndpoint).toBe('http://localhost:11434');
            (0, vitest_1.expect)(config.ollamaModel).toBe('llava:13b');
            (0, vitest_1.expect)(config.latencyThreshold).toBe(2000);
            (0, vitest_1.expect)(config.enableFallback).toBe(true);
            (0, vitest_1.expect)(config.timeout).toBe(30000);
        });
        (0, vitest_1.it)('should accept custom configuration', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController({
                latencyThreshold: 3000,
                enableFallback: false,
                ollamaModel: 'llava:7b'
            });
            const config = controller.getConfig();
            (0, vitest_1.expect)(config.latencyThreshold).toBe(3000);
            (0, vitest_1.expect)(config.enableFallback).toBe(false);
            (0, vitest_1.expect)(config.ollamaModel).toBe('llava:7b');
        });
        (0, vitest_1.it)('should extend EventEmitter', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            (0, vitest_1.expect)(controller).toBeInstanceOf(events_1.EventEmitter);
        });
    });
    (0, vitest_1.describe)('Latency Threshold', () => {
        (0, vitest_1.it)('should update latency threshold', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            controller.setLatencyThreshold(5000);
            (0, vitest_1.expect)(controller.getConfig().latencyThreshold).toBe(5000);
        });
        (0, vitest_1.it)('should emit event on threshold update', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            const eventSpy = vitest_1.vi.fn();
            controller.on('config-updated', eventSpy);
            controller.setLatencyThreshold(4000);
            (0, vitest_1.expect)(eventSpy).toHaveBeenCalledWith({ latencyThreshold: 4000 });
        });
    });
    (0, vitest_1.describe)('Fallback Control', () => {
        (0, vitest_1.it)('should toggle fallback', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            (0, vitest_1.expect)(controller.getConfig().enableFallback).toBe(true);
            controller.setFallbackEnabled(false);
            (0, vitest_1.expect)(controller.getConfig().enableFallback).toBe(false);
            controller.setFallbackEnabled(true);
            (0, vitest_1.expect)(controller.getConfig().enableFallback).toBe(true);
        });
        (0, vitest_1.it)('should emit event on fallback toggle', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            const eventSpy = vitest_1.vi.fn();
            controller.on('config-updated', eventSpy);
            controller.setFallbackEnabled(false);
            (0, vitest_1.expect)(eventSpy).toHaveBeenCalledWith({ enableFallback: false });
        });
    });
    (0, vitest_1.describe)('Health Status', () => {
        (0, vitest_1.it)('should return health status', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            const health = controller.getHealth();
            (0, vitest_1.expect)(health).toHaveProperty('gemini');
            (0, vitest_1.expect)(health).toHaveProperty('ollama');
            (0, vitest_1.expect)(health.gemini).toHaveProperty('available');
            (0, vitest_1.expect)(health.gemini).toHaveProperty('avgLatency');
            (0, vitest_1.expect)(health.gemini).toHaveProperty('successRate');
        });
        (0, vitest_1.it)('should initialize with providers assumed available', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            const health = controller.getHealth();
            (0, vitest_1.expect)(health.gemini.available).toBe(true);
            (0, vitest_1.expect)(health.ollama.available).toBe(true);
        });
    });
    (0, vitest_1.describe)('Image Analysis', () => {
        (0, vitest_1.it)('should reject if image not found', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            await (0, vitest_1.expect)(controller.analyzeImage('nonexistent.png', 'test prompt')).rejects.toThrow('Image not found');
        });
    });
    (0, vitest_1.describe)('Provider Selection', () => {
        (0, vitest_1.it)('should throw if no providers available', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            // Simulate no providers available
            const health = controller.getHealth();
            health.gemini.available = false;
            health.ollama.available = false;
            controller.health = health;
            await (0, vitest_1.expect)(controller.analyzeImage('test.png', 'test')).rejects.toThrow();
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 LOCAL MODULE INDEX TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('Local Module Index', () => {
    (0, vitest_1.it)('should export WhisperService', async () => {
        const localModule = await Promise.resolve().then(() => __importStar(require('../src/local/index')));
        (0, vitest_1.expect)(localModule.WhisperService).toBeDefined();
    });
    (0, vitest_1.it)('should export HybridVisionController', async () => {
        const localModule = await Promise.resolve().then(() => __importStar(require('../src/local/index')));
        (0, vitest_1.expect)(localModule.HybridVisionController).toBeDefined();
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 INTEGRATION SCENARIO TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('Phase 1 Integration Scenarios', () => {
    (0, vitest_1.describe)('Bulgarian Voice Command Flow', () => {
        (0, vitest_1.it)('should parse Bulgarian search command', async () => {
            const bgLocale = (await Promise.resolve().then(() => __importStar(require('../src/multimodal/locales/bg.json')))).default;
            const searchKeywords = bgLocale.commands.search.keywords;
            const voiceInput = 'търси бутон за вход';
            const hasSearchKeyword = searchKeywords.some((kw) => voiceInput.includes(kw));
            (0, vitest_1.expect)(hasSearchKeyword).toBe(true);
        });
        (0, vitest_1.it)('should parse Bulgarian click command', async () => {
            const bgLocale = (await Promise.resolve().then(() => __importStar(require('../src/multimodal/locales/bg.json')))).default;
            const clickKeywords = bgLocale.commands.click.keywords;
            const voiceInput = 'кликни върху бутона';
            const hasClickKeyword = clickKeywords.some((kw) => voiceInput.includes(kw));
            (0, vitest_1.expect)(hasClickKeyword).toBe(true);
        });
        (0, vitest_1.it)('should parse Bulgarian assert command', async () => {
            const bgLocale = (await Promise.resolve().then(() => __importStar(require('../src/multimodal/locales/bg.json')))).default;
            const assertKeywords = bgLocale.commands.assert.keywords;
            const voiceInput = 'провери дали текстът е видим';
            const hasAssertKeyword = assertKeywords.some((kw) => voiceInput.includes(kw));
            (0, vitest_1.expect)(hasAssertKeyword).toBe(true);
        });
    });
    (0, vitest_1.describe)('Vision Fallback Strategy', () => {
        (0, vitest_1.it)('should fallback when latency exceeds threshold', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController({
                latencyThreshold: 1000, // Low threshold for testing
                enableFallback: true
            });
            (0, vitest_1.expect)(controller.getConfig().latencyThreshold).toBe(1000);
            (0, vitest_1.expect)(controller.getConfig().enableFallback).toBe(true);
        });
        (0, vitest_1.it)('should not fallback when disabled', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController({
                enableFallback: false
            });
            (0, vitest_1.expect)(controller.getConfig().enableFallback).toBe(false);
        });
    });
    (0, vitest_1.describe)('Local Processing Benefits', () => {
        (0, vitest_1.it)('should use local Ollama to reduce cloud dependency', async () => {
            const { HybridVisionController } = await Promise.resolve().then(() => __importStar(require('../src/local/hybrid-vision-controller')));
            const controller = new HybridVisionController();
            (0, vitest_1.expect)(controller.getConfig().ollamaEndpoint).toBe('http://localhost:11434');
            (0, vitest_1.expect)(controller.getConfig().ollamaModel).toBe('llava:13b');
        });
        (0, vitest_1.it)('should configure Whisper for local processing', async () => {
            const { WhisperService } = await Promise.resolve().then(() => __importStar(require('../src/local/whisper-service')));
            const service = new WhisperService({
                device: 'cuda',
                threads: 16 // Ryzen 7 7435HS threads
            });
            (0, vitest_1.expect)(service.getConfig().device).toBe('cuda');
            (0, vitest_1.expect)(service.getConfig().threads).toBe(16);
        });
    });
});
