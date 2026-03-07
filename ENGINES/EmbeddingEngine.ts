/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   EMBEDDING ENGINE v1.0                                                       ║
 * ║   "Transforming Words into Vectors"                                           ║
 * ║                                                                               ║
 * ║   Universal Sentence Encoder wrapper for generating 512-dim embeddings        ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmbeddingEngineConfig {
  modelPath?: string;
  batchSize: number;
  cacheEnabled: boolean;
  maxCacheSize: number;
}

// Alias for backwards compatibility
export type EmbeddingConfig = EmbeddingEngineConfig;

// Function type for embedding generation
export type EmbedFunction = (texts: string[]) => Promise<number[][]>;

export interface EmbeddingResult {
  text: string;
  vector: number[];
  cached: boolean;
  timeMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: EmbeddingEngineConfig = {
  batchSize: 32,
  cacheEnabled: true,
  maxCacheSize: 10000,
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class EmbeddingEngine extends EventEmitter {
  private config: EmbeddingEngineConfig;
  private model: any = null;
  private isLoading = false;
  private isReady = false;
  
  // Cache
  private cache: Map<string, number[]> = new Map();
  
  // Stats
  private stats = {
    embeddings: 0,
    cacheHits: 0,
    totalTimeMs: 0,
    loadTimeMs: 0,
  };

  constructor(config: Partial<EmbeddingEngineConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODEL MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load the Universal Sentence Encoder model
   */
  async load(): Promise<void> {
    if (this.isReady || this.isLoading) return;
    
    this.isLoading = true;
    const startTime = Date.now();
    
    try {
      console.log('[EmbeddingEngine] ⏳ Loading Universal Sentence Encoder...');
      
      // Dynamic import for TensorFlow
      const tf = await import('@tensorflow/tfjs-node');
      const use = await import('@tensorflow-models/universal-sentence-encoder');
      
      this.model = await use.load();
      
      this.stats.loadTimeMs = Date.now() - startTime;
      this.isReady = true;
      this.isLoading = false;
      
      console.log(`[EmbeddingEngine] ✅ Model loaded in ${this.stats.loadTimeMs}ms`);
      this.emit('loaded', { loadTimeMs: this.stats.loadTimeMs });
      
    } catch (error) {
      this.isLoading = false;
      console.error('[EmbeddingEngine] ❌ Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Check if model is ready
   */
  ready(): boolean {
    return this.isReady;
  }

  /**
   * Wait for model to be ready
   */
  async waitForReady(): Promise<void> {
    if (this.isReady) return;
    
    if (!this.isLoading) {
      await this.load();
      return;
    }
    
    // Wait for loading to complete
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (this.isReady) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMBEDDING GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<number[]> {
    await this.waitForReady();
    
    // Check cache
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(text);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
    }
    
    const startTime = Date.now();
    
    try {
      const embeddings = await this.model.embed([text]);
      const vector = await embeddings.array();
      embeddings.dispose();
      
      const result = vector[0] as number[];
      
      // Update stats
      this.stats.embeddings++;
      this.stats.totalTimeMs += Date.now() - startTime;
      
      // Cache result
      if (this.config.cacheEnabled) {
        this.addToCache(text, result);
      }
      
      return result;
      
    } catch (error) {
      console.error('[EmbeddingEngine] ❌ Embedding failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    await this.waitForReady();
    
    const results: number[][] = [];
    const toEmbed: { index: number; text: string }[] = [];
    
    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      if (this.config.cacheEnabled) {
        const cached = this.cache.get(texts[i]);
        if (cached) {
          results[i] = cached;
          this.stats.cacheHits++;
          continue;
        }
      }
      toEmbed.push({ index: i, text: texts[i] });
    }
    
    // Embed uncached texts in batches
    if (toEmbed.length > 0) {
      const startTime = Date.now();
      
      for (let i = 0; i < toEmbed.length; i += this.config.batchSize) {
        const batch = toEmbed.slice(i, i + this.config.batchSize);
        const batchTexts = batch.map(item => item.text);
        
        const embeddings = await this.model.embed(batchTexts);
        const vectors = await embeddings.array();
        embeddings.dispose();
        
        // Store results
        for (let j = 0; j < batch.length; j++) {
          const vector = vectors[j] as number[];
          results[batch[j].index] = vector;
          
          // Cache result
          if (this.config.cacheEnabled) {
            this.addToCache(batch[j].text, vector);
          }
        }
      }
      
      this.stats.embeddings += toEmbed.length;
      this.stats.totalTimeMs += Date.now() - startTime;
    }
    
    return results;
  }

  /**
   * Generate embedding with metadata
   */
  async embedWithInfo(text: string): Promise<EmbeddingResult> {
    const startTime = Date.now();
    
    // Check cache
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(text);
      if (cached) {
        this.stats.cacheHits++;
        return {
          text,
          vector: cached,
          cached: true,
          timeMs: Date.now() - startTime,
        };
      }
    }
    
    const vector = await this.embed(text);
    
    return {
      text,
      vector,
      cached: false,
      timeMs: Date.now() - startTime,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SIMILARITY OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate similarity between two texts
   */
  async textSimilarity(text1: string, text2: string): Promise<number> {
    const [vec1, vec2] = await this.embedBatch([text1, text2]);
    return this.cosineSimilarity(vec1, vec2);
  }

  /**
   * Find most similar texts from a list
   */
  async findMostSimilar(
    query: string, 
    candidates: string[], 
    topK = 5
  ): Promise<Array<{ text: string; score: number }>> {
    const queryVector = await this.embed(query);
    const candidateVectors = await this.embedBatch(candidates);
    
    const scores = candidates.map((text, i) => ({
      text,
      score: this.cosineSimilarity(queryVector, candidateVectors[i]),
    }));
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  private addToCache(text: string, vector: number[]): void {
    // Evict oldest if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(text, vector);
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[EmbeddingEngine] 🗑️ Cache cleared');
  }

  /**
   * Preload texts into cache
   */
  async preloadCache(texts: string[]): Promise<void> {
    console.log(`[EmbeddingEngine] ⏳ Preloading ${texts.length} texts into cache...`);
    await this.embedBatch(texts);
    console.log(`[EmbeddingEngine] ✅ Preloaded ${texts.length} embeddings`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get engine statistics
   */
  getStats(): {
    isReady: boolean;
    embeddings: number;
    cacheHits: number;
    cacheSize: number;
    avgTimeMs: number;
    loadTimeMs: number;
    hitRate: number;
  } {
    const totalRequests = this.stats.embeddings + this.stats.cacheHits;
    
    return {
      isReady: this.isReady,
      embeddings: this.stats.embeddings,
      cacheHits: this.stats.cacheHits,
      cacheSize: this.cache.size,
      avgTimeMs: this.stats.embeddings > 0 
        ? Math.round(this.stats.totalTimeMs / this.stats.embeddings) 
        : 0,
      loadTimeMs: this.stats.loadTimeMs,
      hitRate: totalRequests > 0 
        ? Math.round((this.stats.cacheHits / totalRequests) * 100) 
        : 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

let embeddingEngineInstance: EmbeddingEngine | null = null;

/**
 * Get or create the singleton embedding engine
 */
export async function getEmbeddingEngine(): Promise<EmbeddingEngine> {
  if (!embeddingEngineInstance) {
    embeddingEngineInstance = new EmbeddingEngine();
    await embeddingEngineInstance.load();
  }
  return embeddingEngineInstance;
}

/**
 * Create embed function for PineconeContextBridge
 */
export function createEmbedFunction(engine: EmbeddingEngine): (text: string) => Promise<number[]> {
  return (text: string) => engine.embed(text);
}

export default EmbeddingEngine;
