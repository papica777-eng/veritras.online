/**
 * ASSET SPAWNER - Autonomous Asset Spawning Logic
 * Version: 1.0.0-SINGULARITY
 * 
 * Features:
 * - Market void detection from Neural Core Magnet data
 * - Automatic Micro-SaaS module generation
 * - Neon DB branch deployment
 * - Wealth Bridge ledger integration
 * 
 * Economic Darwinism: Assets compete for resources,
 * underperformers are automatically terminated.
 */

import {
    MarketVoid,
    MicroSaaSConfig,
    SpawnedAsset,
    AssetLifecycleState,
    AssetId,
    LedgerTransaction,
    AssetRevenueSummary
} from './types';
import { SharedMemoryV2, getSharedMemory } from './SharedMemoryV2';

/**
 * Configuration for asset spawning
 */
interface AssetSpawnerConfig {
    /** Maximum concurrent assets */
    maxAssets: number;
    
    /** Minimum demand score to spawn */
    minDemandScore: number;
    
    /** Maximum competition level to spawn */
    maxCompetitionLevel: number;
    
    /** Minimum revenue potential (EUR/month) */
    minRevenuePotential: number;
    
    /** Health check interval (ms) */
    healthCheckIntervalMs: number;
    
    /** Asset termination threshold (health score) */
    terminationThreshold: number;
    
    /** Neon DB API endpoint */
    neonApiEndpoint: string;
    
    /** Wealth Bridge ledger endpoint */
    wealthBridgeEndpoint: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AssetSpawnerConfig = {
    maxAssets: 10,
    minDemandScore: 0.6,
    maxCompetitionLevel: 0.4,
    minRevenuePotential: 100,
    healthCheckIntervalMs: 30000,
    terminationThreshold: 0.3,
    neonApiEndpoint: 'https://console.neon.tech/api/v2',
    wealthBridgeEndpoint: '/api/wealth-bridge'
};

/**
 * Boilerplate templates for different SaaS types
 */
const SAAS_TEMPLATES: Record<string, {
    features: string[];
    schema: string;
    routes: string[];
}> = {
    analytics: {
        features: ['Real-time tracking', 'Custom dashboards', 'Export reports'],
        schema: `
            CREATE TABLE events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                properties JSONB,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX idx_events_timestamp ON events(timestamp);
        `,
        routes: ['POST /events', 'GET /events', 'GET /reports', 'GET /dashboard']
    },
    crm: {
        features: ['Contact management', 'Deal tracking', 'Email integration'],
        schema: `
            CREATE TABLE contacts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                company VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE deals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                contact_id UUID REFERENCES contacts(id),
                value DECIMAL(10,2),
                stage VARCHAR(50),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `,
        routes: ['POST /contacts', 'GET /contacts', 'POST /deals', 'GET /deals', 'PUT /deals/:id']
    },
    automation: {
        features: ['Workflow builder', 'Trigger actions', 'API integrations'],
        schema: `
            CREATE TABLE workflows (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                config JSONB NOT NULL,
                enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE executions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                workflow_id UUID REFERENCES workflows(id),
                status VARCHAR(50),
                output JSONB,
                executed_at TIMESTAMPTZ DEFAULT NOW()
            );
        `,
        routes: ['POST /workflows', 'GET /workflows', 'POST /workflows/:id/execute', 'GET /executions']
    },
    monitoring: {
        features: ['Uptime monitoring', 'Alerts', 'Status pages'],
        schema: `
            CREATE TABLE monitors (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                url VARCHAR(1000) NOT NULL,
                interval_seconds INTEGER DEFAULT 60,
                enabled BOOLEAN DEFAULT true
            );
            CREATE TABLE checks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                monitor_id UUID REFERENCES monitors(id),
                status INTEGER,
                response_time_ms INTEGER,
                checked_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX idx_checks_monitor_time ON checks(monitor_id, checked_at);
        `,
        routes: ['POST /monitors', 'GET /monitors', 'GET /monitors/:id/checks', 'GET /status']
    }
};

/**
 * AssetSpawner - Autonomous Asset Spawning System
 * 
 * Implements Economic Darwinism: automatically spawns new Micro-SaaS
 * modules based on market voids and terminates underperformers.
 */
export class AssetSpawner {
    private config: AssetSpawnerConfig;
    private sharedMemory: SharedMemoryV2;
    private assets: Map<AssetId, SpawnedAsset> = new Map();
    private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
    private ledger: LedgerTransaction[] = [];

