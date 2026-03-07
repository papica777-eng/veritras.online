"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CONFIGURATION SCHEMA VALIDATOR                                       ║
 * ║   "Type-safe configuration validation"                                        ║
 * ║                                                                               ║
 * ║   TODO B #43 - Configuration Management                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.s = exports.SchemaBuilder = exports.SchemaValidator = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// FORMATS
// ═══════════════════════════════════════════════════════════════════════════════
const FORMATS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/[^\s]+$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    date: /^\d{4}-\d{2}-\d{2}$/,
    datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    path: /^[\/\\]?[\w\-\.\s\/\\]+$/,
};
// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Configuration Schema Validator
 */
class SchemaValidator {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    /**
     * Validate configuration against schema
     */
    // Complexity: O(N) — loop
    validate(config) {
        const errors = [];
        const warnings = [];
        const validatedConfig = { ...config };
        // Check each schema rule
        for (const [key, rule] of Object.entries(this.schema)) {
            const value = this.getValue(config, key);
            // Handle environment variable override
            if (rule.env && process.env[rule.env]) {
                const envValue = process.env[rule.env];
                validatedConfig[key] = rule.envTransform
                    ? rule.envTransform(envValue)
                    : this.autoTransform(envValue, rule.type);
            }
            // Check deprecated
            if (rule.deprecated && value !== undefined) {
                const msg = typeof rule.deprecated === 'string' ? rule.deprecated : `${key} is deprecated`;
                warnings.push({ key, message: msg, value });
            }
            // Check required
            if (rule.required && value === undefined && !rule.default) {
                errors.push({
                    key,
                    message: `Required field '${key}' is missing`,
                    rule: 'required',
                });
                continue;
            }
            // Apply default
            if (value === undefined && rule.default !== undefined) {
                this.setValue(validatedConfig, key, rule.default);
                continue;
            }
            if (value === undefined)
                continue;
            // Validate type
            const typeError = this.validateType(value, rule, key);
            if (typeError) {
                errors.push(typeError);
                continue;
            }
            // Validate rules based on type
            const ruleErrors = this.validateRules(value, rule, key);
            errors.push(...ruleErrors);
            // Apply transform
            if (rule.transform) {
                this.setValue(validatedConfig, key, rule.transform(value));
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            config: validatedConfig,
        };
    }
    /**
     * Validate and throw on error
     */
    // Complexity: O(N) — linear scan
    validateOrThrow(config) {
        const result = this.validate(config);
        if (!result.valid) {
            const message = result.errors.map((e) => `  - ${e.key}: ${e.message}`).join('\n');
            throw new Error(`Configuration validation failed:\n${message}`);
        }
        return result.config;
    }
    /**
     * Get nested value
     */
    // Complexity: O(N) — loop
    getValue(config, key) {
        const parts = key.split('.');
        let current = config;
        for (const part of parts) {
            if (current === undefined || current === null)
                return undefined;
            current = current[part];
        }
        return current;
    }
    /**
     * Set nested value
     */
    // Complexity: O(N) — loop
    setValue(config, key, value) {
        const parts = key.split('.');
        let current = config;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            current[part] = current[part] || {};
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }
    /**
     * Validate type
     */
    // Complexity: O(1)
    validateType(value, rule, key) {
        const types = Array.isArray(rule.type) ? rule.type : [rule.type];
        const actualType = this.getType(value);
        if (!types.includes(actualType) && !types.includes('any')) {
            return {
                key,
                message: `Expected ${types.join(' | ')}, got ${actualType}`,
                value,
                rule: 'type',
            };
        }
        return null;
    }
    /**
     * Get value type
     */
    // Complexity: O(1)
    getType(value) {
        if (value === null)
            return 'null';
        if (value === undefined)
            return 'undefined';
        if (Array.isArray(value))
            return 'array';
        return typeof value;
    }
    /**
     * Validate specific rules
     */
    // Complexity: O(1)
    validateRules(value, rule, key) {
        const errors = [];
        const type = this.getType(value);
        // String rules
        if (type === 'string') {
            if (rule.minLength !== undefined && value.length < rule.minLength) {
                errors.push({
                    key,
                    message: `String must be at least ${rule.minLength} characters`,
                    value,
                    rule: 'minLength',
                });
            }
            if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                errors.push({
                    key,
                    message: `String must be at most ${rule.maxLength} characters`,
                    value,
                    rule: 'maxLength',
                });
            }
            if (rule.pattern) {
                const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
                if (!regex.test(value)) {
                    errors.push({
                        key,
                        message: `String does not match pattern ${rule.pattern}`,
                        value,
                        rule: 'pattern',
                    });
                }
            }
            if (rule.format && FORMATS[rule.format] && !FORMATS[rule.format].test(value)) {
                errors.push({
                    key,
                    message: `String does not match format '${rule.format}'`,
                    value,
                    rule: 'format',
                });
            }
        }
        // Number rules
        if (type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                errors.push({
                    key,
                    message: `Number must be at least ${rule.min}`,
                    value,
                    rule: 'min',
                });
            }
            if (rule.max !== undefined && value > rule.max) {
                errors.push({
                    key,
                    message: `Number must be at most ${rule.max}`,
                    value,
                    rule: 'max',
                });
            }
            if (rule.integer && !Number.isInteger(value)) {
                errors.push({
                    key,
                    message: 'Number must be an integer',
                    value,
                    rule: 'integer',
                });
            }
            if (rule.positive && value <= 0) {
                errors.push({
                    key,
                    message: 'Number must be positive',
                    value,
                    rule: 'positive',
                });
            }
            if (rule.negative && value >= 0) {
                errors.push({
                    key,
                    message: 'Number must be negative',
                    value,
                    rule: 'negative',
                });
            }
        }
        // Array rules
        if (type === 'array') {
            if (rule.minItems !== undefined && value.length < rule.minItems) {
                errors.push({
                    key,
                    message: `Array must have at least ${rule.minItems} items`,
                    value: value.length,
                    rule: 'minItems',
                });
            }
            if (rule.maxItems !== undefined && value.length > rule.maxItems) {
                errors.push({
                    key,
                    message: `Array must have at most ${rule.maxItems} items`,
                    value: value.length,
                    rule: 'maxItems',
                });
            }
            if (rule.uniqueItems) {
                const unique = new Set(value.map((v) => JSON.stringify(v)));
                if (unique.size !== value.length) {
                    errors.push({
                        key,
                        message: 'Array items must be unique',
                        value,
                        rule: 'uniqueItems',
                    });
                }
            }
            // Validate items
            if (rule.items) {
                for (let i = 0; i < value.length; i++) {
                    const itemErrors = this.validateRules(value[i], rule.items, `${key}[${i}]`);
                    errors.push(...itemErrors);
                }
            }
        }
        // Object rules
        if (type === 'object' && rule.properties) {
            for (const [propKey, propRule] of Object.entries(rule.properties)) {
                const propValue = value[propKey];
                if (propRule.required && propValue === undefined) {
                    errors.push({
                        key: `${key}.${propKey}`,
                        message: `Required property '${propKey}' is missing`,
                        rule: 'required',
                    });
                    continue;
                }
                if (propValue !== undefined) {
                    const propErrors = this.validateRules(propValue, propRule, `${key}.${propKey}`);
                    errors.push(...propErrors);
                }
            }
        }
        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
            errors.push({
                key,
                message: `Value must be one of: ${rule.enum.join(', ')}`,
                value,
                rule: 'enum',
            });
        }
        // Custom validation
        if (rule.validate) {
            const result = rule.validate(value, key, {});
            if (result !== true) {
                errors.push({
                    key,
                    message: typeof result === 'string' ? result : `Custom validation failed`,
                    value,
                    rule: 'custom',
                });
            }
        }
        return errors;
    }
    /**
     * Auto-transform string from env
     */
    // Complexity: O(N) — linear scan
    autoTransform(value, type) {
        const primaryType = Array.isArray(type) ? type[0] : type;
        switch (primaryType) {
            case 'number':
                return parseFloat(value);
            case 'boolean':
                return value.toLowerCase() === 'true' || value === '1';
            case 'array':
                return value.split(',').map((v) => v.trim());
            case 'object':
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            default:
                return value;
        }
    }
}
exports.SchemaValidator = SchemaValidator;
// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Fluent schema builder
 */
