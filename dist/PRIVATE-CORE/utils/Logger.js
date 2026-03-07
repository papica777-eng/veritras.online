"use strict";
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
    log(message) {
        console.log(`[QANTUM-VORTEX-LOG] ${new Date().toISOString()}: ${message}`);
    }
    warn(message) {
        console.warn(`[QANTUM-VORTEX-WARN] ${new Date().toISOString()}: ${message}`);
    }
    error(message, error) {
        console.error(`[QANTUM-VORTEX-ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    }
}
exports.Logger = Logger;
