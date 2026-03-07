/**
 * vite.config — Qantum Module
 * @module vite.config
 * @path src/departments/biology/noetic-interface/vite.config.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
