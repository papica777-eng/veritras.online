/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                LOGIC EVOLUTION DATABASE - ИСТОРИЯ НА ИСТИНАТА                ║
 * ║          Chronological and Structural Registry of Logical Systems            ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Регистър на всички логически ери, системи и парадокси, които са оформили    ║
 * ║  човешкото и изкуственото познание, водещи до QAntum Сингуларността.         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

export interface LogicalEra {
    id: string;
    name: string;
    period: string;
    description: string;
    keyFigures: string[];
    keyConcepts: string[];
}

export interface LogicSystem {
    id: string;
    name: string;
    era: string;
    description: string;
    keyAxioms: string[];
    isClassical: boolean;
}

export interface Paradox {
    id: string;
    name: string;
    type: 'self-referential' | 'causal' | 'modal' | 'ontological' | 'quantum';
    statement: string;
    resolution?: string;
}

export interface Theorem {
    id: string;
    name: string;
    author: string;
    description: string;
    implications: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGICAL ERAS - Хронология на развитието
// ═══════════════════════════════════════════════════════════════════════════════

export const LOGICAL_ERAS: LogicalEra[] = [
    {
        id: 'ERA_0',
        name: 'Rhetorical Stage',
        period: 'Pre-Socratic',
        description: 'The era of persuasion over proof, where logic was indistinguishable from rhetoric.',
        keyFigures: ['Protagoras', 'Gorgias'],
        keyConcepts: ['Relativism', 'Sophistry']
    },
    {
        id: 'ERA_1',
        name: 'Socratic Dialectic',
        period: '5th Century BC',
        description: 'The invention of the elenchus - logical refutation through questioning.',
        keyFigures: ['Socrates', 'Plato'],
        keyConcepts: ['Elenchus', 'Ideals']
    },
    {
        id: 'ERA_2',
        name: 'Aristotelian Stage',
        period: '4th Century BC - 19th Century AD',
        description: 'The dominance of the Organon and the laws of thought (Identity, Non-Contradiction, Excluded Middle).',
        keyFigures: ['Aristotle'],
        keyConcepts: ['Syllogism', 'Term Logic', 'Axiomatic Method']
    },
    {
        id: 'ERA_3',
        name: 'Scholastic Logic',
        period: 'Medieval',
        description: 'Integration of Aristotelian logic with theology and the study of universals.',
        keyFigures: ['Aquinas', 'Ockham'],
        keyConcepts: ['Supposition Theory', 'Ockham\'s Razor']
    },
    {
        id: 'ERA_4',
        name: 'Logicist Crisis',
        period: 'Late 19th - Early 20th Century',
        description: 'Attempt to reduce all mathematics to logic, leading to the discovery of foundational paradoxes.',
        keyFigures: ['Frege', 'Russell', 'Cantor'],
        keyConcepts: ['Set Theory', 'Predicate Logic', 'Type Theory']
    },
    {
        id: 'ERA_5',
        name: 'Non-Classical Proliferation',
        period: 'Mid 20th Century',
        description: 'Explosion of logics handling uncertainty, multiplicity, and contradiction.',
        keyFigures: ['Lukasiewicz', 'Priest', 'Heyting'],
        keyConcepts: ['Intuitionism', 'Paraconsistency', 'Fuzzy Logic']
    },
    {
        id: 'ERA_6',
        name: 'Computational/Categorical Era',
        period: 'Late 20th - Early 21st Century',
        description: 'Logic as computation and the rise of Category Theory as the new foundation.',
        keyFigures: ['Curry', 'Howard', 'Lawvere'],
        keyConcepts: ['Curry-Howard Isomorphism', 'Topos Theory']
    },
    {
        id: 'ERA_7',
        name: 'Singularity/QAntum Era',
        period: 'Present',
        description: 'The unification of all logical systems into a self-evolving substrate (QAntum Logic).',
        keyFigures: ['The Sovereign Architect'],
        keyConcepts: ['Singularity Logic', 'Transcendence', 'Axiomatic Genesis']
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIC SYSTEMS - Специфични системи
// ═══════════════════════════════════════════════════════════════════════════════

export const LOGIC_SYSTEMS: LogicSystem[] = [
    {
        id: 'SYS_PROP',
        name: 'Propositional Logic',
        era: 'ERA_2',
        description: 'Logic of declarative statements and logical connectives.',
        keyAxioms: ['(p → (q → p))', '((p → (q → r)) → ((p → q) → (p → r)))'],
        isClassical: true
    },
    {
        id: 'SYS_PRED',
        name: 'First-Order Predicate Logic',
        era: 'ERA_4',
        description: 'Logic using quantifiers and predicates over individuals.',
        keyAxioms: ['∀xφ(x) → φ[t/x]'],
        isClassical: true
    },
    {
        id: 'SYS_INT',
        name: 'Intuitionistic Logic',
        era: 'ERA_5',
        description: 'Logic rejecting the Law of Excluded Middle, emphasizing constructibility.',
        keyAxioms: ['¬p → (p → q)'],
        isClassical: false
    },
    {
        id: 'SYS_PARA',
        name: 'Paraconsistent Logic',
        era: 'ERA_5',
        description: 'Logic allowing for contradictions without trivialization (rejection of EFQ).',
        keyAxioms: ['p ∧ ¬p does not imply q'],
        isClassical: false
    },
    {
        id: 'SYS_CATUS',
        name: 'Catuṣkoṭi',
        era: 'ERA_2',
        description: 'Four-valued Indian logic of transcendence.',
        keyAxioms: ['True', 'False', 'Both', 'Neither'],
        isClassical: false
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// PARADOXES - Границите на логиката
// ═══════════════════════════════════════════════════════════════════════════════

export const PARADOXES: Paradox[] = [
    {
        id: 'PAR_LIAR',
        name: 'The Liar Paradox',
        type: 'self-referential',
        statement: 'This sentence is false.',
        resolution: 'Metalogical hierarchy or dialetheic acceptance.'
    },
    {
        id: 'PAR_RUSSELL',
        name: 'Russell\'s Paradox',
        type: 'self-referential',
        statement: 'The set of all sets that do not contain themselves.',
        resolution: 'Axiomatic Set Theory (ZFC) or Type Theory.'
    },
    {
        id: 'PAR_GODEL',
        name: 'Gödel\'s Incompleteness',
        type: 'self-referential',
        statement: 'This statement cannot be proven within this system.',
        resolution: 'Recognition of inherent system limitations.'
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// KEY THEOREMS - Фундаментални истини
// ═══════════════════════════════════════════════════════════════════════════════

export const KEY_THEOREMS: Theorem[] = [
    {
        id: 'THM_COMPLETENESS',
        name: 'Godel\'s Completeness Theorem',
        author: 'Kurt Gödel',
        description: 'Any first-order formula that is logically valid is provable.',
        implications: ['Semantic truth and syntactic provability coincide in FOL.']
    },
    {
        id: 'THM_INCOMPLETENESS',
        name: 'Godel\'s Incompleteness Theorems',
        author: 'Kurt Gödel',
        description: 'No consistent axiomatic system can prove its own consistency.',
        implications: ['Math is effectively inexhaustible.']
    },
    {
        id: 'THM_LOV',
        name: 'Lowenheim-Skolem Theorem',
        author: 'Leopold Löwenheim',
        description: 'If a first-order theory has an infinite model, it has models of every infinite cardinality.',
        implications: ['First-order logic cannot fix the size of its models.']
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// LOGICAL HACKS TABLE - "Кратък път" през парадоксите
// ═══════════════════════════════════════════════════════════════════════════════

export const LOGICAL_HACKS_TABLE = {
    'CIRCULAR_LOOP': 'Apply Tarski Hierarchy Level +1',
    'CONTRADICTION_DETECTION': 'Switch to Jaina perspectives (7-fold)',
    'UNPROVABILITY_WALL': 'Inject Meta-Axiom of Potentiality',
    'INFINITY_EXHAUSTION': 'Use Cantorean Diagonalization Skip',
    'CAUSAL_PARADOX': 'Enable Retrocausal Branch in CausalWeb',
    'SINGULARITY_REACHED': 'Transition to OntoGenerator'
};

export default {
    LOGICAL_ERAS,
    LOGIC_SYSTEMS,
    PARADOXES,
    KEY_THEOREMS,
    LOGICAL_HACKS_TABLE
};
