"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: VALIDATION UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Schema validation with Zod-like patterns
 * Type-safe request validation
 *
 * @author Dimitar Prodromov
 * @version 26.0.0
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.v = exports.RequestSchemas = exports.CommonSchemas = exports.ValidationException = exports.Schema = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class Schema {
    def;
    constructor(def) {
        this.def = def;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FACTORY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    static string() {
        return new Schema({ type: 'string', required: true });
    }
    static number() {
        return new Schema({ type: 'number', required: true });
    }
    static boolean() {
        return new Schema({ type: 'boolean', required: true });
    }
    static object(properties) {
        return new Schema({
            type: 'object',
            required: true,
            properties: properties
        });
    }
    static array(items) {
        return new Schema({
            type: 'array',
            required: true,
            items: items
        });
    }
    static literal(value) {
        return new Schema({
            type: typeof value,
            required: true,
            enum: [value]
        });
    }
    static union(...schemas) {
        // Simplified union - in production use proper union handling
        return schemas[0];
    }
    static enum(values) {
        return new Schema({
            type: 'string',
            required: true,
            enum: values
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    optional() {
        return new Schema({ ...this.def, required: false });
    }
    // Complexity: O(1)
    nullable() {
        const types = Array.isArray(this.def.type)
            ? [...this.def.type, 'null']
            : [this.def.type, 'null'];
        return new Schema({ ...this.def, type: types });
    }
    // Complexity: O(1)
    default(value) {
        return new Schema({ ...this.def, default: value });
    }
    // Complexity: O(1)
    min(value) {
        return new Schema({
            ...this.def,
            ...(this.def.type === 'string' ? { minLength: value } : { min: value })
        });
    }
    // Complexity: O(1)
    max(value) {
        return new Schema({
            ...this.def,
            ...(this.def.type === 'string' ? { maxLength: value } : { max: value })
        });
    }
    // Complexity: O(1)
    length(min, max) {
        return new Schema({
            ...this.def,
            minLength: min,
            maxLength: max ?? min
        });
    }
    // Complexity: O(1)
    pattern(regex) {
        return new Schema({ ...this.def, pattern: regex });
    }
    // Complexity: O(1)
    email() {
        return new Schema({
            ...this.def,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        });
    }
    // Complexity: O(1)
    url() {
        return new Schema({
            ...this.def,
            pattern: /^https?:\/\/.+/
        });
    }
    // Complexity: O(1)
    uuid() {
        return new Schema({
            ...this.def,
            pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        });
    }
    // Complexity: O(1)
    custom(fn) {
        return new Schema({ ...this.def, custom: fn });
    }
    transform(fn) {
        return new Schema({ ...this.def, transform: fn });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    validate(value, path = '') {
        const errors = [];
        // Handle undefined
        if (value === undefined) {
            if (this.def.default !== undefined) {
                return { success: true, data: this.def.default };
            }
            if (!this.def.required) {
                return { success: true, data: undefined };
            }
            errors.push({
                path: path || 'root',
                message: 'Required field is missing',
                code: 'required'
            });
            return { success: false, errors };
        }
        // Handle null
        if (value === null) {
            const types = Array.isArray(this.def.type) ? this.def.type : [this.def.type];
            if (!types.includes('null')) {
                errors.push({
                    path: path || 'root',
                    message: 'Value cannot be null',
                    code: 'invalid_type',
                    expected: types.join(' | '),
                    received: 'null'
                });
                return { success: false, errors };
            }
            return { success: true, data: null };
        }
        // Type check
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        const expectedTypes = Array.isArray(this.def.type) ? this.def.type : [this.def.type];
        if (!expectedTypes.includes(actualType)) {
            errors.push({
                path: path || 'root',
                message: `Expected ${expectedTypes.join(' | ')}, got ${actualType}`,
                code: 'invalid_type',
                expected: expectedTypes.join(' | '),
                received: actualType
            });
            return { success: false, errors };
        }
        // Enum check
        if (this.def.enum && !this.def.enum.includes(value)) {
            errors.push({
                path: path || 'root',
                message: `Value must be one of: ${this.def.enum.join(', ')}`,
                code: 'invalid_enum',
                received: String(value)
            });
            return { success: false, errors };
        }
        // String validations
        if (typeof value === 'string') {
            if (this.def.minLength !== undefined && value.length < this.def.minLength) {
                errors.push({
                    path: path || 'root',
                    message: `String must be at least ${this.def.minLength} characters`,
                    code: 'too_short'
                });
            }
            if (this.def.maxLength !== undefined && value.length > this.def.maxLength) {
                errors.push({
                    path: path || 'root',
                    message: `String must be at most ${this.def.maxLength} characters`,
                    code: 'too_long'
                });
            }
            if (this.def.pattern && !this.def.pattern.test(value)) {
                errors.push({
                    path: path || 'root',
                    message: 'String does not match required pattern',
                    code: 'invalid_pattern'
                });
            }
        }
        // Number validations
        if (typeof value === 'number') {
            if (this.def.min !== undefined && value < this.def.min) {
                errors.push({
                    path: path || 'root',
                    message: `Number must be at least ${this.def.min}`,
                    code: 'too_small'
                });
            }
            if (this.def.max !== undefined && value > this.def.max) {
                errors.push({
                    path: path || 'root',
                    message: `Number must be at most ${this.def.max}`,
                    code: 'too_big'
                });
            }
        }
        // Array validations
        if (Array.isArray(value) && this.def.items) {
            value.forEach((item, index) => {
                const result = this.def.items.validate(item, `${path}[${index}]`);
                if (!result.success && 'errors' in result) {
                    errors.push(...result.errors);
                }
            });
        }
        // Object validations
        if (typeof value === 'object' && !Array.isArray(value) && this.def.properties) {
            const obj = value;
            for (const [key, schema] of Object.entries(this.def.properties)) {
                const result = schema.validate(obj[key], path ? `${path}.${key}` : key);
                if (!result.success && 'errors' in result) {
                    errors.push(...result.errors);
                }
            }
        }
        // Custom validation
        if (this.def.custom) {
            const customResult = this.def.custom(value);
            if (customResult !== true) {
                errors.push({
                    path: path || 'root',
                    message: typeof customResult === 'string' ? customResult : 'Custom validation failed',
                    code: 'custom'
                });
            }
        }
        if (errors.length > 0) {
            return { success: false, errors };
        }
        // Transform
        let finalValue = value;
        if (this.def.transform) {
            finalValue = this.def.transform(value);
        }
        return { success: true, data: finalValue };
    }
    // Complexity: O(1)
    parse(value) {
        const result = this.validate(value);
        if (!result.success && 'errors' in result) {
            throw new ValidationException(result.errors);
        }
        return result.data;
    }
    // Complexity: O(1)
    safeParse(value) {
        return this.validate(value);
    }
}
exports.Schema = Schema;
// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION EXCEPTION
// ═══════════════════════════════════════════════════════════════════════════════
class ValidationException extends Error {
    errors;
    constructor(errors) {
        const message = errors.map(e => `${e.path}: ${e.message}`).join('; ');
        super(`Validation failed: ${message}`);
        this.name = 'ValidationException';
        this.errors = errors;
    }
    // Complexity: O(1)
    toJSON() {
        return {
            message: this.message,
            errors: this.errors
        };
    }
}
exports.ValidationException = ValidationException;
// ═══════════════════════════════════════════════════════════════════════════════
// COMMON SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════
exports.CommonSchemas = {
    /** UUID v4 */
    uuid: Schema.string().uuid(),
    /** Email address */
    email: Schema.string().email(),
    /** URL */
    url: Schema.string().url(),
    /** Non-empty string */
    nonEmptyString: Schema.string().min(1),
    /** Positive integer */
    positiveInt: Schema.number().min(1).custom(v => Number.isInteger(v) || 'Must be an integer'),
    /** Port number */
    port: Schema.number().min(1).max(65535).custom(v => Number.isInteger(v) || 'Must be an integer'),
    /** Browser type */
    browser: Schema.enum(['chromium', 'firefox', 'webkit']),
    /** Test status */
    testStatus: Schema.enum(['pending', 'running', 'passed', 'failed', 'skipped']),
    /** Job status */
    jobStatus: Schema.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
    /** Pagination */
    pagination: Schema.object({
        page: Schema.number().min(1).default(1).optional(),
        limit: Schema.number().min(1).max(100).default(20).optional()
    })
};
// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════
exports.RequestSchemas = {
    /** Create session request */
    createSession: Schema.object({
        browser: exports.CommonSchemas.browser.optional().default('chromium'),
        headless: Schema.boolean().optional().default(true),
        viewport: Schema.object({
            width: Schema.number().min(320).max(3840).optional(),
            height: Schema.number().min(240).max(2160).optional()
        }).optional(),
        timeout: Schema.number().min(1000).max(300000).optional().default(30000),
        userAgent: Schema.string().optional()
    }),
    /** Run tests request */
    runTests: Schema.object({
        tests: Schema.array(Schema.string().min(1)),
        browser: exports.CommonSchemas.browser.optional().default('chromium'),
        workers: Schema.number().min(1).max(16).optional().default(4),
        retries: Schema.number().min(0).max(5).optional().default(0),
        timeout: Schema.number().min(1000).max(600000).optional().default(30000),
        reporter: Schema.enum(['json', 'html', 'junit']).optional().default('json'),
        env: Schema.object({}).optional()
    }),
    /** Navigate request */
    navigate: Schema.object({
        url: Schema.string().url(),
        waitUntil: Schema.enum(['load', 'domcontentloaded', 'networkidle']).optional()
    }),
    /** Click request */
    click: Schema.object({
        selector: Schema.string().min(1),
        button: Schema.enum(['left', 'right', 'middle']).optional().default('left'),
        clickCount: Schema.number().min(1).max(3).optional().default(1),
        timeout: Schema.number().min(0).optional()
    }),
    /** Type request */
    type: Schema.object({
        selector: Schema.string().min(1),
        text: Schema.string(),
        delay: Schema.number().min(0).optional().default(0),
        clear: Schema.boolean().optional().default(false)
    }),
    /** Screenshot request */
    screenshot: Schema.object({
        fullPage: Schema.boolean().optional().default(false),
        format: Schema.enum(['png', 'jpeg', 'webp']).optional().default('png'),
        quality: Schema.number().min(0).max(100).optional(),
        selector: Schema.string().optional()
    }),
    /** Evaluate request */
    evaluate: Schema.object({
        script: Schema.string().min(1),
        args: Schema.array(Schema.string()).optional()
    })
};
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.v = {
    string: Schema.string,
    number: Schema.number,
    boolean: Schema.boolean,
    object: Schema.object,
    array: Schema.array,
    literal: Schema.literal,
    union: Schema.union,
    enum: Schema.enum
};
exports.default = Schema;
