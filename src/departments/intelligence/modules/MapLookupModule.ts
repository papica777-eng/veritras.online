/**
 * Map Lookup Module Adapter
 */

import { ICognitiveModule } from '../types';
import { generateMap, ProjectMap } from '../../../scripts/memory/map-generator';

export class MapLookupModule implements ICognitiveModule {
  private projectMap: ProjectMap | null = null;

  constructor() {
    try {
      this.projectMap = generateMap();
    } catch (error) {
      console.warn('[MapLookupModule] Failed to generate project map:', error);
    }
  }

  // Complexity: O(N) — linear scan
  async execute(payload: Record<string, any>): Promise<any> {
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
    const matches = this.projectMap.files.filter(
      (f) => f.path.includes(query) || f.name.includes(query) || f.department.includes(query)
    );

    return {
      query,
      matches: matches.slice(0, 10), // Limit to 10 results
      totalMatches: matches.length,
    };
  }

  // Complexity: O(1)
  getName(): string {
    return 'MapLookup';
  }
}
