'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Connection } from '@xyflow/react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useWorkflow } from '@/hooks/useWorkflowQueries';
import { useWorkflowNav } from '@/contexts/WorkflowNavContext';
import WorkflowManager from '@/components/workflow/WorkflowManager';
import NodeConfigStorage from '@/utils/nodeConfigStorage';
import ChatPreview from '@/components/workflow/ChatPreview';
import ExecutionResults from '@/components/workflow/ExecutionResults';
import { WorkflowLoadingAnimation } from '@/components/workflow/WorkflowLoadingAnimation';
import { WorkflowCanvasContainer } from '@/components/workflow/WorkflowCanvasContainer';
import WorkflowTutorial from '@/components/workflow/WorkflowTutorial';
import { useWorkflowChangeDetection } from '@/hooks/useWorkflowChangeDetection';
import { useWorkflowLoader } from '@/hooks/useWorkflowLoader';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { useWorkflowDeployment } from '@/hooks/useWorkflowDeployment';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { toast } from 'sonner';
import MobileBlocker from '@/components/layout/MobileBlocker';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

// Force dynamic rendering - this page uses searchParams and is always dynamic
export const dynamic = 'force-dynamic';

function WorkflowBuilderContent() {
  const searchParams = useSearchParams();
  const [workflowIdState, setWorkflowIdState] = useState<string | null>(searchParams?.get('id') || null);
  const workflowId = workflowIdState || searchParams?.get('id');
  const templateId = searchParams?.get('template');
  
  // Update workflowId state when searchParams changes
  useEffect(() => {
    const idFromParams = searchParams?.get('id');
    if (idFromParams) {
      setWorkflowIdState(idFromParams);
    }
  }, [searchParams]);
  
  // 🚀 React Query: Fetch workflow with stale-while-revalidate
  const { data: workflowData, isLoading: isLoadingWorkflow } = useWorkflow(workflowId);
  
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [chatPreview, setChatPreview] = useState<{ user?: string; bot?: string } | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isConfigSidebarOpen, setIsConfigSidebarOpen] = useState(false);
  const [tourStep, setTourStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0); // 0 = off, 1 = Add Node, 2 = QueryNode, 3 = Add Node again, 4 = ResponseNode, 5 = Connect, 6 = Run, 7 = Final
  const [tourCompleted, setTourCompleted] = useState(false);
  const [showRunButtonHint, setShowRunButtonHint] = useState(false); // Independent state for Run button hint
  const { setWorkflowMeta, clearWorkflowMeta } = useWorkflowNav();
  
  // Use the custom hook for workflow state management
  const {
    nodesData,
    showNodeSidebar,
    executingEdges,
    executingNodes,
    loading,
    nodes,
    edges,
    setNodes,
    setEdges,
    setShowNodeSidebar,
    setExecutingEdges,
    setExecutingNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleAddNode,
    handleNodeSelect,
    handleNodeClick,
    handleNodeDelete
  } = useWorkflowState();

  // Helpers to detect state
  const hasAnyNode = nodes.length > 0;
  const hasQueryNode = nodes.some(node => {
    const schema = (node.data as any)?.nodeSchema;
    const nodeId = schema?.node_id?.toLowerCase() || '';
    return nodeId === 'querynode' || (nodeId.includes('query') && !nodeId.includes('textinput'));
  });
  const hasResponseNode = nodes.some(node => {
    const schema = (node.data as any)?.nodeSchema;
    const nodeId = schema?.node_id?.toLowerCase() || '';
    return nodeId.includes('response');
  });
  
  // Find QueryNode and ResponseNode IDs
  const queryNodeId = nodes.find(node => {
    const schema = (node.data as any)?.nodeSchema;
    const nodeId = schema?.node_id?.toLowerCase() || '';
    return nodeId === 'querynode' || (nodeId.includes('query') && !nodeId.includes('textinput'));
  })?.id;
  
  const responseNodeId = nodes.find(node => {
    const schema = (node.data as any)?.nodeSchema;
    const nodeId = schema?.node_id?.toLowerCase() || '';
    return nodeId.includes('response');
  })?.id;
  
  // Check if QueryNode and ResponseNode are connected
  // An edge connects them if source is QueryNode and target is ResponseNode
  const areNodesConnected = queryNodeId && responseNodeId && edges.some(edge => {
    const sourceMatches = edge.source === queryNodeId;
    const targetMatches = edge.target === responseNodeId;
    return sourceMatches && targetMatches;
  });
  
  // Debug: Log connection status
  useEffect(() => {
    if (queryNodeId && responseNodeId) {
      console.log('Connection check:', {
        queryNodeId,
        responseNodeId,
        edges: edges.map(e => ({ source: e.source, target: e.target })),
        areNodesConnected,
        tourStep,
        tourCompleted
      });
    }
  }, [queryNodeId, responseNodeId, edges, areNodesConnected, tourStep, tourCompleted]);

  // Initialize tour based on localStorage (only once on mount)
  useEffect(() => {
    const completed = typeof window !== 'undefined'
      ? window.localStorage.getItem('convoflow_workflow_tour_completed') === 'true'
      : false;
    setTourCompleted(completed);
    if (!completed && !hasAnyNode) {
      setTourStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, not when hasAnyNode changes

  // Step 1 → 2: When sidebar opens, move to QueryNode selection
  useEffect(() => {
    if (!tourCompleted && tourStep === 1 && showNodeSidebar) {
      setTourStep(2);
    }
  }, [showNodeSidebar, tourCompleted, tourStep]);

  // Step 2 → 3: When QueryNode is added, move to "Add Node again"
  useEffect(() => {
    if (!tourCompleted && tourStep === 2 && hasQueryNode && !showNodeSidebar) {
      setTourStep(3);
    }
  }, [hasQueryNode, showNodeSidebar, tourCompleted, tourStep]);

  // Step 3 → 4: When sidebar opens again, move to ResponseNode selection
  useEffect(() => {
    if (!tourCompleted && tourStep === 3 && showNodeSidebar) {
      setTourStep(4);
    }
  }, [showNodeSidebar, tourCompleted, tourStep]);

  // Step 4 → 5: When ResponseNode is added, move to connection guide
  useEffect(() => {
    if (!tourCompleted && tourStep === 4 && hasResponseNode && !showNodeSidebar) {
      setTourStep(5);
    }
  }, [hasResponseNode, showNodeSidebar, tourCompleted, tourStep]);

  // Show Run button hint when nodes are connected (independent of tour state)
  useEffect(() => {
    if (areNodesConnected && queryNodeId && responseNodeId) {
      console.log('Nodes connected - showing Run button hint', { areNodesConnected, queryNodeId, responseNodeId, tourStep });
      setShowRunButtonHint(true);
      // Also update tour step if we're in the tour
      if (tourStep === 5) {
        setTourStep(6);
      }
    }
    // Don't hide hint if connection is broken - let user dismiss it manually
  }, [areNodesConnected, queryNodeId, responseNodeId, tourStep]);

  // Wrapper for onConnect to detect tour connections
  const handleConnect = useCallback((connection: Connection) => {
    // Call the original onConnect
    onConnect(connection);
    
    // Check if this is the tour connection (QueryNode to ResponseNode)
    console.log('handleConnect called:', {
      source: connection.source,
      target: connection.target,
      queryNodeId,
      responseNodeId,
      tourStep,
      tourCompleted,
      matches: connection.source === queryNodeId && connection.target === responseNodeId
    });
    
    if (queryNodeId && responseNodeId) {
      if (connection.source === queryNodeId && connection.target === responseNodeId) {
        console.log('Connection detected in onConnect handler - showing Run button hint');
        setShowRunButtonHint(true);
        // Also update tour step if we're in the tour
        if (tourStep === 5) {
          setTourStep(6);
        }
      }
    }
  }, [onConnect, tourCompleted, tourStep, queryNodeId, responseNodeId]);

  const handleSkipTour = () => {
    setTourCompleted(true);
    setTourStep(0);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('convoflow_workflow_tour_completed', 'true');
    }
  };

  const handleNextFromAdd = () => {
    if (tourStep === 1) {
      setTourStep(2);
    } else if (tourStep === 3) {
      setTourStep(4);
    }
  };

  const handleTourComplete = () => {
    setTourStep(7);
    setShowRunButtonHint(false); // Hide Run button hint when tour completes
    // Don't auto-close - let user see the chat preview tip and close it manually
  };

  const handleRunButtonHintClose = () => {
    setShowRunButtonHint(false);
    // Also mark tour as completed if we're in tour step 6
    if (tourStep === 6) {
      handleSkipTour();
    }
  };

  // Use deployment hook
  const {
    deploymentStatus,
    isDeploying,
    setIsDeploying,
    updateDeploymentStatusImmediately,
    setDeploymentStatus
  } = useWorkflowDeployment(workflowId);

  // Use change detection hook
  const {
    savedWorkflowSnapshot,
    isInitialLoad,
    hasUnsavedChanges,
    updateSnapshot,
    resetInitialLoad,
    clearSnapshot,
    setSavedWorkflowSnapshot,
    setHasUnsavedChanges
  } = useWorkflowChangeDetection({
    nodes,
    edges,
    isLoadingWorkflow
  });

  // Use workflow loader hook
  const { handleLoadWorkflow } = useWorkflowLoader({
    workflowId,
    templateId,
    workflowData,
    isLoadingWorkflow,
    handleNodeDelete,
    setNodes,
    setEdges,
    setWorkflowName,
    onWorkflowLoaded: (loadedNodes, loadedEdges, shouldMarkUnsaved = false) => {
      resetInitialLoad();
      updateSnapshot(loadedNodes, loadedEdges);
      if (shouldMarkUnsaved) {
        // For templates and file loads, mark as unsaved after snapshot is created
        setTimeout(() => {
          setHasUnsavedChanges(true);
        }, 250);
      }
    }
  });

  // Clear workflow state when no ID
  useEffect(() => {
    if (!workflowId) {
      setDeploymentStatus(null);
      clearSnapshot();
      setWorkflowName('Untitled Workflow');
    }
    // Only run when workflowId changes (when switching between workflows or creating new one)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // Update snapshot when workflow ID changes (after save/deploy)
  useEffect(() => {
    if (workflowId && nodes.length > 0) {
      setHasUnsavedChanges(false);
      updateSnapshot(nodes, edges);
      resetInitialLoad();
    }
  }, [workflowId]); // Only when workflowId changes

  // Use workflow execution hook
  const {
    isExecuting,
    executionResults,
    handleExecuteWorkflow: originalHandleExecuteWorkflow,
    handleContinueConversation,
    setExecutionResults
  } = useWorkflowExecution({
    nodes,
    edges,
    setNodes,
    setExecutingEdges,
    setExecutingNodes,
    onChatPreview: setChatPreview,
    conversationHistory,
    onConversationUpdate: setConversationHistory
  });


  // Wrapper to hide Run button hint when user clicks Run
  const handleExecuteWorkflow = useCallback(() => {
    // Hide the Run button tour hint immediately when user clicks Run
    setShowRunButtonHint(false);
    // Advance tour to step 7 if we're at step 6 (will show chat preview tip after execution)
    if (!tourCompleted && tourStep === 6) {
      setTourStep(7);
    }
    // Call the original execute function
    originalHandleExecuteWorkflow();
  }, [originalHandleExecuteWorkflow, tourStep, tourCompleted]);

  // Initialize workflow management
  const handleRenameWorkflow = useCallback(
    async (newName: string) => {
      const trimmed = newName.trim() || 'Untitled Workflow';
      if (trimmed === workflowName) {
        return;
      }

      if (!workflowId) {
        // For new workflows, update immediately
        setWorkflowName(trimmed);
        toast.success('Workflow renamed');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/v1/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed })
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to rename workflow');
        }
        setWorkflowName(trimmed);
        toast.success('Workflow renamed');
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to rename workflow');
      }
    },
    [workflowId, workflowName]
  );

  useEffect(() => {
    setWorkflowMeta({ id: workflowId, name: workflowName, onRename: handleRenameWorkflow });
  }, [workflowId, workflowName, handleRenameWorkflow, setWorkflowMeta]);

  useEffect(() => () => clearWorkflowMeta(), [clearWorkflowMeta]);

  const workflowManager = WorkflowManager({
    nodes,
    edges,
    onSaveWorkflow: () => {},
    onSaveWorkflowToBackend: () => {},
    onLoadWorkflow: handleLoadWorkflow,
    workflowId: workflowId,
    workflowName,
    onDeploymentComplete: () => {
      // Immediately update UI to show deployed state (optimistic update)
      updateDeploymentStatusImmediately();
      // Clear unsaved changes flag since deployment saves the workflow
      setHasUnsavedChanges(false);
      // Update snapshot to current state after deployment
      updateSnapshot(nodes, edges);
    },
    onDeploymentStatusChange: (deploying: boolean) => {
      setIsDeploying(deploying);
    },
    onSaveStatusChange: (saving: boolean) => {
      setIsSaving(saving);
    },
    onSaveComplete: () => {
      // Clear unsaved changes flag after successful save
      setHasUnsavedChanges(false);
      // Update snapshot to current state after save
      updateSnapshot(nodes, edges);
    },
    onWorkflowNameChange: (name: string) => {
      if (name && name.trim()) {
        setWorkflowName(name.trim());
      }
    },
    onWorkflowIdChange: (id: string | null) => {
      // Update workflowId state when a new workflow is saved
      if (id) {
        setWorkflowIdState(id);
      }
    }
  });

  // Handler for updating node parameters (e.g., collection selection)
  const handleUpdateParameters = (nodeId: string, parameters: any) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        // Save to memory cache using nodeId directly
        NodeConfigStorage.saveNodeConfig(nodeId, parameters);

        return {
          ...node,
          data: {
            ...node.data,
            parameters: {
              ...(node.data as any).parameters,
              ...parameters
            }
          }
        };
      }
      return node;
    });

    // Update the nodes state
    setNodes(updatedNodes);
  };

  // Show loading animation while nodes are being fetched
  if (loading) {
    return <WorkflowLoadingAnimation />;
  }

  return (
    <div className="flex flex-col h-screen pt-16" style={{ background: 'var(--background)' }}>
      {/* Main Content Area */}
      <WorkflowCanvasContainer
        nodes={nodes}
        edges={edges}
        executingNodes={executingNodes}
        executingEdges={executingEdges}
        showNodeSidebar={showNodeSidebar}
        nodesData={nodesData}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onSaveWorkflow={workflowManager.handleSaveWorkflow}
        onSaveWorkflowToBackend={workflowManager.handleSaveWorkflowToBackend}
        onLoadWorkflow={workflowManager.handleUploadWorkflow}
        onExecute={handleExecuteWorkflow}
        onDeployWorkflow={workflowManager.handleDeployWorkflow}
        onAddNode={handleAddNode}
        isExecuting={isExecuting}
        onUpdateParameters={handleUpdateParameters}
        deploymentStatus={deploymentStatus}
        isDeploying={isDeploying}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onNodeSelect={handleNodeSelect}
        onCloseNodeSidebar={() => setShowNodeSidebar(false)}
        workflowName={workflowName}
        onRename={handleRenameWorkflow}
        onConfigSidebarOpenChange={setIsConfigSidebarOpen}
        showAddNodeTourHint={!tourCompleted && (tourStep === 1 || tourStep === 3)}
        showAddNodeTourStep={tourStep}
        onTourSkip={handleSkipTour}
        onTourNextFromAdd={handleNextFromAdd}
        showQueryNodeTourHint={!tourCompleted && tourStep === 2}
        showResponseNodeTourHint={!tourCompleted && tourStep === 4}
        onQueryTourSkip={handleSkipTour}
        onQueryTourNext={() => setTourStep(3)}
        onResponseTourSkip={handleSkipTour}
        onResponseTourNext={() => setTourStep(5)}
        showConnectionGuide={!tourCompleted && tourStep === 5}
        queryNodeId={queryNodeId || undefined}
        responseNodeId={responseNodeId || undefined}
        areNodesConnected={areNodesConnected}
        showRunTourHint={!tourCompleted && tourStep === 6}
        onRunTourNext={handleTourComplete}
        onRunTourSkip={handleRunButtonHintClose}
        showFinalMessage={!tourCompleted && tourStep === 7}
        sidebarOffset={isConfigSidebarOpen ? 420 : showNodeSidebar ? 384 : 0}
      />

      {/* Chat Preview */}
      {chatPreview && (chatPreview.user || chatPreview.bot) && (
        <ChatPreview
          messages={conversationHistory}
          onClose={() => {
            setChatPreview(null);
            setConversationHistory([]);
          }}
          onSendMessage={handleContinueConversation}
          isExecuting={isExecuting}
          sidebarOffset={isConfigSidebarOpen ? 420 : showNodeSidebar ? 384 : 0}
          showTourTip={!tourCompleted && tourStep === 7}
          onTourTipClose={handleTourComplete}
        />
      )}

      {/* Execution Results - Only show on errors */}
      {executionResults && !executionResults.success && (
        <ExecutionResults
          results={executionResults}
          onClose={() => setExecutionResults(null)}
          onRetry={handleExecuteWorkflow}
        />
      )}
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <>
      <MobileBlocker />
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen" style={{ background: '#0D0C14', color: '#a1a1aa' }}>
          <LoadingSpinner size="lg" text="Loading ..." />
        </div>
      }>
        <WorkflowBuilderContent />
      </Suspense>
    </>
  );
}
