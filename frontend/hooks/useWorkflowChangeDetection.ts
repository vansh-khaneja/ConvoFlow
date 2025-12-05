'use client';

import { useEffect, useState, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { createWorkflowSnapshot } from '@/lib/workflow/workflowSnapshot';

interface UseWorkflowChangeDetectionProps {
  nodes: Node[];
  edges: Edge[];
  isLoadingWorkflow: boolean;
}

export function useWorkflowChangeDetection({
  nodes,
  edges,
  isLoadingWorkflow
}: UseWorkflowChangeDetectionProps) {
  const isInitialLoadRef = useRef(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [savedWorkflowSnapshot, setSavedWorkflowSnapshot] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previousSnapshotRef = useRef<string | null>(null);
  
  // Store latest nodes/edges in refs to avoid dependency issues
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Mark workflow as having unsaved changes when nodes or edges change
  // Ignores position changes - only detects actual workflow logic changes
  useEffect(() => {
    // Skip on initial load - allow the initial load to complete first
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      setIsInitialLoad(false);
      const snapshot = createWorkflowSnapshot(nodesRef.current, edgesRef.current);
      previousSnapshotRef.current = snapshot;
      return;
    }

    // Skip marking as unsaved while loading a workflow from backend
    if (isLoadingWorkflow) {
      return;
    }

    // Calculate current snapshot using refs (always has latest values)
    const currentSnapshot = createWorkflowSnapshot(nodesRef.current, edgesRef.current);

    // Skip if snapshot hasn't actually changed (this prevents infinite loops)
    if (previousSnapshotRef.current === currentSnapshot) {
      return;
    }

    // Update the previous snapshot ref BEFORE state updates
    previousSnapshotRef.current = currentSnapshot;

    // For new workflows (no snapshot), mark as unsaved if there are any nodes/edges
    if (!savedWorkflowSnapshot) {
      const shouldHaveUnsavedChanges = nodesRef.current.length > 0 || edgesRef.current.length > 0;
      setHasUnsavedChanges(prev => {
        // Only update if value actually changed to prevent unnecessary re-renders
        return prev !== shouldHaveUnsavedChanges ? shouldHaveUnsavedChanges : prev;
      });
      return;
    }

    // For saved workflows, compare current workflow (without positions) against saved snapshot
    const hasChanges = currentSnapshot !== savedWorkflowSnapshot;
    setHasUnsavedChanges(prev => {
      // Only update if value actually changed to prevent unnecessary re-renders
      return prev !== hasChanges ? hasChanges : prev;
    });
  }, [nodes.length, edges.length, isLoadingWorkflow, savedWorkflowSnapshot]); // Only depend on lengths, not arrays themselves

  const updateSnapshot = (nodes: Node[], edges: Edge[]) => {
    const newSnapshot = createWorkflowSnapshot(nodes, edges);
    setSavedWorkflowSnapshot(newSnapshot);
    previousSnapshotRef.current = newSnapshot;
    setHasUnsavedChanges(false);
  };

  const resetInitialLoad = () => {
    isInitialLoadRef.current = true;
    setIsInitialLoad(true);
  };

  const clearSnapshot = () => {
    setSavedWorkflowSnapshot(null);
    previousSnapshotRef.current = null;
    setHasUnsavedChanges(false);
  };

  return {
    savedWorkflowSnapshot,
    isInitialLoad,
    hasUnsavedChanges,
    updateSnapshot,
    resetInitialLoad,
    clearSnapshot,
    setSavedWorkflowSnapshot,
    setHasUnsavedChanges
  };
}
