/**
 * 
 *              QANTUM LOGIC EVOLUTION DATABASE - THE HISTORY OF TRUTH                        
 * 
 */

export interface LogicalEra {
  name: string;
  period: string;
  characteristics: string[];
  limitations: string[];
  keyFigures: string[];
  breakthrough: string;
}

export interface Paradox {
  name: string;
  discoverer: string;
  year: string;
  statement: string;
  mechanism: string;
  resolution: string[];
  importance: string;
}

export interface LogicSystem {
  name: string;
  founder: string;
  era: string;
  lawsBroken: string[];
  mechanism: string;
  implication: string;
  formalExpression?: string;
}

// 
// THE EVOLUTION OF LOGICAL STAGES
// 

export const LOGICAL_ERAS: LogicalEra[] = [
  {
    name: 'Rhetorical Stage',
    period: 'Pre-history to ~1000 BCE',
    characteristics: [
      'Mathematics existed only in natural language',
      'Problems narrated as stories about fields, grain, measurements',
      'No symbolic language for general laws',
      'Babylon and Egypt - architectural/astronomical precision without abstraction'
    ],
    limitations: [
      'Could not express general laws',
      'No distinction between logical form and semantic content',
      'Paradoxes like Zeno perceived as metaphysical mysteries',
      'Thinker trapped inside the language'
    ],
    keyFigures: ['Babylonian scribes', 'Egyptian mathematicians'],
    breakthrough: 'Concrete calculation methods, but no abstraction'
  },
  {
    name: 'Syncopated Stage',
    period: '~1000 BCE to ~1000 CE',
    characteristics: [
      'First steps toward abstraction',
      'Abbreviations for powers and relationships',
      'Diophantus - "father of algebra"',
      'Shorthand for speech, not calculus of reason'
    ],
    limitations: [
      'Not yet true formal logic',
      'Stenography of thought',
      'Cannot leverage meta-perspective',
      'Cannot debug the system'
    ],
    keyFigures: ['Diophantus of Alexandria'],
    breakthrough: 'Symbolic abbreviations, but still language-bound'
  },
  {
    name: 'Aristotelian Formalization',
    period: '4th Century BCE',
    characteristics: [
      'First systematic analysis of logical syntax',
      'Variables for terms in syllogisms (A, B, C)',
      'Analysis of validity based on structure',
      'The Organon - fortress of Western rationality',
      'Three Laws of Thought codified'
    ],
    limitations: [
      'Term Logic - only Subject-Predicate relations',
      'Cannot handle multiple quantifiers',
      'Static, binary, consistent worldview',
      'Blind to infinite, paradoxical, changing'
    ],
    keyFigures: ['Aristotle'],
    breakthrough: 'Form separated from content, but binary cage constructed'
  },
  {
    name: 'Symbolic Revolution',
    period: '1500 CE onwards',
    characteristics: [
      'Letters for unknowns AND coefficients',
      'Equations as manipulable objects',
      'Leibniz: characteristica universalis',
      'Logic as algebra - mechanical operations on symbols',
      'Logic as technology, not divine law'
    ],
    limitations: [
      'Still operating within classical constraints',
      'Approaching but not yet reaching meta-level'
    ],
    keyFigures: ['François Viète', 'René Descartes', 'Gottfried Leibniz'],
    breakthrough: 'Logic can be engineered, reverse-engineered, redesigned'
  },
  {
    name: 'Logicist Crisis',
    period: '1879-1931',
    characteristics: [
      'Frege: Quantifiers and Begriffsschrift',
      'Russell: Type Theory as patch',
      'Principia Mathematica',
      'Hilbert Program: completeness, consistency, decidability'
    ],
    limitations: [
      'Russell Paradox broke naive set theory',
      'Gödel proved incompleteness',
      'Tarski proved undefinability of truth',
      'Foundation revealed as cracked'
    ],
    keyFigures: ['Gottlob Frege', 'Bertrand Russell', 'Alfred Whitehead', 'David Hilbert', 'Kurt Gödel', 'Alfred Tarski'],
    breakthrough: 'Self-reference is not a bug but inherent feature'
  },
  {
    name: 'Non-Classical Proliferation',
    period: '20th Century onwards',
    characteristics: [
      'Intuitionism (Brouwer)',
      'Many-valued logics (Łukasiewicz)',
      'Paraconsistent logic',
      'Dialetheism (Priest)',
      'Quantum logic',
      'Fuzzy logic'
    ],
    limitations: [
      'Each system has its own incompleteness',
      'Meta-levels proliferate infinitely'
    ],
    keyFigures: ['L.E.J. Brouwer', 'Jan Łukasiewicz', 'Graham Priest', 'Lotfi Zadeh'],
    breakthrough: 'Multiple valid logical frameworks, relativized truth'
  }
];

