import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'hmx-theme';
const EVENT = 'hmx-theme-change';

function getInitial(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) root.classList.add('dark');
  else root.classList.remove('dark');
}

// Apply at module load to prevent FOUC
if (typeof window !== 'undefined') applyTheme(getInitial());

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(getInitial);

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent(EVENT, { detail: isDark }));
  }, [isDark]);

  // Sync across multiple useTheme consumers + tabs
  useEffect(() => {
    const onCustom = (e: Event) => {
      const next = (e as CustomEvent<boolean>).detail;
      setIsDark(prev => (prev === next ? prev : next));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setIsDark(e.newValue === 'dark');
      }
    };
    window.addEventListener(EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback(() => setIsDark(v => !v), []);

  return { isDark, toggle };
}
