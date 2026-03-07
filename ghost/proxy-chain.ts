/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔗 PROXY CHAIN - Multi-Hop Routing System
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Metaphysical Principle: Location is relative, identity is contextual.
 * By routing through multiple nodes, we create "quantum entanglement" of network identity -
 * the observer cannot determine the true origin without observing all intermediate states,
 * but observation of one state affects the others.
 * 
 * The proxy chain embodies the Onion Router philosophy: each layer reveals only the next
 * step, never the final destination or true origin.
 * 
 * @author Dimitar Prodromov
 * @version 17.0.0
 */

import { EventEmitter } from 'events';
import type { ProxyConfig, ProxyNode, ThreatLevel } from '../../types/security.types';

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🌐 PROXY CHAIN TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ChainState {
  active: boolean;
  nodes: ProxyNode[];
  currentIndex: number;
  rotationCount: number;
  lastRotation: number;
  totalRequests: number;
  failedRequests: number;
}

interface RoutingDecision {
  path: ProxyNode[];
  estimatedLatency: number;
  reliability: number;
}

interface ProxyHealthReport {
  nodeId: string;
  healthy: boolean;
  latency: number;
  successRate: number;
  lastChecked: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔄 PROXY CHAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════

export class ProxyChain extends EventEmitter {
  private config: ProxyConfig;
  private state: ChainState;
  private healthReports: Map<string, ProxyHealthReport>;
  private rotationTimer: ReturnType<typeof setInterval> | null;
  private readonly MAX_FAILURES = 3;
  private readonly DEFAULT_ROTATION_INTERVAL = 300000; // 5 minutes

  constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.state = this.initializeState();
    this.healthReports = new Map();
    this.rotationTimer = null;
  }

  /**
   * Get default proxy configuration
   */
  private getDefaultConfig(): ProxyConfig {
    return {
      hops: 3,
      rotation: 'auto',
      rotationInterval: this.DEFAULT_ROTATION_INTERVAL,
      countries: ['US', 'DE', 'NL', 'CH', 'JP'],
      protocols: ['HTTP', 'SOCKS5'],
      failoverEnabled: true,
    };
  }

  /**
   * Initialize chain state
   */
  private initializeState(): ChainState {
    return {
      active: false,
      nodes: [],
      currentIndex: 0,
      rotationCount: 0,
      lastRotation: Date.now(),
      totalRequests: 0,
      failedRequests: 0,
    };
  }

  /**
   * Configure the proxy chain
   * 
   * @param config - Proxy chain configuration
   */
  public configure(config: Partial<ProxyConfig>): void {
    this.config = { ...this.config, ...config };

    // Setup auto-rotation if configured
    if (this.config.rotation === 'auto') {
      this.startAutoRotation();
    }

    this.emit('configured', { config: this.config });
  }

  /**
   * Add proxy node to the pool
   * 
   * @param node - Proxy node to add
   */
  public addNode(node: Omit<ProxyNode, 'failures' | 'id'>): void {
    const fullNode: ProxyNode = {
      ...node,
      id: this.generateNodeId(node),
      failures: 0,
    };

    // Validate protocol
    if (!this.config.protocols.includes(fullNode.protocol)) {
      this.emit('warning', {
        message: `Protocol ${fullNode.protocol} not in allowed list`,
        node: fullNode.id,
      });
    }

    // Validate country if specified
    if (fullNode.country && this.config.countries &&
      !this.config.countries.includes(fullNode.country)) {
      this.emit('warning', {
        message: `Country ${fullNode.country} not in preferred list`,
        node: fullNode.id,
      });
    }

    this.state.nodes.push(fullNode);
    this.emit('nodeAdded', { node: fullNode });
  }

  /**
   * Generate unique node ID
   */
  private generateNodeId(node: Omit<ProxyNode, 'failures' | 'id'>): string {
    const base = `${node.protocol}-${node.host}-${node.port}`;
    const hash = this.simpleHash(base);
    return hash.substring(0, 16);
  }

  /**
   * Simple hash function for node IDs
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0') + Date.now().toString(16);
  }

  /**
   * Remove proxy node from pool
   * 
   * @param nodeId - ID of node to remove
   */
  public removeNode(nodeId: string): boolean {
    const index = this.state.nodes.findIndex((n) => n.id === nodeId);
    if (index !== -1) {
      const removed = this.state.nodes.splice(index, 1)[0];
      this.healthReports.delete(nodeId);
      this.emit('nodeRemoved', { node: removed });
      return true;
    }
    return false;
  }

