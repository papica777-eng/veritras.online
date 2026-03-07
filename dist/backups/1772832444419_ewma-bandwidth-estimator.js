"use strict";
/*
 * EWMA Bandwidth Estimator
 *  - heavily inspired from shaka-player
 * Tracks bandwidth samples and estimates available bandwidth.
 * Based on the minimum of two exponentially-weighted moving averages with
 * different half-lives.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ewma_1 = __importDefault(require("../utils/ewma"));
class EwmaBandWidthEstimator {
    defaultEstimate_;
    minWeight_;
    minDelayMs_;
    slow_;
    fast_;
    defaultTTFB_;
    ttfb_;
    constructor(slow, fast, defaultEstimate, defaultTTFB = 100) {
        this.defaultEstimate_ = defaultEstimate;
        this.minWeight_ = 0.001;
        this.minDelayMs_ = 50;
        this.slow_ = new ewma_1.default(slow);
        this.fast_ = new ewma_1.default(fast);
        this.defaultTTFB_ = defaultTTFB;
        this.ttfb_ = new ewma_1.default(slow);
    }
    update(slow, fast) {
        const { slow_, fast_, ttfb_ } = this;
        if (slow_.halfLife !== slow) {
            this.slow_ = new ewma_1.default(slow, slow_.getEstimate(), slow_.getTotalWeight());
        }
        if (fast_.halfLife !== fast) {
            this.fast_ = new ewma_1.default(fast, fast_.getEstimate(), fast_.getTotalWeight());
        }
        if (ttfb_.halfLife !== slow) {
            this.ttfb_ = new ewma_1.default(slow, ttfb_.getEstimate(), ttfb_.getTotalWeight());
        }
    }
    sample(durationMs, numBytes) {
        durationMs = Math.max(durationMs, this.minDelayMs_);
        const numBits = 8 * numBytes;
        // weight is duration in seconds
        const durationS = durationMs / 1000;
        // value is bandwidth in bits/s
        const bandwidthInBps = numBits / durationS;
        this.fast_.sample(durationS, bandwidthInBps);
        this.slow_.sample(durationS, bandwidthInBps);
    }
    sampleTTFB(ttfb) {
        // weight is frequency curve applied to TTFB in seconds
        // (longer times have less weight with expected input under 1 second)
        const seconds = ttfb / 1000;
        const weight = Math.sqrt(2) * Math.exp(-Math.pow(seconds, 2) / 2);
        this.ttfb_.sample(weight, Math.max(ttfb, 5));
    }
    canEstimate() {
        return this.fast_.getTotalWeight() >= this.minWeight_;
    }
    getEstimate() {
        if (this.canEstimate()) {
            // console.log('slow estimate:'+ Math.round(this.slow_.getEstimate()));
            // console.log('fast estimate:'+ Math.round(this.fast_.getEstimate()));
            // Take the minimum of these two estimates.  This should have the effect of
            // adapting down quickly, but up more slowly.
            return Math.min(this.fast_.getEstimate(), this.slow_.getEstimate());
        }
        else {
            return this.defaultEstimate_;
        }
    }
    getEstimateTTFB() {
        if (this.ttfb_.getTotalWeight() >= this.minWeight_) {
            return this.ttfb_.getEstimate();
        }
        else {
            return this.defaultTTFB_;
        }
    }
    get defaultEstimate() {
        return this.defaultEstimate_;
    }
    destroy() { }
}
exports.default = EwmaBandWidthEstimator;
