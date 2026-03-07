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
exports.AgenticOrchestrator = void 0;
const events_1 = require("events");
const planner_agent_1 = require("../agents/planner-agent");
const executor_agent_1 = require("../agents/executor-agent");
const critic_agent_1 = require("../agents/critic-agent");
const id_generator_1 = require("../utils/id-generator");
/**
 * Agentic Orchestrator
 *
 * Coordinates the swarm of agents:
 * 1. Routes messages between agents
 * 2. Manages execution flow
 * 3. Handles retries and fallbacks
 * 4. Collects metrics and stats
 */
class AgenticOrchestrator extends events_1.EventEmitter {
    /** Configuration */
    config;
    /** Planner agent */
    planner = null;
    /** Executor agents (can have multiple) */
    executors = [];
    /** Critic agent */
    critic = null;
    /** Message queue */
    messageQueue = [];
    /** Processing flag */
    isProcessing = false;
    /** Status */
    status = 'idle';
    /** Start time */
    startTime = null;
    /** Statistics */
    stats = {
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        avgExecutionTime: 0,
        distillationEntries: 0,
        activeAgents: 0,
        activeBrowsers: 0,
        successRate: 0,
        uptime: 0,
    };
    /** Task execution times for averaging */
    executionTimes = [];
    /** Active trace IDs */
    activeTraces = new Map();
    /** External message handlers (for WebSocket integration) */
    externalHandlers = new Map();
    /** Verbose logging */
    verbose;
    constructor(config) {
        super();
        this.config = {
            name: config?.name || 'QAntum-Swarm',
            agents: config?.agents || [],
            enableDistillation: config?.enableDistillation ?? true,
            distillationPath: config?.distillationPath || './fine-tuning-dataset.jsonl',
            enableTracing: config?.enableTracing ?? true,
            tracingEndpoint: config?.tracingEndpoint,
            maxParallelBrowsers: config?.maxParallelBrowsers || 4,
            enableLearning: config?.enableLearning ?? true,
            verbose: config?.verbose ?? false,
        };
        this.verbose = this.config.verbose || false;
    }
    /**
     * Initialize the orchestrator with agents
     */
    async initialize() {
        this.log('Initializing Agentic Orchestrator...');
        // Create default agents if none provided
        if (this.config.agents.length === 0) {
            this.log('Creating default agents...');
            this.createDefaultAgents();
        }
        else {
            this.createAgentsFromConfig();
        }
        // Set up internal event handlers
        this.setupEventHandlers();
        this.status = 'idle';
        this.log(`Orchestrator initialized with ${this.getAgentCount()} agents`);
        this.emit('initialized', { agents: this.getAgentCount() });
    }
    /**
     * Create default agents
     */
    createDefaultAgents() {
        // Create planner
        this.planner = new planner_agent_1.PlannerAgent({ verbose: this.verbose });
        this.log(`Created Planner: ${this.planner.id}`);
        // Create executor(s)
        const executorCount = Math.min(this.config.maxParallelBrowsers || 4, 8);
        for (let i = 0; i < executorCount; i++) {
            const executor = new executor_agent_1.ExecutorAgent({ verbose: this.verbose });
            this.executors.push(executor);
            this.log(`Created Executor ${i + 1}: ${executor.id}`);
        }
        // Create critic
        this.critic = new critic_agent_1.CriticAgent({ verbose: this.verbose });
        this.log(`Created Critic: ${this.critic.id}`);
    }
    /**
     * Create agents from configuration
     */
    createAgentsFromConfig() {
        for (const agentConfig of this.config.agents) {
            switch (agentConfig.role) {
                case 'planner':
                    this.planner = new planner_agent_1.PlannerAgent({ ...agentConfig, verbose: this.verbose });
                    break;
                case 'executor':
                    this.executors.push(new executor_agent_1.ExecutorAgent({ ...agentConfig, verbose: this.verbose }));
                    break;
                case 'critic':
                    this.critic = new critic_agent_1.CriticAgent({ ...agentConfig, verbose: this.verbose });
                    break;
            }
        }
    }
    /**
     * Set up event handlers for agents
     */
    setupEventHandlers() {
        // Forward agent events
        const forwardEvent = (agent, eventName) => {
            agent.on(eventName, (data) => {
                this.emit(`agent:${eventName}`, { agent: agent.id, ...data });
            });
        };
        if (this.planner) {
            forwardEvent(this.planner, 'planCreated');
            forwardEvent(this.planner, 'planRevised');
            forwardEvent(this.planner, 'statusChange');
        }
        for (const executor of this.executors) {
            forwardEvent(executor, 'taskStarted');
            forwardEvent(executor, 'taskCompleted');
            forwardEvent(executor, 'taskFailed');
            forwardEvent(executor, 'statusChange');
        }
        if (this.critic) {
            forwardEvent(this.critic, 'feedbackGenerated');
            forwardEvent(this.critic, 'statusChange');
        }
    }
    /**
     * Start the orchestrator
     */
    start() {
        if (this.status === 'running') {
            this.log('Orchestrator already running');
            return;
        }
        this.status = 'running';
        this.startTime = new Date();
        this.log('Orchestrator started');
        this.emit('started', { timestamp: this.startTime });
        // Start message processing loop
        this.processMessages();
    }
    /**
     * Pause the orchestrator
     */
    pause() {
        this.status = 'paused';
        this.log('Orchestrator paused');
        this.emit('paused', { timestamp: new Date() });
    }
    /**
     * Resume the orchestrator
     */
    resume() {
        if (this.status === 'paused') {
            this.status = 'running';
            this.log('Orchestrator resumed');
            this.emit('resumed', { timestamp: new Date() });
            this.processMessages();
        }
    }
    /**
     * Stop the orchestrator
     */
    async stop() {
        this.status = 'stopped';
        this.log('Orchestrator stopping...');
        // Shutdown agents
        if (this.planner)
            await this.planner.shutdown();
        for (const executor of this.executors)
            await executor.shutdown();
        if (this.critic)
            await this.critic.shutdown();
        this.emit('stopped', { timestamp: new Date(), stats: this.getStats() });
        this.log('Orchestrator stopped');
    }
    /**
     * Execute a goal through the swarm
     */
    async executeGoal(goal, context) {
        const traceId = (0, id_generator_1.generateTraceId)();
        this.log(`Executing goal [${traceId}]: ${goal}`);
        // Track active trace
        this.activeTraces.set(traceId, { startTime: new Date(), tasks: [] });
        try {
            // Step 1: Plan
            if (!this.planner) {
                throw new Error('No planner agent available');
            }
            const plan = await this.planner.createPlan(goal, context, traceId);
            this.emit('planCreated', { traceId, plan });
            // Step 2: Execute tasks
            const results = [];
            for (const task of plan.tasks) {
                // Get available executor
                const executor = this.getAvailableExecutor();
                if (!executor) {
                    throw new Error('No executor available');
                }
                // Execute task
                const result = await executor.executeTask(task);
                results.push(result);
                this.activeTraces.get(traceId)?.tasks.push(task.id);
                // Update stats
                this.updateStats(result);
                // Step 3: Critic review (if enabled)
                if (this.critic && result.success) {
                    const feedback = await this.critic.reviewResult(result, task);
                    // If rejected, try fallback
                    if (!feedback.approved && plan.fallbackPlan) {
                        this.log(`Task ${task.id} rejected, trying fallback`);
                        const fallbackTask = plan.fallbackPlan.find(t => t.type === task.type);
                        if (fallbackTask) {
                            const retryResult = await executor.executeTask(fallbackTask);
                            results.push(retryResult);
                            this.updateStats(retryResult);
                        }
                    }
                    // Emit for distillation
                    if (feedback.approved && result.confidence && result.confidence > 0.8) {
                        this.emit('successfulExecution', {
                            traceId,
                            task,
                            result,
                            reasoning: result.reasoning,
                        });
                    }
                }
                // Stop on critical failure
                if (!result.success && task.priority === 'critical') {
                    this.log(`Critical task failed, stopping execution`);
                    break;
                }
            }
            const success = results.every(r => r.success) ||
                results.filter(r => r.success).length / results.length > 0.7;
            this.activeTraces.delete(traceId);
            return { traceId, success, results, plan };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Goal execution failed: ${message}`);
            this.activeTraces.delete(traceId);
            return {
                traceId,
                success: false,
                results: [],
                plan: null,
            };
        }
    }
    /**
     * Execute a single task directly
     */
    async executeTask(task) {
        const executor = this.getAvailableExecutor();
        if (!executor) {
            return {
                taskId: task.id,
                traceId: task.traceId,
                success: false,
                error: 'No executor available',
                duration: 0,
                executedBy: 'orchestrator',
                completedAt: new Date(),
            };
        }
        const result = await executor.executeTask(task);
        this.updateStats(result);
        return result;
    }
    /**
     * Send a message to the swarm
     */
    sendMessage(message) {
        this.messageQueue.push(message);
        this.log(`Message queued: ${message.type} from ${message.from} to ${message.to}`);
        if (this.status === 'running') {
            this.processMessages();
        }
    }
    /**
     * Process message queue
     */
    async processMessages() {
        if (this.isProcessing || this.status !== 'running') {
            return;
        }
        this.isProcessing = true;
        while (this.messageQueue.length > 0 && this.status === 'running') {
            // Sort by priority
            this.messageQueue.sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            const message = this.messageQueue.shift();
            await this.routeMessage(message);
        }
        this.isProcessing = false;
    }
    /**
     * Route a message to the appropriate agent
     */
    async routeMessage(message) {
        this.log(`Routing message ${message.id} to ${message.to}`);
        // Check for external handler first
        const externalHandler = this.externalHandlers.get(message.to);
        if (externalHandler) {
            await externalHandler(message);
            return;
        }
        // Route to internal agents
        const agent = this.findAgent(message.to);
        if (agent) {
            agent.receiveMessage(message);
            const response = await agent.processNextMessage();
            if (response) {
                this.sendMessage(response);
            }
        }
        else {
            this.log(`Agent not found: ${message.to}`);
            this.emit('routingError', { message, error: 'Agent not found' });
        }
    }
    /**
     * Find an agent by ID
     */
    findAgent(agentId) {
        if (this.planner && this.planner.id === agentId) {
            return this.planner;
        }
        if (this.critic && this.critic.id === agentId) {
            return this.critic;
        }
        const executor = this.executors.find(e => e.id === agentId);
        if (executor) {
            return executor;
        }
        return null;
    }
    /**
     * Get an available executor
     */
    getAvailableExecutor() {
        for (const executor of this.executors) {
            if (executor.getStatus() === 'idle') {
                return executor;
            }
        }
        // If all busy, return first one (will queue)
        return this.executors[0] || null;
    }
    /**
     * Register external message handler (for WebSocket)
     */
    registerExternalHandler(agentId, handler) {
        this.externalHandlers.set(agentId, handler);
        this.log(`Registered external handler for: ${agentId}`);
    }
    /**
     * Unregister external handler
     */
    unregisterExternalHandler(agentId) {
        this.externalHandlers.delete(agentId);
    }
    /**
     * Set browser page for executors
     */
    setPage(page) {
        for (const executor of this.executors) {
            executor.setPage(page);
        }
        this.log('Browser page set for all executors');
    }
    /**
     * Update statistics
     */
    updateStats(result) {
        this.stats.totalTasks++;
        if (result.success) {
            this.stats.successfulTasks++;
        }
        else {
            this.stats.failedTasks++;
        }
        this.executionTimes.push(result.duration);
        if (this.executionTimes.length > 1000) {
            this.executionTimes.shift();
        }
        this.stats.avgExecutionTime =
            this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
        this.stats.successRate =
            this.stats.totalTasks > 0
                ? this.stats.successfulTasks / this.stats.totalTasks
                : 0;
        this.stats.activeAgents = this.getActiveAgentCount();
    }
    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
            activeAgents: this.getActiveAgentCount(),
        };
    }
    /**
     * Get agent count
     */
    getAgentCount() {
        let count = 0;
        if (this.planner)
            count++;
        count += this.executors.length;
        if (this.critic)
            count++;
        return count;
    }
    /**
     * Get active agent count
     */
    getActiveAgentCount() {
        let count = 0;
        if (this.planner && this.planner.getStatus() === 'working')
            count++;
        count += this.executors.filter(e => e.getStatus() === 'working').length;
        if (this.critic && this.critic.getStatus() === 'working')
            count++;
        return count;
    }
    /**
     * Get orchestrator status
     */
    getStatus() {
        return this.status;
    }
    /**
     * Get planner agent
     */
    getPlanner() {
        return this.planner;
    }
    /**
     * Get executor agents
     */
    getExecutors() {
        return [...this.executors];
    }
    /**
     * Get critic agent
     */
    getCritic() {
        return this.critic;
    }
    /**
     * Log if verbose
     */
    log(message, ...args) {
        if (this.verbose) {
            console.log(`[Orchestrator] ${message}`, ...args);
        }
    }
    /**
     * Increment distillation entry count
     */
    incrementDistillationCount() {
        this.stats.distillationEntries++;
    }
}
exports.AgenticOrchestrator = AgenticOrchestrator;
exports.default = AgenticOrchestrator;
