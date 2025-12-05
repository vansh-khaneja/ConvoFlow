'use client';

import { useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UseWorkflowLoaderProps {
  workflowId: string | null;
  templateId: string | null;
  workflowData: any;
  isLoadingWorkflow: boolean;
  handleNodeDelete: (nodeId: string) => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setWorkflowName: (name: string) => void;
  onWorkflowLoaded: (nodes: Node[], edges: Edge[], shouldMarkUnsaved?: boolean) => void;
}

/**
 * Hook to handle loading workflows from API, templates, or files
 */
export function useWorkflowLoader({
  workflowId,
  templateId,
  workflowData,
  isLoadingWorkflow,
  handleNodeDelete,
  setNodes,
  setEdges,
  setWorkflowName,
  onWorkflowLoaded
}: UseWorkflowLoaderProps) {
  // Use refs to store callbacks to prevent infinite loops
  const onWorkflowLoadedRef = useRef(onWorkflowLoaded);
  const handleNodeDeleteRef = useRef(handleNodeDelete);
  
  // Update refs when callbacks change
  useEffect(() => {
    onWorkflowLoadedRef.current = onWorkflowLoaded;
    handleNodeDeleteRef.current = handleNodeDelete;
  }, [onWorkflowLoaded, handleNodeDelete]);

  // Track if we've already loaded this workflow to prevent re-loading
  const loadedWorkflowIdRef = useRef<string | null>(null);
  const loadedTemplateIdRef = useRef<string | null>(null);

  // Load workflow from API
  useEffect(() => {
    if (!workflowData || isLoadingWorkflow) return;
    
    // Prevent re-loading the same workflow
    if (loadedWorkflowIdRef.current === workflowId && workflowId !== null) {
      return;
    }
    
    const wf = workflowData.data;
    if (wf && wf.nodes && wf.edges) {
      // Ensure nodes carry required data (e.g., onDelete handler)
      const loadedNodes = wf.nodes.map((n: any) => ({
        ...n,
        type: n.type || 'custom',
        data: {
          ...(n.data || {}),
          onDelete: handleNodeDeleteRef.current
        }
      }));

      // Ensure edges have required properties (id is required by React Flow)
      const loadedEdges = wf.edges.map((e: any) => ({
        ...e,
        id: e.id || `${e.source}-${e.sourceHandle || ''}-${e.target}-${e.targetHandle || ''}`,
        type: e.type || 'default',
        animated: e.animated || false,
        style: e.style || {}
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setWorkflowName(workflowData.name || 'Untitled Workflow');
      
      // Mark as loaded
      loadedWorkflowIdRef.current = workflowId;
      
      // Use ref to call callback
      onWorkflowLoadedRef.current(loadedNodes, loadedEdges, false); // API loads are saved, no unsaved changes
    }
  }, [workflowData, isLoadingWorkflow, workflowId, setNodes, setEdges, setWorkflowName]);

  // Load template if template param is present
  useEffect(() => {
    if (!templateId) return;
    
    // Prevent re-loading the same template
    if (loadedTemplateIdRef.current === templateId) {
      return;
    }
    
    // Clear workflow state if no ID
    if (!workflowId) {
      setWorkflowName('Untitled Workflow');
    }
    
    // Load template from sessionStorage
    (async () => {
      try {
        const templateDataStr = sessionStorage.getItem('template_data');
        if (templateDataStr) {
          const templateData = JSON.parse(templateDataStr);
          if (templateData.nodes && templateData.edges) {
            // Fetch node schemas from backend to populate full schema data
            const nodesResponse = await fetch(`${API_BASE}/api/v1/nodes/`);
            const nodesData = await nodesResponse.json();

            let loadedNodes: any[];
            let loadedEdges: any[];

            if (nodesData.success && nodesData.data?.schemas) {
              const schemas = nodesData.data.schemas;

              // Ensure nodes carry required data with full schemas from backend
              loadedNodes = templateData.nodes.map((n: any) => {
                const nodeId = n.data?.nodeSchema?.node_id;
                const fullSchema = nodeId ? schemas[nodeId] : null;

                return {
                  ...n,
                  type: n.type || 'custom',
                  data: {
                    ...(n.data || {}),
                    nodeSchema: fullSchema || n.data?.nodeSchema,
                    parameters: n.data?.parameters || {},
                    onDelete: handleNodeDeleteRef.current
                  }
                };
              });

              // Ensure edges have required properties
              loadedEdges = templateData.edges.map((e: any) => ({
                ...e,
                id: e.id || `${e.source}-${e.sourceHandle || ''}-${e.target}-${e.targetHandle || ''}`,
                type: e.type || 'default',
                animated: e.animated || false,
                style: e.style || {}
              }));
            } else {
              // Fallback if schemas can't be fetched
              loadedNodes = templateData.nodes.map((n: any) => ({
                ...n,
                type: n.type || 'custom',
                data: {
                  ...(n.data || {}),
                  onDelete: handleNodeDeleteRef.current
                }
              }));

              loadedEdges = templateData.edges.map((e: any) => ({
                ...e,
                id: e.id || `${e.source}-${e.sourceHandle || ''}-${e.target}-${e.targetHandle || ''}`,
                type: e.type || 'default',
                animated: e.animated || false,
                style: e.style || {}
              }));
            }

            setNodes(loadedNodes);
            setEdges(loadedEdges);
            setWorkflowName(templateData.name || 'Untitled Workflow');

            // Mark as loaded
            loadedTemplateIdRef.current = templateId;

            // Clear template data from sessionStorage after loading
            sessionStorage.removeItem('template_data');

            // Delay to allow React Flow to finish initialization
            setTimeout(() => {
              onWorkflowLoadedRef.current(loadedNodes, loadedEdges, true); // Templates need to be saved, mark as unsaved
            }, 200);
          }
        }
      } catch (e) {
        console.error('Failed to load template', e);
      }
    })();
  }, [templateId, workflowId, setNodes, setEdges, setWorkflowName]);

  // Handler for loading workflow from file
  const handleLoadWorkflow = (workflowData: any) => {
    if (workflowData.nodes && workflowData.edges) {
      // Ensure nodes carry required data
      const loadedNodes = workflowData.nodes.map((n: any) => ({
        ...n,
        type: n.type || 'custom',
        data: {
          ...(n.data || {}),
          onDelete: handleNodeDeleteRef.current
        }
      }));

      // Ensure edges have required properties
      const loadedEdges = workflowData.edges.map((e: any) => ({
        ...e,
        id: e.id || `${e.source}-${e.sourceHandle || ''}-${e.target}-${e.targetHandle || ''}`,
        type: e.type || 'default',
        animated: e.animated || false,
        style: e.style || {}
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setWorkflowName(workflowData.name || 'Untitled Workflow');

      // Reset loaded refs since this is a new file load
      loadedWorkflowIdRef.current = null;
      loadedTemplateIdRef.current = null;

      // Delay to allow React Flow to finish initialization
      setTimeout(() => {
        onWorkflowLoadedRef.current(loadedNodes, loadedEdges, true); // File loads need to be saved, mark as unsaved
      }, 200);
    }
  };

  return { handleLoadWorkflow };
}

