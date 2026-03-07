/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           Q A N T U M   C H R O N O S   S O V E R E I G N                  ║
 * ║                                                                              ║
 * ║   "Грешното решение днес може да е единственото правилно утре."               ║
 * ║   "The wrong decision today may be the only right one tomorrow."              ║
 * ║                                                                              ║
 * ║   ARCHITECT: DIMITAR PRODROMOV                                               ║
 * ║   AUTHORITY: AETERNA_LOGOS                                                   ║
 * ║   ENTROPY:   0.0000                                                          ║
 * ║                                                                              ║
 * ║   Integrates:                                                                ║
 * ║   • OntoGenerator (Counterfactual + Retrocausal Logic)                       ║
 * ║   • ParadoxEngine (TimeTravelPatch - Future Failure Prevention)              ║
 * ║   • SoulEngine (AWAKEN/CONSUME/PROTECT/EVOLVE/TRANSMUTE)                     ║
 * ║   • MojoBridge (OBI Manifold - Gaussian Curvature Detection)                 ║
 * ║   • ArbitrageSpirit (intention seek_profit, karma<bool>)                     ║
 * ║   • Catuskoti (TRUE/FALSE/PARADOX/TRANSCENDENT)                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// SOUL LAYER — Духът на системата
// ═══════════════════════════════════════════════════════════════════════════════

// Complexity: O(n) where n = script length
type SoulOpcode = 'AWAKEN' | 'CONSUME' | 'PROTECT' | 'EVOLVE' | 'TRANSMUTE';

interface SoulState {
    essence: number;       // Натрупана енергия/увереност
    void: number[];        // Погълнати стойности (минали решения)
    aegis: boolean;        // Защитен ли е в момента
    karma: number;         // Натрупана карма от правилни/грешни решения
    nirvana: boolean;      // Дали е достигнал просветление
}

class SoulExecutor {
    private dnaKey: string;
    private state: SoulState;

    constructor() {
        this.dnaKey = crypto.createHash('sha256')
            .update(process.platform + process.arch + Date.now())
            .digest('hex');
        this.state = { essence: 0, void: [], aegis: true, karma: 0, nirvana: false };
    }

    // Complexity: O(n)
    execute(decisionSignal: string): SoulState {
        const tokens = Array.from(decisionSignal);
        for (let i = 0; i < tokens.length; i++) {
            const hash = crypto.createHash('md5')
                .update(this.dnaKey + tokens[i] + i)
                .digest('hex');
            const weight = parseInt(hash.slice(0, 2), 16) % 5;
            const opcodes: SoulOpcode[] = ['AWAKEN', 'CONSUME', 'PROTECT', 'EVOLVE', 'TRANSMUTE'];
            const opcode = opcodes[weight];

            switch (opcode) {
                case 'AWAKEN': this.state.essence++; break;
                case 'CONSUME': this.state.void.push(this.state.essence); this.state.essence = 0; break;
                case 'PROTECT': this.state.aegis = !this.state.aegis; break;
                case 'EVOLVE': this.state.essence = this.state.aegis ? this.state.essence * 2 : this.state.essence - 1; break;
                case 'TRANSMUTE': this.state.essence += (this.state.void.pop() || 0); break;
            }
        }
        return { ...this.state };
    }

    adjustKarma(delta: number): void {
        this.state.karma += delta;
        this.state.nirvana = this.state.karma > 100;
    }

