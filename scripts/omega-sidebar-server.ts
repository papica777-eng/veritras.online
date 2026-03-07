/**
 * omega-sidebar-server — Qantum Module
 * @module omega-sidebar-server
 * @path scripts/omega-sidebar-server.ts
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env npx tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * OMEGA SIDEBAR STANDALONE SERVER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Run this script to start the Omega IDE Bridge server without VS Code.
 * Useful for testing or connecting from external tools.
 * 
 * Usage:
 *   npx tsx scripts/omega-sidebar-server.ts
 *   npx tsx scripts/omega-sidebar-server.ts --port 3849
 * 
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 30.4.0 - THE SOVEREIGN SIDEBAR
 */

import { OmegaServer } from '../src/ide/OmegaServer';
import { OmegaNexus } from '../src/omega/OmegaNexus';

// Parse args
const args = process.argv.slice(2);
const portArg = args.find(a => a.startsWith('--port='))?.split('=')[1] ||
                (args.includes('--port') ? args[args.indexOf('--port') + 1] : null);
const port = portArg ? parseInt(portArg) : 3848;

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 OMEGA SIDEBAR STANDALONE SERVER 🚀                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);

  // Initialize Nexus (optional but recommended)
  const nexus = OmegaNexus.getInstance();
  
  // Optionally awaken for full functionality
  // await nexus.awaken({ ... });

  // Start server
  const server = OmegaServer.getInstance({ port });
  // SAFETY: async operation — wrap in try-catch for production resilience
  await server.start();

  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ✅ SERVER READY ✅                                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Test endpoints:                                                              ║
║                                                                               ║
║  curl -X GET http://localhost:${port}/status                                    ║
║                                                                               ║
║  curl -X POST http://localhost:${port}/ask \\                                   ║
║       -H "Content-Type: application/json" \\                                  ║
║       -d '{"prompt":"Explain this code","file":"./src/app.ts"}'               ║
║                                                                               ║
║  curl -X POST http://localhost:${port}/heal \\                                  ║
║       -H "Content-Type: application/json" \\                                  ║
║       -d '{"file":"./src/buggy.ts"}'                                          ║
║                                                                               ║
║  curl -X POST http://localhost:${port}/swap \\                                  ║
║       -H "Content-Type: application/json" \\                                  ║
║       -d '{"prompt":"Continue where Claude left off"}'                        ║
║                                                                               ║
║  Press Ctrl+C to stop.                                                        ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);

  // Keep running
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    server.stop();
    process.exit(0);
  });
}

    // Complexity: O(1)
main().catch(console.error);
