const std = @import("std");

/// High-Performance Circular Buffer for Mempool Data
/// Avoids GC overhead by pre-allocating memory at startup.

pub const BUFFER_SIZE: usize = 1024 * 16; // 16k transactions capacity

pub const Transaction = extern struct {
    amount: f64,
    timestamp: u64,
    token_id: u32,
    is_hot_wallet: bool,
};

pub const RingBuffer = extern struct {
    data: [BUFFER_SIZE]Transaction,
    head: usize,
    tail: usize,
};

// Global static buffer (Zero allocation at runtime)
var mempool_buffer: RingBuffer = undefined;

/// Initialize the ring buffer
export fn zig_init_buffer() void {
    mempool_buffer.head = 0;
    mempool_buffer.tail = 0;
    // Zero out data if needed, or rely on undefined (fast)
}

/// Write a transaction to the buffer (Overwrites old data if full)
export fn zig_write_tx(amount: f64, timestamp: u64, token_id: u32, is_hot_wallet: bool) void {
    const idx = mempool_buffer.head % BUFFER_SIZE;

    mempool_buffer.data[idx] = Transaction{
        .amount = amount,
        .timestamp = timestamp,
        .token_id = token_id,
        .is_hot_wallet = is_hot_wallet,
    };

    mempool_buffer.head += 1;
}

/// Read the latest transaction (returns pointer or copy)
export fn zig_get_latest_tx(out_tx: *Transaction) bool {
    if (mempool_buffer.head == 0) return false;

    const last_idx = (mempool_buffer.head - 1) % BUFFER_SIZE;
    out_tx.* = mempool_buffer.data[last_idx];
    return true;
}

/// Scan for Whale Movements (> threshold) in the last N transactions
export fn zig_scan_whales(threshold: f64, count: usize) usize {
    var found: usize = 0;
    var current = mempool_buffer.head;
    var scanned: usize = 0;

    while (scanned < count and current > 0) {
        current -= 1;
        const idx = current % BUFFER_SIZE;
        const tx = mempool_buffer.data[idx];

        if (tx.amount >= threshold) {
            found += 1;
        }

        scanned += 1;
    }

    return found;
}
