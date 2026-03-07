"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum TIME TRAVELER                                                        ║
 * ║   "Mock time, freeze moments, travel through test timelines"                  ║
 * ║                                                                               ║
 * ║   TODO B #32 - Chronos: Time Manipulation                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.jumpTo = exports.rewind = exports.advance = exports.unfreeze = exports.freeze = exports.timeTraveler = exports.TimeTraveler = void 0;
exports.FrozenTime = FrozenTime;
exports.MockTime = MockTime;
// ═══════════════════════════════════════════════════════════════════════════════
// TIME TRAVELER
// ═══════════════════════════════════════════════════════════════════════════════
class TimeTraveler {
    static instance;
    originalDate = Date;
    originalNow = Date.now;
    originalTimeout = globalThis.setTimeout;
    originalInterval = globalThis.setInterval;
    frozen = false;
    frozenTime = 0;
    offset = 0;
    speed = 1;
    snapshots = new Map();
    history = [];
    pendingTimers = new Map();
    timerIdCounter = 0;
    static getInstance() {
        if (!TimeTraveler.instance) {
            TimeTraveler.instance = new TimeTraveler();
        }
        return TimeTraveler.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TIME CONTROL
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get current mock time
     */
    // Complexity: O(1)
    now() {
        if (this.frozen) {
            return this.frozenTime;
        }
        return this.originalNow() + this.offset;
    }
    /**
     * Get Date constructor that respects mock time
     */
    // Complexity: O(1)
    getDate() {
        const traveler = this;
        return class MockDate extends traveler.originalDate {
            constructor(...args) {
                if (args.length === 0) {
                    super(traveler.now());
                }
                else {
                    super(...args);
                }
            }
            static now() {
                return traveler.now();
            }
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TIME MANIPULATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Jump to specific time
     */
    // Complexity: O(1)
    jumpTo(time) {
        const timestamp = time instanceof Date ? time.getTime() : time;
        const previousTime = this.now();
        this.offset = timestamp - this.originalNow();
        if (this.frozen) {
            this.frozenTime = timestamp;
        }
        this.recordEvent(previousTime, timestamp, 'jump');
        this.triggerPendingTimers();
    }
    /**
     * Advance time by duration
     */
    // Complexity: O(1)
    advance(ms) {
        const previousTime = this.now();
        if (this.frozen) {
            this.frozenTime += ms;
        }
        else {
            this.offset += ms;
        }
        this.recordEvent(previousTime, this.now(), 'advance');
        this.triggerPendingTimers();
    }
    /**
     * Rewind time by duration
     */
    // Complexity: O(1)
    rewind(ms) {
        const previousTime = this.now();
        if (this.frozen) {
            this.frozenTime -= ms;
        }
        else {
            this.offset -= ms;
        }
        this.recordEvent(previousTime, this.now(), 'rewind');
    }
    /**
     * Freeze time at current moment
     */
    // Complexity: O(1)
    freeze(at) {
        this.frozen = true;
        this.frozenTime = at ? (at instanceof Date ? at.getTime() : at) : this.now();
    }
    /**
     * Unfreeze time
     */
    // Complexity: O(1)
    unfreeze() {
        if (this.frozen) {
            this.offset = this.frozenTime - this.originalNow();
            this.frozen = false;
        }
    }
    /**
     * Set time speed multiplier
     */
    // Complexity: O(1)
    setSpeed(multiplier) {
        if (multiplier <= 0) {
            throw new Error('Speed multiplier must be positive');
        }
        this.speed = multiplier;
    }
    /**
     * Reset to real time
     */
    // Complexity: O(1)
    reset() {
        this.frozen = false;
        this.frozenTime = 0;
        this.offset = 0;
        this.speed = 1;
        this.pendingTimers.clear();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SNAPSHOTS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Save current time as snapshot
     */
    // Complexity: O(1) — lookup
    snapshot(label) {
        const id = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.snapshots.set(id, {
            id,
            timestamp: this.now(),
            label,
            createdAt: this.originalNow(),
        });
        return id;
    }
    /**
     * Restore snapshot
     */
    // Complexity: O(N) — loop
    restore(idOrLabel) {
        // Find by ID or label
        let snapshot;
        if (this.snapshots.has(idOrLabel)) {
            snapshot = this.snapshots.get(idOrLabel);
        }
        else {
            for (const snap of this.snapshots.values()) {
                if (snap.label === idOrLabel) {
                    snapshot = snap;
                    break;
                }
            }
        }
        if (!snapshot)
            return false;
        this.jumpTo(snapshot.timestamp);
        return true;
    }
    /**
     * Get all snapshots
     */
    // Complexity: O(1)
    getSnapshots() {
        return [...this.snapshots.values()];
    }
    /**
     * Delete snapshot
     */
    // Complexity: O(N) — loop
    deleteSnapshot(idOrLabel) {
        if (this.snapshots.has(idOrLabel)) {
            this.snapshots.delete(idOrLabel);
            return true;
        }
        for (const [id, snap] of this.snapshots) {
            if (snap.label === idOrLabel) {
                this.snapshots.delete(id);
                return true;
            }
        }
        return false;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TIMER MOCKING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Mock setTimeout
     */
    // Complexity: O(1) — lookup
    setTimeout(callback, delay, ...args) {
        const id = ++this.timerIdCounter;
        const triggerTime = this.now() + delay;
        this.pendingTimers.set(id, {
            callback: () => callback(...args),
            time: triggerTime,
        });
        return id;
    }
    /**
     * Mock clearTimeout
     */
    // Complexity: O(1)
    clearTimeout(id) {
        this.pendingTimers.delete(id);
    }
    /**
     * Run all pending timers
     */
    // Complexity: O(N log N) — sort
    runAllTimers() {
        const timers = [...this.pendingTimers.entries()].sort((a, b) => a[1].time - b[1].time);
        for (const [id, timer] of timers) {
            this.jumpTo(timer.time);
            timer.callback();
            this.pendingTimers.delete(id);
        }
    }
    /**
     * Run pending timers up to a point
     */
    // Complexity: O(N log N) — sort
    runTimersTo(time) {
        const targetTime = time instanceof Date ? time.getTime() : time;
        const timers = [...this.pendingTimers.entries()]
            .filter(([, t]) => t.time <= targetTime)
            .sort((a, b) => a[1].time - b[1].time);
        for (const [id, timer] of timers) {
            this.jumpTo(timer.time);
            timer.callback();
            this.pendingTimers.delete(id);
        }
        this.jumpTo(targetTime);
    }
    /**
     * Get pending timers count
     */
    // Complexity: O(1)
    getPendingTimersCount() {
        return this.pendingTimers.size;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // GLOBAL INSTALLATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Install mock time globally
     */
    // Complexity: O(1)
    install() {
        const traveler = this;
        // Mock Date
        globalThis.Date = this.getDate();
        // Mock timers
        globalThis.setTimeout = (cb, delay, ...args) => traveler.setTimeout(cb, delay, ...args);
        console.log('[TimeTraveler] Installed - time is now under control');
    }
    /**
     * Uninstall mock time
     */
    // Complexity: O(1)
    uninstall() {
        globalThis.Date = this.originalDate;
        globalThis.setTimeout = this.originalTimeout;
        this.reset();
        console.log('[TimeTraveler] Uninstalled - real time restored');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get travel history
     */
    // Complexity: O(1)
    getHistory() {
        return [...this.history];
    }
    /**
     * Check if time is frozen
     */
    // Complexity: O(1)
    isFrozen() {
        return this.frozen;
    }
    /**
     * Get current speed
     */
    // Complexity: O(1)
    getSpeed() {
        return this.speed;
    }
    /**
     * Get current offset from real time
     */
    // Complexity: O(1)
    getOffset() {
        return this.offset;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    recordEvent(from, to, type) {
        this.history.push({
            from,
            to,
            type,
            timestamp: this.originalNow(),
        });
        // Keep last 1000 events
        if (this.history.length > 1000) {
            this.history = this.history.slice(-1000);
        }
    }
    // Complexity: O(N) — linear scan
    triggerPendingTimers() {
        const currentTime = this.now();
        const triggered = [];
        for (const [id, timer] of this.pendingTimers) {
            if (timer.time <= currentTime) {
                timer.callback();
                triggered.push(id);
            }
        }
        triggered.forEach((id) => this.pendingTimers.delete(id));
    }
}
exports.TimeTraveler = TimeTraveler;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
exports.timeTraveler = TimeTraveler.getInstance();
const freeze = (at) => exports.timeTraveler.freeze(at);
exports.freeze = freeze;
const unfreeze = () => exports.timeTraveler.unfreeze();
exports.unfreeze = unfreeze;
const advance = (ms) => exports.timeTraveler.advance(ms);
exports.advance = advance;
const rewind = (ms) => exports.timeTraveler.rewind(ms);
exports.rewind = rewind;
const jumpTo = (time) => exports.timeTraveler.jumpTo(time);
exports.jumpTo = jumpTo;
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @FrozenTime - Execute method with frozen time
 */
function FrozenTime(at) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = async function (...args) {
            const traveler = TimeTraveler.getInstance();
            traveler.freeze(at);
            try {
                return await original.apply(this, args);
            }
            finally {
                traveler.unfreeze();
            }
        };
        return descriptor;
    };
}
/**
 * @MockTime - Execute method at specific mock time
 */
function MockTime(time) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = async function (...args) {
            const traveler = TimeTraveler.getInstance();
            const targetTime = typeof time === 'function' ? time() : time;
            traveler.install();
            traveler.jumpTo(targetTime);
            try {
                return await original.apply(this, args);
            }
            finally {
                traveler.uninstall();
            }
        };
        return descriptor;
    };
}
exports.default = TimeTraveler;
