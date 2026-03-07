"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamProcessor = exports.MemoryThrottleTransform = exports.BatchProcessor = exports.JSONArrayParser = exports.JSONLineParser = void 0;
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const node_fs_1 = require("node:fs");
const node_zlib_1 = require("node:zlib");
const node_events_1 = require("node:events");
const pipelineAsync = (0, node_util_1.promisify)(node_stream_1.pipeline);
// ═══════════════════════════════════════════════════════════════════════════════
// JSON LINE PARSER TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Transform stream that parses JSON lines (NDJSON)
 * Each line is parsed independently, preventing memory overflow
 */
class JSONLineParser extends node_stream_1.Transform {
    buffer = '';
    lineCount = 0;
    constructor() {
        super({ objectMode: true });
    }
    _transform(chunk, encoding, callback) {
        this.buffer += chunk.toString();
        const lines = this.buffer.split('\n');
        // Keep incomplete last line in buffer
        this.buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            try {
                const parsed = JSON.parse(trimmed);
                this.lineCount++;
                this.push(parsed);
            }
            catch (error) {
                this.emit('parseError', { line: this.lineCount, error, content: trimmed });
            }
        }
        callback();
    }
    _flush(callback) {
        // Process remaining buffer
        const trimmed = this.buffer.trim();
        if (trimmed) {
            try {
                const parsed = JSON.parse(trimmed);
                this.push(parsed);
            }
            catch (error) {
                this.emit('parseError', { line: this.lineCount, error, content: trimmed });
            }
        }
        callback();
    }
    getLineCount() {
        return this.lineCount;
    }
}
exports.JSONLineParser = JSONLineParser;
// ═══════════════════════════════════════════════════════════════════════════════
// JSON ARRAY PARSER TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Transform stream that parses large JSON arrays item by item
 * Uses minimal memory by streaming array elements
 */
class JSONArrayParser extends node_stream_1.Transform {
    buffer = '';
    depth = 0;
    inArray = false;
    itemStart = -1;
    itemCount = 0;
    jsonPath;
    constructor(options = {}) {
        super({ objectMode: true });
        this.jsonPath = options.jsonPath?.split('.') ?? [];
    }
    _transform(chunk, encoding, callback) {
        const str = chunk.toString();
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            this.buffer += char;
            if (char === '[' && !this.inArray) {
                this.depth++;
                if (this.depth === this.jsonPath.length + 1) {
                    this.inArray = true;
                    this.itemStart = this.buffer.length;
                }
            }
            else if (char === ']' && this.inArray) {
                this.depth--;
                if (this.depth === this.jsonPath.length) {
                    this.inArray = false;
                }
            }
            else if (char === '{') {
                if (this.inArray && this.itemStart === -1) {
                    this.itemStart = this.buffer.length - 1;
                }
                this.depth++;
            }
            else if (char === '}') {
                this.depth--;
                if (this.inArray && this.depth === this.jsonPath.length + 1) {
                    // Complete item found
                    const itemStr = this.buffer.slice(this.itemStart);
                    try {
                        const item = JSON.parse(itemStr);
                        this.itemCount++;
                        this.push(item);
                    }
                    catch (error) {
                        this.emit('parseError', { item: this.itemCount, error });
                    }
                    this.itemStart = -1;
                    // Clear processed buffer to save memory
                    this.buffer = '';
                }
            }
            else if (char === ',' && this.inArray && this.depth === this.jsonPath.length + 1) {
                this.itemStart = -1;
            }
        }
        callback();
    }
    _flush(callback) {
        callback();
    }
    getItemCount() {
        return this.itemCount;
    }
}
exports.JSONArrayParser = JSONArrayParser;
// ═══════════════════════════════════════════════════════════════════════════════
// BATCH PROCESSOR TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Transform stream that batches items for efficient processing
 */
class BatchProcessor extends node_stream_1.Transform {
    batch = [];
    batchSize;
    processor;
    batchCount = 0;
    processing = false;
    queue = [];
    concurrency;
    activeProcessors = 0;
    constructor(options) {
        super({ objectMode: true });
        this.batchSize = options.batchSize;
        this.processor = options.processor;
        this.concurrency = options.concurrency ?? 1;
    }
    _transform(item, encoding, callback) {
        this.batch.push(item);
        if (this.batch.length >= this.batchSize) {
            this.queue.push([...this.batch]);
            this.batch = [];
            this.processQueue().then(() => callback()).catch((err) => callback(err));
        }
        else {
            callback();
        }
    }
    _flush(callback) {
        // Process remaining items
        if (this.batch.length > 0) {
            this.queue.push([...this.batch]);
            this.batch = [];
        }
        this.flushQueue()
            .then(() => callback())
            .catch((err) => callback(err));
    }
    async flushQueue() {
        // Process all remaining batches
        const promises = [];
        while (this.queue.length > 0) {
            const batch = this.queue.shift();
            if (batch) {
                promises.push(this.processBatch(batch));
            }
        }
        await Promise.all(promises);
    }
    async processQueue() {
        while (this.queue.length > 0 && this.activeProcessors < this.concurrency) {
            const batch = this.queue.shift();
            if (batch) {
                this.activeProcessors++;
                this.processBatch(batch).finally(() => {
                    this.activeProcessors--;
                });
            }
        }
    }
    async processBatch(batch) {
        try {
            await this.processor(batch);
            this.batchCount++;
            this.push({ batchNumber: this.batchCount, itemCount: batch.length });
        }
        catch (error) {
            this.emit('batchError', { batch: this.batchCount, error });
        }
    }
    getBatchCount() {
        return this.batchCount;
    }
}
exports.BatchProcessor = BatchProcessor;
// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY-AWARE THROTTLE TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Transform stream that throttles based on memory pressure
 * Pauses upstream when memory threshold is exceeded
 */
