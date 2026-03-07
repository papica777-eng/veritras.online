/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   AETERNA DISTRIBUTED RUNNER                                                   ║
 * ║   "Run tests across multiple nodes"                                           ║
 * ║                                                                               ║
 * ║   TODO B #14 - Performance: Distributed Execution                             ║
 * ║                                                                               ║
 * ║   © 2025-2026 Aeterna | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkerNode {
  id: string;
  name: string;
  host: string;
  port: number;
  status: NodeStatus;
  capabilities: NodeCapabilities;
  currentLoad: number;
  maxLoad: number;
  lastHeartbeat: number;
  metadata?: Record<string, any>;
}

export type NodeStatus = 'idle' | 'busy' | 'offline' | 'draining';

export interface NodeCapabilities {
  browsers: string[];
  os: string;
  memory: number;
  cpuCores: number;
  tags: string[];
}

export interface DistributedTask {
  id: string;
  testId: string;
  testName: string;
  nodeId?: string;
  status: TaskStatus;
  priority: number;
  requirements?: TaskRequirements;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: TaskResult;
}

export type TaskStatus = 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TaskRequirements {
  browsers?: string[];
  os?: string[];
  minMemory?: number;
  tags?: string[];
}

export interface TaskResult {
  success: boolean;
  duration: number;
  error?: string;
  artifacts?: string[];
  metrics?: Record<string, number>;
}

export type DistributionStrategy =
  | 'round-robin'
  | 'least-loaded'
  | 'capability-match'
  | 'affinity'
  | 'random';

export interface DistributedConfig {
  maxRetries: number;
  taskTimeout: number;
  heartbeatInterval: number;
  strategy: DistributionStrategy;
  rebalanceOnFailure: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISTRIBUTED RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

export class DistributedRunner {
  private static instance: DistributedRunner;

  private nodes: Map<string, WorkerNode> = new Map();
  private tasks: Map<string, DistributedTask> = new Map();
  private taskQueue: DistributedTask[] = [];
  private affinityMap: Map<string, string> = new Map();

  private config: DistributedConfig = {
    maxRetries: 3,
    taskTimeout: 300000, // 5 minutes
    heartbeatInterval: 10000,
    strategy: 'least-loaded',
    rebalanceOnFailure: true,
  };

  private running: boolean = false;
  private heartbeatTimer?: NodeJS.Timeout;

