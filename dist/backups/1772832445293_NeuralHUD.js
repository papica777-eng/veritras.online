"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║              NEURAL HUD — GOD LOOP REAL-TIME DASHBOARD                       ║
 * ║                                                                               ║
 * ║  Streams brain waves from QAntum Singularity to the browser.                 ║
 * ║  Zero dependencies — built-in Node.js http + EventEmitter + SSE.             ║
 * ║                                                                               ║
 * ║  Open: http://localhost:3847                                                  ║
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
exports.NeuralHUD = void 0;
const http = __importStar(require("http"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL HUD CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class NeuralHUD extends events_1.EventEmitter {
    server = null;
    sseClients = new Set();
    waveBuffer = [];
    stats = {
        cycle: 0,
        targetsProcessed: 0,
        pitchesSent: 0,
        provider: { deepseek: 0, ollama: 0, local: 0 },
        uptime: 0,
        memoryMB: 0,
    };
    port;
    bufferSize;
    waveSeq = 0;
    constructor(port = 3847, bufferSize = 500) {
        super();
        this.port = port;
        this.bufferSize = bufferSize;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    async start() {
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, () => {
                console.log(`\n🧠 Neural HUD running → \x1b[36mhttp://localhost:${this.port}\x1b[0m\n`);
                // Complexity: O(1)
                resolve();
            });
            this.server.on('error', (e) => {
                if (e.code === 'EADDRINUSE') {
                    console.log(`⚠️  Neural HUD: port ${this.port} busy — skipping dashboard`);
                    // Complexity: O(1)
                    resolve(); // Non-fatal
                }
                else {
                    // Complexity: O(1)
                    reject(e);
                }
            });
        });
    }
    // Complexity: O(N) — linear iteration
    async stop() {
        for (const client of this.sseClients) {
            try {
                client.end();
            }
            catch { }
        }
        this.sseClients.clear();
        return new Promise(resolve => {
            if (this.server) {
                this.server.close(() => resolve());
            }
            else {
                // Complexity: O(1)
                resolve();
            }
        });
    }
    // ───────────────────────────────────────────────────────────────────────────
    // PUBLIC WAVE EMISSION API (call from God Loop)
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    wave(type, source, summary, details, confidence = 0.9, tags) {
        const w = {
            id: `w_${this.waveSeq++}_${Date.now()}`,
            timestamp: Date.now(),
            type, source, summary, details, confidence, tags,
        };
        this.waveBuffer.push(w);
        if (this.waveBuffer.length > this.bufferSize)
            this.waveBuffer.shift();
        this.broadcast('wave', w);
        this.emit('wave', w);
        return w;
    }
    /** Shortcuts */
    // Complexity: O(N) — potential recursive descent
    perception(source, summary, input) {
        return this.wave('perception', source, summary, input ? { input } : undefined, 1.0);
    }
    // Complexity: O(N) — potential recursive descent
    reasoning(source, summary, details) {
        return this.wave('reasoning', source, summary, details, 0.9);
    }
    // Complexity: O(N) — potential recursive descent
    decision(source, summary, chosen) {
        return this.wave('decision', source, summary, { chosen }, 0.85);
    }
    // Complexity: O(N) — potential recursive descent
    action(source, summary, output) {
        return this.wave('action', source, summary, output ? { output } : undefined, 1.0);
    }
    // Complexity: O(N) — potential recursive descent
    error(source, summary, err) {
        return this.wave('error', source, summary, err ? { message: err.message } : undefined, 1.0, ['error']);
    }
    /** Update stats (call from God Loop each cycle) */
    // Complexity: O(1)
    updateStats(partial) {
        Object.assign(this.stats, partial);
        this.stats.uptime = Math.round(process.uptime());
        this.stats.memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        this.broadcast('stats', this.stats);
    }
    // ───────────────────────────────────────────────────────────────────────────
    // HTTP SERVER
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    handleRequest(req, res) {
        const url = req.url || '/';
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (url === '/events') {
            this.handleSSE(req, res);
        }
        else if (url === '/api/waves') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ waves: this.waveBuffer.slice(-100), total: this.waveBuffer.length }));
        }
        else if (url === '/api/stats') {
            this.stats.uptime = Math.round(process.uptime());
            this.stats.memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(this.stats));
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(this.getDashboardHTML());
        }
    }
    // Complexity: O(N) — linear iteration
    handleSSE(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        res.flushHeaders();
        // Send current stats immediately
        this.sseClients.add(res);
        this.sendSSE(res, 'stats', this.stats);
        // Send last 20 waves as history
        const recent = this.waveBuffer.slice(-20);
        for (const w of recent)
            this.sendSSE(res, 'wave', w);
        req.on('close', () => this.sseClients.delete(res));
    }
    // Complexity: O(N) — linear iteration
    broadcast(event, data) {
        const payload = this.formatSSE(event, data);
        for (const client of this.sseClients) {
            try {
                client.write(payload);
            }
            catch {
                this.sseClients.delete(client);
            }
        }
    }
    // Complexity: O(1)
    sendSSE(res, event, data) {
        try {
            res.write(this.formatSSE(event, data));
        }
        catch { }
    }
    // Complexity: O(1)
    formatSSE(event, data) {
        return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // EMBEDDED HTML DASHBOARD
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — amortized
    getDashboardHTML() {
        return `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>⚡ QAntum Neural HUD</title>
<style>
  :root {
    --bg: #0a0a0f; --card: #12121a; --border: #1e1e2e;
    --cyan: #00f5ff; --green: #00ff88; --red: #ff4444;
    --yellow: #ffcc00; --purple: #a855f7; --blue: #3b82f6;
    --text: #e2e8f0; --muted: #64748b;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Courier New', monospace; font-size: 13px; }
  header { background: var(--card); border-bottom: 1px solid var(--border); padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between; }
  header h1 { font-size: 16px; color: var(--cyan); letter-spacing: 2px; }
  header .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green);
    box-shadow: 0 0 6px var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; padding: 14px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px;
    padding: 14px; text-align: center; }
  .stat-card .val { font-size: 28px; font-weight: bold; color: var(--cyan); }
  .stat-card .lbl { color: var(--muted); font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .providers { display: flex; gap: 8px; padding: 0 14px 14px; }
  .prov { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 8px;
    padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
  .prov .name { color: var(--muted); font-size: 11px; text-transform: uppercase; }
  .prov .cnt  { font-size: 18px; color: var(--green); font-weight: bold; }
  .waves-panel { margin: 0 14px 14px; background: var(--card); border: 1px solid var(--border);
    border-radius: 8px; overflow: hidden; }
  .waves-header { padding: 10px 14px; border-bottom: 1px solid var(--border);
    color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
    display: flex; justify-content: space-between; }
  #wave-list { height: 420px; overflow-y: auto; padding: 6px 0; }
  .wave { display: flex; align-items: flex-start; gap: 10px; padding: 7px 14px;
    border-bottom: 1px solid rgba(30,30,46,.6); transition: background .15s; }
  .wave:hover { background: rgba(255,255,255,.03); }
  .wave-time { color: var(--muted); font-size: 11px; min-width: 80px; padding-top: 1px; }
  .wave-badge { font-size: 10px; padding: 2px 7px; border-radius: 10px; font-weight: bold;
    min-width: 80px; text-align: center; flex-shrink: 0; }
  .badge-perception  { background: rgba(59,130,246,.2);  color: var(--blue); }
  .badge-reasoning   { background: rgba(168,85,247,.2);  color: var(--purple); }
  .badge-decision    { background: rgba(255,204,0,.15);  color: var(--yellow); }
  .badge-action      { background: rgba(0,255,136,.15);  color: var(--green); }
  .badge-error       { background: rgba(255,68,68,.2);   color: var(--red); }
  .badge-recovery    { background: rgba(0,245,255,.15);  color: var(--cyan); }
  .badge-learning    { background: rgba(168,85,247,.2);  color: var(--purple); }
  .badge-prediction  { background: rgba(59,130,246,.2);  color: var(--blue); }
  .badge-evaluation  { background: rgba(255,204,0,.15);  color: var(--yellow); }
  .badge-memory_access{ background: rgba(0,245,255,.1);  color: var(--cyan); }
  .badge-memory_store { background: rgba(0,245,255,.1);  color: var(--cyan); }
  .wave-src  { color: var(--muted); font-size: 11px; min-width: 100px; flex-shrink:0; padding-top:1px; }
  .wave-text { flex: 1; line-height: 1.4; }
  .conf { color: var(--muted); font-size: 11px; padding-top: 1px; min-width: 36px; text-align: right; }
  #status-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--card);
    border-top: 1px solid var(--border); padding: 6px 14px; font-size: 11px;
    color: var(--muted); display: flex; gap: 20px; }
  #status-bar span { color: var(--text); }
</style>
</head>
<body>
<header>
  <h1>⚡ QAntum NEURAL HUD</h1>
  <div style="display:flex;align-items:center;gap:8px">
    <div class="dot" id="conn-dot" style="background:var(--red)"></div>
    <span id="conn-label" style="font-size:11px;color:var(--muted)">Connecting...</span>
  </div>
</header>

<div class="grid">
  <div class="stat-card"><div class="val" id="s-cycle">0</div><div class="lbl">⚡ Cycle</div></div>
  <div class="stat-card"><div class="val" id="s-targets">0</div><div class="lbl">🎯 Targets</div></div>
  <div class="stat-card"><div class="val" id="s-pitches">0</div><div class="lbl">🚀 Pitches</div></div>
  <div class="stat-card"><div class="val" id="s-mem">0</div><div class="lbl">💾 Memory MB</div></div>
</div>

<div class="providers">
  <div class="prov"><span class="name">🧠 DeepSeek</span><span class="cnt" id="p-deepseek">0</span></div>
  <div class="prov"><span class="name">🦙 Ollama</span><span class="cnt" id="p-ollama">0</span></div>
  <div class="prov"><span class="name">💻 Local</span><span class="cnt" id="p-local">0</span></div>
</div>

<div class="waves-panel">
  <div class="waves-header">
    <span>🧠 Brain Waves</span>
    <span id="wave-count">0 waves</span>
  </div>
  <div id="wave-list"></div>
</div>

<div id="status-bar">
  <div>Uptime: <span id="sb-uptime">0s</span></div>
  <div>Waves: <span id="sb-waves">0</span></div>
  <div>Clients: <span id="sb-clients">1</span></div>
</div>

<script>
const list = document.getElementById('wave-list');
const src = new EventSource('/events');
let waveCount = 0;

const dot   = document.getElementById('conn-dot');
const label = document.getElementById('conn-label');

src.onopen = () => {
  dot.style.background = 'var(--green)';
  dot.style.boxShadow  = '0 0 6px var(--green)';
  label.textContent    = 'Connected';
};
src.onerror = () => {
  dot.style.background = 'var(--red)';
  dot.style.boxShadow  = '0 0 6px var(--red)';
  label.textContent    = 'Disconnected — retrying...';
};

src.addEventListener('stats', e => {
  const s = JSON.parse(e.data);
  document.getElementById('s-cycle').textContent   = s.cycle ?? 0;
  document.getElementById('s-targets').textContent = s.targetsProcessed ?? 0;
  document.getElementById('s-pitches').textContent = s.pitchesSent ?? 0;
  document.getElementById('s-mem').textContent     = s.memoryMB ?? 0;
  document.getElementById('p-deepseek').textContent= (s.provider?.deepseek ?? 0);
  document.getElementById('p-ollama').textContent  = (s.provider?.ollama ?? 0);
  document.getElementById('p-local').textContent   = (s.provider?.local ?? 0);
  document.getElementById('sb-uptime').textContent = formatUptime(s.uptime ?? 0);
});

src.addEventListener('wave', e => {
  const w = JSON.parse(e.data);
  waveCount++;
  document.getElementById('wave-count').textContent = waveCount + ' waves';
  document.getElementById('sb-waves').textContent   = waveCount;

  const time = new Date(w.timestamp).toLocaleTimeString('bg-BG');
  const conf = w.confidence ? (w.confidence * 100).toFixed(0) + '%' : '';
  const badgeCls = 'badge-' + (w.type || 'action');
  const srcShort = (w.source || 'system').replace('-', ' ');

  const row = document.createElement('div');
  row.className = 'wave';
  row.innerHTML = \`
    <span class="wave-time">\${time}</span>
    <span class="wave-badge \${badgeCls}">\${w.type}</span>
    <span class="wave-src">\${srcShort}</span>
    <span class="wave-text">\${escHtml(w.summary)}</span>
    <span class="conf">\${conf}</span>
  \`;
  list.insertBefore(row, list.firstChild);

  // Keep max 200 rows in DOM
  if (list.children.length > 200) list.removeChild(list.lastChild);
});

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatUptime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return \`\${h}h \${m}m\`;
  if (m > 0) return \`\${m}m \${sec}s\`;
  return \`\${sec}s\`;
}
</script>
</body>
</html>`;
    }
}
exports.NeuralHUD = NeuralHUD;
exports.default = NeuralHUD;
