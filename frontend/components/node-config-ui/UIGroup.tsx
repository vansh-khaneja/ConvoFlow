'use client';

import { useState } from 'react';
import { UIGroup as UIGroupType, UIComponent, NodeTheme } from './types';
import { ComponentRenderer } from './ComponentRenderer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui-kit/tooltip';
import { Info } from 'lucide-react';

interface UIGroupProps {
  group: UIGroupType;
  parameters: Record<string, any>;
  onParameterChange: (name: string, value: any) => void;
  theme?: NodeTheme;
  dynamicOptions?: Record<string, any[]>;
  loadingOptions?: Set<string>;
}

export function UIGroup({
  group,
  parameters,
  onParameterChange,
  theme,
  dynamicOptions,
  loadingOptions
}: UIGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(group.collapsed || false);
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const backgroundColor = theme?.backgroundColor || '#13111C';

  return (
    <div className="space-y-4">
      {/* Group Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold" style={{ color: textColor }}>
              {group.label}
            </h3>
            {group.description && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 p-0.5 rounded-full transition-colors hover:bg-opacity-10"
                            style={{ 
                              color: mutedTextColor,
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = primaryColor + '20';
                              e.currentTarget.style.color = primaryColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = mutedTextColor;
                            }}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{group.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        {group.collapsible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-1 rounded transition-all duration-200"
            style={{ 
              color: mutedTextColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = textColor;
              e.currentTarget.style.backgroundColor = primaryColor + '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = mutedTextColor;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Group Content */}
      {(!group.collapsible || !isCollapsed) && (
        <div
          className="space-y-4 p-5 rounded-lg transition-all duration-200"
          style={{
            // Use #13111C instead of #2a2a2a, or use theme background
            backgroundColor: (() => {
              const bgColor = group.styling?.background as string;
              // Replace #2a2a2a with #13111C for consistency
              if (bgColor === '#2a2a2a' || bgColor === '#2A2A2A') {
                return '#13111C';
              }
              // If no background specified, use theme background with slight opacity
              return bgColor || backgroundColor + '40';
            })(),
            border: group.styling?.border 
              ? `1.5px solid ${group.styling.border}` 
              : `1.5px solid ${primaryColor}20`,
            borderRadius: group.styling?.border_radius || '12px',
            ...Object.fromEntries(
              Object.entries(group.styling || {}).filter(([key]) => 
                key !== 'background' && key !== 'border' && key !== 'border_radius' && key !== 'padding'
              )
            )
          }}
        >
          {group.components.map((component, index) => (
            <div 
              key={component.name} 
              className="space-y-2"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{
                paddingBottom: index < group.components.length - 1 ? '0.5rem' : '0',
                borderBottom: index < group.components.length - 1 
                  ? `1px solid ${primaryColor}10` 
                  : 'none',
                marginBottom: index < group.components.length - 1 ? '1rem' : '0',
              }}
            >
              {component.type !== 'label' && component.type !== 'divider' && component.type !== 'button' && (
                <div className="flex items-center gap-2">
                  <label
                    className="block text-sm font-medium"
                    htmlFor={component.name}
                    style={{
                      color: component.required
                        ? textColor
                        : textColor + '80'
                    }}
                  >
                    {component.label}
                  </label>
                  {component.required && (
                    <span 
                      className="text-xs font-semibold"
                      style={{ color: '#ef4444' }}
                      aria-label="required"
                    >
                      *
                    </span>
                  )}
                  {component.description && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 p-0.5 rounded-full transition-colors hover:bg-opacity-10"
                            style={{ 
                              color: mutedTextColor,
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = primaryColor + '20';
                              e.currentTarget.style.color = primaryColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = mutedTextColor;
                            }}
                          >
                            <Info className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">{component.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
              
              <ComponentRenderer
                component={component}
                value={parameters[component.name] ?? component.default_value}
                onChange={(value) => onParameterChange(component.name, value)}
                theme={theme}
                disabled={component.disabled}
                dynamicOptions={dynamicOptions}
                loadingOptions={loadingOptions}
                parameters={parameters}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

