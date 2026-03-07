import type { FuzzingConfig, FuzzingResult, PayloadCategory } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
export interface FuzzEngineConfig {
    defaultIterations?: number;
    defaultWorkers?: number;
    defaultDelay?: number;
    defaultTimeout?: number;
}
/**
 * Fuzzing Engine for CyberCody
 * Uses Worker Threads for parallel fuzzing with intelligent anomaly detection
 */
export declare class FuzzingEngine {
    constructor(_config?: FuzzEngineConfig);
    /**
     * Run fuzzing campaign against target
     */
    fuzz(config: FuzzingConfig): Promise<FuzzingResult>;
    /**
     * Get baseline response for comparison
     */
    private getBaseline;
    /**
     * Build complete payload list from categories
     */
    private buildPayloadList;
    /**
     * Run a worker thread
     */
    private runWorker;
    /**
     * Split array into chunks
     */
    private chunkArray;
    /**
     * Calculate fuzzing statistics
     */
    private calculateStatistics;
    /**
     * Get available payload categories
     */
    getPayloadCategories(): PayloadCategory[];
    /**
     * Get payload count for a category
     */
    getPayloadCount(category: PayloadCategory): number;
}
export default FuzzingEngine;
//# sourceMappingURL=fuzzing.d.ts.map