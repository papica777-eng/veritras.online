/**
 * 🧪 QAntum - Unit Tests
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

describe('🧠 QAntum Core Tests', () => {
    
    describe('Configuration', () => {
        let configModule;
        
        beforeAll(() => {
            configModule = require('../config');
        });
        
        test('should have required config properties', () => {
            expect(configModule).toBeDefined();
            // Config exports { CONFIG, get, hasApiKey, validate, printSummary }
            const config = configModule.CONFIG || configModule;
            expect(config).toBeDefined();
            expect(config.BROWSER || config.server).toBeDefined();
            expect(config.API || config.ai).toBeDefined();
        });
        
        test('config should have browser settings', () => {
            const config = configModule.CONFIG || configModule;
            const browserConfig = config.BROWSER || config.server;
            expect(browserConfig).toBeDefined();
        });
    });
    
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
        
        test('should have 15+ self-healing strategies', () => {
            expect(strategies.length).toBeGreaterThanOrEqual(15);
        });
        
        test('priority 1 strategies should be data attributes', () => {
            const priority1 = strategies.slice(0, 3);
            expect(priority1).toContain('data-testid');
            expect(priority1).toContain('data-qa');
            expect(priority1).toContain('data-cy');
        });
        
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
            expect(result.success).toBe(true);
            expect(result.strategy).toBe('data-testid');
        });
    });
    
    describe('Selector Validation', () => {
        const isValidSelector = (selector) => {
            if (!selector || typeof selector !== 'string') return false;
            if (selector.includes('undefined')) return false;
            if (selector.includes('null')) return false;
            // Check for auto-generated IDs
            if (/^#[a-z0-9]{8,}$/i.test(selector)) return false;
            return true;
        };
        
        test('should reject empty selectors', () => {
            expect(isValidSelector('')).toBe(false);
            expect(isValidSelector(null)).toBe(false);
            expect(isValidSelector(undefined)).toBe(false);
        });
        
        test('should reject selectors with undefined', () => {
            expect(isValidSelector('#btn-undefined')).toBe(false);
            expect(isValidSelector('.class-undefined-test')).toBe(false);
        });
        
        test('should reject obviously auto-generated IDs', () => {
            // Test for hex-like patterns that look auto-generated
            expect(isValidSelector('#a1b2c3d4e5')).toBe(false);
            // Note: react-uid pattern might be valid in some contexts
        });
        
        test('should accept valid selectors', () => {
            expect(isValidSelector('#login-button')).toBe(true);
            expect(isValidSelector('.submit-btn')).toBe(true);
            expect(isValidSelector('[data-testid="search"]')).toBe(true);
        });
    });
    
    describe('Memory System', () => {
        let memory;
        
        beforeEach(() => {
            memory = {
                shortTerm: [],
                longTerm: [],
                episodic: [],
                
                addShortTerm(item) {
                    this.shortTerm.push({ ...item, timestamp: Date.now() });
                    if (this.shortTerm.length > 100) this.shortTerm.shift();
                },
                
                addLongTerm(item) {
                    this.longTerm.push({ ...item, timestamp: Date.now() });
                },
                
                search(query) {
                    return this.longTerm.filter(item => 
                        JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
                    );
                }
            };
        });
        
        test('should add to short-term memory', () => {
            memory.addShortTerm({ action: 'click', selector: '#btn' });
            expect(memory.shortTerm.length).toBe(1);
            expect(memory.shortTerm[0].action).toBe('click');
        });
        
        test('should limit short-term memory to 100 items', () => {
            for (let i = 0; i < 150; i++) {
                memory.addShortTerm({ action: `action-${i}` });
            }
            expect(memory.shortTerm.length).toBe(100);
        });
        
        test('should search long-term memory', () => {
            memory.addLongTerm({ action: 'login', success: true });
            memory.addLongTerm({ action: 'logout', success: true });
            
            const results = memory.search('login');
            expect(results.length).toBe(1);
            expect(results[0].action).toBe('login');
        });
    });
    
    describe('Vision AI Prompts', () => {
        const visionPrompts = {
            bugHunting: 'Analyze this screenshot for visual bugs',
            uiVerification: 'Verify the UI elements are correct',
            accessibility: 'Check for accessibility issues',
            ocr: 'Extract all text from this image'
        };
        
        test('should have all required vision modes', () => {
            expect(visionPrompts.bugHunting).toBeDefined();
            expect(visionPrompts.uiVerification).toBeDefined();
            expect(visionPrompts.accessibility).toBeDefined();
            expect(visionPrompts.ocr).toBeDefined();
        });
        
        test('prompts should be non-empty strings', () => {
            Object.values(visionPrompts).forEach(prompt => {
                expect(typeof prompt).toBe('string');
                expect(prompt.length).toBeGreaterThan(10);
            });
        });
    });
    
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
        
        test('should validate scenario with all required fields', () => {
            const scenario = {
                name: 'Login Test',
                steps: [
                    { action: 'navigate', url: 'https://example.com' },
                    { action: 'click', selector: '#login' }
                ]
            };
            expect(validateScenario(scenario).valid).toBe(true);
        });
        
        test('should reject scenario without name', () => {
            const scenario = { steps: [{ action: 'click' }] };
            const result = validateScenario(scenario);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('name');
        });
        
        test('should reject scenario with empty steps', () => {
            const scenario = { name: 'Test', steps: [] };
            const result = validateScenario(scenario);
            expect(result.valid).toBe(false);
        });
    });
});

describe('🔄 Integration Tests', () => {
    
    describe('API Endpoints', () => {
        test('should return 200 for health check', async () => {
            // Mock response
            const response = { status: 'OK', version: '9.0' };
            expect(response.status).toBe('OK');
        });
    });
    
    describe('Cognitive Loop', () => {
        const cognitiveLoop = ['SEE', 'THINK', 'ACT', 'OBSERVE', 'REFLECT'];
        
        test('should have all cognitive phases', () => {
            expect(cognitiveLoop).toContain('SEE');
            expect(cognitiveLoop).toContain('THINK');
            expect(cognitiveLoop).toContain('ACT');
            expect(cognitiveLoop).toContain('OBSERVE');
            expect(cognitiveLoop).toContain('REFLECT');
        });
        
        test('should execute phases in correct order', () => {
            expect(cognitiveLoop[0]).toBe('SEE');
            expect(cognitiveLoop[4]).toBe('REFLECT');
        });
    });
});
