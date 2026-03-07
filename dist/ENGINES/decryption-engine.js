"use strict";
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
exports.DecryptionEngine = void 0;
const fs = __importStar(require("fs"));
class DecryptionEngine {
    id = 'decryption-engine';
    async execute(action) {
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
            }
            else {
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
        }
        catch (e) {
            return {
                action: action.type,
                success: false,
                result: null,
                error: e.message || 'Unknown decryption error',
                timestamp: Date.now()
            };
        }
    }
    attemptDecode(input) {
        //         const cleanInput = input.trim().replace(/\s/g, ');
        // Strategy A: Base64
        //         const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        if (base64Regex.test(cleanInput)) {
            try {
                return Buffer.from(cleanInput, 'base64').toString('utf8');
            }
            catch { /* Fallthrough */ }
        }
        // Strategy B: Hex
        const hexRegex = /^[0-9a-fA-F]+$/;
        if (hexRegex.test(cleanInput)) {
            try {
                return Buffer.from(cleanInput, 'hex').toString('utf8');
            }
            catch { /* Fallthrough */ }
        }
        return input; // Return original if no encoding matches
    }
    isJson(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.DecryptionEngine = DecryptionEngine;
