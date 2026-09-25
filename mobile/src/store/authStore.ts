import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
  status: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [user, accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync('capa_user'),
        SecureStore.getItemAsync('capa_access'),
        SecureStore.getItemAsync('capa_refresh'),
      ]);
      set({
        user: user ? JSON.parse(user) : null,
        accessToken,
        refreshToken,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setAuth: async (user, accessToken, refreshToken) => {
    await Promise.all([
      SecureStore.setItemAsync('capa_user', JSON.stringify(user)),
      SecureStore.setItemAsync('capa_access', accessToken),
      SecureStore.setItemAsync('capa_refresh', refreshToken),
    ]);
    set({ user, accessToken, refreshToken });
  },

  setAccessToken: (accessToken) => {
    SecureStore.setItemAsync('capa_access', accessToken);
    set({ accessToken });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('capa_user'),
      SecureStore.deleteItemAsync('capa_access'),
      SecureStore.deleteItemAsync('capa_refresh'),
    ]);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
