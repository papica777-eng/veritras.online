"""
SEO Audit Micro-SaaS Module - Phase 2 (Zero Entropy - Pure Python)
===================================================================
Async SEO auditing service engineered with Pure Python Dataclasses and httpx.
O(1) blocking time. Self-healing network requests via Tenacity.
"""

import asyncio
import time
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse, urljoin
from dataclasses import dataclass, field
import httpx
from bs4 import BeautifulSoup
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

# ═══════════════════════════════════════════════════════════════
# STRICT TYPING (Pure Python Dataclasses) - Zero Entropy Format
# ═══════════════════════════════════════════════════════════════

@dataclass
class LinkMetrics:
    internal: int = 0
    external: int = 0
    broken: List[str] = field(default_factory=list)

@dataclass
class ImageMetrics:
    total: int = 0
    missing_alt: int = 0

@dataclass
class PerformanceMetrics:
    load_time: float = 0.0

@dataclass
class MetaTags:
    title: Optional[str] = None
    description: Optional[str] = None
    canonical: Optional[str] = None
    robots: Optional[str] = None
    viewport: Optional[str] = None
    schema_markup: int = 0

@dataclass
class SEOAuditResult:
    url: str
    timestamp: float
    score: int = 0
    issues: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    meta_tags: MetaTags = field(default_factory=MetaTags)
    headers: Dict[str, int] = field(default_factory=dict)
    links: LinkMetrics = field(default_factory=LinkMetrics)
    images: ImageMetrics = field(default_factory=ImageMetrics)
    performance: PerformanceMetrics = field(default_factory=PerformanceMetrics)
    mobile_friendly: Optional[bool] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert dataclass to dict for JSON serialization."""
        import dataclasses
        return dataclasses.asdict(self)

# ═══════════════════════════════════════════════════════════════
# ASYNC SEO AUDITOR CORE
# ═══════════════════════════════════════════════════════════════

class SEOAuditor:
    def __init__(self, url: str):
        self.url = url
        self.domain = urlparse(url).netloc
        self.result = SEOAuditResult(
            url=url,
            timestamp=time.time(),
            score=0
        )

    # Complexity: Network I/O - Self Healing Strategy Enabled
    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type((httpx.RequestError, httpx.TimeoutException))
    )
    async def _fetch_page(self, client: httpx.AsyncClient) -> httpx.Response:
        start_time = time.time()
        response = await client.get(
            self.url,
            timeout=10.0,
            headers={'User-Agent': 'QAntum/SEOAuditor/2.0 (Veritas Node)'},
            follow_redirects=True
        )
        response.raise_for_status()
        self.result.performance.load_time = time.time() - start_time
        return response

    async def audit(self) -> SEOAuditResult:
        """
        Execute an asynchronous, non-blocking SEO audit on the defined URL.
        """
        # Complexity: O(1) blocking time per URL
        async with httpx.AsyncClient(verify=False) as client:
            try:
                response = await self._fetch_page(client)
            except Exception as e:
                self.result.issues.append(f"Network Retrieval Failed: {str(e)}")
                return self.result

        # DOM parsing remains CPU bound. Complexity: O(N) where N = DOM nodes.
        soup = BeautifulSoup(response.content, 'html.parser')
        
        self._check_title(soup)
        self._check_meta_description(soup)
        self._check_headings(soup)
        self._check_images(soup)
        self._check_links(soup, str(response.url))
        self._check_canonical(soup)
        self._check_robots_meta(soup)
        self._check_viewport(soup)
        self._check_schema_markup(soup)
        self._check_performance()
        
        self._calculate_score()
        return self.result

    def _check_title(self, soup: BeautifulSoup):
        # Complexity: O(n)
        title = soup.find('title')
        if not title:
            self.result.issues.append("Missing <title> tag")
            self.result.recommendations.append("Add a descriptive title tag (50-60 characters)")
        else:
            title_text = title.get_text().strip()
            self.result.meta_tags.title = title_text
            
            if len(title_text) < 30:
                self.result.issues.append(f"Title too short ({len(title_text)} chars)")
                self.result.recommendations.append("Title should be 50-60 characters")
            elif len(title_text) > 60:
                self.result.issues.append(f"Title too long ({len(title_text)} chars)")
                self.result.recommendations.append("Shorten title to 50-60 characters")

    def _check_meta_description(self, soup: BeautifulSoup):
        # Complexity: O(n)
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if not meta_desc:
            self.result.issues.append("Missing meta description")
            self.result.recommendations.append("Add meta description (150-160 characters)")
        else:
            desc_text = meta_desc.get('content', '').strip()
            self.result.meta_tags.description = desc_text
            
            if len(desc_text) < 120:
                self.result.issues.append(f"Meta description too short ({len(desc_text)} chars)")
            elif len(desc_text) > 160:
                self.result.issues.append(f"Meta description too long ({len(desc_text)} chars)")

    def _check_headings(self, soup: BeautifulSoup):
        # Complexity: O(n)
        h1_tags = soup.find_all('h1')
        
        if len(h1_tags) == 0:
            self.result.issues.append("Missing H1 tag")
            self.result.recommendations.append("Add exactly one H1 tag per page")
        elif len(h1_tags) > 1:
            self.result.issues.append(f"Multiple H1 tags found ({len(h1_tags)})")
            self.result.recommendations.append("Use only one H1 tag per page")
        
        for level in range(1, 7):
            count = len(soup.find_all(f'h{level}'))
            self.result.headers[f"h{level}"] = count

    def _check_images(self, soup: BeautifulSoup):
        # Complexity: O(n)
        images = soup.find_all('img')
        self.result.images.total = len(images)
        
        missing_alt = sum(1 for img in images if not img.get('alt'))
        self.result.images.missing_alt = missing_alt
        
        if missing_alt > 0:
            self.result.issues.append(f"{missing_alt} images missing alt attributes")
            self.result.recommendations.append("Add descriptive alt text to all images")

    def _check_links(self, soup: BeautifulSoup, base_url: str):
        # Complexity: O(n)
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href')
            if not href:
                 continue
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            if parsed.netloc == self.domain or not parsed.netloc:
                self.result.links.internal += 1
            else:
                self.result.links.external += 1

    def _check_canonical(self, soup: BeautifulSoup):
        # Complexity: O(n)
        canonical = soup.find('link', attrs={'rel': 'canonical'})
        if canonical:
            self.result.meta_tags.canonical = canonical.get('href')
        else:
            self.result.recommendations.append("Consider adding canonical URL")

    def _check_robots_meta(self, soup: BeautifulSoup):
        # Complexity: O(n)
        robots = soup.find('meta', attrs={'name': 'robots'})
        if robots:
            self.result.meta_tags.robots = robots.get('content')

    def _check_viewport(self, soup: BeautifulSoup):
        # Complexity: O(n)
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        if viewport:
            self.result.mobile_friendly = True
            self.result.meta_tags.viewport = viewport.get('content')
        else:
            self.result.mobile_friendly = False
            self.result.issues.append("Missing viewport meta tag")
            self.result.recommendations.append("Add viewport meta tag for mobile optimization")

    def _check_schema_markup(self, soup: BeautifulSoup):
        # Complexity: O(n)
        schema_scripts = soup.find_all('script', attrs={'type': 'application/ld+json'})
        self.result.meta_tags.schema_markup = len(schema_scripts)
        if len(schema_scripts) == 0:
            self.result.recommendations.append("Consider adding Schema.org application/ld+json structured data")

    def _check_performance(self):
        # Complexity: O(1)
        load_time = self.result.performance.load_time
        if load_time > 3.0:
            self.result.issues.append(f"Slow page load time ({load_time:.2f}s)")
            self.result.recommendations.append("Optimize images and reduce HTTP transmission sizes")
        elif load_time > 2.0:
            self.result.recommendations.append("Consider optimizing page load time")

    def _calculate_score(self):
        # Complexity: O(1)
        score = 100
        score -= len(self.result.issues) * 5
        
        if self.result.meta_tags.title: score += 5
        if self.result.meta_tags.description: score += 5
        if self.result.headers.get("h1") == 1: score += 5
        if self.result.mobile_friendly: score += 10
        
        self.result.score = max(0, min(100, score))


async def run_audit_async(url: str) -> SEOAuditResult:
    """Entry point for async execution."""
    auditor = SEOAuditor(url)
    return await auditor.audit()

if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("Usage: python seo_auditor.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    result = asyncio.run(run_audit_async(url))
    print(json.dumps(result.to_dict(), indent=2))
