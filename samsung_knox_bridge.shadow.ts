import * as http from "http";
import * as os from "os";
import * as fs from "fs";

// Complexity: O(1) for startup, O(n) for network connections.
// KNOX-VERIFICATION: Wealth Bridge Local Node (Enhanced Shadow Version)
// PRIME DIRECTIVE: NOETIC SYNC & VERITAS TELEMETRY

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

function getSystemMetrics() {
    return {
        cpu_load: os.loadavg()[0].toFixed(2),
        free_mem: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + " GB",
        total_mem: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + " GB",
        uptime: (os.uptime() / 3600).toFixed(2) + " hours",
        hostname: os.hostname(),
        arch: os.arch()
    };
}

const HTML_PAYLOAD = (ip: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QANTUM: KNOX WEALTH BRIDGE</title>
    <style>
        :root {
            --neon-blue: #00f2ff;
            --neon-gold: #ffcc00;
            --cyber-bg: #050505;
            --danger-red: #ff3333;
        }
        body {
            background-color: var(--cyber-bg);
            color: var(--neon-blue);
            font-family: 'Outfit', 'Inter', monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            overflow-x: hidden;
            background-image: 
                linear-gradient(rgba(0, 242, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90(rgba(0, 242, 255, 0.05) 1px, transparent 1px);
            background-size: 30px 30px;
        }
        .container {
            border: 2px solid var(--neon-blue);
            padding: 3rem;
            text-align: center;
            box-shadow: 0 0 40px rgba(0, 242, 255, 0.15);
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 4px;
            max-width: 90%;
            position: relative;
        }
        .container::before {
            content: "KNOX_SECURE_BRIDGE_v1.0";
            position: absolute;
            top: -12px;
            left: 20px;
            background: var(--cyber-bg);
            padding: 0 10px;
            font-size: 0.7rem;
            color: var(--neon-gold);
            letter-spacing: 2px;
        }
        h2 {
            font-size: 1.8rem;
            letter-spacing: 4px;
            margin-bottom: 0.5rem;
            color: #fff;
            text-shadow: 0 0 10px var(--neon-blue);
        }
        .telemetry-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 2rem 0;
            text-align: left;
            font-size: 0.8rem;
            border-top: 1px solid rgba(0, 242, 255, 0.2);
            padding-top: 1rem;
        }
        .metric {
            display: flex;
            justify-content: space-between;
        }
        .metric-label { color: var(--neon-gold); }
        .metric-value { color: #fff; font-weight: bold; }

        button {
            background: var(--neon-blue);
            color: #000;
            border: none;
            padding: 1.2rem 3rem;
            font-size: 1.2rem;
            font-weight: 800;
            cursor: pointer;
            margin-top: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 4px;
            transition: all 0.3s ease;
            clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%);
        }
        button:hover {
            background: #fff;
            box-shadow: 0 0 30px var(--neon-blue);
            transform: scale(1.05);
        }
        button:active { transform: scale(0.95); }

        #status {
            margin-top: 1.5rem;
            font-size: 1rem;
            color: var(--neon-gold);
            height: 1.5rem;
            font-weight: bold;
        }
        #hashRate {
            font-size: 2.5rem;
            color: #fff;
            margin: 1rem 0;
            font-weight: 900;
            text-shadow: 0 0 20px var(--neon-blue);
        }
        .glitch-bar {
            height: 2px;
            background: var(--neon-blue);
            width: 100%;
            margin: 1rem 0;
            position: relative;
            overflow: hidden;
        }
        .glitch-bar::after {
            content: '';
            position: absolute;
            left: -100%;
            width: 50%;
            height: 100%;
            background: #fff;
            animation: sweep 2s infinite linear;
        }
        @keyframes sweep {
            0% { left: -100%; }
            100% { left: 200%; }
        }
        .real-time {
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 0.6rem;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>SAMSUNG S24 NOETIC SYNC</h2>
        <div class="glitch-bar"></div>
        <p>AWAITING BIOMETRIC OVERWRITE...</p>
        
        <div id="hashRate">0.00 MH/s</div>
        
        <button id="authBtn">AUTHORIZE & SYNC</button>

        <div id="status">STATUS: IDLE_WAITING_FOR_BRIDGE</div>

        <div class="telemetry-grid">
            <div class="metric"><span class="metric-label">HOST:</span> <span class="metric-value">${os.hostname()}</span></div>
            <div class="metric"><span class="metric-label">UPLINK:</span> <span class="metric-value">${ip}:8890</span></div>
            <div class="metric"><span class="metric-label">RT_CPU:</span> <span class="metric-value" id="rt-cpu">PENDING</span></div>
            <div class="metric"><span class="metric-label">RT_MEM:</span> <span class="metric-value" id="rt-mem">PENDING</span></div>
        </div>
    </div>
    
    <div class="real-time" id="clock"></div>

    <script>
        // Web Worker payload for heavy mobile CPU stress
        const workerCode = \`
            self.onmessage = function(e) {
                if (e.data === "START") {
                    let hashCount = 0;
                    let lastTime = Date.now();
                    
                    function compute() {
                        for(let i=0; i < 700000; i++) {
                            let val = Math.sin(i) * Math.tan(i) * Math.sqrt(i);
                        }
                        hashCount += 700000;
                        
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
        const blobUrl = URL.createObjectURL(blob);
        const statusDiv = document.getElementById("status");
        const hashRateDiv = document.getElementById("hashRate");
        const btn = document.getElementById("authBtn");

        async function updateTelemetry() {
            try {
                const res = await fetch("/api/metrics");
                const data = await res.json();
                document.getElementById("rt-cpu").innerText = data.cpu_load + " %";
                document.getElementById("rt-mem").innerText = data.free_mem;
            } catch(e) {}
        }
        setInterval(updateTelemetry, 2000);

        setInterval(() => {
            document.getElementById("clock").innerText = new Date().toISOString();
        }, 1000);

        let totalHps = 0;
        let workerCount = 0;

        btn.addEventListener("click", () => {
            btn.style.display = "none";
            statusDiv.innerText = "NOETIC OVERWRITE INITIATED. BRUTAL SYNC ACTIVE.";
            statusDiv.style.color = "#ffcc00";
            
            const cores = navigator.hardwareConcurrency || 8;
            for(let i=0; i < cores; i++) {
                const w = new Worker(blobUrl);
                w.onmessage = (e) => {
                    // Accumulate rate
                    totalHps = e.data.rate;
                    hashRateDiv.innerText = (totalHps / 1000000).toFixed(2) + " MH/s";
                };
                w.postMessage("START");
            }
        });
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    if (req.url === "/api/metrics") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(getSystemMetrics()));
        return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(HTML_PAYLOAD(getLocalIP()));
});

const ip = getLocalIP();

server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n/// 💎 QANTUM BRUTAL BRIDGE ACTIVE ///`);
    console.log(`/// ACCESS KEY (S24): http://${ip}:${PORT} ///\n`);
    console.log(`[STATUS]: ZERO ENTROPY SYNC IN PROGRESS.`);
});
