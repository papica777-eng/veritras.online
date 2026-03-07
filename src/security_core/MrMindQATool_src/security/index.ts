/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum - Security Module
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 🛡️ CyberCody Security Suite
 *
 * Components:
 * • Evidence Collector - Automated screenshot capture with AI annotations
 * • CyberCody CLI - Command-line security auditor
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Evidence Collector
export {
  EvidenceCollector,
  createRevolutEvidenceCollector,
  quickCapture,
  type SecurityEventType,
  type CaptureMode,
  type ImageFormat,
  type MaskingLevel,
  type AIAnnotationProvider,
  type EvidenceMetadata,
  type AIAnnotation,
  type BoundingBox,
  type BrowserInfo,
  type NetworkContext,
  type EvidenceCollectorConfig,
  type CaptureResult,
  type SessionStats,
} from '../../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/security/evidence-collector';

// Default export
export { EvidenceCollector as default } from '../../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/security/evidence-collector';
