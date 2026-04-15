import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authTokens } from './authTokens';
import { authEvents } from './authEvents';
import { AuthTokens } from '@/types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

type ExtendedAxiosRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const addToQueue = (callback: (token: string | null) => void) => {
  refreshQueue.push(callback);
};

const flushQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
};

const refreshAccessToken = async (): Promise<AuthTokens> => {
  const refreshToken = authTokens.getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token missing');
  }

  const response = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  authTokens.setAccessToken(response.data.accessToken);
  authTokens.setRefreshToken(response.data.refreshToken);
  return response.data;
};

const extractMessage = (data?: unknown) => {
  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message?: string };
    if (message) return message;
  }
  // Also check for 'error' field (our API uses { success, error })
  if (data && typeof data === 'object' && 'error' in data) {
    const { error } = data as { error?: string };
    if (error) return error;
  }
  return undefined;
};

const shouldBypassRefresh = (config?: ExtendedAxiosRequestConfig) => {
  const url = config?.url || '';
  return ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => url.includes(path));
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = authTokens.getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const { response, config } = error;
    const originalRequest = config as ExtendedAxiosRequestConfig;

    if (response?.status === 401 && originalRequest && !shouldBypassRefresh(originalRequest)) {
      if (!authTokens.getRefreshToken()) {
        authTokens.clear();
        authEvents.emitLogout();
        return Promise.reject(new Error('Session expired. Please sign in again.'));
      }

      if (originalRequest._retry) {
        authTokens.clear();
        authEvents.emitLogout();
        return Promise.reject(new Error('Session expired. Please sign in again.'));
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addToQueue((token) => {
            if (!token) {
              reject(new Error('Session expired. Please sign in again.'));
              return;
            }
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { accessToken } = await refreshAccessToken();
        flushQueue(accessToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(null);
        authTokens.clear();
        authEvents.emitLogout();
        const refreshResponse = (refreshError as AxiosError)?.response;
        const message =
          extractMessage(refreshResponse?.data) ||
          (refreshError as Error).message ||
          'Session expired. Please sign in again.';
        return Promise.reject(new Error(message));
      } finally {
        isRefreshing = false;
      }
    }

    const message = extractMessage(response?.data) || error.message || 'Something went wrong';
    console.error('API Error:', message);
    // Reject with Error containing backend message for proper error handling
    return Promise.reject(new Error(message));
  }
);

export default api;
