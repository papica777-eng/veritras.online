"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * 🛡️ RESILIENT HTTP CLIENT
 *
 * Wrapper around Axios with automatic retries, timeout handling, and error logging.
 * Designed for high-reliability exchange connectivity.
 */
class ResilientHttpClient {
    client;
    name;
    maxRetries = 3;
    constructor(name, baseURL, apiKey) {
        this.name = name;
        this.client = axios_1.default.create({
            baseURL,
            timeout: 5000,
            headers: {
                'X-MBX-APIKEY': apiKey,
                'Content-Type': 'application/json'
            }
        });
    }
    async get(url, params = {}) {
        return this.request('GET', url, params);
    }
    async post(url, data = {}) {
        return this.request('POST', url, {}, data);
    }
    async request(method, url, params = {}, data = {}) {
        let attempt = 0;
        while (attempt < this.maxRetries) {
            try {
                const config = {
                    method,
                    url,
                    params,
                    data
                };
                const response = await this.client.request(config);
                return response.data;
            }
            catch (error) {
                attempt++;
                console.warn(`⚠️ [${this.name}] Request failed (${method} ${url}): ${error.message}. Attempt ${attempt}/${this.maxRetries}`);
                if (attempt >= this.maxRetries) {
                    console.error(`❌ [${this.name}] Critical failure after ${this.maxRetries} attempts.`);
                    throw error;
                }
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
            }
        }
        throw new Error(`[${this.name}] Request failed after max retries`);
    }
}
exports.default = ResilientHttpClient;
