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
exports.ingestFiles = ingestFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PineconeVectorStore_1 = require("./PineconeVectorStore");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
const filesToIngest = [
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\Arbitrage\\binance\\GenesisBridgeAdapter.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\best-practices\\QAntum-QA\\src\\PR0DUCTION\\chemistry\\tool-orchestrator\\ToolRegistry.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\best-practices\\QAntum-QA\\src\\PR0DUCTION\\chemistry\\tool-orchestrator\\types.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\best-practices\\QAntum-QA\\src\\PR0DUCTION\\cognition\\Mnemosyne.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\best-practices\\QAntum-QA\\src\\PR0DUCTION\\intelligence\\AIAgentExpert.js",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\best-practices\\QAntum-QA\\src\\PR0DUCTION\\intelligence\\AIAgentExpert.d.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\best-practices\\QAntum-QA\\src\\PR0DUCTION\\intelligence\\ImmuneSystem.d.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\best-practices\\QAntum-QA\\src\\PR0DUCTION\\intelligence\\ImmuneSystem.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\BINANCE_TRADING_LAYER\\Arbitrage\\binance\\GenesisBridgeAdapter.ts",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\cli\\qantum-cli.js",
    "c:\\Users\\papic\\Desktop\\ALL-POSITIONS\\Blockchain\\QAntum-1\\core\\sys\\VortexAI.ts"
];
// Complexity: O(n)
async function ingestFiles() {
    console.log(`\n/// INIT: PINECONE VECTOR INGESTION OVERRIDE ///`);
    console.log(`[INGESTION] TARGET: ${filesToIngest.length} FILES. NO DELETIONS PERMITTED.`);
    const store = new PineconeVectorStore_1.PineconeVectorStore({ dimension: 1024 });
    const initSuccess = await store.initialize();
    if (!initSuccess) {
        console.error(`[INGESTION] ❌ Failed to initialize PineconeVectorStore. DATA_GAP.`);
        return;
    }
    const documents = [];
    for (const filepath of filesToIngest) {
        if (!fs.existsSync(filepath)) {
            console.error(`[INGESTION] ⚠️ DATA_GAP: Physical file not found at ${filepath}`);
            continue;
        }
        const content = fs.readFileSync(filepath, 'utf8');
        const filename = path.basename(filepath);
        const safeName = filename.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        // Chunking to keep vector embeddings contextually dense and avoid Pinecone metadata max size
        const MAX_CHUNK_SIZE = 3000;
        if (content.length > MAX_CHUNK_SIZE) {
            let chunkIdx = 0;
            for (let i = 0; i < content.length; i += MAX_CHUNK_SIZE) {
                const chunkContent = content.substring(i, i + MAX_CHUNK_SIZE);
                documents.push({
                    id: `vcore-${Date.now()}-${safeName}-c${chunkIdx}`,
                    content: chunkContent,
                    metadata: {
                        source: filepath,
                        filename: filename,
                        ontology: 'source-code',
                        chunk: chunkIdx
                    }
                });
                chunkIdx++;
            }
        }
        else {
            documents.push({
                id: `vcore-${Date.now()}-${safeName}`,
                content: content,
                metadata: {
                    source: filepath,
                    filename: filename,
                    ontology: 'source-code'
                }
            });
        }
    }
    console.log(`[INGESTION] Successfully extracted ${documents.length} Vector Document Chunks.`);
    console.log(`[INGESTION] EXECUTING ATOMIC UPSERT TO GLOBAL MEMORY...`);
    const BATCH_SIZE = 10;
    let totalUpserted = 0;
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        try {
            // Upsert WITHOUT wiping Pinecone database (ZERO DELETION STRICT RULE)
            const count = await store.upsert(batch, 'qantum-core');
            totalUpserted += count;
            console.log(`[INGESTION] 🟩 Uploaded Chunk [${i} to ${i + batch.length}]. Progress: ${totalUpserted}/${documents.length}`);
        }
        catch (e) {
            console.error(`[INGESTION] ❌ Chunk failed: ${e.message}`);
        }
    }
    console.log(`\n/// STATUS: COMPLETED ///`);
    console.log(`/// VECTORS UPSERTED: ${totalUpserted} ///`);
    console.log(`/// ENTROPY MAINTAINED: 0.00 ///\n`);
}
ingestFiles().catch(console.error);
