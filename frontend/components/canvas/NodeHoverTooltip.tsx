'use client';

import React from 'react';
import { useReactFlow, Node } from '@xyflow/react';

interface NodeHoverTooltipProps {
  hoveredNodeId: string | null;
  openConfigNodeId: string | null;
}

export function NodeHoverTooltip({ hoveredNodeId, openConfigNodeId }: NodeHoverTooltipProps) {
  const { getNode, flowToScreenPosition } = useReactFlow();
  
  // Hide tooltip if node has config dialog open
  if (!hoveredNodeId || openConfigNodeId === hoveredNodeId) return null;
  
  const reactFlowNode = getNode(hoveredNodeId);
  if (!reactFlowNode) return null;
  
  // Get node dimensions - use measured dimensions if available, otherwise fallback
  const nodeWidth = reactFlowNode.measured?.width || reactFlowNode.width || 200;
  const nodeHeight = reactFlowNode.measured?.height || reactFlowNode.height || 80;
  
  // Calculate position below the node center in flow coordinates
  // Start from bottom edge of node (position.y + nodeHeight), then move up from bottom
  const flowX = reactFlowNode.position.x + (nodeWidth / 2) + 4; // Shifted left from +16 to +4
  const bottomEdgeY = reactFlowNode.position.y + nodeHeight;
  const flowY = bottomEdgeY - 56; // Position 56px up from the bottom edge
  
  // Convert flow coordinates to screen coordinates
  const screenPos = flowToScreenPosition({ x: flowX, y: flowY });
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        transform: 'translate(-50%, 0)',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <p className="text-xs text-gray-600 whitespace-nowrap">
        Click to configure
      </p>
    </div>
  );
}

