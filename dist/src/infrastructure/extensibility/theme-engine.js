"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum THEME ENGINE                                                         ║
 * ║   "Dynamic theming with CSS variables"                                        ║
 * ║                                                                               ║
 * ║   TODO B #47 - Extensibility: Theme Engine                                    ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThemeEngine = exports.ThemeEngine = exports.darkTheme = exports.lightTheme = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT THEMES
// ═══════════════════════════════════════════════════════════════════════════════
const commonTypography = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    fontFamilyMono: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace',
    fontSizeBase: '14px',
    fontSizeSm: '12px',
    fontSizeLg: '16px',
    fontSizeXl: '20px',
    fontSizeXxl: '28px',
    lineHeight: '1.5',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '700',
};
const commonSpacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
};
const commonBorderRadius = {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
};
const commonTransitions = {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '400ms ease',
};
exports.lightTheme = {
    id: 'QAntum-light',
    name: 'QAntum Light',
    type: 'light',
    colors: {
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        primaryActive: '#4338ca',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        backgroundTertiary: '#f1f5f9',
        surface: '#ffffff',
        surfaceHover: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        textInverse: '#ffffff',
        border: '#e2e8f0',
        borderHover: '#cbd5e1',
        borderFocus: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        codeBg: '#f1f5f9',
        codeText: '#0f172a',
    },
    typography: commonTypography,
    spacing: commonSpacing,
    borderRadius: commonBorderRadius,
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    transitions: commonTransitions,
};
exports.darkTheme = {
    id: 'QAntum-dark',
    name: 'QAntum Dark',
    type: 'dark',
    colors: {
        primary: '#818cf8',
        primaryHover: '#a5b4fc',
        primaryActive: '#6366f1',
        secondary: '#94a3b8',
        accent: '#fbbf24',
        background: '#0f172a',
        backgroundSecondary: '#1e293b',
        backgroundTertiary: '#334155',
        surface: '#1e293b',
        surfaceHover: '#334155',
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#64748b',
        textInverse: '#0f172a',
        border: '#334155',
        borderHover: '#475569',
        borderFocus: '#818cf8',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa',
        codeBg: '#1e293b',
        codeText: '#f8fafc',
    },
    typography: commonTypography,
    spacing: commonSpacing,
    borderRadius: commonBorderRadius,
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.6)',
    },
    transitions: commonTransitions,
};
// ═══════════════════════════════════════════════════════════════════════════════
// THEME ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class ThemeEngine {
    static instance;
    themes = new Map();
    currentTheme;
    styleElement = null;
    listeners = new Set();
    constructor() {
        // Register default themes
        this.register(exports.lightTheme);
        this.register(exports.darkTheme);
        this.currentTheme = exports.darkTheme;
    }
    static getInstance() {
        if (!ThemeEngine.instance) {
            ThemeEngine.instance = new ThemeEngine();
        }
        return ThemeEngine.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // THEME MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register a theme
     */
    // Complexity: O(1) — lookup
    register(theme) {
        this.themes.set(theme.id, theme);
    }
    /**
     * Unregister a theme
     */
    // Complexity: O(1)
    unregister(themeId) {
        if (themeId === this.currentTheme.id) {
            throw new Error('Cannot unregister active theme');
        }
        return this.themes.delete(themeId);
    }
    /**
     * Get a theme by ID
     */
    // Complexity: O(1) — lookup
    getTheme(themeId) {
        return this.themes.get(themeId);
    }
    /**
     * Get all themes
     */
    // Complexity: O(1)
    getAllThemes() {
        return [...this.themes.values()];
    }
    /**
     * Get current theme
     */
    // Complexity: O(1)
    getCurrentTheme() {
        return this.currentTheme;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // THEME APPLICATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Apply a theme
     */
    // Complexity: O(1) — lookup
    apply(themeId) {
        const theme = this.themes.get(themeId);
        if (!theme) {
            throw new Error(`Theme not found: ${themeId}`);
        }
        this.currentTheme = theme;
        this.injectStyles(theme);
        this.notifyListeners(theme);
    }
    /**
     * Toggle between light and dark
     */
    // Complexity: O(1)
    toggle() {
        const newTheme = this.currentTheme.type === 'dark'
            ? this.findThemeByType('light')
            : this.findThemeByType('dark');
        if (newTheme) {
            this.apply(newTheme.id);
        }
        return this.currentTheme;
    }
    /**
     * Apply system preference
     */
    // Complexity: O(1)
    applySystemPreference() {
        if (typeof window !== 'undefined') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? this.findThemeByType('dark') : this.findThemeByType('light');
            if (theme) {
                this.apply(theme.id);
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CSS GENERATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Generate CSS variables for a theme
     */
    // Complexity: O(N*M) — nested iteration
    generateCSSVariables(theme) {
        const vars = [];
        // Colors
        for (const [key, value] of Object.entries(theme.colors)) {
            vars.push(`  --color-${this.kebabCase(key)}: ${value};`);
        }
        // Typography
        for (const [key, value] of Object.entries(theme.typography)) {
            vars.push(`  --${this.kebabCase(key)}: ${value};`);
        }
        // Spacing
        for (const [key, value] of Object.entries(theme.spacing)) {
            vars.push(`  --spacing-${key}: ${value};`);
        }
        // Border radius
        for (const [key, value] of Object.entries(theme.borderRadius)) {
            vars.push(`  --radius-${key}: ${value};`);
        }
        // Shadows
        for (const [key, value] of Object.entries(theme.shadows)) {
            vars.push(`  --shadow-${key}: ${value};`);
        }
        // Transitions
        for (const [key, value] of Object.entries(theme.transitions)) {
            vars.push(`  --transition-${key}: ${value};`);
        }
        // Custom
        if (theme.custom) {
            for (const [key, value] of Object.entries(theme.custom)) {
                vars.push(`  --${this.kebabCase(key)}: ${value};`);
            }
        }
        return `:root {\n${vars.join('\n')}\n}`;
    }
    /**
     * Generate full CSS for a theme
     */
    // Complexity: O(1)
    generateCSS(theme) {
        const variables = this.generateCSSVariables(theme);
        const baseStyles = `
/* QAntum Theme: ${theme.name} */
${variables}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

::selection {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

a {
  color: var(--color-primary);
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-hover);
}

code {
  font-family: var(--font-family-mono);
  background-color: var(--color-code-bg);
  color: var(--color-code-text);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}
`;
        return baseStyles;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // LISTENERS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Subscribe to theme changes
     */
    // Complexity: O(1)
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    // Complexity: O(N) — loop
    notifyListeners(theme) {
        for (const listener of this.listeners) {
            try {
                // Complexity: O(1)
                listener(theme);
            }
            catch (error) {
                console.error('[ThemeEngine] Listener error:', error);
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // THEME CREATION HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create a theme extending base
     */
    // Complexity: O(1) — lookup
    extend(baseId, overrides) {
        const base = this.themes.get(baseId);
        if (!base) {
            throw new Error(`Base theme not found: ${baseId}`);
        }
        return {
            ...base,
            ...overrides,
            colors: { ...base.colors, ...overrides.colors },
            typography: { ...base.typography, ...overrides.typography },
            spacing: { ...base.spacing, ...overrides.spacing },
            borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
            shadows: { ...base.shadows, ...overrides.shadows },
            transitions: { ...base.transitions, ...overrides.transitions },
            custom: { ...base.custom, ...overrides.custom },
        };
    }
    /**
     * Create theme from colors only
     */
    // Complexity: O(1)
    createFromColors(id, name, type, colors) {
        const base = type === 'dark' ? exports.darkTheme : exports.lightTheme;
        return this.extend(base.id, { id, name, type, colors });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    injectStyles(theme) {
        if (typeof document === 'undefined')
            return;
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.id = 'QAntum-theme';
            document.head.appendChild(this.styleElement);
        }
        this.styleElement.textContent = this.generateCSS(theme);
        document.documentElement.setAttribute('data-theme', theme.type);
    }
    // Complexity: O(N) — loop
    findThemeByType(type) {
        for (const theme of this.themes.values()) {
            if (theme.type === type)
                return theme;
        }
        return undefined;
    }
    // Complexity: O(1)
    kebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
exports.ThemeEngine = ThemeEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getThemeEngine = () => ThemeEngine.getInstance();
exports.getThemeEngine = getThemeEngine;
exports.default = ThemeEngine;
