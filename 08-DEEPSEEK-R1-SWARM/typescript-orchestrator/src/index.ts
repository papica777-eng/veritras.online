/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 DEEPSEEK-R1-SWARM - Entry Point & Fastify API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Unified entry: starts Fastify server + deploys Deca-Guard swarm.
 * Exposes REST API for task assignment, status, and agent control.
 *
 * @author Dimitar Prodromov / QAntum Empire
 */

import Fastify from 'fastify'
import { DecaGuardSwarm } from './SwarmCommander'
import type { Task, TaskType, TaskResult } from './SwarmCommander'
import { SwarmConfig } from './config'
import { randomUUID } from 'crypto'

// ═══════════════════════════════════════════════════════════════
// Initialize
// ═══════════════════════════════════════════════════════════════

const app = Fastify({ logger: { level: SwarmConfig.logging.level } })
const swarm = new DecaGuardSwarm()

// ═══════════════════════════════════════════════════════════════
// Request/Response Schemas
// ═══════════════════════════════════════════════════════════════

interface CreateTaskBody {
    type: TaskType
    priority?: number
    target?: string
    code?: string
    tests?: string[]
    context?: string
    config?: Record<string, string | number | boolean>
}

interface BatchTaskBody {
    tasks: CreateTaskBody[]
}

// ═══════════════════════════════════════════════════════════════
// Routes
// ═══════════════════════════════════════════════════════════════

// Complexity: O(1)
app.get('/health', async () => {
    return { status: 'operational', timestamp: Date.now(), agents: 10 }
})

// Complexity: O(n) where n = agents
app.get('/swarm/status', async () => {
    return swarm.getStatus()
})

// Complexity: O(1) — single task assignment
app.post<{ Body: CreateTaskBody }>('/swarm/task', async (request, reply) => {
    const body = request.body

    if (!body.type) {
        return reply.status(400).send({ error: 'Missing required field: type' })
    }

    const validTypes: TaskType[] = [
        'security', 'penetration', 'prediction', 'generation',
        'monitoring', 'infrastructure', 'communication',
        'strategy', 'critical', 'chaos',
    ]

    if (!validTypes.includes(body.type)) {
        return reply.status(400).send({
            error: `Invalid task type: ${body.type}`,
            validTypes,
        })
    }

    const task: Task = {
        id: randomUUID(),
        type: body.type,
        priority: body.priority || 5,
        payload: {
            target: body.target,
            code: body.code,
            tests: body.tests,
            context: body.context,
            config: body.config,
        },
        createdAt: Date.now(),
    }

    try {
        const result = await swarm.assignTask(task)
        return { success: true, result }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return reply.status(500).send({ success: false, error: message })
    }
})

// Complexity: O(n) — batch task assignment
app.post<{ Body: BatchTaskBody }>('/swarm/batch', async (request, reply) => {
    const { tasks: taskDefs } = request.body

    if (!Array.isArray(taskDefs) || taskDefs.length === 0) {
        return reply.status(400).send({ error: 'Provide a non-empty tasks array' })
    }

    if (taskDefs.length > 50) {
        return reply.status(400).send({ error: 'Maximum 50 tasks per batch' })
    }

    const tasks: Task[] = taskDefs.map((def) => ({
        id: randomUUID(),
        type: def.type,
        priority: def.priority || 5,
        payload: {
            target: def.target,
            code: def.code,
            tests: def.tests,
            context: def.context,
            config: def.config,
        },
        createdAt: Date.now(),
    }))

    try {
        const results = await swarm.assignBatch(tasks)
        const successCount = results.filter((r) => r.success).length
        return {
            success: true,
            total: results.length,
            succeeded: successCount,
            failed: results.length - successCount,
            results,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return reply.status(500).send({ success: false, error: message })
    }
})

// ═══════════════════════════════════════════════════════════════
// Startup
// ═══════════════════════════════════════════════════════════════

// Complexity: O(1)
async function main(): Promise<void> {
    try {
        // Deploy swarm first
        await swarm.deploy()

        // Start API server
        await app.listen({
            host: SwarmConfig.api.host,
            port: SwarmConfig.api.port,
        })

        console.log(`\n🌐 API Server: http://localhost:${SwarmConfig.api.port}`)
        console.log('   POST /swarm/task   — Assign single task')
        console.log('   POST /swarm/batch  — Assign batch of tasks')
        console.log('   GET  /swarm/status — Swarm health & metrics')
        console.log('   GET  /health       — Service health check\n')
    } catch (error) {
        console.error('❌ Startup failed:', error)
        process.exit(1)
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⚡ SIGINT received...')
    await swarm.shutdown()
    await app.close()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    console.log('\n⚡ SIGTERM received...')
    await swarm.shutdown()
    await app.close()
    process.exit(0)
})

main()

export { app, swarm }
