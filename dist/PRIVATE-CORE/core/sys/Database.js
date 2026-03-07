"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
class Database {
    static instance;
    store = new Map();
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async query(text, params) {
        // Mock implementation
        // console.log(`[DB] Executing: ${text}`, params);
        if (text.includes('UPDATE module_vitality')) {
            const moduleId = params[0];
            this.store.set(moduleId, { lastActive: new Date(), entropy: 0 });
            return { rowCount: 1 };
        }
        return { rows: [] };
    }
}
exports.Database = Database;
