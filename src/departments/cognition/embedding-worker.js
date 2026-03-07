/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║              EMBEDDING WORKER — Worker Thread Script                          ║
 * ║                                                                               ║
 * ║   Runs EmbeddingEngine.js in an isolated Worker Thread.                      ║
 * ║   Receives messages from main thread, computes embeddings, sends back.       ║
 * ║                                                                               ║
 * ║   This file is executed INSIDE the worker — never imported directly.         ║
 * ║                                                                               ║
 * ║  Created: 2026-02-23 | QAntum Prime v28.3.0 - Phase 3                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// Worker Thread script runs inside its own V8 isolate.
// It loads TensorFlow.js + Universal Sentence Encoder independently.

const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const { EventEmitter } = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// In-Worker Embedding Engine (lightweight copy, no EventEmitter inheritance needed)
// ═══════════════════════════════════════════════════════════════════════════════

let model = null;
let isReady = false;
const cache = new Map();
const MAX_CACHE = 10000;

async function loadModel() {
  const startTime = Date.now();
  try {
    // Resolve TF.js from the main project's node_modules
    const basePath = workerData?.basePath || path.resolve(__dirname, '..');
    const requirePath = path.resolve(basePath, 'package.json');
    const { createRequire } = require('module');
    const parentRequire = createRequire(requirePath);

    let tf;
    try {
      tf = parentRequire('@tensorflow/tfjs-node');
      parentPort?.postMessage({ type: 'log', msg: '[EmbeddingWorker] Using tfjs-node backend' });
    } catch (_) {
      tf = parentRequire('@tensorflow/tfjs');
      parentPort?.postMessage({ type: 'log', msg: '[EmbeddingWorker] Using pure JS tfjs backend' });
    }

    const use = parentRequire('@tensorflow-models/universal-sentence-encoder');
    // SAFETY: async operation — wrap in try-catch for production resilience
    model = await use.load();
    isReady = true;

    const loadTime = Date.now() - startTime;
    parentPort?.postMessage({ type: 'ready', loadTimeMs: loadTime });
  } catch (err) {
    parentPort?.postMessage({ type: 'error', error: `Failed to load model: ${err.message}` });
  }
}

/**
 * Generate embedding for a single text.
 */
async function embed(text) {
  // Check cache
  const cached = cache.get(text);
  if (cached) return { vector: cached, cached: true };

  // SAFETY: async operation — wrap in try-catch for production resilience
  const embeddings = await model.embed([text]);
  // SAFETY: async operation — wrap in try-catch for production resilience
  const vector = (await embeddings.array())[0];
  embeddings.dispose();

  // Cache
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(text, vector);

  return { vector, cached: false };
}

/**
 * Batch embed multiple texts.
 */
async function embedBatch(texts, batchSize = 32) {
  const results = new Array(texts.length);
  const toEmbed = [];

  // Check cache
  for (let i = 0; i < texts.length; i++) {
    const cached = cache.get(texts[i]);
    if (cached) {
      results[i] = cached;
    } else {
      toEmbed.push({ index: i, text: texts[i] });
    }
  }

  // Embed uncached in batches
  for (let i = 0; i < toEmbed.length; i += batchSize) {
    const batch = toEmbed.slice(i, i + batchSize);
    const batchTexts = batch.map(item => item.text);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const embeddings = await model.embed(batchTexts);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const vectors = await embeddings.array();
    embeddings.dispose();

    for (let j = 0; j < batch.length; j++) {
      results[batch[j].index] = vectors[j];
      // Cache
      if (cache.size >= MAX_CACHE) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      cache.set(batch[j].text, vectors[j]);
    }
  }

  return results;
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

parentPort?.on('message', async (msg) => {
  const { id, action, payload } = msg;

  try {
    switch (action) {
      case 'embed': {
        if (!isReady) throw new Error('Model not loaded yet');
        const result = await embed(payload.text);
        parentPort?.postMessage({ id, type: 'result', result });
        break;
      }

      case 'embedBatch': {
        if (!isReady) throw new Error('Model not loaded yet');
        const vectors = await embedBatch(payload.texts, payload.batchSize || 32);
        parentPort?.postMessage({ id, type: 'result', result: vectors });
        break;
      }

      case 'similarity': {
        if (!isReady) throw new Error('Model not loaded yet');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const [vecA, vecB] = await embedBatch([payload.text1, payload.text2]);
        const score = cosineSimilarity(vecA, vecB);
        parentPort?.postMessage({ id, type: 'result', result: score });
        break;
      }

      case 'findSimilar': {
        if (!isReady) throw new Error('Model not loaded yet');
        const allTexts = [payload.query, ...payload.candidates];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const allVecs = await embedBatch(allTexts);
        const queryVec = allVecs[0];
        const scores = payload.candidates.map((text, i) => ({
          text,
          score: cosineSimilarity(queryVec, allVecs[i + 1]),
        }));
        scores.sort((a, b) => b.score - a.score);
        const topK = scores.slice(0, payload.topK || 5);
        parentPort?.postMessage({ id, type: 'result', result: topK });
        break;
      }

      case 'clearCache': {
        cache.clear();
        parentPort?.postMessage({ id, type: 'result', result: { cleared: true } });
        break;
      }

      case 'stats': {
        parentPort?.postMessage({
          id,
          type: 'result',
          result: { cacheSize: cache.size, isReady },
        });
        break;
      }

      case 'ping': {
        parentPort?.postMessage({ id, type: 'result', result: 'pong' });
        break;
      }

      default:
        parentPort?.postMessage({ id, type: 'error', error: `Unknown action: ${action}` });
    }
  } catch (err) {
    parentPort?.postMessage({ id, type: 'error', error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-LOAD MODEL ON STARTUP
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
loadModel();
