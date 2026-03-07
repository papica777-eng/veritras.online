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
var evidence_collector_js_1 = require("./evidence-collector.js");
Object.defineProperty(exports, "EvidenceCollector", { enumerable: true, get: function () { return evidence_collector_js_1.EvidenceCollector; } });
Object.defineProperty(exports, "createRevolutEvidenceCollector", { enumerable: true, get: function () { return evidence_collector_js_1.createRevolutEvidenceCollector; } });
Object.defineProperty(exports, "quickCapture", { enumerable: true, get: function () { return evidence_collector_js_1.quickCapture; } });
// Default export
var evidence_collector_js_2 = require("./evidence-collector.js");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return evidence_collector_js_2.EvidenceCollector; } });
