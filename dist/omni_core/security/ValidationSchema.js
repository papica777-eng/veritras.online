"use strict";
/**
 * ValidationSchema — Qantum Module
 * @module ValidationSchema
 * @path omni_core/security/ValidationSchema.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIArgsSchema = exports.VectorDocumentSchema = exports.ModuleManifestSchema = exports.WebhookPayloadSchema = void 0;
const zod_1 = require("zod");
/**
 * 🛡️ VORTEX SECURITY: VALIDATION SCHEMAS
 * Purpose: Guard the core against malformed inputs and data corruption.
 */
// 1. Webhook Payload Schema
exports.WebhookPayloadSchema = zod_1.z.object({
    ref: zod_1.z.string(),
    before: zod_1.z.string(),
    after: zod_1.z.string(),
    repository: zod_1.z.object({
        name: zod_1.z.string(),
        full_name: zod_1.z.string(),
        owner: zod_1.z.object({
            name: zod_1.z.string().optional(),
            login: zod_1.z.string()
        }),
        url: zod_1.z.string().url()
    }),
    pusher: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email().optional()
    }),
    commits: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        message: zod_1.z.string(),
        timestamp: zod_1.z.string(),
        url: zod_1.z.string().url(),
        author: zod_1.z.object({
            name: zod_1.z.string(),
            email: zod_1.z.string().email().optional()
        }),
        added: zod_1.z.array(zod_1.z.string()),
        removed: zod_1.z.array(zod_1.z.string()),
        modified: zod_1.z.array(zod_1.z.string())
    }))
});
// 2. Module Manifest Schema
exports.ModuleManifestSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    version: zod_1.z.string(),
    type: zod_1.z.enum(['CORE', 'MODULE', 'ADAPTER', 'INTERFACE']),
    path: zod_1.z.string(),
    exports: zod_1.z.array(zod_1.z.string()).optional(),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// 3. Vector Document Schema (for LanceDB/Pinecone)
exports.VectorDocumentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    content: zod_1.z.string().min(1),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    embedding: zod_1.z.array(zod_1.z.number()).optional()
});
// 4. CLI Argument Schema
exports.CLIArgsSchema = zod_1.z.object({
    command: zod_1.z.string(),
    target: zod_1.z.string().optional(),
    verbose: zod_1.z.boolean().optional(),
    format: zod_1.z.enum(['json', 'text', 'markdown']).default('text')
});
