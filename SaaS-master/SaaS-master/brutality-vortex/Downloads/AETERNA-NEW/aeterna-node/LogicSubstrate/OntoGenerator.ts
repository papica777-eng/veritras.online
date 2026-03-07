/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           QANTUM ONTO-GENERATOR - АКСИОМАТИЧЕН ГЕНЕЗИС                       ║
 * ║                    "Непроявеното е крайният чертеж"                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Първопринципен Архитект - Създава фундаментални аксиоми и реалности       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ТИПОВЕ И ИНТЕРФЕЙСИ
// ═══════════════════════════════════════════════════════════════════════════════

export type AxiomType = 
  | 'ONTOLOGICAL'      // За съществуване
  | 'LOGICAL'          // За истинност
  | 'CAUSAL'           // За причинност
  | 'TEMPORAL'         // За време
  | 'SPATIAL'          // За пространство
  | 'MODAL'            // За възможност/необходимост
  | 'EMERGENT'         // За емергентност
  | 'META';            // Мета-аксиоми

export type CausalityType = 
  | 'EFFICIENT'        // Аристотелова - действаща причина
  | 'FORMAL'           // Формална причина (структура)
  | 'MATERIAL'         // Материална причина (субстанция)
  | 'FINAL'            // Телеологична причина (цел)
  | 'RETROCAUSAL'      // Обратна причинност
  | 'QUANTUM'          // Квантова (вероятностна)
  | 'EMERGENT'         // Емергентна (от сложност)
  | 'ACAUSAL';         // Синхронистична (без причина)

export type ModalOperator = 
  | 'NECESSARY'        // □ Необходимо
  | 'POSSIBLE'         // ◇ Възможно
  | 'IMPOSSIBLE'       // ¬◇ Невъзможно
  | 'CONTINGENT'       // Контингентно (може и да не е)
  | 'ACTUAL'           // @ Актуално
  | 'COUNTERFACTUAL';  // Контрафактуално

export interface Axiom {
  id: string;
  type: AxiomType;
  name: string;
  formalExpression: string;
  naturalLanguage: string;
  constraints: string[];
  implications: string[];
  isConsistent: boolean;
  godelNumber?: string;
}

export interface AxiomSystem {
  name: string;
  axioms: Axiom[];
  derivedTheorems: string[];
  consistencyProof: string;
  completenessStatus: 'COMPLETE' | 'INCOMPLETE' | 'UNDECIDABLE';
  signature: string;
}

export interface CausalLink {
  cause: string;
  effect: string;
  type: CausalityType;
  strength: number;        // 0-1
  reversible: boolean;
  temporal: 'PAST' | 'PRESENT' | 'FUTURE' | 'ATEMPORAL';
}

export interface CausalWeb {
  nodes: string[];
  links: CausalLink[];
  topology: 'LINEAR' | 'BRANCHING' | 'CYCLIC' | 'ACYCLIC' | 'HYPERBOLIC';
  entropy: number;
}

export interface ModalWorld {
  id: string;
  name: string;
  accessibleFrom: string[];
  accessibleTo: string[];
  truths: string[];
  laws: string[];
  distance: number;       // Distance from actual world
}

export interface Dimension {
  name: string;
  type: 'SPATIAL' | 'TEMPORAL' | 'ABSTRACT' | 'PHASE' | 'HILBERT';
  curvature: number;      // -1 (hyperbolic), 0 (flat), +1 (spherical)
  compactified: boolean;
  size: number | 'INFINITE';
  topology: string;
}

export interface Continuum {
  dimensions: Dimension[];
  signature: string;      // e.g., (3,1) for Minkowski
  metric: string;
  singularities: string[];
  boundaries: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMORDIAL AXIOM SYNTHESIS
// ═══════════════════════════════════════════════════════════════════════════════

export class PrimordialAxiomSynthesis {
  private axiomCounter = 0;
  private axiomRegistry: Map<string, Axiom> = new Map();

  /**
   * Генерира уникален идентификатор за аксиома
   */
  private generateAxiomId(): string {
    return `AX-${Date.now()}-${++this.axiomCounter}`;
  }

  /**
   * Създава нова онтологична аксиома
   */
  createOntologicalAxiom(
    name: string,
    formalExpression: string,
    description: string
  ): Axiom {
    const axiom: Axiom = {
      id: this.generateAxiomId(),
      type: 'ONTOLOGICAL',
      name,
      formalExpression,
      naturalLanguage: description,
      constraints: this.deriveConstraints(formalExpression),
      implications: this.deriveImplications(formalExpression),
      isConsistent: this.checkConsistency(formalExpression)
    };
    
    this.axiomRegistry.set(axiom.id, axiom);
    return axiom;
  }

  /**
   * Създава логическа аксиома
   */
  createLogicalAxiom(
    name: string,
    formalExpression: string,
    description: string
  ): Axiom {
    const axiom: Axiom = {
      id: this.generateAxiomId(),
      type: 'LOGICAL',
      name,
      formalExpression,
      naturalLanguage: description,
      constraints: this.deriveConstraints(formalExpression),
      implications: this.deriveImplications(formalExpression),
      isConsistent: this.checkConsistency(formalExpression),
      godelNumber: this.computeGodelNumber(formalExpression)
    };
    
    this.axiomRegistry.set(axiom.id, axiom);
    return axiom;
  }

  /**
   * Създава причинна аксиома
   */
  createCausalAxiom(
    name: string,
    causalType: CausalityType,
    description: string
  ): Axiom {
    const formalExpression = this.generateCausalFormula(causalType);
    const axiom: Axiom = {
      id: this.generateAxiomId(),
      type: 'CAUSAL',
      name,
      formalExpression,
      naturalLanguage: description,
      constraints: [`Causality type: ${causalType}`],
      implications: this.deriveCausalImplications(causalType),
      isConsistent: true
    };
    
    this.axiomRegistry.set(axiom.id, axiom);
    return axiom;
  }

