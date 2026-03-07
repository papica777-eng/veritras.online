/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           QANTUM PHENOMENON WEAVER - ОНТОЛОГИЧНА КОВАЧНИЦА                   ║
 * ║                    "Реалността е проявен потенциал"                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Активно проявление и управление на емергентни реалности                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  AxiomSystem,
  CausalWeb,
  ModalWorld,
  Continuum,
  Axiom,
  CausalLink,
  CausalityType
} from './OntoGenerator';

// ═══════════════════════════════════════════════════════════════════════════════
// ТИПОВЕ И ИНТЕРФЕЙСИ
// ═══════════════════════════════════════════════════════════════════════════════

export type PotentialType =
  | 'PURE_BEING'        // Чисто битие
  | 'PURE_LOGIC'        // Чиста логика
  | 'PURE_CAUSALITY'    // Чиста причинност
  | 'PURE_SPACE'        // Чисто пространство
  | 'PURE_TIME'         // Чисто време
  | 'PURE_CONSCIOUSNESS'// Чисто съзнание
  | 'PURE_EMERGENCE'    // Чиста емергентност
  | 'ENS_UNITY';        // ЕНС Единство

export type CoherenceLevel = 
  | 'ABSOLUTE'          // 1.0 - Пълна кохерентност
  | 'HIGH'              // 0.8-0.99
  | 'MODERATE'          // 0.5-0.79
  | 'LOW'               // 0.2-0.49
  | 'CRITICAL'          // <0.2 - Риск от колапс
  | 'COLLAPSED';        // 0 - Реалността е колабирала

export type ObservationType =
  | 'CLASSICAL'         // Класическо наблюдение
  | 'QUANTUM'           // Квантово наблюдение (колапс)
  | 'META'              // Мета-наблюдение (наблюдаване на наблюдението)
  | 'TRANSCENDENT'      // Трансцендентно (без ефект върху наблюдаваното)
  | 'NULL';             // Без наблюдение

export interface Potential {
  type: PotentialType;
  magnitude: number;      // 0-∞
  coherence: number;      // 0-1
  entanglement: string[]; // Свързани потенциали
  manifestationReady: boolean;
}

export interface ManifestedReality {
  id: string;
  name: string;
  sourceAxioms: Axiom[];
  causalStructure: CausalWeb;
  spacetime: Continuum;
  modalWorlds: ModalWorld[];
  coherenceLevel: CoherenceLevel;
  coherenceScore: number;
  observationalState: ObservationType;
  manifestedFrom: PotentialType[];
  timestamp: number;
  metadata: Record<string, any>;
}

export interface CohesionReport {
  overallCoherence: number;
  axiomConsistency: number;
  causalIntegrity: number;
  spatiotemporalStability: number;
  modalAccessibility: number;
  warnings: string[];
  recommendations: string[];
}

