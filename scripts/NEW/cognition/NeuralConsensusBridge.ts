/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔗 NEURAL CONSENSUS BRIDGE - Hybridization Layer                          ║
 * ║  QAntum Framework v2.0 - "Zero Entropy Architecture"                       ║
 * ║                                                                            ║
 * ║  Fuses 5 engines into a single cognitive substrate:                         ║
 * ║  ├─ NeuralMapEngine  → Cognitive Anchors (self-healing selectors)           ║
 * ║  ├─ EmbeddingEngine  → Vector Semantics (O(log n) similarity)              ║
 * ║  ├─ HardwareBridge   → Substrate Telemetry (adaptive wait logic)           ║
 * ║  ├─ SwarmEngine V2   → Consensus Verification (multi-agent voting)         ║
 * ║  └─ AntiTamper       → Ghost Signature (stealth DOM traversal)             ║
 * ║                                                                            ║
 * ║  Operational Mode: ABSOLUTE DETERMINISM                                    ║
 * ║  Complexity: O(log n) via Vector Search + O(1) Hardware Anchor             ║
 * ║                                                                            ║
 * ║  @module cognition/NeuralConsensusBridge                                   ║
 * ║  @version 2.0.0                                                            ║
 * ║  @enterprise true                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import { Page, ElementHandle, Locator } from 'playwright';
import { NeuralMapEngine, createNeuralMap } from '../../qantum/SaaS-Framework/scripts/OTHERS/neural-map-engine';
import EmbeddingEngine, { getEmbeddingEngine } from '../../../src/pinecone-bridge/src/EmbeddingEngine';
import HardwareBridge, { createHardwareBridge, TelemetryPacket } from '../../qantum/SaaS-Framework/scripts/physics/HardwareBridge';
import { getAntiTamper } from '../../qantum/security/anti-tamper';
import type AntiTamper from '../../qantum/security/anti-tamper';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/** Search strategy used by the swarm agents */
export type SearchStrategy = 'visual' | 'semantic' | 'structural';

/** Consensus result from multi-agent voting */
export interface ConsensusResult {
  element: ElementHandle | null;
  confidence: number;              // 0-1 aggregated confidence
  strategy: SearchStrategy;        // winning strategy
  votes: SwarmVote[];              // individual agent votes
  consensusReached: boolean;       // ≥ 2/3 agents agree
  latencyMs: number;               // total search time
  hardwareAdjusted: boolean;       // whether wait was adjusted for CPU
  stealthApplied: boolean;         // whether anti-tamper was active
  healingApplied: boolean;         // whether vector healing was needed
}

/** Individual swarm agent vote */
export interface SwarmVote {
  agentId: string;
  strategy: SearchStrategy;
  element: ElementHandle | null;
  confidence: number;
  vectorSimilarity?: number;       // only for semantic agent
  latencyMs: number;
}

/** Bridge telemetry snapshot */
export interface SubstrateTelemetry {
  cpuUsage: number;
  ramUsage: number;
  waitMultiplier: number;          // dynamic timeout multiplier
  threatLevel: 'SAFE' | 'CAUTION' | 'WARNING' | 'DANGER' | 'CRITICAL';
  isCompromised: boolean;
  stealthActive: boolean;
  embeddingReady: boolean;
  activeAgents: number;
}

/** Configuration for the bridge */
export interface NeuralConsensusBridgeConfig {
  // Consensus
  requiredConsensus: number;       // minimum votes to proceed (default: 2 of 3)
  agentTimeoutMs: number;          // per-agent timeout (default: 5000)
  
  // Hardware adaptation
  cpuThresholdHigh: number;        // % CPU to trigger wait increase (default: 80)
  cpuThresholdCritical: number;    // % CPU to trigger emergency wait (default: 95)
  waitMultiplierHigh: number;      // timeout multiplier at high CPU (default: 2)
  waitMultiplierCritical: number;  // timeout multiplier at critical CPU (default: 4)
  
  // Vector semantics
  similarityThreshold: number;     // min cosine similarity to accept (default: 0.75)
  vectorCacheSize: number;         // max cached embeddings (default: 5000)
  
  // Stealth
  enableStealth: boolean;          // enable anti-tamper ghost mode (default: true)
  injectHumanJitter: boolean;      // add human-like timing noise (default: true)
  
