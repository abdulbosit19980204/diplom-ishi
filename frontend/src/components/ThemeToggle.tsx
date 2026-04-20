'use client';
import { useThemeStore } from '@/store/themeStore';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="btn btn-ghost relative w-9 h-9 p-0 rounded-lg overflow-hidden"
      whileTap={{ scale: 0.90 }}
      title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
      aria-label="Mavzu almashtirish"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun size={16} style={{ color: 'var(--warning)' }} />
          </motion.span>
        ) : (
          <motion.span key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon size={16} style={{ color: 'var(--brand)' }} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