class SchemaBuilder {
    rule = { type: 'any' };
    static string() {
        const builder = new SchemaBuilder();
        builder.rule.type = 'string';
        return builder;
    }
    static number() {
        const builder = new SchemaBuilder();
        builder.rule.type = 'number';
        return builder;
    }
    static boolean() {
        const builder = new SchemaBuilder();
        builder.rule.type = 'boolean';
        return builder;
    }
    static object(properties) {
        const builder = new SchemaBuilder();
        builder.rule.type = 'object';
        if (properties)
            builder.rule.properties = properties;
        return builder;
    }
    static array(items) {
        const builder = new SchemaBuilder();
        builder.rule.type = 'array';
        if (items)
            builder.rule.items = items;
        return builder;
    }
    static any() {
        return new SchemaBuilder();
    }
    // Complexity: O(1)
    required() {
        this.rule.required = true;
        return this;
    }
    // Complexity: O(1)
    default(value) {
        this.rule.default = value;
        return this;
    }
    // Complexity: O(1)
    description(desc) {
        this.rule.description = desc;
        return this;
    }
    // Complexity: O(1)
    deprecated(message) {
        this.rule.deprecated = message || true;
        return this;
    }
    // Complexity: O(1)
    min(value) {
        this.rule.min = value;
        this.rule.minLength = value;
        this.rule.minItems = value;
        return this;
    }
    // Complexity: O(1)
    max(value) {
        this.rule.max = value;
        this.rule.maxLength = value;
        this.rule.maxItems = value;
        return this;
    }
    // Complexity: O(1)
    pattern(regex) {
        this.rule.pattern = regex;
        return this;
    }
    // Complexity: O(1)
    format(fmt) {
        this.rule.format = fmt;
        return this;
    }
    // Complexity: O(1)
    enum(...values) {
        this.rule.enum = values;
        return this;
    }
    // Complexity: O(1)
    integer() {
        this.rule.integer = true;
        return this;
    }
    // Complexity: O(1)
    positive() {
        this.rule.positive = true;
        return this;
    }
    // Complexity: O(1)
    negative() {
        this.rule.negative = true;
        return this;
    }
    // Complexity: O(1)
    unique() {
        this.rule.uniqueItems = true;
        return this;
    }
    // Complexity: O(1)
    env(name, transform) {
        this.rule.env = name;
        if (transform)
            this.rule.envTransform = transform;
        return this;
    }
    // Complexity: O(1)
    validate(fn) {
        this.rule.validate = fn;
        return this;
    }
    // Complexity: O(1)
    transform(fn) {
        this.rule.transform = fn;
        return this;
    }
    // Complexity: O(1)
    build() {
        return { ...this.rule };
    }
}
exports.SchemaBuilder = SchemaBuilder;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.s = SchemaBuilder;
