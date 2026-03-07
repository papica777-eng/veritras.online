/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   🔮 SENTIMENT ENGINE – Oracle Layer                                      ║
 * ║   "The Market is Psychology. Capture the Psychology."                     ║
 * ║                                                                           ║
 * ║   Part of QANTUM SINGULARITY – Oracle Layer                               ║
 * ║                                                                           ║
 * ║   Data Sources:                                                           ║
 * ║     • Twitter/X  – real-time social sentiment (Elon tweets, etc.)        ║
 * ║     • Bloomberg  – institutional news headlines                           ║
 * ║     • On-Chain   – Whale Alert, large wallet movements                   ║
 * ║     • Fear&Greed – market psychology index                                ║
 * ║                                                                           ║
 * ║   Output: Normalised SentimentSignal [-1.0 bearish → +1.0 bullish]       ║
 * ║                                                                           ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Raw signal from a single data source */
export interface RawSignal {
  source: SentimentSource;
  content: string;            // Raw text / headline / tx description
  score: number;              // Pre-normalised score from source [-1, 1]
  confidence: number;         // Source confidence 0–1
  symbol?: string;            // Related crypto symbol if available
  timestamp: number;
}

/** Aggregated sentiment signal ready for strategy consumption */
export interface SentimentSignal {
  symbol: string;             // e.g. 'BTC', 'ETH', 'DOGE'
  score: number;              // Composite score [-1.0, +1.0]
  magnitude: number;          // Strength of signal [0.0, 1.0]
  direction: 'bullish' | 'bearish' | 'neutral';
  sources: SentimentSource[];
  breakdown: Record<SentimentSource, number>;
  topEvent?: string;          // Most impactful event description
  timestamp: number;
  expiresAt: number;          // Score becomes stale after this
}

/** On-chain whale transaction */
export interface WhaleTransaction {
  hash: string;
  symbol: string;
  amountUSD: number;
  direction: 'inflow' | 'outflow';  // to/from exchange
  fromAddress: string;
  toAddress: string;
  isExchangeAddress: boolean;
  timestamp: number;
}

export type SentimentSource = 'twitter' | 'bloomberg' | 'onchain' | 'fear_greed' | 'reddit';

/** Configuration */
export interface SentimentEngineConfig {
  /** Polling intervals per source (ms) */
  pollIntervals: Partial<Record<SentimentSource, number>>;
  /** Score time-to-live in ms */
  scoreTtlMs: number;
  /** Minimum whale transaction size (USD) to act on */
  whaleThresholdUSD: number;
  /** Source weights in the composite score */
  sourceWeights: Record<SentimentSource, number>;
  /** Whether to emit events for every raw signal */
  verboseEvents: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SENTIMENT ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SentimentEngine
 *
 * Fuses multiple real-time sentiment data streams into a single composite
 * sentiment score per trading symbol. Designed to run as a background service
 * that feeds the GenusEngine's RL state vector.
 *
 * In production, replace the `fetch*` stub methods with real API calls:
 *   - Twitter API v2 (bearer token)
 *   - Bloomberg B-PIPE or REST API
 *   - Whale Alert API
 *   - Alternative.me Fear & Greed Index
 */
export class SentimentEngine extends EventEmitter {
  private readonly config: SentimentEngineConfig;

  /** Latest composite scores per symbol */
  private scores: Map<string, SentimentSignal> = new Map();

  /** Raw signal buffer for audit */
  private signalBuffer: RawSignal[] = [];

  /** Active poll timers */
  private timers: NodeJS.Timeout[] = [];

  private isRunning = false;

  constructor(config: Partial<SentimentEngineConfig> = {}) {
    super();
    this.config = {
      pollIntervals: {
        twitter: 5_000,
        bloomberg: 15_000,
        onchain: 10_000,
        fear_greed: 60_000,
        reddit: 30_000,
      },
      scoreTtlMs: 5 * 60_000,  // 5 minutes
      whaleThresholdUSD: 1_000_000,
      sourceWeights: {
        twitter: 0.30,
        bloomberg: 0.25,
        onchain: 0.25,
        fear_greed: 0.10,
        reddit: 0.10,
      },
      verboseEvents: false,
      ...config,
    };

    console.log('🔮 SentimentEngine (Oracle Layer) initialised');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /** Start the sentiment polling loops */
  // Complexity: O(N) — linear iteration
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const sources: SentimentSource[] = ['twitter', 'bloomberg', 'onchain', 'fear_greed', 'reddit'];
    for (const source of sources) {
      const interval = this.config.pollIntervals[source] ?? 30_000;
      // Run immediately, then on interval
      this.pollSource(source);
      const timer = setInterval(() => this.pollSource(source), interval);
      this.timers.push(timer);
    }

    console.log('🔮 SentimentEngine started – polling all sources');
  }

