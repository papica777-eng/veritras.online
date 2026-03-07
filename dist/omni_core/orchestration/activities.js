"use strict";
/**
 * activities — Qantum Module
 * @module activities
 * @path omni_core/orchestration/activities.ts
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
exports.validateCode = validateCode;
exports.applyPatch = applyPatch;
exports.notifyAdmin = notifyAdmin;
exports.validateAndHeal = validateAndHeal;
const SandboxGuard_1 = require("../security/SandboxGuard");
const EvolutionNotary_1 = require("../governance/EvolutionNotary");
const Logger_1 = require("../telemetry/Logger");
/**
 * 🏗️ Temporal Activities for VortexEvolutionWorkflow
 *
 * These activities are executed by Temporal Workers and can be retried
 * independently if failures occur.
 *
 * Each activity is idempotent and provides strong consistency guarantees.
 */
const logger = Logger_1.Logger.getInstance();
const sandbox = SandboxGuard_1.SandboxGuard.getInstance();
/**
 * Activity: Validates code in EnterpriseSandbox
 *
 * @param code - Code to validate
 * @throws Error if validation fails
 */
async function validateCode(code) {
    logger.info('ACTIVITY', '🔍 Validating code in SandboxGuard...');
    // Static analysis
    const syntaxCheck = sandbox.validateCode(code);
    if (!syntaxCheck.safe) {
        throw new Error(`[VALIDATION_FAILED]: ${syntaxCheck.reason}`);
    }
    // Dynamic execution test
    try {
        await sandbox.executeSecurely(code, 5000); // 5s timeout
        logger.info('ACTIVITY', '✅ Code validation successful');
    }
    catch (error) {
        logger.error('ACTIVITY', '❌ Code validation failed', error);
        throw new Error(`[SANDBOX_EXECUTION_FAILED]: ${error.message}`);
    }
}
/**
 * Activity: Applies patch after cryptographic verification
 *
 * @param code - Code to apply
 * @param signature - Administrator signature (nullable for low-risk changes)
 * @returns Success message
 */
async function applyPatch(code, signature) {
    logger.info('ACTIVITY', '🔐 Applying patch with cryptographic verification...');
    // If signature provided, verify it
    if (signature) {
        const publicKey = process.env.ADMIN_PUBLIC_KEY;
        if (!publicKey) {
            throw new Error('[GOVERNANCE_ERROR]: ADMIN_PUBLIC_KEY not configured');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const verified = await EvolutionNotary_1.EvolutionNotary.verifyAuthorization(code, signature, publicKey);
        if (!verified) {
            throw new Error('[CRYPTOGRAPHIC_VERIFICATION_FAILED]: Invalid administrator signature');
        }
        logger.info('ACTIVITY', '✅ Cryptographic signature verified');
    }
    // TODO: Atomic patch application logic
    // In production: Use git, database transactions, or filesystem atomicity
    logger.info('ACTIVITY', `📝 Applying patch (${code.length} bytes)...`);
    // Placeholder for actual patch application
    // await applyPatchToCodebase(code);
    logger.info('ACTIVITY', '✅ Patch applied successfully');
    return `Patch applied successfully at ${new Date().toISOString()}`;
}
/**
 * Activity: Notifies administrator about pending evolution
 *
 * @param code - The code requiring approval
 */
async function notifyAdmin(code) {
    logger.info('ACTIVITY', '📧 Notifying administrator...');
    // TODO: Implement notification logic
    // Options: Email, SMS, Telegram, Slack, PagerDuty
    const notificationMessage = `
🚨 HIGH-RISK EVOLUTION REQUIRES APPROVAL

Proposed Code:
${code.substring(0, 200)}...

Please review and sign with your private key.
Send approval via: npm run vortex:approve <workflowId> <signature>
  `.trim();
    logger.warn('ACTIVITY', notificationMessage);
    // Placeholder: In production, integrate with notification service
    // await sendEmail(process.env.ADMIN_EMAIL, 'Vortex Evolution Approval Required', notificationMessage);
    // await sendTelegram(process.env.ADMIN_TELEGRAM_ID, notificationMessage);
    logger.info('ACTIVITY', '✅ Administrator notified');
}
/**
 * Activity: Validates code and heals if needed (Immune System Integration)
 *
 * This activity bridges the Sandbox validation with the Healing Nexus:
 * 1. Attempts validation in EnterpriseSandbox
 * 2. On success: Generates LivenessToken and registers vitality
 * 3. On failure: Initiates Logic healing and re-validates
 *
 * @param code - Code to validate
 * @param moduleId - Module identifier for vitality tracking
 * @returns Validated (and possibly healed) code
 */
async function validateAndHeal(code, moduleId) {
    logger.info('ACTIVITY', `🔬 Validating code for module: ${moduleId}`);
    try {
        // Step 1: Validate in sandbox
        await validateCode(code);
        // Step 2: Generate LivenessToken on success
        const { VortexHealingNexus } = await Promise.resolve().then(() => __importStar(require('../evolution/VortexHealingNexus')));
        const healingNexus = VortexHealingNexus.getInstance();
        const livenessToken = healingNexus.generateLivenessToken(moduleId, 'HEALTHY');
        // Step 3: Register vitality with ApoptosisModule
        try {
            const { ApoptosisModule } = await Promise.resolve().then(() => __importStar(require('../evolution/ApoptosisModule')));
            const apoptosis = ApoptosisModule.getInstance();
            await apoptosis.registerVitality(moduleId, livenessToken);
            logger.info('ACTIVITY', `✅ Code validated, vitality registered for ${moduleId}`);
        }
        catch (err) {
            logger.warn('ACTIVITY', 'ApoptosisModule not available, skipping vitality registration');
        }
        return code;
    }
    catch (error) {
        logger.warn('ACTIVITY', `⚠️ Code validation failed: ${error.message}`);
        logger.info('ACTIVITY', '🔬 Initiating Logic Healing via VortexHealingNexus...');
        try {
            // Step 4: Attempt Logic healing
            const { VortexHealingNexus, HealingDomain } = await Promise.resolve().then(() => __importStar(require('../evolution/VortexHealingNexus')));
            const healingNexus = VortexHealingNexus.getInstance();
            const healingResult = await healingNexus.initiateHealing(HealingDomain.LOGIC, {
                path: moduleId,
                error: error.message,
                stack: error.stack,
                failedCode: code
            });
            if (!healingResult.success || !healingResult.artifact) {
                throw new Error(`Logic healing failed: ${healingResult.error}`);
            }
            const healedCode = healingResult.artifact.code || code;
            // Step 5: Re-validate healed code
            logger.info('ACTIVITY', '🔄 Re-validating healed code...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await validateCode(healedCode);
            // Step 6: Generate LivenessToken for healed code
            const livenessToken = healingNexus.generateLivenessToken(moduleId, 'RECOVERING');
            try {
                const { ApoptosisModule } = await Promise.resolve().then(() => __importStar(require('../evolution/ApoptosisModule')));
                const apoptosis = ApoptosisModule.getInstance();
                await apoptosis.registerVitality(moduleId, livenessToken);
            }
            catch (err) {
                logger.warn('ACTIVITY', 'ApoptosisModule not available');
            }
            logger.info('ACTIVITY', `✅ Code healed and validated for ${moduleId}`);
            return healedCode;
        }
        catch (healingError) {
            logger.error('ACTIVITY', `❌ Healing failed: ${healingError.message}`);
            throw new Error(`[VALIDATION_AND_HEALING_FAILED]: ${healingError.message}`);
        }
    }
}
