"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitOrchestrator = void 0;
const simple_git_1 = __importDefault(require("simple-git"));
class GitOrchestrator {
    git;
    constructor(baseDir = process.cwd()) {
        this.git = (0, simple_git_1.default)(baseDir);
    }
    // 1. Проверка на статуса (Очите на агента)
    async getStatus() {
        try {
            const status = await this.git.status();
            if (status.isClean()) {
                return "GIT STATUS: Clean. Nothing to commit.";
            }
            return `GIT STATUS: Dirty\nModified: ${status.modified.length}\nCreated: ${status.created.length}\nDeleted: ${status.deleted.length}\nFiles: ${status.files.map(f => f.path).join(', ')}`;
        }
        catch (e) {
            return `GIT ERROR: ${e.message}`;
        }
    }
    // 2. Автоматичен Commit (Ръцете на агента)
    async commitChanges(message) {
        try {
            await this.git.add('.');
            const result = await this.git.commit(message);
            return `SUCCESS: Committed on branch [${result.branch}]. Commit ID: ${result.commit}. Summary: ${result.summary.changes} changes.`;
        }
        catch (e) {
            return `COMMIT FAILED: ${e.message}`;
        }
    }
    // 3. Извличане на история (Паметта на агента)
    async getLog(count = 5) {
        try {
            const log = await this.git.log({ maxCount: count });
            return log.all.map(l => `[${l.date.substring(0, 10)}] ${l.message} (${l.author_name})`).join('\n');
        }
        catch (e) {
            return `LOG ERROR: ${e.message}`;
        }
    }
    // 4. Push към GitHub (Гласът към света)
    async pushChanges() {
        try {
            await this.git.push();
            return "SUCCESS: Changes pushed to origin.";
        }
        catch (e) {
            return `PUSH FAILED: ${e.message}`;
        }
    }
}
exports.GitOrchestrator = GitOrchestrator;
