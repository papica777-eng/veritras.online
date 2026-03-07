"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRATEGY EXPORTS - BARREL FILE
 * ═══════════════════════════════════════════════════════════════════════════════
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllStrategies = void 0;
__exportStar(require("./network.strategy"), exports);
__exportStar(require("./resource.strategy"), exports);
__exportStar(require("./application.strategy"), exports);
__exportStar(require("./infrastructure.strategy"), exports);
// Re-export strategy collections
const network_strategy_1 = require("./network.strategy");
const resource_strategy_1 = require("./resource.strategy");
const application_strategy_1 = require("./application.strategy");
const infrastructure_strategy_1 = require("./infrastructure.strategy");
exports.AllStrategies = {
    network: network_strategy_1.NetworkStrategies,
    resource: resource_strategy_1.ResourceStrategies,
    application: application_strategy_1.ApplicationStrategies,
    infrastructure: infrastructure_strategy_1.InfrastructureStrategies,
};
