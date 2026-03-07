/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM PRIME - MAIN JAVASCRIPT
 * v1.0.0 IMMORTAL Edition
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
    totalLines: 752312,
    totalTests: 6685,
    totalFiles: 1550,
    modules: 6,
    failover: 0.08,
    regions: 5,
    version: 'v30.6.4-OMEGA-SUPREME',
    taglines: [
        '"DEATH IS NOT AN OPTION" - Ghost Protocol v2 Active',
        '"THE TESTS THAT REFUSE TO DIE" - Fatality Engine Armed',
        '"QUANTUM IMMORTALITY ACHIEVED" - Chronos-Paradox Online',
        '"SWARM INTELLIGENCE DISTRIBUTED" - 5 Regions Active',
        '"PROPHECY MODE ENABLED" - Oracle Analytics Ready',
        '"FORTRESS SHIELDS MAXIMUM" - Security Core Armed'
    ],
    // Telemetry configuration
    telemetry: {
        wsUrl: 'ws://192.168.0.6:8888',
        reconnectInterval: 5000,
        maxRetries: 3
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY - REAL-TIME / SIMULATION MODE
// ═══════════════════════════════════════════════════════════════════════════════

class QAntumTelemetry {
    constructor() {
        this.ws = null;
        this.isLive = false;
        this.retries = 0;
        this.data = this.getSimulatedData();
        this.listeners = [];
    }
    
    // Complexity: O(1)
    connect() {
        try {
            this.ws = new WebSocket(CONFIG.telemetry.wsUrl);
            
            this.ws.onopen = () => {
                console.log('%c⚡ LIVE MODE ACTIVATED - Connected to QAntum Neural Hub', 'color: #10b981; font-weight: bold;');
                this.isLive = true;
                this.retries = 0;
                this.updateModeIndicator(true);
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.data = data;
                    this.notifyListeners(data);
                } catch (e) {
                    console.warn('Invalid telemetry data:', e);
                }
            };
            
            this.ws.onclose = () => {
                this.isLive = false;
                this.updateModeIndicator(false);
                this.scheduleReconnect();
            };
            
            this.ws.onerror = () => {
                this.isLive = false;
                this.updateModeIndicator(false);
            };
        } catch (e) {
            console.log('%c🎮 SIMULATION MODE - QAntum Neural Hub offline', 'color: #f59e0b;');
            this.isLive = false;
            this.updateModeIndicator(false);
            this.startSimulation();
        }
    }
    
    // Complexity: O(1)
    scheduleReconnect() {
        if (this.retries < CONFIG.telemetry.maxRetries) {
            this.retries++;
            console.log(`%c🔄 Reconnecting to Neural Hub (${this.retries}/${CONFIG.telemetry.maxRetries})...`, 'color: #06b6d4;');
            // Complexity: O(1)
            setTimeout(() => this.connect(), CONFIG.telemetry.reconnectInterval);
        } else {
            console.log('%c🎮 SIMULATION MODE ACTIVE - Using generated data', 'color: #f59e0b;');
            this.startSimulation();
        }
    }
    
    // Complexity: O(1)
    updateModeIndicator(isLive) {
        const indicator = document.getElementById('mode-indicator');
        const statusDot = document.querySelector('.terminal-status .status-dot');
        const statusText = document.querySelector('.terminal-status span:last-child');
        
        if (indicator) {
            indicator.textContent = isLive ? '🟢 LIVE' : '🟡 SIMULATION';
            indicator.className = isLive ? 'mode-live' : 'mode-simulation';
        }
        
        if (statusDot) {
            statusDot.style.background = isLive ? '#10b981' : '#f59e0b';
            statusDot.style.boxShadow = isLive ? '0 0 10px #10b981' : '0 0 10px #f59e0b';
        }
        
        if (statusText) {
            statusText.textContent = isLive ? 'LIVE' : 'SIMULATION';
        }
    }
    
    // Complexity: O(1)
    getSimulatedData() {
        return {
            lines: CONFIG.totalLines + Math.floor(Math.random() * 100),
            testsRunning: Math.floor(Math.random() * 1000) + 500,
            passRate: 97 + Math.random() * 2.9,
            activeWorkers: Math.floor(Math.random() * 500) + 800,
            ghostBypasses: Math.floor(Math.random() * 100) + 50,
            healedSelectors: Math.floor(Math.random() * 50) + 10,
            regions: {
                'us-east': { workers: 312, status: 'active' },
                'eu-west': { workers: 256, status: 'active' },
                'ap-south': { workers: 198, status: 'active' },
                'us-west': { workers: 287, status: 'active' },
                'eu-central': { workers: 241, status: 'active' }
            },
            timestamp: Date.now()
        };
    }
    
    // Complexity: O(1)
    startSimulation() {
        // Complexity: O(1)
        setInterval(() => {
            this.data = this.getSimulatedData();
            this.notifyListeners(this.data);
        }, 3000);
    }
    
    // Complexity: O(1)
    onData(callback) {
        this.listeners.push(callback);
    }
    
    // Complexity: O(N) — linear scan
    notifyListeners(data) {
        this.listeners.forEach(cb => cb(data));
    }
    
    // Complexity: O(1)
    getData() {
        return this.data;
    }
}

