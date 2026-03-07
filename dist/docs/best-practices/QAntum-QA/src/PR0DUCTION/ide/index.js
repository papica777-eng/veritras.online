"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IDE MODULE INDEX
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "The Sovereign Sidebar - Централизиран експорт на всички IDE компоненти."
 *
 * 🔐 PROTECTED: All modules are hardware-locked via SovereignLock
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. ЛИЧЕН. НЕ ЗА РАЗПРОСТРАНЕНИЕ.
 * @version 30.5.0 - THE SOVEREIGN PLUG-IN
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCreator = exports.sovereignLock = exports.SovereignLock = exports.omegaServer = exports.OmegaServer = exports.OmegaViewProvider = exports.deactivate = exports.activate = void 0;
// VS Code Extension
var extension_1 = require("./extension");
Object.defineProperty(exports, "activate", { enumerable: true, get: function () { return extension_1.activate; } });
Object.defineProperty(exports, "deactivate", { enumerable: true, get: function () { return extension_1.deactivate; } });
// Webview Provider
var OmegaViewProvider_1 = require("./OmegaViewProvider");
Object.defineProperty(exports, "OmegaViewProvider", { enumerable: true, get: function () { return OmegaViewProvider_1.OmegaViewProvider; } });
// Backend Server
var OmegaServer_1 = require("./OmegaServer");
Object.defineProperty(exports, "OmegaServer", { enumerable: true, get: function () { return OmegaServer_1.OmegaServer; } });
Object.defineProperty(exports, "omegaServer", { enumerable: true, get: function () { return OmegaServer_1.omegaServer; } });
// Sovereign Lock (Hardware Protection)
var SovereignLock_1 = require("./SovereignLock");
Object.defineProperty(exports, "SovereignLock", { enumerable: true, get: function () { return SovereignLock_1.SovereignLock; } });
Object.defineProperty(exports, "sovereignLock", { enumerable: true, get: function () { return SovereignLock_1.sovereignLock; } });
Object.defineProperty(exports, "requireCreator", { enumerable: true, get: function () { return SovereignLock_1.requireCreator; } });
