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
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerAgent = void 0;
const base_agent_1 = require("../modules/GAMMA_INFRA/core/ears/energy/base-agent");
const id_generator_1 = require("../utils/id-generator");
/**
 * Planner Agent - Strategic Planning
 *
 * Responsibilities:
 * - Break down high-level goals into executable tasks
 * - Create execution plans with dependencies
 * - Design fallback strategies
 * - Optimize task ordering
 */
class PlannerAgent extends base_agent_1.BaseAgent {
    /** Planning history for context */
    planHistory = [];
    /** Max plans to keep in history */
    maxHistorySize = 100;
    constructor(config) {
        super({ ...config, role: 'planner' });
    }
    /**
     * Handle incoming message
     */
    // Complexity: O(1) — amortized
    async handleMessage(message) {
        switch (message.type) {
            case 'task':
                // Planning request
                // SAFETY: async operation — wrap in try-catch for production resilience
                const plan = await this.createPlan(message.payload.goal, message.payload.context, message.traceId);
                return this.createMessage(message.from, 'result', { plan }, message.traceId, message.spanId, 'high');
            case 'feedback':
                // Critic feedback - revise plan
                // SAFETY: async operation — wrap in try-catch for production resilience
                const revisedPlan = await this.revisePlan(message.payload.planId, message.payload.feedback, message.traceId);
                return this.createMessage(message.from, 'result', { plan: revisedPlan }, message.traceId, message.spanId, 'high');
            default:
                return null;
        }
    }
    /**
     * Execute a task (planners don't execute directly)
     */
    // Complexity: O(1)
    async executeTask(task) {
        const startTime = Date.now();
        return {
            taskId: task.id,
            traceId: task.traceId,
            success: false,
            error: 'Planner agents do not execute tasks directly',
            duration: Date.now() - startTime,
            executedBy: this.id,
            completedAt: new Date(),
        };
    }
    /**
     * Create an execution plan from a high-level goal
     */
    // Complexity: O(N)
    async createPlan(goal, context, traceId) {
        const planTraceId = traceId || (0, id_generator_1.generateTraceId)();
        this.log(`Creating plan for goal: ${goal}`);
        // Analyze the goal and break it down
        const tasks = this.decomposeGoal(goal, context, planTraceId);
        const dependencies = this.calculateDependencies(tasks);
        const fallbackPlan = this.createFallbackPlan(tasks, planTraceId);
        const plan = {
            id: (0, id_generator_1.generatePlanId)(),
            traceId: planTraceId,
            goal,
            tasks,
            estimatedDuration: this.estimateDuration(tasks),
            dependencies,
            fallbackPlan,
            createdAt: new Date(),
        };
        // Store in history
        this.planHistory.push(plan);
        if (this.planHistory.length > this.maxHistorySize) {
            this.planHistory.shift();
        }
        this.emit('planCreated', plan);
        this.log(`Plan created with ${tasks.length} tasks`);
        return plan;
    }
    /**
     * Revise a plan based on feedback
     */
    // Complexity: O(N) — linear iteration
    async revisePlan(planId, feedback, traceId) {
        const originalPlan = this.planHistory.find((p) => p.id === planId);
        if (!originalPlan) {
            this.log(`Plan not found: ${planId}`);
            return null;
        }
        this.log(`Revising plan ${planId} based on feedback`);
        // Create revised plan
        const revisedTasks = this.reviseTasks(originalPlan.tasks, feedback, traceId || originalPlan.traceId);
        const revisedPlan = {
            id: (0, id_generator_1.generatePlanId)(),
            traceId: traceId || originalPlan.traceId,
            goal: originalPlan.goal,
            tasks: revisedTasks,
            estimatedDuration: this.estimateDuration(revisedTasks),
            dependencies: this.calculateDependencies(revisedTasks),
            fallbackPlan: this.createFallbackPlan(revisedTasks, traceId || originalPlan.traceId),
            createdAt: new Date(),
        };
        this.planHistory.push(revisedPlan);
        this.emit('planRevised', { original: planId, revised: revisedPlan.id });
        return revisedPlan;
    }
    /**
     * Decompose a goal into tasks
     */
    // Complexity: O(N)
    decomposeGoal(goal, context, traceId) {
        const tasks = [];
        const goalLower = goal.toLowerCase();
        const tid = traceId || (0, id_generator_1.generateTraceId)();
        // Pattern matching for common goals
        if (goalLower.includes('login') || goalLower.includes('authenticate')) {
            tasks.push(this.createTask('navigate', context?.url || 'login page', { action: 'navigate' }, tid, 'high'), this.createTask('fill', 'username field', { field: 'username', value: context?.username }, tid), this.createTask('fill', 'password field', { field: 'password', value: context?.password }, tid), this.createTask('click', 'login button', { action: 'submit' }, tid), this.createTask('validate', 'success indicator', { expected: 'logged in' }, tid));
        }
        else if (goalLower.includes('extract') || goalLower.includes('scrape')) {
            tasks.push(this.createTask('navigate', context?.url || 'target page', { action: 'navigate' }, tid, 'high'), this.createTask('extract', context?.selector || 'data elements', { format: context?.format || 'json' }, tid));
        }
        else if (goalLower.includes('fill') && goalLower.includes('form')) {
            tasks.push(this.createTask('navigate', context?.url || 'form page', { action: 'navigate' }, tid, 'high'), ...this.createFormTasks(context?.fields || {}, tid), this.createTask('click', 'submit button', { action: 'submit' }, tid), this.createTask('validate', 'form submission', { expected: 'success' }, tid));
        }
        else if (goalLower.includes('test') || goalLower.includes('verify')) {
            tasks.push(this.createTask('navigate', context?.url || 'test page', { action: 'navigate' }, tid, 'high'), this.createTask('validate', 'page elements', { checks: context?.checks || [] }, tid));
        }
        else {
            // Generic task decomposition
            tasks.push(this.createTask('custom', goal, { context }, tid));
        }
        return tasks;
    }
    /**
     * Create form filling tasks
     */
    // Complexity: O(N) — linear iteration
    createFormTasks(fields, traceId) {
        return Object.entries(fields).map(([field, value]) => this.createTask('fill', field, { field, value }, traceId));
    }
    /**
     * Create a task
     */
    // Complexity: O(1)
    createTask(type, target, params, traceId, priority = 'normal') {
        return {
            id: (0, id_generator_1.generateTaskId)(),
            traceId,
            type,
            target,
            params,
            priority,
            createdAt: new Date(),
        };
    }
    /**
     * Calculate task dependencies
     */
    // Complexity: O(N) — linear iteration
    calculateDependencies(tasks) {
        const dependencies = {};
        for (let i = 1; i < tasks.length; i++) {
            const task = tasks[i];
            const prevTask = tasks[i - 1];
            // By default, each task depends on the previous one
            dependencies[task.id] = [prevTask.id];
            // Navigation must complete before other actions
            if (prevTask.type === 'navigate') {
                dependencies[task.id] = [prevTask.id];
            }
        }
        return dependencies;
    }
    /**
     * Create fallback plan
     */
    // Complexity: O(N) — linear iteration
    createFallbackPlan(tasks, traceId) {
        // Simplified fallback - retry with different strategies
        return tasks.map((task) => ({
            ...task,
            id: (0, id_generator_1.generateTaskId)(),
            params: {
                ...task.params,
                fallback: true,
                alternativeStrategy: true,
            },
            retries: 3,
        }));
    }
    /**
     * Estimate total duration for tasks
     */
    // Complexity: O(N) — linear iteration
    estimateDuration(tasks) {
        const estimates = {
            navigate: 2000,
            click: 500,
            fill: 300,
            extract: 1000,
            validate: 500,
            custom: 2000,
        };
        return tasks.reduce((total, task) => total + (estimates[task.type] || 1000), 0);
    }
    /**
     * Revise tasks based on feedback
     */
    // Complexity: O(N) — linear iteration
    reviseTasks(originalTasks, feedback, traceId) {
        // Simple revision - add retry and alternative strategies
        return originalTasks.map((task) => ({
            ...task,
            id: (0, id_generator_1.generateTaskId)(),
            traceId,
            params: {
                ...task.params,
                revised: true,
                feedbackApplied: feedback,
            },
            retries: (task.retries || 0) + 1,
            createdAt: new Date(),
        }));
    }
    /**
     * Get planning history
     */
    // Complexity: O(1)
    getPlanHistory() {
        return [...this.planHistory];
    }
    /**
     * Get specific plan
     */
    // Complexity: O(N) — linear iteration
    getPlan(planId) {
        return this.planHistory.find((p) => p.id === planId);
    }
}
exports.PlannerAgent = PlannerAgent;
exports.default = PlannerAgent;
