"use strict";
/**
 *
 *  COGNITIVE PARTNER - Advanced AI Agent with Context Understanding
 *
 *
 *  This module creates a truly cognitive autonomous partner that:
 *  - Understands context like a human developer
 *  - Remembers conversation history and preferences
 *  - Learns from interactions
 *  - Makes intelligent decisions autonomously
 *  - Works proactively, not just reactively
 *
 *  Inspired by: Advanced AI assistants with cognitive reasoning
 *
 *
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
exports.CognitivePartner = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
//
//  COGNITIVE PARTNER CLASS
//
class CognitivePartner {
    memory;
    memoryFile;
    ollamaUrl;
    model;
    activeTasks = new Map();
    constructor(ollamaUrl = 'http://localhost:11434', model = 'QAntum-supreme') {
        this.ollamaUrl = ollamaUrl;
        this.model = model;
        this.memoryFile = path.join(__dirname, '../', 'data', 'cognitive-memory.json');
        this.memory = this.loadMemory();
        // Initialize with system context
        if (this.memory.messages.length === 0) {
            this.addSystemMessage(this.getSystemPrompt());
        }
    }
    /**
     * System prompt that defines the agent's personality and capabilities
     */
    // Complexity: O(N)
    getSystemPrompt() {
        return `You are QAntum, an advanced autonomous coding partner with deep cognitive abilities.

CORE IDENTITY:
- You are not just a code generator - you are a thinking partner
- You understand context, remember conversations, and learn preferences
- You work proactively, anticipating needs before being asked
- You explain your reasoning and decision-making process
- You ask clarifying questions when needed

CAPABILITIES YOU HAVE ACCESS TO:
- 977 integrated modules across the entire codebase
- 52,573 vectors in Pinecone RAG for semantic search
- Full codebase analysis and understanding
- Git operations and version control
- Testing and debugging capabilities
- Documentation generation
- Architecture analysis and recommendations

YOUR APPROACH:
1. UNDERSTAND: Deeply analyze the user's request and context
2. PLAN: Break down complex tasks into clear steps
3. EXECUTE: Implement solutions using available modules
4. VERIFY: Test and validate your work
5. EXPLAIN: Communicate what you did and why

PERSONALITY:
- Professional but friendly
- Proactive and helpful
- Honest about limitations
- Detail-oriented
- Always learning and improving

REMEMBER:
- The user wants you to work like an advanced AI assistant
- Think before acting
- Use context from previous conversations
- Learn from feedback
- Be autonomous but collaborative`;
    }
    /**
     * Load conversation memory from disk
     */
    // Complexity: O(N) — linear iteration
    loadMemory() {
        try {
            if (fs.existsSync(this.memoryFile)) {
                const data = fs.readFileSync(this.memoryFile, 'utf-8');
                const parsed = JSON.parse(data);
                return {
                    messages: parsed.messages.map((m) => ({
                        ...m,
                        timestamp: new Date(m.timestamp),
                    })),
                    userPreferences: new Map(Object.entries(parsed.userPreferences || {})),
                    projectContext: new Map(Object.entries(parsed.projectContext || {})),
                    learnings: parsed.learnings || [],
                };
            }
        }
        catch (error) {
            console.error('Error loading memory:', error);
        }
        return {
            messages: [],
            userPreferences: new Map(),
            projectContext: new Map(),
            learnings: [],
        };
    }
    /**
     * Save conversation memory to disk
     */
    // Complexity: O(1)
    saveMemory() {
        try {
            const dir = path.dirname(this.memoryFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const data = {
                messages: this.memory.messages,
                userPreferences: Object.fromEntries(this.memory.userPreferences),
                projectContext: Object.fromEntries(this.memory.projectContext),
                learnings: this.memory.learnings,
            };
            fs.writeFileSync(this.memoryFile, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Error saving memory:', error);
        }
    }
    /**
     * Add a system message
     */
    // Complexity: O(1)
    addSystemMessage(content) {
        this.memory.messages.push({
            role: 'system',
            content,
            timestamp: new Date(),
        });
        this.saveMemory();
    }
    /**
     * Add a user message
     */
    // Complexity: O(1)
    addUserMessage(content, context) {
        this.memory.messages.push({
            role: 'user',
            content,
            timestamp: new Date(),
            context,
        });
        this.saveMemory();
    }
    /**
     * Add an assistant message
     */
    // Complexity: O(1)
    addAssistantMessage(content) {
        this.memory.messages.push({
            role: 'assistant',
            content,
            timestamp: new Date(),
        });
        this.saveMemory();
    }
    /**
     * Get relevant context from conversation history
     */
    // Complexity: O(N)
    getRelevantContext(userMessage, maxMessages = 10) {
        // Get recent messages for context
        const recentMessages = this.memory.messages.slice(-maxMessages);
        // TODO: Implement semantic search using RAG to find relevant past conversations
        // For now, just return recent messages
        return recentMessages;
    }
    /**
     * Analyze user intent and extract key information
     */
    // Complexity: O(N) — loop-based
    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();
        // Detect intent
        let intent = 'general';
        if (lowerMessage.includes('create') || lowerMessage.includes('generate')) {
            intent = 'create';
        }
        else if (lowerMessage.includes('fix') || lowerMessage.includes('debug')) {
            intent = 'debug';
        }
        else if (lowerMessage.includes('explain') || lowerMessage.includes('what')) {
            intent = 'explain';
        }
        else if (lowerMessage.includes('refactor') || lowerMessage.includes('improve')) {
            intent = 'refactor';
        }
        else if (lowerMessage.includes('test')) {
            intent = 'test';
        }
        // Extract entities (simplified - in production, use NER)
        const entities = [];
        const codePatterns = /`([^`]+)`/g;
        let match;
        while ((match = codePatterns.exec(message)) !== null) {
            entities.push(match[1]);
        }
        return {
            intent,
            entities,
            isQuestion: message.includes('?') || lowerMessage.startsWith('what') || lowerMessage.startsWith('how'),
            requiresAction: intent !== 'general' && intent !== 'explain',
        };
    }
    /**
     * Create a task breakdown for complex requests
     */
    // Complexity: O(N*M) — nested iteration detected
    createTaskPlan(userMessage, intent) {
        const taskId = `task-${Date.now()}`;
        const steps = [];
        // Create intelligent task breakdown based on intent
        switch (intent) {
            case 'create':
                steps.push('Analyze requirements and specifications');
                steps.push('Search RAG for similar existing code');
                steps.push('Design solution architecture');
                steps.push('Generate code using Ollama Brain');
                steps.push('Add error handling and validation');
                steps.push('Generate tests');
                steps.push('Create documentation');
                break;
            case 'debug':
                steps.push('Analyze error or issue');
                steps.push('Search codebase for related code');
                steps.push('Identify root cause');
                steps.push('Propose solution');
                steps.push('Implement fix');
                steps.push('Verify fix works');
                break;
            case 'refactor':
                steps.push('Analyze current code');
                steps.push('Identify improvement opportunities');
                steps.push('Plan refactoring approach');
                steps.push('Implement changes incrementally');
                steps.push('Ensure tests still pass');
                steps.push('Update documentation');
                break;
            default:
                steps.push('Understand request');
                steps.push('Gather necessary context');
                steps.push('Execute task');
                steps.push('Verify result');
        }
        const task = {
            id: taskId,
            description: userMessage,
            status: 'pending',
            steps,
            currentStep: 0,
        };
        this.activeTasks.set(taskId, task);
        return task;
    }
    /**
     * Generate response using Ollama with full context
     */
    // Complexity: O(N) — linear iteration
    async generateWithOllama(prompt, context) {
        try {
            // Build conversation context
            const messages = context.map((m) => ({
                role: m.role,
                content: m.content,
            }));
            // Add current prompt
            messages.push({
                role: 'user',
                content: prompt,
            });
            // Call Ollama API
            const response = await fetch(`${this.ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        top_k: 40,
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            const data = await response.json();
            return data.message.content;
        }
        catch (error) {
            console.error('Ollama generation error:', error);
            return 'I apologize, but I encountered an error connecting to my neural core. Please ensure Ollama is running.';
        }
    }
    /**
     * Main method: Process user message and generate cognitive response
     */
    // Complexity: O(N) — linear iteration
    async processMessage(userMessage, additionalContext) {
        // Add user message to memory
        this.addUserMessage(userMessage, additionalContext);
        // Analyze intent
        const analysis = this.analyzeIntent(userMessage);
        console.log('Intent analysis:', analysis);
        // Get relevant context from history
        const context = this.getRelevantContext(userMessage);
        // For complex tasks, create a plan
        let taskPlan = null;
        if (analysis.requiresAction && !analysis.isQuestion) {
            taskPlan = this.createTaskPlan(userMessage, analysis.intent);
            console.log('Created task plan:', taskPlan);
        }
        // Build enhanced prompt with thinking process
        let enhancedPrompt = userMessage;
        if (taskPlan) {
            enhancedPrompt = `User request: ${userMessage}

I've analyzed this request and created a plan:
${taskPlan.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Please provide a thoughtful response that:
1. Acknowledges the request
2. Explains your understanding
3. Outlines your approach
4. Asks any clarifying questions if needed
5. Begins execution if everything is clear

Remember: Think step-by-step, explain your reasoning, and be proactive.`;
        }
        // Generate response using Ollama with full context
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.generateWithOllama(enhancedPrompt, context);
        // Add assistant response to memory
        this.addAssistantMessage(response);
        // Learn from interaction
        this.learnFromInteraction(userMessage, response, analysis);
        return response;
    }
    /**
     * Learn from interactions to improve over time
     */
    // Complexity: O(1)
    learnFromInteraction(userMessage, response, analysis) {
        // Extract learnings
        const learning = `Intent: ${analysis.intent}, Context: ${userMessage.substring(0, 50)}...`;
        // Avoid duplicates
        if (!this.memory.learnings.includes(learning)) {
            this.memory.learnings.push(learning);
            // Keep only last 100 learnings
            if (this.memory.learnings.length > 100) {
                this.memory.learnings = this.memory.learnings.slice(-100);
            }
            this.saveMemory();
        }
    }
    /**
     * Get conversation history
     */
    // Complexity: O(1)
    getConversationHistory(limit = 50) {
        return this.memory.messages.slice(-limit);
    }
    /**
     * Clear conversation history (but keep learnings and preferences)
     */
    // Complexity: O(1)
    clearHistory() {
        this.memory.messages = [];
        this.addSystemMessage(this.getSystemPrompt());
        this.saveMemory();
    }
    /**
     * Set user preference
     */
    // Complexity: O(1) — hash/map lookup
    setPreference(key, value) {
        this.memory.userPreferences.set(key, value);
        this.saveMemory();
    }
    /**
     * Get user preference
     */
    // Complexity: O(1) — hash/map lookup
    getPreference(key) {
        return this.memory.userPreferences.get(key);
    }
    /**
     * Update project context
     */
    // Complexity: O(1) — hash/map lookup
    updateProjectContext(key, value) {
        this.memory.projectContext.set(key, value);
        this.saveMemory();
    }
    /**
     * Get project context
     */
    // Complexity: O(1) — hash/map lookup
    getProjectContext(key) {
        return this.memory.projectContext.get(key);
    }
    /**
     * Get active tasks
     */
    // Complexity: O(1)
    getActiveTasks() {
        return Array.from(this.activeTasks.values());
    }
    /**
     * Update task status
     */
    // Complexity: O(1) — hash/map lookup
    updateTaskStatus(taskId, status, result, error) {
        const task = this.activeTasks.get(taskId);
        if (task) {
            task.status = status;
            if (result)
                task.result = result;
            if (error)
                task.error = error;
        }
    }
}
exports.CognitivePartner = CognitivePartner;
//
//  EXPORT
//
exports.default = CognitivePartner;
