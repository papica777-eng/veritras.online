// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.0.0 - RECON MODULE                                             ║
// ║  "The All-Seeing Eye" - Playwright-Powered Reconnaissance                    ║
// ║  Detects: Frameworks, Servers, APIs, Tech Stack                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { chromium, Browser, Page, Response } from 'playwright';
import type {
  ReconResult,
  TechStack,
  FrameworkInfo,
  TechnologyInfo,
  ServerInfo,
  APIEndpoint,
  SecurityHeadersAnalysis,
  SSLInfo,
  RobotsInfo,
  SitemapInfo,
  ScreenshotInfo,
  HTTPMethod,
} from '../types/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 TECHNOLOGY SIGNATURES DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

interface TechSignature {
  name: string;
  category: TechnologyInfo['category'];
  patterns: {
    html?: RegExp[];
    headers?: { name: string; pattern: RegExp }[];
    scripts?: RegExp[];
    meta?: { name: string; pattern: RegExp }[];
    cookies?: RegExp[];
    urls?: RegExp[];
  };
}

const TECH_SIGNATURES: TechSignature[] = [
  // Frontend Frameworks
  {
    name: 'React',
    category: 'framework',
    patterns: {
      html: [/data-reactroot/i, /data-react-/i, /__NEXT_DATA__/i],
      scripts: [/react\..*\.js/i, /react-dom/i],
    },
  },
  {
    name: 'Vue.js',
    category: 'framework',
    patterns: {
      html: [/data-v-[a-f0-9]/i, /v-cloak/i],
      scripts: [/vue\..*\.js/i, /vue-router/i],
    },
  },
  {
    name: 'Angular',
    category: 'framework',
    patterns: {
      html: [/ng-version/i, /ng-app/i, /_ngcontent/i, /ng-reflect/i],
      scripts: [/angular\..*\.js/i, /zone\.js/i],
    },
  },
  {
    name: 'Next.js',
    category: 'framework',
    patterns: {
      html: [/__NEXT_DATA__/i, /next\/image/i],
      scripts: [/_next\/static/i],
    },
  },
  {
    name: 'Nuxt.js',
    category: 'framework',
    patterns: {
      html: [/__NUXT__/i, /data-n-head/i],
      scripts: [/_nuxt\//i],
    },
  },
  {
    name: 'jQuery',
    category: 'framework',
    patterns: {
      scripts: [/jquery[-.].*\.js/i, /jquery\.min\.js/i],
    },
  },
  {
    name: 'Bootstrap',
    category: 'framework',
    patterns: {
      html: [/class=".*\b(container|row|col-|btn-|navbar)/i],
      scripts: [/bootstrap\..*\.js/i],
    },
  },
  {
    name: 'Tailwind CSS',
    category: 'framework',
    patterns: {
      html: [/class=".*\b(flex|grid|bg-|text-|p-|m-|w-|h-)/i],
    },
  },

  // Backend Technologies
  {
    name: 'PHP',
    category: 'language',
    patterns: {
      headers: [{ name: 'X-Powered-By', pattern: /PHP/i }],
      urls: [/\.php(\?|$)/i],
    },
  },
  {
    name: 'ASP.NET',
    category: 'framework',
    patterns: {
      headers: [{ name: 'X-Powered-By', pattern: /ASP\.NET/i }],
      urls: [/\.aspx?(\?|$)/i],
      cookies: [/ASP\.NET_SessionId/i, /\.ASPXAUTH/i],
    },
  },
  {
    name: 'Express.js',
    category: 'framework',
    patterns: {
      headers: [{ name: 'X-Powered-By', pattern: /Express/i }],
    },
  },
  {
    name: 'Django',
    category: 'framework',
    patterns: {
      cookies: [/csrftoken/i, /sessionid/i],
      headers: [{ name: 'X-Frame-Options', pattern: /SAMEORIGIN/i }],
    },
  },
  {
    name: 'Ruby on Rails',
    category: 'framework',
    patterns: {
      headers: [{ name: 'X-Powered-By', pattern: /Phusion Passenger/i }],
      meta: [{ name: 'csrf-token', pattern: /.+/ }],
      cookies: [/_session/i],
    },
  },

  // Servers
  {
    name: 'Nginx',
    category: 'other',
    patterns: {
      headers: [{ name: 'Server', pattern: /nginx/i }],
    },
  },
  {
    name: 'Apache',
    category: 'other',
    patterns: {
      headers: [{ name: 'Server', pattern: /Apache/i }],
    },
  },
  {
    name: 'IIS',
    category: 'other',
    patterns: {
      headers: [{ name: 'Server', pattern: /Microsoft-IIS/i }],
    },
  },
  {
    name: 'Cloudflare',
    category: 'cdn',
    patterns: {
      headers: [
        { name: 'Server', pattern: /cloudflare/i },
        { name: 'CF-Ray', pattern: /.+/ },
      ],
    },
  },

  // CMS/Platforms
  {
    name: 'WordPress',
    category: 'other',
    patterns: {
      html: [/wp-content/i, /wp-includes/i],
      meta: [{ name: 'generator', pattern: /WordPress/i }],
    },
  },
  {
    name: 'Drupal',
    category: 'other',
    patterns: {
      html: [/sites\/default\/files/i, /drupal\.js/i],
      headers: [{ name: 'X-Generator', pattern: /Drupal/i }],
    },
  },
  {
    name: 'Shopify',
    category: 'other',
    patterns: {
      html: [/cdn\.shopify\.com/i, /Shopify\.theme/i],
      scripts: [/shopify/i],
    },
  },
  {
    name: 'Magento',
    category: 'other',
    patterns: {
      html: [/mage\//i, /Magento_/i],
      cookies: [/frontend/i, /adminhtml/i],
    },
  },

  // Analytics
  {
    name: 'Google Analytics',
    category: 'analytics',
    patterns: {
      scripts: [/google-analytics\.com/i, /gtag\/js/i, /analytics\.js/i],
    },
  },
  {
    name: 'Google Tag Manager',
    category: 'analytics',
    patterns: {
      scripts: [/googletagmanager\.com/i],
      html: [/GTM-[A-Z0-9]+/i],
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 SECURITY HEADERS TO CHECK
// ═══════════════════════════════════════════════════════════════════════════════

const SECURITY_HEADERS = [
  {
    name: 'Strict-Transport-Security',
    severity: 'high' as const,
    recommendation: 'Enable HSTS to force HTTPS connections',
  },
  {
    name: 'Content-Security-Policy',
    severity: 'high' as const,
    recommendation: 'Implement CSP to prevent XSS and injection attacks',
  },
  {
    name: 'X-Frame-Options',
    severity: 'medium' as const,
    recommendation: 'Set to DENY or SAMEORIGIN to prevent clickjacking',
  },
  {
    name: 'X-Content-Type-Options',
    severity: 'medium' as const,
    recommendation: 'Set to nosniff to prevent MIME type sniffing',
  },
  {
    name: 'X-XSS-Protection',
    severity: 'low' as const,
    recommendation: 'Enable XSS filter (legacy browsers)',
  },
  {
    name: 'Referrer-Policy',
    severity: 'low' as const,
    recommendation: 'Set to strict-origin-when-cross-origin or stricter',
  },
  {
    name: 'Permissions-Policy',
    severity: 'medium' as const,
    recommendation: 'Restrict browser features and APIs',
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    severity: 'medium' as const,
    recommendation: 'Set to same-origin for isolation',
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    severity: 'medium' as const,
    recommendation: 'Set to same-origin to prevent cross-origin reads',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 RECON MODULE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReconConfig {
  timeout?: number;
  screenshotViewports?: Array<{ width: number; height: number }>;
  userAgent?: string;
  followRedirects?: boolean;
  maxRedirects?: number;
  outputDir?: string;
}

/**
 * Reconnaissance Module for CyberCody
 * Uses Playwright to analyze web applications and detect technology stacks
 */
export class ReconModule {
  private browser: Browser | null = null;
  private config: Required<ReconConfig>;

  constructor(config: ReconConfig = {}) {
    this.config = {
      timeout: config.timeout ?? 30000,
      screenshotViewports: config.screenshotViewports ?? [
        { width: 1920, height: 1080 },
        { width: 375, height: 812 },
      ],
      userAgent:
        config.userAgent ??
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      followRedirects: config.followRedirects ?? true,
      maxRedirects: config.maxRedirects ?? 5,
      outputDir: config.outputDir ?? './output/recon',
    };
  }

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      });
    }
  }

  /**
   * Cleanup browser instance
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Run full reconnaissance on target
   * @param targetUrl - URL to analyze
   */
  async scan(targetUrl: string): Promise<ReconResult> {
    const startTime = Date.now();
    await this.initialize();

    const context = await this.browser!.newContext({
      userAgent: this.config.userAgent,
    });

    const page = await context.newPage();
    const responses: Response[] = [];
    const apiEndpoints: APIEndpoint[] = [];

    // Collect all network responses
    page.on('response', (response) => {
      responses.push(response);
      this.extractAPIEndpoint(response, apiEndpoints);
    });

    try {
      // Navigate to target
      const mainResponse = await page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      if (!mainResponse) {
        throw new Error('Failed to load target URL');
      }

      // Gather all reconnaissance data in parallel
      const [
        _html,
        serverInfo,
        securityHeaders,
        sslInfo,
        robots,
        sitemap,
        screenshots,
        detectedTech,
      ] = await Promise.all([
        page.content(),
        this.analyzeServerInfo(mainResponse),
        this.analyzeSecurityHeaders(mainResponse),
        this.analyzeSSL(targetUrl),
        this.fetchRobotsTxt(targetUrl),
        this.fetchSitemap(targetUrl),
        this.captureScreenshots(page, targetUrl),
        this.detectTechnologies(page, mainResponse, responses),
      ]);

      // Extract API endpoints from HTML/JS
      await this.extractEndpointsFromPage(page, apiEndpoints);

      // Build tech stack
      const techStack: TechStack = {
        frontendFrameworks: detectedTech.filter((t) => t.category === 'framework') as FrameworkInfo[],
        backendTechnologies: detectedTech,
        serverInfo,
        apiEndpoints,
        platforms: detectedTech
          .filter((t) => ['cms', 'ecommerce', 'forum', 'wiki'].includes(t.category))
          .map((t) => ({
            name: t.name,
            type: 'cms' as const,
            version: t.version,
            confidence: t.confidence,
          })),
        securityHeaders,
        sslInfo,
      };

      return {
        target: targetUrl,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        techStack,
        subdomains: [],
        robots,
        sitemap,
        screenshots,
      };
    } finally {
      await context.close();
    }
  }

  /**
   * Analyze server information from response headers
   */
  private async analyzeServerInfo(response: Response): Promise<ServerInfo> {
    const headers = response.headers();
    const timing = response.request().timing();

    return {
      software: headers['server'],
      version: this.extractVersion(headers['server'] ?? ''),
      os: this.detectOS(headers),
      headers,
      responseTime: timing.responseEnd - timing.requestStart,
    };
  }

  /**
   * Extract version from server header
   */
  private extractVersion(serverHeader: string): string | undefined {
    const match = serverHeader.match(/[\d.]+/);
    return match?.[0];
  }

  /**
   * Detect OS from headers
   */
  private detectOS(headers: Record<string, string>): string | undefined {
    const serverHeader = headers['server']?.toLowerCase() ?? '';
    if (serverHeader.includes('win')) return 'Windows';
    if (serverHeader.includes('ubuntu') || serverHeader.includes('debian')) return 'Linux';
    if (serverHeader.includes('centos') || serverHeader.includes('rhel')) return 'Linux';
    return undefined;
  }

  /**
   * Analyze security headers
   */
  private async analyzeSecurityHeaders(response: Response): Promise<SecurityHeadersAnalysis> {
    const headers = response.headers();
    const results = SECURITY_HEADERS.map((header) => ({
      name: header.name,
      present: header.name.toLowerCase() in headers,
      value: headers[header.name.toLowerCase()],
      recommendation: headers[header.name.toLowerCase()] ? undefined : header.recommendation,
      severity: header.severity,
    }));

    // Calculate score (0-100)
    const presentCount = results.filter((r) => r.present).length;
    const score = Math.round((presentCount / SECURITY_HEADERS.length) * 100);

    return { score, headers: results };
  }

  /**
   * Analyze SSL/TLS configuration
   */
  private async analyzeSSL(url: string): Promise<SSLInfo> {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:') {
      return { valid: false };
    }

    // Basic SSL check - in production, use a dedicated SSL analysis library
    return {
      valid: true,
      protocol: 'TLS 1.2/1.3',
    };
  }

  /**
   * Fetch and parse robots.txt
   */
  private async fetchRobotsTxt(url: string): Promise<RobotsInfo | undefined> {
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await fetch(robotsUrl);
      if (!response.ok) return undefined;

      const raw = await response.text();
      const lines = raw.split('\n');
      const disallowed: string[] = [];
      const allowed: string[] = [];
      const sitemaps: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed.startsWith('disallow:')) {
          disallowed.push(line.substring(9).trim());
        } else if (trimmed.startsWith('allow:')) {
          allowed.push(line.substring(6).trim());
        } else if (trimmed.startsWith('sitemap:')) {
          sitemaps.push(line.substring(8).trim());
        }
      }

      return { disallowed, allowed, sitemaps, raw };
    } catch {
      return undefined;
    }
  }

  /**
   * Fetch and parse sitemap
   */
  private async fetchSitemap(url: string): Promise<SitemapInfo | undefined> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', url).toString();
      const response = await fetch(sitemapUrl);
      if (!response.ok) return undefined;

      const text = await response.text();
      const urlMatches = text.match(/<loc>([^<]+)<\/loc>/g) ?? [];
      const urls = urlMatches.map((m) => m.replace(/<\/?loc>/g, ''));

      return { urls };
    } catch {
      return undefined;
    }
  }

  /**
   * Capture screenshots at different viewports
   */
  private async captureScreenshots(
    page: Page,
    url: string
  ): Promise<ScreenshotInfo[]> {
    const screenshots: ScreenshotInfo[] = [];
    const timestamp = new Date();

    for (const viewport of this.config.screenshotViewports) {
      await page.setViewportSize(viewport);
      const filename = `${this.sanitizeFilename(url)}_${viewport.width}x${viewport.height}.png`;
      const path = `${this.config.outputDir}/${filename}`;

      // In production, actually save the screenshot
      // await page.screenshot({ path, fullPage: true });

      screenshots.push({
        url,
        path,
        viewport,
        timestamp,
      });
    }

    return screenshots;
  }

  /**
   * Detect technologies from page content and headers
   */
  private async detectTechnologies(
    page: Page,
    mainResponse: Response,
    _responses: Response[]
  ): Promise<TechnologyInfo[]> {
    const detected: TechnologyInfo[] = [];
    const html = await page.content();
    const headers = mainResponse.headers();
    const scripts = await page.$$eval('script[src]', (elements) =>
      elements.map((el) => el.getAttribute('src') ?? '')
    );

    for (const sig of TECH_SIGNATURES) {
      let confidence = 0;
      const evidence: string[] = [];

      // Check HTML patterns
      if (sig.patterns.html) {
        for (const pattern of sig.patterns.html) {
          if (pattern.test(html)) {
            confidence += 30;
            evidence.push(`HTML pattern: ${pattern.source}`);
          }
        }
      }

      // Check header patterns
      if (sig.patterns.headers) {
        for (const headerPattern of sig.patterns.headers) {
          const headerValue = headers[headerPattern.name.toLowerCase()];
          if (headerValue && headerPattern.pattern.test(headerValue)) {
            confidence += 40;
            evidence.push(`Header ${headerPattern.name}: ${headerValue}`);
          }
        }
      }

      // Check script patterns
      if (sig.patterns.scripts) {
        for (const pattern of sig.patterns.scripts) {
          for (const script of scripts) {
            if (pattern.test(script)) {
              confidence += 25;
              evidence.push(`Script: ${script}`);
            }
          }
        }
      }

      if (confidence > 0) {
        detected.push({
          name: sig.name,
          category: sig.category,
          confidence: Math.min(confidence, 100),
          evidence,
        });
      }
    }

    return detected;
  }

  /**
   * Extract API endpoints from network responses
   */
  private extractAPIEndpoint(response: Response, endpoints: APIEndpoint[]): void {
    const url = response.url();
    const method = response.request().method() as HTTPMethod;

    // Filter for API-like URLs
    if (
      url.includes('/api/') ||
      url.includes('/v1/') ||
      url.includes('/v2/') ||
      url.includes('/graphql') ||
      response.headers()['content-type']?.includes('application/json')
    ) {
      // Avoid duplicates
      if (!endpoints.some((e) => e.url === url && e.method === method)) {
        endpoints.push({
          url,
          method,
          discovered: 'js',
        });
      }
    }
  }

  /**
   * Extract endpoints from page content (links, forms, etc.)
   */
  private async extractEndpointsFromPage(
    page: Page,
    endpoints: APIEndpoint[]
  ): Promise<void> {
    // Extract from links
    const links = await page.$$eval('a[href]', (elements) =>
      elements.map((el) => el.getAttribute('href') ?? '')
    );

    for (const link of links) {
      if (link.includes('/api/') || link.includes('/v1/') || link.includes('/v2/')) {
        if (!endpoints.some((e) => e.url === link)) {
          endpoints.push({
            url: link,
            method: 'GET',
            discovered: 'html',
          });
        }
      }
    }

    // Extract from forms
    const forms = await page.$$eval('form', (elements) =>
      elements.map((el) => ({
        action: el.getAttribute('action') ?? '',
        method: (el.getAttribute('method') ?? 'GET').toUpperCase(),
      }))
    );

    for (const form of forms) {
      if (form.action && !endpoints.some((e) => e.url === form.action)) {
        endpoints.push({
          url: form.action,
          method: form.method as HTTPMethod,
          discovered: 'html',
        });
      }
    }
  }

  /**
   * Sanitize URL for use as filename
   */
  private sanitizeFilename(url: string): string {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
  }
}

export default ReconModule;
