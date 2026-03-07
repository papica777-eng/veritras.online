"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum-Market-Reaper v28.0 - Module Exports                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reaperDashboard = exports.ReaperDashboard = exports.atomicTrader = exports.AtomicTrader = exports.priceOracle = exports.PriceOracle = exports.arbitrageLogic = exports.ArbitrageLogic = exports.arbitrageOrchestrator = exports.ArbitrageOrchestrator = exports.marketWatcher = exports.MarketWatcher = void 0;
// Core Components
var MarketWatcher_1 = require("./reality/economy/MarketWatcher");
Object.defineProperty(exports, "MarketWatcher", { enumerable: true, get: function () { return MarketWatcher_1.MarketWatcher; } });
Object.defineProperty(exports, "marketWatcher", { enumerable: true, get: function () { return MarketWatcher_1.marketWatcher; } });
var ArbitrageOrchestrator_1 = require("./reality/economy/ArbitrageOrchestrator");
Object.defineProperty(exports, "ArbitrageOrchestrator", { enumerable: true, get: function () { return ArbitrageOrchestrator_1.ArbitrageOrchestrator; } });
Object.defineProperty(exports, "arbitrageOrchestrator", { enumerable: true, get: function () { return ArbitrageOrchestrator_1.arbitrageOrchestrator; } });
var ArbitrageLogic_1 = require("./math/ArbitrageLogic");
Object.defineProperty(exports, "ArbitrageLogic", { enumerable: true, get: function () { return ArbitrageLogic_1.ArbitrageLogic; } });
Object.defineProperty(exports, "arbitrageLogic", { enumerable: true, get: function () { return ArbitrageLogic_1.arbitrageLogic; } });
var PriceOracle_1 = require("./chronos/PriceOracle");
Object.defineProperty(exports, "PriceOracle", { enumerable: true, get: function () { return PriceOracle_1.PriceOracle; } });
Object.defineProperty(exports, "priceOracle", { enumerable: true, get: function () { return PriceOracle_1.priceOracle; } });
var AtomicTrader_1 = require("./physics/AtomicTrader");
Object.defineProperty(exports, "AtomicTrader", { enumerable: true, get: function () { return AtomicTrader_1.AtomicTrader; } });
Object.defineProperty(exports, "atomicTrader", { enumerable: true, get: function () { return AtomicTrader_1.atomicTrader; } });
var ReaperDashboard_1 = require("./dashboard/ReaperDashboard");
Object.defineProperty(exports, "ReaperDashboard", { enumerable: true, get: function () { return ReaperDashboard_1.ReaperDashboard; } });
Object.defineProperty(exports, "reaperDashboard", { enumerable: true, get: function () { return ReaperDashboard_1.reaperDashboard; } });
