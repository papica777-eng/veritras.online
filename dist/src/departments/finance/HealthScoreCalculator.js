"use strict";
/**
 * Health Score Calculator
 * Multi-dimensional health metrics for the entire SaaS platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthScoreCalculator = void 0;
const events_1 = require("events");
const Logger_1 = require("../telemetry/Logger");
/**
 * Calculates comprehensive health scores for the SaaS platform
 * Provides predictive insights and automated recommendations
 */
class HealthScoreCalculator extends events_1.EventEmitter {
    logger;
    componentHealth = new Map();
    historicalData = new Map();
    // Health calculation weights
    WEIGHTS = {
        availability: 0.25, // Most important for SaaS
        errorRate: 0.20, // Critical for user experience
        latency: 0.15, // Important for UX
        dependencyHealth: 0.15, // Cascading failures prevention
        resourceUtilization: 0.10, // Performance indicator
        entropy: 0.05, // QAntum-specific metric
        userSatisfaction: 0.05, // Long-term health
        revenueHealth: 0.05 // Business health
    };
    constructor() {
        super();
        this.logger = Logger_1.Logger.getInstance();
        this.initializeComponents();
        this.startHealthMonitoring();
    }
    /**
     * Calculate health score for a component
     */
    // Complexity: O(N) — linear iteration
    calculateComponentHealth(componentId, metrics) {
        const existingHealth = this.componentHealth.get(componentId);
        const previousScore = existingHealth?.healthScore || 0;
        // Fill missing metrics with defaults or estimated values
        const fullMetrics = {
            availability: metrics.availability ?? 0.99,
            latency: metrics.latency ?? 0.95,
            errorRate: metrics.errorRate ?? 0.99,
            resourceUtilization: metrics.resourceUtilization ?? 0.7,
            dependencyHealth: metrics.dependencyHealth ?? 0.95,
            entropy: metrics.entropy ?? 0.95,
            userSatisfaction: metrics.userSatisfaction ?? 0.9,
            revenueHealth: metrics.revenueHealth ?? 0.95
        };
        // Calculate weighted health score
        const healthScore = Object.entries(this.WEIGHTS).reduce((total, [metric, weight]) => {
            const value = fullMetrics[metric];
            return total + (value * weight);
        }, 0);
        // Determine trend
        const trend = this.calculateTrend(componentId, healthScore, previousScore);
        // Determine alert level
        const alertLevel = this.determineAlertLevel(healthScore);
        const componentHealth = {
            componentId,
            componentName: this.getComponentName(componentId),
            healthScore: Math.round(healthScore * 100) / 100,
            metrics: fullMetrics,
            lastUpdated: Date.now(),
            trend,
            alertLevel
        };
        // Store historical data
        this.updateHistoricalData(componentId, healthScore);
        // Store component health
        this.componentHealth.set(componentId, componentHealth);
        // Emit health update
        this.emit('health_updated', componentHealth);
        return componentHealth;
    }
    /**
     * Calculate overall platform health
     */
    // Complexity: O(N) — linear iteration
    calculatePlatformHealth() {
        const components = Array.from(this.componentHealth.values());
        if (components.length === 0) {
            return {
                overallScore: 0,
                components: [],
                criticalIssues: ['No components registered'],
                recommendations: ['Initialize health monitoring'],
                lastCalculated: Date.now()
            };
        }
        // Calculate weighted overall score
        const overallScore = components.reduce((total, component) => {
            const weight = this.getComponentWeight(component.componentId);
            return total + (component.healthScore * weight);
        }, 0) / components.reduce((total, component) => total + this.getComponentWeight(component.componentId), 0);
        // Identify critical issues
        const criticalIssues = this.identifyCriticalIssues(components);
        // Generate recommendations
        const recommendations = this.generateRecommendations(components, overallScore);
        const platformHealth = {
            overallScore: Math.round(overallScore * 100) / 100,
            components,
            criticalIssues,
            recommendations,
            lastCalculated: Date.now()
        };
        this.emit('platform_health_calculated', platformHealth);
        return platformHealth;
    }
    /**
     * Predictive health analysis
     */
    // Complexity: O(N)
    predictHealthTrend(componentId, timeHorizonMinutes = 30) {
        const historical = this.historicalData.get(componentId) || [];
        if (historical.length < 3) {
            return {
                componentId,
                predictedScore: this.componentHealth.get(componentId)?.healthScore || 0.5,
                confidence: 0.1,
                trend: 'unknown',
                timeHorizon: timeHorizonMinutes
            };
        }
        // Simple linear regression for trend prediction
        const trend = this.calculateLinearTrend(historical);
        const currentScore = historical[historical.length - 1];
        const predictedScore = Math.max(0, Math.min(1, currentScore + (trend * timeHorizonMinutes)));
        // Calculate confidence based on data stability
        const variance = this.calculateVariance(historical);
        const confidence = Math.max(0.1, Math.min(0.9, 1 - variance));
        return {
            componentId,
            predictedScore,
            confidence,
            trend: trend > 0.001 ? 'improving' : trend < -0.001 ? 'degrading' : 'stable',
            timeHorizon: timeHorizonMinutes
        };
    }
    /**
     * Auto-healing trigger
     */
    // Complexity: O(N*M) — nested iteration detected
    async triggerAutoHealing(componentId) {
        this.logger.info('HEALING', `Triggering auto-healing for ${componentId}`);
        const component = this.componentHealth.get(componentId);
        if (!component) {
            throw new Error(`Component not found: ${componentId}`);
        }
        const healingStrategies = this.generateHealingStrategies(component);
        const results = [];
        for (const strategy of healingStrategies) {
            try {
                const result = await this.executeHealingStrategy(componentId, strategy);
                results.push(result);
                if (result.success) {
                    this.logger.info('HEALING', `Healing strategy ${strategy.name} succeeded for ${componentId}`);
                }
            }
            catch (error) {
                this.logger.error('HEALING', `Healing strategy ${strategy.name} failed`, error);
                results.push({
                    strategy: strategy.name,
                    success: false,
                    error: error.message,
                    duration: 0
                });
            }
        }
        const healingResult = {
            componentId,
            healingActions: results,
            overallSuccess: results.some(r => r.success),
            timestamp: Date.now()
        };
        this.emit('healing_completed', healingResult);
        return healingResult;
    }
    // Private helper methods
    // Complexity: O(N) — linear iteration
    initializeComponents() {
        // Initialize health monitoring for key platform components
        const components = [
            'stripe_payment_gateway',
            'binance_integration',
            'postgres_database',
            'redis_cache',
            'telegram_bot',
            'wealth_scanner_app',
            'sector_security_app',
            'network_optimizer_app',
            'valuation_gate_app',
            'automation_nexus_app',
            'intelligence_core_app'
        ];
        components.forEach(componentId => {
            this.calculateComponentHealth(componentId, {});
        });
    }
    // Complexity: O(1)
    startHealthMonitoring() {
        // Update health scores every minute
        // Complexity: O(1)
        setInterval(() => {
            this.updateAllComponentHealth();
        }, 60000);
        // Calculate platform health every 5 minutes
        // Complexity: O(1)
        setInterval(() => {
            const platformHealth = this.calculatePlatformHealth();
            if (platformHealth.overallScore < 0.8) {
                this.logger.warn('PLATFORM_HEALTH', 'Platform health degraded', platformHealth);
                this.emit('platform_health_degraded', platformHealth);
            }
        }, 300000);
    }
    // Complexity: O(N*M) — nested iteration detected
    async updateAllComponentHealth() {
        // Update health for all registered components
        for (const [componentId] of this.componentHealth) {
            // In production, this would fetch real metrics
            const mockMetrics = this.generateMockMetrics(componentId);
            this.calculateComponentHealth(componentId, mockMetrics);
        }
    }
    // Complexity: O(N)
    generateMockMetrics(componentId) {
        // Generate realistic health metrics for demo
        const baseHealth = 0.85 + Math.random() * 0.1;
        return {
            availability: Math.min(1, baseHealth + 0.1),
            latency: Math.min(1, baseHealth + Math.random() * 0.05),
            errorRate: Math.min(1, baseHealth + 0.05),
            resourceUtilization: 0.3 + Math.random() * 0.4,
            dependencyHealth: Math.min(1, baseHealth),
            entropy: Math.min(1, baseHealth + 0.05),
            userSatisfaction: Math.min(1, baseHealth),
            revenueHealth: componentId.includes('payment') ? Math.min(1, baseHealth + 0.1) : baseHealth
        };
    }
    // Complexity: O(1)
    calculateTrend(componentId, currentScore, previousScore) {
        if (!previousScore)
            return 'stable';
        const change = currentScore - previousScore;
        if (change > 0.05)
            return 'improving';
        if (change < -0.05)
            return 'degrading';
        return 'stable';
    }
    // Complexity: O(1)
    determineAlertLevel(healthScore) {
        if (healthScore >= 0.9)
            return 'green';
        if (healthScore >= 0.7)
            return 'yellow';
        return 'red';
    }
    // Complexity: O(1) — hash/map lookup
    getComponentName(componentId) {
        const names = {
            'stripe_payment_gateway': 'Stripe Payment Gateway',
            'binance_integration': 'Binance Integration',
            'postgres_database': 'PostgreSQL Database',
            'redis_cache': 'Redis Cache',
            'telegram_bot': 'Telegram Bot',
            'wealth_scanner_app': 'Wealth Scanner Pro',
            'sector_security_app': 'Sector Security Suite',
            'network_optimizer_app': 'Network Optimizer Pro',
            'valuation_gate_app': 'Valuation Gate AI',
            'automation_nexus_app': 'Automation Nexus',
            'intelligence_core_app': 'Intelligence Core'
        };
        return names[componentId] || componentId.replace(/_/g, ' ');
    }
    // Complexity: O(1) — hash/map lookup
    getComponentWeight(componentId) {
        // Critical components have higher weights
        const weights = {
            'stripe_payment_gateway': 0.25, // Payment is critical
            'postgres_database': 0.20, // Data is critical
            'binance_integration': 0.10,
            'redis_cache': 0.10,
            'telegram_bot': 0.05,
            'wealth_scanner_app': 0.06,
            'sector_security_app': 0.06,
            'network_optimizer_app': 0.06,
            'valuation_gate_app': 0.06,
            'automation_nexus_app': 0.06,
            'intelligence_core_app': 0.06
        };
        return weights[componentId] || 0.05;
    }
    // Complexity: O(N) — linear iteration
    identifyCriticalIssues(components) {
        const issues = [];
        components.forEach(component => {
            if (component.alertLevel === 'red') {
                issues.push(`${component.componentName} health critically low (${component.healthScore})`);
            }
            if (component.metrics.availability < 0.95) {
                issues.push(`${component.componentName} availability below SLA`);
            }
            if (component.metrics.errorRate < 0.95) {
                issues.push(`${component.componentName} high error rate detected`);
            }
            if (component.trend === 'degrading') {
                issues.push(`${component.componentName} showing degrading trend`);
            }
        });
        return issues;
    }
    // Complexity: O(N*M) — nested iteration detected
    generateRecommendations(components, overallScore) {
        const recommendations = [];
        if (overallScore < 0.8) {
            recommendations.push('Platform health below optimal - investigate critical components');
        }
        components.forEach(component => {
            if (component.metrics.resourceUtilization > 0.9) {
                recommendations.push(`Scale up resources for ${component.componentName}`);
            }
            if (component.metrics.latency < 0.7) {
                recommendations.push(`Optimize response time for ${component.componentName}`);
            }
            if (component.metrics.dependencyHealth < 0.8) {
                recommendations.push(`Check downstream dependencies for ${component.componentName}`);
            }
        });
        return recommendations;
    }
    // Complexity: O(1) — amortized
    generateHealingStrategies(component) {
        const strategies = [];
        if (component.metrics.availability < 0.95) {
            strategies.push({ name: 'restart_service', priority: 'high', estimatedDuration: 30000 });
        }
        if (component.metrics.resourceUtilization > 0.9) {
            strategies.push({ name: 'scale_resources', priority: 'medium', estimatedDuration: 120000 });
        }
        if (component.metrics.errorRate < 0.9) {
            strategies.push({ name: 'clear_error_state', priority: 'high', estimatedDuration: 10000 });
        }
        if (component.metrics.latency < 0.7) {
            strategies.push({ name: 'optimize_performance', priority: 'medium', estimatedDuration: 60000 });
        }
        return strategies;
    }
    // Complexity: O(1) — amortized
    async executeHealingStrategy(componentId, strategy) {
        const startTime = Date.now();
        try {
            // Execute healing strategy based on type
            switch (strategy.name) {
                case 'restart_service':
                    await this.restartService(componentId);
                    break;
                case 'scale_resources':
                    await this.scaleResources(componentId);
                    break;
                case 'clear_error_state':
                    await this.clearErrorState(componentId);
                    break;
                case 'optimize_performance':
                    await this.optimizePerformance(componentId);
                    break;
                default:
                    throw new Error(`Unknown healing strategy: ${strategy.name}`);
            }
            return {
                strategy: strategy.name,
                success: true,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                strategy: strategy.name,
                success: false,
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }
    // Complexity: O(1) — hash/map lookup
    updateHistoricalData(componentId, score) {
        const history = this.historicalData.get(componentId) || [];
        history.push(score);
        // Keep last 100 data points
        if (history.length > 100) {
            history.shift();
        }
        this.historicalData.set(componentId, history);
    }
    // Complexity: O(N) — linear iteration
    calculateLinearTrend(data) {
        if (data.length < 2)
            return 0;
        const n = data.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = data.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = data.reduce((sum, _, x) => sum + x * x, 0);
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }
    // Complexity: O(N) — linear iteration
    calculateVariance(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    }
    // Mock healing actions (in production these would be real operations)
    // Complexity: O(1)
    async restartService(componentId) {
        this.logger.info('HEALING', `Restarting service: ${componentId}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(2000); // Simulate restart time
    }
    // Complexity: O(N)
    async scaleResources(componentId) {
        this.logger.info('HEALING', `Scaling resources for: ${componentId}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(5000); // Simulate scaling time
    }
    // Complexity: O(N)
    async clearErrorState(componentId) {
        this.logger.info('HEALING', `Clearing error state for: ${componentId}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(1000); // Simulate error clearing
    }
    // Complexity: O(N)
    async optimizePerformance(componentId) {
        this.logger.info('HEALING', `Optimizing performance for: ${componentId}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(3000); // Simulate optimization
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current platform health
     */
    // Complexity: O(N) — potential recursive descent
    getCurrentPlatformHealth() {
        return this.calculatePlatformHealth();
    }
    /**
     * Get component health by ID
     */
    // Complexity: O(1) — hash/map lookup
    getComponentHealth(componentId) {
        return this.componentHealth.get(componentId);
    }
}
exports.HealthScoreCalculator = HealthScoreCalculator;
