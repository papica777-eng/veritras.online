"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏭 MICRO-SAAS-FACTORY - The Scribe
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Autonomous SaaS Generator - Creates revenue-generating software modules
 * Target: $10,000 MRR
 *
 * @author Dimitar Prodromov / QAntum Empire
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SaaSGenerator_1 = require("./generator/SaaSGenerator");
const MarketAnalyzer_1 = require("./analyzer/MarketAnalyzer");
const Deployer_1 = require("./deployer/Deployer");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
// Core instances
const generator = new SaaSGenerator_1.SaaSGenerator();
const analyzer = new MarketAnalyzer_1.MarketAnalyzer();
const deployer = new Deployer_1.Deployer();
// ═══════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Analyze market for opportunities
 */
app.post('/api/analyze', async (req, res) => {
    const { niche, keywords } = req.body;
    try {
        const opportunities = await analyzer.findOpportunities(niche, keywords);
        res.json({ success: true, opportunities });
    }
    catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});
/**
 * Generate a new SaaS application
 */
app.post('/api/generate', async (req, res) => {
    const { name, description, features, template } = req.body;
    try {
        const saas = await generator.generate({
            name,
            description,
            features,
            template: template || 'nextjs-starter'
        });
        res.json({ success: true, saas });
    }
    catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});
/**
 * Deploy generated SaaS
 */
app.post('/api/deploy', async (req, res) => {
    const { saasId, target, domain } = req.body;
    try {
        const deployment = await deployer.deploy(saasId, {
            target: target || 'vercel',
            domain
        });
        res.json({ success: true, deployment });
    }
    catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
});
/**
 * Get all generated SaaS apps
 */
app.get('/api/saas', async (req, res) => {
    const apps = await generator.listAll();
    res.json({ success: true, apps });
});
/**
 * Get revenue dashboard
 */
app.get('/api/revenue', async (req, res) => {
    // TODO: Integrate with Stripe
    res.json({
        success: true,
        mrr: 0,
        apps: 0,
        customers: 0
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🏭 MICRO-SAAS-FACTORY - The Scribe                       ║');
    console.log('║   Autonomous SaaS Generator                                ║');
    console.log(`║   Running on port ${PORT}                                      ║`);
    console.log('╚════════════════════════════════════════════════════════════╝');
});
