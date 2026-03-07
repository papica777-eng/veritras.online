"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║    ██████╗ ███████╗███╗   ██╗███████╗███████╗██╗███████╗                      ║
 * ║   ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝                      ║
 * ║   ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████╗██║███████╗                      ║
 * ║   ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║██║╚════██║                      ║
 * ║   ╚██████╔╝███████╗██║ ╚████║███████╗███████║██║███████║                      ║
 * ║    ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝                      ║
 * ║                                                                               ║
 * ║   ███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗                            ║
 * ║   ██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝                            ║
 * ║   █████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗                              ║
 * ║   ██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝                              ║
 * ║   ███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗                            ║
 * ║   ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝                            ║
 * ║                                                                               ║
 * ║   QAntum v29.1 "THE ADAPTIVE CONSCIOUSNESS" - Genesis Engine                  ║
 * ║   "Жива кодова екосистема - код, който създава код"                           ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.DEFAULT_TEMPLATES = exports.getGenesisEngine = exports.GenesisEngine = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_TEMPLATES = {
    'class-biology': {
        id: 'class-biology',
        name: 'Biology Layer Class',
        type: 'class',
        layer: 'biology',
        template: `/**
 * {{className}} - {{description}}
 *
 * Part of QAntum's Biology Layer (Neural Evolution)
 * @layer biology
 * @version {{version}}
 */

import { EventEmitter } from 'events';

export interface {{className}}Config {
  // Add configuration options
}

export class {{className}} extends EventEmitter {
  private config: {{className}}Config;

  constructor(config: Partial<{{className}}Config> = {}) {
    super();
    this.config = { ...this.getDefaultConfig(), ...config };
    this.initialize();
  }

  // Complexity: O(1)
  private getDefaultConfig(): {{className}}Config {
    return {
      // Default values
    };
  }

  // Complexity: O(1)
  private initialize(): void {
    console.log('🧬 {{className}} initialized');
  }

  // Add methods here
}

export default {{className}};
`,
        variables: [
            { name: 'className', description: 'Class name in PascalCase', type: 'string', required: true },
            { name: 'description', description: 'Brief description', type: 'string', required: true },
            { name: 'version', description: 'Version number', type: 'string', required: false, defaultValue: '1.0.0' }
        ],
        requiredImports: ['events'],
        requiredDependencies: [],
        usageCount: 0,
        successRate: 100
    },
    'class-chemistry': {
        id: 'class-chemistry',
        name: 'Chemistry Layer Class',
        type: 'class',
        layer: 'chemistry',
        template: `/**
 * {{className}} - {{description}}
 *
 * Part of QAntum's Chemistry Layer (Transformation)
 * @layer chemistry
 * @version {{version}}
 */

export interface {{className}}Input {
  // Define input structure
}

export interface {{className}}Output {
  // Define output structure
}

export class {{className}} {
  /**
   * Transform input to output
   */
  // Complexity: O(1)
  async transform(input: {{className}}Input): Promise<{{className}}Output> {
    // Implement transformation logic
    throw new Error('Not implemented');
  }

  /**
   * Validate input before transformation
   */
  // Complexity: O(1)
  validate(input: {{className}}Input): boolean {
    // Implement validation
    return true;
  }
}

export default {{className}};
`,
        variables: [
            { name: 'className', description: 'Class name in PascalCase', type: 'string', required: true },
            { name: 'description', description: 'Brief description', type: 'string', required: true },
            { name: 'version', description: 'Version number', type: 'string', required: false, defaultValue: '1.0.0' }
        ],
        requiredImports: [],
        requiredDependencies: [],
        usageCount: 0,
        successRate: 100
    },
    'interface-standard': {
        id: 'interface-standard',
        name: 'Standard Interface',
        type: 'interface',
        layer: 'cognition',
        template: `/**
 * {{interfaceName}} - {{description}}
 *
 * @layer {{layer}}
 * @version {{version}}
 */

export interface {{interfaceName}} {
  {{#properties}}
  /** {{description}} */
  {{name}}{{#optional}}?{{/optional}}: {{type}};
  {{/properties}}
}

export default {{interfaceName}};
`,
        variables: [
            { name: 'interfaceName', description: 'Interface name in PascalCase', type: 'string', required: true },
            { name: 'description', description: 'Brief description', type: 'string', required: true },
            { name: 'layer', description: 'QAntum layer', type: 'enum', required: true, enumValues: ['biology', 'chemistry', 'physics', 'universe', 'cognition'] },
            { name: 'version', description: 'Version number', type: 'string', required: false, defaultValue: '1.0.0' },
            { name: 'properties', description: 'Interface properties', type: 'array', required: false, defaultValue: [] }
        ],
        requiredImports: [],
        requiredDependencies: [],
        usageCount: 0,
        successRate: 100
    },
    'test-standard': {
        id: 'test-standard',
        name: 'Standard Test Suite',
        type: 'test',
        layer: 'cognition',
        template: `/**
 * Test Suite: {{targetName}}
 *
 * @layer {{layer}}
 * @coverage {{coverageTarget}}%
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { {{targetName}} } from '{{importPath}}';

    // Complexity: O(1)
describe('{{targetName}}', () => {
  let instance: {{targetName}};

  // Complexity: O(1)
  beforeEach(() => {
    instance = new {{targetName}}();
  });

  // Complexity: O(1)
  afterEach(() => {
    // Cleanup
  });

  // Complexity: O(1)
  describe('initialization', () => {
    // Complexity: O(1)
    it('should create instance with default config', () => {
      // Complexity: O(1)
      expect(instance).toBeDefined();
    });
  });

  // Complexity: O(1)
  describe('core functionality', () => {
    it.todo('add test cases here');
  });

  // Complexity: O(1)
  describe('edge cases', () => {
    it.todo('add edge case tests');
  });

  // Complexity: O(1)
  describe('error handling', () => {
    it.todo('add error handling tests');
  });
});
`,
        variables: [
            { name: 'targetName', description: 'Name of class/function to test', type: 'string', required: true },
            { name: 'layer', description: 'QAntum layer', type: 'enum', required: true, enumValues: ['biology', 'chemistry', 'physics', 'universe', 'cognition'] },
            { name: 'importPath', description: 'Import path for target', type: 'string', required: true },
            { name: 'coverageTarget', description: 'Target coverage %', type: 'number', required: false, defaultValue: 80 }
        ],
        requiredImports: ['vitest'],
        requiredDependencies: ['vitest'],
        usageCount: 0,
        successRate: 100
    }
};
exports.DEFAULT_TEMPLATES = DEFAULT_TEMPLATES;
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    templateDir: 'templates',
    outputDir: 'src',
    backpackPath: 'data/backpack.json',
    autoRegister: true,
    validateOnCreate: true,
    createTests: true
};
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * GenesisEngine - Self-Creating Code Ecosystem
 *
 * The Genesis Engine allows QAntum to create new code entities
 * that follow the 5-layer architecture, maintaining consistency
 * and enabling the system to evolve itself.
 *
 * Key Capabilities:
 * - Template-based code generation
 * - Entity lifecycle management (embryo → mature → deprecated)
 * - Dependency tracking and validation
 * - Automatic test generation
 * - Health monitoring for created entities
 *
 * @example
 * ```typescript
 * const genesis = GenesisEngine.getInstance();
 *
 * // Create a new class in the biology layer
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const result = await genesis.create({
 *   name: 'NeuralEvolver',
 *   type: 'class',
 *   layer: 'biology',
 *   description: 'Neural network evolution manager'
 * });
 *
 * // CLI: qantum genesis NeuralEvolver --type class --layer biology
 * ```
 */
