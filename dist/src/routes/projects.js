"use strict";
/**
 * Project Routes (minimal placeholder)
 *
 * NOTE: This repo currently doesn't include full Project CRUD.
 * This file exists so the API can build and CI can run.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const projectRoutes = async (app) => {
    app.get('/', async () => {
        return { projects: [] };
    });
};
exports.projectRoutes = projectRoutes;
