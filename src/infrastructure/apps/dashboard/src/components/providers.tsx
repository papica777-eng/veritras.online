/**
 * providers — Qantum Module
 * @module providers
 * @path src/infrastructure/apps/dashboard/src/components/providers.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { CommandPalette } from '@/components/command-palette';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function KeyboardShortcutsWrapper({ children }: { children: React.ReactNode }) {
  const { showCheatsheet, setShowCheatsheet } = useKeyboardShortcuts();
  return (
    <>
      {children}
      <CommandPalette />
      <KeyboardShortcutsModal open={showCheatsheet} onOpenChange={setShowCheatsheet} />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <KeyboardShortcutsWrapper>
            {children}
          </KeyboardShortcutsWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
