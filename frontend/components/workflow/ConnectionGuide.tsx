'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

interface ConnectionGuideProps {
  queryNodeId?: string;
  responseNodeId?: string;
  onSkip?: () => void;
  isConnecting?: boolean;
  areNodesConnected?: boolean; // Hide guide when nodes are connected
}

export default function ConnectionGuide({ queryNodeId, responseNodeId, onSkip, isConnecting = false, areNodesConnected = false }: ConnectionGuideProps) {
  const { getNode } = useReactFlow();
  const [queryHandlePos, setQueryHandlePos] = useState<{ x: number; y: number } | null>(null);
  const [responseHandlePos, setResponseHandlePos] = useState<{ x: number; y: number } | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to find handle element and get its position
    const findHandlePosition = (nodeId: string, handleType: 'source' | 'target', handleIndex: number = 0) => {
      // Find the node element
      const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
      if (!nodeElement) return null;

      // Find all handles of the specified type
      const handles = nodeElement.querySelectorAll(`[data-handlepos="${handleType === 'source' ? 'right' : 'left'}"]`);
      if (handles.length === 0) return null;

      // Get the handle at the specified index (usually 0 for first handle)
      const handle = handles[handleIndex] as HTMLElement;
      if (!handle) return null;

      // Get the bounding box of the handle
      const rect = handle.getBoundingClientRect();
      
      // Get ReactFlow viewport
      const reactFlowPane = document.querySelector('.react-flow__pane');
      if (!reactFlowPane) return null;
      
      const paneRect = reactFlowPane.getBoundingClientRect();
      
      // Calculate position relative to ReactFlow pane
      return {
        x: rect.left + rect.width / 2 - paneRect.left,
        y: rect.top + rect.height / 2 - paneRect.top
      };
    };

    // Check for handle positions periodically until found
    const checkHandles = () => {
      if (!queryNodeId || !responseNodeId) return;

      const queryPos = findHandlePosition(queryNodeId, 'source', 0);
      const responsePos = findHandlePosition(responseNodeId, 'target', 0);

      if (queryPos) setQueryHandlePos(queryPos);
      if (responsePos) setResponseHandlePos(responsePos);

      // If both found, clear interval
      if (queryPos && responsePos && checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };

    // Initial check
    checkHandles();

    // Check periodically (handles might not be rendered immediately)
    checkIntervalRef.current = setInterval(checkHandles, 100);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [queryNodeId, responseNodeId]);

  // Hide connection guide once nodes are connected (moved to Run button step)
  if (areNodesConnected) {
    return null;
  }

  if (!queryNodeId || !responseNodeId) {
    return null;
  }

  const queryNode = getNode(queryNodeId);
  const responseNode = getNode(responseNodeId);

  if (!queryNode || !responseNode || !queryHandlePos) {
    return null;
  }

  return (
    <>
      {/* Overlay with reduced opacity - positioned behind React Flow to not block interactions */}
      {/* Only show overlay when not connecting to allow dragging */}
      {!isConnecting && (
        <div 
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            // Position relative to ReactFlow pane
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          <div 
            className="absolute inset-0 bg-black/20"
            onClick={onSkip}
            style={{ 
              pointerEvents: 'auto'
            }}
          />
        </div>
      )}

      {/* Tooltip at QueryNode output socket - shown initially */}
      {!isConnecting && queryHandlePos && (
        <div 
          className="absolute z-[61] pointer-events-none"
          style={{
            left: `${queryHandlePos.x + 20}px`,
            top: `${queryHandlePos.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div 
            className="relative w-56 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-3 py-2.5 text-xs shadow-lg pointer-events-auto"
            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to overlay
          >
            {/* Arrow pointing left to output socket - positioned to point at socket center */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-t-transparent border-b-transparent border-r-[var(--primary)]/40"
              style={{
                left: '-8px' // Arrow tip points back to handle center
              }}
            ></div>
            <p className="font-semibold text-[var(--foreground)] mb-1">
              Step 5 · Drag from here
            </p>
            <p className="text-[var(--text-muted)]">
              Click and drag from this <span className="font-semibold">output socket</span> to connect.
            </p>
          </div>
        </div>
      )}

      {/* Simple glow and blink on ResponseNode input socket when dragging */}
      {isConnecting && responseHandlePos && (
        <>
          {/* Simple glowing effect that blinks */}
          <div 
            className="absolute z-[60] pointer-events-none"
            style={{
              left: `${responseHandlePos.x}px`,
              top: `${responseHandlePos.y}px`,
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
            }}
          >
            <div 
              className="absolute inset-0 rounded-full bg-[var(--primary)]/60"
              style={{
                boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)',
                animation: 'pulse-glow-subtle 1.5s ease-in-out infinite',
              }}
            ></div>
          </div>

          {/* Tooltip at ResponseNode input socket - shown when dragging */}
          <div 
            className="absolute z-[61] pointer-events-none"
            style={{
              left: `${responseHandlePos.x - 240}px`,
              top: `${responseHandlePos.y}px`,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="relative w-56 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-3 py-2.5 text-xs shadow-lg pointer-events-auto">
              {/* Arrow pointing right to input socket - positioned to point at socket center */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-l-[8px] border-t-transparent border-b-transparent border-l-[var(--primary)]/40"
                style={{
                  right: '-8px' // Arrow tip points back to handle center
                }}
              ></div>
              <p className="font-semibold text-[var(--foreground)] mb-1">
                Drop here to connect
              </p>
              <p className="text-[var(--text-muted)]">
                Drag and connect to this <span className="font-semibold">input socket</span>.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

