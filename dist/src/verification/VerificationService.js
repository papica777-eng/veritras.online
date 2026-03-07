"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: VERIFICATION SERVICES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * SMS, Email, OTP verification handlers for mass automation
 * Supports: SMS-Activate, 5sim, GetSMS, Temp-Mail, Guerrilla Mail
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = exports.OTPHandler = exports.EmailVerificationService = exports.SMSVerificationService = void 0;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// SMS VERIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class SMSVerificationService extends events_1.EventEmitter {
    config;
    activeNumbers = new Map();
    constructor(config) {
        super();
        this.config = {
            timeout: 300000, // 5 minutes default
            ...config
        };
    }
    /**
     * Get phone number for service
     */
    // Complexity: O(1) — lookup
    async getNumber(options) {
        const { country = 'US', service, operator } = options;
        this.emit('number:requesting', { country, service });
        try {
            const phone = await this.requestNumber(country, service, operator);
            this.activeNumbers.set(phone.id, phone);
            this.emit('number:received', phone);
            return phone;
        }
        catch (error) {
            this.emit('number:error', { error, options });
            throw error;
        }
    }
    /**
     * Wait for SMS with code
     */
    // Complexity: O(N*M) — nested iteration
    async waitForCode(phoneId, options = {}) {
        const { timeout = this.config.timeout, pattern = /\b(\d{4,8})\b/, pollInterval = 5000 } = options;
        const phone = this.activeNumbers.get(phoneId);
        if (!phone) {
            throw new Error(`Phone ${phoneId} not found`);
        }
        this.emit('sms:waiting', { phoneId, timeout });
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const messages = await this.checkMessages(phoneId);
            for (const msg of messages) {
                const match = msg.text.match(pattern);
                if (match) {
                    const code = match[1];
                    this.emit('sms:received', { phoneId, code, message: msg });
                    return code;
                }
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(pollInterval);
        }
        this.emit('sms:timeout', { phoneId });
        throw new Error(`SMS timeout for phone ${phoneId}`);
    }
    /**
     * Release phone number
     */
    // Complexity: O(1) — lookup
    async releaseNumber(phoneId, status = 'success') {
        const phone = this.activeNumbers.get(phoneId);
        if (!phone)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.setNumberStatus(phoneId, status);
        this.activeNumbers.delete(phoneId);
        this.emit('number:released', { phoneId, status });
    }
    /**
     * Get balance
     */
    // Complexity: O(1)
    async getBalance() {
        switch (this.config.provider) {
            case 'sms-activate':
                return this.smsActivateBalance();
            case '5sim':
                return this.fiveSimBalance();
            case 'getsms':
                return this.getSmsBalance();
            default:
                throw new Error(`Unknown provider: ${this.config.provider}`);
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // PROVIDER IMPLEMENTATIONS
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    async requestNumber(country, service, operator) {
        switch (this.config.provider) {
            case 'sms-activate':
                return this.smsActivateGetNumber(country, service, operator);
            case '5sim':
                return this.fiveSimGetNumber(country, service, operator);
            case 'getsms':
                return this.getSmsGetNumber(country, service);
            default:
                throw new Error(`Unknown provider: ${this.config.provider}`);
        }
    }
    // Complexity: O(1)
    async checkMessages(phoneId) {
        switch (this.config.provider) {
            case 'sms-activate':
                return this.smsActivateCheckSms(phoneId);
            case '5sim':
                return this.fiveSimCheckSms(phoneId);
            case 'getsms':
                return this.getSmsCheckSms(phoneId);
            default:
                return [];
        }
    }
    // Complexity: O(1)
    async setNumberStatus(phoneId, status) {
        switch (this.config.provider) {
            case 'sms-activate':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.smsActivateSetStatus(phoneId, status);
                break;
            case '5sim':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.fiveSimFinish(phoneId, status);
                break;
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // SMS-ACTIVATE.ORG
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — loop
    async smsActivateRequest(action, params = {}) {
        const baseUrl = this.config.baseUrl || 'https://api.sms-activate.org/stubs/handler_api.php';
        const url = new URL(baseUrl);
        url.searchParams.set('api_key', this.config.apiKey);
        url.searchParams.set('action', action);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(url.toString());
        // SAFETY: async operation — wrap in try-catch for production resilience
        const text = await response.text();
        if (text.startsWith('ACCESS_')) {
            return text;
        }
        throw new Error(`SMS-Activate error: ${text}`);
    }
    // Complexity: O(1)
    async smsActivateBalance() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.smsActivateRequest('getBalance');
        return parseFloat(result.replace('ACCESS_BALANCE:', ''));
    }
    // Complexity: O(1)
    async smsActivateGetNumber(country, service, operator) {
        const countryCode = this.getCountryCode(country, 'sms-activate');
        const params = {
            service,
            country: countryCode
        };
        if (operator) {
            params.operator = operator;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.smsActivateRequest('getNumber', params);
        const [, id, number] = result.match(/ACCESS_NUMBER:(\d+):(\d+)/) || [];
        if (!id || !number) {
            throw new Error('Failed to parse phone number response');
        }
        return {
            id,
            number: '+' + number,
            country,
            service,
            expiresAt: new Date(Date.now() + 1200000) // 20 minutes
        };
    }
    // Complexity: O(1)
    async smsActivateCheckSms(phoneId) {
        try {
            const result = await this.smsActivateRequest('getStatus', { id: phoneId });
            if (result.startsWith('STATUS_OK:')) {
                const code = result.replace('STATUS_OK:', '');
                return [{
                        id: phoneId,
                        from: 'unknown',
                        text: code,
                        code,
                        receivedAt: new Date()
                    }];
            }
            return [];
        }
        catch {
            return [];
        }
    }
    // Complexity: O(1)
    async smsActivateSetStatus(phoneId, status) {
        const statusMap = {
            'success': '6',
            'cancel': '8',
            'ban': '8'
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.smsActivateRequest('setStatus', {
            id: phoneId,
            status: statusMap[status] || '6'
        });
    }
    // ───────────────────────────────────────────────────────────────────────────
    // 5SIM.NET
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    async fiveSimRequest(endpoint, method = 'GET') {
        const baseUrl = this.config.baseUrl || 'https://5sim.net/v1';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`5sim error: ${response.statusText}`);
        }
        return response.json();
    }
    // Complexity: O(1)
    async fiveSimBalance() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.fiveSimRequest('/user/profile');
        return result.balance || 0;
    }
    // Complexity: O(1)
    async fiveSimGetNumber(country, service, operator) {
        const countryCode = this.getCountryCode(country, '5sim');
        const op = operator || 'any';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.fiveSimRequest(`/user/buy/activation/${countryCode}/${op}/${service}`);
        return {
            id: result.id.toString(),
            number: result.phone,
            country,
            operator: result.operator,
            service,
            cost: result.price,
            expiresAt: new Date(result.expires)
        };
    }
    // Complexity: O(N) — linear scan
    async fiveSimCheckSms(phoneId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.fiveSimRequest(`/user/check/${phoneId}`);
        if (result.sms && result.sms.length > 0) {
            return result.sms.map((sms) => ({
                id: sms.id || phoneId,
                from: sms.sender || 'unknown',
                text: sms.text || sms.code,
                code: sms.code,
                receivedAt: new Date(sms.date)
            }));
        }
        return [];
    }
    // Complexity: O(1)
    async fiveSimFinish(phoneId, status) {
        const action = status === 'success' ? 'finish' : 'cancel';
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.fiveSimRequest(`/user/${action}/${phoneId}`);
    }
    // ───────────────────────────────────────────────────────────────────────────
    // GETSMS.ONLINE
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — loop
    async getSmsRequest(action, params = {}) {
        const baseUrl = this.config.baseUrl || 'https://api.getsms.online/stubs/handler_api.php';
        const url = new URL(baseUrl);
        url.searchParams.set('api_key', this.config.apiKey);
        url.searchParams.set('action', action);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(url.toString());
        return response.text();
    }
    // Complexity: O(1)
    async getSmsBalance() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.getSmsRequest('getBalance');
        return parseFloat(result.replace('ACCESS_BALANCE:', ''));
    }
    // Complexity: O(1)
    async getSmsGetNumber(country, service) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.getSmsRequest('getNumber', {
            service,
            country: this.getCountryCode(country, 'getsms')
        });
        const [, id, number] = result.match(/ACCESS_NUMBER:(\d+):(\d+)/) || [];
        return {
            id,
            number: '+' + number,
            country,
            service
        };
    }
    // Complexity: O(1)
    async getSmsCheckSms(phoneId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.getSmsRequest('getStatus', { id: phoneId });
        if (result.startsWith('STATUS_OK:')) {
            const code = result.replace('STATUS_OK:', '');
            return [{
                    id: phoneId,
                    from: 'unknown',
                    text: code,
                    code,
                    receivedAt: new Date()
                }];
        }
        return [];
    }
    // ───────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    getCountryCode(country, provider) {
        const codes = {
            'sms-activate': {
                'US': '12', 'UK': '16', 'DE': '43', 'FR': '78', 'RU': '0',
                'IN': '22', 'ID': '6', 'BR': '73', 'CN': '3', 'PH': '4'
            },
            '5sim': {
                'US': 'usa', 'UK': 'england', 'DE': 'germany', 'FR': 'france', 'RU': 'russia',
                'IN': 'india', 'ID': 'indonesia', 'BR': 'brazil', 'CN': 'china', 'PH': 'philippines'
            },
            'getsms': {
                'US': '187', 'UK': '16', 'DE': '43', 'FR': '78', 'RU': '0'
            }
        };
        return codes[provider]?.[country.toUpperCase()] || country;
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.SMSVerificationService = SMSVerificationService;
// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL VERIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class EmailVerificationService extends events_1.EventEmitter {
    config;
    activeEmails = new Map();
    constructor(config) {
        super();
        this.config = config;
    }
    /**
     * Create temp email
     */
    // Complexity: O(1) — lookup
    async createEmail(options = {}) {
        this.emit('email:creating', options);
        try {
            const email = await this.generateEmail(options);
            this.activeEmails.set(email.id, email);
            this.emit('email:created', email);
            return email;
        }
        catch (error) {
            this.emit('email:error', { error, options });
            throw error;
        }
    }
    /**
     * Wait for verification email
     */
    // Complexity: O(N*M) — nested iteration
    async waitForEmail(emailId, options = {}) {
        const { timeout = 300000, fromFilter, subjectFilter, pollInterval = 5000 } = options;
        const email = this.activeEmails.get(emailId);
        if (!email) {
            throw new Error(`Email ${emailId} not found`);
        }
        this.emit('email:waiting', { emailId, timeout });
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const messages = await this.checkInbox(emailId);
            for (const msg of messages) {
                if (this.matchesFilter(msg, fromFilter, subjectFilter)) {
                    this.emit('email:received', { emailId, message: msg });
                    return msg;
                }
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(pollInterval);
        }
        this.emit('email:timeout', { emailId });
        throw new Error(`Email timeout for ${emailId}`);
    }
    /**
     * Extract code from email
     */
    // Complexity: O(1)
    async waitForCode(emailId, options = {}) {
        const { pattern = /\b(\d{4,8})\b|code[:\s]+(\w+)/i, ...emailOptions } = options;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const message = await this.waitForEmail(emailId, emailOptions);
        const text = message.html || message.body;
        const match = text.match(pattern);
        if (match) {
            return match[1] || match[2];
        }
        throw new Error('Could not extract code from email');
    }
    /**
     * Extract verification link
     */
    // Complexity: O(1)
    async waitForLink(emailId, options = {}) {
        const { linkPattern = /https?:\/\/[^\s<>"]+(?:verify|confirm|activate)[^\s<>"]+/i, ...emailOptions } = options;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const message = await this.waitForEmail(emailId, emailOptions);
        const text = message.html || message.body;
        const match = text.match(linkPattern);
        if (match) {
            return match[0];
        }
        // Fallback: find any link
        const anyLink = text.match(/https?:\/\/[^\s<>"]+/);
        if (anyLink) {
            return anyLink[0];
        }
        throw new Error('Could not extract link from email');
    }
    /**
     * Delete temp email
     */
    // Complexity: O(1)
    async deleteEmail(emailId) {
        this.activeEmails.delete(emailId);
        this.emit('email:deleted', { emailId });
    }
    // ───────────────────────────────────────────────────────────────────────────
    // PROVIDER IMPLEMENTATIONS
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    async generateEmail(options) {
        switch (this.config.provider) {
            case 'guerrilla':
                return this.guerrillaCreateEmail();
            case 'temp-mail':
                return this.tempMailCreateEmail(options);
            case 'mailinator':
                return this.mailinatorCreateEmail(options);
            case 'disposable':
            default:
                return this.disposableCreateEmail(options);
        }
    }
    // Complexity: O(1)
    async checkInbox(emailId) {
        switch (this.config.provider) {
            case 'guerrilla':
                return this.guerrillaCheckInbox(emailId);
            case 'temp-mail':
                return this.tempMailCheckInbox(emailId);
            case 'mailinator':
                return this.mailinatorCheckInbox(emailId);
            case 'disposable':
            default:
                return this.disposableCheckInbox(emailId);
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // GUERRILLA MAIL
    // ───────────────────────────────────────────────────────────────────────────
    guerrillaSession = '';
    // Complexity: O(N) — loop
    async guerrillaRequest(action, params = {}) {
        const baseUrl = 'https://api.guerrillamail.com/ajax.php';
        const url = new URL(baseUrl);
        url.searchParams.set('f', action);
        if (this.guerrillaSession) {
            url.searchParams.set('sid_token', this.guerrillaSession);
        }
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(url.toString());
        return response.json();
    }
    // Complexity: O(1)
    async guerrillaCreateEmail() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.guerrillaRequest('get_email_address');
        this.guerrillaSession = result.sid_token;
        return {
            id: result.sid_token,
            address: result.email_addr,
            domain: result.email_addr.split('@')[1],
            expiresAt: new Date(Date.now() + 3600000)
        };
    }
    // Complexity: O(N) — linear scan
    async guerrillaCheckInbox(emailId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.guerrillaRequest('check_email', {
            sid_token: emailId,
            seq: '0'
        });
        if (!result.list || result.list.length === 0) {
            return [];
        }
        return result.list.map((msg) => ({
            id: msg.mail_id,
            from: msg.mail_from,
            to: msg.mail_recipient,
            subject: msg.mail_subject,
            body: msg.mail_body || msg.mail_excerpt,
            receivedAt: new Date(msg.mail_timestamp * 1000)
        }));
    }
    // ───────────────────────────────────────────────────────────────────────────
    // TEMP-MAIL.ORG
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    async tempMailRequest(endpoint) {
        const baseUrl = 'https://api.temp-mail.org/request';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Temp-Mail error: ${response.statusText}`);
        }
        return response.json();
    }
    // Complexity: O(1)
    async tempMailCreateEmail(options) {
        // Get available domains
        // SAFETY: async operation — wrap in try-catch for production resilience
        const domains = await this.tempMailRequest('/domains/format/json/');
        const domain = options.domain || domains[0];
        // Generate random prefix
        const prefix = options.prefix || this.randomString(10);
        const address = `${prefix}@${domain}`;
        const hash = this.md5(address);
        return {
            id: hash,
            address,
            domain
        };
    }
    // Complexity: O(N) — linear scan
    async tempMailCheckInbox(emailId) {
        try {
            const result = await this.tempMailRequest(`/mail/id/${emailId}/format/json/`);
            if (!Array.isArray(result)) {
                return [];
            }
            return result.map((msg) => ({
                id: msg.mail_id,
                from: msg.mail_from,
                to: msg.mail_address,
                subject: msg.mail_subject,
                body: msg.mail_text,
                html: msg.mail_html,
                receivedAt: new Date(msg.mail_timestamp * 1000)
            }));
        }
        catch {
            return [];
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // MAILINATOR
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    async mailinatorRequest(endpoint) {
        if (!this.config.apiKey) {
            throw new Error('Mailinator requires API key');
        }
        const baseUrl = 'https://api.mailinator.com/v2';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
                'Authorization': this.config.apiKey
            }
        });
        return response.json();
    }
    // Complexity: O(1)
    async mailinatorCreateEmail(options) {
        const prefix = options.prefix || this.randomString(10);
        const domain = options.domain || this.config.domain || 'mailinator.com';
        const address = `${prefix}@${domain}`;
        return {
            id: prefix,
            address,
            domain
        };
    }
    // Complexity: O(N) — linear scan
    async mailinatorCheckInbox(emailId) {
        try {
            const domain = this.config.domain || 'mailinator.com';
            const result = await this.mailinatorRequest(`/domains/${domain}/inboxes/${emailId}/messages`);
            if (!result.msgs || result.msgs.length === 0) {
                return [];
            }
            return result.msgs.map((msg) => ({
                id: msg.id,
                from: msg.from,
                to: msg.to,
                subject: msg.subject,
                body: msg.snippet,
                receivedAt: new Date(msg.time)
            }));
        }
        catch {
            return [];
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // DISPOSABLE (FALLBACK)
    // ───────────────────────────────────────────────────────────────────────────
    disposableInbox = new Map();
    // Complexity: O(1) — lookup
    async disposableCreateEmail(options) {
        const prefix = options.prefix || this.randomString(10);
        const domain = options.domain || 'example.com';
        const address = `${prefix}@${domain}`;
        const id = this.randomString(20);
        this.disposableInbox.set(id, []);
        return {
            id,
            address,
            domain
        };
    }
    // Complexity: O(1) — lookup
    async disposableCheckInbox(emailId) {
        return this.disposableInbox.get(emailId) || [];
    }
    /**
     * Simulate receiving email (for testing)
     */
    // Complexity: O(1) — lookup
    simulateEmail(emailId, message) {
        const inbox = this.disposableInbox.get(emailId) || [];
        inbox.push({
            id: this.randomString(10),
            from: message.from || 'noreply@example.com',
            to: message.to || 'test@example.com',
            subject: message.subject || 'Test Email',
            body: message.body || '',
            html: message.html,
            receivedAt: new Date(),
            code: message.code,
            link: message.link
        });
        this.disposableInbox.set(emailId, inbox);
    }
    // ───────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    matchesFilter(msg, fromFilter, subjectFilter) {
        if (fromFilter) {
            if (typeof fromFilter === 'string') {
                if (!msg.from.toLowerCase().includes(fromFilter.toLowerCase()))
                    return false;
            }
            else {
                if (!fromFilter.test(msg.from))
                    return false;
            }
        }
        if (subjectFilter) {
            if (typeof subjectFilter === 'string') {
                if (!msg.subject.toLowerCase().includes(subjectFilter.toLowerCase()))
                    return false;
            }
            else {
                if (!subjectFilter.test(msg.subject))
                    return false;
            }
        }
        return true;
    }
    // Complexity: O(1)
    randomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
    // Complexity: O(N*M) — nested iteration
    md5(str) {
        // Simple hash for demo - in production use crypto
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EmailVerificationService = EmailVerificationService;
// ═══════════════════════════════════════════════════════════════════════════════
// OTP HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
class OTPHandler extends events_1.EventEmitter {
    smsService;
    emailService;
    constructor(options = {}) {
        super();
        if (options.sms) {
            this.smsService = new SMSVerificationService(options.sms);
        }
        if (options.email) {
            this.emailService = new EmailVerificationService(options.email);
        }
    }
    /**
     * Get OTP via SMS
     */
    // Complexity: O(1)
    async getSMSOTP(options) {
        if (!this.smsService) {
            throw new Error('SMS service not configured');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const phone = await this.smsService.getNumber({
            service: options.service,
            country: options.country
        });
        try {
            const code = await this.smsService.waitForCode(phone.id, {
                timeout: options.timeout,
                pattern: options.pattern
            });
            await this.smsService.releaseNumber(phone.id, 'success');
            return {
                code,
                source: 'sms',
                extractedAt: new Date(),
                phone
            };
        }
        catch (error) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.smsService.releaseNumber(phone.id, 'cancel');
            throw error;
        }
    }
    /**
     * Get OTP via Email
     */
    // Complexity: O(1)
    async getEmailOTP(options = {}) {
        if (!this.emailService) {
            throw new Error('Email service not configured');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const email = await this.emailService.createEmail();
        try {
            const code = await this.emailService.waitForCode(email.id, {
                timeout: options.timeout,
                pattern: options.pattern,
                fromFilter: options.fromFilter,
                subjectFilter: options.subjectFilter
            });
            return {
                code,
                source: 'email',
                extractedAt: new Date(),
                email
            };
        }
        catch (error) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.emailService.deleteEmail(email.id);
            throw error;
        }
    }
    /**
     * Get verification link via Email
     */
    // Complexity: O(1)
    async getVerificationLink(options = {}) {
        if (!this.emailService) {
            throw new Error('Email service not configured');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const email = await this.emailService.createEmail();
        try {
            const link = await this.emailService.waitForLink(email.id, {
                timeout: options.timeout,
                linkPattern: options.linkPattern,
                fromFilter: options.fromFilter,
                subjectFilter: options.subjectFilter
            });
            return { link, email };
        }
        catch (error) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.emailService.deleteEmail(email.id);
            throw error;
        }
    }
    /**
     * Generate TOTP code (Google Authenticator compatible)
     */
    // Complexity: O(N*M) — nested iteration
    generateTOTP(secret, options = {}) {
        const { digits = 6, period = 30 } = options;
        const epoch = Math.floor(Date.now() / 1000);
        const counter = Math.floor(epoch / period);
        // Simple TOTP for demo - in production use proper TOTP library
        const counterBuffer = Buffer.alloc(8);
        counterBuffer.writeBigInt64BE(BigInt(counter));
        // Simple hash-based code generation
        let hash = 0;
        const secretBytes = Buffer.from(this.base32Decode(secret));
        for (let i = 0; i < secretBytes.length; i++) {
            hash = ((hash << 5) - hash) + secretBytes[i] + counterBuffer[i % 8];
            hash = hash & hash;
        }
        const code = Math.abs(hash) % Math.pow(10, digits);
        return code.toString().padStart(digits, '0');
    }
    // Complexity: O(N) — loop
    base32Decode(input) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const output = [];
        let bits = 0;
        let value = 0;
        for (const char of input.toUpperCase()) {
            if (char === '=')
                continue;
            const idx = alphabet.indexOf(char);
            if (idx === -1)
                continue;
            value = (value << 5) | idx;
            bits += 5;
            if (bits >= 8) {
                output.push((value >>> (bits - 8)) & 0xff);
                bits -= 8;
            }
        }
        return output;
    }
}
exports.OTPHandler = OTPHandler;
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED VERIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class VerificationService {
    sms;
    email;
    otp;
    constructor(config) {
        if (config.sms) {
            this.sms = new SMSVerificationService(config.sms);
        }
        else {
            this.sms = new SMSVerificationService({
                provider: 'sms-activate',
                apiKey: ''
            });
        }
        if (config.email) {
            this.email = new EmailVerificationService(config.email);
        }
        else {
            this.email = new EmailVerificationService({
                provider: 'disposable'
            });
        }
        this.otp = new OTPHandler(config);
    }
}
exports.VerificationService = VerificationService;
exports.default = VerificationService;
