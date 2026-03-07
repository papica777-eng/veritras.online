/**
 * dashboard-layout — Qantum Module
 * @module dashboard-layout
 * @path src/infrastructure/apps/dashboard/src/components/layout/dashboard-layout.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlayCircle,
  FolderKanban,
  Settings,
  CreditCard,
  Terminal,
  Sparkles,
  Wand2,
  Menu,
  X,
  FileCode,
  TestTube2,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Test Cases', href: '/tests', icon: TestTube2 },
  { name: 'Test Runs', href: '/runs', icon: PlayCircle },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'AI Generator', href: '/generate', icon: Sparkles },
  { name: 'Self-Healing', href: '/healing', icon: Wand2 },
  { name: 'Logs', href: '/logs', icon: Terminal },
];

const bottomNav = [
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to prevent hydration issues
  // Complexity: O(1)
  useEffect(() => {
    // Complexity: O(1)
    setMounted(true);
  }, []);

  // Close sidebar on route change (mobile)
  // Complexity: O(1)
  useEffect(() => {
    // Complexity: O(1)
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Mobile sidebar backdrop */}
      {mounted && sidebarOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - FIXED left column */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '256px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #12121a 0%, #0d0d14 100%)',
          borderRight: '1px solid rgba(139, 92, 246, 0.2)',
          zIndex: 50,
          transform: mounted && sidebarOpen ? 'translateX(0)' : undefined,
        }}
        className={cn(
          'transition-transform duration-300',
          !mounted || !sidebarOpen ? 'max-lg:-translate-x-full' : ''
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-border/50 shrink-0">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="text-base font-bold text-white">Q</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Aeterna</span>
            </Link>
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Organization Info */}
          <div className="px-3 py-3 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-accent/30 border border-border/30">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                QE
              </div>
              <span className="text-sm font-medium text-foreground/90">Aeterna Empire</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-violet-400')} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-border/50 p-3 space-y-1 shrink-0">
            {bottomNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-violet-400')} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User */}
          <div className="border-t border-border/50 p-3 shrink-0">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  Dimitar Prodromov
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  papica777@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area - RIGHT of sidebar */}
      <div 
        style={{
          marginLeft: '256px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="max-lg:!ml-0"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-violet-500/20 bg-[#0a0a12]/95 backdrop-blur-xl px-4 lg:px-6 shrink-0">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Ghost Mode Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Ghost Mode Active
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-[#0a0a12]">{children}</main>
      </div>
    </div>
  );
}
