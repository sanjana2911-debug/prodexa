/**
 * ThemeContext provides dark mode functionality
 * Theme preference is persisted in localStorage
 * Uses useMemo to prevent unnecessary re-renders of children
 */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('prodexa_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme class to document and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('prodexa_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  // Memoize context value to prevent re-renders when isDark hasn't changed
  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}