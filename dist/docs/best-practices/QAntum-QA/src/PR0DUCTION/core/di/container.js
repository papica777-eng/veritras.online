"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INJECT_METADATA_KEY = exports.globalContainer = exports.DIContainer = exports.ServiceLifetime = exports.ServiceTokens = exports.ServiceToken = void 0;
exports.storeInjectionMetadata = storeInjectionMetadata;
exports.getInjectionMetadata = getInjectionMetadata;
const node_events_1 = require("node:events");
// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE TOKENS - Type-safe injection keys
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Service token for type-safe dependency injection
 * @template T - The service type this token represents
 */
class ServiceToken {
    /** Unique identifier for the service */
    id;
    /** Human-readable name for debugging */
    name;
    /** Type marker (never used at runtime) */
    _type;
    /**
     * Create a new service token
     * @param name - Human-readable identifier
     */
    constructor(name) {
        this.id = Symbol(name);
        this.name = name;
    }
}
exports.ServiceToken = ServiceToken;
// ═══════════════════════════════════════════════════════════════════════════════
// PREDEFINED SERVICE TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Core service tokens for QANTUM
 * Use these to inject dependencies throughout the application
 */
exports.ServiceTokens = {
    // Browser Engines
    BrowserEngine: new ServiceToken('BrowserEngine'),
    BrowserPool: new ServiceToken('BrowserPool'),
    // AI Services
    AIProvider: new ServiceToken('AIProvider'),
    ModelRouter: new ServiceToken('ModelRouter'),
    // Database/Storage
    Database: new ServiceToken('Database'),
    CacheProvider: new ServiceToken('CacheProvider'),
    NeuralVault: new ServiceToken('NeuralVault'),
    // Workers
    WorkerPool: new ServiceToken('WorkerPool'),
    TaskScheduler: new ServiceToken('TaskScheduler'),
    // Security
    Sandbox: new ServiceToken('Sandbox'),
    CircuitBreaker: new ServiceToken('CircuitBreaker'),
    // Observability
    Logger: new ServiceToken('Logger'),
    MetricsCollector: new ServiceToken('MetricsCollector'),
    HealthChecker: new ServiceToken('HealthChecker'),
    // Configuration
    Config: new ServiceToken('Config'),
    Environment: new ServiceToken('Environment'),
    // Error Handling
    ErrorHandler: new ServiceToken('ErrorHandler'),
    RetryStrategy: new ServiceToken('RetryStrategy'),
    // Semantic Core
    SemanticCore: new ServiceToken('SemanticCore'),
    // SEGC
    MutationEngine: new ServiceToken('MutationEngine'),
    GhostExecutor: new ServiceToken('GhostExecutor'),
    // Swarm
    SwarmOrchestrator: new ServiceToken('SwarmOrchestrator'),
    AgentFactory: new ServiceToken('AgentFactory')
};
// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE LIFETIME ENUM
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Service lifetime determines how instances are created and shared
 */
var ServiceLifetime;
(function (ServiceLifetime) {
    /** Single instance shared across all requests */
    ServiceLifetime["Singleton"] = "singleton";
    /** New instance for each scope (e.g., per request) */
    ServiceLifetime["Scoped"] = "scoped";
    /** New instance every time it's resolved */
    ServiceLifetime["Transient"] = "transient";
})(ServiceLifetime || (exports.ServiceLifetime = ServiceLifetime = {}));
// ═══════════════════════════════════════════════════════════════════════════════
// DI CONTAINER - The Heart of Dependency Injection
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 💎 Dependency Injection Container
 *
 * Central registry for all application services.
 * Supports singleton, scoped, and transient lifetimes.
 *
 * @example
 * ```typescript
 * const container = new DIContainer();
 *
 * // Register a singleton service
 * container.register(ServiceTokens.Logger, () => new ConsoleLogger(), ServiceLifetime.Singleton);
 *
 * // Resolve the service
 * const logger = await container.resolve(ServiceTokens.Logger);
 * logger.info('Hello from DI!');
 * ```
 */
