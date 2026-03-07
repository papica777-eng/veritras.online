"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     🎮 QANTUM CONTROL PANEL - MANUAL COMMAND CENTER              ║
 * ║     "В QAntum не лъжем. Само истински стойности."                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║     @author Димитър Продромов                                    ║
 * ║     @version 1.0.0                                               ║
 * ║     @date 31 December 2025                                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const child_process_1 = require("child_process");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════
const state = {
    ghost: { active: false, sessions: 0, lastAction: 'idle' },
    oracle: { active: false, scansRunning: 0, targetsQueue: [] },
    swarm: { workers: 0, active: 0, taskQueue: 0 },
    tests: { running: false, passed: 0, failed: 0, total: 958 },
    dashboard: { port: 9999, active: true }
};
const commandLog = [];
let activeProcesses = new Map();
// ═══════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════
const getLocalIP = () => {
    const interfaces = os_1.default.networkInterfaces();
    for (const [, addrs] of Object.entries(interfaces)) {
        for (const addr of addrs || []) {
            if (addr.family === 'IPv4' && !addr.internal)
                return addr.address;
        }
    }
    return '127.0.0.1';
};
const log = (cmd, result) => {
    const entry = { time: new Date().toISOString().slice(11, 19), cmd, result };
    commandLog.unshift(entry);
    if (commandLog.length > 50)
        commandLog.pop();
    console.log(`[${entry.time}] ${cmd}: ${result}`);
};
// ═══════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════
async function executeCommand(cmd, args = []) {
    const start = Date.now();
    return new Promise((resolve) => {
        const proc = (0, child_process_1.spawn)(cmd, args, {
            shell: true,
            cwd: 'C:\\QAntumQATool',
            env: { ...process.env, FORCE_COLOR: '0' }
        });
        let output = '';
        let error = '';
        proc.stdout?.on('data', (data) => { output += data.toString(); });
        proc.stderr?.on('data', (data) => { error += data.toString(); });
        proc.on('close', (code) => {
            resolve({
                success: code === 0,
                output: output.slice(0, 5000),
                error: error.slice(0, 1000),
                duration: Date.now() - start
            });
        });
        setTimeout(() => {
            proc.kill();
            resolve({ success: false, output, error: 'Timeout after 60s', duration: 60000 });
        }, 60000);
    });
}
// ═══════════════════════════════════════════════════════════════════
// API HANDLERS
// ═══════════════════════════════════════════════════════════════════
const handlers = {
    // 👻 GHOST PROTOCOL
    async 'ghost/start'(body) {
        state.ghost.active = true;
        state.ghost.lastAction = 'starting';
        log('GHOST', 'Starting Ghost Protocol...');
        const result = await executeCommand('npx', ['tsx', 'examples/ghost-demo.ts']);
        state.ghost.sessions++;
        state.ghost.lastAction = result.success ? 'completed' : 'failed';
        return { success: result.success, output: result.output, duration: result.duration };
    },
    async 'ghost/stealth-browse'(body) {
        const { url } = body;
        if (!url)
            return { success: false, error: 'URL required' };
        state.ghost.active = true;
        state.ghost.lastAction = `browsing: ${url}`;
        log('GHOST', `Stealth browsing to ${url}`);
        // Create temp script for custom URL
        const script = `
import { chromium } from 'playwright';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms + Math.random() * ms * 0.3));

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  await page.goto('${url}');
  console.log('✅ Loaded: ${url}');
  
  // Human-like scrolling
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 300 + Math.random() * 200);
    await sleep(800);
  }
  
  await sleep(3000);
  await browser.close();
  console.log('✅ Ghost session complete');
})();
`;
        fs_1.default.writeFileSync('C:\\QAntumQATool\\temp-ghost.ts', script);
        const result = await executeCommand('npx', ['tsx', 'temp-ghost.ts']);
        fs_1.default.unlinkSync('C:\\QAntumQATool\\temp-ghost.ts');
        state.ghost.sessions++;
        return { success: result.success, output: result.output };
    },
    // 🔮 ORACLE - AUTONOMOUS SCANNER
    async 'oracle/scan'(body) {
        const { target } = body;
        if (!target)
            return { success: false, error: 'Target URL required' };
        state.oracle.active = true;
        state.oracle.scansRunning++;
        state.oracle.targetsQueue.push(target);
        log('ORACLE', `Scanning: ${target}`);
        // Quick audit using existing QAntum
        const script = `
const { QAntum } = require('./dist');
(async () => {
  try {
    const result = await QAntum.audit('${target}');
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Scan failed:', e.message);
  }
})();
`;
        fs_1.default.writeFileSync('C:\\QAntumQATool\\temp-scan.js', script);
        const result = await executeCommand('node', ['temp-scan.js']);
        fs_1.default.unlinkSync('C:\\QAntumQATool\\temp-scan.js');
        state.oracle.scansRunning--;
        state.oracle.targetsQueue = state.oracle.targetsQueue.filter(t => t !== target);
        return { success: result.success, output: result.output, target };
    },
    // 🧪 TESTS
    async 'tests/run'(body) {
        const { suite } = body;
        state.tests.running = true;
        log('TESTS', suite ? `Running suite: ${suite}` : 'Running all tests');
        const args = suite ? ['test', '--', '--grep', suite] : ['test'];
        const result = await executeCommand('npm', args);
        // Parse results
        const passMatch = result.output.match(/(\d+) passing/);
        const failMatch = result.output.match(/(\d+) failing/);
        state.tests.passed = passMatch ? parseInt(passMatch[1]) : 0;
        state.tests.failed = failMatch ? parseInt(failMatch[1]) : 0;
        state.tests.running = false;
        return {
            success: result.success,
            passed: state.tests.passed,
            failed: state.tests.failed,
            output: result.output.slice(-3000)
        };
    },
    async 'tests/quick'(body) {
        state.tests.running = true;
        log('TESTS', 'Quick test (core only)');
        const result = await executeCommand('npx', ['vitest', 'run', 'tests/core.test.ts', '--reporter=verbose']);
        state.tests.running = false;
        return { success: result.success, output: result.output };
    },
    // 📊 SYSTEM
    async 'system/status'() {
        return {
            state,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            commandLog: commandLog.slice(0, 20)
        };
    },
    async 'system/compile'() {
        log('SYSTEM', 'TypeScript compile check');
        const result = await executeCommand('npx', ['tsc', '--noEmit']);
        return { success: result.success, errors: result.error || result.output };
    },
    async 'system/build'() {
        log('SYSTEM', 'Building project');
        const result = await executeCommand('npm', ['run', 'build']);
        return { success: result.success, output: result.output };
    },
    // 🌐 BROWSER ACTIONS
    async 'browser/open'(body) {
        const { url } = body;
        if (!url)
            return { success: false, error: 'URL required' };
        log('BROWSER', `Opening: ${url}`);
        await executeCommand('start', [url]);
        return { success: true };
    },
    async 'browser/screenshot'(body) {
        const { url, filename } = body;
        if (!url)
            return { success: false, error: 'URL required' };
        const script = `
import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('${url}');
  await page.screenshot({ path: 'evidence/${filename || 'screenshot'}.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved');
})();
`;
        fs_1.default.writeFileSync('C:\\QAntumQATool\\temp-screenshot.ts', script);
        const result = await executeCommand('npx', ['tsx', 'temp-screenshot.ts']);
        fs_1.default.unlinkSync('C:\\QAntumQATool\\temp-screenshot.ts');
        return { success: result.success, file: `evidence/${filename || 'screenshot'}.png` };
    },
    // 🎭 CUSTOM COMMAND
    async 'custom/run'(body) {
        const { command } = body;
        if (!command)
            return { success: false, error: 'Command required' };
        log('CUSTOM', command);
        const result = await executeCommand(command);
        return { success: result.success, output: result.output, error: result.error };
    }
};
// ═══════════════════════════════════════════════════════════════════
// HTML INTERFACE
// ═══════════════════════════════════════════════════════════════════
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎮 QAntum Control Panel</title>
  <style>
    :root{--bg:#0a0a0f;--card:#1a1a2e;--txt:#fff;--txt2:#8888aa;--blue:#00d4ff;--green:#00ff88;--purple:#aa55ff;--orange:#ff8844;--red:#ff4444;--border:#2a2a3e}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;padding:20px}
    
    .header{text-align:center;margin-bottom:30px;padding:30px;background:linear-gradient(135deg,#1a1a2e,#2a1a3e);border-radius:16px;border:1px solid var(--purple)}
    .header h1{font-size:36px;background:linear-gradient(90deg,var(--blue),var(--purple),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px}
    .header .motto{color:var(--txt2);font-style:italic}
    
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:20px}
    
    .panel{background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)}
    .panel-title{display:flex;align-items:center;gap:10px;font-size:18px;margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid var(--border)}
    .panel-title .icon{font-size:24px}
    
    .btn{padding:12px 20px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;margin:5px}
    .btn:hover{transform:translateY(-2px);box-shadow:0 4px 15px rgba(0,0,0,0.3)}
    .btn:active{transform:translateY(0)}
    .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
    
    .btn-ghost{background:linear-gradient(135deg,#4a1a6e,#2a1a4e);color:var(--purple)}
    .btn-oracle{background:linear-gradient(135deg,#1a4a3e,#1a2a2e);color:var(--green)}
    .btn-test{background:linear-gradient(135deg,#1a3a5e,#1a2a3e);color:var(--blue)}
    .btn-danger{background:linear-gradient(135deg,#4a1a1a,#2a1a1a);color:var(--red)}
    .btn-system{background:linear-gradient(135deg,#3a3a1a,#2a2a1a);color:var(--orange)}
    
    .input{width:100%;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--txt);font-size:14px;margin-bottom:10px}
    .input:focus{outline:none;border-color:var(--blue)}
    
    .status{display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg);border-radius:8px;margin:10px 0}
    .status .dot{width:10px;height:10px;border-radius:50%}
    .status .dot.on{background:var(--green);box-shadow:0 0 10px var(--green)}
    .status .dot.off{background:var(--red)}
    .status .dot.busy{background:var(--orange);animation:blink 1s infinite}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
    
    .output{background:#0d0d12;border-radius:8px;padding:15px;font-family:'Consolas',monospace;font-size:12px;max-height:300px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;margin-top:15px;border:1px solid var(--border)}
    .output:empty::before{content:'Output will appear here...';color:var(--txt2)}
    
    .log{max-height:400px;overflow-y:auto}
    .log-entry{display:flex;gap:10px;padding:8px;border-bottom:1px solid var(--border);font-size:12px}
    .log-entry .time{color:var(--txt2);font-family:monospace}
    .log-entry .cmd{color:var(--blue);font-weight:bold}
    
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:15px}
    .stat{background:var(--bg);padding:15px;border-radius:8px;text-align:center}
    .stat .value{font-size:24px;font-weight:bold;color:var(--blue)}
    .stat .label{font-size:11px;color:var(--txt2);margin-top:5px}
    
    .actions{display:flex;flex-wrap:wrap;gap:5px}
    
    @media(max-width:900px){.grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}}
  </style>
</head>
<body>
  <header class="header">
    <h1>🎮 QAntum Control Panel</h1>
    <p class="motto">"В QAntum не лъжем. Само истински стойности."</p>
  </header>

  <div class="grid">
    <!-- GHOST PROTOCOL -->
    <div class="panel">
      <div class="panel-title"><span class="icon">👻</span> Ghost Protocol</div>
      <div class="status">
        <div class="dot" id="ghost-status"></div>
        <span id="ghost-state">Idle</span>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" onclick="api('ghost/start')">🚀 Launch Demo</button>
        <button class="btn btn-ghost" onclick="ghostBrowse()">🌐 Stealth Browse</button>
      </div>
      <input class="input" id="ghost-url" placeholder="URL for stealth browsing..." value="https://www.cloudflare.com">
      <div class="output" id="ghost-output"></div>
    </div>

    <!-- ORACLE SCANNER -->
    <div class="panel">
      <div class="panel-title"><span class="icon">🔮</span> Oracle Scanner</div>
      <div class="status">
        <div class="dot" id="oracle-status"></div>
        <span id="oracle-state">Ready</span>
      </div>
      <input class="input" id="scan-target" placeholder="Target URL to scan..." value="https://example.com">
      <div class="actions">
        <button class="btn btn-oracle" onclick="oracleScan()">🔍 Scan Target</button>
        <button class="btn btn-oracle" onclick="api('browser/screenshot',{url:$('#scan-target').value,filename:'oracle-'+Date.now()})">📸 Screenshot</button>
      </div>
      <div class="output" id="oracle-output"></div>
    </div>

    <!-- TESTS -->
    <div class="panel">
      <div class="panel-title"><span class="icon">🧪</span> Test Runner</div>
      <div class="status">
        <div class="dot" id="test-status"></div>
        <span id="test-state">958 tests ready</span>
      </div>
      <div class="stats">
        <div class="stat"><div class="value" id="test-passed">0</div><div class="label">PASSED</div></div>
        <div class="stat"><div class="value" id="test-failed" style="color:var(--red)">0</div><div class="label">FAILED</div></div>
        <div class="stat"><div class="value" id="test-total">958</div><div class="label">TOTAL</div></div>
        <div class="stat"><div class="value" id="test-time">--</div><div class="label">TIME</div></div>
      </div>
      <div class="actions">
        <button class="btn btn-test" onclick="runTests()">▶️ Run All Tests</button>
        <button class="btn btn-test" onclick="api('tests/quick')">⚡ Quick Test</button>
      </div>
      <input class="input" id="test-suite" placeholder="Filter by suite name (optional)...">
      <div class="output" id="test-output"></div>
    </div>

    <!-- SYSTEM -->
    <div class="panel">
      <div class="panel-title"><span class="icon">⚙️</span> System Control</div>
      <div class="actions">
        <button class="btn btn-system" onclick="api('system/compile')">🔨 Compile Check</button>
        <button class="btn btn-system" onclick="api('system/build')">📦 Build</button>
        <button class="btn btn-system" onclick="api('system/status')">📊 Status</button>
        <button class="btn btn-danger" onclick="location.reload()">🔄 Refresh</button>
      </div>
      <div class="output" id="system-output"></div>
    </div>

    <!-- CUSTOM COMMAND -->
    <div class="panel">
      <div class="panel-title"><span class="icon">💻</span> Custom Command</div>
      <input class="input" id="custom-cmd" placeholder="Enter any command..." onkeypress="if(event.key==='Enter')runCustom()">
      <div class="actions">
        <button class="btn btn-system" onclick="runCustom()">▶️ Execute</button>
        <button class="btn btn-system" onclick="$('#custom-cmd').value='npx tsx'">TSX</button>
        <button class="btn btn-system" onclick="$('#custom-cmd').value='npm run'">NPM</button>
        <button class="btn btn-system" onclick="$('#custom-cmd').value='git status'">Git</button>
      </div>
      <div class="output" id="custom-output"></div>
    </div>

    <!-- COMMAND LOG -->
    <div class="panel">
      <div class="panel-title"><span class="icon">📜</span> Command Log</div>
      <div class="log" id="log"></div>
    </div>
  </div>

  <script>
    const $=s=>document.querySelector(s);
    const $$=s=>document.querySelectorAll(s);
    
    async function api(endpoint, body = {}) {
      const output = $('#' + endpoint.split('/')[0] + '-output') || $('#system-output');
      output.textContent = '⏳ Executing...';
      
      try {
        const res = await fetch('/api/' + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        
        output.textContent = data.output || JSON.stringify(data, null, 2);
        updateStatus();
        return data;
      } catch (e) {
        output.textContent = '❌ Error: ' + e.message;
      }
    }
    
    function ghostBrowse() {
      api('ghost/stealth-browse', { url: $('#ghost-url').value });
    }
    
    function oracleScan() {
      api('oracle/scan', { target: $('#scan-target').value });
    }
    
    async function runTests() {
      const suite = $('#test-suite').value;
      const start = Date.now();
      const data = await api('tests/run', suite ? { suite } : {});
      
      if (data) {
        $('#test-passed').textContent = data.passed || 0;
        $('#test-failed').textContent = data.failed || 0;
        $('#test-time').textContent = Math.round((Date.now() - start) / 1000) + 's';
      }
    }
    
    function runCustom() {
      api('custom/run', { command: $('#custom-cmd').value });
    }
    
    async function updateStatus() {
      try {
        const res = await fetch('/api/system/status', { method: 'POST' });
        const data = await res.json();
        const s = data.state;
        
        // Ghost
        $('#ghost-status').className = 'dot ' + (s.ghost.active ? 'busy' : 'on');
        $('#ghost-state').textContent = s.ghost.lastAction + ' (' + s.ghost.sessions + ' sessions)';
        
        // Oracle
        $('#oracle-status').className = 'dot ' + (s.oracle.scansRunning > 0 ? 'busy' : 'on');
        $('#oracle-state').textContent = s.oracle.scansRunning > 0 ? 'Scanning...' : 'Ready';
        
        // Tests
        $('#test-status').className = 'dot ' + (s.tests.running ? 'busy' : 'on');
        $('#test-state').textContent = s.tests.running ? 'Running...' : s.tests.total + ' tests ready';
        
        // Log
        $('#log').innerHTML = data.commandLog.map(e => 
          '<div class="log-entry"><span class="time">' + e.time + '</span><span class="cmd">' + e.cmd + '</span><span>' + e.result + '</span></div>'
        ).join('');
        
      } catch (e) {}
    }
    
    updateStatus();
    setInterval(updateStatus, 3000);
  </script>
</body>
</html>`;
// ═══════════════════════════════════════════════════════════════════
// SERVER
// ═══════════════════════════════════════════════════════════════════
const server = http_1.default.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    // Serve HTML
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    }
    // API endpoints
    if (req.url?.startsWith('/api/') && req.method === 'POST') {
        const endpoint = req.url.replace('/api/', '');
        let body = {};
        try {
            const chunks = [];
            for await (const chunk of req)
                chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString();
            if (raw)
                body = JSON.parse(raw);
        }
        catch { }
        const handler = handlers[endpoint];
        if (handler) {
            try {
                const result = await handler(body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unknown endpoint' }));
        }
        return;
    }
    res.writeHead(404);
    res.end('Not Found');
});
// ═══════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════
const PORT = 9999;
const ip = getLocalIP();
server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║     🎮 QANTUM CONTROL PANEL - MANUAL COMMAND CENTER              ║');
    console.log('║     "В QAntum не лъжем. Само истински стойности."                ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║                                                                  ║');
    console.log('║   Control Panel is LIVE!                                         ║');
    console.log('║                                                                  ║');
    console.log(`║   📍 Local:     http://localhost:${PORT}                            ║`);
    console.log(`║   📍 Network:   http://${ip}:${PORT}                           ║`);
    console.log('║                                                                  ║');
    console.log('║   MODULES:                                                       ║');
    console.log('║   👻 Ghost Protocol  - Stealth browser automation                ║');
    console.log('║   🔮 Oracle Scanner  - Target analysis                           ║');
    console.log('║   🧪 Test Runner     - 958 tests ready                           ║');
    console.log('║   ⚙️  System Control  - Build, compile, status                    ║');
    console.log('║   💻 Custom Command  - Execute anything                          ║');
    console.log('║                                                                  ║');
    console.log('║   Press Ctrl+C to stop                                           ║');
    console.log('║                                                                  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
});