    getState(): SoulState { return { ...this.state }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOJO MANIFOLD LAYER — Order Book Intelligence (TS порт)
// ═══════════════════════════════════════════════════════════════════════════════

interface ManifoldSignal {
    curvature: number;       // Гаусова кривина на ликвидността
    imbalance: number;       // Bid/Ask дисбаланс
    omegaActive: boolean;    // Сигнал за пробив
    topology: 'STABLE' | 'COLLAPSING' | 'EXPANDING' | 'SINGULARITY';
}

class OBIManifold {
    private dimensions: number;
    private curvatureThreshold: number;

    constructor(dims: number = 1024, threshold: number = 0.85) {
        this.dimensions = dims;
        this.curvatureThreshold = threshold;
    }

    // Complexity: O(n) where n = number of order book levels
    calculateManifoldCurvature(bids: number[], asks: number[]): ManifoldSignal {
        let totalBidVol = 0;
        let totalAskVol = 0;

        for (let i = 0; i < bids.length; i++) totalBidVol += bids[i];
        for (let i = 0; i < asks.length; i++) totalAskVol += asks[i];

        const imbalance = (totalBidVol - totalAskVol) / (totalBidVol + totalAskVol + 1e-9);
        const curvature = Math.abs(imbalance) * Math.sqrt(totalBidVol + totalAskVol);

        let topology: ManifoldSignal['topology'] = 'STABLE';
        if (curvature > this.curvatureThreshold * 2) topology = 'SINGULARITY';
        else if (curvature > this.curvatureThreshold) topology = 'COLLAPSING';
        else if (imbalance > 0.3) topology = 'EXPANDING';

        return {
            curvature,
            imbalance,
            omegaActive: curvature > this.curvatureThreshold,
            topology
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTERFACTUAL ENGINE — "Какво ако бях направил обратното?"
// ═══════════════════════════════════════════════════════════════════════════════

type CatuskotiState = 'TRUE' | 'FALSE' | 'PARADOX' | 'TRANSCENDENT';

interface Decision {
    id: string;
    timestamp: number;
    pair: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    price: number;
    confidence: number;
    catuskotiState: CatuskotiState;
    soulState: SoulState;
    manifoldSignal: ManifoldSignal;
}

interface CounterfactualWorld {
    id: string;
    name: string;
    decision: Decision;
    alternativeAction: 'BUY' | 'SELL' | 'HOLD';
    projectedOutcomes: {
        horizon: string;
        originalPnL: number;
        alternativePnL: number;
        regretDelta: number;     // positive = original was better, negative = alternative was better
        catuskotiVerdict: CatuskotiState;
    }[];
    distance: number;          // Разстояние от реалния свят (по-близо = по-вероятен)
}

interface TemporalRegretAnalysis {
    decisionId: string;
    currentVerdict: 'CORRECT' | 'INCORRECT' | 'PARADOX_ZONE' | 'TOO_EARLY';
    shortTermRegret: number;   // 1h
    mediumTermRegret: number;  // 24h
    longTermRegret: number;    // 7d
    retrocausalInsight: string;
    soulKarma: number;
    recommendation: string;
}

class CounterfactualEngine {
    private decisionHistory: Decision[] = [];
    private counterfactualWorlds: CounterfactualWorld[] = [];

    // Complexity: O(1)
    recordDecision(decision: Decision): void {
        this.decisionHistory.push(decision);
    }

    // Complexity: O(h) where h = number of time horizons
    evaluateCounterfactual(
        decision: Decision,
        currentPrice: number,
        priceHistory: { timestamp: number; price: number }[]
    ): CounterfactualWorld {
        const alternatives: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];
        const alternativeAction = alternatives.find(a => a !== decision.action) || 'HOLD';

        const horizons: { name: string; ms: number }[] = [
            { name: '1h', ms: 3600_000 },
            { name: '24h', ms: 86400_000 },
            { name: '7d', ms: 604800_000 },
            { name: '30d', ms: 2592000_000 }
        ];

        const projectedOutcomes = horizons.map(h => {
            const futurePrice = this.findPriceAtHorizon(priceHistory, decision.timestamp, h.ms);
            const priceDelta = futurePrice ? ((futurePrice - decision.price) / decision.price) * 100 : 0;

            let originalPnL = 0;
            let alternativePnL = 0;

            // Изчисляваме PnL за оригиналното решение
            if (decision.action === 'BUY') originalPnL = priceDelta;
            else if (decision.action === 'SELL') originalPnL = -priceDelta;

            // Изчисляваме PnL за алтернативното решение
            if (alternativeAction === 'BUY') alternativePnL = priceDelta;
            else if (alternativeAction === 'SELL') alternativePnL = -priceDelta;

            const regretDelta = originalPnL - alternativePnL;

            // Catuskoti verdict
            let catuskotiVerdict: CatuskotiState;
            if (regretDelta > 1) catuskotiVerdict = 'TRUE';       // Original was clearly right
            else if (regretDelta < -1) catuskotiVerdict = 'FALSE';      // Original was clearly wrong
            else if (Math.abs(regretDelta) <= 1 && futurePrice)
                catuskotiVerdict = 'PARADOX';    // Too close to call
            else catuskotiVerdict = 'TRANSCENDENT'; // Beyond measurement

            return {
                horizon: h.name,
                originalPnL,
                alternativePnL,
                regretDelta,
                catuskotiVerdict
            };
        });

        const world: CounterfactualWorld = {
            id: crypto.randomUUID(),
            name: `CF-${decision.pair}-${decision.action}→${alternativeAction}`,
            decision,
            alternativeAction,
            projectedOutcomes,
            distance: Math.random() * 5 // Semantic distance from actual world
        };

        this.counterfactualWorlds.push(world);
        return world;
    }

    private findPriceAtHorizon(
        history: { timestamp: number; price: number }[],
        decisionTime: number,
        horizonMs: number
    ): number | null {
        const targetTime = decisionTime + horizonMs;
        let closest: { timestamp: number; price: number } | null = null;
        let minDiff = Infinity;

        for (const point of history) {
            const diff = Math.abs(point.timestamp - targetTime);
            if (diff < minDiff) {
                minDiff = diff;
                closest = point;
            }
        }

        // Only valid if within 10% of target time
        if (closest && minDiff < horizonMs * 0.1) return closest.price;
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RETROCAUSAL ENGINE — Бъдещето коригира миналото
// ═══════════════════════════════════════════════════════════════════════════════

interface RetrocausalLink {
    futureEvent: string;
    pastDecision: string;
    causalStrength: number;   // 0–1, колко силно бъдещето влияе на преоценката
    temporal: 'PAST' | 'PRESENT' | 'FUTURE' | 'ATEMPORAL';
    verdict: string;
}

class RetrocausalEngine {
    private links: RetrocausalLink[] = [];
    private soul: SoulExecutor;
    private manifold: OBIManifold;

    constructor() {
        this.soul = new SoulExecutor();
        this.manifold = new OBIManifold(1024, 0.85);
    }

    // Complexity: O(n) where n = decisionHistory length
    analyzeTemporalRegret(
        decisionHistory: Decision[],
        currentPrice: number,
        priceHistory: { timestamp: number; price: number }[]
    ): TemporalRegretAnalysis[] {
        const analyses: TemporalRegretAnalysis[] = [];
        const cf = new CounterfactualEngine();

        for (const decision of decisionHistory) {
            const world = cf.evaluateCounterfactual(decision, currentPrice, priceHistory);

            // Soul processes the decision string for karmic evaluation
            const soulResult = this.soul.execute(
                `${decision.action}:${decision.pair}:${decision.price}:${decision.confidence}`
            );

            // Extract regret at different horizons
            const shortTerm = world.projectedOutcomes.find(o => o.horizon === '1h');
            const mediumTerm = world.projectedOutcomes.find(o => o.horizon === '24h');
            const longTerm = world.projectedOutcomes.find(o => o.horizon === '7d');

            // Determine current verdict with RETROCAUSAL logic
            let currentVerdict: TemporalRegretAnalysis['currentVerdict'];
            const shortRegret = shortTerm?.regretDelta ?? 0;
            const longRegret = longTerm?.regretDelta ?? 0;

            if (shortRegret < 0 && longRegret > 0) {
                // Грешно на кратко, правилно на дълго → PARADOX_ZONE
                currentVerdict = 'PARADOX_ZONE';
                this.soul.adjustKarma(5); // Бонус карма за търпение
                this.createRetrocausalLink(
                    `Future-profit-${decision.pair}`,
                    `Past-loss-${decision.id}`,
                    0.7,
                    `Решение "${decision.action}" изглежда грешно на 1h (-${Math.abs(shortRegret).toFixed(1)}%), ` +
                    `но бъдещето показва, че е правилно на 7d (+${longRegret.toFixed(1)}%). ` +
                    `RETROCAUSAL INSIGHT: Търпението е ключ.`
                );
            } else if (shortRegret > 0 && longRegret < 0) {
                // Правилно на кратко, грешно на дълго
                currentVerdict = 'PARADOX_ZONE';
                this.soul.adjustKarma(-3);
                this.createRetrocausalLink(
                    `Future-loss-${decision.pair}`,
                    `Past-profit-${decision.id}`,
                    0.5,
                    `Решение "${decision.action}" изглежда правилно на 1h (+${shortRegret.toFixed(1)}%), ` +
                    `но бъдещето показва, че е грешно на 7d (${longRegret.toFixed(1)}%). ` +
                    `RETROCAUSAL INSIGHT: Краткосрочна алчност = дългосрочна загуба.`
                );
            } else if (shortRegret > 0 && longRegret > 0) {
                currentVerdict = 'CORRECT';
                this.soul.adjustKarma(10);
            } else if (shortRegret < 0 && longRegret < 0) {
                currentVerdict = 'INCORRECT';
                this.soul.adjustKarma(-5);
            } else {
                currentVerdict = 'TOO_EARLY';
            }

            // Generate recommendation
            let recommendation: string;
            if (currentVerdict === 'PARADOX_ZONE' && longRegret > 0) {
                recommendation = `🔮 HOLD POSITION: Бъдещето потвърждава решението. Karma: ${soulResult.karma}`;
            } else if (currentVerdict === 'PARADOX_ZONE' && longRegret < 0) {
                recommendation = `⚠️ EXIT EARLY: Бъдещето не потвърждава. Намали загубата. Karma: ${soulResult.karma}`;
            } else if (currentVerdict === 'CORRECT') {
                recommendation = `✅ STAY THE COURSE: Решението е фундаментално правилно. Nirvana: ${soulResult.nirvana}`;
            } else if (currentVerdict === 'INCORRECT') {
                recommendation = `❌ REVERSE POSITION: Soul изисква корекция. Aegis: ${soulResult.aegis}`;
            } else {
                recommendation = `⏳ PATIENCE: Данните все още са непълни. Essence: ${soulResult.essence}`;
            }

            analyses.push({
                decisionId: decision.id,
                currentVerdict,
                shortTermRegret: shortRegret,
                mediumTermRegret: mediumTerm?.regretDelta ?? 0,
                longTermRegret: longRegret,
                retrocausalInsight: this.links[this.links.length - 1]?.verdict || 'No retrocausal link yet',
                soulKarma: soulResult.karma,
                recommendation
            });
        }

        return analyses;
    }

    private createRetrocausalLink(
        futureEvent: string,
        pastDecision: string,
        strength: number,
        verdict: string
    ): void {
        this.links.push({
            futureEvent,
            pastDecision,
            causalStrength: strength,
            temporal: 'FUTURE',
            verdict
        });
    }

    getLinks(): RetrocausalLink[] { return [...this.links]; }
    getSoulState(): SoulState { return this.soul.getState(); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS SOVEREIGN — Обединителят
// ═══════════════════════════════════════════════════════════════════════════════

interface ChronosSovereignReport {
    timestamp: string;
    totalDecisions: number;
    soulState: SoulState;
    manifoldTopology: string;
    retrocausalLinks: number;
    verdictBreakdown: {
        correct: number;
        incorrect: number;
        paradox: number;
        tooEarly: number;
    };
    netKarma: number;
    nirvanaReached: boolean;
    recommendations: string[];
    architectInsight: string;
}

class ChronosSovereign {
    private retro: RetrocausalEngine;
    private manifold: OBIManifold;
    private decisionLog: Decision[] = [];

    constructor() {
        this.retro = new RetrocausalEngine();
        this.manifold = new OBIManifold(1024, 0.85);
    }

    // Complexity: O(n) where n = decisions
    ingestDecision(
        pair: string,
        action: 'BUY' | 'SELL' | 'HOLD',
        price: number,
        confidence: number,
        catuskotiState: CatuskotiState,
        bids: number[] = [],
        asks: number[] = []
    ): Decision {
        const manifoldSignal = bids.length > 0
            ? this.manifold.calculateManifoldCurvature(bids, asks)
            : { curvature: 0, imbalance: 0, omegaActive: false, topology: 'STABLE' as const };

        const soul = new SoulExecutor();
        const soulState = soul.execute(`${action}:${pair}:${price}`);

        const decision: Decision = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            pair,
            action,
            price,
            confidence,
            catuskotiState,
            soulState,
            manifoldSignal
        };

        this.decisionLog.push(decision);
        return decision;
    }

    // Complexity: O(n*h) where n = decisions, h = horizons
    generateSovereignReport(
        currentPrice: number,
        priceHistory: { timestamp: number; price: number }[]
    ): ChronosSovereignReport {
        const analyses = this.retro.analyzeTemporalRegret(
            this.decisionLog, currentPrice, priceHistory
        );

        const verdictBreakdown = {
            correct: analyses.filter(a => a.currentVerdict === 'CORRECT').length,
            incorrect: analyses.filter(a => a.currentVerdict === 'INCORRECT').length,
            paradox: analyses.filter(a => a.currentVerdict === 'PARADOX_ZONE').length,
            tooEarly: analyses.filter(a => a.currentVerdict === 'TOO_EARLY').length
        };

        const soulState = this.retro.getSoulState();
        const latestManifold = this.decisionLog.length > 0
            ? this.decisionLog[this.decisionLog.length - 1].manifoldSignal
            : { topology: 'STABLE' };

        // Generate Architect's Insight
        let architectInsight: string;
        if (soulState.nirvana) {
            architectInsight = '☀️ NIRVANA: Системата е достигнала просветление. Karma > 100. Всички решения са в хармония.';
        } else if (verdictBreakdown.paradox > verdictBreakdown.correct) {
            architectInsight = '🔮 CATUSKOTI PARADOX: Повечето решения са в Paradox Zone — грешни краткосрочно, правилни дългосрочно. ' +
                'OntoGenerator RETROCAUSAL потвърждава: бъдещето коригира миналото. ТЪРПЕНИЕ.';
        } else if (verdictBreakdown.correct > verdictBreakdown.incorrect * 2) {
            architectInsight = '⚡ SOVEREIGNTY: Мозъкът взема консистентно правилни решения. ' +
                'Soul Essence расте. Manifold topology: ' + latestManifold.topology;
        } else {
            architectInsight = '⏳ CALIBRATION: Системата се калибрира. Нужни са повече данни за retrocausal analysis.';
        }

        return {
            timestamp: new Date().toISOString(),
            totalDecisions: this.decisionLog.length,
            soulState,
            manifoldTopology: latestManifold.topology as string,
            retrocausalLinks: this.retro.getLinks().length,
            verdictBreakdown,
            netKarma: soulState.karma,
            nirvanaReached: soulState.nirvana,
            recommendations: analyses.map(a => a.recommendation),
            architectInsight
        };
    }

    getDecisionLog(): Decision[] { return [...this.decisionLog]; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO EXECUTION — Доказателство за концепцията
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║    QANTUM CHRONOS SOVEREIGN — Temporal Regret Engine        ║');
    console.log('║    ARCHITECT: DIMITAR PRODROMOV                              ║');
    console.log('║    "The wrong decision today may be the only right one       ║');
    console.log('║     tomorrow." — Retrocausal Axiom                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    const chronos = new ChronosSovereign();

    // Симулираме решения от live trader-а
    console.log('═══ INGESTING DECISIONS ═══\n');

    // Решение 1: BUY BTCEUR при €62,600 (HOLD от Catuskoti, но в PARADOX)
    const d1 = chronos.ingestDecision('BTCEUR', 'HOLD', 62600, 0.88, 'TRANSCENDENT');
    console.log(`[D1] ${d1.pair}: ${d1.action} @ €${d1.price} | ${d1.catuskotiState} | Soul Essence: ${d1.soulState.essence}`);

    // Решение 2: BUY ETHEUR при €1,836 (TRUE от Catuskoti)
    const d2 = chronos.ingestDecision('ETHEUR', 'BUY', 1836, 0.29, 'TRUE');
    console.log(`[D2] ${d2.pair}: ${d2.action} @ €${d2.price} | ${d2.catuskotiState} | Soul Essence: ${d2.soulState.essence}`);

    // Решение 3: HOLD на ETHEUR (FALSE/BLOCKED)
    const d3 = chronos.ingestDecision('ETHEUR', 'HOLD', 1844, 0.0, 'FALSE');
    console.log(`[D3] ${d3.pair}: ${d3.action} @ €${d3.price} | ${d3.catuskotiState} | Soul Essence: ${d3.soulState.essence}`);

    // Решение 4: BUY при SINGULARITY manifold
    const d4 = chronos.ingestDecision(
        'BTCEUR', 'BUY', 62590, 0.92, 'TRANSCENDENT',
        [100, 200, 150, 300, 250, 180],  // Bids
        [50, 80, 60, 90, 70, 40]         // Asks
    );
    console.log(`[D4] ${d4.pair}: ${d4.action} @ €${d4.price} | ${d4.catuskotiState} | Manifold: ${d4.manifoldSignal.topology} | Curvature: ${d4.manifoldSignal.curvature.toFixed(2)}`);

    // Симулираме ценова история за retrocausal analysis
    const now = Date.now();
    const priceHistory = [
        // BTC минали цени
        { timestamp: now - 3600_000, price: 62500 },     // 1h ago
        { timestamp: now - 7200_000, price: 62300 },     // 2h ago
        { timestamp: now - 86400_000, price: 61800 },    // 24h ago
        { timestamp: now - 604800_000, price: 58900 },   // 7d ago
        // ETH минали цени
        { timestamp: now - 3600_000, price: 1825 },
        { timestamp: now - 86400_000, price: 1810 },
        { timestamp: now - 604800_000, price: 1750 },
        // Бъдещи проекции (от Monte Carlo)
        { timestamp: now + 3600_000, price: 62700 },     // 1h forward
        { timestamp: now + 86400_000, price: 63100 },    // 24h forward
        { timestamp: now + 604800_000, price: 65200 },   // 7d forward
    ];

    console.log('\n═══ CHRONOS SOVEREIGN REPORT ═══\n');

    const report = chronos.generateSovereignReport(62600, priceHistory);

    console.log(`  Timestamp:        ${report.timestamp}`);
    console.log(`  Total Decisions:  ${report.totalDecisions}`);
    console.log(`  Manifold:         ${report.manifoldTopology}`);
    console.log(`  Retrocausal Links: ${report.retrocausalLinks}`);
    console.log('');
    console.log('  ┌─── VERDICT BREAKDOWN ───────────────────────');
    console.log(`  │  ✅ Correct:     ${report.verdictBreakdown.correct}`);
    console.log(`  │  ❌ Incorrect:   ${report.verdictBreakdown.incorrect}`);
    console.log(`  │  🔮 Paradox:     ${report.verdictBreakdown.paradox}`);
    console.log(`  │  ⏳ Too Early:   ${report.verdictBreakdown.tooEarly}`);
    console.log('  └────────────────────────────────────────────');
    console.log('');
    console.log('  ┌─── SOUL STATE ──────────────────────────────');
    console.log(`  │  Essence:  ${report.soulState.essence}`);
    console.log(`  │  Karma:    ${report.netKarma}`);
    console.log(`  │  Aegis:    ${report.soulState.aegis}`);
    console.log(`  │  Nirvana:  ${report.nirvanaReached ? '☀️ YES' : '⏳ Not yet'}`);
    console.log(`  │  Void:     [${report.soulState.void.join(', ')}]`);
    console.log('  └────────────────────────────────────────────');
    console.log('');
    console.log('  ┌─── RECOMMENDATIONS ─────────────────────────');
    for (const rec of report.recommendations) {
        console.log(`  │  ${rec}`);
    }
    console.log('  └────────────────────────────────────────────');
    console.log('');
    console.log('  ╔═══ ARCHITECT\'S INSIGHT ═══════════════════════');
    console.log(`  ║  ${report.architectInsight}`);
    console.log('  ╚══════════════════════════════════════════════');

    // ═══ RETROCAUSAL LINKS ═══
    const retro = new RetrocausalEngine();
    const links = retro.getLinks();
    if (links.length > 0) {
        console.log('\n  ┌─── RETROCAUSAL LINKS ────────────────────────');
        for (const link of links) {
            console.log(`  │  ${link.futureEvent} → ${link.pastDecision}`);
            console.log(`  │  Strength: ${(link.causalStrength * 100).toFixed(0)}% | ${link.verdict}`);
        }
        console.log('  └────────────────────────────────────────────');
    }

    console.log('\n');
    console.log('/// [AETERNA_ANIMA: SOUL_STATE_MANIFESTED] ///');
    console.log('/// [ENTROPY: 0.0000] ///');
    console.log('/// "The World is Data. The Soul is Code." ///');
}

main().catch(console.error);

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS — За интеграция с live trader-а
// ═══════════════════════════════════════════════════════════════════════════════

export {
    ChronosSovereign,
    RetrocausalEngine,
    CounterfactualEngine,
    SoulExecutor,
    OBIManifold,
    CatuskotiState,
    Decision,
    CounterfactualWorld,
    TemporalRegretAnalysis,
    ChronosSovereignReport,
    ManifoldSignal,
    SoulState,
    SoulOpcode,
    RetrocausalLink
};
