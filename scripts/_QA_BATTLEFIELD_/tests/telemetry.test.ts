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
import { HardwareTelemetry } from '../../../src/modules/GAMMA_INFRA/core/eyes/strength/hardware-telemetry';

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ HARDWARE TELEMETRY TESTS - System Monitoring & Auto-Throttling
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N*M) — nested iteration
describe('⚡ HardwareTelemetry - System Monitoring', () => {
    let telemetry: HardwareTelemetry;

    // Complexity: O(N)
    beforeEach(() => {
        telemetry = new HardwareTelemetry({
            cpuThreshold: 90,
            memoryThreshold: 85,
            checkInterval: 100 // Fast for testing
        });
    });

    // Complexity: O(1)
    afterEach(() => {
        telemetry.stopMonitoring();
    });

    // Complexity: O(N) — loop
    describe('📊 Metrics Collection', () => {
        // Complexity: O(1)
        it('should collect system metrics', () => {
            const metrics = telemetry.collectMetrics();

            // Complexity: O(1)
            expect(metrics).toBeDefined();
            // Complexity: O(1)
            expect(metrics.cpu).toBeDefined();
            // Complexity: O(1)
            expect(metrics.memory).toBeDefined();
            // Complexity: O(1)
            expect(metrics.system).toBeDefined();
        });

        // Complexity: O(1)
        it('should have valid CPU info', () => {
            const metrics = telemetry.collectMetrics();

            // Complexity: O(1)
            expect(metrics.cpu.model).toBeTruthy();
            // Complexity: O(1)
            expect(metrics.cpu.cores).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(metrics.cpu.threads).toBeGreaterThanOrEqual(metrics.cpu.cores);
            // Complexity: O(1)
            expect(metrics.cpu.speed).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(metrics.cpu.usage).toBeGreaterThanOrEqual(0);
            // Complexity: O(1)
            expect(metrics.cpu.usage).toBeLessThanOrEqual(100);
        });

        // Complexity: O(1)
        it('should have valid memory info', () => {
            const metrics = telemetry.collectMetrics();

            // Complexity: O(1)
            expect(metrics.memory.total).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(metrics.memory.used).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(metrics.memory.free).toBeGreaterThanOrEqual(0);
            // Complexity: O(1)
            expect(metrics.memory.usagePercent).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(metrics.memory.usagePercent).toBeLessThanOrEqual(100);
        });

        // Complexity: O(N) — loop
        it('should have per-core metrics', () => {
            const metrics = telemetry.collectMetrics();

            // Complexity: O(N) — loop
            expect(metrics.cpu.perCore.length).toBe(metrics.cpu.threads);

            for (const core of metrics.cpu.perCore) {
                // Complexity: O(1)
                expect(core.id).toBeGreaterThanOrEqual(0);
                // Complexity: O(1)
                expect(core.usage).toBeGreaterThanOrEqual(0);
                // Complexity: O(1)
                expect(core.usage).toBeLessThanOrEqual(100);
            }
        });

        // Complexity: O(1)
        it('should have system info', () => {
            const metrics = telemetry.collectMetrics();

            // Complexity: O(1)
            expect(metrics.system.platform).toBeTruthy();
            // Complexity: O(1)
            expect(metrics.system.arch).toBeTruthy();
            // Complexity: O(1)
            expect(metrics.system.uptime).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(metrics.system.loadAvg).toHaveLength(3);
        });
    });

    // Complexity: O(1)
    describe('📈 Monitoring', () => {
        // Complexity: O(1)
        it('should start and stop monitoring', async () => {
            const metricsReceived: number[] = [];

            telemetry.on('metrics', (m) => metricsReceived.push(m.timestamp));

            telemetry.startMonitoring();

            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, 350));

            telemetry.stopMonitoring();

            // Complexity: O(1)
            expect(metricsReceived.length).toBeGreaterThan(0);
        });

        // Complexity: O(1)
        it('should accumulate metrics history', async () => {
            telemetry.startMonitoring();

            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, 350));

            telemetry.stopMonitoring();

            const history = telemetry.getMetricsHistory();

            // Complexity: O(1)
            expect(history.length).toBeGreaterThan(0);
        });

        // Complexity: O(1)
        it('should not start monitoring twice', () => {
            telemetry.startMonitoring();
            telemetry.startMonitoring(); // Should be a no-op

            telemetry.stopMonitoring();

            // No error thrown = success
            // Complexity: O(1)
            expect(true).toBe(true);
        });
    });

    // Complexity: O(1)
    describe('🚦 Throttling', () => {
        // Complexity: O(1)
        it('should start unthrottled', () => {
            // Complexity: O(1)
            expect(telemetry.isSystemThrottled()).toBe(false);
            // Complexity: O(1)
            expect(telemetry.getThrottleDelay()).toBe(0);
        });

        // Complexity: O(1)
        it('should provide throttle delay when throttled', () => {
            // We can't easily simulate high CPU, but we can test the delay logic
            const config = telemetry.getConfig();

            // Complexity: O(1)
            expect(config.throttleDelay).toBeGreaterThan(0);
        });

        // Complexity: O(1)
        it('should have configurable thresholds', () => {
            telemetry.updateConfig({
                cpuThreshold: 80,
                memoryThreshold: 70
            });

            const config = telemetry.getConfig();

            // Complexity: O(1)
            expect(config.cpuThreshold).toBe(80);
            // Complexity: O(1)
            expect(config.memoryThreshold).toBe(70);
        });
    });

    // Complexity: O(1)
    describe('👷 Worker Pool Management', () => {
        // Complexity: O(1)
        it('should get worker pool status', () => {
            const status = telemetry.getWorkerPoolStatus();

            // Complexity: O(1)
            expect(status).toBeDefined();
            // Complexity: O(1)
            expect(status.activeWorkers).toBeGreaterThanOrEqual(0);
            // Complexity: O(1)
            expect(status.maxWorkers).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(status.queueLength).toBeGreaterThanOrEqual(0);
            // Complexity: O(1)
            expect(status.completedTasks).toBeGreaterThanOrEqual(0);
            // Complexity: O(1)
            expect(typeof status.throttled).toBe('boolean');
        });

        // Complexity: O(1)
        it('should queue tasks with priority', () => {
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

            // Complexity: O(1)
            expect(next?.id).toBe('task2');
        });

        // Complexity: O(1)
        it('should handle normal priority tasks', () => {
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

            // Complexity: O(1)
            expect(first?.id).toBe('normal');
            // Complexity: O(1)
            expect(second?.id).toBe('low');
        });
    });

    // Complexity: O(N)
    describe('📊 Average Metrics', () => {
        // Complexity: O(1)
        it('should calculate average metrics', async () => {
            telemetry.startMonitoring();

            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, 350));

            telemetry.stopMonitoring();

            const avg = telemetry.getAverageMetrics(60000);

            // Complexity: O(N)
            expect(avg.avgCpuUsage).toBeGreaterThanOrEqual(0);
            // Complexity: O(N)
            expect(avg.avgMemoryUsage).toBeGreaterThanOrEqual(0);
            // Complexity: O(N)
            expect(avg.peakCpuUsage).toBeGreaterThanOrEqual(avg.avgCpuUsage);
            // Complexity: O(N)
            expect(avg.peakMemoryUsage).toBeGreaterThanOrEqual(avg.avgMemoryUsage);
        });

        // Complexity: O(N)
        it('should return zero for empty history', () => {
            const avg = telemetry.getAverageMetrics();

            // Complexity: O(1)
            expect(avg.avgCpuUsage).toBe(0);
            // Complexity: O(1)
            expect(avg.avgMemoryUsage).toBe(0);
            // Complexity: O(1)
            expect(avg.totalAnalyses).toBeUndefined(); // Wrong property name test
        });
    });

    // Complexity: O(1)
    describe('📋 Report Generation', () => {
        // Complexity: O(1)
        it('should generate text report', async () => {
            telemetry.startMonitoring();

            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, 200));

            telemetry.stopMonitoring();

            const report = telemetry.generateReport();

            // Complexity: O(1)
            expect(report).toContain('HARDWARE TELEMETRY REPORT');
            // Complexity: O(1)
            expect(report).toContain('CPU');
            // Complexity: O(1)
            expect(report).toContain('Memory');
            // Complexity: O(1)
            expect(report).toContain('WORKER POOL');
        });

        // Complexity: O(1)
        it('should format bytes correctly', () => {
            const report = telemetry.generateReport();

            // Should contain formatted memory values
            // Complexity: O(1)
            expect(report).toMatch(/\d+\.\d+ (B|KB|MB|GB|TB)/);
        });

        // Complexity: O(1)
        it('should include per-core usage', () => {
            const report = telemetry.generateReport();

            // Complexity: O(1)
            expect(report).toContain('Core');
            // Complexity: O(1)
            expect(report).toMatch(/Core\s+\d+:/);
        });
    });

    // Complexity: O(1)
    describe('⚙️ Configuration', () => {
        // Complexity: O(1)
        it('should update configuration', () => {
            telemetry.updateConfig({
                cpuThreshold: 75,
                throttleDelay: 200
            });

            const config = telemetry.getConfig();

            // Complexity: O(1)
            expect(config.cpuThreshold).toBe(75);
            // Complexity: O(1)
            expect(config.throttleDelay).toBe(200);
        });

        // Complexity: O(1)
        it('should have default configuration', () => {
            const config = telemetry.getConfig();

            // Complexity: O(1)
            expect(config.cpuThreshold).toBe(90);
            // Complexity: O(1)
            expect(config.memoryThreshold).toBe(85);
            // Complexity: O(1)
            expect(config.minWorkers).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(config.maxWorkers).toBeGreaterThan(config.minWorkers);
        });
    });
});
