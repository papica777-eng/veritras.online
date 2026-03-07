/**
 * decryption-engine — Qantum Module
 * @module decryption-engine
 * @path src/departments/intelligence/decryption-engine.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import {ICognitiveModule, CognitiveAction, CognitiveObservation} from './types';
import * as fs from 'fs';

export class DecryptionEngine implements ICognitiveModule {
    public readonly id = 'decryption-engine';

    // Complexity: O(1)
    public async execute(action: CognitiveAction): Promise<CognitiveObservation> {
        const payload = action.payload.targetPath || action.payload.content;

        try {
            // If payload is a file path, read it
            let rawData = payload;
            if (fs.existsSync(payload)) {
                rawData = fs.readFileSync(payload, 'utf8');
            }

            const decoded = this.attemptDecode(rawData);

            let result;
            if (this.isJson(decoded)) {
                const parsed = JSON.parse(decoded);
                result = {
                    status: 'DECODED_JSON',
                    type: typeof parsed,
                    preview: JSON.stringify(parsed).substring(0, 100),
                    data: parsed
                };
            } else {
                result = {
                    status: 'DECODED_RAW',
                    preview: decoded.substring(0, 100)
                };
            }

            return {
                action: action.type,
                success: true,
                result: result,
                timestamp: Date.now()
            };

        } catch (e: any) {
            return {
                action: action.type,
                success: false,
                result: null,
                error: e.message || 'Unknown decryption error',
                timestamp: Date.now()
            };
        }
    }

    // Complexity: O(1)
    private attemptDecode(input: string): string {
//         const cleanInput = input.trim().replace(/\s/g, ');

        // Strategy A: Base64
//         const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        if (base64Regex.test(cleanInput)) {
            try {
                return Buffer.from(cleanInput, 'base64').toString('utf8');
            } catch { /* Fallthrough */ }
        }

        // Strategy B: Hex
        const hexRegex = /^[0-9a-fA-F]+$/;
        if (hexRegex.test(cleanInput)) {
            try {
                return Buffer.from(cleanInput, 'hex').toString('utf8');
            } catch { /* Fallthrough */ }
        }

        return input; // Return original if no encoding matches
    }

    // Complexity: O(1)
    private isJson(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }
}
