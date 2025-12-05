'use client';

import { useEffect, useState } from 'react';
import { useDeploymentStatus } from '@/hooks/useWorkflowQueries';

interface DeploymentStatus {
  isDeployed: boolean;
  hasChanges: boolean;
}

export function useWorkflowDeployment(workflowId: string | null) {
  const { data: deploymentData } = useDeploymentStatus(workflowId);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Update deployment status from React Query data
  useEffect(() => {
    if (deploymentData) {
      setDeploymentStatus({
        isDeployed: true,
        hasChanges: deploymentData.has_changes || false
      });
    } else if (deploymentData === null) {
      setDeploymentStatus({ isDeployed: false, hasChanges: false });
    }
  }, [deploymentData]);

  // Optimistically update deployment status immediately (no waiting for API)
  const updateDeploymentStatusImmediately = () => {
    setDeploymentStatus({
      isDeployed: true,
      hasChanges: false
    });
  };

  return {
    deploymentStatus,
    isDeploying,
    setIsDeploying,
    updateDeploymentStatusImmediately,
    setDeploymentStatus
  };
}

