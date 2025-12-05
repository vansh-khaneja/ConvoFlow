'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui-kit/tooltip';

// Global function declaration for parameter updates and query editing
declare global {
  interface Window {
    updateNodeParameter?: (nodeId: string, parameters: any) => void;
    toggleQueryEdit?: (container: HTMLElement) => void;
    saveQuery?: (nodeId: string) => void;
    cancelQuery?: (nodeId: string) => void;
  }
}

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
    shape?: 'rectangle' | 'circle' | 'rounded' | 'hexagon' | 'diamond' | 'pill' | 'compact' | 'custom';
    width?: number;
    height?: number;
    html_template?: string;
    css_classes?: string;
    inline_styles?: string;
    hide_outputs?: boolean;
  };
}

interface NodeData {
  nodeSchema: NodeSchema;
  parameters: Record<string, any>;
  onDelete?: (nodeId: string) => void;
  onUpdateParameters?: (nodeId: string, parameters: any) => void;
  response_content?: string;
  node_data?: Record<string, any>;  // Custom data from node execution
}

interface CustomNodeProps {
  data: NodeData;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
  nodeId?: string;
  isExecuting?: boolean;
}

export default function CustomNode({ data, selected, onDelete, nodeId, isExecuting }: CustomNodeProps) {
  const { nodeSchema, parameters } = data;
  const { styling } = nodeSchema;

  // Handle click events - no special handling needed for QueryNode anymore
  const handleNodeClick = (e: React.MouseEvent) => {
    // No special handling needed - let the normal node selection work
  };

  // Set up global functions for query node editing
  React.useEffect(() => {
    if (data.onUpdateParameters) {
      window.updateNodeParameter = (id: string, newParameters: any) => {
        data.onUpdateParameters?.(id, newParameters);
      };
    }

    // No inline editing functions needed anymore
    if (false) {
      window.toggleQueryEdit = (container: HTMLElement) => {
        const editElement = container.querySelector('.query-edit') as HTMLElement;
        if (!editElement) return;
        
        const nodeId = editElement.id.replace('query-edit-', '');
        const display = document.getElementById('query-display-' + nodeId);
        const edit = document.getElementById('query-edit-' + nodeId) as HTMLTextAreaElement;
        const actions = container.querySelector('.query-actions') as HTMLElement;
        
        if (container.classList.contains('editing')) {
          return; // Already editing
        }
        
        container.classList.add('editing');
        if (display) display.style.display = 'none';
        if (edit) edit.style.display = 'block';
        if (actions) actions.style.display = 'flex';
        if (edit) {
          edit.focus();
          edit.select();
        }
      };

      window.saveQuery = (nodeId: string) => {
        const container = document.querySelector(`[id*="${nodeId}"]`)?.closest('.query-node-container') as HTMLElement;
        if (!container) return;
        
        const display = document.getElementById('query-display-' + nodeId);
        const edit = document.getElementById('query-edit-' + nodeId) as HTMLTextAreaElement;
        const actions = container.querySelector('.query-actions') as HTMLElement;
        
        // Update display with new value
        if (display && edit) {
          display.textContent = edit.value;
        }
        
        // Hide edit mode
        container.classList.remove('editing');
        if (display) display.style.display = 'block';
        if (edit) edit.style.display = 'none';
        if (actions) actions.style.display = 'none';
        
        // Trigger parameter update
        if (window.updateNodeParameter) {
          window.updateNodeParameter(nodeId, { query: edit?.value || '' });
        }
      };

      window.cancelQuery = (nodeId: string) => {
        const container = document.querySelector(`[id*="${nodeId}"]`)?.closest('.query-node-container') as HTMLElement;
        if (!container) return;
        
        const display = document.getElementById('query-display-' + nodeId);
        const edit = document.getElementById('query-edit-' + nodeId) as HTMLTextAreaElement;
        const actions = container.querySelector('.query-actions') as HTMLElement;
        
        // Reset edit value to display value
        if (display && edit) {
          edit.value = display.textContent || '';
        }
        
        // Hide edit mode
        container.classList.remove('editing');
        if (display) display.style.display = 'block';
        if (edit) edit.style.display = 'none';
        if (actions) actions.style.display = 'none';
      };

      // Handle keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          const editingContainer = document.querySelector('.query-node-container.editing');
          if (editingContainer) {
            const editElement = editingContainer.querySelector('.query-edit') as HTMLElement;
            if (editElement) {
              const nodeId = editElement.id.replace('query-edit-', '');
              window.cancelQuery?.(nodeId);
            }
          }
        }
        if (e.key === 'Enter' && e.ctrlKey) {
          const editingContainer = document.querySelector('.query-node-container.editing');
          if (editingContainer) {
            const editElement = editingContainer.querySelector('.query-edit') as HTMLElement;
            if (editElement) {
              const nodeId = editElement.id.replace('query-edit-', '');
              window.saveQuery?.(nodeId);
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
    }
  }, [data.onUpdateParameters]);

  // Generate unique CSS class name for this node type
  const nodeTypeClass = `custom-node-${nodeSchema.node_id.replace(/[^a-zA-Z0-9]/g, '-')}`;

  // Inject custom CSS if provided
  React.useEffect(() => {
    if (styling.custom_css) {
      const styleId = `node-style-${nodeSchema.node_id}`;
      let styleElement = document.getElementById(styleId);

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      // Replace node type placeholder with actual class name
      const processedCSS = styling.custom_css.replace(/\.node-type/g, `.${nodeTypeClass}`);
      styleElement.textContent = processedCSS;
    }
  }, [styling.custom_css, nodeTypeClass]);


  // Build dynamic styles based on backend configuration
  const getThemeAwareColors = () => {
    // Dark theme - use backend colors if provided, otherwise use defaults
    return {
      backgroundColor: styling.background_color || (selected ? '#13111C' : '#13111C'),
      borderColor: styling.border_color || (selected ? '#3b82f6' : '#404040'),
      color: styling.text_color || '#ffffff',
    };
  };

  const themeColors = getThemeAwareColors();
  const nodeStyles = {
    backgroundColor: themeColors.backgroundColor,
    borderColor: themeColors.borderColor,
    color: themeColors.color,
    width: styling.width ? `${styling.width}px` : 'auto',
    height: styling.height ? `${styling.height}px` : 'auto',
    ...(styling.inline_styles ? JSON.parse(styling.inline_styles) : {})
  };

  // Automatically determine node shape based on type if not specified
  const getAutoShape = (): string => {
    // If shape is explicitly provided by backend, use it (including 'diamond')
    if (styling.shape && styling.shape !== 'rectangle') {
      return styling.shape;
    }

    const nodeName = nodeSchema.name.toLowerCase();
    const nodeType = nodeSchema.node_id.toLowerCase();
    const description = nodeSchema.description.toLowerCase();

    // Hexagon for conditional/decision nodes
    if (nodeName.includes('condition') || nodeName.includes('if') || nodeName.includes('switch') ||
        nodeName.includes('branch') || nodeType.includes('condition') || nodeType.includes('decision')) {
      return 'hexagon';
    }

    // Diamond for routing/logic nodes
    if (nodeName.includes('route') || nodeName.includes('decision') || nodeName.includes('logic') ||
        description.includes('route') || description.includes('branch')) {
      return 'diamond';
    }

    // Pill for input/output nodes
    if (nodeName.includes('input') || nodeName.includes('output') || nodeName.includes('trigger') ||
        nodeName.includes('webhook') || nodeType.includes('input') || nodeType.includes('output')) {
      return 'pill';
    }

    // Circle for start/end nodes
    if (nodeName.includes('start') || nodeName.includes('end') || nodeName.includes('begin') ||
        nodeName.includes('finish') || nodeName.includes('complete')) {
      return 'circle';
    }

    // Compact for simple utility nodes
    if (nodeName.includes('variable') || nodeName.includes('delay') || nodeName.includes('wait') ||
        nodeName.includes('set') || nodeName.includes('get')) {
      return 'compact';
    }

    // Rounded for action/processing nodes
    if (nodeName.includes('process') || nodeName.includes('transform') || nodeName.includes('api') ||
        nodeName.includes('http') || nodeName.includes('query') || nodeName.includes('search') ||
        nodeName.includes('generate') || nodeName.includes('create')) {
      return 'rounded';
    }

    // Default to rectangle
    return 'rectangle';
  };

  // Determine node size based on complexity
  const getNodeSize = () => {
    const inputCount = nodeSchema.inputs.length;
    const outputCount = nodeSchema.outputs.length;
    const paramCount = nodeSchema.parameters.length;
    const complexity = inputCount + outputCount + paramCount;

    // Override with explicit width/height if provided
    if (styling.width && styling.height) {
      return { width: styling.width, height: styling.height };
    }

    const autoShape = getAutoShape();

    // Circle nodes have fixed size
    if (autoShape === 'circle') {
      return { width: 120, height: 120, size: 'medium' };
    }

    // Diamond nodes are square
    if (autoShape === 'diamond') {
      return { width: 100, height: 100, size: 'small' };
    }

    // Determine size based on complexity or node type
    const nodeName = nodeSchema.name.toLowerCase();
    const nodeType = nodeSchema.node_id.toLowerCase();

    // Conditional nodes - compact and small
    if (nodeName.includes('condition') || nodeName.includes('if') || nodeName.includes('switch') || nodeType.includes('condition')) {
      return { width: 160, height: 80, size: 'small' };
    }

    // Simple utility nodes - small
    if (complexity <= 3 || nodeName.includes('input') || nodeName.includes('output') || nodeName.includes('variable')) {
      return { width: 180, height: 90, size: 'small' };
    }

    // Medium complexity - default size
    if (complexity <= 6) {
      return { width: 220, height: 100, size: 'medium' };
    }

    // Complex nodes - larger
    return { width: 280, height: 120, size: 'large' };
  };

  // Determine shape-based styling with enhanced options
  const getShapeClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out relative overflow-visible';
    const nodeSize = getNodeSize();
    const autoShape = getAutoShape();

    switch (autoShape) {
      case 'circle':
        return `${baseClasses} rounded-full flex items-center justify-center node-shape-circle`;
      case 'rounded':
        return `${baseClasses} rounded-2xl node-shape-rounded`;
      case 'hexagon':
        return `${baseClasses} node-shape-hexagon`;
      case 'diamond':
        return `${baseClasses} node-shape-diamond`;
      case 'pill':
        return `${baseClasses} rounded-full node-shape-pill`;
      case 'compact':
        return `${baseClasses} rounded-lg node-shape-compact`;
      case 'custom':
        return baseClasses;
      case 'rectangle':
      default:
        return `${baseClasses} ${nodeSize.size === 'small' ? 'rounded-lg' : nodeSize.size === 'large' ? 'rounded-2xl' : 'rounded-xl'}`;
    }
  };

  // Render custom HTML template if provided
  const renderCustomHTML = () => {
    if (!styling.html_template) return null;

    // Replace placeholders with actual values
    let html = styling.html_template
      .replace(/\{\{nodeName\}\}/g, nodeSchema.name)
      .replace(/\{\{nodeDescription\}\}/g, nodeSchema.description)
      .replace(/\{\{subtitle\}\}/g, styling.subtitle || '')
      .replace(/\{\{icon\}\}/g, styling.icon || '')
      .replace(/\{\{isExecuting\}\}/g, isExecuting ? 'executing' : '')
      .replace(/\{\{selected\}\}/g, selected ? 'selected' : '')
      .replace(/\{\{node_id\}\}/g, nodeId || ''); // Add node_id replacement

    // Replace parameter placeholders
    Object.entries(parameters).forEach(([key, value]) => {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value || ''));
    });

    // Replace data placeholders (like response_content from execution results)
    if (data.response_content) {
      html = html.replace(/\{\{response_content\}\}/g, String(data.response_content || ''));
    }

    // Replace node_data placeholders (custom runtime data like debug_content)
    // Handle both simple {{key}} and {{key or 'default'}} syntax
    // First, handle {{key or 'default'}} syntax for all node_data keys
    const orPattern = /\{\{(\w+)\s+or\s+['"]([^'"]+)['"]\}\}/g;
    html = html.replace(orPattern, (match, key, defaultValue) => {
      if (data.node_data && key in data.node_data) {
        const value = data.node_data[key];
        let stringValue: string;
        if (typeof value === 'string') {
          stringValue = value;
        } else if (value === null || value === undefined) {
          return defaultValue; // Use default if value is null/undefined
        } else {
          stringValue = JSON.stringify(value, null, 2);
        }
        // Escape HTML entities but preserve newlines (they'll be handled by CSS white-space: pre-wrap)
        const escapedValue = stringValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        return escapedValue || defaultValue;
      }
      return defaultValue; // Use default if key doesn't exist in node_data
    });
    
    // Then handle simple {{key}} placeholders
    if (data.node_data) {
      Object.entries(data.node_data).forEach(([key, value]) => {
        // Skip if already replaced by or pattern
        if (html.includes(`{{${key} or`)) {
          return;
        }
        
        // Handle both string and object values
        let stringValue: string;
        if (typeof value === 'string') {
          stringValue = value;
        } else if (value === null || value === undefined) {
          stringValue = '';
        } else {
          stringValue = JSON.stringify(value, null, 2);
        }
        // Escape HTML entities but preserve newlines
        const escapedValue = stringValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        // Replace simple {{key}} placeholders
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), escapedValue || '');
      });
    }

    // Use a key based on node_data to force re-render when it changes
    const nodeDataKey = data.node_data ? JSON.stringify(data.node_data) : 'no-data';
    
    return <div key={`html-${nodeId}-${nodeDataKey}`} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  
  // Render icon based on type
  const renderIcon = () => {
    if (!styling.icon) return null;

    const nodeSize = getNodeSize();
    const iconSizeClass = nodeSize.size === 'small' ? 'w-5 h-5' : nodeSize.size === 'large' ? 'w-8 h-8' : 'w-6 h-6';
    const textSizeClass = nodeSize.size === 'small' ? 'text-base' : nodeSize.size === 'large' ? 'text-2xl' : 'text-lg';

    // Check if it's an SVG string
    if (styling.icon.startsWith('<svg')) {
      return (
        <div
          className={`${iconSizeClass} flex-shrink-0`}
          dangerouslySetInnerHTML={{ __html: styling.icon }}
        />
      );
    }

    // Check if it's an image URL
    if (styling.icon.startsWith('http') || styling.icon.startsWith('/')) {
      return (
        <img
          src={styling.icon}
          alt="Node icon"
          className={`${iconSizeClass} flex-shrink-0 object-contain`}
        />
      );
    }

    // Treat as emoji or text
    return (
      <div className={`${iconSizeClass} flex-shrink-0 flex items-center justify-center ${textSizeClass}`}>
        {styling.icon}
      </div>
    );
  };

  // If custom HTML template is provided, use it
  if (styling.html_template) {
    // For custom HTML nodes, the outer React Flow node wrapper should be invisible
    const templateContainerStyles: React.CSSProperties = {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      boxShadow: 'none',
      transformOrigin: 'center center'
    };
    return (
      <div 
        className={`${nodeTypeClass} ${styling.css_classes || ''} ${
          isExecuting ? 'ring-2 ring-green-400 ring-opacity-50' : ''
        }`}
        style={{ ...templateContainerStyles }}
        onClick={handleNodeClick}
      >
        {/* Input Handles - Enhanced visibility */}
        <TooltipProvider delayDuration={200}>
          {nodeSchema.inputs.map((input, index) => (
            <Tooltip key={`input-${input.name}`}>
              <TooltipTrigger asChild>
                <div
                  style={{
                    position: 'absolute',
                    left: '-8px',
                    top: `${((index + 1) / (nodeSchema.inputs.length + 1)) * 100}%`,
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    zIndex: 10,
                  }}
                >
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`input-${input.name}`}
                    style={{
                      background: input.required
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      border: input.required ? '2px solid #93c5fd' : '2px solid #9ca3af',
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      left: 0,
                      top: 0,
                      transform: 'none',
                      transformOrigin: 'center center',
                      boxShadow: input.required
                        ? '0 0 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:scale-125"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  <span className="font-medium">{input.name}</span>
                  {input.required ? ' (Required)' : ' (Optional)'}
                  {input.description && `: ${input.description}`}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {/* Custom HTML Content */}
        {renderCustomHTML()}

        {/* Output Handles - Enhanced visibility */}
        {!styling.hide_outputs && (
          <TooltipProvider delayDuration={200}>
            {nodeSchema.outputs.map((output, index) => (
              <Tooltip key={`output-${output.name}`}>
                <TooltipTrigger asChild>
                  <div
                    style={{
                      position: 'absolute',
                      right: '-8px',
                      top: `${((index + 1) / (nodeSchema.outputs.length + 1)) * 100}%`,
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      zIndex: 10,
                    }}
                  >
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`output-${output.name}`}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: '2px solid #6ee7b7',
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        right: 0,
                        top: 0,
                        transform: 'none',
                        transformOrigin: 'center center',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease',
                      }}
                      className="hover:scale-125"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">
                    <span className="font-medium">{output.name}</span>
                    {output.description && `: ${output.description}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        )}

        {/* Delete Button - positioned at top-right corner */}
        {onDelete && nodeId && selected && (
          <div
            className="absolute z-10 pointer-events-auto"
            style={{
              top: '-8px',
              right: '-8px',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(nodeId);
              }}
              className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-out flex items-center justify-center group border border-red-400/40 hover:border-red-300/60 hover:scale-110 active:scale-90"
              style={{
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
              title="Delete node"
            >
              <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Get computed node size
  const nodeSize = getNodeSize();

  // Enhanced node styles with size
  const enhancedNodeStyles = {
    ...nodeStyles,
    width: nodeStyles.width === 'auto' ? `${nodeSize.width}px` : nodeStyles.width,
    minHeight: nodeStyles.height === 'auto' ? `${nodeSize.height}px` : nodeStyles.height,
  };

  // Get node type color
  const getNodeTypeColor = () => {
    const nodeName = nodeSchema.name.toLowerCase();
    const nodeType = nodeSchema.node_id.toLowerCase();
    
    // Input/Output nodes - cyan/teal
    if (nodeName.includes('input') || nodeName.includes('query') || nodeType.includes('query')) {
      return { ring: 'ring-cyan-500/30', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/20' };
    }
    if (nodeName.includes('output') || nodeName.includes('response') || nodeType.includes('response')) {
      return { ring: 'ring-emerald-500/30', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/20' };
    }
    
    // AI/LLM nodes - purple
    if (nodeName.includes('language') || nodeName.includes('llm') || nodeName.includes('ai') || 
        nodeName.includes('model') || nodeType.includes('language_model')) {
      return { ring: 'ring-purple-500/30', border: 'border-purple-500/50', glow: 'shadow-purple-500/20' };
    }
    
    // Search/Retrieval nodes - blue
    if (nodeName.includes('search') || nodeName.includes('retrieval') || nodeName.includes('knowledge') ||
        nodeName.includes('vector') || nodeType.includes('search') || nodeType.includes('retrieval')) {
      return { ring: 'ring-blue-500/30', border: 'border-blue-500/50', glow: 'shadow-blue-500/20' };
    }
    
    // Conditional/Logic nodes - amber
    if (nodeName.includes('condition') || nodeName.includes('if') || nodeName.includes('switch') ||
        nodeName.includes('intent') || nodeType.includes('condition') || nodeType.includes('intent')) {
      return { ring: 'ring-amber-500/30', border: 'border-amber-500/50', glow: 'shadow-amber-500/20' };
    }
    
    // Summary/Transform nodes - indigo
    if (nodeName.includes('summary') || nodeName.includes('transform') || nodeName.includes('process')) {
      return { ring: 'ring-indigo-500/30', border: 'border-indigo-500/50', glow: 'shadow-indigo-500/20' };
    }
    
    // Default - gray
    return { ring: 'ring-gray-500/30', border: 'border-gray-500/50', glow: 'shadow-gray-500/20' };
  };

  const nodeColor = getNodeTypeColor();

  // Default node rendering with backend-configurable styling
  return (
    <div
      className={`${nodeTypeClass} ${styling.css_classes || ''} ${getShapeClasses()}
        ${nodeSize.size === 'small' ? 'px-3 py-2' : nodeSize.size === 'large' ? 'px-6 py-4' : 'px-4 py-3'}
        border-2 relative backdrop-blur-sm
        transition-all duration-200 ease-out
        ${isExecuting ? `ring-4 ring-green-400/60 animate-pulse-subtle ${nodeColor.glow}` : ''}
        ${selected 
          ? `shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${nodeColor.border} scale-[1.05] ${nodeColor.glow}` 
          : `shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] border-[var(--border-color)] hover:scale-[1.02] ${nodeColor.ring}`
        }`}
      style={enhancedNodeStyles}
      onClick={handleNodeClick}
    >
      {/* Execution Indicator - Enhanced pulsing ring */}
      {isExecuting && (
        <div className="absolute -top-2 -left-2 w-5 h-5">
          <div className="absolute w-5 h-5 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute w-5 h-5 bg-green-400/50 rounded-full animate-ping"></div>
        </div>
      )}
      
      {/* Delete Button - positioned at top-right corner */}
      {onDelete && nodeId && selected && (
        <div
          className="absolute z-10 pointer-events-auto"
          style={{
            top: '-8px',
            right: '-8px',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(nodeId);
            }}
            className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-out flex items-center justify-center group border border-red-400/40 hover:border-red-300/60 hover:scale-110 active:scale-90"
            style={{
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            title="Delete node"
          >
            <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Input Handles - Enhanced visibility */}
      <TooltipProvider delayDuration={200}>
        {nodeSchema.inputs.map((input, index) => (
          <Tooltip key={`input-${input.name}`}>
            <TooltipTrigger asChild>
              <div
                style={{
                  position: 'absolute',
                  left: '-8px',
                  top: `${((index + 1) / (nodeSchema.inputs.length + 1)) * 100}%`,
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  zIndex: 10,
                }}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`input-${input.name}`}
                  style={{
                    background: input.required
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    border: input.required ? '2px solid #93c5fd' : '2px solid #9ca3af',
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    left: 0,
                    top: 0,
                    transform: 'none',
                    transformOrigin: 'center center',
                    boxShadow: input.required
                      ? '0 0 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:scale-125"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">
                <span className="font-medium">{input.name}</span>
                {input.required ? ' (Required)' : ' (Optional)'}
                {input.description && `: ${input.description}`}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>

      <div className={`flex items-center gap-2 ${styling.icon_position === 'right' ? 'flex-row-reverse' : ''}`}>
        {/* Icon */}
        {styling.icon && (
          <div className={`flex-shrink-0 ${nodeSize.size === 'small' ? 'w-5 h-5' : nodeSize.size === 'large' ? 'w-8 h-8' : 'w-6 h-6'}`}>
            {renderIcon()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div
            className={`font-bold truncate ${
              nodeSize.size === 'small' ? 'text-sm' : nodeSize.size === 'large' ? 'text-xl' : 'text-lg'
            }`}
            style={{ color: styling.text_color || '#ffffff' }}
            title={nodeSchema.name}
          >
            {nodeSchema.name}
          </div>
          {(styling.subtitle || nodeSize.size !== 'small') && (
            <div
              className={`uppercase tracking-wide truncate ${
                nodeSize.size === 'small' ? 'text-[10px]' : 'text-xs'
              }`}
              style={{ color: styling.text_color ? `${styling.text_color}80` : '#d1d5db' }}
              title={styling.subtitle || 'Node'}
            >
              {styling.subtitle || 'Node'}
            </div>
          )}
        </div>
      </div>

      {/* Output Handles - Enhanced visibility */}
      {!styling.hide_outputs && (
        <TooltipProvider delayDuration={200}>
          {nodeSchema.outputs.map((output, index) => (
            <Tooltip key={`output-${output.name}`}>
              <TooltipTrigger asChild>
                <div
                  style={{
                    position: 'absolute',
                    right: '-8px',
                    top: `${((index + 1) / (nodeSchema.outputs.length + 1)) * 100}%`,
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    zIndex: 10,
                  }}
                >
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`output-${output.name}`}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: '2px solid #6ee7b7',
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      right: 0,
                      top: 0,
                      transform: 'none',
                      transformOrigin: 'center center',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:scale-125"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">
                  <span className="font-medium">{output.name}</span>
                  {output.description && `: ${output.description}`}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      )}
    </div>
  );
}