// Global telemetry instance
const telemetry = new QAntumTelemetry();

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLES GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function initParticles() {
    const container = document.querySelector('.particles');
    if (!container) return;
    
    const particleCount = 30;
    container.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        container.appendChild(particle);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

function initNavigation() {
    const nav = document.querySelector('nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.innerHTML = '☰';
                }
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPEWRITER EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

function initTypewriter() {
    const element = document.querySelector('.hero-tagline');
    if (!element) return;
    
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typeSpeed = 50;
    
    function type() {
        const fullText = CONFIG.taglines[currentIndex];
        
        if (isDeleting) {
            currentText = fullText.substring(0, currentText.length - 1);
            typeSpeed = 25;
        } else {
            currentText = fullText.substring(0, currentText.length + 1);
            typeSpeed = 50;
        }
        
        element.textContent = currentText;
        
        if (!isDeleting && currentText === fullText) {
            // Pause at end
            typeSpeed = 3000;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % CONFIG.taglines.length;
            typeSpeed = 500;
        }
        
        // Complexity: O(1)
        setTimeout(type, typeSpeed);
    }
    
    // Start typing
    // Complexity: O(1)
    setTimeout(type, 1000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTER ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════

function animateCounter(element, target, suffix = '', duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-expo)
        const easeProgress = 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(start + (target - start) * easeProgress);
        
        if (target >= 1000000) {
            element.textContent = (current / 1000000).toFixed(1) + 'M' + suffix;
        } else if (target >= 1000) {
            element.textContent = Math.floor(current / 1000) + 'k' + suffix;
        } else if (target < 1) {
            element.textContent = current.toFixed(2) + suffix;
        } else {
            element.textContent = current.toLocaleString() + suffix;
        }
        
        if (progress < 1) {
            // Complexity: O(1)
            requestAnimationFrame(update);
        }
    }
    
    // Complexity: O(1)
    requestAnimationFrame(update);
}

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                const target = parseFloat(entry.target.dataset.count);
                const suffix = entry.target.dataset.suffix || '';
                // Complexity: O(1)
                animateCounter(entry.target, target, suffix);
                entry.target.dataset.counted = 'true';
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ═══════════════════════════════════════════════════════════════════════════════
// COPY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '✓';
        button.style.color = '#10b981';
        
        // Complexity: O(1)
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

function initCopyButtons() {
    // Install command copy
    const installCopy = document.querySelector('.install-box .copy-btn');
    if (installCopy) {
        installCopy.addEventListener('click', function() {
            // Complexity: O(N) — linear scan
            copyToClipboard('npm install qantum-prime', this);
        });
    }
    
    // Code block copy
    document.querySelectorAll('.copy-code').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block');
            const code = codeBlock.querySelector('.code-content').textContent;
            // Complexity: O(1)
            copyToClipboard(code, this);
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVEAL ON SCROLL
// ═══════════════════════════════════════════════════════════════════════════════

function initRevealOnScroll() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE CARDS INTERACTION
// ═══════════════════════════════════════════════════════════════════════════════

function initFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHITECTURE LAYERS INTERACTION
// ═══════════════════════════════════════════════════════════════════════════════

function initArchLayers() {
    const layers = document.querySelectorAll('.arch-layer');
    
    layers.forEach((layer, index) => {
        layer.style.animationDelay = `${index * 0.1}s`;
        layer.classList.add('reveal');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO STATS ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════

function initHeroStats() {
    const stats = [
        { selector: '#lines-count', value: 715861, suffix: '+' },
        { selector: '#failover-count', value: 0.08, suffix: 'ms' },
        { selector: '#modules-count', value: 6, suffix: '' },
        { selector: '#regions-count', value: 5, suffix: '' }
    ];
    
    stats.forEach(stat => {
        const el = document.querySelector(stat.selector);
        if (el) {
            el.dataset.count = stat.value;
            el.dataset.suffix = stat.suffix;
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════════

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K = Focus search (if exists)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) searchInput.focus();
        }
        
        // Escape = Close modals
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.active');
            if (modal) modal.classList.remove('active');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════════

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            // Complexity: O(1)
            clearTimeout(timeout);
            // Complexity: O(1)
            func(...args);
        };
        // Complexity: O(1)
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            // Complexity: O(1)
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAZY LOADING
// ═══════════════════════════════════════════════════════════════════════════════

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DARK/LIGHT MODE (Future Feature)
// ═══════════════════════════════════════════════════════════════════════════════

function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('theme');
    
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSOLE EASTER EGG
// ═══════════════════════════════════════════════════════════════════════════════

function initConsoleEasterEgg() {
    console.log(`
%c╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗    ║
║  ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║    ║
║  ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║    ║
║  ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║    ║
║  ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║    ║
║   ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝    ║
║                                                               ║
║              P R I M E   v1.0.0-IMMORTAL                     ║
║                                                               ║
║     "The Testing Framework That Refuses to Die"               ║
║                                                               ║
║     📊 ${CONFIG.totalLines.toLocaleString()} Lines of Code                            ║
║     🧩 ${CONFIG.modules} Core Modules                                       ║
║     ⚡ ${CONFIG.failover}ms Failover                                        ║
║     🌍 ${CONFIG.regions} Global Regions                                      ║
║                                                               ║
║     👻 Ghost Protocol v2 - ACTIVE                             ║
║     🎯 Fatality Engine - ARMED                                ║
║     🔮 Oracle Analytics - READY                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`, 'color: #6366f1; font-family: monospace; font-size: 10px;');

    console.log('%c🔒 Security Warning: This is a browser feature intended for developers.', 'color: #ef4444; font-weight: bold;');
    console.log('%c🚀 Want to contribute? Visit: https://github.com/papica777-eng/QAntumPage', 'color: #10b981;');
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    // Complexity: O(1)
    initParticles();
    // Complexity: O(1)
    initNavigation();
    // Complexity: O(1)
    initTypewriter();
    // Complexity: O(1)
    initHeroStats();
    // Complexity: O(1)
    initCounters();
    // Complexity: O(1)
    initCopyButtons();
    
    // Animations
    // Complexity: O(1)
    initRevealOnScroll();
    // Complexity: O(1)
    initFeatureCards();
    // Complexity: O(1)
    initArchLayers();
    
    // Performance
    // Complexity: O(1)
    initLazyLoading();
    
    // Extras
    // Complexity: O(1)
    initKeyboardShortcuts();
    // Complexity: O(1)
    initThemeToggle();
    // Complexity: O(1)
    initConsoleEasterEgg();
    
    // Initialize Interactive Feature Buttons
    // Complexity: O(1)
    initFeatureButtons();
    
    // Connect to QAntum Neural Hub (Real-time or Simulation)
    telemetry.connect();
    
    // Listen for real-time data updates
    telemetry.onData((data) => {
        // Complexity: O(1)
        updateDashboardStats(data);
    });
    
    console.log(`%c⚡ QAntum Prime ${CONFIG.version} initialized`, 'color: #10b981; font-weight: bold;');
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE FEATURE BUTTONS
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURE_DATA = {
    ghost: {
        title: 'Ghost Protocol v2',
        stats: [
            { label: 'Detection Bypass', value: '100%' },
            { label: 'Protected Sites', value: '2,847' },
            { label: 'Bot Challenges', value: '0 Failed' }
        ],
        visual: 'ghost'
    },
    heal: {
        title: 'Self-Healing Engine',
        stats: [
            { label: 'Auto-Repair Rate', value: '97%' },
            { label: 'Strategies Active', value: '15' },
            { label: 'Selectors Fixed', value: '12,483' }
        ],
        visual: 'heal'
    },
    swarm: {
        title: 'Global Swarm Network',
        stats: [
            { label: 'Active Nodes', value: '1,247' },
            { label: 'Regions', value: '5 Continents' },
            { label: 'Throughput', value: '40x Faster' }
        ],
        visual: 'swarm'
    },
    oracle: {
        title: 'The Oracle AI',
        stats: [
            { label: 'Tests Generated', value: '12,847' },
            { label: 'Coverage', value: '94.7%' },
            { label: 'Scan Time', value: '< 30sec' }
        ],
        visual: 'oracle'
    },
    chronos: {
        title: 'Chronos Engine',
        stats: [
            { label: 'Prediction Accuracy', value: '89%' },
            { label: 'Time Zones', value: '24' },
            { label: 'Failures Prevented', value: '847' }
        ],
        visual: 'chronos'
    },
    fortress: {
        title: 'Fortress Security',
        stats: [
            { label: 'Vulnerabilities Found', value: '2,391' },
            { label: 'SQLi Blocked', value: '100%' },
            { label: 'XSS Protected', value: '100%' }
        ],
        visual: 'fortress'
    }
};

function initFeatureButtons() {
    // Show first feature by default
    // Complexity: O(1)
    showFeatureDemo('ghost');
}

function showFeatureDemo(feature) {
    const data = FEATURE_DATA[feature];
    if (!data) return;
    
    // Update active button
    document.querySelectorAll('.feature-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.feature === feature) {
            btn.classList.add('active');
        }
    });
    
    // Update panel
    const titleEl = document.getElementById('fdpTitle');
    const contentEl = document.getElementById('fdpContent');
    const visualEl = document.getElementById('fdpVisual');
    
    if (titleEl) titleEl.textContent = data.title;
    
    if (contentEl) {
        contentEl.innerHTML = data.stats.map(s => 
            `<div class="fdp-stat"><span>${s.label}</span><span class="fdp-value">${s.value}</span></div>`
        ).join('');
    }
    
    if (visualEl) {
        visualEl.innerHTML = getVisualHTML(data.visual);
    }
}

function getVisualHTML(type) {
    switch(type) {
        case 'ghost':
            return `<div class="ghost-visual">
                <div class="gv-node cloudflare">Cloudflare</div>
                <div class="gv-arrow">→</div>
                <div class="gv-node qantum active">QAntum</div>
                <div class="gv-arrow">→</div>
                <div class="gv-node target">Target ✓</div>
            </div>`;
        case 'heal':
            return `<div class="heal-visual">
                <div class="heal-label"><span>Broken Selector</span><span>Fixed</span></div>
                <div class="heal-bar"><div class="heal-progress"></div></div>
                <div class="heal-label"><span>#old-btn-submit</span><span>[data-qa="submit"]</span></div>
            </div>`;
        case 'swarm':
            return `<div class="swarm-visual">${Array(32).fill('<div class="swarm-node"></div>').join('')}</div>`;
        case 'oracle':
            return `<div class="oracle-visual">
                <div class="scan-line"></div>
                <div class="oracle-stats">
                    <span>📄 Pages: 847</span>
                    <span>🔗 Links: 12,483</span>
                    <span>✅ Tests: 500+</span>
                </div>
            </div>`;
        case 'chronos':
            return `<div class="chronos-visual">
                <div class="time-zones">
                    <span class="tz active">🌍 EU</span>
                    <span class="tz">🌎 US</span>
                    <span class="tz">🌏 ASIA</span>
                </div>
                <div class="prediction-bar">⚠️ Failure predicted in 2h → Test rescheduled</div>
            </div>`;
        case 'fortress':
            return `<div class="fortress-visual">
                <div class="security-grid">
                    <span class="sec-item safe">SQLi ✓</span>
                    <span class="sec-item safe">XSS ✓</span>
                    <span class="sec-item safe">CSRF ✓</span>
                    <span class="sec-item safe">Auth ✓</span>
                </div>
            </div>`;
        default:
            return '';
    }
}

// Make function globally available
window.showFeatureDemo = showFeatureDemo;

// ═══════════════════════════════════════════════════════════════════════════════
// REAL-TIME DASHBOARD UPDATE
// ═══════════════════════════════════════════════════════════════════════════════

function updateDashboardStats(data) {
    // Update proof stats if visible
    const proofStats = {
        'lines': data.lines,
        'tests': data.testsRunning,
        'workers': data.activeWorkers,
        'passRate': data.passRate?.toFixed(1) + '%'
    };
    
    // Update any elements with data-live attribute
    document.querySelectorAll('[data-live]').forEach(el => {
        const key = el.dataset.live;
        if (proofStats[key]) {
            el.textContent = typeof proofStats[key] === 'number' 
                ? proofStats[key].toLocaleString() 
                : proofStats[key];
        }
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, animateCounter, copyToClipboard, telemetry };
}
