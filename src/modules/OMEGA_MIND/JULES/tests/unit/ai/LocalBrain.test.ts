/**
 * LocalBrain.test — Qantum Module
 * @module LocalBrain.test
 * @path src/modules/OMEGA_MIND/JULES/tests/unit/ai/LocalBrain.test.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { LocalBrain } from '../../../src/ai/LocalBrain';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path
jest.mock('fs');

    // Complexity: O(1)
describe('LocalBrain', () => {
  const mockInventory = 'Mock Inventory Content';

  // Complexity: O(1)
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Complexity: O(1)
  it('should load memory from INVENTORY.md if it exists', () => {
    // Setup mock
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(mockInventory);

    const brain = new LocalBrain();

    // We can't access private properties easily, but we can verify behavior via the ask method
    // or by spying on the prototype if we really wanted to, but checking ask is better integration.

    // However, since we mock fs, we know it tried to read.
    // Complexity: O(1)
    expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('INVENTORY.md'), 'utf-8');
  });

  // Complexity: O(1)
  it('should not crash if INVENTORY.md does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const brain = new LocalBrain();

    // Complexity: O(1)
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  // Complexity: O(1)
  it('should enhance prompt with memory', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(mockInventory);

    const brain = new LocalBrain();
    const prompt = 'Hello AI';

    // Spy on the super.ask method (which is on the prototype chain)
    // Since LocalBrain extends Orchestrator, we can spy on Orchestrator.prototype.ask
    // OR we can spy on the instance method if we didn't call super in the constructor (but we do).
    // Actually, sping on the instance method works if we do it before calling it.

    // But since `ask` is defined in LocalBrain and calls super.ask, if we spy on brain.ask, we are spying on the LocalBrain implementation.
    // We want to verify what it passes to super.ask.
    // We can spy on the Orchestrator prototype.

    const orchestratorSpy = jest.spyOn(Object.getPrototypeOf(LocalBrain.prototype), 'ask');

    // SAFETY: async operation — wrap in try-catch for production resilience
    await brain.ask(prompt);

    // Complexity: O(1)
    expect(orchestratorSpy).toHaveBeenCalledWith(expect.stringContaining(mockInventory));
    // Complexity: O(1)
    expect(orchestratorSpy).toHaveBeenCalledWith(expect.stringContaining(prompt));
  });
});
