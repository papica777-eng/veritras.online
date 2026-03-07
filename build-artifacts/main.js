/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗                   ║
 * ║   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║                   ║
 * ║   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║                   ║
 * ║   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║                   ║
 * ║   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║                   ║
 * ║    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝                   ║
 * ║                                                                              ║
 * ║              P R I M E   v28.2.2   S U P R E M E   E D I T I O N             ║
 * ║                                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║   🐲 Hydra Network     │  Multi-IP Proxy Rotation + Circuit Breaker          ║
 * ║   📦 Ring Buffer       │  10,000 capacity, O(1), Zero-GC                     ║
 * ║   ⚡ Atomic Engine     │  Sub-5μs decision making                            ║
 * ║   ⛓️ Chain Executor    │  Direct DEX trading (PancakeSwap V2)                ║
 * ║   🌧️ Rainmaker         │  PDF Proposal Generation (Fire-and-Forget)          ║
 * ║                                                                              ║
 * ║   Architecture: FIRE-AND-FORGET                                              ║
 * ║   Both blockchain TX and PDF generation are async - NEVER block trading!     ║
 * ║                                                                              ║
 * ║   Usage: node scripts/main.js [--duration <sec>] [--live]                    ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * @author QAntum Prime Team
 * @version 28.2.2 SUPREME
 * @date 2026-01-01
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════

const { HydraNetwork, HydraDemo } = require('./hydra-network');
const { ProposalGenerator } = require('./proposal-generator');
const { ChainExecutor } = require('./web3-execution');
const v8 = require('v8');

// V8 Engine Optimization - Force eager compilation
v8.setFlagsFromString('--no-lazy');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. RING BUFFER (MEMORY CORE) - O(1) Lock-Free Data Structure
// ═══════════════════════════════════════════════════════════════════════════════

class RingBuffer {
    constructor(size) {
        this.buffer = new Array(size);
        this.size = size;
        this.write = 0;
        this.read = 0;
        this.count = 0;
    }

    push(item) {
        if (this.count >= this.size) {
            // DROP STRATEGY: Discard oldest when full (no blocking!)
            this.read = (this.read + 1) % this.size;
            this.count--;
        }
        this.buffer[this.write] = item;
        this.write = (this.write + 1) % this.size;
        this.count++;
    }

    pop() {
        if (this.count === 0) return null;
        const item = this.buffer[this.read];
        this.read = (this.read + 1) % this.size;
        this.count--;
        return item;
    }

    isEmpty() { 
        return this.count === 0; 
    }

