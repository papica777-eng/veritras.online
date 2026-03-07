"use strict";
/**
 * paths — Qantum Module
 * @module paths
 * @path src/utils/paths.ts
 * @auto-documented BrutalDocEngine v2.1
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOT_DIR = void 0;
exports.pathJoin = pathJoin;
exports.getRelativePath = getRelativePath;
exports.getDirname = getDirname;
exports.getFilename = getFilename;
exports.getExtension = getExtension;
const path = __importStar(require("path"));
/**
 * 🛠️ Path Utilities
 * Ensures cross-platform path compatibility.
 */
function pathJoin(...parts) {
    return path.join(...parts);
}
function getRelativePath(from, to) {
    return path.relative(from, to);
}
function getDirname(filePath) {
    return path.dirname(filePath);
}
function getFilename(filePath) {
    return path.basename(filePath);
}
function getExtension(filePath) {
    return path.extname(filePath);
}
exports.ROOT_DIR = path.resolve(process.cwd());
