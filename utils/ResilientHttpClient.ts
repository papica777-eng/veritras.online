import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 🛡️ RESILIENT HTTP CLIENT
 * 
 * Wrapper around Axios with automatic retries, timeout handling, and error logging.
 * Designed for high-reliability exchange connectivity.
 */
export default class ResilientHttpClient {
    private client: AxiosInstance;
    private name: string;
    private maxRetries: number = 3;

    constructor(name: string, baseURL: string, apiKey: string) {
        this.name = name;
        this.client = axios.create({
            baseURL,
            timeout: 5000,
            headers: {
                'X-MBX-APIKEY': apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    public async get<T>(url: string, params: any = {}): Promise<T> {
        return this.request<T>('GET', url, params);
    }

    public async post<T>(url: string, data: any = {}): Promise<T> {
        return this.request<T>('POST', url, {}, data);
    }

    private async request<T>(method: string, url: string, params: any = {}, data: any = {}): Promise<T> {
        let attempt = 0;
        
        while (attempt < this.maxRetries) {
            try {
                const config: AxiosRequestConfig = {
                    method,
                    url,
                    params,
                    data
                };
                
                const response: AxiosResponse<T> = await this.client.request(config);
                return response.data;
            } catch (error: any) {
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
