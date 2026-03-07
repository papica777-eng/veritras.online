// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.3.0 - VISUAL PHISHING DETECTOR                                 ║
// ║  "The Visual Hacker" - AI-Powered Phishing Detection via Vision Analysis     ║
// ║  Uses Gemini 2.0 Vision to detect brand impersonation attacks                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
import { EventEmitter } from 'events';
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
// ═══════════════════════════════════════════════════════════════════════════════
// 🏢 KNOWN BRAND SIGNATURES
// ═══════════════════════════════════════════════════════════════════════════════
const KNOWN_BRANDS = [
    {
        name: 'Google',
        domains: ['google.com', 'accounts.google.com', 'gmail.com', 'googleapis.com'],
        logoPatterns: ['Google', 'G logo', 'multicolor G'],
        colorSchemes: ['#4285F4', '#DB4437', '#F4B400', '#0F9D58'],
        keywords: ['Sign in', 'Google Account', 'Gmail', 'Create account'],
        loginUrlPatterns: [/accounts\.google\.com\/signin/i, /accounts\.google\.com\/v3\/signin/i],
    },
    {
        name: 'Microsoft',
        domains: ['microsoft.com', 'login.microsoftonline.com', 'live.com', 'outlook.com', 'office.com'],
        logoPatterns: ['Microsoft', 'Windows logo', 'four squares'],
        colorSchemes: ['#0078D4', '#FFB900', '#E81123', '#00A4EF'],
        keywords: ['Sign in', 'Microsoft account', 'Outlook', 'Office 365', 'Azure'],
        loginUrlPatterns: [/login\.microsoftonline\.com/i, /login\.live\.com/i],
    },
    {
        name: 'Apple',
        domains: ['apple.com', 'icloud.com', 'appleid.apple.com'],
        logoPatterns: ['Apple', 'apple logo', 'bitten apple'],
        colorSchemes: ['#000000', '#A3AAAE', '#555555'],
        keywords: ['Apple ID', 'iCloud', 'Sign in with Apple'],
        loginUrlPatterns: [/appleid\.apple\.com/i, /idmsa\.apple\.com/i],
    },
    {
        name: 'Facebook',
        domains: ['facebook.com', 'fb.com', 'messenger.com', 'meta.com'],
        logoPatterns: ['Facebook', 'f logo', 'Meta'],
        colorSchemes: ['#1877F2', '#3B5998', '#4267B2'],
        keywords: ['Log In', 'Facebook', 'Create Account', 'Messenger'],
        loginUrlPatterns: [/facebook\.com\/login/i, /www\.facebook\.com/i],
    },
    {
        name: 'Amazon',
        domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'aws.amazon.com'],
        logoPatterns: ['Amazon', 'smile arrow', 'a to z'],
        colorSchemes: ['#FF9900', '#232F3E', '#146EB4'],
        keywords: ['Sign in', 'Amazon', 'Create your Amazon account', 'AWS'],
        loginUrlPatterns: [/amazon\.com\/ap\/signin/i, /signin\.aws\.amazon\.com/i],
    },
    {
        name: 'PayPal',
        domains: ['paypal.com', 'paypal.me'],
        logoPatterns: ['PayPal', 'PP logo', 'double P'],
        colorSchemes: ['#003087', '#009CDE', '#012169'],
        keywords: ['Log In', 'PayPal', 'Send Money', 'Pay with PayPal'],
        loginUrlPatterns: [/paypal\.com\/signin/i, /paypal\.com\/authflow/i],
    },
    {
        name: 'Netflix',
        domains: ['netflix.com'],
        logoPatterns: ['Netflix', 'N logo', 'red N'],
        colorSchemes: ['#E50914', '#221F1F', '#B81D24'],
        keywords: ['Sign In', 'Netflix', 'Watch anywhere', 'Unlimited movies'],
        loginUrlPatterns: [/netflix\.com\/login/i],
    },
    {
        name: 'LinkedIn',
        domains: ['linkedin.com'],
        logoPatterns: ['LinkedIn', 'in logo'],
        colorSchemes: ['#0A66C2', '#0077B5'],
        keywords: ['Sign in', 'LinkedIn', 'Join now', 'Professional network'],
        loginUrlPatterns: [/linkedin\.com\/login/i, /linkedin\.com\/uas\/login/i],
    },
    {
        name: 'Twitter/X',
        domains: ['twitter.com', 'x.com'],
        logoPatterns: ['Twitter', 'X', 'bird logo'],
        colorSchemes: ['#1DA1F2', '#14171A', '#000000'],
        keywords: ['Log in', 'Twitter', 'X', "What's happening"],
        loginUrlPatterns: [/twitter\.com\/login/i, /x\.com\/login/i],
    },
    {
        name: 'Bank of America',
        domains: ['bankofamerica.com', 'bofa.com'],
        logoPatterns: ['Bank of America', 'BofA', 'flag logo'],
        colorSchemes: ['#012169', '#E31837'],
        keywords: ['Sign In', 'Online Banking', 'Bank of America'],
        loginUrlPatterns: [/bankofamerica\.com\/login/i, /secure\.bankofamerica\.com/i],
    },
    {
        name: 'Chase',
        domains: ['chase.com', 'jpmorgan.com'],
        logoPatterns: ['Chase', 'octagon logo'],
        colorSchemes: ['#117ACA', '#0060A9'],
        keywords: ['Sign in', 'Chase', 'Online Banking'],
        loginUrlPatterns: [/chase\.com\/web\/auth/i, /secure\.chase\.com/i],
    },
    {
        name: 'Wells Fargo',
        domains: ['wellsfargo.com'],
        logoPatterns: ['Wells Fargo', 'stagecoach'],
        colorSchemes: ['#D71E28', '#FFCD41'],
        keywords: ['Sign On', 'Wells Fargo', 'Online Banking'],
        loginUrlPatterns: [/wellsfargo\.com\/signon/i],
    },
];
// ═══════════════════════════════════════════════════════════════════════════════
// 🚨 SUSPICIOUS TLDs
// ═══════════════════════════════════════════════════════════════════════════════
const SUSPICIOUS_TLDS = [
    '.xyz', '.top', '.club', '.work', '.click', '.link', '.gq', '.ml', '.cf', '.tk',
    '.ga', '.buzz', '.monster', '.site', '.online', '.live', '.icu', '.vip', '.wang',
    '.store', '.fun', '.space', '.website', '.host', '.press', '.pw', '.win',
];
// ═══════════════════════════════════════════════════════════════════════════════
// 👁️ VISUAL PHISHING DETECTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Visual Phishing Detector
 *
 * Uses Gemini 2.0 Vision AI to analyze screenshots of web pages and detect
 * phishing attempts by comparing visual elements against known brand signatures.
 */
