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
const dashboard_server_1 = require("../src/enterprise/dashboard-server");
const license_manager_1 = require("../src/enterprise/license-manager");
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// 🎛️ DASHBOARD SERVER TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('DashboardServer - Sovereign Control Center', () => {
    let dashboard;
    const testPort = 13847;
    (0, vitest_1.beforeEach)(() => {
        dashboard = new dashboard_server_1.DashboardServer({
            port: testPort,
            host: 'localhost',
            updateInterval: 100,
            maxLogEntries: 50
        });
    });
    (0, vitest_1.afterEach)(async () => {
        if (dashboard.isRunning()) {
            await dashboard.stop();
        }
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 LIFECYCLE TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Server Lifecycle', () => {
        (0, vitest_1.it)('should create with default configuration', () => {
            const defaultDashboard = new dashboard_server_1.DashboardServer();
            (0, vitest_1.expect)(defaultDashboard.getUrl()).toBe('http://localhost:3847');
        });
        (0, vitest_1.it)('should create with custom configuration', () => {
            (0, vitest_1.expect)(dashboard.getUrl()).toBe(`http://localhost:${testPort}`);
        });
        (0, vitest_1.it)('should start and stop correctly', async () => {
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(false);
            await dashboard.start();
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(true);
            await dashboard.stop();
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(false);
        });
        (0, vitest_1.it)('should emit started event on start', async () => {
            const startedPromise = new Promise((resolve) => {
                dashboard.on('started', resolve);
            });
            await dashboard.start();
            const result = await startedPromise;
            (0, vitest_1.expect)(result.url).toBe(`http://localhost:${testPort}`);
        });
        (0, vitest_1.it)('should emit stopped event on stop', async () => {
            await dashboard.start();
            const stoppedPromise = new Promise((resolve) => {
                dashboard.on('stopped', resolve);
            });
            await dashboard.stop();
            await stoppedPromise;
            (0, vitest_1.expect)(dashboard.isRunning()).toBe(false);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 HTTP TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('HTTP Endpoints', () => {
        (0, vitest_1.beforeEach)(async () => {
            await dashboard.start();
        });
        (0, vitest_1.it)('should serve HTML dashboard on /', async () => {
            const response = await fetch(`http://localhost:${testPort}/`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.headers.get('content-type')).toContain('text/html');
            const html = await response.text();
            (0, vitest_1.expect)(html).toContain('QAntum');
            (0, vitest_1.expect)(html).toContain('Sovereign Control Center');
        });
        (0, vitest_1.it)('should serve state on /api/state', async () => {
            const response = await fetch(`http://localhost:${testPort}/api/state`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.headers.get('content-type')).toContain('application/json');
            const state = await response.json();
            (0, vitest_1.expect)(state).toHaveProperty('telemetry');
            (0, vitest_1.expect)(state).toHaveProperty('containers');
            (0, vitest_1.expect)(state).toHaveProperty('logs');
            (0, vitest_1.expect)(state).toHaveProperty('swarm');
            (0, vitest_1.expect)(state).toHaveProperty('tests');
        });
        (0, vitest_1.it)('should serve telemetry on /api/telemetry', async () => {
            const response = await fetch(`http://localhost:${testPort}/api/telemetry`);
            const telemetry = await response.json();
            (0, vitest_1.expect)(telemetry).toHaveProperty('cpu');
            (0, vitest_1.expect)(telemetry).toHaveProperty('memory');
            (0, vitest_1.expect)(telemetry).toHaveProperty('system');
            (0, vitest_1.expect)(telemetry.cpu.cores).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should serve logs on /api/logs', async () => {
            dashboard.log('info', 'Test message', 'Test');
            const response = await fetch(`http://localhost:${testPort}/api/logs`);
            const logs = await response.json();
            (0, vitest_1.expect)(Array.isArray(logs)).toBe(true);
            (0, vitest_1.expect)(logs.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(logs[0].message).toBe('Test message');
        });
        (0, vitest_1.it)('should serve containers on /api/containers', async () => {
            const container = {
                id: 'test-123',
                name: 'selenium-chrome',
                status: 'running',
                image: 'selenium/standalone-chrome',
                ports: ['4444:4444'],
                health: 'healthy',
                cpuPercent: 15.5,
                memoryUsage: '256MB'
            };
            dashboard.addContainer(container);
            const response = await fetch(`http://localhost:${testPort}/api/containers`);
            const containers = await response.json();
            (0, vitest_1.expect)(containers.length).toBe(1);
            (0, vitest_1.expect)(containers[0].name).toBe('selenium-chrome');
        });
        (0, vitest_1.it)('should serve history on /api/history', async () => {
            // Wait for a few updates
            await new Promise(resolve => setTimeout(resolve, 300));
            const response = await fetch(`http://localhost:${testPort}/api/history`);
            const history = await response.json();
            (0, vitest_1.expect)(history).toHaveProperty('temperature');
            (0, vitest_1.expect)(history).toHaveProperty('usage');
            (0, vitest_1.expect)(Array.isArray(history.temperature)).toBe(true);
        });
        (0, vitest_1.it)('should return 404 for unknown endpoints', async () => {
            const response = await fetch(`http://localhost:${testPort}/unknown`);
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        (0, vitest_1.it)('should handle CORS preflight', async () => {
            const response = await fetch(`http://localhost:${testPort}/api/state`, {
                method: 'OPTIONS'
            });
            (0, vitest_1.expect)(response.status).toBe(204);
            (0, vitest_1.expect)(response.headers.get('access-control-allow-origin')).toBe('*');
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📝 LOGGING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Logging System', () => {
        (0, vitest_1.it)('should add log entries', () => {
            dashboard.log('info', 'Test info', 'TestSource');
            dashboard.log('success', 'Test success', 'TestSource');
            dashboard.log('warning', 'Test warning', 'TestSource');
            dashboard.log('error', 'Test error', 'TestSource');
            dashboard.log('debug', 'Test debug', 'TestSource');
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.logs.length).toBe(5);
        });
        (0, vitest_1.it)('should emit log events', () => {
            const logPromise = new Promise((resolve) => {
                dashboard.on('log', resolve);
            });
            dashboard.log('info', 'Event test', 'Test');
            return logPromise.then(entry => {
                (0, vitest_1.expect)(entry.message).toBe('Event test');
                (0, vitest_1.expect)(entry.level).toBe('info');
            });
        });
        (0, vitest_1.it)('should trim logs when exceeding max entries', () => {
            const smallDashboard = new dashboard_server_1.DashboardServer({ maxLogEntries: 5 });
            for (let i = 0; i < 10; i++) {
                smallDashboard.log('info', `Log ${i}`, 'Test');
            }
            const state = smallDashboard.getState();
            (0, vitest_1.expect)(state.logs.length).toBe(5);
        });
        (0, vitest_1.it)('should support Bulgarian activity messages', () => {
            dashboard.logActivity('Агентът анализира Shadow DOM...', 'Agent');
            dashboard.logSuccess('Тестът премина успешно');
            dashboard.logWarning('Открих потенциален проблем');
            dashboard.logError('Грешка при изпълнение');
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.logs[0].message).toContain('Грешка');
            (0, vitest_1.expect)(state.logs[1].message).toContain('проблем');
        });
        (0, vitest_1.it)('should include details in log entries', () => {
            dashboard.log('info', 'Test with details', 'Test', { key: 'value', count: 42 });
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.logs[0].details).toEqual({ key: 'value', count: 42 });
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🐳 CONTAINER MANAGEMENT TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Container Management', () => {
        const testContainer = {
            id: 'container-1',
            name: 'selenium-hub',
            status: 'running',
            image: 'selenium/hub:latest',
            ports: ['4442:4442', '4443:4443', '4444:4444'],
            health: 'healthy',
            cpuPercent: 5.2,
            memoryUsage: '128MB'
        };
        (0, vitest_1.it)('should add containers', () => {
            dashboard.addContainer(testContainer);
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.containers.length).toBe(1);
            (0, vitest_1.expect)(state.containers[0].id).toBe('container-1');
        });
        (0, vitest_1.it)('should update existing containers', () => {
            dashboard.addContainer(testContainer);
            dashboard.addContainer({ ...testContainer, status: 'stopped', cpuPercent: 0 });
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.containers.length).toBe(1);
            (0, vitest_1.expect)(state.containers[0].status).toBe('stopped');
            (0, vitest_1.expect)(state.containers[0].cpuPercent).toBe(0);
        });
        (0, vitest_1.it)('should remove containers', () => {
            dashboard.addContainer(testContainer);
            dashboard.removeContainer('container-1');
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.containers.length).toBe(0);
        });
        (0, vitest_1.it)('should batch update containers', () => {
            const containers = [
                testContainer,
                { ...testContainer, id: 'container-2', name: 'chrome-node' },
                { ...testContainer, id: 'container-3', name: 'firefox-node' }
            ];
            dashboard.updateContainers(containers);
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.containers.length).toBe(3);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🎖️ SWARM & TEST STATUS TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Swarm & Test Status', () => {
        (0, vitest_1.it)('should update swarm status', () => {
            dashboard.updateSwarm({
                activeSoldiers: 10,
                queueLength: 25,
                completedTasks: 150,
                thermalState: 'warm'
            });
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.swarm.activeSoldiers).toBe(10);
            (0, vitest_1.expect)(state.swarm.queueLength).toBe(25);
            (0, vitest_1.expect)(state.swarm.completedTasks).toBe(150);
            (0, vitest_1.expect)(state.swarm.thermalState).toBe('warm');
        });
        (0, vitest_1.it)('should update test status', () => {
            dashboard.updateTests({
                running: true,
                passed: 45,
                failed: 2,
                current: 'TestSuite: LoginTests'
            });
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.tests.running).toBe(true);
            (0, vitest_1.expect)(state.tests.passed).toBe(45);
            (0, vitest_1.expect)(state.tests.failed).toBe(2);
            (0, vitest_1.expect)(state.tests.current).toBe('TestSuite: LoginTests');
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 TELEMETRY TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Telemetry Collection', () => {
        (0, vitest_1.it)('should collect initial telemetry', () => {
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.telemetry.cpu.cores).toBeGreaterThan(0);
            (0, vitest_1.expect)(state.telemetry.cpu.model).toBeDefined();
            (0, vitest_1.expect)(state.telemetry.memory.total).toBeGreaterThan(0);
            (0, vitest_1.expect)(state.telemetry.system.platform).toBeDefined();
        });
        (0, vitest_1.it)('should update telemetry over time', async () => {
            await dashboard.start();
            const initialState = dashboard.getState();
            const initialTimestamp = initialState.telemetry.timestamp;
            await new Promise(resolve => setTimeout(resolve, 150));
            const updatedState = dashboard.getState();
            (0, vitest_1.expect)(updatedState.telemetry.timestamp).toBeGreaterThan(initialTimestamp);
        });
        (0, vitest_1.it)('should calculate CPU usage percentages', async () => {
            await dashboard.start();
            await new Promise(resolve => setTimeout(resolve, 200));
            const state = dashboard.getState();
            (0, vitest_1.expect)(state.telemetry.cpu.usage).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(state.telemetry.cpu.usage).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('should estimate temperature based on load', async () => {
            await dashboard.start();
            await new Promise(resolve => setTimeout(resolve, 200));
            const state = dashboard.getState();
            // Temperature should be in reasonable range (30-100°C)
            (0, vitest_1.expect)(state.telemetry.cpu.temperature).toBeGreaterThanOrEqual(30);
            (0, vitest_1.expect)(state.telemetry.cpu.temperature).toBeLessThanOrEqual(100);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔢 CLIENT TRACKING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Client Tracking', () => {
        (0, vitest_1.it)('should track connected clients', async () => {
            await dashboard.start();
            (0, vitest_1.expect)(dashboard.getClientCount()).toBe(0);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 LICENSE MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('LicenseManager - Intellectual Shield', () => {
    let manager;
    const testLicenseFile = path.join(os.tmpdir(), '.QAntum-test.license');
    (0, vitest_1.beforeEach)(() => {
        manager = new license_manager_1.LicenseManager();
    });
    (0, vitest_1.afterEach)(() => {
        // Clean up test license file
        if (fs.existsSync(testLicenseFile)) {
            fs.unlinkSync(testLicenseFile);
        }
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 HARDWARE FINGERPRINTING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Hardware Fingerprinting', () => {
        (0, vitest_1.it)('should generate hardware ID', () => {
            const hwId = manager.generateHardwareId();
            (0, vitest_1.expect)(hwId).toMatch(/^[A-F0-9]{32}$/);
        });
        (0, vitest_1.it)('should generate consistent hardware ID', () => {
            const hwId1 = manager.generateHardwareId();
            const hwId2 = manager.generateHardwareId();
            (0, vitest_1.expect)(hwId1).toBe(hwId2);
        });
        (0, vitest_1.it)('should generate machine fingerprint', () => {
            const fingerprint = manager.generateMachineFingerprint();
            (0, vitest_1.expect)(fingerprint).toMatch(/^[a-f0-9]{128}$/);
        });
        (0, vitest_1.it)('should collect hardware info', () => {
            const info = manager.getHardwareInfo();
            (0, vitest_1.expect)(info.cpuModel).toBeDefined();
            (0, vitest_1.expect)(info.cpuCores).toBeGreaterThan(0);
            (0, vitest_1.expect)(info.totalMemory).toBeGreaterThan(0);
            (0, vitest_1.expect)(info.hostname).toBeDefined();
            (0, vitest_1.expect)(info.platform).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(info.macAddresses)).toBe(true);
        });
        (0, vitest_1.it)('should have matching CPU cores with system', () => {
            const info = manager.getHardwareInfo();
            (0, vitest_1.expect)(info.cpuCores).toBe(os.cpus().length);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📜 LICENSE GENERATION TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('License Generation', () => {
        (0, vitest_1.it)('should generate development license', () => {
            const license = manager.generateDevLicense('Test User', 'test@example.com');
            (0, vitest_1.expect)(license).toBeDefined();
            (0, vitest_1.expect)(typeof license).toBe('string');
            (0, vitest_1.expect)(license.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('should generate license with correct type', () => {
            const types = ['trial', 'professional', 'enterprise', 'sovereign'];
            for (const type of types) {
                const license = manager.generateDevLicense('Test', 'test@test.com', type);
                manager.saveLicense(license, testLicenseFile);
                manager.loadLicense(testLicenseFile);
                const info = manager.getLicenseInfo();
                (0, vitest_1.expect)(info?.type).toBe(type);
            }
        });
        (0, vitest_1.it)('should include hardware ID in license', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com');
            const decoded = JSON.parse(Buffer.from(license, 'base64').toString('utf-8'));
            (0, vitest_1.expect)(decoded.hardwareId).toBe(manager.generateHardwareId());
        });
        (0, vitest_1.it)('should set expiration 1 year from now', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com');
            const decoded = JSON.parse(Buffer.from(license, 'base64').toString('utf-8'));
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            const diff = decoded.expiresAt - decoded.issuedAt;
            (0, vitest_1.expect)(Math.abs(diff - oneYear)).toBeLessThan(1000); // Within 1 second
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // ✅ LICENSE VALIDATION TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('License Validation', () => {
        (0, vitest_1.it)('should return invalid when no license loaded', () => {
            const result = manager.validate();
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Не е намерен лиценз');
        });
        (0, vitest_1.it)('should validate correct license', () => {
            const license = manager.generateDevLicense('Test User', 'test@test.com', 'sovereign');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const result = manager.validate();
            (0, vitest_1.expect)(result.valid).toBe(true);
            (0, vitest_1.expect)(result.type).toBe('sovereign');
            (0, vitest_1.expect)(result.owner).toBe('Test User');
            (0, vitest_1.expect)(result.daysRemaining).toBeGreaterThan(360);
        });
        (0, vitest_1.it)('should detect expired license', () => {
            // Create an expired license manually
            const expiredData = {
                type: 'professional',
                owner: 'Test',
                email: 'test@test.com',
                hardwareId: manager.generateHardwareId(),
                machineFingerprint: manager.generateMachineFingerprint(),
                issuedAt: Date.now() - (400 * 24 * 60 * 60 * 1000),
                expiresAt: Date.now() - (35 * 24 * 60 * 60 * 1000), // Expired 35 days ago
                features: ['basic'],
                maxInstances: 10,
                signature: 'test-sig'
            };
            const encoded = Buffer.from(JSON.stringify(expiredData)).toString('base64');
            manager.saveLicense(encoded, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const result = manager.validate();
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('изтекъл');
            (0, vitest_1.expect)(result.daysRemaining).toBeLessThan(0);
        });
        (0, vitest_1.it)('should detect wrong hardware ID', () => {
            const wrongHwData = {
                type: 'professional',
                owner: 'Test',
                email: 'test@test.com',
                hardwareId: 'WRONGHARDWAREID12345678901234',
                machineFingerprint: 'wrong-fingerprint',
                issuedAt: Date.now(),
                expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000),
                features: ['basic'],
                maxInstances: 10,
                signature: 'test-sig'
            };
            const encoded = Buffer.from(JSON.stringify(wrongHwData)).toString('base64');
            manager.saveLicense(encoded, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const result = manager.validate();
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('друга машина');
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 🎫 FEATURE CHECKING TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Feature Checking', () => {
        (0, vitest_1.beforeEach)(() => {
            // Set up a valid sovereign license
            const license = manager.generateDevLicense('Test', 'test@test.com', 'sovereign');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
        });
        (0, vitest_1.it)('should return true for any feature with sovereign license', () => {
            (0, vitest_1.expect)(manager.hasFeature('any-feature')).toBe(true);
            (0, vitest_1.expect)(manager.hasFeature('dashboard')).toBe(true);
            (0, vitest_1.expect)(manager.hasFeature('swarm-execution')).toBe(true);
        });
        (0, vitest_1.it)('should check specific features for other license types', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com', 'trial');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            (0, vitest_1.expect)(manager.hasFeature('basic-automation')).toBe(true);
            (0, vitest_1.expect)(manager.hasFeature('dashboard')).toBe(true);
            (0, vitest_1.expect)(manager.hasFeature('swarm-execution')).toBe(false);
        });
        (0, vitest_1.it)('should return max instances based on license type', () => {
            const maxByType = {
                trial: 2,
                professional: 10,
                enterprise: 50,
                sovereign: 999
            };
            for (const [type, expected] of Object.entries(maxByType)) {
                const license = manager.generateDevLicense('Test', 'test@test.com', type);
                manager.saveLicense(license, testLicenseFile);
                manager.loadLicense(testLicenseFile);
                (0, vitest_1.expect)(manager.getMaxInstances()).toBe(expected);
            }
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATUS DISPLAY TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('Status Display', () => {
        (0, vitest_1.it)('should display status without license', () => {
            const status = manager.displayStatus();
            (0, vitest_1.expect)(status).toContain('Hardware ID');
            (0, vitest_1.expect)(status).toContain('НЕВАЛИДЕН');
        });
        (0, vitest_1.it)('should display status with valid license', () => {
            const license = manager.generateDevLicense('Димитър Продромов', 'test@test.com', 'sovereign');
            manager.saveLicense(license, testLicenseFile);
            manager.loadLicense(testLicenseFile);
            const status = manager.displayStatus();
            (0, vitest_1.expect)(status).toContain('АКТИВЕН');
            (0, vitest_1.expect)(status).toContain('SOVEREIGN');
            (0, vitest_1.expect)(status).toContain('Димитър Продромов');
        });
        (0, vitest_1.it)('should show hardware info in status', () => {
            const status = manager.displayStatus();
            const info = manager.getHardwareInfo();
            (0, vitest_1.expect)(status).toContain('CPU');
            (0, vitest_1.expect)(status).toContain('RAM');
            (0, vitest_1.expect)(status).toContain(info.platform);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // 💾 FILE OPERATIONS TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('File Operations', () => {
        (0, vitest_1.it)('should save license to file', () => {
            const license = manager.generateDevLicense('Test', 'test@test.com');
            manager.saveLicense(license, testLicenseFile);
            (0, vitest_1.expect)(fs.existsSync(testLicenseFile)).toBe(true);
        });
        (0, vitest_1.it)('should load license from file', () => {
            const license = manager.generateDevLicense('Test User', 'test@test.com');
            manager.saveLicense(license, testLicenseFile);
            const newManager = new license_manager_1.LicenseManager();
            const loaded = newManager.loadLicense(testLicenseFile);
            (0, vitest_1.expect)(loaded).toBe(true);
            (0, vitest_1.expect)(newManager.getLicenseInfo()?.owner).toBe('Test User');
        });
        (0, vitest_1.it)('should return false when loading non-existent file', () => {
            const loaded = manager.loadLicense('/nonexistent/path/.license');
            (0, vitest_1.expect)(loaded).toBe(false);
        });
        (0, vitest_1.it)('should handle corrupted license file', () => {
            fs.writeFileSync(testLicenseFile, 'not-valid-base64!!!');
            const loaded = manager.loadLicense(testLicenseFile);
            (0, vitest_1.expect)(loaded).toBe(false);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 HTML GENERATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('Dashboard HTML Generation', () => {
    (0, vitest_1.it)('should include all required UI components', async () => {
        const dashboard = new dashboard_server_1.DashboardServer({ port: 23847 });
        await dashboard.start();
        const response = await fetch('http://localhost:23847/');
        const html = await response.text();
        // Check for key UI elements
        (0, vitest_1.expect)(html).toContain('CPU Температура');
        (0, vitest_1.expect)(html).toContain('Docker Контейнери');
        (0, vitest_1.expect)(html).toContain('Swarm Статус');
        (0, vitest_1.expect)(html).toContain('Активност');
        (0, vitest_1.expect)(html).toContain('canvas');
        (0, vitest_1.expect)(html).toContain('WebSocket');
        await dashboard.stop();
    });
    (0, vitest_1.it)('should include Bulgarian text', async () => {
        const dashboard = new dashboard_server_1.DashboardServer({ port: 23848 });
        await dashboard.start();
        const response = await fetch('http://localhost:23848/');
        const html = await response.text();
        (0, vitest_1.expect)(html).toContain('Войници');
        (0, vitest_1.expect)(html).toContain('В Опашка');
        (0, vitest_1.expect)(html).toContain('Завършени');
        (0, vitest_1.expect)(html).toContain('Термално Състояние');
        (0, vitest_1.expect)(html).toContain('Свързан');
        await dashboard.stop();
    });
    (0, vitest_1.it)('should include author copyright', async () => {
        const dashboard = new dashboard_server_1.DashboardServer({ port: 23849 });
        await dashboard.start();
        const response = await fetch('http://localhost:23849/');
        const html = await response.text();
        (0, vitest_1.expect)(html).toContain('Димитър Продромов');
        (0, vitest_1.expect)(html).toContain('2025');
        (0, vitest_1.expect)(html).toContain('v23.0.0');
        (0, vitest_1.expect)(html).toContain('The Local Sovereign');
        await dashboard.stop();
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 📊 SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('Phase 3 Integration', () => {
    (0, vitest_1.it)('should have all Phase 3 modules available', () => {
        (0, vitest_1.expect)(dashboard_server_1.DashboardServer).toBeDefined();
        (0, vitest_1.expect)(license_manager_1.LicenseManager).toBeDefined();
    });
    (0, vitest_1.it)('should support Bulgarian locale throughout', () => {
        const manager = new license_manager_1.LicenseManager();
        const status = manager.displayStatus();
        // Status should contain Bulgarian text
        (0, vitest_1.expect)(status).toContain('Статус');
    });
});