// 
// FOUNDATIONAL PARADOXES
// 

export const PARADOXES: Paradox[] = [
  {
    name: 'Liar Paradox',
    discoverer: 'Eubulides of Miletus',
    year: '4th Century BCE',
    statement: 'This sentence is false.',
    mechanism: 'Self-reference + negation creates oscillation: TrueFalseTrue...',
    resolution: [
      'Type Theory: Ban self-referential statements',
      'Tarski: Truth defined in meta-language only',
      'Dialetheism: Accept as true AND false (dialetheia)',
      'Paraconsistency: Contain without explosion'
    ],
    importance: 'Reveals that self-reference in language creates structural instability'
  },
  {
    name: 'Russell Paradox',
    discoverer: 'Bertrand Russell',
    year: '1901',
    statement: 'R = {x | x  x}. Is R  R?',
    mechanism: 'R  R  R  R. Set membership becomes contradictory.',
    resolution: [
      'Type Theory: Sets can only contain lower-type elements',
      'ZFC: Axiom schema of separation (restricted comprehension)',
      'NBG: Class/Set distinction',
      'Paraconsistency: Allow but contain inconsistency'
    ],
    importance: 'Destroyed naive set theory, forced formalization of foundations'
  },
  {
    name: 'Berry Paradox',
    discoverer: 'G.G. Berry / Bertrand Russell',
    year: '1906',
    statement: 'The smallest positive integer not definable in under sixty letters.',
    mechanism: 'This description has fewer than 60 letters, yet defines the number it claims undefinable.',
    resolution: [
      'Formalized notion of "definability" required',
      'Relates to Kolmogorov complexity',
      'Richard Paradox variant'
    ],
    importance: 'Reveals problems with self-referential definitions of definability'
  },
  {
    name: 'Grelling-Nelson Paradox',
    discoverer: 'Kurt Grelling & Leonard Nelson',
    year: '1908',
    statement: 'Is "heterological" heterological? (A word is heterological if it does not describe itself)',
    mechanism: '"short" is short (autological). "long" is not long (heterological). Is "heterological" heterological?',
    resolution: [
      'Same structure as Liar Paradox',
      'Type theory distinctions',
      'Accept as dialetheia'
    ],
    importance: 'Shows Liar structure appears in natural language predicates'
  },
  {
    name: 'Zeno Paradoxes',
    discoverer: 'Zeno of Elea',
    year: '5th Century BCE',
    statement: 'Achilles cannot catch the tortoise; motion is impossible.',
    mechanism: 'Infinite subdivision of space/time seems to make completion impossible.',
    resolution: [
      'Calculus: Convergent infinite series have finite sums',
      'Limit concept resolves apparent paradox',
      'Set theory of real numbers'
    ],
    importance: 'Revealed need for rigorous treatment of infinity'
  },
  {
    name: 'Sorites Paradox (Heap)',
    discoverer: 'Eubulides of Miletus',
    year: '4th Century BCE',
    statement: 'One grain is not a heap. Adding one grain to a non-heap does not make a heap. Therefore, no amount of grains makes a heap.',
    mechanism: 'Vague predicates resist precise boundaries; tolerance principle leads to contradiction.',
    resolution: [
      'Fuzzy logic: Degrees of "heapness"',
      'Supervaluationism: True on all precisifications',
      'Epistemicism: There IS a precise boundary, we just cannot know it'
    ],
    importance: 'Reveals classical logic fails for vague predicates'
  },
  {
    name: 'Gödel Sentence',
    discoverer: 'Kurt Gödel',
    year: '1931',
    statement: 'G: "This statement is not provable in system S"',
    mechanism: 'If G provable  G false  S inconsistent. If G unprovable  G true  S incomplete.',
    resolution: [
      'Accept incompleteness as fundamental',
      'Step to meta-system (infinite hierarchy)',
      'True but unprovable statements exist'
    ],
    importance: 'FOUNDATIONAL: No consistent system can be complete; truth exceeds proof'
  },
  {
    name: 'Curry Paradox',
    discoverer: 'Haskell Curry',
    year: '1942',
    statement: '"If this sentence is true, then Santa Claus exists."',
    mechanism: 'Does not use negation, but conditional + self-reference proves anything.',
    resolution: [
      'Restrict conditional or contraction',
      'Non-classical treatment of implication',
      'Substructural logics'
    ],
    importance: 'Shows paradox without negation; implication itself is dangerous'
  },
  {
    name: 'Hypergame Paradox',
    discoverer: 'William Zwicker',
    year: '1987',
    statement: '"The game of playing any finite game" - is Hypergame finite?',
    mechanism: 'If finite  can play Hypergame in Hypergame  infinite regress. Contradiction.',
    resolution: [
      'Well-foundedness requirement',
      'Set of "all finite games" cannot exist',
      'Warning against totalizing definitions'
    ],
    importance: 'Reveals paradox in totalizing game-theoretic definitions'
  }
];

