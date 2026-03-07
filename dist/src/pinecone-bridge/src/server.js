"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CONTEXT BRIDGE SERVER v1.0                                           ║
 * ║   "The API That Never Forgets"                                                ║
 * ║                                                                               ║
 * ║   HTTP Server exposing Pinecone Bridge functionality                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const PineconeContextBridge_1 = require("../../../scripts/qantum/SaaS-Framework/scripts/data/PineconeContextBridge");
const PersistentContextStore_js_1 = require("./PersistentContextStore.js");
const EmbeddingEngine_js_1 = require("./EmbeddingEngine.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ═══════════════════════════════════════════════════════════════════════════════
// SERVER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const PORT = process.env.BRIDGE_PORT || 8899;
const API_KEY = process.env.BRIDGE_API_KEY || 'QAntum-bridge-key';
// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const bridge = new PineconeContextBridge_1.PineconeContextBridge({
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX || 'QAntum-empire',
    namespace: process.env.PINECONE_NAMESPACE || 'empire',
});
const store = new PersistentContextStore_js_1.PersistentContextStore();
const embedEngine = new EmbeddingEngine_js_1.EmbeddingEngine();
// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESS APP
// ═══════════════════════════════════════════════════════════════════════════════
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json({ limit: '10mb' }));
// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    // Complexity: O(1)
    next();
});
// API Key authentication (optional)
const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (apiKey && apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    // Complexity: O(1) — lookup
    next();
};
// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH & STATUS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        bridge: bridge.connected(),
        embeddings: embedEngine.ready(),
        timestamp: Date.now(),
    });
});
app.get('/status', authenticate, async (req, res) => {
    try {
        const bridgeStats = bridge.getStats();
        const storeStats = store.getStats();
        const embedStats = embedEngine.getStats();
        res.json({
            bridge: bridgeStats,
            store: storeStats,
            embeddings: embedStats,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// SESSION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Create a new session
 */
app.post('/sessions', authenticate, (req, res) => {
    try {
        const { name, projectScope } = req.body;
        const session = bridge.createSession(undefined, projectScope);
        // Persist session
        store.saveSession({
            ...session,
            name: name || 'Unnamed Session',
            metadata: {},
        });
        res.json({
            success: true,
            session: {
                sessionId: session.sessionId,
                name: name || 'Unnamed Session',
                createdAt: session.createdAt,
                projectScope: session.projectScope,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Get all sessions
 */
app.get('/sessions', authenticate, (req, res) => {
    try {
        const sessions = store.getAllSessions();
        res.json({ sessions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Get session by ID
 */
app.get('/sessions/:sessionId', authenticate, (req, res) => {
    try {
        const session = store.loadSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ session });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Delete session
 */
app.delete('/sessions/:sessionId', authenticate, (req, res) => {
    try {
        store.deleteSession(req.params.sessionId);
        bridge.clearSession(req.params.sessionId);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// QUERY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Query by text (semantic search)
 */
app.post('/query', authenticate, async (req, res) => {
    try {
        const { query, sessionId, topK = 10, minScore = 0.5, filter, contextual = false, } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query text is required' });
        }
        const embedFn = (0, EmbeddingEngine_js_1.createEmbedFunction)(embedEngine);
        let result;
        if (contextual && sessionId) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            result = await bridge.queryContextual(query, sessionId, embedFn, { topK, minScore });
        }
        else {
            // SAFETY: async operation — wrap in try-catch for production resilience
            result = await bridge.queryByText(query, embedFn, { topK, minScore, filter, sessionId });
        }
        // Save query to persistent store
        if (sessionId) {
            store.saveQuery(sessionId, query, result.matches.slice(0, 5), result.queryTimeMs);
        }
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Search code by description
 */
app.post('/search/code', authenticate, async (req, res) => {
    try {
        const { description, project, fileType, sessionId, topK = 15 } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        const embedFn = (0, EmbeddingEngine_js_1.createEmbedFunction)(embedEngine);
        const result = await bridge.searchCode(description, embedFn, { project, fileType, sessionId, topK });
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Find similar code
 */
app.post('/search/similar', authenticate, async (req, res) => {
    try {
        const { code, excludeFile, sessionId, topK = 10 } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Code snippet is required' });
        }
        const embedFn = (0, EmbeddingEngine_js_1.createEmbedFunction)(embedEngine);
        const result = await bridge.findSimilarCode(code, embedFn, { excludeFile, sessionId, topK });
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Save conversation message
 */
app.post('/conversations/:sessionId/messages', authenticate, (req, res) => {
    try {
        const { sessionId } = req.params;
        const { role, content, contextUsed } = req.body;
        if (!role || !content) {
            return res.status(400).json({ error: 'Role and content are required' });
        }
        const id = store.saveMessage(sessionId, role, content, contextUsed || []);
        res.json({ success: true, messageId: id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Get conversation history
 */
app.get('/conversations/:sessionId', authenticate, (req, res) => {
    try {
        const { sessionId } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const messages = store.getConversation(sessionId, limit);
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Store knowledge
 */
app.post('/knowledge', authenticate, (req, res) => {
    try {
        const { category, key, value, source, confidence } = req.body;
        if (!category || !key || !value) {
            return res.status(400).json({ error: 'Category, key, and value are required' });
        }
        store.setKnowledge(category, key, value, source, confidence);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Get knowledge
 */
app.get('/knowledge/:category/:key', authenticate, (req, res) => {
    try {
        const { category, key } = req.params;
        const value = store.getKnowledge(category, key);
        if (value === null) {
            return res.status(404).json({ error: 'Knowledge not found' });
        }
        res.json({ category, key, value });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Get knowledge by category
 */
app.get('/knowledge/:category', authenticate, (req, res) => {
    try {
        const { category } = req.params;
        const knowledge = store.getKnowledgeByCategory(category);
        res.json({ category, knowledge });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Search knowledge
 */
app.get('/knowledge', authenticate, (req, res) => {
    try {
        const search = req.query.search;
        if (!search) {
            return res.status(400).json({ error: 'Search term is required' });
        }
        const results = store.searchKnowledge(search);
        res.json({ results });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Generate embedding for text
 */
app.post('/embed', authenticate, async (req, res) => {
    try {
        const { text, texts } = req.body;
        if (texts && Array.isArray(texts)) {
            const vectors = await embedEngine.embedBatch(texts);
            res.json({ success: true, vectors });
        }
        else if (text) {
            const result = await embedEngine.embedWithInfo(text);
            res.json({ success: true, ...result });
        }
        else {
            res.status(400).json({ error: 'Text or texts array is required' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Calculate similarity
 */
app.post('/similarity', authenticate, async (req, res) => {
    try {
        const { text1, text2 } = req.body;
        if (!text1 || !text2) {
            return res.status(400).json({ error: 'Both text1 and text2 are required' });
        }
        const similarity = await embedEngine.textSimilarity(text1, text2);
        res.json({ success: true, similarity });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Refresh Pinecone stats
 */
app.post('/admin/refresh-stats', authenticate, async (req, res) => {
    try {
        await bridge.refreshStats();
        res.json({ success: true, stats: bridge.getStats() });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Clear caches
 */
app.post('/admin/clear-cache', authenticate, (req, res) => {
    try {
        bridge.clearCache();
        embedEngine.clearCache();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Vacuum database
 */
app.post('/admin/vacuum', authenticate, (req, res) => {
    try {
        store.vacuum();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
    console.error('[Bridge Server] Error:', err);
    res.status(500).json({ error: err.message });
});
// ═══════════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════════════
async function startServer() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🧠 QAntum CONTEXT BRIDGE SERVER v1.0                                        ║
║   "The API That Never Forgets"                                                ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    try {
        // Load embedding model
        console.log('[Bridge Server] Loading embedding model...');
        await embedEngine.load();
        // Connect to Pinecone
        console.log('[Bridge Server] Connecting to Pinecone...');
        await bridge.connect();
        // Start server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║   ✅ Bridge Server is running!                                                ║
║                                                                               ║
║   📡 URL: http://localhost:${PORT}                                             ║
║   📊 Status: http://localhost:${PORT}/status                                   ║
║   💚 Health: http://localhost:${PORT}/health                                   ║
║                                                                               ║
║   📚 Endpoints:                                                               ║
║      POST /query          - Semantic search in 52K+ vectors                   ║
║      POST /search/code    - Search code by description                        ║
║      POST /sessions       - Create persistent session                         ║
║      GET  /knowledge      - Query knowledge base                              ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        console.error('[Bridge Server] ❌ Failed to start:', error);
        process.exit(1);
    }
}
// Start if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Complexity: O(1)
    startServer();
}
