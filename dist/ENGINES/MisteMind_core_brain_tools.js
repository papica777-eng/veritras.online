"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOLS = void 0;
const GitOrchestrator_1 = require("../intelligence/GitOrchestrator");
const gitOps = new GitOrchestrator_1.GitOrchestrator();
exports.TOOLS = {
    // ... други инструменти ...
    GIT_STATUS: {
        desc: "Checks the current git status (modified files, staged changes). Use before committing.",
        handler: async () => await gitOps.getStatus()
    },
    GIT_COMMIT: {
        desc: "Stages all files and commits them. REQUIRES a 'message' parameter.",
        handler: async (message) => await gitOps.commitChanges(message)
    },
    GIT_HISTORY: {
        desc: "Reads the last 5 commits to understand recent context.",
        handler: async () => await gitOps.getLog()
    }
};
