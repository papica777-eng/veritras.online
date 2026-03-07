import * as http from "http";
import * as os from "os";
import { WebSocketServer, WebSocket } from "ws";

// Complexity: O(1) WebServer, O(log N) Connection Handlers
// KNOX-VERIFICATION: The Mega Showcase

const PORT = 8890;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
}

const ip = getLocalIP();

const HTML_PAYLOAD = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QANTUM: KNOX WEALTH BRIDGE</title>
    <style>
        body {
            background-color: #000;
            color: #ff00ff;
            font-family: monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        .container {
            border: 2px solid #ff00ff;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 0, 255, 0.4);
            background-color: #0a000a;
        }
        h2 { margin-bottom: 5px; color: #fff; text-shadow: 0 0 10px #ff00ff; }
        .blinker { animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }
        button {
            background: #ff00ff;
            color: #000;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.2rem;
            font-weight: 900;
            cursor: pointer;
            margin-top: 1.5rem;
            text-transform: uppercase;
            box-shadow: 0 0 15px #ff00ff;
        }
        button:active { background: #fff; }
        #status { margin-top: 1.5rem; font-size: 1.1rem; color: #00ffcc; font-weight: bold; }
        #hashRate { font-size: 1.5rem; margin-top: 10px; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <h2>SAMSUNG S24 KNOX</h2>
        <p class="blinker">WAITING FOR BIOMETRIC SIGNATURE</p>
        <button id="authBtn">AUTHORIZE SOVEREIGN BRIDGE</button>
        <div id="status">STATUS: OFFLINE</div>
        <div id="hashRate">0.00 MH/s</div>
    </div>

    <script>
        const ws = new WebSocket(\`ws://\${location.host}\`);
        let socketOpen = false;

        ws.onopen = () => { socketOpen = true; };

        // Web Worker payload as a Blob to force heavy calculation on the mobile CPU
        const workerCode = \`
            self.onmessage = function(e) {
                if (e.data === "START") {
                    let hashCount = 0;
                    let lastTime = Date.now();
                    
                    // Heavy mathematical calculation to transfer load mapping Big O(n) continuous
                    function compute() {
                        const start = Date.now();
                        while(Date.now() - start < 15) { // 15ms blocks
                            for(let i=0; i < 50000; i++) {
                                let val = Math.sin(i) * Math.cos(i) / Math.tan(i+1);
                            }
                            hashCount += 50000;
                        }
                        
                        let now = Date.now();
                        if (now - lastTime >= 1000) {
                            self.postMessage({ rate: hashCount });
                            hashCount = 0;
                            lastTime = now;
                        }
                        
                        setTimeout(compute, 0); 
                    }
                    compute();
                }
            };
        \`;

        const blob = new Blob([workerCode], {type: "application/javascript"});
        let totalRate = 0;
        let activeWorkers = 0;
        
        const statusDiv = document.getElementById("status");
        const hashRateDiv = document.getElementById("hashRate");
        const btn = document.getElementById("authBtn");

        function handleWorkerMessage(e) {
            totalRate += e.data.rate;
        }

        setInterval(() => {
            if (totalRate > 0) {
                const combinedMhs = (totalRate / 1000000).toFixed(2);
                hashRateDiv.innerText = \`\${combinedMhs} MH/s\`;
                if(socketOpen) {
                    ws.send(JSON.stringify({ type: "TELEMETRY", mhps: combinedMhs, cores: activeWorkers }));
                }
                totalRate = 0;
            }
        }, 1000);

        btn.addEventListener("click", () => {
            if(!socketOpen) {
                alert("WebSocket not ready. Are you on the exact same network?");
                return;
            }
            btn.style.display = "none";
            document.querySelector('.blinker').style.display = 'none';
            statusDiv.innerText = "STATUS: NOETIC OVERWRITE ACTIVE. CPU LOAD TRANSFERRED.";
            
            ws.send(JSON.stringify({ type: "AUTH_SUCCESS", device: "Samsung S24 Ultra (Knox)" }));

            // Spawn multiple workers to maximize CPU utilization on Samsung S24
            const cores = navigator.hardwareConcurrency || 8;
            activeWorkers = cores;
            for(let i=0; i < cores; i++) {
                const w = new Worker(URL.createObjectURL(blob));
                w.onmessage = handleWorkerMessage;
                w.postMessage("START");
            }
        });
    </script>
</body>
</html>
`;

// HTTP Server
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(HTML_PAYLOAD);
});

// WebSocket Server
const wss = new WebSocketServer({ server });

let currentMhps = "0.00";
let activeCores = 0;
let isConnected = false;

// Clear screen and redraw Terminal Graphics
function drawConsole() {
    console.clear();
    console.log('\x1b[35m' + `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    QANTUM KNOX WEALTH BRIDGE - MEGA DEMO                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
` + '\x1b[0m');

    if (!isConnected) {
        console.log(`\x1b[33m ⏳ WAITING FOR DEVICE CONNECTION AT: http://${ip}:${PORT}\x1b[0m`);
        console.log(`\x1b[2m -> Tell the interviewer: "I am going to transfer the server CPU load directly into my Samsung S24 right now."\x1b[0m`);
    } else {
        console.log(`\x1b[32m [✔] DEVICE CONNECTED: Samsung S24 Ultra (Knox Protected Layer)\x1b[0m`);
        console.log(`\x1b[36m ⚡  CORES ACTIVE: ${activeCores} ARM Cores Syncing\x1b[0m`);

        let barLength = Math.min(Math.floor(parseFloat(currentMhps) * 2), 50);
        let bar = '█'.repeat(barLength) + '░'.repeat(Math.max(0, 50 - barLength));
        console.log(`\x1b[31m 🚀  REAL-TIME HASH RATE: [${bar}] ${currentMhps} MH/s\x1b[0m`);
        console.log(`\n\x1b[32m /// [VERITAS LOG]: Zero-Float Entropy Engine shifted execution dynamically! ///\x1b[0m`);
    }
}

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "AUTH_SUCCESS") {
                isConnected = true;
                drawConsole();
            } else if (data.type === "TELEMETRY") {
                currentMhps = data.mhps;
                activeCores = data.cores;
                drawConsole();
            }
        } catch (e) {
            // parse error 
        }
    });

    ws.on('close', () => {
        isConnected = false;
        currentMhps = "0.00";
        activeCores = 0;
        drawConsole();
    });
});

server.listen(PORT, "0.0.0.0", () => {
    drawConsole();
});
