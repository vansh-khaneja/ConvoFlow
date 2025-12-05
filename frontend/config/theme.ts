/**
 * Theme Configuration
 * 
 * Centralized theme configuration for colors, backgrounds, cards, borders, etc.
 * This is the single source of truth for all theme colors in the application.
 * 
 * Usage:
 * - In TypeScript/React: import { theme } from '@/config/theme'
 * - In CSS: Use the CSS variables defined in globals.css (generated from this file)
 * - In Tailwind: Use the CSS variables with var(--color-name)
 */

export const theme = {
  // ============================================
  // PRIMARY COLORS - Main brand colors
  // ============================================
  primary: {
    base: '#8b5cf6',      // Main primary color (purple)
    light: '#a78bfa',     // Lighter shade
    dark: '#7c3aed',      // Darker shade
    hover: '#7c3aed',     // Hover state
    muted: 'rgba(139, 92, 246, 0.1)',  // Muted/transparent version
    'muted-20': 'rgba(139, 92, 246, 0.2)',
    'muted-30': 'rgba(139, 92, 246, 0.3)',
    'muted-40': 'rgba(139, 92, 246, 0.4)',
    'muted-50': 'rgba(139, 92, 246, 0.5)',
  },

  // ============================================
  // BACKGROUND COLORS
  // ============================================
  background: {
    base: '#0D0C14',      // Main body background
    elevated: '#0a0a0b',  // Elevated sections
    canvas: '#0f0f15',    // Canvas/workspace background
  },

  // ============================================
  // SURFACE COLORS - Layered surfaces for depth
  // ============================================
  surface: {
    0: '#0a0a0b',   // Deepest - body background
    1: '#1a1a1e',   // Base - sidebar, main areas
    2: '#28262e',   // Elevated - cards, panels
    3: '#363441',   // Highest - modals, dropdowns
  },

  // ============================================
  // CARD COLORS - For cards and containers
  // ============================================
  card: {
    bg: '#181622',        // Card background
    hover: '#211F2D',     // Card hover state
    border: '#32313C',    // Card border
    shadow: 'rgba(0, 0, 0, 0.4)',  // Card shadow
  },

  // ============================================
  // SIDEBAR COLORS
  // ============================================
  sidebar: {
    bg: '#18181b',        // Sidebar background
    hover: '#27272a',     // Sidebar item hover
    border: '#3f3f46',    // Sidebar border
  },

  // ============================================
  // TEXT COLORS
  // ============================================
  text: {
    primary: '#ffffff',                    // Main text
    secondary: 'rgba(255, 255, 255, 0.7)', // Secondary text
    muted: 'rgba(255, 255, 255, 0.5)',     // Muted text
    subtle: '#71717a',                     // Subtle text
    disabled: 'rgba(255, 255, 255, 0.3)',  // Disabled text
    foreground: '#fafafa',                 // Foreground text
  },

  // ============================================
  // BORDER COLORS
  // ============================================
  border: {
    base: '#3f3f46',                      // Base border
    light: '#52525b',                     // Light border
    muted: 'rgba(255, 255, 255, 0.05)',   // Muted border
    default: 'rgba(255, 255, 255, 0.1)',  // Default border
  },

  // ============================================
  // SEMANTIC COLORS - Success, Error, Warning, Info
  // ============================================
  semantic: {
    success: {
      base: '#72BF9B',
      light: '#8CD3B2',
      dark: '#5DA885',
      muted: 'rgba(114, 191, 155, 0.1)',
    },
    warning: {
      base: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      muted: 'rgba(245, 158, 11, 0.1)',
    },
    error: {
      base: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      muted: 'rgba(239, 68, 68, 0.1)',
    },
    info: {
      base: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      muted: 'rgba(59, 130, 246, 0.1)',
    },
  },

  // ============================================
  // FORM COLORS
  // ============================================
  form: {
    bg: '#27272a',         // Form background
    input: {
      bg: '#18181b',      // Input background
      border: '#3f3f46',  // Input border
      focus: '#8b5cf6',   // Input focus color
    },
  },

  // ============================================
  // CANVAS/NODE COLORS
  // ============================================
  canvas: {
    bg: '#0f0f15',        // Canvas background
    grid: '#27272a',      // Grid color
    pattern: '#1f1f23',  // Grid pattern
  },

  node: {
    bg: '#27272a',        // Node background
    border: '#52525b',    // Node border
    gradient: {
      start: '#2d2d30',   // Gradient start
      end: '#25252a',      // Gradient end
    },
    shadow: 'rgba(0, 0, 0, 0.5)',  // Node shadow
    inset: 'rgba(255, 255, 255, 0.05)',  // Inset highlight
  },

  edge: {
    color: '#71717a',     // Edge color
    hover: '#a1a1aa',     // Edge hover
    selected: '#8b5cf6',  // Selected edge
  },

  handle: {
    bg: '#52525b',        // Handle background
    border: '#71717a',    // Handle border
  },

  // ============================================
  // ACCENT COLORS
  // ============================================
  accent: {
    blue: '#3b82f6',
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
  },

  // ============================================
  // MUTED COLORS (for shadcn/ui compatibility)
  // ============================================
  muted: {
    bg: '#27272a',
    foreground: '#a1a1aa',
  },

  // ============================================
  // POPOVER COLORS
  // ============================================
  popover: {
    bg: '#18181b',
    foreground: '#fafafa',
  },

  // ============================================
  // DESTRUCTIVE COLORS
  // ============================================
  destructive: {
    base: '#ef4444',
    foreground: '#fafafa',
  },

  // ============================================
  // RING COLORS (for focus rings)
  // ============================================
  ring: {
    base: '#8b5cf6',
    muted: 'rgba(139, 92, 246, 0.2)',
  },
} as const;

