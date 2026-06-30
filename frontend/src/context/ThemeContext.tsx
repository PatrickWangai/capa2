import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName =
  | 'blue' | 'teal' | 'purple' | 'rose' | 'amber'
  | 'indigo' | 'cyan' | 'emerald' | 'orange' | 'pink'
  | 'violet' | 'sky' | 'lime'
  | 'black' | 'white';

type ThemeVars = {
  label: string;
  swatch: string;
  accent: string;
  accentDark: string;
  accentRgb: string;
  bg: [string, string, string, string, string, string];
  // Optional overrides used by the Apple Black/White appearances
  accentText?: string;
  textPrimary?: string;
  textSecondary?: string;
  cardBg?: string;
  cardBorder?: string;
  sidebarBg?: string;
  inputBg?: string;
  navText?: string;
  isLight?: boolean;
};

// Colour themes — shown in the colour grid
export const COLOUR_THEMES: Exclude<ThemeName, 'black' | 'white'>[] = [
  'teal','blue','sky','cyan','emerald','lime',
  'amber','orange','rose','pink','violet','purple','indigo',
];

export const THEMES: Record<ThemeName, ThemeVars> = {
  // ── Colour themes ──────────────────────────────────────────────────────────
  blue:    { label: 'Blue',    swatch: '#3b82f6', accent: '#3b82f6', accentDark: '#1d4ed8', accentRgb: '59,130,246',   bg: ['#0a1628','#0f2d5c','#1a4aad','#2563eb','#3b82f6','#1d4ed8'] },
  sky:     { label: 'Sky',     swatch: '#38bdf8', accent: '#38bdf8', accentDark: '#0284c7', accentRgb: '56,189,248',   bg: ['#071828','#0c304a','#064e7e','#0369a1','#0284c7','#0c4a6e'] },
  cyan:    { label: 'Cyan',    swatch: '#06b6d4', accent: '#06b6d4', accentDark: '#0891b2', accentRgb: '6,182,212',    bg: ['#071a1f','#0b3045','#085f78','#0891b2','#06b6d4','#0e7490'] },
  teal:    { label: 'Teal',    swatch: '#20d4b8', accent: '#20d4b8', accentDark: '#17b8a2', accentRgb: '32,212,184',   bg: ['#082e3c','#0c5260','#0f8878','#18c0a8','#2acfbc','#1aaa96'] },
  emerald: { label: 'Emerald', swatch: '#10b981', accent: '#10b981', accentDark: '#059669', accentRgb: '16,185,129',   bg: ['#051a10','#073b20','#065f35','#059669','#10b981','#047857'] },
  lime:    { label: 'Lime',    swatch: '#84cc16', accent: '#84cc16', accentDark: '#65a30d', accentRgb: '132,204,22',   bg: ['#0f1a02','#1e3804','#2a5c05','#3a7d09','#65a30d','#4d7c0f'] },
  amber:   { label: 'Amber',   swatch: '#f59e0b', accent: '#f59e0b', accentDark: '#d97706', accentRgb: '245,158,11',   bg: ['#1a0f00','#3d1a00','#7c3800','#b45309','#d97706','#92400e'] },
  orange:  { label: 'Orange',  swatch: '#f97316', accent: '#f97316', accentDark: '#ea580c', accentRgb: '249,115,22',   bg: ['#1a0800','#3d1400','#7c2d00','#c2410c','#ea580c','#9a3412'] },
  rose:    { label: 'Rose',    swatch: '#f43f5e', accent: '#f43f5e', accentDark: '#be123c', accentRgb: '244,63,94',    bg: ['#1a0510','#4a0920','#881337','#be123c','#e11d48','#9f1239'] },
  pink:    { label: 'Pink',    swatch: '#ec4899', accent: '#ec4899', accentDark: '#db2777', accentRgb: '236,72,153',   bg: ['#1a0515','#40082a','#86195a','#be185d','#db2777','#9d174d'] },
  violet:  { label: 'Violet',  swatch: '#8b5cf6', accent: '#8b5cf6', accentDark: '#6d28d9', accentRgb: '139,92,246',   bg: ['#0f0a20','#1e1050','#3b1fa0','#5b21b6','#7c3aed','#4c1d95'] },
  purple:  { label: 'Purple',  swatch: '#a855f7', accent: '#a855f7', accentDark: '#7c3aed', accentRgb: '168,85,247',   bg: ['#0f0a1e','#1e0a4e','#3b0a8e','#6d28d9','#7c3aed','#5b21b6'] },
  indigo:  { label: 'Indigo',  swatch: '#6366f1', accent: '#6366f1', accentDark: '#4338ca', accentRgb: '99,102,241',   bg: ['#0d0d28','#16164a','#2525a0','#3730a3','#6366f1','#4338ca'] },

  // ── Apple Appearances (separate section in the drawer) ─────────────────────
  black: {
    label: 'Dark', swatch: '#1c1c1e',
    accent: '#f5f5f7', accentDark: '#d1d1d6', accentRgb: '245,245,247',
    bg: ['#000000','#000000','#0a0a0a','#111111','#1c1c1e','#000000'],
    accentText: '#000000',
  },
  white: {
    label: 'Light', swatch: '#f5f5f7',
    accent: '#0071e3', accentDark: '#0060c7', accentRgb: '0,113,227',
    bg: ['#ffffff','#f5f5f7','#fbfbfd','#f5f5f7','#ffffff','#f0f0f5'],
    accentText:    '#ffffff',
    textPrimary:   '#1d1d1f',
    textSecondary: '#6e6e73',
    cardBg:        'rgba(255,255,255,0.85)',
    cardBorder:    'rgba(0,0,0,0.09)',
    sidebarBg:     'rgba(255,255,255,0.85)',
    inputBg:       'rgba(242,242,247,0.90)',
    navText:       'rgba(29,29,31,0.78)',
    isLight:       true,
  },
};

