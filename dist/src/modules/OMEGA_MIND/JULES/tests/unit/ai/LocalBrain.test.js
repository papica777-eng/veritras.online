"use strict";
/**
 * LocalBrain.test — Qantum Module
 * @module LocalBrain.test
 * @path src/modules/OMEGA_MIND/JULES/tests/unit/ai/LocalBrain.test.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const LocalBrain_1 = require("../../../src/ai/LocalBrain");
const fs = __importStar(require("fs"));
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
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockInventory);
        const brain = new LocalBrain_1.LocalBrain();
        // We can't access private properties easily, but we can verify behavior via the ask method
        // or by spying on the prototype if we really wanted to, but checking ask is better integration.
        // However, since we mock fs, we know it tried to read.
        // Complexity: O(1)
        expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('INVENTORY.md'), 'utf-8');
    });
    // Complexity: O(1)
    it('should not crash if INVENTORY.md does not exist', () => {
        fs.existsSync.mockReturnValue(false);
        const brain = new LocalBrain_1.LocalBrain();
        // Complexity: O(1)
        expect(fs.readFileSync).not.toHaveBeenCalled();
    });
    // Complexity: O(1)
    it('should enhance prompt with memory', async () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockInventory);
        const brain = new LocalBrain_1.LocalBrain();
        const prompt = 'Hello AI';
        // Spy on the super.ask method (which is on the prototype chain)
        // Since LocalBrain extends Orchestrator, we can spy on Orchestrator.prototype.ask
        // OR we can spy on the instance method if we didn't call super in the constructor (but we do).
        // Actually, sping on the instance method works if we do it before calling it.
        // But since `ask` is defined in LocalBrain and calls super.ask, if we spy on brain.ask, we are spying on the LocalBrain implementation.
        // We want to verify what it passes to super.ask.
        // We can spy on the Orchestrator prototype.
        const orchestratorSpy = jest.spyOn(Object.getPrototypeOf(LocalBrain_1.LocalBrain.prototype), 'ask');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await brain.ask(prompt);
        // Complexity: O(1)
        expect(orchestratorSpy).toHaveBeenCalledWith(expect.stringContaining(mockInventory));
        // Complexity: O(1)
        expect(orchestratorSpy).toHaveBeenCalledWith(expect.stringContaining(prompt));
    });
});