class MemoryThrottleTransform extends node_stream_1.Transform {
    threshold;
    checkInterval;
    _isPausedByMemory = false;
    timer;
    peakMemory = 0;
    constructor(options = {}) {
        super({ objectMode: true });
        this.threshold = options.threshold ?? 0.8 * 24 * 1024 * 1024 * 1024; // 80% of 24GB
        this.checkInterval = options.checkInterval ?? 1000;
        this.startMemoryMonitor();
    }
    /** Check if stream is paused due to memory pressure */
    get isPausedByMemory() {
        return this._isPausedByMemory;
    }
    startMemoryMonitor() {
        this.timer = setInterval(() => {
            const usage = process.memoryUsage();
            this.peakMemory = Math.max(this.peakMemory, usage.heapUsed);
            if (usage.heapUsed > this.threshold && !this._isPausedByMemory) {
                this._isPausedByMemory = true;
                this.emit('pause', { reason: 'memory', usage: usage.heapUsed });
            }
            else if (usage.heapUsed < this.threshold * 0.7 && this._isPausedByMemory) {
                this._isPausedByMemory = false;
                this.emit('resume', { usage: usage.heapUsed });
            }
        }, this.checkInterval);
    }
    _transform(chunk, encoding, callback) {
        if (this._isPausedByMemory) {
            // Wait for memory to free up
            const waitForMemory = setInterval(() => {
                if (!this._isPausedByMemory) {
                    clearInterval(waitForMemory);
                    this.push(chunk);
                    callback();
                }
            }, 100);
        }
        else {
            this.push(chunk);
            callback();
        }
    }
    _destroy(error, callback) {
        if (this.timer) {
            clearInterval(this.timer);
        }
        callback(error);
    }
    getPeakMemory() {
        return this.peakMemory;
    }
}
exports.MemoryThrottleTransform = MemoryThrottleTransform;
// ═══════════════════════════════════════════════════════════════════════════════
// STREAM PROCESSOR FACADE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 📊 Stream Processor
 *
 * High-level API for memory-efficient data processing.
 * Optimized for 24GB RAM Ryzen systems.
 */
