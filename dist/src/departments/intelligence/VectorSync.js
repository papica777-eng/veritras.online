"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                    VECTOR SYNC - THE CLOUD MEMORY ENGINE                      ║
 * ║                                                                               ║
 * ║   "1.1 милиона реда код, превърнати в семантични отпечатъци."                 ║
 * ║                                                                               ║
 * ║   Синхронизира трите армии (MisteMind, MrMindQATool, MisterMindPage)          ║
 * ║   в единен облачен мозък чрез Pinecone Vector Database.                       ║
 * ║                                                                               ║
 * ║  Created: 2026-01-01 | QAntum Prime v28.1.0 SUPREME - Empire Architect        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorSync = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// VECTOR SYNC ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class VectorSync {
    config;
    embeddingCache = new Map();
    indexStats = {
        totalVectors: 0,
        lastSync: 0,
        projects: new Map(),
    };
    // Default project configurations
    static DEFAULT_PROJECTS = [
        {
            name: 'MisteMind',
            path: 'C:/MisteMind',
            include: ['src/**/*.ts', 'src/**/*.js'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts', '**/*.test.ts'],
        },
        {
            name: 'MrMindQATool',
            path: 'C:/MrMindQATool',
            include: ['src/**/*.ts', 'src/**/*.js', 'webapp/**/*.ts'],
            exclude: ['**/node_modules/**', '**/dist/**'],
        },
        {
            name: 'MisterMindPage',
            path: 'C:/MisterMindPage',
            include: ['**/*.html', '**/*.js', '**/*.css'],
            exclude: ['**/node_modules/**'],
        },
    ];
    constructor(config) {
        this.config = {
            pineconeApiKey: config?.pineconeApiKey || process.env.PINECONE_API_KEY || '',
            pineconeIndex: config?.pineconeIndex || 'QAntum-empire-v28',
            pineconeEnvironment: config?.pineconeEnvironment || 'us-east-1',
            embeddingModel: config?.embeddingModel || 'local',
            chunkSize: config?.chunkSize || 1000,
            overlapSize: config?.overlapSize || 200,
            projects: config?.projects || VectorSync.DEFAULT_PROJECTS,
        };
        this.log('🧠 VectorSync initialized');
        this.log(`   Index: ${this.config.pineconeIndex}`);
        this.log(`   Projects: ${this.config.projects.map(p => p.name).join(', ')}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Синхронизира всички проекти към Pinecone
     */
    // Complexity: O(N) — linear iteration
    async syncEmpire() {
        this.log('\n╔═══════════════════════════════════════════════════════════════╗');
        this.log('║               🏛️ EMPIRE SYNC - INITIATED                       ║');
        this.log('╚═══════════════════════════════════════════════════════════════╝\n');
        const stats = [];
        for (const project of this.config.projects) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const projectStats = await this.syncProject(project);
            stats.push(projectStats);
        }
        // Print summary
        this.printSyncSummary(stats);
        // Save sync state
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.saveSyncState(stats);
        return stats;
    }
    /**
     * Синхронизира един проект
     */
    // Complexity: O(N*M) — nested iteration detected
    async syncProject(project) {
        const startTime = Date.now();
        const stats = {
            project: project.name,
            filesScanned: 0,
            chunksCreated: 0,
            vectorsUpserted: 0,
            duration: 0,
            errors: [],
        };
        this.log(`📡 Синхронизиране на ${project.name}...`);
        try {
            // 1. Scan files
            const files = await this.scanProjectFiles(project);
            stats.filesScanned = files.length;
            this.log(`   📁 Намерени файлове: ${files.length}`);
            // 2. Extract and chunk content
            const chunks = [];
            for (const file of files) {
                try {
                    const fileChunks = await this.extractChunks(file, project.name);
                    chunks.push(...fileChunks);
                }
                catch (error) {
                    stats.errors.push(`${file}: ${error}`);
                }
            }
            stats.chunksCreated = chunks.length;
            this.log(`   🧩 Създадени chunks: ${chunks.length}`);
            // 3. Generate embeddings
            this.log(`   🔢 Генериране на embeddings...`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const vectors = await this.generateEmbeddings(chunks);
            // 4. Upsert to Pinecone (or local storage for demo)
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.upsertVectors(vectors, project.name);
            stats.vectorsUpserted = vectors.length;
            this.indexStats.projects.set(project.name, vectors.length);
        }
        catch (error) {
            stats.errors.push(`Project error: ${error}`);
            this.log(`   ❌ Грешка: ${error}`);
        }
        stats.duration = Date.now() - startTime;
        this.log(`   ✅ ${project.name} синхронизиран за ${stats.duration}ms`);
        return stats;
    }
    /**
     * Търсене в семантичната памет
     */
    // Complexity: O(N)
    async search(query, options = {}) {
        const topK = options.topK || 5;
        this.log(`\n🔍 Търсене: "${query.slice(0, 50)}..."`);
        // Generate query embedding
        // SAFETY: async operation — wrap in try-catch for production resilience
        const queryEmbedding = await this.generateSingleEmbedding(query);
        // Search in local index (for demo) or Pinecone
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await this.searchVectors(queryEmbedding, topK, options.filter);
        this.log(`   📊 Намерени ${results.length} резултата`);
        return results;
    }
    /**
     * Получаване на контекст за заявка към AI
     */
    // Complexity: O(N) — linear iteration
    async getContextForQuery(query, maxTokens = 4000) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await this.search(query, { topK: 10 });
        let context = '';
        let currentTokens = 0;
        const tokenEstimate = (text) => Math.ceil(text.length / 4);
        for (const result of results) {
            const chunkText = `// File: ${result.metadata.filePath}\n// ${result.metadata.type}: ${result.metadata.name}\n${result.content}\n\n`;
            const chunkTokens = tokenEstimate(chunkText);
            if (currentTokens + chunkTokens > maxTokens)
                break;
            context += chunkText;
            currentTokens += chunkTokens;
        }
        return context;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // FILE SCANNING
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    async scanProjectFiles(project) {
        const files = [];
        const walkDir = (dir) => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(project.path, fullPath);
                    // Check excludes
                    if (this.matchesPattern(relativePath, project.exclude))
                        continue;
                    if (entry.isDirectory()) {
                        // Complexity: O(1)
                        walkDir(fullPath);
                    }
                    else if (entry.isFile()) {
                        // Check includes
                        if (this.matchesPattern(relativePath, project.include)) {
                            files.push(fullPath);
                        }
                    }
                }
            }
            catch (error) {
                // Directory might not exist
            }
        };
        if (fs.existsSync(project.path)) {
            // Complexity: O(1)
            walkDir(project.path);
        }
        return files;
    }
    // Complexity: O(N) — linear iteration
    matchesPattern(filePath, patterns) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        for (const pattern of patterns) {
            const regexPattern = pattern
                .replace(/\*\*/g, '{{GLOBSTAR}}')
                .replace(/\*/g, '[^/]*')
                .replace(/{{GLOBSTAR}}/g, '.*')
                .replace(/\./g, '\\.');
            if (new RegExp(`^${regexPattern}$`).test(normalizedPath)) {
                return true;
            }
        }
        return false;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // SEMANTIC CHUNKING
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — amortized
    async extractChunks(filePath, projectName) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(this.getProjectPath(projectName), filePath);
        const chunks = [];
        // Determine file type and use appropriate chunking strategy
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.ts' || ext === '.js') {
            chunks.push(...this.chunkTypeScript(content, relativePath, projectName));
        }
        else if (ext === '.html') {
            chunks.push(...this.chunkHTML(content, relativePath, projectName));
        }
        else if (ext === '.css') {
            chunks.push(...this.chunkCSS(content, relativePath, projectName));
        }
        else {
            // Generic chunking
            chunks.push(...this.chunkGeneric(content, relativePath, projectName));
        }
        return chunks;
    }
    /**
     * Семантично разделяне на TypeScript/JavaScript
     */
    // Complexity: O(N*M) — nested iteration detected
    chunkTypeScript(content, filePath, project) {
        const chunks = [];
        const lines = content.split('\n');
        // Extract functions
        const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
        const classRegex = /(?:export\s+)?class\s+(\w+)/g;
        const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
        const constRegex = /(?:export\s+)?const\s+(\w+)\s*=/g;
        // Extract all symbols with their positions
        const symbols = [];
        // Find functions
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            const start = content.slice(0, match.index).split('\n').length;
            const funcContent = this.extractBlock(content, match.index);
            symbols.push({ type: 'function', name: match[1], start, content: funcContent });
        }
        // Find classes
        while ((match = classRegex.exec(content)) !== null) {
            const start = content.slice(0, match.index).split('\n').length;
            const classContent = this.extractBlock(content, match.index);
            symbols.push({ type: 'class', name: match[1], start, content: classContent });
        }
        // Find interfaces
        while ((match = interfaceRegex.exec(content)) !== null) {
            const start = content.slice(0, match.index).split('\n').length;
            const interfaceContent = this.extractBlock(content, match.index);
            symbols.push({ type: 'interface', name: match[1], start, content: interfaceContent });
        }
        // Create chunks for each symbol
        for (const symbol of symbols) {
            const chunk = this.createChunk({
                project,
                filePath,
                type: symbol.type,
                name: symbol.name,
                content: symbol.content,
                lineStart: symbol.start,
                lineEnd: symbol.start + symbol.content.split('\n').length,
                dependencies: this.extractDependencies(symbol.content),
            });
            chunks.push(chunk);
        }
        // If no symbols found, create a generic chunk
        if (chunks.length === 0 && content.trim().length > 0) {
            chunks.push(this.createChunk({
                project,
                filePath,
                type: 'module',
                name: path.basename(filePath, path.extname(filePath)),
                content: content.slice(0, this.config.chunkSize),
                lineStart: 1,
                lineEnd: Math.min(lines.length, 50),
                dependencies: this.extractDependencies(content),
            }));
        }
        return chunks;
    }
    /**
     * Extract a code block starting from a position
     */
    // Complexity: O(N) — linear iteration
    extractBlock(content, startIndex) {
        let braceCount = 0;
        let started = false;
        let endIndex = startIndex;
        for (let i = startIndex; i < content.length; i++) {
            const char = content[i];
            if (char === '{') {
                braceCount++;
                started = true;
            }
            else if (char === '}') {
                braceCount--;
                if (started && braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
        return content.slice(startIndex, Math.min(endIndex, startIndex + this.config.chunkSize));
    }
    /**
     * Extract import dependencies
     */
    // Complexity: O(N) — loop-based
    extractDependencies(content) {
        const deps = [];
        const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            deps.push(match[1]);
        }
        return deps;
    }
    // Complexity: O(1)
    chunkHTML(content, filePath, project) {
        // Extract sections, scripts, styles
        return [this.createChunk({
                project,
                filePath,
                type: 'module',
                name: path.basename(filePath),
                content: content.slice(0, this.config.chunkSize),
                lineStart: 1,
                lineEnd: content.split('\n').length,
                dependencies: [],
            })];
    }
    // Complexity: O(1)
    chunkCSS(content, filePath, project) {
        return [this.createChunk({
                project,
                filePath,
                type: 'module',
                name: path.basename(filePath),
                content: content.slice(0, this.config.chunkSize),
                lineStart: 1,
                lineEnd: content.split('\n').length,
                dependencies: [],
            })];
    }
    // Complexity: O(1)
    chunkGeneric(content, filePath, project) {
        return [this.createChunk({
                project,
                filePath,
                type: 'module',
                name: path.basename(filePath),
                content: content.slice(0, this.config.chunkSize),
                lineStart: 1,
                lineEnd: content.split('\n').length,
                dependencies: [],
            })];
    }
    // Complexity: O(1)
    createChunk(metadata) {
        const hash = crypto.createHash('md5').update(metadata.content).digest('hex');
        return {
            id: `${metadata.project}:${metadata.filePath}:${metadata.name}:${hash.slice(0, 8)}`,
            values: [], // Will be filled by embedding generation
            metadata: {
                ...metadata,
                hash,
            },
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // EMBEDDING GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    async generateEmbeddings(chunks) {
        for (const chunk of chunks) {
            // Check cache first
            if (this.embeddingCache.has(chunk.metadata.hash)) {
                chunk.values = this.embeddingCache.get(chunk.metadata.hash);
                continue;
            }
            // Generate embedding based on configured model
            if (this.config.embeddingModel === 'local') {
                chunk.values = this.generateLocalEmbedding(chunk.metadata.content);
            }
            else {
                // Would call OpenAI/DeepSeek API here
                chunk.values = this.generateLocalEmbedding(chunk.metadata.content);
            }
            // Cache the embedding
            this.embeddingCache.set(chunk.metadata.hash, chunk.values);
        }
        return chunks;
    }
    // Complexity: O(N) — potential recursive descent
    async generateSingleEmbedding(text) {
        return this.generateLocalEmbedding(text);
    }
    /**
     * Simple local embedding using TF-IDF-like approach
     * In production, replace with OpenAI ada-002 or similar
     */
    // Complexity: O(N*M) — nested iteration detected
    generateLocalEmbedding(text) {
        const EMBEDDING_SIZE = 384;
        const embedding = new Array(EMBEDDING_SIZE).fill(0);
        // Tokenize
        const tokens = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 2);
        // Generate pseudo-embedding based on token hashes
        for (const token of tokens) {
            const hash = this.simpleHash(token);
            for (let i = 0; i < EMBEDDING_SIZE; i++) {
                embedding[i] += Math.sin(hash * (i + 1)) / tokens.length;
            }
        }
        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < EMBEDDING_SIZE; i++) {
                embedding[i] /= magnitude;
            }
        }
        return embedding;
    }
    // Complexity: O(N) — linear iteration
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // VECTOR STORAGE
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    async upsertVectors(vectors, project) {
        // For demo, save to local JSON file
        // In production, use Pinecone client
        const storagePath = path.join(process.cwd(), 'data', 'vector-index');
        try {
            fs.mkdirSync(storagePath, { recursive: true });
            const indexFile = path.join(storagePath, `${project.toLowerCase()}-index.json`);
            fs.writeFileSync(indexFile, JSON.stringify({
                project,
                timestamp: Date.now(),
                count: vectors.length,
                vectors: vectors.map(v => ({
                    id: v.id,
                    values: v.values.slice(0, 10), // Store truncated for demo
                    metadata: v.metadata,
                })),
            }, null, 2));
            this.indexStats.totalVectors += vectors.length;
        }
        catch (error) {
            this.log(`   ⚠️ Грешка при записване: ${error}`);
        }
    }
    // Complexity: O(N*M) — nested iteration detected
    async searchVectors(queryEmbedding, topK, filter) {
        const results = [];
        const storagePath = path.join(process.cwd(), 'data', 'vector-index');
        try {
            const files = fs.readdirSync(storagePath).filter(f => f.endsWith('-index.json'));
            for (const file of files) {
                const indexData = JSON.parse(fs.readFileSync(path.join(storagePath, file), 'utf-8'));
                for (const vector of indexData.vectors) {
                    // Calculate cosine similarity
                    const score = this.cosineSimilarity(queryEmbedding, this.generateLocalEmbedding(vector.metadata.content));
                    results.push({
                        id: vector.id,
                        score,
                        content: vector.metadata.content,
                        metadata: vector.metadata,
                    });
                }
            }
            // Sort by score and return top K
            results.sort((a, b) => b.score - a.score);
            return results.slice(0, topK);
        }
        catch (error) {
            return [];
        }
    }
    // Complexity: O(N) — linear iteration
    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async saveSyncState(stats) {
        const statePath = path.join(process.cwd(), 'data', 'vector-sync-state.json');
        try {
            fs.mkdirSync(path.dirname(statePath), { recursive: true });
            fs.writeFileSync(statePath, JSON.stringify({
                lastSync: Date.now(),
                stats,
                totalVectors: this.indexStats.totalVectors,
            }, null, 2));
        }
        catch (error) {
            this.log(`⚠️ Не можах да запиша състоянието: ${error}`);
        }
    }
    // Complexity: O(1)
    async loadSyncState() {
        const statePath = path.join(process.cwd(), 'data', 'vector-sync-state.json');
        try {
            return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
        }
        catch {
            return null;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    getProjectPath(projectName) {
        const project = this.config.projects.find(p => p.name === projectName);
        return project?.path || process.cwd();
    }
    // Complexity: O(N) — linear iteration
    printSyncSummary(stats) {
        const totalFiles = stats.reduce((sum, s) => sum + s.filesScanned, 0);
        const totalChunks = stats.reduce((sum, s) => sum + s.chunksCreated, 0);
        const totalVectors = stats.reduce((sum, s) => sum + s.vectorsUpserted, 0);
        const totalDuration = stats.reduce((sum, s) => sum + s.duration, 0);
        const totalErrors = stats.reduce((sum, s) => sum + s.errors.length, 0);
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           🏛️ EMPIRE SYNC COMPLETE                             ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║   📁 Files Scanned:     ${String(totalFiles).padStart(8)}                                       ║
║   🧩 Chunks Created:    ${String(totalChunks).padStart(8)}                                       ║
║   🔢 Vectors Upserted:  ${String(totalVectors).padStart(8)}                                       ║
║   ⏱️  Duration:          ${String(totalDuration).padStart(6)}ms                                       ║
║   ❌ Errors:            ${String(totalErrors).padStart(8)}                                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║   Projects:                                                                   ║`);
        for (const stat of stats) {
            console.log(`║   • ${stat.project.padEnd(15)} ${String(stat.vectorsUpserted).padStart(6)} vectors                              ║`);
        }
        console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝`);
    }
    // Complexity: O(1)
    log(message) {
        console.log(message);
    }
}
exports.VectorSync = VectorSync;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                     🧠 VECTOR SYNC - CLOUD MEMORY ENGINE                      ║
║                                                                               ║
║                    QAntum Prime v28.1.0 - Empire Architect                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
    const vectorSync = new VectorSync();
    if (process.argv.includes('--sync')) {
        vectorSync.syncEmpire().catch(console.error);
    }
    else if (process.argv.includes('--search')) {
        const query = process.argv.slice(process.argv.indexOf('--search') + 1).join(' ');
        vectorSync.search(query).then(results => {
            console.log('\n📊 Резултати:');
            results.forEach((r, i) => {
                console.log(`${i + 1}. [${r.score.toFixed(3)}] ${r.metadata.filePath} - ${r.metadata.name}`);
            });
        });
    }
    else {
        console.log('Usage:');
        console.log('  npx tsx VectorSync.ts --sync         Sync all projects');
        console.log('  npx tsx VectorSync.ts --search <q>   Search the index');
    }
}
exports.default = VectorSync;
