"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CORE MODULE BARREL FILE                                              ║
 * ║   "Unified exports for core infrastructure"                                   ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImmutableState = exports.ImmutableState = exports.ImmutableSet = exports.ImmutableMap = exports.ImmutableArray = exports.removeKey = exports.getPath = exports.setPath = exports.setIn = exports.merge = exports.deepClone = exports.deepFreeze = exports.TOKENS = exports.Optional = exports.Inject = exports.Injectable = exports.BindingBuilder = exports.getContainer = exports.Container = exports.OnEvent = exports.EmitsEvent = exports.QAntumEvents = exports.getEventBus = exports.EventBus = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// EVENT BUS
// ═══════════════════════════════════════════════════════════════════════════════
var event_bus_1 = require("./event-bus");
Object.defineProperty(exports, "EventBus", { enumerable: true, get: function () { return event_bus_1.EventBus; } });
Object.defineProperty(exports, "getEventBus", { enumerable: true, get: function () { return event_bus_1.getEventBus; } });
Object.defineProperty(exports, "QAntumEvents", { enumerable: true, get: function () { return event_bus_1.QAntumEvents; } });
Object.defineProperty(exports, "EmitsEvent", { enumerable: true, get: function () { return event_bus_1.EmitsEvent; } });
Object.defineProperty(exports, "OnEvent", { enumerable: true, get: function () { return event_bus_1.OnEvent; } });
// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY INJECTION
// ═══════════════════════════════════════════════════════════════════════════════
var di_container_1 = require("./di-container");
Object.defineProperty(exports, "Container", { enumerable: true, get: function () { return di_container_1.Container; } });
Object.defineProperty(exports, "getContainer", { enumerable: true, get: function () { return di_container_1.getContainer; } });
Object.defineProperty(exports, "BindingBuilder", { enumerable: true, get: function () { return di_container_1.BindingBuilder; } });
Object.defineProperty(exports, "Injectable", { enumerable: true, get: function () { return di_container_1.Injectable; } });
Object.defineProperty(exports, "Inject", { enumerable: true, get: function () { return di_container_1.Inject; } });
Object.defineProperty(exports, "Optional", { enumerable: true, get: function () { return di_container_1.Optional; } });
Object.defineProperty(exports, "TOKENS", { enumerable: true, get: function () { return di_container_1.TOKENS; } });
// ═══════════════════════════════════════════════════════════════════════════════
// IMMUTABLE STATE
// ═══════════════════════════════════════════════════════════════════════════════
var immutable_1 = require("./immutable");
Object.defineProperty(exports, "deepFreeze", { enumerable: true, get: function () { return immutable_1.deepFreeze; } });
Object.defineProperty(exports, "deepClone", { enumerable: true, get: function () { return immutable_1.deepClone; } });
Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return immutable_1.merge; } });
Object.defineProperty(exports, "setIn", { enumerable: true, get: function () { return immutable_1.setIn; } });
Object.defineProperty(exports, "setPath", { enumerable: true, get: function () { return immutable_1.setPath; } });
Object.defineProperty(exports, "getPath", { enumerable: true, get: function () { return immutable_1.getPath; } });
Object.defineProperty(exports, "removeKey", { enumerable: true, get: function () { return immutable_1.removeKey; } });
Object.defineProperty(exports, "ImmutableArray", { enumerable: true, get: function () { return immutable_1.ImmutableArray; } });
Object.defineProperty(exports, "ImmutableMap", { enumerable: true, get: function () { return immutable_1.ImmutableMap; } });
Object.defineProperty(exports, "ImmutableSet", { enumerable: true, get: function () { return immutable_1.ImmutableSet; } });
Object.defineProperty(exports, "ImmutableState", { enumerable: true, get: function () { return immutable_1.ImmutableState; } });
Object.defineProperty(exports, "createImmutableState", { enumerable: true, get: function () { return immutable_1.createImmutableState; } });
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
const event_bus_2 = __importDefault(require("./event-bus"));
const di_container_2 = __importDefault(require("./di-container"));
const immutable_2 = __importDefault(require("./immutable"));
exports.default = {
    EventBus: event_bus_2.default,
    Container: di_container_2.default,
    Immutable: immutable_2.default,
};
