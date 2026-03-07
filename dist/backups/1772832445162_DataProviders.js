"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: DATA PROVIDERS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * High-level providers for accounts, cards, proxies, emails
 * Built on top of DatabaseHandler with caching, rotation, and smart selection
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProvider = exports.EmailProvider = exports.ProxyProvider = exports.CardProvider = exports.AccountProvider = exports.BaseProvider = void 0;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// BASE PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════
class BaseProvider extends events_1.EventEmitter {
    db;
    cache = new Map();
    usedIds = new Set();
    lockedIds = new Set();
    constructor(db) {
        super();
        this.db = db;
    }
    /**
     * Clear cache
     */
    // Complexity: O(1)
    clearCache() {
        this.cache.clear();
        this.usedIds.clear();
        this.lockedIds.clear();
    }
    /**
     * Reset used tracking
     */
    // Complexity: O(1)
    resetUsed() {
        this.usedIds.clear();
    }
    /**
     * Lock an item (prevent it from being selected)
     */
    // Complexity: O(1)
    lock(id) {
        this.lockedIds.add(id);
    }
    /**
     * Unlock an item
     */
    // Complexity: O(1)
    unlock(id) {
        this.lockedIds.delete(id);
    }
    /**
     * Get excluded IDs (used + locked)
     */
    // Complexity: O(1)
    getExcludedIds() {
        return [...this.usedIds, ...this.lockedIds];
    }
}
exports.BaseProvider = BaseProvider;
class AccountProvider extends BaseProvider {
    options;
    currentAccount = null;
    constructor(db, options = {}) {
        super(db);
        this.options = {
            autoMarkUsed: true,
            cooldownMinutes: 60,
            maxRetries: 3,
            allowReuse: false,
            ...options
        };
    }
    /**
     * Get next available account
     */
    // Complexity: O(1) — lookup
    async getNext(options = {}) {
        const excludeIds = this.options.allowReuse ? [...this.lockedIds] : this.getExcludedIds();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const account = await this.db.getNextAccount({
            ...options,
            excludeIds,
            lockForUpdate: true
        });
        if (account) {
            this.currentAccount = account;
            this.usedIds.add(account.id);
            this.cache.set(account.id, account);
            this.emit('account:selected', account);
        }
        return account;
    }
    /**
     * Get current account
     */
    // Complexity: O(1)
    getCurrent() {
        return this.currentAccount;
    }
    /**
     * Mark current account as successfully used
     */
    // Complexity: O(1)
    async markSuccess() {
        if (!this.currentAccount)
            return;
        if (this.options.autoMarkUsed) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.db.markAccountUsed(this.currentAccount.id, 'used');
        }
        this.emit('account:success', this.currentAccount);
        this.currentAccount = null;
    }
    /**
     * Mark current account as failed
     */
    // Complexity: O(1)
    async markFailed(error) {
        if (!this.currentAccount)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.markAccountFailed(this.currentAccount.id, error);
        this.emit('account:failed', { account: this.currentAccount, error });
        this.currentAccount = null;
    }
    /**
     * Set cooldown on current account
     */
    // Complexity: O(1)
    async setCooldown(minutes) {
        if (!this.currentAccount)
            return;
        const cooldownMinutes = minutes || this.options.cooldownMinutes || 60;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.setAccountCooldown(this.currentAccount.id, cooldownMinutes);
        this.emit('account:cooldown', { account: this.currentAccount, minutes: cooldownMinutes });
    }
    /**
     * Get account with proxy
     */
    // Complexity: O(1)
    async getWithProxy() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const account = await this.getNext({ withProxy: true });
        if (!account || !account.proxy_id)
            return null;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const proxy = await this.db.getProxyById(account.proxy_id);
        if (!proxy)
            return null;
        return { account, proxy };
    }
    /**
     * Get account with card
     */
    // Complexity: O(1)
    async getWithCard() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const account = await this.getNext({ withCard: true });
        if (!account || !account.card_id)
            return null;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const card = await this.db.getCardById(account.card_id);
        if (!card)
            return null;
        return { account, card };
    }
    /**
     * Get full profile (account + proxy + card)
     */
    // Complexity: O(N) — parallel
    async getFullProfile() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const account = await this.getNext({ withProxy: true, withCard: true });
        if (!account)
            return null;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const [proxy, card] = await Promise.all([
            account.proxy_id ? this.db.getProxyById(account.proxy_id) : null,
            account.card_id ? this.db.getCardById(account.card_id) : null
        ]);
        return { account, proxy, card };
    }
    /**
     * Get count of available accounts
     */
    // Complexity: O(1)
    async getAvailableCount() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stats = await this.db.getStats();
        return stats.accounts.active;
    }
}
exports.AccountProvider = AccountProvider;
class CardProvider extends BaseProvider {
    options;
    currentCard = null;
    constructor(db, options = {}) {
        super(db);
        this.options = {
            autoMarkUsed: true,
            validateExpiry: true,
            maxUsagePerCard: 1,
            ...options
        };
    }
    /**
     * Get next available card
     */
    // Complexity: O(1) — lookup
    async getNext(options = {}) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const card = await this.db.getNextCard({
            ...options,
            excludeIds: this.getExcludedIds(),
            lockForUpdate: true
        });
        if (card) {
            // Validate expiry if enabled
            if (this.options.validateExpiry) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const valid = await this.db.validateCard(card);
                if (!valid) {
                    this.usedIds.add(card.id);
                    return this.getNext(options); // Try next card
                }
            }
            this.currentCard = card;
            this.usedIds.add(card.id);
            this.cache.set(card.id, card);
            this.emit('card:selected', { id: card.id, type: card.card_type });
        }
        return card;
    }
    /**
     * Get current card
     */
    // Complexity: O(1)
    getCurrent() {
        return this.currentCard;
    }
    /**
     * Mark card payment as successful
     */
    // Complexity: O(1)
    async markSuccess() {
        if (!this.currentCard)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.markCardUsed(this.currentCard.id, true);
        this.emit('card:success', this.currentCard);
        this.currentCard = null;
    }
    /**
     * Mark card payment as declined
     */
    // Complexity: O(1)
    async markDeclined() {
        if (!this.currentCard)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.markCardUsed(this.currentCard.id, false);
        this.emit('card:declined', this.currentCard);
        this.currentCard = null;
    }
    /**
     * Get card details formatted for payment forms
     */
    // Complexity: O(1)
    getPaymentDetails() {
        if (!this.currentCard)
            return null;
        return {
            number: this.currentCard.card_number,
            holder: this.currentCard.holder_name,
            expiry: `${this.currentCard.expiry_month}/${this.currentCard.expiry_year}`,
            expiryMonth: this.currentCard.expiry_month,
            expiryYear: this.currentCard.expiry_year,
            cvv: this.currentCard.cvv
        };
    }
    /**
     * Get billing address formatted
     */
    // Complexity: O(1)
    getBillingAddress() {
        if (!this.currentCard)
            return null;
        return {
            address: this.currentCard.billing_address || '',
            city: this.currentCard.billing_city || '',
            zip: this.currentCard.billing_zip || '',
            country: this.currentCard.billing_country || ''
        };
    }
    /**
     * Get available count
     */
    // Complexity: O(1)
    async getAvailableCount() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stats = await this.db.getStats();
        return stats.cards.active;
    }
}
exports.CardProvider = CardProvider;
class ProxyProvider extends BaseProvider {
    options;
    currentProxy = null;
    failCount = 0;
    rotationIndex = 0;
    proxyPool = [];
    constructor(db, options = {}) {
        super(db);
        this.options = {
            rotateOnFail: true,
            maxFailsBeforeRotate: 3,
            stickySession: false,
            ...options
        };
    }
    /**
     * Get next available proxy
     */
    // Complexity: O(1) — lookup
    async getNext(options = {}) {
        // Use sticky session if enabled and we have a working proxy
        if (this.options.stickySession && this.currentProxy && this.failCount === 0) {
            return this.currentProxy;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const proxy = await this.db.getNextProxy({
            country: options.country || this.options.preferredCountry,
            protocol: options.protocol || this.options.preferredProtocol,
            maxResponseTime: options.maxResponseTime,
            rotationGroup: options.rotationGroup,
            excludeIds: this.getExcludedIds(),
            lockForUpdate: true
        });
        if (proxy) {
            this.currentProxy = proxy;
            this.failCount = 0;
            this.cache.set(proxy.id, proxy);
            this.emit('proxy:selected', { id: proxy.id, host: proxy.host, country: proxy.country });
        }
        return proxy;
    }
    /**
     * Get current proxy
     */
    // Complexity: O(1)
    getCurrent() {
        return this.currentProxy;
    }
    /**
     * Get proxy URL for browser
     */
    // Complexity: O(1)
    getProxyUrl() {
        if (!this.currentProxy)
            return null;
        return this.db.getProxyUrl(this.currentProxy);
    }
    /**
     * Get proxy config for Playwright
     */
    // Complexity: O(1)
    getPlaywrightConfig() {
        if (!this.currentProxy)
            return null;
        const config = {
            server: `${this.currentProxy.protocol}://${this.currentProxy.host}:${this.currentProxy.port}`
        };
        if (this.currentProxy.username) {
            config.username = this.currentProxy.username;
            config.password = this.currentProxy.password;
        }
        return config;
    }
    /**
     * Report proxy success
     */
    // Complexity: O(1)
    async reportSuccess(responseTime) {
        if (!this.currentProxy)
            return;
        this.failCount = 0;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.updateProxyStats(this.currentProxy.id, true, responseTime);
        this.emit('proxy:success', { id: this.currentProxy.id, responseTime });
    }
    /**
     * Report proxy failure
     */
    // Complexity: O(1)
    async reportFailure() {
        if (!this.currentProxy)
            return;
        this.failCount++;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.updateProxyStats(this.currentProxy.id, false);
        this.emit('proxy:failure', { id: this.currentProxy.id, failCount: this.failCount });
        // Rotate if too many failures
        if (this.options.rotateOnFail && this.failCount >= (this.options.maxFailsBeforeRotate || 3)) {
            this.usedIds.add(this.currentProxy.id);
            this.currentProxy = null;
            this.emit('proxy:rotating');
        }
    }
    /**
     * Force rotation to next proxy
     */
    // Complexity: O(1)
    async rotate() {
        if (this.currentProxy) {
            this.usedIds.add(this.currentProxy.id);
        }
        this.currentProxy = null;
        this.failCount = 0;
        return this.getNext();
    }
    /**
     * Load proxy pool for round-robin rotation
     */
    // Complexity: O(1)
    async loadPool(options = {}) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const proxies = await this.db.raw()('proxies')
            .where('status', 'active')
            .where(builder => {
            if (options.country)
                builder.where('country', options.country);
            if (options.protocol)
                builder.where('protocol', options.protocol);
        })
            .orderBy('response_time', 'asc')
            .limit(options.limit || 100);
        this.proxyPool = proxies;
        this.rotationIndex = 0;
        this.emit('proxy:pool_loaded', { count: proxies.length });
        return proxies.length;
    }
    /**
     * Get next proxy from pool (round-robin)
     */
    // Complexity: O(1)
    getNextFromPool() {
        if (this.proxyPool.length === 0)
            return null;
        const proxy = this.proxyPool[this.rotationIndex];
        this.rotationIndex = (this.rotationIndex + 1) % this.proxyPool.length;
        this.currentProxy = proxy;
        return proxy;
    }
    /**
     * Get available count
     */
    // Complexity: O(1)
    async getAvailableCount() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stats = await this.db.getStats();
        return stats.proxies.active;
    }
}
exports.ProxyProvider = ProxyProvider;
class EmailProvider extends BaseProvider {
    options;
    currentEmail = null;
    constructor(db, options = {}) {
        super(db);
        this.options = {
            requireVerified: false,
            ...options
        };
    }
    /**
     * Get next available email
     */
    // Complexity: O(1) — lookup
    async getNext(options = {}) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const email = await this.db.getNextEmail({
            provider: options.provider || this.options.preferredProvider,
            verified: options.verified ?? this.options.requireVerified,
            excludeIds: this.getExcludedIds(),
            lockForUpdate: true
        });
        if (email) {
            this.currentEmail = email;
            this.usedIds.add(email.id);
            this.cache.set(email.id, email);
            this.emit('email:selected', { id: email.id, provider: email.provider });
        }
        return email;
    }
    /**
     * Get current email
     */
    // Complexity: O(1)
    getCurrent() {
        return this.currentEmail;
    }
    /**
     * Mark email as used
     */
    // Complexity: O(1)
    async markUsed() {
        if (!this.currentEmail)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.markEmailUsed(this.currentEmail.id);
        this.emit('email:used', this.currentEmail);
        this.currentEmail = null;
    }
    /**
     * Get IMAP config for email reading
     */
    // Complexity: O(1)
    getImapConfig() {
        if (!this.currentEmail || !this.currentEmail.imap_host)
            return null;
        return {
            host: this.currentEmail.imap_host,
            port: this.currentEmail.imap_port || 993,
            user: this.currentEmail.email,
            password: this.currentEmail.password || '',
            tls: true
        };
    }
    /**
     * Get available count
     */
    // Complexity: O(1)
    async getAvailableCount() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stats = await this.db.getStats();
        return stats.emails.active;
    }
}
exports.EmailProvider = EmailProvider;
class DataProvider extends events_1.EventEmitter {
    accounts;
    cards;
    proxies;
    emails;
    db;
    constructor(config) {
        super();
        this.db = config.database;
        this.accounts = new AccountProvider(this.db, config.accountOptions);
        this.cards = new CardProvider(this.db, config.cardOptions);
        this.proxies = new ProxyProvider(this.db, config.proxyOptions);
        this.emails = new EmailProvider(this.db, config.emailOptions);
        // Forward events
        this.forwardEvents();
    }
    // Complexity: O(N) — loop
    forwardEvents() {
        const providers = [
            { provider: this.accounts, prefix: 'account' },
            { provider: this.cards, prefix: 'card' },
            { provider: this.proxies, prefix: 'proxy' },
            { provider: this.emails, prefix: 'email' }
        ];
        for (const { provider, prefix } of providers) {
            provider.on('*', (event, data) => {
                this.emit(`${prefix}:${event}`, data);
            });
        }
    }
    /**
     * Get complete automation profile
     */
    // Complexity: O(N) — parallel
    async getAutomationProfile() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const account = await this.accounts.getNext();
        if (!account)
            return null;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const [card, proxy] = await Promise.all([
            account.card_id ? this.db.getCardById(account.card_id) : this.cards.getNext(),
            account.proxy_id ? this.db.getProxyById(account.proxy_id) : this.proxies.getNext()
        ]);
        // Try to get email if account doesn't have one
        // SAFETY: async operation — wrap in try-catch for production resilience
        const email = await this.emails.getNext();
        return { account, card, proxy, email };
    }
    /**
     * Mark current profile as completed successfully
     */
    // Complexity: O(N) — parallel
    async markProfileSuccess() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all([
            this.accounts.markSuccess(),
            this.cards.markSuccess(),
            this.proxies.reportSuccess()
        ]);
    }
    /**
     * Mark current profile as failed
     */
    // Complexity: O(N) — parallel
    async markProfileFailed(error) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all([
            this.accounts.markFailed(error),
            this.cards.markDeclined(),
            this.proxies.reportFailure()
        ]);
    }
    /**
     * Reset all providers
     */
    // Complexity: O(1)
    reset() {
        this.accounts.resetUsed();
        this.cards.resetUsed();
        this.proxies.resetUsed();
        this.emails.resetUsed();
    }
    /**
     * Clear all caches
     */
    // Complexity: O(1)
    clearCaches() {
        this.accounts.clearCache();
        this.cards.clearCache();
        this.proxies.clearCache();
        this.emails.clearCache();
    }
    /**
     * Get statistics
     */
    // Complexity: O(1)
    async getStats() {
        return this.db.getStats();
    }
}
exports.DataProvider = DataProvider;
exports.default = DataProvider;
