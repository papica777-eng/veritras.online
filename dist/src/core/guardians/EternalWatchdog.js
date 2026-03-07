"use strict";
/**
 * @file EternalWatchdog.ts (formerly MemoryWatchdog.ts)
 * @description Memory Leak Watchdog - Автоматично спиране на workers при > 200MB
 * @version 1.0.0-QAntum
 * @author QAntum AI
 * @phase Phase 4: Validation & Stress (The Baptism of Fire)
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
exports.EternalWatchdog = void 0;
exports.getGlobalWatchdog = getGlobalWatchdog;
exports.startEternalWatchdog = startEternalWatchdog;
const events_1 = require("events");
const v8 = __importStar(require("v8"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    maxHeapMB: 200,
    checkIntervalMs: 5000,
    snapshotDir: path.join(process.cwd(), 'data', 'heap-snapshots'),
    maxSnapshots: 5,
    autoRestart: true,
    warningThreshold: 0.8, // 80%
    enableSnapshots: true,
};
// ═══════════════════════════════════════════════════════════════════════════════
// ETERNAL WATCHDOG CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class EternalWatchdog extends events_1.EventEmitter {
    config;
    intervalHandle = null;
    memorySamples = [];
    SAMPLE_WINDOW = 12; // 1 minute at 5s interval
    status = {
        isRunning: false,
        lastCheck: null,
        currentMemory: null,
        alertsTriggered: 0,
        snapshotsTaken: 0,
        workersKilled: 0,
    };
    isInAlertState = false;
    gcCountAtStart = 0;
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        // Ensure snapshot directory exists
        if (this.config.enableSnapshots) {
            this.ensureSnapshotDir();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Стартира мониторинга
     */
    // Complexity: O(1)
    start() {
        if (this.status.isRunning) {
            console.warn('⚠️  EternalWatchdog is already running');
            return;
        }
        console.log(`🐕 EternalWatchdog starting (max: ${this.config.maxHeapMB}MB, interval: ${this.config.checkIntervalMs}ms)`);
        this.status.isRunning = true;
        this.gcCountAtStart = this.getGCCount();
        // Initial check
        this.checkMemory();
        // Start interval
        this.intervalHandle = setInterval(() => {
            this.checkMemory();
        }, this.config.checkIntervalMs);
    }
    /**
     * Спира мониторинга
     */
    // Complexity: O(1)
    stop() {
        if (!this.status.isRunning) {
            return;
        }
        if (this.intervalHandle) {
            // Complexity: O(1)
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        this.status.isRunning = false;
        console.log('🐕 EternalWatchdog stopped');
    }
    /**
     * Получава текущите статистики
     */
    // Complexity: O(N) — potential recursive descent
    getStats() {
        return this.collectMemoryStats();
    }
    /**
     * Получава статуса на watchdog
     */
    // Complexity: O(1)
    getStatus() {
        return { ...this.status };
    }
    /**
     * Ръчно стартиране на heap snapshot
     */
    // Complexity: O(N) — potential recursive descent
    async takeSnapshot(reason = 'manual') {
        return this.captureHeapSnapshot(reason);
    }
    /**
     * Принудително освобождаване на памет
     */
    // Complexity: O(1)
    forceGC() {
        if (global.gc) {
            console.log('🗑️  Forcing garbage collection...');
            global.gc();
        }
        else {
            console.warn('⚠️  GC not exposed. Run with --expose-gc flag');
        }
    }
    /**
     * Получава тренда на паметта
     */
    // Complexity: O(N) — potential recursive descent
    getMemoryTrend() {
        return this.calculateTrend();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — amortized
    checkMemory() {
        const stats = this.collectMemoryStats();
        this.status.lastCheck = new Date();
        this.status.currentMemory = stats;
        // Add to samples
        this.memorySamples.push(stats.heapUsedMB);
        if (this.memorySamples.length > this.SAMPLE_WINDOW) {
            this.memorySamples.shift();
        }
        const maxMB = this.config.maxHeapMB;
        const warningMB = maxMB * this.config.warningThreshold;
        // Check if exceeded
        if (stats.heapUsedMB >= maxMB) {
            this.handleMemoryExceeded(stats);
        }
        // Check if warning
        else if (stats.heapUsedMB >= warningMB) {
            this.handleMemoryWarning(stats);
        }
        // Check if recovered
        else if (this.isInAlertState && stats.heapUsedMB < warningMB) {
            this.handleMemoryRecovered(stats);
        }
        // Log periodically
        if (Math.random() < 0.1) { // 10% chance to log
            this.logMemoryStatus(stats);
        }
    }
    // Complexity: O(1)
    collectMemoryStats() {
        const memUsage = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        const trend = this.calculateTrend();
        return {
            timestamp: new Date(),
            heapUsedMB: memUsage.heapUsed / 1024 / 1024,
            heapTotalMB: memUsage.heapTotal / 1024 / 1024,
            externalMB: memUsage.external / 1024 / 1024,
            arrayBuffersMB: memUsage.arrayBuffers / 1024 / 1024,
            rssMB: memUsage.rss / 1024 / 1024,
            heapUsedPercent: (memUsage.heapUsed / heapStats.heap_size_limit) * 100,
            v8HeapStats: heapStats,
            trend: trend.direction,
            gcCount: this.getGCCount() - this.gcCountAtStart,
        };
    }
    // Complexity: O(N) — linear iteration
    calculateTrend() {
        if (this.memorySamples.length < 3) {
            return {
                samples: this.memorySamples,
                average: this.memorySamples[0] || 0,
                direction: 'stable',
                growthRate: 0,
            };
        }
        const average = this.memorySamples.reduce((a, b) => a + b, 0) / this.memorySamples.length;
        // Linear regression for trend
        const n = this.memorySamples.length;
        const xSum = (n * (n - 1)) / 2;
        const ySum = this.memorySamples.reduce((a, b) => a + b, 0);
        const xySum = this.memorySamples.reduce((sum, y, x) => sum + x * y, 0);
        const xxSum = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        // Convert slope to MB/second
        const intervalsPerSecond = 1000 / this.config.checkIntervalMs;
        const growthRate = slope * intervalsPerSecond;
        let direction;
        if (Math.abs(growthRate) < 0.1) {
            direction = 'stable';
        }
        else if (growthRate > 0) {
            direction = 'increasing';
        }
        else {
            direction = 'decreasing';
        }
        return {
            samples: this.memorySamples,
            average,
            direction,
            growthRate,
        };
    }
    // Complexity: O(1)
    getGCCount() {
        // V8 doesn't expose GC count directly, estimate from heap stats
        const stats = v8.getHeapStatistics();
        return Math.floor(stats.total_heap_size / stats.used_heap_size);
    }
    // Complexity: O(N*M) — nested iteration detected
    async handleMemoryExceeded(stats) {
        if (!this.isInAlertState) {
            this.isInAlertState = true;
            this.status.alertsTriggered++;
        }
        console.error(`\n❌ MEMORY EXCEEDED: ${stats.heapUsedMB.toFixed(2)}MB / ${this.config.maxHeapMB}MB`);
        console.error(`   RSS: ${stats.rssMB.toFixed(2)}MB | Trend: ${stats.trend}`);
        this.emit('exceeded', stats);
        this.config.onMemoryExceeded?.(stats);
        // Take heap snapshot
        if (this.config.enableSnapshots) {
            try {
                const snapshotPath = await this.captureHeapSnapshot('exceeded');
                console.error(`   📸 Heap snapshot saved: ${snapshotPath}`);
            }
            catch (error) {
                console.error(`   ⚠️  Failed to capture snapshot: ${error}`);
            }
        }
        // Force GC
        this.forceGC();
        // If still exceeded after GC, take action
        const afterGC = this.collectMemoryStats();
        if (afterGC.heapUsedMB >= this.config.maxHeapMB) {
            if (this.config.autoRestart) {
                console.error('   🔄 Auto-restart triggered...');
                this.status.workersKilled++;
                this.emit('kill', stats);
                // Give time for cleanup
                // Complexity: O(N)
                setTimeout(() => {
                    process.exit(1); // Exit for PM2/Docker to restart
                }, 1000);
            }
        }
    }
    // Complexity: O(1)
    handleMemoryWarning(stats) {
        if (!this.isInAlertState) {
            this.isInAlertState = true;
        }
        console.warn(`\n⚠️  MEMORY WARNING: ${stats.heapUsedMB.toFixed(2)}MB / ${this.config.maxHeapMB}MB`);
        console.warn(`   Trend: ${stats.trend} | Growth: ${this.calculateTrend().growthRate.toFixed(2)} MB/s`);
        this.emit('warning', stats);
        // Proactive GC
        if (stats.trend === 'increasing') {
            this.forceGC();
        }
    }
    // Complexity: O(1)
    handleMemoryRecovered(stats) {
        this.isInAlertState = false;
        console.log(`\n✅ MEMORY RECOVERED: ${stats.heapUsedMB.toFixed(2)}MB / ${this.config.maxHeapMB}MB`);
        this.emit('recovered', stats);
        this.config.onMemoryRecovered?.(stats);
    }
    // Complexity: O(1)
    async captureHeapSnapshot(reason) {
        const filename = `heap-${Date.now()}-${reason}.heapsnapshot`;
        const filepath = path.join(this.config.snapshotDir, filename);
        // Cleanup old snapshots
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.cleanupOldSnapshots();
        // Capture snapshot
        // @ts-ignore
        const snapshotStream = v8.writeHeapSnapshot(filepath);
        this.status.snapshotsTaken++;
        this.emit('snapshot', filepath);
        return snapshotStream || filepath;
    }
    // Complexity: O(N log N) — sort operation
    async cleanupOldSnapshots() {
        try {
            const files = fs.readdirSync(this.config.snapshotDir)
                .filter(f => f.endsWith('.heapsnapshot'))
                .map(f => ({
                name: f,
                path: path.join(this.config.snapshotDir, f),
                time: fs.statSync(path.join(this.config.snapshotDir, f)).mtime.getTime(),
            }))
                .sort((a, b) => b.time - a.time);
            // Remove old snapshots
            while (files.length >= this.config.maxSnapshots) {
                const oldest = files.pop();
                fs.unlinkSync(oldest.path);
                console.log(`   🗑️  Removed old snapshot: ${oldest.name}`);
            }
        }
        catch (error) {
            console.warn(`   ⚠️  Failed to cleanup snapshots: ${error}`);
        }
    }
    // Complexity: O(1)
    ensureSnapshotDir() {
        if (!fs.existsSync(this.config.snapshotDir)) {
            fs.mkdirSync(this.config.snapshotDir, { recursive: true });
        }
    }
    // Complexity: O(1)
    logMemoryStatus(stats) {
        const bar = this.renderProgressBar(stats.heapUsedMB, this.config.maxHeapMB, 20);
        console.log(`🐕 Memory: ${bar} ${stats.heapUsedMB.toFixed(1)}/${this.config.maxHeapMB}MB (${stats.trend})`);
    }
    // Complexity: O(1)
    renderProgressBar(current, max, width) {
        const percent = Math.min(current / max, 1);
        const filled = Math.round(width * percent);
        const empty = width - filled;
        let color = '🟢';
        if (percent >= 0.8)
            color = '🔴';
        else if (percent >= 0.6)
            color = '🟡';
        return `${color}[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
    }
}
exports.EternalWatchdog = EternalWatchdog;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
let globalWatchdog = null;
/**
 * Получава или създава глобален watchdog
 */
function getGlobalWatchdog(config) {
    if (!globalWatchdog) {
        globalWatchdog = new EternalWatchdog(config);
    }
    return globalWatchdog;
}
/**
 * Бързо стартиране на глобален watchdog
 */
function startEternalWatchdog(config) {
    const watchdog = getGlobalWatchdog(config);
    watchdog.start();
    return watchdog;
}
exports.default = EternalWatchdog;
