/**
 * 🛡️ GUARDIANS MODULE - Central Protection Hub
 * All guards consolidated in one place
 *
 * @module guardians
 * @version 1.0.0-QAntum
 */

export * from '../core/guardians/StrictCollar';
export * from './AuthGuard';
export * from './CognitiveCircularGuard';

// Re-export types
export type GuardianType = 'strict' | 'auth' | 'cognitive' | 'memory' | 'usage';

export interface GuardConfig {
  enabled: boolean;
  strictMode: boolean;
  logViolations: boolean;
  autoHeal: boolean;
}
