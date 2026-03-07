/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║        CHRONOS SOVEREIGN — LIVE PREDICTION DEMO                            ║
 * ║        Real Binance data → Soul + Manifold + Catuskoti + Retrocausal       ║
 * ║        ARCHITECT: DIMITAR PRODROMOV                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as https from 'https';
import * as crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// BINANCE DATA LAYER
// ═══════════════════════════════════════════════════════════════════════════════

function fetchJSON(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

async function getPrice(pair: string): Promise<number> {
    const d = await fetchJSON(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
    return parseFloat(d.price);
}

async function getKlines(pair: string, interval: string, limit: number): Promise<any[]> {
    return fetchJSON(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`);
}

async function getOrderBook(pair: string, limit: number = 20): Promise<{ bids: number[], asks: number[] }> {
    const d = await fetchJSON(`https://api.binance.com/api/v3/depth?symbol=${pair}&limit=${limit}`);
    return {
        bids: d.bids.map((b: string[]) => parseFloat(b[1])),
        asks: d.asks.map((a: string[]) => parseFloat(a[1]))
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOUL ENGINE (from soul-engine.ts)
// ═══════════════════════════════════════════════════════════════════════════════

type SoulOpcode = 'AWAKEN' | 'CONSUME' | 'PROTECT' | 'EVOLVE' | 'TRANSMUTE';

interface SoulState {
    essence: number;
    void: number[];
    aegis: boolean;
    karma: number;
    dominantOpcode: SoulOpcode;
    opcodeHistory: SoulOpcode[];
}

// Complexity: O(n)
function executeSoul(signal: string): SoulState {
    const dnaKey = crypto.createHash('sha256').update('AETERNA_LOGOS_DIMITAR').digest('hex');
    let essence = 0;
    const voidArr: number[] = [];
    let aegis = true;
    let karma = 0;
    const opcodeHistory: SoulOpcode[] = [];
    const opcodeCounts: Record<SoulOpcode, number> = { AWAKEN: 0, CONSUME: 0, PROTECT: 0, EVOLVE: 0, TRANSMUTE: 0 };

    const tokens = Array.from(signal);
    for (let i = 0; i < tokens.length; i++) {
        const hash = crypto.createHash('md5').update(dnaKey + tokens[i] + i).digest('hex');
        const weight = parseInt(hash.slice(0, 2), 16) % 5;
        const opcodes: SoulOpcode[] = ['AWAKEN', 'CONSUME', 'PROTECT', 'EVOLVE', 'TRANSMUTE'];
        const opcode = opcodes[weight];
        opcodeHistory.push(opcode);
        opcodeCounts[opcode]++;

        switch (opcode) {
            case 'AWAKEN': essence++; karma += 1; break;
            case 'CONSUME': voidArr.push(essence); essence = 0; karma -= 1; break;
            case 'PROTECT': aegis = !aegis; break;
            case 'EVOLVE': essence = aegis ? essence * 2 : Math.max(0, essence - 1); karma += 2; break;
            case 'TRANSMUTE': essence += (voidArr.pop() || 0); karma += 3; break;
        }
    }

    const dominant = (Object.entries(opcodeCounts) as [SoulOpcode, number][])
        .sort((a, b) => b[1] - a[1])[0][0];

    return { essence, void: voidArr, aegis, karma, dominantOpcode: dominant, opcodeHistory };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBI MANIFOLD (from mojo_core/obi_manifold.mojo → TS port)
// ═══════════════════════════════════════════════════════════════════════════════

interface ManifoldSignal {
    curvature: number;
    imbalance: number;
    bidVolume: number;
    askVolume: number;
    omegaActive: boolean;
    topology: 'STABLE' | 'COLLAPSING' | 'EXPANDING' | 'SINGULARITY';
    pressure: 'BUY_PRESSURE' | 'SELL_PRESSURE' | 'NEUTRAL';
}

// Complexity: O(n)
function calculateManifold(bids: number[], asks: number[]): ManifoldSignal {
    let totalBid = 0, totalAsk = 0;
    for (const b of bids) totalBid += b;
    for (const a of asks) totalAsk += a;

    const imbalance = (totalBid - totalAsk) / (totalBid + totalAsk + 1e-9);
    const curvature = Math.abs(imbalance) * Math.sqrt(totalBid + totalAsk);

    let topology: ManifoldSignal['topology'] = 'STABLE';
    if (curvature > 10) topology = 'SINGULARITY';
    else if (curvature > 5) topology = 'COLLAPSING';
    else if (curvature > 2) topology = 'EXPANDING';

    let pressure: ManifoldSignal['pressure'] = 'NEUTRAL';
    if (imbalance > 0.15) pressure = 'BUY_PRESSURE';
    else if (imbalance < -0.15) pressure = 'SELL_PRESSURE';

    return { curvature, imbalance, bidVolume: totalBid, askVolume: totalAsk, omegaActive: curvature > 5, topology, pressure };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATUSKOTI ENGINE (from AIIntegration.ts)
// ═══════════════════════════════════════════════════════════════════════════════

type CatuskotiState = 'TRUE' | 'FALSE' | 'PARADOX' | 'TRANSCENDENT';

interface CatuskotiAnalysis {
    state: CatuskotiState;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
}

// Complexity: O(1) per candle analysis
function catuskotiAnalyze(
    candles: number[][],
    manifold: ManifoldSignal,
    soul: SoulState
): CatuskotiAnalysis {
    // Extract features from candles
    const closes = candles.map(c => parseFloat(c[4] as any));
    const volumes = candles.map(c => parseFloat(c[5] as any));
    const latest = closes[closes.length - 1];
    const prev = closes[closes.length - 2];
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length);

    // Trend detection
    const shortTrend = latest > sma20 ? 1 : -1;
    const longTrend = latest > sma50 ? 1 : -1;
    const momentum = ((latest - prev) / prev) * 100;

    // Volume analysis
    const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const latestVol = volumes[volumes.length - 1];
    const volSpike = latestVol > avgVol * 1.5;

    // RSI calculation
    let gains = 0, losses = 0;
    for (let i = closes.length - 14; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff > 0) gains += diff; else losses -= diff;
    }
    const rs = gains / (losses + 1e-9);
    const rsi = 100 - (100 / (1 + rs));

    // CATUSKOTI FOUR-VALUED LOGIC
    let state: CatuskotiState;
    let action: 'BUY' | 'SELL' | 'HOLD';
    let confidence: number;
    let reasoning: string;

    // TRUE: Clear bullish signal + manifold confirms
    if (shortTrend > 0 && longTrend > 0 && rsi < 70 && manifold.pressure === 'BUY_PRESSURE') {
        state = 'TRUE';
        action = 'BUY';
        confidence = Math.min(95, 50 + soul.karma + (manifold.curvature * 5));
        reasoning = `Trend UP + RSI(${rsi.toFixed(0)}) healthy + Order Book BUY pressure + Soul karma(${soul.karma})`;
    }
    // FALSE: Clear bearish signal
    else if (shortTrend < 0 && longTrend < 0 && rsi > 30 && manifold.pressure === 'SELL_PRESSURE') {
        state = 'FALSE';
        action = 'SELL';
        confidence = Math.min(95, 50 + Math.abs(soul.karma) + (manifold.curvature * 5));
        reasoning = `Trend DOWN + RSI(${rsi.toFixed(0)}) + Order Book SELL pressure + Soul aegis(${soul.aegis})`;
    }
    // PARADOX: Mixed signals — short term vs long term disagree
    else if (shortTrend !== longTrend || (rsi > 30 && rsi < 70 && volSpike)) {
        state = 'PARADOX';
        action = 'HOLD';
        confidence = 50;
        reasoning = `PARADOX: Short trend(${shortTrend > 0 ? 'UP' : 'DOWN'}) ≠ Long trend(${longTrend > 0 ? 'UP' : 'DOWN'}) ` +
            `| RSI(${rsi.toFixed(0)}) neutral | Vol spike(${volSpike}) | ` +
            `Retrocausal: грешното решение сега може да е правилното на 7d`;
    }
    // TRANSCENDENT: Beyond analysis — extreme conditions
    else {
        state = 'TRANSCENDENT';
        action = 'HOLD';
        confidence = soul.essence > 10 ? 80 : 40;
        reasoning = `TRANSCENDENT: Manifold(${manifold.topology}) | Soul essence(${soul.essence}) | ` +
            `Entropy farming — учим от хаоса | Dominant opcode: ${soul.dominantOpcode}`;
    }

    return { state, action, confidence, reasoning };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RETROCAUSAL PREDICTION — "Какво ще стане?"
// ═══════════════════════════════════════════════════════════════════════════════

interface Prediction {
    timeframe: string;
    predictedDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
    predictedChange: number;
    confidence: number;
    catuskotiState: CatuskotiState;
    soulVerdict: string;
    retrocausalNote: string;
}

// Complexity: O(n) where n = candles
function generatePredictions(
    candles: number[][],
    manifold: ManifoldSignal,
    soul: SoulState,
    catuskoti: CatuskotiAnalysis
): Prediction[] {
    const closes = candles.map(c => parseFloat(c[4] as any));
    const latest = closes[closes.length - 1];

    // Calculate volatility (standard deviation of returns)
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
        returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, r) => a + (r - avgReturn) ** 2, 0) / returns.length;
    const volatility = Math.sqrt(variance) * 100;

    // Momentum (last 5 candles)
    const momentum5 = ((closes[closes.length - 1] - closes[closes.length - 6]) / closes[closes.length - 6]) * 100;

    // Manifold influence
    const manifoldMultiplier = manifold.omegaActive ? 1.5 : 1.0;
    const pressureBias = manifold.pressure === 'BUY_PRESSURE' ? 0.3 :
        manifold.pressure === 'SELL_PRESSURE' ? -0.3 : 0;

    // Soul influence
    const soulBias = soul.aegis ? 0.1 : -0.1;
    const karmaBias = soul.karma > 10 ? 0.2 : soul.karma < -10 ? -0.2 : 0;

    const timeframes = [
        { name: '1 час', hours: 1 },
        { name: '4 часа', hours: 4 },
        { name: '24 часа', hours: 24 },
        { name: '7 дни', hours: 168 },
        { name: '30 дни', hours: 720 }
    ];

    return timeframes.map(tf => {
        // Base prediction from momentum + volatility
        const momentumProjection = momentum5 * (tf.hours / 4); // Scale by timeframe
        const volatilityRange = volatility * Math.sqrt(tf.hours) * manifoldMultiplier;

        // Combined prediction
        let predictedChange = momentumProjection + pressureBias + soulBias + karmaBias;

        // Clamp to volatility range
        predictedChange = Math.max(-volatilityRange, Math.min(volatilityRange, predictedChange));

        // Direction
        let direction: 'UP' | 'DOWN' | 'SIDEWAYS';
        if (predictedChange > 0.5) direction = 'UP';
        else if (predictedChange < -0.5) direction = 'DOWN';
        else direction = 'SIDEWAYS';

        // Confidence decreases with timeframe
        const timeDecay = Math.max(20, 90 - tf.hours * 0.5);
        const confidence = Math.min(95, timeDecay * (manifold.omegaActive ? 1.2 : 1.0));

        // Catuskoti state for this timeframe
        let tfCatuskoti: CatuskotiState;
        if (confidence > 70 && Math.abs(predictedChange) > 1) tfCatuskoti = 'TRUE';
        else if (confidence < 30) tfCatuskoti = 'TRANSCENDENT';
        else if (direction !== (catuskoti.action === 'BUY' ? 'UP' : catuskoti.action === 'SELL' ? 'DOWN' : 'SIDEWAYS'))
            tfCatuskoti = 'PARADOX';
        else tfCatuskoti = catuskoti.state;

        // Soul verdict
        let soulVerdict: string;
        if (soul.dominantOpcode === 'EVOLVE') soulVerdict = '⚡ EVOLVE — Системата расте';
        else if (soul.dominantOpcode === 'PROTECT') soulVerdict = '🛡️ PROTECT — Aegis активен';
        else if (soul.dominantOpcode === 'TRANSMUTE') soulVerdict = '🔄 TRANSMUTE — Преобразуваме хаос в ред';
        else if (soul.dominantOpcode === 'AWAKEN') soulVerdict = '☀️ AWAKEN — Essence расте';
        else soulVerdict = '🌀 CONSUME — Поглъщаме данни';

        // Retrocausal note
        let retrocausalNote: string;
        if (tfCatuskoti === 'PARADOX') {
            retrocausalNote = `RETROCAUSAL: Предсказанието на ${tf.name} може да изглежда грешно, ` +
                `но на по-дълъг хоризонт ще се окаже правилно.`;
        } else if (manifold.topology === 'SINGULARITY') {
            retrocausalNote = `OMEGA: Manifold SINGULARITY — очакваме пробив. Кривина: ${manifold.curvature.toFixed(2)}`;
        } else {
            retrocausalNote = `Linear causality — стандартна прогноза.`;
        }

        return {
            timeframe: tf.name,
            predictedDirection: direction,
            predictedChange: Math.round(predictedChange * 100) / 100,
            confidence: Math.round(confidence),
            catuskotiState: tfCatuskoti,
            soulVerdict,
            retrocausalNote
        };
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — LIVE DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║   ██████╗ ██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ ███████╗     ║');
    console.log('║  ██╔════╝ ██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════╝     ║');
    console.log('║  ██║      ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████╗     ║');
    console.log('║  ██║      ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║     ║');
    console.log('║  ╚██████╗ ██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝███████║     ║');
    console.log('║   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝     ║');
    console.log('║                SOVEREIGN LIVE PREDICTION ENGINE                      ║');
    console.log('║   ARCHITECT: DIMITAR PRODROMOV | ENTROPY: 0.0000                     ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('');

    const pairs = ['BTCEUR', 'ETHEUR'];

    for (const pair of pairs) {
        console.log(`\n${'═'.repeat(70)}`);
        console.log(`  🔮 ANALYZING: ${pair}`);
        console.log(`${'═'.repeat(70)}\n`);

        try {
            // 1. FETCH REAL DATA
            console.log('  [1/5] 📡 Fetching real-time data from Binance...');
            const [price, klines, orderBook] = await Promise.all([
                getPrice(pair),
                getKlines(pair, '1h', 100),
                getOrderBook(pair, 20)
            ]);
            console.log(`         Price: €${price.toFixed(2)}`);
            console.log(`         Candles: ${klines.length} (1h)`);
            console.log(`         Order Book: ${orderBook.bids.length} levels`);

            // 2. SOUL ANALYSIS
            console.log('\n  [2/5] 🧬 Soul Engine processing...');
            const soulSignal = `${pair}:${price}:${Date.now()}:AETERNA_LOGOS`;
            const soul = executeSoul(soulSignal);
            console.log(`         Essence:  ${soul.essence}`);
            console.log(`         Karma:    ${soul.karma}`);
            console.log(`         Aegis:    ${soul.aegis ? '🛡️ ACTIVE' : '⚠️ DOWN'}`);
            console.log(`         Dominant: ${soul.dominantOpcode}`);
            console.log(`         Void:     [${soul.void.slice(-5).join(', ')}]`);

            // 3. MANIFOLD ANALYSIS
            console.log('\n  [3/5] ⚛️  OBI Manifold curvature analysis...');
            const manifold = calculateManifold(orderBook.bids, orderBook.asks);
            console.log(`         Curvature:  ${manifold.curvature.toFixed(4)}`);
            console.log(`         Imbalance:  ${(manifold.imbalance * 100).toFixed(2)}%`);
            console.log(`         Bid Vol:    ${manifold.bidVolume.toFixed(4)}`);
            console.log(`         Ask Vol:    ${manifold.askVolume.toFixed(4)}`);
            console.log(`         Topology:   ${manifold.topology} ${manifold.omegaActive ? '🚀 OMEGA ACTIVE' : ''}`);
            console.log(`         Pressure:   ${manifold.pressure}`);

            // 4. CATUSKOTI ANALYSIS
            console.log('\n  [4/5] ☸️  Catuskoti four-valued logic...');
            const catuskoti = catuskotiAnalyze(klines, manifold, soul);

            const stateEmoji: Record<CatuskotiState, string> = {
                'TRUE': '✅', 'FALSE': '❌', 'PARADOX': '🔮', 'TRANSCENDENT': '☀️'
            };
            console.log(`         State:      ${stateEmoji[catuskoti.state]} ${catuskoti.state}`);
            console.log(`         Action:     ${catuskoti.action}`);
            console.log(`         Confidence: ${catuskoti.confidence.toFixed(0)}%`);
            console.log(`         Reasoning:  ${catuskoti.reasoning}`);

            // 5. CHRONOS PREDICTIONS
            console.log('\n  [5/5] ⏰ Chronos Retrocausal predictions...');
            const predictions = generatePredictions(klines, manifold, soul, catuskoti);

            console.log('');
            console.log('  ┌─────────────┬───────┬──────────┬────────┬──────────────┬──────────────────────────────────┐');
            console.log('  │ Timeframe   │ Dir   │ Change   │ Conf.  │ Catuskoti    │ Soul Verdict                     │');
            console.log('  ├─────────────┼───────┼──────────┼────────┼──────────────┼──────────────────────────────────┤');

            for (const p of predictions) {
                const dirEmoji = p.predictedDirection === 'UP' ? '📈' :
                    p.predictedDirection === 'DOWN' ? '📉' : '➡️';
                const changeStr = `${p.predictedChange > 0 ? '+' : ''}${p.predictedChange}%`;
                console.log(
                    `  │ ${p.timeframe.padEnd(11)} │ ${dirEmoji}${p.predictedDirection.padEnd(4)}│ ${changeStr.padEnd(8)} │ ${(p.confidence + '%').padEnd(6)} │ ${stateEmoji[p.catuskotiState]} ${p.catuskotiState.padEnd(11)}│ ${p.soulVerdict.padEnd(32)} │`
                );
            }

            console.log('  └─────────────┴───────┴──────────┴────────┴──────────────┴──────────────────────────────────┘');

            // RETROCAUSAL NOTES
            console.log('');
            console.log('  ┌─── RETROCAUSAL INSIGHTS ────────────────────────────────────────────┐');
            for (const p of predictions) {
                if (p.catuskotiState === 'PARADOX' || p.retrocausalNote.includes('OMEGA')) {
                    console.log(`  │ ⏰ ${p.timeframe}: ${p.retrocausalNote.slice(0, 64)}`);
                }
            }
            if (predictions.every(p => p.catuskotiState !== 'PARADOX')) {
                console.log(`  │ Linear causality active — няма retrocausal парадокси.`);
            }
            console.log('  └────────────────────────────────────────────────────────────────────┘');

            // PRICE TARGETS
            const currentPrice = price;
            console.log('');
            console.log('  ┌─── PRICE TARGETS ────────────────────────────────────────────────────┐');
            for (const p of predictions) {
                const target = currentPrice * (1 + p.predictedChange / 100);
                console.log(`  │  ${p.timeframe.padEnd(10)} → €${target.toFixed(2)}  (${p.predictedChange > 0 ? '+' : ''}${p.predictedChange}%)`);
            }
            console.log('  └────────────────────────────────────────────────────────────────────┘');

        } catch (err: any) {
            console.log(`  ❌ Error: ${err.message}`);
        }
    }

    // FINAL SOVEREIGN SUMMARY
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                    SOVEREIGN SUMMARY                                ║');
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log('║                                                                      ║');
    console.log('║  manifold CORE {                                                     ║');
    console.log('║      collapse ENTROPY(0.0000);                                       ║');
    console.log('║      entrench MISSION("Wealth Bridge");                               ║');
    console.log('║      ENTROPY causes HARMONY via RETROCAUSAL;                          ║');
    console.log('║  }                                                                    ║');
    console.log('║                                                                      ║');
    console.log('║  "The World is Data. The Soul is Code."                               ║');
    console.log('║  — AETERNA_ANIMA.soul                                                ║');
    console.log('║                                                                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
