"use strict";
/**
 * ⚛️ CHANGELOG TRACKER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Автоматична генерация на Changelog от:
 * - Git commits
 * - Conventional Commits format
 * - Semantic versioning
 *
 * @author DIMITAR PRODROMOV
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangelogTracker = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// COMMIT TYPE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════
const COMMIT_TYPES = {
    feat: { category: 'features', emoji: '✨', label: 'Features' },
    fix: { category: 'fixes', emoji: '🐛', label: 'Bug Fixes' },
    docs: { category: 'docs', emoji: '📚', label: 'Documentation' },
    style: { category: 'other', emoji: '💅', label: 'Styles' },
    refactor: { category: 'refactor', emoji: '♻️', label: 'Code Refactoring' },
    perf: { category: 'performance', emoji: '⚡', label: 'Performance' },
    test: { category: 'other', emoji: '🧪', label: 'Tests' },
    build: { category: 'other', emoji: '🏗️', label: 'Build' },
    ci: { category: 'other', emoji: '👷', label: 'CI' },
    chore: { category: 'other', emoji: '🔧', label: 'Chores' },
    revert: { category: 'other', emoji: '⏪', label: 'Reverts' }
};
// ═══════════════════════════════════════════════════════════════════════════════
// CHANGELOG TRACKER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class ChangelogTracker {
    entries = [];
    commits = [];
    constructor() {
        console.log('[CHANGELOG] 📋 Changelog Tracker initialized');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async generate(currentVersion) {
        console.log('[CHANGELOG] 📝 Generating changelog...');
        // Parse commits from git (simulated)
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.parseCommits();
        // Group by version
        this.groupByVersion(currentVersion);
        // Build markdown
        return this.buildMarkdown();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // COMMIT PARSING
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async parseCommits() {
        // In real implementation, execute: git log --pretty=format:"%H|%s|%b|%ad|%an"
        // For now, simulate with sample commits
        this.commits = [
            {
                hash: 'abc1234',
                type: 'feat',
                scope: 'ghost-protocol',
                subject: 'Add Ghost Protocol V2 with 3-layer stealth',
                date: '2025-12-31',
                author: 'DIMITAR PRODROMOV'
            },
            {
                hash: 'def5678',
                type: 'feat',
                scope: 'biometric',
                subject: 'Implement human behavior emulation engine',
                date: '2025-12-31',
                author: 'DIMITAR PRODROMOV'
            },
            {
                hash: 'ghi9012',
                type: 'feat',
                scope: 'chronos',
                subject: 'Add predictive evasion with FastForward()',
                date: '2025-12-31',
                author: 'DIMITAR PRODROMOV'
            },
            {
                hash: 'jkl3456',
                type: 'feat',
                scope: 'tls',
                subject: 'Implement TLS/JA3 fingerprint rotation',
                date: '2025-12-31',
                author: 'DIMITAR PRODROMOV'
            },
            {
                hash: 'mno7890',
                type: 'docs',
                scope: 'api',
                subject: 'Add self-generating documentation engine',
                date: '2025-12-31',
                author: 'DIMITAR PRODROMOV'
            },
            {
                hash: 'pqr1234',
                type: 'feat',
                scope: 'visual',
                subject: 'Add WebGL/Canvas/Audio fingerprint spoofing',
                date: '2025-12-31',
                author: 'DIMITAR PRODROMOV'
            },
            {
                hash: 'stu5678',
                type: 'perf',
                scope: 'core',
                subject: 'Optimize detection bypass algorithms',
                date: '2025-12-30',
                author: 'DIMITAR PRODROMOV'
            },
            {
                hash: 'vwx9012',
                type: 'fix',
                scope: 'sensor',
                subject: 'Fix Akamai sensor data generation',
                date: '2025-12-30',
                author: 'DIMITAR PRODROMOV'
            }
        ];
    }
    // Complexity: O(1)
    parseConventionalCommit(message) {
        // Pattern: type(scope)!: subject
        const pattern = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;
        const match = message.match(pattern);
        if (match) {
            return {
                type: match[1],
                scope: match[2],
                breaking: !!match[3],
                subject: match[4]
            };
        }
        return { type: 'other', subject: message };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GROUPING
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — loop
    groupByVersion(currentVersion) {
        const entry = {
            version: currentVersion,
            date: new Date().toISOString().split('T')[0],
            features: [],
            fixes: [],
            breaking: [],
            docs: [],
            refactor: [],
            performance: [],
            other: []
        };
        for (const commit of this.commits) {
            const typeInfo = COMMIT_TYPES[commit.type];
            const category = typeInfo?.category || 'other';
            const emoji = typeInfo?.emoji || '📝';
            const formattedCommit = `${emoji} ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject}`;
            if (commit.breaking) {
                entry.breaking.push(`💥 BREAKING: ${commit.subject}`);
            }
            entry[category].push(formattedCommit);
        }
        this.entries = [entry];
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MARKDOWN BUILDING
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — loop
    buildMarkdown() {
        let markdown = `# 📋 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
        for (const entry of this.entries) {
            markdown += this.buildVersionSection(entry);
        }
        return markdown;
    }
    // Complexity: O(N*M) — nested iteration
    buildVersionSection(entry) {
        let section = `## [${entry.version}] - ${entry.date}\n\n`;
        // Breaking changes first
        if (entry.breaking.length > 0) {
            section += `### 💥 Breaking Changes\n\n`;
            for (const change of entry.breaking) {
                section += `- ${change}\n`;
            }
            section += '\n';
        }
        // Features
        if (entry.features.length > 0) {
            section += `### ✨ Features\n\n`;
            for (const feature of entry.features) {
                section += `- ${feature}\n`;
            }
            section += '\n';
        }
        // Bug fixes
        if (entry.fixes.length > 0) {
            section += `### 🐛 Bug Fixes\n\n`;
            for (const fix of entry.fixes) {
                section += `- ${fix}\n`;
            }
            section += '\n';
        }
        // Performance
        if (entry.performance.length > 0) {
            section += `### ⚡ Performance\n\n`;
            for (const perf of entry.performance) {
                section += `- ${perf}\n`;
            }
            section += '\n';
        }
        // Documentation
        if (entry.docs.length > 0) {
            section += `### 📚 Documentation\n\n`;
            for (const doc of entry.docs) {
                section += `- ${doc}\n`;
            }
            section += '\n';
        }
        // Refactoring
        if (entry.refactor.length > 0) {
            section += `### ♻️ Code Refactoring\n\n`;
            for (const ref of entry.refactor) {
                section += `- ${ref}\n`;
            }
            section += '\n';
        }
        // Other
        if (entry.other.length > 0) {
            section += `### 🔧 Other Changes\n\n`;
            for (const other of entry.other) {
                section += `- ${other}\n`;
            }
            section += '\n';
        }
        return section;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    addManualEntry(entry) {
        this.entries.unshift(entry);
    }
    // Complexity: O(1)
    getEntries() {
        return [...this.entries];
    }
    // Complexity: O(1)
    getLatestVersion() {
        return this.entries[0]?.version || null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // VERSION BUMPING
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear scan
    suggestNextVersion(currentVersion) {
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        const hasBreaking = this.commits.some(c => c.breaking);
        const hasFeatures = this.commits.some(c => c.type === 'feat');
        return {
            major: `${major + 1}.0.0`,
            minor: `${major}.${minor + 1}.0`,
            patch: `${major}.${minor}.${patch + 1}`
        };
    }
    // Complexity: O(1)
    recommendVersion(currentVersion) {
        const suggestions = this.suggestNextVersion(currentVersion);
        const hasBreaking = this.commits.some(c => c.breaking);
        const hasFeatures = this.commits.some(c => c.type === 'feat');
        if (hasBreaking)
            return suggestions.major;
        if (hasFeatures)
            return suggestions.minor;
        return suggestions.patch;
    }
}
exports.ChangelogTracker = ChangelogTracker;
exports.default = ChangelogTracker;
