"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum v23.0.0 - PHASE 3 TEST SUITE
 * "THE SOVEREIGN DASHBOARD & SHIELD"
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
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
const dashboard_server_1 = require("../../../../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/enterprise/dashboard-server");
const license_manager_1 = require("../../brain/strength/license-manager");
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// 🎛️ DASHBOARD SERVER TESTS
// ═══════════════════════════════════════════════════════════════════════════════
// Complexity: O(1)
(0, vitest_1.describe)('DashboardServer - Sovereign Control Center', () => {
    let dashboard;
    const testPort = 13847;
    // Complexity: O(1)
    (0, vitest_1.beforeEach)(() => {
        dashboard = new dashboard_server_1.DashboardServer({
            port: testPort,
            host: 'localhost',
            updateInterval: 100,
            maxLogEntries: 50,
        });
    });
    // Complexity: O(1)
    (0, vitest_1.afterEach)(async () => {
        if (dashboard.isRunning()) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.stop();
        }
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 LIFECYCLE TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('Server Lifecycle', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should create with default configuration', () => {
            const defaultDashboard = new dashboard_server_1.DashboardServer();
            // Complexity: O(1)
            (0, vitest_1.expect)(defaultDashboard.getUrl()).toBe('http://localhost:3847');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should create with custom configuration', () => {
            // Complexity: O(1)
            (0, vitest_1.expect)(dashboard.getUrl()).toBe(`http://localhost:${testPort}`);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should start and stop correctly', async () => {
            // Complexity: O(1)
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(false);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
            // Complexity: O(1)
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(true);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.stop();
            // Complexity: O(1)
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(false);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should emit started event on start', async () => {
            const startedPromise = new Promise((resolve) => {
                dashboard.on('started', resolve);
            });
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await startedPromise;
            // Complexity: O(1)
            (0, vitest_1.expect)(result.url).toBe(`http://localhost:${testPort}`);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should emit stopped event on stop', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
            const stoppedPromise = new Promise((resolve) => {
                dashboard.on('stopped', resolve);
            });
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.stop();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await stoppedPromise;
            // Complexity: O(1)
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(false);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 HTTP TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — lookup
    (0, vitest_1.describe)('HTTP Endpoints', () => {
        // Complexity: O(1)
        (0, vitest_1.beforeEach)(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
        });
        // Complexity: O(1) — lookup
        (0, vitest_1.it)('should serve HTML dashboard on /', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/`);
            // Complexity: O(1)
            (0, vitest_1.expect)(response.status).toBe(200);
            // Complexity: O(1)
            (0, vitest_1.expect)(response.headers.get('content-type')).toContain('text/html');
            // SAFETY: async operation — wrap in try-catch for production resilience
            const html = await response.text();
            // Complexity: O(1)
            (0, vitest_1.expect)(html).toContain('QAntum');
            // Complexity: O(1)
            (0, vitest_1.expect)(html).toContain('Sovereign Control Center');
        });
        // Complexity: O(1) — lookup
        (0, vitest_1.it)('should serve state on /api/state', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/api/state`);
            // Complexity: O(1)
            (0, vitest_1.expect)(response.status).toBe(200);
            // Complexity: O(1)
            (0, vitest_1.expect)(response.headers.get('content-type')).toContain('application/json');
            // SAFETY: async operation — wrap in try-catch for production resilience
            const state = await response.json();
            // Complexity: O(1)
            (0, vitest_1.expect)(state).toHaveProperty('telemetry');
            // Complexity: O(1)
            (0, vitest_1.expect)(state).toHaveProperty('containers');
            // Complexity: O(1)
            (0, vitest_1.expect)(state).toHaveProperty('logs');
            // Complexity: O(1)
            (0, vitest_1.expect)(state).toHaveProperty('swarm');
            // Complexity: O(1)
            (0, vitest_1.expect)(state).toHaveProperty('tests');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should serve telemetry on /api/telemetry', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/api/telemetry`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const telemetry = await response.json();
            // Complexity: O(1)
            (0, vitest_1.expect)(telemetry).toHaveProperty('cpu');
            // Complexity: O(1)
            (0, vitest_1.expect)(telemetry).toHaveProperty('memory');
            // Complexity: O(1)
            (0, vitest_1.expect)(telemetry).toHaveProperty('system');
            // Complexity: O(1)
            (0, vitest_1.expect)(telemetry.cpu.cores).toBeGreaterThan(0);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should serve logs on /api/logs', async () => {
            dashboard.log('info', 'Test message', 'Test');
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/api/logs`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const logs = await response.json();
            // Complexity: O(1)
            (0, vitest_1.expect)(Array.isArray(logs)).toBe(true);
            // Complexity: O(1)
            (0, vitest_1.expect)(logs.length).toBeGreaterThan(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(logs[0].message).toBe('Test message');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should serve containers on /api/containers', async () => {
            const container = {
                id: 'test-123',
                name: 'selenium-chrome',
                status: 'running',
                image: 'selenium/standalone-chrome',
                ports: ['4444:4444'],
                health: 'healthy',
                cpuPercent: 15.5,
                memoryUsage: '256MB',
            };
            dashboard.addContainer(container);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/api/containers`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const containers = await response.json();
            // Complexity: O(1)
            (0, vitest_1.expect)(containers.length).toBe(1);
            // Complexity: O(1)
            (0, vitest_1.expect)(containers[0].name).toBe('selenium-chrome');
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should serve history on /api/history', async () => {
            // Wait for a few updates
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise((resolve) => setTimeout(resolve, 300));
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/api/history`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const history = await response.json();
            // Complexity: O(N)
            (0, vitest_1.expect)(history).toHaveProperty('temperature');
            // Complexity: O(N)
            (0, vitest_1.expect)(history).toHaveProperty('usage');
            // Complexity: O(N)
            (0, vitest_1.expect)(Array.isArray(history.temperature)).toBe(true);
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should return 404 for unknown endpoints', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/unknown`);
            // Complexity: O(1)
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        // Complexity: O(1) — lookup
        (0, vitest_1.it)('should handle CORS preflight', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`http://localhost:${testPort}/api/state`, {
                method: 'OPTIONS',
            });
            // Complexity: O(1)
            (0, vitest_1.expect)(response.status).toBe(204);
            // Complexity: O(1)
            (0, vitest_1.expect)(response.headers.get('access-control-allow-origin')).toBe('*');
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📝 LOGGING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — loop
    (0, vitest_1.describe)('Logging System', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should add log entries', () => {
            dashboard.log('info', 'Test info', 'TestSource');
            dashboard.log('success', 'Test success', 'TestSource');
            dashboard.log('warning', 'Test warning', 'TestSource');
            dashboard.log('error', 'Test error', 'TestSource');
            dashboard.log('debug', 'Test debug', 'TestSource');
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.logs.length).toBe(5);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should emit log events', () => {
            const logPromise = new Promise((resolve) => {
                dashboard.on('log', resolve);
            });
            dashboard.log('info', 'Event test', 'Test');
            return logPromise.then((entry) => {
                // Complexity: O(1)
                (0, vitest_1.expect)(entry.message).toBe('Event test');
                // Complexity: O(1)
                (0, vitest_1.expect)(entry.level).toBe('info');
            });
        });
        // Complexity: O(N) — loop
        (0, vitest_1.it)('should trim logs when exceeding max entries', () => {
            const smallDashboard = new dashboard_server_1.DashboardServer({ maxLogEntries: 5 });
            for (let i = 0; i < 10; i++) {
                smallDashboard.log('info', `Log ${i}`, 'Test');
            }
            const state = smallDashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.logs.length).toBe(5);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should support Bulgarian activity messages', () => {
            dashboard.logActivity('Агентът анализира Shadow DOM...', 'Agent');
            dashboard.logSuccess('Тестът премина успешно');
            dashboard.logWarning('Открих потенциален проблем');
            dashboard.logError('Грешка при изпълнение');
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.logs[0].message).toContain('Грешка');
            // Complexity: O(1)
            (0, vitest_1.expect)(state.logs[1].message).toContain('проблем');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should include details in log entries', () => {
            dashboard.log('info', 'Test with details', 'Test', { key: 'value', count: 42 });
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.logs[0].details).toEqual({ key: 'value', count: 42 });
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🐳 CONTAINER MANAGEMENT TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('Container Management', () => {
        const testContainer = {
            id: 'container-1',
            name: 'selenium-hub',
            status: 'running',
            image: 'selenium/hub:latest',
            ports: ['4442:4442', '4443:4443', '4444:4444'],
            health: 'healthy',
            cpuPercent: 5.2,
            memoryUsage: '128MB',
        };
        // Complexity: O(1)
        (0, vitest_1.it)('should add containers', () => {
            dashboard.addContainer(testContainer);
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.containers.length).toBe(1);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.containers[0].id).toBe('container-1');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should update existing containers', () => {
            dashboard.addContainer(testContainer);
            dashboard.addContainer({ ...testContainer, status: 'stopped', cpuPercent: 0 });
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.containers.length).toBe(1);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.containers[0].status).toBe('stopped');
            // Complexity: O(1)
            (0, vitest_1.expect)(state.containers[0].cpuPercent).toBe(0);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should remove containers', () => {
            dashboard.addContainer(testContainer);
            dashboard.removeContainer('container-1');
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.containers.length).toBe(0);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should batch update containers', () => {
            const containers = [
                testContainer,
                { ...testContainer, id: 'container-2', name: 'chrome-node' },
                { ...testContainer, id: 'container-3', name: 'firefox-node' },
            ];
            dashboard.updateContainers(containers);
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.containers.length).toBe(3);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🎖️ SWARM & TEST STATUS TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('Swarm & Test Status', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should update swarm status', () => {
            dashboard.updateSwarm({
                activeSoldiers: 10,
                queueLength: 25,
                completedTasks: 150,
                thermalState: 'warm',
            });
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.swarm.activeSoldiers).toBe(10);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.swarm.queueLength).toBe(25);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.swarm.completedTasks).toBe(150);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.swarm.thermalState).toBe('warm');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should update test status', () => {
            dashboard.updateTests({
                running: true,
                passed: 45,
                failed: 2,
                current: 'TestSuite: LoginTests',
            });
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.tests.running).toBe(true);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.tests.passed).toBe(45);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.tests.failed).toBe(2);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.tests.current).toBe('TestSuite: LoginTests');
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 TELEMETRY TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('Telemetry Collection', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should collect initial telemetry', () => {
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.cpu.cores).toBeGreaterThan(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.cpu.model).toBeDefined();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.memory.total).toBeGreaterThan(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.system.platform).toBeDefined();
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should update telemetry over time', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
            const initialState = dashboard.getState();
            const initialTimestamp = initialState.telemetry.timestamp;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise((resolve) => setTimeout(resolve, 150));
            const updatedState = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(updatedState.telemetry.timestamp).toBeGreaterThan(initialTimestamp);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should calculate CPU usage percentages', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise((resolve) => setTimeout(resolve, 200));
            const state = dashboard.getState();
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.cpu.usage).toBeGreaterThanOrEqual(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.cpu.usage).toBeLessThanOrEqual(100);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should estimate temperature based on load', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise((resolve) => setTimeout(resolve, 200));
            const state = dashboard.getState();
            // Temperature should be in reasonable range (30-100°C)
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.cpu.temperature).toBeGreaterThanOrEqual(30);
            // Complexity: O(1)
            (0, vitest_1.expect)(state.telemetry.cpu.temperature).toBeLessThanOrEqual(100);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔢 CLIENT TRACKING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('Client Tracking', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should track connected clients', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dashboard.start();
            // Complexity: O(1)
            (0, vitest_1.expect)(dashboard.getClientCount()).toBe(0);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 LICENSE MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════
// Complexity: O(1)
(0, vitest_1.describe)('LicenseManager - Intellectual Shield', () => {
    let manager;
    const testLicenseFile = path.join(os.tmpdir(), '.QAntum-test.license');
    // Complexity: O(1)
    (0, vitest_1.beforeEach)(() => {
        manager = new license_manager_1.LicenseManager();
    });
    // Complexity: O(1)
    (0, vitest_1.afterEach)(() => {
        // Clean up test license file
        if (fs.existsSync(testLicenseFile)) {
            fs.unlinkSync(testLicenseFile);
        }
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 HARDWARE FINGERPRINTING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('Hardware Fingerprinting', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should generate hardware ID', () => {
            const hwId = manager.generateHardwareId();
            // Complexity: O(1)
            (0, vitest_1.expect)(hwId).toMatch(/^[A-F0-9]{32}$/);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should generate consistent hardware ID', () => {
            const hwId1 = manager.generateHardwareId();
            const hwId2 = manager.generateHardwareId();
            // Complexity: O(1)
            (0, vitest_1.expect)(hwId1).toBe(hwId2);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should generate machine fingerprint', () => {
            const fingerprint = manager.generateMachineFingerprint();
            // Complexity: O(1)
            (0, vitest_1.expect)(fingerprint).toMatch(/^[a-f0-9]{128}$/);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should collect hardware info', () => {
            const info = manager.getHardwareInfo();
            // Complexity: O(1)
            (0, vitest_1.expect)(info.cpuModel).toBeDefined();
            // Complexity: O(1)
            (0, vitest_1.expect)(info.cpuCores).toBeGreaterThan(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(info.totalMemory).toBeGreaterThan(0);
            // Complexity: O(1)
            (0, vitest_1.expect)(info.hostname).toBeDefined();
            // Complexity: O(1)
            (0, vitest_1.expect)(info.platform).toBeDefined();
            // Complexity: O(1)
            (0, vitest_1.expect)(Array.isArray(info.macAddresses)).toBe(true);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should have matching CPU cores with system', () => {
            const info = manager.getHardwareInfo();
            // Complexity: O(1)
            (0, vitest_1.expect)(info.cpuCores).toBe(os.cpus().length);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📜 LICENSE GENERATION TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — loop
    (0, vitest_1.describe)('License Generation', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should generate development license', () => {
            const license = manager.generateDevLicense('Test User', 'test@example.com');
            // Complexity: O(1)
            (0, vitest_1.expect)(license).toBeDefined();
            // Complexity: O(1)
            (0, vitest_1.expect)(typeof license).toBe('string');
            // Complexity: O(1)
            (0, vitest_1.expect)(license.length).toBeGreaterThan(100);
        });
        // Complexity: O(N) — loop
        (0, vitest_1.it)('should generate license with correct type', () => {
            const types = ['trial', 'professional', 'enterprise', 'sovereign'];
            for (const type of types) {
                const license = manager.generateDevLicense('Test', 'test@test.com', type);
                manager.saveLicense(license, testLicenseFile);
                manager.loadLicense(testLicenseFile);
                const info = manager.getLicenseInfo();
                // Complexity: O(1)
                (0, vitest_1.expect)(info?.type).toBe(type);
            }
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should include hardware ID in license', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com');
            const decoded = JSON.parse(Buffer.from(license, 'base64').toString('utf-8'));
            // Complexity: O(1)
            (0, vitest_1.expect)(decoded.hardwareId).toBe(manager.generateHardwareId());
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should set expiration 1 year from now', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com');
            const decoded = JSON.parse(Buffer.from(license, 'base64').toString('utf-8'));
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            const diff = decoded.expiresAt - decoded.issuedAt;
            // Complexity: O(1)
            (0, vitest_1.expect)(Math.abs(diff - oneYear)).toBeLessThan(1000); // Within 1 second
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // ✅ LICENSE VALIDATION TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('License Validation', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should return invalid when no license loaded', () => {
            const result = manager.validate();
            // Complexity: O(1)
            (0, vitest_1.expect)(result.valid).toBe(false);
            // Complexity: O(1)
            (0, vitest_1.expect)(result.error).toContain('Не е намерен лиценз');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should validate correct license', () => {
            const license = manager.generateDevLicense('Test User', 'test@test.com', 'sovereign');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const result = manager.validate();
            // Complexity: O(1)
            (0, vitest_1.expect)(result.valid).toBe(true);
            // Complexity: O(1)
            (0, vitest_1.expect)(result.type).toBe('sovereign');
            // Complexity: O(1)
            (0, vitest_1.expect)(result.owner).toBe('Test User');
            // Complexity: O(1)
            (0, vitest_1.expect)(result.daysRemaining).toBeGreaterThan(360);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should detect expired license', () => {
            // Create an expired license manually
            const expiredData = {
                type: 'professional',
                owner: 'Test',
                email: 'test@test.com',
                hardwareId: manager.generateHardwareId(),
                machineFingerprint: manager.generateMachineFingerprint(),
                issuedAt: Date.now() - 400 * 24 * 60 * 60 * 1000,
                expiresAt: Date.now() - 35 * 24 * 60 * 60 * 1000, // Expired 35 days ago
                features: ['basic'],
                maxInstances: 10,
                signature: 'test-sig',
            };
            const encoded = Buffer.from(JSON.stringify(expiredData)).toString('base64');
            manager.saveLicense(encoded, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const result = manager.validate();
            // Complexity: O(1)
            (0, vitest_1.expect)(result.valid).toBe(false);
            // Complexity: O(1)
            (0, vitest_1.expect)(result.error).toContain('изтекъл');
            // Complexity: O(1)
            (0, vitest_1.expect)(result.daysRemaining).toBeLessThan(0);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should detect wrong hardware ID', () => {
            const wrongHwData = {
                type: 'professional',
                owner: 'Test',
                email: 'test@test.com',
                hardwareId: 'WRONGHARDWAREID12345678901234',
                machineFingerprint: 'wrong-fingerprint',
                issuedAt: Date.now(),
                expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
                features: ['basic'],
                maxInstances: 10,
                signature: 'test-sig',
            };
            const encoded = Buffer.from(JSON.stringify(wrongHwData)).toString('base64');
            manager.saveLicense(encoded, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const result = manager.validate();
            // Complexity: O(1)
            (0, vitest_1.expect)(result.valid).toBe(false);
            // Complexity: O(1)
            (0, vitest_1.expect)(result.error).toContain('друга машина');
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🎫 FEATURE CHECKING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration
    (0, vitest_1.describe)('Feature Checking', () => {
        // Complexity: O(1)
        (0, vitest_1.beforeEach)(() => {
            // Set up a valid sovereign license
            const license = manager.generateDevLicense('Test', 'test@test.com', 'sovereign');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should return true for any feature with sovereign license', () => {
            // Complexity: O(N)
            (0, vitest_1.expect)(manager.hasFeature('any-feature')).toBe(true);
            // Complexity: O(N)
            (0, vitest_1.expect)(manager.hasFeature('dashboard')).toBe(true);
            // Complexity: O(N)
            (0, vitest_1.expect)(manager.hasFeature('swarm-execution')).toBe(true);
        });
        // Complexity: O(N)
        (0, vitest_1.it)('should check specific features for other license types', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com', 'trial');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            // Complexity: O(1)
            (0, vitest_1.expect)(manager.hasFeature('basic-automation')).toBe(true);
            // Complexity: O(1)
            (0, vitest_1.expect)(manager.hasFeature('dashboard')).toBe(true);
            // Complexity: O(1)
            (0, vitest_1.expect)(manager.hasFeature('swarm-execution')).toBe(false);
        });
        // Complexity: O(N) — loop
        (0, vitest_1.it)('should return max instances based on license type', () => {
            const maxByType = {
                trial: 2,
                professional: 10,
                enterprise: 50,
                sovereign: 999,
            };
            for (const [type, expected] of Object.entries(maxByType)) {
                const license = manager.generateDevLicense('Test', 'test@test.com', type);
                manager.saveLicense(license, testLicenseFile);
                manager.loadLicense(testLicenseFile);
                // Complexity: O(1)
                (0, vitest_1.expect)(manager.getMaxInstances()).toBe(expected);
            }
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATUS DISPLAY TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('Status Display', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should display status without license', () => {
            const status = manager.displayStatus();
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain('Hardware ID');
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain('НЕВАЛИДЕН');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should display status with valid license', () => {
            const license = manager.generateDevLicense('Димитър Продромов', 'test@test.com', 'sovereign');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const status = manager.displayStatus();
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain('АКТИВЕН');
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain('SOVEREIGN');
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain('Димитър Продромов');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should show hardware info in status', () => {
            const status = manager.displayStatus();
            const info = manager.getHardwareInfo();
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain('CPU');
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain('RAM');
            // Complexity: O(1)
            (0, vitest_1.expect)(status).toContain(info.platform);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 💾 FILE OPERATIONS TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    (0, vitest_1.describe)('File Operations', () => {
        // Complexity: O(1)
        (0, vitest_1.it)('should save license to file', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com');
            manager.saveLicense(license, testLicenseFile);
            // Complexity: O(1)
            (0, vitest_1.expect)(fs.existsSync(testLicenseFile)).toBe(true);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should load license from file', () => {
            const license = manager.generateDevLicense('Test User', 'test@test.com');
            manager.saveLicense(license, testLicenseFile);
            const newManager = new license_manager_1.LicenseManager();
            const loaded = newManager.loadLicense(testLicenseFile);
            // Complexity: O(1)
            (0, vitest_1.expect)(loaded).toBe(true);
            // Complexity: O(1)
            (0, vitest_1.expect)(newManager.getLicenseInfo()?.owner).toBe('Test User');
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should return false when loading non-existent file', () => {
            const loaded = manager.loadLicense('/nonexistent/path/.license');
            // Complexity: O(1)
            (0, vitest_1.expect)(loaded).toBe(false);
        });
        // Complexity: O(1)
        (0, vitest_1.it)('should handle corrupted license file', () => {
            fs.writeFileSync(testLicenseFile, 'not-valid-base64!!!');
            const loaded = manager.loadLicense(testLicenseFile);
            // Complexity: O(1)
            (0, vitest_1.expect)(loaded).toBe(false);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 HTML GENERATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════
// Complexity: O(N)
(0, vitest_1.describe)('Dashboard HTML Generation', () => {
    // Complexity: O(N)
    (0, vitest_1.it)('should include all required UI components', async () => {
        const dashboard = new dashboard_server_1.DashboardServer({ port: 23847 });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await dashboard.start();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch('http://localhost:23847/');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const html = await response.text();
        // Check for key UI elements
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('CPU Температура');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Docker Контейнери');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Swarm Статус');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Активност');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('canvas');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('WebSocket');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await dashboard.stop();
    });
    // Complexity: O(1)
    (0, vitest_1.it)('should include Bulgarian text', async () => {
        const dashboard = new dashboard_server_1.DashboardServer({ port: 23848 });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await dashboard.start();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch('http://localhost:23848/');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const html = await response.text();
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Войници');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('В Опашка');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Завършени');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Термално Състояние');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Свързан');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await dashboard.stop();
    });
    // Complexity: O(1)
    (0, vitest_1.it)('should include author copyright', async () => {
        const dashboard = new dashboard_server_1.DashboardServer({ port: 23849 });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await dashboard.start();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch('http://localhost:23849/');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const html = await response.text();
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('Димитър Продромов');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('2025');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('v23.0.0');
        // Complexity: O(1)
        (0, vitest_1.expect)(html).toContain('The Local Sovereign');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await dashboard.stop();
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 📊 SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
// Complexity: O(1)
(0, vitest_1.describe)('Phase 3 Integration', () => {
    // Complexity: O(1)
    (0, vitest_1.it)('should have all Phase 3 modules available', () => {
        // Complexity: O(1)
        (0, vitest_1.expect)(dashboard_server_1.DashboardServer).toBeDefined();
        // Complexity: O(1)
        (0, vitest_1.expect)(license_manager_1.LicenseManager).toBeDefined();
    });
    // Complexity: O(1)
    (0, vitest_1.it)('should support Bulgarian locale throughout', () => {
        const manager = new license_manager_1.LicenseManager();
        const status = manager.displayStatus();
        // Status should contain Bulgarian text
        // Complexity: O(1)
        (0, vitest_1.expect)(status).toContain('Статус');
    });
});
