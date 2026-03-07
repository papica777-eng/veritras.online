/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ 🧪 PROJECT ALETHEIA: Test Script                             ║
 * ║ "Testing the Cognitive Firewall"                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * RUN: node scripts/test_aletheia.js
 */

// ═══════════════════════════════════════════════════════════════════════════
// INLINE IMPLEMENTATION (for standalone testing without build step)
// ═══════════════════════════════════════════════════════════════════════════

const CLICKBAIT_PATTERNS = [
    /you won't believe/i,
    /shocking/i,
    /breaking:/i,
    /just in:/i,
    /this is huge/i,
    /exposed/i,
    /secret/i,
    /they don't want you to know/i,
    /!{2,}/,
    /[A-Z]{5,}/,
];

const UNVERIFIED_CLAIM_PATTERNS = [
    /sources say/i,
    /reportedly/i,
    /allegedly/i,
    /rumor/i,
    /some people say/i,
    /experts claim/i,
];

class TextEntropyAnalyzer {
    constructor(config = {}) {
        this.threshold = config.maxEntropyThreshold ?? 0.45;  // Raised from 0.3 to reduce false positives
    }

    // Complexity: O(1)
    analyze(headline, text, trustScore = 0.5) {
        const fullText = `${headline} ${text}`;

        const trustPenalty = Math.max(0, 1 - trustScore);
        const emotionalScore = this.calcEmotional(fullText);
        const claimScore = this.calcClaims(fullText);

        const entropyScore =
            trustPenalty * 0.25 +
            emotionalScore * 0.40 +
            claimScore * 0.35;

        let verdict;
        if (entropyScore > 0.5) verdict = 'TOXIC';           // Very high = definitely bad
        else if (entropyScore > 0.15) verdict = 'SUSPICIOUS'; // Medium = questionable
        else verdict = 'CLEAN';                               // Low = trustworthy

        return { headline, entropyScore, verdict, trustPenalty, emotionalScore, claimScore };
    }

    // Complexity: O(N) — linear iteration
    calcEmotional(text) {
        let matches = 0;
        for (const p of CLICKBAIT_PATTERNS) if (p.test(text)) matches++;
        return Math.min(1.0, matches / 4);
    }

    // Complexity: O(N) — linear iteration
    calcClaims(text) {
        let matches = 0;
        for (const p of UNVERIFIED_CLAIM_PATTERNS) if (p.test(text)) matches++;
        return Math.min(1.0, matches / 3);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST CASES
// ═══════════════════════════════════════════════════════════════════════════

const analyzer = new TextEntropyAnalyzer({ maxEntropyThreshold: 0.3 });

const testCases = [
    // CLEAN (Real news style)
    {
        headline: "Federal Reserve raises interest rates by 0.25%",
        text: "The Federal Reserve announced a quarter-point increase in the federal funds rate on Wednesday, citing persistent inflation concerns.",
        trustScore: 0.95,
        expected: 'CLEAN'
    },
    {
        headline: "New study shows benefits of Mediterranean diet",
        text: "Research published in the New England Journal of Medicine demonstrates cardiovascular benefits linked to olive oil consumption.",
        trustScore: 0.90,
        expected: 'CLEAN'
    },

    // SUSPICIOUS
    {
        headline: "Tech giant reportedly planning major layoffs",
        text: "Sources say the company is preparing to cut thousands of jobs. Experts claim this could impact the entire sector.",
        trustScore: 0.70,
        expected: 'SUSPICIOUS'
    },

    // TOXIC (Fake news style)
    {
        headline: "BREAKING: You Won't BELIEVE What They Found!!",
        text: "SHOCKING revelation exposed! They don't want you to know this SECRET!! Sources say it's HUGE!!!",
        trustScore: 0.20,
        expected: 'TOXIC'
    },
    {
        headline: "EXPOSED: The TRUTH They're Hiding From You!!!",
        text: "Some people say this is the biggest cover-up in history. Allegedly, secret documents prove everything.",
        trustScore: 0.10,
        expected: 'TOXIC'
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// RUN TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║ 🛡️ PROJECT ALETHEIA: Cognitive Firewall Test                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

for (const tc of testCases) {
    const result = analyzer.analyze(tc.headline, tc.text, tc.trustScore);
    const status = result.verdict === tc.expected ? '✅ PASS' : '❌ FAIL';

    if (result.verdict === tc.expected) passed++;
    else failed++;

    console.log(`${status} | Expected: ${tc.expected.padEnd(10)} | Got: ${result.verdict.padEnd(10)} | Entropy: ${result.entropyScore.toFixed(3)}`);
    console.log(`       "${tc.headline.substring(0, 50)}..."`);
    console.log(`       [Trust: ${result.trustPenalty.toFixed(2)}, Emotional: ${result.emotionalScore.toFixed(2)}, Claims: ${result.claimScore.toFixed(2)}]\n`);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(`RESULTS: ${passed}/${testCases.length} passed`);

if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Cognitive Firewall is operational.\n');
} else {
    console.log(`⚠️ ${failed} test(s) failed. Review thresholds.\n`);
}
