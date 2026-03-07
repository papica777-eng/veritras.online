/**
 * @file neural-mesh.ts
 * @description Implementation of Distributed Context Sharing (Phase 2).
 * This module allows the CognitiveBridge to persist thoughts across multiple execution threads.
 */

export class NeuralMesh {
  private static instance: NeuralMesh;
  private contextBuffer: Map<string, any>;

  private constructor() {
    this.contextBuffer = new Map();
    console.log('[\x1b[36mNEURAL-MESH\x1b[0m] Initialized Distributed Context Layer.');
  }

  public static getInstance(): NeuralMesh {
    if (!NeuralMesh.instance) NeuralMesh.instance = new NeuralMesh();
    return NeuralMesh.instance;
  }

  /**
   * Distributes a context object to the mesh.
   * @param key Unique identifier for the context
   * @param context Data payload
   */
  // Complexity: O(1) — hash/map lookup
  public share(key: string, context: any): void {
    console.log(`[\x1b[36mNEURAL-MESH\x1b[0m] Distributing context: ${key}`);
    this.contextBuffer.set(key, { ...context, timestamp: Date.now() });
  }

  /**
   * Retrieves the synchronized state of the mesh.
   */
  // Complexity: O(1)
  public synchronize(): Record<string, any> {
    return Object.fromEntries(this.contextBuffer);
  }

  /**
   * Stealth-read a value without triggering logs (Ghost Protocol compliant).
   */
  // Complexity: O(1) — hash/map lookup
  public peek(key: string): any {
    return this.contextBuffer.get(key);
  }
}
