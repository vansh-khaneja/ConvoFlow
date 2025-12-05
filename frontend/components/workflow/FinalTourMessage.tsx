'use client';

import React, { useState, useEffect } from 'react';

interface FinalTourMessageProps {
  onClose?: () => void;
  sidebarOffset?: number; // Sidebar offset to match ChatPreview position
}

export default function FinalTourMessage({ onClose, sidebarOffset = 0 }: FinalTourMessageProps) {
  const [chatPreviewPos, setChatPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const [isChatPreviewReady, setIsChatPreviewReady] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 1080);

  useEffect(() => {
    // Find the ChatPreview element in the DOM and validate it's fully rendered
    const findChatPreview = () => {
      // Method 1: Find by data attribute (most reliable)
      const chatPreview = document.querySelector('[data-chat-preview="true"]') as HTMLElement;
      if (chatPreview) {
        const rect = chatPreview.getBoundingClientRect();
        // Validate that the element is actually visible and has valid dimensions
        // Also check that it's not just positioned off-screen (has meaningful dimensions)
        if (rect.width > 50 && rect.height > 50 && rect.top >= 0 && rect.left >= 0) {
          // Return the left edge and vertical center for positioning the tip
          return {
            x: rect.left, // Left edge of chat preview
            y: rect.top + rect.height / 2, // Vertical center
            isValid: true
          };
        }
      }

      // Method 2: Find by looking for fixed positioned divs with specific width (380px)
      const fixedDivs = Array.from(document.querySelectorAll('div[style*="fixed"]'));
      const chatPreviewByWidth = fixedDivs.find(div => {
        const style = (div as HTMLElement).style;
        const width = style.width || '';
        return width.includes('380') || width.includes('90vw');
      }) as HTMLElement | undefined;

      if (chatPreviewByWidth) {
        const rect = chatPreviewByWidth.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 50 && rect.top >= 0 && rect.left >= 0) {
          return {
            x: rect.left,
            y: rect.top + rect.height / 2,
            isValid: true
          };
        }
      }

      // Method 3: Find by text content "Chat Preview" or "Run preview"
      const allDivs = Array.from(document.querySelectorAll('div'));
      const chatPreviewByText = allDivs.find(el => {
        const text = el.textContent || '';
        return (text.includes('Chat Preview') || text.includes('Run preview')) && 
               el.closest('[style*="fixed"]');
      });

      if (chatPreviewByText) {
        const container = chatPreviewByText.closest('[style*="fixed"]') as HTMLElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          if (rect.width > 50 && rect.height > 50 && rect.top >= 0 && rect.left >= 0) {
            return {
              x: rect.left,
              y: rect.top + rect.height / 2,
              isValid: true
            };
          }
        }
      }

      // Fallback: Calculate position based on ChatPreview's expected position
      const chatPreviewWidth = 380; // w-[380px]
      const bottomOffset = 16; // bottom-4 = 16px
      const rightPosition = sidebarOffset + 16; // margin
      
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate position (left edge and vertical center of chat preview)
      const x = viewportWidth - rightPosition - chatPreviewWidth;
      const y = viewportHeight - bottomOffset - 200; // Approximate center
      
      return { x, y, isValid: false };
    };

    // Track when we first found a valid ChatPreview element
    let firstValidDetection: number | null = null;
    const TRANSITION_DELAY = 400; // 300ms CSS transition + 100ms buffer

    // Function to update position and check if ChatPreview is ready
    const updatePosition = () => {
      const result = findChatPreview();
      if (result) {
        const { isValid, ...pos } = result;
        setChatPreviewPos(pos);
        
        // If we found a valid position from actual ChatPreview element
        if (isValid && pos.x > 0 && pos.y > 0 && pos.x < window.innerWidth && pos.y < window.innerHeight) {
          const now = Date.now();
          
          // Record when we first detected a valid element
          if (firstValidDetection === null) {
            firstValidDetection = now;
          }
          
          // Mark as ready only after waiting for CSS transition to complete
          if (firstValidDetection !== null && (now - firstValidDetection) >= TRANSITION_DELAY) {
            setIsChatPreviewReady(true);
            return true; // Found valid position and transition completed
          }
          
          return true; // Found valid position (but transition may not be complete)
        }
      }
      // Reset detection time if we lost the element
      firstValidDetection = null;
      return false; // Not ready yet
    };

    // Use a polling approach to find ChatPreview when it appears
    let attempts = 0;
    const maxAttempts = 60; // Try for 6 seconds (60 * 100ms) - increased for slow responses
    let pollInterval: NodeJS.Timeout | null = null;
    let updateInterval: NodeJS.Timeout | null = null;
    
    const findAndSetPosition = () => {
      const found = updatePosition();
      
      if (found) {
        // Found valid position, stop initial polling but keep updating
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        
        // Keep updating position frequently to catch transition completion and any position changes
        if (!updateInterval) {
          updateInterval = setInterval(() => {
            updatePosition();
          }, 50); // Very frequent updates to catch transition completion quickly
        }
        return;
      }
      
      // Continue polling if we haven't found a good position yet
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(findAndSetPosition, 100);
      } else {
        // After max attempts, stop polling but keep trying with slower interval
        if (!updateInterval) {
          updateInterval = setInterval(() => {
            updatePosition();
          }, 300);
        }
      }
    };

    // Initial check
    findAndSetPosition();

    // Also use MutationObserver to watch for ChatPreview being added to DOM
    const observer = new MutationObserver(() => {
      updatePosition();
    });

    // Observe the document body for changes
    if (typeof document !== 'undefined') {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // Update on resize
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setViewportWidth(window.innerWidth);
        setViewportHeight(window.innerHeight);
      }
      updatePosition();
    };

    // Set initial viewport dimensions
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [sidebarOffset]);

  // Always show the tip, even if position isn't perfect
  // Use fallback position if chatPreviewPos is null
  const displayPos = chatPreviewPos || { 
    x: viewportWidth - 400, 
    y: viewportHeight - 200 
  };

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {/* Overlay - subtle, only blocks interactions */}
      <div 
        className="absolute inset-0 bg-black/20"
        style={{ pointerEvents: 'auto' }}
        onClick={onClose}
      />
      
      {/* Tour tip pointing to ChatPreview */}
      <div 
        className="fixed z-[71] pointer-events-none"
        style={{
          left: `${Math.max(16, Math.min(displayPos.x - 300, viewportWidth - 320))}px`, // Position to the left of chat preview, with margin, ensure it's on screen
          top: `${Math.max(16, Math.min(displayPos.y, viewportHeight - 200))}px`, // Vertically centered, ensure it's on screen
          transform: 'translateY(-50%)',
          opacity: isChatPreviewReady ? 1 : 0.3, // Fade in when ChatPreview is ready
          transition: 'opacity 0.3s ease-out, left 0.2s ease-out, top 0.2s ease-out'
        }}
      >
        <div className="relative w-72 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-3 py-2.5 text-xs shadow-lg pointer-events-auto">
          {/* Arrow pointing right to ChatPreview */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-l-[8px] border-t-transparent border-b-transparent border-l-[var(--primary)]/40"
            style={{
              right: '-8px' // Arrow tip points to chat preview
            }}
          ></div>
          <p className="font-semibold text-[var(--foreground)] mb-1">
            Step 7 · Chat Preview
          </p>
          <p className="text-[var(--text-muted)] mb-2">
            Users can see their <span className="font-semibold">chat preview</span> here for testing and debugging. <span className="font-semibold">Tour complete! 🎉</span>
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-medium px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

