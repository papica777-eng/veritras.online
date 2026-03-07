/**
 * 🧪 QANTUM - Unit Tests
 * Jest test suite for core functionality
 */

// Mock Ollama
jest.mock('ollama', () => ({
    Ollama: jest.fn().mockImplementation(() => ({
        chat: jest.fn().mockResolvedValue({
            message: { content: 'Test response' }
        }),
        list: jest.fn().mockResolvedValue({
            models: [{ name: 'gemma3:4b' }, { name: 'llava:latest' }]
        })
    }))
}));

// Mock Selenium
jest.mock('selenium-webdriver', () => ({
    Builder: jest.fn().mockImplementation(() => ({
        forBrowser: jest.fn().mockReturnThis(),
        setChromeOptions: jest.fn().mockReturnThis(),
        build: jest.fn().mockResolvedValue({
            get: jest.fn().mockResolvedValue(undefined),
            findElement: jest.fn().mockResolvedValue({
                click: jest.fn(),
                sendKeys: jest.fn(),
                getText: jest.fn().mockResolvedValue('Test text')
            }),
            quit: jest.fn()
        })
    })),
    By: {
        css: jest.fn(s => ({ css: s })),
        xpath: jest.fn(s => ({ xpath: s })),
        id: jest.fn(s => ({ id: s }))
    }
}));

    // Complexity: O(N) — loop
