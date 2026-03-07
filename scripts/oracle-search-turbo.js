/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ORACLE SEARCH TURBO - High-Value Targeting via Semantic Search
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "Старият скрипт намираше код. Новият намира възможности."
 * 
 * Features:
 * - Pinecone semantic search (52,573+ vectors)
 * - Local embeddings via Xenova/all-MiniLM-L6-v2 (FREE)
 * - High-value target filtering
 * - Cross-project context awareness
 * 
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 28.5.0 - THE AWAKENING
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const { pipeline } = require('@xenova/transformers');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const PINECONE_INDEX = 'qantum-empire';
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const DEFAULT_TOP_K = 10;

// Savings tracker: $0.01 per embedding saved vs OpenAI
let totalSearches = 0;
let totalSavings = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

let pc = null;
let extractor = null;
let isInitialized = false;

async function initialize() {
    if (isInitialized) return;

    console.log('🔮 [ORACLE] Initializing Semantic Search Engine...');

    // Initialize Pinecone
    pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || 'your-pinecone-api-key'
    });

    // Initialize local embedding model (FREE - no API costs)
    console.log('🧠 [ORACLE] Loading local embedding model (saves $0.01/search)...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    extractor = await pipeline('feature-extraction', EMBEDDING_MODEL);

    isInitialized = true;
    console.log('✅ [ORACLE] Ready. 52,573+ vectors at your command.');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Search for high-value targets based on semantic query
 * @param {string} queryText - The search query
 * @param {object} options - Search options
 * @returns {Promise<Array>} - Matching vectors with metadata
 */
async function searchHighValueTargets(queryText, options = {}) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await initialize();

    const {
        topK = DEFAULT_TOP_K,
        filter = {},
        includeValues = false,
    } = options;

    console.log(`🔍 [ORACLE] Searching: "${queryText.substring(0, 50)}..."`);

    // Generate embedding locally (FREE)
    // SAFETY: async operation — wrap in try-catch for production resilience
    const output = await extractor(queryText, { 
        pooling: 'mean', 
        normalize: true 
    });
    const queryVector = Array.from(output.data);

    // Track savings
    totalSearches++;
    totalSavings += 0.01;

    // Query Pinecone
    const index = pc.index(PINECONE_INDEX);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const queryResponse = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        includeValues,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
    });

    console.log(`✅ [ORACLE] Found ${queryResponse.matches.length} matches`);
    console.log(`💰 [SAVINGS] Total: $${totalSavings.toFixed(2)} (${totalSearches} searches)`);

    return queryResponse.matches;
}

/**
 * Search with Mister Mind Logic - Find targets with critical latency or vulnerabilities
 * @param {string} queryText - The search query
 * @returns {Promise<Array>} - High-priority matching vectors
 */
async function searchCriticalTargets(queryText) {
    return searchHighValueTargets(queryText, {
        topK: 10,
        filter: {
            priority: { $eq: 'high' },
            type: { $eq: 'vulnerability' }
        }
    });
}

/**
 * Find context for code healing
 * @param {string} errorContext - Error description and context
 * @returns {Promise<string>} - Relevant code context from the empire
 */
async function findContext(errorContext) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const matches = await searchHighValueTargets(errorContext, {
        topK: 5,
        filter: {
            type: { $in: ['code', 'implementation', 'fix'] }
        }
    });

    if (matches.length === 0) {
        return 'No relevant context found in the knowledge base.';
    }

    // Compile context from matches
    const contextParts = matches.map((match, i) => {
        const meta = match.metadata || {};
        return `
[Context ${i + 1}] Score: ${(match.score * 100).toFixed(1)}%
File: ${meta.file || 'unknown'}
Type: ${meta.type || 'code'}
Content: ${meta.content || meta.text || 'N/A'}
        `.trim();
    });

    return contextParts.join('\n\n---\n\n');
}

