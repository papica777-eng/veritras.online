"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum DEPENDENCY INJECTION CONTAINER                                       ║
 * ║   "Inversion of Control за loose coupling"                                    ║
 * ║                                                                               ║
 * ║   TODO B #4 - Dependency Injection                                            ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainer = exports.TOKENS = exports.BindingBuilder = exports.Container = void 0;
exports.Injectable = Injectable;
exports.Inject = Inject;
exports.Optional = Optional;
// ═══════════════════════════════════════════════════════════════════════════════
// METADATA KEYS
// ═══════════════════════════════════════════════════════════════════════════════
const INJECTABLE_KEY = Symbol('injectable');
const INJECT_KEY = Symbol('inject');
const OPTIONAL_KEY = Symbol('optional');
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Маркира клас като injectable
 */
function Injectable(options) {
    return (target) => {
        Reflect.defineMetadata(INJECTABLE_KEY, {
            scope: options?.scope || 'transient',
            tags: options?.tags || [],
        }, target);
    };
}
/**
 * Маркира dependency за injection
 */
function Inject(token) {
    return (target, propertyKey, parameterIndex) => {
        const existingInjections = Reflect.getMetadata(INJECT_KEY, target) || [];
        existingInjections[parameterIndex] = token;
        Reflect.defineMetadata(INJECT_KEY, existingInjections, target);
    };
}
/**
 * Маркира dependency като optional
 */
