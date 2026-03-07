/**
 * 🛡️ QAntum DEBUGGER API Routes
 *
 * API endpoints for the debugger dashboard integration
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';

// In-memory store for debugger reports (in production, use database)
const debuggerReports: any[] = [];
const debuggerStats = {
  totalScans: 0,
  errorsDetected: 0,
  errorsFixed: 0,
  errorsPrevented: 0,
  lastScan: null as number | null,
};

export async function debuggerRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  /**
   * POST /api/debugger
   * Receive scan results from debugger
   */
  fastify.post('/', async (request, reply) => {
    const { type, data, timestamp } = request.body as any;

    if (type === 'scan-result') {
      debuggerReports.push({
        ...data,
        timestamp,
        receivedAt: Date.now(),
      });

      // Keep only last 100 reports
      if (debuggerReports.length > 100) {
        debuggerReports.shift();
      }

      // Update stats
      debuggerStats.totalScans++;
      debuggerStats.errorsDetected += data.errors?.length || 0;
      debuggerStats.errorsFixed += data.fixed?.length || 0;
      debuggerStats.errorsPrevented += data.prevented || 0;
      debuggerStats.lastScan = timestamp;

      return { success: true, message: 'Report received' };
    }

    return reply.code(400).send({ error: 'Invalid report type' });
  });

  /**
   * GET /api/debugger/stats
   * Get debugger statistics
   */
  fastify.get('/stats', async (_request, _reply) => {
    return {
      ...debuggerStats,
      recentReports: debuggerReports.slice(-10),
    };
  });

  /**
   * GET /api/debugger/reports
   * Get recent reports
   */
  fastify.get('/reports', async (request, _reply) => {
    const { limit = 20 } = request.query as any;
    return {
      reports: debuggerReports.slice(-parseInt(limit)),
      total: debuggerReports.length,
    };
  });

  /**
   * GET /api/debugger/health
   * Health check for debugger service
   */
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'operational',
      lastScan: debuggerStats.lastScan,
      uptime: process.uptime(),
    };
  });

  fastify.log.info('🛡️ Debugger routes registered');
}

export default debuggerRoutes;
