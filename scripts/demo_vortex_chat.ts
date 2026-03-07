/**
 * demo_vortex_chat — Qantum Module
 * @module demo_vortex_chat
 * @path scripts/demo_vortex_chat.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { vortex } from '../src/core/sys/VortexAI';
import { neuralEngine } from './qantum/SaaS-Framework/scripts/physics/NeuralInference';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.clear();
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🌪️ VORTEX INTERACTIVE CHAT - GEMINI BRAIN EDITION                        ║
║                                                                           ║
║  Type your questions in Bulgarian or English                             ║
║  Type 'exit' to quit                                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);

    // Start Vortex Core
    console.log('⚡ Initializing Vortex Core...\n');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await vortex.start();

    console.log('\n✅ Vortex is ONLINE. You can now chat.\n');

    const chat = () => {
        rl.question('You: ', async (input) => {
            const question = input.trim();

            if (question.toLowerCase() === 'exit') {
                console.log('\n👋 Shutting down Vortex...');
                vortex.stop();
                rl.close();
                process.exit(0);
            }

            if (!question) {
                // Complexity: O(1)
                chat();
                return;
            }

            try {
                console.log('\n🧠 Vortex is thinking...\n');
                const startTime = Date.now();

                const response = await neuralEngine.infer(question);

                const elapsed = Date.now() - startTime;

                if (response) {
                    console.log(`\x1b[36mVortex:\x1b[0m ${response}\n`);
                    console.log(`\x1b[90m(Response time: ${elapsed}ms)\x1b[0m\n`);
                } else {
                    console.log('\x1b[31m❌ No response from AI. Check API keys.\x1b[0m\n');
                }
            } catch (error) {
                console.error('\x1b[31m❌ Error:\x1b[0m', error);
            }

            // Complexity: O(1)
            chat();
        });
    };

    // Complexity: O(1)
    chat();
}

    // Complexity: O(1)
main().catch(console.error);
