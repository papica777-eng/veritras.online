/**
 * 🧪 Unit Tests for QAntum v12.0
 * Run: npm test
 */

const assert = require('assert');

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 NEURO-SENTINEL Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Neuro-Sentinel', function() {
    const { NeuroSentinel, ShadowCloneEngine, ChaosEngine, GeneticSelfRepairEngine } 
        = require('../neuro-sentinel/sentinel-core');

    describe('NeuroSentinel', function() {
        it('should create instance with default config', function() {
            const sentinel = new NeuroSentinel();
            assert.ok(sentinel);
            assert.strictEqual(sentinel.healthThreshold, 0.95);
        });

        it('should accept custom config', function() {
            const sentinel = new NeuroSentinel({ healthThreshold: 0.8 });
            assert.strictEqual(sentinel.healthThreshold, 0.8);
        });
    });

    describe('ChaosEngine', function() {
        it('should create with safe mode enabled by default', function() {
            const chaos = new ChaosEngine();
            assert.strictEqual(chaos.safeMode, true);
        });

        it('should have 8 chaos scenarios', function() {
            const chaos = new ChaosEngine();
            assert.ok(chaos.chaosScenarios.size >= 8);
        });

        it('should track attack stats', function() {
            const chaos = new ChaosEngine();
            const stats = chaos.getStats();
            assert.ok(stats.hasOwnProperty('networkLatency'));
            assert.ok(stats.hasOwnProperty('activeAttacks'));
        });
    });

    describe('ShadowCloneEngine', function() {
        it('should create instance', function() {
            const shadow = new ShadowCloneEngine();
            assert.ok(shadow);
            assert.strictEqual(shadow.maxClones, 5);
        });

        it('should track clone stats', function() {
            const shadow = new ShadowCloneEngine();
            assert.strictEqual(shadow.cloneStats.created, 0);
        });
    });

    describe('GeneticSelfRepairEngine', function() {
        it('should identify error patterns', function() {
            const repair = new GeneticSelfRepairEngine();
            const pattern = repair.identifyErrorPattern(new Error('selector not found'));
            assert.strictEqual(pattern.type, 'SELECTOR_NOT_FOUND');
        });

        it('should identify timeout errors', function() {
            const repair = new GeneticSelfRepairEngine();
            const pattern = repair.identifyErrorPattern(new Error('timeout exceeded'));
            assert.strictEqual(pattern.type, 'TIMEOUT');
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 NEXUS ENGINE Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Nexus Engine', function() {
    const { VoiceTestingEngine, SelfEvolvingTestEngine, VideoToTestAI } 
        = require('../nexus-engine');

    describe('VoiceTestingEngine', function() {
        it('should create instance', function() {
            const voice = new VoiceTestingEngine();
            assert.ok(voice);
            assert.ok(voice.commands);
        });

        it('should support English and Bulgarian', function() {
            const voice = new VoiceTestingEngine();
            assert.ok(voice.supportedLanguages.includes('en-US'));
            assert.ok(voice.supportedLanguages.includes('bg-BG'));
        });

        it('should generate test from history', function() {
            const voice = new VoiceTestingEngine();
            const code = voice.generateTestFromHistory();
            assert.ok(code.includes('// No commands recorded'));
        });
    });

    describe('SelfEvolvingTestEngine', function() {
        it('should create instance', function() {
            const evolve = new SelfEvolvingTestEngine();
            assert.ok(evolve);
            assert.ok(evolve.testHistory);
        });

        it('should track evolution stats', function() {
            const evolve = new SelfEvolvingTestEngine();
            const stats = evolve.getEvolutionStats();
            assert.strictEqual(stats.testsTracked, 0);
        });
    });

    describe('VideoToTestAI', function() {
        it('should create instance', function() {
            const video = new VideoToTestAI();
            assert.ok(video);
            assert.ok(video.actionPatterns);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ⚛️ QUANTUM CORE Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Quantum Core', function() {
    const { NaturalLanguageEngine, AITestGenerator } = require('../quantum-core');

    describe('NaturalLanguageEngine', function() {
        it('should create instance', function() {
            const nl = new NaturalLanguageEngine();
            assert.ok(nl);
        });

        it('should parse Bulgarian commands', function() {
            const nl = new NaturalLanguageEngine();
            const steps = nl.parseTest('Отвори https://example.com', 'bg');
            assert.ok(Array.isArray(steps));
            assert.ok(steps.length > 0);
        });

        it('should parse English commands', function() {
            const nl = new NaturalLanguageEngine();
            const steps = nl.parseTest('Go to https://example.com', 'en');
            assert.ok(Array.isArray(steps));
        });
    });

    describe('AITestGenerator', function() {
        it('should create instance', function() {
            const gen = new AITestGenerator();
            assert.ok(gen);
        });

        it('should analyze source code', function() {
            const gen = new AITestGenerator();
            const code = 'function add(a, b) { return a + b; }';
            const analysis = gen.analyzeSourceCode(code, 'math.js');
            assert.ok(analysis);
            assert.ok(analysis.functions);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// 📦 Main Index Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Main Index', function() {
    const mm = require('../index');

    it('should export VERSION', function() {
        assert.strictEqual(mm.VERSION, '14.0.0');
    });

    it('should export CODENAME', function() {
        assert.strictEqual(mm.CODENAME, 'THE OMNISCIENT');
    });

    it('should have factory functions', function() {
        assert.ok(typeof mm.createSentinel === 'function');
        assert.ok(typeof mm.createChaos === 'function');
        assert.ok(typeof mm.createVoice === 'function');
        assert.ok(typeof mm.createNaturalLanguage === 'function');
        assert.ok(typeof mm.createObserver === 'function');
        assert.ok(typeof mm.createMetrics === 'function');
        assert.ok(typeof mm.createAnomalyDetector === 'function');
    });

    it('should create instances via factory', function() {
        const sentinel = mm.createSentinel();
        const chaos = mm.createChaos();
        const voice = mm.createVoice();
        const observer = mm.createObserver();
        const metrics = mm.createMetrics();
        
        assert.ok(sentinel);
        assert.ok(chaos);
        assert.ok(voice);
        assert.ok(observer);
        assert.ok(metrics);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🔭 PRECISION OBSERVER Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Precision Observer', function() {
    const { PrecisionObserver, MetricsCollector, AnomalyDetector } 
        = require('../neuro-sentinel/precision-observer');

    describe('MetricsCollector', function() {
        it('should create instance', function() {
            const metrics = new MetricsCollector();
            assert.ok(metrics);
        });

        it('should record HTTP metrics', function() {
            const metrics = new MetricsCollector();
            metrics.recordHttp({
                url: 'https://test.com',
                method: 'GET',
                statusCode: 200,
                responseTime: 150
            });
            assert.strictEqual(metrics.metrics.http.length, 1);
            assert.strictEqual(metrics.metrics.http[0].statusCode, 200);
        });

        it('should record memory metrics', function() {
            const metrics = new MetricsCollector();
            metrics.recordMemory();
            assert.strictEqual(metrics.metrics.memory.length, 1);
            assert.ok(metrics.metrics.memory[0].heapUsed > 0);
        });

        it('should record CPU metrics', function() {
            const metrics = new MetricsCollector();
            metrics.recordCpu();
            assert.strictEqual(metrics.metrics.cpu.length, 1);
            assert.ok(metrics.metrics.cpu[0].cores > 0);
        });

        it('should record errors', function() {
            const metrics = new MetricsCollector();
            metrics.recordError(new Error('Test error'), { context: 'unit test' });
            assert.strictEqual(metrics.metrics.errors.length, 1);
            assert.strictEqual(metrics.metrics.errors[0].message, 'Test error');
        });

        it('should calculate statistics', function() {
            const metrics = new MetricsCollector();
            for (let i = 0; i < 100; i++) {
                metrics.recordHttp({
                    url: 'https://test.com',
                    statusCode: 200,
                    responseTime: 100 + Math.random() * 100
                });
            }
            const stats = metrics.getStats('http', 'responseTime', 60000);
            assert.ok(stats);
            assert.ok(stats.avg > 0);
            assert.ok(stats.p95 > 0);
            assert.ok(stats.stdDev >= 0);
        });

        it('should calculate success rate', function() {
            const metrics = new MetricsCollector();
            for (let i = 0; i < 10; i++) {
                metrics.recordHttp({
                    url: 'https://test.com',
                    statusCode: i < 9 ? 200 : 500,
                    responseTime: 100
                });
            }
            const rate = metrics.calculateSuccessRate('http', 60000);
            assert.strictEqual(rate, 90);
        });

        it('should record custom metrics', function() {
            const metrics = new MetricsCollector();
            metrics.recordCustom('test_metric', 42, { env: 'test' });
            assert.strictEqual(metrics.metrics.custom.length, 1);
            assert.strictEqual(metrics.metrics.custom[0].value, 42);
        });
    });

    describe('AnomalyDetector', function() {
        it('should create instance with default thresholds', function() {
            const detector = new AnomalyDetector();
            assert.ok(detector);
            assert.strictEqual(detector.thresholds.responseTime, 2000);
        });

        it('should accept custom thresholds', function() {
            const detector = new AnomalyDetector({ responseTimeThreshold: 500 });
            assert.strictEqual(detector.thresholds.responseTime, 500);
        });

        it('should learn baseline', function() {
            const detector = new AnomalyDetector({ minSamples: 10 });
            const values = Array(50).fill(0).map(() => 100 + Math.random() * 50);
            const baseline = detector.learnBaseline('responseTime', values);
            assert.ok(baseline);
            assert.ok(baseline.avg > 0);
            assert.ok(baseline.stdDev >= 0);
        });

        it('should detect threshold anomalies', function() {
            const detector = new AnomalyDetector({ responseTimeThreshold: 500 });
            const anomalies = detector.detectAnomaly('responseTime', 1000);
            assert.strictEqual(anomalies.length, 1);
            assert.strictEqual(anomalies[0].type, 'threshold_exceeded');
        });

        it('should detect statistical outliers', function() {
            const detector = new AnomalyDetector({ minSamples: 10, stdDevMultiplier: 2 });
            const values = Array(50).fill(100);
            detector.learnBaseline('testMetric', values);
            const anomalies = detector.detectAnomaly('testMetric', 500);
            assert.ok(anomalies.length > 0);
        });

        it('should detect trend anomalies', function() {
            const detector = new AnomalyDetector();
            const degrading = [100, 105, 110, 115, 120, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900];
            const trend = detector.detectTrendAnomaly('responseTime', degrading, 5);
            assert.ok(trend);
            assert.strictEqual(trend.direction, 'increasing');
        });

        it('should classify error severity', function() {
            const detector = new AnomalyDetector();
            // Test via MetricsCollector
            const metrics = new MetricsCollector();
            
            metrics.recordError(new Error('Fatal crash'));
            assert.strictEqual(metrics.metrics.errors[0].severity, 'critical');
            
            metrics.recordError(new Error('Connection timeout'));
            assert.strictEqual(metrics.metrics.errors[1].severity, 'high');
            
            metrics.recordError(new Error('Page not found 404'));
            assert.strictEqual(metrics.metrics.errors[2].severity, 'medium');
        });

        it('should provide anomaly summary', function() {
            const detector = new AnomalyDetector();
            detector.recordAnomaly({
                type: 'test',
                metric: 'test',
                severity: 'high',
                message: 'Test anomaly',
                timestamp: Date.now()
            });
            const summary = detector.getAnomalySummary();
            assert.strictEqual(summary.total, 1);
            assert.strictEqual(summary.bySeverity.high, 1);
        });
    });

    describe('PrecisionObserver', function() {
        it('should create instance', function() {
            const observer = new PrecisionObserver();
            assert.ok(observer);
            assert.strictEqual(observer.isRunning, false);
        });

        it('should add targets', function() {
            const observer = new PrecisionObserver();
            observer.addTarget('test', 'https://test.com', { priority: 'critical' });
            assert.strictEqual(observer.targets.size, 1);
            assert.strictEqual(observer.targets.get('test').priority, 'critical');
        });

        it('should register alert callbacks', function() {
            const observer = new PrecisionObserver();
            let called = false;
            observer.onAlert(() => { called = true; });
            assert.strictEqual(observer.alertCallbacks.length, 1);
        });

        it('should calculate health score', function() {
            const observer = new PrecisionObserver();
            const score = observer.getHealthScore();
            assert.ok(score >= 0 && score <= 100);
        });

        it('should generate report', function() {
            const observer = new PrecisionObserver();
            observer.addTarget('test', 'https://test.com');
            const report = observer.getReport();
            assert.ok(report);
            assert.ok(report.targets);
            assert.ok(report.stats);
            assert.ok(report.metrics);
        });
    });
});
