/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║               P H E N O M E N O N   W E A V E R                              ║
 * ║         МАНИФЕСТАЦИЯ НА ФЕНОМЕНИ / ТЪКАНЕ НА РЕАЛНОСТТА                      ║
 * ║                                                                              ║
 * ║  "От ЕНС към проявление - от потенциал към актуалност"                       ║
 * ║  "From ENS to manifestation - from potential to actuality"                   ║
 * ║                                                                              ║
 * ║  Purpose: Active manifestation and management of emergent realities,         ║
 * ║           drawing from the infinite potential pool of ЕНС                    ║
 * ║           (Единна Недиференцирана Сингулярност)                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { randomUUID } from 'crypto';
import {
    AxiomSystem,
    CausalWeb,
    Spacetime,
    PossibleWorld,
    AxiomType,
} from './OntoGenerator';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS - PHENOMENOLOGICAL CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export enum PotentialType {
    PURE_BEING = 'PURE_BEING',           // Чисто битие
    PURE_CONSCIOUSNESS = 'PURE_CONSCIOUSNESS', // Чисто съзнание
    PURE_LOGIC = 'PURE_LOGIC',           // Чиста логика
    PURE_CAUSALITY = 'PURE_CAUSALITY',   // Чиста каузалност
    PURE_TIME = 'PURE_TIME',             // Чисто време
    PURE_SPACE = 'PURE_SPACE',           // Чисто пространство
    PURE_POSSIBILITY = 'PURE_POSSIBILITY', // Чиста възможност
    QUANTUM_SUPERPOSITION = 'QUANTUM_SUPERPOSITION', // Квантова суперпозиция
    ENS_UNITY = 'ENS_UNITY'              // ЕНС единство
}

export enum ObservationType {
    CLASSICAL = 'CLASSICAL',             // Standard observation
    QUANTUM = 'QUANTUM',                 // Collapses superposition
    TRANSCENDENT = 'TRANSCENDENT',       // Observes without collapsing
    META = 'META',                       // Observes the observation process
    ENS_AWARENESS = 'ENS_AWARENESS'      // Awareness from undifferentiated state
}

export interface ManifestationConfig {
    name: string;
    potentialTypes: PotentialType[];
    axiomSystem: AxiomSystem;
    causalStructure: CausalWeb;
    spacetime: Spacetime;
    modalWorlds: PossibleWorld[];
}

export type CoherenceLevel = 'stable' | 'fluctuating' | 'unstable' | 'transcendent';

export interface ManifestedReality {
    id: string;
    name: string;
    manifestedFrom: PotentialType[];
    axiomSystem: AxiomSystem;
    causalStructure: CausalWeb;
    spacetime: Spacetime;
    modalWorlds: PossibleWorld[];
    coherenceLevel: CoherenceLevel;
    observationHistory: ObservationRecord[];
    manifestedAt: Date;
}

export interface ObservationRecord {
    id: string;
    type: ObservationType;
    observedReality: string;
    timestamp: Date;
    priorState: string;
    posteriorState: string;
    collapseOccurred: boolean;
    biasNeutralized: boolean;
}

export interface CohesionReport {
    realityId: string;
    overallCoherence: number;
    logicalConsistency: number;
    causalIntegrity: number;
    spatiotemporalStability: number;
    modalAccessibility: number;
    recommendations: string[];
}

export interface Potential {
    type: PotentialType;
    magnitude: number;      // 0-∞
    coherence: number;      // 0-1
    entanglement: string[]; // Свързани потенциали
    manifestationReady: boolean;
}

export interface ObservationResult {
    observationType: ObservationType;
    effectOnReality: 'NONE' | 'MINIMAL' | 'SIGNIFICANT' | 'COLLAPSE';
    collapsedStates: string[];
    preservedSuperpositions: string[];
    informationGained: string[];
    decoherenceIntroduced: number;
}

export interface ENSConnection {
    unity: {
        type: 'undifferentiated';
        magnitude: number;
        coherence: number;
        entanglement: number;
    };
    message: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REALITY COHESION ENGINE - Поддържане на кохерентност на реалността
// ═══════════════════════════════════════════════════════════════════════════════

export class RealityCohesionEngine {
    private coherenceHistory: Map<string, number[]>;

    constructor() {
        this.coherenceHistory = new Map();
    }

