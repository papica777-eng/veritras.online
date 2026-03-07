"use strict";
/**
 * VERITAS SDK - Main Entry Point
 * @module @mistermind/veritas-sdk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNeuralMapper = exports.NeuralMapper = exports.createStripeCheckout = exports.VERITAS_LICENSE_TIERS = exports.getVeritasLicenseEngine = exports.VeritasLicenseEngine = exports.Veritas = void 0;
var Veritas_1 = require("./Veritas");
Object.defineProperty(exports, "Veritas", { enumerable: true, get: function () { return Veritas_1.Veritas; } });
var CommercializationEngine_1 = require("./CommercializationEngine");
Object.defineProperty(exports, "VeritasLicenseEngine", { enumerable: true, get: function () { return CommercializationEngine_1.VeritasLicenseEngine; } });
Object.defineProperty(exports, "getVeritasLicenseEngine", { enumerable: true, get: function () { return CommercializationEngine_1.getVeritasLicenseEngine; } });
Object.defineProperty(exports, "VERITAS_LICENSE_TIERS", { enumerable: true, get: function () { return CommercializationEngine_1.VERITAS_LICENSE_TIERS; } });
Object.defineProperty(exports, "createStripeCheckout", { enumerable: true, get: function () { return CommercializationEngine_1.createStripeCheckout; } });
var NeuralMapper_1 = require("./NeuralMapper");
Object.defineProperty(exports, "NeuralMapper", { enumerable: true, get: function () { return NeuralMapper_1.NeuralMapper; } });
Object.defineProperty(exports, "getNeuralMapper", { enumerable: true, get: function () { return NeuralMapper_1.getNeuralMapper; } });
// Default export
const Veritas_2 = require("./Veritas");
exports.default = Veritas_2.Veritas;
