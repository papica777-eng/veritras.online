import http from 'http';
import { exec } from 'child_process';
import url from 'url';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';

dotenv.config();

/**
 * 🛰️ JULES BRIDGE v2.2.3 - NEURAL HYBRID
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSy_PLACEHOLDER');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTTP_PORT = 8888;
const ROOT_DIR = path.resolve(__dirname, '../../');

async function initMCP() {
    if (!process.argv.includes('--mcp')) return;
    try {
        const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
        const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
        const { CallToolRequestSchema, ListToolsRequestSchema } = await import("@modelcontextprotocol/sdk/types.js");

        const mcpServer = new Server({ name: "qantum-jules-server", version: "1.0.4" }, { capabilities: { tools: {} } });
        mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [{ name: "execute_vortex_command", description: "Execute a command.", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } }]
        }));
        mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
            const command = String(request.params.arguments?.command);
            return new Promise((resolve) => {
                exec(`cmd /c "${command}"`, (error, stdout, stderr) => {
                    resolve({ content: [{ type: "text", text: (stdout || "") + (stderr || "") || "Success" }], isError: !!error });
                });
            });
        });
        const transport = new StdioServerTransport();
        await mcpServer.connect(transport);
        console.error("[JULES-MCP] Interface: ACTIVE");
    } catch (e: any) { console.error(`[JULES-MCP] Error: ${e.message}`); }
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    const parsedUrl = url.parse(req.url || '', true);
    const pathname = decodeURIComponent(parsedUrl.pathname || '/');

    // API: CHAT (The JULES Intelligence)
    if (pathname === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                console.log(`[JULES-CHAT] ${message}`);

                // Use Gemini if key is valid, otherwise simulate
                let response = "";
                const key = process.env.GEMINI_API_KEY;
                if (key && !key.includes('REPLACE_ME')) {
                    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                    const result = await model.generateContent(message);
                    response = result.response.text();
                } else {
                    response = `[SIMULATION_MODE] Hello Architect Prodromov. I am JULES. Currently operating on neural-placeholder logic because GEMINI_API_KEY is not configured in .env. Your system entropy is 0.00. How shall we proceed with the interview?`;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response }));
            } catch (e) {
                res.writeHead(500); res.end(JSON.stringify({ error: 'Neural friction detected.' }));
            }
        });
        return;
    }

    // API: TELEMETRY
    if (pathname === '/api/telemetry') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            entropy: (Math.random() * 0.01).toFixed(4),
            stability: (0.99 + Math.random() * 0.01).toFixed(2),
            nodes: 1244 + Math.floor(Math.random() * 10)
        }));
        return;
    }

    // API: EXECUTE
    if (pathname === '/api/execute' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { command } = JSON.parse(body);
                exec(`cmd /c "${command}"`, (error, stdout, stderr) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: !error, stdout, stderr }));
                });
            } catch (e) { res.writeHead(400); res.end(); }
        });
        return;
    }

    // SMART FILE SERVER
    let fileName = pathname === '/' ? 'ARCHITECT_COMMAND_CENTER.html' : pathname.replace(/^\/+/, '');
    let filePath = path.join(ROOT_DIR, fileName);

    // If not found in root, check in public/
    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
        filePath = path.join(ROOT_DIR, 'public', fileName);
        // If still not found and doesn't have public prefix, try with it
        if (!fs.existsSync(filePath)) {
            filePath = path.join(ROOT_DIR, fileName.startsWith('public') ? fileName : path.join('public', fileName));
        }
    }

    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimes: any = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
        res.writeHead(200, { 'Content-Type': mimes[ext] || 'text/plain' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        console.error(`[404] Resource not found: ${pathname} -> Tried: ${filePath}`);
        res.writeHead(404);
        res.end('404 Not Found - Path: ' + pathname);
    }
});

server.listen(HTTP_PORT, () => {
    console.error(`[JULES-BRIDGE] Sovereign HTTP Bridge: ONLINE at http://localhost:${HTTP_PORT}`);
});

initMCP();