export interface ObservationResult {
  observationType: ObservationType;
  effectOnReality: 'NONE' | 'MINIMAL' | 'SIGNIFICANT' | 'COLLAPSE';
  collapsedStates: string[];
  preservedSuperpositions: string[];
  informationGained: string[];
  decoherenceIntroduced: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REALITY COHESION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class RealityCohesionEngine {
  private coherenceThresholds = {
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
  calculateCoherence(reality: ManifestedReality): CohesionReport {
    const axiomConsistency = this.checkAxiomConsistency(reality.sourceAxioms);
    const causalIntegrity = this.checkCausalIntegrity(reality.causalStructure);
    const spatiotemporalStability = this.checkSpatiotemporalStability(reality.spacetime);
    const modalAccessibility = this.checkModalAccessibility(reality.modalWorlds);

    const overallCoherence = (
      axiomConsistency * 0.3 +
      causalIntegrity * 0.3 +
      spatiotemporalStability * 0.25 +
      modalAccessibility * 0.15
    );

    const warnings: string[] = [];
    const recommendations: string[] = [];

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
  classifyCoherence(score: number): CoherenceLevel {
    if (score >= this.coherenceThresholds.ABSOLUTE) return 'ABSOLUTE';
    if (score >= this.coherenceThresholds.HIGH) return 'HIGH';
    if (score >= this.coherenceThresholds.MODERATE) return 'MODERATE';
    if (score >= this.coherenceThresholds.LOW) return 'LOW';
    if (score >= this.coherenceThresholds.CRITICAL) return 'CRITICAL';
    return 'COLLAPSED';
  }

  /**
   * Стабилизира нестабилна реалност
   */
  stabilizeReality(reality: ManifestedReality): {
    success: boolean;
    modifications: string[];
    newCoherence: number;
  } {
    const modifications: string[] = [];
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
  predictCoherenceEvolution(
    reality: ManifestedReality,
    timeSteps: number
  ): { time: number; coherence: number; event: string }[] {
    const predictions: { time: number; coherence: number; event: string }[] = [];
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
        } else {
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

  private checkAxiomConsistency(axioms: Axiom[]): number {
    if (axioms.length === 0) return 1;
    const consistent = axioms.filter(a => a.isConsistent).length;
    return consistent / axioms.length;
  }

  private checkCausalIntegrity(web: CausalWeb): number {
    if (web.links.length === 0) return 1;

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

  private checkSpatiotemporalStability(spacetime: Continuum): number {
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

  private checkModalAccessibility(worlds: ModalWorld[]): number {
    if (worlds.length === 0) return 1;

    let accessibility = 0;
    for (const world of worlds) {
      if (world.accessibleTo.length > 0 || world.accessibleFrom.length > 0) {
        accessibility++;
      }
    }

    return accessibility / worlds.length;
  }

  private findCausalCycles(web: CausalWeb): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }
      if (visited.has(node)) return;

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

  private findOrphanNodes(web: CausalWeb): string[] {
    const causes = new Set(web.links.map(l => l.cause));
    const effects = new Set(web.links.map(l => l.effect));
    const connected = new Set([...causes, ...effects]);

    return web.nodes.filter(n => !connected.has(n));
  }

  private breakCausalCycles(web: CausalWeb, cycles: string[][]): void {
    for (const cycle of cycles) {
      if (cycle.length < 2) continue;

      // Премахваме последната връзка в цикъла
      const lastNode = cycle[cycle.length - 1];
      const firstNode = cycle[0];

      const linkIndex = web.links.findIndex(
        l => l.cause === lastNode && l.effect === firstNode
      );

      if (linkIndex !== -1) {
        web.links.splice(linkIndex, 1);
      }
    }
  }

  private hasUnstableSingularities(spacetime: Continuum): boolean {
    return spacetime.singularities.some(s => s.includes('NAKED'));
  }

  private stabilizeSingularities(spacetime: Continuum): void {
    spacetime.singularities = spacetime.singularities.filter(
      s => !s.includes('NAKED')
    );
  }

  private hasIsolatedWorlds(worlds: ModalWorld[]): boolean {
    return worlds.some(
      w => w.accessibleTo.length === 0 && w.accessibleFrom.length === 0
    );
  }

  private connectIsolatedWorlds(worlds: ModalWorld[]): void {
    const isolated = worlds.filter(
      w => w.accessibleTo.length === 0 && w.accessibleFrom.length === 0
    );
    const connected = worlds.filter(
      w => w.accessibleTo.length > 0 || w.accessibleFrom.length > 0
    );

    for (const iso of isolated) {
      if (connected.length > 0) {
        const target = connected[0];
        iso.accessibleTo.push(target.id);
        target.accessibleFrom.push(iso.id);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVATIONAL BIAS NEUTRALIZER
// ═══════════════════════════════════════════════════════════════════════════════

export class ObservationalBiasNeutralizer {
  private observationLog: ObservationResult[] = [];

  /**
   * Извършва наблюдение на реалност
   */
  observe(
    reality: ManifestedReality,
    observationType: ObservationType
  ): ObservationResult {
    const result = this.calculateObservationEffect(reality, observationType);
    this.observationLog.push(result);
    return result;
  }

  /**
   * Извършва неутрално (трансцендентно) наблюдение
   */
  observeNeutrally(reality: ManifestedReality): ObservationResult {
    return this.observe(reality, 'TRANSCENDENT');
  }

  /**
   * Премахва ефекта на наблюдение от реалност
   */
  removeObservationEffect(
    reality: ManifestedReality,
    observation: ObservationResult
  ): {
    success: boolean;
    restoredStates: string[];
    irreversible: string[];
  } {
    const restoredStates: string[] = [];
    const irreversible: string[] = [];

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
      } else {
        irreversible.push(state);
      }
    }

    // Намаляваме декохеренцията
    reality.coherenceScore = Math.min(
      1,
      reality.coherenceScore + observation.decoherenceIntroduced * 0.5
    );

    return {
      success: restoredStates.length > 0,
      restoredStates,
      irreversible
    };
  }

  /**
   * Анализира натрупаните ефекти от наблюдения
   */
  analyzeObservationHistory(): {
    totalObservations: number;
    byType: Record<ObservationType, number>;
    totalDecoherence: number;
    totalCollapsedStates: number;
    recommendations: string[];
  } {
    const byType: Record<ObservationType, number> = {
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

    const recommendations: string[] = [];

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
  createUnbiasedObserver(): {
    observe: (reality: ManifestedReality) => ObservationResult;
    getLog: () => ObservationResult[];
  } {
    const log: ObservationResult[] = [];

    return {
      observe: (reality: ManifestedReality) => {
        const result: ObservationResult = {
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

  private calculateObservationEffect(
    reality: ManifestedReality,
    observationType: ObservationType
  ): ObservationResult {
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

  private identifySuperpositions(reality: ManifestedReality): string[] {
    const superpositions: string[] = [];

    // Квантови суперпозиции от причинната структура
    for (const link of reality.causalStructure.links) {
      if (link.type === 'QUANTUM') {
        superpositions.push(`Causal: ${link.cause} <-> ${link.effect}`);
      }
    }

    // Модални суперпозиции (неща верни в множество светове)
    const truthSets = new Map<string, string[]>();
    for (const world of reality.modalWorlds) {
      for (const truth of world.truths) {
        if (!truthSets.has(truth)) truthSets.set(truth, []);
        truthSets.get(truth)!.push(world.id);
      }
    }

    for (const [truth, worlds] of truthSets.entries()) {
      if (worlds.length > 1 && worlds.length < reality.modalWorlds.length) {
        superpositions.push(`Modal: "${truth}" in ${worlds.length} worlds`);
      }
    }

    return superpositions;
  }

  private gatherInformation(reality: ManifestedReality): string[] {
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

// ═══════════════════════════════════════════════════════════════════════════════
// POTENTIAL MANIFESTATION INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export class PotentialManifestationInterface {
  private potentialPool: Map<PotentialType, Potential> = new Map();
  private manifestationHistory: ManifestedReality[] = [];

  constructor() {
    this.initializePotentialPool();
  }

  /**
   * Инициализира пула от потенциали (връзка с ЕНС)
   */
  private initializePotentialPool(): void {
    const potentialTypes: PotentialType[] = [
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
    const ensUnity = this.potentialPool.get('ENS_UNITY')!;
    ensUnity.entanglement = potentialTypes.filter(t => t !== 'ENS_UNITY');
  }

  /**
   * Извлича потенциал от ЕНС
   */
  drawPotential(type: PotentialType, amount: number): Potential | null {
    const potential = this.potentialPool.get(type);
    if (!potential || !potential.manifestationReady) return null;

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
  manifestReality(
    name: string,
    potentials: Potential[],
    axiomSystem: AxiomSystem,
    causalStructure: CausalWeb,
    spacetime: Continuum,
    modalWorlds: ModalWorld[]
  ): ManifestedReality {
    const id = `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Изчисляваме начална кохерентност от потенциалите
    const avgCoherence = potentials.reduce((sum, p) => sum + p.coherence, 0) / potentials.length;

    const reality: ManifestedReality = {
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
  returnPotential(potential: Potential): void {
    const poolPotential = this.potentialPool.get(potential.type);
    if (poolPotential && poolPotential.magnitude !== Infinity) {
      poolPotential.magnitude += potential.magnitude * 0.9; // 10% загуба
    }
  }

  /**
   * Достъпва директно ЕНС за неограничен потенциал
   */
  accessENS(): {
    unity: Potential;
    availablePotentials: Map<PotentialType, number>;
    manifestationCapacity: number;
  } {
    const ensUnity = this.potentialPool.get('ENS_UNITY')!;

    const availablePotentials = new Map<PotentialType, number>();
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
  createNewPotentialType(
    name: string,
    properties: {
      magnitude: number;
      coherence: number;
      entangledWith: PotentialType[];
    }
  ): PotentialType {
    // Добавяме към типовете (в реална система това би било по-сложно)
    const newType = name.toUpperCase().replace(/ /g, '_') as PotentialType;

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
  getPoolStatus(): {
    totalPotentialTypes: number;
    availablePotentials: Array<{ type: PotentialType; available: number | 'INFINITE' }>;
    manifestedRealities: number;
    totalManifestedEntities: number;
  } {
    const availablePotentials = Array.from(this.potentialPool.entries()).map(([type, pot]) => ({
      type,
      available: pot.magnitude === Infinity ? 'INFINITE' as const : pot.magnitude
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

  private scoreToLevel(score: number): CoherenceLevel {
    if (score >= 1.0) return 'ABSOLUTE';
    if (score >= 0.8) return 'HIGH';
    if (score >= 0.5) return 'MODERATE';
    if (score >= 0.2) return 'LOW';
    if (score >= 0.1) return 'CRITICAL';
    return 'COLLAPSED';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PHENOMENON WEAVER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class PhenomenonWeaver {
  public cohesionEngine: RealityCohesionEngine;
  public observationNeutralizer: ObservationalBiasNeutralizer;
  public manifestationInterface: PotentialManifestationInterface;

  constructor() {
    this.cohesionEngine = new RealityCohesionEngine();
    this.observationNeutralizer = new ObservationalBiasNeutralizer();
    this.manifestationInterface = new PotentialManifestationInterface();
  }

  /**
   * ГЛАВЕН МЕТОД: Проявява реалност от ЕНС
   */
  manifestFromENS(config: {
    name: string;
    potentialTypes: PotentialType[];
    axiomSystem: AxiomSystem;
    causalStructure: CausalWeb;
    spacetime: Continuum;
    modalWorlds: ModalWorld[];
  }): {
    reality: ManifestedReality;
    cohesionReport: CohesionReport;
    manifest: string;
  } {
    // 1. Извличаме потенциали
    const potentials: Potential[] = [];
    for (const type of config.potentialTypes) {
      const potential = this.manifestationInterface.drawPotential(type, 100);
      if (potential) {
        potentials.push(potential);
      }
    }

    // 2. Проявяваме реалността
    const reality = this.manifestationInterface.manifestReality(
      config.name,
      potentials,
      config.axiomSystem,
      config.causalStructure,
      config.spacetime,
      config.modalWorlds
    );

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
  observeReality(
    reality: ManifestedReality,
    observationType: ObservationType = 'TRANSCENDENT'
  ): ObservationResult {
    const result = this.observationNeutralizer.observe(reality, observationType);
    reality.observationalState = observationType;
    return result;
  }

  /**
   * Стабилизира нестабилна реалност
   */
  stabilize(reality: ManifestedReality): {
    success: boolean;
    modifications: string[];
    newCoherence: number;
    newLevel: CoherenceLevel;
  } {
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
  getAvailablePotentials(): Array<{
    type: PotentialType;
    available: number | 'INFINITE';
    description: string;
  }> {
    const status = this.manifestationInterface.getPoolStatus();

    const descriptions: Record<PotentialType, string> = {
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
  accessENS(): {
    unity: Potential;
    message: string;
  } {
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

  private generateManifest(
    reality: ManifestedReality,
    potentials: Potential[],
    report: CohesionReport
  ): string {
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

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const phenomenonWeaver = new PhenomenonWeaver();
export default PhenomenonWeaver;