class GenesisEngine extends events_1.EventEmitter {
    static instance;
    config;
    templates = new Map();
    entities = new Map();
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.loadDefaultTemplates();
        this.loadEntities();
        console.log('🌱 Genesis Engine initialized');
    }
    /**
     * Get singleton instance
     */
    static getInstance(config) {
        if (!GenesisEngine.instance) {
            GenesisEngine.instance = new GenesisEngine(config);
        }
        return GenesisEngine.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // TEMPLATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load default templates
     */
    // Complexity: O(N) — loop
    loadDefaultTemplates() {
        for (const [id, template] of Object.entries(DEFAULT_TEMPLATES)) {
            this.templates.set(id, template);
        }
        console.log(`📜 Loaded ${this.templates.size} default templates`);
    }
    /**
     * Get template by ID
     */
    // Complexity: O(1) — lookup
    getTemplate(id) {
        return this.templates.get(id);
    }
    /**
     * Get all templates
     */
    // Complexity: O(1)
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Register a new template
     */
    // Complexity: O(1) — lookup
    registerTemplate(template) {
        this.templates.set(template.id, template);
        this.emit('template:registered', template);
    }
    /**
     * Find best template for request
     */
    // Complexity: O(N) — loop
    findTemplate(type, layer) {
        const key = `${type}-${layer}`;
        // Try exact match
        if (this.templates.has(key)) {
            return this.templates.get(key);
        }
        // Try type-only match
        for (const [id, template] of this.templates) {
            if (template.type === type) {
                return template;
            }
        }
        return undefined;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CODE GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Create a new entity
     */
    // Complexity: O(N) — loop
    async create(request) {
        const errors = [];
        const warnings = [];
        try {
            // Validate request
            if (this.config.validateOnCreate) {
                const validation = this.validateRequest(request);
                if (!validation.valid) {
                    return { success: false, errors: validation.errors };
                }
                warnings.push(...(validation.warnings || []));
            }
            // Find or use specified template
            const template = request.templateId
                ? this.templates.get(request.templateId)
                : this.findTemplate(request.type, request.layer);
            if (!template) {
                return {
                    success: false,
                    errors: [`No template found for ${request.type} in ${request.layer} layer`]
                };
            }
            // Generate code
            const code = this.generateCode(template, {
                ...this.getDefaultVariables(request),
                ...(request.variables || {})
            });
            // Determine file path
            const filePath = request.targetPath || this.generateFilePath(request);
            // Create entity definition
            const entity = {
                id: this.generateEntityId(request.name),
                name: request.name,
                type: request.type,
                layer: request.layer,
                state: 'embryo',
                filePath,
                dependencies: [],
                dependents: [],
                childEntities: [],
                description: request.description,
                version: '1.0.0',
                createdAt: new Date(),
                modifiedAt: new Date(),
                createdBy: 'genesis',
                templateId: template.id,
                generatedCode: code
            };
            // Write file
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.writeFile(filePath, code);
            entity.state = 'mature';
            // Register entity
            if (this.config.autoRegister) {
                this.entities.set(entity.id, entity);
                this.persistEntities();
            }
            // Create test if requested
            if (this.config.createTests && request.includeTests !== false) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const testResult = await this.createTest(entity);
                if (testResult.warnings) {
                    warnings.push(...testResult.warnings);
                }
            }
            // Update template usage
            template.usageCount++;
            this.emit('entity:created', entity);
            return {
                success: true,
                entity,
                code,
                filePath,
                warnings: warnings.length > 0 ? warnings : undefined
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }
    /**
     * Generate code from template
     */
    // Complexity: O(N*M) — nested iteration
    generateCode(template, variables) {
        let code = template.template;
        // Simple variable substitution ({{variableName}})
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            code = code.replace(regex, String(value));
        }
        // Handle conditional blocks ({{#variable}}...{{/variable}})
        code = code.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
            const value = variables[key];
            if (Array.isArray(value)) {
                return value.map(item => {
                    let itemContent = content;
                    for (const [k, v] of Object.entries(item)) {
                        itemContent = itemContent.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
                    }
                    return itemContent;
                }).join('');
            }
            else if (value) {
                return content;
            }
            return '';
        });
        return code;
    }
    /**
     * Get default variables for request
     */
    // Complexity: O(1)
    getDefaultVariables(request) {
        return {
            className: request.name,
            interfaceName: request.name,
            targetName: request.name,
            description: request.description,
            layer: request.layer,
            version: '1.0.0',
            importPath: `./${request.name}`
        };
    }
    /**
     * Generate file path for entity
     */
    // Complexity: O(1)
    generateFilePath(request) {
        const layerDirs = {
            biology: 'src/biology/evolution',
            chemistry: 'src/chemistry',
            physics: 'src/physics',
            universe: 'src/enterprise',
            cognition: 'src/cognition'
        };
        const dir = layerDirs[request.layer];
        const fileName = `${request.name}.ts`;
        return path.join(dir, fileName);
    }
    /**
     * Generate unique entity ID
     */
    // Complexity: O(1)
    generateEntityId(name) {
        const hash = crypto.createHash('md5')
            .update(`${name}-${Date.now()}`)
            .digest('hex')
            .substring(0, 8);
        return `entity-${name.toLowerCase()}-${hash}`;
    }
    /**
     * Write code to file
     */
    // Complexity: O(1)
    async writeFile(filePath, code) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, code, 'utf-8');
        console.log(`📝 Created: ${filePath}`);
    }
    /**
     * Create test for entity
     */
    // Complexity: O(1) — lookup
    async createTest(entity) {
        const testTemplate = this.templates.get('test-standard');
        if (!testTemplate) {
            return { success: false, warnings: ['No test template found'] };
        }
        const testPath = entity.filePath
            .replace('/src/', '/tests/')
            .replace('.ts', '.test.ts');
        const testCode = this.generateCode(testTemplate, {
            targetName: entity.name,
            layer: entity.layer,
            importPath: path.relative(path.dirname(testPath), entity.filePath).replace('.ts', ''),
            coverageTarget: 80
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.writeFile(testPath, testCode);
        return { success: true, filePath: testPath };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Validate genesis request
     */
    // Complexity: O(N) — linear scan
    validateRequest(request) {
        const errors = [];
        const warnings = [];
        // Check required fields
        if (!request.name) {
            errors.push('Name is required');
        }
        if (!request.type) {
            errors.push('Type is required');
        }
        if (!request.layer) {
            errors.push('Layer is required');
        }
        // Validate name format (PascalCase)
        if (request.name && !/^[A-Z][a-zA-Z0-9]*$/.test(request.name)) {
            warnings.push('Name should be in PascalCase');
        }
        // Check for duplicate
        const existing = Array.from(this.entities.values())
            .find(e => e.name === request.name && e.layer === request.layer);
        if (existing) {
            errors.push(`Entity '${request.name}' already exists in ${request.layer} layer`);
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ENTITY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get entity by ID
     */
    // Complexity: O(1) — lookup
    getEntity(id) {
        return this.entities.get(id);
    }
    /**
     * Get all entities
     */
    // Complexity: O(1)
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    /**
     * Get entities by layer
     */
    // Complexity: O(N) — linear scan
    getEntitiesByLayer(layer) {
        return Array.from(this.entities.values())
            .filter(e => e.layer === layer);
    }
    /**
     * Update entity state
     */
    // Complexity: O(1) — lookup
    updateEntityState(id, state) {
        const entity = this.entities.get(id);
        if (entity) {
            entity.state = state;
            entity.modifiedAt = new Date();
            this.persistEntities();
            this.emit('entity:updated', entity);
        }
    }
    /**
     * Load entities from backpack
     */
    // Complexity: O(N) — loop
    loadEntities() {
        try {
            if (fs.existsSync(this.config.backpackPath)) {
                const data = JSON.parse(fs.readFileSync(this.config.backpackPath, 'utf-8'));
                if (data.genesisEntities) {
                    for (const entity of data.genesisEntities) {
                        entity.createdAt = new Date(entity.createdAt);
                        entity.modifiedAt = new Date(entity.modifiedAt);
                        this.entities.set(entity.id, entity);
                    }
                }
            }
        }
        catch (error) {
            console.warn('Failed to load entities:', error);
        }
    }
    /**
     * Persist entities to backpack
     */
    // Complexity: O(1)
    persistEntities() {
        try {
            let data = {};
            if (fs.existsSync(this.config.backpackPath)) {
                data = JSON.parse(fs.readFileSync(this.config.backpackPath, 'utf-8'));
            }
            data.genesisEntities = Array.from(this.entities.values());
            const dir = path.dirname(this.config.backpackPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.config.backpackPath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.warn('Failed to persist entities:', error);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ECOSYSTEM ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get ecosystem statistics
     */
    // Complexity: O(N log N) — sort
    getStats() {
        const entities = Array.from(this.entities.values());
        const byLayer = {};
        const byType = {};
        const byState = {};
        for (const entity of entities) {
            byLayer[entity.layer] = (byLayer[entity.layer] || 0) + 1;
            byType[entity.type] = (byType[entity.type] || 0) + 1;
            byState[entity.state] = (byState[entity.state] || 0) + 1;
        }
        const templateUsage = Array.from(this.templates.values())
            .map(t => ({ id: t.id, count: t.usageCount }))
            .sort((a, b) => b.count - a.count);
        return {
            totalEntities: entities.length,
            byLayer: byLayer,
            byType: byType,
            byState: byState,
            templateUsage
        };
    }
    /**
     * Calculate health score for ecosystem
     */
    // Complexity: O(N*M) — nested iteration
    calculateEcosystemHealth() {
        const issues = [];
        const recommendations = [];
        let score = 100;
        const entities = Array.from(this.entities.values());
        // Check for deprecated entities
        const deprecated = entities.filter(e => e.state === 'deprecated');
        if (deprecated.length > 0) {
            score -= deprecated.length * 5;
            issues.push(`${deprecated.length} deprecated entities need cleanup`);
        }
        // Check layer balance
        const stats = this.getStats();
        const layers = Object.keys(stats.byLayer);
        if (layers.length < 3) {
            score -= 10;
            recommendations.push('Consider creating entities in more layers for balanced architecture');
        }
        // Check test coverage
        const withTests = entities.filter(e => e.testCoverage && e.testCoverage > 0);
        const testRatio = entities.length > 0 ? withTests.length / entities.length : 1;
        if (testRatio < 0.8) {
            score -= Math.floor((0.8 - testRatio) * 20);
            recommendations.push('Increase test coverage for genesis entities');
        }
        return {
            score: Math.max(0, Math.min(100, score)),
            issues,
            recommendations
        };
    }
}
exports.GenesisEngine = GenesisEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getGenesisEngine = (config) => {
    return GenesisEngine.getInstance(config);
};
exports.getGenesisEngine = getGenesisEngine;
exports.default = GenesisEngine;
