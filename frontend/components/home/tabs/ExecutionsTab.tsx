'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { EmptyState } from '@/components/ui-kit/empty-state';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { DeploymentCard } from '@/components/cards/DeploymentCard';
import { useDeploymentActions } from '@/hooks/useDeploymentActions';
import { DeploymentDetailsSidebar } from '@/components/home/DeploymentDetailsSidebar';

export function ExecutionsTab() {
  const {
    deployments,
    loading,
    fetching,
    busyId,
    togglingId,
    deletingId,
    selectedDeployment,
    setBusyId,
    setTogglingId,
    setDeletingId,
    setSelectedDeployment,
    copyEndpoint,
    toggleDeployment,
    undeploy,
    refetchDeployments,
  } = useDeploymentActions();

  // Colors are now handled by DeploymentCard using theme config

  // Show empty state only if no data after loading
  if (!deployments.length) {
    return (
      <EmptyState
        icon={Play}
        title="No executions yet"
        description="Deploy a workflow to get an invoke URL, then trigger it to see executions here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deployed Workflows</h3>
          <p className="text-sm text-[var(--text-muted)]">{deployments.length} workflow{deployments.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetchDeployments()} disabled={loading || fetching} title="Refresh deployments">
          {(loading || fetching) ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
          )}
        </Button>
      </div>

      {/* Deployment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deployments.map((d: any) => (
          <DeploymentCard
            key={d.id}
            deployment={d}
            onClick={() => setSelectedDeployment(d)}
          />
        ))}
      </div>

      {/* Deployment Details Sidebar */}
      {selectedDeployment && (
        <DeploymentDetailsSidebar
          deployment={selectedDeployment}
          onClose={() => setSelectedDeployment(null)}
          onToggle={toggleDeployment}
          onDelete={undeploy}
          onCopyUrl={copyEndpoint}
          togglingId={togglingId}
          deletingId={deletingId}
          refetchDeployments={refetchDeployments}
          onViewDetailedLogs={(deploymentId: string) => {
            setSelectedDeployment(null);
            // Store deployment ID to auto-select in logs tab
            sessionStorage.setItem('selectedDeploymentForLogs', deploymentId);
            // Navigate to logs tab
            window.dispatchEvent(new CustomEvent('navigateToLogs', { detail: { deploymentId } }));
          }}
        />
      )}
    </div>
  );
}