export class VisualPhishingDetector extends EventEmitter {
    config;
    browser = null;
    knownBrands = new Map();
    analyses = [];
    constructor(config = {}) {
        super();
        this.config = {
            geminiApiKey: config.geminiApiKey ?? process.env['GEMINI_API_KEY'] ?? '',
            screenshotDir: config.screenshotDir ?? './screenshots',
            timeout: config.timeout ?? 30000,
            userAgent: config.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            knownBrands: config.knownBrands ?? KNOWN_BRANDS,
            sensitivityLevel: config.sensitivityLevel ?? 'medium',
        };
        // Index known brands
        for (const brand of this.config.knownBrands) {
            this.knownBrands.set(brand.name.toLowerCase(), brand);
            for (const domain of brand.domains) {
                this.knownBrands.set(domain.toLowerCase(), brand);
            }
        }
        // Ensure screenshot directory exists
        if (!existsSync(this.config.screenshotDir)) {
            mkdirSync(this.config.screenshotDir, { recursive: true });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 MAIN ANALYSIS METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Analyze a URL for phishing indicators
     */
    async analyzeUrl(url) {
        this.emit('analysis:start', { url });
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: true });
        }
        const page = await this.browser.newPage({
            userAgent: this.config.userAgent,
        });
        try {
            // Navigate to the URL
            await page.goto(url, {
                waitUntil: 'networkidle',
                timeout: this.config.timeout,
            });
            // Take screenshot
            const screenshotPath = await this.takeScreenshot(page, url);
            // Analyze domain
            const domainInfo = this.analyzeDomain(url, page);
            // Analyze page content for login forms and suspicious elements
            const pageAnalysis = await this.analyzePageContent(page);
            // Use Gemini Vision for visual analysis
            const visualAnalysis = await this.analyzeWithGeminiVision(screenshotPath, url, pageAnalysis);
            // Calculate risk score
            const riskAssessment = this.calculateRiskScore(domainInfo, visualAnalysis, pageAnalysis);
            // Generate AI summary
            const aiSummary = await this.generateAISummary(url, domainInfo, visualAnalysis, riskAssessment);
            const analysis = {
                url,
                screenshotPath,
                timestamp: new Date(),
                domainInfo,
                visualAnalysis,
                riskAssessment,
                aiSummary,
            };
            this.analyses.push(analysis);
            this.emit('analysis:complete', analysis);
            return analysis;
        }
        finally {
            await page.close();
        }
    }
    /**
     * Scan multiple URLs for phishing
     */
    async scanUrls(urls) {
        const startTime = new Date();
        this.emit('scan:start', { urls: urls.length });
        const analyses = [];
        for (const url of urls) {
            try {
                const analysis = await this.analyzeUrl(url);
                analyses.push(analysis);
            }
            catch (error) {
                this.emit('scan:error', { url, error });
            }
        }
        const endTime = new Date();
        const highRiskPages = analyses.filter(a => a.riskAssessment.level === 'high' || a.riskAssessment.level === 'critical');
        const report = {
            target: urls[0] ?? 'multiple',
            startTime,
            endTime,
            pagesScanned: analyses.length,
            phishingDetected: highRiskPages.length,
            highRiskPages,
            allAnalyses: analyses,
            overallRiskScore: this.calculateOverallRisk(analyses),
            recommendations: this.generateRecommendations(analyses),
        };
        this.emit('scan:complete', report);
        return report;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📸 SCREENSHOT METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Take a screenshot of the page
     */
    async takeScreenshot(page, url) {
        const urlHash = this.hashUrl(url);
        const filename = `phishing-scan-${urlHash}-${Date.now()}.png`;
        const screenshotPath = join(this.config.screenshotDir, filename);
        await page.screenshot({
            path: screenshotPath,
            fullPage: false,
            type: 'png',
        });
        return screenshotPath;
    }
    /**
     * Generate a hash for the URL
     */
    hashUrl(url) {
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).substring(0, 8);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 DOMAIN ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Analyze domain for phishing indicators
     */
    analyzeDomain(url, _page) {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const tld = this.extractTLD(domain);
        return {
            domain,
            tld,
            isIPAddress: this.isIPAddress(domain),
            hasTyposquatting: this.detectTyposquatting(domain),
            suspiciousTLD: SUSPICIOUS_TLDS.includes(tld),
            ageUnknown: true, // Would need WHOIS lookup
            sslValid: urlObj.protocol === 'https:',
            sslIssuer: 'Unknown', // Would need certificate inspection
        };
    }
    /**
     * Extract TLD from domain
     */
    extractTLD(domain) {
        const parts = domain.split('.');
        if (parts.length >= 2) {
            return '.' + parts.slice(-1).join('.');
        }
        return '';
    }
    /**
     * Check if domain is an IP address
     */
    isIPAddress(domain) {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(domain) || ipv6Regex.test(domain);
    }
    /**
     * Detect typosquatting attempts
     */
    detectTyposquatting(domain) {
        const domainLower = domain.toLowerCase();
        // Check for common typosquatting patterns
        const typosquattingPatterns = [
            // Letter substitution (0 for o, 1 for l, etc.)
            /g[o0][o0]g[l1]e/i,
            /m[i1]cr[o0]s[o0]ft/i,
            /faceb[o0][o0]k/i,
            /amaz[o0]n/i,
            /paypa[l1]/i,
            /app[l1]e/i,
            // Extra characters
            /google-/i,
            /microsoft-/i,
            /facebook-/i,
            /amazon-/i,
            // Subdomain tricks
            /google\.[a-z]+\./i,
            /microsoft\.[a-z]+\./i,
            /facebook\.[a-z]+\./i,
            // Homoglyph attacks (Cyrillic, etc.)
            /аpple/i, // Cyrillic 'а'
            /gооgle/i, // Cyrillic 'о'
        ];
        for (const pattern of typosquattingPatterns) {
            if (pattern.test(domainLower)) {
                // Make sure it's not the actual legitimate domain
                const isLegitimate = this.config.knownBrands.some(brand => brand.domains.includes(domainLower));
                if (!isLegitimate) {
                    return true;
                }
            }
        }
        return false;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📄 PAGE CONTENT ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Analyze page content for suspicious elements
     */
    async analyzePageContent(page) {
        const result = await page.evaluate(() => {
            const suspicious = [];
            // Check for password fields
            const passwordFields = document.querySelectorAll('input[type="password"]');
            // Check for login forms
            const forms = document.querySelectorAll('form');
            let loginFormDetected = false;
            forms.forEach((form, index) => {
                const hasPassword = form.querySelector('input[type="password"]');
                const hasEmail = form.querySelector('input[type="email"]') ||
                    form.querySelector('input[name*="email"]') ||
                    form.querySelector('input[name*="user"]');
                if (hasPassword && hasEmail) {
                    loginFormDetected = true;
                }
                // Check for external form action
                const action = form.getAttribute('action');
                if (action && !action.startsWith('/') && !action.startsWith(window.location.origin)) {
                    suspicious.push({
                        type: 'external_form_action',
                        selector: `form:nth-of-type(${index + 1})`,
                        description: `Form submits to external URL: ${action}`,
                        severity: 'high',
                    });
                }
            });
            // Check for hidden fields with sensitive names
            const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach((input, index) => {
                const name = input.getAttribute('name')?.toLowerCase() ?? '';
                if (name.includes('password') || name.includes('token') || name.includes('session')) {
                    suspicious.push({
                        type: 'hidden_field',
                        selector: `input[type="hidden"]:nth-of-type(${index + 1})`,
                        description: `Suspicious hidden field: ${name}`,
                        severity: 'high',
                    });
                }
            });
            // Check for fake URL bar (common in phishing)
            const fakeUrlBar = document.querySelector('[class*="url-bar"], [class*="address-bar"], [id*="url-bar"]');
            if (fakeUrlBar) {
                suspicious.push({
                    type: 'fake_url_bar',
                    selector: fakeUrlBar.tagName.toLowerCase(),
                    description: 'Possible fake URL/address bar detected',
                    severity: 'critical',
                });
            }
            // Check for data: or javascript: links
            const links = document.querySelectorAll('a[href^="data:"], a[href^="javascript:"]');
            links.forEach((link, index) => {
                suspicious.push({
                    type: 'obfuscated_link',
                    selector: `a:nth-of-type(${index + 1})`,
                    description: `Obfuscated link detected: ${link.getAttribute('href')?.substring(0, 50)}...`,
                    severity: 'medium',
                });
            });
            // Check for invisible iframes
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach((iframe, index) => {
                const style = window.getComputedStyle(iframe);
                if (style.display === 'none' || style.visibility === 'hidden' ||
                    style.opacity === '0' || (parseInt(style.width) <= 1 && parseInt(style.height) <= 1)) {
                    suspicious.push({
                        type: 'hidden_field',
                        selector: `iframe:nth-of-type(${index + 1})`,
                        description: 'Hidden iframe detected (possible clickjacking)',
                        severity: 'high',
                    });
                }
            });
            return {
                loginFormDetected,
                passwordFieldCount: passwordFields.length,
                suspiciousElements: suspicious,
                pageTitle: document.title,
                pageText: document.body?.innerText?.substring(0, 5000) ?? '',
            };
        });
        return {
            ...result,
            suspiciousElements: result.suspiciousElements,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🤖 GEMINI VISION ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Analyze screenshot with Gemini Vision
     */
    async analyzeWithGeminiVision(screenshotPath, url, pageAnalysis) {
        // If no API key, use heuristic analysis
        if (!this.config.geminiApiKey) {
            return this.heuristicVisualAnalysis(url, pageAnalysis);
        }
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const { readFileSync } = await import('fs');
            const genAI = new GoogleGenerativeAI(this.config.geminiApiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const imageData = readFileSync(screenshotPath);
            const base64Image = imageData.toString('base64');
            const prompt = `Analyze this webpage screenshot for phishing indicators. 
      
URL being analyzed: ${url}
Page Title: ${pageAnalysis.pageTitle}

I need you to identify:
1. What brand/company does this page appear to impersonate? (if any)
2. Confidence level (0-100) that this is impersonating each brand
3. Is there a login form visible?
4. Any visual red flags that suggest phishing (e.g., poor quality logos, mismatched branding, unprofessional design)
5. Does the URL match the visual branding? (this is critical - e.g., PayPal branding on non-PayPal domain = PHISHING)

Respond in this JSON format:
{
  "detectedBrands": ["brand1", "brand2"],
  "brandConfidence": {"brand1": 85, "brand2": 30},
  "loginFormDetected": true,
  "suspiciousVisualElements": ["poor logo quality", "mismatched colors"],
  "visualMismatch": true,
  "mismatchDetails": ["URL shows 'paypa1-secure.com' but visual branding is PayPal"],
  "overallPhishingLikelihood": 85
}`;
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: 'image/png',
                    },
                },
            ]);
            const responseText = result.response.text();
            // Parse JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    detectedBrands: parsed.detectedBrands ?? [],
                    brandConfidence: parsed.brandConfidence ?? {},
                    loginFormDetected: parsed.loginFormDetected ?? pageAnalysis.loginFormDetected,
                    passwordFieldCount: 0,
                    suspiciousElements: (parsed.suspiciousVisualElements ?? []).map((desc) => ({
                        type: 'credential_harvester',
                        selector: 'visual',
                        description: desc,
                        severity: 'medium',
                    })),
                    visualMismatch: parsed.visualMismatch ?? false,
                    mismatchDetails: parsed.mismatchDetails ?? [],
                };
            }
        }
        catch (error) {
            this.emit('vision:error', { error });
        }
        // Fallback to heuristic analysis
        return this.heuristicVisualAnalysis(url, pageAnalysis);
    }
    /**
     * Heuristic visual analysis (when Gemini is unavailable)
     */
    heuristicVisualAnalysis(url, pageAnalysis) {
        const urlLower = url.toLowerCase();
        const titleLower = pageAnalysis.pageTitle.toLowerCase();
        const textLower = pageAnalysis.pageText.toLowerCase();
        const detectedBrands = [];
        const brandConfidence = {};
        let visualMismatch = false;
        const mismatchDetails = [];
        // Check for brand mentions in title/text vs domain
        for (const brand of this.config.knownBrands) {
            const brandLower = brand.name.toLowerCase();
            const isLegitDomain = brand.domains.some(d => urlLower.includes(d));
            // Check if brand keywords appear in page
            const keywordMatches = brand.keywords.filter(kw => titleLower.includes(kw.toLowerCase()) || textLower.includes(kw.toLowerCase())).length;
            if (keywordMatches > 0 || titleLower.includes(brandLower) || textLower.includes(brandLower)) {
                detectedBrands.push(brand.name);
                // Calculate confidence based on keyword matches
                const confidence = Math.min(90, 40 + (keywordMatches * 15));
                brandConfidence[brand.name] = confidence;
                // Check for mismatch
                if (!isLegitDomain && confidence > 50) {
                    visualMismatch = true;
                    mismatchDetails.push(`Page contains ${brand.name} branding but URL "${new URL(url).hostname}" is not a legitimate ${brand.name} domain`);
                }
            }
        }
        return {
            detectedBrands,
            brandConfidence,
            loginFormDetected: pageAnalysis.loginFormDetected,
            passwordFieldCount: 0,
            suspiciousElements: [],
            visualMismatch,
            mismatchDetails,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 RISK CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Calculate overall risk score
     */
    calculateRiskScore(domainInfo, visualAnalysis, pageAnalysis) {
        const indicators = [];
        let score = 0;
        // Domain indicators
        if (domainInfo.isIPAddress) {
            score += 25;
            indicators.push({
                type: 'ip_address_url',
                description: 'URL uses IP address instead of domain name',
                weight: 25,
                evidence: domainInfo.domain,
            });
        }
        if (domainInfo.hasTyposquatting) {
            score += 30;
            indicators.push({
                type: 'typosquatting',
                description: 'Domain appears to be typosquatting a known brand',
                weight: 30,
                evidence: domainInfo.domain,
            });
        }
        if (domainInfo.suspiciousTLD) {
            score += 15;
            indicators.push({
                type: 'suspicious_tld',
                description: 'Domain uses a TLD commonly associated with phishing',
                weight: 15,
                evidence: domainInfo.tld,
            });
        }
        if (!domainInfo.sslValid) {
            score += 20;
            indicators.push({
                type: 'no_ssl',
                description: 'Page does not use HTTPS',
                weight: 20,
                evidence: 'HTTP connection',
            });
        }
        // Visual indicators
        if (visualAnalysis.visualMismatch) {
            score += 35;
            indicators.push({
                type: 'visual_mismatch',
                description: 'Visual branding does not match the domain',
                weight: 35,
                evidence: visualAnalysis.mismatchDetails.join('; '),
            });
        }
        if (visualAnalysis.loginFormDetected && visualAnalysis.detectedBrands.length > 0) {
            const hasLegitDomain = visualAnalysis.detectedBrands.some(brand => {
                const brandSignature = this.knownBrands.get(brand.toLowerCase());
                return brandSignature?.domains.some(d => domainInfo.domain.includes(d));
            });
            if (!hasLegitDomain) {
                score += 20;
                indicators.push({
                    type: 'credential_harvesting',
                    description: 'Login form detected on non-legitimate domain',
                    weight: 20,
                    evidence: `Brands detected: ${visualAnalysis.detectedBrands.join(', ')}`,
                });
            }
        }
        // Suspicious elements
        for (const element of pageAnalysis.suspiciousElements) {
            const weight = element.severity === 'critical' ? 25 :
                element.severity === 'high' ? 15 :
                    element.severity === 'medium' ? 10 : 5;
            score += weight;
            indicators.push({
                type: element.type,
                description: element.description,
                weight,
                evidence: element.selector,
            });
        }
        // Cap at 100
        score = Math.min(100, score);
        // Determine risk level
        let level;
        if (score >= 80)
            level = 'critical';
        else if (score >= 60)
            level = 'high';
        else if (score >= 40)
            level = 'medium';
        else if (score >= 20)
            level = 'low';
        else
            level = 'safe';
        // Generate recommendation
        let recommendation;
        switch (level) {
            case 'critical':
                recommendation = '🚨 CRITICAL: This page shows strong indicators of a phishing attack. DO NOT enter any credentials. Report this URL immediately.';
                break;
            case 'high':
                recommendation = '⚠️ HIGH RISK: Multiple phishing indicators detected. Verify the URL manually and do not proceed if uncertain.';
                break;
            case 'medium':
                recommendation = '⚡ CAUTION: Some suspicious elements detected. Verify you are on the correct website before entering sensitive information.';
                break;
            case 'low':
                recommendation = '📋 LOW RISK: Minor concerns detected. The page appears mostly legitimate but exercise normal caution.';
                break;
            default:
                recommendation = '✅ SAFE: No significant phishing indicators detected. This appears to be a legitimate page.';
        }
        return {
            score,
            level,
            indicators,
            recommendation,
        };
    }
    /**
     * Calculate overall risk for multiple analyses
     */
    calculateOverallRisk(analyses) {
        if (analyses.length === 0)
            return 0;
        const maxScore = Math.max(...analyses.map(a => a.riskAssessment.score));
        const avgScore = analyses.reduce((sum, a) => sum + a.riskAssessment.score, 0) / analyses.length;
        return Math.round((maxScore * 0.7) + (avgScore * 0.3));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📝 REPORT GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate AI summary of the analysis
     */
    async generateAISummary(url, domainInfo, visualAnalysis, riskAssessment) {
        const brandStr = visualAnalysis.detectedBrands.length > 0
            ? `Detected brands: ${visualAnalysis.detectedBrands.join(', ')}.`
            : 'No specific brand impersonation detected.';
        const mismatchStr = visualAnalysis.visualMismatch
            ? `⚠️ VISUAL MISMATCH DETECTED: ${visualAnalysis.mismatchDetails.join(' ')}`
            : 'URL and visual branding appear consistent.';
        return `
🔍 PHISHING ANALYSIS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: ${url}
Domain: ${domainInfo.domain}
SSL: ${domainInfo.sslValid ? '✅ Valid' : '❌ Invalid/Missing'}

${brandStr}
${mismatchStr}

Risk Score: ${riskAssessment.score}/100 (${riskAssessment.level.toUpperCase()})
Indicators Found: ${riskAssessment.indicators.length}

${riskAssessment.recommendation}
`.trim();
    }
    /**
     * Generate recommendations based on analyses
     */
    generateRecommendations(analyses) {
        const recommendations = [];
        const highRiskCount = analyses.filter(a => a.riskAssessment.level === 'high' || a.riskAssessment.level === 'critical').length;
        if (highRiskCount > 0) {
            recommendations.push(`🚨 ${highRiskCount} high/critical risk pages detected - investigate immediately`);
        }
        const visualMismatches = analyses.filter(a => a.visualAnalysis.visualMismatch);
        if (visualMismatches.length > 0) {
            recommendations.push(`⚠️ ${visualMismatches.length} pages show brand/URL mismatches - likely phishing attempts`);
        }
        const noSSL = analyses.filter(a => !a.domainInfo.sslValid);
        if (noSSL.length > 0) {
            recommendations.push(`🔒 ${noSSL.length} pages lack SSL - credential interception risk`);
        }
        const typosquatting = analyses.filter(a => a.domainInfo.hasTyposquatting);
        if (typosquatting.length > 0) {
            recommendations.push(`📝 ${typosquatting.length} domains show typosquatting patterns`);
        }
        if (recommendations.length === 0) {
            recommendations.push('✅ No critical phishing indicators detected');
        }
        return recommendations;
    }
    /**
     * Generate full report
     */
    generateReport(target, startTime) {
        const endTime = new Date();
        const highRiskPages = this.analyses.filter(a => a.riskAssessment.level === 'high' || a.riskAssessment.level === 'critical');
        return {
            target,
            startTime,
            endTime,
            pagesScanned: this.analyses.length,
            phishingDetected: highRiskPages.length,
            highRiskPages,
            allAnalyses: this.analyses,
            overallRiskScore: this.calculateOverallRisk(this.analyses),
            recommendations: this.generateRecommendations(this.analyses),
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🧹 CLEANUP
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.analyses = [];
    }
    /**
     * Get all analyses
     */
    getAnalyses() {
        return [...this.analyses];
    }
}
//# sourceMappingURL=visual-phishing-detector.js.map