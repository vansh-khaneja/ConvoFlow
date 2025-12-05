'use client';

import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CanvasToolbar from './CanvasToolbar';
import CanvasAddButton from './CanvasAddButton';
import { CanvasZoomControls } from './CanvasZoomControls';
import { NodeHoverTooltip } from './NodeHoverTooltip';
import NodeWithConfig from './NodeWithConfig';
import CustomEdge from './CustomEdge';
import { useCanvasNodeConfig } from '@/hooks/useCanvasNodeConfig';
import { transformNodesForExecution, transformEdgesForExecution, canExecuteWorkflow } from '@/lib/canvas/canvasUtils';
import ConnectionGuide from '@/components/workflow/ConnectionGuide';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  executingNodes: Set<string>;
  executingEdges: Set<string>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onSaveWorkflow: () => void;
  onSaveWorkflowToBackend: () => void;
  onLoadWorkflow: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExecute: () => void;
  onAddNode: () => void;
  isExecuting: boolean;
  onUpdateParameters?: (nodeId: string, parameters: any) => void;
  onDeployWorkflow?: () => void;
  deploymentStatus?: {
    isDeployed: boolean;
    hasChanges: boolean;
  } | null;
  isDeploying?: boolean;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  workflowName?: string;
  onRename?: (newName: string) => Promise<void>;
  // Config handlers passed from parent
  hoveredNodeId?: string | null;
  openConfigNodeId?: string | null;
  setHoveredNodeId?: (nodeId: string | null) => void;
  handleConfigOpen?: (nodeId: string, isOpen: boolean) => void;
  handlePaneClick?: () => void;
  clearHoverState?: () => void;
  // Guided tour
  showAddNodeTourHint?: boolean;
  showAddNodeTourStep?: number;
  onTourSkip?: () => void;
  onTourNextFromAdd?: () => void;
  showConnectionGuide?: boolean;
  queryNodeId?: string;
  responseNodeId?: string;
  areNodesConnected?: boolean;
  showRunTourHint?: boolean;
  onRunTourNext?: () => void;
  showFinalMessage?: boolean;
}

