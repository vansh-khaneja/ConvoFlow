import { apiGet, ApiResponse } from './config';

export interface NodeSchema {
  node_id: string;
  name: string;
  description?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    default_value?: any;
    description?: string;
  }>;
}

export interface NodesResponse {
  nodes: string[];
  schemas: Record<string, NodeSchema>;
  total_count: number;
}

/**
 * Fetch all available nodes and their schemas
 */
export async function getNodes(): Promise<NodesResponse> {
  const response = await apiGet<NodesResponse>(`/api/v1/nodes/`);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  // Return default empty state on error
  return {
    nodes: [],
    schemas: {},
    total_count: 0,
  };
}

