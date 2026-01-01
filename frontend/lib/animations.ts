/**
 * Animation Library for Convo Flow
 * 
 * Centralized animation variants for Framer Motion
 * Provides consistent, reusable animations across the application
 */

import { Variants } from 'framer-motion';

// ===================================
// Page Transitions
// ===================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ===================================
// Card Animations
// ===================================

export const cardHover: Variants = {
  initial: { y: 0, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
  hover: { 
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const cardTap: Variants = {
  tap: { scale: 0.98 },
};

export const cardStagger: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

// ===================================
// Modal Animations
// ===================================

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ===================================
// Button Animations
// ===================================

export const buttonPress: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.98 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.15 },
  },
};

export const buttonGlow: Variants = {
  initial: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
  hover: {
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
    y: -1,
    transition: { duration: 0.2 },
  },
  tap: { y: 0 },
};

// ===================================
// List Animations
// ===================================

export const listContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const listItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// ===================================
// Sidebar Animations
// ===================================

export const sidebarCollapse: Variants = {
  expanded: { 
    width: 256,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  collapsed: { 
    width: 72,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const sidebarItemHover: Variants = {
  initial: { x: 0 },
  hover: {
    x: 2,
    transition: { duration: 0.2 },
  },
};

// ===================================
// Toast Notifications
// ===================================

export const toastSlideIn: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ===================================
// Loading Animations
// ===================================

export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulseAnimation: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const skeletonShimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ===================================
// Badge & Status Animations
// ===================================

export const badgePulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const statusDot: Variants = {
  active: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  inactive: {
    opacity: 0.3,
  },
};

// ===================================
// Tooltip & Popover Animations
// ===================================

export const tooltipFadeIn: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 5 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.15 },
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    y: 5,
    transition: { duration: 0.1 },
  },
};

export const dropdownSlideIn: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

// ===================================
// Empty State Animations
// ===================================

export const emptyStateIcon: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1],
    },
  },
};

export const emptyStateIconFloat: Variants = {
  // Make empty-state icons static (no float/bounce)
  animate: {
    y: 0,
  },
};

// ===================================
// Success Animations
// ===================================

export const successCheckmark: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1],
    },
  },
};

export const successCircle: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0, 0, 0.2, 1],
    },
  },
};

// ===================================
// Node Canvas Animations
// ===================================

export const nodeSelect: Variants = {
  initial: { scale: 1 },
  selected: { 
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

export const nodeDrag: Variants = {
  drag: {
    scale: 1.05,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transition: { duration: 0.15 },
  },
};

export const nodeError: Variants = {
  animate: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

// ===================================
// Utility Functions
// ===================================

/**
 * Create a stagger animation for children elements
 */
export const createStagger = (staggerDelay: number = 0.05) => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

/**
 * Create a fade-in animation with custom duration
 */
export const createFadeIn = (duration: number = 0.3): Variants => ({
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration },
  },
  exit: { 
    opacity: 0,
    transition: { duration: duration * 0.67 },
  },
});

/**
 * Create a slide animation from any direction
 */
export const createSlide = (
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 20
): Variants => {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const initialValue = direction === 'up' || direction === 'left' ? distance : -distance;
  
  return {
    initial: { opacity: 0, [axis]: initialValue },
    animate: { 
      opacity: 1, 
      [axis]: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: { 
      opacity: 0,
      [axis]: -initialValue,
      transition: { duration: 0.2 },
    },
  };
};

// Export all as named exports for tree-shaking
export default {
  pageTransition,
  cardHover,
  cardTap,
  cardStagger,
  modalBackdrop,
  modalContent,
  buttonPress,
  buttonGlow,
  listContainer,
  listItem,
  sidebarCollapse,
  sidebarItemHover,
  toastSlideIn,
  spinnerRotate,
  pulseAnimation,
  skeletonShimmer,
  badgePulse,
  statusDot,
  tooltipFadeIn,
  dropdownSlideIn,
  emptyStateIcon,
  emptyStateIconFloat,
  successCheckmark,
  successCircle,
  nodeSelect,
  nodeDrag,
  nodeError,
  createStagger,
  createFadeIn,
  createSlide,
};

