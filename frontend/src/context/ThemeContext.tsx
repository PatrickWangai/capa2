import { createContext, useContext, useState } from 'react';

export type ColorMode = 'dark' | 'light';

const STORAGE_KEY = 'capa-color-mode';

function applyColorMode(mode: ColorMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  // Legacy attribute — a handful of components still gate on this directly
  // rather than the CSS cascade; kept in sync until they're migrated.
  if (mode === 'light') root.setAttribute('data-color-mode', 'light');
  else root.removeAttribute('data-color-mode');
}

type ThemeCtx = {
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
};

const ThemeContext = createContext<ThemeCtx>({
  colorMode: 'light',
  setColorMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  function setColorMode(m: ColorMode) {
    setColorModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    applyColorMode(m);
  }

  return (
    <ThemeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
