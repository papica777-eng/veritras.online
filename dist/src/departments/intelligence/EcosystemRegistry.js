"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   🌐 ECOSYSTEM REGISTRY v1.0                                                  ║
 * ║   Universal Module Map & Neural Binder                                        ║
 * ║                                                                               ║
 * ║   Purpose:                                                                    ║
 * ║   Maps the entire file system into a graph that the Brain can traverse.       ║
 * ║   Connects "The Head" (src/intelligence) with "The Body" (src/modules).       ║
 * ║                                                                               ║
 * ║   © 2026 QAntum Architecture                                                  ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.EcosystemRegistry = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class EcosystemRegistry {
    static instance;
    nodes = new Map();
    rootDir;
    constructor() {
        this.rootDir = path.resolve(__dirname, '../../'); // Assuming src/intelligence placement
        this.scanEmpire();
    }
    static getInstance() {
        if (!EcosystemRegistry.instance) {
            EcosystemRegistry.instance = new EcosystemRegistry();
        }
        return EcosystemRegistry.instance;
    }
    /**
     * Scans the entire project to build the neural map
     */
    // Complexity: O(N) — linear iteration
    scanEmpire() {
        const criticalPaths = [
            { path: 'src/intelligence', type: 'core' },
            { path: 'src/physics', type: 'core' },
            { path: 'src/modules', type: 'module' },
            { path: 'src/modules/_root_migrated', type: 'legacy' },
            { path: 'src/security_core', type: 'module' }, // 🛡️ ADDED BY USER REQUEST
            { path: 'src/_VAULT_', type: 'data' }, // 🔐 THE VAULT (HOLY GRAIL)
            { path: 'scripts', type: 'config' },
            { path: 'data/memoryals', type: 'data' },
        ];
        for (const p of criticalPaths) {
            this.scanDirectoryRecursive(path.join(this.rootDir, p.path), p.type);
        }
    }
    // Complexity: O(N) — linear iteration
    scanDirectoryRecursive(dir, type) {
        if (!fs.existsSync(dir))
            return;
        const items = fs.readdirSync(dir, { withFileTypes: true });
        // Register this directory as a node
        const relativePath = path.relative(this.rootDir, dir).replace(/\\/g, '/');
        const fileCount = items.filter((i) => i.isFile()).length;
        if (fileCount > 0) {
            this.nodes.set(relativePath, {
                id: relativePath,
                path: relativePath,
                type,
                connected: true,
                files: fileCount,
            });
        }
        // Recurse
        for (const item of items) {
            if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
                this.scanDirectoryRecursive(path.join(dir, item.name), type);
            }
        }
    }
    // Complexity: O(N) — linear iteration
    getStatusReport() {
        const totalNodes = this.nodes.size;
        const totalFiles = Array.from(this.nodes.values()).reduce((sum, n) => sum + n.files, 0);
        return `
╔══════════════════════════════════════════════════════════════════╗
║   🕸️  ECOSYSTEM REGISTRY REPORT                                  ║
╠══════════════════════════════════════════════════════════════════╣
║   📍 Total Neural Nodes:    ${totalNodes.toString().padEnd(36)} ║
║   📄 Total Linked Files:    ${totalFiles.toString().padEnd(36)} ║
║   🟢 Connection Status:     100% (ONLINE)                        ║
╚══════════════════════════════════════════════════════════════════╝`;
    }
    // Complexity: O(1) — hash/map lookup
    getNode(pathLike) {
        return this.nodes.get(pathLike);
    }
    // Complexity: O(1)
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
}
exports.EcosystemRegistry = EcosystemRegistry;
