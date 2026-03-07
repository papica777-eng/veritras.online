"use strict";
/**
 * ⚛️🛡️ QANTUM ANTI-TAMPER - INTEGRITY PROTECTION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *    █████╗ ███╗   ██╗████████╗██╗      ████████╗ █████╗ ███╗   ███╗██████╗ ███████╗██████╗
 *   ██╔══██╗████╗  ██║╚══██╔══╝██║      ╚══██╔══╝██╔══██╗████╗ ████║██╔══██╗██╔════╝██╔══██╗
 *   ███████║██╔██╗ ██║   ██║   ██║         ██║   ███████║██╔████╔██║██████╔╝█████╗  ██████╔╝
 *   ██╔══██║██║╚██╗██║   ██║   ██║         ██║   ██╔══██║██║╚██╔╝██║██╔═══╝ ██╔══╝  ██╔══██╗
 *   ██║  ██║██║ ╚████║   ██║   ██║         ██║   ██║  ██║██║ ╚═╝ ██║██║     ███████╗██║  ██║
 *   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝         ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *   Anti-Debug • Anti-VM • Anti-Reverse Engineering
 *
 *   QAntum се защитава от анализ и манипулация.
 *   Всеки опит за дебъгване или стартиране в VM ще бъде засечен.
 *
 *   "If they can't see you, they can't break you."
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiTamper = void 0;
exports.getAntiTamper = getAntiTamper;
exports.createAntiTamper = createAntiTamper;
const crypto = __importStar(require("crypto"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════════════
// VM SIGNATURES DATABASE
// ═══════════════════════════════════════════════════════════════════════════════════════
const VM_SIGNATURES = [
    {
        name: 'VMware',
        indicators: ['vmware', 'vmx', 'vmci'],
        processNames: ['vmtoolsd.exe', 'vmwaretray.exe', 'vmwareuser.exe', 'vmacthlp.exe'],
        registryKeys: ['HKLM\\SOFTWARE\\VMware, Inc.\\VMware Tools'],
        files: ['C:\\Windows\\System32\\drivers\\vmhgfs.sys', 'C:\\Windows\\System32\\drivers\\vmmemctl.sys'],
        macPrefixes: ['00:0C:29', '00:50:56', '00:05:69']
    },
    {
        name: 'VirtualBox',
        indicators: ['vbox', 'virtualbox', 'oracle vm'],
        processNames: ['VBoxService.exe', 'VBoxTray.exe'],
        registryKeys: ['HKLM\\SOFTWARE\\Oracle\\VirtualBox Guest Additions'],
        files: ['C:\\Windows\\System32\\drivers\\VBoxMouse.sys', 'C:\\Windows\\System32\\drivers\\VBoxGuest.sys'],
        macPrefixes: ['08:00:27']
    },
    {
        name: 'Hyper-V',
        indicators: ['hyper-v', 'microsoft virtual', 'microsoft corporation virtual'],
        processNames: ['vmms.exe', 'vmwp.exe'],
        registryKeys: ['HKLM\\SOFTWARE\\Microsoft\\Virtual Machine\\Guest\\Parameters'],
        macPrefixes: ['00:15:5D']
    },
    {
        name: 'QEMU/KVM',
        indicators: ['qemu', 'kvm', 'bochs'],
        processNames: ['qemu-ga.exe'],
        files: ['/dev/kvm', '/sys/class/dmi/id/product_name'],
        macPrefixes: ['52:54:00']
    },
    {
        name: 'Parallels',
        indicators: ['parallels'],
        processNames: ['prl_tools.exe', 'prl_cc.exe'],
        macPrefixes: ['00:1C:42']
    },
    {
        name: 'Xen',
        indicators: ['xen'],
        processNames: ['xenservice.exe'],
        files: ['/sys/hypervisor/type']
    },
    {
        name: 'Docker',
        indicators: ['docker'],
        processNames: [],
        files: ['/.dockerenv', '/proc/1/cgroup']
    }
];
const DEBUGGER_INDICATORS = [
    // Process names
    'x64dbg.exe', 'x32dbg.exe', 'ollydbg.exe', 'ida.exe', 'ida64.exe',
    'windbg.exe', 'devenv.exe', 'immunitydebugger.exe', 'radare2.exe',
    'gdb', 'lldb', 'frida', 'ghidra',
    // Analysis tools
    'procmon.exe', 'procmon64.exe', 'procexp.exe', 'procexp64.exe',
    'wireshark.exe', 'fiddler.exe', 'charles.exe', 'mitmproxy',
    'apimonitor.exe', 'regmon.exe', 'filemon.exe',
    // Reversing tools
    'dnspy.exe', 'ilspy.exe', 'dotpeek.exe', 'de4dot.exe',
    'pestudio.exe', 'pe-bear.exe', 'cff explorer.exe'
];
const SANDBOX_INDICATORS = [
    // Sandbox environments
    'cuckoo', 'sandboxie', 'joe sandbox', 'hybrid analysis',
    'any.run', 'threatgrid', 'virustotal', 'malwarebytes',
    // Common sandbox usernames
    'sandbox', 'malware', 'virus', 'sample', 'test',
    'admin', 'user', 'john doe', 'hardware', 'currentuser'
];
// ═══════════════════════════════════════════════════════════════════════════════════════
// ANTI-TAMPER ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════
class AntiTamper extends events_1.EventEmitter {
    config;
    detections = [];
    integrityHashes = new Map();
    checkInterval = null;
    isCompromised = false;
    evasionMode = false;
    constructor(config) {
        super();
        this.config = {
            enableDebugDetection: config?.enableDebugDetection ?? true,
            enableVMDetection: config?.enableVMDetection ?? true,
            enableSandboxDetection: config?.enableSandboxDetection ?? true,
            enableIntegrityCheck: config?.enableIntegrityCheck ?? true,
            checkInterval: config?.checkInterval ?? 5000, // 5 seconds
            onDetection: config?.onDetection ?? 'evade',
            criticalFiles: config?.criticalFiles ?? [],
            allowedEnvironments: config?.allowedEnvironments ?? ['docker']
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🛡️ Initialize anti-tamper protection
     */
    // Complexity: O(N) — loop
    async initialize() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║    █████╗ ███╗   ██╗████████╗██╗      ████████╗ █████╗ ███╗   ███╗██████╗ ███████╗██████║
