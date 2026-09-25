import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
api.interceptors.response.use(
  r => r,
  async (err) => {
    const orig = err.config;
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);
    if (refreshing) return Promise.reject(err);
    orig._retry = true;
    refreshing = true;
    try {
      const { refreshToken } = useAuthStore.getState();
      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
      useAuthStore.getState().setAccessToken(data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);
    } catch {
      await useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  }
);
