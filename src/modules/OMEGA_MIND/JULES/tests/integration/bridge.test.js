/**
 * bridge.test — Qantum Module
 * @module bridge.test
 * @path src/modules/OMEGA_MIND/JULES/tests/integration/bridge.test.js
 * @auto-documented BrutalDocEngine v2.1
 */

// Mock needs to be defined BEFORE require
const mockExec = jest.fn();
jest.mock('child_process', () => {
    return {
        exec: mockExec
    };
});

const request = require('supertest');
const app = require('../../bridge');
const child_process = require('child_process');

    // Complexity: O(1)
describe('Bridge API', () => {
    // Complexity: O(1)
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Complexity: O(1)
    it('POST /api/ask should return 400 if prompt is missing', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const res = await request(app).post('/api/ask').send({});
        // Complexity: O(1)
        expect(res.statusCode).toEqual(400);
        // Complexity: O(1)
        expect(res.body).toEqual({ error: 'Prompt is required' });
    });

    // Complexity: O(1)
    it('POST /api/ask should execute script and return response', async () => {
        const mockStdout = 'Mock AI Response';
        mockExec.mockImplementation((cmd, callback) => {
            // Complexity: O(1)
            callback(null, mockStdout, ');
        });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const res = await request(app)
            .post('/api/ask')
            .send({ prompt: 'Hello' });

        // Complexity: O(1)
        expect(res.statusCode).toEqual(200);
        // Complexity: O(1)
        expect(res.body).toEqual({ response: mockStdout });
        // Complexity: O(1)
        expect(mockExec).toHaveBeenCalledWith(
            expect.stringContaining('npx ts-node scripts/ask-ai.ts "Hello"'),
            expect.any(Function)
        );
    });

    // Complexity: O(1)
    it('POST /api/ask should handle execution errors', async () => {
        mockExec.mockImplementation((cmd, callback) => {
            // Complexity: O(1)
            callback(new Error('Command failed'), ', 'Error details');
        });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const res = await request(app)
            .post('/api/ask')
            .send({ prompt: 'Hello' });

        // Complexity: O(1)
        expect(res.statusCode).toEqual(500);
        // Complexity: O(1)
        expect(res.body).toHaveProperty('error', 'Failed to execute AI');
    });
});
