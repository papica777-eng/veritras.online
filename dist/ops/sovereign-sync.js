"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hybrid_sovereign_sync = void 0;
const HybridGodModeWrapper_1 = require("./HybridGodModeWrapper");
/**
 * @wrapper Hybrid_sovereign_sync
 * @description Auto-generated God-Mode Hybrid.
 * @origin "sovereign-sync.js"
 */
class Hybrid_sovereign_sync extends HybridGodModeWrapper_1.HybridGodModeWrapper {
    async execute() {
        try {
            console.log("/// [HYBRID_CORE] Executing Logics from Hybrid_sovereign_sync ///");
            // --- START LEGACY INJECTION ---
            /**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                   SOVEREIGN SYNC - ZERO DEPENDENCY VECTORIZER                 ║
 * ║                                                                               ║
 * ║      "Independently synchronizing the Empire's knowledge to Pinecone."        ║
 * ║                                                                               ║
 * ║  Engine: Gemini text-embedding-004 (768 -> 384 dimensions)                     ║
 * ║  Database: Pinecone Serverless (us-east-1)                                    ║
 * ║                                                                               ║
 * ║  Created: 2026-02-01 | QAntum Prime v28.1.0 SUPREME                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
            const fs = require('fs');
            const path = require('path');
            const https = require('https');
            // ═══════════════════════════════════════════════════════════════════════════════
            // CONFIGURATION
            // ═══════════════════════════════════════════════════════════════════════════════
            const PINECONE_KEY = 'pcsk_583DKX_B8wtHkyoFvQnMPvgLgvsDpeWBiTziVS3eCwDxYi6SGurEL99aDaSKxhaLQbdEoR';
            const PINECONE_HOST = 'qantum-empire-zhzypmt.svc.aped-4627-b74a.pinecone.io';
            const GEMINI_KEY = 'AIzaSyA8c3fkeV9gXthmIlgdMhWgGiA1vmyzI_8';
            const PROJECTS = [
                { name: 'MisteMind', path: './src' },
            ];
            const CHUNK_SIZE = 4000; // Characters
            const EMBED_DIM = 384; // Target dimension for index
            // ═══════════════════════════════════════════════════════════════════════════════
            // UTILS
            // ═══════════════════════════════════════════════════════════════════════════════
            function log(msg) { console.log(`[SYNC] ${msg}`); }
            function logError(msg) { console.error(`[SYNC ERROR] ${msg}`); }
            async function post(hostname, path, headers, body) {
                return new Promise((resolve, reject) => {
                    const req = https.request({ hostname, path, method: 'POST', headers }, (res) => {
                        let data = '';
                        res.on('data', c => data += c);
                        res.on('end', () => resolve(JSON.parse(data)));
                    });
                    req.on('error', reject);
                    req.write(JSON.stringify(body));
                    req.end();
                });
            }
            // ═══════════════════════════════════════════════════════════════════════════════
            // LOGIC
            // ═══════════════════════════════════════════════════════════════════════════════
            async function getEmbedding(text) {
                const url = `/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_KEY}`;
                const res = await post('generativelanguage.googleapis.com', url, { 'Content-Type': 'application/json' }, {
                    content: { parts: [{ text }] },
                    outputDimensionality: EMBED_DIM
                });
                if (res.error)
                    throw new Error(`Gemini Error: ${res.error.message}`);
                return res.embedding.values;
            }
            async function upsertToPinecone(vectors) {
                const url = `/vectors/upsert`;
                const res = await post(PINECONE_HOST, url, {
                    'Content-Type': 'application/json',
                    'Api-Key': PINECONE_KEY
                }, { vectors });
                return res;
            }
            function getAllFiles(dirPath, arrayOfFiles) {
                const files = fs.readdirSync(dirPath);
                arrayOfFiles = arrayOfFiles || [];
                files.forEach(function (file) {
                    const fullPath = path.join(dirPath, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
                            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                        }
                    }
                    else {
                        if (['.ts', '.js', '.json', '.html', '.css', '.md'].some(ext => file.endsWith(ext))) {
                            arrayOfFiles.push(fullPath);
                        }
                    }
                });
                return arrayOfFiles;
            }
            async function startSync() {
                log('🚀 Initiating Sovereign Sync...');
                for (const project of PROJECTS) {
                    log(`Processing project: ${project.name}`);
                    const files = getAllFiles(project.path);
                    log(`Found ${files.length} files.`);
                    let totalChunks = 0;
                    let vectorBatch = [];
                    for (const file of files) {
                        const content = fs.readFileSync(file, 'utf-8');
                        const chunks = [];
                        for (let i = 0; i < content.length; i += CHUNK_SIZE) {
                            chunks.push(content.substring(i, i + CHUNK_SIZE));
                        }
                        log(`   Indexing ${path.basename(file)} (${chunks.length} chunks)`);
                        for (let i = 0; i < chunks.length; i++) {
                            try {
                                const vector = await getEmbedding(chunks[i]);
                                vectorBatch.push({
                                    id: `${project.name}:${path.basename(file)}:chunk-${i}`,
                                    values: vector,
                                    metadata: {
                                        project: project.name,
                                        file: file,
                                        content: chunks[i],
                                        timestamp: Date.now()
                                    }
                                });
                                if (vectorBatch.length >= 20) {
                                    await upsertToPinecone(vectorBatch);
                                    log(`      Upserted ${vectorBatch.length} vectors...`);
                                    vectorBatch = [];
                                }
                                totalChunks++;
                            }
                            catch (e) {
                                logError(`Failed to embed chunk ${i} of ${file}: ${e.message}`);
                            }
                        }
                    }
                    // Final batch
                    if (vectorBatch.length > 0) {
                        await upsertToPinecone(vectorBatch);
                        log(`      Upserted final ${vectorBatch.length} vectors.`);
                    }
                    log(`✨ Project ${project.name} Sync Complete! Total vectors: ${totalChunks}`);
                }
            }
            startSync().catch(logError);
            // --- END LEGACY INJECTION ---
            await this.recordAxiom({
                status: 'SUCCESS',
                origin: 'Hybrid_sovereign_sync',
                timestamp: Date.now()
            });
        }
        catch (error) {
            console.error("/// [HYBRID_FAULT] Critical Error in Hybrid_sovereign_sync ///", error);
            await this.recordAxiom({
                status: 'CRITICAL_FAILURE',
                error: String(error),
                origin: 'Hybrid_sovereign_sync'
            });
            throw error;
        }
    }
}
exports.Hybrid_sovereign_sync = Hybrid_sovereign_sync;
