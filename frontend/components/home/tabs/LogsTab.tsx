'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Activity } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-kit/select';
import { EmptyState } from '@/components/ui-kit/empty-state';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { useDeployments, useDeploymentLogs } from '@/hooks/useWorkflowQueries';
import { formatDateTime } from '@/lib/dateUtils';

export function LogsTab() {
  // Fetch deployments with stale-while-revalidate
  const { data: deploymentsData, isLoading: loadingDeployments } = useDeployments();
  const deployments = deploymentsData || [];
  
  const [selectedDeployment, setSelectedDeployment] = useState<string>('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const logsPerPage = 10;

  // Reset to first page when deployment changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedDeployment]);

  // Fetch logs for selected deployment with pagination
  const offset = currentPage * logsPerPage;
  const { data: logsData, isLoading: loadingLogs, isFetching: fetchingLogs, refetch: refetchLogs } = useDeploymentLogs(selectedDeployment, logsPerPage, offset);
  const logs = (logsData?.logs || []);
  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / logsPerPage);

  // Check for deployment ID from sessionStorage (set when navigating from sidebar)
  useEffect(() => {
    const deploymentId = sessionStorage.getItem('selectedDeploymentForLogs');
    if (deploymentId && deployments.length > 0) {
      // Verify the deployment exists in the list
      const deploymentExists = deployments.some((dep: any) => dep.id === deploymentId);
      if (deploymentExists) {
        setSelectedDeployment(deploymentId);
        sessionStorage.removeItem('selectedDeploymentForLogs'); // Clear after use
        return; // Don't auto-select first deployment if we found one from sessionStorage
      }
    }
    // Auto-select first deployment when deployments load (if no deployment from sessionStorage)
    if (deployments.length > 0 && !selectedDeployment) {
      setSelectedDeployment(deployments[0].id);
    }
  }, [deployments, selectedDeployment]);

  const refreshLogs = () => {
    if (selectedDeployment) {
      refetchLogs();
    }
  };

  const formatJson = (value: unknown) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  };

  return (
    <div className="flex-1 bg-[var(--background)] overflow-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl flex items-center gap-2 sm:gap-3 mb-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex-shrink-0" />
                <span className="truncate">Logs</span>
              </h1>
              <p className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg">
                Inspect invocation history for your deployed workflows.
              </p>
            </div>
          </div>
        </div>

        {deployments.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No logs yet"
            description="Deploy and trigger a workflow to generate logs."
          />
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {/* Deployment Selector and Refresh */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Select value={selectedDeployment} onValueChange={setSelectedDeployment}>
                    <SelectTrigger
                      className="w-full sm:w-64 bg-[var(--card-bg)] border-[var(--border-color)]"
                      disabled={loadingLogs || deployments.length === 0}
                    >
                      <SelectValue placeholder="Select deployment" />
                    </SelectTrigger>
                    <SelectContent>
                      {deployments.map((dep: any) => (
                        <SelectItem key={dep.id} value={dep.id}>
                          {(dep.name || 'Untitled')} • {dep.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refreshLogs}
                    disabled={!selectedDeployment || loadingLogs || fetchingLogs}
                    title="Refresh logs"
                    className="flex-shrink-0"
                  >
                    {(loadingLogs || fetchingLogs) ? (
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
                <div className="text-xs sm:text-sm text-[var(--text-muted)] text-center sm:text-right">
                  {total > 0
                    ? `Showing ${offset + 1}-${Math.min(offset + logs.length, total)} of ${total} log${total !== 1 ? 's' : ''}`
                    : `${logs.length} log${logs.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>

            {logs.length === 0 ? null : (
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[5px] overflow-hidden">
                {/* Desktop Table Header - Hidden on mobile */}
                <div className="hidden lg:grid grid-cols-[140px_80px_1fr_1fr_100px] gap-4 px-4 py-4 border-b border-[var(--border-color)] bg-[var(--card-hover)]">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Time</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Status</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Query</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Response</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Duration</div>
                </div>
                
                {/* Log Entries */}
                <div className="divide-y divide-[var(--border-color)]">
                  {logs.map((log) => {
                    const status = (log.status || 'unknown').toLowerCase();
                    const statusColor =
                      status === 'success'
                        ? 'text-green-400'
                        : status === 'error'
                          ? 'text-red-400'
                          : 'text-[var(--text-muted)]';
                    const statusLabel =
                      status === 'success' ? 'SUCCESS' : status === 'error' ? 'ERROR' : 'UNKNOWN';

                    const queryText = log.request != null ? formatJson(log.request) : '-';
                    const responseText = log.response != null ? formatJson(log.response) : log.error || '-';

                    const isExpanded = expandedLog === log.id;
                    const shouldTruncate = !isExpanded;
                    const truncatedQuery = shouldTruncate && queryText.length > 50 ? `${queryText.substring(0, 50)}...` : queryText;
                    const truncatedResponse = shouldTruncate && responseText.length > 50 ? `${responseText.substring(0, 50)}...` : responseText;

                    return (
                      <div key={log.id}>
                        {/* Mobile Card Layout */}
                        <div className="lg:hidden">
                          <div
                            className="p-4 hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
                            onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-[var(--text-muted)] mb-1">
                                  {formatDateTime(log.created_at)}
                                </div>
                                <div className={`text-sm font-semibold ${statusColor}`}>
                                  {statusLabel}
                                </div>
                              </div>
                              <div className="text-xs text-[var(--text-muted)] flex-shrink-0">
                                {typeof log.latency_ms === 'number' ? `${Math.round(log.latency_ms)}ms` : '-'}
                              </div>
                            </div>
                            {!isExpanded && (
                              <div className="text-xs text-[var(--text-muted)] mt-2">
                                Tap to view details
                              </div>
                            )}
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-4 bg-[var(--card-hover)] border-t border-[var(--border-color)] space-y-3">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Query</div>
                                <pre className="bg-[var(--card-bg)] rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono text-[var(--foreground)]">
                                  {queryText}
                                </pre>
                              </div>
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Response</div>
                                <pre className={`bg-[var(--card-bg)] rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono ${log.error ? 'text-red-400' : 'text-[var(--foreground)]'}`}>
                                  {responseText}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Desktop Table Layout */}
                        <div
                          className="hidden lg:grid grid-cols-[140px_80px_1fr_1fr_100px] gap-4 px-4 py-3 hover:bg-[var(--card-hover)] transition-colors font-mono text-xs cursor-pointer"
                          onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                        >
                          {/* Time */}
                          <div className="text-[var(--text-muted)]">
                            {formatDateTime(log.created_at)}
                          </div>
                          
                          {/* Status */}
                          <div className={statusColor}>
                            {statusLabel}
                          </div>
                          
                          {/* Query */}
                          <div className="text-[var(--foreground)] overflow-hidden">
                            <pre className="whitespace-pre-wrap break-words text-xs m-0">
                              {truncatedQuery}
                            </pre>
                          </div>
                          
                          {/* Response */}
                          <div className={`overflow-hidden ${log.error ? 'text-red-400' : 'text-[var(--foreground)]'}`}>
                            <pre className="whitespace-pre-wrap break-words text-xs m-0">
                              {truncatedResponse}
                            </pre>
                          </div>
                          
                          {/* Duration */}
                          <div className="text-[var(--text-muted)]">
                            {typeof log.latency_ms === 'number' ? `${Math.round(log.latency_ms)}ms` : '-'}
                          </div>
                        </div>
                        {isExpanded && queryText.length > 100 && (
                          <div className="hidden lg:block px-4 pb-3 bg-[var(--card-hover)] border-t border-[var(--border-color)]">
                            <div className="mt-2">
                              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">Full Query</div>
                              <pre className="bg-[var(--card-bg)] rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono">
                                {queryText}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {total > logsPerPage && (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-[var(--border-color)]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0 || loadingLogs || fetchingLogs}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentPage(i)}
                          disabled={loadingLogs || fetchingLogs}
                          className={`h-2 w-2 rounded-full transition-all ${
                            currentPage === i
                              ? 'bg-[var(--primary)] w-6'
                              : 'bg-[var(--border-color)] hover:bg-[var(--primary)]/50'
                          } ${loadingLogs || fetchingLogs ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1 || loadingLogs || fetchingLogs}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

