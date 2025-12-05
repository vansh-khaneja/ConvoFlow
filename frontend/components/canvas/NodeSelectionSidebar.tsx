'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X, Folder, Zap, Database, MessageSquare, Code, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-kit/select';

interface NodeSchema {
  node_id: string;
  name: string;
  description: string;
  category?: string;
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
}

interface NodesData {
  nodes: string[];
  schemas: Record<string, NodeSchema>;
  total_count: number;
}

interface NodeSelectionSidebarProps {
  nodes: NodesData;
  onNodeSelect: (nodeType: string) => void;
  onClose: () => void;
  existingNodes?: Array<{ id: string; data?: any }>; // Current nodes in the workflow
  // Guided tour for QueryNode and ResponseNode
  showQueryTourHint?: boolean;
  showResponseTourHint?: boolean;
  onQueryTourSkip?: () => void;
  onQueryTourNext?: () => void;
  onResponseTourSkip?: () => void;
  onResponseTourNext?: () => void;
}

export default function NodeSelectionSidebar({
  nodes,
  onNodeSelect,
  onClose,
  existingNodes = [],
  showQueryTourHint = false,
  showResponseTourHint = false,
  onQueryTourSkip,
  onQueryTourNext,
  onResponseTourSkip,
  onResponseTourNext
}: NodeSelectionSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Detect if a Query node already exists in the canvas
  const hasQueryNode = useMemo(() => {
    return existingNodes.some(existingNode => {
      const schema = existingNode.data?.nodeSchema;
      const nodeId = schema?.node_id?.toLowerCase() || '';
      return nodeId === 'querynode' || (nodeId.includes('query') && !nodeId.includes('textinput'));
    });
  }, [existingNodes]);

  // Detect if a Response node already exists in the canvas
  const hasResponseNode = useMemo(() => {
    return existingNodes.some(existingNode => {
      const schema = existingNode.data?.nodeSchema;
      const nodeId = schema?.node_id?.toLowerCase() || '';
      return nodeId.includes('response');
    });
  }, [existingNodes]);

  // Get all nodes as a flat list
  const allNodes = useMemo(() => {
    return Object.values(nodes.schemas);
  }, [nodes.schemas]);

  // Get all unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    allNodes.forEach(node => {
      const category = node.category || 'Other';
      categorySet.add(category);
    });
    return Array.from(categorySet).sort();
  }, [allNodes]);

  // Filter nodes based on category and search
  const filteredNodes = useMemo(() => {
    let filtered = allNodes;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(node => {
        const nodeCategory = node.category || 'Other';
        return nodeCategory === selectedCategory;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(node =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.node_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [allNodes, selectedCategory, searchTerm]);

  // If tour asks for QueryNode but one is already present, auto-complete this step
  useEffect(() => {
    if (showQueryTourHint && hasQueryNode && onQueryTourNext) {
      onQueryTourNext();
    }
  }, [showQueryTourHint, hasQueryNode, onQueryTourNext]);

  // If tour asks for ResponseNode but one is already present, auto-complete this step
  useEffect(() => {
    if (showResponseTourHint && hasResponseNode && onResponseTourNext) {
      onResponseTourNext();
    }
  }, [showResponseTourHint, hasResponseNode, onResponseTourNext]);

  // Extract icon from html_template if styling.icon is empty
  const extractIconFromTemplate = (htmlTemplate: string | undefined): string | null => {
    if (!htmlTemplate) return null;
    // Look for SVG tag in the template
    const svgMatch = htmlTemplate.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
    return svgMatch ? svgMatch[0] : null;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('language') || categoryLower.includes('llm') || categoryLower.includes('model')) {
      return <Zap className="w-3.5 h-3.5" />;
    } else if (categoryLower.includes('knowledge') || categoryLower.includes('vector') || categoryLower.includes('database')) {
      return <Database className="w-3.5 h-3.5" />;
    } else if (categoryLower.includes('response') || categoryLower.includes('message') || categoryLower.includes('chat')) {
      return <MessageSquare className="w-3.5 h-3.5" />;
    } else if (categoryLower.includes('web') || categoryLower.includes('search')) {
      return <Globe className="w-3.5 h-3.5" />;
    } else if (categoryLower.includes('code') || categoryLower.includes('script')) {
      return <Code className="w-3.5 h-3.5" />;
    } else if (categoryLower.includes('config') || categoryLower.includes('setting')) {
      return <Settings className="w-3.5 h-3.5" />;
    }
    return <Folder className="w-3.5 h-3.5" />;
  };

  // Render icon based on type with color support
  const renderIcon = (icon: string, size: string = 'w-5 h-5', color?: string) => {
    if (!icon) return null;

    // Check if it's an SVG string
    if (icon.startsWith('<svg')) {
      // Apply color to SVG by replacing stroke/fill attributes or adding currentColor
      let coloredIcon = icon;
      if (color) {
        // Replace stroke colors with the node's border color
        coloredIcon = coloredIcon.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
        coloredIcon = coloredIcon.replace(/stroke='[^']*'/g, `stroke="${color}"`);
        // Replace fill colors (but keep "none" as is)
        coloredIcon = coloredIcon.replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);
        coloredIcon = coloredIcon.replace(/fill='(?!none)[^']*'/g, `fill="${color}"`);
        // If no stroke/fill found, add currentColor
        if (!coloredIcon.includes('stroke=') && !coloredIcon.includes('fill=')) {
          coloredIcon = coloredIcon.replace('<svg', `<svg style="color: ${color}"`);
        }
      }
      
      return (
        <div 
          className={`${size} flex-shrink-0 opacity-75`}
          style={color ? { color } : {}}
          dangerouslySetInnerHTML={{ __html: coloredIcon }}
        />
      );
    }
    
    // Check if it's an image URL
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return (
        <img 
          src={icon} 
          alt="Node icon" 
          className={`${size} flex-shrink-0 object-contain rounded opacity-75`}
        />
      );
    }
    
    // Treat as emoji or text
    return (
      <div 
        className={`${size} flex-shrink-0 flex items-center justify-center text-sm opacity-75`}
        style={color ? { color } : {}}
      >
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
        .sidebar-slide-in {
          animation: slide-in-right 0.2s ease-out forwards;
        }
        .node-sidebar-scroll::-webkit-scrollbar {
          display: none;
        }
        .node-sidebar-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .node-item-hover {
          transition: all 0.2s ease;
          position: relative;
        }
        .node-item-hover:hover:not(.node-item-selected) {
          background-color: var(--card-hover);
          transform: translateX(2px);
        }
        .node-item-hover.node-item-selected {
          background-color: var(--card-hover);
          border-left: 3px solid var(--primary);
        }
        .node-item-hover > * {
          position: relative;
          z-index: 1;
        }
        .node-divider {
          height: 1px;
          background: var(--border-color);
          opacity: 0.3;
          margin: 0.5rem 0;
        }
      `}</style>
      <div className="fixed top-16 right-0 w-96 h-[calc(100vh-4rem)] flex flex-col z-40 sidebar-slide-in" style={{ backgroundColor: '#13111C' }}>
      {/* Header */}
      <div className="p-5" style={{ backgroundColor: '#13111C', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-[5px]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
          
          {/* Title */}
          <h2 className="text-lg font-semibold text-[var(--foreground)] flex-1">Add Node</h2>
          
          {/* Category Filter - Using Select component */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 w-[140px] text-xs border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)]">
              <SelectValue>
                <div className="flex items-center gap-1.5">
                  {selectedCategory === 'all' ? (
                    <Folder className="w-3.5 h-3.5" />
                  ) : (
                    <span className="flex-shrink-0">{getCategoryIcon(selectedCategory)}</span>
                  )}
                  <span>{selectedCategory === 'all' ? 'All' : selectedCategory}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="min-w-[140px]">
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>All</span>
                </div>
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0">{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Type to filter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="bg-[var(--card-bg)] border-[var(--border-color)] rounded-[5px]"
          />
        </div>
      </div>

      {/* Node List */}
      <div className={`flex-1 overflow-y-auto node-sidebar-scroll`} style={{ backgroundColor: '#13111C' }}>
        <div className="p-3">
          {filteredNodes.map((node, index) => {
            const isSelected = selectedNodeId === node.node_id;
            const nodeCategory = node.category || 'Other';
            const showCategoryBadge = selectedCategory !== 'all' || searchTerm.length > 0;

            // Determine if this is the QueryNode or ResponseNode for the tutorial
            const nodeIdLower = node.node_id.toLowerCase();
            const isQueryNodeForTour = nodeIdLower === 'querynode' || (nodeIdLower.includes('query') && !nodeIdLower.includes('textinput'));
            const isResponseNodeForTour = nodeIdLower.includes('response');
            
            // Check if this is a response node and one already exists
            const isResponseNode = node.node_id.toLowerCase().includes('response');
            const hasResponseNode = existingNodes.some(existingNode => {
              const schema = existingNode.data?.nodeSchema;
              return schema?.node_id?.toLowerCase().includes('response');
            });
            const isDisabled = isResponseNode && hasResponseNode;
            
            return (
              <div key={node.node_id}>
                {/* Tour hint appears right before QueryNode item */}
                {showQueryTourHint && !hasQueryNode && isQueryNodeForTour && (
                  <div className="relative mb-3 px-3 py-2.5 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 text-xs shadow-lg">
                    {/* Arrow pointing down to QueryNode */}
                    <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[var(--primary)]/40"></div>
                    <p className="font-semibold text-[var(--foreground)] mb-1">
                      Step 2 · Click this QueryNode
                    </p>
                    <p className="text-[var(--text-muted)] mb-2">
                      This node receives user input in your chatbot workflow.
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={onQueryTourSkip}
                        className="text-[11px] text-[var(--text-muted)] hover:text-[var(--foreground)]"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
                {/* Tour hint appears right before ResponseNode item */}
                {showResponseTourHint && !hasResponseNode && isResponseNodeForTour && (
                  <div className="relative mb-3 px-3 py-2.5 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 text-xs shadow-lg">
                    {/* Arrow pointing down to ResponseNode */}
                    <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[var(--primary)]/40"></div>
                    <p className="font-semibold text-[var(--foreground)] mb-1">
                      Step 4 · Click this ResponseNode
                    </p>
                    <p className="text-[var(--text-muted)] mb-2">
                      This node sends the final response back to the user.
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={onResponseTourSkip}
                        className="text-[11px] text-[var(--text-muted)] hover:text-[var(--foreground)]"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
                <div
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedNodeId(node.node_id);
                    onNodeSelect(node.node_id);

                    // If this is the guided QueryNode or ResponseNode, advance the tour
                    if (isQueryNodeForTour && onQueryTourNext) {
                      onQueryTourNext();
                    }
                    if (isResponseNodeForTour && onResponseTourNext) {
                      onResponseTourNext();
                    }
                  }}
                  className={`relative flex items-start gap-3 px-4 py-3.5 rounded-[5px] node-item-hover ${
                    isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                  } ${
                    isSelected 
                      ? 'node-item-selected' 
                      : ''
                  } ${
                    (showQueryTourHint && !hasQueryNode && isQueryNodeForTour) ||
                    (showResponseTourHint && !hasResponseNode && isResponseNodeForTour)
                      ? 'ring-2 ring-[var(--primary)]/50 ring-offset-2 ring-offset-[#13111C]'
                      : ''
                  }`}
                >
                  {/* Icon */}
                  {(() => {
                    // Get icon - use styling.icon, or extract from html_template if empty
                    const nodeIcon = node.styling.icon || extractIconFromTemplate(node.styling.html_template);
                    if (!nodeIcon) return null;
                    
                    // Get the node's border color for icon coloring, but make it more muted
                    const iconColor = node.styling.border_color || node.styling.text_color || undefined;
                    
                    return (
                      <div className="flex-shrink-0 mt-0.5 flex items-center justify-center">
                        {renderIcon(nodeIcon, 'w-5 h-5', iconColor)}
                      </div>
                    );
                  })()}
                  
                  {/* Node Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-[var(--foreground)] text-sm">
                        {node.name}
                      </h3>
                      {isDisabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--card-bg)] rounded-[5px] border border-[var(--border-color)]">
                          Already added
                        </span>
                      )}
                      {showCategoryBadge && !isDisabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--card-bg)] rounded-[5px] border border-[var(--border-color)]">
                          {getCategoryIcon(nodeCategory)}
                          {nodeCategory}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-normal leading-relaxed line-clamp-2 opacity-80">
                      {node.description}
                    </p>
                    {isDisabled && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-1 italic">
                        Only one Response Node is allowed per workflow
                      </p>
                    )}
                  </div>
                </div>
                {/* Divider between nodes (except last) */}
                {index < filteredNodes.length - 1 && (
                  <div className="node-divider mx-4" />
                )}
              </div>
            );
          })}

          {/* No Results */}
          {filteredNodes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[var(--card-bg)] flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">No nodes found</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-xs">
                Try adjusting your search terms or browse all available nodes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
