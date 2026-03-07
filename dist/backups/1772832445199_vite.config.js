"use strict";
/**
 * vite.config — Qantum Module
 * @module vite.config
 * @path src/departments/biology/noetic-interface/vite.config.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8890',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});