    getLoad() {
        return ((this.count / this.size) * 100).toFixed(1);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ATOMIC ENGINE (THE BRAIN) - Sub-5μs Decision Making
// ═══════════════════════════════════════════════════════════════════════════════

class AtomicEngine {
    constructor(buffer, generator, executor) {
        this.buffer = buffer;
        this.generator = generator; // The Rainmaker (PDF)
        this.executor = executor;   // The Executioner (Web3)
        this.isRunning = false;

        this.stats = {
            scanned: 0,
            buySignals: 0,
            sellSignals: 0,
            holdSignals: 0,
            txSent: 0,
            pdfGenerated: 0,
            totalLatency: 0
        };

        // Target Configuration (Trading Pair)
        this.TOKEN_IN = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';  // WBNB
        this.TOKEN_OUT = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'; // BUSD
        this.TRADE_AMOUNT = '100000000000000000'; // 0.1 BNB

        // Strategy Thresholds
        this.BUY_THRESHOLD = 45000;
        this.SELL_THRESHOLD = 45100;

        // 🛡️ SAFETY CONFIGURATION
        this.MAX_TRADES_PER_SESSION = 1;  // Hard cap!
        this.tradeLimitReached = false;
    }

    start() {
        this.isRunning = true;
        
        // 🛡️ SAFE MODE BANNER
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║  🛡️  SAFE LIVE MODE ACTIVATED                                 ║');
        console.log('║  ⚠️  SAFETY LIMIT: Max 1 Trade per session                    ║');
        console.log('║  💰 Trade Amount: 0.1 BNB → BUSD                              ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');

        const loop = () => {
            if (!this.isRunning) return;

            // 🛡️ SAFETY CHECK: Stop if trade limit reached
            if (this.tradeLimitReached) {
                // Keep monitoring but don't execute more trades
                setImmediate(loop);
                return;
            }

            // Batch processing for maximum efficiency
            let batch = 50;

            while (!this.buffer.isEmpty() && batch > 0) {
                const packet = this.buffer.pop();
                if (!packet) break;

                this.stats.scanned++;
                const startDec = process.hrtime.bigint();

                // 🛡️ DOUBLE-CHECK: Already have a successful trade?
                if (this.stats.txSent >= this.MAX_TRADES_PER_SESSION) {
                    console.log('');
                    console.log('🛑 ════════════════════════════════════════════════════════════');
                    console.log('🛑  SAFETY STOP: Trade limit reached (1/1)');
                    console.log('🛑  Engine will continue monitoring but NOT executing trades.');
                    console.log('🛑 ════════════════════════════════════════════════════════════');
                    console.log('');
                    this.tradeLimitReached = true;
                    batch = 0;
                    break;
                }

                // ═══════════════════════════════════════════════════════════════
                // STRATEGY LOGIC - SAFE LIVE MODE
                // ═══════════════════════════════════════════════════════════════

                // For LIVE test: Execute on ANY valid price (will only happen ONCE due to safety)
                if (packet.price > 0 && packet.price < 100000) {
                    // 🟢 LIVE TRIGGER!
                    console.log('');
                    console.log('⚡ ════════════════════════════════════════════════════════════');
                    console.log(`⚡  LIVE TRIGGER DETECTED!`);
                    console.log(`⚡  Symbol: ${packet.symbol}`);
                    console.log(`⚡  Price: $${packet.price.toFixed(2)}`);
                    console.log(`⚡  Action: BUY 0.1 WBNB → BUSD`);
                    console.log('⚡ ════════════════════════════════════════════════════════════');
                    console.log('');

                    this.stats.buySignals++;

                    // 🚀 EXECUTE ON BLOCKCHAIN (ONLY ONCE!)
                    this.executor.executeSwap(this.TOKEN_IN, this.TOKEN_OUT, this.TRADE_AMOUNT)
                        .then(res => {
                            if (res.success) {
                                this.stats.txSent++;
                                console.log('');
                                console.log('╔══════════════════════════════════════════════════════════════╗');
                                console.log('║  ✅  LIVE TRANSACTION SUCCESS!                               ║');
                                console.log(`║  📝 TX Hash: ${res.txHash || 'Pending...'}  ║`);
                                console.log('║  🎉 CONGRATS! First QAntum Prime On-Chain Execution!         ║');
                                console.log('╚══════════════════════════════════════════════════════════════╝');
                                console.log('');
                                
                                // Generate PDF for this historic trade
                                this.generator.generate({
                                    symbol: packet.symbol,
                                    price: packet.price,
                                    action: 'BUY',
                                    confidence: 100,
                                    latency: packet.latency,
                                    proxyLocation: packet.proxy,
                                    txHash: res.txHash,
                                    isLive: true
                                }).then(() => {
                                    console.log('📄 Historic trade documented in PDF!');
                                    console.log('');
                                    console.log('🏁 Mission Complete! Shutting down safely...');
                                    process.exit(0);
                                });
                            }
                        })
                        .catch(err => {
                            console.error('');
                            console.error('❌ TX FAILED:', err.message);
                            console.error('');
                        });

                    // Mark limit as reached immediately to prevent duplicates
                    this.tradeLimitReached = true;
                    batch = 0;
                    break;

                } else {
                    this.stats.holdSignals++;
                }

                const endDec = process.hrtime.bigint();
                this.stats.totalLatency += Number(endDec - startDec) / 1000; // μs

                batch--;
            }

            // Non-blocking loop - keep V8 hot!
            setImmediate(loop);
        };

        loop();
    }

    stop() {
        this.isRunning = false;
        console.log('⚡ Atomic Engine: OFFLINE');
    }

    getStats() {
        const avgLatency = this.stats.scanned > 0
            ? (this.stats.totalLatency / this.stats.scanned).toFixed(3)
            : 0;

        return {
            ...this.stats,
            avgLatencyUs: avgLatency
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SYSTEM ORCHESTRATOR - MAIN BOOT SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════

(async () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗                   ║
║   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║                   ║
║   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║                   ║
║   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║                   ║
║   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║                   ║
║    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝                   ║
║                                                                              ║
║              P R I M E   v28.2.2   S U P R E M E   E D I T I O N             ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   🐲 Hydra Network     │  Multi-IP Proxy Rotation + Circuit Breaker          ║
║   📦 Ring Buffer       │  10,000 capacity, O(1), Zero-GC                     ║
║   ⚡ Atomic Engine     │  Sub-5μs decision making                            ║
║   ⛓️ Chain Executor    │  Direct DEX trading (PancakeSwap V2)                ║
║   🌧️ Rainmaker         │  PDF Proposal Generation (Fire-and-Forget)          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Parse command line arguments
    const args = process.argv.slice(2);
    const durationIndex = args.indexOf('--duration');
    const duration = durationIndex >= 0 ? parseInt(args[durationIndex + 1]) * 1000 : 30000; // Default 30s
    const liveMode = args.includes('--live');

    if (liveMode) {
        console.log('\n⚠️⚠️⚠️  LIVE MODE ENABLED - REAL BLOCKCHAIN TRANSACTIONS!  ⚠️⚠️⚠️\n');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // A. SETUP MEMORY (Ring Buffer)
    // ═══════════════════════════════════════════════════════════════════════════

    console.log('⚙️  Initializing system components...\n');

    const buffer = new RingBuffer(10000);
    console.log('   📦 Ring Buffer: OK (10,000 capacity)');

    // ═══════════════════════════════════════════════════════════════════════════
    // B. SETUP MODULES
    // ═══════════════════════════════════════════════════════════════════════════

    // Use HydraDemo for simulation, HydraNetwork for live
    const hydra = liveMode ? new HydraNetwork(buffer) : new HydraDemo(buffer);
    console.log(`   🐲 Hydra ${liveMode ? 'Network' : 'Demo'}: OK (${liveMode ? '6 nodes with Circuit Breaker' : '5 simulated nodes'})`);

    const generator = new ProposalGenerator();
    console.log('   🌧️ Rainmaker: OK (proposals/ directory)');

    const executor = new ChainExecutor({ liveMode });
    console.log(`   ⛓️ Chain Executor: OK (${liveMode ? '🔴 LIVE' : '🟢 SIMULATION'})`);

    // ═══════════════════════════════════════════════════════════════════════════
    // C. INITIALIZE WEB3 (Get Nonce/GasPrice)
    // ═══════════════════════════════════════════════════════════════════════════

    console.log('\n⚙️  Initializing Web3 Executioner...');
    await executor.initialize();

    // ═══════════════════════════════════════════════════════════════════════════
    // D. START ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    const engine = new AtomicEngine(buffer, generator, executor);
    engine.start();

    // ═══════════════════════════════════════════════════════════════════════════
    // E. UNLEASH THE HYDRA
    // ═══════════════════════════════════════════════════════════════════════════

    console.log('\n🐉 Releasing Hydra on market feeds...');
    
    // Multi-symbol attack loop (works for both Demo and Network)
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    let hydraRunning = true;
    
    const hydraAttackLoop = async () => {
        while (hydraRunning) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            await hydra.fetchMarketData(symbol);
            await new Promise(r => setTimeout(r, 25)); // ~40 req/sec total
        }
    };
    
    // Start attack (non-blocking)
    hydraAttackLoop();

    console.log(`\n🚀 SYSTEM RUNNING | Duration: ${duration / 1000}s | Mode: ${liveMode ? 'LIVE' : 'SIMULATION'}`);
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // F. REAL-TIME MONITORING (Console HUD)
    // ═══════════════════════════════════════════════════════════════════════════

    const statusInterval = setInterval(() => {
        const engineStats = engine.getStats();
        const generatorStats = generator.getStats();
        const executorStats = executor.getStats();
        const hydraStats = hydra.getStats();

        console.log(`\n📊 [${new Date().toLocaleTimeString()}] SYSTEM STATUS:`);
        console.log(`   ├── Buffer Load:      ${buffer.count} / 10000 (${buffer.getLoad()}%)`);
        console.log(`   ├── Scanned Packets:  ${engineStats.scanned}`);
        console.log(`   ├── 🟢 BUY Signals:   ${engineStats.buySignals}`);
        console.log(`   ├── 🔴 SELL Signals:  ${engineStats.sellSignals}`);
        console.log(`   ├── ⛓️  TX Sent:       ${engineStats.txSent} (${executorStats.mode})`);
        console.log(`   ├── 📄 PDFs Generated: ${generatorStats.generated}`);
        console.log(`   ├── ⚡ Avg Latency:    ${engineStats.avgLatencyUs}μs`);
        console.log(`   └── 🐲 Hydra:          ${hydraStats.aliveNodes}/${hydraStats.aliveNodes + (hydraStats.deadNodes || 0)} nodes alive\n`);
    }, 2000);

    // ═══════════════════════════════════════════════════════════════════════════
    // G. GRACEFUL SHUTDOWN
    // ═══════════════════════════════════════════════════════════════════════════

    const shutdown = () => {
        console.log('\n\n🛑 INITIATING SHUTDOWN...\n');

        clearInterval(statusInterval);
        hydraRunning = false; // Stop the attack loop
        engine.stop();

        // Final Report
        const engineStats = engine.getStats();
        const generatorStats = generator.getStats();
        const executorStats = executor.getStats();
        const hydraStats = hydra.getStats();

        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 FINAL MISSION REPORT                                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🐲 HYDRA NETWORK:                                                           ║
║     Total Requests: ${String(hydraStats.total || hydraStats.totalRequests || 0).padEnd(10)} | Success Rate: ${((hydraStats.success || hydraStats.successful || 0) / (hydraStats.total || hydraStats.totalRequests || 1) * 100).toFixed(1)}%               ║
║     Circuit Trips:  ${String(hydraStats.circuitTrips || 0).padEnd(10)} | Nodes: ${hydraStats.aliveNodes || 5}/${(hydraStats.aliveNodes || 5) + (hydraStats.deadNodes || 0)} alive                    ║
║                                                                              ║
║  ⚡ ATOMIC ENGINE:                                                            ║
║     Packets Scanned: ${String(engineStats.scanned).padEnd(10)}                                       ║
║     BUY: ${String(engineStats.buySignals).padEnd(8)} | SELL: ${String(engineStats.sellSignals).padEnd(8)} | HOLD: ${String(engineStats.holdSignals).padEnd(10)}    ║
║     Avg Decision Latency: ${String(engineStats.avgLatencyUs + 'μs').padEnd(12)}                              ║
║                                                                              ║
║  ⛓️ CHAIN EXECUTOR:                                                           ║
║     Mode: ${(executorStats.mode || 'SIMULATION').padEnd(15)} | Chain: BSC (PancakeSwap V2)         ║
║     TX Sent: ${String(engineStats.txSent).padEnd(8)} | Confirmed: ${String(executorStats.confirmed).padEnd(8)} | Failed: ${String(executorStats.failed).padEnd(8)} ║
║                                                                              ║
║  🌧️ RAINMAKER:                                                                ║
║     PDFs Generated: ${String(generatorStats.generated).padEnd(10)}                                        ║
║     Projected Value: ${String(generatorStats.totalValue).padEnd(15)}                                  ║
║     Output: proposals/                                                       ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║                    🏆 MISSION COMPLETE - QANTUM PRIME 2026 🏆                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

        process.exit(0);
    };

    // Schedule shutdown
    setTimeout(shutdown, duration);

    // Handle Ctrl+C
    process.on('SIGINT', shutdown);

})();
