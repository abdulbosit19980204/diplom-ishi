import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('light', next === 'light');
    }
  },
  setTheme: (t: Theme) => {
    set({ theme: t });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', t);
      document.documentElement.classList.toggle('light', t === 'light');
    }
  },
}));
