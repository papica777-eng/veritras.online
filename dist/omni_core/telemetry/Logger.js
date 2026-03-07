"use strict";
/**
 * Logger — Qantum Module
 * @module Logger
 * @path omni_core/telemetry/Logger.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static instance;
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    // Complexity: O(1) — hash/map lookup
    debug(context, message, ...args) {
        console.debug(`[DEBUG][${context}] ${message}`, ...args);
    }
    // Complexity: O(1) — hash/map lookup
    info(context, message, ...args) {
        console.info(`[INFO][${context}] ${message}`, ...args);
    }
    // Complexity: O(1) — hash/map lookup
    warn(context, message, ...args) {
        console.warn(`[WARN][${context}] ${message}`, ...args);
    }
    // Complexity: O(1) — hash/map lookup
    error(context, message, error) {
        console.error(`[ERROR][${context}] ${message}`, error);
    }
}
exports.Logger = Logger;
