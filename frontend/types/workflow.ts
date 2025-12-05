// Shared types for the workflow system

export interface NodeSchema {
  node_id: string;
  name: string;
  description: string;
  inputs: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    default_value: any;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    default_value: any;
    options: string[] | null;
  }>;
  styling: {
    icon?: string;
    background_color?: string;
    border_color?: string;
    text_color?: string;
    custom_css?: string;
    subtitle?: string;
    icon_position?: string;
    shape?: 'rectangle' | 'circle' | 'rounded' | 'hexagon' | 'diamond' | 'pill' | 'compact' | 'custom';
    width?: number;
    height?: number;
    html_template?: string;
    css_classes?: string;
    inline_styles?: string;
  };
}

export interface NodeData {
  nodeSchema: NodeSchema;
  parameters: Record<string, any>;
  response_content?: string;
}

export interface NodesResponse {
  success: boolean;
  data: {
    nodes: string[];
    schemas: Record<string, NodeSchema>;
    total_count: number;
  };
}

export interface WorkflowData {
  nodes: any[];
  edges: any[];
  timestamp: string;
  name: string;
}
