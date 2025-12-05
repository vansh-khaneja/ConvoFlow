'use client';

import React from 'react';
import { Panel } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui-kit/tooltip';

interface CanvasAddButtonProps {
  onAddNode?: () => void;
  isEmpty?: boolean; // Currently unused, kept for compatibility
  showTourHint?: boolean;
  showTourStep?: number;
  onTourNext?: () => void;
  onTourSkip?: () => void;
}

export default function CanvasAddButton({
  onAddNode,
  showTourHint = false,
  showTourStep = 0,
  onTourNext,
  onTourSkip
}: CanvasAddButtonProps) {
  return (
    <Panel
      position="top-right"
      className="bg-transparent shadow-none border-none p-0"
      style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}
    >
      <div className="relative">
        {/* Guided tour tooltip - shown only for first-time users */}
        {showTourHint && (
          <div className="absolute right-0 top-full mt-3 w-64 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-3 py-2.5 text-xs shadow-lg z-50">
            {/* Arrow pointing up to Add Node button */}
            <div className="absolute -top-2 right-6 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-[var(--primary)]/40"></div>
            <p className="font-semibold text-[var(--foreground)] mb-1">
              {showTourStep === 1 ? 'Step 1 · Click this button' : 'Step 3 · Add another node'}
            </p>
            <p className="text-[var(--text-muted)] mb-2">
              {showTourStep === 1 
                ? 'Open the node library to start building your workflow.'
                : 'Click Add Node again to add a ResponseNode to your workflow.'}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onTourSkip}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--foreground)]"
              >
                Skip
              </button>
            </div>
          </div>
        )}
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onAddNode}
                size="default"
                data-tutorial="add-node-button"
                className={`flex items-center gap-2.5 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.4)] transition-all duration-200 border border-[var(--primary)]/20 hover:border-[var(--primary)]/40 group ${
                  showTourHint
                    ? 'ring-2 ring-[var(--primary)]/50 ring-offset-2 ring-offset-transparent'
                    : ''
                }`}
                aria-label="Add Node"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Node</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to add a new node to your workflow</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Panel>
  );
}