/**
 * Helper function to get a color value from the theme
 * Usage: getThemeColor('primary.base') => '#8b5cf6'
 */
export function getThemeColor(path: string): string {
  const keys = path.split('.');
  let value: any = theme;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Theme color path "${path}" not found`);
      return '#000000';
    }
  }
  
  return typeof value === 'string' ? value : '#000000';
}

/**
 * Helper function to get CSS variable name for a theme color
 * Usage: getThemeVar('primary.base') => 'var(--primary)'
 */
export function getThemeVar(path: string): string {
  // Map theme paths to CSS variable names
  const varMap: Record<string, string> = {
    'primary.base': 'var(--primary)',
    'primary.light': 'var(--primary-light)',
    'primary.dark': 'var(--primary-dark)',
    'primary.hover': 'var(--primary-hover)',
    'background.base': 'var(--background)',
    'card.bg': 'var(--card-bg)',
    'card.hover': 'var(--card-hover)',
    'card.border': 'var(--border-color)',
    'text.primary': 'var(--foreground)',
    'text.muted': 'var(--text-muted)',
    'border.base': 'var(--border-color)',
  };
  
  return varMap[path] || `var(--${path.replace('.', '-')})`;
}

/**
 * Export theme colors as a flat object for easy access
 */
export const colors = {
  // Primary
  primary: theme.primary.base,
  primaryLight: theme.primary.light,
  primaryDark: theme.primary.dark,
  primaryHover: theme.primary.hover,
  
  // Backgrounds
  background: theme.background.base,
  backgroundElevated: theme.background.elevated,
  backgroundCanvas: theme.background.canvas,
  
  // Surfaces
  surface0: theme.surface[0],
  surface1: theme.surface[1],
  surface2: theme.surface[2],
  surface3: theme.surface[3],
  
  // Cards
  cardBg: theme.card.bg,
  cardHover: theme.card.hover,
  cardBorder: theme.card.border,
  
  // Text
  textPrimary: theme.text.primary,
  textSecondary: theme.text.secondary,
  textMuted: theme.text.muted,
  textSubtle: theme.text.subtle,
  
  // Borders
  borderBase: theme.border.base,
  borderLight: theme.border.light,
  borderMuted: theme.border.muted,
  
  // Semantic
  success: theme.semantic.success.base,
  warning: theme.semantic.warning.base,
  error: theme.semantic.error.base,
  info: theme.semantic.info.base,
} as const;

// Type exports
export type ThemeColorPath = 
  | `primary.${keyof typeof theme.primary}`
  | `background.${keyof typeof theme.background}`
  | `surface.${0 | 1 | 2 | 3}`
  | `card.${keyof typeof theme.card}`
  | `text.${keyof typeof theme.text}`
  | `border.${keyof typeof theme.border}`
  | `semantic.${keyof typeof theme.semantic}.${string}`;

/**
 * Generate CSS variables from theme and inject them into the document
 * This makes theme.ts the single source of truth - no need to update globals.css manually
 * 
 * This function automatically syncs all theme colors to CSS variables,
 * so you only need to change colors in theme.ts and they'll apply everywhere.
 */
export function injectThemeVariables() {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Map theme values to CSS variable names
  const cssVars: Record<string, string> = {
    // Backgrounds
    '--background': theme.background.base,
    '--surface-0': theme.surface[0],
    '--surface-1': theme.surface[1],
    '--surface-2': theme.surface[2],
    '--surface-3': theme.surface[3],
    '--canvas-bg': theme.canvas.bg,
    
    // Primary
    '--primary': theme.primary.base,
    '--primary-hover': theme.primary.hover,
    '--primary-light': theme.primary.light,
    '--primary-dark': theme.primary.dark,
    
    // Cards
    '--card-bg': theme.card.bg,
    '--card-hover': theme.card.hover,
    '--border-color': theme.border.base,
    '--border-light': theme.border.light,
    
    // Text
    '--foreground': theme.text.foreground,
    '--text-muted': theme.text.muted,
    '--text-subtle': theme.text.subtle,
    
    // Sidebar
    '--sidebar-bg': theme.sidebar.bg,
    '--sidebar-hover': theme.sidebar.hover,
    
    // Canvas/Node
    '--grid-color': theme.canvas.grid,
    '--grid-pattern': theme.canvas.pattern,
    '--node-bg': theme.node.bg,
    '--node-border': theme.node.border,
    '--node-gradient-start': theme.node.gradient.start,
    '--node-gradient-end': theme.node.gradient.end,
    '--node-shadow': theme.node.shadow,
    '--node-inset-light': theme.node.inset,
    
    // Edges
    '--edge-color': theme.edge.color,
    '--edge-hover': theme.edge.hover,
    '--edge-selected': theme.edge.selected,
    
    // Handles
    '--handle-bg': theme.handle.bg,
    '--handle-border': theme.handle.border,
    
    // Semantic
    '--color-success': theme.semantic.success.base,
    '--color-success-light': theme.semantic.success.light,
    '--color-success-dark': theme.semantic.success.dark,
    '--color-success-muted': theme.semantic.success.muted,
    '--color-warning': theme.semantic.warning.base,
    '--color-warning-light': theme.semantic.warning.light,
    '--color-warning-dark': theme.semantic.warning.dark,
    '--color-warning-muted': theme.semantic.warning.muted,
    '--color-error': theme.semantic.error.base,
    '--color-error-light': theme.semantic.error.light,
    '--color-error-dark': theme.semantic.error.dark,
    '--color-error-muted': theme.semantic.error.muted,
    '--color-info': theme.semantic.info.base,
    '--color-info-light': theme.semantic.info.light,
    '--color-info-dark': theme.semantic.info.dark,
    '--color-info-muted': theme.semantic.info.muted,
    
    // Form
    '--form-bg': theme.form.bg,
    '--input-bg': theme.form.input.bg,
    '--input-border': theme.form.input.border,
    '--input-focus': theme.form.input.focus,
    
    // Accent
    '--accent-blue': theme.accent.blue,
    '--accent-green': theme.accent.green,
    '--accent-amber': theme.accent.amber,
    '--accent-red': theme.accent.red,
    
    // Other
    '--muted': theme.muted.bg,
    '--muted-foreground': theme.muted.foreground,
    '--popover': theme.popover.bg,
    '--popover-foreground': theme.popover.foreground,
    '--destructive': theme.destructive.base,
    '--destructive-foreground': theme.destructive.foreground,
    '--ring': theme.ring.base,
  };
  
  // Apply all CSS variables
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

