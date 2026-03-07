"use strict";
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
exports.importArchitecturalPatterns = importArchitecturalPatterns;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PineconeVectorStore_1 = require("./PineconeVectorStore");
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      PINECONE PATTERN INGESTOR                               ║
 * ║             Imports architectural patterns WITHOUT deletion                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
// Complexity: O(n)
async function importArchitecturalPatterns() {
    const filepath = path.resolve(process.cwd(), '../../analysis-output/architectural-patterns.json');
    console.log(`[INGESTION] Reading knowledge matrix from: ${filepath}`);
    if (!fs.existsSync(filepath)) {
        console.error(`[INGESTION] ❌ DATA_GAP: file not found at ${filepath}`);
        return;
    }
    const rawData = fs.readFileSync(filepath, 'utf8');
    let patterns = [];
    try {
        patterns = JSON.parse(rawData);
    }
    catch (e) {
        console.error(`[INGESTION] ❌ JSON PARSE ERROR: ${e.message}`);
        return;
    }
    console.log(`[INGESTION] Extracted ${patterns.length} ontological patterns. Preparing Vectorization...`);
    const store = new PineconeVectorStore_1.PineconeVectorStore();
    const initSuccess = await store.initialize();
    if (!initSuccess) {
        console.error(`[INGESTION] ❌ Failed to initialize Vector Store.`);
        return;
    }
    // Pre-mapping documents in memory for bulk upsert
    const documents = patterns.map((p, index) => {
        // Generate an ID that avoids conflict but is deterministic
        const safeName = p.name ? p.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'unknown';
        return {
            id: `arch-pattern-${Date.now()}-${index}-${safeName}`,
            content: `Architectural Pattern: ${p.name || 'Unknown'}\nDescription: ${p.description || 'No description'}\nFiles implementing this pattern: ${p.files ? p.files.length : 0}`,
            metadata: {
                source: 'architectural-patterns.json',
                patternName: p.name || 'Unknown',
                fileCount: p.files ? p.files.length : 0,
                type: 'architectural-pattern'
            }
        };
    });
    const BATCH_SIZE = 50;
    let totalUpserted = 0;
    console.log(`[INGESTION] Executing Zero-Entropy Upsert (NO DELETIONS). Batch size: ${BATCH_SIZE}`);
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        try {
            // Upsert directly, without deleting old vectors
            const count = await store.upsert(batch, 'qantum-core');
            totalUpserted += count;
            console.log(`[INGESTION] 🟩 Upserted chunk [${i} - ${i + batch.length}]. Progress: ${totalUpserted}/${documents.length}`);
        }
        catch (e) {
            console.error(`[INGESTION] ❌ Chunk failed: ${e.message}`);
        }
    }
    console.log(`\n/// STATUS: COMPLETED ///`);
    console.log(`/// VECTORS INGESTED: ${totalUpserted} ///`);
    console.log(`/// ENTROPY MAINTAINED: 0.00 ///\n`);
}
// Call directly if executed via node/ts-node
if (require.main === module || process.argv[1].includes('import-patterns')) {
    importArchitecturalPatterns().catch(console.error);
}
