'use client';

import React from 'react';
import { Search, Upload, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-kit/card';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui-kit/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-kit/select';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { WorkflowCard } from '@/components/cards/WorkflowCard';
import { useWorkflowActions } from '@/hooks/useWorkflowActions';

export function WorkflowsTab({ userName }: { userName: string }) {
  const {
    items,
    isLoading,
    busy,
    showRename,
    renameId,
    renameName,
    showDeleteConfirm,
    deleteId,
    deleteName,
    sortFilter,
    searchQuery,
    sortedItems,
    fileInputRef,
    setShowRename,
    setRenameId,
    setRenameName,
    setShowDeleteConfirm,
    setDeleteId,
    setDeleteName,
    setSortFilter,
    setSearchQuery,
    handleFileLoad,
    handleRename,
    handleRenameOld,
    handleDeleteClick,
    handleDeleteConfirm,
    getFilterLabel,
    refetchWorkflows,
  } = useWorkflowActions();

  // Show empty state only if no data after loading
  if (!items.length) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
              <User className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <CardTitle className="text-2xl">Welcome, {userName}!</CardTitle>
            <CardDescription>Get started by creating your first workflow</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileLoad}
                className="hidden"
                id="workflow-file-input"
              />
              <Button
                onClick={() => fileInputRef.current?.click()} 
                size="lg"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" style={{ color: 'currentColor' }} />
                    Load Workflow
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Responsive Layout */}
      <div className="space-y-4">
        {/* Title and Count */}
        <div>
          <h3 className="text-lg font-semibold mb-1">Saved Workflows</h3>
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] flex-wrap">
            <span>{sortedItems.length} Workflow{sortedItems.length !== 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">|</span>
            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-[var(--text-muted)] text-sm focus:ring-0 hover:text-[var(--foreground)] w-auto min-w-[120px]">
                <SelectValue>
                  <span>{getFilterLabel()}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest First</SelectItem>
                <SelectItem value="old">Oldest First</SelectItem>
                <SelectItem value="name">A-Z</SelectItem>
                <SelectItem value="name-desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Search and Load Button - Stack on mobile, side by side on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex-1 w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="bg-[var(--card-bg)] border-[var(--border-color)] rounded-[5px] w-full"
            />
          </div>
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileLoad}
              className="hidden"
              id="workflow-file-input-list"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={busy}
              className="w-full sm:w-auto"
            >
              {busy ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Load Workflow
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {sortedItems.map((w: any) => (
          <WorkflowCard
            key={w.id}
            id={w.id}
            name={w.name}
            created_at={w.created_at}
            onClick={() => {
              window.location.href = `/workflow?id=${w.id}`;
            }}
            onRename={handleRename}
            onDelete={() => handleDeleteClick(w.id, w.name)}
            onDuplicate={refetchWorkflows}
            nodeCount={w.node_count}
            isDeployed={w.is_deployed}
            nodeTypes={w.node_types}
          />
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Workflow</DialogTitle>
            <DialogDescription>
              Enter a new name for your workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Workflow Name</Label>
              <Input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="My Workflow"
                className="mt-1.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameId) {
                    handleRenameOld();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRename(false)}>
              Cancel
            </Button>
            <Button disabled={busy || !renameName.trim()} onClick={handleRenameOld}>
              {busy && <LoadingSpinner size="sm" className="mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <DialogTitle>Delete Workflow</DialogTitle>
                <DialogDescription>
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[var(--text-muted)]">
              Are you sure you want to delete <span className="font-medium text-[var(--foreground)]">&quot;{deleteName}&quot;</span>? This will permanently remove the workflow and all its data.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteId(null);
                setDeleteName('');
              }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={busy}
            >
              {busy && <LoadingSpinner size="sm" className="mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

