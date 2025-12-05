import { apiGet, apiPost, ApiResponse } from './config';

export interface Template {
  name: string;
  description: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
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

export interface CreateWorkflowFromTemplateResponse {
  id: string;
  name: string;
  message: string;
}

/**
 * Fetch all templates
 */
export async function getTemplates(): Promise<Template[]> {
  const response = await apiGet<Template[]>(`/api/v1/templates/`);
  return response.success && Array.isArray(response.data) ? response.data : [];
}

/**
 * Get a single template by category
 */
export async function getTemplate(
  category: string
): Promise<Template | null> {
  try {
    const response = await apiGet<Template>(
      `/api/v1/templates/${encodeURIComponent(category)}`
    );
    return response.success && response.data ? response.data : null;
  } catch (error) {
    console.error(`Error fetching template ${category}:`, error);
    return null;
  }
}

/**
 * Create workflow from template
 */
export async function createWorkflowFromTemplate(
  category: string,
  workflowName?: string
): Promise<CreateWorkflowFromTemplateResponse | null> {
  try {
    const url = `/api/v1/templates/${encodeURIComponent(category)}/create-workflow`;
    const params = workflowName ? { workflow_name: workflowName } : undefined;
    
    const response = await apiPost<CreateWorkflowFromTemplateResponse>(
      params ? `${url}?workflow_name=${encodeURIComponent(workflowName!)}` : url
    );
    
    return response.success && response.data ? response.data : null;
  } catch (error) {
    console.error(`Error creating workflow from template ${category}:`, error);
    return null;
  }
}

/**
 * Group templates by category
 */
export function groupTemplatesByCategory(
  templates: Template[]
): TemplateCategory[] {
  const categoryMap = new Map<string, Template[]>();

  templates.forEach((template) => {
    const category = template.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(template);
  });

  return Array.from(categoryMap.entries()).map(([category, templates]) => ({
    category,
    templates,
  }));
}

