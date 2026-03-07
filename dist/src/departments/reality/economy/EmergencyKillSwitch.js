"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - EMERGENCY KILL SWITCH                               ║
 * ║  "Nuclear Option" - ABORT ALL & WITHDRAW                                  ║
 * ║                                                                           ║
 * ║  ⚠️  КРИТИЧЕН МОДУЛ: Пълно изтегляне на ликвидност < 1 секунда           ║
 * ║  🔴 Червен бутон за Dashboard на стария лаптоп                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyKillSwitch = exports.EmergencyKillSwitch = void 0;
const events_1 = require("events");
const LiveWalletManager_1 = require("./LiveWalletManager");
// ═══════════════════════════════════════════════════════════════════════════
// EMERGENCY KILL SWITCH
// ═══════════════════════════════════════════════════════════════════════════
class EmergencyKillSwitch extends events_1.EventEmitter {
    config;
    walletManager;
    // State
    isArmed = false;
    lastTriggered = 0;
    triggerCount = 0;
    // Monitoring
    activeOrders = new Map();
    openPositions = new Map();
    consecutiveLosses = 0;
    peakPortfolioValue = 0;
    currentPortfolioValue = 0;
    // Confirmation state
    pendingConfirmation = false;
    confirmationTimeout = null;
    constructor(config = {}, walletManager = LiveWalletManager_1.liveWalletManager) {
        super();
        this.config = {
            enabled: config.enabled ?? true,
            requireConfirmation: config.requireConfirmation ?? true,
            confirmationTimeoutMs: config.confirmationTimeoutMs ?? 5000,
            requirePassword: config.requirePassword ?? false,
            primaryWithdrawalAddress: config.primaryWithdrawalAddress ?? '',
            primaryWithdrawalNetwork: config.primaryWithdrawalNetwork ?? 'ETH',
            backupWithdrawalAddress: config.backupWithdrawalAddress ?? '',
            backupWithdrawalNetwork: config.backupWithdrawalNetwork ?? 'BTC',
            autoTriggerEnabled: config.autoTriggerEnabled ?? true,
            maxDrawdownPercent: config.maxDrawdownPercent ?? 20,
            maxLossUSD: config.maxLossUSD ?? 1000,
            maxConsecutiveLosses: config.maxConsecutiveLosses ?? 10,
            cooldownAfterTriggerMs: config.cooldownAfterTriggerMs ?? 3600000, // 1 hour
        };
        this.walletManager = walletManager;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🔴 EMERGENCY KILL SWITCH - Nuclear Option                                ║
║                                                                           ║
║  ⚠️  ABORT ALL & WITHDRAW                                                 ║
║                                                                           ║
║  Auto-triggers:                                                           ║
║  • Max Drawdown: ${this.config.maxDrawdownPercent}%                                                      ║
║  • Max Loss: $${this.config.maxLossUSD}                                                        ║
║  • Consecutive Losses: ${this.config.maxConsecutiveLosses}                                                  ║
║                                                                           ║
║  Target: ${this.config.primaryWithdrawalNetwork} → ${this.config.primaryWithdrawalAddress.slice(0, 20)}...                  ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ARM/DISARM
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    arm() {
        if (!this.config.enabled) {
            console.error('[KillSwitch] ❌ Kill switch is disabled in config');
            return;
        }
        if (!this.config.primaryWithdrawalAddress) {
            console.error('[KillSwitch] ❌ No withdrawal address configured!');
            return;
        }
        this.isArmed = true;
        console.log('[KillSwitch] 🔴 ARMED - Ready to abort all operations');
        this.emit('armed');
    }
    // Complexity: O(1) — hash/map lookup
    disarm() {
        this.isArmed = false;
        console.log('[KillSwitch] 🟢 DISARMED');
        this.emit('disarmed');
    }
    // Complexity: O(1)
    isSystemArmed() {
        return this.isArmed;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // TRIGGER KILL SWITCH
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Initiate emergency abort sequence
     * ABORT ALL TRADES & WITHDRAW ALL FUNDS
     */
    // Complexity: O(1) — hash/map lookup
    async trigger(reason = 'Manual trigger') {
        const triggeredAt = Date.now();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🚨🚨🚨 KILL SWITCH TRIGGERED 🚨🚨🚨                                      ║
║                                                                           ║
║  Reason: ${reason.padEnd(50)}        ║
║  Time: ${new Date().toISOString()}                                 ║
║                                                                           ║
║  INITIATING EMERGENCY ABORT SEQUENCE...                                   ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
        // Check cooldown
        if (Date.now() - this.lastTriggered < this.config.cooldownAfterTriggerMs) {
            const remaining = Math.ceil((this.config.cooldownAfterTriggerMs - (Date.now() - this.lastTriggered)) / 1000);
            console.error(`[KillSwitch] ⏳ Cooldown active. Wait ${remaining} seconds.`);
            return this.createFailedResult(triggeredAt, ['Cooldown active']);
        }
        // Check if confirmation is required
        if (this.config.requireConfirmation && !this.pendingConfirmation) {
            console.log('[KillSwitch] ⚠️  Confirmation required! Call confirmTrigger() within 5 seconds');
            this.pendingConfirmation = true;
            this.confirmationTimeout = setTimeout(() => {
                this.pendingConfirmation = false;
                console.log('[KillSwitch] ⏰ Confirmation timeout. Abort cancelled.');
                this.emit('confirmation-timeout');
            }, this.config.confirmationTimeoutMs);
            this.emit('confirmation-required', { reason, timeoutMs: this.config.confirmationTimeoutMs });
            return this.createFailedResult(triggeredAt, ['Awaiting confirmation']);
        }
        // Reset confirmation
        this.pendingConfirmation = false;
        if (this.confirmationTimeout) {
            // Complexity: O(1)
            clearTimeout(this.confirmationTimeout);
            this.confirmationTimeout = null;
        }
        this.emit('trigger-started', { reason, triggeredAt });
        const result = {
            success: false,
            triggeredAt,
            completedAt: 0,
            executionTimeMs: 0,
            ordersCancelled: 0,
            ordersFailedToCancel: 0,
            positionsClosed: 0,
            positionsFailedToClose: 0,
            withdrawalsInitiated: 0,
            withdrawalsFailed: 0,
            totalWithdrawnUSD: 0,
            errors: [],
        };
        try {
            // PHASE 1: Cancel all pending orders
            console.log('[KillSwitch] 🔸 PHASE 1: Cancelling all orders...');
            const cancelResult = await this.cancelAllOrders();
            result.ordersCancelled = cancelResult.cancelled;
            result.ordersFailedToCancel = cancelResult.failed;
            result.errors.push(...cancelResult.errors);
            // PHASE 2: Close all open positions
            console.log('[KillSwitch] 🔸 PHASE 2: Closing all positions...');
            const closeResult = await this.closeAllPositions();
            result.positionsClosed = closeResult.closed;
            result.positionsFailedToClose = closeResult.failed;
            result.errors.push(...closeResult.errors);
            // PHASE 3: Withdraw all funds
            console.log('[KillSwitch] 🔸 PHASE 3: Withdrawing all funds...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            const withdrawResult = await this.withdrawAllFunds();
            result.withdrawalsInitiated = withdrawResult.initiated;
            result.withdrawalsFailed = withdrawResult.failed;
            result.totalWithdrawnUSD = withdrawResult.totalUSD;
            result.errors.push(...withdrawResult.errors);
            // Complete
            result.success = result.errors.length === 0;
            result.completedAt = Date.now();
            result.executionTimeMs = result.completedAt - result.triggeredAt;
            this.lastTriggered = result.triggeredAt;
            this.triggerCount++;
            console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  ${result.success ? '✅ ABORT SEQUENCE COMPLETED' : '⚠️  ABORT SEQUENCE COMPLETED WITH ERRORS'}                                 ║
║                                                                           ║
║  Execution Time: ${result.executionTimeMs}ms                                                  ║
║  Orders Cancelled: ${result.ordersCancelled}                                                       ║
║  Positions Closed: ${result.positionsClosed}                                                       ║
║  Withdrawals: ${result.withdrawalsInitiated} ($${result.totalWithdrawnUSD.toFixed(2)})                                     ║
║  Errors: ${result.errors.length}                                                              ║
╚═══════════════════════════════════════════════════════════════════════════╝
      `);
            this.emit('trigger-completed', result);
        }
        catch (error) {
            result.errors.push(String(error));
            result.completedAt = Date.now();
            result.executionTimeMs = result.completedAt - result.triggeredAt;
            console.error('[KillSwitch] ❌ CRITICAL ERROR during abort:', error);
            this.emit('trigger-error', { result, error });
        }
        return result;
    }
    /**
     * Confirm pending trigger
     */
    // Complexity: O(1) — hash/map lookup
    async confirmTrigger() {
        if (!this.pendingConfirmation) {
            console.error('[KillSwitch] ❌ No pending trigger to confirm');
            return this.createFailedResult(Date.now(), ['No pending confirmation']);
        }
        if (this.confirmationTimeout) {
            // Complexity: O(1)
            clearTimeout(this.confirmationTimeout);
            this.confirmationTimeout = null;
        }
        console.log('[KillSwitch] ✅ Trigger CONFIRMED');
        return this.trigger('Confirmed trigger');
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ABORT PHASES
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration detected
    async cancelAllOrders() {
        let cancelled = 0;
        let failed = 0;
        const errors = [];
        const orders = Array.from(this.activeOrders.values());
        // Cancel all orders in parallel for speed
        const cancelPromises = orders.map(async (order) => {
            try {
                // In production, this would call actual exchange API
                await this.simulateCancelOrder(order);
                console.log(`[KillSwitch] ✅ Cancelled order ${order.id} on ${order.exchange}`);
                return { success: true, orderId: order.id };
            }
            catch (error) {
                console.error(`[KillSwitch] ❌ Failed to cancel order ${order.id}:`, error);
                return { success: false, orderId: order.id, error: String(error) };
            }
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await Promise.all(cancelPromises);
        for (const result of results) {
            if (result.success) {
                cancelled++;
                this.activeOrders.delete(result.orderId);
            }
            else {
                failed++;
                if (result.error)
                    errors.push(result.error);
            }
        }
        return { cancelled, failed, errors };
    }
    // Complexity: O(N) — linear iteration
    async closeAllPositions() {
        let closed = 0;
        let failed = 0;
        const errors = [];
        const positions = Array.from(this.openPositions.values());
        // Close all positions in parallel
        const closePromises = positions.map(async (position) => {
            try {
                await this.simulateClosePosition(position);
                console.log(`[KillSwitch] ✅ Closed ${position.side} position on ${position.symbol}`);
                return { success: true, symbol: position.symbol };
            }
            catch (error) {
                console.error(`[KillSwitch] ❌ Failed to close position ${position.symbol}:`, error);
                return { success: false, symbol: position.symbol, error: String(error) };
            }
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await Promise.all(closePromises);
        for (const result of results) {
            if (result.success) {
                closed++;
                this.openPositions.delete(result.symbol);
            }
            else {
                failed++;
                if (result.error)
                    errors.push(result.error);
            }
        }
        return { closed, failed, errors };
    }
    // Complexity: O(N) — linear iteration
    async withdrawAllFunds() {
        let initiated = 0;
        let failed = 0;
        let totalUSD = 0;
        const errors = [];
        // Get all balances
        const balances = this.walletManager.getTotalBalance();
        // In production, this would initiate actual withdrawals
        // For now, simulate the process
        console.log(`[KillSwitch] 💰 Total balance to withdraw: $${balances.total.toFixed(2)}`);
        for (const [exchange, amount] of balances.byExchange) {
            try {
                await this.simulateWithdrawal(exchange, amount);
                console.log(`[KillSwitch] ✅ Initiated withdrawal from ${exchange}: $${amount.toFixed(2)}`);
                initiated++;
                totalUSD += amount;
            }
            catch (error) {
                console.error(`[KillSwitch] ❌ Failed withdrawal from ${exchange}:`, error);
                failed++;
                errors.push(String(error));
            }
        }
        return { initiated, failed, totalUSD, errors };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // SIMULATION METHODS (Replace with real API calls in production)
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async simulateCancelOrder(order) {
        // Simulate API latency
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        // 95% success rate
        if (Math.random() < 0.05) {
            throw new Error('Exchange timeout');
        }
    }
    // Complexity: O(1)
    async simulateClosePosition(position) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        if (Math.random() < 0.03) {
            throw new Error('Insufficient liquidity');
        }
    }
    // Complexity: O(1)
    async simulateWithdrawal(exchange, amount) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        if (Math.random() < 0.02) {
            throw new Error('Withdrawal limit exceeded');
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // AUTO-TRIGGER MONITORING
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Update portfolio value and check for auto-trigger conditions
     */
    // Complexity: O(1) — hash/map lookup
    updatePortfolioValue(value) {
        if (value > this.peakPortfolioValue) {
            this.peakPortfolioValue = value;
        }
        this.currentPortfolioValue = value;
        if (!this.config.autoTriggerEnabled || !this.isArmed)
            return;
        // Check drawdown
        const drawdown = ((this.peakPortfolioValue - value) / this.peakPortfolioValue) * 100;
        if (drawdown >= this.config.maxDrawdownPercent) {
            console.log(`[KillSwitch] 🚨 AUTO-TRIGGER: Drawdown ${drawdown.toFixed(2)}% exceeds ${this.config.maxDrawdownPercent}%`);
            this.trigger(`Auto-trigger: Drawdown ${drawdown.toFixed(2)}%`);
        }
    }
    /**
     * Record trade result and check for consecutive losses
     */
    // Complexity: O(1) — hash/map lookup
    recordTradeResult(profit) {
        if (profit < 0) {
            this.consecutiveLosses++;
            if (!this.config.autoTriggerEnabled || !this.isArmed)
                return;
            if (this.consecutiveLosses >= this.config.maxConsecutiveLosses) {
                console.log(`[KillSwitch] 🚨 AUTO-TRIGGER: ${this.consecutiveLosses} consecutive losses`);
                this.trigger(`Auto-trigger: ${this.consecutiveLosses} consecutive losses`);
            }
        }
        else {
            this.consecutiveLosses = 0;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ORDER/POSITION TRACKING
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    registerOrder(order) {
        this.activeOrders.set(order.id, order);
    }
    // Complexity: O(1)
    unregisterOrder(orderId) {
        this.activeOrders.delete(orderId);
    }
    // Complexity: O(1) — hash/map lookup
    registerPosition(position) {
        this.openPositions.set(position.symbol, position);
    }
    // Complexity: O(1)
    unregisterPosition(symbol) {
        this.openPositions.delete(symbol);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    setWithdrawalAddress(address, network) {
        this.config.primaryWithdrawalAddress = address;
        this.config.primaryWithdrawalNetwork = network;
        console.log(`[KillSwitch] 📬 Primary withdrawal: ${network} → ${address.slice(0, 15)}...`);
    }
    // Complexity: O(1) — hash/map lookup
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        console.log('[KillSwitch] ⚙️ Configuration updated');
    }
    // Complexity: O(1)
    getConfig() {
        return { ...this.config };
    }
    // Complexity: O(1) — amortized
    getStatus() {
        const drawdown = this.peakPortfolioValue > 0
            ? ((this.peakPortfolioValue - this.currentPortfolioValue) / this.peakPortfolioValue) * 100
            : 0;
        return {
            isArmed: this.isArmed,
            triggerCount: this.triggerCount,
            lastTriggered: this.lastTriggered,
            activeOrders: this.activeOrders.size,
            openPositions: this.openPositions.size,
            consecutiveLosses: this.consecutiveLosses,
            currentDrawdown: drawdown,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    createFailedResult(triggeredAt, errors) {
        return {
            success: false,
            triggeredAt,
            completedAt: Date.now(),
            executionTimeMs: Date.now() - triggeredAt,
            ordersCancelled: 0,
            ordersFailedToCancel: 0,
            positionsClosed: 0,
            positionsFailedToClose: 0,
            withdrawalsInitiated: 0,
            withdrawalsFailed: 0,
            totalWithdrawnUSD: 0,
            errors,
        };
    }
}
exports.EmergencyKillSwitch = EmergencyKillSwitch;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.emergencyKillSwitch = new EmergencyKillSwitch();
exports.default = EmergencyKillSwitch;
