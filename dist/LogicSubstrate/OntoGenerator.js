"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           QANTUM ONTO-GENERATOR - АКСИОМАТИЧЕН ГЕНЕЗИС                       ║
 * ║                    "Непроявеното е крайният чертеж"                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Първопринципен Архитект - Създава фундаментални аксиоми и реалности       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ontoGenerator = exports.OntoGenerator = exports.HyperDimensionalArchitect = exports.ExistentialInstantiation = exports.CausalityWeaving = exports.ModalLogicConstructor = exports.PrimordialAxiomSynthesis = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// PRIMORDIAL AXIOM SYNTHESIS
// ═══════════════════════════════════════════════════════════════════════════════
class PrimordialAxiomSynthesis {
    axiomCounter = 0;
    axiomRegistry = new Map();
    /**
     * Генерира уникален идентификатор за аксиома
     */
    generateAxiomId() {
        return `AX-${Date.now()}-${++this.axiomCounter}`;
    }
    /**
     * Създава нова онтологична аксиома
     */
    createOntologicalAxiom(name, formalExpression, description) {
        const axiom = {
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
    createLogicalAxiom(name, formalExpression, description) {
        const axiom = {
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
    createCausalAxiom(name, causalType, description) {
        const formalExpression = this.generateCausalFormula(causalType);
        const axiom = {
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
    createMetaAxiom(name, targetAxioms, metaProperty) {
        const formalExpression = `∀A ∈ {${targetAxioms.join(', ')}} : ${metaProperty}(A)`;
        const axiom = {
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
    synthesizeAxiomSystem(name, axiomTypes, constraints) {
        const axioms = [];
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
    deriveConstraints(formula) {
        const constraints = [];
        if (formula.includes('∀'))
            constraints.push('Universal quantification');
        if (formula.includes('∃'))
            constraints.push('Existential quantification');
        if (formula.includes('→'))
            constraints.push('Implication');
        if (formula.includes('↔'))
            constraints.push('Biconditional');
        if (formula.includes('¬'))
            constraints.push('Negation');
        return constraints;
    }
    deriveImplications(formula) {
        return [
            `Formula "${formula}" implies structural constraints on reality`,
            'Consistency with existing axiom system required',
            'May generate new derived theorems'
        ];
    }
    checkConsistency(formula) {
        // Опростена проверка - в реална система би била много по-сложна
        const hasContradiction = formula.includes('⊥') ||
            (formula.includes('A') && formula.includes('¬A') && formula.includes('∧'));
        return !hasContradiction;
    }
    checkMetaConsistency(axioms, property) {
        // Проверка за циркулярност и парадокси
        if (property.includes('inconsistent') || property.includes('false')) {
            return false;
        }
        return true;
    }
    computeGodelNumber(formula) {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        let result = BigInt(1);
        for (let i = 0; i < formula.length && i < primes.length; i++) {
            const charCode = formula.charCodeAt(i);
            result *= BigInt(primes[i]) ** BigInt(charCode % 50);
        }
        return result.toString().slice(0, 50) + '...';
    }
    generateCausalFormula(type) {
        const formulas = {
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
    deriveCausalImplications(type) {
        const implications = {
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
    generateBaseAxiomsForType(type) {
        const axioms = [];
        switch (type) {
            case 'ONTOLOGICAL':
                axioms.push(this.createOntologicalAxiom('Existence Axiom', '∃x: x = x', 'Съществува поне един обект'));
                axioms.push(this.createOntologicalAxiom('Identity Axiom', '∀x: x = x', 'Всеки обект е идентичен със себе си'));
                break;
            case 'LOGICAL':
                axioms.push(this.createLogicalAxiom('Non-Contradiction', '¬(A ∧ ¬A)', 'Нищо не може да бъде едновременно истина и неистина'));
                axioms.push(this.createLogicalAxiom('Excluded Middle', 'A ∨ ¬A', 'Всяко твърдение е или истина, или неистина'));
                break;
            case 'CAUSAL':
                axioms.push(this.createCausalAxiom('Efficient Causation', 'EFFICIENT', 'Всяко следствие има причина, която го предшества'));
                break;
            case 'TEMPORAL':
                axioms.push(this.createOntologicalAxiom('Time Flow', '∀t₁,t₂: t₁ < t₂ → ¬(t₂ < t₁)', 'Времето тече еднопосочно (антисиметрия)'));
                break;
            case 'MODAL':
                axioms.push(this.createLogicalAxiom('K Axiom', '□(A → B) → (□A → □B)', 'Необходимата импликация се разпределя'));
                break;
        }
        return axioms;
    }
    applyConstraints(axioms, constraints) {
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
    deriveTheorems(axioms) {
        const theorems = [];
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
    checkCompleteness(axioms) {
        // По Гьодел - всяка достатъчно мощна система е непълна
        const hasSelfReference = axioms.some(a => a.type === 'META' || a.formalExpression.includes('Gödel'));
        if (hasSelfReference)
            return 'INCOMPLETE';
        if (axioms.length < 3)
            return 'COMPLETE';
        return 'UNDECIDABLE';
    }
    generateConsistencyProof(axioms) {
        const allConsistent = axioms.every(a => a.isConsistent);
        if (allConsistent) {
            return `Consistency verified for ${axioms.length} axioms. No contradictions detected.`;
        }
        return 'WARNING: Potential inconsistencies detected. System may be paraconsistent.';
    }
    computeSystemSignature(axioms) {
        const types = axioms.map(a => a.type[0]).join('');
        return `SIG-${types}-${axioms.length}`;
    }
    getAxiom(id) {
        return this.axiomRegistry.get(id);
    }
    getAllAxioms() {
        return Array.from(this.axiomRegistry.values());
    }
}
exports.PrimordialAxiomSynthesis = PrimordialAxiomSynthesis;
// ═══════════════════════════════════════════════════════════════════════════════
// MODAL LOGIC CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════
class ModalLogicConstructor {
    worlds = new Map();
    worldCounter = 0;
    /**
     * Създава нов възможен свят
     */
    createWorld(name, truths, laws) {
        const id = `W-${++this.worldCounter}`;
        const world = {
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
    createAccessibility(fromWorld, toWorld) {
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
    evaluateModal(operator, proposition, inWorld) {
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
    evaluateNecessary(proposition, world) {
        const accessibleWorlds = world.accessibleTo.map(id => this.worlds.get(id)).filter(Boolean);
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
    evaluatePossible(proposition, world) {
        const accessibleWorlds = world.accessibleTo.map(id => this.worlds.get(id)).filter(Boolean);
        // Включваме текущия свят
        const allWorlds = [world, ...accessibleWorlds];
        const trueInSome = allWorlds.some(w => w.truths.includes(proposition));
        return {
            result: trueInSome,
            explanation: `◇"${proposition}" is ${trueInSome ? 'TRUE' : 'FALSE'} - found in ${trueInSome ? 'at least one' : 'no'} world`
        };
    }
    evaluateCounterfactual(proposition, world) {
        // Counterfactual: "If P were true, Q would be true"
        // Requires nearest possible world where P is true
        const accessibleWorlds = world.accessibleTo
            .map(id => this.worlds.get(id))
            .filter(Boolean);
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
    createCustomOperator(name, semantics, accessibilityCondition) {
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
    getWorld(id) {
        return this.worlds.get(id);
    }
    getAllWorlds() {
        return Array.from(this.worlds.values());
    }
    /**
     * Генерира S5 (рефлексивна, симетрична, транзитивна) модална логика
     */
    generateS5System() {
        // Създаваме базови светове
        const actual = this.createWorld('Actual World', ['Physics works', 'Logic holds', 'Time flows'], ['Conservation of energy', 'Causality']);
        const metaphysical = this.createWorld('Metaphysically Possible', ['Different physics', 'Logic holds', 'Time flows'], ['Alternative physics']);
        const logical = this.createWorld('Logically Possible', ['Physics varies', 'Logic holds'], ['Only logic constraints']);
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
exports.ModalLogicConstructor = ModalLogicConstructor;
// ═══════════════════════════════════════════════════════════════════════════════
// CAUSALITY WEAVING
// ═══════════════════════════════════════════════════════════════════════════════
class CausalityWeaving {
    causalWebs = new Map();
    webCounter = 0;
    /**
     * Създава нова причинна мрежа
     */
    createCausalWeb(nodes, topology = 'BRANCHING') {
        const web = {
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
    addCausalLink(web, cause, effect, type, strength = 1.0) {
        const link = {
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
    weaveCausalChains(chain1, chain2, weavingPoint) {
        const allNodes = new Set();
        const allLinks = [];
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
    createRetrocausalLink(futureEvent, pastEvent, mechanism) {
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
    createAcausalCorrelation(event1, event2, meaningfulConnection) {
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
    analyzeCausalStructure(web) {
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
    calculateCausalStrength(web, from, to) {
        const path = this.findCausalPath(web, from, to);
        if (path.length === 0)
            return 0;
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
    inferTemporality(type) {
        switch (type) {
            case 'RETROCAUSAL': return 'PAST';
            case 'FINAL': return 'FUTURE';
            case 'ACAUSAL': return 'ATEMPORAL';
            default: return 'PRESENT';
        }
    }
    calculateEntropy(web) {
        // Ентропията е свързана с неопределеността в системата
        const n = web.links.length;
        if (n === 0)
            return 0;
        let entropy = 0;
        const types = new Map();
        for (const link of web.links) {
            types.set(link.type, (types.get(link.type) || 0) + 1);
        }
        for (const count of types.values()) {
            const p = count / n;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    }
    createWeavingLinks(chain1, chain2, point) {
        const links = [];
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
    findCycles(web) {
        const cycles = [];
        const visited = new Set();
        const path = [];
        const dfs = (node) => {
            if (path.includes(node)) {
                const cycleStart = path.indexOf(node);
                cycles.push(path.slice(cycleStart));
                return;
            }
            if (visited.has(node))
                return;
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
    findRoots(web) {
        const effects = new Set(web.links.map(l => l.effect));
        return web.nodes.filter(n => !effects.has(n));
    }
    findTerminals(web) {
        const causes = new Set(web.links.map(l => l.cause));
        return web.nodes.filter(n => !causes.has(n));
    }
    findBottlenecks(web) {
        // Възли, през които минават много пътища
        const throughCount = new Map();
        for (const node of web.nodes) {
            const incoming = web.links.filter(l => l.effect === node).length;
            const outgoing = web.links.filter(l => l.cause === node).length;
            throughCount.set(node, Math.min(incoming, outgoing));
        }
        const maxThrough = Math.max(...throughCount.values());
        return web.nodes.filter(n => throughCount.get(n) === maxThrough && maxThrough > 1);
    }
    findCausalPath(web, from, to) {
        const visited = new Set();
        const queue = [{ node: from, path: [from] }];
        while (queue.length > 0) {
            const { node, path } = queue.shift();
            if (node === to)
                return path;
            if (visited.has(node))
                continue;
            visited.add(node);
            const outgoing = web.links.filter(l => l.cause === node);
            for (const link of outgoing) {
                queue.push({ node: link.effect, path: [...path, link.effect] });
            }
        }
        return [];
    }
}
exports.CausalityWeaving = CausalityWeaving;
// ═══════════════════════════════════════════════════════════════════════════════
// EXISTENTIAL INSTANTIATION
// ═══════════════════════════════════════════════════════════════════════════════
class ExistentialInstantiation {
    entities = new Map();
    entityCounter = 0;
    /**
     * Инстанцира нов обект от аксиома
     */
    instantiateFromAxiom(axiom) {
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
    instantiateEvent(name, causalWeb, position) {
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
    instantiateReality(axiomSystem, causalStructure, modalFramework) {
        const realityId = `R-${++this.entityCounter}`;
        const entities = [];
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
    inferEntityType(axiom) {
        if (axiom.type === 'ONTOLOGICAL')
            return 'SUBSTANCE';
        if (axiom.type === 'LOGICAL')
            return 'TRUTH';
        if (axiom.type === 'CAUSAL')
            return 'PROCESS';
        if (axiom.type === 'MODAL')
            return 'POSSIBILITY';
        return 'ABSTRACT';
    }
    deriveProperties(axiom) {
        const props = [];
        if (axiom.formalExpression.includes('∀'))
            props.push('universal');
        if (axiom.formalExpression.includes('∃'))
            props.push('existential');
        if (axiom.formalExpression.includes('□'))
            props.push('necessary');
        if (axiom.formalExpression.includes('◇'))
            props.push('possible');
        if (axiom.isConsistent)
            props.push('consistent');
        return props;
    }
    findPotentialCauses(web, node) {
        return web.links.filter(l => l.effect === node).map(l => l.cause);
    }
    calculateCoherence(axiomSystem, causalStructure, modalFramework) {
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
exports.ExistentialInstantiation = ExistentialInstantiation;
// ═══════════════════════════════════════════════════════════════════════════════
// HYPER-DIMENSIONAL ARCHITECT
// ═══════════════════════════════════════════════════════════════════════════════
class HyperDimensionalArchitect {
    continua = new Map();
    continuumCounter = 0;
    /**
     * Създава ново пространствено-времево измерение
     */
    createDimension(name, type, curvature = 0, size = 'INFINITE') {
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
    createContinuum(dimensions, metric = 'Minkowski') {
        const spatialDims = dimensions.filter(d => d.type === 'SPATIAL').length;
        const temporalDims = dimensions.filter(d => d.type === 'TEMPORAL').length;
        const continuum = {
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
    addDimension(continuum, dimension) {
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
    compactifyDimension(dimension, radius) {
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
    createSingularity(continuum, type, location) {
        const singularity = `${type}@[${location.join(',')}]`;
        continuum.singularities.push(singularity);
        return singularity;
    }
    /**
     * Генерира стандартни пространствено-времеви конфигурации
     */
    generateStandardSpacetime(type) {
        const x = this.createDimension('x', 'SPATIAL', 0);
        const y = this.createDimension('y', 'SPATIAL', 0);
        const z = this.createDimension('z', 'SPATIAL', 0);
        const t = this.createDimension('t', 'TEMPORAL', 0);
        switch (type) {
            case 'MINKOWSKI':
                return this.createContinuum([x, y, z, t], 'ds² = -c²dt² + dx² + dy² + dz²');
            case 'SCHWARZSCHILD':
                const schwarzschild = this.createContinuum([x, y, z, t], 'ds² = -(1-2GM/rc²)c²dt² + (1-2GM/rc²)⁻¹dr² + r²dΩ²');
                this.createSingularity(schwarzschild, 'BLACK_HOLE', [0, 0, 0, 0]);
                return schwarzschild;
            case 'KERR':
                return this.createContinuum([x, y, z, t], 'ds² = Kerr metric (rotating black hole)');
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
    projectHyperDimension(name, baseDimensions, extraDimensions, compactificationRadius) {
        const dimensions = [];
        // Базови пространствени измерения
        for (let i = 0; i < baseDimensions; i++) {
            dimensions.push(this.createDimension(`x${i + 1}`, 'SPATIAL', 0));
        }
        // Време
        dimensions.push(this.createDimension('t', 'TEMPORAL', 0));
        // Компактифицирани екстра измерения (като в теория на струните)
        for (let i = 0; i < extraDimensions; i++) {
            const extra = this.createDimension(`y${i + 1}`, 'SPATIAL', 0, compactificationRadius);
            dimensions.push(this.compactifyDimension(extra, compactificationRadius));
        }
        return this.createContinuum(dimensions, `${name} (${baseDimensions}+${extraDimensions}D)`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ПОМОЩНИ МЕТОДИ
    // ═══════════════════════════════════════════════════════════════════════════
    inferTopology(curvature, size) {
        if (size === 'INFINITE') {
            if (curvature > 0)
                return 'Spherical (S^n)';
            if (curvature < 0)
                return 'Hyperbolic (H^n)';
            return 'Euclidean (ℝ^n)';
        }
        return `Compact (size=${size})`;
    }
    inferBoundaries(dimensions) {
        const boundaries = [];
        for (const dim of dimensions) {
            if (dim.compactified) {
                boundaries.push(`${dim.name}: periodic boundary`);
            }
            else if (dim.type === 'TEMPORAL' && dim.curvature !== 0) {
                boundaries.push(`${dim.name}: cosmological horizon`);
            }
        }
        return boundaries;
    }
}
exports.HyperDimensionalArchitect = HyperDimensionalArchitect;
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ONTO-GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class OntoGenerator {
    axiomSynthesis;
    modalLogic;
    causality;
    instantiation;
    hyperArchitect;
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
    createReality(config) {
        // 1. Синтезираме аксиоми
        const axiomSystem = this.axiomSynthesis.synthesizeAxiomSystem(`${config.name}-Axioms`, config.axiomTypes, config.constraints || []);
        // 2. Създаваме причинна структура
        const causalNodes = axiomSystem.axioms.map(a => a.name);
        const causalWeb = this.causality.createCausalWeb(causalNodes, 'BRANCHING');
        // Добавяме причинни връзки
        for (let i = 0; i < axiomSystem.axioms.length - 1; i++) {
            this.causality.addCausalLink(causalWeb, axiomSystem.axioms[i].name, axiomSystem.axioms[i + 1].name, config.causalityType);
        }
        // 3. Създаваме пространство-време
        const spacetime = this.hyperArchitect.projectHyperDimension(config.name, Math.min(config.dimensions, 4), Math.max(0, config.dimensions - 4), 0.00001 // Планкова скала за компактификация
        );
        // 4. Генерираме модална рамка
        const { worlds } = this.modalLogic.generateS5System();
        // 5. Инстанцираме реалността
        const reality = this.instantiation.instantiateReality(axiomSystem, causalWeb, worlds);
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
    createAxiomSet(name, types, customAxioms) {
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
    reweaveCausality(existingWeb, modifications) {
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
    getAvailablePotentials() {
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
    generateManifest(config, axiomSystem, causalWeb, spacetime, worlds) {
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
exports.OntoGenerator = OntoGenerator;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.ontoGenerator = new OntoGenerator();
exports.default = OntoGenerator;