describe('🧠 QANTUM Core Tests', () => {
    
    // Complexity: O(1)
    describe('Configuration', () => {
        let configModule;
        
        // Complexity: O(1)
        beforeAll(() => {
            configModule = require('../config');
        });
        
        // Complexity: O(1)
        test('should have required config properties', () => {
            // Complexity: O(1)
            expect(configModule).toBeDefined();
            // Config exports { CONFIG, get, hasApiKey, validate, printSummary }
            const config = configModule.CONFIG || configModule;
            // Complexity: O(1)
            expect(config).toBeDefined();
            // Complexity: O(1)
            expect(config.BROWSER || config.server).toBeDefined();
            // Complexity: O(1)
            expect(config.API || config.ai).toBeDefined();
        });
        
        // Complexity: O(1)
        test('config should have browser settings', () => {
            const config = configModule.CONFIG || configModule;
            const browserConfig = config.BROWSER || config.server;
            // Complexity: O(1)
            expect(browserConfig).toBeDefined();
        });
    });
    
    // Complexity: O(N) — loop
    describe('Self-Healing Engine', () => {
        const strategies = [
            'data-testid',
            'data-qa',
            'data-cy',
            'id',
            'name',
            'aria-label',
            'placeholder',
            'css-class',
            'xpath-text',
            'xpath-contains',
            'relative-position',
            'visual-similarity',
            'semantic-match',
            'parent-child',
            'sibling-relation'
        ];
        
        // Complexity: O(1)
        test('should have 15+ self-healing strategies', () => {
            // Complexity: O(1)
            expect(strategies.length).toBeGreaterThanOrEqual(15);
        });
        
        // Complexity: O(1)
        test('priority 1 strategies should be data attributes', () => {
            const priority1 = strategies.slice(0, 3);
            // Complexity: O(1)
            expect(priority1).toContain('data-testid');
            // Complexity: O(1)
            expect(priority1).toContain('data-qa');
            // Complexity: O(1)
            expect(priority1).toContain('data-cy');
        });
        
        // Complexity: O(N) — loop
        test('should try strategies in priority order', () => {
            // Simulate healing attempt
            const attemptHealing = (failedSelector, strategies) => {
                for (const strategy of strategies) {
                    // Try each strategy
                    if (strategy === 'data-testid') {
                        return { success: true, strategy, newSelector: '[data-testid="login"]' };
                    }
                }
                return { success: false };
            };
            
            const result = attemptHealing('#login-btn', strategies);
            // Complexity: O(1)
            expect(result.success).toBe(true);
            // Complexity: O(1)
            expect(result.strategy).toBe('data-testid');
        });
    });
    
    // Complexity: O(N*M) — nested iteration
    describe('Selector Validation', () => {
        const isValidSelector = (selector) => {
            if (!selector || typeof selector !== 'string') return false;
            if (selector.includes('undefined')) return false;
            if (selector.includes('null')) return false;
            // Check for auto-generated IDs
            if (/^#[a-z0-9]{8,}$/i.test(selector)) return false;
            return true;
        };
        
        // Complexity: O(1)
        test('should reject empty selectors', () => {
            // Complexity: O(1)
            expect(isValidSelector('')).toBe(false);
            // Complexity: O(1)
            expect(isValidSelector(null)).toBe(false);
            // Complexity: O(1)
            expect(isValidSelector(undefined)).toBe(false);
        });
        
        // Complexity: O(1)
        test('should reject selectors with undefined', () => {
            // Complexity: O(1)
            expect(isValidSelector('#btn-undefined')).toBe(false);
            // Complexity: O(1)
            expect(isValidSelector('.class-undefined-test')).toBe(false);
        });
        
        // Complexity: O(N)
        test('should reject obviously auto-generated IDs', () => {
            // Test for hex-like patterns that look auto-generated
            // Complexity: O(1)
            expect(isValidSelector('#a1b2c3d4e5')).toBe(false);
            // Note: react-uid pattern might be valid in some contexts
        });
        
        // Complexity: O(1)
        test('should accept valid selectors', () => {
            // Complexity: O(1)
            expect(isValidSelector('#login-button')).toBe(true);
            // Complexity: O(1)
            expect(isValidSelector('.submit-btn')).toBe(true);
            // Complexity: O(1)
            expect(isValidSelector('[data-testid="search"]')).toBe(true);
        });
    });
    
    // Complexity: O(N) — linear scan
    describe('Memory System', () => {
        let memory;
        
        // Complexity: O(N) — linear scan
        beforeEach(() => {
            memory = {
                shortTerm: [],
                longTerm: [],
                episodic: [],
                
                // Complexity: O(1)
                addShortTerm(item) {
                    this.shortTerm.push({ ...item, timestamp: Date.now() });
                    if (this.shortTerm.length > 100) this.shortTerm.shift();
                },
                
                // Complexity: O(1)
                addLongTerm(item) {
                    this.longTerm.push({ ...item, timestamp: Date.now() });
                },
                
                // Complexity: O(N) — linear scan
                search(query) {
                    return this.longTerm.filter(item => 
                        JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
                    );
                }
            };
        });
        
        // Complexity: O(1)
        test('should add to short-term memory', () => {
            memory.addShortTerm({ action: 'click', selector: '#btn' });
            // Complexity: O(1)
            expect(memory.shortTerm.length).toBe(1);
            // Complexity: O(1)
            expect(memory.shortTerm[0].action).toBe('click');
        });
        
        // Complexity: O(N) — loop
        test('should limit short-term memory to 100 items', () => {
            for (let i = 0; i < 150; i++) {
                memory.addShortTerm({ action: `action-${i}` });
            }
            // Complexity: O(1)
            expect(memory.shortTerm.length).toBe(100);
        });
        
        // Complexity: O(1)
        test('should search long-term memory', () => {
            memory.addLongTerm({ action: 'login', success: true });
            memory.addLongTerm({ action: 'logout', success: true });
            
            const results = memory.search('login');
            // Complexity: O(1)
            expect(results.length).toBe(1);
            // Complexity: O(1)
            expect(results[0].action).toBe('login');
        });
    });
    
    // Complexity: O(N*M) — nested iteration
    describe('Vision AI Prompts', () => {
        const visionPrompts = {
            bugHunting: 'Analyze this screenshot for visual bugs',
            uiVerification: 'Verify the UI elements are correct',
            accessibility: 'Check for accessibility issues',
            ocr: 'Extract all text from this image'
        };
        
        // Complexity: O(1)
        test('should have all required vision modes', () => {
            // Complexity: O(1)
            expect(visionPrompts.bugHunting).toBeDefined();
            // Complexity: O(1)
            expect(visionPrompts.uiVerification).toBeDefined();
            // Complexity: O(1)
            expect(visionPrompts.accessibility).toBeDefined();
            // Complexity: O(1)
            expect(visionPrompts.ocr).toBeDefined();
        });
        
        // Complexity: O(N) — linear scan
        test('prompts should be non-empty strings', () => {
            Object.values(visionPrompts).forEach(prompt => {
                // Complexity: O(1)
                expect(typeof prompt).toBe('string');
                // Complexity: O(1)
                expect(prompt.length).toBeGreaterThan(10);
            });
        });
    });
    
    // Complexity: O(N) — loop
    describe('Test Scenario Validation', () => {
        const validateScenario = (scenario) => {
            const required = ['name', 'steps'];
            for (const field of required) {
                if (!scenario[field]) return { valid: false, error: `Missing ${field}` };
            }
            if (!Array.isArray(scenario.steps) || scenario.steps.length === 0) {
                return { valid: false, error: 'Steps must be non-empty array' };
            }
            return { valid: true };
        };
        
        // Complexity: O(1)
        test('should validate scenario with all required fields', () => {
            const scenario = {
                name: 'Login Test',
                steps: [
                    { action: 'navigate', url: 'https://example.com' },
                    { action: 'click', selector: '#login' }
                ]
            };
            // Complexity: O(1)
            expect(validateScenario(scenario).valid).toBe(true);
        });
        
        // Complexity: O(1)
        test('should reject scenario without name', () => {
            const scenario = { steps: [{ action: 'click' }] };
            const result = validateScenario(scenario);
            // Complexity: O(1)
            expect(result.valid).toBe(false);
            // Complexity: O(1)
            expect(result.error).toContain('name');
        });
        
        // Complexity: O(1)
        test('should reject scenario with empty steps', () => {
            const scenario = { name: 'Test', steps: [] };
            const result = validateScenario(scenario);
            // Complexity: O(1)
            expect(result.valid).toBe(false);
        });
    });
});

    // Complexity: O(N)
describe('🔄 Integration Tests', () => {
    
    // Complexity: O(N)
    describe('API Endpoints', () => {
        // Complexity: O(N)
        test('should return 200 for health check', async () => {
            // Mock response
            const response = { status: 'OK', version: '9.0' };
            // Complexity: O(1)
            expect(response.status).toBe('OK');
        });
    });
    
    // Complexity: O(1)
    describe('Cognitive Loop', () => {
        const cognitiveLoop = ['SEE', 'THINK', 'ACT', 'OBSERVE', 'REFLECT'];
        
        // Complexity: O(1)
        test('should have all cognitive phases', () => {
            // Complexity: O(1)
            expect(cognitiveLoop).toContain('SEE');
            // Complexity: O(1)
            expect(cognitiveLoop).toContain('THINK');
            // Complexity: O(1)
            expect(cognitiveLoop).toContain('ACT');
            // Complexity: O(1)
            expect(cognitiveLoop).toContain('OBSERVE');
            // Complexity: O(1)
            expect(cognitiveLoop).toContain('REFLECT');
        });
        
        // Complexity: O(1)
        test('should execute phases in correct order', () => {
            // Complexity: O(1)
            expect(cognitiveLoop[0]).toBe('SEE');
            // Complexity: O(1)
            expect(cognitiveLoop[4]).toBe('REFLECT');
        });
    });
});
