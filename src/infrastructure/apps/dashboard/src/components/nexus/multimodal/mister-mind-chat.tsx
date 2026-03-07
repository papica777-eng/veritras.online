/**
 * MISTER MIND CHAT WIDGET
 * Natural Language interface from AeternaConsole.ts
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Bot, User, Sparkles, 
  Minimize2, Maximize2, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNexusStore, ThoughtType } from '@/stores/nexus-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
}

export function MisterMindChat() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Аз съм Mister Mind. Аз съм кодът, който мисли. Как мога да ти помогна?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isThinking, setIsThinking] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { triggerThought } = useNexusStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    // Complexity: O(1)
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Complexity: O(1)
    setMessages(prev => [...prev, userMessage]);
    // Complexity: O(1)
    setInput('');
    // Complexity: O(1)
    setIsThinking(true);

    try {
      // Trigger autonomous thought
      const thought = await triggerThought(input, ThoughtType.DIAGNOSTIC);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: thought.decision.action,
        timestamp: new Date(),
        action: thought.decision.outcome,
      };

      // Complexity: O(1)
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Възникна грешка при обработката. Моля опитай отново.',
        timestamp: new Date(),
      };
      // Complexity: O(1)
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Complexity: O(1)
      setIsThinking(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? 'auto' : 500,
      }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        'fixed bottom-6 right-6 w-96 rounded-xl border border-violet-500/30',
        'bg-[#0d0d14] shadow-2xl shadow-violet-500/20 overflow-hidden z-50',
        'flex flex-col'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-violet-500/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Mister Mind</h3>
            <p className="text-xs text-gray-500">AETERNA Console Interface</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-gray-400" />
            ) : (
              <Minimize2 className="h-4 w-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg shrink-0',
                    message.role === 'user' 
                      ? 'bg-violet-500/20' 
                      : 'bg-cyan-500/20'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-violet-400" />
                    ) : (
                      <Bot className="h-4 w-4 text-cyan-400" />
                    )}
                  </div>
                  
                  <div className={cn(
                    'flex-1 max-w-[80%]',
                    message.role === 'user' ? 'text-right' : ''
                  )}>
                    <div className={cn(
                      'inline-block p-3 rounded-xl text-sm',
                      message.role === 'user'
                        ? 'bg-violet-500/20 text-white'
                        : 'bg-[#12121a] border border-violet-500/20 text-gray-200'
                    )}>
                      {message.content}
                    </div>
                    {message.action && (
                      <div className="mt-1 text-xs text-gray-500">
                        Action: {message.action}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="p-2 rounded-lg bg-cyan-500/20 shrink-0">
                    <Bot className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#12121a] border border-violet-500/20">
                    <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                    <span className="text-sm text-gray-400">Мисля...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-violet-500/20 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Въведи команда или въпрос..."
                className="flex-1 px-4 py-2 rounded-lg bg-[#12121a] border border-violet-500/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'bg-gradient-to-r from-violet-500 to-cyan-500 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-2 mt-2">
              {['Статус', 'Диагностика', 'Лечение'].map((action) => (
                <button
                  key={action}
                  onClick={() => setInput(action)}
                  className="px-2 py-1 rounded text-xs bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default MisterMindChat;