  static getInstance(): DistributedRunner {
    if (!DistributedRunner.instance) {
      DistributedRunner.instance = new DistributedRunner();
    }
    return DistributedRunner.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Configure the runner
   */
  // Complexity: O(1)
  configure(config: Partial<DistributedConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  // Complexity: O(1)
  getConfig(): DistributedConfig {
    return { ...this.config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NODE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register a worker node
   */
  // Complexity: O(1) — lookup
  registerNode(name: string, host: string, port: number, capabilities: NodeCapabilities): string {
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const node: WorkerNode = {
      id,
      name,
      host,
      port,
      status: 'idle',
      capabilities,
      currentLoad: 0,
      maxLoad: capabilities.cpuCores * 2,
      lastHeartbeat: Date.now(),
    };

    this.nodes.set(id, node);
    console.log(`[Distributed] Node registered: ${name} (${host}:${port})`);

    return id;
  }

  /**
   * Unregister a node
   */
  // Complexity: O(N) — linear scan
  unregisterNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Mark node as draining
    node.status = 'draining';

    // Reassign pending tasks
    const nodeTasks = [...this.tasks.values()].filter(
      (t) => t.nodeId === nodeId && t.status === 'assigned'
    );

    for (const task of nodeTasks) {
      task.nodeId = undefined;
      task.status = 'pending';
      this.taskQueue.unshift(task);
    }

    this.nodes.delete(nodeId);
    console.log(`[Distributed] Node unregistered: ${node.name}`);

    return true;
  }

  /**
   * Update node heartbeat
   */
  // Complexity: O(1) — lookup
  heartbeat(nodeId: string, load?: number): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    node.lastHeartbeat = Date.now();
    if (load !== undefined) {
      node.currentLoad = load;
    }

    return true;
  }

  /**
   * Get node by ID
   */
  // Complexity: O(1) — lookup
  getNode(nodeId: string): WorkerNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  // Complexity: O(1)
  getAllNodes(): WorkerNode[] {
    return [...this.nodes.values()];
  }

  /**
   * Get available nodes
   */
  // Complexity: O(N) — linear scan
  getAvailableNodes(): WorkerNode[] {
    return [...this.nodes.values()].filter((n) => n.status === 'idle' && n.currentLoad < n.maxLoad);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TASK MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Submit a task
   */
  // Complexity: O(1)
  submitTask(
    testId: string,
    testName: string,
    options?: {
      priority?: number;
      requirements?: TaskRequirements;
    }
  ): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const task: DistributedTask = {
      id,
      testId,
      testName,
      status: 'pending',
      priority: options?.priority ?? 5,
      requirements: options?.requirements,
      createdAt: Date.now(),
    };

    this.tasks.set(id, task);
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    if (this.running) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Submit multiple tasks
   */
  // Complexity: O(N) — linear scan
  submitBatch(tests: Array<{ testId: string; testName: string; priority?: number }>): string[] {
    return tests.map((test) =>
      this.submitTask(test.testId, test.testName, {
        priority: test.priority,
      })
    );
  }

  /**
   * Cancel a task
   */
  // Complexity: O(N) — linear scan
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    if (task.status === 'pending') {
      task.status = 'cancelled';
      this.taskQueue = this.taskQueue.filter((t) => t.id !== taskId);
      return true;
    }

    if (task.status === 'assigned' || task.status === 'running') {
      task.status = 'cancelled';
      // Node will handle cancellation on next heartbeat
      return true;
    }

    return false;
  }

  /**
   * Get task by ID
   */
  // Complexity: O(1) — lookup
  getTask(taskId: string): DistributedTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get tasks by status
   */
  // Complexity: O(N) — linear scan
  getTasksByStatus(status: TaskStatus): DistributedTask[] {
    return [...this.tasks.values()].filter((t) => t.status === status);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TASK COMPLETION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mark task as started
   */
  // Complexity: O(1) — lookup
  taskStarted(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'assigned') {
      task.status = 'running';
      task.startedAt = Date.now();
    }
  }

  /**
   * Mark task as completed
   */
  // Complexity: O(1) — lookup
  taskCompleted(taskId: string, result: TaskResult): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.completedAt = Date.now();
    task.result = result;

    // Update node load
    if (task.nodeId) {
      const node = this.nodes.get(task.nodeId);
      if (node) {
        node.currentLoad = Math.max(0, node.currentLoad - 1);
      }
    }

    this.processQueue();
  }

  /**
   * Mark task as failed
   */
  // Complexity: O(1) — lookup
  taskFailed(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'failed';
    task.completedAt = Date.now();
    task.result = {
      success: false,
      duration: task.completedAt - (task.startedAt || task.createdAt),
      error,
    };

    // Update node load
    if (task.nodeId) {
      const node = this.nodes.get(task.nodeId);
      if (node) {
        node.currentLoad = Math.max(0, node.currentLoad - 1);
      }
    }

    // Rebalance if configured
    if (this.config.rebalanceOnFailure) {
      // Could requeue task here
    }

    this.processQueue();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXECUTION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Start the distributed runner
   */
  // Complexity: O(1)
  start(): void {
    if (this.running) return;
    this.running = true;

    // Start heartbeat monitoring
    this.heartbeatTimer = setInterval(() => {
      this.checkHeartbeats();
    }, this.config.heartbeatInterval);

    this.processQueue();
    console.log('[Distributed] Runner started');
  }

  /**
   * Stop the runner
   */
  // Complexity: O(1)
  stop(): void {
    this.running = false;

    if (this.heartbeatTimer) {
      // Complexity: O(1)
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    console.log('[Distributed] Runner stopped');
  }

  /**
   * Check if running
   */
  // Complexity: O(1)
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Wait for all tasks to complete
   */
  // Complexity: O(N*M) — nested iteration
  async waitForCompletion(timeout?: number): Promise<void> {
    const startTime = Date.now();

    while (this.running) {
      const pending = this.getTasksByStatus('pending');
      const assigned = this.getTasksByStatus('assigned');
      const running = this.getTasksByStatus('running');

      if (pending.length === 0 && assigned.length === 0 && running.length === 0) {
        return;
      }

      if (timeout && Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for task completion');
      }

      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATISTICS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get execution statistics
   */
  // Complexity: O(N) — linear scan
  getStatistics(): {
    nodes: { total: number; active: number; idle: number };
    tasks: { total: number; pending: number; running: number; completed: number; failed: number };
    avgDuration: number;
    throughput: number;
  } {
    const nodeStats = {
      total: this.nodes.size,
      active: [...this.nodes.values()].filter((n) => n.status === 'busy').length,
      idle: [...this.nodes.values()].filter((n) => n.status === 'idle').length,
    };

    const tasks = [...this.tasks.values()];
    const taskStats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      running: tasks.filter((t) => t.status === 'running').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    };

    const completedTasks = tasks.filter((t) => t.status === 'completed' && t.result);
    const avgDuration =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => sum + (t.result?.duration || 0), 0) /
          completedTasks.length
        : 0;

    // Calculate throughput (tasks per minute)
    const recentTasks = completedTasks.filter(
      (t) => t.completedAt && Date.now() - t.completedAt < 60000
    );
    const throughput = recentTasks.length;

    return {
      nodes: nodeStats,
      tasks: taskStats,
      avgDuration,
      throughput,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — loop
  private processQueue(): void {
    if (!this.running) return;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue[0];
      const node = this.selectNode(task);

      if (!node) break;

      // Assign task to node
      this.taskQueue.shift();
      task.nodeId = node.id;
      task.status = 'assigned';
      node.currentLoad++;
      node.status = node.currentLoad >= node.maxLoad ? 'busy' : 'idle';

      console.log(`[Distributed] Task ${task.id} assigned to node ${node.name}`);
    }
  }

  // Complexity: O(N log N) — sort
  private selectNode(task: DistributedTask): WorkerNode | null {
    const available = this.getAvailableNodes().filter((node) =>
      this.nodeMatchesRequirements(node, task.requirements)
    );

    if (available.length === 0) return null;

    switch (this.config.strategy) {
      case 'round-robin':
        return available[0];

      case 'least-loaded':
        return available.sort((a, b) => a.currentLoad / a.maxLoad - b.currentLoad / b.maxLoad)[0];

      case 'capability-match':
        return this.selectByCapability(available, task);

      case 'affinity':
        return this.selectByAffinity(available, task);

      case 'random':
        return available[Math.floor(Math.random() * available.length)];

      default:
        return available[0];
    }
  }

  // Complexity: O(1)
  private nodeMatchesRequirements(node: WorkerNode, requirements?: TaskRequirements): boolean {
    if (!requirements) return true;

    if (requirements.browsers?.length) {
      const hasAllBrowsers = requirements.browsers.every((b) =>
        node.capabilities.browsers.includes(b)
      );
      if (!hasAllBrowsers) return false;
    }

    if (requirements.os?.length) {
      if (!requirements.os.includes(node.capabilities.os)) return false;
    }

    if (requirements.minMemory) {
      if (node.capabilities.memory < requirements.minMemory) return false;
    }

    if (requirements.tags?.length) {
      const hasAllTags = requirements.tags.every((t) => node.capabilities.tags.includes(t));
      if (!hasAllTags) return false;
    }

    return true;
  }

  // Complexity: O(N log N) — sort
  private selectByCapability(nodes: WorkerNode[], task: DistributedTask): WorkerNode {
    // Score nodes by capability match
    return nodes.sort((a, b) => {
      const scoreA = a.capabilities.memory + a.capabilities.cpuCores * 1000;
      const scoreB = b.capabilities.memory + b.capabilities.cpuCores * 1000;
      return scoreB - scoreA;
    })[0];
  }

  // Complexity: O(N log N) — sort
  private selectByAffinity(nodes: WorkerNode[], task: DistributedTask): WorkerNode {
    const affinityNode = this.affinityMap.get(task.testId);
    if (affinityNode) {
      const node = nodes.find((n) => n.id === affinityNode);
      if (node) return node;
    }

    // Select node and record affinity
    const selected = nodes.sort((a, b) => a.currentLoad - b.currentLoad)[0];
    this.affinityMap.set(task.testId, selected.id);
    return selected;
  }

  // Complexity: O(N*M) — nested iteration
  private checkHeartbeats(): void {
    const now = Date.now();
    const timeout = this.config.heartbeatInterval * 3;

    for (const node of this.nodes.values()) {
      if (now - node.lastHeartbeat > timeout) {
        console.log(`[Distributed] Node ${node.name} heartbeat timeout`);
        node.status = 'offline';

        // Reassign tasks
        const nodeTasks = [...this.tasks.values()].filter(
          (t) => t.nodeId === node.id && (t.status === 'assigned' || t.status === 'running')
        );

        for (const task of nodeTasks) {
          task.nodeId = undefined;
          task.status = 'pending';
          this.taskQueue.unshift(task);
        }
      }
    }

    this.processQueue();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getDistributedRunner = (): DistributedRunner => DistributedRunner.getInstance();

export default DistributedRunner;
