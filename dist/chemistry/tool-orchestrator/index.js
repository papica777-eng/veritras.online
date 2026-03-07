"use strict";
/**
 * Tool Orchestrator - Barrel Export
 *
 * @module chemistry/tool-orchestrator
 * @description
 * QAntum's external tool integration layer for orchestrating 25+ MCP tools.
 *
 * ## Quick Start
 *
 * ```typescript
 * import {
 *   ToolRegistry,
 *   ToolSelector,
 *   ToolExecutor,
 *   MCPTool,
 *   ToolExecutionRequest,
 *   ToolExecutionResult
 * } from './tool-orchestrator';
 *
 * // Select best tool for task
 * const selector = ToolSelector.getInstance();
 * const tools = await selector.selectTools('scrape website');
 *
 * // Execute tool operation
 * const executor = ToolExecutor.getInstance();
 * const result = await executor.execute({
 *   toolId: tools[0].tool.id,
 *   operation: 'scrape',
 *   params: { url: 'https://example.com' }
 * });
 * ```
 *
 * @layer Chemistry (Transformation)
 * @version 29.1.0
 * @author QAntum Empire
 * @license Proprietary
 *
 * @see {@link ToolRegistry} - Tool registration and discovery
 * @see {@link ToolSelector} - Intelligent tool selection
 * @see {@link ToolExecutor} - Secure tool execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolExecutor = exports.ToolExecutor = exports.getToolSelector = exports.ToolSelector = exports.getToolRegistry = exports.ToolRegistry = exports.MCP_TOOL_IDS = void 0;
exports.quickExecute = quickExecute;
exports.getToolsByCategory = getToolsByCategory;
exports.checkAllToolsHealth = checkAllToolsHealth;
// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var types_1 = require("./types");
Object.defineProperty(exports, "MCP_TOOL_IDS", { enumerable: true, get: function () { return types_1.MCP_TOOL_IDS; } });
// ═══════════════════════════════════════════════════════════════════════════════
// CLASS EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var ToolRegistry_1 = require("./ToolRegistry");
Object.defineProperty(exports, "ToolRegistry", { enumerable: true, get: function () { return ToolRegistry_1.ToolRegistry; } });
Object.defineProperty(exports, "getToolRegistry", { enumerable: true, get: function () { return ToolRegistry_1.getToolRegistry; } });
var ToolSelector_1 = require("./ToolSelector");
Object.defineProperty(exports, "ToolSelector", { enumerable: true, get: function () { return ToolSelector_1.ToolSelector; } });
Object.defineProperty(exports, "getToolSelector", { enumerable: true, get: function () { return ToolSelector_1.getToolSelector; } });
var ToolExecutor_1 = require("./ToolExecutor");
Object.defineProperty(exports, "ToolExecutor", { enumerable: true, get: function () { return ToolExecutor_1.ToolExecutor; } });
Object.defineProperty(exports, "getToolExecutor", { enumerable: true, get: function () { return ToolExecutor_1.getToolExecutor; } });
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const ToolRegistry_2 = require("./ToolRegistry");
const ToolSelector_2 = require("./ToolSelector");
const ToolExecutor_2 = require("./ToolExecutor");
/**
 * Quick tool execution - selects best tool and executes in one call.
 *
 * @param task - Natural language task description
 * @param params - Parameters to pass to the tool
 * @param timeout - Optional timeout in milliseconds
 * @returns Execution result
 *
 * @example
 * ```typescript
 * const result = await quickExecute(
 *   'scrape product prices',
 *   { url: 'https://amazon.com/dp/B09...' }
 * );
 * ```
 */
async function quickExecute(task, params, timeout) {
    const selector = ToolSelector_2.ToolSelector.getInstance();
    const executor = ToolExecutor_2.ToolExecutor.getInstance();
    // Select best tool
    const suggestions = await selector.selectTools(task, 1);
    if (suggestions.length === 0) {
        return {
            success: false,
            error: {
                code: 'NO_TOOL_FOUND',
                message: `No suitable tool found for task: ${task}`,
            },
            metadata: {
                toolId: 'unknown',
                operation: 'unknown',
                startTime: new Date(),
                endTime: new Date(),
                latencyMs: 0,
                retryCount: 0,
            },
        };
    }
    const bestTool = suggestions[0].tool;
    const bestOperation = suggestions[0].operation?.name || 'default';
    // Execute
    return executor.execute({
        toolId: bestTool.id,
        operation: bestOperation,
        params,
        timeout,
    });
}
/**
 * Get all available tools grouped by category.
 *
 * @returns Tools grouped by category
 *
 * @example
 * ```typescript
 * const grouped = getToolsByCategory();
 * console.log(grouped['browser-automation']);
 * // [{ id: 'control-chrome', ... }, { id: 'kapture', ... }]
 * ```
 */
function getToolsByCategory() {
    const registry = ToolRegistry_2.ToolRegistry.getInstance();
    const tools = registry.getAllTools();
    const grouped = {};
    for (const tool of tools) {
        if (!grouped[tool.category]) {
            grouped[tool.category] = [];
        }
        grouped[tool.category].push(tool);
    }
    return grouped;
}
/**
 * Check health of all registered tools.
 *
 * @returns Health status for each tool
 *
 * @example
 * ```typescript
 * const health = await checkAllToolsHealth();
 * for (const [toolId, status] of Object.entries(health)) {
 *   console.log(`${toolId}: ${status.healthy ? '✅' : '❌'}`);
 * }
 * ```
 */
async function checkAllToolsHealth() {
    const registry = ToolRegistry_2.ToolRegistry.getInstance();
    const tools = registry.getAllTools();
    const results = {};
    await Promise.all(tools.map(async (tool) => {
        try {
            const health = await registry.healthCheck(tool.id);
            results[tool.id] = {
                healthy: health.healthy,
                latencyMs: health.latencyMs,
            };
        }
        catch (error) {
            results[tool.id] = {
                healthy: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }));
    return results;
}
