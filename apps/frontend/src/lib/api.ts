import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/store/auth-store';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const status = error.response?.status;
    const { refreshToken, setTokens, clearSession } = useAuthStore.getState();

    if (status !== 401 || !originalRequest || originalRequest._retry || !refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
        `${apiBaseUrl}/auth/refresh`,
        { refresh_token: refreshToken },
        { timeout: 15_000 },
      );
      setTokens(data.access_token, data.refresh_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export { api };
