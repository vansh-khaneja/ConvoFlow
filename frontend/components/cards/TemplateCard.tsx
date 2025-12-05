'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-kit/card';
import { Badge } from '@/components/ui-kit/badge';
import { Layers } from 'lucide-react';
import { Template } from '@/hooks/useWorkflowQueries';
import { useTheme } from '@/hooks/useTheme';

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onPreview: (template: Template) => void;
}

export function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const { colors } = useTheme();
  const cardBg = colors.cardBg;
  const cardHoverBg = colors.cardHover;
  const borderColor = colors.borderBase;
  const textColor = colors.textPrimary;
  const mutedTextColor = colors.textMuted;

  const nodeCount = template.workflow.nodes.length;
  const edgeCount = template.workflow.edges.length;

  return (
    <Card
      className="cursor-pointer group h-full flex flex-col rounded-[5px] overflow-hidden transition-all duration-200"
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
      onClick={() => onUse(template)}
    >
      <CardHeader className="p-4 pb-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle 
            className="text-lg font-semibold flex-1 min-w-0 line-clamp-2 leading-tight" 
            style={{ color: textColor, fontSize: '17px' }}
          >
            {template.name}
          </CardTitle>
          {template.difficulty && (
            <Badge 
              variant="outline"
              className="text-xs capitalize flex-shrink-0"
              style={{
                color: template.difficulty === 'easy' ? '#22C55E' : 
                       template.difficulty === 'medium' ? '#f59e0b' : 
                       '#ef4444',
                borderColor: template.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.3)' : 
                            template.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.3)' : 
                            'rgba(239, 68, 68, 0.3)'
              }}
            >
              {template.difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-1 flex-shrink-0">
        {/* Description */}
        <CardDescription 
          className="line-clamp-2 mb-3"
          style={{ color: mutedTextColor, fontSize: '14px' }}
        >
          {template.description}
        </CardDescription>

        {/* Metadata - Nodes and Connections */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" style={{ color: mutedTextColor, fontSize: '14px' }}>
            <Layers className="h-[18px] w-[18px]" style={{ color: 'currentColor' }} />
            <span className="font-medium">
              {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
            </span>
          </div>
          <div className="flex items-center gap-2" style={{ color: mutedTextColor, fontSize: '14px' }}>
            <span className="font-medium">
              {edgeCount} {edgeCount === 1 ? 'connection' : 'connections'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