  /**
   * Build optimal proxy chain
   * 
   * Metaphysical Note: The optimal path is not always the shortest.
   * We seek balance between speed, reliability, and geographic diversity.
   * Like finding the path of least resistance while maximizing entropy.
   */
  public buildChain(): RoutingDecision {
    const availableNodes = this.getHealthyNodes();

    if (availableNodes.length < this.config.hops) {
      this.emit('warning', {
        message: `Not enough healthy nodes. Need ${this.config.hops}, have ${availableNodes.length}`,
      });
    }

    const selectedNodes: ProxyNode[] = [];
    const usedCountries = new Set<string>();

    // Select nodes with geographic diversity
    for (let hop = 0; hop < this.config.hops && availableNodes.length > 0; hop++) {
      const node = this.selectOptimalNode(availableNodes, usedCountries);
      if (node) {
        selectedNodes.push(node);
        if (node.country) {
          usedCountries.add(node.country);
        }
        // Remove from available
        const idx = availableNodes.indexOf(node);
        if (idx !== -1) {
          availableNodes.splice(idx, 1);
        }
      }
    }

    // Calculate metrics
    const estimatedLatency = selectedNodes.reduce(
      (sum, node) => sum + (node.latency || 100),
      0
    );

    const reliability = selectedNodes.length > 0
      ? selectedNodes.reduce((sum, node) => {
        const health = this.healthReports.get(node.id);
        return sum + (health?.successRate || 0.8);
      }, 0) / selectedNodes.length
      : 0;

    return {
      path: selectedNodes,
      estimatedLatency,
      reliability,
    };
  }

  /**
   * Get healthy nodes from pool
   */
  private getHealthyNodes(): ProxyNode[] {
    return this.state.nodes.filter((node) => {
      // Check failure count
      if (node.failures >= this.MAX_FAILURES) {
        return false;
      }

      // Check health report if available
      const health = this.healthReports.get(node.id);
      if (health && !health.healthy) {
        return false;
      }

      return true;
    });
  }

  /**
   * Select optimal node based on criteria
   */
  private selectOptimalNode(
    nodes: ProxyNode[],
    usedCountries: Set<string>
  ): ProxyNode | null {
    if (nodes.length === 0) return null;

    // Score each node
    const scored = nodes.map((node) => {
      let score = 100;

      // Prefer nodes from unused countries
      if (node.country && usedCountries.has(node.country)) {
        score -= 30;
      }

      // Prefer lower latency
      if (node.latency) {
        score -= node.latency / 10;
      }

      // Penalize nodes with failures
      score -= node.failures * 15;

      // Prefer preferred protocols
      if (this.config.protocols[0] === node.protocol) {
        score += 10;
      }

      // Consider health report
      const health = this.healthReports.get(node.id);
      if (health) {
        score += health.successRate * 20;
      }

      return { node, score };
    });

    // Sort by score and select best
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.node || null;
  }

  /**
   * Start auto-rotation of proxy chain
   */
  private startAutoRotation(): void {
    this.stopAutoRotation();

    const interval = this.config.rotationInterval || this.DEFAULT_ROTATION_INTERVAL;

    this.rotationTimer = setInterval(() => {
      this.rotate();
    }, interval);
  }

