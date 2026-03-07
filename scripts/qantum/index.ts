/**
 * index — Qantum Module
 * @module index
 * @path scripts/qantum/index.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { createServer } from './api/unified/server';
import { logger } from './api/unified/utils/logger';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const server = createServer({
  port: PORT,
  logging: {
    level: 'info',
    requestBody: true,
    responseBody: true
  },
  cors: {
    enabled: true,
    origins: ['*'] // Allow all for now, or strict to localhost:8080/3000
  }
});

server.start().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