║   ██╔══██╗████╗  ██║╚══██╔══╝██║      ╚══██╔══╝██╔══██╗████╗ ████║██╔══██╗██╔════╝██╔══██║
║   ███████║██╔██╗ ██║   ██║   ██║         ██║   ███████║██╔████╔██║██████╔╝█████╗  ██████╔║
║   ██╔══██║██║╚██╗██║   ██║   ██║         ██║   ██╔══██║██║╚██╔╝██║██╔═══╝ ██╔══╝  ██╔══██║
║   ██║  ██║██║ ╚████║   ██║   ██║         ██║   ██║  ██║██║ ╚═╝ ██║██║     ███████╗██║  ██║
║   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝         ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚║
║                                                                                       ║
║                     Anti-Debug • Anti-VM • Integrity Shield                           ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        try {
            // Initial scan
            console.log(`[ANTI-TAMPER] 🔍 Performing initial security scan...`);
            const results = await this.performFullScan();
            if (results.length > 0) {
                console.log(`[ANTI-TAMPER] ⚠️ ${results.length} potential threats detected`);
                for (const result of results) {
                    this.handleDetection(result);
                }
                if (this.isCompromised) {
                    return false;
                }
            }
            else {
                console.log(`[ANTI-TAMPER] ✅ Environment appears clean`);
            }
            // Initialize integrity monitoring
            if (this.config.enableIntegrityCheck && this.config.criticalFiles.length > 0) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.initializeIntegrityMonitoring();
            }
            // Start continuous monitoring
            this.startMonitoring();
            console.log(`[ANTI-TAMPER] 🛡️ Protection active`);
            this.emit('initialized');
            return true;
        }
        catch (error) {
            console.error(`[ANTI-TAMPER] ❌ Initialization failed:`, error);
            this.emit('error', error);
            return false;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // DETECTION METHODS
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🔍 Perform full security scan
     */
    // Complexity: O(1)
    async performFullScan() {
        const results = [];
        if (this.config.enableDebugDetection) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const debugResult = await this.detectDebugger();
            if (debugResult.isDetected)
                results.push(debugResult);
        }
        if (this.config.enableVMDetection) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const vmResult = await this.detectVM();
            if (vmResult.isDetected)
                results.push(vmResult);
        }
        if (this.config.enableSandboxDetection) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const sandboxResult = await this.detectSandbox();
            if (sandboxResult.isDetected)
                results.push(sandboxResult);
        }
        if (this.config.enableIntegrityCheck) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const integrityResult = await this.checkIntegrity();
            if (integrityResult.isDetected)
                results.push(integrityResult);
        }
        // Additional checks
        const timingResult = this.detectTimingAnomaly();
        if (timingResult.isDetected)
            results.push(timingResult);
        this.detections = results;
        return results;
    }
    /**
     * 🔍 Detect debugger presence
     */
    // Complexity: O(N*M) — nested iteration
    async detectDebugger() {
        const indicators = [];
        let confidence = 0;
        try {
            // Check for Node.js debug mode
            if (process.env.NODE_OPTIONS?.includes('--inspect') ||
                process.env.NODE_OPTIONS?.includes('--debug')) {
                indicators.push('Node.js debug mode enabled');
                confidence += 40;
            }
            // Check for debugger breakpoints
            const startTime = Date.now();
            // Debugger detection timing attack
            const timingCheck = () => {
                const a = 1 + 1;
                return a;
            };
            for (let i = 0; i < 1000; i++)
                timingCheck();
            const elapsed = Date.now() - startTime;
            if (elapsed > 100) { // Should be < 10ms normally
                indicators.push('Timing anomaly detected (possible breakpoint)');
                confidence += 30;
            }
            // Check for inspector
            try {
                const inspector = require('inspector');
                const url = inspector.url();
                if (url) {
                    indicators.push(`Inspector connected: ${url}`);
                    confidence += 50;
                }
            }
            catch {
                // Inspector not available
            }
            // Check for debugger-attached processes (Windows)
            if (os.platform() === 'win32') {
                try {
                    const processes = (0, child_process_1.execSync)('tasklist', { encoding: 'utf8', windowsHide: true });
                    for (const debugger_ of DEBUGGER_INDICATORS) {
                        if (processes.toLowerCase().includes(debugger_.toLowerCase())) {
                            indicators.push(`Debugger process: ${debugger_}`);
                            confidence += 25;
                        }
                    }
                }
                catch {
                    // tasklist failed
                }
            }
            // Check for common debugging environment variables
            const debugEnvVars = ['DEBUG', 'VSCODE_DEBUG', 'ELECTRON_DEBUG', 'NODE_DEBUG'];
            for (const envVar of debugEnvVars) {
                if (process.env[envVar]) {
                    indicators.push(`Debug env var: ${envVar}`);
                    confidence += 15;
                }
            }
        }
        catch (error) {
            // Error during detection
        }
        return {
            isDetected: confidence >= 40,
            type: 'debugger',
            confidence: Math.min(confidence, 100),
            details: indicators.join('; ') || 'No debugger detected',
            timestamp: Date.now()
        };
    }
    /**
     * 🔍 Detect Virtual Machine
     */
    // Complexity: O(N*M) — nested iteration
    async detectVM() {
        const indicators = [];
        let confidence = 0;
        let detectedVM = '';
        try {
            // Get system info
            const cpuModel = os.cpus()[0]?.model?.toLowerCase() || '';
            const hostname = os.hostname().toLowerCase();
            const platform = os.platform();
            // Check each VM signature
            for (const vm of VM_SIGNATURES) {
                // Skip allowed environments
                if (this.config.allowedEnvironments.includes(vm.name.toLowerCase())) {
                    continue;
                }
                let vmScore = 0;
                // Check CPU model indicators
                for (const indicator of vm.indicators) {
                    if (cpuModel.includes(indicator)) {
                        vmScore += 30;
                        indicators.push(`CPU indicator: ${indicator}`);
                    }
                }
                // Check hostname
                for (const indicator of vm.indicators) {
                    if (hostname.includes(indicator)) {
                        vmScore += 20;
                        indicators.push(`Hostname indicator: ${indicator}`);
                    }
                }
                // Check for VM processes (Windows)
                if (platform === 'win32' && vm.processNames.length > 0) {
                    try {
                        const processes = (0, child_process_1.execSync)('tasklist', { encoding: 'utf8', windowsHide: true }).toLowerCase();
                        for (const proc of vm.processNames) {
                            if (processes.includes(proc.toLowerCase())) {
                                vmScore += 40;
                                indicators.push(`VM process: ${proc}`);
                            }
                        }
                    }
                    catch {
                        // tasklist failed
                    }
                }
                // Check for VM files
                if (vm.files) {
                    for (const file of vm.files) {
                        if (fs.existsSync(file)) {
                            vmScore += 30;
                            indicators.push(`VM file: ${file}`);
                        }
                    }
                }
                // Check MAC address prefixes
                if (vm.macPrefixes) {
                    const interfaces = os.networkInterfaces();
                    for (const [name, addrs] of Object.entries(interfaces)) {
                        if (!addrs)
                            continue;
                        for (const addr of addrs) {
                            if (addr.mac) {
                                for (const prefix of vm.macPrefixes) {
                                    if (addr.mac.toUpperCase().startsWith(prefix)) {
                                        vmScore += 35;
                                        indicators.push(`VM MAC prefix: ${prefix}`);
                                    }
                                }
                            }
                        }
                    }
                }
                if (vmScore > confidence) {
                    confidence = vmScore;
                    detectedVM = vm.name;
                }
            }
            // Additional generic checks
            const totalMem = os.totalmem();
            if (totalMem < 4 * 1024 * 1024 * 1024) { // Less than 4GB
                indicators.push('Low RAM (possible VM)');
                confidence += 10;
            }
            const cpuCount = os.cpus().length;
            if (cpuCount <= 2) {
                indicators.push('Low CPU count (possible VM)');
                confidence += 10;
            }
        }
        catch (error) {
            // Error during detection
        }
        return {
            isDetected: confidence >= 50,
            type: 'vm',
            confidence: Math.min(confidence, 100),
            details: detectedVM ? `Detected: ${detectedVM}. ${indicators.join('; ')}` : indicators.join('; ') || 'No VM detected',
            timestamp: Date.now()
        };
    }
    /**
     * 🔍 Detect Sandbox environment
     */
    // Complexity: O(N*M) — nested iteration
    async detectSandbox() {
        const indicators = [];
        let confidence = 0;
        try {
            const username = os.userInfo().username.toLowerCase();
            const hostname = os.hostname().toLowerCase();
            // Check username against sandbox indicators
            for (const indicator of SANDBOX_INDICATORS) {
                if (username.includes(indicator)) {
                    indicators.push(`Suspicious username: ${username}`);
                    confidence += 30;
                    break;
                }
            }
            // Check hostname
            for (const indicator of SANDBOX_INDICATORS) {
                if (hostname.includes(indicator)) {
                    indicators.push(`Suspicious hostname: ${hostname}`);
                    confidence += 25;
                    break;
                }
            }
            // Check for extremely short uptime (just booted for analysis)
            const uptime = os.uptime();
            if (uptime < 600) { // Less than 10 minutes
                indicators.push(`Short uptime: ${uptime}s`);
                confidence += 20;
            }
            // Check for typical sandbox paths (Windows)
            if (os.platform() === 'win32') {
                const sandboxPaths = [
                    'C:\\analysis',
                    'C:\\sandbox',
                    'C:\\samples',
                    'C:\\malware'
                ];
                for (const path of sandboxPaths) {
                    if (fs.existsSync(path)) {
                        indicators.push(`Sandbox path exists: ${path}`);
                        confidence += 25;
                    }
                }
            }
            // Check for lack of user documents/files
            try {
                const userHome = os.homedir();
                const documentsPath = `${userHome}/Documents`;
                if (fs.existsSync(documentsPath)) {
                    const files = fs.readdirSync(documentsPath);
                    if (files.length < 3) {
                        indicators.push('Suspiciously empty user directory');
                        confidence += 15;
                    }
                }
            }
            catch {
                // Can't read user directory
            }
            // Check screen resolution (sandboxes often have unusual resolutions)
            // This would require additional packages, so skip for now
        }
        catch (error) {
            // Error during detection
        }
        return {
            isDetected: confidence >= 40,
            type: 'sandbox',
            confidence: Math.min(confidence, 100),
            details: indicators.join('; ') || 'No sandbox detected',
            timestamp: Date.now()
        };
    }
    /**
     * 🔍 Check file integrity
     */
    // Complexity: O(N) — loop
    async checkIntegrity() {
        const indicators = [];
        let confidence = 0;
        for (const file of this.config.criticalFiles) {
            try {
                if (!fs.existsSync(file)) {
                    indicators.push(`Missing critical file: ${file}`);
                    confidence += 30;
                    continue;
                }
                const storedHash = this.integrityHashes.get(file);
                if (!storedHash)
                    continue;
                const currentContent = fs.readFileSync(file);
                const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
                const currentSize = currentContent.length;
                if (currentHash !== storedHash.hash) {
                    indicators.push(`Modified: ${file}`);
                    confidence += 50;
                }
                if (currentSize !== storedHash.size) {
                    indicators.push(`Size changed: ${file}`);
                    confidence += 40;
                }
            }
            catch (error) {
                indicators.push(`Cannot read: ${file}`);
                confidence += 20;
            }
        }
        return {
            isDetected: confidence >= 30,
            type: 'integrity',
            confidence: Math.min(confidence, 100),
            details: indicators.join('; ') || 'Integrity OK',
            timestamp: Date.now()
        };
    }
    /**
     * 🔍 Detect timing anomalies
     */
    // Complexity: O(N*M) — nested iteration
    detectTimingAnomaly() {
        const indicators = [];
        let confidence = 0;
        try {
            // Timing attack detection
            const iterations = 10000;
            const times = [];
            for (let i = 0; i < 5; i++) {
                const start = process.hrtime.bigint();
                for (let j = 0; j < iterations; j++) {
                    Math.random();
                }
                const end = process.hrtime.bigint();
                times.push(Number(end - start) / 1000000); // Convert to ms
            }
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const variance = times.reduce((acc, t) => acc + Math.pow(t - avgTime, 2), 0) / times.length;
            // High variance indicates stepping through code
            if (variance > 100) {
                indicators.push(`High timing variance: ${variance.toFixed(2)}`);
                confidence += 30;
            }
            // Abnormally slow execution
            if (avgTime > 10) {
                indicators.push(`Slow execution: ${avgTime.toFixed(2)}ms`);
                confidence += 20;
            }
        }
        catch (error) {
            // Error during timing check
        }
        return {
            isDetected: confidence >= 30,
            type: 'analysis',
            confidence: Math.min(confidence, 100),
            details: indicators.join('; ') || 'Timing OK',
            timestamp: Date.now()
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // INTEGRITY MONITORING
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Initialize file integrity monitoring
     */
    // Complexity: O(N*M) — nested iteration
    async initializeIntegrityMonitoring() {
        console.log(`[ANTI-TAMPER] 📋 Initializing integrity monitoring for ${this.config.criticalFiles.length} files`);
        for (const file of this.config.criticalFiles) {
            try {
                if (!fs.existsSync(file)) {
                    console.log(`[ANTI-TAMPER] ⚠️ Critical file not found: ${file}`);
                    continue;
                }
                const content = fs.readFileSync(file);
                const hash = crypto.createHash('sha256').update(content).digest('hex');
                this.integrityHashes.set(file, {
                    file,
                    hash,
                    size: content.length,
                    timestamp: Date.now()
                });
            }
            catch (error) {
                console.log(`[ANTI-TAMPER] ⚠️ Cannot hash: ${file}`);
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // CONTINUOUS MONITORING
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Start continuous monitoring
     */
    // Complexity: O(N) — loop
    startMonitoring() {
        if (this.checkInterval) {
            // Complexity: O(1)
            clearInterval(this.checkInterval);
        }
        this.checkInterval = setInterval(async () => {
            if (this.isCompromised)
                return;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const results = await this.performFullScan();
            for (const result of results) {
                if (!this.detections.some(d => d.type === result.type && d.details === result.details)) {
                    this.handleDetection(result);
                }
            }
        }, this.config.checkInterval);
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // DETECTION HANDLING
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🚨 Handle detection
     */
    // Complexity: O(1)
    handleDetection(result) {
        console.log(`[ANTI-TAMPER] 🚨 ${result.type.toUpperCase()} DETECTED (${result.confidence}% confidence)`);
        console.log(`   Details: ${result.details}`);
        this.emit('detection', result);
        switch (this.config.onDetection) {
            case 'warn':
                console.log(`[ANTI-TAMPER] ⚠️ Warning: ${result.type} detected`);
                break;
            case 'evade':
                this.activateEvasion();
                break;
            case 'terminate':
                this.terminate();
                break;
            case 'corrupt':
                this.corrupt();
                break;
        }
    }
    /**
     * 🥷 Activate evasion mode
     */
    // Complexity: O(1)
    activateEvasion() {
        if (this.evasionMode)
            return;
        console.log(`[ANTI-TAMPER] 🥷 Activating evasion mode...`);
        this.evasionMode = true;
        // Generate fake/noise data
        this.generateNoise();
        // Slow down execution
        this.throttleExecution();
        this.emit('evasion_activated');
    }
    /**
     * Generate noise data to confuse analysis
     */
    // Complexity: O(N*M) — nested iteration
    generateNoise() {
        // Create fake memory patterns
        const fakeData = [];
        for (let i = 0; i < 100; i++) {
            fakeData.push({
                apiKey: crypto.randomBytes(32).toString('hex'),
                password: crypto.randomBytes(16).toString('base64'),
                secret: crypto.randomBytes(64).toString('hex'),
                token: crypto.randomBytes(48).toString('base64')
            });
        }
        // Create fake function calls
        const fakeOperations = () => {
            const ops = ['encrypt', 'decrypt', 'sign', 'verify', 'hash'];
            const data = crypto.randomBytes(1024);
            for (const op of ops) {
                switch (op) {
                    case 'encrypt':
                        crypto.publicEncrypt({ key: '', padding: crypto.constants.RSA_PKCS1_PADDING }, data).toString('hex');
                        break;
                    case 'hash':
                        crypto.createHash('sha512').update(data).digest('hex');
                        break;
                }
            }
        };
        // Run fake operations periodically
        // Complexity: O(1)
        setInterval(fakeOperations, 1000);
    }
    /**
     * Throttle execution to slow analysis
     */
    // Complexity: O(1)
    throttleExecution() {
        const originalSetTimeout = global.setTimeout;
        const originalSetInterval = global.setInterval;
        // Add random delays
        global.setTimeout = ((fn, delay, ...args) => {
            const jitter = Math.random() * 500;
            return originalSetTimeout(fn, delay + jitter, ...args);
        });
        global.setInterval = ((fn, delay, ...args) => {
            const jitter = Math.random() * 200;
            return originalSetInterval(fn, delay + jitter, ...args);
        });
    }
    /**
     * 💀 Terminate execution
     */
    // Complexity: O(1)
    terminate() {
        console.log(`[ANTI-TAMPER] 💀 Terminating due to security violation...`);
        this.isCompromised = true;
        this.emit('terminated');
        // Clear sensitive data
        this.integrityHashes.clear();
        this.detections = [];
        // Exit after short delay
        // Complexity: O(1)
        setTimeout(() => process.exit(1), 500);
    }
    /**
     * 🔥 Corrupt sensitive data
     */
    // Complexity: O(N) — loop
    corrupt() {
        console.log(`[ANTI-TAMPER] 🔥 Corrupting sensitive data...`);
        this.isCompromised = true;
        // Overwrite critical files with garbage
        for (const file of this.config.criticalFiles) {
            try {
                if (fs.existsSync(file)) {
                    const garbage = crypto.randomBytes(fs.statSync(file).size);
                    fs.writeFileSync(file, garbage);
                }
            }
            catch {
                // Can't corrupt
            }
        }
        this.emit('corrupted');
        // Complexity: O(1)
        setTimeout(() => process.exit(1), 100);
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Check if system is compromised
     */
    // Complexity: O(1)
    isSystemCompromised() {
        return this.isCompromised;
    }
    /**
     * Check if in evasion mode
     */
    // Complexity: O(1)
    isInEvasionMode() {
        return this.evasionMode;
    }
    /**
     * Get all detections
     */
    // Complexity: O(1)
    getDetections() {
        return [...this.detections];
    }
    /**
     * Stop monitoring
     */
    // Complexity: O(1)
    stop() {
        if (this.checkInterval) {
            // Complexity: O(1)
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}
exports.AntiTamper = AntiTamper;
// ═══════════════════════════════════════════════════════════════════════════════════════
// SINGLETON & FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════
let defaultAntiTamper = null;
function getAntiTamper(config) {
    if (!defaultAntiTamper) {
        defaultAntiTamper = new AntiTamper(config);
    }
    return defaultAntiTamper;
}
function createAntiTamper(config) {
    return new AntiTamper(config);
}
exports.default = AntiTamper;
