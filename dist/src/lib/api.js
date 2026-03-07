"use strict";
/**
 * API Client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const DEFAULT_BASE_URL = 'https://api.qantum.cloud';
class ApiError extends Error {
    statusCode;
    code;
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ApiError';
    }
}
async function request(method, path, body, config) {
    const baseUrl = config.get('apiUrl') || DEFAULT_BASE_URL;
    const token = config.get('apiToken') || process.env.QANTUM_API_TOKEN;
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
    });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errorData = data;
        throw new ApiError(errorData.error?.message || `Request failed: ${response.status}`, response.status, errorData.error?.code);
    }
    return data;
}
exports.api = {
    get: (path, config) => request('GET', path, null, config),
    post: (path, body, config) => request('POST', path, body, config),
    put: (path, body, config) => request('PUT', path, body, config),
    delete: (path, config) => request('DELETE', path, null, config),
};
