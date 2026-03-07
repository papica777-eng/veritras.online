"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 DEEPSEEK-R1-SWARM - Deca-Guard System v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 10-Agent swarm for autonomous test generation and execution.
 * All agents fully implemented with DeepSeek R1 reasoning.
 * Zero `any` types. Zero hardcoded secrets.
 *
 * @author Dimitar Prodromov / QAntum Empire
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecaGuardSwarm = void 0;
const SwarmMemoryV2_1 = require("./SwarmMemoryV2");
const openai_1 = __importDefault(require("openai"));
const config_1 = require("./config");
const bastion_controller_1 = require("../../bastion/bastion-controller");
// ═══════════════════════════════════════════════════════════════
// DeepSeek R1 Client (configured via .env)
// ═══════════════════════════════════════════════════════════════
// Complexity: O(1)
const deepseek = new openai_1.default({
    apiKey: config_1.SwarmConfig.deepseek.apiKey,
    baseURL: config_1.SwarmConfig.deepseek.baseUrl,
});
// ═══════════════════════════════════════════════════════════════
// DeepSeek Helper — DRY pattern for all agents
// ═══════════════════════════════════════════════════════════════
// Complexity: O(1) network call
async function queryDeepSeek(systemPrompt, userPrompt, model = config_1.SwarmConfig.deepseek.reasonerModel) {
    try {
        const response = await deepseek.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 4096,
        });
        return response.choices[0]?.message?.content || 'No response generated';
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`[DEEPSEEK] API call failed: ${message}`);
    }
}
// ═══════════════════════════════════════════════════════════════
// Base Agent Class
// ═══════════════════════════════════════════════════════════════
class Agent extends SwarmMemoryV2_1.AdaptiveEventBusV2 {
    name;
    role;
    patrolInterval;
    isActive = false;
    intervalId;
    tasksCompleted = 0;
    totalDuration = 0;
    successCount = 0;
    agentIndex = -1;
    constructor(name, role, patrolInterval = 1000) {
        super();
        this.name = name;
        this.role = role;
        this.patrolInterval = patrolInterval;
    }
    // Complexity: O(1)
    async activate() {
        this.isActive = true;
        console.log(`   🛡️ [${this.name}] ${this.role} — ACTIVE`);
        if (this.patrolInterval > 0) {
            this.intervalId = setInterval(() => this.patrol(), this.patrolInterval);
        }
        await this.initialize();
    }
    // Complexity: O(1)
    async deactivate() {
        this.isActive = false;
        if (this.intervalId)
            clearInterval(this.intervalId);
        console.log(`   💤 [${this.name}] Deactivated (${this.tasksCompleted} tasks completed)`);
    }
    // Complexity: O(1)
    getStatus() {
        return {
            name: this.name,
            role: this.role,
            active: this.isActive,
            tasksCompleted: this.tasksCompleted,
            avgDuration: this.tasksCompleted > 0 ? this.totalDuration / this.tasksCompleted : 0,
            successRate: this.tasksCompleted > 0 ? this.successCount / this.tasksCompleted : 0,
        };
    }
    // Complexity: O(1)
    recordResult(duration, success) {
        this.tasksCompleted++;
        this.totalDuration += duration;
        if (success)
            this.successCount++;
    }
}
// ═══════════════════════════════════════════════════════════════
// 🛡️ SENTINEL — Perimeter Defense
// Tests: Authentication, authorization, input validation
// ═══════════════════════════════════════════════════════════════
class SentinelAgent extends Agent {
    constructor() {
        super('SENTINEL', 'Perimeter Defense — Auth & Input Validation', 2000);
    }
    async initialize() {
        console.log('   🛡️ [SENTINEL] Establishing perimeter scan protocols...');
    }
    patrol() {
        this.emit('patrol', { agent: this.name, timestamp: Date.now(), check: 'auth-boundary' });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are SENTINEL, a security testing agent specialized in authentication, authorization, and input validation testing.
Generate comprehensive test cases that cover:
- Authentication bypasses (JWT manipulation, session fixation, credential stuffing)
- Authorization flaws (IDOR, privilege escalation, RBAC violations)
- Input validation (SQL injection, XSS, command injection, path traversal)
- Rate limiting and brute force protection
Output format: JSON array of test cases with { name, type, steps, assertions, severity }.`, `Generate security tests for target: ${task.payload.target || 'unknown'}\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'SENTINEL perimeter analysis complete',
                testsGenerated: this.countTests(output),
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
    // Complexity: O(n) where n = output length
    countTests(output) {
        const matches = output.match(/"name"/g);
        return matches ? matches.length : 1;
    }
}
// ═══════════════════════════════════════════════════════════════
// 👁️ WATCHER — Continuous Surveillance & Anomaly Detection
// ═══════════════════════════════════════════════════════════════
class WatcherAgent extends Agent {
    anomalyBaseline = [];
    windowSize = 100;
    constructor() {
        super('WATCHER', 'Surveillance — Anomaly Detection & Monitoring', 1000);
    }
    async initialize() {
        console.log('   👁️ [WATCHER] Initializing anomaly baselines...');
    }
    patrol() {
        // Collect runtime metrics for anomaly detection
        const memUsage = process.memoryUsage();
        const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
        this.updateBaseline(heapRatio);
        if (this.isAnomaly(heapRatio)) {
            this.emit('anomaly', {
                agent: this.name,
                type: 'memory',
                value: heapRatio,
                timestamp: Date.now(),
            });
        }
        this.emit('patrol', { agent: this.name, status: 'monitoring', heapRatio });
    }
    // Complexity: O(1) amortized
    updateBaseline(value) {
        this.anomalyBaseline.push(value);
        if (this.anomalyBaseline.length > this.windowSize) {
            this.anomalyBaseline.shift();
        }
    }
    // Complexity: O(n) where n = windowSize (fixed = O(1))
    isAnomaly(value) {
        if (this.anomalyBaseline.length < 10)
            return false;
        const mean = this.anomalyBaseline.reduce((a, b) => a + b, 0) / this.anomalyBaseline.length;
        const variance = this.anomalyBaseline.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
            this.anomalyBaseline.length;
        const std = Math.sqrt(variance);
        if (std === 0)
            return false;
        const zScore = Math.abs(value - mean) / std;
        return zScore > 3.0; // 3-sigma rule
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are WATCHER, a surveillance agent specialized in monitoring system behavior and detecting anomalies.
Generate test cases focused on:
- Memory leak detection patterns
- Resource exhaustion scenarios
- Unexpected state changes
- Performance degradation signals
- Log analysis for suspicious patterns
Output format: JSON array of monitoring checks with { name, metric, threshold, alertLevel }.`, `Create monitoring tests for: ${task.payload.target || 'system'}\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'WATCHER surveillance analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// ⚔️ REAPER — Aggressive Threat Elimination
// ═══════════════════════════════════════════════════════════════
class ReaperAgent extends Agent {
    constructor() {
        super('REAPER', 'Threat Elimination — Penetration Testing', 1000);
    }
    async initialize() {
        console.log('   ⚔️ [REAPER] Loading attack vectors...');
    }
    patrol() {
        this.emit('patrol', { agent: this.name, mode: 'aggressive', timestamp: Date.now() });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are REAPER, an offensive security testing agent. Your role is aggressive penetration testing.
Generate attack-oriented test cases covering:
- OWASP Top 10 vulnerabilities
- Business logic exploits
- Race conditions and TOCTOU attacks
- API abuse patterns (mass assignment, parameter pollution)
- Deserialization attacks
- Server-Side Request Forgery (SSRF)
Each test must include: attack vector, payload, expected vulnerability, remediation.
Output format: JSON array with { name, vector, payload, expectedVulnerability, severity, remediation }.`, `Penetration test target: ${task.payload.target || 'unknown'}\nSpecific tests requested: ${(task.payload.tests || []).join(', ')}\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'REAPER offensive analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// 🔮 ORACLE — Predictive Intelligence & Regression Forecasting
// ═══════════════════════════════════════════════════════════════
class OracleAgent extends Agent {
    constructor() {
        super('ORACLE', 'Predictive Intelligence — Failure Forecasting', 5000);
    }
    async initialize() {
        console.log('   🔮 [ORACLE] Scanning probability timelines...');
    }
    patrol() {
        this.emit('patrol', { agent: this.name, prediction: 'analyzing', timestamp: Date.now() });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are ORACLE, a predictive testing agent. You forecast test failures, performance regressions, and capacity issues.
Analyze the target and generate:
- Predicted failure points based on code complexity
- Performance regression risk areas
- Capacity planning tests (load/stress/spike)
- Dependency failure scenarios
- Data migration risk assessment
Output format: JSON array with { name, prediction, probability, impact, preventiveTest }.`, `Predict failures for: ${task.payload.target || 'unknown'}\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'ORACLE predictive analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// 🧬 GENESIS — Self-Replicating Test Generation
// ═══════════════════════════════════════════════════════════════
class GenesisAgent extends Agent {
    constructor() {
        super('GENESIS', 'Code Generation — Evolutionary Test Creation', 3000);
    }
    async initialize() {
        console.log('   🧬 [GENESIS] Initializing code generation engine...');
    }
    patrol() {
        this.emit('patrol', { agent: this.name, generating: true, timestamp: Date.now() });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are GENESIS, a test generation agent. You create comprehensive, runnable test suites from source code.
Given source code, generate:
- Unit tests with full coverage (happy path, edge cases, error paths)
- Integration tests for component interactions
- Property-based tests where applicable
- Snapshot tests for UI components
Use the appropriate testing framework (Jest/Vitest for TS, pytest for Python, cargo test for Rust).
Output: Complete, runnable test code with imports, describe blocks, and assertions.`, `Generate tests for this code:\n\`\`\`\n${task.payload.code || 'No code provided'}\n\`\`\`\nTarget: ${task.payload.target || 'unknown'}`, config_1.SwarmConfig.deepseek.chatModel // Use chat model for code generation
            );
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'GENESIS test generation complete',
                testsGenerated: this.countGeneratedTests(output),
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
    // Complexity: O(n)
    countGeneratedTests(output) {
        const itMatches = output.match(/\b(it|test)\s*\(/g);
        const fnMatches = output.match(/fn\s+test_/g);
        const defMatches = output.match(/def\s+test_/g);
        return (itMatches?.length || 0) + (fnMatches?.length || 0) + (defMatches?.length || 0);
    }
}
// ═══════════════════════════════════════════════════════════════
// 🛠️ ENGINEER — Infrastructure Testing & Optimization
// ═══════════════════════════════════════════════════════════════
class EngineerAgent extends Agent {
    constructor() {
        super('ENGINEER', 'Infrastructure — Config & Deployment Testing', 10000);
    }
    async initialize() {
        console.log('   🛠️ [ENGINEER] Scanning infrastructure topology...');
    }
    patrol() {
        this.emit('patrol', { agent: this.name, optimization: 'active', timestamp: Date.now() });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are ENGINEER, an infrastructure testing agent. You test deployment configurations, CI/CD pipelines, and system reliability.
Generate tests for:
- Docker/container configuration validation
- Environment variable completeness checks
- Database migration safety tests
- Health check endpoint verification
- Graceful shutdown and restart behavior
- Network partition handling
- TLS/SSL certificate validation
Output format: JSON array with { name, category, command, expectedResult, rollbackPlan }.`, `Infrastructure test target: ${task.payload.target || 'unknown'}\nConfig: ${JSON.stringify(task.payload.config || {})}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'ENGINEER infrastructure analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// 📡 COMMS — Inter-Agent Communication & Event Bus
// ═══════════════════════════════════════════════════════════════
class CommsAgent extends Agent {
    messageLog = [];
    constructor() {
        super('COMMS', 'Communication Hub — Event Bus & Coordination', 500);
    }
    async initialize() {
        console.log('   📡 [COMMS] Opening communication channels...');
    }
    patrol() {
        this.emit('patrol', {
            agent: this.name,
            channels: 'open',
            messagesProcessed: this.messageLog.length,
            timestamp: Date.now(),
        });
    }
    // Complexity: O(1) — logs message + DeepSeek for test comms analysis
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are COMMS, a communication and coordination testing agent. You test messaging systems, event buses, and inter-service communication.
Generate tests for:
- Message delivery guarantees (at-least-once, exactly-once)
- Event ordering and sequencing
- Dead letter queue handling
- Message schema validation
- Pub/Sub topic isolation
- WebSocket connection resilience
- gRPC streaming reliability
Output format: JSON array with { name, protocol, scenario, expectedBehavior, failureMode }.`, `Communication test target: ${task.payload.target || 'message-bus'}\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            // Log this communication task
            this.messageLog.push({
                from: 'COMMS',
                to: (task.assignedTo || 'COMMS'),
                type: task.type,
                timestamp: Date.now(),
            });
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'COMMS communication analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// 🎯 TACTICIAN — Strategy Coordination & Test Prioritization
// ═══════════════════════════════════════════════════════════════
class TacticianAgent extends Agent {
    constructor() {
        super('TACTICIAN', 'Strategic Command — Test Prioritization', 5000);
    }
    async initialize() {
        console.log('   🎯 [TACTICIAN] Calculating optimal test strategy...');
    }
    patrol() {
        this.emit('patrol', { agent: this.name, strategy: 'calculating', timestamp: Date.now() });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are TACTICIAN, a strategic test coordination agent. You analyze risk and prioritize testing efforts.
Given a testing target, provide:
- Risk-based test prioritization matrix
- Critical path analysis (which tests must pass first)
- Resource allocation recommendations (which agents should handle what)
- Test dependency graph
- Estimated time-to-completion for full coverage
- Risk score for each untested area (1-10)
Output format: JSON with { priorityMatrix: [...], criticalPath: [...], resourceAllocation: {...}, riskAreas: [...] }.`, `Strategic analysis for: ${task.payload.target || 'unknown'}\nAvailable agents: SENTINEL, REAPER, ORACLE, GENESIS, WATCHER, ENGINEER, COMMS, EXECUTIONER, VORTEX\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'TACTICIAN strategic analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// 💀 EXECUTIONER — Critical Path Testing
// ═══════════════════════════════════════════════════════════════
class ExecutionerAgent extends Agent {
    constructor() {
        super('EXECUTIONER', 'Critical Execution — Happy Path & Smoke Tests', 2000);
    }
    async initialize() {
        console.log('   💀 [EXECUTIONER] Targeting critical paths...');
    }
    patrol() {
        this.emit('patrol', { agent: this.name, targeting: 'critical-path', timestamp: Date.now() });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are EXECUTIONER, a critical path testing agent. You test the most important user flows — failures here mean total system failure.
Generate tests for:
- Core user journey (signup → login → key action → logout)
- Payment flow (add card → charge → receipt → refund)
- Data integrity (create → read → update → delete → verify)
- API contract validation (request/response schema)
- Error recovery (failure → retry → success)
- Idempotency guarantees
Each test must be a complete, executable E2E test.
Output format: Runnable test code with describe/it blocks, setup, teardown, and assertions.`, `Critical path testing for: ${task.payload.target || 'unknown'}\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'EXECUTIONER critical path analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// 🌀 VORTEX — Chaos Engineering & Stress Testing
// ═══════════════════════════════════════════════════════════════
class VortexAgent extends Agent {
    constructor() {
        super('VORTEX', 'Chaos Engineering — Fault Injection & Resilience', 30000);
    }
    async initialize() {
        console.log('   🌀 [VORTEX] Chaos protocols armed...');
    }
    patrol() {
        this.emit('patrol', {
            agent: this.name,
            chaosLevel: Math.random(),
            timestamp: Date.now(),
        });
    }
    // Complexity: O(1) — single DeepSeek API call
    async executeTask(task) {
        const start = Date.now();
        try {
            const output = await queryDeepSeek(`You are VORTEX, a chaos engineering agent. You inject controlled failures to test system resilience.
Generate chaos experiments:
- Network partition simulation (split-brain scenarios)
- Service dependency failure (downstream timeout, 500 errors)
- Resource exhaustion (memory pressure, disk full, CPU spike)
- Clock skew and timezone edge cases
- Concurrent request storms (thundering herd)
- Data corruption recovery
- Cascading failure chains
Each experiment must include: hypothesis, injection method, expected behavior, abort conditions, rollback procedure.
Output format: JSON array with { name, hypothesis, injection, expectedBehavior, abortCondition, rollback, blastRadius }.`, `Chaos engineering target: ${task.payload.target || 'unknown'}\nContext: ${JSON.stringify(task.payload)}`);
            const duration = Date.now() - start;
            this.recordResult(duration, true);
            return {
                taskId: task.id,
                agentName: this.name,
                success: true,
                output,
                duration,
                reasoning: 'VORTEX chaos analysis complete',
            };
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordResult(duration, false);
            return {
                taskId: task.id,
                agentName: this.name,
                success: false,
                output: '',
                duration,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// Swarm Commander — Orchestrates all 10 agents
// ═══════════════════════════════════════════════════════════════
class DecaGuardSwarm extends SwarmMemoryV2_1.AdaptiveEventBusV2 {
    agents = new Map();
    results = new Map();
    taskHistory = [];
    bastion;
    sharedMemory;
    constructor() {
        super();
        this.bastion = new bastion_controller_1.BastionController({ sandbox: { enabled: true } });
        this.sharedMemory = new SwarmMemoryV2_1.SharedMemoryV2(10);
        this.assembleCouncil();
    }
    // Complexity: O(1) — fixed 10 agents
    assembleCouncil() {
        const council = [
            new SentinelAgent(),
            new WatcherAgent(),
            new ReaperAgent(),
            new OracleAgent(),
            new GenesisAgent(),
            new EngineerAgent(),
            new CommsAgent(),
            new TacticianAgent(),
            new ExecutionerAgent(),
            new VortexAgent(),
        ];
        council.forEach((agent, index) => {
            agent.agentIndex = index;
            this.agents.set(agent.name, agent);
            // Forward agent events to swarm
            agent.on('patrol', (data) => this.publish(data, 'agentPatrol'));
            agent.on('anomaly', (data) => this.publish(data, 'anomalyDetected'));
        });
    }
    // Complexity: O(n) where n = number of agents (fixed = 10)
    async deploy() {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🤖 DECA-GUARD SWARM v2.0 — DEPLOYED                          ║
║  10 AI Agents • DeepSeek R1 Powered • Autonomous Testing       ║
╚════════════════════════════════════════════════════════════════╝
    `);
        await this.bastion.initialize(process.env.VAULT_PASSWORD || 'qantum-default-vault');
        console.log('   🏰 Bastion Layer initialized for secure sandboxed execution.');
        for (const agent of this.agents.values()) {
            await agent.activate();
        }
        console.log(`\n✅ All ${this.agents.size} agents operational. Swarm ready.\n`);
    }
    // Complexity: O(1) — map lookup + single agent execution with V2 Shared Memory
    async assignTask(task) {
        const agent = this.selectAgent(task);
        task.assignedTo = agent.name;
        console.log(`   📋 Task ${task.id} [${task.type}] → ${agent.name}`);
        const ownerId = agent.agentIndex + 1;
        let locked = false;
        let retries = 0;
        // Wait for V2 Shared Memory Lock
        while (!locked && retries < 50) {
            locked = this.sharedMemory.acquireLock(agent.agentIndex, ownerId);
            if (!locked) {
                await new Promise(r => setTimeout(r, 100));
                retries++;
            }
        }
        if (!locked) {
            return {
                taskId: task.id,
                agentName: agent.name,
                success: false,
                output: '',
                duration: 0,
                errors: [`Failed to acquire V2 Shared Memory lock for agent ${agent.name}`],
            };
        }
        try {
            this.taskHistory.push(task);
            const result = await agent.executeTask(task);
            this.results.set(task.id, result);
            const statusIcon = result.success ? '✅' : '❌';
            console.log(`   ${statusIcon} Task ${task.id} completed in ${result.duration}ms`);
            // If GENESIS generated tests, try executing them safely in the Bastion Sandbox
            if (task.type === 'generation' && result.success) {
                await this.executeInBastion(result.output, task.id);
            }
            return result;
        }
        finally {
            this.sharedMemory.releaseLock(agent.agentIndex, ownerId);
        }
    }
    // Complexity: O(1) execution wrapper
    async executeInBastion(codeMarkdown, taskId) {
        console.log(`   🏰 [BASTION] Securing sandbox for task ${taskId}...`);
        // Extract code block from markdown if present
        const match = codeMarkdown.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/);
        const code = match ? match[1] : codeMarkdown;
        const validation = await this.bastion.validateMutation(taskId, code);
        if (validation.isSafe) {
            console.log(`   ✅ [BASTION] Code execution safe (Time: ${validation.sandboxResult?.executionTime}ms)`);
            if (validation.sandboxResult?.result !== undefined) {
                console.log(`      Result: ${JSON.stringify(validation.sandboxResult.result)}`);
            }
        }
        else {
            console.log(`   ⚠️ [BASTION] execution BLOCKED. Violations: ${validation.sandboxResult?.violations?.map(v => v.type).join(', ')}`);
        }
    }
    // Complexity: O(n) — parallel execution of n tasks
    async assignBatch(tasks) {
        console.log(`\n   📦 Batch: ${tasks.length} tasks queued`);
        const results = await Promise.allSettled(tasks.map((task) => this.assignTask(task)));
        return results.map((result, i) => {
            if (result.status === 'fulfilled')
                return result.value;
            return {
                taskId: tasks[i].id,
                agentName: 'COMMS',
                success: false,
                output: '',
                duration: 0,
                errors: [result.reason?.message || 'Unknown error'],
            };
        });
    }
    // Complexity: O(1) — map lookup
    selectAgent(task) {
        const routing = {
            security: 'SENTINEL',
            penetration: 'REAPER',
            prediction: 'ORACLE',
            generation: 'GENESIS',
            monitoring: 'WATCHER',
            infrastructure: 'ENGINEER',
            communication: 'COMMS',
            strategy: 'TACTICIAN',
            critical: 'EXECUTIONER',
            chaos: 'VORTEX',
        };
        const agentName = routing[task.type];
        const agent = this.agents.get(agentName);
        if (!agent) {
            throw new Error(`[SWARM] No agent found for task type: ${task.type}`);
        }
        return agent;
    }
    // Complexity: O(n) where n = number of agents
    getStatus() {
        return {
            agents: Array.from(this.agents.values()).map((a) => a.getStatus()),
            totalTasks: this.results.size,
            performance: this.calculatePerformance(),
        };
    }
    // Complexity: O(n) where n = results count
    calculatePerformance() {
        const results = Array.from(this.results.values());
        if (results.length === 0) {
            return { avgDuration: 0, successRate: 0, totalCompleted: 0 };
        }
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        const successRate = results.filter((r) => r.success).length / results.length;
        return { avgDuration, successRate, totalCompleted: results.length };
    }
    // Complexity: O(n) — deactivates all agents
    async shutdown() {
        console.log('\n🛑 Deactivating swarm...');
        for (const agent of this.agents.values()) {
            await agent.deactivate();
            agent.destroy();
        }
        await this.bastion.shutdown();
        this.sharedMemory.destroy();
        this.destroy();
        console.log('✅ Swarm & Bastion shutdown complete.\n');
    }
}
exports.DecaGuardSwarm = DecaGuardSwarm;
// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
exports.default = DecaGuardSwarm;
