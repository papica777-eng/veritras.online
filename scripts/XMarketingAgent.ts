/**
 * XMarketingAgent — Qantum Module
 * @module XMarketingAgent
 * @path scripts/XMarketingAgent.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_SECRET!,
});

async function post() {
    try {
        console.log("/// STATUS: INITIALIZING OP[X_SWARM_INVASION] ///");

        const text = `The current B2B SaaS ecosystem is built on duct tape and entropy. I got tired of it.\n\nSo I built AETERNA: a Sovereign Cognitive OS.\nWe are currently opening the gates for elite beta testers.\n\nRequirements:\n▫️ Intolerance for technical debt\n▫️ Focus on absolute determinism\n▫️ Ready for Zero-Entropy operations\n\nDrop a comment if you want access to the Bunker.\n🔗 https://aeterna.website`;

        // Attempt to upload media if the artifact image exists locally.
        const potentialImagePath = path.join(process.env.USERPROFILE || 'C:\\Users\\papic', '.gemini', 'antigravity', 'brain', '50bd67e4-5ba4-4e45-905f-f9fec4eb9c9c', 'QAntum_marketing_promo_1772143948400.png');

        if (fs.existsSync(potentialImagePath)) {
            console.log("/// STATUS: UPLOADING VISUAL PROOF TO X ///");
            const mediaId = await client.v1.uploadMedia(potentialImagePath);
            console.log("/// STATUS: BROADCASTING TWEET WITH MEDIA ///");
            await client.v2.tweet({
                text,
                media: { media_ids: [mediaId] }
            });
        } else {
            console.log("/// STATUS: BROADCASTING TEXT-ONLY TWEET ///");
            // SAFETY: async operation — wrap in try-catch for production resilience
            await client.v2.tweet({ text });
        }

        console.log("/// STATUS: TWEET PUBLISHED SUCCESSFULLY ///");
        console.log("/// ENTROPY: 0.00 ///");
    } catch (e: any) {
        console.error("/// STATUS: ERROR ENCOUNTERED ///");
        console.log(JSON.stringify(e?.data || e, null, 2));
    }
}

// Complexity: O(1)
post();