    constructor(config: Partial<AssetSpawnerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.sharedMemory = getSharedMemory('asset_spawner');
        this.initializeSharedMemory();
    }

    /**
     * Initialize shared memory segments
     */
    // Complexity: O(1)
    private initializeSharedMemory(): void {
        this.sharedMemory.createSegment('spawner_state', {
            activeAssets: 0,
            totalSpawned: 0,
            totalTerminated: 0,
            totalRevenue: 0
        });
    }

    /**
     * Analyze market voids and determine if spawning is viable
     * O(1) time complexity
     */
    // Complexity: O(1) — amortized
    public analyzeMarketVoid(marketVoid: MarketVoid): {
        viable: boolean;
        score: number;
        reason: string;
    } {
        // Check capacity
        if (this.assets.size >= this.config.maxAssets) {
            return { viable: false, score: 0, reason: 'Maximum asset capacity reached' };
        }

        // Check demand score
        if (marketVoid.demandScore < this.config.minDemandScore) {
            return { 
                viable: false, 
                score: marketVoid.demandScore, 
                reason: `Demand score ${marketVoid.demandScore} below threshold ${this.config.minDemandScore}` 
            };
        }

        // Check competition
        if (marketVoid.competitionLevel > this.config.maxCompetitionLevel) {
            return { 
                viable: false, 
                score: 0, 
                reason: `Competition level ${marketVoid.competitionLevel} above threshold ${this.config.maxCompetitionLevel}` 
            };
        }

        // Check revenue potential
        if (marketVoid.revenuePotential < this.config.minRevenuePotential) {
            return { 
                viable: false, 
                score: 0, 
                reason: `Revenue potential €${marketVoid.revenuePotential} below minimum €${this.config.minRevenuePotential}` 
            };
        }

        // Calculate viability score
        const score = (
            marketVoid.demandScore * 0.4 +
            (1 - marketVoid.competitionLevel) * 0.3 +
            Math.min(marketVoid.revenuePotential / 1000, 1) * 0.3
        );

        return { viable: true, score, reason: 'Market void meets all criteria' };
    }

