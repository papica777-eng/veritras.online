"use strict";
/**
 * ProcessGuard — Qantum Module
 * @module ProcessGuard
 * @path src/modules/ARMED_REAPER/ProcessGuard.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessGuard = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const LOCK_FILE = path_1.default.resolve('VORTEX_ENGINE.lock');
class ProcessGuard {
    /**
     * Гарантира, че работи само една инстанция.
     * Ако намери стара - убива я.
     */
    static ensureSingleInstance() {
        // 1. Проверка за съществуващ Lock File
        if (fs_1.default.existsSync(LOCK_FILE)) {
            try {
                const oldPid = parseInt(fs_1.default.readFileSync(LOCK_FILE, 'utf-8'));
                // Проверяваме дали процесът с това ID все още работи
                // process.kill(pid, 0) не убива, а само проверява дали съществува
                process.kill(oldPid, 0);
                console.log(`💀 PROCESS GUARD: Found zombie instance (PID: ${oldPid}). Killing it...`);
                // Убиваме стария процес
                process.kill(oldPid, 'SIGKILL');
                console.log(`✅ ZOMBIE TERMINATED.`);
            }
            catch (e) {
                // Ако процесът не съществува или има грешка при четенето, просто игнорираме
                // и продължаваме, тъй като Lock File-ът е бил "изоставен" (stale).
            }
        }
        // 2. Записваме текущия PID (Process ID)
        fs_1.default.writeFileSync(LOCK_FILE, process.pid.toString());
        // 3. Настройваме почистване при изход
        ProcessGuard.setupCleanup();
    }
    static setupCleanup() {
        const cleanup = () => {
            try {
                if (fs_1.default.existsSync(LOCK_FILE)) {
                    // Чистим файла само ако ние сме го създали (сравняваме PID)
                    const pidInFile = parseInt(fs_1.default.readFileSync(LOCK_FILE, 'utf-8'));
                    if (pidInFile === process.pid) {
                        fs_1.default.unlinkSync(LOCK_FILE);
                    }
                }
            }
            catch (e) { }
            process.exit();
        };
        // Прихващаме различни сигнали за спиране
        process.on('SIGINT', cleanup); // Ctrl+C
        process.on('SIGTERM', cleanup); // Kill command
        process.on('exit', cleanup); // Normal exit
        // Хващаме и неочаквани грешки, за да не остане файлът
        process.on('uncaughtException', (err) => {
            console.error('CRITICAL ERROR:', err);
            // Complexity: O(1)
            cleanup();
        });
    }
}
exports.ProcessGuard = ProcessGuard;
