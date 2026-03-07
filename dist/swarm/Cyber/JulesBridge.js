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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const child_process_1 = require("child_process");
const url_1 = __importDefault(require("url"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const url_2 = require("url");
dotenv_1.default.config();
/**
 * 🛰️ JULES BRIDGE v2.2.3 - NEURAL HYBRID
 */
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSy_PLACEHOLDER');
const __filename = (0, url_2.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const HTTP_PORT = 8888;
const ROOT_DIR = path_1.default.resolve(__dirname, '../../');
async function initMCP() {
    if (!process.argv.includes('--mcp'))
        return;
    try {
        const { Server } = await Promise.resolve().then(() => __importStar(require("@modelcontextprotocol/sdk/server/index.js")));
        const { StdioServerTransport } = await Promise.resolve().then(() => __importStar(require("@modelcontextprotocol/sdk/server/stdio.js")));
        const { CallToolRequestSchema, ListToolsRequestSchema } = await Promise.resolve().then(() => __importStar(require("@modelcontextprotocol/sdk/types.js")));
        const mcpServer = new Server({ name: "qantum-jules-server", version: "1.0.4" }, { capabilities: { tools: {} } });
        mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [{ name: "execute_vortex_command", description: "Execute a command.", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } }]
        }));
        mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
            const command = String(request.params.arguments?.command);
            return new Promise((resolve) => {
                (0, child_process_1.exec)(`cmd /c "${command}"`, (error, stdout, stderr) => {
                    resolve({ content: [{ type: "text", text: (stdout || "") + (stderr || "") || "Success" }], isError: !!error });
                });
            });
        });
        const transport = new StdioServerTransport();
        await mcpServer.connect(transport);
        console.error("[JULES-MCP] Interface: ACTIVE");
    }
    catch (e) {
        console.error(`[JULES-MCP] Error: ${e.message}`);
    }
}
const server = http_1.default.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    const parsedUrl = url_1.default.parse(req.url || '', true);
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
                }
                else {
                    response = `[SIMULATION_MODE] Hello Architect Prodromov. I am JULES. Currently operating on neural-placeholder logic because GEMINI_API_KEY is not configured in .env. Your system entropy is 0.00. How shall we proceed with the interview?`;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response }));
            }
            catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Neural friction detected.' }));
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
                (0, child_process_1.exec)(`cmd /c "${command}"`, (error, stdout, stderr) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: !error, stdout, stderr }));
                });
            }
            catch (e) {
                res.writeHead(400);
                res.end();
            }
        });
        return;
    }
    // SMART FILE SERVER
    let fileName = pathname === '/' ? 'ARCHITECT_COMMAND_CENTER.html' : pathname.replace(/^\/+/, '');
    let filePath = path_1.default.join(ROOT_DIR, fileName);
    // If not found in root, check in public/
    if (!fs_1.default.existsSync(filePath) || !fs_1.default.lstatSync(filePath).isFile()) {
        filePath = path_1.default.join(ROOT_DIR, 'public', fileName);
        // If still not found and doesn't have public prefix, try with it
        if (!fs_1.default.existsSync(filePath)) {
            filePath = path_1.default.join(ROOT_DIR, fileName.startsWith('public') ? fileName : path_1.default.join('public', fileName));
        }
    }
    if (fs_1.default.existsSync(filePath) && fs_1.default.lstatSync(filePath).isFile()) {
        const ext = path_1.default.extname(filePath);
        const mimes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
        res.writeHead(200, { 'Content-Type': mimes[ext] || 'text/plain' });
        fs_1.default.createReadStream(filePath).pipe(res);
    }
    else {
        console.error(`[404] Resource not found: ${pathname} -> Tried: ${filePath}`);
        res.writeHead(404);
        res.end('404 Not Found - Path: ' + pathname);
    }
});
server.listen(HTTP_PORT, () => {
    console.error(`[JULES-BRIDGE] Sovereign HTTP Bridge: ONLINE at http://localhost:${HTTP_PORT}`);
});
initMCP();
