/*
 * Prometheus Metrics Exporter for QAntum Fortress
 */

export class MetricsManager {
  private static instance: MetricsManager;
  private metrics: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): MetricsManager {
    if (!MetricsManager.instance) {
      MetricsManager.instance = new MetricsManager();
    }
    return MetricsManager.instance;
  }

  public increment(metric: string, labels: Record<string, string> = {}): void {
    const key = this.getKey(metric, labels);
    const val = this.metrics.get(key) || 0;
    this.metrics.set(key, val + 1);
  }

  public set(metric: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getKey(metric, labels);
    this.metrics.set(key, value);
  }

  public getMetrics(): string {
    let output = '';
    this.metrics.forEach((value, key) => {
      output += `# HELP ${key.split('{')[0]} Custom metric\n`;
      output += `# TYPE ${key.split('{')[0]} gauge\n`;
      output += `${key} ${value}\n`;
    });
    return output;
  }

  private getKey(metric: string, labels: Record<string, string>): string {
    if (Object.keys(labels).length === 0) return metric;
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${metric}{${labelStr}}`;
  }
}