  /** Stop all polling loops */
  // Complexity: O(N) — linear iteration
  stop(): void {
    for (const timer of this.timers) clearInterval(timer);
    this.timers = [];
    this.isRunning = false;
    console.log('🔮 SentimentEngine stopped');
  }

  /**
   * Get the current composite sentiment score for a symbol.
   * Returns null if no data available or data is stale.
   */
  // Complexity: O(1) — hash/map lookup
  getScore(symbol: string): SentimentSignal | null {
    const sig = this.scores.get(symbol.toUpperCase());
    if (!sig) return null;
    if (Date.now() > sig.expiresAt) {
      this.scores.delete(symbol.toUpperCase());
      return null;
    }
    return sig;
  }

  /**
   * Ingest a raw signal (use this if you have a live websocket feed).
   * This is also used internally by the polling stubs.
   */
  // Complexity: O(1)
  ingest(signal: RawSignal): void {
    this.signalBuffer.push(signal);
    if (this.signalBuffer.length > 1000) this.signalBuffer.shift();

    if (this.config.verboseEvents) {
      this.emit('rawSignal', signal);
    }

    const symbol = (signal.symbol ?? 'BTC').toUpperCase();
    this.recomputeScore(symbol);
  }

  /** Get all active sentiment scores */
  // Complexity: O(N) — linear iteration
  getAllScores(): Map<string, SentimentSignal> {
    const now = Date.now();
    for (const [sym, sig] of this.scores.entries()) {
      if (now > sig.expiresAt) this.scores.delete(sym);
    }
    return new Map(this.scores);
  }

