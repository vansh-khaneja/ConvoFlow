import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-kit/card"
import { Badge } from "@/components/ui-kit/badge"
import { Layers, Copy, Trash2, CheckCircle2, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui-kit/tooltip"
import { useTheme } from "@/hooks/useTheme"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface WorkflowCardProps {
  id: string
  name: string
  created_at: string
  onClick: () => void
  onDelete?: () => void
  onDuplicate?: () => void // Callback to refresh list after duplication
  // Optional: if provided, will use these instead of fetching
  nodeCount?: number
  isDeployed?: boolean
  nodeTypes?: Array<{
    node_id: string
    name: string
    icon?: string
    icon_color?: string
  }>
}

const parseWorkflowDate = (value: string) => {
  if (!value) return new Date();
  const trimmed = value.trim();
  if (!trimmed) return new Date();
  const hasOffset = /([zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);
  const candidate = hasOffset
    ? trimmed
    : trimmed.includes('T')
      ? `${trimmed}Z`
      : `${trimmed.replace(' ', 'T')}Z`;
  const parsed = new Date(candidate);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

export function WorkflowCard({ 
  id, 
  name, 
  created_at, 
  onClick, 
  onDelete,
  onDuplicate,
  nodeCount: propNodeCount,
  isDeployed: propIsDeployed,
  nodeTypes: propNodeTypes
}: WorkflowCardProps) {
  const [metadata, setMetadata] = useState<{
    nodeCount?: number
    lastEdited?: string
    isDeployed?: boolean
    nodeTypes?: Array<{
      node_id: string
      name: string
      icon?: string
      icon_color?: string
    }>
  }>({})
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Use props if provided, otherwise fetch
  const useProps = propNodeCount !== undefined || propIsDeployed !== undefined || propNodeTypes !== undefined
  
  // Theme-aware colors - using centralized theme config
  const { colors } = useTheme();
  const cardBg = colors.cardBg;
  const cardHoverBg = colors.cardHover;
  const borderColor = colors.borderBase;
  const textColor = colors.textPrimary;
  const mutedTextColor = colors.textMuted;
  const lightMutedTextColor = '#9ca3af'; // Keep for specific use case
  const primaryColor = colors.primary;
  const primaryHover = colors.primaryHover;
  const dividerColor = colors.borderBase;

  // Use props if provided, otherwise fetch metadata
  useEffect(() => {
    if (useProps) {
      // Use props directly
      setMetadata({
        nodeCount: propNodeCount,
        isDeployed: propIsDeployed,
        nodeTypes: propNodeTypes
      });
      return;
    }

    // Fetch workflow metadata (node count, last edited, deployment status) - fallback
    const fetchMetadata = async () => {
      if (isLoadingMetadata) return;
      setIsLoadingMetadata(true);
      try {
        // Fetch workflow data and deployment status in parallel
        const [workflowResponse, deploymentResponse] = await Promise.all([
          fetch(`${API_BASE}/api/v1/workflows/${id}`),
          fetch(`${API_BASE}/api/v1/deployments/workflow/${id}`)
        ]);

        let nodeCount = 0;
        let lastEdited = created_at;
        let isDeployed = false;
        let nodeTypes: Array<{ node_id: string; name: string; icon?: string; icon_color?: string }> = [];

        if (workflowResponse.ok) {
          const workflowData = await workflowResponse.json();
          if (workflowData.success && workflowData.data?.data) {
            const workflow = workflowData.data.data;
            const nodes = workflow?.nodes || [];
            nodeCount = nodes.length;
            lastEdited = workflowData.data.updated_at || created_at;
            
            // Extract unique node types with their icons
            const uniqueNodeTypes = new Map<string, { node_id: string; name: string; icon?: string; icon_color?: string }>();
            nodes.forEach((node: any) => {
              if (node.data?.nodeSchema) {
                const schema = node.data.nodeSchema;
                const key = schema.node_id;
                if (!uniqueNodeTypes.has(key)) {
                  const styling = schema.styling || {};
                  uniqueNodeTypes.set(key, {
                    node_id: schema.node_id,
                    name: schema.name,
                    icon: styling.icon,
                    icon_color: styling.border_color || styling.background_color
                  });
                }
              }
            });
            nodeTypes = Array.from(uniqueNodeTypes.values());
          }
        }

        if (deploymentResponse.ok) {
          const deploymentData = await deploymentResponse.json();
          if (deploymentData.success && deploymentData.data) {
            isDeployed = deploymentData.data.is_active === true || deploymentData.data.is_active === 1;
          }
        }

        setMetadata({
          nodeCount,
          lastEdited,
          isDeployed,
          nodeTypes
        });
      } catch (error) {
        // Silently fail - metadata is optional
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, [id, created_at, useProps, propNodeCount, propIsDeployed, propNodeTypes]);

  const createdDate = parseWorkflowDate(created_at)
  const today = new Date()
  const formattedDate = createdDate.toDateString() === today.toDateString()
    ? 'Today'
    : createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
  
  const lastEditedDate = metadata.lastEdited ? parseWorkflowDate(metadata.lastEdited) : null;
  // Only show "Edited" if it's different from created date
  const showEditedDate = lastEditedDate && 
    lastEditedDate.toDateString() !== createdDate.toDateString();
  const formattedLastEdited = showEditedDate
    ? (lastEditedDate.toDateString() === today.toDateString()
        ? 'Today'
        : lastEditedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }))
    : null;

  // Render node icon
  const renderNodeIcon = (icon: string | undefined, nodeName: string, iconColor?: string) => {
    if (!icon) return null;

    const iconColorStyle = iconColor || mutedTextColor;

    // Check if it's an SVG string
    if (icon.startsWith('<svg')) {
      return (
        <div
          className="w-4 h-4 flex-shrink-0 opacity-70 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: icon }}
          style={{ color: iconColorStyle }}
        />
      );
    }

    // Check if it's an image URL
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return (
        <img
          src={icon}
          alt={nodeName}
          className="w-4 h-4 flex-shrink-0 object-contain opacity-70"
        />
      );
    }

    // Treat as emoji or text
    return (
      <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs opacity-70" style={{ color: iconColorStyle }}>
        {icon}
      </div>
    );
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show tick immediately
    setCopySuccess(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/workflows/${id}`);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      
      const data = await response.json();
      const workflow = data.data;
      
      const duplicateResponse = await fetch(`${API_BASE}/api/v1/workflows/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${name} (Copy)`,
          data: workflow.data
        })
      });

      if (duplicateResponse.ok) {
        toast.success('Workflow duplicated successfully');
        // Refresh the workflow list to show the new workflow
        if (onDuplicate) {
          onDuplicate();
        }
        // Keep tick visible for 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } else {
        throw new Error('Failed to duplicate workflow');
      }
    } catch (error) {
      // Hide tick on error
      setCopySuccess(false);
      toast.error('Failed to duplicate workflow');
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-full">
        <Card
          className="cursor-pointer group h-full flex flex-col rounded-[5px] min-h-[160px] overflow-hidden transition-all duration-200 w-full max-w-full"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = cardHoverBg;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = cardBg;
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
          }}
          onClick={onClick}
        >
        <CardHeader className="p-4 pb-2 flex-shrink-0 overflow-hidden">
          <CardTitle 
            className="text-base sm:text-lg font-semibold flex-1 min-w-0 line-clamp-2 leading-tight break-words" 
            style={{ color: textColor }}
          >
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-1 flex-shrink-0 overflow-hidden">
          {/* Primary Metadata - Date and Nodes */}
          <div className="flex items-center gap-2 sm:gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm" style={{ color: mutedTextColor }}>
              <span className="font-medium whitespace-nowrap">{formattedDate}</span>
            </div>
            {metadata.nodeCount !== undefined && (
              <div className="flex items-center gap-2 text-sm" style={{ color: mutedTextColor }}>
                <Layers className="h-[18px] w-[18px] flex-shrink-0" style={{ color: 'currentColor' }} />
                <span className="font-medium whitespace-nowrap">
                  {metadata.nodeCount} {metadata.nodeCount === 1 ? 'node' : 'nodes'}
                </span>
              </div>
            )}
            {/* Deployed Status Indicator - Only show if deployed */}
            {metadata.isDeployed && (
              <div className="ml-auto mr-0 sm:mr-2 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <CheckCircle2 
                        className="h-5 w-5"
                        style={{ 
                          color: colors.success, // Uses theme success color
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deployed</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Node Type Icons and Action Buttons - Always Visible */}
          <div className="flex items-center gap-2 mb-2 mt-4 sm:mt-8 flex-wrap min-w-0">
            {/* Node Type Icons */}
            {metadata.nodeTypes && metadata.nodeTypes.length > 0 && (
              <>
                {metadata.nodeTypes.slice(0, 4).map((nodeType, index) => {
                  const hasIcon = nodeType.icon && nodeType.icon.trim() !== '';
                  return (
                    <Tooltip key={`${nodeType.node_id}-${index}`}>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex items-center justify-center rounded-full overflow-hidden" 
                          style={{ 
                            width: '28px',
                            height: '28px',
                            borderColor: dividerColor,
                            background: cardHoverBg,
                            border: `1px solid ${dividerColor}`
                          }}
                        >
                          {hasIcon ? (
                            renderNodeIcon(nodeType.icon, nodeType.name, nodeType.icon_color)
                          ) : (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                background: nodeType.icon_color || primaryColor,
                                opacity: 0.5
                              }}
                            />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{nodeType.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {metadata.nodeTypes.length > 4 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="flex items-center justify-center rounded-full text-xs font-medium" 
                        style={{ 
                          width: '28px',
                          height: '28px',
                          borderColor: dividerColor,
                          background: cardHoverBg,
                          color: mutedTextColor,
                          border: `1px solid ${dividerColor}`
                        }}
                      >
                        +{metadata.nodeTypes.length - 4}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{metadata.nodeTypes.slice(4).map(n => n.name).join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
            
            {/* Divider between node icons and action buttons */}
            {(metadata.nodeTypes && metadata.nodeTypes.length > 0) && (
              <div 
                className="h-6 w-px"
                style={{ background: dividerColor, opacity: 0.5 }}
              />
            )}

            {/* Action Buttons - Copy and Delete - Show on Hover */}
            <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDuplicate}
                    className="p-2 rounded-[5px] transition-all"
                    style={{
                      color: mutedTextColor,
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!copySuccess) {
                        e.currentTarget.style.color = textColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copySuccess) {
                        e.currentTarget.style.color = mutedTextColor;
                      }
                    }}
                  >
                    {copySuccess ? (
                      <Check className="h-4 w-4" style={{ color: 'currentColor' }} />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Duplicate workflow</TooltipContent>
              </Tooltip>

              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="p-2 rounded-[5px] transition-all"
                      style={{
                        color: '#f87171',
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#f87171';
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Delete workflow</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  )
}
