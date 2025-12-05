'use client';

import React, { useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import Canvas from '@/components/canvas/Canvas';
import NodeSelectionSidebar from '@/components/canvas/NodeSelectionSidebar';
import NodeConfigSidebar from '@/components/canvas/NodeConfigSidebar';
import { useCanvasNodeConfig } from '@/hooks/useCanvasNodeConfig';

interface WorkflowCanvasContainerProps {
  nodes: Node[];
  edges: Edge[];
  executingNodes: Set<string>;
  executingEdges: Set<string>;
  showNodeSidebar: boolean;
  nodesData: any;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (event: any, node: Node) => void;
  onSaveWorkflow: () => void;
  onSaveWorkflowToBackend: () => void;
  onLoadWorkflow: (workflowData: any) => void;
  onExecute: () => void;
  onDeployWorkflow: () => void;
  onAddNode: () => void;
  isExecuting: boolean;
  onUpdateParameters: (nodeId: string, parameters: any) => void;
  deploymentStatus: { isDeployed: boolean; hasChanges: boolean } | null;
  isDeploying: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onNodeSelect: (node: any) => void;
  onCloseNodeSidebar: () => void;
  workflowName?: string;
  onRename?: (newName: string) => Promise<void>;
  onConfigSidebarOpenChange?: (isOpen: boolean) => void;
  // Guided tour
  showAddNodeTourHint?: boolean;
  showAddNodeTourStep?: number;
  onTourSkip?: () => void;
  onTourNextFromAdd?: () => void;
  // Sidebar tours
  showQueryNodeTourHint?: boolean;
  showResponseNodeTourHint?: boolean;
  onQueryTourSkip?: () => void;
  onQueryTourNext?: () => void;
  onResponseTourSkip?: () => void;
  onResponseTourNext?: () => void;
  // Connection guide
  showConnectionGuide?: boolean;
  queryNodeId?: string;
  responseNodeId?: string;
  areNodesConnected?: boolean;
  // Run button tour
  showRunTourHint?: boolean;
  onRunTourNext?: () => void;
  // Final message
  showFinalMessage?: boolean;
  sidebarOffset?: number; // Sidebar offset for positioning tour tip
}

export function WorkflowCanvasContainer({
  nodes,
  edges,
  executingNodes,
  executingEdges,
  showNodeSidebar,
  nodesData,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onSaveWorkflow,
  onSaveWorkflowToBackend,
  onLoadWorkflow,
  onExecute,
  onDeployWorkflow,
  onAddNode,
  isExecuting,
  onUpdateParameters,
  deploymentStatus,
  isDeploying,
  isSaving,
  hasUnsavedChanges,
  onNodeSelect,
  onCloseNodeSidebar,
  workflowName,
  onRename,
  onConfigSidebarOpenChange,
  showAddNodeTourHint = false,
  showAddNodeTourStep = 0,
  onTourSkip,
  onTourNextFromAdd,
  showQueryNodeTourHint = false,
  showResponseNodeTourHint = false,
  onQueryTourSkip,
  onQueryTourNext,
  onResponseTourSkip,
  onResponseTourNext,
  showConnectionGuide = false,
  queryNodeId,
  responseNodeId,
  areNodesConnected = false,
  showRunTourHint = false,
  onRunTourNext,
  showFinalMessage = false,
  sidebarOffset = 0
}: WorkflowCanvasContainerProps) {
  // Manage config state at container level so it's shared with Canvas
  const {
    hoveredNodeId,
    openConfigNodeId,
    setHoveredNodeId,
    handleConfigOpen,
    handlePaneClick,
    clearHoverState,
    closeConfig
  } = useCanvasNodeConfig();

  // Find the selected node and its data
  const selectedNode = useMemo(() => {
    if (!openConfigNodeId) return null;
    return nodes.find(node => node.id === openConfigNodeId) || null;
  }, [nodes, openConfigNodeId]);

  // Get node schema and parameters
  const nodeSchema = selectedNode?.data?.nodeSchema || null;
  const nodeParameters = selectedNode?.data?.parameters || {};

  // Handle config save
  const handleConfigSave = (nodeId: string, parameters: Record<string, any>) => {
    onUpdateParameters(nodeId, parameters);
    closeConfig();
  };

  // Close node selection sidebar when config opens
  React.useEffect(() => {
    if (openConfigNodeId && showNodeSidebar) {
      onCloseNodeSidebar();
    }
  }, [openConfigNodeId, showNodeSidebar, onCloseNodeSidebar]);

  // Close config sidebar when the selected node is deleted
  React.useEffect(() => {
    if (openConfigNodeId && !selectedNode) {
      closeConfig();
    }
  }, [openConfigNodeId, selectedNode, closeConfig]);

  // Notify parent when config sidebar open state changes
  React.useEffect(() => {
    if (onConfigSidebarOpenChange) {
      onConfigSidebarOpenChange(!!openConfigNodeId);
    }
  }, [openConfigNodeId, onConfigSidebarOpenChange]);

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Canvas Component */}
      <Canvas
        nodes={nodes}
        edges={edges}
        executingNodes={executingNodes}
        executingEdges={executingEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onSaveWorkflow={onSaveWorkflow}
        onSaveWorkflowToBackend={onSaveWorkflowToBackend}
        onLoadWorkflow={onLoadWorkflow}
        onExecute={onExecute}
        onDeployWorkflow={onDeployWorkflow}
        onAddNode={onAddNode}
        isExecuting={isExecuting}
        onUpdateParameters={onUpdateParameters}
        deploymentStatus={deploymentStatus}
        isDeploying={isDeploying}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        workflowName={workflowName}
        onRename={onRename}
        showAddNodeTourHint={showAddNodeTourHint}
        showAddNodeTourStep={showAddNodeTourStep}
        onTourSkip={onTourSkip}
        onTourNextFromAdd={onTourNextFromAdd}
        showConnectionGuide={showConnectionGuide}
        queryNodeId={queryNodeId}
        responseNodeId={responseNodeId}
        areNodesConnected={areNodesConnected}
        showRunTourHint={showRunTourHint}
        onRunTourNext={onRunTourNext}
        showFinalMessage={showFinalMessage}
        // Pass config handlers to Canvas
        hoveredNodeId={hoveredNodeId}
        openConfigNodeId={openConfigNodeId}
        setHoveredNodeId={setHoveredNodeId}
        handleConfigOpen={handleConfigOpen}
        handlePaneClick={handlePaneClick}
        clearHoverState={clearHoverState}
      />

      {/* Node Selection Sidebar - only show if no config is open */}
      {showNodeSidebar && nodesData && !openConfigNodeId && (
        <NodeSelectionSidebar
          nodes={nodesData}
          onNodeSelect={onNodeSelect}
          onClose={onCloseNodeSidebar}
          existingNodes={nodes}
          showQueryTourHint={showQueryNodeTourHint}
          showResponseTourHint={showResponseNodeTourHint}
          onQueryTourSkip={onQueryTourSkip}
          onQueryTourNext={onQueryTourNext}
          onResponseTourSkip={onResponseTourSkip}
          onResponseTourNext={onResponseTourNext}
        />
      )}

      {/* Node Config Sidebar - only show if node is selected and has config */}
      {openConfigNodeId && selectedNode && nodeSchema && (
        <NodeConfigSidebar
          nodeId={openConfigNodeId}
          nodeSchema={nodeSchema}
          parameters={nodeParameters}
          onClose={closeConfig}
          onSave={handleConfigSave}
          onUpdateParameters={onUpdateParameters}
        />
      )}

      {/* Final Tour Message is now integrated into ChatPreview component */}
    </div>
  );
}

