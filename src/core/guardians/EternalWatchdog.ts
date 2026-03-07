/**
 * @file EternalWatchdog.ts (formerly MemoryWatchdog.ts)
 * @description Memory Leak Watchdog - Автоматично спиране на workers при > 200MB
 * @version 1.0.0-QAntum
 * @author QAntum AI
 * @phase Phase 4: Validation & Stress (The Baptism of Fire)
 */

import { EventEmitter } from 'events';
import * as v8 from 'v8';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WatchdogConfig {
    /** Maximum heap size in MB before triggering action */
    maxHeapMB: number;

    /** How often to check memory (ms) */
    checkIntervalMs: number;

    /** Directory to save heap snapshots */
    snapshotDir: string;

    /** Maximum number of snapshots to keep */
    maxSnapshots: number;

    /** Auto-restart worker on memory exceeded */
    autoRestart: boolean;

    /** Callback when memory exceeded */
    onMemoryExceeded?: (stats: MemoryStats) => void;

    /** Callback when memory recovered */
    onMemoryRecovered?: (stats: MemoryStats) => void;

    /** Warning threshold (percentage of max) */
    warningThreshold: number;

    /** Enable heap snapshots on exceeded */
    enableSnapshots: boolean;

    /** Discord/Slack webhook for alerts */
    alertWebhook?: string;
}

export interface MemoryStats {
    timestamp: Date;
    heapUsedMB: number;
    heapTotalMB: number;
    externalMB: number;
    arrayBuffersMB: number;
    rssMB: number;
    heapUsedPercent: number;
    v8HeapStats: v8.HeapInfo;
    trend: 'increasing' | 'decreasing' | 'stable';
    gcCount: number;
}

export interface MemoryTrend {
    samples: number[];
    average: number;
    direction: 'increasing' | 'decreasing' | 'stable';
    growthRate: number; // MB per second
}

export interface WatchdogStatus {
    isRunning: boolean;
    lastCheck: Date | null;
    currentMemory: MemoryStats | null;
    alertsTriggered: number;
    snapshotsTaken: number;
    workersKilled: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: WatchdogConfig = {
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

export class EternalWatchdog extends EventEmitter {
    private config: WatchdogConfig;
    private intervalHandle: NodeJS.Timeout | null = null;
    private memorySamples: number[] = [];
    private readonly SAMPLE_WINDOW = 12; // 1 minute at 5s interval

    private status: WatchdogStatus = {
        isRunning: false,
        lastCheck: null,
        currentMemory: null,
        alertsTriggered: 0,
        snapshotsTaken: 0,
        workersKilled: 0,
    };

    private isInAlertState = false;
    private gcCountAtStart = 0;

    constructor(config: Partial<WatchdogConfig> = {}) {
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
    start(): void {
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
    stop(): void {
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
    getStats(): MemoryStats {
        return this.collectMemoryStats();
    }

    /**
     * Получава статуса на watchdog
     */
    // Complexity: O(1)
    getStatus(): WatchdogStatus {
        return { ...this.status };
    }

    /**
     * Ръчно стартиране на heap snapshot
     */
    // Complexity: O(N) — potential recursive descent
    async takeSnapshot(reason: string = 'manual'): Promise<string> {
        return this.captureHeapSnapshot(reason);
    }

    /**
     * Принудително освобождаване на памет
     */
    // Complexity: O(1)
    forceGC(): void {
        if ((global as any).gc) {
            console.log('🗑️  Forcing garbage collection...');
            (global as any).gc();
        } else {
            console.warn('⚠️  GC not exposed. Run with --expose-gc flag');
        }
    }

    /**
     * Получава тренда на паметта
     */
    // Complexity: O(N) — potential recursive descent
    getMemoryTrend(): MemoryTrend {
        return this.calculateTrend();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1) — amortized
    private checkMemory(): void {
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
    private collectMemoryStats(): MemoryStats {
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
    private calculateTrend(): MemoryTrend {
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

        let direction: 'increasing' | 'decreasing' | 'stable';
        if (Math.abs(growthRate) < 0.1) {
            direction = 'stable';
        } else if (growthRate > 0) {
            direction = 'increasing';
        } else {
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
    private getGCCount(): number {
        // V8 doesn't expose GC count directly, estimate from heap stats
        const stats = v8.getHeapStatistics();
        return Math.floor(stats.total_heap_size / stats.used_heap_size);
    }

    // Complexity: O(N*M) — nested iteration detected
    private async handleMemoryExceeded(stats: MemoryStats): Promise<void> {
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
            } catch (error) {
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
    private handleMemoryWarning(stats: MemoryStats): void {
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
    private handleMemoryRecovered(stats: MemoryStats): void {
        this.isInAlertState = false;

        console.log(`\n✅ MEMORY RECOVERED: ${stats.heapUsedMB.toFixed(2)}MB / ${this.config.maxHeapMB}MB`);

        this.emit('recovered', stats);
        this.config.onMemoryRecovered?.(stats);
    }

    // Complexity: O(1)
    private async captureHeapSnapshot(reason: string): Promise<string> {
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
    private async cleanupOldSnapshots(): Promise<void> {
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
                const oldest = files.pop()!;
                fs.unlinkSync(oldest.path);
                console.log(`   🗑️  Removed old snapshot: ${oldest.name}`);
            }
        } catch (error) {
            console.warn(`   ⚠️  Failed to cleanup snapshots: ${error}`);
        }
    }

    // Complexity: O(1)
    private ensureSnapshotDir(): void {
        if (!fs.existsSync(this.config.snapshotDir)) {
            fs.mkdirSync(this.config.snapshotDir, { recursive: true });
        }
    }

    // Complexity: O(1)
    private logMemoryStatus(stats: MemoryStats): void {
        const bar = this.renderProgressBar(stats.heapUsedMB, this.config.maxHeapMB, 20);
        console.log(`🐕 Memory: ${bar} ${stats.heapUsedMB.toFixed(1)}/${this.config.maxHeapMB}MB (${stats.trend})`);
    }

    // Complexity: O(1)
    private renderProgressBar(current: number, max: number, width: number): string {
        const percent = Math.min(current / max, 1);
        const filled = Math.round(width * percent);
        const empty = width - filled;

        let color = '🟢';
        if (percent >= 0.8) color = '🔴';
        else if (percent >= 0.6) color = '🟡';

        return `${color}[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

let globalWatchdog: EternalWatchdog | null = null;

/**
 * Получава или създава глобален watchdog
 */
export function getGlobalWatchdog(config?: Partial<WatchdogConfig>): EternalWatchdog {
    if (!globalWatchdog) {
        globalWatchdog = new EternalWatchdog(config);
    }
    return globalWatchdog;
}

/**
 * Бързо стартиране на глобален watchdog
 */
export function startEternalWatchdog(config?: Partial<WatchdogConfig>): EternalWatchdog {
    const watchdog = getGlobalWatchdog(config);
    watchdog.start();
    return watchdog;
}

export default EternalWatchdog;
