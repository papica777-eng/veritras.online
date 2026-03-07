"use strict";
/**
 * Map Lookup Module Adapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapLookupModule = void 0;
const map_generator_1 = require("../../../scripts/memory/map-generator");
class MapLookupModule {
    projectMap = null;
    constructor() {
        try {
            this.projectMap = (0, map_generator_1.generateMap)();
        }
        catch (error) {
            console.warn('[MapLookupModule] Failed to generate project map:', error);
        }
    }
    // Complexity: O(N) — linear scan
    async execute(payload) {
        if (!this.projectMap) {
            return { error: 'Project map not initialized' };
        }
        const query = payload.path || payload.query || payload.value;
        if (!query) {
            return {
                totalFiles: this.projectMap.totalFiles,
                totalLines: this.projectMap.totalLines,
                departments: this.projectMap.departments,
            };
        }
        // Search for files matching the query
        const matches = this.projectMap.files.filter((f) => f.path.includes(query) || f.name.includes(query) || f.department.includes(query));
        return {
            query,
            matches: matches.slice(0, 10), // Limit to 10 results
            totalMatches: matches.length,
        };
    }
    // Complexity: O(1)
    getName() {
        return 'MapLookup';
    }
}
exports.MapLookupModule = MapLookupModule;
