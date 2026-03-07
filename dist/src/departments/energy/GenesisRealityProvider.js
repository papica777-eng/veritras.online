"use strict";
/**
 * Genesis Reality Provider - МОСТ КЪМ МАНИФЕСТИРАНАТА РЕАЛНОСТ
 *
 * "Аксиомите дефинират законите, Docker ги изпълнява"
 *
 * This provider bridges the abstract Genesis axiom systems to concrete
 * Docker containers, creating isolated test environments that follow
 * the mathematical and logical rules defined by Genesis.
 *
 * KEY CONCEPTS:
 * - AxiomSystem → Docker Compose configuration
 * - CausalityType → Network topology and dependencies
 * - Reality → Running container ecosystem
 * - Observation → Test execution within reality
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.genesisRealityProvider = exports.GenesisRealityProvider = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const util_1 = require("util");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS REALITY PROVIDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class GenesisRealityProvider extends events_1.EventEmitter {
    prisma;
    realitiesDir;
    activeRealities = new Map();
    realityProcesses = new Map();
    // Default images for different service types
    serviceImages = {
        web: 'nginx:alpine',
        api: 'node:20-alpine',
        database: 'postgres:16-alpine',
        cache: 'redis:7-alpine',
        queue: 'rabbitmq:3-alpine',
        storage: 'minio/minio:latest',
        proxy: 'traefik:v3.0',
        monitor: 'prom/prometheus:latest',
        chaos: 'gaiaadm/pumba:latest',
    };
    constructor(options = {}) {
        super();
        this.prisma = new client_1.PrismaClient();
        this.realitiesDir = options.realitiesDir || (0, path_1.join)(process.cwd(), '.genesis-realities');
        this.ensureRealitiesDir();
        this.setupShutdownHandlers();
    }
    // Complexity: O(1)
    async ensureRealitiesDir() {
        if (!(0, fs_1.existsSync)(this.realitiesDir)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await (0, promises_1.mkdir)(this.realitiesDir, { recursive: true });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // AXIOM → DOCKER TRANSLATION ENGINE
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Translate Genesis axioms into Docker Compose configuration
     */
    // Complexity: O(N*M) — nested iteration detected
    translateAxiomsToDocker(spec) {
        const services = {};
        const networks = {};
        const volumes = {};
        // Create isolated network for this reality
        const networkName = `genesis-${spec.id}`;
        networks[networkName] = { driver: 'bridge' };
        // Process each axiom to generate services
        for (const axiom of spec.axioms) {
            const service = this.axiomToService(axiom, spec, networkName);
            if (service) {
                services[service.name] = service;
                // Handle volumes if needed
                if (axiom.type === 'CONSERVATION') {
                    volumes[`${service.name}-data`] = { driver: 'local' };
                }
            }
        }
        // Apply causality type to service dependencies
        this.applyCausalityToServices(services, spec.causality);
        // Apply coherence and entropy to service stability
        this.applyStabilityFactors(services, spec.coherence, spec.entropy);
        return {
            version: '3.8',
            services,
            networks,
            volumes: Object.keys(volumes).length > 0 ? volumes : undefined,
        };
    }
    /**
     * Convert a single axiom to a Docker service specification
     */
    // Complexity: O(N) — linear iteration
    axiomToService(axiom, spec, network) {
        const baseName = `axiom-${axiom.type.toLowerCase()}-${axiom.id.slice(0, 8)}`;
        switch (axiom.type) {
            case 'IDENTITY':
                // Identity axiom creates an isolated API service
                return {
                    name: baseName,
                    image: this.serviceImages.api,
                    networks: [network],
                    environment: {
                        REALITY_ID: spec.id,
                        AXIOM_ID: axiom.id,
                        GENESIS_MODE: 'identity',
                        NODE_ENV: 'test',
                    },
                    labels: {
                        'genesis.axiom.type': axiom.type,
                        'genesis.reality.id': spec.id,
                        'genesis.tenant.id': spec.tenantId,
                    },
                    deploy: {
                        replicas: 1,
                        resources: {
                            limits: { memory: '256M', cpus: '0.5' },
                        },
                    },
                    restart: 'unless-stopped',
                };
            case 'CAUSALITY':
                // Causality axiom creates a service that depends on others
                return {
                    name: baseName,
                    image: this.serviceImages.api,
                    networks: [network],
                    environment: {
                        REALITY_ID: spec.id,
                        CAUSALITY_TYPE: spec.causality,
                        DEPENDENCIES: axiom.dependencies.join(','),
                    },
                    depends_on: axiom.dependencies.length > 0
                        ? Object.fromEntries(axiom.dependencies.map(dep => [dep, { condition: 'service_healthy' }]))
                        : undefined,
                    labels: {
                        'genesis.axiom.type': axiom.type,
                        'genesis.reality.id': spec.id,
                    },
                    healthcheck: {
                        test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:3000/health'],
                        interval: '10s',
                        timeout: '5s',
                        retries: 3,
                    },
                };
            case 'TEMPORAL':
                // Temporal axiom - creates a service with time-based behaviors
                return {
                    name: baseName,
                    image: this.serviceImages.api,
                    networks: [network],
                    environment: {
                        REALITY_ID: spec.id,
                        TEMPORAL_FLOW: spec.temporalFlow,
                        TIME_DILATION: String(axiom.strength),
                    },
                    labels: {
                        'genesis.axiom.type': axiom.type,
                        'genesis.temporal.flow': spec.temporalFlow,
                    },
                };
            case 'CONSERVATION':
                // Conservation axiom - strict resource limits
                return {
                    name: baseName,
                    image: this.serviceImages.database,
                    networks: [network],
                    environment: {
                        POSTGRES_USER: 'genesis',
                        POSTGRES_PASSWORD: `genesis-${spec.id.slice(0, 8)}`,
                        POSTGRES_DB: 'reality',
                    },
                    volumes: [`${baseName}-data:/var/lib/postgresql/data`],
                    deploy: {
                        resources: {
                            limits: {
                                memory: `${Math.round(256 * axiom.strength)}M`,
                                cpus: String(axiom.strength),
                            },
                            reservations: {
                                memory: '64M',
                                cpus: '0.1',
                            },
                        },
                    },
                    healthcheck: {
                        test: ['CMD-SHELL', 'pg_isready -U genesis'],
                        interval: '15s',
                        timeout: '10s',
                        retries: 5,
                    },
                };
            case 'SYMMETRY':
                // Symmetry axiom - load balanced replicas
                const replicas = Math.max(2, Math.round(axiom.strength * 5));
                return {
                    name: baseName,
                    image: this.serviceImages.web,
                    networks: [network],
                    deploy: {
                        replicas,
                        resources: {
                            limits: { memory: '128M', cpus: '0.25' },
                        },
                    },
                    labels: {
                        'genesis.axiom.type': axiom.type,
                        'genesis.symmetry.replicas': String(replicas),
                    },
                };
            case 'COMPLEMENTARITY':
                // Complementarity axiom - A/B testing setup
                return {
                    name: baseName,
                    image: this.serviceImages.proxy,
                    networks: [network],
                    ports: ['80:80'],
                    environment: {
                        VARIANT_A_WEIGHT: String(axiom.strength * 100),
                        VARIANT_B_WEIGHT: String((1 - axiom.strength) * 100),
                    },
                    command: [
                        '--api.insecure=true',
                        '--providers.docker=true',
                        '--providers.docker.exposedbydefault=false',
                    ],
                    labels: {
                        'genesis.axiom.type': axiom.type,
                        'genesis.ab.ratio': String(axiom.strength),
                    },
                };
            case 'UNCERTAINTY':
                // Uncertainty axiom - chaos engineering
                return {
                    name: baseName,
                    image: this.serviceImages.chaos,
                    networks: [network],
                    volumes: ['/var/run/docker.sock:/var/run/docker.sock'],
                    environment: {
                        CHAOS_PROBABILITY: String(spec.entropy),
                        TARGET_LABELS: `genesis.reality.id=${spec.id}`,
                    },
                    labels: {
                        'genesis.axiom.type': axiom.type,
                        'genesis.chaos.level': String(spec.entropy),
                    },
                    command: spec.entropy > 0.5
                        ? ['--random', '--interval', '30s', 'kill', '--signal', 'SIGKILL']
                        : ['--random', '--interval', '60s', 'pause', '--duration', '10s'],
                };
            case 'EMERGENCE':
                // Emergence axiom - auto-scaling monitor
                return {
                    name: baseName,
                    image: this.serviceImages.monitor,
                    networks: [network],
                    ports: ['9090:9090'],
                    environment: {
                        EMERGENCE_THRESHOLD: String(axiom.strength),
                        SCALE_UP_TRIGGER: '0.8',
                        SCALE_DOWN_TRIGGER: '0.2',
                    },
                    labels: {
                        'genesis.axiom.type': axiom.type,
                    },
                };
            case 'HOLOGRAPHIC':
                // Holographic axiom - distributed cache for state sync
                return {
                    name: baseName,
                    image: this.serviceImages.cache,
                    networks: [network],
                    ports: ['6379:6379'],
                    environment: {
                        REDIS_MAXMEMORY: '64mb',
                        REDIS_MAXMEMORY_POLICY: 'allkeys-lru',
                    },
                    deploy: {
                        replicas: spec.dimensions > 4 ? 3 : 1,
                    },
                    labels: {
                        'genesis.axiom.type': axiom.type,
                        'genesis.dimensions': String(spec.dimensions),
                    },
                };
            default:
                console.warn(`Unknown axiom type: ${axiom.type}`);
                return null;
        }
    }
    /**
     * Apply causality type to determine service startup order
     */
    // Complexity: O(N*M) — nested iteration detected
    applyCausalityToServices(services, causality) {
        const serviceNames = Object.keys(services);
        switch (causality) {
            case 'DETERMINISTIC':
                // Strict linear dependency chain
                for (let i = 1; i < serviceNames.length; i++) {
                    services[serviceNames[i]].depends_on = {
                        [serviceNames[i - 1]]: { condition: 'service_started' },
                    };
                }
                break;
            case 'SUPERDETERMINISTIC':
                // All services depend on first one
                const master = serviceNames[0];
                for (let i = 1; i < serviceNames.length; i++) {
                    services[serviceNames[i]].depends_on = {
                        [master]: { condition: 'service_healthy' },
                    };
                }
                break;
            case 'ACAUSAL':
                // Remove all dependencies - fully parallel startup
                for (const name of serviceNames) {
                    delete services[name].depends_on;
                }
                break;
            case 'BIDIRECTIONAL':
                // Circular dependencies (Docker will handle with health checks)
                for (let i = 0; i < serviceNames.length; i++) {
                    const next = (i + 1) % serviceNames.length;
                    services[serviceNames[i]].labels = {
                        ...services[serviceNames[i]].labels,
                        'genesis.bidirectional.partner': serviceNames[next],
                    };
                }
                break;
            case 'PROBABILISTIC':
                // Random failures - add chaos markers
                for (const name of serviceNames) {
                    services[name].labels = {
                        ...services[name].labels,
                        'genesis.probabilistic.failure': 'true',
                    };
                }
                break;
            case 'EMERGENT':
            case 'RETROCAUSAL':
                // Keep existing dependencies but add special markers
                for (const name of serviceNames) {
                    services[name].labels = {
                        ...services[name].labels,
                        'genesis.causality.type': causality,
                    };
                }
                break;
        }
    }
    /**
     * Apply coherence and entropy factors to service stability
     */
    // Complexity: O(N) — linear iteration
    applyStabilityFactors(services, coherence, entropy) {
        for (const [name, service] of Object.entries(services)) {
            // High coherence = more robust restart policies
            if (coherence > 0.7) {
                service.restart = 'always';
                if (service.deploy) {
                    service.deploy.resources = {
                        ...service.deploy.resources,
                        reservations: { memory: '128M', cpus: '0.2' },
                    };
                }
            }
            else if (coherence < 0.3) {
                service.restart = 'no';
            }
            // High entropy = add random failure labels
            if (entropy > 0.5) {
                service.labels = {
                    ...service.labels,
                    'genesis.entropy.high': 'true',
                    'genesis.chaos.eligible': 'true',
                };
            }
            // Update environment with stability factors
            service.environment = {
                ...service.environment,
                GENESIS_COHERENCE: String(coherence),
                GENESIS_ENTROPY: String(entropy),
            };
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // REALITY MANIFESTATION - Docker Compose Operations
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Manifest a reality from Genesis specification
     */
    // Complexity: O(N)
    async manifestReality(spec) {
        const realityDir = (0, path_1.join)(this.realitiesDir, spec.id);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await (0, promises_1.mkdir)(realityDir, { recursive: true });
        // Translate axioms to Docker Compose
        const composeConfig = this.translateAxiomsToDocker(spec);
        const composeFile = (0, path_1.join)(realityDir, 'docker-compose.yml');
        // Write compose file
        // SAFETY: async operation — wrap in try-catch for production resilience
        await (0, promises_1.writeFile)(composeFile, this.toYaml(composeConfig));
        // Create manifestation record
        const manifestation = {
            id: (0, crypto_1.randomUUID)(),
            specId: spec.id,
            tenantId: spec.tenantId,
            status: 'MANIFESTING',
            containers: [],
            network: `genesis-${spec.id}`,
            composeFile,
            startTime: new Date(),
            observerCount: 0,
        };
        this.activeRealities.set(manifestation.id, manifestation);
        this.emit('manifesting', { realityId: manifestation.id, spec });
        try {
            // Start Docker Compose
            await this.runDockerCompose(realityDir, 'up', ['-d', '--build']);
            // Wait for containers to be ready
            await this.waitForStability(manifestation.id, realityDir);
            manifestation.status = 'STABLE';
            manifestation.containers = await this.getContainerInfo(realityDir);
            this.emit('manifested', { realityId: manifestation.id, containers: manifestation.containers });
            // Store in database
            await this.persistReality(manifestation, spec);
        }
        catch (error) {
            manifestation.status = 'COLLAPSING';
            this.emit('manifestationFailed', { realityId: manifestation.id, error: error.message });
            throw error;
        }
        return manifestation;
    }
    /**
     * Collapse (destroy) a manifested reality
     */
    // Complexity: O(1) — hash/map lookup
    async collapseReality(realityId) {
        const manifestation = this.activeRealities.get(realityId);
        if (!manifestation) {
            throw new Error(`Reality ${realityId} not found`);
        }
        manifestation.status = 'COLLAPSING';
        this.emit('collapsing', { realityId });
        const realityDir = (0, path_1.join)(this.realitiesDir, manifestation.specId);
        try {
            // Stop and remove containers
            await this.runDockerCompose(realityDir, 'down', ['--volumes', '--remove-orphans']);
            // Cleanup directory
            await (0, promises_1.rm)(realityDir, { recursive: true, force: true });
            manifestation.status = 'COLLAPSED';
            this.activeRealities.delete(realityId);
            // Update database
            await this.markRealityCollapsed(realityId);
            this.emit('collapsed', { realityId });
        }
        catch (error) {
            console.error(`Failed to collapse reality ${realityId}:`, error);
            throw error;
        }
    }
    /**
     * Observe a reality (execute tests within it)
     */
    // Complexity: O(N) — linear iteration
    async observeReality(request) {
        const manifestation = this.activeRealities.get(request.realityId);
        if (!manifestation) {
            throw new Error(`Reality ${request.realityId} not found`);
        }
        if (manifestation.status !== 'STABLE') {
            throw new Error(`Reality ${request.realityId} is not stable (${manifestation.status})`);
        }
        manifestation.observerCount++;
        this.emit('observing', { realityId: request.realityId, observerId: request.observerId });
        const startTime = Date.now();
        const logs = [];
        try {
            // Find target container
            const targetContainer = manifestation.containers.find(c => c.name.includes(request.targetService));
            if (!targetContainer) {
                throw new Error(`Target service ${request.targetService} not found in reality`);
            }
            // Execute test code within container
            const result = await this.executeInContainer(targetContainer.id, request.testCode, request.timeout);
            logs.push(`Test executed in container ${targetContainer.id}`);
            const observation = {
                success: result.exitCode === 0,
                waveformCollapsed: request.collapseOnObservation || false,
                measuredState: {
                    containerStatus: targetContainer.status,
                    output: result.stdout,
                    error: result.stderr,
                },
                duration: Date.now() - startTime,
                logs,
            };
            // Collapse if requested (observation affects reality)
            if (request.collapseOnObservation) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.collapseReality(request.realityId);
            }
            this.emit('observed', {
                realityId: request.realityId,
                observerId: request.observerId,
                success: observation.success,
            });
            return observation;
        }
        catch (error) {
            return {
                success: false,
                waveformCollapsed: false,
                measuredState: {},
                duration: Date.now() - startTime,
                error: error.message,
                logs,
            };
        }
        finally {
            manifestation.observerCount--;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // DOCKER OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async runDockerCompose(cwd, command, args = []) {
        const fullCommand = `docker compose ${command} ${args.join(' ')}`;
        return execAsync(fullCommand, { cwd, timeout: 120000 });
    }
    // Complexity: O(N) — linear iteration
    async waitForStability(realityId, realityDir) {
        const maxWaitTime = 60000; // 1 minute
        const checkInterval = 2000;
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { stdout } = await this.runDockerCompose(realityDir, 'ps', ['--format', 'json']);
            try {
                const containers = stdout.trim().split('\n')
                    .filter(line => line)
                    .map(line => JSON.parse(line));
                const allHealthy = containers.every((c) => c.State === 'running' && (!c.Health || c.Health === 'healthy'));
                if (allHealthy && containers.length > 0) {
                    return;
                }
            }
            catch {
                // JSON parsing failed, continue waiting
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        throw new Error('Reality failed to stabilize within timeout');
    }
    // Complexity: O(N) — linear iteration
    async getContainerInfo(realityDir) {
        try {
            const { stdout } = await this.runDockerCompose(realityDir, 'ps', ['--format', 'json']);
            return stdout.trim().split('\n')
                .filter(line => line)
                .map(line => {
                const c = JSON.parse(line);
                return {
                    id: c.ID,
                    name: c.Name,
                    image: c.Image,
                    status: c.State,
                    ports: c.Ports?.split(',').filter((p) => p) || [],
                    health: c.Health,
                };
            });
        }
        catch {
            return [];
        }
    }
    // Complexity: O(1)
    async executeInContainer(containerId, command, timeout) {
        return new Promise((resolve, reject) => {
            const proc = (0, child_process_1.spawn)('docker', ['exec', containerId, 'sh', '-c', command], {
                timeout,
            });
            //       let stdout = ';
            //       let stderr = ';
            proc.stdout.on('data', data => { stdout += data.toString(); });
            proc.stderr.on('data', data => { stderr += data.toString(); });
            proc.on('close', code => {
                // Complexity: O(1)
                resolve({ exitCode: code || 0, stdout, stderr });
            });
            proc.on('error', reject);
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    async persistReality(manifestation, spec) {
        // Store in database for tracking
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.prisma.$executeRaw `
      INSERT INTO genesis_realities (id, spec_id, tenant_id, status, containers, created_at)
      // Complexity: O(1)
      VALUES (${manifestation.id}, ${spec.id}, ${spec.tenantId}, ${manifestation.status},
              ${JSON.stringify(manifestation.containers)}::jsonb, ${manifestation.startTime})
      ON CONFLICT (id) DO UPDATE SET
        status = ${manifestation.status},
        containers = ${JSON.stringify(manifestation.containers)}::jsonb
    `.catch(() => {
            // Table might not exist yet, that's ok
            console.warn('genesis_realities table not found, skipping persistence');
        });
    }
    // Complexity: O(1)
    async markRealityCollapsed(realityId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.prisma.$executeRaw `
      UPDATE genesis_realities SET status = 'COLLAPSED', collapsed_at = NOW()
      WHERE id = ${realityId}
    `.catch(() => { });
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Simple YAML generator (avoiding external dependency)
     */
    // Complexity: O(N*M) — nested iteration detected
    toYaml(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        //     let yaml = ';
        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined || value === null)
                continue;
            if (typeof value === 'object' && !Array.isArray(value)) {
                yaml += `${spaces}${key}:\n${this.toYaml(value, indent + 1)}`;
            }
            else if (Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                for (const item of value) {
                    if (typeof item === 'object') {
                        yaml += `${spaces}  - ${this.toYaml(item, indent + 2).trim().replace(/\n/g, `\n${spaces}    `)}\n`;
                    }
                    else {
                        yaml += `${spaces}  - ${item}\n`;
                    }
                }
            }
            else {
                yaml += `${spaces}${key}: ${value}\n`;
            }
        }
        return yaml;
    }
    /**
     * Get all active realities for a tenant
     */
    // Complexity: O(N) — linear iteration
    getActiveRealities(tenantId) {
        const realities = Array.from(this.activeRealities.values());
        if (tenantId) {
            return realities.filter(r => r.tenantId === tenantId);
        }
        return realities;
    }
    /**
     * Get reality by ID
     */
    // Complexity: O(1) — hash/map lookup
    getReality(realityId) {
        return this.activeRealities.get(realityId);
    }
    /**
     * Cleanup all realities for a tenant
     */
    // Complexity: O(N) — linear iteration
    async cleanupTenant(tenantId) {
        const tenantRealities = this.getActiveRealities(tenantId);
        let cleaned = 0;
        for (const reality of tenantRealities) {
            try {
                await this.collapseReality(reality.id);
                cleaned++;
            }
            catch (error) {
                console.error(`Failed to cleanup reality ${reality.id}:`, error);
            }
        }
        return cleaned;
    }
    /**
     * Cleanup all realities (shutdown)
     */
    // Complexity: O(N) — linear iteration
    async cleanupAll() {
        const allRealities = Array.from(this.activeRealities.keys());
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(allRealities.map(id => this.collapseReality(id).catch(() => { })));
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.prisma.$disconnect();
    }
    // Complexity: O(1) — hash/map lookup
    setupShutdownHandlers() {
        const shutdown = async (signal) => {
            console.log(`\n[GenesisRealityProvider] Received ${signal}, collapsing all realities...`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.cleanupAll();
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}
exports.GenesisRealityProvider = GenesisRealityProvider;
// Export singleton instance
exports.genesisRealityProvider = new GenesisRealityProvider();
