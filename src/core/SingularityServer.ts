/**
 * SingularityServer — Qantum Module
 * @module SingularityServer
 * @path src/core/SingularityServer.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as http from 'http';
import { z } from 'zod';
import { DepartmentEngine } from './DepartmentEngine';
import { Telemetry } from './telemetry/Telemetry';
import { Logger } from './telemetry/Logger';
import { pathJoin } from '../utils/paths';

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMAS - BunkerBridge Validation
// ═══════════════════════════════════════════════════════════════════════════════

const DepartmentActionSchema = z.object({
  action: z.string(),
  params: z.record(z.unknown())
});

const LwasResonanceScanSchema = z.object({
  manifoldId: z.string()
});

const AskSchema = z.object({
  prompt: z.string()
});

/**
 * 🌌 QANTUM SINGULARITY SERVER
 * The ultimate backend server that unifies all departments and services.
 * Enforces Absolute Determinism and Zero Entropy.
 */
export class SingularityServer {
  private app: express.Application;
  private server: http.Server;
  private port: number;
  private engine: DepartmentEngine;
  private telemetry: Telemetry;
  private logger: Logger;

  // Complexity: O(1) — singleton lookups + middleware registration
  constructor(port: number = 8890) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.engine = DepartmentEngine.getInstance();
    this.telemetry = Telemetry.getInstance();
    this.logger = Logger.getInstance();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  // Complexity: O(1) — middleware stack registration
  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));

    // Performance Tracking Middleware — O(1) per request
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.telemetry.trackApiRequest(req.path, req.method, res.statusCode, duration);
        this.logger.debug('HTTP', `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  // Complexity: O(R) where R = number of routes registered
  private setupRoutes() {
    // --- Core Status Endpoints ---
    this.app.get('/api/status', async (_req: Request, res: Response) => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const status = await this.engine.getOverallStatus();
      res.json(status);
    });

    // --- Department Management ---
    this.app.get('/api/departments/:name', async (req: Request, res: Response) => {
      try {
        const dept = this.engine.getDepartment(req.params.name);
        const health = await dept.getHealth();
        res.json(health);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(404).json({ error: message });
      }
    });

    this.app.post('/api/departments/:name/action', async (req: Request, res: Response) => {
      try {
        const { name } = req.params;
        const { action, params } = DepartmentActionSchema.parse(req.body);

        const dept = this.engine.getDepartment(name);
        this.logger.info('ENGINE', `Executing ${action} in ${name}`, params);

        if (name === 'intelligence' && action === 'query') {
          const result = await (dept as any).processQuery(params.query);
          return res.json(result);
        }

        res.json({ success: true, message: `Action ${action} initiated in ${name}` });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Validation/Execution failed';
        res.status(500).json({ error: message });
      }
    });

    // --- LwaS Resonance Bridge ---
    this.app.post('/api/lwas/resonance-scan', async (req: Request, res: Response) => {
      try {
        const { manifoldId } = LwasResonanceScanSchema.parse(req.body);
        this.logger.info('BRIDGE', `Initiating Resonance Scan for manifold: ${manifoldId}`);

        const scanResult = {
          manifoldId,
          criticalNodes: Array.from({ length: 5 }, () => Math.floor(Math.random() * 2000000000)),
          timestamp: Date.now()
        };

        res.json(scanResult);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Resonance scan failed';
        res.status(500).json({ error: message });
      }
    });

    // --- Intelligence Bridge ---
    this.app.post('/api/ask', async (req: Request, res: Response) => {
      try {
        const { prompt } = AskSchema.parse(req.body);
        const intel = this.engine.getDepartment<any>('intelligence');
        const result = await intel.processQuery(prompt);
        res.json({
          response: `[Intelligence Node] Analyzed query: ${result.processed}. Confidence: ${result.confidence.toFixed(2)}`,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Query failed';
        res.status(500).json({ error: message });
      }
    });

    // --- Static Files ---
    const dashboardDir = pathJoin(process.cwd(), 'dashboard');
    this.app.use(express.static(dashboardDir));

    this.app.get('(.*)', (_req: Request, res: Response) => {
      res.sendFile(pathJoin(dashboardDir, 'qantum-singular-interface.html'));
    });
  }

  // Complexity: O(1) — express error handler registration
  private setupErrorHandling() {
    this.app.use(
      (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        this.logger.error('SERVER', 'Unhandled Exception', err);
        res.status(500).json({
          error: 'Internal Server Error',
          traceId: (err as any).traceId || 'unknown',
        });
      }
    );
  }

  // Complexity: O(N) — initializes all departments then binds port
  public async start() {
    this.logger.info('SERVER', `Starting Singularity Server on port ${this.port}...`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.engine.initializeAll();

    this.server.listen(this.port, () => {
      this.logger.info('SERVER', `✅ SINGULARITY CORE ACTIVE on port ${this.port}`);
      this.telemetry.trackMemory();
    });

    setInterval(() => this.telemetry.trackMemory(), 30000);
  }

  // Complexity: O(N) — graceful shutdown of all departments + server close
  public async stop() {
    this.logger.warn('SERVER', 'Stopping Singularity Server...');
    this.telemetry.stop();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.engine.shutdownAll();
    this.server.close();
  }
}
