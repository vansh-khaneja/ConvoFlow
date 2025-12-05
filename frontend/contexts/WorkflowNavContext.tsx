'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export type WorkflowNavMeta = {
  id: string | null;
  name: string;
  onRename?: (name: string) => Promise<void>;
};

type WorkflowNavContextValue = {
  meta: WorkflowNavMeta | null;
  setWorkflowMeta: (meta: WorkflowNavMeta | null) => void;
  clearWorkflowMeta: () => void;
};

const WorkflowNavContext = createContext<WorkflowNavContextValue | undefined>(undefined);

export function WorkflowNavProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<WorkflowNavMeta | null>(null);

  const setWorkflowMeta = useCallback((newMeta: WorkflowNavMeta | null) => {
    setMeta(newMeta);
  }, []);

  const clearWorkflowMeta = useCallback(() => {
    setMeta(null);
  }, []);

  return (
    <WorkflowNavContext.Provider value={{ meta, setWorkflowMeta, clearWorkflowMeta }}>
      {children}
    </WorkflowNavContext.Provider>
  );
}

export function useWorkflowNav() {
  const context = useContext(WorkflowNavContext);
  if (!context) {
    throw new Error('useWorkflowNav must be used within a WorkflowNavProvider');
  }
  return context;
}


