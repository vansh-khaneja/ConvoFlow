'use client';

import React from 'react';
import CustomNode from './CustomNode';

interface NodeSchema {
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
    shape?: 'rectangle' | 'circle' | 'rounded' | 'custom';
    width?: number;
    height?: number;
    html_template?: string;
    css_classes?: string;
    inline_styles?: string;
  };
  ui_config?: {
    node_id: string;
    node_name: string;
    groups: Array<any>;
    dialog_config?: {
      title: string;
      description: string;
      background_color: string;
      border_color: string;
      text_color: string;
      icon?: string;
      icon_color?: string;
    };
  };
}

interface NodeData {
  nodeSchema: NodeSchema;
  parameters: Record<string, any>;
  onDelete?: (nodeId: string) => void;
  onUpdateParameters?: (nodeId: string, parameters: any, updatedNodeData?: any) => void;
  response_content?: string;
}

interface NodeWithConfigProps {
  data: NodeData;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
  nodeId?: string;
  isExecuting?: boolean;
  isConfigOpen?: boolean; // Controlled prop from parent
  onConfigOpen?: (isOpen: boolean) => void;
}

export default function NodeWithConfig({ 
  data, 
  selected, 
  onDelete, 
  nodeId, 
  isExecuting, 
  isConfigOpen = false, 
  onConfigOpen 
}: NodeWithConfigProps) {
  const { nodeSchema } = data;

  return (
    <div className="relative">
      {/* Main Node - React Flow handles the click, no need for wrapper */}
      <CustomNode
        data={data}
        selected={selected}
        onDelete={onDelete}
        nodeId={nodeId}
        isExecuting={isExecuting}
      />

      {/* Configuration is now handled by sidebar - no popup needed */}
      {/* When node is clicked, configuration opens in the right sidebar */}
    </div>
  );
}
