import type { VulnerabilitySnapshot, VulnerabilitySeverity, FuzzIteration } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
/**
 * Vulnerability Snapshot Module for CyberCody
 * Captures, classifies, and documents security findings with PoC generation
 */
export declare class VulnerabilitySnapshotModule {
    private snapshots;
    /**
     * Create a snapshot from a fuzzing iteration with anomaly
     */
    createFromFuzzIteration(iteration: FuzzIteration): VulnerabilitySnapshot;
    /**
     * Get vulnerability type name
     */
    private getVulnerabilityType;
    /**
     * Classify vulnerability based on category and anomaly
     */
    private classify;
    /**
     * Calculate severity based on anomaly and classification
     */
    private calculateSeverity;
    /**
     * Generate Proof of Concept code
     */
    private generatePoC;
    /**
     * Get impact description for vulnerability type
     */
    private getImpactDescription;
    /**
     * Get remediation info for vulnerability type
     */
    private getRemediation;
    /**
     * Get HTTP status text
     */
    private getStatusText;
    /**
     * Get all captured snapshots
     */
    getSnapshots(): VulnerabilitySnapshot[];
    /**
     * Get snapshot by ID
     */
    getSnapshot(id: string): VulnerabilitySnapshot | undefined;
    /**
     * Get snapshots by severity
     */
    getSnapshotsBySeverity(severity: VulnerabilitySeverity): VulnerabilitySnapshot[];
    /**
     * Export snapshots to JSON
     */
    exportToJSON(): string;
    /**
     * Generate summary report
     */
    generateSummary(): {
        total: number;
        bySeverity: Record<VulnerabilitySeverity, number>;
        byType: Record<string, number>;
    };
}
export default VulnerabilitySnapshotModule;
//# sourceMappingURL=snapshot.d.ts.map