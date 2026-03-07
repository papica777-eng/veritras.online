"use strict";
/**
 * prisma — Qantum Module
 * @module prisma
 * @path src/lib/prisma.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = globalThis.__prisma ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = exports.prisma;
}
