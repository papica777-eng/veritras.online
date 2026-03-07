/**
 * @fileoverview Global Application Store using Zustand
 * @description Централизирано state management за QAntum Dashboard
 * @author QAntum Empire
 * @version 1.0.0-QAntum
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  logo?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface AppState {
  // User & Auth
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;

  // UI State
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  theme: 'dark' | 'light' | 'system';

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Loading States
  isLoading: boolean;
  loadingMessage: string;

  // Actions
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean, message?: string) => void;
  logout: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useAppStore = create<AppState>()(
  // Complexity: O(N) — linear scan
  devtools(
    // Complexity: O(N) — linear scan
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        organization: null,
        isAuthenticated: false,
        sidebarOpen: true,
        sidebarCollapsed: false,
        commandPaletteOpen: false,
        theme: 'dark',
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        loadingMessage: '',

        // Actions
        setUser: (user) => set({
          user,
          isAuthenticated: !!user
        }),

        setOrganization: (organization) => set({ organization }),

        toggleSidebar: () => set((state) => ({
          sidebarOpen: !state.sidebarOpen
        })),

        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

        setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

        toggleCommandPalette: () => set((state) => ({
          commandPaletteOpen: !state.commandPaletteOpen
        })),

        setTheme: (theme) => set({ theme }),

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            read: false,
          };
          // Complexity: O(1)
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        },

        markNotificationRead: (id) => set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

        markAllNotificationsRead: () => set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

        clearNotifications: () => set({
          notifications: [],
          unreadCount: 0
        }),

        setLoading: (isLoading, loadingMessage = '') => set({
          isLoading,
          loadingMessage
        }),

        logout: () => set({
          user: null,
          organization: null,
          isAuthenticated: false,
          notifications: [],
          unreadCount: 0,
        }),
      }),
      {
        name: 'QAntum-app-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'QAntum App Store' }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS (for performance optimization)
// ═══════════════════════════════════════════════════════════════════════════

export const useUser = () => useAppStore((state) => state.user);
export const useOrganization = () => useAppStore((state) => state.organization);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useCommandPaletteOpen = () => useAppStore((state) => state.commandPaletteOpen);
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadCount = () => useAppStore((state) => state.unreadCount);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
