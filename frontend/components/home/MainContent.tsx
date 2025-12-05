'use client';

import React from 'react';
import { Plus, Key, Layers, Workflow, Play } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-kit/tabs';
import { WorkflowsTab } from './tabs/WorkflowsTab';
import { ExecutionsTab } from './tabs/ExecutionsTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { LogsTab } from './tabs/LogsTab';
import { CredentialsTab } from './tabs/CredentialsTab';

interface MainContentProps {
  userName: string;
  activeTab: string;
}

export function MainContent({ userName, activeTab }: MainContentProps) {
  if (activeTab === 'credentials') {
    return (
      <div className="flex-1 bg-[var(--background)] overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl flex items-center gap-2 sm:gap-3 mb-2">
                  <Key className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex-shrink-0" />
                  <span className="truncate">Credentials</span>
                </h1>
                <p className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg">
                  Manage your API keys and credentials
                </p>
              </div>
            </div>
          </div>

          <CredentialsTab />
        </div>
      </div>
    );
  }

  if (activeTab === 'templates') {
    return (
      <div className="flex-1 bg-[var(--background)] overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl flex items-center gap-2 sm:gap-3 mb-2">
                  <Layers className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex-shrink-0" />
                  <span className="truncate">Templates</span>
                </h1>
                <p className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg">
                  Start with pre-built workflow templates
                </p>
              </div>
            </div>
          </div>

          <TemplatesTab />
        </div>
      </div>
    );
  }

  if (activeTab === 'logs') {
    return <LogsTab />;
  }

  return (
    <div className="flex-1 bg-[var(--background)] overflow-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl flex items-center gap-2 sm:gap-3 mb-2">
                <Workflow className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex-shrink-0" />
                <span className="truncate">Overview</span>
              </h1>
              <p className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg">
                Manage your workflows and executions
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                size="lg" 
                onClick={() => (window.location.href = '/workflow')}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="whitespace-nowrap">Create Workflow</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="workflows" className="space-y-6" id="main-tabs">
          <TabsList className="rounded-[5px]" style={{ backgroundColor: '#211F2D' }}>
            <TabsTrigger value="workflows">
              <Workflow className="h-3 w-3" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="executions">
              <Play className="h-3 w-3" />
              Executions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows">
            <WorkflowsTab userName={userName} />
          </TabsContent>

          <TabsContent value="executions">
            <ExecutionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