export default function Canvas({
  nodes,
  edges,
  executingNodes,
  executingEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onSaveWorkflow,
  onSaveWorkflowToBackend,
  onLoadWorkflow,
  onExecute,
  onAddNode,
  isExecuting,
  onUpdateParameters,
  onDeployWorkflow,
  deploymentStatus,
  isDeploying,
  isSaving,
  hasUnsavedChanges,
  workflowName,
  onRename,
  // Config handlers from parent
  hoveredNodeId: propHoveredNodeId,
  openConfigNodeId: propOpenConfigNodeId,
  setHoveredNodeId: propSetHoveredNodeId,
  handleConfigOpen: propHandleConfigOpen,
  handlePaneClick: propHandlePaneClick,
  clearHoverState: propClearHoverState,
  showAddNodeTourHint = false,
  showAddNodeTourStep = 0,
  onTourSkip,
  onTourNextFromAdd,
  showConnectionGuide = false,
  queryNodeId,
  responseNodeId,
  areNodesConnected = false,
  showRunTourHint = false,
  onRunTourNext,
  showFinalMessage = false
}: CanvasProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Use props if provided, otherwise fall back to hook (for backward compatibility)
  const {
    hoveredNodeId: hookHoveredNodeId,
    openConfigNodeId: hookOpenConfigNodeId,
    setHoveredNodeId: hookSetHoveredNodeId,
    handleConfigOpen: hookHandleConfigOpen,
    handlePaneClick: hookHandlePaneClick,
    clearHoverState: hookClearHoverState,
  } = useCanvasNodeConfig();

  const hoveredNodeId = propHoveredNodeId ?? hookHoveredNodeId;
  const openConfigNodeId = propOpenConfigNodeId ?? hookOpenConfigNodeId;
  const setHoveredNodeId = propSetHoveredNodeId ?? hookSetHoveredNodeId;
  const handleConfigOpen = propHandleConfigOpen ?? hookHandleConfigOpen;
  const handlePaneClick = propHandlePaneClick ?? hookHandlePaneClick;
  const clearHoverState = propClearHoverState ?? hookClearHoverState;
  
  // Grid color for dark theme
  const gridColor = '#27272a';
  
  // Node Types for React Flow - memoized to prevent React Flow warning
  const nodeTypes = useMemo(() => ({
    custom: (props: any) => {
      // Use NodeWithConfig for all node types - includes configuration
      return (
        <NodeWithConfig 
          {...props} 
          onDelete={props.data.onDelete} 
          nodeId={props.id} 
          isExecuting={props.data.isExecuting}
          isConfigOpen={openConfigNodeId === props.id}
          onConfigOpen={(isOpen: boolean) => handleConfigOpen(props.id, isOpen)}
        />
      );
    },
  }), [handleConfigOpen, openConfigNodeId]);

  // Edge Types for React Flow - memoized
  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
  }), []);

  // Transform nodes and edges for execution state
  const transformedNodes = useMemo(
    () => transformNodesForExecution(nodes, executingNodes, onUpdateParameters),
    [nodes, executingNodes, onUpdateParameters]
  );

  const transformedEdges = useMemo(
    () => transformEdgesForExecution(edges, executingEdges),
    [edges, executingEdges]
  );

  // Check if workflow can be executed
  const canExecute = useMemo(() => canExecuteWorkflow(nodes), [nodes]);

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={transformedNodes}
        edges={transformedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={() => setIsConnecting(true)}
        onConnectEnd={() => setIsConnecting(false)}
        onNodeClick={(event, node) => {
          clearHoverState(); // Hide tooltip when node is clicked
          // Open config sidebar for the clicked node (close if already open)
          const isCurrentlyOpen = openConfigNodeId === node.id;
          handleConfigOpen(node.id, !isCurrentlyOpen);
          // Also call parent's onNodeClick for any additional handling
          onNodeClick(event, node);
        }}
        onNodeMouseEnter={(event, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={clearHoverState}
        onPaneClick={(e) => {
          clearHoverState(); // Clear hover state when clicking on canvas
          handlePaneClick(); // Close config when clicking on canvas
        }}
        onPaneMouseLeave={clearHoverState} // Clear hover state when mouse leaves canvas
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'default',
          deletable: true,
        }}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        fitView={false}
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.2 }}
        className="bg-[var(--canvas-bg)]"
        proOptions={{ hideAttribution: true }}
      >
        {/* Primary grid pattern - fine lines - uniform background */}
        <Background
          id="background-1"
          color={gridColor}
          gap={32}
          size={1}
          variant={BackgroundVariant.Lines}
          style={{
            backgroundColor: 'var(--canvas-bg)',
          }}
        />

        {/* Toolbar */}
        <CanvasToolbar
          onSaveWorkflow={onSaveWorkflow}
          onSaveWorkflowToBackend={onSaveWorkflowToBackend}
          onLoadWorkflow={onLoadWorkflow}
          onExecute={onExecute}
          onDeployWorkflow={onDeployWorkflow}
          isExecuting={isExecuting}
          hasNodes={nodes.length > 0}
          canExecute={canExecute}
          deploymentStatus={deploymentStatus}
          isDeploying={isDeploying}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          workflowName={workflowName}
          onRename={onRename}
          showRunTourHint={showRunTourHint}
          onRunTourNext={onRunTourNext}
          onRunTourSkip={onTourSkip}
        />

        {/* Add Button - with optional first-time user hint */}
        <CanvasAddButton
          onAddNode={onAddNode}
          showTourHint={showAddNodeTourHint}
          showTourStep={showAddNodeTourStep}
          onTourNext={onTourNextFromAdd}
          onTourSkip={onTourSkip}
          isEmpty={nodes.length === 0}
          showTourHint={showAddNodeTourHint}
          onTourSkip={onTourSkip}
          onTourNext={onTourNextFromAdd}
        />

        {/* Custom Zoom Controls */}
        <CanvasZoomControls />

        {/* Hover Tooltip - "Click to configure" - positioned above the hovered node */}
        <NodeHoverTooltip hoveredNodeId={hoveredNodeId} openConfigNodeId={openConfigNodeId} />

        {/* Connection Guide - Step 5 - must be inside ReactFlow for context */}
        {showConnectionGuide && (
          <ConnectionGuide
            queryNodeId={queryNodeId}
            responseNodeId={responseNodeId}
            onSkip={onTourSkip}
            isConnecting={isConnecting}
            areNodesConnected={areNodesConnected}
          />
        )}
      </ReactFlow>
    </div>
  );
}
