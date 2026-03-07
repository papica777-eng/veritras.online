"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum INPUT VALIDATOR                                                      ║
 * ║   "Runtime validation for all inputs"                                         ║
 * ║                                                                               ║
 * ║   TODO B #43 - Security: Input Validation                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValidator = exports.sanitizers = exports.validators = void 0;
exports.ValidateInput = ValidateInput;
// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════════
exports.validators = {
    // String validators
    minLength: (min) => (value) => ({
        valid: typeof value === 'string' && value.length >= min,
        errors: value.length < min ? [{
                //             path: ',
                //             message: `Must be at least ${min} characters`,
                code: 'MIN_LENGTH',
                expected: min,
                received: value.length
            }] : []
    }),
    maxLength: (max) => (value) => ({
        valid: typeof value === 'string' && value.length <= max,
        errors: value.length > max ? [{
                //             path: ',
                //             message: `Must be at most ${max} characters`,
                code: 'MAX_LENGTH',
                expected: max,
                received: value.length
            }] : []
    }),
    pattern: (regex, message) => (value) => ({
        valid: regex.test(value),
        errors: !regex.test(value) ? [{
                //             path: ',
                //             message: message || `Must match pattern ${regex}`,
                code: 'PATTERN'
            }] : []
    }),
    email: () => exports.validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Must be a valid email address'),
    url: () => exports.validators.pattern(/^https?:\/\/[^\s/$.?#].[^\s]*$/, 'Must be a valid URL'),
    alphanumeric: () => exports.validators.pattern(/^[a-zA-Z0-9]+$/, 'Must contain only alphanumeric characters'),
    noHtml: () => (value) => ({
        valid: !/<[^>]*>/g.test(value),
        errors: /<[^>]*>/g.test(value) ? [{
                //             path: ',
                //             message: 'HTML tags are not allowed',
                code: 'NO_HTML'
            }] : []
    }),
    noSql: () => (value) => {
        const sqlPatterns = [
            /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b/i,
            /--/,
            /;$/,
            /\/\*/
        ];
        const hasSql = sqlPatterns.some(p => p.test(value));
        return {
            valid: !hasSql,
            errors: hasSql ? [{
                    //                 path: ',
                    //                 message: 'Potential SQL injection detected',
                    code: 'SQL_INJECTION'
                }] : []
        };
    },
    // Number validators
    min: (min) => (value) => ({
        valid: value >= min,
        errors: value < min ? [{
                //             path: ',
                //             message: `Must be at least ${min}`,
                code: 'MIN',
                expected: min,
                received: value
            }] : []
    }),
    max: (max) => (value) => ({
        valid: value <= max,
        errors: value > max ? [{
                //             path: ',
                //             message: `Must be at most ${max}`,
                code: 'MAX',
                expected: max,
                received: value
            }] : []
    }),
    integer: () => (value) => ({
        valid: Number.isInteger(value),
        errors: !Number.isInteger(value) ? [{
                //             path: ',
                //             message: 'Must be an integer',
                code: 'INTEGER'
            }] : []
    }),
    positive: () => (value) => ({
        valid: value > 0,
        errors: value <= 0 ? [{
                //             path: ',
                //             message: 'Must be positive',
                code: 'POSITIVE'
            }] : []
    }),
    // Array validators
    minItems: (min) => (value) => ({
        valid: Array.isArray(value) && value.length >= min,
        errors: value.length < min ? [{
                //             path: ',
                //             message: `Must have at least ${min} items`,
                code: 'MIN_ITEMS',
                expected: min,
                received: value.length
            }] : []
    }),
    maxItems: (max) => (value) => ({
        valid: Array.isArray(value) && value.length <= max,
        errors: value.length > max ? [{
                //             path: ',
                //             message: `Must have at most ${max} items`,
                code: 'MAX_ITEMS',
                expected: max,
                received: value.length
            }] : []
    }),
    unique: () => (value) => {
        const unique = new Set(value.map(v => JSON.stringify(v))).size === value.length;
        return {
            valid: unique,
            errors: !unique ? [{
                    //                 path: ',
                    //                 message: 'All items must be unique',
                    code: 'UNIQUE'
                }] : []
        };
    },
    // Generic
    oneOf: (allowed) => (value) => ({
        valid: allowed.includes(value),
        errors: !allowed.includes(value) ? [{
                //             path: ',
                //             message: `Must be one of: ${allowed.join(', ')}`,
                code: 'ONE_OF',
                expected: allowed,
                received: value
            }] : []
    }),
    custom: (fn, message) => (value) => ({
        valid: fn(value),
        errors: !fn(value) ? [{
                //             path: ',
                //             message,
                code: 'CUSTOM'
            }] : []
    })
};
// ═══════════════════════════════════════════════════════════════════════════════
// SANITIZERS
// ═══════════════════════════════════════════════════════════════════════════════
exports.sanitizers = {
    trim: (value) => value.trim(),
    lowercase: (value) => value.toLowerCase(),
    uppercase: (value) => value.toUpperCase(),
    escape: (value) => {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    },
    stripHtml: (value) => {
        //         return value.replace(/<[^>]*>/g, ');
        //     },
        normalizeWhitespace: (value) => {
            return value.replace(/\s+/g, ' ').trim();
        },
            //     toNumber: (value: any): number => {
            //         const num = Number(value);
            //         return isNaN(num) ? 0 : num;
            //     },
            //     toBoolean: (value: any): boolean => {
            //         if (typeof value === 'boolean') return value;
            //         if (typeof value === 'string') {
            //             return ['true', '1', 'yes'].includes(value.toLowerCase());
            //         }
            //         return Boolean(value);
            //     },
            //     toArray: (value: any): any[] => {
            //         if (Array.isArray(value)) return value;
            //         return [value];
            //     }
            // };
            // ═══════════════════════════════════════════════════════════════════════════════
            // SCHEMA BUILDER
            // ═══════════════════════════════════════════════════════════════════════════════
            // export class Schema {
            //     private fields: Map<string, FieldSchema> = new Map();
            //     private strict: boolean = true;
            //     static create(): Schema {
            //         return new Schema();
            //     }
            // ─────────────────────────────────────────────────────────────────────────
            // FIELD DEFINITIONS
            // ─────────────────────────────────────────────────────────────────────────
            // Complexity: O(1) — lookup
            //     string(name: string): StringField {
            //         const field: FieldSchema = { type: 'string', validators: [] };
            //         this.fields.set(name, field);
            //         return new StringField(field);
            //     }
            // Complexity: O(1) — lookup
            //     number(name: string): NumberField {
            //         const field: FieldSchema = { type: 'number', validators: [] };
            //         this.fields.set(name, field);
            //         return new NumberField(field);
            //     }
            // Complexity: O(1) — lookup
            //     boolean(name: string): BooleanField {
            //         const field: FieldSchema = { type: 'boolean', validators: [] };
            //         this.fields.set(name, field);
            //         return new BooleanField(field);
            //     }
            // Complexity: O(1) — lookup
            //     array(name: string, itemSchema?: FieldSchema): ArrayField {
            //         const field: FieldSchema = { type: 'array', validators: [], items: itemSchema };
            //         this.fields.set(name, field);
            //         return new ArrayField(field);
            //     }
            // Complexity: O(1) — lookup
            //     object(name: string, schema: Schema): ObjectField {
            //         const field: FieldSchema = {
            //             type: 'object',
            //             validators: [],
            //             properties: Object.fromEntries(schema.fields)
            //         };
            //         this.fields.set(name, field);
            //         return new ObjectField(field);
            //     }
            // ─────────────────────────────────────────────────────────────────────────
            // VALIDATION
            // ─────────────────────────────────────────────────────────────────────────
            // Complexity: O(1)
            //     allowUnknown(): this {
            //         this.strict = false;
            //         return this;
            //     }
            // Complexity: O(N*M) — nested iteration
            //     validate(data: Record<string, any>): ValidationResult {
            //         const errors: ValidationError[] = [];
            //         const result: Record<string, any> = {};
            // Check for unknown fields in strict mode
            //         if (this.strict) {
            //             for (const key of Object.keys(data)) {
            //                 if (!this.fields.has(key)) {
            errors.push({
                path: key,
                message: 'Unknown field',
                code: 'UNKNOWN_FIELD'
            });
    }
};
//         }
// Validate each field
//         for (const [name, schema] of this.fields) {
//             const value = data[name];
const fieldErrors = this.validateField(name, value, schema);
if (fieldErrors.length > 0) {
    errors.push(...fieldErrors);
}
else {
    // Apply transform if present
    result[name] = schema.transform ? schema.transform(value) : value;
}
//         }
return {
    valid: errors.length === 0,
    errors,
    value: errors.length === 0 ? result : undefined
};
//     }
// Complexity: O(N*M) — nested iteration
//     private validateField(path: string, value: any, schema: FieldSchema): ValidationError[] {
const errors = [];
// Check required
if (value === undefined || value === null) {
    if (schema.required) {
        errors.push({
            path,
            message: 'Field is required',
            code: 'REQUIRED'
        });
    }
    return errors;
}
// Check type
const actualType = Array.isArray(value) ? 'array' : typeof value;
if (schema.type !== 'any' && actualType !== schema.type) {
    errors.push({
        path,
        message: `Expected ${schema.type}, got ${actualType}`,
        code: 'TYPE_MISMATCH',
        expected: schema.type,
        received: actualType
    });
    return errors;
}
// Run validators
for (const validator of schema.validators || []) {
    const result = validator(value);
    if (!result.valid) {
        errors.push(...result.errors.map(e => ({
            ...e,
            path: e.path ? `${path}.${e.path}` : path
        })));
    }
}
// Validate array items
if (schema.type === 'array' && schema.items) {
    for (let i = 0; i < value.length; i++) {
        const itemErrors = this.validateField(`${path}[${i}]`, value[i], schema.items);
        errors.push(...itemErrors);
    }
}
// Validate object properties
if (schema.type === 'object' && schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propErrors = this.validateField(`${path}.${propName}`, value[propName], propSchema);
        errors.push(...propErrors);
    }
}
return errors;
//     }
// Complexity: O(1)
//     toJSON(): Record<string, FieldSchema> {
//         return Object.fromEntries(this.fields);
//     }
// }
// ═══════════════════════════════════════════════════════════════════════════════
// FIELD BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════
class BaseField {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    // Complexity: O(1)
    required() {
        this.schema.required = true;
        return this;
    }
    // Complexity: O(1)
    optional() {
        this.schema.required = false;
        return this;
    }
    // Complexity: O(1)
    default(value) {
        this.schema.default = value;
        return this;
    }
    // Complexity: O(1)
    custom(validator) {
        this.schema.validators = this.schema.validators || [];
        this.schema.validators.push(validator);
        return this;
    }
}
class StringField extends BaseField {
    // Complexity: O(1)
    minLength(min) {
        this.schema.validators.push(exports.validators.minLength(min));
        return this;
    }
    // Complexity: O(1)
    maxLength(max) {
        this.schema.validators.push(exports.validators.maxLength(max));
        return this;
    }
    // Complexity: O(1)
    pattern(regex, message) {
        this.schema.validators.push(exports.validators.pattern(regex, message));
        return this;
    }
    // Complexity: O(1)
    email() {
        this.schema.validators.push(exports.validators.email());
        return this;
    }
    // Complexity: O(1)
    url() {
        this.schema.validators.push(exports.validators.url());
        return this;
    }
    // Complexity: O(1)
    alphanumeric() {
        this.schema.validators.push(exports.validators.alphanumeric());
        return this;
    }
    // Complexity: O(1)
    noHtml() {
        this.schema.validators.push(exports.validators.noHtml());
        return this;
    }
    // Complexity: O(1)
    noSql() {
        this.schema.validators.push(exports.validators.noSql());
        return this;
    }
    // Complexity: O(1)
    trim() {
        this.schema.transform = exports.sanitizers.trim;
        return this;
    }
    // Complexity: O(1)
    lowercase() {
        this.schema.transform = exports.sanitizers.lowercase;
        return this;
    }
    // Complexity: O(1)
    escape() {
        this.schema.transform = exports.sanitizers.escape;
        return this;
    }
}
class NumberField extends BaseField {
    // Complexity: O(1)
    min(min) {
        this.schema.validators.push(exports.validators.min(min));
        return this;
    }
    // Complexity: O(1)
    max(max) {
        this.schema.validators.push(exports.validators.max(max));
        return this;
    }
    // Complexity: O(1)
    integer() {
        this.schema.validators.push(exports.validators.integer());
        return this;
    }
    // Complexity: O(1)
    positive() {
        this.schema.validators.push(exports.validators.positive());
        return this;
    }
}
class BooleanField extends BaseField {
}
class ArrayField extends BaseField {
    // Complexity: O(1)
    minItems(min) {
        this.schema.validators.push(exports.validators.minItems(min));
        return this;
    }
    // Complexity: O(1)
    maxItems(max) {
        this.schema.validators.push(exports.validators.maxItems(max));
        return this;
    }
    // Complexity: O(1)
    unique() {
        this.schema.validators.push(exports.validators.unique());
        return this;
    }
}
class ObjectField extends BaseField {
}
// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATOR DECORATOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @ValidateInput - Validate method parameters using schema
 */
function ValidateInput(schema, argIndex = 0) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            const input = args[argIndex];
            const result = schema.validate(input);
            if (!result.valid) {
                const errorMsg = result.errors.map(e => `${e.path}: ${e.message}`).join(', ');
                throw new Error(`Validation failed: ${errorMsg}`);
            }
            // Replace with sanitized value
            args[argIndex] = result.value;
            return original.apply(this, args);
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// INPUT VALIDATOR SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class InputValidator {
    schemas = new Map();
    // Complexity: O(1) — lookup
    register(name, schema) {
        this.schemas.set(name, schema);
    }
    // Complexity: O(1) — lookup
    validate(schemaName, data) {
        const schema = this.schemas.get(schemaName);
        if (!schema) {
            return {
                valid: false,
                errors: [{
                        //                     path: ',
                        //                     message: `Schema '${schemaName}' not found`,
                        code: 'SCHEMA_NOT_FOUND'
                    }]
            };
        }
        return schema.validate(data);
    }
    // Complexity: O(N) — linear scan
    validateOrThrow(schemaName, data) {
        const result = this.validate(schemaName, data);
        if (!result.valid) {
            const errorMsg = result.errors.map(e => `${e.path}: ${e.message}`).join(', ');
            throw new Error(`Validation failed for '${schemaName}': ${errorMsg}`);
        }
        return result.value;
    }
}
exports.InputValidator = InputValidator;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = {
    Schema,
    validators: exports.validators,
    sanitizers: exports.sanitizers,
    InputValidator,
    ValidateInput
};
// // 
