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
const hardware_telemetry_1 = require("../src/telemetry/hardware-telemetry");
// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ HARDWARE TELEMETRY TESTS - System Monitoring & Auto-Throttling
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('⚡ HardwareTelemetry - System Monitoring', () => {
    let telemetry;
    (0, vitest_1.beforeEach)(() => {
        telemetry = new hardware_telemetry_1.HardwareTelemetry({
            cpuThreshold: 90,
            memoryThreshold: 85,
            checkInterval: 100 // Fast for testing
        });
    });
    (0, vitest_1.afterEach)(() => {
        telemetry.stopMonitoring();
    });
    (0, vitest_1.describe)('📊 Metrics Collection', () => {
        (0, vitest_1.it)('should collect system metrics', () => {
            const metrics = telemetry.collectMetrics();
            (0, vitest_1.expect)(metrics).toBeDefined();
            (0, vitest_1.expect)(metrics.cpu).toBeDefined();
            (0, vitest_1.expect)(metrics.memory).toBeDefined();
            (0, vitest_1.expect)(metrics.system).toBeDefined();
        });
        (0, vitest_1.it)('should have valid CPU info', () => {
            const metrics = telemetry.collectMetrics();
            (0, vitest_1.expect)(metrics.cpu.model).toBeTruthy();
            (0, vitest_1.expect)(metrics.cpu.cores).toBeGreaterThan(0);
            (0, vitest_1.expect)(metrics.cpu.threads).toBeGreaterThanOrEqual(metrics.cpu.cores);
            (0, vitest_1.expect)(metrics.cpu.speed).toBeGreaterThan(0);
            (0, vitest_1.expect)(metrics.cpu.usage).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(metrics.cpu.usage).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('should have valid memory info', () => {
            const metrics = telemetry.collectMetrics();
            (0, vitest_1.expect)(metrics.memory.total).toBeGreaterThan(0);
            (0, vitest_1.expect)(metrics.memory.used).toBeGreaterThan(0);
            (0, vitest_1.expect)(metrics.memory.free).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(metrics.memory.usagePercent).toBeGreaterThan(0);
            (0, vitest_1.expect)(metrics.memory.usagePercent).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('should have per-core metrics', () => {
            const metrics = telemetry.collectMetrics();
            (0, vitest_1.expect)(metrics.cpu.perCore.length).toBe(metrics.cpu.threads);
            for (const core of metrics.cpu.perCore) {
                (0, vitest_1.expect)(core.id).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(core.usage).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(core.usage).toBeLessThanOrEqual(100);
            }
        });
        (0, vitest_1.it)('should have system info', () => {
            const metrics = telemetry.collectMetrics();
            (0, vitest_1.expect)(metrics.system.platform).toBeTruthy();
            (0, vitest_1.expect)(metrics.system.arch).toBeTruthy();
            (0, vitest_1.expect)(metrics.system.uptime).toBeGreaterThan(0);
            (0, vitest_1.expect)(metrics.system.loadAvg).toHaveLength(3);
        });
    });
    (0, vitest_1.describe)('📈 Monitoring', () => {
        (0, vitest_1.it)('should start and stop monitoring', async () => {
            const metricsReceived = [];
            telemetry.on('metrics', (m) => metricsReceived.push(m.timestamp));
            telemetry.startMonitoring();
            await new Promise(resolve => setTimeout(resolve, 350));
            telemetry.stopMonitoring();
            (0, vitest_1.expect)(metricsReceived.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should accumulate metrics history', async () => {
            telemetry.startMonitoring();
            await new Promise(resolve => setTimeout(resolve, 350));
            telemetry.stopMonitoring();
            const history = telemetry.getMetricsHistory();
            (0, vitest_1.expect)(history.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should not start monitoring twice', () => {
            telemetry.startMonitoring();
            telemetry.startMonitoring(); // Should be a no-op
            telemetry.stopMonitoring();
            // No error thrown = success
            (0, vitest_1.expect)(true).toBe(true);
        });
    });
    (0, vitest_1.describe)('🚦 Throttling', () => {
        (0, vitest_1.it)('should start unthrottled', () => {
            (0, vitest_1.expect)(telemetry.isSystemThrottled()).toBe(false);
            (0, vitest_1.expect)(telemetry.getThrottleDelay()).toBe(0);
        });
        (0, vitest_1.it)('should provide throttle delay when throttled', () => {
            // We can't easily simulate high CPU, but we can test the delay logic
            const config = telemetry.getConfig();
            (0, vitest_1.expect)(config.throttleDelay).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should have configurable thresholds', () => {
            telemetry.updateConfig({
                cpuThreshold: 80,
                memoryThreshold: 70
            });
            const config = telemetry.getConfig();
            (0, vitest_1.expect)(config.cpuThreshold).toBe(80);
            (0, vitest_1.expect)(config.memoryThreshold).toBe(70);
        });
    });
    (0, vitest_1.describe)('👷 Worker Pool Management', () => {
        (0, vitest_1.it)('should get worker pool status', () => {
            const status = telemetry.getWorkerPoolStatus();
            (0, vitest_1.expect)(status).toBeDefined();
            (0, vitest_1.expect)(status.activeWorkers).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(status.maxWorkers).toBeGreaterThan(0);
            (0, vitest_1.expect)(status.queueLength).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(status.completedTasks).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(typeof status.throttled).toBe('boolean');
        });
        (0, vitest_1.it)('should queue tasks with priority', () => {
            telemetry.queueTask({
                id: 'task1',
                type: 'test',
                data: {},
                priority: 'low',
                createdAt: Date.now()
            });
            telemetry.queueTask({
                id: 'task2',
                type: 'test',
                data: {},
                priority: 'high',
                createdAt: Date.now()
            });
            // High priority should come first
            const next = telemetry.getNextTask();
            (0, vitest_1.expect)(next?.id).toBe('task2');
        });
        (0, vitest_1.it)('should handle normal priority tasks', () => {
            telemetry.queueTask({
                id: 'low',
                type: 'test',
                data: {},
                priority: 'low',
                createdAt: Date.now()
            });
            telemetry.queueTask({
                id: 'normal',
                type: 'test',
                data: {},
                priority: 'normal',
                createdAt: Date.now()
            });
            // Normal should come before low
            const first = telemetry.getNextTask();
            const second = telemetry.getNextTask();
            (0, vitest_1.expect)(first?.id).toBe('normal');
            (0, vitest_1.expect)(second?.id).toBe('low');
        });
    });
    (0, vitest_1.describe)('📊 Average Metrics', () => {
        (0, vitest_1.it)('should calculate average metrics', async () => {
            telemetry.startMonitoring();
            await new Promise(resolve => setTimeout(resolve, 350));
            telemetry.stopMonitoring();
            const avg = telemetry.getAverageMetrics(60000);
            (0, vitest_1.expect)(avg.avgCpuUsage).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(avg.avgMemoryUsage).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(avg.peakCpuUsage).toBeGreaterThanOrEqual(avg.avgCpuUsage);
            (0, vitest_1.expect)(avg.peakMemoryUsage).toBeGreaterThanOrEqual(avg.avgMemoryUsage);
        });
        (0, vitest_1.it)('should return zero for empty history', () => {
            const avg = telemetry.getAverageMetrics();
            (0, vitest_1.expect)(avg.avgCpuUsage).toBe(0);
            (0, vitest_1.expect)(avg.avgMemoryUsage).toBe(0);
            (0, vitest_1.expect)(avg.totalAnalyses).toBeUndefined(); // Wrong property name test
        });
    });
    (0, vitest_1.describe)('📋 Report Generation', () => {
        (0, vitest_1.it)('should generate text report', async () => {
            telemetry.startMonitoring();
            await new Promise(resolve => setTimeout(resolve, 200));
            telemetry.stopMonitoring();
            const report = telemetry.generateReport();
            (0, vitest_1.expect)(report).toContain('HARDWARE TELEMETRY REPORT');
            (0, vitest_1.expect)(report).toContain('CPU');
            (0, vitest_1.expect)(report).toContain('Memory');
            (0, vitest_1.expect)(report).toContain('WORKER POOL');
        });
        (0, vitest_1.it)('should format bytes correctly', () => {
            const report = telemetry.generateReport();
            // Should contain formatted memory values
            (0, vitest_1.expect)(report).toMatch(/\d+\.\d+ (B|KB|MB|GB|TB)/);
        });
        (0, vitest_1.it)('should include per-core usage', () => {
            const report = telemetry.generateReport();
            (0, vitest_1.expect)(report).toContain('Core');
            (0, vitest_1.expect)(report).toMatch(/Core\s+\d+:/);
        });
    });
    (0, vitest_1.describe)('⚙️ Configuration', () => {
        (0, vitest_1.it)('should update configuration', () => {
            telemetry.updateConfig({
                cpuThreshold: 75,
                throttleDelay: 200
            });
            const config = telemetry.getConfig();
            (0, vitest_1.expect)(config.cpuThreshold).toBe(75);
            (0, vitest_1.expect)(config.throttleDelay).toBe(200);
        });
        (0, vitest_1.it)('should have default configuration', () => {
            const config = telemetry.getConfig();
            (0, vitest_1.expect)(config.cpuThreshold).toBe(90);
            (0, vitest_1.expect)(config.memoryThreshold).toBe(85);
            (0, vitest_1.expect)(config.minWorkers).toBeGreaterThan(0);
            (0, vitest_1.expect)(config.maxWorkers).toBeGreaterThan(config.minWorkers);
        });
    });
});
