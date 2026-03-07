import { EventEmitter } from 'events';

export const V2_CONFIG = {
    STALE_LOCK_TIMEOUT_MS: 5000,
    BYTES_PER_WORKER: 128,
};

export interface LockEvent {
    workerIndex: number;
    acquiredAt: number;
    releasedAt?: number;
    wasStale: boolean;
    recoveryTime?: number;
}

export class AdaptiveEventBusV2 extends EventEmitter {
    private messageBuffer: any[] = [];
    private flushInterval: number;
    private maxBufferSize: number;
    private flushTimer: NodeJS.Timeout | null = null;

    constructor(baseFlushInterval = 200, maxBufferSize = 5000) {
        super();
        this.setMaxListeners(2000);
        this.flushInterval = baseFlushInterval;
        this.maxBufferSize = maxBufferSize;

        this.startFlushTimer();
    }

    publish(data: any, eventName = 'batch'): void {
        this.messageBuffer.push({ ...data, _eventName: eventName });

        if (this.messageBuffer.length >= this.maxBufferSize) {
            this.flush();
        }
    }

    private startFlushTimer(): void {
        this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    }

    private flush(): void {
        if (this.messageBuffer.length === 0) return;

        const batch = this.messageBuffer.splice(0, this.messageBuffer.length);

        // Group by event name
        const grouped = batch.reduce((acc, msg) => {
            const ev = msg._eventName;
            if (!acc[ev]) acc[ev] = [];
            acc[ev].push(msg);
            return acc;
        }, {} as Record<string, any[]>);

        setImmediate(() => {
            for (const [ev, msgs] of Object.entries(grouped)) {
                this.emit(ev, msgs);
            }
        });
    }

    destroy(): void {
        if (this.flushTimer) clearInterval(this.flushTimer);
        this.flush();
    }
}

export class SharedMemoryV2 {
    private sharedBuffer: SharedArrayBuffer;
    private statusView: Int32Array;
    private lockView: Int32Array;
    private timestampView: Float64Array;

    private watchdogInterval: NodeJS.Timeout | null = null;

    constructor(workerCount: number) {
        const totalSize = V2_CONFIG.BYTES_PER_WORKER * workerCount;
        this.sharedBuffer = new SharedArrayBuffer(totalSize);
        this.statusView = new Int32Array(this.sharedBuffer);
        this.lockView = new Int32Array(this.sharedBuffer);
        this.timestampView = new Float64Array(this.sharedBuffer);

        this.startWatchdog(workerCount);
    }

    private startWatchdog(workerCount: number): void {
        this.watchdogInterval = setInterval(() => {
            const now = Date.now();

            for (let i = 0; i < workerCount; i++) {
                const lockOffset = i * (V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
                const timestampOffset = i * (V2_CONFIG.BYTES_PER_WORKER / 8) + 2;

                const lockOwner = Atomics.load(this.lockView, lockOffset);

                if (lockOwner !== 0) {
                    const lockTime = this.timestampView[timestampOffset];
                    const lockAge = now - lockTime;

                    if (lockAge > V2_CONFIG.STALE_LOCK_TIMEOUT_MS && lockTime > 0) {
                        // Force release
                        Atomics.store(this.lockView, lockOffset, 0);
                        this.timestampView[timestampOffset] = 0;
                        console.warn(`[Watchdog] ⚡ Stale lock RECOVERED on worker ${i} (age: ${lockAge.toFixed(0)}ms)`);
                    }
                }
            }
        }, 1000);
    }

    acquireLock(workerIndex: number, ownerId: number): boolean {
        const lockOffset = workerIndex * (V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
        const timestampOffset = workerIndex * (V2_CONFIG.BYTES_PER_WORKER / 8) + 2;

        const result = Atomics.compareExchange(this.lockView, lockOffset, 0, ownerId);

        if (result === 0) {
            this.timestampView[timestampOffset] = Date.now();
            return true;
        }
        return false;
    }

    releaseLock(workerIndex: number, ownerId: number): boolean {
        const lockOffset = workerIndex * (V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
        const timestampOffset = workerIndex * (V2_CONFIG.BYTES_PER_WORKER / 8) + 2;

        const result = Atomics.compareExchange(this.lockView, lockOffset, ownerId, 0);

        if (result === ownerId) {
            this.timestampView[timestampOffset] = 0;
            return true;
        }
        return false;
    }

    isLocked(workerIndex: number): boolean {
        const lockOffset = workerIndex * (V2_CONFIG.BYTES_PER_WORKER / 4) + 2;
        return Atomics.load(this.lockView, lockOffset) !== 0;
    }

    setStatus(workerIndex: number, status: number): void {
        const baseOffset = workerIndex * (V2_CONFIG.BYTES_PER_WORKER / 4);
        Atomics.store(this.statusView, baseOffset, status);
    }

    destroy(): void {
        if (this.watchdogInterval) {
            clearInterval(this.watchdogInterval);
        }
    }
}
