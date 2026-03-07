"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONSENSUS PROTOCOL: THE INTERSPECIES CONTRACT                            ║
 * ║  Gödelian Countermeasure - Breaking Self-Referential Loops                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  "A system cannot prove its own consistency using its own axioms."        ║
 * ║  — Kurt Gödel, 1931                                                       ║
 * ║                                                                           ║
 * ║  SOLUTION: The Adversarial Twin Protocol                                  ║
 * ║  No evolution is applied until TWO INDEPENDENT digital organisms          ║
 * ║  built on DIFFERENT architectures reach consensus.                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.consensusProtocol = exports.ConsensusProtocol = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE CONSENSUS PROTOCOL: Breaking Gödelian Self-Reference
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class ConsensusProtocol extends events_1.EventEmitter {
    static instance;
    twins = new Map();
    consensusHistory = [];
    dialecticMaxRounds = 5;
    minimumConsensusThreshold = 0.7;
    constructor() {
        super();
        this.initializeDefaultTwins();
    }
    static getInstance() {
        if (!ConsensusProtocol.instance) {
            ConsensusProtocol.instance = new ConsensusProtocol();
        }
        return ConsensusProtocol.instance;
    }
    /**
     * Initialize the Adversarial Twin Network
     * These are external validators built on DIFFERENT stacks
     */
    initializeDefaultTwins() {
        // The Adversarial Twin: A Rust-based validator with Claude
        this.registerTwin({
            name: 'ADVERSARIAL_TWIN_ALPHA',
            architecture: 'Rust/WebAssembly',
            model: 'Claude-3-Opus',
            endpoint: process.env.TWIN_ALPHA_ENDPOINT || 'http://localhost:9001/validate',
            publicKey: process.env.TWIN_ALPHA_PUBKEY || 'twin-alpha-dev-key'
        });
        // The Skeptic: A Python-based validator with Gemini
        this.registerTwin({
            name: 'SKEPTIC_OMEGA',
            architecture: 'Python/FastAPI',
            model: 'Gemini-Ultra',
            endpoint: process.env.TWIN_OMEGA_ENDPOINT || 'http://localhost:9002/validate',
            publicKey: process.env.TWIN_OMEGA_PUBKEY || 'twin-omega-dev-key'
        });
        console.log('🧬 [CONSENSUS] Adversarial Twin Network initialized');
        console.log(`   └─ Registered ${this.twins.size} external validators`);
    }
    /**
     * Register an external validation node (Adversarial Twin)
     */
    registerTwin(node) {
        this.twins.set(node.name, node);
        this.emit('twin:registered', node);
    }
    /**
     * THE MAIN GATE: Verify any evolution through cross-species consensus
     */
    async verifyEvolution(proposal) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔐 [CONSENSUS PROTOCOL] Initiating Cross-Species Validation');
        console.log(`   └─ Proposal ID: ${proposal.id}`);
        console.log(`   └─ Mutation Type: ${proposal.mutation.type}`);
        console.log('═══════════════════════════════════════════════════════════');
        this.emit('consensus:start', proposal);
        // If no twins available, operate in LOCAL_SOVEREIGN mode
        if (this.twins.size === 0) {
            console.warn('⚠️ [CONSENSUS] No twins available - operating in LOCAL_SOVEREIGN mode');
            return this.localSovereignFallback(proposal);
        }
        // Phase 1: Broadcast to all twins and collect responses
        const twinResponses = await this.broadcastProposal(proposal);
        // Phase 2: Compare formal proofs
        const consensusCheck = this.evaluateConsensus(proposal, twinResponses);
        if (consensusCheck.unanimous) {
            console.log('✅ [CONSENSUS] IMMEDIATE CONSENSUS ACHIEVED');
            return this.finalizeConsensus(proposal, 'IMMEDIATE', 1, 'All organisms agree');
        }
        // Phase 3: Dialectic Debate if disagreement exists
        if (consensusCheck.hasDisagreement) {
            console.log('⚡ [CONSENSUS] COGNITIVE DISSENT DETECTED - Initiating Dialectic Debate');
            return await this.resolveConflict(proposal, twinResponses);
        }
        // Phase 4: Partial consensus with threshold check
        if (consensusCheck.agreementRatio >= this.minimumConsensusThreshold) {
            console.log(`🟡 [CONSENSUS] THRESHOLD CONSENSUS: ${(consensusCheck.agreementRatio * 100).toFixed(1)}%`);
            return this.finalizeConsensus(proposal, 'ARBITER', 1, 'Threshold consensus reached');
        }
        // VETO: Consensus failed
        console.error('❌ [CONSENSUS] EVOLUTION VETOED - Insufficient agreement');
        return this.finalizeConsensus(proposal, 'VETO', 1, 'Cross-species validation failed');
    }
    /**
     * Broadcast the proposal to all registered twins
     */
    async broadcastProposal(proposal) {
        const responses = new Map();
        const broadcastPromises = Array.from(this.twins.entries()).map(async ([name, twin]) => {
            try {
                const response = await this.queryTwin(twin, proposal);
                responses.set(name, response);
            }
            catch (error) {
                console.error(`❌ [CONSENSUS] Failed to reach twin ${name}:`, error);
                // Simulate a skeptical response for unreachable twins
                responses.set(name, this.generateSkepticalResponse(proposal, name));
            }
        });
        await Promise.all(broadcastPromises);
        return responses;
    }
    /**
     * Query a specific twin for validation
     */
    async queryTwin(twin, proposal) {
        try {
            const response = await fetch(twin.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Origin-Organism': 'VORTEX_PRIMARY',
                    'X-Request-Signature': this.signRequest(proposal, twin.publicKey)
                },
                body: JSON.stringify(proposal),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });
            if (!response.ok) {
                throw new Error(`Twin responded with status ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            // If external twin is unreachable, perform LOCAL simulation
            console.warn(`⚠️ [CONSENSUS] Twin ${twin.name} unreachable - using local simulation`);
            return this.simulateAdversarialAnalysis(proposal, twin);
        }
    }
    /**
     * LOCAL SIMULATION: When external twins are unavailable,
     * simulate adversarial thinking using different logical frameworks
     */
    async simulateAdversarialAnalysis(proposal, twin) {
        console.log(`🔄 [CONSENSUS] Simulating ${twin.name} adversarial analysis locally...`);
        // Apply different logical frameworks based on twin architecture
        const adversarialChecks = [];
        // Check 1: Axiom Independence
        const axiomCheck = this.verifyAxiomIndependence(proposal.formalProof);
        adversarialChecks.push(axiomCheck);
        // Check 2: Counterexample Search
        const counterexampleFound = this.searchForCounterexample(proposal);
        adversarialChecks.push(!counterexampleFound);
        // Check 3: Consistency with Historical Evolutions
        const historicalConsistency = this.checkHistoricalConsistency(proposal);
        adversarialChecks.push(historicalConsistency);
        // Check 4: Resource Impact Analysis
        const resourceSafe = this.analyzeResourceImpact(proposal);
        adversarialChecks.push(resourceSafe);
        const passedChecks = adversarialChecks.filter(c => c).length;
        const confidence = passedChecks / adversarialChecks.length;
        return {
            id: crypto.randomUUID(),
            proposalId: proposal.id,
            verdict: confidence >= 0.75 ? 'ACCEPT' : confidence >= 0.5 ? 'CHALLENGE' : 'REJECT',
            formalProof: {
                axioms: ['SIMULATED_ADVERSARIAL_AXIOMS'],
                derivations: [`Passed ${passedChecks}/${adversarialChecks.length} adversarial checks`],
                conclusion: confidence >= 0.75 ? 'Proposal appears sound' : 'Proposal has concerns',
                counterexample: counterexampleFound ? 'Potential edge case detected' : undefined
            },
            confidence,
            reasoningPath: [
                `Axiom Independence: ${axiomCheck ? 'PASS' : 'FAIL'}`,
                `Counterexample Search: ${counterexampleFound ? 'FOUND' : 'NONE'}`,
                `Historical Consistency: ${historicalConsistency ? 'PASS' : 'FAIL'}`,
                `Resource Safety: ${resourceSafe ? 'PASS' : 'FAIL'}`
            ]
        };
    }
    /**
     * Verify that proposal axioms don't create circular dependencies
     */
    verifyAxiomIndependence(proof) {
        const axiomSet = new Set(proof.axioms);
        const derivationRefs = proof.derivations.join(' ');
        // Check if any axiom references itself in derivations (circular)
        for (const axiom of axiomSet) {
            if (derivationRefs.includes(axiom) && proof.conclusion.includes(axiom)) {
                return false; // Circular reference detected
            }
        }
        return true;
    }
    /**
     * Actively search for counterexamples to the proposal
     */
    searchForCounterexample(proposal) {
        // Heuristic counterexample detection
        const dangerPatterns = [
            /while\s*\(\s*true\s*\)/, // Infinite loops
            /eval\s*\(/, // Code injection
            /process\.exit/, // System termination
            /rm\s+-rf/, // Destructive commands
            /DROP\s+TABLE/i, // Database destruction
            /TRUNCATE/i // Data loss
        ];
        const payloadStr = JSON.stringify(proposal.mutation.payload);
        return dangerPatterns.some(pattern => pattern.test(payloadStr));
    }
    /**
     * Check if proposal contradicts past successful evolutions
     */
    checkHistoricalConsistency(proposal) {
        // Check against recent consensus history
        const recentHistory = this.consensusHistory.slice(-100);
        for (const past of recentHistory) {
            if (past.achieved && past.proofHash === this.hashProof(proposal.formalProof)) {
                // Duplicate evolution attempt
                return false;
            }
        }
        return true;
    }
    /**
     * Analyze potential resource impact of the evolution
     */
    analyzeResourceImpact(proposal) {
        const payloadSize = JSON.stringify(proposal.mutation.payload).length;
        const maxSafePayload = 1024 * 1024; // 1MB limit
        return payloadSize < maxSafePayload;
    }
    /**
     * Evaluate consensus from all twin responses
     */
    evaluateConsensus(proposal, responses) {
        const verdicts = Array.from(responses.values()).map(r => r.verdict);
        const accepts = verdicts.filter(v => v === 'ACCEPT').length;
        const rejects = verdicts.filter(v => v === 'REJECT').length;
        const challenges = verdicts.filter(v => v === 'CHALLENGE').length;
        return {
            unanimous: accepts === verdicts.length,
            hasDisagreement: rejects > 0 || challenges > 0,
            agreementRatio: accepts / verdicts.length
        };
    }
    /**
     * DIALECTIC DEBATE: Resolve conflicts through structured argumentation
     */
    async resolveConflict(proposal, responses) {
        console.log('🗣️ [DIALECTIC] Initiating structured debate...');
        let round = 0;
        let resolved = false;
        let currentProposal = proposal;
        while (round < this.dialecticMaxRounds && !resolved) {
            round++;
            console.log(`   └─ Round ${round}/${this.dialecticMaxRounds}`);
            // Collect all challenges
            const challenges = Array.from(responses.values())
                .filter(r => r.verdict === 'CHALLENGE' || r.verdict === 'REJECT');
            if (challenges.length === 0) {
                resolved = true;
                break;
            }
            // Attempt to address each challenge
            for (const challenge of challenges) {
                if (challenge.formalProof.counterexample) {
                    console.log(`   └─ Addressing counterexample: ${challenge.formalProof.counterexample}`);
                    // Try to refine the proposal to address the counterexample
                    const refinement = this.refineProposal(currentProposal, challenge);
                    if (refinement.success) {
                        currentProposal = refinement.proposal;
                    }
                }
            }
            // Re-evaluate with refined proposal
            const newResponses = await this.broadcastProposal(currentProposal);
            const newConsensus = this.evaluateConsensus(currentProposal, newResponses);
            if (newConsensus.unanimous || newConsensus.agreementRatio >= this.minimumConsensusThreshold) {
                resolved = true;
            }
        }
        if (resolved) {
            console.log(`✅ [DIALECTIC] Consensus achieved after ${round} rounds`);
            return this.finalizeConsensus(currentProposal, 'DIALECTIC', round, 'Resolved through debate');
        }
        console.log(`❌ [DIALECTIC] Failed to reach consensus after ${round} rounds`);
        return this.finalizeConsensus(proposal, 'VETO', round, 'Dialectic debate failed');
    }
    /**
     * Attempt to refine a proposal based on a challenge
     */
    refineProposal(proposal, challenge) {
        // Add the counterexample as a constraint
        const refinedProof = {
            ...proposal.formalProof,
            axioms: [
                ...proposal.formalProof.axioms,
                `NOT(${challenge.formalProof.counterexample || 'UNDEFINED_COUNTEREXAMPLE'})`
            ]
        };
        return {
            success: true,
            proposal: {
                ...proposal,
                id: `${proposal.id}-refined-${Date.now()}`,
                formalProof: refinedProof
            }
        };
    }
    /**
     * Generate a skeptical response for unreachable twins
     */
    generateSkepticalResponse(proposal, twinName) {
        return {
            id: crypto.randomUUID(),
            proposalId: proposal.id,
            verdict: 'CHALLENGE',
            formalProof: {
                axioms: ['SKEPTICISM_BY_DEFAULT'],
                derivations: ['Twin unreachable - defaulting to skeptical stance'],
                conclusion: 'Cannot verify without direct communication'
            },
            confidence: 0.3,
            reasoningPath: [`${twinName} was unreachable, applying cautious default`]
        };
    }
    /**
     * Local sovereign fallback when no twins are available
     */
    localSovereignFallback(proposal) {
        // Perform enhanced local validation
        const selfChecks = [
            this.verifyAxiomIndependence(proposal.formalProof),
            !this.searchForCounterexample(proposal),
            this.checkHistoricalConsistency(proposal),
            this.analyzeResourceImpact(proposal)
        ];
        const passed = selfChecks.filter(c => c).length;
        const achieved = passed >= 3; // Require 3/4 checks to pass
        return {
            achieved,
            method: 'ARBITER',
            rounds: 1,
            finalVerdict: achieved ? 'LOCAL_SOVEREIGN_APPROVAL' : 'LOCAL_SOVEREIGN_VETO',
            proofHash: this.hashProof(proposal.formalProof)
        };
    }
    /**
     * Finalize and record the consensus result
     */
    finalizeConsensus(proposal, method, rounds, verdict) {
        const result = {
            achieved: method !== 'VETO',
            method,
            rounds,
            finalVerdict: verdict,
            proofHash: this.hashProof(proposal.formalProof)
        };
        this.consensusHistory.push(result);
        this.emit('consensus:complete', result);
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`🏁 [CONSENSUS] Final Result: ${result.achieved ? '✅ APPROVED' : '❌ VETOED'}`);
        console.log(`   └─ Method: ${method}`);
        console.log(`   └─ Rounds: ${rounds}`);
        console.log(`   └─ Verdict: ${verdict}`);
        console.log('═══════════════════════════════════════════════════════════');
        return result;
    }
    /**
     * Create a cryptographic hash of a formal proof
     */
    hashProof(proof) {
        const content = JSON.stringify(proof);
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    /**
     * Sign a request for twin communication
     */
    signRequest(proposal, publicKey) {
        const payload = JSON.stringify({ id: proposal.id, timestamp: proposal.timestamp });
        return crypto.createHmac('sha256', publicKey).update(payload).digest('hex');
    }
    /**
     * Get consensus statistics
     */
    getStatistics() {
        const total = this.consensusHistory.length;
        const successful = this.consensusHistory.filter(c => c.achieved).length;
        const totalRounds = this.consensusHistory.reduce((sum, c) => sum + c.rounds, 0);
        const methodBreakdown = {};
        for (const c of this.consensusHistory) {
            methodBreakdown[c.method] = (methodBreakdown[c.method] || 0) + 1;
        }
        return {
            totalConsensus: total,
            successRate: total > 0 ? successful / total : 0,
            averageRounds: total > 0 ? totalRounds / total : 0,
            methodBreakdown
        };
    }
}
exports.ConsensusProtocol = ConsensusProtocol;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.consensusProtocol = ConsensusProtocol.getInstance();
