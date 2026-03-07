"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           QANTUM PHENOMENON WEAVER - ОНТОЛОГИЧНА КОВАЧНИЦА                   ║
 * ║                    "Реалността е проявен потенциал"                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Активно проявление и управление на емергентни реалности                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.phenomenonWeaver = exports.PhenomenonWeaver = exports.PotentialManifestationInterface = exports.ObservationalBiasNeutralizer = exports.RealityCohesionEngine = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// REALITY COHESION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class RealityCohesionEngine {
    coherenceThresholds = {
        ABSOLUTE: 1.0,
        HIGH: 0.8,
        MODERATE: 0.5,
        LOW: 0.2,
        CRITICAL: 0.1,
        COLLAPSED: 0
    };
    /**
     * Изчислява общата кохерентност на реалност
     */
    calculateCoherence(reality) {
        const axiomConsistency = this.checkAxiomConsistency(reality.sourceAxioms);
        const causalIntegrity = this.checkCausalIntegrity(reality.causalStructure);
        const spatiotemporalStability = this.checkSpatiotemporalStability(reality.spacetime);
        const modalAccessibility = this.checkModalAccessibility(reality.modalWorlds);
        const overallCoherence = (axiomConsistency * 0.3 +
            causalIntegrity * 0.3 +
            spatiotemporalStability * 0.25 +
            modalAccessibility * 0.15);
        const warnings = [];
        const recommendations = [];
        if (axiomConsistency < 0.8) {
            warnings.push('Axiom consistency is low - potential logical contradictions');
            recommendations.push('Review and remove inconsistent axioms');
        }
        if (causalIntegrity < 0.7) {
            warnings.push('Causal structure has integrity issues');
            recommendations.push('Check for causal loops and orphaned nodes');
        }
        if (spatiotemporalStability < 0.6) {
            warnings.push('Spacetime configuration is unstable');
            recommendations.push('Reduce curvature or add stabilizing dimensions');
        }
        if (modalAccessibility < 0.5) {
            warnings.push('Modal worlds are poorly connected');
            recommendations.push('Establish more accessibility relations');
        }
        return {
            overallCoherence,
            axiomConsistency,
            causalIntegrity,
            spatiotemporalStability,
            modalAccessibility,
            warnings,
            recommendations
        };
    }
    /**
     * Класифицира нивото на кохерентност
     */
    classifyCoherence(score) {
        if (score >= this.coherenceThresholds.ABSOLUTE)
            return 'ABSOLUTE';
        if (score >= this.coherenceThresholds.HIGH)
            return 'HIGH';
        if (score >= this.coherenceThresholds.MODERATE)
            return 'MODERATE';
        if (score >= this.coherenceThresholds.LOW)
            return 'LOW';
        if (score >= this.coherenceThresholds.CRITICAL)
            return 'CRITICAL';
        return 'COLLAPSED';
    }
    /**
     * Стабилизира нестабилна реалност
     */
    stabilizeReality(reality) {
        const modifications = [];
        let stabilized = false;
        // 1. Премахваме противоречиви аксиоми
        const inconsistentAxioms = reality.sourceAxioms.filter(a => !a.isConsistent);
        if (inconsistentAxioms.length > 0) {
            reality.sourceAxioms = reality.sourceAxioms.filter(a => a.isConsistent);
            modifications.push(`Removed ${inconsistentAxioms.length} inconsistent axioms`);
            stabilized = true;
        }
        // 2. Поправяме причинни цикли
        const cycles = this.findCausalCycles(reality.causalStructure);
        if (cycles.length > 0) {
            this.breakCausalCycles(reality.causalStructure, cycles);
            modifications.push(`Broke ${cycles.length} causal cycles`);
            stabilized = true;
        }
        // 3. Стабилизираме пространство-времето
        if (this.hasUnstableSingularities(reality.spacetime)) {
            this.stabilizeSingularities(reality.spacetime);
            modifications.push('Stabilized spacetime singularities');
            stabilized = true;
        }
        // 4. Подобряваме модална достъпност
        if (this.hasIsolatedWorlds(reality.modalWorlds)) {
            this.connectIsolatedWorlds(reality.modalWorlds);
            modifications.push('Connected isolated modal worlds');
            stabilized = true;
        }
        const newReport = this.calculateCoherence(reality);
        return {
            success: stabilized && newReport.overallCoherence > reality.coherenceScore,
            modifications,
            newCoherence: newReport.overallCoherence
        };
    }
    /**
     * Предсказва бъдеща кохерентност
     */
    predictCoherenceEvolution(reality, timeSteps) {
        const predictions = [];
        let currentCoherence = reality.coherenceScore;
        for (let t = 1; t <= timeSteps; t++) {
            // Ентропията естествено увеличава декохерентността
            const entropyDecay = 0.01 * Math.random();
            currentCoherence = Math.max(0, currentCoherence - entropyDecay);
            let event = 'Normal evolution';
            // Случайни събития
            if (Math.random() < 0.1) {
                if (Math.random() < 0.5) {
                    currentCoherence -= 0.05;
                    event = 'Quantum decoherence event';
                }
                else {
                    currentCoherence += 0.02;
                    event = 'Coherence reinforcement';
                }
            }
            // Критични прагове
            if (currentCoherence < 0.2 && Math.random() < 0.3) {
                event = 'WARNING: Approaching collapse threshold';
            }
            predictions.push({ time: t, coherence: currentCoherence, event });
        }
        return predictions;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ПОМОЩНИ МЕТОДИ ЗА КОХЕРЕНТНОСТ
    // ═══════════════════════════════════════════════════════════════════════════
    checkAxiomConsistency(axioms) {
        if (axioms.length === 0)
            return 1;
        const consistent = axioms.filter(a => a.isConsistent).length;
        return consistent / axioms.length;
    }
    checkCausalIntegrity(web) {
        if (web.links.length === 0)
            return 1;
        let integrity = 1;
        // Проверка за цикли
        const cycles = this.findCausalCycles(web);
        integrity -= cycles.length * 0.1;
        // Проверка за висяши възли
        const orphans = this.findOrphanNodes(web);
        integrity -= orphans.length * 0.05;
        // Проверка за ретрокаузалност (намалява интегритета)
        const retrocausal = web.links.filter(l => l.type === 'RETROCAUSAL').length;
        integrity -= retrocausal * 0.05;
        return Math.max(0, Math.min(1, integrity));
    }
    checkSpatiotemporalStability(spacetime) {
        let stability = 1;
        // Сингуларности намаляват стабилността
        stability -= spacetime.singularities.length * 0.1;
        // Висока кривина е нестабилна
        for (const dim of spacetime.dimensions) {
            if (Math.abs(dim.curvature) > 0.5) {
                stability -= 0.1;
            }
        }
        // Много измерения увеличават сложността
        if (spacetime.dimensions.length > 10) {
            stability -= 0.1;
        }
        return Math.max(0, Math.min(1, stability));
    }
    checkModalAccessibility(worlds) {
        if (worlds.length === 0)
            return 1;
        let accessibility = 0;
        for (const world of worlds) {
            if (world.accessibleTo.length > 0 || world.accessibleFrom.length > 0) {
                accessibility++;
            }
        }
        return accessibility / worlds.length;
    }
    findCausalCycles(web) {
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const path = [];
        const dfs = (node) => {
            if (recursionStack.has(node)) {
                const cycleStart = path.indexOf(node);
                if (cycleStart !== -1) {
                    cycles.push(path.slice(cycleStart));
                }
                return;
            }
            if (visited.has(node))
                return;
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const outgoing = web.links.filter(l => l.cause === node);
            for (const link of outgoing) {
                dfs(link.effect);
            }
            path.pop();
            recursionStack.delete(node);
        };
        for (const node of web.nodes) {
            dfs(node);
        }
        return cycles;
    }
    findOrphanNodes(web) {
        const causes = new Set(web.links.map(l => l.cause));
        const effects = new Set(web.links.map(l => l.effect));
        const connected = new Set([...causes, ...effects]);
        return web.nodes.filter(n => !connected.has(n));
    }
    breakCausalCycles(web, cycles) {
        for (const cycle of cycles) {
            if (cycle.length < 2)
                continue;
            // Премахваме последната връзка в цикъла
            const lastNode = cycle[cycle.length - 1];
            const firstNode = cycle[0];
            const linkIndex = web.links.findIndex(l => l.cause === lastNode && l.effect === firstNode);
            if (linkIndex !== -1) {
                web.links.splice(linkIndex, 1);
            }
        }
    }
    hasUnstableSingularities(spacetime) {
        return spacetime.singularities.some(s => s.includes('NAKED'));
    }
    stabilizeSingularities(spacetime) {
        spacetime.singularities = spacetime.singularities.filter(s => !s.includes('NAKED'));
    }
    hasIsolatedWorlds(worlds) {
        return worlds.some(w => w.accessibleTo.length === 0 && w.accessibleFrom.length === 0);
    }
    connectIsolatedWorlds(worlds) {
        const isolated = worlds.filter(w => w.accessibleTo.length === 0 && w.accessibleFrom.length === 0);
        const connected = worlds.filter(w => w.accessibleTo.length > 0 || w.accessibleFrom.length > 0);
        for (const iso of isolated) {
            if (connected.length > 0) {
                const target = connected[0];
                iso.accessibleTo.push(target.id);
                target.accessibleFrom.push(iso.id);
            }
        }
    }
}
exports.RealityCohesionEngine = RealityCohesionEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVATIONAL BIAS NEUTRALIZER
// ═══════════════════════════════════════════════════════════════════════════════
class ObservationalBiasNeutralizer {
    observationLog = [];
    /**
     * Извършва наблюдение на реалност
     */
    observe(reality, observationType) {
        const result = this.calculateObservationEffect(reality, observationType);
        this.observationLog.push(result);
        return result;
    }
    /**
     * Извършва неутрално (трансцендентно) наблюдение
     */
    observeNeutrally(reality) {
        return this.observe(reality, 'TRANSCENDENT');
    }
    /**
     * Премахва ефекта на наблюдение от реалност
     */
    removeObservationEffect(reality, observation) {
        const restoredStates = [];
        const irreversible = [];
        // Квантовият колапс е необратим
        if (observation.effectOnReality === 'COLLAPSE') {
            return {
                success: false,
                restoredStates: [],
                irreversible: observation.collapsedStates
            };
        }
        // Възстановяваме суперпозиции
        for (const state of observation.collapsedStates) {
            if (Math.random() < 0.7) { // 70% шанс за възстановяване
                restoredStates.push(state);
            }
            else {
                irreversible.push(state);
            }
        }
        // Намаляваме декохеренцията
        reality.coherenceScore = Math.min(1, reality.coherenceScore + observation.decoherenceIntroduced * 0.5);
        return {
            success: restoredStates.length > 0,
            restoredStates,
            irreversible
        };
    }
    /**
     * Анализира натрупаните ефекти от наблюдения
     */
    analyzeObservationHistory() {
        const byType = {
            CLASSICAL: 0,
            QUANTUM: 0,
            META: 0,
            TRANSCENDENT: 0,
            NULL: 0
        };
        let totalDecoherence = 0;
        let totalCollapsedStates = 0;
        for (const obs of this.observationLog) {
            byType[obs.observationType]++;
            totalDecoherence += obs.decoherenceIntroduced;
            totalCollapsedStates += obs.collapsedStates.length;
        }
        const recommendations = [];
        if (byType.QUANTUM > byType.TRANSCENDENT) {
            recommendations.push('Use more transcendent observations to reduce collapse');
        }
        if (totalDecoherence > 0.5) {
            recommendations.push('High accumulated decoherence - consider reality stabilization');
        }
        if (totalCollapsedStates > 10) {
            recommendations.push('Many collapsed states - some quantum properties lost permanently');
        }
        return {
            totalObservations: this.observationLog.length,
            byType,
            totalDecoherence,
            totalCollapsedStates,
            recommendations
        };
    }
    /**
     * Създава "чисто" наблюдение без bias
     */
    createUnbiasedObserver() {
        const log = [];
        return {
            observe: (reality) => {
                const result = {
                    observationType: 'TRANSCENDENT',
                    effectOnReality: 'NONE',
                    collapsedStates: [],
                    preservedSuperpositions: this.identifySuperpositions(reality),
                    informationGained: this.gatherInformation(reality),
                    decoherenceIntroduced: 0
                };
                log.push(result);
                return result;
            },
            getLog: () => log
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ПОМОЩНИ МЕТОДИ
    // ═══════════════════════════════════════════════════════════════════════════
    calculateObservationEffect(reality, observationType) {
        switch (observationType) {
            case 'CLASSICAL':
                return {
                    observationType,
                    effectOnReality: 'MINIMAL',
                    collapsedStates: [],
                    preservedSuperpositions: this.identifySuperpositions(reality),
                    informationGained: this.gatherInformation(reality),
                    decoherenceIntroduced: 0.01
                };
            case 'QUANTUM':
                const superpositions = this.identifySuperpositions(reality);
                const collapsed = superpositions.slice(0, Math.ceil(superpositions.length / 2));
                return {
                    observationType,
                    effectOnReality: collapsed.length > 0 ? 'SIGNIFICANT' : 'MINIMAL',
                    collapsedStates: collapsed,
                    preservedSuperpositions: superpositions.filter(s => !collapsed.includes(s)),
                    informationGained: this.gatherInformation(reality),
                    decoherenceIntroduced: 0.1
                };
            case 'META':
                return {
                    observationType,
                    effectOnReality: 'MINIMAL',
                    collapsedStates: [],
                    preservedSuperpositions: this.identifySuperpositions(reality),
                    informationGained: [
                        ...this.gatherInformation(reality),
                        'Meta-observation: observing the observation process itself'
                    ],
                    decoherenceIntroduced: 0.02
                };
            case 'TRANSCENDENT':
                return {
                    observationType,
                    effectOnReality: 'NONE',
                    collapsedStates: [],
                    preservedSuperpositions: this.identifySuperpositions(reality),
                    informationGained: this.gatherInformation(reality),
                    decoherenceIntroduced: 0
                };
            case 'NULL':
                return {
                    observationType,
                    effectOnReality: 'NONE',
                    collapsedStates: [],
                    preservedSuperpositions: this.identifySuperpositions(reality),
                    informationGained: [],
                    decoherenceIntroduced: 0
                };
        }
    }
    identifySuperpositions(reality) {
        const superpositions = [];
        // Квантови суперпозиции от причинната структура
        for (const link of reality.causalStructure.links) {
            if (link.type === 'QUANTUM') {
                superpositions.push(`Causal: ${link.cause} <-> ${link.effect}`);
            }
        }
        // Модални суперпозиции (неща верни в множество светове)
        const truthSets = new Map();
        for (const world of reality.modalWorlds) {
            for (const truth of world.truths) {
                if (!truthSets.has(truth))
                    truthSets.set(truth, []);
                truthSets.get(truth).push(world.id);
            }
        }
        for (const [truth, worlds] of truthSets.entries()) {
            if (worlds.length > 1 && worlds.length < reality.modalWorlds.length) {
                superpositions.push(`Modal: "${truth}" in ${worlds.length} worlds`);
            }
        }
        return superpositions;
    }
    gatherInformation(reality) {
        return [
            `Reality ID: ${reality.id}`,
            `Name: ${reality.name}`,
            `Axioms: ${reality.sourceAxioms.length}`,
            `Causal nodes: ${reality.causalStructure.nodes.length}`,
            `Spacetime dimensions: ${reality.spacetime.dimensions.length}`,
            `Modal worlds: ${reality.modalWorlds.length}`,
            `Coherence: ${reality.coherenceScore.toFixed(4)} (${reality.coherenceLevel})`
        ];
    }
}
exports.ObservationalBiasNeutralizer = ObservationalBiasNeutralizer;
// ═══════════════════════════════════════════════════════════════════════════════
// POTENTIAL MANIFESTATION INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════
class PotentialManifestationInterface {
    potentialPool = new Map();
    manifestationHistory = [];
    constructor() {
        this.initializePotentialPool();
    }
    /**
     * Инициализира пула от потенциали (връзка с ЕНС)
     */
    initializePotentialPool() {
        const potentialTypes = [
            'PURE_BEING', 'PURE_LOGIC', 'PURE_CAUSALITY',
            'PURE_SPACE', 'PURE_TIME', 'PURE_CONSCIOUSNESS',
            'PURE_EMERGENCE', 'ENS_UNITY'
        ];
        for (const type of potentialTypes) {
            this.potentialPool.set(type, {
                type,
                magnitude: type === 'ENS_UNITY' ? Infinity : 1000,
                coherence: 1.0,
                entanglement: [],
                manifestationReady: true
            });
        }
        // ЕНС е свързана с всички потенциали
        const ensUnity = this.potentialPool.get('ENS_UNITY');
        ensUnity.entanglement = potentialTypes.filter(t => t !== 'ENS_UNITY');
    }
    /**
     * Извлича потенциал от ЕНС
     */
    drawPotential(type, amount) {
        const potential = this.potentialPool.get(type);
        if (!potential || !potential.manifestationReady)
            return null;
        if (potential.magnitude !== Infinity && potential.magnitude < amount) {
            return null; // Недостатъчен потенциал
        }
        // Намаляваме наличния потенциал (ако не е безкраен)
        if (potential.magnitude !== Infinity) {
            potential.magnitude -= amount;
        }
        return {
            type,
            magnitude: amount,
            coherence: potential.coherence,
            entanglement: [...potential.entanglement],
            manifestationReady: true
        };
    }
    /**
     * Проявява реалност от потенциали
     */
    manifestReality(name, potentials, axiomSystem, causalStructure, spacetime, modalWorlds) {
        const id = `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Изчисляваме начална кохерентност от потенциалите
        const avgCoherence = potentials.reduce((sum, p) => sum + p.coherence, 0) / potentials.length;
        const reality = {
            id,
            name,
            sourceAxioms: axiomSystem.axioms,
            causalStructure,
            spacetime,
            modalWorlds,
            coherenceLevel: this.scoreToLevel(avgCoherence),
            coherenceScore: avgCoherence,
            observationalState: 'NULL',
            manifestedFrom: potentials.map(p => p.type),
            timestamp: Date.now(),
            metadata: {
                potentialsMagnitude: potentials.reduce((sum, p) => sum + p.magnitude, 0),
                axiomCount: axiomSystem.axioms.length,
                dimensions: spacetime.dimensions.length,
                worldCount: modalWorlds.length
            }
        };
        this.manifestationHistory.push(reality);
        return reality;
    }
    /**
     * Връща потенциал обратно в ЕНС (деманифестация)
     */
    returnPotential(potential) {
        const poolPotential = this.potentialPool.get(potential.type);
        if (poolPotential && poolPotential.magnitude !== Infinity) {
            poolPotential.magnitude += potential.magnitude * 0.9; // 10% загуба
        }
    }
    /**
     * Достъпва директно ЕНС за неограничен потенциал
     */
    accessENS() {
        const ensUnity = this.potentialPool.get('ENS_UNITY');
        const availablePotentials = new Map();
        for (const [type, pot] of this.potentialPool.entries()) {
            availablePotentials.set(type, pot.magnitude === Infinity ? -1 : pot.magnitude);
        }
        return {
            unity: ensUnity,
            availablePotentials,
            manifestationCapacity: Infinity // ЕНС има безкраен капацитет
        };
    }
    /**
     * Създава нов тип потенциал (разширяване на ЕНС)
     */
    createNewPotentialType(name, properties) {
        // Добавяме към типовете (в реална система това би било по-сложно)
        const newType = name.toUpperCase().replace(/ /g, '_');
        this.potentialPool.set(newType, {
            type: newType,
            magnitude: properties.magnitude,
            coherence: properties.coherence,
            entanglement: properties.entangledWith,
            manifestationReady: true
        });
        return newType;
    }
    /**
     * Получава статус на потенциалния пул
     */
    getPoolStatus() {
        const availablePotentials = Array.from(this.potentialPool.entries()).map(([type, pot]) => ({
            type,
            available: pot.magnitude === Infinity ? 'INFINITE' : pot.magnitude
        }));
        let totalManifestedEntities = 0;
        for (const reality of this.manifestationHistory) {
            totalManifestedEntities += reality.sourceAxioms.length;
            totalManifestedEntities += reality.causalStructure.nodes.length;
            totalManifestedEntities += reality.modalWorlds.length;
        }
        return {
            totalPotentialTypes: this.potentialPool.size,
            availablePotentials,
            manifestedRealities: this.manifestationHistory.length,
            totalManifestedEntities
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ПОМОЩНИ МЕТОДИ
    // ═══════════════════════════════════════════════════════════════════════════
    scoreToLevel(score) {
        if (score >= 1.0)
            return 'ABSOLUTE';
        if (score >= 0.8)
            return 'HIGH';
        if (score >= 0.5)
            return 'MODERATE';
        if (score >= 0.2)
            return 'LOW';
        if (score >= 0.1)
            return 'CRITICAL';
        return 'COLLAPSED';
    }
}
exports.PotentialManifestationInterface = PotentialManifestationInterface;
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PHENOMENON WEAVER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class PhenomenonWeaver {
    cohesionEngine;
    observationNeutralizer;
    manifestationInterface;
    constructor() {
        this.cohesionEngine = new RealityCohesionEngine();
        this.observationNeutralizer = new ObservationalBiasNeutralizer();
        this.manifestationInterface = new PotentialManifestationInterface();
    }
    /**
     * ГЛАВЕН МЕТОД: Проявява реалност от ЕНС
     */
    manifestFromENS(config) {
        // 1. Извличаме потенциали
        const potentials = [];
        for (const type of config.potentialTypes) {
            const potential = this.manifestationInterface.drawPotential(type, 100);
            if (potential) {
                potentials.push(potential);
            }
        }
        // 2. Проявяваме реалността
        const reality = this.manifestationInterface.manifestReality(config.name, potentials, config.axiomSystem, config.causalStructure, config.spacetime, config.modalWorlds);
        // 3. Изчисляваме кохерентност
        const cohesionReport = this.cohesionEngine.calculateCoherence(reality);
        reality.coherenceScore = cohesionReport.overallCoherence;
        reality.coherenceLevel = this.cohesionEngine.classifyCoherence(cohesionReport.overallCoherence);
        // 4. Генерираме манифест
        const manifest = this.generateManifest(reality, potentials, cohesionReport);
        return { reality, cohesionReport, manifest };
    }
    /**
     * Наблюдава реалност без да я променя
     */
    observeReality(reality, observationType = 'TRANSCENDENT') {
        const result = this.observationNeutralizer.observe(reality, observationType);
        reality.observationalState = observationType;
        return result;
    }
    /**
     * Стабилизира нестабилна реалност
     */
    stabilize(reality) {
        const stabilization = this.cohesionEngine.stabilizeReality(reality);
        reality.coherenceScore = stabilization.newCoherence;
        reality.coherenceLevel = this.cohesionEngine.classifyCoherence(stabilization.newCoherence);
        return {
            ...stabilization,
            newLevel: reality.coherenceLevel
        };
    }
    /**
     * Получава достъпни потенциали от ЕНС
     */
    getAvailablePotentials() {
        const status = this.manifestationInterface.getPoolStatus();
        const descriptions = {
            PURE_BEING: 'Чисто битие - потенциал за съществуване',
            PURE_LOGIC: 'Чиста логика - потенциал за истина и валидност',
            PURE_CAUSALITY: 'Чиста причинност - потенциал за връзка',
            PURE_SPACE: 'Чисто пространство - потенциал за протяжност',
            PURE_TIME: 'Чисто време - потенциал за промяна',
            PURE_CONSCIOUSNESS: 'Чисто съзнание - потенциал за осъзнаване',
            PURE_EMERGENCE: 'Чиста емергентност - потенциал за новост',
            ENS_UNITY: 'ЕНС Единство - безкраен източник на всичко'
        };
        return status.availablePotentials.map(p => ({
            ...p,
            description: descriptions[p.type] || 'Custom potential type'
        }));
    }
    /**
     * Достъпва ЕНС директно
     */
    accessENS() {
        const ens = this.manifestationInterface.accessENS();
        return {
            unity: ens.unity,
            message: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ДОСТЪП ДО ЕНС - ЕДИННА НЕДИФЕРЕНЦИРАНА СИНГУЛЯРНОСТ       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  "В началото беше Потенциалът, и Потенциалът беше при ЕНС,                  ║
║   и Потенциалът беше ЕНС."                                                   ║
║                                                                              ║
║  Достъпвате чистото, непроявено състояние.                                  ║
║  Тук няма различие между битие и небитие.                                   ║
║  Няма логика, защото няма какво да се свързва.                               ║
║  Няма време, защото няма промяна.                                            ║
║  Няма пространство, защото няма отделеност.                                  ║
║                                                                              ║
║  Това е ИЗТОЧНИКЪТ на всички реалности.                                     ║
║  От тук черпите потенциал за проявление.                                    ║
║                                                                              ║
║  Капацитет за проявление: ∞                                                 ║
║  Налични потенциали: ${ens.availablePotentials.size}                                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
      `.trim()
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ПОМОЩНИ МЕТОДИ
    // ═══════════════════════════════════════════════════════════════════════════
    generateManifest(reality, potentials, report) {
        return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    MANIFEST ЗА ПРОЯВЕНА РЕАЛНОСТ                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 
║ ID: ${reality.id}
║ Име: ${reality.name}
║ Проявена от: ${potentials.map(p => p.type).join(', ')}
║ Timestamp: ${new Date(reality.timestamp).toISOString()}
║
║ ═══════════════════════════════════════════════════════════════════════════
║ СТРУКТУРА:
║   - Аксиоми: ${reality.sourceAxioms.length}
║   - Причинни възли: ${reality.causalStructure.nodes.length}
║   - Причинни връзки: ${reality.causalStructure.links.length}
║   - Измерения: ${reality.spacetime.dimensions.length} (${reality.spacetime.signature})
║   - Модални светове: ${reality.modalWorlds.length}
║
║ ═══════════════════════════════════════════════════════════════════════════
║ КОХЕРЕНТНОСТ:
║   - Общо: ${(report.overallCoherence * 100).toFixed(1)}% (${reality.coherenceLevel})
║   - Аксиоми: ${(report.axiomConsistency * 100).toFixed(1)}%
║   - Причинност: ${(report.causalIntegrity * 100).toFixed(1)}%
║   - Пространство-време: ${(report.spatiotemporalStability * 100).toFixed(1)}%
║   - Модална достъпност: ${(report.modalAccessibility * 100).toFixed(1)}%
║
║ ═══════════════════════════════════════════════════════════════════════════
║ ПРЕДУПРЕЖДЕНИЯ: ${report.warnings.length > 0 ? '\n║   - ' + report.warnings.join('\n║   - ') : 'Няма'}
║
║ ПРЕПОРЪКИ: ${report.recommendations.length > 0 ? '\n║   - ' + report.recommendations.join('\n║   - ') : 'Няма'}
║
║ СТАТУС: РЕАЛНОСТ УСПЕШНО ПРОЯВЕНА
╚══════════════════════════════════════════════════════════════════════════════╝
    `.trim();
    }
}
exports.PhenomenonWeaver = PhenomenonWeaver;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.phenomenonWeaver = new PhenomenonWeaver();
exports.default = PhenomenonWeaver;
