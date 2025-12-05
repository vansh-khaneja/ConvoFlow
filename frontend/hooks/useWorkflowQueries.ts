'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkflow,
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getDeploymentStatus,
  getDeployments,
  createDeployment,
  toggleDeployment,
  deleteDeployment,
  getDeploymentLogs,
  getTemplates,
  getTemplate,
  createWorkflowFromTemplate,
  groupTemplatesByCategory,
  getCredentials,
  setCredential,
  deleteCredential,
} from '../api';
export { groupTemplatesByCategory, getTemplate, createWorkflowFromTemplate };
export type { Template, TemplateCategory } from '../api/templates';

// ==================== WORKFLOWS ====================

/**
 * Fetch a single workflow by ID with stale-while-revalidate
 * Shows cached data immediately while fetching fresh data in background
 */
export function useWorkflow(workflowId: string | null) {
  return useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      if (!workflowId) return null;
      return getWorkflow(workflowId);
    },
    enabled: !!workflowId, // Only run if workflowId exists
    staleTime: 10 * 1000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: 'always', // Always refetch on mount (but show cached first!)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

/**
 * Fetch list of all workflows with stale-while-revalidate
 */
export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      return getWorkflows();
    },
    staleTime: 5 * 1000, // Consider data fresh for 5 seconds
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

/**
 * Update a workflow (optimistic update)
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workflowId, data }: { workflowId: string; data: any }) => {
      const response = await updateWorkflow(workflowId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update workflow');
      }
      return response;
    },
    // Optimistic update: update cache immediately before server responds
    onMutate: async ({ workflowId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['workflow', workflowId] });
      
      // Snapshot previous value
      const previousWorkflow = queryClient.getQueryData(['workflow', workflowId]);
      
      // Optimistically update cache
      queryClient.setQueryData(['workflow', workflowId], (old: any) => ({
        ...old,
        ...data,
      }));
      
      return { previousWorkflow };
    },
    // On error, rollback to previous value
    onError: (err, { workflowId }, context) => {
      if (context?.previousWorkflow) {
        queryClient.setQueryData(['workflow', workflowId], context.previousWorkflow);
      }
    },
    // Always refetch after mutation
    onSettled: (data, error, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

/**
 * Delete a workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await deleteWorkflow(workflowId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete workflow');
      }
      return { response, workflowId };
    },
    onSuccess: (data) => {
      const { workflowId } = data;
      
      // Optimistically remove workflow from cache immediately
      queryClient.setQueryData(['workflows'], (old: any) => {
        if (!old) return old;
        return old.filter((w: any) => w.id !== workflowId);
      });
      
      // Remove individual workflow from cache
      queryClient.removeQueries({ queryKey: ['workflow', workflowId] });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

// ==================== DEPLOYMENTS ====================

/**
 * Fetch deployment status for a workflow
 */
export function useDeploymentStatus(workflowId: string | null) {
  return useQuery({
    queryKey: ['deployment', 'workflow', workflowId],
    queryFn: async () => {
      if (!workflowId) return null;
      return getDeploymentStatus(workflowId);
    },
    enabled: !!workflowId,
    staleTime: 5 * 1000, // Consider data fresh for 5 seconds
    gcTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch list of all deployments
 */
export function useDeployments() {
  return useQuery({
    queryKey: ['deployments'],
    queryFn: async () => {
      return getDeployments();
    },
    staleTime: 5 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

/**
 * Create or update deployment
 */
export function useCreateDeployment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workflowId, name }: { workflowId: string; name?: string }) => {
      const response = await createDeployment({ workflow_id: workflowId, name });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create deployment');
      }
      return response;
    },
    onSuccess: (data, { workflowId }) => {
      // Invalidate deployment queries to refetch
      queryClient.invalidateQueries({ queryKey: ['deployment', 'workflow', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}

/**
 * Fetch deployment logs
 */
export function useDeploymentLogs(deploymentId: string | null, limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ['deployment-logs', deploymentId, limit, offset],
    queryFn: async () => {
      if (!deploymentId) return null;
      return getDeploymentLogs(deploymentId, limit, offset);
    },
    enabled: !!deploymentId,
    staleTime: 5 * 1000, // Logs are fresh for 5 seconds
    gcTime: 2 * 60 * 1000, // Keep logs for 2 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

// ==================== TEMPLATES ====================

export interface Template {
  name: string;
  description: string;
  category: string;
  workflow: {
    name: string;
    description?: string;
    nodes: any[];
    edges: any[];
    timestamp: string;
  };
  path: string;
}

export interface TemplateCategory {
  category: string;
  templates: Template[];
}

/**
 * Fetch list of templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      return getTemplates();
    },
    staleTime: 60 * 1000, // Templates are fresh for 1 minute
    gcTime: 30 * 60 * 1000, // Keep templates for 30 minutes
    refetchOnMount: false, // Templates don't change often
    refetchOnWindowFocus: false,
  });
}

// Template functions are now imported from '../api'

// ==================== CREDENTIALS ====================

/**
 * Fetch list of credentials
 */
export function useCredentials() {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      return getCredentials();
    },
    staleTime: 30 * 1000, // Credentials fresh for 30 seconds
    gcTime: 10 * 60 * 1000, // Keep for 10 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

/**
 * Set/update credential
 */
export function useSetCredential() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await setCredential({ key, value });
      if (!response.success) {
        throw new Error(response.error || 'Failed to set credential');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

/**
 * Delete credential
 */
export function useDeleteCredential() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await deleteCredential({ key });
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete credential');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

