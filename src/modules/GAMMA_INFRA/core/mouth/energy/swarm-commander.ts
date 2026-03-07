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
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'events';
import * as os from 'os';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎖️ COMMANDER-SOLDIER SWARM - Multi-Agent Hierarchy for Ryzen 7
// ═══════════════════════════════════════════════════════════════════════════════
// Commander планира стратегията, 16 Soldiers изпълняват паралелно.
// Thermal-aware scaling за максимална производителност на Lenovo.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Soldier task types
 */
export type SoldierTaskType =
  | 'semantic-analysis'
  | 'dom-inspection'
  | 'visual-diff'
  | 'api-validation'
  | 'accessibility-audit'
  | 'performance-metric'
  | 'security-scan'
  | 'regression-check';

/**
 * Task priority levels
 */
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';

/**
 * Task for soldiers
 */
export interface SoldierTask {
  id: string;
  type: SoldierTaskType;
  priority: TaskPriority;
  payload: unknown;
  createdAt: number;
  deadline?: number;
  retries: number;
  maxRetries: number;
}

/**
 * Task result from soldier
 */
export interface TaskResult {
  taskId: string;
  soldierId: number;
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
  memoryUsed: number;
}

/**
 * Soldier status
 */
export interface SoldierStatus {
  id: number;
  threadId: number;
  status: 'idle' | 'busy' | 'cooldown' | 'terminated';
  currentTask: string | null;
  tasksCompleted: number;
  tasksFailed: number;
  avgExecutionTime: number;
  lastActive: number;
}

/**
 * Commander strategy
 */
export interface SwarmStrategy {
  name: string;
  description: string;
  maxConcurrency: number;
  priorityWeights: Record<TaskPriority, number>;
  taskDistribution: 'round-robin' | 'load-balanced' | 'priority-first' | 'thermal-aware';
  thermalConfig: ThermalConfig;
}

/**
 * Thermal throttling configuration
 */
export interface ThermalConfig {
  /** Temperature to start throttling (°C) */
  throttleTemp: number;
  /** Temperature to enter critical mode (°C) */
  criticalTemp: number;
  /** Temperature to unlock full power (°C) */
  coolTemp: number;
  /** Max soldiers when cool */
  maxSoldiersCool: number;
  /** Min soldiers when hot */
  minSoldiersHot: number;
  /** Check interval (ms) */
  checkInterval: number;
}

/**
 * Swarm metrics
 */
export interface SwarmMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgExecutionTime: number;
  throughput: number; // tasks/second
  activeSoldiers: number;
  queueLength: number;
  thermalState: 'cool' | 'warm' | 'hot' | 'critical';
  estimatedTemperature: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎖️ SOLDIER CLASS - Worker Unit
// ═══════════════════════════════════════════════════════════════════════════════

export class Soldier {
  public readonly id: number;
  public threadId: number;
  public status: SoldierStatus['status'] = 'idle';
  private currentTask: SoldierTask | null = null;
  private tasksCompleted: number = 0;
  private tasksFailed: number = 0;
  private totalExecutionTime: number = 0;
  private lastActive: number = Date.now();

  constructor(id: number) {
    this.id = id;
    this.threadId = id; // In real impl, would be actual thread ID
  }

