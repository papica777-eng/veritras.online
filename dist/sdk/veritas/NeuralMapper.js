"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║                    VERITAS SDK - NEURAL MAPPER                                                ║
 * ║              "Map the neural pathways of your code"                                           ║
 * ║                                                                                               ║
 * ║   PRO FEATURE: Visualize dependencies, detect patterns, predict hallucinations               ║
 * ║                                                                                               ║
 * ║   © 2025-2026 Mister Mind | Dimitar Prodromov                                                ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNeuralMapper = exports.NeuralMapper = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL MAPPER
// ═══════════════════════════════════════════════════════════════════════════════
class NeuralMapper {
    static instance;
    map = null;
    constructor() { }
    static getInstance() {
        if (!NeuralMapper.instance) {
            NeuralMapper.instance = new NeuralMapper();
        }
        return NeuralMapper.instance;
    }
    /**
     * Build neural map from symbol registry
     */
    buildMap(registry) {
        const nodes = new Map();
        const edges = [];
        // Create nodes from registry
        let nodeId = 0;
        for (const [name, file] of registry.classes) {
            nodes.set(name, {
                id: `node_${nodeId++}`,
                name,
                type: 'class',
                file,
                connections: [],
                weight: 10, // Classes have high weight
                depth: 0
            });
        }
        for (const [name, file] of registry.functions) {
            nodes.set(name, {
                id: `node_${nodeId++}`,
                name,
                type: 'function',
                file,
                connections: [],
                weight: 5,
                depth: 0
            });
        }
        for (const [name, file] of registry.interfaces) {
            nodes.set(name, {
                id: `node_${nodeId++}`,
                name,
                type: 'interface',
                file,
                connections: [],
                weight: 7,
                depth: 0
            });
        }
        for (const [name, file] of registry.types) {
            nodes.set(name, {
                id: `node_${nodeId++}`,
                name,
                type: 'type',
                file,
                connections: [],
                weight: 3,
                depth: 0
            });
        }
        // Detect connections based on file proximity
        const fileGroups = new Map();
        for (const [name, node] of nodes) {
            const file = node.file;
            if (!fileGroups.has(file)) {
                fileGroups.set(file, []);
            }
            fileGroups.get(file).push(name);
        }
        // Symbols in same file are connected
        for (const [file, symbols] of fileGroups) {
            for (let i = 0; i < symbols.length; i++) {
                for (let j = i + 1; j < symbols.length; j++) {
                    const nodeA = nodes.get(symbols[i]);
                    const nodeB = nodes.get(symbols[j]);
                    nodeA.connections.push(symbols[j]);
                    nodeB.connections.push(symbols[i]);
                    edges.push({
                        from: symbols[i],
                        to: symbols[j],
                        weight: 1
                    });
                }
            }
        }
        // Detect clusters (files as clusters)
        const clusters = [];
        for (const [file, symbols] of fileGroups) {
            if (symbols.length > 1) {
                clusters.push({
                    name: file,
                    nodes: symbols
                });
            }
        }
        // Find hotspots (highly connected nodes)
        const hotspots = [];
        for (const [name, node] of nodes) {
            if (node.connections.length > 5) {
                hotspots.push(name);
            }
        }
        // Find orphans (isolated nodes)
        const orphans = [];
        for (const [name, node] of nodes) {
            if (node.connections.length === 0) {
                orphans.push(name);
            }
        }
        this.map = {
            nodes,
            edges,
            clusters,
            hotspots,
            orphans
        };
        return this.map;
    }
    /**
     * Predict hallucination risk for a symbol
     */
    predictHallucinationRisk(symbolName) {
        if (!this.map) {
            return {
                symbol: symbolName,
                risk: 'critical',
                score: 100,
                reasons: ['Neural map not built. Call buildMap() first.'],
                suggestions: ['Run veritas.assimilate() before checking risks']
            };
        }
        const node = this.map.nodes.get(symbolName);
        if (!node) {
            return {
                symbol: symbolName,
                risk: 'critical',
                score: 100,
                reasons: [
                    'Symbol not found in codebase',
                    'AI may be hallucinating this symbol'
                ],
                suggestions: [
                    'Verify the symbol exists',
                    'Check for typos',
                    'Use veritas.findSimilar() for suggestions'
                ]
            };
        }
        const reasons = [];
        const suggestions = [];
        let score = 0;
        // Check if orphan
        if (this.map.orphans.includes(symbolName)) {
            score += 30;
            reasons.push('Symbol is isolated (no connections)');
            suggestions.push('Consider if this symbol is actually used');
        }
        // Check connection count
        if (node.connections.length < 2) {
            score += 20;
            reasons.push('Low connectivity (may be unused)');
        }
        // Check type - functions are more risky than classes
        if (node.type === 'function') {
            score += 10;
            reasons.push('Functions have higher hallucination rate than classes');
        }
        // Check file path
        if (node.file.includes('test') || node.file.includes('spec')) {
            score += 15;
            reasons.push('Symbol is in a test file');
            suggestions.push('Ensure you\'re referencing production code');
        }
        // Determine risk level
        let risk;
        if (score < 20) {
            risk = 'low';
        }
        else if (score < 40) {
            risk = 'medium';
        }
        else if (score < 70) {
            risk = 'high';
        }
        else {
            risk = 'critical';
        }
        if (risk === 'low') {
            reasons.push('Symbol is well-connected and verified');
        }
        return {
            symbol: symbolName,
            risk,
            score,
            reasons,
            suggestions
        };
    }
    /**
     * Generate Mermaid diagram of the neural map
     */
    generateMermaid() {
        if (!this.map)
            return 'graph TD\n  A[No map built]';
        const lines = ['graph TD'];
        // Add nodes
        for (const [name, node] of this.map.nodes) {
            const shape = node.type === 'class' ? `[${name}]` :
                node.type === 'interface' ? `{${name}}` :
                    node.type === 'function' ? `(${name})` :
                        `((${name}))`;
            lines.push(`  ${node.id}${shape}`);
        }
        // Add edges (limit to prevent huge diagrams)
        const edgeLimit = 50;
        let edgeCount = 0;
        for (const edge of this.map.edges) {
            if (edgeCount >= edgeLimit) {
                lines.push(`  %% ... and ${this.map.edges.length - edgeLimit} more edges`);
                break;
            }
            const fromNode = this.map.nodes.get(edge.from);
            const toNode = this.map.nodes.get(edge.to);
            if (fromNode && toNode) {
                lines.push(`  ${fromNode.id} --> ${toNode.id}`);
                edgeCount++;
            }
        }
        return lines.join('\n');
    }
    /**
     * Generate stats about the neural map
     */
    getStats() {
        if (!this.map) {
            return {
                totalNodes: 0,
                totalEdges: 0,
                clusters: 0,
                hotspots: 0,
                orphans: 0,
                avgConnections: 0
            };
        }
        const totalConnections = Array.from(this.map.nodes.values())
            .reduce((sum, node) => sum + node.connections.length, 0);
        return {
            totalNodes: this.map.nodes.size,
            totalEdges: this.map.edges.length,
            clusters: this.map.clusters.length,
            hotspots: this.map.hotspots.length,
            orphans: this.map.orphans.length,
            avgConnections: this.map.nodes.size > 0
                ? totalConnections / this.map.nodes.size
                : 0
        };
    }
}
exports.NeuralMapper = NeuralMapper;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getNeuralMapper = () => NeuralMapper.getInstance();
exports.getNeuralMapper = getNeuralMapper;
exports.default = NeuralMapper;
