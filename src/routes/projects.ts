/**
 * Project Routes (minimal placeholder)
 *
 * NOTE: This repo currently doesn't include full Project CRUD.
 * This file exists so the API can build and CI can run.
 */

import type { FastifyPluginAsync } from 'fastify';

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    return { projects: [] };
  });
};