  /**
   * Stop auto-rotation
   */
  private stopAutoRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }

  /**
   * Rotate to next proxy chain
   * 
   * Rotation breaks temporal patterns and refreshes identity.
   */
  public rotate(): RoutingDecision {
    const newChain = this.buildChain();

    this.state.rotationCount++;
    this.state.lastRotation = Date.now();

    this.emit('rotated', {
      rotationCount: this.state.rotationCount,
      newChain: newChain.path.map((n) => n.id),
      timestamp: this.state.lastRotation,
    });

    return newChain;
  }

  /**
   * Report request result for health tracking
   * 
   * @param nodeId - Node that handled the request
   * @param success - Whether request succeeded
   * @param latency - Request latency in ms
   */
  public reportResult(nodeId: string, success: boolean, latency?: number): void {
    const node = this.state.nodes.find((n) => n.id === nodeId);

    if (node) {
      if (!success) {
        node.failures++;
        this.state.failedRequests++;

        // Check if node should be quarantined
        if (node.failures >= this.MAX_FAILURES) {
          this.emit('nodeQuarantined', { node, failures: node.failures });
        }
      } else {
        // Reduce failure count on success (recovery)
        node.failures = Math.max(0, node.failures - 0.5);
        if (latency) {
          // Update latency with exponential moving average
          node.latency = node.latency
            ? node.latency * 0.7 + latency * 0.3
            : latency;
        }
      }

      node.lastUsed = Date.now();
      this.state.totalRequests++;

      // Update health report
      this.updateHealthReport(nodeId, success, latency);
    }
  }

  /**
   * Update health report for node
   */
  private updateHealthReport(nodeId: string, success: boolean, latency?: number): void {
    const existing = this.healthReports.get(nodeId);

    if (existing) {
      // Update with exponential moving average
      const alpha = 0.2;
      existing.successRate = existing.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;
      existing.latency = latency
        ? existing.latency * (1 - alpha) + latency * alpha
        : existing.latency;
      existing.healthy = existing.successRate >= 0.5;
      existing.lastChecked = Date.now();
    } else {
      this.healthReports.set(nodeId, {
        nodeId,
        healthy: success,
        latency: latency || 100,
        successRate: success ? 1 : 0,
        lastChecked: Date.now(),
      });
    }
  }

  /**
   * Perform health check on all nodes
   */
  public async healthCheck(): Promise<ProxyHealthReport[]> {
    const reports: ProxyHealthReport[] = [];

    for (const node of this.state.nodes) {
      // Simulate health check (in real implementation, would ping proxy)
      const healthy = node.failures < this.MAX_FAILURES;
      const report: ProxyHealthReport = {
        nodeId: node.id,
        healthy,
        latency: node.latency || 100,
        successRate: healthy ? 0.9 : 0.1,
        lastChecked: Date.now(),
      };

      this.healthReports.set(node.id, report);
      reports.push(report);
    }

    this.emit('healthCheckComplete', { reports, timestamp: Date.now() });
    return reports;
  }

  /**
   * Get proxy URL for node
   */
  public getProxyUrl(node: ProxyNode): string {
    const protocol = node.protocol.toLowerCase();
    return `${protocol}://${node.host}:${node.port}`;
  }

  /**
   * Get current chain configuration
   */
  public getChainInfo(): {
    config: ProxyConfig;
    state: Omit<ChainState, 'nodes'>;
    nodeCount: number;
    healthyNodes: number;
  } {
    return {
      config: this.config,
      state: {
        active: this.state.active,
        currentIndex: this.state.currentIndex,
        rotationCount: this.state.rotationCount,
        lastRotation: this.state.lastRotation,
        totalRequests: this.state.totalRequests,
        failedRequests: this.state.failedRequests,
      },
      nodeCount: this.state.nodes.length,
      healthyNodes: this.getHealthyNodes().length,
    };
  }

  /**
   * Evaluate risk level based on chain health
   */
  public evaluateRisk(): { level: ThreatLevel; recommendations: string[] } {
    const recommendations: string[] = [];
    let riskScore = 0;

    const healthyNodes = this.getHealthyNodes();
    const healthRatio = this.state.nodes.length > 0
      ? healthyNodes.length / this.state.nodes.length
      : 0;

    // Check node health
    if (healthRatio < 0.5) {
      recommendations.push('Add more proxy nodes - less than 50% are healthy');
      riskScore += 30;
    }

    // Check if we have enough nodes for configured hops
    if (healthyNodes.length < this.config.hops) {
      recommendations.push(`Insufficient nodes for ${this.config.hops}-hop chain`);
      riskScore += 40;
    }

    // Check geographic diversity
    const countries = new Set(healthyNodes.map((n) => n.country).filter(Boolean));
    if (countries.size < 3) {
      recommendations.push('Add nodes from more countries for better anonymity');
      riskScore += 20;
    }

    // Check protocol diversity
    const protocols = new Set(healthyNodes.map((n) => n.protocol));
    if (protocols.size < 2) {
      recommendations.push('Add nodes with different protocols');
      riskScore += 10;
    }

    // Check rotation status
    if (this.config.rotation === 'manual') {
      const timeSinceRotation = Date.now() - this.state.lastRotation;
      if (timeSinceRotation > 600000) { // 10 minutes
        recommendations.push('Consider rotating proxy chain - stale for >10 minutes');
        riskScore += 15;
      }
    }

    // Check failure rate
    if (this.state.totalRequests > 0) {
      const failureRate = this.state.failedRequests / this.state.totalRequests;
      if (failureRate > 0.1) {
        recommendations.push('High failure rate - review node health');
        riskScore += 25;
      }
    }

    // Determine level
    let level: ThreatLevel;
    if (riskScore >= 60) level = 'critical';
    else if (riskScore >= 40) level = 'high';
    else if (riskScore >= 20) level = 'medium';
    else if (riskScore >= 10) level = 'low';
    else level = 'none';

    return { level, recommendations };
  }

  /**
   * Apply adaptive configuration based on conditions
   */
  public adaptiveReconfigure(): void {
    const risk = this.evaluateRisk();

    switch (risk.level) {
      case 'critical':
      case 'high':
        // Increase hops for more anonymity
        this.config.hops = Math.min(5, this.config.hops + 1);
        this.config.rotation = 'auto';
        this.config.rotationInterval = 60000; // 1 minute
        break;

      case 'medium':
        // Standard configuration
        this.config.hops = 3;
        this.config.rotation = 'auto';
        this.config.rotationInterval = 300000; // 5 minutes
        break;

      default:
        // Relaxed configuration
        this.config.hops = 2;
        break;
    }

    if (this.config.rotation === 'auto') {
      this.startAutoRotation();
    }

    this.emit('adaptiveReconfigured', { risk: risk.level, config: this.config });
  }

  /**
   * Activate the proxy chain
   */
  public activate(): void {
    this.state.active = true;

    if (this.config.rotation === 'auto') {
      this.startAutoRotation();
    }

    this.emit('activated', { timestamp: Date.now() });
  }

  /**
   * Deactivate the proxy chain
   */
  public deactivate(): void {
    this.state.active = false;
    this.stopAutoRotation();
    this.emit('deactivated', { timestamp: Date.now() });
  }

  /**
   * Clear all nodes and reset state
   */
  public reset(): void {
    this.stopAutoRotation();
    this.state = this.initializeState();
    this.healthReports.clear();
    this.emit('reset', { timestamp: Date.now() });
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopAutoRotation();
    this.state.nodes = [];
    this.healthReports.clear();
    this.removeAllListeners();
  }
}

export default ProxyChain;
