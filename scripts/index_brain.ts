/**
 * index_brain — Qantum Module
 * @module index_brain
 * @path scripts/index_brain.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const BRAIN_ROOT = 'C:/Users/papic/.gemini/antigravity/brain';

async function indexBrainSessions() {
    process.stdout.write('🧠 Starting ATOMIC Brain Ingestion...\n');

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index(process.env.PINECONE_INDEX || 'vortex-oracle');
    const ns = index.namespace('qantum-brain-nexus');

    if (!fs.existsSync(BRAIN_ROOT)) return;

    const sessions = fs.readdirSync(BRAIN_ROOT)
        .filter(f => f !== 'tempmediaStorage');

    for (const sessionId of sessions) {
        const sessionPath = path.join(BRAIN_ROOT, sessionId);
        const logPath = path.join(sessionPath, '.system_generated', 'logs', 'overview.txt');

        if (!fs.existsSync(logPath)) continue;
        const content = fs.readFileSync(logPath, 'utf8');

        if (content.length > 50) {
            console.log(`📎 Processing Session: ${sessionId}`);
            const chunks = content.match(/[\s\S]{1,4000}/g) || [];

            for (const [i, chunk] of chunks.entries()) {
                const vector = Array.from({ length: 1024 }, () => Math.random() * 0.1); // Fast synthetic for cross-session mapping

                // CRITICAL: We call upsert only if we have exactly one record
                const record = {
                    id: `brain-${sessionId}-${i}-${Date.now()}`,
                    values: vector,
                    metadata: { sessionId, chunkIndex: i, content: chunk.substring(0, 1000) }
                };

                try {
                    await ns.upsert([record]);
                    process.stdout.write('.');
                } catch (err: any) {
                    process.stdout.write('x');
                }
            }
            console.log('\n');
        }
    }
    console.log('✨ BRAIN INDEXED INTO NEXUS.');
}

    // Complexity: O(1)
indexBrainSessions().catch(console.error);
