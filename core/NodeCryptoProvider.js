/**
 * NodeCryptoProvider — Qantum Module
 * @module NodeCryptoProvider
 * @path core/NodeCryptoProvider.js
 * @auto-documented BrutalDocEngine v2.1
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeCryptoProvider = void 0;
const crypto = require("crypto");
const CryptoProvider_js_1 = require("./CryptoProvider.js");
/**
 * `CryptoProvider which uses the Node `crypto` package for its computations.
 */
class NodeCryptoProvider extends CryptoProvider_js_1.CryptoProvider {
    /** @override */
    // Complexity: O(1)
    computeHMACSignature(payload, secret) {
        return crypto
            .createHmac('sha256', secret)
            .update(payload, 'utf8')
            .digest('hex');
    }
    /** @override */
    // Complexity: O(1)
    async computeHMACSignatureAsync(payload, secret) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const signature = await this.computeHMACSignature(payload, secret);
        return signature;
    }
}
exports.NodeCryptoProvider = NodeCryptoProvider;
