"use strict";
/**
 * @fileoverview Global Application Store using Zustand
 * @description Централизирано state management за QAntum Dashboard
 * @author QAntum Empire
 * @version 1.0.0-QAntum
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsLoading = exports.useUnreadCount = exports.useNotifications = exports.useTheme = exports.useCommandPaletteOpen = exports.useSidebarCollapsed = exports.useSidebarOpen = exports.useIsAuthenticated = exports.useOrganization = exports.useUser = exports.useAppStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════
exports.useAppStore = (0, zustand_1.create)()(
// Complexity: O(N) — linear scan
(0, middleware_1.devtools)(
// Complexity: O(N) — linear scan
(0, middleware_1.persist)((set, get) => ({
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
        const newNotification = {
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
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
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
}), {
    name: 'QAntum-app-store',
    partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
    }),
}), { name: 'QAntum App Store' }));
// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS (for performance optimization)
// ═══════════════════════════════════════════════════════════════════════════
const useUser = () => (0, exports.useAppStore)((state) => state.user);
exports.useUser = useUser;
const useOrganization = () => (0, exports.useAppStore)((state) => state.organization);
exports.useOrganization = useOrganization;
const useIsAuthenticated = () => (0, exports.useAppStore)((state) => state.isAuthenticated);
exports.useIsAuthenticated = useIsAuthenticated;
const useSidebarOpen = () => (0, exports.useAppStore)((state) => state.sidebarOpen);
exports.useSidebarOpen = useSidebarOpen;
const useSidebarCollapsed = () => (0, exports.useAppStore)((state) => state.sidebarCollapsed);
exports.useSidebarCollapsed = useSidebarCollapsed;
const useCommandPaletteOpen = () => (0, exports.useAppStore)((state) => state.commandPaletteOpen);
exports.useCommandPaletteOpen = useCommandPaletteOpen;
const useTheme = () => (0, exports.useAppStore)((state) => state.theme);
exports.useTheme = useTheme;
const useNotifications = () => (0, exports.useAppStore)((state) => state.notifications);
exports.useNotifications = useNotifications;
const useUnreadCount = () => (0, exports.useAppStore)((state) => state.unreadCount);
exports.useUnreadCount = useUnreadCount;
const useIsLoading = () => (0, exports.useAppStore)((state) => state.isLoading);
exports.useIsLoading = useIsLoading;
