'use client';

import React from 'react';
import { Workflow, Key, Layers, FileText } from 'lucide-react';

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

  return (
    <div
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] border-r border-[var(--border-color)] flex flex-col"
      style={{ 
        backgroundColor: '#13111C',
        width: '240px'
      }}
    >
      {/* Navigation Items */}
      <div className="flex-1 p-4 pt-6 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
  );
}

