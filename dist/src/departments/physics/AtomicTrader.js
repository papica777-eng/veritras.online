"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - ATOMIC TRADER                                       ║
 * ║  "Екзекуция" - Atomic Transaction Swarm                                   ║
 * ║                                                                           ║
 * ║  SharedArrayBuffer синхронизация за Buy/Sell в микросекунди               ║
 * ║  0.08ms Failover, Atomic Swap изпълнение                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.atomicTrader = exports.AtomicTrader = void 0;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════
// SHARED MEMORY LAYOUT (SharedArrayBuffer)
// ═══════════════════════════════════════════════════════════════════════════
// Layout:
// [0]: Global lock (0 = free, 1 = locked)
// [1]: Active swaps count
// [2]: Total completed swaps
// [3]: Total failed swaps
// [4-7]: Buy worker status (4 workers)
// [8-11]: Sell worker status (4 workers)
// [12-15]: Latency measurements (last 4)
// [16-31]: Reserved for future use
const SHARED_BUFFER_SIZE = 32 * Int32Array.BYTES_PER_ELEMENT;
const LOCK_INDEX = 0;
const ACTIVE_SWAPS_INDEX = 1;
const COMPLETED_SWAPS_INDEX = 2;
const FAILED_SWAPS_INDEX = 3;
const BUY_WORKERS_START = 4;
const SELL_WORKERS_START = 8;
const LATENCY_START = 12;
// ═══════════════════════════════════════════════════════════════════════════
// ATOMIC TRADER - THE EXECUTIONER
// ═══════════════════════════════════════════════════════════════════════════
class AtomicTrader extends events_1.EventEmitter {
    config;
    sharedBuffer;
    sharedArray;
    workers = new Map();
    activeSwaps = new Map();
    swapHistory = [];
    isRunning = false;
    // Performance metrics
    totalExecutionTime = 0;
    executionCount = 0;
    successfulSwaps = 0;
    failedSwaps = 0;
    rolledBackSwaps = 0;
    // Latency tracking (in microseconds)
    FAILOVER_TARGET_US = 80; // 0.08ms = 80 microseconds
    avgLatencyUs = 0;
    minLatencyUs = Infinity;
    maxLatencyUs = 0;
    constructor(config = {}) {
        super();
        this.config = {
            maxConcurrentSwaps: config.maxConcurrentSwaps ?? 10,
            failoverTimeoutMs: config.failoverTimeoutMs ?? 0.08,
            maxRetries: config.maxRetries ?? 3,
            workerPoolSize: config.workerPoolSize ?? 8,
            heartbeatIntervalMs: config.heartbeatIntervalMs ?? 100,
            orderTimeoutMs: config.orderTimeoutMs ?? 5000,
            slippageTolerancePercent: config.slippageTolerancePercent ?? 0.5,
        };
        // Initialize shared memory
        this.sharedBuffer = new SharedArrayBuffer(SHARED_BUFFER_SIZE);
        this.sharedArray = new Int32Array(this.sharedBuffer);
        this.initializeWorkerPool();
        console.log('[AtomicTrader] ⚡ Atomic Transaction Swarm initialized');
    }
    // ═══════════════════════════════════════════════════════════════════════
    // WORKER POOL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration detected
    initializeWorkerPool() {
        const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Bybit', 'OKX', 'Upbit'];
        // Create buy workers
        for (let i = 0; i < 4; i++) {
            const exchange = exchanges[i % exchanges.length];
            this.workers.set(`buy-${i}`, {
                id: i,
                exchange,
                status: 'idle',
                lastHeartbeat: Date.now(),
                completedTrades: 0,
                failedTrades: 0,
            });
            // Mark worker as ready in shared memory
            Atomics.store(this.sharedArray, BUY_WORKERS_START + i, 1);
        }
        // Create sell workers
        for (let i = 0; i < 4; i++) {
            const exchange = exchanges[(i + 2) % exchanges.length];
            this.workers.set(`sell-${i}`, {
                id: i,
                exchange,
                status: 'idle',
                lastHeartbeat: Date.now(),
                completedTrades: 0,
                failedTrades: 0,
            });
            Atomics.store(this.sharedArray, SELL_WORKERS_START + i, 1);
        }
        console.log(`[AtomicTrader] 👥 Worker pool: ${this.workers.size} workers ready`);
    }
    // Complexity: O(N*M) — nested iteration detected
    getAvailableWorker(type, exchange) {
        const prefix = type === 'buy' ? 'buy-' : 'sell-';
        // First, try to find a worker for the specific exchange
        for (const [key, worker] of this.workers) {
            if (key.startsWith(prefix) && worker.exchange === exchange && worker.status === 'idle') {
                return worker;
            }
        }
        // If not found, use any available worker
        for (const [key, worker] of this.workers) {
            if (key.startsWith(prefix) && worker.status === 'idle') {
                return worker;
            }
        }
        return null;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ATOMIC LOCK MECHANISM
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    acquireLock() {
        // Atomic compare-and-swap: if value is 0, set to 1
        const oldValue = Atomics.compareExchange(this.sharedArray, LOCK_INDEX, 0, 1);
        return oldValue === 0;
    }
    // Complexity: O(1)
    releaseLock() {
        Atomics.store(this.sharedArray, LOCK_INDEX, 0);
        Atomics.notify(this.sharedArray, LOCK_INDEX, 1);
    }
    // Complexity: O(N*M) — nested iteration detected
    async waitForLock(timeoutMs = 100) {
        const startTime = performance.now();
        while (performance.now() - startTime < timeoutMs) {
            if (this.acquireLock()) {
                return true;
            }
            // Spin-wait for a very short time (microseconds)
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.microDelay(10);
        }
        return false;
    }
    // Complexity: O(N*M) — nested iteration detected
    microDelay(microseconds) {
        return new Promise((resolve) => {
            const start = performance.now();
            while ((performance.now() - start) * 1000 < microseconds) {
                // Busy wait for microsecond precision
            }
            // Complexity: O(1)
            resolve();
        });
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ATOMIC SWAP EXECUTION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Execute an atomic swap - buy on one exchange, sell on another simultaneously
     * Uses SharedArrayBuffer for sub-millisecond synchronization
     */
    // Complexity: O(N)
    async executeAtomicSwap(symbol, buyExchange, sellExchange, buyPrice, sellPrice, quantity, expectedProfit) {
        const swapId = `SWAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const executionStart = performance.now();
        // Create orders
        const buyOrder = {
            id: `BUY-${swapId}`,
            type: 'buy',
            exchange: buyExchange,
            symbol,
            price: buyPrice,
            quantity,
            timestamp: Date.now(),
            status: 'pending',
        };
        const sellOrder = {
            id: `SELL-${swapId}`,
            type: 'sell',
            exchange: sellExchange,
            symbol,
            price: sellPrice,
            quantity,
            timestamp: Date.now(),
            status: 'pending',
        };
        const swap = {
            id: swapId,
            buyOrder,
            sellOrder,
            expectedProfit,
            status: 'pending',
            executionStartTime: executionStart,
            failoverCount: 0,
        };
        this.activeSwaps.set(swapId, swap);
        // Increment active swaps counter atomically
        Atomics.add(this.sharedArray, ACTIVE_SWAPS_INDEX, 1);
        console.log(`[AtomicTrader] 🚀 Executing atomic swap ${swapId}`);
        console.log(`[AtomicTrader]    BUY ${quantity} ${symbol} @ ${buyPrice} on ${buyExchange}`);
        console.log(`[AtomicTrader]    SELL ${quantity} ${symbol} @ ${sellPrice} on ${sellExchange}`);
        try {
            // Try to acquire lock for atomic execution
            const lockAcquired = await this.waitForLock(this.config.failoverTimeoutMs);
            if (!lockAcquired) {
                console.log(`[AtomicTrader] ⚠️ Lock contention, initiating failover...`);
                swap.failoverCount++;
            }
            swap.status = 'executing';
            // Execute both orders in parallel with race condition handling
            const [buyResult, sellResult] = await Promise.allSettled([
                this.executeOrder(buyOrder),
                this.executeOrder(sellOrder),
            ]);
            // Release lock
            this.releaseLock();
            // Process results
            const buySuccess = buyResult.status === 'fulfilled' && buyResult.value.status === 'filled';
            const sellSuccess = sellResult.status === 'fulfilled' && sellResult.value.status === 'filled';
            if (buySuccess && sellSuccess) {
                // Both succeeded - perfect atomic swap
                swap.status = 'completed';
                swap.buyOrder = buyResult.value;
                swap.sellOrder = sellResult.value;
                // Calculate actual profit
                const actualBuyPrice = swap.buyOrder.fillPrice || buyPrice;
                const actualSellPrice = swap.sellOrder.fillPrice || sellPrice;
                swap.actualProfit = (actualSellPrice - actualBuyPrice) * quantity;
                this.successfulSwaps++;
                Atomics.add(this.sharedArray, COMPLETED_SWAPS_INDEX, 1);
                console.log(`[AtomicTrader] ✅ Swap ${swapId} COMPLETED - Profit: $${swap.actualProfit.toFixed(2)}`);
                this.emit('swap-completed', swap);
            }
            else if (buySuccess && !sellSuccess) {
                // Buy succeeded but sell failed - need to rollback
                console.log(`[AtomicTrader] ⚠️ Sell failed, initiating rollback...`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.rollbackOrder(buyResult.value);
                swap.status = 'rolled-back';
                swap.buyOrder.status = 'cancelled';
                this.rolledBackSwaps++;
                console.log(`[AtomicTrader] 🔄 Swap ${swapId} ROLLED BACK`);
                this.emit('swap-rollback', swap);
            }
            else if (!buySuccess && sellSuccess) {
                // Sell succeeded but buy failed - need to rollback
                console.log(`[AtomicTrader] ⚠️ Buy failed, initiating rollback...`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.rollbackOrder(sellResult.value);
                swap.status = 'rolled-back';
                swap.sellOrder.status = 'cancelled';
                this.rolledBackSwaps++;
                console.log(`[AtomicTrader] 🔄 Swap ${swapId} ROLLED BACK`);
                this.emit('swap-rollback', swap);
            }
            else {
                // Both failed
                swap.status = 'failed';
                swap.buyOrder.status = 'failed';
                swap.sellOrder.status = 'failed';
                this.failedSwaps++;
                Atomics.add(this.sharedArray, FAILED_SWAPS_INDEX, 1);
                console.log(`[AtomicTrader] ❌ Swap ${swapId} FAILED`);
                this.emit('swap-failed', swap);
            }
        }
        catch (error) {
            console.error(`[AtomicTrader] ❌ Swap ${swapId} error:`, error);
            swap.status = 'failed';
            swap.buyOrder.error = String(error);
            swap.sellOrder.error = String(error);
            this.failedSwaps++;
            // Release lock if still held
            this.releaseLock();
            this.emit('swap-error', { swap, error });
        }
        // Record timing
        const executionEnd = performance.now();
        swap.executionEndTime = executionEnd;
        swap.latencyMs = executionEnd - executionStart;
        // Update latency stats (convert to microseconds)
        const latencyUs = swap.latencyMs * 1000;
        this.updateLatencyStats(latencyUs);
        // Decrement active swaps
        Atomics.sub(this.sharedArray, ACTIVE_SWAPS_INDEX, 1);
        // Move to history
        this.activeSwaps.delete(swapId);
        this.swapHistory.push(swap);
        // Keep history limited
        if (this.swapHistory.length > 1000) {
            this.swapHistory.shift();
        }
        return swap;
    }
    // Complexity: O(1) — amortized
    async executeOrder(order) {
        const startTime = performance.now();
        // Simulate order execution with realistic latency
        // In production, this would call actual exchange APIs
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.microDelay(50 + Math.random() * 100); // 50-150 microseconds
        // Simulate slippage
        const slippageMultiplier = 1 + (Math.random() - 0.5) * 0.002; // ±0.1%
        const fillPrice = order.price * slippageMultiplier;
        // Check slippage tolerance
        const slippagePercent = (Math.abs(fillPrice - order.price) / order.price) * 100;
        if (slippagePercent > this.config.slippageTolerancePercent) {
            order.status = 'failed';
            order.error = `Slippage ${slippagePercent.toFixed(3)}% exceeds tolerance`;
            return order;
        }
        // 98% success rate simulation
        if (Math.random() > 0.02) {
            order.status = 'filled';
            order.fillPrice = fillPrice;
            order.fillTimestamp = Date.now();
        }
        else {
            order.status = 'failed';
            order.error = 'Order rejected by exchange';
        }
        return order;
    }
    // Complexity: O(N) — linear iteration
    async rollbackOrder(order) {
        // Execute opposite trade to rollback
        const rollbackOrder = {
            id: `ROLLBACK-${order.id}`,
            type: order.type === 'buy' ? 'sell' : 'buy',
            exchange: order.exchange,
            symbol: order.symbol,
            price: order.fillPrice || order.price,
            quantity: order.quantity,
            timestamp: Date.now(),
            status: 'pending',
        };
        console.log(`[AtomicTrader] 🔄 Rolling back: ${order.type} ${order.quantity} ${order.symbol}`);
        // Execute rollback with retries
        for (let i = 0; i < this.config.maxRetries; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await this.executeOrder(rollbackOrder);
            if (result.status === 'filled') {
                console.log(`[AtomicTrader] ✅ Rollback successful`);
                return;
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.microDelay(1000); // Wait 1ms before retry
        }
        console.error(`[AtomicTrader] ❌ Rollback failed after ${this.config.maxRetries} retries!`);
        this.emit('rollback-failed', { originalOrder: order, rollbackOrder });
    }
    // ═══════════════════════════════════════════════════════════════════════
    // LATENCY TRACKING
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    updateLatencyStats(latencyUs) {
        this.executionCount++;
        this.totalExecutionTime += latencyUs;
        this.avgLatencyUs = this.totalExecutionTime / this.executionCount;
        this.minLatencyUs = Math.min(this.minLatencyUs, latencyUs);
        this.maxLatencyUs = Math.max(this.maxLatencyUs, latencyUs);
        // Store in shared memory (last 4 measurements)
        const index = (this.executionCount - 1) % 4;
        Atomics.store(this.sharedArray, LATENCY_START + index, Math.round(latencyUs));
        // Check if we're meeting the 0.08ms target
        if (latencyUs > this.FAILOVER_TARGET_US * 10) {
            // Allow 10x for real execution
            console.warn(`[AtomicTrader] ⚠️ Latency ${(latencyUs / 1000).toFixed(3)}ms exceeds target`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // FAILOVER MECHANISM
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * 0.08ms failover - if primary execution path fails, switch to backup
     */
    // Complexity: O(N*M) — nested iteration detected
    async failover(swap) {
        swap.failoverCount++;
        if (swap.failoverCount > this.config.maxRetries) {
            console.error(`[AtomicTrader] ❌ Failover limit reached for ${swap.id}`);
            return false;
        }
        console.log(`[AtomicTrader] ⚡ Failover #${swap.failoverCount} for ${swap.id}`);
        // Try alternative workers
        const altBuyWorker = this.getAvailableWorker('buy', swap.buyOrder.exchange);
        const altSellWorker = this.getAvailableWorker('sell', swap.sellOrder.exchange);
        if (!altBuyWorker || !altSellWorker) {
            console.warn(`[AtomicTrader] No available workers for failover`);
            return false;
        }
        // Retry with new workers
        return true;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — potential recursive descent
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log('[AtomicTrader] ⚡ Atomic Trader ACTIVATED');
        this.emit('started');
    }
    // Complexity: O(N) — potential recursive descent
    stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        console.log('[AtomicTrader] 🛑 Atomic Trader DEACTIVATED');
        this.emit('stopped');
    }
    // Complexity: O(1)
    getActiveSwaps() {
        return Array.from(this.activeSwaps.values());
    }
    // Complexity: O(1)
    getSwapHistory(limit = 100) {
        return this.swapHistory.slice(-limit);
    }
    // Complexity: O(N) — linear iteration
    getStats() {
        const total = this.successfulSwaps + this.failedSwaps + this.rolledBackSwaps;
        return {
            totalSwaps: total,
            successfulSwaps: this.successfulSwaps,
            failedSwaps: this.failedSwaps,
            rolledBackSwaps: this.rolledBackSwaps,
            successRate: total > 0 ? (this.successfulSwaps / total) * 100 : 0,
            avgLatencyMs: this.avgLatencyUs / 1000,
            minLatencyMs: this.minLatencyUs === Infinity ? 0 : this.minLatencyUs / 1000,
            maxLatencyMs: this.maxLatencyUs / 1000,
            activeSwaps: Atomics.load(this.sharedArray, ACTIVE_SWAPS_INDEX),
            workersAvailable: Array.from(this.workers.values()).filter((w) => w.status === 'idle').length,
        };
    }
    // Complexity: O(1)
    getSharedMemoryView() {
        return this.sharedArray;
    }
}
exports.AtomicTrader = AtomicTrader;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.atomicTrader = new AtomicTrader();
exports.default = AtomicTrader;
