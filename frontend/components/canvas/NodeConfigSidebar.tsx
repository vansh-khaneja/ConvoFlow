'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { DeclarativeUIRenderer } from '../node-config-ui';
import NodeConfigStorage from '../../utils/nodeConfigStorage';

interface NodeSchema {
  node_id: string;
  name: string;
  description: string;
  styling: {
    icon?: string;
    border_color?: string;
    text_color?: string;
    html_template?: string;
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

interface NodeConfigSidebarProps {
  nodeId: string | null;
  nodeSchema: NodeSchema | null;
  parameters: Record<string, any>;
  onClose: () => void;
  onSave: (nodeId: string, parameters: Record<string, any>) => void;
  onUpdateParameters?: (nodeId: string, parameters: any) => void;
}

export default function NodeConfigSidebar({
  nodeId,
  nodeSchema,
  parameters: initialParameters,
  onClose,
  onSave,
  onUpdateParameters
}: NodeConfigSidebarProps) {
  const [configParameters, setConfigParameters] = useState<Record<string, any>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load saved parameters when node changes
  useEffect(() => {
    if (nodeId && nodeSchema) {
      // Load from cache first
      const cachedConfig = NodeConfigStorage.loadNodeConfig(nodeId);
      if (cachedConfig && cachedConfig.parameters && Object.keys(cachedConfig.parameters).length > 0) {
        // Use cached config if available
        setConfigParameters(cachedConfig.parameters);
      } else {
        // Fall back to initial parameters
        setConfigParameters(initialParameters || {});
      }
    }
  }, [nodeId, nodeSchema, initialParameters]);

  // Handle parameter changes
  const handleParameterChange = (paramName: string, value: any) => {
    setConfigParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Handle save
  const handleSave = () => {
    if (nodeId) {
      // Save to cache
      NodeConfigStorage.saveNodeConfig(nodeId, configParameters);
      
      // Notify parent
      onSave(nodeId, configParameters);
      
      // Also update via callback if provided
      if (onUpdateParameters) {
        onUpdateParameters(nodeId, configParameters);
      }
    }
  };

  // Handle close
  const handleClose = () => {
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && nodeId) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [nodeId]);

  if (!nodeId || !nodeSchema || !nodeSchema.ui_config) {
    return null;
  }

  const uiConfig = nodeSchema.ui_config;
  const nodeStyling = nodeSchema.styling;

  // Use website theme background color (matching other sidebars)
  const backgroundColor = '#13111C'; // Same as NodeSelectionSidebar and main Sidebar
  
  // Priority: node styling colors > dialog_config colors > defaults
  // Use node's border_color as the primary accent color (for borders, buttons, scrollbar, etc.)
  const borderColor = nodeStyling.border_color || 
                      uiConfig.dialog_config?.border_color || 
                      '#8b5cf6';
  
  // Button colors - prioritize node's border_color, then dialog config, then borderColor
  const primaryButtonColor = nodeStyling.border_color || 
                             uiConfig.dialog_config?.button_primary_color || 
                             borderColor;
  const secondaryButtonColor = uiConfig.dialog_config?.button_secondary_color || '#374151';
  
  // Icon color - prioritize node's border_color, then dialog config icon color, then borderColor
  const iconColor = nodeStyling.border_color || 
                   uiConfig.dialog_config?.icon_color || 
                   borderColor;

  // Extract icon from html_template if styling.icon is empty
  const extractIconFromTemplate = (htmlTemplate: string | undefined): string | null => {
    if (!htmlTemplate) return null;
    const svgMatch = htmlTemplate.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
    return svgMatch ? svgMatch[0] : null;
  };

  // Get node icon
  const nodeIcon = nodeSchema.styling.icon || extractIconFromTemplate(nodeSchema.styling.html_template) || uiConfig.dialog_config?.icon;

  // Render icon
  const renderIcon = (icon: string, size: string = 'w-6 h-6') => {
    if (!icon) return null;

    if (icon.startsWith('<svg')) {
      return (
        <div
          className={`${size} flex-shrink-0`}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }

    if (icon.startsWith('http') || icon.startsWith('/')) {
      return (
        <img
          src={icon}
          alt="Node icon"
          className={`${size} flex-shrink-0 object-contain`}
        />
      );
    }

    return (
      <div className={`${size} flex-shrink-0 flex items-center justify-center text-lg`}>
        {icon}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .config-sidebar-slide-in {
          animation: slide-in-right 0.2s ease-out forwards;
        }
        .config-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .config-sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .config-sidebar-scroll::-webkit-scrollbar-thumb {
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .config-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          transition: all 0.3s ease;
        }
      `}</style>
      <style dangerouslySetInnerHTML={{
        __html: `
          .config-sidebar-scroll[data-node-id="${nodeId}"]::-webkit-scrollbar-thumb {
            background: ${borderColor}40;
          }
          .config-sidebar-scroll[data-node-id="${nodeId}"]::-webkit-scrollbar-thumb:hover {
            background: ${borderColor}60;
          }
        `
      }} />
      <div 
        ref={sidebarRef}
        className="fixed top-16 right-0 w-[420px] h-[calc(100vh-4rem)] flex flex-col z-50 config-sidebar-slide-in"
        style={{ backgroundColor: backgroundColor }}
      >
        {/* Header */}
        <div 
          className="p-5 flex-shrink-0"
          style={{ 
            backgroundColor: backgroundColor,
            borderBottom: `1px solid var(--border-color)`
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            {nodeIcon && (
              <div
                className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200"
                style={{
                  color: iconColor,
                  backgroundColor: `${borderColor}15`,
                  border: `1.5px solid ${borderColor}30`,
                  boxShadow: `0 2px 8px ${borderColor}20`,
                }}
              >
                {renderIcon(nodeIcon, 'w-6 h-6')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate text-[var(--foreground)]">
                {uiConfig.dialog_config?.title || `Configure ${nodeSchema.name}`}
              </h2>
              {uiConfig.dialog_config?.description && (
                <p className="text-xs mt-1 line-clamp-2 text-[var(--text-muted)]">
                  {uiConfig.dialog_config.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="w-10 h-10 rounded-lg flex-shrink-0 transition-all duration-200 hover:scale-110 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto config-sidebar-scroll px-5 py-4"
          data-node-id={nodeId}
          style={{ backgroundColor: backgroundColor }}
        >
          <DeclarativeUIRenderer
            uiConfig={uiConfig}
            parameters={configParameters}
            onParameterChange={handleParameterChange}
            nodeTheme={{
              primaryColor: borderColor,
              backgroundColor: backgroundColor,
              textColor: 'var(--foreground)'
            }}
          />
        </div>

        {/* Footer */}
        <div 
          className="p-5 flex-shrink-0 flex justify-end gap-3"
          style={{ 
            backgroundColor: backgroundColor,
            borderTop: `1px solid var(--border-color)`
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="px-5 py-2 text-sm rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="px-5 py-2 text-sm rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${primaryButtonColor}, ${primaryButtonColor}dd)`,
              color: '#ffffff',
              border: `1.5px solid ${primaryButtonColor}40`,
              boxShadow: `0 4px 12px ${primaryButtonColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            }}
          >
            <span>Save</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
        </div>
      </div>
    </>
  );
}

