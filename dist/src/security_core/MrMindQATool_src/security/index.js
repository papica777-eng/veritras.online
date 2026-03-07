"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.quickCapture = exports.createRevolutEvidenceCollector = exports.EvidenceCollector = void 0;
// Evidence Collector
var evidence_collector_1 = require("../../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/security/evidence-collector");
Object.defineProperty(exports, "EvidenceCollector", { enumerable: true, get: function () { return evidence_collector_1.EvidenceCollector; } });
Object.defineProperty(exports, "createRevolutEvidenceCollector", { enumerable: true, get: function () { return evidence_collector_1.createRevolutEvidenceCollector; } });
Object.defineProperty(exports, "quickCapture", { enumerable: true, get: function () { return evidence_collector_1.quickCapture; } });
// Default export
var evidence_collector_2 = require("../../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/security/evidence-collector");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return evidence_collector_2.EvidenceCollector; } });
