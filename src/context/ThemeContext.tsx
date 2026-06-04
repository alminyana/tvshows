import { useEffect, useState } from 'react';
import type { Theme, ThemeMode } from '@/types';
import { ThemeContext } from './themeContextInstance';

export { ThemeContext } from './themeContextInstance';

const STORAGE_KEY_THEME = 'tv-shows:theme';
const STORAGE_KEY_MODE = 'tv-shows:mode';

const getInitialMode = (): ThemeMode => {
  const stored = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
  if (stored === 'default' || stored === 'ocean' || stored === 'sunset' || stored === 'forest') {
    return stored;
  }
  return 'default';
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;
  }, [theme, mode]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  };

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY_MODE, next);
  };

  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext>
  );
}
