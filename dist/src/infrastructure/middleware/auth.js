"use strict";
/**
 * Authentication middleware (minimal placeholder)
 *
 * NOTE: This repo currently doesn't include full Clerk auth integration.
 * This file exists so the API can build and CI can run.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.getTenant = getTenant;
async function requireAuth(request) {
    // Placeholder - no-op for now
    return;
}
async function getTenant(request) {
    // Placeholder tenant object
    return {
        id: 'default-tenant',
        plan: 'FREE',
        testsLimit: 100,
    };
}
