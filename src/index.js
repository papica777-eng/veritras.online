/**
 * @fileoverview Main module exports for QAntum v8.5
 * @module src/index
 * @version 1.0.0-QAntum
 */

// Config
const { CONFIG, TIMING, validateConfig } = require('./config/constants');
const { SYSTEM_PROMPT } = require('./config/system-prompt');

// Core
const { KnowledgeBase } = require('./core/KnowledgeBase');
const { GeminiBrain } = require('./core/GeminiBrain');

// Engines
const { SemanticEngine } = require('./engines/SemanticEngine');
const { SelfHealingEngine } = require('./engines/SelfHealingEngine');

// Reporters
const { BugReportGenerator } = require('./reporters/BugReportGenerator');
const { PerformanceProfiler } = require('./reporters/PerformanceProfiler');

// Integrations
const { HumanInTheLoop } = require('./integrations/HumanInTheLoop');

module.exports = {
    // Config
    CONFIG,
    TIMING,
    SYSTEM_PROMPT,
    validateConfig,
    
    // Core
    KnowledgeBase,
    GeminiBrain,
    
    // Engines
    SemanticEngine,
    SelfHealingEngine,
    
    // Reporters
    BugReportGenerator,
    PerformanceProfiler,
    
    // Integrations
    HumanInTheLoop
};
