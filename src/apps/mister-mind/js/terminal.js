/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM PRIME - TERMINAL SIMULATOR
 * v1.0.0 IMMORTAL Edition
 * 
 * Simulates the QAntum Prime testing framework execution
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// TERMINAL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const TERMINAL_CONFIG = {
    typeSpeed: 20,
    lineDelay: 150,
    initialDelay: 500,
    loopDelay: 8000
};

// ═══════════════════════════════════════════════════════════════════════════════
// TERMINAL SCRIPTS
// ═══════════════════════════════════════════════════════════════════════════════

const TERMINAL_SCRIPTS = {
    default: [
        { text: '$ npm run qantum:prime', type: 'command' },
        { text: '', type: 'blank' },
        { text: '╔══════════════════════════════════════════════════════════════╗', type: 'border' },
        { text: '║   QANTUM PRIME v1.0.0-IMMORTAL                              ║', type: 'header' },
        { text: '║   "The Testing Framework That Refuses to Die"                ║', type: 'tagline' },
        { text: '╚══════════════════════════════════════════════════════════════╝', type: 'border' },
        { text: '', type: 'blank' },
        { text: '⚡ Initializing PANTHEON Architecture...', type: 'info' },
        { text: '   ├─ Chronos-Paradox Engine: <span class="success">ONLINE</span>', type: 'module' },
        { text: '   ├─ Fatality Engine: <span class="success">ARMED</span>', type: 'module' },
        { text: '   ├─ Oracle Analytics: <span class="success">READY</span>', type: 'module' },
        { text: '   ├─ Swarm Intelligence: <span class="success">5 REGIONS</span>', type: 'module' },
        { text: '   ├─ Fortress Security: <span class="success">MAXIMUM</span>', type: 'module' },
        { text: '   └─ Ghost Protocol v2: <span class="warning">ACTIVATING...</span>', type: 'module' },
        { text: '', type: 'blank' },
        { text: '🔍 Loading test discovery...', type: 'info' },
        { text: '   Found: <span class="number">2,847</span> test files', type: 'detail' },
        { text: '   Specs:  <span class="number">15,623</span> test cases', type: 'detail' },
        { text: '   Est:    <span class="number">~45 minutes</span> sequential', type: 'detail' },
        { text: '', type: 'blank' },
        { text: '🌐 SWARM MODE ENGAGED', type: 'info-highlight' },
        { text: '   Distributing across 5 regional nodes...', type: 'detail' },
        { text: '   ├─ US-EAST: <span class="success">● Connected</span> (312 workers)', type: 'region' },
        { text: '   ├─ EU-WEST: <span class="success">● Connected</span> (256 workers)', type: 'region' },
        { text: '   ├─ AP-SOUTH: <span class="success">● Connected</span> (198 workers)', type: 'region' },
        { text: '   ├─ US-WEST: <span class="success">● Connected</span> (287 workers)', type: 'region' },
        { text: '   └─ EU-CENTRAL: <span class="success">● Connected</span> (241 workers)', type: 'region' },
        { text: '', type: 'blank' },
        { text: '👻 GHOST PROTOCOL v2 ACTIVE', type: 'info-warning' },
        { text: '   State isolation: <span class="success">ENABLED</span>', type: 'detail' },
        { text: '   Zombie detection: <span class="success">ARMED</span>', type: 'detail' },
        { text: '   Auto-resurrection: <span class="success">READY</span>', type: 'detail' },
        { text: '', type: 'blank' },
        { text: '🚀 EXECUTING TESTS...', type: 'info-success' },
        { text: '', type: 'blank' },
        { text: '   <span class="dim">[████████████████████████████████████████] 100%</span>', type: 'progress' },
        { text: '', type: 'blank' },
        { text: '═══════════════════════════════════════════════════════════════', type: 'divider' },
        { text: '                     TEST RESULTS SUMMARY                       ', type: 'result-header' },
        { text: '═══════════════════════════════════════════════════════════════', type: 'divider' },
        { text: '', type: 'blank' },
        { text: '   ✅ PASSED:     <span class="success">15,618</span> (99.97%)', type: 'result' },
        { text: '   ⚠️  FLAKY:      <span class="warning">3</span> (auto-retried)', type: 'result' },
        { text: '   ❌ FAILED:     <span class="success">0</span>', type: 'result' },
        { text: '   ⏱️  DURATION:   <span class="number">3m 24s</span> (93% faster)', type: 'result' },
        { text: '', type: 'blank' },
        { text: '   💀 FATALITY: <span class="danger">0 survivors</span> - ALL BUGS ELIMINATED', type: 'fatality' },
        { text: '', type: 'blank' },
        { text: '═══════════════════════════════════════════════════════════════', type: 'divider' },
        { text: '   <span class="success-bright">✨ IMMORTALITY ACHIEVED - TESTS CANNOT DIE ✨</span>', type: 'final' },
        { text: '═══════════════════════════════════════════════════════════════', type: 'divider' }
    ],
    
    ghost: [
        { text: '$ qantum ghost --protocol=v2', type: 'command' },
        { text: '', type: 'blank' },
        { text: '👻 GHOST PROTOCOL v2.0.0', type: 'header' },
        { text: '   "What Is Dead May Never Die"', type: 'tagline' },
        { text: '', type: 'blank' },
        { text: '🔄 Test Resurrection Engine initializing...', type: 'info' },
        { text: '', type: 'blank' },
        { text: '   [SCENARIO] Simulating infrastructure failure...', type: 'scenario' },
        { text: '   ├─ Database connection: <span class="danger">LOST</span>', type: 'failure' },
        { text: '   ├─ API endpoint: <span class="danger">TIMEOUT</span>', type: 'failure' },
        { text: '   └─ Network: <span class="danger">INTERRUPTED</span>', type: 'failure' },
        { text: '', type: 'blank' },
        { text: '   👻 Ghost Protocol ENGAGING...', type: 'ghost' },
        { text: '', type: 'blank' },
        { text: '   ├─ Capturing test state snapshot...', type: 'recovery' },
        { text: '   ├─ Isolating failure context...', type: 'recovery' },
        { text: '   ├─ Spawning resurrection workers...', type: 'recovery' },
        { text: '   └─ Re-establishing connections...', type: 'recovery' },
        { text: '', type: 'blank' },
        { text: '   ✅ Database: <span class="success">RECONNECTED</span>', type: 'restored' },
        { text: '   ✅ API: <span class="success">RESTORED</span>', type: 'restored' },
        { text: '   ✅ Network: <span class="success">STABLE</span>', type: 'restored' },
        { text: '', type: 'blank' },
        { text: '   <span class="success-bright">🎉 ALL 847 TESTS RESURRECTED</span>', type: 'final' },
        { text: '   <span class="dim">Zero test failures. Zero human intervention.</span>', type: 'subtext' }
    ],
    
    fatality: [
        { text: '$ qantum fatality --mode=terminator', type: 'command' },
        { text: '', type: 'blank' },
        { text: '💀 FATALITY ENGINE v3.0', type: 'header' },
        { text: '   "FINISH HIM!"', type: 'tagline' },
        { text: '', type: 'blank' },
        { text: '🎯 Bug Hunt initiated...', type: 'info' },
        { text: '', type: 'blank' },
        { text: '   [SCAN] Analyzing codebase for vulnerabilities...', type: 'scan' },
        { text: '', type: 'blank' },
        { text: '   🐛 BUG DETECTED: Race condition in auth.js:247', type: 'bug' },
        { text: '   └─ <span class="danger">FATALITY</span> → <span class="success">ELIMINATED</span>', type: 'kill' },
        { text: '', type: 'blank' },
        { text: '   🐛 BUG DETECTED: Memory leak in cache.js:89', type: 'bug' },
        { text: '   └─ <span class="danger">FATALITY</span> → <span class="success">ELIMINATED</span>', type: 'kill' },
        { text: '', type: 'blank' },
        { text: '   🐛 BUG DETECTED: Null reference in api.js:156', type: 'bug' },
        { text: '   └─ <span class="danger">FATALITY</span> → <span class="success">ELIMINATED</span>', type: 'kill' },
        { text: '', type: 'blank' },
        { text: '═══════════════════════════════════════════════════════════════', type: 'divider' },
        { text: '   💀 <span class="danger-bright">FLAWLESS VICTORY</span>', type: 'victory' },
        { text: '   <span class="dim">3 bugs eliminated. 0 survivors.</span>', type: 'stats' },
        { text: '═══════════════════════════════════════════════════════════════', type: 'divider' }
    ],
    
    oracle: [
        { text: '$ qantum oracle --predict --analyze', type: 'command' },
        { text: '', type: 'blank' },
        { text: '🔮 ORACLE ANALYTICS ENGINE', type: 'header' },
        { text: '   "I See All Failures Before They Happen"', type: 'tagline' },
        { text: '', type: 'blank' },
        { text: '📊 Analyzing historical patterns...', type: 'info' },
        { text: '   ├─ Processing <span class="number">127,453</span> test runs', type: 'processing' },
        { text: '   ├─ Analyzing <span class="number">892</span> failure patterns', type: 'processing' },
        { text: '   └─ Computing probability matrices...', type: 'processing' },
        { text: '', type: 'blank' },
        { text: '⚠️  PROPHECY ALERT:', type: 'alert' },
        { text: '', type: 'blank' },
        { text: '   🎯 <span class="warning">HIGH RISK</span>: payment.test.js', type: 'prediction' },
        { text: '      └─ 73% chance of failure after next deploy', type: 'probability' },
        { text: '      └─ Recommendation: Add retry logic to Stripe webhook', type: 'recommendation' },
        { text: '', type: 'blank' },
        { text: '   🎯 <span class="warning">MEDIUM RISK</span>: user.test.js', type: 'prediction' },
        { text: '      └─ 45% flakiness detected (timing issues)', type: 'probability' },
        { text: '      └─ Recommendation: Increase timeout by 200ms', type: 'recommendation' },
        { text: '', type: 'blank' },
        { text: '   ✅ <span class="success">98% of tests predicted STABLE</span>', type: 'final' }
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// TERMINAL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class QAntumTerminal {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            console.error('Terminal container not found');
            return;
        }
        
        this.options = { ...TERMINAL_CONFIG, ...options };
        this.currentLine = 0;
        this.isRunning = false;
        this.scriptQueue = [];
        
        this.init();
    }
    
    // Complexity: O(1)
    init() {
        this.container.innerHTML = '';
        this.addCursor();
    }
    
    // Complexity: O(1)
    addCursor() {
        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        cursor.innerHTML = '█';
        cursor.style.animation = 'blink-cursor 1s infinite';
        this.cursor = cursor;
    }
    
    // Complexity: O(N) — loop
    async typeText(element, text, speed = this.options.typeSpeed) {
        for (let i = 0; i < text.length; i++) {
            element.innerHTML += text[i];
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(speed);
        }
    }
    
    // Complexity: O(N)
    async addLine(lineData) {
        const line = document.createElement('div');
        line.className = `terminal-line line-${lineData.type}`;
        
        // Apply styles based on type
        this.applyLineStyles(line, lineData.type);
        
        this.container.appendChild(line);
        
        // Type effect for commands
        if (lineData.type === 'command') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.typeText(line, lineData.text, this.options.typeSpeed);
        } else {
            line.innerHTML = lineData.text;
        }
        
        // Scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
        
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(this.options.lineDelay);
    }
    
    // Complexity: O(1)
    applyLineStyles(line, type) {
        const styles = {
            'command': { color: '#10b981', fontWeight: 'bold' },
            'border': { color: '#6366f1' },
            'header': { color: '#f8fafc', fontWeight: 'bold' },
            'tagline': { color: '#94a3b8', fontStyle: 'italic' },
            'info': { color: '#06b6d4' },
            'info-highlight': { color: '#f59e0b', fontWeight: 'bold' },
            'info-warning': { color: '#f59e0b' },
            'info-success': { color: '#10b981', fontWeight: 'bold' },
            'module': { color: '#94a3b8' },
            'detail': { color: '#64748b' },
            'region': { color: '#94a3b8' },
            'divider': { color: '#4f46e5' },
            'result-header': { color: '#f8fafc', fontWeight: 'bold', textAlign: 'center' },
            'result': { color: '#f8fafc' },
            'fatality': { color: '#ef4444', fontWeight: 'bold' },
            'final': { color: '#10b981', fontWeight: 'bold', textAlign: 'center' },
            'progress': { color: '#6366f1' },
            'blank': { height: '1em' },
            'scenario': { color: '#8b5cf6' },
            'failure': { color: '#ef4444' },
            'ghost': { color: '#a855f7', fontWeight: 'bold' },
            'recovery': { color: '#06b6d4' },
            'restored': { color: '#10b981' },
            'subtext': { color: '#64748b' },
            'scan': { color: '#8b5cf6' },
            'bug': { color: '#f59e0b' },
            'kill': { color: '#94a3b8' },
            'victory': { color: '#ef4444', fontWeight: 'bold', fontSize: '1.1em' },
            'stats': { color: '#64748b' },
            'alert': { color: '#f59e0b', fontWeight: 'bold' },
            'prediction': { color: '#f8fafc' },
            'probability': { color: '#64748b', paddingLeft: '2em' },
            'recommendation': { color: '#10b981', paddingLeft: '2em' },
            'processing': { color: '#94a3b8' }
        };
        
        const style = styles[type] || {};
        Object.assign(line.style, style);
    }
    
    // Complexity: O(N) — loop
    async runScript(scriptName = 'default') {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.container.innerHTML = '';
        
        const script = TERMINAL_SCRIPTS[scriptName] || TERMINAL_SCRIPTS.default;
        
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(this.options.initialDelay);
        
        for (const lineData of script) {
            if (!this.isRunning) break;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.addLine(lineData);
        }
        
        this.isRunning = false;
    }
    
    // Complexity: O(N*M) — nested iteration
    async runLoop(scriptNames = ['default']) {
        while (true) {
            for (const scriptName of scriptNames) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.runScript(scriptName);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sleep(this.options.loopDelay);
            }
        }
    }
    
    // Complexity: O(1)
    stop() {
        this.isRunning = false;
    }
    
    // Complexity: O(1)
    clear() {
        this.container.innerHTML = '';
    }
    
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TERMINAL STYLES (INJECTED)
// ═══════════════════════════════════════════════════════════════════════════════