  /** Get recent signal buffer */
  // Complexity: O(1)
  getSignalBuffer(limit = 50): RawSignal[] {
    return this.signalBuffer.slice(-limit);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – POLLING STUBS
  // Replace with real API calls in production.
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  private async pollSource(source: SentimentSource): Promise<void> {
    try {
      let signals: RawSignal[] = [];
      switch (source) {
        case 'twitter':    signals = await this.fetchTwitter(); break;
        case 'bloomberg':  signals = await this.fetchBloomberg(); break;
        case 'onchain':    signals = await this.fetchOnChain(); break;
        case 'fear_greed': signals = await this.fetchFearGreed(); break;
        case 'reddit':     signals = await this.fetchReddit(); break;
      }
      for (const s of signals) this.ingest(s);
    } catch (err) {
      this.emit('pollError', { source, error: String(err) });
    }
  }

  /**
   * Twitter/X stub – connect to Twitter API v2 in production.
   * Tracks mentions of crypto keywords + influencer accounts.
   */
  // Complexity: O(N)
  private async fetchTwitter(): Promise<RawSignal[]> {
    // Production: query Twitter API v2 filtered stream for BTC, ETH, DOGE etc.
    // const resp = await fetch('https://api.twitter.com/2/tweets/search/stream', {
    //   headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    // });
    return this.simulateSignals('twitter', ['BTC', 'ETH', 'DOGE'], 2);
  }

  /**
   * Bloomberg stub – connect to B-PIPE or Bloomberg REST API in production.
   */
  // Complexity: O(N) — potential recursive descent
  private async fetchBloomberg(): Promise<RawSignal[]> {
    // Production: query Bloomberg Terminal REST API for crypto headlines
    return this.simulateSignals('bloomberg', ['BTC', 'ETH'], 1);
  }

  /**
   * On-chain stub – connect to Whale Alert API in production.
   */
  // Complexity: O(N) — linear iteration
  private async fetchOnChain(): Promise<RawSignal[]> {
    // Production: GET https://api.whale-alert.io/v1/transactions?api_key=...
    const signals: RawSignal[] = [];
    const symbols = ['BTC', 'ETH', 'USDT'];
    for (const sym of symbols) {
      const tx = this.simulateWhaleTransaction(sym);
      if (tx.amountUSD >= this.config.whaleThresholdUSD) {
        // Large inflow to exchange → bearish (sell pressure)
        // Large outflow from exchange → bullish (accumulation)
        const score = tx.direction === 'inflow' ? -0.6 : 0.6;
        signals.push({
          source: 'onchain',
          content: `Whale ${tx.direction}: ${tx.amountUSD.toLocaleString()} USD of ${sym}`,
          score,
          confidence: 0.85,
          symbol: sym,
          timestamp: Date.now(),
        });
        this.emit('whaleDetected', tx);
      }
    }
    return signals;
  }

  /**
   * Fear & Greed Index stub – connect to Alternative.me in production.
   */
  // Complexity: O(1)
  private async fetchFearGreed(): Promise<RawSignal[]> {
    // Production: GET https://api.alternative.me/fng/
    const index = 40 + Math.random() * 40; // 0=Extreme Fear, 100=Extreme Greed
    const score = (index / 50) - 1; // normalise to [-1, 1]
    return [{
      source: 'fear_greed',
      content: `Fear & Greed Index: ${index.toFixed(0)}`,
      score,
      confidence: 0.70,
      symbol: 'BTC', // applies market-wide
      timestamp: Date.now(),
    }];
  }

  /**
   * Reddit stub – connect to Pushshift or Reddit API in production.
   */
  // Complexity: O(N) — potential recursive descent
  private async fetchReddit(): Promise<RawSignal[]> {
    return this.simulateSignals('reddit', ['BTC', 'ETH', 'SOL'], 1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – SCORE COMPUTATION
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  private recomputeScore(symbol: string): void {
    const cutoff = Date.now() - this.config.scoreTtlMs;
    const recent = this.signalBuffer.filter(
      (s) => (s.symbol ?? 'BTC').toUpperCase() === symbol && s.timestamp > cutoff,
    );

    if (recent.length === 0) {
      this.scores.delete(symbol);
      return;
    }

    const breakdown: Record<SentimentSource, number> = {
      twitter: 0, bloomberg: 0, onchain: 0, fear_greed: 0, reddit: 0,
    };
    const counts: Record<SentimentSource, number> = {
      twitter: 0, bloomberg: 0, onchain: 0, fear_greed: 0, reddit: 0,
    };

    for (const s of recent) {
      breakdown[s.source] = (breakdown[s.source] ?? 0) + s.score * s.confidence;
      counts[s.source] = (counts[s.source] ?? 0) + 1;
    }

    // Weighted composite score
    let composite = 0;
    let totalWeight = 0;
    for (const src of Object.keys(breakdown) as SentimentSource[]) {
      if (counts[src] > 0) {
        const avg = breakdown[src] / counts[src];
        const weight = this.config.sourceWeights[src];
        composite += avg * weight;
        totalWeight += weight;
        breakdown[src] = avg;
      }
    }

    if (totalWeight > 0) composite /= totalWeight;
    composite = Math.max(-1, Math.min(1, composite));

    const magnitude = Math.abs(composite);
    const direction: SentimentSignal['direction'] =
      composite > 0.1 ? 'bullish' : composite < -0.1 ? 'bearish' : 'neutral';

    const topSignal = [...recent].sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0];

    const signal: SentimentSignal = {
      symbol,
      score: composite,
      magnitude,
      direction,
      sources: [...new Set(recent.map((s) => s.source))],
      breakdown,
      topEvent: topSignal?.content,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.scoreTtlMs,
    };

    const prev = this.scores.get(symbol);
    this.scores.set(symbol, signal);

    // Emit signal change if meaningful shift
    if (!prev || Math.abs(signal.score - prev.score) > 0.1) {
      this.emit('sentimentShift', signal);
      if (magnitude > 0.7) {
        console.log(
          `🔮 STRONG SIGNAL [${symbol}] ${direction.toUpperCase()} score=${composite.toFixed(3)} | ${topSignal?.content ?? ''}`,
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – SIMULATION HELPERS (replace in production)
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(1) — hash/map lookup
  private simulateSignals(source: SentimentSource, symbols: string[], count: number): RawSignal[] {
    return Array.from({ length: count }, () => ({
      source,
      content: `[sim] ${source} signal`,
      score: (Math.random() - 0.5) * 2,
      confidence: 0.5 + Math.random() * 0.4,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      timestamp: Date.now(),
    }));
  }

  // Complexity: O(1)
  private simulateWhaleTransaction(symbol: string): WhaleTransaction {
    const amountUSD = Math.random() * 5_000_000;
    return {
      hash: Math.random().toString(36).slice(2),
      symbol,
      amountUSD,
      direction: Math.random() > 0.5 ? 'inflow' : 'outflow',
      fromAddress: '0x' + Math.random().toString(16).slice(2, 42),
      toAddress: '0x' + Math.random().toString(16).slice(2, 42),
      isExchangeAddress: Math.random() > 0.5,
      timestamp: Date.now(),
    };
  }
}

// Export singleton
export const sentimentEngine = new SentimentEngine();