class DIContainer extends node_events_1.EventEmitter {
    registrations = new Map();
    scopedInstances = new Map();
    currentScope = null;
    resolving = new Set();
    /**
     * Register a service with the container
     * @param token - Service token for type-safe resolution
     * @param factory - Factory function to create the service
     * @param lifetime - How the service instance should be managed
     * @throws Error if token is already registered
     */
    register(token, factory, lifetime = ServiceLifetime.Singleton) {
        if (this.registrations.has(token.id)) {
            throw new Error(`Service '${token.name}' is already registered. Use replace() to override.`);
        }
        this.registrations.set(token.id, {
            token,
            factory,
            lifetime
        });
        this.emit('registered', { token: token.name, lifetime });
    }
    /**
     * Replace an existing service registration
     * @param token - Service token to replace
     * @param factory - New factory function
     * @param lifetime - New lifetime (optional, keeps existing if not provided)
     */
    replace(token, factory, lifetime) {
        const existing = this.registrations.get(token.id);
        this.registrations.set(token.id, {
            token,
            factory,
            lifetime: lifetime ?? existing?.lifetime ?? ServiceLifetime.Singleton
        });
        // Clear cached instance if singleton
        if (existing?.instance) {
            delete existing.instance;
        }
        this.emit('replaced', { token: token.name, lifetime });
    }
    /**
     * Resolve a service from the container
     * @param token - Service token to resolve
     * @returns The resolved service instance
     * @throws Error if service is not registered or circular dependency detected
     */
    async resolve(token) {
        const registration = this.registrations.get(token.id);
        if (!registration) {
            throw new Error(`Service '${token.name}' is not registered. Did you forget to call register()?`);
        }
        // Detect circular dependencies
        if (this.resolving.has(token.id)) {
            throw new Error(`Circular dependency detected for service '${token.name}'`);
        }
        try {
            this.resolving.add(token.id);
            return await this.resolveRegistration(registration);
        }
        finally {
            this.resolving.delete(token.id);
        }
    }
    /**
     * Resolve a registration based on its lifetime
     */
    async resolveRegistration(registration) {
        switch (registration.lifetime) {
            case ServiceLifetime.Singleton:
                if (!registration.instance) {
                    registration.instance = await registration.factory(this);
                }
                return registration.instance;
            case ServiceLifetime.Scoped:
                if (!this.currentScope) {
                    throw new Error('Cannot resolve scoped service outside of a scope. Use container.runInScope().');
                }
                let scopeMap = this.scopedInstances.get(this.currentScope);
                if (!scopeMap) {
                    scopeMap = new Map();
                    this.scopedInstances.set(this.currentScope, scopeMap);
                }
                if (!scopeMap.has(registration.token.id)) {
                    scopeMap.set(registration.token.id, await registration.factory(this));
                }
                return scopeMap.get(registration.token.id);
            case ServiceLifetime.Transient:
                return await registration.factory(this);
        }
    }
    /**
     * Run a function within a new scope
     * @param scopeId - Unique identifier for the scope
     * @param fn - Function to run within the scope
     * @returns The result of the function
     */
    async runInScope(scopeId, fn) {
        const previousScope = this.currentScope;
        this.currentScope = scopeId;
        try {
            return await fn();
        }
        finally {
            // Clean up scoped instances
            this.scopedInstances.delete(scopeId);
            this.currentScope = previousScope;
        }
    }
    /**
     * Check if a service is registered
     * @param token - Service token to check
     * @returns True if the service is registered
     */
    isRegistered(token) {
        return this.registrations.has(token.id);
    }
    /**
     * Get all registered service names
     * @returns Array of registered service names
     */
    getRegisteredServices() {
        return Array.from(this.registrations.values()).map(r => r.token.name);
    }
    /**
     * Clear all registrations and instances
     * Use with caution - mainly for testing
     */
    clear() {
        this.registrations.clear();
        this.scopedInstances.clear();
        this.currentScope = null;
        this.resolving.clear();
        this.emit('cleared');
    }
    /**
     * Create a child container that inherits registrations
     * @returns A new child container
     */
    createChild() {
        const child = new DIContainer();
        // Copy registrations (but not instances)
        for (const [key, reg] of this.registrations) {
            child.registrations.set(key, {
                token: reg.token,
                factory: reg.factory,
                lifetime: reg.lifetime
            });
        }
        return child;
    }
}
exports.DIContainer = DIContainer;
// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL CONTAINER INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Global DI container instance
 * Use this for application-wide service resolution
 */
exports.globalContainer = new DIContainer();
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATOR HELPERS (for future use)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Metadata key for storing injection tokens
 */
// ═══════════════════════════════════════════════════════════════════════════════
// INJECTION METADATA (For decorator-based injection if using reflect-metadata)
// ═══════════════════════════════════════════════════════════════════════════════
exports.INJECT_METADATA_KEY = Symbol('inject');
// Internal metadata storage (no reflect-metadata dependency)
const injectionMetadataStore = new WeakMap();
/**
 * Store injection metadata for a class constructor parameter
 * @param target - Class constructor
 * @param token - Service token to inject
 * @param parameterIndex - Constructor parameter index
 */
function storeInjectionMetadata(target, token, parameterIndex) {
    const existing = injectionMetadataStore.get(target) || [];
    existing[parameterIndex] = token;
    injectionMetadataStore.set(target, existing);
}
/**
 * Retrieve injection metadata for a class
 * @param target - Class constructor
 * @returns Array of service tokens indexed by parameter position
 */
function getInjectionMetadata(target) {
    return injectionMetadataStore.get(target) || [];
}
exports.default = DIContainer;
