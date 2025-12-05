'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { EmptyState } from '@/components/ui-kit/empty-state';
import { TemplateCard } from '@/components/cards/TemplateCard';
import { useTemplates } from '@/hooks/useWorkflowQueries';
import { getTemplate } from '@/api';
import { toast } from 'sonner';

export function TemplatesTab() {
  const { data: templates = [], isLoading: loading } = useTemplates();

  const handleUseTemplate = async (template: any) => {
    try {
      // Fetch the template data without creating a workflow
      const result = await getTemplate(template.category);

      if (result) {
        const workflowData = result.workflow || {};
        
        // Store template data in sessionStorage
        sessionStorage.setItem('template_data', JSON.stringify({
          name: workflowData.name || template.name,
          nodes: workflowData.nodes || [],
          edges: workflowData.edges || []
        }));
        
        // Navigate to workflow builder with template parameter (no ID yet)
        toast.success('Template loaded! Click Save to create your workflow.');
        window.location.href = `/workflow?template=${encodeURIComponent(template.category)}`;
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  };

  // Show empty state only if no data after loading
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No templates available"
        description="Templates will appear here once they are added to the system."
      />
    );
  }

  const handlePreview = (template: any) => {
    // Preview functionality - could open a dialog or navigate to preview
    toast.info(`Preview: ${template.name}`, {
      description: template.description || 'No description available'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{templates.length} template{templates.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => (
          <TemplateCard
            key={template.category}
            template={template}
            onUse={handleUseTemplate}
            onPreview={handlePreview}
          />
        ))}
      </div>
    </div>
  );
}

