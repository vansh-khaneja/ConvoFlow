'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check immediately on mount to prevent layout shift
    const checkMobile = () => {
      // Check viewport width (mobile if < 1024px)
      // Use document.documentElement.clientWidth for more accurate initial measurement
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const isMobileViewport = viewportWidth < 1024;
      setIsMobile(isMobileViewport);
    };

    // Set mounted and check immediately
    setMounted(true);
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Note: We don't need to hide content with CSS since the overlay covers everything

  // Show loading state while checking, or show message if mobile
  if (!mounted) {
    // Show a simple loading state instead of blank screen
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ 
          backgroundColor: '#0D0C14',
          color: '#a1a1aa',
          height: '100dvh',
          width: '100dvw',
          maxWidth: '100vw',
          maxHeight: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          margin: 0
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!isMobile) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      data-mobile-blocker
      style={{ 
        backgroundColor: '#0D0C14',
        height: '100dvh', // Use dynamic viewport height for mobile (prevents expansion)
        width: '100dvw', // Use dynamic viewport width for mobile (prevents expansion)
        maxWidth: '100vw', // Fallback for browsers that don't support dvw
        maxHeight: '100vh', // Fallback for browsers that don't support dvh
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: 0,
        padding: '1rem'
      }}
    >
      <div className="max-w-md w-full text-center space-y-6 overflow-y-auto max-h-full" style={{ maxHeight: 'calc(100dvh - 2rem)' }}>
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-xl"></div>
            <div className="relative bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 border border-[var(--primary)]/30 rounded-full p-6">
              <Monitor className="w-12 h-12 text-[var(--primary)]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 
            className="text-2xl font-bold"
            style={{ color: 'var(--foreground, #ffffff)' }}
          >
            Desktop Experience Required
          </h1>
          <p 
            className="leading-relaxed"
            style={{ color: 'var(--text-muted, #a1a1aa)' }}
          >
            Convo Flow is designed for desktop and tablet devices to provide the best workflow building experience. 
            Please open this application on a desktop or laptop computer.
          </p>
        </div>

        {/* Device Info */}
        <div 
          className="flex items-center justify-center gap-3 pt-4 border-t"
          style={{ borderColor: 'var(--border-color, #27272a)' }}
        >
          <Smartphone 
            className="w-5 h-5" 
            style={{ color: 'var(--text-muted, #a1a1aa)' }}
          />
          <span 
            className="text-sm"
            style={{ color: 'var(--text-muted, #a1a1aa)' }}
          >
            Mobile devices are not supported
          </span>
        </div>

        {/* Tips */}
        <div 
          className="pt-4 space-y-2 text-left rounded-lg p-4 border"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'var(--border-color, #27272a)'
          }}
        >
          <p 
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--foreground, #ffffff)' }}
          >
            Quick Tips:
          </p>
          <ul className="text-sm space-y-1.5" style={{ color: 'var(--text-muted, #a1a1aa)' }}>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] mt-0.5">•</span>
              <span>Use a desktop or laptop with a minimum width of 1024px</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] mt-0.5">•</span>
              <span>Tablets in landscape mode are supported</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] mt-0.5">•</span>
              <span>For the best experience, use a modern browser like Chrome, Firefox, or Edge</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

