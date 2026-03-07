"use strict";
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
exports.DynamicLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url_1 = require("url");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM DYNAMIC LOADER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dynamically discovers and loads TypeScript modules across the project.
 * Useful for the Singularity engine to load capabilities without hardcoded paths.
 */
const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage', 'out', '.venv', '__pycache__']);
class DynamicLoader {
    /**
     * Searches for all files matching the export name in the project.
     */
    static findModuleFiles(exportName, root = process.cwd(), maxDepth = 10) {
        const target = exportName.replace(/[-_\s]/g, '').toLowerCase();
        const out = [];
        function scan(dir, depth) {
            if (depth > maxDepth)
                return;
            try {
                for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                    const full = path.join(dir, e.name);
                    if (e.isDirectory()) {
                        if (!SKIP.has(e.name))
                            scan(full, depth + 1);
                    }
                    else if (e.isFile() &&
                        e.name.endsWith('.ts') &&
                        !e.name.endsWith('.d.ts') &&
                        e.name.toLowerCase().replace(/[-_.]/g, '').includes(target)) {
                        out.push(full);
                    }
                }
            }
            catch { }
        }
        scan(root, 0);
        return out;
    }
    /**
     * Loads a module by searching the project and trying known paths.
     */
    static async loadModule(exportName, knownPaths = []) {
        const found = this.findModuleFiles(exportName);
        const known = knownPaths.map((p) => path.resolve(process.cwd(), p));
        const pathsToTry = found.length ? [...found, ...known] : known;
        for (const modPath of pathsToTry) {
            try {
                const importPath = path.isAbsolute(modPath) ? (0, url_1.pathToFileURL)(modPath).href : modPath;
                const mod = await Promise.resolve(`${importPath}`).then(s => __importStar(require(s)));
                return (mod[exportName] ?? mod.default);
            }
            catch (err) {
                // Silently fail and try the next path
            }
        }
        return null;
    }
}
exports.DynamicLoader = DynamicLoader;