function injectTerminalStyles() {
    const styles = `
        .terminal-line {
            white-space: pre-wrap;
            word-break: break-word;
        }
        
        .terminal-line .success { color: #10b981; }
        .terminal-line .success-bright { color: #34d399; font-weight: bold; }
        .terminal-line .warning { color: #f59e0b; }
        .terminal-line .danger { color: #ef4444; }
        .terminal-line .danger-bright { color: #f87171; font-weight: bold; }
        .terminal-line .number { color: #8b5cf6; }
        .terminal-line .dim { color: #64748b; }
        
        .terminal-cursor {
            color: #10b981;
            animation: blink-cursor 1s infinite;
        }
        
        @keyframes blink-cursor {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

function initTerminal() {
    // Complexity: O(1)
    injectTerminalStyles();
    
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        const terminal = new QAntumTerminal(terminalBody);
        
        // Start with default script, then loop through all
        terminal.runScript('default').then(() => {
            // Complexity: O(1)
            setTimeout(() => {
                terminal.runLoop(['ghost', 'fatality', 'oracle', 'default']);
            }, TERMINAL_CONFIG.loopDelay);
        });
        
        // Make terminal globally accessible
        window.qantumTerminal = terminal;
    }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminal);
} else {
    // Complexity: O(1)
    initTerminal();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QAntumTerminal, TERMINAL_SCRIPTS };
}
