'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Workflow, Key, Layers, FileText, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION?.replace(/^v/i, '') || '1.0.0';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Workflow },
  { id: 'credentials', label: 'Credentials', icon: Key },
  { id: 'templates', label: 'Templates', icon: Layers },
  { id: 'logs', label: 'Logs', icon: FileText },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Close sidebar on desktop resize
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDraggingRef.current) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    if (sidebarRef.current) {
      // Only allow dragging to the right (closing)
      if (diff < 0) {
        sidebarRef.current.style.transform = `translateX(${diff}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    if (sidebarRef.current) {
      const diff = currentXRef.current - startXRef.current;
      // If dragged more than 30% to the right, close it
      if (diff < -80) {
        setIsOpen(false);
      }
      // Reset transform
      sidebarRef.current.style.transform = '';
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setIsOpen(false); // Close sidebar on mobile after selection
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed top-20 left-4 z-40 md:hidden h-10 w-10"
          style={{ backgroundColor: 'var(--card-hover)' }}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ease-in-out ${
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
        style={{ 
          backgroundColor: '#13111C',
          width: isMobile ? '280px' : '240px',
          zIndex: isMobile ? 50 : 'auto'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <span className="text-sm font-semibold text-[var(--foreground)]">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      {/* Navigation Items */}
      <div className="flex-1 p-4 pt-6 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`sidebar-item-hover flex items-center gap-3 px-3 py-2 w-full rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-[var(--card-hover)] text-[var(--foreground)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer with Version */}
      <div className="border-t border-[var(--border-color)]" style={{ backgroundColor: 'rgba(19, 17, 28, 0.7)' }}>
        <div className="py-4 text-center">
          <div className="text-sm font-semibold tracking-wide text-[var(--text-muted)]/80">
            v{APP_VERSION}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

