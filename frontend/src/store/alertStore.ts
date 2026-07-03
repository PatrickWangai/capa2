import { create } from 'zustand';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertPayload {
  variant: AlertVariant;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000
}

interface AlertState {
  alert: AlertPayload | null;
  show: (payload: AlertPayload) => void;
  hide: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alert: null,
  show: (payload) => set({ alert: { duration: 4000, ...payload } }),
  hide: () => set({ alert: null }),
}));
