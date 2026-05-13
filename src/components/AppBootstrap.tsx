'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function AppBootstrap() {
  const darkMode = useUIStore((state) => state.darkMode);
  const calmMode = useUIStore((state) => state.calmMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.classList.toggle('calm-mode', calmMode);
  }, [calmMode, darkMode]);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  return null;
}
