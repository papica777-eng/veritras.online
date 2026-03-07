/**
 * prisma — Qantum Module
 * @module prisma
 * @path src/modules/OMEGA_MIND/brain/logic/energy/prisma.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma singleton.
 *
 * Avoid exhausting DB connections during dev hot-reload.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
