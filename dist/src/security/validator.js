"use strict";
/**
 * validator — Qantum Module
 * @module validator
 * @path src/security/validator.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizers = exports.validators = exports.InputValidator = exports.Schema = void 0;
exports.ValidateInput = ValidateInput;
class Schema {
    definition = {};
    currentField = null;
    static create() {
        return new Schema();
    }
    // Complexity: O(1)
    string(field) {
        this.currentField = field;
        this.definition[field] = { type: 'string' };
        return this;
    }
    // Complexity: O(1)
    required() {
        if (this.currentField)
            this.definition[this.currentField].required = true;
        return this;
    }
    // Complexity: O(1)
    minLength(len) {
        if (this.currentField)
            this.definition[this.currentField].minLength = len;
        return this;
    }
    // Complexity: O(1)
    maxLength(len) {
        if (this.currentField)
            this.definition[this.currentField].maxLength = len;
        return this;
    }
    // Complexity: O(1)
    email() {
        if (this.currentField)
            this.definition[this.currentField].email = true;
        return this;
    }
    // Complexity: O(1)
    alphanumeric() {
        if (this.currentField)
            this.definition[this.currentField].alphanumeric = true;
        return this;
    }
    // Complexity: O(1)
    getDefinition() {
        return this.definition;
    }
}
exports.Schema = Schema;
class InputValidator {
    schemas = new Map();
    // Complexity: O(1) — lookup
    register(name, schema) {
        this.schemas.set(name, schema);
    }
    // Complexity: O(N) — loop
    validate(schemaName, data) {
        const schema = this.schemas.get(schemaName);
        if (!schema) {
            return { valid: false, errors: [{ field: 'schema', message: `Schema ${schemaName} not found` }] };
        }
        const definition = schema.getDefinition();
        const errors = [];
        for (const [field, rules] of Object.entries(definition)) {
            const value = data[field];
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, message: 'Required field missing' });
                continue;
            }
            if (value !== undefined && value !== null) {
                if (rules.type === 'string' && typeof value !== 'string') {
                    errors.push({ field, message: 'Must be a string' });
                }
                if (typeof value === 'string') {
                    if (rules.minLength && value.length < rules.minLength) {
                        errors.push({ field, message: `Must be at least ${rules.minLength} chars` });
                    }
                    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors.push({ field, message: 'Invalid email format' });
                    }
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
exports.InputValidator = InputValidator;
exports.validators = {};
exports.sanitizers = {};
function ValidateInput() { return (target, propertyKey, descriptor) => { }; }