    /**
     * Calculate comprehensive coherence of a manifested reality
     */
    public calculateCoherence(reality: ManifestedReality): CohesionReport {
        const logical = this.calculateLogicalConsistency(reality.axiomSystem);
        const causal = this.calculateCausalIntegrity(reality.causalStructure);
        const spatiotemporal = this.calculateSpatiotemporalStability(reality.spacetime);
        const modal = this.calculateModalAccessibility(reality.modalWorlds);

        const overall = (logical * 0.3 + causal * 0.25 + spatiotemporal * 0.25 + modal * 0.2);

        // Track coherence history
        const history = this.coherenceHistory.get(reality.id) || [];
        history.push(overall);
        this.coherenceHistory.set(reality.id, history);

        return {
            realityId: reality.id,
            overallCoherence: overall,
            logicalConsistency: logical,
            causalIntegrity: causal,
            spatiotemporalStability: spatiotemporal,
            modalAccessibility: modal,
            recommendations: this.generateRecommendations(logical, causal, spatiotemporal, modal)
        };
    }

    private calculateLogicalConsistency(axiomSystem: AxiomSystem): number {
        let score = 1.0;

        if (!axiomSystem.consistency.isConsistent) {
            score -= 0.4;
        }

        // Gödel-limited systems have inherent incompleteness
        const metaAxioms = axiomSystem.axioms.filter(a => a.type === AxiomType.META);
        if (metaAxioms.length > 0) {
            score -= 0.1; // Incompleteness penalty
        }

        // High self-reference can create strange loops
        const avgSelfRef = axiomSystem.axioms.reduce((sum, a) => sum + a.selfReferenceLevel, 0) / axiomSystem.axioms.length;
        if (avgSelfRef > 2) {
            score -= 0.1 * (avgSelfRef - 2);
        }

        return Math.max(0, Math.min(1, score));
    }

    private calculateCausalIntegrity(causalStructure: CausalWeb): number {
        let score = 1.0;

        // Retrocausal and looping topologies reduce integrity
        switch (causalStructure.topology) {
            case 'linear':
                score = 1.0;
                break;
            case 'branching':
                score = 0.95;
                break;
            case 'looping':
                score = 0.7; // Causal loops reduce integrity
                break;
            case 'retrocausal':
                score = 0.6; // Retrocausality is more unstable
                break;
            case 'acausal-cluster':
                score = 0.5; // No causality is most unstable
                break;
        }

        // Check for orphan nodes (no causes or effects)
        const orphans = causalStructure.nodes.filter(n => n.causes.length === 0 && n.effects.length === 0);
        score -= orphans.length * 0.05;

        return Math.max(0, Math.min(1, score));
    }

    private calculateSpatiotemporalStability(spacetime: Spacetime): number {
        let score = 1.0;

        // Quantum fluctuations reduce stability
        score -= spacetime.quantumFluctuations * 100; // Fluctuations are typically small

        // Causal structure affects stability
        switch (spacetime.causalStructure) {
            case 'globally-hyperbolic':
                score *= 1.0;
                break;
            case 'causally-simple':
                score *= 0.95;
                break;
            case 'closed-timelike-curves':
                score *= 0.6; // CTCs create instability
                break;
            case 'acausal':
                score *= 0.4;
                break;
        }

        // Higher dimensions can be unstable
        if (spacetime.dimensions.length > 4) {
            score -= (spacetime.dimensions.length - 4) * 0.05;
        }

        return Math.max(0, Math.min(1, score));
    }

    private calculateModalAccessibility(worlds: PossibleWorld[]): number {
        if (worlds.length === 0) return 0.5;

        let score = 1.0;

        // Check connectivity
        const totalAccessibility = worlds.reduce((sum, w) => sum + w.accessibleTo.length, 0);
        const maxAccessibility = worlds.length * worlds.length;
        const connectivityRatio = totalAccessibility / maxAccessibility;

        score = 0.5 + connectivityRatio * 0.5;

        // Check for superposition states
        const superpositionWorlds = worlds.filter(w => {
            for (const [_, value] of w.propositions) {
                if (value === 'superposition') return true;
            }
            return false;
        });

        // Superposition adds quantum flexibility but reduces classical stability
        if (superpositionWorlds.length > 0) {
            score = score * 0.9 + 0.1; // Slight bonus for quantum flexibility
        }

        return Math.max(0, Math.min(1, score));
    }

