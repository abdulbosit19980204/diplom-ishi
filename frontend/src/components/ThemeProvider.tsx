'use client';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useThemeStore();

  useEffect(() => {
    // Restore theme from localStorage on mount
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const theme = saved ?? preferred;
    setTheme(theme);
  }, [setTheme]);

  return <>{children}</>;
}
