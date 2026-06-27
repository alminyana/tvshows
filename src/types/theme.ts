export type Theme = 'default' | 'ocean' | 'sunset' | 'forest'
  | 'amatista' | 'carmesi' | 'cian' | 'crepusculo';
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}
