/**
 * @fileoverview Performance Profiler - Core Web Vitals collection
 * @module reporters/PerformanceProfiler
 * @version 1.0.0-QAntum
 */

/**
 * PerformanceProfiler collects and analyzes Core Web Vitals metrics
 * @class
 */
class PerformanceProfiler {
    /**
     * Create a PerformanceProfiler instance
     * @param {WebDriver} driver - Selenium WebDriver instance
     */
    constructor(driver) {
        /** @type {WebDriver} */
        this.driver = driver;
        /** @type {Object} */
        this.metrics = {};
        /** @type {Array<Object>} */
        this.history = [];
    }

    /**
     * Collect performance metrics from the current page
     * @returns {Promise<Object>} Collected metrics
     */
    // Complexity: O(N) — linear scan
    async collectMetrics() {
        const script = `
            return new Promise((resolve) => {
                const metrics = {
                    timestamp: Date.now(),
                    url: window.location.href,
                    timing: {},
                    webVitals: {}
                };
                
                // Navigation Timing
                if (performance.timing) {
                    const t = performance.timing;
                    metrics.timing = {
                        dns: t.domainLookupEnd - t.domainLookupStart,
                        tcp: t.connectEnd - t.connectStart,
                        ttfb: t.responseStart - t.requestStart,
                        download: t.responseEnd - t.responseStart,
                        domParsing: t.domInteractive - t.responseEnd,
                        domReady: t.domContentLoadedEventEnd - t.navigationStart,
                        pageLoad: t.loadEventEnd - t.navigationStart
                    };
                }
                
                // Core Web Vitals via PerformanceObserver
                // LCP (Largest Contentful Paint)
                const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
                if (lcpEntries.length > 0) {
                    metrics.webVitals.LCP = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
                }
                
                // FCP (First Contentful Paint)
                const paintEntries = performance.getEntriesByType('paint');
                const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
                if (fcp) metrics.webVitals.FCP = Math.round(fcp.startTime);
                
                // FP (First Paint)
                const fp = paintEntries.find(e => e.name === 'first-paint');
                if (fp) metrics.webVitals.FP = Math.round(fp.startTime);
                
                // CLS is harder to get synchronously, mark as N/A
                metrics.webVitals.CLS = 'N/A';
                
                // Resource count and sizes
                const resources = performance.getEntriesByType('resource');
                metrics.resources = {
                    total: resources.length,
                    totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
                    scripts: resources.filter(r => r.initiatorType === 'script').length,
                    images: resources.filter(r => r.initiatorType === 'img').length,
                    css: resources.filter(r => r.initiatorType === 'link' || r.initiatorType === 'css').length,
                    fonts: resources.filter(r => r.initiatorType === 'font' || r.name.match(/\\.(woff|woff2|ttf|otf)$/)).length,
                    xhr: resources.filter(r => r.initiatorType === 'xmlhttprequest' || r.initiatorType === 'fetch').length
                };
                
                // Memory info (Chrome only)
                if (performance.memory) {
                    metrics.memory = {
                        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                    };
                }
                
                // Complexity: O(1)
                resolve(metrics);
            });
        `;
        
        try {
            this.metrics = await this.driver.executeScript(script);
            this.history.push(this.metrics);
            
            // Keep only last 100 measurements
            if (this.history.length > 100) {
                this.history.shift();
            }
            
            return this.metrics;
        } catch (e) {
            console.warn(`   ⚠️ Performance metrics collection failed: ${e.message}`);
            return { error: e.message };
        }
    }

