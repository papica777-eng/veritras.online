/**
 * Symbol Verifier Module Adapter
 */

import { ICognitiveModule } from '../types';
import { Assimilator } from '../../../scripts/assimilator';

export class SymbolVerifierModule implements ICognitiveModule {
  private assimilator: Assimilator;

  constructor() {
    this.assimilator = Assimilator.getInstance();
  }

  // Complexity: O(N)
  async execute(payload: Record<string, any>): Promise<any> {
    const symbol = payload.symbol || payload.value;

    if (!symbol) {
      return { error: 'No symbol provided for verification' };
    }

    const result = this.assimilator.verify(symbol);
    return result;
  }

  // Complexity: O(1)
  getName(): string {
    return 'SymbolVerifier';
  }
}