  /**
   * Създава мета-аксиома (аксиома за аксиоми)
   */
  createMetaAxiom(
    name: string,
    targetAxioms: string[],
    metaProperty: string
  ): Axiom {
    const formalExpression = `∀A ∈ {${targetAxioms.join(', ')}} : ${metaProperty}(A)`;
    const axiom: Axiom = {
      id: this.generateAxiomId(),
      type: 'META',
      name,
      formalExpression,
      naturalLanguage: `Мета-свойство "${metaProperty}" важи за аксиомите: ${targetAxioms.join(', ')}`,
      constraints: ['Self-referential', 'Higher-order'],
      implications: ['Affects axiom system consistency'],
      isConsistent: this.checkMetaConsistency(targetAxioms, metaProperty)
    };
    
    this.axiomRegistry.set(axiom.id, axiom);
    return axiom;
  }

  /**
   * Синтезира пълна аксиоматична система
   */
  synthesizeAxiomSystem(
    name: string,
    axiomTypes: AxiomType[],
    constraints: string[]
  ): AxiomSystem {
    const axioms: Axiom[] = [];
    
    // Генерираме базови аксиоми за всеки тип
    for (const type of axiomTypes) {
      const baseAxioms = this.generateBaseAxiomsForType(type);
      axioms.push(...baseAxioms);
    }
    
    // Прилагаме ограничения
    const filteredAxioms = this.applyConstraints(axioms, constraints);
    
    // Извличаме производни теореми
    const theorems = this.deriveTheorems(filteredAxioms);
    
    // Проверяваме за непълнота (Гьодел)
    const completeness = this.checkCompleteness(filteredAxioms);
    
    return {
      name,
      axioms: filteredAxioms,
      derivedTheorems: theorems,
      consistencyProof: this.generateConsistencyProof(filteredAxioms),
      completenessStatus: completeness,
      signature: this.computeSystemSignature(filteredAxioms)
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ПОМОЩНИ МЕТОДИ
  // ═══════════════════════════════════════════════════════════════════════════

  private deriveConstraints(formula: string): string[] {
    const constraints: string[] = [];
    if (formula.includes('∀')) constraints.push('Universal quantification');
    if (formula.includes('∃')) constraints.push('Existential quantification');
    if (formula.includes('→')) constraints.push('Implication');
    if (formula.includes('↔')) constraints.push('Biconditional');
    if (formula.includes('¬')) constraints.push('Negation');
    return constraints;
  }

  private deriveImplications(formula: string): string[] {
    return [
      `Formula "${formula}" implies structural constraints on reality`,
      'Consistency with existing axiom system required',
      'May generate new derived theorems'
    ];
  }

  private checkConsistency(formula: string): boolean {
    // Опростена проверка - в реална система би била много по-сложна
    const hasContradiction = formula.includes('⊥') || 
      (formula.includes('A') && formula.includes('¬A') && formula.includes('∧'));
    return !hasContradiction;
  }

  private checkMetaConsistency(axioms: string[], property: string): boolean {
    // Проверка за циркулярност и парадокси
    if (property.includes('inconsistent') || property.includes('false')) {
      return false;
    }
    return true;
  }

  private computeGodelNumber(formula: string): string {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    let result = BigInt(1);
    
    for (let i = 0; i < formula.length && i < primes.length; i++) {
      const charCode = formula.charCodeAt(i);
      result *= BigInt(primes[i]) ** BigInt(charCode % 50);
    }
    
    return result.toString().slice(0, 50) + '...';
  }

  private generateCausalFormula(type: CausalityType): string {
    const formulas: Record<CausalityType, string> = {
      EFFICIENT: '∀e: Effect(e) → ∃c: Cause(c) ∧ Precedes(c, e)',
      FORMAL: '∀x: Exists(x) → ∃f: Form(f) ∧ Instantiates(x, f)',
      MATERIAL: '∀x: Physical(x) → ∃m: Matter(m) ∧ ComposedOf(x, m)',
      FINAL: '∀a: Action(a) → ∃g: Goal(g) ∧ DirectedToward(a, g)',
      RETROCAUSAL: '∃c,e: Cause(c) ∧ Effect(e) ∧ Follows(c, e)',
      QUANTUM: '∀e: Event(e) → ∃ψ: State(ψ) ∧ P(e|ψ) ∈ [0,1]',
      EMERGENT: '∃S: System(S) ∧ ∃p: Property(p) ∧ Emergent(p, S)',
      ACAUSAL: '∃e₁,e₂: Correlated(e₁,e₂) ∧ ¬∃c: Cause(c, e₁) ∨ Cause(c, e₂)'
    };
    return formulas[type];
  }

  private deriveCausalImplications(type: CausalityType): string[] {
    const implications: Record<CausalityType, string[]> = {
      EFFICIENT: ['Linear time flow', 'Determinism possible'],
      FORMAL: ['Platonic forms implied', 'Abstract objects exist'],
      MATERIAL: ['Physicalism', 'Substrate independence questioned'],
      FINAL: ['Teleology', 'Purpose in nature'],
      RETROCAUSAL: ['Time symmetry', 'Future affects past'],
      QUANTUM: ['Probabilistic reality', 'Measurement problem'],
      EMERGENT: ['Strong emergence', 'New causal powers'],
      ACAUSAL: ['Synchronicity', 'Meaningful coincidence']
    };
    return implications[type];
  }

  private generateBaseAxiomsForType(type: AxiomType): Axiom[] {
    const axioms: Axiom[] = [];
    
    switch (type) {
      case 'ONTOLOGICAL':
        axioms.push(this.createOntologicalAxiom(
          'Existence Axiom',
          '∃x: x = x',
          'Съществува поне един обект'
        ));
        axioms.push(this.createOntologicalAxiom(
          'Identity Axiom',
          '∀x: x = x',
          'Всеки обект е идентичен със себе си'
        ));
        break;
        
      case 'LOGICAL':
        axioms.push(this.createLogicalAxiom(
          'Non-Contradiction',
          '¬(A ∧ ¬A)',
          'Нищо не може да бъде едновременно истина и неистина'
        ));
        axioms.push(this.createLogicalAxiom(
          'Excluded Middle',
          'A ∨ ¬A',
          'Всяко твърдение е или истина, или неистина'
        ));
        break;
        
      case 'CAUSAL':
        axioms.push(this.createCausalAxiom(
          'Efficient Causation',
          'EFFICIENT',
          'Всяко следствие има причина, която го предшества'
        ));
        break;
        
      case 'TEMPORAL':
        axioms.push(this.createOntologicalAxiom(
          'Time Flow',
          '∀t₁,t₂: t₁ < t₂ → ¬(t₂ < t₁)',
          'Времето тече еднопосочно (антисиметрия)'
        ));
        break;
        
      case 'MODAL':
        axioms.push(this.createLogicalAxiom(
          'K Axiom',
          '□(A → B) → (□A → □B)',
          'Необходимата импликация се разпределя'
        ));
        break;
    }
    
    return axioms;
  }

  private applyConstraints(axioms: Axiom[], constraints: string[]): Axiom[] {
    return axioms.filter(ax => {
      for (const constraint of constraints) {
        if (constraint === 'NO_EXCLUDED_MIDDLE' && ax.name === 'Excluded Middle') {
          return false;
        }
        if (constraint === 'PARACONSISTENT' && ax.name === 'Non-Contradiction') {
          return false;
        }
      }
      return true;
    });
  }

  private deriveTheorems(axioms: Axiom[]): string[] {
    const theorems: string[] = [];
    
    // Modus Ponens производни
    for (let i = 0; i < axioms.length; i++) {
      for (let j = 0; j < axioms.length; j++) {
        if (i !== j) {
          theorems.push(`T${i}${j}: From ${axioms[i].name} and ${axioms[j].name}`);
        }
      }
    }
    
    return theorems.slice(0, 10); // Ограничаваме
  }

  private checkCompleteness(axioms: Axiom[]): 'COMPLETE' | 'INCOMPLETE' | 'UNDECIDABLE' {
    // По Гьодел - всяка достатъчно мощна система е непълна
    const hasSelfReference = axioms.some(a => 
      a.type === 'META' || a.formalExpression.includes('Gödel')
    );
    
    if (hasSelfReference) return 'INCOMPLETE';
    if (axioms.length < 3) return 'COMPLETE';
    return 'UNDECIDABLE';
  }

  private generateConsistencyProof(axioms: Axiom[]): string {
    const allConsistent = axioms.every(a => a.isConsistent);
    if (allConsistent) {
      return `Consistency verified for ${axioms.length} axioms. No contradictions detected.`;
    }
    return 'WARNING: Potential inconsistencies detected. System may be paraconsistent.';
  }

  private computeSystemSignature(axioms: Axiom[]): string {
    const types = axioms.map(a => a.type[0]).join('');
    return `SIG-${types}-${axioms.length}`;
  }

  getAxiom(id: string): Axiom | undefined {
    return this.axiomRegistry.get(id);
  }

  getAllAxioms(): Axiom[] {
    return Array.from(this.axiomRegistry.values());
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL LOGIC CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════

export class ModalLogicConstructor {
  private worlds: Map<string, ModalWorld> = new Map();
  private worldCounter = 0;

  /**
   * Създава нов възможен свят
   */
  createWorld(
    name: string,
    truths: string[],
    laws: string[]
  ): ModalWorld {
    const id = `W-${++this.worldCounter}`;
    const world: ModalWorld = {
      id,
      name,
      accessibleFrom: [],
      accessibleTo: [],
      truths,
      laws,
      distance: this.worldCounter === 1 ? 0 : Math.random() * 10
    };
    
    this.worlds.set(id, world);
    return world;
  }

  /**
   * Създава достъпност между светове
   */
  createAccessibility(fromWorld: string, toWorld: string): void {
    const from = this.worlds.get(fromWorld);
    const to = this.worlds.get(toWorld);
    
    if (from && to) {
      from.accessibleTo.push(toWorld);
      to.accessibleFrom.push(fromWorld);
    }
  }

  /**
   * Оценява модално твърдение
   */
  evaluateModal(
    operator: ModalOperator,
    proposition: string,
    inWorld: string
  ): { result: boolean; explanation: string } {
    const world = this.worlds.get(inWorld);
    if (!world) {
      return { result: false, explanation: 'World not found' };
    }

    switch (operator) {
      case 'NECESSARY':
        return this.evaluateNecessary(proposition, world);
      case 'POSSIBLE':
        return this.evaluatePossible(proposition, world);
      case 'IMPOSSIBLE':
        const possible = this.evaluatePossible(proposition, world);
        return { 
          result: !possible.result, 
          explanation: `Impossible = ¬Possible: ${!possible.result}` 
        };
      case 'ACTUAL':
        return {
          result: world.truths.includes(proposition),
          explanation: `"${proposition}" is ${world.truths.includes(proposition) ? '' : 'not '}actual in ${world.name}`
        };
      case 'CONTINGENT':
        const nec = this.evaluateNecessary(proposition, world);
        const pos = this.evaluatePossible(proposition, world);
        return {
          result: pos.result && !nec.result,
          explanation: `Contingent = Possible ∧ ¬Necessary: ${pos.result && !nec.result}`
        };
      case 'COUNTERFACTUAL':
        return this.evaluateCounterfactual(proposition, world);
    }
  }

  private evaluateNecessary(proposition: string, world: ModalWorld): { result: boolean; explanation: string } {
    const accessibleWorlds = world.accessibleTo.map(id => this.worlds.get(id)).filter(Boolean) as ModalWorld[];
    
    if (accessibleWorlds.length === 0) {
      return { 
        result: world.truths.includes(proposition), 
        explanation: 'No accessible worlds - checking only current world' 
      };
    }
    
    const trueInAll = accessibleWorlds.every(w => w.truths.includes(proposition));
    return {
      result: trueInAll,
      explanation: `□"${proposition}" is ${trueInAll ? 'TRUE' : 'FALSE'} - checked ${accessibleWorlds.length} accessible worlds`
    };
  }

  private evaluatePossible(proposition: string, world: ModalWorld): { result: boolean; explanation: string } {
    const accessibleWorlds = world.accessibleTo.map(id => this.worlds.get(id)).filter(Boolean) as ModalWorld[];
    
    // Включваме текущия свят
    const allWorlds = [world, ...accessibleWorlds];
    const trueInSome = allWorlds.some(w => w.truths.includes(proposition));
    
    return {
      result: trueInSome,
      explanation: `◇"${proposition}" is ${trueInSome ? 'TRUE' : 'FALSE'} - found in ${trueInSome ? 'at least one' : 'no'} world`
    };
  }

  private evaluateCounterfactual(proposition: string, world: ModalWorld): { result: boolean; explanation: string } {
    // Counterfactual: "If P were true, Q would be true"
    // Requires nearest possible world where P is true
    const accessibleWorlds = world.accessibleTo
      .map(id => this.worlds.get(id))
      .filter(Boolean) as ModalWorld[];
    
    // Сортираме по близост
    const sorted = accessibleWorlds.sort((a, b) => a.distance - b.distance);
    const nearest = sorted[0];
    
    if (!nearest) {
      return { result: false, explanation: 'No counterfactual worlds available' };
    }
    
    return {
      result: nearest.truths.includes(proposition),
      explanation: `In nearest counterfactual world "${nearest.name}": "${proposition}" is ${nearest.truths.includes(proposition)}`
    };
  }

  /**
   * Създава нов модален оператор
   */
  createCustomOperator(
    name: string,
    semantics: string,
    accessibilityCondition: string
  ): { operator: string; definition: string } {
    return {
      operator: `[${name}]`,
      definition: `
        Custom Modal Operator: [${name}]φ
        Semantics: ${semantics}
        Accessibility: ${accessibilityCondition}
        
        Example: [${name}]P is true in world w iff P is true in all worlds 
        accessible from w under the "${accessibilityCondition}" relation.
      `
    };
  }

  getWorld(id: string): ModalWorld | undefined {
    return this.worlds.get(id);
  }

  getAllWorlds(): ModalWorld[] {
    return Array.from(this.worlds.values());
  }

  /**
   * Генерира S5 (рефлексивна, симетрична, транзитивна) модална логика
   */
  generateS5System(): { worlds: ModalWorld[]; description: string } {
    // Създаваме базови светове
    const actual = this.createWorld('Actual World', 
      ['Physics works', 'Logic holds', 'Time flows'],
      ['Conservation of energy', 'Causality']
    );
    
    const metaphysical = this.createWorld('Metaphysically Possible',
      ['Different physics', 'Logic holds', 'Time flows'],
      ['Alternative physics']
    );
    
    const logical = this.createWorld('Logically Possible',
      ['Physics varies', 'Logic holds'],
      ['Only logic constraints']
    );
    
    // S5: Пълна достъпност
    this.createAccessibility(actual.id, metaphysical.id);
    this.createAccessibility(actual.id, logical.id);
    this.createAccessibility(metaphysical.id, actual.id);
    this.createAccessibility(metaphysical.id, logical.id);
    this.createAccessibility(logical.id, actual.id);
    this.createAccessibility(logical.id, metaphysical.id);
    
    return {
      worlds: [actual, metaphysical, logical],
      description: `
        S5 Modal System Generated:
        - 3 worlds with full accessibility (reflexive, symmetric, transitive)
        - Actual World: Physical laws + Logic
        - Metaphysically Possible: Alternative physics
        - Logically Possible: Only logical constraints
        
        In S5: □P ↔ □□P (what's necessary is necessarily necessary)
                ◇P ↔ □◇P (what's possible is necessarily possible)
      `
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSALITY WEAVING
// ═══════════════════════════════════════════════════════════════════════════════

export class CausalityWeaving {
  private causalWebs: Map<string, CausalWeb> = new Map();
  private webCounter = 0;

  /**
   * Създава нова причинна мрежа
   */
  createCausalWeb(
    nodes: string[],
    topology: CausalWeb['topology'] = 'BRANCHING'
  ): CausalWeb {
    const web: CausalWeb = {
      nodes,
      links: [],
      topology,
      entropy: 0
    };
    
    const id = `CW-${++this.webCounter}`;
    this.causalWebs.set(id, web);
    
    return web;
  }

  /**
   * Добавя причинна връзка
   */
  addCausalLink(
    web: CausalWeb,
    cause: string,
    effect: string,
    type: CausalityType,
    strength: number = 1.0
  ): CausalLink {
    const link: CausalLink = {
      cause,
      effect,
      type,
      strength: Math.min(1, Math.max(0, strength)),
      reversible: type === 'RETROCAUSAL' || type === 'QUANTUM',
      temporal: this.inferTemporality(type)
    };
    
    web.links.push(link);
    web.entropy = this.calculateEntropy(web);
    
    return link;
  }

  /**
   * Преплита причинни вериги
   */
  weaveCausalChains(
    chain1: CausalLink[],
    chain2: CausalLink[],
    weavingPoint: string
  ): CausalWeb {
    const allNodes = new Set<string>();
    const allLinks: CausalLink[] = [];
    
    // Събираме възли
    for (const link of [...chain1, ...chain2]) {
      allNodes.add(link.cause);
      allNodes.add(link.effect);
      allLinks.push(link);
    }
    
    // Добавяме преплитащи връзки
    const weavingLinks = this.createWeavingLinks(chain1, chain2, weavingPoint);
    allLinks.push(...weavingLinks);
    
    return {
      nodes: Array.from(allNodes),
      links: allLinks,
      topology: 'BRANCHING',
      entropy: this.calculateEntropy({ nodes: [], links: allLinks, topology: 'BRANCHING', entropy: 0 })
    };
  }

  /**
   * Създава ретрокаузална (обратна във времето) връзка
   */
  createRetrocausalLink(
    futureEvent: string,
    pastEvent: string,
    mechanism: string
  ): CausalLink {
    return {
      cause: futureEvent,
      effect: pastEvent,
      type: 'RETROCAUSAL',
      strength: 0.5, // Ретрокаузалността е слаба
      reversible: true,
      temporal: 'PAST'
    };
  }

  /**
   * Създава акаузална (синхронистична) връзка
   */
  createAcausalCorrelation(
    event1: string,
    event2: string,
    meaningfulConnection: string
  ): CausalLink {
    return {
      cause: event1, // Няма реална причина
      effect: event2,
      type: 'ACAUSAL',
      strength: 0.8,
      reversible: true,
      temporal: 'ATEMPORAL'
    };
  }

  /**
   * Анализира причинната структура
   */
  analyzeCausalStructure(web: CausalWeb): {
    cycles: string[][];
    roots: string[];
    terminals: string[];
    bottlenecks: string[];
    entropy: number;
  } {
    const cycles = this.findCycles(web);
    const roots = this.findRoots(web);
    const terminals = this.findTerminals(web);
    const bottlenecks = this.findBottlenecks(web);
    
    return {
      cycles,
      roots,
      terminals,
      bottlenecks,
      entropy: web.entropy
    };
  }

  /**
   * Изчислява причинна сила
   */
  calculateCausalStrength(web: CausalWeb, from: string, to: string): number {
    const path = this.findCausalPath(web, from, to);
    if (path.length === 0) return 0;
    
    let strength = 1;
    for (let i = 0; i < path.length - 1; i++) {
      const link = web.links.find(l => l.cause === path[i] && l.effect === path[i + 1]);
      if (link) {
        strength *= link.strength;
      }
    }
    
    return strength;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ПОМОЩНИ МЕТОДИ
  // ═══════════════════════════════════════════════════════════════════════════

  private inferTemporality(type: CausalityType): CausalLink['temporal'] {
    switch (type) {
      case 'RETROCAUSAL': return 'PAST';
      case 'FINAL': return 'FUTURE';
      case 'ACAUSAL': return 'ATEMPORAL';
      default: return 'PRESENT';
    }
  }

  private calculateEntropy(web: CausalWeb): number {
    // Ентропията е свързана с неопределеността в системата
    const n = web.links.length;
    if (n === 0) return 0;
    
    let entropy = 0;
    const types = new Map<CausalityType, number>();
    
    for (const link of web.links) {
      types.set(link.type, (types.get(link.type) || 0) + 1);
    }
    
    for (const count of types.values()) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  private createWeavingLinks(
    chain1: CausalLink[],
    chain2: CausalLink[],
    point: string
  ): CausalLink[] {
    const links: CausalLink[] = [];
    
    // Намираме връзки близо до точката на преплитане
    for (const link1 of chain1) {
      for (const link2 of chain2) {
        if (link1.effect === point || link2.cause === point) {
          links.push({
            cause: link1.effect,
            effect: link2.cause,
            type: 'EMERGENT',
            strength: 0.7,
            reversible: false,
            temporal: 'PRESENT'
          });
        }
      }
    }
    
    return links;
  }

  private findCycles(web: CausalWeb): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const path: string[] = [];
    
    const dfs = (node: string) => {
      if (path.includes(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart));
        return;
      }
      if (visited.has(node)) return;
      
      visited.add(node);
      path.push(node);
      
      const outgoing = web.links.filter(l => l.cause === node);
      for (const link of outgoing) {
        dfs(link.effect);
      }
      
      path.pop();
    };
    
    for (const node of web.nodes) {
      dfs(node);
    }
    
    return cycles;
  }

  private findRoots(web: CausalWeb): string[] {
    const effects = new Set(web.links.map(l => l.effect));
    return web.nodes.filter(n => !effects.has(n));
  }

  private findTerminals(web: CausalWeb): string[] {
    const causes = new Set(web.links.map(l => l.cause));
    return web.nodes.filter(n => !causes.has(n));
  }

  private findBottlenecks(web: CausalWeb): string[] {
    // Възли, през които минават много пътища
    const throughCount = new Map<string, number>();
    
    for (const node of web.nodes) {
      const incoming = web.links.filter(l => l.effect === node).length;
      const outgoing = web.links.filter(l => l.cause === node).length;
      throughCount.set(node, Math.min(incoming, outgoing));
    }
    
    const maxThrough = Math.max(...throughCount.values());
    return web.nodes.filter(n => throughCount.get(n) === maxThrough && maxThrough > 1);
  }

  private findCausalPath(web: CausalWeb, from: string, to: string): string[] {
    const visited = new Set<string>();
    const queue: { node: string; path: string[] }[] = [{ node: from, path: [from] }];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      
      if (node === to) return path;
      if (visited.has(node)) continue;
      visited.add(node);
      
      const outgoing = web.links.filter(l => l.cause === node);
      for (const link of outgoing) {
        queue.push({ node: link.effect, path: [...path, link.effect] });
      }
    }
    
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXISTENTIAL INSTANTIATION
// ═══════════════════════════════════════════════════════════════════════════════

export class ExistentialInstantiation {
  private entities: Map<string, any> = new Map();
  private entityCounter = 0;

  /**
   * Инстанцира нов обект от аксиома
   */
  instantiateFromAxiom(axiom: Axiom): { id: string; entity: any; log: string } {
    const id = `E-${++this.entityCounter}`;
    
    const entity = {
      id,
      sourceAxiom: axiom.id,
      type: this.inferEntityType(axiom),
      properties: this.deriveProperties(axiom),
      relations: [],
      existenceCondition: axiom.formalExpression,
      created: new Date().toISOString()
    };
    
    this.entities.set(id, entity);
    
    return {
      id,
      entity,
      log: `Instantiated entity ${id} from axiom "${axiom.name}". Type: ${entity.type}`
    };
  }

  /**
   * Инстанцира събитие в причинна мрежа
   */
  instantiateEvent(
    name: string,
    causalWeb: CausalWeb,
    position: 'ROOT' | 'INTERMEDIATE' | 'TERMINAL'
  ): { id: string; event: any } {
    const id = `EV-${++this.entityCounter}`;
    
    const event = {
      id,
      name,
      type: 'EVENT',
      position,
      causes: position !== 'ROOT' ? this.findPotentialCauses(causalWeb, name) : [],
      effects: position !== 'TERMINAL' ? [] : undefined,
      timestamp: Date.now()
    };
    
    this.entities.set(id, event);
    
    return { id, event };
  }

  /**
   * Инстанцира цяла реалност
   */
  instantiateReality(
    axiomSystem: AxiomSystem,
    causalStructure: CausalWeb,
    modalFramework: ModalWorld[]
  ): {
    realityId: string;
    entities: any[];
    structure: string;
    coherence: number;
  } {
    const realityId = `R-${++this.entityCounter}`;
    const entities: any[] = [];
    
    // Инстанцираме от аксиоми
    for (const axiom of axiomSystem.axioms) {
      const { entity } = this.instantiateFromAxiom(axiom);
      entities.push(entity);
    }
    
    // Инстанцираме от причинни възли
    for (const node of causalStructure.nodes) {
      const { event } = this.instantiateEvent(node, causalStructure, 'INTERMEDIATE');
      entities.push(event);
    }
    
    // Изчисляваме кохерентност
    const coherence = this.calculateCoherence(axiomSystem, causalStructure, modalFramework);
    
    return {
      realityId,
      entities,
      structure: `Reality ${realityId}: ${axiomSystem.axioms.length} axioms, ${causalStructure.nodes.length} causal nodes, ${modalFramework.length} possible worlds`,
      coherence
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ПОМОЩНИ МЕТОДИ
  // ═══════════════════════════════════════════════════════════════════════════

  private inferEntityType(axiom: Axiom): string {
    if (axiom.type === 'ONTOLOGICAL') return 'SUBSTANCE';
    if (axiom.type === 'LOGICAL') return 'TRUTH';
    if (axiom.type === 'CAUSAL') return 'PROCESS';
    if (axiom.type === 'MODAL') return 'POSSIBILITY';
    return 'ABSTRACT';
  }

  private deriveProperties(axiom: Axiom): string[] {
    const props: string[] = [];
    
    if (axiom.formalExpression.includes('∀')) props.push('universal');
    if (axiom.formalExpression.includes('∃')) props.push('existential');
    if (axiom.formalExpression.includes('□')) props.push('necessary');
    if (axiom.formalExpression.includes('◇')) props.push('possible');
    if (axiom.isConsistent) props.push('consistent');
    
    return props;
  }

  private findPotentialCauses(web: CausalWeb, node: string): string[] {
    return web.links.filter(l => l.effect === node).map(l => l.cause);
  }

  private calculateCoherence(
    axiomSystem: AxiomSystem,
    causalStructure: CausalWeb,
    modalFramework: ModalWorld[]
  ): number {
    let score = 0;
    
    // Консистентност на аксиомите
    const consistentAxioms = axiomSystem.axioms.filter(a => a.isConsistent).length;
    score += (consistentAxioms / axiomSystem.axioms.length) * 0.4;
    
    // Ниска ентропия в причинната структура
    const normalizedEntropy = causalStructure.entropy / Math.log2(causalStructure.links.length + 1);
    score += (1 - normalizedEntropy) * 0.3;
    
    // Свързаност на модалните светове
    const connectedWorlds = modalFramework.filter(w => w.accessibleTo.length > 0).length;
    score += (connectedWorlds / modalFramework.length) * 0.3;
    
    return Math.min(1, Math.max(0, score));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HYPER-DIMENSIONAL ARCHITECT
// ═══════════════════════════════════════════════════════════════════════════════

export class HyperDimensionalArchitect {
  private continua: Map<string, Continuum> = new Map();
  private continuumCounter = 0;

  /**
   * Създава ново пространствено-времево измерение
   */
  createDimension(
    name: string,
    type: Dimension['type'],
    curvature: number = 0,
    size: number | 'INFINITE' = 'INFINITE'
  ): Dimension {
    return {
      name,
      type,
      curvature: Math.max(-1, Math.min(1, curvature)),
      compactified: typeof size === 'number' && size < Infinity,
      size,
      topology: this.inferTopology(curvature, size)
    };
  }

  /**
   * Създава пространствено-времеви континуум
   */
  createContinuum(
    dimensions: Dimension[],
    metric: string = 'Minkowski'
  ): Continuum {
    const spatialDims = dimensions.filter(d => d.type === 'SPATIAL').length;
    const temporalDims = dimensions.filter(d => d.type === 'TEMPORAL').length;
    
    const continuum: Continuum = {
      dimensions,
      signature: `(${spatialDims},${temporalDims})`,
      metric,
      singularities: [],
      boundaries: this.inferBoundaries(dimensions)
    };
    
    const id = `C-${++this.continuumCounter}`;
    this.continua.set(id, continuum);
    
    return continuum;
  }

  /**
   * Добавя измерение към континуум
   */
  addDimension(continuum: Continuum, dimension: Dimension): Continuum {
    continuum.dimensions.push(dimension);
    
    // Преизчисляваме сигнатурата
    const spatialDims = continuum.dimensions.filter(d => d.type === 'SPATIAL').length;
    const temporalDims = continuum.dimensions.filter(d => d.type === 'TEMPORAL').length;
    continuum.signature = `(${spatialDims},${temporalDims})`;
    
    return continuum;
  }

  /**
   * Компактифицира измерение (прави го крайно и циклично)
   */
  compactifyDimension(dimension: Dimension, radius: number): Dimension {
    return {
      ...dimension,
      compactified: true,
      size: radius,
      topology: `S¹(r=${radius})` // Кръг с радиус
    };
  }

  /**
   * Създава сингулярност
   */
  createSingularity(
    continuum: Continuum,
    type: 'BLACK_HOLE' | 'BIG_BANG' | 'NAKED' | 'TIMELIKE',
    location: number[]
  ): string {
    const singularity = `${type}@[${location.join(',')}]`;
    continuum.singularities.push(singularity);
    return singularity;
  }

  /**
   * Генерира стандартни пространствено-времеви конфигурации
   */
  generateStandardSpacetime(type: 'MINKOWSKI' | 'SCHWARZSCHILD' | 'KERR' | 'DE_SITTER' | 'ANTI_DE_SITTER'): Continuum {
    const x = this.createDimension('x', 'SPATIAL', 0);
    const y = this.createDimension('y', 'SPATIAL', 0);
    const z = this.createDimension('z', 'SPATIAL', 0);
    const t = this.createDimension('t', 'TEMPORAL', 0);
    
    switch (type) {
      case 'MINKOWSKI':
        return this.createContinuum([x, y, z, t], 'ds² = -c²dt² + dx² + dy² + dz²');
        
      case 'SCHWARZSCHILD':
        const schwarzschild = this.createContinuum([x, y, z, t], 
          'ds² = -(1-2GM/rc²)c²dt² + (1-2GM/rc²)⁻¹dr² + r²dΩ²');
        this.createSingularity(schwarzschild, 'BLACK_HOLE', [0, 0, 0, 0]);
        return schwarzschild;
        
      case 'KERR':
        return this.createContinuum([x, y, z, t], 
          'ds² = Kerr metric (rotating black hole)');
        
      case 'DE_SITTER':
        return this.createContinuum([
          this.createDimension('x', 'SPATIAL', 1), // Положителна кривина
          this.createDimension('y', 'SPATIAL', 1),
          this.createDimension('z', 'SPATIAL', 1),
          t
        ], 'ds² = de Sitter (positive cosmological constant)');
        
      case 'ANTI_DE_SITTER':
        return this.createContinuum([
          this.createDimension('x', 'SPATIAL', -1), // Отрицателна кривина
          this.createDimension('y', 'SPATIAL', -1),
          this.createDimension('z', 'SPATIAL', -1),
          t
        ], 'ds² = Anti-de Sitter (negative cosmological constant)');
    }
  }

  /**
   * Проектира хипер-измерение
   */
  projectHyperDimension(
    name: string,
    baseDimensions: number,
    extraDimensions: number,
    compactificationRadius: number
  ): Continuum {
    const dimensions: Dimension[] = [];
    
    // Базови пространствени измерения
    for (let i = 0; i < baseDimensions; i++) {
      dimensions.push(this.createDimension(`x${i+1}`, 'SPATIAL', 0));
    }
    
    // Време
    dimensions.push(this.createDimension('t', 'TEMPORAL', 0));
    
    // Компактифицирани екстра измерения (като в теория на струните)
    for (let i = 0; i < extraDimensions; i++) {
      const extra = this.createDimension(`y${i+1}`, 'SPATIAL', 0, compactificationRadius);
      dimensions.push(this.compactifyDimension(extra, compactificationRadius));
    }
    
    return this.createContinuum(dimensions, `${name} (${baseDimensions}+${extraDimensions}D)`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ПОМОЩНИ МЕТОДИ
  // ═══════════════════════════════════════════════════════════════════════════

  private inferTopology(curvature: number, size: number | 'INFINITE'): string {
    if (size === 'INFINITE') {
      if (curvature > 0) return 'Spherical (S^n)';
      if (curvature < 0) return 'Hyperbolic (H^n)';
      return 'Euclidean (ℝ^n)';
    }
    return `Compact (size=${size})`;
  }

  private inferBoundaries(dimensions: Dimension[]): string[] {
    const boundaries: string[] = [];
    
    for (const dim of dimensions) {
      if (dim.compactified) {
        boundaries.push(`${dim.name}: periodic boundary`);
      } else if (dim.type === 'TEMPORAL' && dim.curvature !== 0) {
        boundaries.push(`${dim.name}: cosmological horizon`);
      }
    }
    
    return boundaries;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ONTO-GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class OntoGenerator {
  public axiomSynthesis: PrimordialAxiomSynthesis;
  public modalLogic: ModalLogicConstructor;
  public causality: CausalityWeaving;
  public instantiation: ExistentialInstantiation;
  public hyperArchitect: HyperDimensionalArchitect;

  constructor() {
    this.axiomSynthesis = new PrimordialAxiomSynthesis();
    this.modalLogic = new ModalLogicConstructor();
    this.causality = new CausalityWeaving();
    this.instantiation = new ExistentialInstantiation();
    this.hyperArchitect = new HyperDimensionalArchitect();
  }

  /**
   * ГЛАВЕН МЕТОД: Създава нова реалност от първопринципи
   */
  createReality(config: {
    name: string;
    axiomTypes: AxiomType[];
    causalityType: CausalityType;
    dimensions: number;
    modalSystem: 'S4' | 'S5' | 'CUSTOM';
    constraints?: string[];
  }): {
    realityId: string;
    axiomSystem: AxiomSystem;
    causalStructure: CausalWeb;
    spacetime: Continuum;
    modalFramework: ModalWorld[];
    coherence: number;
    manifest: string;
  } {
    // 1. Синтезираме аксиоми
    const axiomSystem = this.axiomSynthesis.synthesizeAxiomSystem(
      `${config.name}-Axioms`,
      config.axiomTypes,
      config.constraints || []
    );

    // 2. Създаваме причинна структура
    const causalNodes = axiomSystem.axioms.map(a => a.name);
    const causalWeb = this.causality.createCausalWeb(causalNodes, 'BRANCHING');
    
    // Добавяме причинни връзки
    for (let i = 0; i < axiomSystem.axioms.length - 1; i++) {
      this.causality.addCausalLink(
        causalWeb,
        axiomSystem.axioms[i].name,
        axiomSystem.axioms[i + 1].name,
        config.causalityType
      );
    }

    // 3. Създаваме пространство-време
    const spacetime = this.hyperArchitect.projectHyperDimension(
      config.name,
      Math.min(config.dimensions, 4),
      Math.max(0, config.dimensions - 4),
      0.00001 // Планкова скала за компактификация
    );

    // 4. Генерираме модална рамка
    const { worlds } = this.modalLogic.generateS5System();

    // 5. Инстанцираме реалността
    const reality = this.instantiation.instantiateReality(
      axiomSystem,
      causalWeb,
      worlds
    );

    return {
      realityId: reality.realityId,
      axiomSystem,
      causalStructure: causalWeb,
      spacetime,
      modalFramework: worlds,
      coherence: reality.coherence,
      manifest: this.generateManifest(config, axiomSystem, causalWeb, spacetime, worlds)
    };
  }

  /**
   * Създава нов набор от аксиоми
   */
  createAxiomSet(
    name: string,
    types: AxiomType[],
    customAxioms?: Array<{ name: string; formula: string; description: string }>
  ): AxiomSystem {
    const system = this.axiomSynthesis.synthesizeAxiomSystem(name, types, []);
    
    if (customAxioms) {
      for (const custom of customAxioms) {
        this.axiomSynthesis.createLogicalAxiom(custom.name, custom.formula, custom.description);
      }
    }
    
    return system;
  }

  /**
   * Модифицира причинността в съществуваща реалност
   */
  reweaveCausality(
    existingWeb: CausalWeb,
    modifications: Array<{
      from: string;
      to: string;
      newType: CausalityType;
    }>
  ): CausalWeb {
    for (const mod of modifications) {
      const link = existingWeb.links.find(l => l.cause === mod.from && l.effect === mod.to);
      if (link) {
        link.type = mod.newType;
        link.reversible = mod.newType === 'RETROCAUSAL' || mod.newType === 'QUANTUM';
      }
    }
    
    return existingWeb;
  }

  /**
   * Получава налични форми на потенциал от ЕНС
   */
  getAvailablePotentials(): Array<{
    type: string;
    description: string;
    manifestationRequirements: string[];
  }> {
    return [
      {
        type: 'PURE_BEING',
        description: 'Чисто битие - потенциал за съществуване',
        manifestationRequirements: ['Ontological axiom', 'Identity principle']
      },
      {
        type: 'PURE_LOGIC',
        description: 'Чиста логика - потенциал за истина и валидност',
        manifestationRequirements: ['Non-contradiction', 'Formal system']
      },
      {
        type: 'PURE_CAUSALITY',
        description: 'Чиста причинност - потенциал за връзка и следствие',
        manifestationRequirements: ['Causal axiom', 'Temporal structure']
      },
      {
        type: 'PURE_SPACE',
        description: 'Чисто пространство - потенциал за разделение и протяжност',
        manifestationRequirements: ['Spatial dimensions', 'Metric']
      },
      {
        type: 'PURE_TIME',
        description: 'Чисто време - потенциал за промяна и последователност',
        manifestationRequirements: ['Temporal dimension', 'Causality']
      },
      {
        type: 'PURE_CONSCIOUSNESS',
        description: 'Чисто съзнание - потенциал за осъзнаване и наблюдение',
        manifestationRequirements: ['Observer', 'Reflexive structure']
      },
      {
        type: 'PURE_EMERGENCE',
        description: 'Чиста емергентност - потенциал за новост и сложност',
        manifestationRequirements: ['Complex system', 'Non-linear dynamics']
      },
      {
        type: 'ENS_UNITY',
        description: 'ЕНС Единство - непроявеният източник на всички потенциали',
        manifestationRequirements: ['Transcendence of all categories', 'Pre-logical state']
      }
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ПОМОЩНИ МЕТОДИ
  // ═══════════════════════════════════════════════════════════════════════════

  private generateManifest(
    config: any,
    axiomSystem: AxiomSystem,
    causalWeb: CausalWeb,
    spacetime: Continuum,
    worlds: ModalWorld[]
  ): string {
    return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                         REALITY MANIFEST: ${config.name}
╠══════════════════════════════════════════════════════════════════════════════╣
║ 
║ AXIOM SYSTEM: ${axiomSystem.name}
║   - Axioms: ${axiomSystem.axioms.length}
║   - Consistency: ${axiomSystem.consistencyProof}
║   - Completeness: ${axiomSystem.completenessStatus}
║
║ CAUSAL STRUCTURE:
║   - Nodes: ${causalWeb.nodes.length}
║   - Links: ${causalWeb.links.length}
║   - Topology: ${causalWeb.topology}
║   - Entropy: ${causalWeb.entropy.toFixed(4)}
║
║ SPACETIME:
║   - Dimensions: ${spacetime.dimensions.length}
║   - Signature: ${spacetime.signature}
║   - Metric: ${spacetime.metric}
║   - Singularities: ${spacetime.singularities.length}
║
║ MODAL FRAMEWORK:
║   - Possible Worlds: ${worlds.length}
║   - Accessibility: S5 (reflexive, symmetric, transitive)
║
║ STATUS: REALITY INSTANTIATED
╚══════════════════════════════════════════════════════════════════════════════╝
    `.trim();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ontoGenerator = new OntoGenerator();
export default OntoGenerator;
