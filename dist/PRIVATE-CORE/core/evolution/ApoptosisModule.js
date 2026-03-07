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
exports.ApoptosisModule = void 0;
const crypto = __importStar(require("crypto"));
const LivenessTokenManager_1 = require("./LivenessTokenManager");
const Database_1 = require("../sys/Database");
const Logger_1 = require("../../utils/Logger");
class ApoptosisModule {
    tokenManager;
    db;
    logger;
    constructor() {
        this.tokenManager = LivenessTokenManager_1.LivenessTokenManager.getInstance();
        this.db = Database_1.Database.getInstance();
        this.logger = Logger_1.Logger.getInstance();
    }
    async registerVitality(moduleId, livenessToken) {
        try {
            // 1. Parse token
            const decoded = Buffer.from(livenessToken, 'base64').toString('utf-8');
            const parts = decoded.split(':');
            if (parts.length !== 4) {
                throw new Error('Invalid token format');
            }
            const [tokenModuleId, timestampStr, status, providedSignature] = parts;
            // 2. Verify Module ID (prevents spoofing)
            if (tokenModuleId !== moduleId) {
                throw new Error(`Module ID mismatch: expected ${moduleId}, got ${tokenModuleId}`);
            }
            // 3. Validate Timestamp (prevents replay attacks)
            const tokenTimestamp = parseInt(timestampStr, 10);
            const now = Date.now();
            const tokenAgeMs = now - tokenTimestamp;
            const MAX_TOKEN_AGE_MS = 5 * 60 * 1000; // 5 minutes
            if (tokenAgeMs > MAX_TOKEN_AGE_MS) {
                throw new Error(`LivenessToken expired: ${tokenAgeMs / 1000}s old`);
            }
            if (tokenTimestamp > now + 60000) {
                throw new Error('LivenessToken from future - clock skew attack detected');
            }
            // 4. Verify HMAC Signature (prevents forgery)
            const secret = this.tokenManager.getSecret();
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(`${tokenModuleId}:${timestampStr}:${status}`)
                .digest('hex');
            if (providedSignature !== expectedSignature) {
                throw new Error('LivenessToken signature verification FAILED');
            }
            // 5. Reset entropy and update lastActive
            await this.db.query(`UPDATE module_vitality
                 SET last_active = NOW(), entropy_score = 0.0
                 WHERE module_id = $1`, [moduleId]);
            this.logger.log(`Vitality registered for ${moduleId}`);
        }
        catch (error) {
            this.logger.error(`Security Alert in ApoptosisModule`, error);
            throw error;
        }
    }
}
exports.ApoptosisModule = ApoptosisModule;
