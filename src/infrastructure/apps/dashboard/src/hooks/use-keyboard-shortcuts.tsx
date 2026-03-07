/**
 * @fileoverview Keyboard Shortcuts Hook & Modal
 * @description Global keyboard shortcuts with cheatsheet
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'general';
}

const shortcuts: Shortcut[] = [
  // General
  { keys: ['⌘', 'K'], description: 'Open command palette', category: 'general' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'general' },
  { keys: ['Esc'], description: 'Close modal / Cancel', category: 'general' },
  // Navigation
  { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'navigation' },
  { keys: ['G', 'T'], description: 'Go to Test Cases', category: 'navigation' },
  { keys: ['G', 'R'], description: 'Go to Test Runs', category: 'navigation' },
  { keys: ['G', 'P'], description: 'Go to Projects', category: 'navigation' },
  { keys: ['G', 'S'], description: 'Go to Settings', category: 'navigation' },
  // Actions
  { keys: ['N'], description: 'Create new item', category: 'actions' },
  { keys: ['⌘', 'Enter'], description: 'Submit / Confirm', category: 'actions' },
  { keys: ['⌘', 'S'], description: 'Save changes', category: 'actions' },
];

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleCommandPalette } = useAppStore();
  const [showCheatsheet, setShowCheatsheet] = React.useState(false);
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Command palette: Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Complexity: O(1)
        toggleCommandPalette();
        return;
      }

      // Cheatsheet: ?
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // Complexity: O(1)
        setShowCheatsheet(true);
        return;
      }

      // G + key navigation
      if (pendingKey === 'g') {
        e.preventDefault();
        switch (e.key.toLowerCase()) {
          case 'd':
            router.push('/');
            break;
          case 't':
            router.push('/tests');
            break;
          case 'r':
            router.push('/runs');
            break;
          case 'p':
            router.push('/projects');
            break;
          case 's':
            router.push('/settings');
            break;
        }
        // Complexity: O(1)
        setPendingKey(null);
        return;
      }

      // Start G sequence
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        // Complexity: O(1)
        setPendingKey('g');
        // Complexity: O(1)
        setTimeout(() => setPendingKey(null), 1000);
        return;
      }

      // N for new
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // Navigate to new page based on current route
        const path = window.location.pathname;
        if (path.startsWith('/tests')) router.push('/tests/new');
        else if (path.startsWith('/projects')) router.push('/projects/new');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleCommandPalette, pendingKey]);

  return { showCheatsheet, setShowCheatsheet };
}

export function KeyboardShortcutsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, Shortcut[]> = {
      general: [],
      navigation: [],
      actions: [],
    };
    shortcuts.forEach((s) => groups[s.category].push(s));
    return groups;
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[201] w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-violet-500/30 bg-[#12121a] shadow-2xl shadow-violet-500/10',
            'animate-in fade-in-0 zoom-in-95 p-6'
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-violet-500/20 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-violet-500/10"
                    >
                      <span className="text-sm text-gray-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <React.Fragment key={j}>
                            <kbd className="min-w-[24px] h-6 flex items-center justify-center rounded bg-violet-500/20 text-violet-300 text-xs font-mono px-1.5">
                              {key}
                            </kbd>
                            {j < shortcut.keys.length - 1 && (
                              <span className="text-gray-600">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-violet-500/20 text-center">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">?</kbd> anytime to show this dialog
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
