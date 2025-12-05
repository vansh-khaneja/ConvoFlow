'use client';

import React, { useState, useEffect } from 'react';
import { Panel } from '@xyflow/react';
import { Save, Download, Upload, Play, UploadCloud, CheckCircle2, RefreshCw, Pencil } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui-kit/tooltip';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { toast } from 'sonner';

interface CanvasToolbarProps {
  onSaveWorkflow: () => void;
  onSaveWorkflowToBackend: () => void;
  onLoadWorkflow: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExecute: () => void;
  onDeployWorkflow?: () => void;
  isExecuting: boolean;
  hasNodes: boolean;
  canExecute?: boolean;
  deploymentStatus?: {
    isDeployed: boolean;
    hasChanges: boolean;
  } | null;
  isDeploying?: boolean;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  workflowName?: string;
  onRename?: (newName: string) => Promise<void>;
  // Run button tour
  showRunTourHint?: boolean;
  onRunTourNext?: () => void;
  onRunTourSkip?: () => void;
}

export default function CanvasToolbar({
  onSaveWorkflow,
  onSaveWorkflowToBackend,
  onLoadWorkflow,
  onExecute,
  onDeployWorkflow,
  isExecuting,
  hasNodes,
  canExecute = true,
  deploymentStatus,
  isDeploying,
  isSaving,
  hasUnsavedChanges,
  workflowName,
  onRename,
  showRunTourHint = false,
  onRunTourNext,
  onRunTourSkip
}: CanvasToolbarProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(workflowName || 'Untitled Workflow');

  // Sync value with workflowName prop
  useEffect(() => {
    const newValue = (workflowName && workflowName.trim()) ? workflowName.trim() : 'Untitled Workflow';
    setValue(newValue);
  }, [workflowName]);

  const handleCommit = async () => {
    const trimmed = value.trim() || 'Untitled Workflow';
    if (trimmed === workflowName) {
      setEditing(false);
      return;
    }

    // Optimistically update the display immediately
    setValue(trimmed);
    setEditing(false);

    if (!onRename) {
      // If no rename handler, just update local state
      return;
    }

    try {
      await onRename(trimmed);
      // The workflowName prop will update via parent state
      // The useEffect will sync the value when workflowName changes
    } catch (error) {
      // Revert on error - useEffect will sync back to workflowName
      toast.error(error instanceof Error ? error.message : 'Failed to rename workflow');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setValue(workflowName || 'Untitled Workflow');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCommit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Save: Ctrl/Cmd + S
      if (isMod && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (hasNodes && !isSaving) {
          onSaveWorkflowToBackend();
        }
        return;
      }

      // Run: Ctrl/Cmd + Enter
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        if (!isExecuting && canExecute) {
          onExecute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNodes, isSaving, isExecuting, canExecute, onSaveWorkflowToBackend, onExecute]);
  const getDeployButtonContent = () => {
    if (isDeploying) {
      return {
        icon: <LoadingSpinner size="sm" />,
        text: 'Deploying...',
        variant: 'ghost' as const,
        title: 'Deployment in progress'
      };
    }
    
    if (!deploymentStatus?.isDeployed) {
      return {
        icon: <UploadCloud className="h-4 w-4" />,
        text: 'Deploy',
        variant: 'ghost' as const,
        title: 'Deploy workflow as an endpoint'
      };
    }
    
    if (deploymentStatus.hasChanges || hasUnsavedChanges) {
      return {
        icon: <RefreshCw className="h-4 w-4" />,
        text: 'Update',
        variant: 'ghost' as const,
        title: 'Deploy changes'
      };
    }
    
    return {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: 'Deployed',
      variant: 'ghost' as const,
      title: 'Workflow is deployed (no changes)'
    };
  };

  const deployButton = getDeployButtonContent();
  return (
    <Panel position="top-center" className="canvas-toolbar-panel" style={{ background: 'transparent', boxShadow: 'none', border: 'none', outline: 'none', padding: 0 }}>
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-6 px-5 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[5px] shadow-md backdrop-blur-sm">

          {/* Workflow Name */}
          <div className="relative group pr-4 border-r border-[var(--border-color)]">
            {editing ? (
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-[var(--card-hover)] border border-[var(--border-color)] rounded px-3 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-w-[200px]"
                placeholder="Workflow name"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded font-medium text-sm bg-transparent text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-all group/btn"
              >
                <span className="relative z-10">{value}</span>
                <Pencil className="h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* File Operations */}
          <div className="flex items-center gap-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSaveWorkflowToBackend}
                  disabled={!hasNodes || isSaving}
                  size="default"
                  className={`h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.4)] transition-all duration-200 ${isSaving ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="ml-2">Save</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{!hasNodes ? "Add nodes to save" : isSaving ? "Saving..." : "Save workflow (Ctrl+S)"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSaveWorkflow}
                  disabled={!hasNodes}
                  className="h-9 w-9"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download workflow</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => document.getElementById('workflow-upload')?.click()}
                  className="h-9 w-9"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load workflow</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Hidden file input */}
          <input
            id="workflow-upload"
            type="file"
            accept=".json"
            onChange={onLoadWorkflow}
            className="hidden"
          />

          {/* Execute Button - Prominent but refined */}
          <div className="relative">
            {showRunTourHint && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full mt-3 w-72 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-3 py-2.5 text-xs shadow-lg z-50">
                {/* Arrow pointing up to Run button */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-[var(--primary)]/40"></div>
                <p className="font-semibold text-[var(--foreground)] mb-1">
                  Step 6 · Run your workflow
                </p>
                <p className="text-[var(--text-muted)] mb-2">
                  Click <span className="font-semibold">Run</span> to test your chatbot workflow.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onRunTourSkip}
                    className="text-[11px] text-[var(--text-muted)] hover:text-[var(--foreground)]"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={onRunTourNext}
                    className="text-[11px] font-medium px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onExecute}
                  disabled={isExecuting || !canExecute}
                  size="default"
                  data-tutorial="run-button"
                  className={`h-9 px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.4)] transition-all duration-200 ${
                    showRunTourHint
                      ? 'ring-2 ring-[var(--primary)]/50 ring-offset-2 ring-offset-transparent'
                      : ''
                  }`}
                >
                {isExecuting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span className="ml-2">Run</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Run workflow (Ctrl+Enter)</p>
            </TooltipContent>
          </Tooltip>
          </div>

          {/* Deploy Button - Minimal */}
          {onDeployWorkflow && (
            <Tooltip>
              <TooltipTrigger asChild>
              <Button
                  onClick={onDeployWorkflow}
                disabled={!canExecute || !hasNodes || isDeploying || (deploymentStatus?.isDeployed && !deploymentStatus?.hasChanges && !hasUnsavedChanges)}
                  size="default"
                  variant={deployButton.variant}
                  className={`h-9 px-4 transition-all ${isDeploying ? 'cursor-not-allowed opacity-50' : ''} ${(deploymentStatus?.hasChanges || hasUnsavedChanges) ? 'text-amber-400 hover:text-amber-300 font-medium' : ''} ${deploymentStatus?.isDeployed && !deploymentStatus?.hasChanges && !hasUnsavedChanges ? 'text-green-400 hover:text-green-300 cursor-not-allowed opacity-80' : ''}`}
                >
                  {deployButton.icon}
                  <span className="ml-2">{deployButton.text}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{deployButton.title}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </Panel>
  );
}
