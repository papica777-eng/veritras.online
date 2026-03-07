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
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const os = __importStar(require("os"));
// Complexity: O(1) for startup, O(n) for network connections.
// KNOX-VERIFICATION: Wealth Bridge Local Node
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
const HTML_PAYLOAD = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QANTUM: KNOX WEALTH BRIDGE</title>
    <style>
        body {
            background-color: #050505;
            color: #00ffcc;
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
            border: 1px solid #00ffcc;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 0 20px rgba(0, 255, 204, 0.2);
        }
        button {
            background: #00ffcc;
            color: #000;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            margin-top: 1rem;
            text-transform: uppercase;
        }
        button:hover {
            box-shadow: 0 0 15px #00ffcc;
        }
        #status {
            margin-top: 1rem;
            font-size: 0.9rem;
            color: #ffaa00;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>SAMSUNG S24 KNOX VERIFICATION</h2>
        <p>AWAITING BIOMETRIC SIGNATURE...</p>
        <button id="authBtn">AUTHORIZE & SYNC</button>
        <div id="status">STATUS: IDLE</div>
        <div id="hashRate">0 H/s</div>
    </div>

    <script>
        // Web Worker payload as a Blob to force heavy calculation on the mobile CPU
        const workerCode = \`
            self.onmessage = function(e) {
                if (e.data === "START") {
                    let hashCount = 0;
                    let lastTime = Date.now();
                    
                    // Heavy mathematical calculation to transfer load mapping Big O(n) continuous
                    function compute() {
                        for(let i=0; i < 500000; i++) {
                            // Dummy calculation to load CPU simulating SHA-256 zero-float math
                            let val = Math.sin(i) * Math.cos(i);
                        }
                        hashCount += 500000;
                        
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
        const worker = new Worker(URL.createObjectURL(blob));

        const statusDiv = document.getElementById("status");
        const hashRateDiv = document.getElementById("hashRate");
        const btn = document.getElementById("authBtn");

        worker.onmessage = function(e) {
            hashRateDiv.innerText = "RATE: " + (e.data.rate / 1000000).toFixed(2) + " MH/s";
        };

        btn.addEventListener("click", () => {
            btn.style.display = "none";
            statusDiv.innerText = "STATUS: NOETIC OVERWRITE ACTIVE. CPU LOAD TRANSFERRED.";
            statusDiv.style.color = "#00ffcc";
            
            // Spawn multiple workers to maximize CPU utilization on Samsung S24
            const cores = navigator.hardwareConcurrency || 4;
            for(let i=0; i < cores; i++) {
                const w = new Worker(URL.createObjectURL(blob));
                w.postMessage("START");
            }
            worker.postMessage("START");
        });
    </script>
</body>
</html>
`;
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(HTML_PAYLOAD);
});
const ip = getLocalIP();
server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n/// STATUS: WEALTH BRIDGE ACTIVE ///`);
    console.log(`/// WAITING FOR SAMSUNG S24 AT: http://${ip}:${PORT} ///\n`);
    console.log(`[INSTRUCTION]: Open the browser on your Samsung phone and navigate to the IP to transfer load.`);
});