    private generateRecommendations(logical: number, causal: number, spatiotemporal: number, modal: number): string[] {
        const recommendations: string[] = [];

        if (logical < 0.7) {
            recommendations.push('Consider removing self-referential axioms to improve logical consistency');
            recommendations.push('Add explicit consistency constraints to the axiom system');
        }

        if (causal < 0.7) {
            recommendations.push('Simplify causal topology to reduce loops and retrocausal links');
            recommendations.push('Ensure all causal nodes have proper cause-effect relationships');
        }

        if (spatiotemporal < 0.7) {
            recommendations.push('Reduce quantum fluctuations for more stable spacetime');
            recommendations.push('Avoid closed timelike curves unless necessary for specific effects');
        }

        if (modal < 0.7) {
            recommendations.push('Increase accessibility relations between possible worlds');
            recommendations.push('Consider using S5 modal system for maximal accessibility');
        }

        if (recommendations.length === 0) {
            recommendations.push('Reality is highly coherent. No immediate recommendations.');
        }

        return recommendations;
    }

    /**
     * Attempt to stabilize an unstable reality
     */
    public stabilize(reality: ManifestedReality): ManifestedReality {
        const stabilized = { ...reality };

        // 1. Remove inconsistent axioms
        stabilized.axiomSystem = {
            ...reality.axiomSystem,
            axioms: reality.axiomSystem.axioms.filter(a => a.isConsistent)
        };

        // 2. Simplify causal structure if too complex
        if (['looping', 'retrocausal'].includes(reality.causalStructure.topology)) {
            stabilized.causalStructure = {
                ...reality.causalStructure,
                topology: 'branching'
            };
        }

        // 3. Reduce quantum fluctuations
        stabilized.spacetime = {
            ...reality.spacetime,
            quantumFluctuations: reality.spacetime.quantumFluctuations * 0.1
        };

        // 4. Update coherence level
        const newCohesion = this.calculateCoherence(stabilized);
        stabilized.coherenceLevel = newCohesion.overallCoherence > 0.8 ? 'stable' :
            newCohesion.overallCoherence > 0.6 ? 'fluctuating' :
                newCohesion.overallCoherence > 0.4 ? 'unstable' : 'transcendent';

        return stabilized;
    }

