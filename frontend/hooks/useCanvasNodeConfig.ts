import { useState, useCallback } from 'react';

interface UseCanvasNodeConfigReturn {
  hoveredNodeId: string | null;
  openConfigNodeId: string | null;
  setHoveredNodeId: (nodeId: string | null) => void;
  handleConfigOpen: (nodeId: string, isOpen: boolean) => void;
  handlePaneClick: () => void;
  clearHoverState: () => void;
  closeConfig: () => void;
}

export function useCanvasNodeConfig(): UseCanvasNodeConfigReturn {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [openConfigNodeId, setOpenConfigNodeId] = useState<string | null>(null);
  
  // Memoized callback to update config open state - only one config can be open at a time
  const handleConfigOpen = useCallback((nodeId: string, isOpen: boolean) => {
    if (isOpen) {
      // If opening a new config, close any previously open config
      setOpenConfigNodeId(nodeId);
    } else {
      // If closing, only close if it's the currently open one
      setOpenConfigNodeId(prev => (prev === nodeId ? null : prev));
      // Clear hoveredNodeId when config closes to ensure tooltip disappears
      setHoveredNodeId(prevHovered => (prevHovered === nodeId ? null : prevHovered));
    }
  }, []);

  // Close config explicitly
  const closeConfig = useCallback(() => {
    setOpenConfigNodeId(null);
    setHoveredNodeId(null);
  }, []);

  // Handle canvas click to close config when clicking outside
  const handlePaneClick = useCallback(() => {
    if (openConfigNodeId) {
      setOpenConfigNodeId(null);
    }
  }, [openConfigNodeId]);

  const clearHoverState = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  return {
    hoveredNodeId,
    openConfigNodeId,
    setHoveredNodeId,
    handleConfigOpen,
    handlePaneClick,
    clearHoverState,
    closeConfig,
  };
}

