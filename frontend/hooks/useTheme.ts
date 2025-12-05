/**
 * useTheme Hook
 * 
 * React hook to access theme colors and values in components.
 * 
 * Usage:
 * ```tsx
 * const theme = useTheme();
 * 
 * <div style={{ backgroundColor: theme.colors.cardBg }}>
 *   <p style={{ color: theme.colors.textPrimary }}>Hello</p>
 * </div>
 * ```
 */

import { useMemo } from 'react';
import { theme, colors, getThemeColor } from '@/config/theme';

export function useTheme() {
  return useMemo(() => ({
    // Full theme object
    theme,
    
    // Flattened colors for easy access
    colors,
    
    // Helper function to get any theme color
    getColor: getThemeColor,
    
    // Common shortcuts
    primary: theme.primary.base,
    background: theme.background.base,
    cardBg: theme.card.bg,
    cardHover: theme.card.hover,
    textPrimary: theme.text.primary,
    textMuted: theme.text.muted,
    border: theme.border.base,
  }), []);
}

