"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedMemoryV2 = exports.SharedMemoryV2 = exports.BrowserPoolManager = void 0;
var browser_pool_1 = require("./browser-pool");
Object.defineProperty(exports, "BrowserPoolManager", { enumerable: true, get: function () { return browser_pool_1.BrowserPoolManager; } });
// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MEMORY V2 - Lock-Free High-Performance Memory Manager
// ═══════════════════════════════════════════════════════════════════════════════
var shared_memory_v2_1 = require("./shared-memory-v2");
Object.defineProperty(exports, "SharedMemoryV2", { enumerable: true, get: function () { return shared_memory_v2_1.SharedMemoryV2; } });
Object.defineProperty(exports, "getSharedMemoryV2", { enumerable: true, get: function () { return shared_memory_v2_1.getSharedMemoryV2; } });
