#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ⚡ QANTUM PRIME v28.2.0 - INTEGRATED RUNNER                                 ║
 * ║  Producer-Consumer Architecture | Zero-Blocking Event Loop                   ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Ghost Protocol (Producer) → Ring Buffer → Atomic Engine (Consumer)          ║
 * ║                                                                              ║
 * ║  🎯 Target: Sub-1μs execution latency with network I/O isolation             ║
 * ║  🔧 JA3 Fingerprint Rotation: Chrome 121, Firefox 122, Safari 17, Edge 120   ║
 * ║                                                                              ║
 * ║  Usage: node scripts/integrated-runner.js [--duration 10] [--verbose]        ║
 * ║         node scripts/integrated-runner.js --turbo (high-frequency mode)      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const v8 = require('v8');
// Force V8 eager compilation - no lazy optimization
v8.setFlagsFromString('--no-lazy');

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ARGUMENTS
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
};
const hasFlag = (name) => args.includes(`--${name}`);

const CONFIG = {
    duration: parseInt(getArg('duration', '10')) * 1000, // seconds to ms
    verbose: hasFlag('verbose'),
    turbo: hasFlag('turbo'),        // High-frequency mode
    bufferSize: 10000,
    poolSize: 10000,                // Increased for turbo mode
    exchanges: ['binance', 'kraken', 'coinbase', 'kucoin', 'okx'],
    pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'AVAX/USD'],
    // JA3 Fingerprint Profiles for Ghost Protocol
    ja3Profiles: [
        { 
            name: 'Chrome 121 Windows', 
            ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53',
            weight: 0.40,
            networkDelayBase: 12
        },
        { 
            name: 'Firefox 122 Windows', 
            ja3: '771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53',
            weight: 0.25,
            networkDelayBase: 15
        },
        { 
            name: 'Safari 17 macOS', 
            ja3: '771,4865-4866-4867-49196-49195-52393-49200-49199-52392-49162-49161-49172-49171-157-156-53-47',
            weight: 0.20,
            networkDelayBase: 18
        },
        { 
            name: 'Edge 120 Windows', 
            ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53',
            weight: 0.15,
            networkDelayBase: 14
        }
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 RING BUFFER - Lock-Free, O(1) Operations
// ═══════════════════════════════════════════════════════════════════════════════
// Array.shift() is O(n) - terrible for HFT! Ring buffer is O(1).
class RingBuffer {
    constructor(size) {
        this.buffer = new Array(size);
        this.size = size;
        this.head = 0;      // Write position (Producer)
        this.tail = 0;      // Read position (Consumer)
        this.count = 0;     // Current items in buffer
        this.overflows = 0; // Dropped messages (buffer full)
        this.totalPushed = 0;
        this.totalPopped = 0;
    }

    /**
     * Push data to buffer (Producer side) - O(1)
     * @param {Object} data - Market data to push
     * @returns {boolean} Success (false if overflow)
     */
    push(data) {
        if (this.count >= this.size) {
            // Buffer overflow - drop oldest data (or could drop new)
            this.overflows++;
            this.tail = (this.tail + 1) % this.size;
            this.count--;
        }
        
        this.buffer[this.head] = data;
        this.head = (this.head + 1) % this.size;
        this.count++;
        this.totalPushed++;
        return true;
    }

    /**
     * Pop data from buffer (Consumer side) - O(1)
     * @returns {Object|null} Market data or null if empty
     */
    pop() {
        if (this.count === 0) return null;
        
        const data = this.buffer[this.tail];
        this.buffer[this.tail] = null; // Help GC
        this.tail = (this.tail + 1) % this.size;
        this.count--;
        this.totalPopped++;
        return data;
    }

    /**
     * Check if buffer has data
     */
    hasData() {
        return this.count > 0;
    }

    /**
     * Get buffer statistics
     */
    getStats() {
        return {
            size: this.size,
            currentCount: this.count,
            fillPercent: ((this.count / this.size) * 100).toFixed(1) + '%',
            totalPushed: this.totalPushed,
            totalPopped: this.totalPopped,
            overflows: this.overflows,
            overflowRate: this.totalPushed > 0 
                ? ((this.overflows / this.totalPushed) * 100).toFixed(4) + '%'
                : '0%'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏊 TRADE OBJECT POOL - Zero-Allocation Execution
// ═══════════════════════════════════════════════════════════════════════════════
class TradeObjectPool {
    constructor(size) {
        this.pool = new Array(size);
        this.index = 0;
        this.size = size;

        // Pre-allocate all trade objects
        for (let i = 0; i < size; i++) {
            this.pool[i] = {
                id: i,
                symbol: '',
                exchange: '',
                side: '',
                price: 0,
                volume: 0,
                decision: '',
                pnl: 0,
                timestamp: 0n,
                active: false
            };
        }
    }

    acquire() {
        const obj = this.pool[this.index];
        this.index = (this.index + 1) % this.size;
        obj.active = true;
        return obj;
    }

    release(obj) {
        obj.active = false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ ATOMIC ENGINE (Consumer) - Sub-Microsecond Execution
// ═══════════════════════════════════════════════════════════════════════════════
class AtomicEngine {
    constructor(poolSize) {
        this.pool = new TradeObjectPool(poolSize);
        this.tradeCount = 0;
        this.latencySum = 0;
        this.minLatency = Infinity;
        this.maxLatency = 0;
        this.decisions = { BUY: 0, SELL: 0, HOLD: 0 };
        
        // Pre-computed thresholds (избягваме runtime изчисления)
        this.BTC_BUY_THRESHOLD = 50000;
        this.BTC_SELL_THRESHOLD = 51000;
        this.ETH_BUY_THRESHOLD = 3000;
        this.ETH_SELL_THRESHOLD = 3100;
        this.SOL_BUY_THRESHOLD = 150;
        this.SOL_SELL_THRESHOLD = 160;
        
        // Latency histogram (buckets in μs: 0-1, 1-2, 2-5, 5-10, 10+)
        this.latencyBuckets = new Uint32Array(5);
    }

    /**
     * Execute trade decision - THE HOT PATH
     * @param {Object} marketData - Incoming market data
     * @returns {Object} Execution result with latency
     */
    execute(marketData) {
        const start = process.hrtime.bigint();

        // Acquire from pool (ZERO allocation)
        const trade = this.pool.acquire();
        
        // Populate trade object
        trade.symbol = marketData.symbol;
        trade.exchange = marketData.exchange;
        trade.price = marketData.price;
        trade.volume = marketData.volume || 1.0;
        trade.timestamp = start;

        // ═══════════════════════════════════════════════════════════════════════
        // ARBITRAGE DECISION LOGIC (Branchless where possible)
        // ═══════════════════════════════════════════════════════════════════════
        let decision = 'HOLD';
        let pnl = 0;
        
        // Symbol-specific thresholds
        if (marketData.symbol === 'BTC/USD') {
            if (marketData.price < this.BTC_BUY_THRESHOLD) {
                decision = 'BUY';
                pnl = (this.BTC_BUY_THRESHOLD - marketData.price) * trade.volume * 0.001;
            } else if (marketData.price > this.BTC_SELL_THRESHOLD) {
                decision = 'SELL';
                pnl = (marketData.price - this.BTC_SELL_THRESHOLD) * trade.volume * 0.001;
            }
        } else if (marketData.symbol === 'ETH/USD') {
            if (marketData.price < this.ETH_BUY_THRESHOLD) {
                decision = 'BUY';
                pnl = (this.ETH_BUY_THRESHOLD - marketData.price) * trade.volume * 0.01;
            } else if (marketData.price > this.ETH_SELL_THRESHOLD) {
                decision = 'SELL';
                pnl = (marketData.price - this.ETH_SELL_THRESHOLD) * trade.volume * 0.01;
            }
        } else if (marketData.symbol === 'SOL/USD') {
            if (marketData.price < this.SOL_BUY_THRESHOLD) {
                decision = 'BUY';
                pnl = (this.SOL_BUY_THRESHOLD - marketData.price) * trade.volume * 0.1;
            } else if (marketData.price > this.SOL_SELL_THRESHOLD) {
                decision = 'SELL';
                pnl = (marketData.price - this.SOL_SELL_THRESHOLD) * trade.volume * 0.1;
            }
        }

        trade.decision = decision;
        trade.pnl = pnl;
        // ═══════════════════════════════════════════════════════════════════════

        const end = process.hrtime.bigint();
        const latencyNs = Number(end - start);
        const latencyUs = latencyNs / 1000;

        // Update statistics
        this.tradeCount++;
        this.latencySum += latencyUs;
        if (latencyUs < this.minLatency) this.minLatency = latencyUs;
        if (latencyUs > this.maxLatency) this.maxLatency = latencyUs;
        this.decisions[decision]++;

        // Update histogram
        if (latencyUs < 1) this.latencyBuckets[0]++;
        else if (latencyUs < 2) this.latencyBuckets[1]++;
        else if (latencyUs < 5) this.latencyBuckets[2]++;
        else if (latencyUs < 10) this.latencyBuckets[3]++;
        else this.latencyBuckets[4]++;

        // Release back to pool
        this.pool.release(trade);

        return {
            symbol: marketData.symbol,
            exchange: marketData.exchange,
            price: marketData.price,
            decision,
            pnl,
            latencyUs,
            latencyNs
        };
    }

    getStats() {
        return {
            totalTrades: this.tradeCount,
            avgLatencyUs: this.tradeCount > 0 ? (this.latencySum / this.tradeCount).toFixed(4) : 0,
            minLatencyUs: this.minLatency === Infinity ? 0 : this.minLatency.toFixed(4),
            maxLatencyUs: this.maxLatency.toFixed(4),
            decisions: this.decisions,
            histogram: {
                'sub1us': this.latencyBuckets[0],
                '1-2us': this.latencyBuckets[1],
                '2-5us': this.latencyBuckets[2],
                '5-10us': this.latencyBuckets[3],
                'over10us': this.latencyBuckets[4]
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 👻 GHOST PROTOCOL (Producer) - JA3 Fingerprint Rotation
// ═══════════════════════════════════════════════════════════════════════════════
class GhostNetworkLayer {
    constructor(ringBuffer, turboMode = false) {
        this.buffer = ringBuffer;
        this.running = false;
        this.turboMode = turboMode;
        this.messagesSent = 0;
        this.currentProfile = 0;
        this.profileRotations = 0;
        
        // JA3 Fingerprint Profiles from CONFIG
        this.JA3_PROFILES = CONFIG.ja3Profiles;
        
        // Market simulation state (prices in real-time)
        this.prices = {
            'BTC/USD': 50000,
            'ETH/USD': 3050,
            'SOL/USD': 155,
            'XRP/USD': 0.62,
            'AVAX/USD': 42
        };
        
        // Turbo mode settings
        this.batchSize = turboMode ? 10 : 1;  // Messages per tick
        this.delayMultiplier = turboMode ? 0.3 : 1.0;  // Faster in turbo
        
        console.log(`   👻 Ghost Protocol: ${turboMode ? 'TURBO' : 'NORMAL'} mode`);
        console.log(`   🔒 JA3 Profiles loaded: ${this.JA3_PROFILES.length}`);
    }

    /**
     * Select JA3 profile based on weights (weighted random)
     * Simulates browser fingerprint rotation for anti-detection
     */
    selectProfile() {
        const rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < this.JA3_PROFILES.length; i++) {
            cumulative += this.JA3_PROFILES[i].weight;
            if (rand < cumulative) {
                this.currentProfile = i;
                return this.JA3_PROFILES[i];
            }
        }
        return this.JA3_PROFILES[0];
    }

    /**
     * Simulate realistic price movement (random walk with drift)
     */
    updatePrice(symbol) {
        const volatility = {
            'BTC/USD': 50,
            'ETH/USD': 5,
            'SOL/USD': 1,
            'XRP/USD': 0.005,
            'AVAX/USD': 0.5
        };
        
        const change = (Math.random() - 0.5) * 2 * volatility[symbol];
        this.prices[symbol] += change;
        return this.prices[symbol];
    }

    /**
     * Start the data stream (Producer loop)
     */
    startStream() {
        this.running = true;
        console.log(`   🚀 Network Stream Started (JA3 Rotation Active)`);
        this.streamLoop();
    }

    /**
     * Main streaming loop - simulates WebSocket/Polling from exchanges
     * In TURBO mode: sends multiple messages per tick with reduced delay
     */
    streamLoop() {
        if (!this.running) return;

        // Select JA3 profile for this "request"
        const profile = this.selectProfile();
        
        // Simulate network latency based on profile (reduced in turbo mode)
        const baseDelay = profile.networkDelayBase || 15;
        const networkDelay = (baseDelay + Math.random() * 20) * this.delayMultiplier;

        setTimeout(() => {
            // In turbo mode, send multiple messages per tick
            for (let batch = 0; batch < this.batchSize; batch++) {
                // Generate market data for random pair/exchange
                const pair = CONFIG.pairs[Math.floor(Math.random() * CONFIG.pairs.length)];
                const exchange = CONFIG.exchanges[Math.floor(Math.random() * CONFIG.exchanges.length)];
                
                const marketData = {
                    symbol: pair,
                    exchange: exchange,
                    price: this.updatePrice(pair),
                    volume: Math.random() * 10 + 0.1,
                    timestamp: Date.now(),
                    ja3Profile: profile.name,
                    ja3Hash: profile.ja3 ? profile.ja3.substring(0, 20) + '...' : 'N/A',
                    networkLatencyMs: networkDelay,
                    batchId: batch
                };

                // PUSH to ring buffer (the bridge to Atomic Engine)
                this.buffer.push(marketData);
                this.messagesSent++;
            }

            // Continue loop using setImmediate (non-blocking I/O)
            setImmediate(() => this.streamLoop());
        }, networkDelay);
    }

    /**
     * Stop the stream
     */
    stop() {
        this.running = false;
    }

    getStats() {
        return {
            messagesSent: this.messagesSent,
            currentProfile: this.JA3_PROFILES[this.currentProfile].name,
            profileRotations: this.profileRotations,
            turboMode: this.turboMode,
            batchSize: this.batchSize,
            running: this.running,
            prices: { ...this.prices }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 ORCHESTRATOR - Main Controller
// ═══════════════════════════════════════════════════════════════════════════════

async function runIntegratedSystem() {
    const modeLabel = CONFIG.turbo ? 'TURBO 🔥' : 'NORMAL';
    
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  ⚡ QANTUM PRIME v28.2.0 - INTEGRATED RUNNER                                 ║
║  Producer-Consumer Architecture | Zero-Blocking | Sub-μs Execution           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Duration: ${String(CONFIG.duration / 1000).padStart(3)}s | Buffer: ${String(CONFIG.bufferSize).padStart(5)} | Pool: ${String(CONFIG.poolSize).padStart(5)} | Mode: ${modeLabel.padEnd(8)}     ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Initialize components
    const ringBuffer = new RingBuffer(CONFIG.bufferSize);
    const atomicEngine = new AtomicEngine(CONFIG.poolSize);
    const ghostProtocol = new GhostNetworkLayer(ringBuffer, CONFIG.turbo);

    console.log('🔧 Components Initialized:');
    console.log('   📦 Ring Buffer: O(1) push/pop, size ' + CONFIG.bufferSize);
    console.log('   ⚡ Atomic Engine: Pre-allocated pool of ' + CONFIG.poolSize + ' objects');

    // Statistics tracking
    let processedCount = 0;
    let lastReportTime = Date.now();
    let lastProcessedCount = 0;
    let latencySpikes = 0;
    const startTime = Date.now();

    // Start Ghost Protocol (Producer)
    console.log('\n🚀 Starting Ghost Protocol stream...\n');
    ghostProtocol.startStream();

    // Consumer loop - processes buffer on every event loop tick
    // Using setInterval(..., 0) for maximum responsiveness
    const CHECK_INTERVAL_MS = 0;
    
    const consumerInterval = setInterval(() => {
        // Process ALL available data in buffer (drain the queue)
        while (ringBuffer.hasData()) {
            const marketData = ringBuffer.pop();
            if (marketData) {
                const result = atomicEngine.execute(marketData);
                processedCount++;

                // Track latency spikes (> 2μs is considered a spike)
                if (result.latencyUs > 2.0) {
                    latencySpikes++;
                    if (CONFIG.verbose) {
                        console.warn(`⚠️ Latency Spike: ${result.latencyUs.toFixed(4)}μs`);
                    }
                }

                // Verbose logging (only if enabled and interesting)
                if (CONFIG.verbose && result.decision !== 'HOLD') {
                    console.log(
                        `⚡ ${result.decision.padEnd(4)} | ${result.symbol.padEnd(8)} @ ` +
                        `${result.price.toFixed(2).padStart(10)} | PnL: $${result.pnl.toFixed(4)} | ` +
                        `${result.latencyUs.toFixed(2)}μs`
                    );
                } else if (!CONFIG.verbose && Math.random() < 0.02) {
                    // Sample logging (2% of trades) when not verbose
                    process.stdout.write(`⚡`);
                }
            }
        }
    }, 0); // Check every tick

    // Progress reporter (every second)
    const reportInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        const throughput = processedCount - lastProcessedCount;
        const engineStats = atomicEngine.getStats();
        const bufferStats = ringBuffer.getStats();
        const ghostStats = ghostProtocol.getStats();

        // Clear line and print progress
        process.stdout.write('\r');
        process.stdout.write(
            `⏱️  ${elapsed.toFixed(0)}s | ` +
            `📊 Processed: ${processedCount.toLocaleString()} | ` +
            `⚡ ${throughput}/s | ` +
            `📈 Avg: ${engineStats.avgLatencyUs}μs | ` +
            `🔄 Buffer: ${bufferStats.fillPercent} | ` +
            `👻 ${ghostStats.currentProfile}    `
        );

        lastProcessedCount = processedCount;
        lastReportTime = now;
    }, 1000);

    // Wait for duration to complete
    await new Promise(resolve => setTimeout(resolve, CONFIG.duration));

    // Cleanup
    ghostProtocol.stop();
    clearInterval(consumerInterval);
    clearInterval(reportInterval);

    // Final report
    const totalTime = (Date.now() - startTime) / 1000;
    const engineStats = atomicEngine.getStats();
    const bufferStats = ringBuffer.getStats();
    const ghostStats = ghostProtocol.getStats();

    console.log(`\n
╔══════════════════════════════════════════════════════════════════════════════╗
║                        📊 FINAL INTEGRATION REPORT                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  THROUGHPUT                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Total Duration:            ${totalTime.toFixed(2).padStart(10)} seconds                         ║
║  Messages Produced:         ${String(ghostStats.messagesSent).padStart(10)}                              ║
║  Messages Consumed:         ${String(engineStats.totalTrades).padStart(10)}                              ║
║  Throughput:                ${(engineStats.totalTrades / totalTime).toFixed(0).padStart(10)} msgs/sec                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  LATENCY (Atomic Engine Only - excludes network)                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Minimum Latency:           ${engineStats.minLatencyUs.padStart(10)} μs                            ║
║  Average Latency:           ${engineStats.avgLatencyUs.padStart(10)} μs                            ║
║  Maximum Latency:           ${engineStats.maxLatencyUs.padStart(10)} μs                            ║
║  Target:                            70.00 μs                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  LATENCY HISTOGRAM                                                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  < 1μs:                     ${String(engineStats.histogram.sub1us).padStart(10)} trades                          ║
║  1-2μs:                     ${String(engineStats.histogram['1-2us']).padStart(10)} trades                          ║
║  2-5μs:                     ${String(engineStats.histogram['2-5us']).padStart(10)} trades                          ║
║  5-10μs:                    ${String(engineStats.histogram['5-10us']).padStart(10)} trades                          ║
║  > 10μs:                    ${String(engineStats.histogram.over10us).padStart(10)} trades                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TRADING DECISIONS                                                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  BUY signals:               ${String(engineStats.decisions.BUY).padStart(10)}                              ║
║  SELL signals:              ${String(engineStats.decisions.SELL).padStart(10)}                              ║
║  HOLD signals:              ${String(engineStats.decisions.HOLD).padStart(10)}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  BUFFER STATISTICS                                                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Buffer Size:               ${String(bufferStats.size).padStart(10)}                              ║
║  Total Pushed:              ${String(bufferStats.totalPushed).padStart(10)}                              ║
║  Total Popped:              ${String(bufferStats.totalPopped).padStart(10)}                              ║
║  Overflows:                 ${String(bufferStats.overflows).padStart(10)} (${bufferStats.overflowRate})                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  GHOST PROTOCOL                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  JA3 Profiles Used:         Chrome 121, Firefox 122, Safari 17, Edge 120     ║
║  Final Prices:                                                               ║
║    BTC/USD: $${ghostStats.prices['BTC/USD'].toFixed(2).padStart(10)}   ETH/USD: $${ghostStats.prices['ETH/USD'].toFixed(2).padStart(8)}               ║
║    SOL/USD: $${ghostStats.prices['SOL/USD'].toFixed(2).padStart(10)}   XRP/USD: $${ghostStats.prices['XRP/USD'].toFixed(4).padStart(8)}               ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Verdict
    const avgLatency = parseFloat(engineStats.avgLatencyUs);
    if (avgLatency < 1) {
        console.log('🏆 VERDICT: EXCEPTIONAL! Sub-microsecond average latency!');
        console.log(`   Average: ${avgLatency.toFixed(4)}μs - 70x better than target!`);
    } else if (avgLatency < 70) {
        console.log('✅ VERDICT: TARGET ACHIEVED!');
        console.log(`   Average: ${avgLatency.toFixed(4)}μs < 70μs target`);
    } else {
        console.log('⚠️  VERDICT: Needs optimization');
    }

    console.log('\n🔗 Architecture Flow:');
    console.log('   Ghost Protocol (Network) → Ring Buffer → Atomic Engine (Execution)');
    console.log('   Network latency ~15-45ms | Execution latency ~0.5-2μs');
    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');

    return { engineStats, bufferStats, ghostStats };
}

// Export for programmatic use
module.exports = { RingBuffer, TradeObjectPool, AtomicEngine, GhostNetworkLayer, runIntegratedSystem };

// Run if called directly
if (require.main === module) {
    runIntegratedSystem().catch(console.error);
}