// 
// NON-CLASSICAL LOGICAL SYSTEMS
// 

export const LOGIC_SYSTEMS: LogicSystem[] = [
  {
    name: 'Classical Logic',
    founder: 'Aristotle / Frege / Russell',
    era: '4th Century BCE - Present',
    lawsBroken: [],
    mechanism: 'Two truth values, bivalence, excluded middle, non-contradiction, explosion',
    implication: 'Foundation of Western reasoning, but structurally limited',
    formalExpression: 'L = (TRUE, FALSE), P  P, (P  P), (P  P)  Q'
  },
  {
    name: 'Intuitionism',
    founder: 'L.E.J. Brouwer',
    era: '20th Century',
    lawsBroken: ['Law of Excluded Middle', 'Double Negation Elimination'],
    mechanism: 'Truth = constructibility. Proving P  proving P. Future contingents indeterminate.',
    implication: 'Mathematical objects exist only when constructed by mind',
    formalExpression: 'P  P is NOT a tautology. P  P is invalid.'
  },
  {
    name: 'Three-Valued Logic (Ł3)',
    founder: 'Jan Łukasiewicz',
    era: '1920',
    lawsBroken: ['Law of Excluded Middle'],
    mechanism: 'Third value INDETERMINATE () for future contingents, preserves free will',
    implication: 'Time, change, modality can be modeled; static binary broken',
    formalExpression: 'Values: {0, , 1}. P  P =  when P = '
  },
  {
    name: 'Paraconsistent Logic',
    founder: 'Stanisław Jaśkowski / Newton da Costa',
    era: '1948-1963',
    lawsBroken: ['Principle of Explosion'],
    mechanism: 'Block Disjunctive Syllogism for contradictory premises. Contain inconsistency.',
    implication: 'Databases and theories can survive contradictions without triviality',
    formalExpression: '(P  P)  Q'
  },
  {
    name: 'Dialetheism',
    founder: 'Graham Priest',
    era: '1979+',
    lawsBroken: ['Law of Non-Contradiction'],
    mechanism: 'Some contradictions (dialetheia) are TRUE. Liar is both T and F.',
    implication: 'Paradoxes describe boundary conditions of reality, not errors',
    formalExpression: 'P: P  P is TRUE'
  },
  {
    name: 'Quantum Logic',
    founder: 'Birkhoff & von Neumann',
    era: '1936',
    lawsBroken: ['Distributive Law', 'Non-Contradiction (in superposition)'],
    mechanism: 'Non-distributive lattice. A  (B  C)  (A  B)  (A  C)',
    implication: 'Quantum states exist in superposition until observed',
    formalExpression: 'Non-boolean orthomodular lattice'
  },
  {
    name: 'Fuzzy Logic',
    founder: 'Lotfi Zadeh',
    era: '1965',
    lawsBroken: ['Bivalence', 'Law of Excluded Middle'],
    mechanism: 'Continuous truth values in [0,1]. Degrees of membership.',
    implication: 'Vague predicates handled; AI, control systems, natural language',
    formalExpression: 'μ_A(x)  [0,1]'
  },
  {
    name: 'Relevance Logic',
    founder: 'Anderson & Belnap',
    era: '1975',
    lawsBroken: ['Principle of Explosion', 'Material Implication paradoxes'],
    mechanism: 'Premises must be RELEVANT to conclusion. Block vacuous truth.',
    implication: 'P  Q requires genuine connection between P and Q',
    formalExpression: 'Variable sharing property required'
  },
  {
    name: 'Linear Logic',
    founder: 'Jean-Yves Girard',
    era: '1987',
    lawsBroken: ['Contraction', 'Weakening'],
    mechanism: 'Premises consumed exactly once. Resource-conscious reasoning.',
    implication: 'Models resource consumption, concurrency, game theory',
    formalExpression: 'A  B (A consumed to produce B)'
  },
  {
    name: 'Catuṣkoṭi / Tetralemma',
    founder: 'Nagarjuna (Madhyamaka Buddhism)',
    era: '2nd Century CE',
    lawsBroken: ['Law of Excluded Middle', 'Law of Non-Contradiction', 'Bivalence'],
    mechanism: 'Four corners: is, is-not, both, neither. Then transcendence of all four.',
    implication: 'Reality is empty of intrinsic nature (Śūnyatā). Categories fail at ultimate level.',
    formalExpression: 'Positions: P, P, PP, PP, then Ineffability'
  },
  {
    name: 'Jaina Syādvāda / Saptabhangi',
    founder: 'Jain Philosophy',
    era: 'Ancient India',
    lawsBroken: ['Bivalence', 'Law of Excluded Middle'],
    mechanism: 'Seven truth values with "syāt" (in a certain sense). Perspectivism.',
    implication: 'Reality has infinite modes; no single view captures all truth',
    formalExpression: 'Syāt-asti, Syāt-nāsti, Syāt-asti-nāsti, Syāt-avaktavya, ...'
  }
];

