"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM PATTERN RECOGNIZER                                                   ║
 * ║   "Learn from test patterns, predict outcomes"                                ║
 * ║                                                                               ║
 * ║   TODO B #35 - AI: Pattern Recognition                                        ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatternRecognizer = exports.PatternRecognizer = exports.SimilarityMetrics = exports.FeatureExtractor = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════
class FeatureExtractor {
    /**
     * Extract features from test execution
     */
    static fromExecution(data) {
        return [
            data.duration / 1000, // Duration in seconds
            data.duration / Math.max(data.avgDuration, 1), // Relative to average
            data.passed ? 1 : 0,
            data.retries,
            this.encodeErrorType(data.errorType),
            data.timeOfDay / 24, // Normalized time of day
            data.dayOfWeek / 7, // Normalized day
            (data.memoryUsage || 0) / 100, // Memory percentage
            (data.cpuUsage || 0) / 100, // CPU percentage
        ];
    }
    /**
     * Extract features from error message
     */
    static fromError(message) {
        const features = [];
        // Common error patterns
        const patterns = [
            /timeout/i,
            /connection/i,
            /null|undefined/i,
            /assertion|expect/i,
            /element.*not.*found/i,
            /network/i,
            /memory/i,
            /permission|access/i,
            /concurrent|race/i,
            /database|sql/i,
        ];
        for (const pattern of patterns) {
            features.push(pattern.test(message) ? 1 : 0);
        }
        // Message characteristics
        features.push(Math.min(message.length / 1000, 1)); // Normalized length
        features.push(message.split('\n').length / 50); // Stack trace depth
        return features;
    }
    /**
     * Extract features from code metrics
     */
    static fromCodeMetrics(metrics) {
        return [
            Math.min(metrics.lines / 500, 1),
            Math.min(metrics.complexity / 20, 1),
            Math.min(metrics.dependencies / 10, 1),
            Math.min(metrics.assertions / 20, 1),
            Math.min(metrics.asyncOps / 10, 1),
        ];
    }
    static encodeErrorType(errorType) {
        const types = {
            AssertionError: 0.1,
            TypeError: 0.2,
            ReferenceError: 0.3,
            TimeoutError: 0.4,
            NetworkError: 0.5,
            ElementNotFoundError: 0.6,
            DatabaseError: 0.7,
            PermissionError: 0.8,
            ValidationError: 0.9,
            Unknown: 0.5,
        };
        return types[errorType || 'Unknown'] || 0.5;
    }
}
exports.FeatureExtractor = FeatureExtractor;
// ═══════════════════════════════════════════════════════════════════════════════
// SIMILARITY METRICS
// ═══════════════════════════════════════════════════════════════════════════════
class SimilarityMetrics {
    /**
     * Euclidean distance
     */
    static euclidean(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.pow(a[i] - b[i], 2);
        }
        return Math.sqrt(sum);
    }
    /**
     * Cosine similarity
     */
    static cosine(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator === 0)
            return 0;
        return dotProduct / denominator;
    }
    /**
     * Manhattan distance
     */
    static manhattan(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.abs(a[i] - b[i]);
        }
        return sum;
    }
    /**
     * Jaccard similarity (for binary features)
     */
    static jaccard(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }
        let intersection = 0;
        let union = 0;
        for (let i = 0; i < a.length; i++) {
            if (a[i] > 0 || b[i] > 0)
                union++;
            if (a[i] > 0 && b[i] > 0)
                intersection++;
        }
        return union === 0 ? 0 : intersection / union;
    }
}
exports.SimilarityMetrics = SimilarityMetrics;
// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN RECOGNIZER
// ═══════════════════════════════════════════════════════════════════════════════
class PatternRecognizer {
    static instance;
    patterns = new Map();
    clusters = new Map();
    static getInstance() {
        if (!PatternRecognizer.instance) {
            PatternRecognizer.instance = new PatternRecognizer();
        }
        return PatternRecognizer.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PATTERN MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register a pattern
     */
    // Complexity: O(1) — hash/map lookup
    register(name, type, features, metadata) {
        const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.patterns.set(id, {
            id,
            name,
            type,
            features,
            frequency: 1,
            lastSeen: Date.now(),
            confidence: 0.5,
            metadata,
        });
        return id;
    }
    /**
     * Learn from observation
     */
    // Complexity: O(N) — linear iteration
    learn(features, type, name) {
        // Find most similar existing pattern
        const match = this.findBestMatch(features);
        if (match && match.similarity > 0.9) {
            // Update existing pattern
            const pattern = match.pattern;
            pattern.frequency++;
            pattern.lastSeen = Date.now();
            pattern.confidence = Math.min(pattern.confidence + 0.05, 1);
            // Update features (moving average)
            for (let i = 0; i < pattern.features.length; i++) {
                pattern.features[i] = pattern.features[i] * 0.8 + features[i] * 0.2;
            }
            return pattern;
        }
        // Register new pattern
        const id = this.register(name || `${type}_${Date.now()}`, type, features);
        return this.patterns.get(id);
    }
    /**
     * Recognize patterns in features
     */
    // Complexity: O(N*M) — nested iteration detected
    recognize(features) {
        const matches = [];
        for (const pattern of this.patterns.values()) {
            const similarity = SimilarityMetrics.cosine(features, pattern.features);
            if (similarity > 0.5) {
                matches.push({
                    pattern,
                    similarity,
                    matchedFeatures: this.getMatchedFeatures(features, pattern.features),
                });
            }
        }
        // Sort by similarity
        matches.sort((a, b) => b.similarity - a.similarity);
        // Determine suggested type
        const typeCounts = new Map();
        for (const match of matches.slice(0, 5)) {
            const count = typeCounts.get(match.pattern.type) || 0;
            typeCounts.set(match.pattern.type, count + match.similarity);
        }
        let suggestedType = 'failure';
        let maxScore = 0;
        for (const [type, score] of typeCounts) {
            if (score > maxScore) {
                maxScore = score;
                suggestedType = type;
            }
        }
        return {
            matches: matches.slice(0, 10),
            suggestedType,
            confidence: matches.length > 0 ? matches[0].similarity : 0,
            recommendations: this.generateRecommendations(suggestedType, matches),
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CLUSTERING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Cluster patterns using K-Means
     */
    // Complexity: O(N*M) — nested iteration detected
    cluster(k = 5, maxIterations = 100) {
        const patterns = [...this.patterns.values()];
        if (patterns.length < k) {
            return [];
        }
        // Initialize centroids randomly
        const centroids = [];
        const indices = new Set();
        while (indices.size < k) {
            indices.add(Math.floor(Math.random() * patterns.length));
        }
        for (const idx of indices) {
            centroids.push([...patterns[idx].features]);
        }
        let assignments = new Map();
        for (let iter = 0; iter < maxIterations; iter++) {
            const newAssignments = new Map();
            const clusterSums = centroids.map(() => []);
            const clusterCounts = new Array(k).fill(0);
            // Assign patterns to nearest centroid
            for (const pattern of patterns) {
                let minDist = Infinity;
                let nearestCluster = 0;
                for (let c = 0; c < k; c++) {
                    const dist = SimilarityMetrics.euclidean(pattern.features, centroids[c]);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestCluster = c;
                    }
                }
                newAssignments.set(pattern.id, nearestCluster);
                clusterCounts[nearestCluster]++;
                // Accumulate for centroid update
                if (clusterSums[nearestCluster].length === 0) {
                    clusterSums[nearestCluster] = [...pattern.features];
                }
                else {
                    for (let i = 0; i < pattern.features.length; i++) {
                        clusterSums[nearestCluster][i] += pattern.features[i];
                    }
                }
            }
            // Check convergence
            let changed = false;
            for (const [id, cluster] of newAssignments) {
                if (assignments.get(id) !== cluster) {
                    changed = true;
                    break;
                }
            }
            if (!changed)
                break;
            assignments = newAssignments;
            // Update centroids
            for (let c = 0; c < k; c++) {
                if (clusterCounts[c] > 0) {
                    centroids[c] = clusterSums[c].map((sum) => sum / clusterCounts[c]);
                }
            }
        }
        // Create cluster objects
        const clusters = [];
        for (let c = 0; c < k; c++) {
            const clusterPatterns = patterns.filter((p) => assignments.get(p.id) === c);
            if (clusterPatterns.length > 0) {
                const cluster = {
                    id: `cluster_${c}`,
                    centroid: centroids[c],
                    patterns: clusterPatterns,
                    label: this.inferClusterLabel(clusterPatterns),
                };
                clusters.push(cluster);
                this.clusters.set(cluster.id, cluster);
            }
        }
        return clusters;
    }
    /**
     * Find cluster for features
     */
    // Complexity: O(N) — linear iteration
    findCluster(features) {
        let nearestCluster = null;
        let minDist = Infinity;
        for (const cluster of this.clusters.values()) {
            const dist = SimilarityMetrics.euclidean(features, cluster.centroid);
            if (dist < minDist) {
                minDist = dist;
                nearestCluster = cluster;
            }
        }
        return nearestCluster;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get all patterns
     */
    // Complexity: O(1)
    getPatterns() {
        return [...this.patterns.values()];
    }
    /**
     * Get patterns by type
     */
    // Complexity: O(N) — linear iteration
    getPatternsByType(type) {
        return [...this.patterns.values()].filter((p) => p.type === type);
    }
    /**
     * Clear all patterns
     */
    // Complexity: O(1)
    clear() {
        this.patterns.clear();
        this.clusters.clear();
    }
    /**
     * Export patterns
     */
    // Complexity: O(1)
    export() {
        return {
            patterns: [...this.patterns.values()],
            clusters: [...this.clusters.values()],
        };
    }
    /**
     * Import patterns
     */
    import(data) {
        for (const pattern of data.patterns) {
            this.patterns.set(pattern.id, pattern);
        }
        for (const cluster of data.clusters) {
            this.clusters.set(cluster.id, cluster);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — linear iteration
    findBestMatch(features) {
        let bestMatch = null;
        for (const pattern of this.patterns.values()) {
            if (pattern.features.length !== features.length)
                continue;
            const similarity = SimilarityMetrics.cosine(features, pattern.features);
            if (!bestMatch || similarity > bestMatch.similarity) {
                bestMatch = {
                    pattern,
                    similarity,
                    matchedFeatures: this.getMatchedFeatures(features, pattern.features),
                };
            }
        }
        return bestMatch;
    }
    // Complexity: O(N) — linear iteration
    getMatchedFeatures(a, b) {
        const featureNames = [
            'duration',
            'relativeDuration',
            'passed',
            'retries',
            'errorType',
            'timeOfDay',
            'dayOfWeek',
            'memoryUsage',
            'cpuUsage',
        ];
        const matched = [];
        for (let i = 0; i < Math.min(a.length, b.length, featureNames.length); i++) {
            if (Math.abs(a[i] - b[i]) < 0.1) {
                matched.push(featureNames[i]);
            }
        }
        return matched;
    }
    // Complexity: O(N*M) — nested iteration detected
    generateRecommendations(type, matches) {
        const recommendations = [];
        switch (type) {
            case 'flaky':
                recommendations.push('Add retry logic to stabilize the test');
                recommendations.push('Check for race conditions or timing issues');
                recommendations.push('Consider mocking external dependencies');
                break;
            case 'slow':
                recommendations.push('Profile test to identify bottlenecks');
                recommendations.push('Consider parallel execution');
                recommendations.push('Optimize setup/teardown phases');
                break;
            case 'resource-heavy':
                recommendations.push('Reduce memory allocations');
                recommendations.push('Implement resource pooling');
                recommendations.push('Consider test isolation');
                break;
            case 'timing':
                recommendations.push('Use explicit waits instead of sleeps');
                recommendations.push('Consider time mocking');
                recommendations.push('Check for timezone dependencies');
                break;
            case 'dependency':
                recommendations.push('Mock external services');
                recommendations.push('Ensure proper initialization order');
                recommendations.push('Check for circular dependencies');
                break;
            default:
                recommendations.push('Review test isolation');
                recommendations.push('Check error handling');
                recommendations.push('Validate test data');
        }
        return recommendations;
    }
    // Complexity: O(N*M) — nested iteration detected
    inferClusterLabel(patterns) {
        const typeCounts = new Map();
        for (const pattern of patterns) {
            typeCounts.set(pattern.type, (typeCounts.get(pattern.type) || 0) + 1);
        }
        let dominantType = 'failure';
        let maxCount = 0;
        for (const [type, count] of typeCounts) {
            if (count > maxCount) {
                maxCount = count;
                dominantType = type;
            }
        }
        return `${dominantType} patterns`;
    }
}
exports.PatternRecognizer = PatternRecognizer;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getPatternRecognizer = () => PatternRecognizer.getInstance();
exports.getPatternRecognizer = getPatternRecognizer;
exports.default = PatternRecognizer;
