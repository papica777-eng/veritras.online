/**
 * solana-provider — Qantum Module
 * @module solana-provider
 * @path src/modules/hydrated/solana-provider.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { Connection } from '@solana/web3.js';

/**
 * @class SolanaProvider
 * @description Secure, circuit-broken connection to the Solana blockchain.
 */
export class SolanaProvider {
  private connection: Connection | null = null;
  private isBroken: boolean = false;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (rpcUrl) {
      this.connection = new Connection(rpcUrl, 'confirmed');
      console.log('[\x1b[36mSOLANA\x1b[0m] Provider initialized (Circuit Closed).');
    } else {
      console.warn('[\x1b[33mSOLANA\x1b[0m] Warning: SOLANA_RPC_URL missing. Provider disabled.');
      this.isBroken = true;
    }
  }

  // Complexity: O(1) — hash/map lookup
  public async getHealth(): Promise<boolean> {
    if (!this.connection || this.isBroken) return false;
    try {
      const version = await this.connection.getVersion();
      if (version) {
        return true;
      }
      return false;
    } catch (e) {
      this.isBroken = true; // Trip the circuit
      console.error('[\x1b[31mSOLANA-PROVIDER\x1b[0m] Circuit Tripped: RPC Unreachable.');
      return false;
    }
  }

  // Complexity: O(1)
  public getConn(): Connection | null {
    if (this.isBroken) return null;
    return this.connection;
  }

  // Complexity: O(1) — hash/map lookup
  public resetCircuit(): void {
    this.isBroken = false;
    console.log('[\x1b[36mSOLANA\x1b[0m] Circuit Reset.');
  }
}

// Self-Test
if (require.main === module) {
  const provider = new SolanaProvider();
  provider.getHealth().then((health) => {
    console.log(`[TEST] Health Check: ${health}`);
  });
}