  /**
   * Execute a task
   */
  // Complexity: O(1) — amortized
  async execute(task: SoldierTask): Promise<TaskResult> {
    this.status = 'busy';
    this.currentTask = task;
    this.lastActive = Date.now();

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      // Simulate task execution based on type
      const result = await this.processTask(task);

      const executionTime = Date.now() - startTime;
      this.totalExecutionTime += executionTime;
      this.tasksCompleted++;

      this.status = 'idle';
      this.currentTask = null;

      return {
        taskId: task.id,
        soldierId: this.id,
        success: true,
        result,
        executionTime,
        memoryUsed: process.memoryUsage().heapUsed - startMemory,
      };
    } catch (error) {
      this.tasksFailed++;
      this.status = 'idle';
      this.currentTask = null;

      return {
        taskId: task.id,
        soldierId: this.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        memoryUsed: process.memoryUsage().heapUsed - startMemory,
      };
    }
  }

  /**
   * Process task based on type
   */
  // Complexity: O(1) — amortized
  private async processTask(task: SoldierTask): Promise<unknown> {
    // Simulate processing delay based on task type
    const delays: Record<SoldierTaskType, number> = {
      'semantic-analysis': 150,
      'dom-inspection': 50,
      'visual-diff': 200,
      'api-validation': 100,
      'accessibility-audit': 180,
      'performance-metric': 80,
      'security-scan': 250,
      'regression-check': 120,
    };

    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise((resolve) => setTimeout(resolve, delays[task.type] || 100));

    return {
      taskType: task.type,
      processedBy: this.id,
      timestamp: Date.now(),
      payload: task.payload,
    };
  }

  /**
   * Get soldier status
   */
  // Complexity: O(1)
  getStatus(): SoldierStatus {
    return {
      id: this.id,
      threadId: this.threadId,
      status: this.status,
      currentTask: this.currentTask?.id || null,
      tasksCompleted: this.tasksCompleted,
      tasksFailed: this.tasksFailed,
      avgExecutionTime: this.tasksCompleted > 0 ? this.totalExecutionTime / this.tasksCompleted : 0,
      lastActive: this.lastActive,
    };
  }

  /**
   * Enter cooldown mode
   */
  // Complexity: O(1)
  enterCooldown(): void {
    this.status = 'cooldown';
  }

  /**
   * Resume from cooldown
   */
  // Complexity: O(1)
  resume(): void {
    if (this.status === 'cooldown') {
      this.status = 'idle';
    }
  }

  /**
   * Terminate soldier
   */
  // Complexity: O(1)
  terminate(): void {
    this.status = 'terminated';
    this.currentTask = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎖️ COMMANDER CLASS - Strategy & Coordination
// ═══════════════════════════════════════════════════════════════════════════════

export class SwarmCommander extends EventEmitter {
  private soldiers: Map<number, Soldier> = new Map();
  private taskQueue: SoldierTask[] = [];
  private activeCount: number = 0;
  private strategy: SwarmStrategy;
  private metrics: SwarmMetrics;
  private thermalMonitorInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private nextTaskId: number = 1;

  // Thermal state
  private currentTemperature: number = 50;
  private thermalState: SwarmMetrics['thermalState'] = 'cool';

  constructor(strategy?: Partial<SwarmStrategy>) {
    super();

    const cpuCount = os.cpus().length;

    this.strategy = {
      name: strategy?.name || 'Thermal-Aware Swarm',
      description: strategy?.description || 'Optimized for Ryzen 7 7435HS',
      maxConcurrency: strategy?.maxConcurrency || cpuCount,
      priorityWeights: strategy?.priorityWeights || {
        critical: 100,
        high: 75,
        normal: 50,
        low: 25,
        background: 10,
      },
      taskDistribution: strategy?.taskDistribution || 'thermal-aware',
      thermalConfig: {
        throttleTemp: 90,
        criticalTemp: 95,
        coolTemp: 70,
        maxSoldiersCool: 40,
        minSoldiersHot: 4,
        checkInterval: 2000,
        ...strategy?.thermalConfig,
      },
    };

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      avgExecutionTime: 0,
      throughput: 0,
      activeSoldiers: 0,
      queueLength: 0,
      thermalState: 'cool',
      estimatedTemperature: 50,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize the swarm
   */
  // Complexity: O(N) — linear iteration
  async initialize(): Promise<void> {
    if (this.isRunning) return;

    // Spawn initial soldiers based on thermal state
    const initialCount = this.calculateOptimalSoldierCount();

    for (let i = 0; i < initialCount; i++) {
      this.spawnSoldier();
    }

    // Start thermal monitoring
    this.startThermalMonitoring();

    this.isRunning = true;
    this.emit('initialized', { soldiers: this.soldiers.size });
  }

  /**
   * Shutdown the swarm
   */
  // Complexity: O(N) — linear iteration
  async shutdown(): Promise<void> {
    this.isRunning = false;

    // Stop thermal monitoring
    if (this.thermalMonitorInterval) {
      // Complexity: O(N) — linear iteration
      clearInterval(this.thermalMonitorInterval);
      this.thermalMonitorInterval = null;
    }

    // Terminate all soldiers
    for (const soldier of this.soldiers.values()) {
      soldier.terminate();
    }
    this.soldiers.clear();

    // Clear queue
    this.taskQueue = [];

    this.emit('shutdown');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 👥 SOLDIER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Spawn a new soldier
   */
  // Complexity: O(N) — potential recursive descent
  private spawnSoldier(): Soldier {
    const id = this.soldiers.size + 1;
    const soldier = new Soldier(id);
    this.soldiers.set(id, soldier);

    this.emit('soldier-spawned', { id, total: this.soldiers.size });
    return soldier;
  }

  /**
   * Terminate a soldier
   */
  // Complexity: O(1) — hash/map lookup
  private terminateSoldier(id: number): void {
    const soldier = this.soldiers.get(id);
    if (soldier && soldier.status === 'idle') {
      soldier.terminate();
      this.soldiers.delete(id);
      this.emit('soldier-terminated', { id, total: this.soldiers.size });
    }
  }

  /**
   * Scale soldiers based on thermal state
   */
  // Complexity: O(N*M) — nested iteration detected
  private scaleSoldiers(): void {
    const optimalCount = this.calculateOptimalSoldierCount();
    const currentCount = this.soldiers.size;

    if (optimalCount > currentCount) {
      // Scale up
      const toAdd = optimalCount - currentCount;
      for (let i = 0; i < toAdd; i++) {
        this.spawnSoldier();
      }
      this.emit('soldiers-scaled', { direction: 'up', count: toAdd, total: this.soldiers.size });
    } else if (optimalCount < currentCount) {
      // Scale down - terminate idle soldiers
      const toRemove = currentCount - optimalCount;
      let removed = 0;

      for (const [id, soldier] of this.soldiers) {
        if (removed >= toRemove) break;
        if (soldier.status === 'idle') {
          this.terminateSoldier(id);
          removed++;
        }
      }
      this.emit('soldiers-scaled', {
        direction: 'down',
        count: removed,
        total: this.soldiers.size,
      });
    }
  }

  /**
   * Calculate optimal soldier count based on thermal state
   */
  // Complexity: O(1) — amortized
  private calculateOptimalSoldierCount(): number {
    const { thermalConfig } = this.strategy;
    const temp = this.currentTemperature;

    if (temp >= thermalConfig.criticalTemp) {
      return thermalConfig.minSoldiersHot;
    }

    if (temp >= thermalConfig.throttleTemp) {
      // Linear interpolation between hot and cool
      const range = thermalConfig.throttleTemp - thermalConfig.criticalTemp;
      const position = (thermalConfig.throttleTemp - temp) / range;
      const soldierRange = thermalConfig.maxSoldiersCool - thermalConfig.minSoldiersHot;
      return Math.floor(thermalConfig.minSoldiersHot + position * soldierRange * 0.5);
    }

    if (temp <= thermalConfig.coolTemp) {
      return thermalConfig.maxSoldiersCool;
    }

    // Warm zone - partial capacity
    const range = thermalConfig.throttleTemp - thermalConfig.coolTemp;
    const position = (temp - thermalConfig.coolTemp) / range;
    const soldierRange = thermalConfig.maxSoldiersCool - thermalConfig.minSoldiersHot;
    return Math.floor(thermalConfig.maxSoldiersCool - position * soldierRange * 0.3);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌡️ THERMAL MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start thermal monitoring
   */
  // Complexity: O(1)
  private startThermalMonitoring(): void {
    this.thermalMonitorInterval = setInterval(() => {
      this.updateThermalState();
      this.scaleSoldiers();
    }, this.strategy.thermalConfig.checkInterval);
  }

  /**
   * Update thermal state (simulated based on CPU usage)
   */
  // Complexity: O(N) — linear iteration
  private updateThermalState(): void {
    // Estimate temperature based on CPU load and active workers
    const cpus = os.cpus();
    const avgUsage =
      cpus.reduce((sum, cpu) => {
        const total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle;
        const idle = cpu.times.idle;
        return sum + ((total - idle) / total) * 100;
      }, 0) / cpus.length;

    // Simulate temperature (real implementation would use actual sensors)
    const baseTemp = 45;
    const loadTemp = (avgUsage / 100) * 55; // Up to 55°C from load
    const workerTemp = (this.activeCount / 16) * 10; // Up to 10°C from workers

    this.currentTemperature = Math.min(100, baseTemp + loadTemp + workerTemp);

    // Update thermal state
    const { thermalConfig } = this.strategy;
    let newState: SwarmMetrics['thermalState'];

    if (this.currentTemperature >= thermalConfig.criticalTemp) {
      newState = 'critical';
    } else if (this.currentTemperature >= thermalConfig.throttleTemp) {
      newState = 'hot';
    } else if (this.currentTemperature > thermalConfig.coolTemp) {
      newState = 'warm';
    } else {
      newState = 'cool';
    }

    if (newState !== this.thermalState) {
      const oldState = this.thermalState;
      this.thermalState = newState;
      this.emit('thermal-state-changed', {
        from: oldState,
        to: newState,
        temperature: this.currentTemperature,
      });
    }

    // Update metrics
    this.metrics.thermalState = this.thermalState;
    this.metrics.estimatedTemperature = this.currentTemperature;
  }

  /**
   * Set temperature manually (for testing or external sensors)
   */
  // Complexity: O(1) — amortized
  setTemperature(temp: number): void {
    this.currentTemperature = temp;

    // Determine new state based on manual temperature
    const { thermalConfig } = this.strategy;
    let newState: SwarmMetrics['thermalState'];

    if (temp >= thermalConfig.criticalTemp) {
      newState = 'critical';
    } else if (temp >= thermalConfig.throttleTemp) {
      newState = 'hot';
    } else if (temp > thermalConfig.coolTemp) {
      newState = 'warm';
    } else {
      newState = 'cool';
    }

    if (newState !== this.thermalState) {
      this.thermalState = newState;
    }

    // Update metrics
    this.metrics.thermalState = this.thermalState;
    this.metrics.estimatedTemperature = this.currentTemperature;

    this.scaleSoldiers();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 TASK MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Submit a task to the swarm
   */
  // Complexity: O(1)
  async submitTask(
    type: SoldierTaskType,
    payload: unknown,
    options?: { priority?: TaskPriority; deadline?: number }
  ): Promise<string> {
    const task: SoldierTask = {
      id: `task_${this.nextTaskId++}_${Date.now()}`,
      type,
      priority: options?.priority || 'normal',
      payload,
      createdAt: Date.now(),
      deadline: options?.deadline,
      retries: 0,
      maxRetries: 3,
    };

    // Insert based on priority
    this.insertTaskByPriority(task);
    this.metrics.totalTasks++;
    this.metrics.queueLength = this.taskQueue.length;

    // Try to dispatch
    this.dispatchTasks();

    this.emit('task-submitted', { taskId: task.id, queueLength: this.taskQueue.length });
    return task.id;
  }

  /**
   * Submit multiple tasks
   */
  // Complexity: O(1)
  async submitBatch(
    tasks: Array<{ type: SoldierTaskType; payload: unknown; priority?: TaskPriority }>
  ): Promise<string[]> {
    const taskIds: string[] = [];

    for (const taskDef of tasks) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const id = await this.submitTask(taskDef.type, taskDef.payload, {
        priority: taskDef.priority,
      });
      taskIds.push(id);
    }

    return taskIds;
  }

  /**
   * Insert task by priority
   */
  // Complexity: O(N) — linear iteration
  private insertTaskByPriority(task: SoldierTask): void {
    const weight = this.strategy.priorityWeights[task.priority];

    // Find insertion point
    let insertIndex = this.taskQueue.length;
    for (let i = 0; i < this.taskQueue.length; i++) {
      const existingWeight = this.strategy.priorityWeights[this.taskQueue[i].priority];
      if (weight > existingWeight) {
        insertIndex = i;
        break;
      }
    }

    this.taskQueue.splice(insertIndex, 0, task);
  }

  /**
   * Dispatch tasks to available soldiers
   */
  // Complexity: O(N) — linear iteration
  private async dispatchTasks(): Promise<void> {
    if (!this.isRunning || this.taskQueue.length === 0) return;

    // Find idle soldiers
    for (const soldier of this.soldiers.values()) {
      if (soldier.status !== 'idle' || this.taskQueue.length === 0) continue;

      const task = this.taskQueue.shift()!;
      this.activeCount++;
      this.metrics.queueLength = this.taskQueue.length;
      this.metrics.activeSoldiers = this.activeCount;

      // Execute task
      soldier.execute(task).then((result) => {
        this.handleTaskResult(result, task);
      });
    }
  }

  /**
   * Handle task result
   */
  // Complexity: O(1) — amortized
  private handleTaskResult(result: TaskResult, task: SoldierTask): void {
    this.activeCount--;
    this.metrics.activeSoldiers = this.activeCount;

    if (result.success) {
      this.metrics.completedTasks++;
      this.updateAvgExecutionTime(result.executionTime);
      this.emit('task-completed', result);
    } else {
      // Retry logic
      if (task.retries < task.maxRetries) {
        task.retries++;
        this.insertTaskByPriority(task);
        this.emit('task-retrying', { taskId: task.id, attempt: task.retries });
      } else {
        this.metrics.failedTasks++;
        this.emit('task-failed', result);
      }
    }

    // Update throughput
    const uptime =
      (Date.now() - (this.metrics.totalTasks > 0 ? Date.now() - 60000 : Date.now())) / 1000;
    this.metrics.throughput = this.metrics.completedTasks / Math.max(1, uptime);

    // Try to dispatch more tasks
    this.dispatchTasks();
  }

  /**
   * Update average execution time
   */
  // Complexity: O(1)
  private updateAvgExecutionTime(executionTime: number): void {
    const total = this.metrics.avgExecutionTime * (this.metrics.completedTasks - 1) + executionTime;
    this.metrics.avgExecutionTime = total / this.metrics.completedTasks;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 STATUS & METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get swarm metrics
   */
  // Complexity: O(1)
  getMetrics(): SwarmMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all soldier statuses
   */
  // Complexity: O(N) — linear iteration
  getSoldierStatuses(): SoldierStatus[] {
    return Array.from(this.soldiers.values()).map((s) => s.getStatus());
  }

  /**
   * Get current strategy
   */
  // Complexity: O(1)
  getStrategy(): SwarmStrategy {
    return { ...this.strategy };
  }

  /**
   * Update thermal config
   */
  // Complexity: O(1)
  updateThermalConfig(config: Partial<ThermalConfig>): void {
    this.strategy.thermalConfig = { ...this.strategy.thermalConfig, ...config };
    this.emit('config-updated', { thermalConfig: this.strategy.thermalConfig });
  }

  /**
   * Get queue length
   */
  // Complexity: O(1)
  getQueueLength(): number {
    return this.taskQueue.length;
  }

  /**
   * Check if running
   */
  // Complexity: O(1)
  isSwarmRunning(): boolean {
    return this.isRunning;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default SwarmCommander;
