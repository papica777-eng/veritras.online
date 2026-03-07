/**
 * Telemetry — Qantum Module
 * @module Telemetry
 * @path core/telemetry/Telemetry.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { Logger } from './Logger';

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

/**
 * 📈 QANTUM Telemetry System
 * Collects, aggregates, and reports system metrics.
 */
export class Telemetry {
  private static instance: Telemetry;
  private metrics: Metric[] = [];
  private logger: Logger;
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.logger = Logger.getInstance();
    this.startAutoFlush();
  }

  public static getInstance(): Telemetry {
    if (!Telemetry.instance) {
      Telemetry.instance = new Telemetry();
    }
    return Telemetry.instance;
  }

  // Complexity: O(1)
  public record(name: string, value: number, tags: Record<string, string> = {}) {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Log critical metrics
    if (name === 'system.cpu' && value > 90) {
      this.logger.critical('TELEMETRY', `High CPU detected: ${value}%`, tags);
    }

    if (this.metrics.length > 1000) {
      this.flush();
    }
  }

  // Complexity: O(1)
  public async flush() {
    if (this.metrics.length === 0) return;

    const snapshot = [...this.metrics];
    this.metrics = [];

    this.logger.debug('TELEMETRY', `Flushing ${snapshot.length} metrics...`);

    // In a real system, we'd send this to Prometheus/InfluxDB
    // For now, we'll just log the aggregation
    const aggregation = this.aggregate(snapshot);
    this.logger.info('TELEMETRY', 'Metrics Aggregation:', aggregation);
  }

  // Complexity: O(N) — linear iteration
  private aggregate(metrics: Metric[]): any {
    const result: any = {};
    metrics.forEach((m) => {
      if (!result[m.name]) {
        result[m.name] = { count: 0, sum: 0, min: Infinity, max: -Infinity };
      }
      const stats = result[m.name];
      stats.count++;
      stats.sum += m.value;
      stats.min = Math.min(stats.min, m.value);
      stats.max = Math.max(stats.max, m.value);
    });

    // Calculate averages
    Object.keys(result).forEach((name) => {
      result[name].avg = result[name].sum / result[name].count;
    });

    return result;
  }

  // Complexity: O(1)
  private startAutoFlush() {
    this.flushInterval = setInterval(() => this.flush(), 60000); // Every minute
  }

  // Complexity: O(1)
  public stop() {
    if (this.flushInterval) {
      // Complexity: O(1)
      clearInterval(this.flushInterval);
      this.flush();
    }
  }

  // --- Specialized Trackers ---

  // Complexity: O(1)
  public trackApiRequest(path: string, method: string, statusCode: number, duration: number) {
    this.record('api.request', 1, { path, method, status: statusCode.toString() });
    this.record('api.latency', duration, { path, method });
  }

  // Complexity: O(1)
  public trackMemory() {
    const memory = process.memoryUsage();
    this.record('system.memory.rss', memory.rss / 1024 / 1024, { unit: 'MB' });
    this.record('system.memory.heapTotal', memory.heapTotal / 1024 / 1024, { unit: 'MB' });
    this.record('system.memory.heapUsed', memory.heapUsed / 1024 / 1024, { unit: 'MB' });
  }

  // Complexity: O(1)
  public trackDepartmentHealth(dept: string, status: string) {
    this.record('department.health', status === 'OPERATIONAL' ? 1 : 0, { department: dept });
  }

  // Complexity: O(1)
  public trackEvent(name: string, data: any = {}) {
    this.logger.info('EVENT', `Tracking event: ${name}`, data);
    this.record(`event.${name}`, 1, data);
  }
}
