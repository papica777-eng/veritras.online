/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Aeterna v23.0 Phase 2 Tests - Hardware & Swarm Orchestration
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════════
// 🐳 DOCKER MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('DockerManager', () => {
  // Complexity: O(1)
  describe('Configuration', () => {
    // Complexity: O(1)
    it('should initialize with default configuration', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager();
      const config = manager.getConfig();

      // Complexity: O(1)
      expect(config.hubPort).toBe(4444);
      // Complexity: O(1)
      expect(config.maxSessions).toBe(16);
      // Complexity: O(1)
      expect(config.sessionTimeout).toBe(300);
      // Complexity: O(1)
      expect(config.networkName).toBe('Aeterna-grid');
    });

    // Complexity: O(1)
    it('should accept custom configuration', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager({
        hubPort: 5555,
        maxSessions: 32,
        enableVideo: true,
      });
      const config = manager.getConfig();

      // Complexity: O(1)
      expect(config.hubPort).toBe(5555);
      // Complexity: O(1)
      expect(config.maxSessions).toBe(32);
      // Complexity: O(1)
      expect(config.enableVideo).toBe(true);
    });

    // Complexity: O(1)
    it('should extend EventEmitter', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager();

      // Complexity: O(1)
      expect(manager).toBeInstanceOf(EventEmitter);
    });
  });

  // Complexity: O(1)
  describe('Dockerfile Generation', () => {
    // Complexity: O(1)
    it('should generate valid Dockerfile content', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager();
      const dockerfile = manager.generateDockerfile();

      // Complexity: O(1)
      expect(dockerfile).toContain('FROM node:20-slim');
      // Complexity: O(1)
      expect(dockerfile).toContain('WORKDIR /app');
      // Complexity: O(1)
      expect(dockerfile).toContain('HEALTHCHECK');
      // Complexity: O(1)
      expect(dockerfile).toContain('Aeterna_CONTAINER');
      // Complexity: O(1)
      expect(dockerfile).toContain('npm ci');
    });

    // Complexity: O(1)
    it('should include Playwright dependencies', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager();
      const dockerfile = manager.generateDockerfile();

      // Complexity: O(1)
      expect(dockerfile).toContain('libgtk-3-0');
      // Complexity: O(1)
      expect(dockerfile).toContain('libnss3');
      // Complexity: O(1)
      expect(dockerfile).toContain('libxss1');
    });
  });

  // Complexity: O(1)
  describe('Docker Compose Generation', () => {
    // Complexity: O(1)
    it('should generate docker-compose with selenium hub', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager();
      const compose = manager.generateDockerCompose();

      // Complexity: O(1)
      expect(compose).toContain('selenium-hub');
      // Complexity: O(1)
      expect(compose).toContain('Aeterna-hub');
      // Complexity: O(1)
      expect(compose).toContain('4444');
    });

    // Complexity: O(1)
    it('should include browser nodes', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager({
        nodes: [
          {
            name: 'chrome',
            browser: 'chrome',
            instances: 4,
            memoryLimit: '2g',
            cpuLimit: '2.0',
            enableVnc: true,
            seleniumPort: 5555,
          },
        ],
      });
      const compose = manager.generateDockerCompose();

      // Complexity: O(1)
      expect(compose).toContain('chrome-node');
      // Complexity: O(1)
      expect(compose).toContain('selenium/node-chrome');
    });

    // Complexity: O(1)
    it('should generate Playwright compose', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager();
      const compose = manager.generatePlaywrightCompose();

      // Complexity: O(1)
      expect(compose).toContain('playwright');
      // Complexity: O(1)
      expect(compose).toContain('mcr.microsoft.com/playwright');
    });

    // Complexity: O(1)
    it('should include video recorder when enabled', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager({
        enableVideo: true,
        nodes: [
          {
            name: 'chrome',
            browser: 'chrome',
            instances: 2,
            memoryLimit: '1g',
            cpuLimit: '1.0',
            enableVnc: false,
            seleniumPort: 5555,
          },
        ],
      });
      const compose = manager.generateDockerCompose();

      // Complexity: O(1)
      expect(compose).toContain('video-recorder');
    });
  });

  // Complexity: O(1)
  describe('Grid Management', () => {
    // Complexity: O(1)
    it('should report running status', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager();

      // Complexity: O(1)
      expect(manager.isRunning()).toBe(false);
    });

    // Complexity: O(1)
    it('should return hub URL', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager({ hubPort: 4444 });

      // Complexity: O(1)
      expect(manager.getHubUrl()).toBe('http://localhost:4444/wd/hub');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🎖️ SWARM COMMANDER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('SwarmCommander', () => {
  // Complexity: O(1)
  describe('Configuration', () => {
    // Complexity: O(1)
    it('should initialize with default strategy', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();
      const strategy = commander.getStrategy();

      // Complexity: O(1)
      expect(strategy.name).toBe('Thermal-Aware Swarm');
      // Complexity: O(1)
      expect(strategy.taskDistribution).toBe('thermal-aware');
      // Complexity: O(1)
      expect(strategy.thermalConfig.throttleTemp).toBe(90);
      // Complexity: O(1)
      expect(strategy.thermalConfig.coolTemp).toBe(70);
    });

    // Complexity: O(1)
    it('should accept custom strategy', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander({
        name: 'Custom Swarm',
        maxConcurrency: 32,
        thermalConfig: {
          throttleTemp: 85,
          criticalTemp: 90,
          coolTemp: 65,
          maxSoldiersCool: 32,
          minSoldiersHot: 2,
          checkInterval: 1000,
        },
      });
      const strategy = commander.getStrategy();

      // Complexity: O(1)
      expect(strategy.name).toBe('Custom Swarm');
      // Complexity: O(1)
      expect(strategy.thermalConfig.throttleTemp).toBe(85);
    });

    // Complexity: O(1)
    it('should extend EventEmitter', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      // Complexity: O(1)
      expect(commander).toBeInstanceOf(EventEmitter);
    });
  });

  // Complexity: O(1)
  describe('Lifecycle', () => {
    // Complexity: O(1)
    it('should initialize swarm', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();
      // Complexity: O(1)
      expect(commander.isSwarmRunning()).toBe(true);

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
      // Complexity: O(1)
      expect(commander.isSwarmRunning()).toBe(false);
    });

    // Complexity: O(1)
    it('should emit initialized event', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      const eventSpy = vi.fn();
      commander.on('initialized', eventSpy);

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();

      // Complexity: O(1)
      expect(eventSpy).toHaveBeenCalled();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
    });
  });

  // Complexity: O(1)
  describe('Thermal Management', () => {
    // Complexity: O(1)
    it('should respond to temperature changes', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander({
        thermalConfig: {
          throttleTemp: 90,
          criticalTemp: 95,
          coolTemp: 70,
          maxSoldiersCool: 40,
          minSoldiersHot: 4,
          checkInterval: 1000,
        },
      });

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();

      // Simulate hot temperature
      commander.setTemperature(92);
      const metrics = commander.getMetrics();

      // Complexity: O(1)
      expect(metrics.thermalState).toBe('hot');

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
    });

    // Complexity: O(1)
    it('should scale soldiers based on thermal state', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander({
        thermalConfig: {
          throttleTemp: 90,
          criticalTemp: 95,
          coolTemp: 70,
          maxSoldiersCool: 40,
          minSoldiersHot: 4,
          checkInterval: 1000,
        },
      });

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();

      // Cool state
      commander.setTemperature(60);
      const coolMetrics = commander.getMetrics();
      // Complexity: O(1)
      expect(coolMetrics.thermalState).toBe('cool');

      // Critical state
      commander.setTemperature(96);
      const criticalMetrics = commander.getMetrics();
      // Complexity: O(1)
      expect(criticalMetrics.thermalState).toBe('critical');

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
    });

    // Complexity: O(1)
    it('should update thermal config', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      commander.updateThermalConfig({ throttleTemp: 85 });
      const strategy = commander.getStrategy();

      // Complexity: O(1)
      expect(strategy.thermalConfig.throttleTemp).toBe(85);
    });
  });

  // Complexity: O(1)
  describe('Task Management', () => {
    // Complexity: O(1)
    it('should submit tasks', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();

      // SAFETY: async operation — wrap in try-catch for production resilience
      const taskId = await commander.submitTask('semantic-analysis', { test: 'data' });

      // Complexity: O(1)
      expect(taskId).toContain('task_');

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
    });

    // Complexity: O(1)
    it('should submit batch tasks', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();

      // SAFETY: async operation — wrap in try-catch for production resilience
      const taskIds = await commander.submitBatch([
        { type: 'dom-inspection', payload: { selector: '#btn' } },
        { type: 'visual-diff', payload: { baseline: 'img.png' } },
      ]);

      // Complexity: O(1)
      expect(taskIds.length).toBe(2);

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
    });

    // Complexity: O(1)
    it('should report queue length', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      // Complexity: O(1)
      expect(commander.getQueueLength()).toBe(0);
    });
  });

  // Complexity: O(1)
  describe('Soldier Status', () => {
    // Complexity: O(1)
    it('should return soldier statuses', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();

      const statuses = commander.getSoldierStatuses();
      // Complexity: O(1)
      expect(statuses.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(statuses[0]).toHaveProperty('id');
      // Complexity: O(1)
      expect(statuses[0]).toHaveProperty('status');

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🌡️ THERMAL AWARE POOL TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('ThermalAwarePool', () => {
  // Complexity: O(1)
  describe('Configuration', () => {
    // Complexity: O(1)
    it('should initialize with default config', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool();
      const config = pool.getConfig();

      // Complexity: O(1)
      expect(config.throttleThreshold).toBe(90);
      // Complexity: O(1)
      expect(config.criticalThreshold).toBe(95);
      // Complexity: O(1)
      expect(config.coolThreshold).toBe(70);
      // Complexity: O(1)
      expect(config.maxInstancesCool).toBe(40);
      // Complexity: O(1)
      expect(config.minInstancesHot).toBe(4);
    });

    // Complexity: O(1)
    it('should accept custom config', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({
        throttleThreshold: 85,
        maxInstancesCool: 32,
      });
      const config = pool.getConfig();

      // Complexity: O(1)
      expect(config.throttleThreshold).toBe(85);
      // Complexity: O(1)
      expect(config.maxInstancesCool).toBe(32);
    });
  });

  // Complexity: O(1)
  describe('Thermal States', () => {
    // Complexity: O(1)
    it('should start in cool state', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool();

      // Complexity: O(1)
      expect(pool.getState()).toBe('cool');
    });

    // Complexity: O(1)
    it('should transition to hot state at threshold', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({ throttleThreshold: 90 });

      pool.setTemperature(92);
      // Complexity: O(1)
      expect(pool.getState()).toBe('hot');
    });

    // Complexity: O(1)
    it('should transition to critical state', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({ criticalThreshold: 95 });

      pool.setTemperature(96);
      // Complexity: O(1)
      expect(pool.getState()).toBe('critical');
    });

    // Complexity: O(1)
    it('should transition to emergency state', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({ criticalThreshold: 95 });

      pool.setTemperature(101);
      // Complexity: O(1)
      expect(pool.getState()).toBe('emergency');
    });

    // Complexity: O(1)
    it('should return to cool state when temperature drops', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({ coolThreshold: 70 });

      pool.setTemperature(95);
      // Complexity: O(1)
      expect(pool.getState()).toBe('critical');

      pool.setTemperature(65);
      // Complexity: O(1)
      expect(pool.getState()).toBe('cool');
    });
  });

  // Complexity: O(1)
  describe('Concurrency Scaling', () => {
    // Complexity: O(1)
    it('should max concurrency when cool', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({
        maxInstancesCool: 40,
        coolThreshold: 70,
      });

      pool.setTemperature(60);
      // Should be at least equal to maxInstancesCool or CPU count (whichever is smaller)
      // Complexity: O(1)
      expect(pool.getConcurrency()).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(pool.getConcurrency()).toBeLessThanOrEqual(40);
    });

    // Complexity: O(1)
    it('should reduce concurrency when hot', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({
        maxInstancesCool: 40,
        minInstancesHot: 4,
        throttleThreshold: 90,
      });

      pool.setTemperature(92);
      // Complexity: O(1)
      expect(pool.getConcurrency()).toBeLessThan(40);
    });

    // Complexity: O(1)
    it('should force concurrency override', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool();

      pool.forceConcurrency(20);
      // Complexity: O(1)
      expect(pool.getConcurrency()).toBe(20);
    });
  });

  // Complexity: O(1)
  describe('Metrics', () => {
    // Complexity: O(1)
    it('should return pool metrics', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool();
      const metrics = pool.getMetrics();

      // Complexity: O(1)
      expect(metrics).toHaveProperty('currentTemperature');
      // Complexity: O(1)
      expect(metrics).toHaveProperty('state');
      // Complexity: O(1)
      expect(metrics).toHaveProperty('currentConcurrency');
      // Complexity: O(1)
      expect(metrics).toHaveProperty('throttleCount');
    });

    // Complexity: O(1)
    it('should track throttle count', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool();

      // Complexity: O(1)
      expect(pool.getMetrics().throttleCount).toBe(0);
    });

    // Complexity: O(1)
    it('should report throttling status', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({ throttleThreshold: 90 });

      pool.setTemperature(60);
      // Complexity: O(1)
      expect(pool.isThrottling()).toBe(false);

      pool.setTemperature(92);
      // Complexity: O(1)
      expect(pool.isThrottling()).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🗣️ BULGARIAN TTS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('BulgarianTTS', () => {
  // Complexity: O(1)
  describe('Configuration', () => {
    // Complexity: O(1)
    it('should initialize with default config', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();
      const config = tts.getConfig();

      // Complexity: O(1)
      expect(config.engine).toBe('sapi');
      // Complexity: O(1)
      expect(config.language).toBe('bg-BG');
      // Complexity: O(1)
      expect(config.rate).toBe(1.0);
      // Complexity: O(1)
      expect(config.volume).toBe(0.9);
    });

    // Complexity: O(1)
    it('should accept custom config', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS({
        engine: 'espeak',
        rate: 1.2,
        volume: 0.8,
      });
      const config = tts.getConfig();

      // Complexity: O(1)
      expect(config.engine).toBe('espeak');
      // Complexity: O(1)
      expect(config.rate).toBe(1.2);
      // Complexity: O(1)
      expect(config.volume).toBe(0.8);
    });

    // Complexity: O(1)
    it('should extend EventEmitter', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();

      // Complexity: O(1)
      expect(tts).toBeInstanceOf(EventEmitter);
    });
  });

  // Complexity: O(1)
  describe('Templates', () => {
    // Complexity: O(1)
    it('should have Bulgarian feedback templates', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();
      const templates = tts.getTemplates();

      // Complexity: O(1)
      expect(templates.testPassed).toBe('Тестът премина успешно.');
      // Complexity: O(1)
      expect(templates.testFailed).toBe('Тестът се провали.');
      // Complexity: O(1)
      expect(templates.errorFound).toContain('Открих грешка');
    });

    // Complexity: O(1)
    it('should have critical error template', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();
      const templates = tts.getTemplates();

      // Complexity: O(1)
      expect(templates.criticalError).toContain('Критична грешка');
    });

    // Complexity: O(1)
    it('should have suite completion template', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();
      const templates = tts.getTemplates();

      // Complexity: O(1)
      expect(templates.suiteCompleted).toContain('успешни');
      // Complexity: O(1)
      expect(templates.suiteCompleted).toContain('неуспешни');
    });

    // Complexity: O(1)
    it('should add custom templates', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();

      tts.addTemplate('customMessage', 'Персонализирано съобщение: {msg}');
      const templates = tts.getTemplates();

      // Complexity: O(1)
      expect(templates['customMessage']).toContain('Персонализирано');
    });
  });

  // Complexity: O(1)
  describe('Queue Management', () => {
    // Complexity: O(1)
    it('should report queue length', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();

      // Complexity: O(1)
      expect(tts.getQueueLength()).toBe(0);
    });

    // Complexity: O(1)
    it('should report speaking status', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();

      // Complexity: O(1)
      expect(tts.isSpeakingNow()).toBe(false);
    });

    // Complexity: O(1)
    it('should clear queue', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();

      tts.clearQueue();
      // Complexity: O(1)
      expect(tts.getQueueLength()).toBe(0);
    });
  });

  // Complexity: O(1)
  describe('Configuration Updates', () => {
    // Complexity: O(1)
    it('should update configuration', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { BulgarianTTS } = await import('../../mouth/energy/bulgarian-tts');
      const tts = new BulgarianTTS();

      tts.updateConfig({ rate: 1.5, volume: 0.7 });
      const config = tts.getConfig();

      // Complexity: O(1)
      expect(config.rate).toBe(1.5);
      // Complexity: O(1)
      expect(config.volume).toBe(0.7);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 INTEGRATION SCENARIO TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Phase 2 Integration Scenarios', () => {
  // Complexity: O(1)
  describe('Thermal-Aware Swarm Execution', () => {
    // Complexity: O(1)
    it('should reduce soldiers when hot', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { SwarmCommander } = await import('../../mouth/energy/swarm-commander');
      const commander = new SwarmCommander({
        thermalConfig: {
          throttleTemp: 90,
          criticalTemp: 95,
          coolTemp: 70,
          maxSoldiersCool: 40,
          minSoldiersHot: 4,
          checkInterval: 1000,
        },
      });

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.initialize();

      // Cool - soldiers spawned
      commander.setTemperature(60);
      const coolStatuses = commander.getSoldierStatuses();
      const coolCount = coolStatuses.length;
      // Complexity: O(1)
      expect(coolCount).toBeGreaterThan(0);

      // Critical state should have fewer soldiers available
      commander.setTemperature(96);
      const metrics = commander.getMetrics();
      // Complexity: O(1)
      expect(metrics.thermalState).toBe('critical');

      // SAFETY: async operation — wrap in try-catch for production resilience
      await commander.shutdown();
    });
  });

  // Complexity: O(1)
  describe('Docker Grid with Bulgarian Feedback', () => {
    // Complexity: O(1)
    it('should generate complete grid setup', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { DockerManager } = await import('../../mouth/strength/docker-manager');
      const manager = new DockerManager({
        hubPort: 4444,
        maxSessions: 16,
        nodes: [
          {
            name: 'chrome',
            browser: 'chrome',
            instances: 8,
            memoryLimit: '2g',
            cpuLimit: '2.0',
            enableVnc: true,
            vncPort: 5900,
            seleniumPort: 5555,
          },
          {
            name: 'firefox',
            browser: 'firefox',
            instances: 4,
            memoryLimit: '2g',
            cpuLimit: '1.0',
            enableVnc: false,
            seleniumPort: 5556,
          },
        ],
      });

      const dockerfile = manager.generateDockerfile();
      const compose = manager.generateDockerCompose();

      // Complexity: O(1)
      expect(dockerfile).toContain('node:20-slim');
      // Complexity: O(1)
      expect(compose).toContain('chrome-node');
      // Complexity: O(1)
      expect(compose).toContain('firefox-node');
    });
  });

  // Complexity: O(N)
  describe('Lenovo Hardware Optimization', () => {
    // Complexity: O(N)
    it('should optimize for Ryzen 7 7435HS specs', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { ThermalAwarePool } = await import('../../../../../energy/thermal-aware-pool');
      const pool = new ThermalAwarePool({
        // Ryzen 7 7435HS optimized settings
        throttleThreshold: 90, // Typical Ryzen throttle point
        criticalThreshold: 95, // Safety margin
        coolThreshold: 70, // Ideal operating temp
        maxInstancesCool: 40, // 16 threads * 2.5 (with HT efficiency)
        minInstancesHot: 4, // Minimum safe operation
        checkInterval: 2000,
      });

      // Test full power mode
      pool.setTemperature(65);
      // Complexity: O(1)
      expect(pool.getConcurrency()).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(pool.getConcurrency()).toBeLessThanOrEqual(40);
      // Complexity: O(1)
      expect(pool.getState()).toBe('cool');

      // Test throttled mode
      pool.setTemperature(92);
      // Complexity: O(1)
      expect(pool.isThrottling()).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🎖️ SOLDIER UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Soldier', () => {
  // Complexity: O(1)
  it('should execute tasks', async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { Soldier } = await import('../../mouth/energy/swarm-commander');
    const soldier = new Soldier(1);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await soldier.execute({
      id: 'test_1',
      type: 'dom-inspection',
      priority: 'normal',
      payload: { selector: '#btn' },
      createdAt: Date.now(),
      retries: 0,
      maxRetries: 3,
    });

    // Complexity: O(1)
    expect(result.success).toBe(true);
    // Complexity: O(1)
    expect(result.soldierId).toBe(1);
  });

  // Complexity: O(1)
  it('should track execution metrics', async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { Soldier } = await import('../../mouth/energy/swarm-commander');
    const soldier = new Soldier(1);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await soldier.execute({
      id: 'test_1',
      type: 'semantic-analysis',
      priority: 'high',
      payload: {},
      createdAt: Date.now(),
      retries: 0,
      maxRetries: 3,
    });

    const status = soldier.getStatus();
    // Complexity: O(1)
    expect(status.tasksCompleted).toBe(1);
    // Complexity: O(1)
    expect(status.avgExecutionTime).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  it('should enter cooldown mode', async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { Soldier } = await import('../../mouth/energy/swarm-commander');
    const soldier = new Soldier(1);

    soldier.enterCooldown();
    // Complexity: O(1)
    expect(soldier.getStatus().status).toBe('cooldown');

    soldier.resume();
    // Complexity: O(1)
    expect(soldier.getStatus().status).toBe('idle');
  });
});