    /**
     * Spawn a new Micro-SaaS asset
     * O(1) time complexity for spawning, O(n) for deployment steps
     */
    // Complexity: O(N)
    public async spawnAsset(marketVoid: MarketVoid): Promise<SpawnedAsset | null> {
        const analysis = this.analyzeMarketVoid(marketVoid);
        
        if (!analysis.viable) {
            console.warn(`[AssetSpawner] Cannot spawn: ${analysis.reason}`);
            return null;
        }

        // Generate unique asset ID
        const assetId = this.generateAssetId();
        
        // Determine SaaS type based on features
        const saasType = this.determineSaaSType(marketVoid.features);
        const template = SAAS_TEMPLATES[saasType] || SAAS_TEMPLATES['analytics'];

        // Create configuration
        const config: MicroSaaSConfig = {
            id: assetId,
            name: this.generateAssetName(marketVoid.segment),
            description: `Auto-spawned ${saasType} solution for ${marketVoid.segment} market`,
            targetVoid: marketVoid,
            dbSchema: `saas_${assetId.replace(/-/g, '_')}`,
            apiPrefix: `/api/v1/${assetId}`,
            priceEur: this.calculateOptimalPrice(marketVoid),
            createdAt: Date.now()
        };

        // Create asset instance
        const asset: SpawnedAsset = {
            config,
            state: AssetLifecycleState.SPAWNING,
            neonBranch: `branch-${assetId}`,
            deploymentUrl: null,
            revenueAccumulated: 0,
            subscriberCount: 0,
            healthScore: 1.0,
            lastHealthCheck: Date.now(),
            errorMessage: null
        };

        this.assets.set(assetId, asset);

        // Execute deployment pipeline
        try {
            await this.deployAsset(asset, template);
            asset.state = AssetLifecycleState.ACTIVE;
            asset.deploymentUrl = `https://${assetId}.aeterna.website`;
            
            console.log(`[AssetSpawner] Asset ${assetId} spawned and deployed successfully`);
        } catch (error) {
            asset.state = AssetLifecycleState.ERROR;
            asset.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[AssetSpawner] Failed to deploy asset ${assetId}:`, error);
        }

        // Update shared memory
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.updateSpawnerState();

        return asset;
    }

    /**
     * Deploy asset to infrastructure
     * Includes: Neon DB branch, schema migration, API routes
     */
    // Complexity: O(1)
    private async deployAsset(
        asset: SpawnedAsset,
        template: { features: string[]; schema: string; routes: string[] }
    ): Promise<void> {
        asset.state = AssetLifecycleState.DEPLOYING;

        // Step 1: Create Neon DB branch (simulated)
        console.log(`[AssetSpawner] Creating Neon branch: ${asset.neonBranch}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.simulateDeploymentStep(100);

        // Step 2: Apply schema migration (simulated)
        console.log(`[AssetSpawner] Applying schema to ${asset.config.dbSchema}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.simulateDeploymentStep(200);

        // Step 3: Generate API routes (simulated)
        console.log(`[AssetSpawner] Generating ${template.routes.length} API routes`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.simulateDeploymentStep(150);

        // Step 4: Deploy to edge (simulated)
        console.log(`[AssetSpawner] Deploying to edge network`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.simulateDeploymentStep(300);
    }

    /**
     * Simulate deployment step with delay
     */
    // Complexity: O(1)
    private simulateDeploymentStep(delayMs: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, delayMs));
    }

    /**
     * Determine SaaS type based on required features
     */
    // Complexity: O(N) — linear iteration
    private determineSaaSType(features: string[]): string {
        const keywords: Record<string, string[]> = {
            analytics: ['track', 'analytics', 'metrics', 'dashboard', 'report'],
            crm: ['contact', 'customer', 'deal', 'sales', 'pipeline'],
            automation: ['workflow', 'automate', 'trigger', 'action', 'integration'],
            monitoring: ['monitor', 'uptime', 'alert', 'status', 'health']
        };

        let bestMatch = 'analytics';
        let bestScore = 0;

        for (const [type, typeKeywords] of Object.entries(keywords)) {
            const score = features.filter(f => 
                typeKeywords.some(k => f.toLowerCase().includes(k))
            ).length;
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = type;
            }
        }

        return bestMatch;
    }

    /**
     * Calculate optimal pricing based on market void analysis
     * Uses competitive positioning algorithm
     */
    // Complexity: O(N*M) — nested iteration detected
    private calculateOptimalPrice(marketVoid: MarketVoid): number {
        // Base price from revenue potential (targeting 5% market capture)
        const basePriceEur = marketVoid.revenuePotential * 0.05;
        
        // Adjust for competition (lower price in competitive markets)
        const competitionAdjustment = 1 - (marketVoid.competitionLevel * 0.3);
        
        // Adjust for demand (higher price for high demand)
        const demandAdjustment = 1 + (marketVoid.demandScore - 0.5) * 0.2;
        
        // Calculate final price
        let finalPrice = basePriceEur * competitionAdjustment * demandAdjustment;
        
        // Minimum viable price (before .99 adjustment)
        const minimumPrice = 10.00;
        
        // Ensure minimum viable price and round to .99 pricing
        finalPrice = Math.max(finalPrice, minimumPrice);
        return Math.floor(finalPrice) + 0.99;
    }

    /**
     * Generate asset name from segment
     */
    // Complexity: O(1)
    private generateAssetName(segment: string): string {
        const prefixes = ['Nova', 'Apex', 'Pulse', 'Nexus', 'Flux', 'Vega', 'Orion'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const cleanSegment = segment.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        return `${prefix}${cleanSegment}`;
    }

    /**
     * Generate unique asset ID
     */
    // Complexity: O(1) — hash/map lookup
    private generateAssetId(): AssetId {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Perform health check on all assets
     * O(n) where n is number of active assets
     */
    // Complexity: O(N*M) — nested iteration detected
    public async performHealthChecks(): Promise<void> {
        for (const [id, asset] of this.assets) {
            if (asset.state !== AssetLifecycleState.ACTIVE) {
                continue;
            }

            // Simulate health check metrics
            const metrics = this.simulateHealthMetrics(asset);
            
            // Update health score (weighted average)
            asset.healthScore = (
                metrics.uptime * 0.3 +
                metrics.responseTime * 0.3 +
                metrics.errorRate * 0.2 +
                metrics.revenuePerformance * 0.2
            );
            
            asset.lastHealthCheck = Date.now();

            // Check for termination
            if (asset.healthScore < this.config.terminationThreshold) {
                console.warn(`[AssetSpawner] Asset ${id} health (${asset.healthScore.toFixed(2)}) below threshold. Terminating.`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.terminateAsset(id);
            }
        }
    }

    /**
     * Simulate health metrics for an asset
     */
    // Complexity: O(1)
    private simulateHealthMetrics(asset: SpawnedAsset): {
        uptime: number;
        responseTime: number;
        errorRate: number;
        revenuePerformance: number;
    } {
        // In production, these would come from actual monitoring
        return {
            uptime: 0.95 + Math.random() * 0.05,
            responseTime: 0.8 + Math.random() * 0.2,
            errorRate: 0.9 + Math.random() * 0.1,
            revenuePerformance: asset.subscriberCount > 0 ? 0.7 + Math.random() * 0.3 : 0.5
        };
    }

    /**
     * Terminate an underperforming asset
     * Implements Economic Darwinism
     */
    // Complexity: O(N)
    public async terminateAsset(assetId: AssetId): Promise<boolean> {
        const asset = this.assets.get(assetId);
        
        if (!asset) {
            return false;
        }

        asset.state = AssetLifecycleState.TERMINATING;

        try {
            // Step 1: Disable new signups
            console.log(`[AssetSpawner] Disabling signups for ${assetId}`);
            await this.simulateDeploymentStep(50);

            // Step 2: Notify subscribers (simulated)
            console.log(`[AssetSpawner] Notifying ${asset.subscriberCount} subscribers`);
            await this.simulateDeploymentStep(100);

            // Step 3: Export data (simulated)
            console.log(`[AssetSpawner] Exporting data from ${asset.neonBranch}`);
            await this.simulateDeploymentStep(200);

            // Step 4: Delete Neon branch (simulated)
            console.log(`[AssetSpawner] Deleting Neon branch: ${asset.neonBranch}`);
            await this.simulateDeploymentStep(100);

            asset.state = AssetLifecycleState.TERMINATED;
            this.assets.delete(assetId);

            console.log(`[AssetSpawner] Asset ${assetId} terminated successfully`);
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.updateSpawnerState();
            return true;
        } catch (error) {
            asset.state = AssetLifecycleState.ERROR;
            asset.errorMessage = `Termination failed: ${error instanceof Error ? error.message : 'Unknown'}`;
            return false;
        }
    }

    /**
     * Record revenue transaction
     * Integrates with Wealth Bridge ledger
     */
    // Complexity: O(1) — hash/map lookup
    public recordRevenue(
        assetId: AssetId,
        amount: number,
        type: 'subscription' | 'one_time' | 'refund',
        provider: 'stripe' | 'paypal',
        providerTransactionId: string
    ): boolean {
        const asset = this.assets.get(assetId);
        
        if (!asset) {
            return false;
        }

        const transaction: LedgerTransaction = {
            id: this.generateAssetId(),
            assetId,
            amountEur: type === 'refund' ? -amount : amount,
            type,
            provider,
            providerTransactionId,
            timestamp: Date.now()
        };

        this.ledger.push(transaction);
        asset.revenueAccumulated += transaction.amountEur;

        if (type === 'subscription') {
            asset.subscriberCount++;
        }

        return true;
    }

    /**
     * Get revenue summary for an asset
     * O(n) where n is number of transactions
     */
    // Complexity: O(N) — linear iteration
    public getRevenueSummary(assetId: AssetId): AssetRevenueSummary | null {
        const asset = this.assets.get(assetId);
        
        if (!asset) {
            return null;
        }

        const assetTransactions = this.ledger.filter(t => t.assetId === assetId);
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        
        const last30Days = assetTransactions
            .filter(t => t.timestamp >= thirtyDaysAgo)
            .reduce((sum, t) => sum + t.amountEur, 0);

        const subscriptions = assetTransactions.filter(t => t.type === 'subscription');
        const refunds = assetTransactions.filter(t => t.type === 'refund');
        
        return {
            assetId,
            totalRevenue: asset.revenueAccumulated,
            mrr: asset.subscriberCount * asset.config.priceEur,
            activeSubscribers: asset.subscriberCount,
            churnRate: subscriptions.length > 0 ? refunds.length / subscriptions.length : 0,
            last30DaysRevenue: last30Days
        };
    }

    /**
     * Start health check monitoring
     */
    // Complexity: O(N) — potential recursive descent
    public startHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            return;
        }

        this.healthCheckInterval = setInterval(
            () => this.performHealthChecks(),
            this.config.healthCheckIntervalMs
        );
    }

    /**
     * Stop health check monitoring
     */
    // Complexity: O(1)
    public stopHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            // Complexity: O(1)
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    /**
     * Update spawner state in shared memory
     */
    // Complexity: O(N) — linear iteration
    private async updateSpawnerState(): Promise<void> {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const acquired = await this.sharedMemory.acquireLock('spawner_state');
        
        if (acquired) {
            const totalRevenue = Array.from(this.assets.values())
                .reduce((sum, a) => sum + a.revenueAccumulated, 0);

            this.sharedMemory.write('spawner_state', {
                activeAssets: this.assets.size,
                totalSpawned: this.ledger.filter(t => t.type === 'subscription').length,
                totalTerminated: 0, // Would track in production
                totalRevenue
            });
            
            this.sharedMemory.releaseLock('spawner_state');
        }
    }

    /**
     * Get all active assets
     */
    // Complexity: O(N) — linear iteration
    public getActiveAssets(): SpawnedAsset[] {
        return Array.from(this.assets.values())
            .filter(a => a.state === AssetLifecycleState.ACTIVE);
    }

    /**
     * Get asset by ID
     */
    // Complexity: O(1) — hash/map lookup
    public getAsset(assetId: AssetId): SpawnedAsset | undefined {
        return this.assets.get(assetId);
    }

    /**
     * Get spawner statistics
     */
    // Complexity: O(N) — linear iteration
    public getStats(): {
        totalAssets: number;
        activeAssets: number;
        totalRevenue: number;
        averageHealthScore: number;
        isMonitoring: boolean;
    } {
        const assets = Array.from(this.assets.values());
        const activeAssets = assets.filter(a => a.state === AssetLifecycleState.ACTIVE);
        
        return {
            totalAssets: assets.length,
            activeAssets: activeAssets.length,
            totalRevenue: assets.reduce((sum, a) => sum + a.revenueAccumulated, 0),
            averageHealthScore: activeAssets.length > 0
                ? activeAssets.reduce((sum, a) => sum + a.healthScore, 0) / activeAssets.length
                : 0,
            isMonitoring: this.healthCheckInterval !== null
        };
    }

    /**
     * Cleanup resources
     */
    // Complexity: O(1)
    public destroy(): void {
        this.stopHealthMonitoring();
    }
}

/**
 * Singleton factory
 */
let globalSpawner: AssetSpawner | null = null;

export function getAssetSpawner(config?: Partial<AssetSpawnerConfig>): AssetSpawner {
    if (!globalSpawner) {
        globalSpawner = new AssetSpawner(config);
    }
    return globalSpawner;
}

export function resetAssetSpawner(): void {
    if (globalSpawner) {
        globalSpawner.destroy();
        globalSpawner = null;
    }
}