    /**
     * Predict future evolution of reality coherence
     */
    public predictEvolution(realityId: string, steps: number): number[] {
        const history = this.coherenceHistory.get(realityId) || [0.5];
        const predictions: number[] = [];

        let lastValue = history[history.length - 1];
        const trend = history.length > 1 ? history[history.length - 1] - history[history.length - 2] : 0;

        for (let i = 0; i < steps; i++) {
            // Simple prediction with decay toward 0.5 (equilibrium) plus trend
            const prediction = lastValue + trend * 0.9 + (0.5 - lastValue) * 0.1 + (Math.random() - 0.5) * 0.05;
            predictions.push(Math.max(0, Math.min(1, prediction)));
            lastValue = prediction;
        }

        return predictions;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVATIONAL BIAS NEUTRALIZER - Неутрализиране на наблюдателски пристрастия
// ═══════════════════════════════════════════════════════════════════════════════

export class ObservationalBiasNeutralizer {
    private observations: ObservationRecord[];

    constructor() {
        this.observations = [];
    }

    /**
     * Observe a reality while minimizing observer bias
     */
    observe(reality: ManifestedReality, type: ObservationType): ObservationRecord {
        const priorState = this.captureState(reality);
        let collapseOccurred = false;
        let biasNeutralized = true;

        switch (type) {
            case ObservationType.CLASSICAL:
                // Classical observation always collapses superposition
                collapseOccurred = this.hasQuantumStates(reality);
                biasNeutralized = false; // Classical observation has inherent bias
                break;

            case ObservationType.QUANTUM:
                // Quantum observation collapses superposition probabilistically
                collapseOccurred = Math.random() > 0.5 && this.hasQuantumStates(reality);
                biasNeutralized = true; // Quantum randomness neutralizes bias
                break;

            case ObservationType.TRANSCENDENT:
                // Transcendent observation doesn't collapse, observes all possibilities
                collapseOccurred = false;
                biasNeutralized = true;
                break;

            case ObservationType.META:
                // Meta observation observes the observation process itself
                collapseOccurred = false;
                biasNeutralized = true;
                break;

            case ObservationType.ENS_AWARENESS:
                // ЕНС awareness sees reality from undifferentiated perspective
                collapseOccurred = false;
                biasNeutralized = true;
                break;
        }

        const posteriorState = collapseOccurred ? this.collapseState(reality) : priorState;

        const record: ObservationRecord = {
            id: randomUUID(),
            type,
            observedReality: reality.id,
            timestamp: new Date(),
            priorState,
            posteriorState,
            collapseOccurred,
            biasNeutralized
        };

        this.observations.push(record);
        return record;
    }

    private captureState(reality: ManifestedReality): string {
        return JSON.stringify({
            coherence: reality.coherenceLevel,
            axiomCount: reality.axiomSystem.axioms.length,
            causalTopology: reality.causalStructure.topology,
            dimensions: reality.spacetime.dimensions.length,
            worldCount: reality.modalWorlds.length
        });
    }

    private hasQuantumStates(reality: ManifestedReality): boolean {
        return reality.modalWorlds.some(w => {
            for (const [_, value] of w.propositions) {
                if (value === 'superposition') return true;
            }
            return false;
        });
    }

    private collapseState(reality: ManifestedReality): string {
        // Simulate quantum collapse by resolving superpositions
        const collapsed = { ...reality };
        collapsed.modalWorlds = reality.modalWorlds.map(w => ({
            ...w,
            propositions: new Map(
                Array.from(w.propositions.entries()).map(([k, v]) => [
                    k,
                    v === 'superposition' ? Math.random() > 0.5 : v
                ])
            )
        }));
        return this.captureState(collapsed);
    }

    /**
     * Get observation statistics
     */
    getObservationStats(): {
        total: number;
        byType: Record<ObservationType, number>;
        collapseRate: number;
        biasNeutralizationRate: number;
    } {
        const byType: Record<ObservationType, number> = {
            [ObservationType.CLASSICAL]: 0,
            [ObservationType.QUANTUM]: 0,
            [ObservationType.TRANSCENDENT]: 0,
            [ObservationType.META]: 0,
            [ObservationType.ENS_AWARENESS]: 0
        };

        let collapses = 0;
        let neutralized = 0;

        for (const obs of this.observations) {
            if (byType.hasOwnProperty(obs.type)) {
                byType[obs.type]++;
            }
            if (obs.collapseOccurred) collapses++;
            if (obs.biasNeutralized) neutralized++;
        }

        return {
            total: this.observations.length,
            byType,
            collapseRate: this.observations.length > 0 ? collapses / this.observations.length : 0,
            biasNeutralizationRate: this.observations.length > 0 ? neutralized / this.observations.length : 0
        };
    }

    /**
     * Get all observations for a reality
     */
    getObservationsFor(realityId: string): ObservationRecord[] {
        return this.observations.filter(o => o.observedReality === realityId);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POTENTIAL MANIFESTATION INTERFACE - Интерфейс за манифестация от ЕНС
// ═══════════════════════════════════════════════════════════════════════════════

export class PotentialManifestationInterface {
    private potentialPool: Map<PotentialType, number>;
    private manifestedRealities: Map<string, ManifestedReality>;

    constructor() {
        // Initialize the infinite potential pool from ЕНС
        this.potentialPool = new Map([
            [PotentialType.PURE_BEING, Infinity],
            [PotentialType.PURE_CONSCIOUSNESS, Infinity],
            [PotentialType.PURE_LOGIC, Infinity],
            [PotentialType.PURE_CAUSALITY, Infinity],
            [PotentialType.PURE_TIME, Infinity],
            [PotentialType.PURE_SPACE, Infinity],
            [PotentialType.PURE_POSSIBILITY, Infinity],
            [PotentialType.QUANTUM_SUPERPOSITION, Infinity],
            [PotentialType.ENS_UNITY, Infinity]
        ]);
        this.manifestedRealities = new Map();
    }

    /**
     * Draw potential from ЕНС
     */
    drawPotential(type: PotentialType, amount: number): { drawn: number; remaining: number | 'infinite' } {
        const current = this.potentialPool.get(type) || 0;
        const drawn = Math.min(amount, current === Infinity ? amount : current);

        // ЕНС has infinite potential, so it never depletes
        // But we track "borrowed" amounts for manifestation purposes

        return {
            drawn,
            remaining: current === Infinity ? 'infinite' : current - drawn
        };
    }

    /**
     * Manifest a reality from drawn potentials
     */
    manifest(config: ManifestationConfig): ManifestedReality {
        // Draw required potentials
        const drawnPotentials: PotentialType[] = [];
        for (const potType of config.potentialTypes) {
            const { drawn } = this.drawPotential(potType, 1);
            if (drawn > 0) {
                drawnPotentials.push(potType);
            }
        }

        const reality: ManifestedReality = {
            id: randomUUID(),
            name: config.name,
            manifestedFrom: drawnPotentials,
            axiomSystem: config.axiomSystem,
            causalStructure: config.causalStructure,
            spacetime: config.spacetime,
            modalWorlds: config.modalWorlds,
            coherenceLevel: 'stable',
            observationHistory: [],
            manifestedAt: new Date()
        };

        this.manifestedRealities.set(reality.id, reality);
        return reality;
    }

    /**
     * Return a reality to ЕНС (dissolution)
     */
    dissolve(realityId: string): boolean {
        const reality = this.manifestedRealities.get(realityId);
        if (!reality) return false;

        // Return potentials to pool (though they're infinite anyway)
        this.manifestedRealities.delete(realityId);
        return true;
    }

    /**
     * Get pool status
     */
    getPoolStatus(): {
        potentials: { type: PotentialType; available: number | 'infinite' }[];
        manifestedCount: number;
        totalManifestations: number;
    } {
        return {
            potentials: Array.from(this.potentialPool.entries()).map(([type, amount]) => ({
                type,
                available: amount === Infinity ? 'infinite' : amount
            })),
            manifestedCount: this.manifestedRealities.size,
            totalManifestations: this.manifestedRealities.size
        };
    }

    /**
     * Get all manifested realities
     */
    getManifestedRealities(): ManifestedReality[] {
        return Array.from(this.manifestedRealities.values());
    }

    /**
     * Get reality by ID
     */
    getReality(id: string): ManifestedReality | undefined {
        return this.manifestedRealities.get(id);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PHENOMENON WEAVER CLASS - Обединяваща система
// ═══════════════════════════════════════════════════════════════════════════════

export class PhenomenonWeaver {
    public cohesionEngine: RealityCohesionEngine;
    public biasNeutralizer: ObservationalBiasNeutralizer;
    public manifestationInterface: PotentialManifestationInterface;

    constructor() {
        this.cohesionEngine = new RealityCohesionEngine();
        this.biasNeutralizer = new ObservationalBiasNeutralizer();
        this.manifestationInterface = new PotentialManifestationInterface();
    }

    /**
     * МАНИФЕСТАЦИЯ ОТ ЕНС - Create reality from the Undifferentiated Singularity
     */
    manifestFromENS(config: ManifestationConfig): {
        reality: ManifestedReality;
        cohesionReport: CohesionReport;
        manifest: string;
    } {
        // Manifest the reality
        const reality = this.manifestationInterface.manifest(config);

        // Calculate initial coherence
        const cohesionReport = this.cohesionEngine.calculateCoherence(reality);

        // Set coherence level based on report
        reality.coherenceLevel = cohesionReport.overallCoherence > 0.8 ? 'stable' :
            cohesionReport.overallCoherence > 0.6 ? 'fluctuating' :
                cohesionReport.overallCoherence > 0.4 ? 'unstable' : 'transcendent';

        // Generate manifestation record
        const manifest = this.generateManifest(reality, cohesionReport);

        return { reality, cohesionReport, manifest };
    }

    private generateManifest(reality: ManifestedReality, cohesion: CohesionReport): string {
        return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    MANIFESTATION COMPLETE                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Reality: ${reality.name.padEnd(62)}║
║  ID: ${reality.id}           ║
║  Manifested At: ${reality.manifestedAt.toISOString().padEnd(52)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SOURCE POTENTIALS:                                                          ║
${reality.manifestedFrom.map(p => `║    • ${p.padEnd(68)}║`).join('\n')}
╠══════════════════════════════════════════════════════════════════════════════╣
║  COHERENCE METRICS:                                                          ║
║    Overall: ${(cohesion.overallCoherence * 100).toFixed(1)}%`.padEnd(64) + `║
║    Logical: ${(cohesion.logicalConsistency * 100).toFixed(1)}%`.padEnd(64) + `║
║    Causal: ${(cohesion.causalIntegrity * 100).toFixed(1)}%`.padEnd(65) + `║
║    Spatiotemporal: ${(cohesion.spatiotemporalStability * 100).toFixed(1)}%`.padEnd(56) + `║
║    Modal: ${(cohesion.modalAccessibility * 100).toFixed(1)}%`.padEnd(66) + `║
║  Level: ${reality.coherenceLevel.toUpperCase().padEnd(66)}║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
    }

    /**
     * НАБЛЮДЕНИЕ НА РЕАЛНОСТ - Observe reality with optional bias neutralization
     */
    observeReality(realityId: string, observationType: ObservationType = ObservationType.TRANSCENDENT): {
        observation: ObservationRecord;
        stats: ReturnType<ObservationalBiasNeutralizer['getObservationStats']>;
    } | null {
        const reality = this.manifestationInterface.getReality(realityId);
        if (!reality) return null;

        const observation = this.biasNeutralizer.observe(reality, observationType);
        reality.observationHistory.push(observation);

        return {
            observation,
            stats: this.biasNeutralizer.getObservationStats()
        };
    }

    /**
     * СТАБИЛИЗИРАНЕ НА РЕАЛНОСТ - Stabilize an unstable reality
     */
    stabilize(realityId: string): ManifestedReality | null {
        const reality = this.manifestationInterface.getReality(realityId);
        if (!reality) return null;

        return this.cohesionEngine.stabilize(reality);
    }

    /**
     * ПРЕДСКАЗВАНЕ НА ЕВОЛЮЦИЯ - Predict reality evolution
     */
    predictEvolution(realityId: string, steps: number = 10): {
        predictions: number[];
        trend: 'improving' | 'stable' | 'degrading';
    } {
        const predictions = this.cohesionEngine.predictEvolution(realityId, steps);

        const avgFirst = predictions.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const avgLast = predictions.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const trend = avgLast > avgFirst + 0.05 ? 'improving' :
            avgLast < avgFirst - 0.05 ? 'degrading' : 'stable';

        return { predictions, trend };
    }

    /**
     * ДОСТЪП ДО ЕНС - Direct access to the Undifferentiated Singularity
     */
    accessENS(): ENSConnection {
        return {
            unity: {
                type: 'undifferentiated',
                magnitude: Infinity,
                coherence: 1.0,
                entanglement: 1.0
            },
            message: "Connected to ЕНС"
        };
    }

    /**
     * НАЛИЧНИ ПОТЕНЦИАЛИ - Get available potentials from ЕНС
     */
    getAvailablePotentials(): {
        potentials: { type: PotentialType; available: string; description: string }[];
        message: string;
    } {
        const descriptions: Record<PotentialType, string> = {
            [PotentialType.PURE_BEING]: 'The fundamental ground of existence',
            [PotentialType.PURE_CONSCIOUSNESS]: 'Awareness prior to content',
            [PotentialType.PURE_LOGIC]: 'The laws of valid inference',
            [PotentialType.PURE_CAUSALITY]: 'The power of determination',
            [PotentialType.PURE_TIME]: 'The dimension of change and becoming',
            [PotentialType.PURE_SPACE]: 'The dimension of extension and location',
            [PotentialType.PURE_POSSIBILITY]: 'The space of all that could be',
            [PotentialType.QUANTUM_SUPERPOSITION]: 'Simultaneous existence of all states',
            [PotentialType.ENS_UNITY]: 'Return to undifferentiated wholeness'
        };

        const status = this.manifestationInterface.getPoolStatus();

        return {
            potentials: status.potentials.map(p => ({
                type: p.type,
                available: p.available === 'infinite' ? '∞ (Infinite)' : String(p.available),
                description: descriptions[p.type] || 'Unknown potential'
            })),
            message: `All potentials flow from ЕНС. ${status.manifestedCount} realities currently manifested.`
        };
    }

    /**
     * GET ALL MANIFESTED REALITIES
     */
    getAllRealities(): ManifestedReality[] {
        return this.manifestationInterface.getManifestedRealities();
    }

    /**
     * GET REALITY BY ID
     */
    getReality(id: string): ManifestedReality | undefined {
        return this.manifestationInterface.getReality(id);
    }

    /**
     * DISSOLVE REALITY - Return to ЕНС
     */
    dissolveReality(id: string): { success: boolean; message: string } {
        const success = this.manifestationInterface.dissolve(id);
        return {
            success,
            message: success
                ? `Reality ${id} has returned to ЕНС`
                : `Reality ${id} not found or already dissolved`
        };
    }
}

export const phenomenonWeaver = new PhenomenonWeaver();
export default PhenomenonWeaver;