class StreamProcessor extends node_events_1.EventEmitter {
    options;
    stats = {
        bytesProcessed: 0,
        itemsProcessed: 0,
        batchesProcessed: 0,
        errors: 0,
        startTime: 0,
        throughput: 0,
        memoryPeakUsage: 0
    };
    constructor(options = {}) {
        super();
        this.options = {
            highWaterMark: options.highWaterMark ?? 64 * 1024, // 64KB
            autoBackpressure: options.autoBackpressure ?? true,
            memoryThreshold: options.memoryThreshold ?? 0.7 * 24 * 1024 * 1024 * 1024, // 70% of 24GB
            compress: options.compress ?? false
        };
    }
    /**
     * Process a large JSON file as a stream
     * @param inputPath - Path to input file
     * @param processor - Function to process each item
     * @param options - JSON streaming options
     */
    async processJSONFile(inputPath, processor, options = {}) {
        this.resetStats();
        const readStream = (0, node_fs_1.createReadStream)(inputPath, {
            highWaterMark: this.options.highWaterMark
        });
        const parser = options.ndjson
            ? new JSONLineParser()
            : new JSONArrayParser({ jsonPath: options.jsonPath });
        const memoryThrottle = new MemoryThrottleTransform({
            threshold: this.options.memoryThreshold
        });
        // Track bytes
        readStream.on('data', (chunk) => {
            const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
            this.stats.bytesProcessed += buffer.length;
        });
        // Process items
        const processTransform = new node_stream_1.Transform({
            objectMode: true,
            transform: async (item, encoding, callback) => {
                try {
                    await processor(item);
                    this.stats.itemsProcessed++;
                    callback();
                }
                catch (error) {
                    this.stats.errors++;
                    this.emit('processingError', { item, error });
                    callback();
                }
            }
        });
        // Handle errors
        parser.on('parseError', (err) => {
            this.stats.errors++;
            this.emit('parseError', err);
        });
        memoryThrottle.on('pause', (info) => {
            this.emit('memoryPressure', info);
        });
        try {
            await pipelineAsync(readStream, parser, memoryThrottle, processTransform);
            this.finalizeStats(memoryThrottle.getPeakMemory());
            return this.stats;
        }
        catch (error) {
            this.stats.errors++;
            throw error;
        }
    }
    /**
     * Process a large JSON file in batches
     * @param inputPath - Path to input file
     * @param options - Batch processing options
     */
    async processJSONInBatches(inputPath, options) {
        this.resetStats();
        const readStream = (0, node_fs_1.createReadStream)(inputPath, {
            highWaterMark: this.options.highWaterMark
        });
        const parser = options.ndjson
            ? new JSONLineParser()
            : new JSONArrayParser({ jsonPath: options.jsonPath });
        const batchProcessor = new BatchProcessor({
            batchSize: options.batchSize,
            processor: options.processor,
            concurrency: options.concurrency,
            timeout: options.timeout
        });
        const memoryThrottle = new MemoryThrottleTransform({
            threshold: this.options.memoryThreshold
        });
        // Track bytes
        readStream.on('data', (chunk) => {
            const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
            this.stats.bytesProcessed += buffer.length;
        });
        // Track batches
        batchProcessor.on('data', (result) => {
            this.stats.batchesProcessed = result.batchNumber;
            this.stats.itemsProcessed += result.itemCount;
        });
        batchProcessor.on('batchError', (err) => {
            this.stats.errors++;
            this.emit('batchError', err);
        });
        try {
            await pipelineAsync(readStream, parser, memoryThrottle, batchProcessor);
            this.finalizeStats(memoryThrottle.getPeakMemory());
            return this.stats;
        }
        catch (error) {
            this.stats.errors++;
            throw error;
        }
    }
    /**
     * Stream data from one file to another with transformation
     * @param inputPath - Source file path
     * @param outputPath - Destination file path
     * @param transform - Transform function for each item
     */
    async transformFile(inputPath, outputPath, transform, options = {}) {
        this.resetStats();
        const readStream = (0, node_fs_1.createReadStream)(inputPath, {
            highWaterMark: this.options.highWaterMark
        });
        const parser = options.ndjson
            ? new JSONLineParser()
            : new JSONArrayParser({ jsonPath: options.jsonPath });
        // Transform each item
        const transformStream = new node_stream_1.Transform({
            objectMode: true,
            transform: async (item, encoding, callback) => {
                try {
                    const transformed = await transform(item);
                    this.stats.itemsProcessed++;
                    callback(null, JSON.stringify(transformed) + '\n');
                }
                catch (error) {
                    this.stats.errors++;
                    this.emit('transformError', { item, error });
                    callback();
                }
            }
        });
        const writeStream = (0, node_fs_1.createWriteStream)(outputPath);
        const streams = [
            readStream,
            parser,
            transformStream
        ];
        if (this.options.compress) {
            streams.push((0, node_zlib_1.createGzip)());
        }
        streams.push(writeStream);
        // Track bytes
        readStream.on('data', (chunk) => {
            const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
            this.stats.bytesProcessed += buffer.length;
        });
        try {
            // Use manual piping for better type control
            await new Promise((resolve, reject) => {
                let currentStream = readStream;
                for (let i = 1; i < streams.length; i++) {
                    const nextStream = streams[i];
                    currentStream = currentStream.pipe(nextStream);
                }
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                readStream.on('error', reject);
            });
            this.finalizeStats(process.memoryUsage().heapUsed);
            return this.stats;
        }
        catch (error) {
            this.stats.errors++;
            throw error;
        }
    }
    /**
     * Create a readable stream from an async generator
     * @param generator - Async generator function
     */
    createReadableFromGenerator(generator) {
        return node_stream_1.Readable.from(generator, { objectMode: true });
    }
    /**
     * Create a writable stream that collects items
     * @param maxItems - Maximum items to collect (prevents memory issues)
     */
    createCollectorStream(maxItems = 10000) {
        const items = [];
        const writable = new node_stream_1.Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                if (items.length < maxItems) {
                    items.push(chunk);
                    callback();
                }
                else {
                    callback(new Error(`Maximum items (${maxItems}) exceeded`));
                }
            }
        });
        // Extend the writable with getItems method
        const writableWithGetItems = writable;
        writableWithGetItems.getItems = () => items;
        return writableWithGetItems;
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            bytesProcessed: 0,
            itemsProcessed: 0,
            batchesProcessed: 0,
            errors: 0,
            startTime: Date.now(),
            throughput: 0,
            memoryPeakUsage: 0
        };
    }
    /**
     * Finalize statistics
     */
    finalizeStats(peakMemory) {
        const duration = (Date.now() - this.stats.startTime) / 1000; // seconds
        this.stats.throughput = duration > 0 ? this.stats.itemsProcessed / duration : 0;
        this.stats.memoryPeakUsage = peakMemory;
    }
    /**
     * Get current statistics
     */
    getStats() {
        return { ...this.stats };
    }
}
exports.StreamProcessor = StreamProcessor;
exports.default = StreamProcessor;
