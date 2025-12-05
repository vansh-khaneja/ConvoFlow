import { apiGet, apiPost, apiPatch, apiDelete, ApiResponse } from './config';

export interface Deployment {
  id: string;
  workflow_id: string;
  name?: string;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  timestamp: string;
  created_at: string;
  status: string;
  latency_ms?: number;
  request?: any;
  response?: any;
  error?: string;
}

export interface CreateDeploymentPayload {
  workflow_id: string;
  name?: string;
}

export interface DeploymentLogsResponse {
  logs: DeploymentLog[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetch deployment status for a workflow
 */
export async function getDeploymentStatus(
  workflowId: string
): Promise<Deployment | null> {
  try {
    const response = await apiGet<Deployment>(
      `/api/v1/deployments/workflow/${workflowId}`
    );
    return response.success && response.data ? response.data : null;
  } catch (error: any) {
    // Return null on network errors to prevent UI crashes
    if (error?.isNetworkError) {
      console.warn('Backend unavailable, returning null for deployment status');
      return null;
    }
    throw error;
  }
}

/**
 * Fetch all deployments
 */
export async function getDeployments(): Promise<Deployment[]> {
  try {
    const response = await apiGet<Deployment[]>(`/api/v1/deployments/`);
    return response.success && response.data ? response.data : [];
  } catch (error: any) {
    // Return empty array on network errors to prevent UI crashes
    if (error?.isNetworkError) {
      console.warn('Backend unavailable, returning empty deployments list');
      return [];
    }
    throw error;
  }
}

/**
 * Create a new deployment
 */
export async function createDeployment(
  payload: CreateDeploymentPayload
): Promise<ApiResponse<Deployment>> {
  return apiPost<Deployment>(`/api/v1/deployments/`, payload);
}

/**
 * Toggle deployment (activate/deactivate)
 */
export async function toggleDeployment(
  deploymentId: string
): Promise<ApiResponse<Deployment>> {
  return apiPatch<Deployment>(`/api/v1/deployments/${deploymentId}/toggle`);
}

/**
 * Delete a deployment
 */
export async function deleteDeployment(
  deploymentId: string
): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/v1/deployments/${deploymentId}`);
}

/**
 * Fetch deployment logs
 */
export async function getDeploymentLogs(
  deploymentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<DeploymentLogsResponse | null> {
  try {
    const response = await apiGet<DeploymentLogsResponse>(
      `/api/v1/deployments/${deploymentId}/logs?limit=${limit}&offset=${offset}`
    );
    return response.success && response.data ? response.data : null;
  } catch (error: any) {
    // Return null on network errors to prevent UI crashes
    if (error?.isNetworkError) {
      console.warn('Backend unavailable, returning null for deployment logs');
      return null;
    }
    throw error;
  }
}

