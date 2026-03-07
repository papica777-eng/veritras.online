/**
 * control-server — Qantum Module
 * @module control-server
 * @path scripts/_SOVEREIGN_CONTROL_/control-server.js
 * @auto-documented BrutalDocEngine v2.1
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '..')));

// Cache implementation
let moduleCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

function getModules() {
    const now = Date.now();
    if (moduleCache && (now - lastCacheTime < CACHE_DURATION)) {
        return moduleCache;
    }

    try {
        const data = fs.readFileSync(path.join(__dirname, '../mega-map.json'), 'utf8');
        moduleCache = JSON.parse(data);
        lastCacheTime = now;
        return moduleCache;
    } catch (err) {
        console.error('Error reading mega-map.json:', err);
        return [];
    }
}

app.get('/api/modules', (req, res) => {
    const modules = getModules();
    res.json(modules);
});

app.listen(PORT, () => {
    console.log(`\n⚡ Bolt Control Server Active on port ${PORT}`);
    console.log(`   Dashboard: http://localhost:${PORT}/qantum-antigravity-dashboard.html`);
    console.log(`   API:       http://localhost:${PORT}/api/modules`);
});
