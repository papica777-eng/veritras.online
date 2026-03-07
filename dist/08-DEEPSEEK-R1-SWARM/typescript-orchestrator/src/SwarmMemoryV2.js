"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedMemoryV2 = exports.AdaptiveEventBusV2 = exports.V2_CONFIG = void 0;
const events_1 = require("events");
exports.V2_CONFIG = {
    STALE_LOCK_TIMEOUT_MS: 5000,
    BYTES_PER_WORKER: 128,
};
class AdaptiveEventBusV2 extends events_1.EventEmitter {
    messageBuffer = [];
    flushInterval;
    maxBufferSize;
    flushTimer = null;
    constructor(baseFlushInterval = 200, maxBufferSize = 5000) {
        super();
        this.setMaxListeners(2000);
        this.flushInterval = baseFlushInterval;
        this.maxBufferSize = maxBufferSize;
        this.startFlushTimer();
    }
    publish(data, eventName = 'batch') {
        this.messageBuffer.push({ ...data, _eventName: eventName });
        if (this.messageBuffer.length >= this.maxBufferSize) {
            this.flush();
        }
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    }
    flush() {
        if (this.messageBuffer.length === 0)
            return;
        const batch = this.messageBuffer.splice(0, this.messageBuffer.length);
        // Group by event name
        const grouped = batch.reduce((acc, msg) => {
            const ev = msg._eventName;
            if (!acc[ev])
                acc[ev] = [];
            acc[ev].push(msg);
            return acc;
        }, {});
        setImmediate(() => {
            for (const [ev, msgs] of Object.entries(grouped)) {
                this.emit(ev, msgs);
            }
        });
    }
    destroy() {
        if (this.flushTimer)
            clearInterval(this.flushTimer);
        this.flush();
    }
}
exports.AdaptiveEventBusV2 = AdaptiveEventBusV2;
class SharedMemoryV2 {
    sharedBuffer;
    statusView;
    lockView;
    timestampView;
    watchdogInterval = null;
    constructor(workerCount) {
        const totalSize = exports.V2_CONFIG.BYTES_PER_WORKER * workerCount;
        this.sharedBuffer = new SharedArrayBuffer(totalSize);
        this.statusView = new Int32Array(this.sharedBuffer);
        this.lockView = new Int32Array(this.sharedBuffer);
        this.timestampView = new Float64Array(this.sharedBuffer);
        this.startWatchdog(workerCount);
    }
    startWatchdog(workerCount) {
        this.watchdogInterval = setInterval(() => {
            const now = Date.now();
            for (let i = 0; i < workerCount; i++) {
                const lockOffset = i * (exports.V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
                const timestampOffset = i * (exports.V2_CONFIG.BYTES_PER_WORKER / 8) + 2;
                const lockOwner = Atomics.load(this.lockView, lockOffset);
                if (lockOwner !== 0) {
                    const lockTime = this.timestampView[timestampOffset];
                    const lockAge = now - lockTime;
                    if (lockAge > exports.V2_CONFIG.STALE_LOCK_TIMEOUT_MS && lockTime > 0) {
                        // Force release
                        Atomics.store(this.lockView, lockOffset, 0);
                        this.timestampView[timestampOffset] = 0;
                        console.warn(`[Watchdog] ⚡ Stale lock RECOVERED on worker ${i} (age: ${lockAge.toFixed(0)}ms)`);
                    }
                }
            }
        }, 1000);
    }
    acquireLock(workerIndex, ownerId) {
        const lockOffset = workerIndex * (exports.V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
        const timestampOffset = workerIndex * (exports.V2_CONFIG.BYTES_PER_WORKER / 8) + 2;
        const result = Atomics.compareExchange(this.lockView, lockOffset, 0, ownerId);
        if (result === 0) {
            this.timestampView[timestampOffset] = Date.now();
            return true;
        }
        return false;
    }
    releaseLock(workerIndex, ownerId) {
        const lockOffset = workerIndex * (exports.V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
        const timestampOffset = workerIndex * (exports.V2_CONFIG.BYTES_PER_WORKER / 8) + 2;
        const result = Atomics.compareExchange(this.lockView, lockOffset, ownerId, 0);
        if (result === ownerId) {
            this.timestampView[timestampOffset] = 0;
            return true;
        }
        return false;
    }
    isLocked(workerIndex) {
        const lockOffset = workerIndex * (exports.V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
        return Atomics.load(this.lockView, lockOffset) !== 0;
    }
    setStatus(workerIndex, status) {
        const baseOffset = workerIndex * (exports.V2_CONFIG.BYTES_PER_WORKER / 4);
        Atomics.store(this.statusView, baseOffset, status);
    }
    destroy() {
        if (this.watchdogInterval) {
            clearInterval(this.watchdogInterval);
        }
    }
}
exports.SharedMemoryV2 = SharedMemoryV2;
