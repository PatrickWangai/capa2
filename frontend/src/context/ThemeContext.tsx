import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'blue' | 'teal' | 'purple' | 'rose' | 'amber';

type ThemeVars = {
  label: string;
  swatch: string;
  accent: string;
  accentDark: string;
  accentRgb: string;
  bg: [string, string, string, string, string, string];
};

export const THEMES: Record<ThemeName, ThemeVars> = {
  blue: {
    label: 'Blue', swatch: '#3b82f6',
    accent: '#3b82f6', accentDark: '#1d4ed8', accentRgb: '59,130,246',
    bg: ['#0a1628', '#0f2d5c', '#1a4aad', '#2563eb', '#3b82f6', '#1d4ed8'],
  },
  teal: {
    label: 'Teal', swatch: '#20d4b8',
    accent: '#20d4b8', accentDark: '#17b8a2', accentRgb: '32,212,184',
    bg: ['#082e3c', '#0c5260', '#0f8878', '#18c0a8', '#2acfbc', '#1aaa96'],
  },
  purple: {
    label: 'Purple', swatch: '#a855f7',
    accent: '#a855f7', accentDark: '#7c3aed', accentRgb: '168,85,247',
    bg: ['#0f0a1e', '#1e0a4e', '#3b0a8e', '#6d28d9', '#7c3aed', '#5b21b6'],
  },
  rose: {
    label: 'Rose', swatch: '#f43f5e',
    accent: '#f43f5e', accentDark: '#be123c', accentRgb: '244,63,94',
    bg: ['#1a0510', '#4a0920', '#881337', '#be123c', '#e11d48', '#9f1239'],
  },
  amber: {
    label: 'Amber', swatch: '#f59e0b',
    accent: '#f59e0b', accentDark: '#d97706', accentRgb: '245,158,11',
    bg: ['#1a0f00', '#3d1a00', '#7c3800', '#b45309', '#d97706', '#92400e'],
  },
};

function applyTheme(name: ThemeName) {
  const t = THEMES[name];
  const r = document.documentElement;
  r.style.setProperty('--accent', t.accent);
  r.style.setProperty('--accent-dark', t.accentDark);
  r.style.setProperty('--accent-rgb', t.accentRgb);
  r.style.setProperty('--color-primary-from', t.accent);
  r.style.setProperty('--color-primary-to', t.accentDark);
  r.style.setProperty('--bg-1', t.bg[0]);
  r.style.setProperty('--bg-2', t.bg[1]);
  r.style.setProperty('--bg-3', t.bg[2]);
  r.style.setProperty('--bg-4', t.bg[3]);
  r.style.setProperty('--bg-5', t.bg[4]);
  r.style.setProperty('--bg-6', t.bg[5]);
}

type ThemeCtx = { theme: ThemeName; setTheme: (t: ThemeName) => void };

const ThemeContext = createContext<ThemeCtx>({ theme: 'blue', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('capa-theme') as ThemeName | null;
    return saved && saved in THEMES ? saved : 'blue';
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

  function setTheme(t: ThemeName) {
    setThemeState(t);
    localStorage.setItem('capa-theme', t);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
