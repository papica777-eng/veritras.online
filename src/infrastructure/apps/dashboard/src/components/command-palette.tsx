/**
 * @fileoverview Command Palette Component
 * @description Global search and command palette with cmd+k shortcut
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Search,
  LayoutDashboard,
  PlayCircle,
  FolderKanban,
  Settings,
  TestTube2,
  Sparkles,
  Wand2,
  Terminal,
  CreditCard,
  FileText,
  Zap,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

interface CommandItem {
  id: string;
  name: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'action' | 'settings';
}

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, toggleCommandPalette } = useAppStore();
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = React.useMemo(() => [
    // Navigation
    { id: 'dashboard', name: 'Go to Dashboard', icon: LayoutDashboard, action: () => router.push('/'), category: 'navigation', shortcut: 'G D' },
    { id: 'tests', name: 'Go to Test Cases', icon: TestTube2, action: () => router.push('/tests'), category: 'navigation', shortcut: 'G T' },
    { id: 'runs', name: 'Go to Test Runs', icon: PlayCircle, action: () => router.push('/runs'), category: 'navigation', shortcut: 'G R' },
    { id: 'projects', name: 'Go to Projects', icon: FolderKanban, action: () => router.push('/projects'), category: 'navigation', shortcut: 'G P' },
    { id: 'ai', name: 'AI Generator', icon: Sparkles, action: () => router.push('/generate'), category: 'navigation' },
    { id: 'healing', name: 'Self-Healing', icon: Wand2, action: () => router.push('/healing'), category: 'navigation' },
    { id: 'logs', name: 'View Logs', icon: Terminal, action: () => router.push('/logs'), category: 'navigation' },
    { id: 'settings', name: 'Settings', icon: Settings, action: () => router.push('/settings'), category: 'navigation', shortcut: 'G S' },
    { id: 'billing', name: 'Billing', icon: CreditCard, action: () => router.push('/billing'), category: 'navigation' },
    // Actions
    { id: 'new-test', name: 'Create New Test', description: 'Start a new test case', icon: FileText, action: () => router.push('/tests/new'), category: 'action' },
    { id: 'run-tests', name: 'Run All Tests', description: 'Execute all test suites', icon: Zap, action: () => console.log('Run tests'), category: 'action' },
  ], [router]);

  const filteredCommands = React.useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Keyboard shortcut to open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Complexity: O(1)
        toggleCommandPalette();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  // Focus input when opened
  React.useEffect(() => {
    if (commandPaletteOpen) {
      // Complexity: O(1)
      setTimeout(() => inputRef.current?.focus(), 0);
      // Complexity: O(1)
      setQuery('');
    }
  }, [commandPaletteOpen]);

  const handleSelect = (command: CommandItem) => {
    command.action();
    // Complexity: O(1)
    toggleCommandPalette();
  };

  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      settings: [],
    };
    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  return (
    <DialogPrimitive.Root open={commandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-[20%] z-[201] w-full max-w-lg -translate-x-1/2',
            'rounded-xl border border-violet-500/30 bg-[#12121a] shadow-2xl shadow-violet-500/10',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-violet-500/20 px-4 py-3">
            <Search className="h-5 w-5 text-violet-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 rounded bg-violet-500/20 px-2 py-1 text-xs text-violet-300">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <>
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">Navigation</div>
                    {groupedCommands.navigation.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5',
                          'text-left text-sm text-gray-300 hover:bg-violet-500/20 hover:text-white',
                          'transition-colors duration-150'
                        )}
                      >
                        <cmd.icon className="h-4 w-4 text-violet-400" />
                        <span className="flex-1">{cmd.name}</span>
                        {cmd.shortcut && (
                          <kbd className="text-xs text-gray-500">{cmd.shortcut}</kbd>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {groupedCommands.action.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">Actions</div>
                    {groupedCommands.action.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5',
                          'text-left text-sm text-gray-300 hover:bg-violet-500/20 hover:text-white',
                          'transition-colors duration-150'
                        )}
                      >
                        <cmd.icon className="h-4 w-4 text-cyan-400" />
                        <div className="flex-1">
                          <div>{cmd.name}</div>
                          {cmd.description && (
                            <div className="text-xs text-gray-500">{cmd.description}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-violet-500/20 px-4 py-2 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-violet-500/20 px-1.5 py-0.5">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-violet-500/20 px-1.5 py-0.5">↵</kbd> Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-violet-500/20 px-1.5 py-0.5">Esc</kbd> Close
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