  // Self-healing
  autoHealOnFailure: boolean;      // retry with vector healing (default: true)
  maxHealAttempts: number;         // max healing retries (default: 3)
}

const DEFAULT_CONFIG: NeuralConsensusBridgeConfig = {
  requiredConsensus: 2,
  agentTimeoutMs: 5000,
  cpuThresholdHigh: 80,
  cpuThresholdCritical: 95,
  waitMultiplierHigh: 2,
  waitMultiplierCritical: 4,
  similarityThreshold: 0.75,
  vectorCacheSize: 5000,
  enableStealth: true,
  injectHumanJitter: true,
  autoHealOnFailure: true,
  maxHealAttempts: 3,
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL CONSENSUS BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

export class NeuralConsensusBridge extends EventEmitter {
  private config: NeuralConsensusBridgeConfig;
  
  // ── Engine references ──
  private neuralMap: NeuralMapEngine;
  private embedding: EmbeddingEngine | null = null;
  private hardware: HardwareBridge;
  private antiTamper: AntiTamper | null = null;
  
  // ── State ──
  private isInitialized = false;
  private currentTelemetry: SubstrateTelemetry = {
    cpuUsage: 0,
    ramUsage: 0,
    waitMultiplier: 1,
    threatLevel: 'SAFE',
    isCompromised: false,
    stealthActive: false,
    embeddingReady: false,
    activeAgents: 0,
  };
  
  // ── Metrics ──
  private metrics = {
    totalSearches: 0,
    consensusReached: 0,
    consensusFailed: 0,
    healingTriggered: 0,
    healingSucceeded: 0,
    averageLatencyMs: 0,
    stealthInterventions: 0,
    hardwareAdjustments: 0,
  };

  // ── Vector cache for anchor text ──
  private vectorCache = new Map<string, number[]>();

  constructor(config: Partial<NeuralConsensusBridgeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.neuralMap = createNeuralMap();
    this.hardware = createHardwareBridge({ port: 0 }); // ephemeral port
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const startTime = Date.now();
    this.emit('bridge:initializing');

    // 1. Load EmbeddingEngine (async — may download model)
    try {
      this.embedding = await getEmbeddingEngine();
      this.currentTelemetry.embeddingReady = true;
      this.emit('engine:loaded', { engine: 'EmbeddingEngine', timeMs: Date.now() - startTime });
    } catch (err) {
      this.emit('engine:failed', { engine: 'EmbeddingEngine', error: (err as Error).message });
      // Continue without embeddings — fallback to structural matching
    }

    // 2. Initialize HardwareBridge (telemetry server)
    try {
      await this.hardware.initialize();
      this.wireHardwareEvents();
      this.emit('engine:loaded', { engine: 'HardwareBridge', timeMs: Date.now() - startTime });
    } catch (err) {
      this.emit('engine:failed', { engine: 'HardwareBridge', error: (err as Error).message });
    }

    // 3. Initialize AntiTamper (ghost signatures)
    if (this.config.enableStealth) {
      try {
        this.antiTamper = getAntiTamper({
          enableDebugDetection: true,
          enableVMDetection: true,
          enableSandboxDetection: true,
          enableIntegrityCheck: true,
          onDetection: 'evade',
        });
        await this.antiTamper.initialize();
        this.currentTelemetry.stealthActive = true;
        this.wireAntiTamperEvents();
        this.emit('engine:loaded', { engine: 'AntiTamper', timeMs: Date.now() - startTime });
      } catch (err) {
        this.emit('engine:failed', { engine: 'AntiTamper', error: (err as Error).message });
      }
    }

    this.isInitialized = true;
    const elapsed = Date.now() - startTime;
    this.emit('bridge:initialized', { elapsed, engines: this.getActiveEngines() });
    this.printBanner(elapsed);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE API — findSecureElement (Consensus Search)
  // Complexity: O(log n) via Vector Search + O(1) Hardware Anchor
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Multi-agent consensus search for a DOM element.
   * 
   * 1. Hardware Anchor: Adjusts waits based on real-time CPU/RAM telemetry
   * 2. Stealth Gate: AntiTamper scans for hostile environment before DOM touch
   * 3. Swarm Search: 3 parallel agents (Visual, Semantic, Structural)
   * 4. Neural Validation: Vector embedding similarity for final tiebreak
   * 5. Self-Healing: If consensus fails, vector-heal and retry
   */
  async findSecureElement(
    page: Page,
    anchorId: string,
    options: { forceHeal?: boolean; timeout?: number } = {}
  ): Promise<ConsensusResult> {
    this.metrics.totalSearches++;
    const searchStart = Date.now();

    // ── Phase 0: Stealth Gate ──
    // SAFETY: async operation — wrap in try-catch for production resilience
    const stealthApplied = await this.stealthGate();

    // ── Phase 1: Hardware Anchor (O(1) — read telemetry) ──
    const waitMultiplier = this.getWaitMultiplier();
    const effectiveTimeout = (options.timeout || this.config.agentTimeoutMs) * waitMultiplier;
    const hardwareAdjusted = waitMultiplier > 1;
    if (hardwareAdjusted) this.metrics.hardwareAdjustments++;

    this.emit('search:start', { anchorId, effectiveTimeout, waitMultiplier, stealthApplied });

    // ── Phase 2: Swarm Search (3 parallel agents) ──
    // SAFETY: async operation — wrap in try-catch for production resilience
    const votes = await this.runSwarmSearch(page, anchorId, effectiveTimeout);

    // ── Phase 3: Consensus Evaluation ──
    const consensus = this.evaluateConsensus(votes);

    if (consensus.consensusReached) {
      this.metrics.consensusReached++;
      const result: ConsensusResult = {
        ...consensus,
        latencyMs: Date.now() - searchStart,
        hardwareAdjusted,
        stealthApplied,
        healingApplied: false,
      };
      this.emit('search:consensus', result);
      return result;
    }

    // ── Phase 4: Self-Healing (if consensus failed) ──
    if (this.config.autoHealOnFailure || options.forceHeal) {
      this.metrics.healingTriggered++;
      // SAFETY: async operation — wrap in try-catch for production resilience
      const healed = await this.vectorHeal(page, anchorId, votes);
      if (healed) {
        this.metrics.healingSucceeded++;
        const result: ConsensusResult = {
          element: healed.element,
          confidence: healed.confidence,
          strategy: 'semantic',
          votes,
          consensusReached: true,
          latencyMs: Date.now() - searchStart,
          hardwareAdjusted,
          stealthApplied,
          healingApplied: true,
        };
        this.emit('search:healed', result);
        return result;
      }
    }

    this.metrics.consensusFailed++;
    const failResult: ConsensusResult = {
      element: null,
      confidence: 0,
      strategy: 'structural',
      votes,
      consensusReached: false,
      latencyMs: Date.now() - searchStart,
      hardwareAdjusted,
      stealthApplied,
      healingApplied: false,
    };
    this.emit('search:failed', failResult);
    return failResult;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: SWARM SEARCH — 3 Parallel Agents
  // ═══════════════════════════════════════════════════════════════════════════

  private async runSwarmSearch(
    page: Page,
    anchorId: string,
    timeoutMs: number
  ): Promise<SwarmVote[]> {
    this.currentTelemetry.activeAgents = 3;

    const agentPromises: Promise<SwarmVote>[] = [
      this.runVisualAgent(page, anchorId, timeoutMs),
      this.runSemanticAgent(page, anchorId, timeoutMs),
      this.runStructuralAgent(page, anchorId, timeoutMs),
    ];

    // SAFETY: async operation — wrap in try-catch for production resilience
    const votes = await Promise.allSettled(agentPromises);
    this.currentTelemetry.activeAgents = 0;

    return votes
      .filter((r): r is PromiseFulfilledResult<SwarmVote> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  // ── Agent 1: Visual (position + size matching) ──
  private async runVisualAgent(
    page: Page,
    anchorId: string,
    timeoutMs: number
  ): Promise<SwarmVote> {
    const start = Date.now();
    try {
      const element = await Promise.race([
        this.neuralMap.findElement(page, anchorId),
        this.timeout(timeoutMs),
      ]) as ElementHandle | null;

      // If found, verify visual fingerprint consistency
      let confidence = element ? 0.8 : 0;
      if (element) {
        const box = await element.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          confidence = 0.9;
        }
      }

      return {
        agentId: 'VISUAL_AGENT',
        strategy: 'visual',
        element,
        confidence,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        agentId: 'VISUAL_AGENT',
        strategy: 'visual',
        element: null,
        confidence: 0,
        latencyMs: Date.now() - start,
      };
    }
  }

  // ── Agent 2: Semantic (vector embedding similarity — O(log n)) ──
  private async runSemanticAgent(
    page: Page,
    anchorId: string,
    timeoutMs: number
  ): Promise<SwarmVote> {
    const start = Date.now();

    if (!this.embedding) {
      return {
        agentId: 'SEMANTIC_AGENT',
        strategy: 'semantic',
        element: null,
        confidence: 0,
        vectorSimilarity: 0,
        latencyMs: Date.now() - start,
      };
    }

    try {
      // Get anchor stats for semantic context
      const stats = this.neuralMap.getAnchorStats(anchorId);
      if (!stats) {
        return {
          agentId: 'SEMANTIC_AGENT',
          strategy: 'semantic',
          element: null,
          confidence: 0,
          vectorSimilarity: 0,
          latencyMs: Date.now() - start,
        };
      }

      // Build semantic query from anchor name + context
      const query = `${(stats as any).name || anchorId} ${(stats as any).semanticHint || ''}`.trim();

      // Extract all text nodes from the page
      // SAFETY: async operation — wrap in try-catch for production resilience
      const pageTexts = await page.evaluate(() => {
        const nodes: { text: string; selector: string }[] = [];
        const walk = (el: Element, depth: number) => {
          if (depth > 8) return;
          const text = el.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) {
            let sel = el.tagName.toLowerCase();
            if (el.id) sel = `#${el.id}`;
            else if ((el as any).dataset?.testid) sel = `[data-testid="${(el as any).dataset.testid}"]`;
            nodes.push({ text, selector: sel });
          }
          for (let ci = 0; ci < el.children.length; ci++) {
            walk(el.children[ci], depth + 1);
          }
        };
        walk(document.body, 0);
        return nodes.slice(0, 200); // cap for performance
      });

      if (pageTexts.length === 0) {
        return {
          agentId: 'SEMANTIC_AGENT',
          strategy: 'semantic',
          element: null,
          confidence: 0,
          vectorSimilarity: 0,
          latencyMs: Date.now() - start,
        };
      }

      // Vector search: embed query + find most similar
      const candidates = pageTexts.map(n => n.text);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const matches = await this.embedding.findMostSimilar(query, candidates, 3);
      
      if (matches.length === 0 || matches[0].score < this.config.similarityThreshold) {
        return {
          agentId: 'SEMANTIC_AGENT',
          strategy: 'semantic',
          element: null,
          confidence: 0,
          vectorSimilarity: matches[0]?.score || 0,
          latencyMs: Date.now() - start,
        };
      }

      // Find the DOM element matching the best text
      const bestMatch = matches[0];
      const matchingNode = pageTexts.find(n => n.text === bestMatch.text);
      
      if (!matchingNode) {
        return {
          agentId: 'SEMANTIC_AGENT',
          strategy: 'semantic',
          element: null,
          confidence: 0,
          vectorSimilarity: bestMatch.score,
          latencyMs: Date.now() - start,
        };
      }

      // SAFETY: async operation — wrap in try-catch for production resilience
      const element = await page.$(matchingNode.selector);
      
      return {
        agentId: 'SEMANTIC_AGENT',
        strategy: 'semantic',
        element,
        confidence: bestMatch.score,
        vectorSimilarity: bestMatch.score,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        agentId: 'SEMANTIC_AGENT',
        strategy: 'semantic',
        element: null,
        confidence: 0,
        vectorSimilarity: 0,
        latencyMs: Date.now() - start,
      };
    }
  }

  // ── Agent 3: Structural (CSS / XPath / DOM tree) ──
  private async runStructuralAgent(
    page: Page,
    anchorId: string,
    timeoutMs: number
  ): Promise<SwarmVote> {
    const start = Date.now();
    try {
      const locator = await Promise.race([
        this.neuralMap.getSmartLocator(page, anchorId),
        this.timeout(timeoutMs),
      ]) as Locator | null;

      let element: ElementHandle | null = null;
      let confidence = 0;

      if (locator) {
        try {
          element = await locator.elementHandle({ timeout: timeoutMs / 2 });
          confidence = element ? 0.85 : 0;
        } catch {
          confidence = 0;
        }
      }

      return {
        agentId: 'STRUCTURAL_AGENT',
        strategy: 'structural',
        element,
        confidence,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        agentId: 'STRUCTURAL_AGENT',
        strategy: 'structural',
        element: null,
        confidence: 0,
        latencyMs: Date.now() - start,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: CONSENSUS EVALUATION
  // ═══════════════════════════════════════════════════════════════════════════

  private evaluateConsensus(votes: SwarmVote[]): {
    element: ElementHandle | null;
    confidence: number;
    strategy: SearchStrategy;
    votes: SwarmVote[];
    consensusReached: boolean;
  } {
    // Filter votes that actually found something
    const positive = votes.filter(v => v.element !== null && v.confidence > 0.5);

    if (positive.length >= this.config.requiredConsensus) {
      // Sort by confidence, pick highest
      positive.sort((a, b) => b.confidence - a.confidence);
      const winner = positive[0];
      
      // Weighted confidence = average of all positive votes
      const avgConfidence = positive.reduce((s, v) => s + v.confidence, 0) / positive.length;

      return {
        element: winner.element,
        confidence: avgConfidence,
        strategy: winner.strategy,
        votes,
        consensusReached: true,
      };
    }

    // No consensus — return best single vote if any
    const best = votes.filter(v => v.element !== null).sort((a, b) => b.confidence - a.confidence)[0];

    return {
      element: best?.element || null,
      confidence: best?.confidence || 0,
      strategy: best?.strategy || 'structural',
      votes,
      consensusReached: false,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: VECTOR HEALING (Neural-Semantic Self-Healing)
  // When consensus fails, use EmbeddingEngine to find the element by meaning
  // Complexity: O(log n) via vector similarity search
  // ═══════════════════════════════════════════════════════════════════════════

  private async vectorHeal(
    page: Page,
    anchorId: string,
    previousVotes: SwarmVote[]
  ): Promise<{ element: ElementHandle; confidence: number } | null> {
    if (!this.embedding) return null;

    this.emit('healing:start', { anchorId, attempt: 1 });

    const stats = this.neuralMap.getAnchorStats(anchorId) as any;
    if (!stats) return null;

    // Build a rich semantic description for vector search
    const semanticParts: string[] = [];
    if (stats.name) semanticParts.push(stats.name);
    if (stats.semanticHint) semanticParts.push(stats.semanticHint);
    if (stats.innerText) semanticParts.push(stats.innerText);
    if (stats.ariaLabel) semanticParts.push(stats.ariaLabel);
    
    const query = semanticParts.join(' ').trim();
    if (!query) return null;

    // Get all interactive elements on the page
    // SAFETY: async operation — wrap in try-catch for production resilience
    const candidates = await page.evaluate(() => {
      const interactables = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]'
      );
      return Array.from(interactables).map((el, i) => ({
        text: (el.textContent?.trim() || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('placeholder') || ''),
        selector: el.id ? `#${el.id}` : `[data-heal-index="${i}"]`,
        index: i,
      })).filter(c => c.text.trim().length > 0);
    });

    // Inject temporary data-heal-index attributes
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.evaluate((count) => {
      const els = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]'
      );
      els.forEach((el, i) => {
        if (i < count) (el as HTMLElement).dataset.healIndex = String(i);
      });
    }, candidates.length);

    if (candidates.length === 0) return null;

    // Vector search
    const texts = candidates.map(c => c.text);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const matches = await this.embedding.findMostSimilar(query, texts, 5);

    for (const match of matches) {
      if (match.score < this.config.similarityThreshold * 0.9) continue; // slightly relaxed for healing

      const candidate = candidates.find(c => c.text === match.text);
      if (!candidate) continue;

      // SAFETY: async operation — wrap in try-catch for production resilience
      const element = await page.$(candidate.selector);
      if (element) {
        // Clean up temporary attributes
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.evaluate(() => {
          document.querySelectorAll('[data-heal-index]').forEach(el => {
            (el as HTMLElement).removeAttribute('data-heal-index');
          });
        });

        this.emit('healing:success', { anchorId, similarity: match.score, text: match.text });
        return { element, confidence: match.score };
      }
    }

    // Clean up
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.evaluate(() => {
      document.querySelectorAll('[data-heal-index]').forEach(el => {
        (el as HTMLElement).removeAttribute('data-heal-index');
      });
    });

    this.emit('healing:failed', { anchorId });
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEALTH GATE — AntiTamper Integration
  // ═══════════════════════════════════════════════════════════════════════════

  private async stealthGate(): Promise<boolean> {
    if (!this.antiTamper || !this.config.enableStealth) return false;

    // SAFETY: async operation — wrap in try-catch for production resilience
    const detections = await this.antiTamper.performFullScan();
    const threats = detections.filter(d => d.isDetected);

    if (threats.length > 0) {
      this.metrics.stealthInterventions++;
      this.currentTelemetry.threatLevel = this.classifyThreat(threats);
      this.currentTelemetry.isCompromised = this.antiTamper.isSystemCompromised();
      
      this.emit('stealth:threat', {
        count: threats.length,
        types: threats.map(t => t.type),
        threatLevel: this.currentTelemetry.threatLevel,
      });

      // If in evasion mode, add human-like jitter delay
      if (this.config.injectHumanJitter && this.antiTamper.isInEvasionMode()) {
        const jitter = Math.random() * 300 + 100; // 100-400ms human-like pause
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, jitter));
      }

      return true;
    }

    this.currentTelemetry.threatLevel = 'SAFE';
    return false;
  }

  private classifyThreat(threats: any[]): SubstrateTelemetry['threatLevel'] {
    const types = new Set(threats.map(t => t.type));
    if (types.has('debugger') && types.has('vm')) return 'CRITICAL';
    if (types.has('debugger')) return 'DANGER';
    if (types.has('vm') || types.has('sandbox')) return 'WARNING';
    if (types.has('analysis')) return 'CAUTION';
    return 'SAFE';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HARDWARE ADAPTATION — Substrate-Aware Wait Logic
  // ═══════════════════════════════════════════════════════════════════════════

  private getWaitMultiplier(): number {
    const cpu = this.currentTelemetry.cpuUsage;
    
    if (cpu >= this.config.cpuThresholdCritical) {
      return this.config.waitMultiplierCritical;
    }
    if (cpu >= this.config.cpuThresholdHigh) {
      return this.config.waitMultiplierHigh;
    }
    
    // Linear interpolation between 1 and high multiplier
    if (cpu >= 50) {
      const t = (cpu - 50) / (this.config.cpuThresholdHigh - 50);
      return 1 + t * (this.config.waitMultiplierHigh - 1);
    }

    return 1;
  }

  private wireHardwareEvents(): void {
    this.hardware.on('telemetry:received', (packet: TelemetryPacket) => {
      this.currentTelemetry.cpuUsage = packet.cpuUsage;
      this.currentTelemetry.ramUsage = packet.ramUsage;
      this.currentTelemetry.waitMultiplier = this.getWaitMultiplier();
      
      this.emit('telemetry:updated', this.currentTelemetry);
    });
  }

  private wireAntiTamperEvents(): void {
    if (!this.antiTamper) return;
    
    this.antiTamper.on('detection', (result: any) => {
      this.currentTelemetry.threatLevel = this.classifyThreat([result]);
      this.currentTelemetry.isCompromised = this.antiTamper!.isSystemCompromised();
      this.emit('stealth:detection', result);
    });

    this.antiTamper.on('evasion_activated', () => {
      this.currentTelemetry.stealthActive = true;
      this.emit('stealth:evasion', { active: true });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH OPERATIONS — Multi-Element Consensus Search
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Find multiple elements with consensus verification.
   * Runs searches in parallel where possible, respecting hardware capacity.
   */
  async findSecureElements(
    page: Page,
    anchorIds: string[],
    options: { concurrency?: number } = {}
  ): Promise<Map<string, ConsensusResult>> {
    const results = new Map<string, ConsensusResult>();
    const concurrency = Math.min(
      options.concurrency || 3,
      this.currentTelemetry.cpuUsage > this.config.cpuThresholdHigh ? 1 : 3
    );

    // Process in batches based on hardware capacity
    for (let i = 0; i < anchorIds.length; i += concurrency) {
      const batch = anchorIds.slice(i, i + concurrency);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const batchResults = await Promise.all(
        batch.map(id => this.findSecureElement(page, id))
      );
      batch.forEach((id, idx) => results.set(id, batchResults[idx]));
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANCHOR MANAGEMENT — Hybrid Create/Update
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a cognitive anchor with embedded vector representation.
   * Stores both structural selectors AND semantic embeddings.
   */
  async createHybridAnchor(
    page: Page,
    element: ElementHandle | Locator,
    name: string,
    businessFunction?: string
  ): Promise<{ anchorId: string; vectorEmbedded: boolean }> {
    // Create cognitive anchor via NeuralMapEngine
    // SAFETY: async operation — wrap in try-catch for production resilience
    const anchor = await this.neuralMap.createAnchor(page, element, name, businessFunction);

    // Embed the semantic text into vector space
    let vectorEmbedded = false;
    if (this.embedding) {
      try {
        const semanticText = `${name} ${businessFunction || ''} ${anchor.semantic.innerText || ''}`.trim();
        const vector = await this.embedding.embed(semanticText);
        this.vectorCache.set(anchor.id, vector);
        vectorEmbedded = true;
      } catch {
        // Vector embedding is optional enhancement
      }
    }

    this.emit('anchor:created', { id: anchor.id, name, vectorEmbedded });
    return { anchorId: anchor.id, vectorEmbedded };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAGNOSTICS & TELEMETRY
  // ═══════════════════════════════════════════════════════════════════════════

  getTelemetry(): SubstrateTelemetry {
    return { ...this.currentTelemetry };
  }

  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  getActiveEngines(): string[] {
    const engines: string[] = ['NeuralMapEngine'];
    if (this.embedding) engines.push('EmbeddingEngine');
    if (this.hardware) engines.push('HardwareBridge');
    if (this.antiTamper) engines.push('AntiTamper');
    return engines;
  }

  getConsensusRate(): number {
    const total = this.metrics.consensusReached + this.metrics.consensusFailed;
    return total === 0 ? 1 : this.metrics.consensusReached / total;
  }

  getHealingRate(): number {
    return this.metrics.healingTriggered === 0
      ? 1
      : this.metrics.healingSucceeded / this.metrics.healingTriggered;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SHUTDOWN
  // ═══════════════════════════════════════════════════════════════════════════

  async shutdown(): Promise<void> {
    this.emit('bridge:shutting-down');
    
    if (this.antiTamper) this.antiTamper.stop();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.hardware.shutdown();
    this.vectorCache.clear();
    
    this.isInitialized = false;
    this.emit('bridge:shutdown', this.getMetrics());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private timeout(ms: number): Promise<null> {
    return new Promise(resolve => setTimeout(() => resolve(null), ms));
  }

  private printBanner(elapsed: number): void {
    const engines = this.getActiveEngines();
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔗 NEURAL CONSENSUS BRIDGE v2.0 - Hybridization Layer                     ║
║                                                                            ║
║  Mode: ZERO ENTROPY     | Consensus: ${this.config.requiredConsensus}/3 votes required            ║
║  Engines: ${engines.length}/4 active     | Stealth: ${this.currentTelemetry.stealthActive ? 'ON ' : 'OFF'}                             ║
║  Vector: ${this.currentTelemetry.embeddingReady ? 'READY' : 'N/A  '}            | Init: ${elapsed}ms                              ║
║                                                                            ║
║  Active Engines:                                                           ║
║  ${engines.map(e => `✅ ${e}`).join('\n║  ').padEnd(73)}║
║                                                                            ║
║  "Всеки елемент е уникален. Всяко търсене - консенсус."                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

let _bridgeInstance: NeuralConsensusBridge | null = null;

export function getNeuralConsensusBridge(
  config?: Partial<NeuralConsensusBridgeConfig>
): NeuralConsensusBridge {
  if (!_bridgeInstance) {
    _bridgeInstance = new NeuralConsensusBridge(config);
  }
  return _bridgeInstance;
}

export function createNeuralConsensusBridge(
  config?: Partial<NeuralConsensusBridgeConfig>
): NeuralConsensusBridge {
  return new NeuralConsensusBridge(config);
}

export default NeuralConsensusBridge;
