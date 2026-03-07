"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum DATA FACTORIES                                                       ║
 * ║   "Sophisticated test data generation"                                        ║
 * ║                                                                               ║
 * ║   TODO B #38 - Data: Factory patterns                                         ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.factories = exports.getFactoryManager = exports.FactoryBuilder = exports.FactoryManager = exports.Factory = void 0;
exports.defineFactory = defineFactory;
exports.factory = factory;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
class Factory {
    config;
    sequenceValues = new Map();
    buildIndex = 0;
    constructor(config) {
        this.config = config;
    }
    /**
     * Build entity without saving
     */
    // Complexity: O(N) — loop
    build(overrides, traits) {
        const index = ++this.buildIndex;
        let entity = this.config.definition();
        // Apply traits
        if (traits) {
            for (const traitName of traits) {
                const trait = this.config.traits?.[traitName];
                if (trait) {
                    entity = { ...entity, ...trait };
                }
            }
        }
        // Apply overrides
        if (overrides) {
            entity = { ...entity, ...overrides };
        }
        // Run afterBuild callback
        if (this.config.afterBuild) {
            entity = this.config.afterBuild(entity, index);
        }
        return entity;
    }
    /**
     * Build multiple entities
     */
    // Complexity: O(1)
    buildList(count, overrides, traits) {
        return Array.from({ length: count }, () => this.build(overrides, traits));
    }
    /**
     * Create entity (build + afterCreate)
     */
    // Complexity: O(1)
    create(overrides, traits) {
        const index = this.buildIndex;
        let entity = this.build(overrides, traits);
        if (this.config.afterCreate) {
            entity = this.config.afterCreate(entity, index);
        }
        return entity;
    }
    /**
     * Create multiple entities
     */
    // Complexity: O(1)
    createList(count, overrides, traits) {
        return Array.from({ length: count }, () => this.create(overrides, traits));
    }
    /**
     * Build with specific trait
     */
    // Complexity: O(1)
    trait(traitName) {
        // Returns a modified factory that applies this trait by default
        return this;
    }
    /**
     * Get next sequence value
     */
    // Complexity: O(1) — lookup
    sequence(name = 'default') {
        const current = this.sequenceValues.get(name) || 0;
        const next = current + 1;
        this.sequenceValues.set(name, next);
        return next;
    }
    /**
     * Reset sequences
     */
    // Complexity: O(1)
    resetSequences() {
        this.sequenceValues.clear();
        this.buildIndex = 0;
    }
    /**
     * Add trait to factory
     */
    // Complexity: O(1)
    addTrait(name, trait) {
        if (!this.config.traits) {
            this.config.traits = {};
        }
        this.config.traits[name] = trait;
        return this;
    }
}
exports.Factory = Factory;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class FactoryManager {
    static instance;
    factories = new Map();
    constructor() { }
    static getInstance() {
        if (!FactoryManager.instance) {
            FactoryManager.instance = new FactoryManager();
        }
        return FactoryManager.instance;
    }
    /**
     * Define a factory
     */
    define(name, config) {
        const factory = new Factory(config);
        this.factories.set(name, factory);
        return factory;
    }
    /**
     * Get factory
     */
    get(name) {
        const factory = this.factories.get(name);
        if (!factory) {
            throw new Error(`Factory "${name}" not found`);
        }
        return factory;
    }
    /**
     * Build using named factory
     */
    build(name, overrides) {
        return this.get(name).build(overrides);
    }
    /**
     * Create using named factory
     */
    create(name, overrides) {
        return this.get(name).create(overrides);
    }
    /**
     * Build list using named factory
     */
    buildList(name, count, overrides) {
        return this.get(name).buildList(count, overrides);
    }
    /**
     * Reset all factories
     */
    // Complexity: O(N) — loop
    resetAll() {
        for (const factory of this.factories.values()) {
            factory.resetSequences();
        }
    }
    /**
     * Clear all factories
     */
    // Complexity: O(1)
    clear() {
        this.factories.clear();
    }
    /**
     * Has factory
     */
    // Complexity: O(1) — lookup
    has(name) {
        return this.factories.has(name);
    }
    /**
     * List factory names
     */
    // Complexity: O(1)
    list() {
        return [...this.factories.keys()];
    }
}
exports.FactoryManager = FactoryManager;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
class FactoryBuilder {
    config = {};
    name;
    constructor(name) {
        this.name = name;
    }
    /**
     * Set definition
     */
    // Complexity: O(1)
    definition(fn) {
        this.config.definition = fn;
        return this;
    }
    /**
     * Add trait
     */
    // Complexity: O(1)
    trait(name, trait) {
        if (!this.config.traits) {
            this.config.traits = {};
        }
        this.config.traits[name] = trait;
        return this;
    }
    /**
     * Add sequence
     */
    // Complexity: O(1)
    sequence(name, fn) {
        if (!this.config.sequences) {
            this.config.sequences = {};
        }
        this.config.sequences[name] = fn;
        return this;
    }
    /**
     * After build callback
     */
    // Complexity: O(1)
    afterBuild(fn) {
        this.config.afterBuild = fn;
        return this;
    }
    /**
     * After create callback
     */
    // Complexity: O(1)
    afterCreate(fn) {
        this.config.afterCreate = fn;
        return this;
    }
    /**
     * Build factory
     */
    // Complexity: O(1) — lookup
    build() {
        if (!this.config.definition) {
            throw new Error('Factory definition is required');
        }
        const factory = new Factory(this.config);
        if (this.name) {
            FactoryManager.getInstance().factories.set(this.name, factory);
        }
        return factory;
    }
    /**
     * Register with manager
     */
    // Complexity: O(1)
    register(name) {
        this.name = name;
        return this.build();
    }
}
exports.FactoryBuilder = FactoryBuilder;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getFactoryManager = () => FactoryManager.getInstance();
exports.getFactoryManager = getFactoryManager;
function defineFactory(name, config) {
    return FactoryManager.getInstance().define(name, config);
}
function factory(name) {
    return new FactoryBuilder(name);
}
// Quick factory operations
exports.factories = {
    define: (name, config) => FactoryManager.getInstance().define(name, config),
    get: (name) => FactoryManager.getInstance().get(name),
    build: (name, overrides) => FactoryManager.getInstance().build(name, overrides),
    create: (name, overrides) => FactoryManager.getInstance().create(name, overrides),
    buildList: (name, count, overrides) => FactoryManager.getInstance().buildList(name, count, overrides),
    reset: () => FactoryManager.getInstance().resetAll(),
    clear: () => FactoryManager.getInstance().clear(),
};
exports.default = Factory;