    /**
     * Generate a human-readable performance report
     * @returns {string} Formatted report
     */
    // Complexity: O(1)
    getReport() {
        if (!this.metrics.timing) return 'No metrics collected';
        
        const t = this.metrics.timing;
        const v = this.metrics.webVitals || {};
        const r = this.metrics.resources || {};
        const m = this.metrics.memory || {};
        
        /**
         * Get status emoji based on threshold
         * @param {number} value 
         * @param {number} goodThreshold 
         * @param {number} okThreshold 
         * @returns {string}
         */
        const getStatus = (value, goodThreshold, okThreshold) => {
            if (value <= goodThreshold) return '🟢';
            if (value <= okThreshold) return '🟡';
            return '🔴';
        };
        
        let report = `\n⚡ PERFORMANCE REPORT\n`;
        report += `├─ URL: ${this.metrics.url || 'Unknown'}\n`;
        report += `├─ Page Load: ${t.pageLoad}ms ${getStatus(t.pageLoad, 1500, 3000)}\n`;
        report += `├─ TTFB: ${t.ttfb}ms ${getStatus(t.ttfb, 300, 600)}\n`;
        report += `├─ DOM Ready: ${t.domReady}ms ${getStatus(t.domReady, 1000, 2000)}\n`;
        
        if (v.LCP) report += `├─ LCP: ${v.LCP}ms ${getStatus(v.LCP, 2500, 4000)}\n`;
        if (v.FCP) report += `├─ FCP: ${v.FCP}ms ${getStatus(v.FCP, 1800, 3000)}\n`;
        if (v.FP) report += `├─ FP: ${v.FP}ms\n`;
        
        report += `├─ Resources: ${r.total} files (${Math.round((r.totalSize || 0) / 1024)}KB)\n`;
        report += `│  ├─ Scripts: ${r.scripts || 0}\n`;
        report += `│  ├─ Stylesheets: ${r.css || 0}\n`;
        report += `│  ├─ Images: ${r.images || 0}\n`;
        report += `│  └─ XHR/Fetch: ${r.xhr || 0}\n`;
        
        if (m.usedJSHeapSize) {
            report += `└─ Memory: ${m.usedJSHeapSize}MB / ${m.totalJSHeapSize}MB\n`;
        } else {
            report += `└─ Memory: N/A\n`;
        }
        
        return report;
    }

    /**
     * Check if performance is within acceptable thresholds
     * @returns {boolean} True if performance is good
     */
    // Complexity: O(1)
    isPerformanceGood() {
        if (!this.metrics.timing) return true;
        
        const issues = [];
        
        if (this.metrics.timing.pageLoad > 3000) {
            issues.push(`Page load slow: ${this.metrics.timing.pageLoad}ms`);
        }
        if (this.metrics.timing.ttfb > 600) {
            issues.push(`TTFB slow: ${this.metrics.timing.ttfb}ms`);
        }
        if (this.metrics.webVitals?.LCP > 4000) {
            issues.push(`LCP slow: ${this.metrics.webVitals.LCP}ms`);
        }
        if (this.metrics.webVitals?.FCP > 3000) {
            issues.push(`FCP slow: ${this.metrics.webVitals.FCP}ms`);
        }
        
        if (issues.length > 0) {
            console.log(`   ⚠️ Performance issues: ${issues.join(', ')}`);
        }
        
        return issues.length === 0;
    }

    /**
     * Get average metrics from history
     * @returns {Object} Average metrics
     */
    // Complexity: O(N) — linear scan
    getAverages() {
        if (this.history.length === 0) return null;
        
        const sum = {
            pageLoad: 0,
            ttfb: 0,
            domReady: 0,
            lcp: 0,
            fcp: 0,
            resources: 0
        };
        
        let lcpCount = 0;
        let fcpCount = 0;
        
        this.history.forEach(m => {
            if (m.timing) {
                sum.pageLoad += m.timing.pageLoad || 0;
                sum.ttfb += m.timing.ttfb || 0;
                sum.domReady += m.timing.domReady || 0;
            }
            if (m.webVitals?.LCP) {
                sum.lcp += m.webVitals.LCP;
                lcpCount++;
            }
            if (m.webVitals?.FCP) {
                sum.fcp += m.webVitals.FCP;
                fcpCount++;
            }
            if (m.resources) {
                sum.resources += m.resources.total || 0;
            }
        });
        
        const count = this.history.length;
        
        return {
            avgPageLoad: Math.round(sum.pageLoad / count),
            avgTTFB: Math.round(sum.ttfb / count),
            avgDOMReady: Math.round(sum.domReady / count),
            avgLCP: lcpCount > 0 ? Math.round(sum.lcp / lcpCount) : null,
            avgFCP: fcpCount > 0 ? Math.round(sum.fcp / fcpCount) : null,
            avgResources: Math.round(sum.resources / count),
            sampleCount: count
        };
    }

    /**
     * Clear metrics history
     * @returns {void}
     */
    // Complexity: O(1)
    clear() {
        this.metrics = {};
        this.history = [];
    }
}

module.exports = { PerformanceProfiler };
