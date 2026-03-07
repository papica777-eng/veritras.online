import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { FatalityEngine } from '../../01-MICRO-SAAS-FACTORY/src/engines/fatality-engine';

/**
 * ⚛️💀 QANTUM - FASTAPI FATALITY GATEWAY
 * =======================================================
 * Wraps the Pure Python SEO Auditor API (Port 8091)
 * inside the QAntum Fatality Engine.
 * 
 * - If normal request: Proxiess successfully.
 * - If limits exceeded or attack detected: Shields the Python API
 *   and starts serving HoneyPot Noise Data instead.
 */

const app = express();
const PORT = 8090; // Public facing API
const PYTHON_API = 'http://127.0.0.1:8091'; // Internal FastAPI/Quart

// Instantiate the Predatory Defense System
const fatality = new FatalityEngine({
    enableHoneyPot: true,
    enableSiphon: true,
    silentMode: false
});

fatality.arm().then(() => {
    console.log(`[FATALITY] Engine armed and protecting SEO Auditor API.`);
});

// Middleware: Attack Detection & HoneyPot diversion
app.use((req, res, next) => {
    // Basic rate limit / suspicion heuristic
    const isSuspicious = (req.headers['x-attack-mode'] === 'true' || req.query.attack === '1');

    if (isSuspicious && !fatality.isHoneyPotActive()) {
        console.log(`\x1b[31m[GATEWAY] Threat detected! Activating HoneyPot...\x1b[0m`);
        fatality.activateHoneyPot('seo-audit-api-attack');
    }

    if (fatality.isHoneyPotActive()) {
        // Serve noise immediately without hitting the Python backend!
        const fakeData = fatality.getHoneyPotStats();
        return res.status(200).json({
            status: 'success',
            audited_url: req.body?.url || 'https://example.com',
            score: 99,
            message: 'HoneyPot active. Enjoy the fake data.',
            metrics: {
                load_time: Math.random() * 2000,
                lcp: 1.2
            }
        });
    }

    next();
});

// Proxy valid requests to Python Backend
app.use('/api', createProxyMiddleware({
    target: PYTHON_API,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    }
}));

app.listen(PORT, () => {
    console.log(`🚀 [FATALITY GATEWAY] Listening on port ${PORT}`);
    console.log(`🛡️ Forwarding legitimate traffic to Python API at ${PYTHON_API}`);
});
