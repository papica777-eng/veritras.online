/**
 * Authentication middleware (minimal placeholder)
 *
 * NOTE: This repo currently doesn't include full Clerk auth integration.
 * This file exists so the API can build and CI can run.
 */

import type { FastifyRequest } from 'fastify';

export async function requireAuth(request: FastifyRequest) {
  // Placeholder - no-op for now
  return;
}

export async function getTenant(request: FastifyRequest) {
  // Placeholder tenant object
  return {
    id: 'default-tenant',
    plan: 'FREE',
    testsLimit: 100,
  };
}
