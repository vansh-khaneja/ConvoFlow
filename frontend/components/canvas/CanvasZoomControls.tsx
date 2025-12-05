'use client';

import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui-kit/tooltip';

export function CanvasZoomControls() {
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <Panel position="bottom-left" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-col bg-[var(--card-bg)] rounded-[5px] shadow-md">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomIn()}
                className="rounded-t-[5px] rounded-b-none hover:bg-[var(--card-hover)]"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <div className="h-px bg-[var(--border-color)]"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomOut()}
                className="rounded-b-[5px] rounded-t-none hover:bg-[var(--card-hover)]"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Panel>
  );
}

