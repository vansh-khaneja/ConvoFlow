'use client';

import { useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useWorkflows, useUpdateWorkflow, useDeleteWorkflow } from './useWorkflowQueries';
import { createWorkflow } from '../api';

export function useWorkflowActions() {
  const { data: workflowsData, isLoading, refetch: refetchWorkflows } = useWorkflows();
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();
  
  const items = workflowsData || [];
  
  const [busy, setBusy] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [sortFilter, setSortFilter] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current filter label
  const getFilterLabel = () => {
    switch (sortFilter) {
      case 'new':
        return 'Newest First';
      case 'old':
        return 'Oldest First';
      case 'name':
        return 'A-Z';
      case 'name-desc':
        return 'Z-A';
      default:
        return 'Newest First';
    }
  };

  // Filter and sort workflows based on search and filter
  const sortedItems = useMemo(() => {
    let filtered = [...items];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }
    
    // Sort based on filter
    switch (sortFilter) {
      case 'old':
        return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'new':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case 'new':
      case 'recent':
      default:
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [items, sortFilter, searchQuery]);

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      const text = await file.text();
      const workflowData = JSON.parse(text);
      
      // Extract name from workflow data or use filename
      const workflowName = workflowData.name || file.name.replace('.json', '') || 'Imported Workflow';
      const workflowDataJson = workflowData.data || workflowData;
      
      // Save to backend
      const payload = { name: workflowName, data: workflowDataJson };
      const response = await createWorkflow(payload);
      
      if (!response.success) throw new Error('Failed to save workflow');
      
      // Load the workflow in the editor
      if (response.data?.id) {
        window.location.href = `/workflow?id=${response.data.id}`;
      } else {
        await refetchWorkflows();
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load workflow. Please check the file format.');
    } finally {
      setBusy(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRename = async (id: string, newName: string) => {
    await refetchWorkflows();
  };

  const handleRenameOld = async () => {
    if (!renameId || !renameName.trim()) return;
    try {
      setBusy(true);
      await updateWorkflow.mutateAsync({
        workflowId: renameId,
        data: { name: renameName.trim() }
      });
      setShowRename(false);
      setRenameId(null);
      setRenameName('');
      await refetchWorkflows();
      toast.success('Workflow renamed successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to rename workflow');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setBusy(true);
      await deleteWorkflow.mutateAsync(deleteId);
      // No need to refetch - the mutation already invalidates queries and triggers refetch
      toast.success('Workflow deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setDeleteName('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete workflow');
    } finally {
      setBusy(false);
    }
  };

  return {
    // State
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
    
    // Setters
    setShowRename,
    setRenameId,
    setRenameName,
    setShowDeleteConfirm,
    setDeleteId,
    setDeleteName,
    setSortFilter,
    setSearchQuery,
    
    // Actions
    handleFileLoad,
    handleRename,
    handleRenameOld,
    handleDeleteClick,
    handleDeleteConfirm,
    getFilterLabel,
    refetchWorkflows,
  };
}

