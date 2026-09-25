import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15_000,
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;
    try {
      const { refreshToken } = useAuthStore.getState();
      const { data } = await axios.post('/api/auth/refresh', { refreshToken });
      useAuthStore.getState().setAuth(
        useAuthStore.getState().user!,
        data.accessToken,
        data.refreshToken,
      );
      queue.forEach(p => p.resolve(data.accessToken));
      queue = [];
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (e) {
      queue.forEach(p => p.reject(e));
      queue = [];
      useAuthStore.getState().logout();
      window.location.href = '/';
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
