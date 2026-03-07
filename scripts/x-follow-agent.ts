/**
 * x-follow-agent — Qantum Module
 * @module x-follow-agent
 * @path scripts/x-follow-agent.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Complexity: O(n) // Constant operations based on batch size

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_SECRET!,
});

// Target vectors: Programmers, HR Tech, VCs, Sponsors, Startup Founders
const TARGET_KEYWORDS = [
    "hiring software engineers",
    "looking for devs",
    "web3 investor",
    "saas founder",
    "tech recruiter",
    "rustlang",
    "typescript developer",
    "building in public",
    "angel investor devtools",
    "CTO looking for"
];

async function huntAndFollow() {
    try {
        console.log(`\n[${new Date().toISOString()}] /// STATUS: INITIALIZING OP[PHANTOM_RECRUITER] ///`);
        console.log(`[${new Date().toISOString()}] /// TARGETING: Developers, HR, Business Sponsors ///`);

        // 1. Get our Sovereign ID
        const meResult = await client.v2.me();
        const myId = meResult.data.id;

        // 2. Select a target keyword purely via Math random
        const keyword = TARGET_KEYWORDS[Math.floor(Math.random() * TARGET_KEYWORDS.length)];
        console.log(`[${new Date().toISOString()}] /// SCANNING X-MATRIX FOR: "${keyword}" ///`);

        // 3. Search recent tweets for targets
        const searchResult = await client.v2.search(keyword, {
            'expansions': ['author_id'],
            'user.fields': ['description', 'public_metrics'],
            max_results: 10
        });

        const tweets = searchResult.data.data;
        const includes = searchResult.data.includes;

        if (!tweets || tweets.length === 0) {
            console.log(`[${new Date().toISOString()}] /// SEARCH YIELDED ZERO ARTIFACTS ///`);
            return;
        }

        let assimilatedCount = 0;
        const BATCH_LIMIT = 5; // Low limit to strictly bypass rate limitations

        for (const tweet of tweets) {
            if (assimilatedCount >= BATCH_LIMIT) break;

            const authorId = tweet.author_id;
            if (!authorId || authorId === myId) continue;

            const targetUser = includes?.users?.find((u: any) => u.id === authorId);

            console.log(`[${new Date().toISOString()}] /// ACQUIRED TARGET: @${targetUser?.username || authorId} ///`);

            try {
                const followResponse = await client.v2.follow(myId, authorId);

                if (followResponse.data.following || followResponse.data.pending_follow) {
                    console.log(`[${new Date().toISOString()}] [+] ENTROPY SHIFT: Assimilated @${targetUser?.username || authorId} into Sovereign Orbit.`);
                    assimilatedCount++;

                    // Humanization Delay
                    await new Promise(r => setTimeout(r, 4000));
                }
            } catch (followErr: any) {
                console.error(`[${new Date().toISOString()}] [-] LOGIC ERROR ON ASSIMILATION: `, followErr.message);
            }
        }

        console.log(`[${new Date().toISOString()}] /// RECRUITMENT CYCLE COMPLETE. Assimilated: ${assimilatedCount}. ///`);

    } catch (e: any) {
        console.error(`\n[${new Date().toISOString()}] /// CRITICAL FAULT IN PHANTOM_RECRUITER ///`);
        if (e.code === 403) {
            console.error("DATA_GAP: X API Tier does not authorize Search/Follow actions without Basic/Pro Upgrade.");
        } else {
            console.error(JSON.stringify(e?.data || e.message, null, 2));
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTONOMOUS NEURAL LOOP
// ─────────────────────────────────────────────────────────────────────────────
const CYCLE_HOURS = 2; // Runs strictly every 2 hours
const CYCLE_MS = CYCLE_HOURS * 60 * 60 * 1000;

async function runPhantomRecruiter() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🌌 QAntum PHANTOM RECRUITER (V2)                                           ║
║  Status: ONLINE | IDENTITY: QANTUM_DIAMOND_NEXUS                             ║
║  Objective: Autonomous Network Growth (Programmers, HR, VCs)                 ║
║  Frequency: Every ${CYCLE_HOURS} hours                                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝`);

    while (true) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await huntAndFollow();

        const nextTime = new Date(Date.now() + CYCLE_MS);
        console.log(`\n[${new Date().toISOString()}] ⏸ Next Hunt Scheduled: ${nextTime.toLocaleString()} (in ${CYCLE_HOURS} hours)\n`);

        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, CYCLE_MS));
    }
}

runPhantomRecruiter().catch(e => {
    console.error("/// TOTAL SYSTEM FAILURE IN PHANTOM RECRUITER ///", e);
});
