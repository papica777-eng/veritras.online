/**
 * API Client
 */

import Conf from 'conf';

const DEFAULT_BASE_URL = 'https://api.qantum.cloud';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body: any,
  config: Conf<any>
): Promise<T> {
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
    const errorData = data as { error?: { message?: string; code?: string } };
    throw new ApiError(
      errorData.error?.message || `Request failed: ${response.status}`,
      response.status,
      errorData.error?.code
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, config: Conf<any>) => request<T>('GET', path, null, config),
  post: <T>(path: string, body: any, config: Conf<any>) => request<T>('POST', path, body, config),
  put: <T>(path: string, body: any, config: Conf<any>) => request<T>('PUT', path, body, config),
  delete: <T>(path: string, config: Conf<any>) => request<T>('DELETE', path, null, config),
};