function Optional() {
    return (target, propertyKey, parameterIndex) => {
        const existingOptionals = Reflect.getMetadata(OPTIONAL_KEY, target) || [];
        existingOptionals[parameterIndex] = true;
        Reflect.defineMetadata(OPTIONAL_KEY, existingOptionals, target);
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════
class Container {
    static instance;
    bindings = new Map();
    singletons = new Map();
    resolving = new Set();
    options;
    constructor(options = {}) {
        this.options = {
            defaultScope: 'transient',
            autoBindInjectable: true,
            enableCircularDependencyCheck: true,
            ...options,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SINGLETON
    // ─────────────────────────────────────────────────────────────────────────
    static getInstance() {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }
    static resetInstance() {
        Container.instance = undefined;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BINDING API (Fluent)
    // ─────────────────────────────────────────────────────────────────────────
    bind(token) {
        return new BindingBuilder(this, token);
    }
    /**
     * Shorthand: bind to self
     */
    bindSelf(constructor) {
        this.bind(constructor).toSelf();
    }
    /**
     * Bind constant value
     */
    bindValue(token, value) {
        this.bind(token).toValue(value);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL BINDING
    // ─────────────────────────────────────────────────────────────────────────
    /** @internal */
    addBinding(binding) {
        this.bindings.set(binding.token, binding);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Resolve a dependency
     */
    get(token) {
        // Check circular dependency
        if (this.options.enableCircularDependencyCheck) {
            if (this.resolving.has(token)) {
                throw new Error(`Circular dependency detected for: ${this.tokenToString(token)}`);
            }
        }
        // Check singleton cache
        if (this.singletons.has(token)) {
            return this.singletons.get(token);
        }
        // Get binding
        let binding = this.bindings.get(token);
        // Auto-bind if enabled and token is a constructor
        if (!binding && this.options.autoBindInjectable && typeof token === 'function') {
            const meta = Reflect.getMetadata(INJECTABLE_KEY, token);
            if (meta) {
                this.bind(token).toSelf().inScope(meta.scope);
                binding = this.bindings.get(token);
            }
        }
        if (!binding) {
            throw new Error(`No binding found for: ${this.tokenToString(token)}`);
        }
        // Resolve
        this.resolving.add(token);
        let instance;
        try {
            instance = this.resolveBinding(binding);
        }
        finally {
            this.resolving.delete(token);
        }
        // Cache singleton
        if (binding.scope === 'singleton') {
            this.singletons.set(token, instance);
        }
        return instance;
    }
    /**
     * Try to resolve, return undefined if not found
     */
    tryGet(token) {
        try {
            return this.get(token);
        }
        catch {
            return undefined;
        }
    }
    /**
     * Check if binding exists
     */
    // Complexity: O(1) — hash/map lookup
    has(token) {
        return this.bindings.has(token);
    }
    /**
     * Get all bindings with a specific tag
     */
    getAllByTag(tag) {
        const results = [];
        for (const binding of this.bindings.values()) {
            if (binding.tags.includes(tag)) {
                results.push(this.get(binding.token));
            }
        }
        return results;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────
    resolveBinding(binding) {
        switch (binding.type) {
            case 'value':
                return binding.implementation;
            case 'factory':
                return binding.implementation();
            case 'class':
                return this.instantiate(binding.implementation);
            default:
                throw new Error(`Unknown binding type: ${binding.type}`);
        }
    }
    instantiate(constructor) {
        // Get constructor parameter types
        const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];
        const injections = Reflect.getMetadata(INJECT_KEY, constructor) || [];
        const optionals = Reflect.getMetadata(OPTIONAL_KEY, constructor) || [];
        // Resolve dependencies
        const deps = paramTypes.map((type, index) => {
            const token = injections[index] || type;
            const isOptional = optionals[index];
            if (isOptional) {
                return this.tryGet(token);
            }
            return this.get(token);
        });
        return new constructor(...deps);
    }
    // Complexity: O(1)
    tokenToString(token) {
        if (typeof token === 'symbol') {
            return token.toString();
        }
        if (typeof token === 'function') {
            return token.name;
        }
        return String(token);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Clear all bindings and singletons
     */
    // Complexity: O(1)
    clear() {
        this.bindings.clear();
        this.singletons.clear();
    }
    /**
     * Unbind a specific token
     */
    // Complexity: O(1)
    unbind(token) {
        this.bindings.delete(token);
        this.singletons.delete(token);
    }
    /**
     * Rebind (unbind + bind)
     */
    rebind(token) {
        this.unbind(token);
        return this.bind(token);
    }
    /**
     * Create a child container
     */
    // Complexity: O(N*M) — nested iteration detected
    createChild() {
        const child = new Container(this.options);
        // Copy parent bindings
        for (const [token, binding] of this.bindings) {
            child.bindings.set(token, binding);
        }
        // Share singletons
        for (const [token, instance] of this.singletons) {
            child.singletons.set(token, instance);
        }
        return child;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DEBUG
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get debug info
     */
    // Complexity: O(N) — linear iteration
    debug() {
        return {
            bindings: this.bindings.size,
            singletons: this.singletons.size,
            tokens: [...this.bindings.keys()].map((t) => this.tokenToString(t)),
        };
    }
}
exports.Container = Container;
// ═══════════════════════════════════════════════════════════════════════════════
// BINDING BUILDER (Fluent API)
// ═══════════════════════════════════════════════════════════════════════════════
class BindingBuilder {
    container;
    binding = {
        scope: 'transient',
        tags: [],
        type: 'class',
    };
    constructor(container, token) {
        this.container = container;
        this.binding.token = token;
    }
    /**
     * Bind to self (same class)
     */
    // Complexity: O(N) — potential recursive descent
    toSelf() {
        if (typeof this.binding.token !== 'function') {
            throw new Error('toSelf() can only be used with class tokens');
        }
        this.binding.implementation = this.binding.token;
        this.binding.type = 'class';
        this.finalize();
        return this;
    }
    /**
     * Bind to a different class
     */
    // Complexity: O(N) — potential recursive descent
    to(constructor) {
        this.binding.implementation = constructor;
        this.binding.type = 'class';
        this.finalize();
        return this;
    }
    /**
     * Bind to a factory function
     */
    // Complexity: O(N) — potential recursive descent
    toFactory(factory) {
        this.binding.implementation = factory;
        this.binding.type = 'factory';
        this.finalize();
        return this;
    }
    /**
     * Bind to a constant value
     */
    // Complexity: O(N) — potential recursive descent
    toValue(value) {
        this.binding.implementation = value;
        this.binding.type = 'value';
        this.finalize();
        return this;
    }
    /**
     * Set scope
     */
    // Complexity: O(N) — potential recursive descent
    inScope(scope) {
        this.binding.scope = scope;
        this.finalize();
        return this;
    }
    /**
     * Shorthand: singleton scope
     */
    // Complexity: O(N) — potential recursive descent
    inSingletonScope() {
        return this.inScope('singleton');
    }
    /**
     * Shorthand: transient scope
     */
    // Complexity: O(N) — potential recursive descent
    inTransientScope() {
        return this.inScope('transient');
    }
    /**
     * Add tags
     */
    // Complexity: O(N) — potential recursive descent
    withTags(...tags) {
        this.binding.tags = [...(this.binding.tags || []), ...tags];
        this.finalize();
        return this;
    }
    // Complexity: O(1)
    finalize() {
        if (this.binding.implementation !== undefined) {
            this.container.addBinding(this.binding);
        }
    }
}
exports.BindingBuilder = BindingBuilder;
// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
exports.TOKENS = {
    // Core Services
    Logger: Symbol('Logger'),
    Config: Symbol('Config'),
    EventBus: Symbol('EventBus'),
    // Oracle Services
    Oracle: Symbol('Oracle'),
    PatternEngine: Symbol('PatternEngine'),
    LearningEngine: Symbol('LearningEngine'),
    // Cognition Services
    ThoughtChain: Symbol('ThoughtChain'),
    SelfCritique: Symbol('SelfCritique'),
    InferenceEngine: Symbol('InferenceEngine'),
    SemanticMemory: Symbol('SemanticMemory'),
    // Test Services
    TestRunner: Symbol('TestRunner'),
    TestReporter: Symbol('TestReporter'),
    AssertionEngine: Symbol('AssertionEngine'),
};
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getContainer = () => Container.getInstance();
exports.getContainer = getContainer;
exports.default = Container;
