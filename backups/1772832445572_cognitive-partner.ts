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

import * as fs from 'fs';
import * as path from 'path';

//
//  INTERFACES
//

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: any;
}

interface ConversationMemory {
  messages: Message[];
  userPreferences: Map<string, any>;
  projectContext: Map<string, any>;
  learnings: string[];
}

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  steps: string[];
  currentStep: number;
  result?: any;
  error?: string;
}

//
//  COGNITIVE PARTNER CLASS
//

export class CognitivePartner {
  private memory: ConversationMemory;
  private memoryFile: string;
  private ollamaUrl: string;
  private model: string;
  private activeTasks: Map<string, Task> = new Map();

  constructor(ollamaUrl: string = 'http://localhost:11434', model: string = 'QAntum-supreme') {
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
  private getSystemPrompt(): string {
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
  private loadMemory(): ConversationMemory {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, 'utf-8');
        const parsed = JSON.parse(data);
        return {
          messages: parsed.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
          userPreferences: new Map(Object.entries(parsed.userPreferences || {})),
          projectContext: new Map(Object.entries(parsed.projectContext || {})),
          learnings: parsed.learnings || [],
        };
      }
    } catch (error) {
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
  private saveMemory(): void {
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
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  }

  /**
   * Add a system message
   */
  // Complexity: O(1)
  private addSystemMessage(content: string): void {
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
  private addUserMessage(content: string, context?: any): void {
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
  private addAssistantMessage(content: string): void {
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
  private getRelevantContext(userMessage: string, maxMessages: number = 10): Message[] {
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
  private analyzeIntent(message: string): {
    intent: string;
    entities: string[];
    isQuestion: boolean;
    requiresAction: boolean;
  } {
    const lowerMessage = message.toLowerCase();

    // Detect intent
    let intent = 'general';
    if (lowerMessage.includes('create') || lowerMessage.includes('generate')) {
      intent = 'create';
    } else if (lowerMessage.includes('fix') || lowerMessage.includes('debug')) {
      intent = 'debug';
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('what')) {
      intent = 'explain';
    } else if (lowerMessage.includes('refactor') || lowerMessage.includes('improve')) {
      intent = 'refactor';
    } else if (lowerMessage.includes('test')) {
      intent = 'test';
    }

    // Extract entities (simplified - in production, use NER)
    const entities: string[] = [];
    const codePatterns = /`([^`]+)`/g;
    let match;
    while ((match = codePatterns.exec(message)) !== null) {
      entities.push(match[1]);
    }

    return {
      intent,
      entities,
      isQuestion:
        message.includes('?') || lowerMessage.startsWith('what') || lowerMessage.startsWith('how'),
      requiresAction: intent !== 'general' && intent !== 'explain',
    };
  }

  /**
   * Create a task breakdown for complex requests
   */
  // Complexity: O(N*M) — nested iteration detected
  private createTaskPlan(userMessage: string, intent: string): Task {
    const taskId = `task-${Date.now()}`;
    const steps: string[] = [];

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

    const task: Task = {
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
  private async generateWithOllama(prompt: string, context: Message[]): Promise<string> {
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
    } catch (error) {
      console.error('Ollama generation error:', error);
      return 'I apologize, but I encountered an error connecting to my neural core. Please ensure Ollama is running.';
    }
  }

  /**
   * Main method: Process user message and generate cognitive response
   */
  // Complexity: O(N) — linear iteration
  async processMessage(userMessage: string, additionalContext?: any): Promise<string> {
    // Add user message to memory
    this.addUserMessage(userMessage, additionalContext);

    // Analyze intent
    const analysis = this.analyzeIntent(userMessage);
    console.log('Intent analysis:', analysis);

    // Get relevant context from history
    const context = this.getRelevantContext(userMessage);

    // For complex tasks, create a plan
    let taskPlan: Task | null = null;
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
  private learnFromInteraction(userMessage: string, response: string, analysis: any): void {
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
  getConversationHistory(limit: number = 50): Message[] {
    return this.memory.messages.slice(-limit);
  }

  /**
   * Clear conversation history (but keep learnings and preferences)
   */
  // Complexity: O(1)
  clearHistory(): void {
    this.memory.messages = [];
    this.addSystemMessage(this.getSystemPrompt());
    this.saveMemory();
  }

  /**
   * Set user preference
   */
  // Complexity: O(1) — hash/map lookup
  setPreference(key: string, value: any): void {
    this.memory.userPreferences.set(key, value);
    this.saveMemory();
  }

  /**
   * Get user preference
   */
  // Complexity: O(1) — hash/map lookup
  getPreference(key: string): any {
    return this.memory.userPreferences.get(key);
  }

  /**
   * Update project context
   */
  // Complexity: O(1) — hash/map lookup
  updateProjectContext(key: string, value: any): void {
    this.memory.projectContext.set(key, value);
    this.saveMemory();
  }

  /**
   * Get project context
   */
  // Complexity: O(1) — hash/map lookup
  getProjectContext(key: string): any {
    return this.memory.projectContext.get(key);
  }

  /**
   * Get active tasks
   */
  // Complexity: O(1)
  getActiveTasks(): Task[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Update task status
   */
  // Complexity: O(1) — hash/map lookup
  updateTaskStatus(taskId: string, status: Task['status'], result?: any, error?: string): void {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = status;
      if (result) task.result = result;
      if (error) task.error = error;
    }
  }
}

//
//  EXPORT
//

export default CognitivePartner;
