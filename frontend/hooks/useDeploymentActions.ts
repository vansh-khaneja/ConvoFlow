'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useDeployments } from './useWorkflowQueries';
import { toggleDeployment, deleteDeployment, API_BASE } from '../api';

export function useDeploymentActions() {
  const { data: deploymentsData, isLoading: loading, isFetching: fetching, refetch: refetchDeployments } = useDeployments();
  const deployments = deploymentsData || [];
  
  const [busyId, setBusyId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<any | null>(null);

  const copyEndpoint = async (id: string) => {
    const url = `${API_BASE}/api/v1/deployments/${id}/invoke`;
    try {
      await navigator.clipboard?.writeText(url);
      toast.success('Invoke URL copied');
    } catch {}
  };

  const handleToggleDeployment = async (id: string) => {
    try {
      setTogglingId(id);
      const response = await toggleDeployment(id);
      if (response.success && response.data) {
        // Update selectedDeployment immediately if it's the one being toggled
        if (selectedDeployment?.id === id) {
          setSelectedDeployment({
            ...selectedDeployment,
            is_active: response.data.is_active
          });
        }
        
        // Add a small delay to show the process is happening
        await new Promise(resolve => setTimeout(resolve, 500));
        await refetchDeployments();
        
        const newStatus = response.data.is_active === 1 ? 'started' : 'stopped';
        toast.success(`Deployment ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to toggle deployment');
    } finally {
      setTogglingId(null);
    }
  };

  const handleUndeploy = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await deleteDeployment(id);
      if (!response.success) throw new Error('Failed to delete deployment');
      await refetchDeployments();
      toast.success('Deployment removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to remove deployment');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    // State
    deployments,
    loading,
    fetching,
    busyId,
    togglingId,
    deletingId,
    selectedDeployment,
    
    // Setters
    setBusyId,
    setTogglingId,
    setDeletingId,
    setSelectedDeployment,
    
    // Actions
    copyEndpoint,
    toggleDeployment: handleToggleDeployment,
    undeploy: handleUndeploy,
    refetchDeployments,
  };
}

