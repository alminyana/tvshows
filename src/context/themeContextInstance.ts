import { createContext } from 'react';
import type { ThemeContextValue } from '@/types';

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  mode: 'light',
  setTheme: () => undefined,
  setMode: () => undefined,
  toggleMode: () => undefined,
});
