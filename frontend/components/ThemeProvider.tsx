'use client';

import { useEffect } from 'react';
import { injectThemeVariables } from '@/config/theme';

/**
 * ThemeProvider Component
 * 
 * Automatically injects CSS variables from theme.ts into the document.
 * This ensures theme.ts is the single source of truth - you only need
 * to change colors in theme.ts and they'll apply everywhere.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inject theme variables on mount
    injectThemeVariables();
  }, []);
  
  return <>{children}</>;
}

