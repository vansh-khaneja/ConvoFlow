import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './config';

export interface Workflow {
  id: string;
  name: string;
  data?: any;
  created_at: string;
  updated_at?: string;
  node_count?: number;
  is_deployed?: boolean;
  node_types?: string[];
}

export interface CreateWorkflowPayload {
  name: string;
  data: any;
}

export interface UpdateWorkflowPayload {
  name?: string;
  data?: any;
}

/**
 * Fetch a single workflow by ID
 */
export async function getWorkflow(workflowId: string): Promise<Workflow | null> {
  const response = await apiGet<Workflow>(`/api/v1/workflows/${workflowId}`);
  return response.success && response.data ? response.data : null;
}

/**
 * Fetch all workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    const response = await apiGet<Workflow[]>(`/api/v1/workflows/`);
    return response.success && response.data ? response.data : [];
  } catch (error: any) {
    // Return empty array on network errors to prevent UI crashes
    if (error?.isNetworkError) {
      console.warn('Backend unavailable, returning empty workflows list');
      return [];
    }
    throw error;
  }
}

/**
 * Create a new workflow
 */
export async function createWorkflow(
  payload: CreateWorkflowPayload
): Promise<ApiResponse<Workflow>> {
  return apiPost<Workflow>(`/api/v1/workflows/`, payload);
}

/**
 * Update a workflow
 */
export async function updateWorkflow(
  workflowId: string,
  payload: UpdateWorkflowPayload
): Promise<ApiResponse<Workflow>> {
  return apiPut<Workflow>(`/api/v1/workflows/${workflowId}`, payload);
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(
  workflowId: string
): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/v1/workflows/${workflowId}`);
}

