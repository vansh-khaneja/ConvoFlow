/**
 * Design Tokens for Convo Flow
 * 
 * Centralized design system tokens for consistent styling across the application.
 * These tokens define typography, colors, spacing, and animation values.
 * 
 * NOTE: For colors, use the theme config at frontend/config/theme.ts
 * This file maintains backward compatibility and extends the theme with additional tokens.
 */

import { theme } from '../config/theme';

export const designTokens = {
  // Typography Scale
  typography: {
    sizes: {
      xs: '0.75rem',      // 12px - labels, badges
      sm: '0.875rem',     // 14px - secondary text
      base: '1rem',       // 16px - body text
      lg: '1.125rem',     // 18px - emphasis
      xl: '1.25rem',      // 20px - card titles
      '2xl': '1.5rem',    // 24px - section headers
      '3xl': '1.875rem',  // 30px - subsection headers
      '4xl': '2.5rem',    // 40px - main page titles
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.025em',
    },
  },

  // Color System
  // NOTE: Colors are now imported from theme config for consistency
  // Use theme.ts as the single source of truth for colors
  colors: {
    // Re-export from theme for backward compatibility
    semantic: theme.semantic,
    primary: theme.primary,
    surfaces: theme.surface,
    text: theme.text,
    borders: theme.border,
    // Additional convenience exports
    background: theme.background,
    card: theme.card,
    sidebar: theme.sidebar,
    form: theme.form,
    canvas: theme.canvas,
    node: theme.node,
    edge: theme.edge,
    handle: theme.handle,
    accent: theme.accent,
    muted: theme.muted,
    popover: theme.popover,
    destructive: theme.destructive,
    ring: theme.ring,
  },

  // Spacing Scale (4px base unit)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(139, 92, 246, 0.3)',
    glowLg: '0 0 30px rgba(139, 92, 246, 0.4)',
  },

  // Transitions & Animations
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
} as const;

// Export individual token groups for convenience
export const { typography, colors, spacing, radius, shadows, transitions, easings, zIndex } = designTokens;

// Type exports for TypeScript
export type TypographySize = keyof typeof typography.sizes;
export type SpacingValue = keyof typeof spacing;
export type RadiusValue = keyof typeof radius;
export type ShadowValue = keyof typeof shadows;
