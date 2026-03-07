"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum VALIDATION MODULE                                                    ║
 * ║   "Comprehensive validation for data, responses, and contracts"               ║
 * ║                                                                               ║
 * ║   TODO B #25-27 - Validation: Schema, Response, Contract                      ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.validate = exports.getValidation = exports.QAntumValidation = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("../config/schema"), exports);
__exportStar(require("./response.js"), exports);
__exportStar(require("./contract.js"), exports);
const schema_1 = require("../config/schema");
Object.defineProperty(exports, "schema", { enumerable: true, get: function () { return schema_1.schema; } });
const response_js_1 = require("./response.js");
const contract_js_1 = require("./contract.js");
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED VALIDATION FACADE
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumValidation {
    static instance;
    schemaValidator;
    contractValidator;
    constructor() {
        this.schemaValidator = schema_1.SchemaValidator.getInstance();
        this.contractValidator = contract_js_1.ContractValidator.getInstance();
    }
    static getInstance() {
        if (!QAntumValidation.instance) {
            QAntumValidation.instance = new QAntumValidation();
        }
        return QAntumValidation.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SCHEMA VALIDATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Validate data against schema
     */
    // Complexity: O(1)
    validate(value, schema) {
        return this.schemaValidator.validate(value, schema);
    }
    /**
     * Assert validation
     */
    // Complexity: O(1)
    assert(value, schema, message) {
        this.schemaValidator.assert(value, schema, message);
    }
    /**
     * Register schema
     */
    // Complexity: O(1)
    registerSchema(name, schema) {
        this.schemaValidator.register(name, schema);
        return this;
    }
    /**
     * Create schema builder
     */
    // Complexity: O(1)
    schema() {
        return schema_1.Schema.create();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RESPONSE VALIDATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create response asserter
     */
    // Complexity: O(1)
    assertResponse(response) {
        return (0, response_js_1.assertResponse)(response);
    }
    /**
     * Quick response validation
     */
    // Complexity: O(1)
    validateResponse(response, expectations) {
        const asserter = this.assertResponse(response);
        if (expectations.status !== undefined) {
            asserter.status(expectations.status);
        }
        if (expectations.contentType) {
            asserter.contentType(expectations.contentType);
        }
        if (expectations.hasProperties) {
            for (const prop of expectations.hasProperties) {
                asserter.hasProperty(prop);
            }
        }
        if (expectations.matchesSchema) {
            asserter.matchesSchema(expectations.matchesSchema);
        }
        return asserter.result();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CONTRACT VALIDATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register contract
     */
    // Complexity: O(1)
    registerContract(contract) {
        this.contractValidator.register(contract);
        return this;
    }
    /**
     * Load OpenAPI spec as contract
     */
    // Complexity: O(1)
    loadOpenAPI(spec) {
        return this.contractValidator.loadFromOpenAPI(spec);
    }
    /**
     * Validate request against contract
     */
    // Complexity: O(1)
    validateRequest(contractName, method, path, request) {
        return this.contractValidator.validateRequest(contractName, method, path, request);
    }
    /**
     * Validate response against contract
     */
    // Complexity: O(1)
    validateContractResponse(contractName, method, path, response) {
        return this.contractValidator.validateResponse(contractName, method, path, response);
    }
    /**
     * Generate contract from interactions
     */
    // Complexity: O(1)
    generateContract(name, interactions) {
        return this.contractValidator.generateContract(name, interactions);
    }
}
exports.QAntumValidation = QAntumValidation;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getValidation = () => QAntumValidation.getInstance();
exports.getValidation = getValidation;
// Quick validation helpers
exports.validate = {
    // Schema validation
    data: (value, schema) => QAntumValidation.getInstance().validate(value, schema),
    assert: (value, schema, msg) => QAntumValidation.getInstance().assert(value, schema, msg),
    // Response validation
    response: (response) => QAntumValidation.getInstance().assertResponse(response),
    // Contract validation
    request: (contract, method, path, req) => QAntumValidation.getInstance().validateRequest(contract, method, path, req),
    contractResponse: (contract, method, path, res) => QAntumValidation.getInstance().validateContractResponse(contract, method, path, res),
};
exports.default = QAntumValidation;
