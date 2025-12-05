'use client';

import React, { useState } from 'react';
import { X, Copy, ExternalLink, Trash2, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Badge } from '@/components/ui-kit/badge';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { useDeploymentLogs } from '@/hooks/useWorkflowQueries';
import { API_BASE } from '@/api';
import { getRelativeTime } from '@/lib/dateUtils';
import { toast } from 'sonner';

interface DeploymentDetailsSidebarProps {
  deployment: any;
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (id: string) => void;
  togglingId: string | null;
  deletingId: string | null;
  refetchDeployments: () => void;
  onViewDetailedLogs: (deploymentId: string) => void;
}

export function DeploymentDetailsSidebar({
  deployment,
  onClose,
  onToggle,
  onDelete,
  onCopyUrl,
  togglingId,
  deletingId,
  refetchDeployments,
  onViewDetailedLogs
}: DeploymentDetailsSidebarProps) {
  const { data: logsData, isLoading: loadingLogs, isFetching: fetchingLogs, refetch: refetchLogs } = useDeploymentLogs(deployment.id, 5, 0);
  const logs = (logsData?.logs || []);
  const total = logsData?.total || 0;

  const [idCopied, setIdCopied] = useState(false);

  // Calculate stats for overview
  const totalInvocations = total;
  const recentLogs = logs.slice(0, 20);
  const latencies = recentLogs.filter(log => typeof log.latency_ms === 'number').map(log => log.latency_ms!);
  const avgLatency = latencies.length > 0 
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;
  const successCount = recentLogs.filter(log => (log.status || '').toLowerCase() === 'success').length;
  const successRate = recentLogs.length > 0 
    ? Math.round((successCount / recentLogs.length) * 100)
    : null;

  const backgroundColor = '#181622';
  const borderColor = '#404040';
  const textColor = '#ffffff';
  const mutedTextColor = '#d1d5db';
  const cardHoverBg = '#13111C';

  const formatJson = (value: unknown) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  };

  const fullUrl = `${API_BASE}/api/v1/deployments/${deployment.id}/invoke`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
        style={{
          width: '100vw',
          height: '100vh',
          zIndex: 40
        }}
      />

      {/* Sidebar */}
      <div
        className="fixed right-0 top-16 w-full sm:w-[500px] h-[calc(100vh-4rem)] z-50 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col backdrop-blur-lg border-t"
        style={{
          backgroundColor: backgroundColor,
          borderLeft: `1px solid ${borderColor}`,
          borderTopColor: borderColor
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0"
          style={{
            borderColor: borderColor
          }}
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate" style={{ color: textColor }}>
              {deployment.name}
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: mutedTextColor }}>
              Deployment Details
            </p>
          </div>
          <Button 
            variant="ghost"
            size="sm" 
            onClick={onClose}
            className="ml-2 sm:ml-4 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 deployment-sidebar-scroll" 
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent' 
          }}
        >
          <style>{`
            .deployment-sidebar-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .deployment-sidebar-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .deployment-sidebar-scroll::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.2);
              border-radius: 10px;
              border: none;
              transition: background 0.2s ease;
            }
            .deployment-sidebar-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.4);
            }
            [data-theme="dark"] .deployment-sidebar-scroll::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.3);
            }
            [data-theme="dark"] .deployment-sidebar-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.5);
            }
          `}</style>
          {/* Status */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: mutedTextColor }}>
              Status
            </label>
            <div className="space-y-2">
              <Badge 
                variant={deployment.is_active ? "status-success" : "status-error"}
                className={`px-3 py-1.5 text-sm ${deployment.is_active ? 'bg-[#22C55E]/10 text-[#22C55E]' : ''}`}
              >
                {deployment.is_active ? 'Running' : 'Stopped'}
              </Badge>
              {!deployment.is_active && (
                <p className="text-xs" style={{ color: mutedTextColor }}>
                  {getRelativeTime(deployment.created_at) !== 'just now' 
                    ? `Stopped ${getRelativeTime(deployment.created_at)}` 
                    : 'Click Resume to start'}
                </p>
              )}
            </div>
          </div>

          {/* Deployment Stats */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: mutedTextColor }}>
              Overview
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <div className="text-base sm:text-lg font-semibold" style={{ color: textColor }}>{totalInvocations}</div>
                <div className="text-xs" style={{ color: mutedTextColor }}>Requests</div>
              </div>
              <div>
                {avgLatency !== null ? (
                  <>
                    <div className="text-base sm:text-lg font-semibold" style={{ color: textColor }}>{avgLatency}ms</div>
                    <div className="text-xs" style={{ color: mutedTextColor }}>Avg Response</div>
                  </>
                ) : (
                  <>
                    <div className="text-base sm:text-lg font-semibold" style={{ color: textColor }}>-</div>
                    <div className="text-xs" style={{ color: mutedTextColor }}>Avg Response</div>
                  </>
                )}
              </div>
              <div className="group">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-base sm:text-lg font-semibold font-mono truncate" style={{ color: textColor }}>
                    {deployment.id.substring(0, 8)}
                  </span>
                  <button
                    type="button"
                    aria-label="Copy deployment ID"
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/5 flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard?.writeText(deployment.id);
                      setIdCopied(true);
                      setTimeout(() => setIdCopied(false), 1000);
                    }}
                    title="Copy ID"
                  >
                    {idCopied ? (
                      <Check className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} />
                    ) : (
                      <Copy className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} />
                    )}
                  </button>
                </div>
                <div className="text-xs truncate" style={{ color: mutedTextColor }}>Deployment ID</div>
              </div>
            </div>
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: mutedTextColor }}>
              Endpoint
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xs sm:text-sm rounded-[5px] px-2 sm:px-3 py-2 border font-mono break-all overflow-wrap-anywhere" style={{ 
                  background: '#13111C',
                  borderColor: borderColor,
                  color: textColor,
                  wordBreak: 'break-all'
                }}>
                  {fullUrl}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyUrl(deployment.id)}
                  className="text-xs flex-1 sm:flex-initial"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy URL
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(fullUrl, '_blank')}
                  className="text-xs flex-1 sm:flex-initial"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Open
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: mutedTextColor }}>
              Actions
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => onToggle(deployment.id)}
                disabled={togglingId === deployment.id || deletingId === deployment.id}
                variant="default"
                className="flex-1 w-full sm:w-auto"
              >
                {togglingId === deployment.id ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : deployment.is_active === 1 ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <rect width="18" height="18" x="3" y="3" rx="2"/>
                    </svg>
                    <span className="hidden sm:inline">Stop Deployment</span>
                    <span className="sm:hidden">Stop</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                      <path d="M3 3v5h5"/>
                    </svg>
                    <span className="hidden sm:inline">Restart Deployment</span>
                    <span className="sm:hidden">Restart</span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => onDelete(deployment.id)}
                disabled={togglingId === deployment.id || deletingId === deployment.id}
                variant="ghost"
                className="flex-1 w-full sm:w-auto text-red-400 hover:text-red-500 hover:bg-red-500/10"
              >
                {deletingId === deployment.id ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">Delete Deployment</span>
                <span className="sm:hidden">Delete</span>
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: mutedTextColor }}>
                Recent Activity
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchLogs()}
                  disabled={loadingLogs || fetchingLogs}
                  title="Refresh logs"
                  className="h-8 w-8 p-0"
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetailedLogs(deployment.id)}
                  title="View detailed logs"
                  className="text-xs h-8"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                </Button>
              </div>
            </div>
            
            {loadingLogs ? (
              <div className="text-sm" style={{ color: mutedTextColor }}>Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-sm" style={{ color: mutedTextColor }}>No logs yet</div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto deployment-sidebar-scroll" style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent' 
              }}>
                {logs.slice(0, 5).map((log) => {
                  const status = (log.status || 'unknown').toLowerCase();
                  const isSuccess = status === 'success';
                  const isError = status === 'error';
                  
                  return (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-[5px] border"
                      style={{
                        background: '#13111C',
                        borderColor: borderColor
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xs" style={{ color: isSuccess ? '#22c55e' : isError ? '#ef4444' : mutedTextColor }}>
                            {isSuccess ? '✓' : isError ? '✗' : '○'}
                          </span>
                          <span className="text-xs" style={{ color: mutedTextColor }}>
                            {getRelativeTime(log.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-medium min-w-[70px]" style={{ 
                            color: isSuccess ? '#22c55e' : isError ? '#ef4444' : mutedTextColor 
                          }}>
                            {status.toUpperCase()}
                          </span>
                          {typeof log.latency_ms === 'number' && (
                            <span className="min-w-[50px] text-right" style={{ color: mutedTextColor }}>
                              {Math.round(log.latency_ms)}ms
                            </span>
                          )}
                        </div>
                      </div>
                      {log.error && (
                        <div className="text-xs mt-1.5 pl-4" style={{ color: '#ef4444' }}>
                          {log.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

