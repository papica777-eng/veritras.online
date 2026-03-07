import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import zlib from 'zlib';
import crypto from 'crypto';
import { getAuthGuard, User, Role } from './departments/guardians/AuthGuard';
import { paymentGateway } from './economy/PaymentGateway';
import { getSubscriptions } from './economy/subscription';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve Static Frontend (Helios UI)
// We assume the frontend is built to ../helios-ui/dist (relative to AETERNAAA/OmniCore)
const frontendPath = path.join(__dirname, '../helios-ui/dist');
console.log('Frontend Path Resolved:', frontendPath);
console.log('Frontend Path Exists:', fs.existsSync(frontendPath));
console.log('Index.html Exists:', fs.existsSync(path.join(frontendPath, 'index.html')));

app.use(express.static(frontendPath));

// Cache implementation for legacy Mega Map (if needed)
let moduleCache: any = null;
let cachedGzip: Buffer | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000;

async function getModules() {
    const now = Date.now();
    if (moduleCache && (now - lastCacheTime < CACHE_DURATION)) {
        return moduleCache;
    }

    try {
        // Fallback to legacy path or new path
        let mapPath = path.join(process.cwd(), 'mega-map.json');
        if (!fs.existsSync(mapPath)) {
             mapPath = path.join(__dirname, '../../mega-map.json');
        }
        if (!fs.existsSync(mapPath)) {
             mapPath = path.join(__dirname, '../../../mega-map.json');
        }

        if (fs.existsSync(mapPath)) {
            const data = await fs.promises.readFile(mapPath, 'utf8');
            moduleCache = JSON.parse(data);
            lastCacheTime = now;
            cachedGzip = null; // Invalidate gzip cache when data changes
            return moduleCache;
        }
        console.warn('mega-map.json not found. Searched up to:', mapPath);
        return [];
    } catch (err) {
        console.error('Error reading mega-map.json:', err);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

const authGuard = getAuthGuard();
const subscriptions = getSubscriptions();

// Security Helper (Hash)
const security = {
    hash: (data: string): string => {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
};

// --- AUTH ---

app.post('/api/auth/register', (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password) {
             res.status(400).json({ error: 'Email and password required' });
             return;
        }

        const existing = authGuard.findUserByEmail(email);
        if (existing) {
             res.status(400).json({ error: 'User already exists' });
             return;
        }

        const newUser: User = {
            id: `usr_${Date.now()}`,
            email,
            username: username || email.split('@')[0],
            passwordHash: security.hash(password),
            roles: [Role.User]
        };

        authGuard.registerUser(newUser);
        const token = authGuard.generateToken(newUser);

        // Auto-subscribe to Free plan
        subscriptions.create(newUser.id, 'plan_free');

        res.json({ token, user: { id: newUser.id, email: newUser.email, username: newUser.username } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const user = authGuard.findUserByEmail(email);

        if (!user || user.passwordHash !== security.hash(password)) {
             res.status(401).json({ error: 'Invalid credentials' });
             return;
        }

        const token = authGuard.generateToken(user);
        res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --- SAAS ---

app.get('/api/saas/plans', (req, res) => {
    res.json(subscriptions.getAllPlans());
});

app.get('/api/saas/subscription', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
         res.status(401).json({ error: 'No token' });
         return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = authGuard.verifyToken(token);

    if (!decoded) {
         res.status(401).json({ error: 'Invalid token' });
         return;
    }

    const sub = subscriptions.getByUser(decoded.userId);
    res.json(sub);
});

// --- PAYMENTS ---

app.post('/api/payments/create-checkout-session', async (req, res) => {
    const { planId } = req.body;
    const authHeader = req.headers.authorization;

    // Success/Cancel URLs pointing to the new React App
    const successUrl = `http://localhost:${PORT}/payment/success`;
    const cancelUrl = `http://localhost:${PORT}/payment/canceled`;

    try {
        const url = await paymentGateway.createCheckoutSession(planId, successUrl, cancelUrl);
        res.json({ url });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --- LEGACY MODULES ---

app.get('/api/modules', async (req, res) => {
    const modules = await getModules();
    const acceptEncoding = req.headers['accept-encoding'];
    if (acceptEncoding && acceptEncoding.includes('gzip')) {
        // ⚡ Bolt Optimization: Serve pre-compressed buffer if available
        if (cachedGzip) {
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'application/json');
            res.send(cachedGzip);
            return;
        }

        const json = JSON.stringify(modules);
        zlib.gzip(json, (err, buffer) => {
            if (err) {
                console.error('Compression error:', err);
                res.json(modules);
                return;
            }
            cachedGzip = buffer; // Cache the compressed buffer
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'application/json');
            res.send(buffer);
        });
    } else {
        res.json(modules);
    }
});

// Catch-all for React Client-Side Routing
app.use((req, res) => {
    if (req.method === 'GET') {
        if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
            res.sendFile(path.join(frontendPath, 'index.html'));
            return;
        }
    }

    // Fallback message
    res.send(`AETERNAAA Singularity Server Active. Frontend not found at ${frontendPath}`);
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n⚡ AETERNAAA Singularity Server Active on port ${PORT}`);
        console.log(`   Frontend:  http://localhost:${PORT}`);
        console.log(`   API:       http://localhost:${PORT}/api/saas/plans`);
    });
}

export default app;