function applyTheme(name: ThemeName) {
  const t = THEMES[name];
  const r = document.documentElement;

  r.style.setProperty('--accent',             t.accent);
  r.style.setProperty('--accent-dark',        t.accentDark);
  r.style.setProperty('--accent-rgb',         t.accentRgb);
  r.style.setProperty('--accent-dim',         `rgba(${t.accentRgb},0.18)`);
  r.style.setProperty('--accent-glow',        `rgba(${t.accentRgb},0.22)`);
  r.style.setProperty('--accent-text',        t.accentText    ?? '#ffffff');
  r.style.setProperty('--color-primary-from', t.accent);
  r.style.setProperty('--color-primary-to',   t.accentDark);
  r.style.setProperty('--bg-1', t.bg[0]);
  r.style.setProperty('--bg-2', t.bg[1]);
  r.style.setProperty('--bg-3', t.bg[2]);
  r.style.setProperty('--bg-4', t.bg[3]);
  r.style.setProperty('--bg-5', t.bg[4]);
  r.style.setProperty('--bg-6', t.bg[5]);

  // Surface & text (light mode gets real values; dark modes get defaults)
  r.style.setProperty('--text',           t.textPrimary   ?? '#ffffff');
  r.style.setProperty('--text-secondary', t.textSecondary ?? 'rgba(235,235,245,0.60)');
  r.style.setProperty('--card-bg',        t.cardBg        ?? 'rgba(28,28,30,0.72)');
  r.style.setProperty('--card-border',    t.cardBorder    ?? 'rgba(255,255,255,0.08)');
  r.style.setProperty('--sidebar-bg',     t.sidebarBg     ?? 'rgba(6,38,52,0.62)');
  r.style.setProperty('--input-bg',       t.inputBg       ?? 'rgba(44,44,46,0.85)');
  r.style.setProperty('--nav-text',       t.navText       ?? 'rgba(235,235,245,0.85)');

  r.setAttribute('data-theme', t.isLight ? 'light' : 'dark');
}

type ThemeCtx = { theme: ThemeName; setTheme: (t: ThemeName) => void };

const ThemeContext = createContext<ThemeCtx>({ theme: 'teal', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('capa-theme') as ThemeName | null;
    return saved && saved in THEMES ? saved : 'teal';
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

  function setTheme(t: ThemeName) {
    setThemeState(t);
    localStorage.setItem('capa-theme', t);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
