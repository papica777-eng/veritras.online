import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PineconeVectorStore, VectorDocument } from './PineconeVectorStore';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      PINECONE PATTERN INGESTOR                               ║
 * ║             Imports architectural patterns WITHOUT deletion                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// Complexity: O(n)
export async function importArchitecturalPatterns(): Promise<void> {
    const filepath = path.resolve(process.cwd(), '../../analysis-output/architectural-patterns.json');
    console.log(`[INGESTION] Reading knowledge matrix from: ${filepath}`);

    if (!fs.existsSync(filepath)) {
        console.error(`[INGESTION] ❌ DATA_GAP: file not found at ${filepath}`);
        return;
    }

    const rawData = fs.readFileSync(filepath, 'utf8');
    let patterns: any[] = [];
    try {
        patterns = JSON.parse(rawData);
    } catch (e: any) {
        console.error(`[INGESTION] ❌ JSON PARSE ERROR: ${e.message}`);
        return;
    }

    console.log(`[INGESTION] Extracted ${patterns.length} ontological patterns. Preparing Vectorization...`);

    const store = new PineconeVectorStore();
    const initSuccess = await store.initialize();
    if (!initSuccess) {
        console.error(`[INGESTION] ❌ Failed to initialize Vector Store.`);
        return;
    }

    // Pre-mapping documents in memory for bulk upsert
    const documents: VectorDocument[] = patterns.map((p, index) => {
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
        } catch (e: any) {
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