/**
 * Find the best QAntum module for a specific problem
 * @param {string} problemDescription - Description of the client's problem
 * @returns {Promise<Array>} - Best matching modules
 */
async function findBestModule(problemDescription) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const matches = await searchHighValueTargets(
        `Best QAntum module for: ${problemDescription}`,
        {
            topK: 3,
            filter: {
                type: { $eq: 'module' }
            }
        }
    );

    return matches.map(m => ({
        module: m.metadata?.file || m.metadata?.name,
        score: m.score,
        description: m.metadata?.description || m.metadata?.content,
    }));
}

/**
 * Search for leads with specific issues
 * @param {string} issueType - Type of issue to find leads for
 * @returns {Promise<Array>} - Leads matching the issue type
 */
async function findLeadsWithIssue(issueType) {
    return searchHighValueTargets(issueType, {
        topK: 20,
        filter: {
            source: { $eq: 'leads' },
            priority: { $in: ['high', 'critical'] }
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDEXING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Upsert vectors to Pinecone
 * @param {Array} vectors - Array of {id, values, metadata} objects
 * @param {string} namespace - Optional namespace
 */
async function upsertVectors(vectors, namespace = '') {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await initialize();

    const index = pc.index(PINECONE_INDEX);
    
    // Batch upsert (Pinecone limit: 100 vectors per batch)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await index.upsert(batch, { namespace });
        console.log(`📤 [ORACLE] Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }

    console.log(`✅ [ORACLE] Indexed ${vectors.length} vectors`);
}

/**
 * Generate embedding for text
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} - Embedding vector
 */
async function generateEmbedding(text) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await initialize();

    // SAFETY: async operation — wrap in try-catch for production resilience
    const output = await extractor(text, { 
        pooling: 'mean', 
        normalize: true 
    });
    
    totalSearches++;
    totalSavings += 0.01;

    return Array.from(output.data);
}

/**
 * Index a lead into Pinecone for semantic search
 * @param {object} lead - Lead data
 */
async function indexLead(lead) {
    const textContent = `
        Company: ${lead.company}
        Issues: ${lead.issues?.join(', ') || lead.detected_issue || ''}
        Priority: ${lead.priority}
        Vulnerability: ${lead.vulnerability_type || 'unknown'}
    `;

    // SAFETY: async operation — wrap in try-catch for production resilience
    const embedding = await generateEmbedding(textContent);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await upsertVectors([{
        id: `lead_${lead.id}`,
        values: embedding,
        metadata: {
            ...lead,
            source: 'leads',
            type: 'lead',
            indexed_at: new Date().toISOString(),
        }
    }]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get Oracle search statistics
 */
function getStats() {
    return {
        totalSearches,
        totalSavings,
        averageSavingPerSearch: 0.01,
        projectedSavingsAt1M: 10000, // $10,000 at 1M searches
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    // Core search
    searchHighValueTargets,
    searchCriticalTargets,
    findContext,
    findBestModule,
    findLeadsWithIssue,
    
    // Indexing
    upsertVectors,
    generateEmbedding,
    indexLead,
    
    // Utilities
    initialize,
    getStats,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLI SUPPORT
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    const args = process.argv.slice(2);
    const query = args.join(' ') || 'Ghost Protocol security testing';

    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ORACLE SEARCH TURBO v28.5.0                                ║
║                                                                               ║
║  "Старият скрипт намираше код. Новият намира възможности."                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);

    // Complexity: O(N) — linear scan
    searchHighValueTargets(query)
        .then(results => {
            console.log('\n📊 RESULTS:\n');
            results.forEach((r, i) => {
                console.log(`${i + 1}. [${(r.score * 100).toFixed(1)}%] ${r.metadata?.file || r.id}`);
                if (r.metadata?.description) {
                    console.log(`   ${r.metadata.description.substring(0, 80)}...`);
                }
            });
            console.log('\n', getStats());
        })
        .catch(console.error);
}
