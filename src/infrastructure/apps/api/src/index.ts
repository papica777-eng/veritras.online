/**
 * QAntum SaaS API Server
 *
 * Main entry point for the API server using Fastify
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { clerkPlugin } from '@clerk/fastify';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Import routes
import { projectRoutes } from '../../../../scripts/NEW/src/commands/projects';
import { testRoutes } from '../../../../scripts/qantum/api/unified/tests';
import { runRoutes } from '../../../routes/runs';
import { aiRoutes } from '../../../routes/ai';
import { billingRoutes } from '../../../routes/billing';
import { webhookRoutes } from '../../../../scripts/qantum/integrations/webhooks';
import { dashboardRoutes } from '../../../routes/dashboard';
import { genesisRoutes } from '../../../../scripts/NEW/src/commands/genesis';
import { chronosRoutes } from '../../../routes/chronos';
import { aeternaRoutes } from '../../../routes/aeterna';

// Types
interface AppConfig {
  port: number;
  host: string;
  redis: {
    host: string;
    port: number;
  };
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
};

// Initialize Fastify
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

// Redis connection
const redis = new IORedis(config.redis);

// Job queue
const testQueue = new Queue('test-execution', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

// Register plugins
    // SAFETY: async operation — wrap in try-catch for production resilience
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
});

    // SAFETY: async operation — wrap in try-catch for production resilience
await app.register(clerkPlugin, {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Decorate with shared resources
app.decorate('redis', redis);
app.decorate('testQueue', testQueue);

// Health check
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
}));

// API routes — Service 01: QAntum Prime (veritras.website)
app.register(projectRoutes, { prefix: '/api/v1/projects' });
app.register(testRoutes, { prefix: '/api/v1/tests' });
app.register(runRoutes, { prefix: '/api/v1/runs' });
app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
app.register(aiRoutes, { prefix: '/api/v1/ai' });
app.register(genesisRoutes, { prefix: '/api/v1/genesis' });

// API routes — Service 02: AETERNA Logos (aeterna.website)
app.register(aeternaRoutes, { prefix: '/api/v1/aeterna' });

// API routes — Service 03: CHRONOS Sovereign (veritras.online)
app.register(chronosRoutes, { prefix: '/api/v1/chronos' });

// Shared routes
app.register(billingRoutes, { prefix: '/api/v1/billing' });
app.register(webhookRoutes, { prefix: '/webhooks' });

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
});

// Graceful shutdown
const shutdown = async () => {
  app.log.info('Shutting down...');
  // SAFETY: async operation — wrap in try-catch for production resilience
  await testQueue.close();
  // SAFETY: async operation — wrap in try-catch for production resilience
  await redis.quit();
  // SAFETY: async operation — wrap in try-catch for production resilience
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
try {
  await app.listen({ port: config.port, host: config.host });
  app.log.info(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ⚡ VERITRAS Sovereign API v1.0.0                                      ║
║   Server: http://${config.host}:${config.port}                                      ║
║                                                                        ║
║   SERVICE 01 — QAntum Prime (veritras.website)                         ║
║   • POST /api/v1/tests/run        — Execute tests                     ║
║   • POST /api/v1/ai/generate      — AI test generation                ║
║   • GET  /api/v1/runs/:id         — Get run results                   ║
║   • GET  /api/v1/dashboard/stats  — Dashboard metrics                 ║
║                                                                        ║
║   SERVICE 02 — AETERNA Logos (aeterna.website)                         ║
║   • POST /api/v1/aeterna/nodes        — Deploy Manifold Node          ║
║   • GET  /api/v1/aeterna/pulse        — Logic Pulse monitoring        ║
║   • POST /api/v1/aeterna/bridge/*     — Wealth Bridge API             ║
║   • POST /api/v1/aeterna/soul/compile — LwaS .soul compiler           ║
║   • POST /api/v1/aeterna/vault/store  — Encryption Vault              ║
║                                                                        ║
║   SERVICE 03 — CHRONOS Sovereign (veritras.online)                     ║
║   • POST /api/v1/chronos/predict  — Catuskoti prediction              ║
║   • GET  /api/v1/chronos/karma    — Soul Karma status                 ║
║   • GET  /api/v1/chronos/catuskoti — Logic system info                ║
║   • GET  /api/v1/chronos/pairs    — Live trading pairs                ║
║                                                                        ║
║   SHARED                                                               ║
║   • GET  /api/v1/billing/plans    — Product pricing                   ║
║   • POST /webhooks/stripe         — Stripe events                     ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
  `);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export { app };