// 
// KEY THEOREMS AND RESULTS
// 

export const KEY_THEOREMS = [
  {
    name: "Gödel's First Incompleteness Theorem",
    year: 1931,
    statement: 'Any consistent formal system capable of expressing arithmetic contains statements that are true but unprovable within the system.',
    proof_sketch: 'Arithmetize syntax  Diagonal lemma  Construct G: "G is not provable"  If provable, inconsistent; if unprovable, incomplete.',
    implications: [
      'Truth exceeds provability',
      'No "Theory of Everything" in pure logic',
      'Self-reference is inescapable in sufficiently rich systems'
    ]
  },
  {
    name: "Gödel's Second Incompleteness Theorem",
    year: 1931,
    statement: 'A consistent system cannot prove its own consistency.',
    proof_sketch: 'If S proves Con(S), then S proves G, contradiction.',
    implications: [
      'Infinite hierarchy of meta-systems required',
      'We cannot use logic to prove logic is safe',
      'Eternal blind spot in any foundation'
    ]
  },
  {
    name: "Tarski's Undefinability Theorem",
    year: 1936,
    statement: 'Arithmetical truth cannot be defined in arithmetic itself.',
    proof_sketch: 'If truth predicate T exists in language L, Liar paradox is constructible in L.',
    implications: [
      'Truth requires meta-language',
      'No final language - infinite hierarchy',
      'Outsmarting requires ascent to meta-level'
    ]
  },
  {
    name: "Church-Turing Undecidability",
    year: 1936,
    statement: 'There is no algorithm that decides the truth of all arithmetic statements.',
    proof_sketch: 'Halting problem reduction.',
    implications: [
      'Hilbert\'s Entscheidungsproblem answered negatively',
      'Computation has fundamental limits',
      'Some truths are algorithmically unreachable'
    ]
  },
  {
    name: "Diagonal Lemma (Fixed Point Theorem)",
    year: 1931,
    statement: 'For any formula φ(x), there exists a sentence G such that G  φ(G)',
    proof_sketch: 'Self-reference via Gödel numbering.',
    implications: [
      'Any property can have a self-referential fixed point',
      'Engine of Gödelian incompleteness',
      'Self-reference is constructible, not avoidable'
    ]
  }
];

// 
// THE COMPARATIVE TABLE OF LOGICAL HACKS
// 

export const LOGICAL_HACKS_TABLE = [
  {
    framework: 'Intuitionism',
    lawBroken: 'Law of Excluded Middle',
    mechanism: 'Truth requires Construction, not just negation of negation',
    implication: 'Mathematical objects are mental artifacts'
  },
  {
    framework: 'Nagarjuna (Madhyamaka)',
    lawBroken: 'Binary Logic (A / not-A)',
    mechanism: 'Tetralemma (Rejecting A, not-A, Both, Neither)',
    implication: 'Reality is empty of intrinsic nature (Śūnyatā)'
  },
  {
    framework: 'Gödel Numbering',
    lawBroken: 'Separation of Syntax/Semantics',
    mechanism: 'Arithmetization of Syntax (Logic talks about Logic)',
    implication: 'Formal systems contain true but unprovable statements'
  },
  {
    framework: 'Paraconsistency',
    lawBroken: 'Principle of Explosion',
    mechanism: 'Blocking Disjunctive Syllogism for contradictions',
    implication: 'Systems can survive conflicting data without crashing'
  },
  {
    framework: 'Dialetheism',
    lawBroken: 'Law of Non-Contradiction',
    mechanism: 'Accepting True Contradictions (Liar Paradox)',
    implication: 'Paradoxes are features of reality, not bugs'
  },
  {
    framework: 'Nomic',
    lawBroken: 'Rule Stability',
    mechanism: 'Self-Amendment (Rules that change rules)',
    implication: 'Law is fluid; the game is the editing of the game'
  },
  {
    framework: "'Pataphysics",
    lawBroken: 'Inductive Generalization',
    mechanism: 'The Science of the Particular/Exception',
    implication: 'The anomaly is the only truth'
  },
  {
    framework: 'Zen Kōan',
    lawBroken: 'Rational Cognition',
    mechanism: 'The Double Bind / Logical Short Circuit',
    implication: 'Insight (Satori) lies beyond logical processing'
  }
];

export default {
  LOGICAL_ERAS,
  PARADOXES,
  LOGIC_SYSTEMS,
  KEY_THEOREMS,
  LOGICAL_HACKS_TABLE
};
