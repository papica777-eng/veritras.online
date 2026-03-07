/**
 * soul-engine — Qantum Module
 * @module soul-engine
 * @path scripts/_NEURAL_COGNITION_/soul-engine.js
 * @auto-documented BrutalDocEngine v2.1
 */

const crypto = require('crypto');

class SoulExecutor {
    constructor(dnaKey) {
        this.dnaKey = dnaKey || this.generateSystemDNA();
        this.state = { essence: 0, void: [], aegis: true };
    }

    // Complexity: O(1)
    generateSystemDNA() {
        return crypto.createHash('sha256').update(process.platform + process.arch).digest('hex');
    }

    // Complexity: O(N) — loop
    execute(script) {
        const tokens = Array.from(script);
        for (let i = 0; i < tokens.length; i++) {
            const char = tokens[i];
            const hash = crypto.createHash('md5').update(this.dnaKey + char + i).digest('hex');
            const weight = parseInt(hash.slice(0, 2), 16) % 5;

            const opcodes = ['AWAKEN', 'CONSUME', 'PROTECT', 'EVOLVE', 'TRANSMUTE'];
            const opcode = opcodes[weight];

            if (opcode === 'AWAKEN') this.state.essence++;
            if (opcode === 'CONSUME') { this.state.void.push(this.state.essence); this.state.essence = 0; }
            if (opcode === 'PROTECT') this.state.aegis = !this.state.aegis;
            if (opcode === 'EVOLVE') this.state.essence = this.state.aegis ? this.state.essence * 2 : this.state.essence - 1;
            if (opcode === 'TRANSMUTE') this.state.essence += (this.state.void.pop() || 0);
        }
        return this.state;
    }
}

module.exports = { SoulExecutor };
