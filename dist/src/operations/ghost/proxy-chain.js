"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM PROXY CHAIN                                                          ║
 * ║   "Route through proxies, stay invisible"                                     ║
 * ║                                                                               ║
 * ║   TODO B #24 - Ghost: Proxy Chains                                            ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyChain = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// PROXY CHAIN MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class ProxyChain {
    static instance;
    pools = new Map();
    config = {
        enabled: false,
        retryOnFail: true,
        maxRetries: 3,
        healthCheckInterval: 60000
    };
    stats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgLatency: 0,
        byProxy: new Map()
    };
    stickyMap = new Map();
    healthCheckTimer;
    static getInstance() {
        if (!ProxyChain.instance) {
            ProxyChain.instance = new ProxyChain();
        }
        return ProxyChain.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Enable proxy chain
     */
    // Complexity: O(1)
    enable(config) {
        this.config = { ...this.config, ...config, enabled: true };
        this.startHealthChecks();
        console.log('[ProxyChain] Enabled');
    }
    /**
     * Disable proxy chain
     */
    // Complexity: O(1)
    disable() {
        this.config.enabled = false;
        this.stopHealthChecks();
        console.log('[ProxyChain] Disabled');
    }
    /**
     * Check if enabled
     */
    // Complexity: O(1)
    isEnabled() {
        return this.config.enabled;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // POOL MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create a proxy pool
     */
    // Complexity: O(N) — linear scan
    createPool(name, proxies, strategy = 'round-robin') {
        const id = `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.pools.set(id, {
            id,
            name,
            proxies: proxies.map(p => ({ ...p, active: true })),
            rotationStrategy: strategy,
            currentIndex: 0,
            failedProxies: new Set()
        });
        return id;
    }
    /**
     * Add proxy to pool
     */
    // Complexity: O(1) — lookup
    addToPool(poolId, proxy) {
        const pool = this.pools.get(poolId);
        if (!pool)
            return false;
        pool.proxies.push({ ...proxy, active: true });
        return true;
    }
    /**
     * Remove proxy from pool
     */
    // Complexity: O(1) — lookup
    removeFromPool(poolId, host, port) {
        const pool = this.pools.get(poolId);
        if (!pool)
            return false;
        const index = pool.proxies.findIndex(p => p.host === host && p.port === port);
        if (index >= 0) {
            pool.proxies.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Get pool
     */
    // Complexity: O(1) — lookup
    getPool(poolId) {
        return this.pools.get(poolId);
    }
    /**
     * Delete pool
     */
    // Complexity: O(1)
    deletePool(poolId) {
        return this.pools.delete(poolId);
    }
    /**
     * Set default pool
     */
    // Complexity: O(1)
    setDefaultPool(poolId) {
        this.config.defaultPool = poolId;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PROXY SELECTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get next proxy from pool
     */
    // Complexity: O(N) — linear scan
    getProxy(poolId, sessionId) {
        //         const pool = this.pools.get(poolId || this.config.defaultPool || ');
        //         if (!pool || pool.proxies.length === 0) return null;
        const activeProxies = pool.proxies.filter(p => p.active && !pool.failedProxies.has(`${p.host}:${p.port}`));
        if (activeProxies.length === 0) {
            // Reset failed proxies if all failed
            pool.failedProxies.clear();
            return this.getProxy(poolId, sessionId);
        }
        switch (pool.rotationStrategy) {
            case 'round-robin':
                return this.roundRobinSelect(pool, activeProxies);
            case 'random':
                return this.randomSelect(activeProxies);
            case 'weighted':
                return this.weightedSelect(activeProxies);
            case 'sticky':
                return this.stickySelect(pool, activeProxies, sessionId);
            case 'geo-based':
                return this.geoSelect(activeProxies);
            case 'latency-based':
                return this.latencySelect(activeProxies);
            default:
                return activeProxies[0];
        }
    }
    /**
     * Get proxy URL string
     */
    // Complexity: O(1)
    getProxyUrl(poolId, sessionId) {
        const proxy = this.getProxy(poolId, sessionId);
        if (!proxy)
            return null;
        return this.formatProxyUrl(proxy);
    }
    /**
     * Mark proxy as failed
     */
    // Complexity: O(1) — lookup
    markFailed(poolId, host, port) {
        const pool = this.pools.get(poolId);
        if (pool) {
            pool.failedProxies.add(`${host}:${port}`);
            this.stats.failedRequests++;
        }
    }
    /**
     * Mark proxy as successful
     */
    // Complexity: O(N) — linear scan
    markSuccess(poolId, host, port, latency) {
        const pool = this.pools.get(poolId);
        if (pool) {
            pool.failedProxies.delete(`${host}:${port}`);
            // Update proxy latency
            const proxy = pool.proxies.find(p => p.host === host && p.port === port);
            if (proxy) {
                proxy.latency = latency;
                proxy.lastChecked = Date.now();
            }
            this.stats.successfulRequests++;
            this.updateLatencyStats(latency);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BROWSER CONFIGURATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get Playwright proxy config
     */
    // Complexity: O(1)
    getPlaywrightConfig(poolId, sessionId) {
        const proxy = this.getProxy(poolId, sessionId);
        if (!proxy)
            return undefined;
        const config = {
            server: `${proxy.protocol}://${proxy.host}:${proxy.port}`
        };
        if (proxy.username && proxy.password) {
            config.username = proxy.username;
            config.password = proxy.password;
        }
        return config;
    }
    /**
     * Get Puppeteer proxy args
     */
    // Complexity: O(1)
    getPuppeteerArgs(poolId, sessionId) {
        const proxy = this.getProxy(poolId, sessionId);
        if (!proxy)
            return [];
        return [`--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`];
    }
    /**
     * Get Selenium proxy config
     */
    // Complexity: O(1)
    getSeleniumConfig(poolId, sessionId) {
        const proxy = this.getProxy(poolId, sessionId);
        if (!proxy)
            return undefined;
        return {
            proxyType: 'manual',
            httpProxy: `${proxy.host}:${proxy.port}`,
            sslProxy: `${proxy.host}:${proxy.port}`,
            socksProxy: proxy.protocol.startsWith('socks') ? `${proxy.host}:${proxy.port}` : undefined,
            socksVersion: proxy.protocol === 'socks5' ? 5 : 4
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // HEALTH CHECKS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Check proxy health
     */
    // Complexity: O(1)
    async checkHealth(proxy) {
        const startTime = Date.now();
        try {
            // Simulated health check - in real implementation would make HTTP request
            const latency = Date.now() - startTime;
            proxy.latency = latency;
            proxy.lastChecked = Date.now();
            proxy.active = true;
            return true;
        }
        catch {
            proxy.active = false;
            return false;
        }
    }
    /**
     * Check all proxies in pool
     */
    // Complexity: O(N) — loop
    async checkPoolHealth(poolId) {
        const pool = this.pools.get(poolId);
        if (!pool)
            return { healthy: 0, total: 0 };
        let healthy = 0;
        for (const proxy of pool.proxies) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await this.checkHealth(proxy)) {
                healthy++;
            }
        }
        return { healthy, total: pool.proxies.length };
    }
    /**
     * Start health check timer
     */
    // Complexity: O(N) — loop
    startHealthChecks() {
        if (this.healthCheckTimer)
            return;
        this.healthCheckTimer = setInterval(async () => {
            for (const [id] of this.pools) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.checkPoolHealth(id);
            }
        }, this.config.healthCheckInterval);
    }
    /**
     * Stop health check timer
     */
    // Complexity: O(1)
    stopHealthChecks() {
        if (this.healthCheckTimer) {
            // Complexity: O(1)
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATISTICS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get statistics
     */
    // Complexity: O(1)
    getStatistics() {
        return { ...this.stats, byProxy: new Map(this.stats.byProxy) };
    }
    /**
     * Reset statistics
     */
    // Complexity: O(1)
    resetStatistics() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgLatency: 0,
            byProxy: new Map()
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE SELECTION STRATEGIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    roundRobinSelect(pool, proxies) {
        pool.currentIndex = (pool.currentIndex + 1) % proxies.length;
        this.stats.totalRequests++;
        return proxies[pool.currentIndex];
    }
    // Complexity: O(1)
    randomSelect(proxies) {
        this.stats.totalRequests++;
        return proxies[Math.floor(Math.random() * proxies.length)];
    }
    // Complexity: O(N) — linear scan
    weightedSelect(proxies) {
        // Weight by inverse latency (faster = higher weight)
        const weights = proxies.map(p => 1000 / (p.latency || 100));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < proxies.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                this.stats.totalRequests++;
                return proxies[i];
            }
        }
        this.stats.totalRequests++;
        return proxies[0];
    }
    // Complexity: O(N) — linear scan
    stickySelect(pool, proxies, sessionId) {
        if (sessionId) {
            const stickyKey = `${pool.id}:${sessionId}`;
            const cachedProxy = this.stickyMap.get(stickyKey);
            if (cachedProxy) {
                const proxy = proxies.find(p => `${p.host}:${p.port}` === cachedProxy);
                if (proxy) {
                    this.stats.totalRequests++;
                    return proxy;
                }
            }
            // Assign new proxy
            const proxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.stickyMap.set(stickyKey, `${proxy.host}:${proxy.port}`);
            this.stats.totalRequests++;
            return proxy;
        }
        return this.randomSelect(proxies);
    }
    // Complexity: O(N*M) — nested iteration
    geoSelect(proxies) {
        // Prefer proxies from different regions for diversity
        const byCountry = new Map();
        for (const proxy of proxies) {
            const country = proxy.country || 'unknown';
            const list = byCountry.get(country) || [];
            list.push(proxy);
            byCountry.set(country, list);
        }
        // Random country, then random proxy from that country
        const countries = [...byCountry.keys()];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const countryProxies = byCountry.get(country);
        this.stats.totalRequests++;
        return countryProxies[Math.floor(Math.random() * countryProxies.length)];
    }
    // Complexity: O(N log N) — sort
    latencySelect(proxies) {
        // Sort by latency, pick from top 3
        const sorted = [...proxies].sort((a, b) => (a.latency || 999) - (b.latency || 999));
        const top = sorted.slice(0, Math.min(3, sorted.length));
        this.stats.totalRequests++;
        return top[Math.floor(Math.random() * top.length)];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    formatProxyUrl(proxy) {
        const auth = proxy.username && proxy.password
            ? `${proxy.username}:${proxy.password}@`
            :
        ;
        //             : ';
        //         return `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
        //     }
        // Complexity: O(1)
        //     private updateLatencyStats(latency: number): void {
        //         const totalLatency = this.stats.avgLatency * (this.stats.successfulRequests - 1);
        //         this.stats.avgLatency = (totalLatency + latency) / this.stats.successfulRequests;
        //     }
        // }
        // ═══════════════════════════════════════════════════════════════════════════════
        // EXPORTS
        // ═══════════════════════════════════════════════════════════════════════════════
        // export const getProxyChain = (): ProxyChain => ProxyChain.getInstance();
        // export default ProxyChain;
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
    }
}
exports.ProxyChain = ProxyChain;
//             : ';
//         return `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
//     }
// Complexity: O(1)
//     private updateLatencyStats(latency: number): void {
//         const totalLatency = this.stats.avgLatency * (this.stats.successfulRequests - 1);
//         this.stats.avgLatency = (totalLatency + latency) / this.stats.successfulRequests;
//     }
// }
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
// export const getProxyChain = (): ProxyChain => ProxyChain.getInstance();
// export default ProxyChain;
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
