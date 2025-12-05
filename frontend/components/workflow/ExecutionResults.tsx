'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';
import { CredentialInputForm } from './CredentialInputForm';
import { providers } from '@/config/providers';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';

interface ExecutionResultsProps {
  results: any;
  onClose: () => void;
  onRetry?: () => void;
}

export default function ExecutionResults({ results, onClose, onRetry }: ExecutionResultsProps) {
  const [expandedCredentials, setExpandedCredentials] = useState<Set<string>>(new Set());
  const [savedCredentials, setSavedCredentials] = useState<Set<string>>(new Set());

  if (!results) return null;

  // Safely extract data with proper fallback
  const isSuccess = results?.success !== false;
  const data = results?.data || {};
  
  // Debug logging
  if (!data || Object.keys(data).length === 0) {
    console.warn('[ExecutionResults] No data in results:', results);
  }
  
  // Collect errors from multiple sources
  const allErrors: Record<string, string> = {};
  
  // Credential errors (pre-execution validation) - prioritize these
  if (data?.missing_credentials) {
    const nodeInfo = data?.node_info || {};
    Object.entries(data.missing_credentials).forEach(([nodeId, creds]: [string, any]) => {
      const credsList = Array.isArray(creds) ? creds : [creds];
      const nodeDisplayName = nodeInfo[nodeId]?.display_name || nodeId;
      allErrors[nodeId] = `${nodeDisplayName}: Missing credentials (${credsList.join(', ')}). Please set them in Settings > Credentials.`;
    });
  }
  
  // Errors from backend exceptions (data.errors)
  if (data?.errors) {
    Object.entries(data.errors).forEach(([nodeId, error]: [string, any]) => {
      // Don't override credential errors
      if (!allErrors[nodeId]) {
        allErrors[nodeId] = String(error);
      }
    });
  }
  
  // Errors from node outputs (metadata.error, success: false)
  if (data?.response_inputs) {
    Object.entries(data.response_inputs).forEach(([nodeId, nodeData]: [string, any]) => {
      // Don't override credential errors
      if (!allErrors[nodeId]) {
        if (nodeData?.success === false) {
          const errorMsg = nodeData?.metadata?.error || nodeData?.error || 'Node execution failed';
          allErrors[nodeId] = errorMsg;
        } else if (nodeData?.metadata?.error) {
          allErrors[nodeId] = nodeData.metadata.error;
        }
      }
    });
  }
  
  const hasErrors = Object.keys(allErrors).length > 0;
  const hasCredentialErrors = !!(data?.missing_credentials);
  const hasResults = Object.keys(data?.response_inputs || {}).length > 0;

  return (
    <Dialog open={!!results} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-[var(--card-bg)] border-[var(--border-color)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--foreground)]">Execution Results</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            {!isSuccess && !hasCredentialErrors ? (
              <div className="bg-red-500/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-400 font-medium text-sm mb-1">Execution Failed</h3>
                    <p className="text-red-300 text-sm">{results?.error || results?.data?.error || 'Unknown error occurred'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {hasResults && data?.response_inputs && (
                  <>
                    {Object.entries(data.response_inputs).map(([nodeId, inputs]: [string, any]) => {
                      // Determine if this is a DebugNode based on the output keys
                      const isDebugNode = inputs && 'debug_info' in inputs;
                      const nodeType = isDebugNode ? 'Debug Node' : 'Response Node';
                      const borderColor = isDebugNode ? 'border-orange-500/20' : 'border-green-500/20';
                      const bgColor = isDebugNode ? 'bg-orange-500/5' : 'bg-green-500/5';
                      const iconBg = isDebugNode ? 'bg-orange-500/10' : 'bg-green-500/10';
                      const iconColor = isDebugNode ? 'text-orange-400' : 'text-green-400';

                      return (
                        <div key={nodeId} className={`${bgColor} rounded-lg p-4`}>
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                              <CheckCircle className={`h-4 w-4 ${iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-[var(--foreground)] font-medium text-sm mb-0.5">{nodeType}</h3>
                              <p className="text-[var(--text-muted)] text-xs">{nodeId}</p>
                            </div>
                          </div>
                          <div className="space-y-2 pl-11">
                            {Object.entries(inputs || {}).map(([key, value]: [string, any]) => (
                              <div key={key} className="space-y-1">
                                <span className="text-[var(--foreground)] text-xs font-medium">{key}</span>
                                <div>
                                  {typeof value === 'object' ? (
                                    <pre className="text-[var(--text-muted)] text-xs bg-[var(--input-bg)] p-3 rounded-[5px] overflow-x-auto">
                                      {JSON.stringify(value, null, 2)}
                                    </pre>
                                  ) : (
                                    <p className="text-[var(--text-muted)] text-sm">{String(value)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {hasErrors && (
                  <>
                    {hasCredentialErrors && (
                      <div className="bg-[var(--input-bg)] rounded-lg p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="h-9 w-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                            <Key className="h-5 w-5 text-[var(--primary)]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[var(--foreground)] font-semibold text-base mb-1">
                              Missing Credentials
                            </h3>
                            <p className="text-[var(--text-muted)] text-sm">
                              Add the missing credentials below to continue. You can also set them in <span className="font-medium text-[var(--foreground)]">Settings › Credentials</span>.
                            </p>
                          </div>
                        </div>
                        {data?.all_missing_credentials && data.all_missing_credentials.length > 0 && (
                          <div className="space-y-3">
                            {data.all_missing_credentials.map((credKey: string) => {
                              const provider = providers.find(p => p.key === credKey);
                              const isExpanded = expandedCredentials.has(credKey);
                              
                              // Check if this provider has multiple fields (like Qdrant, Twilio, etc.)
                              const hasMultipleFields = provider?.fields && provider.fields.length > 1;
                              
                              if (hasMultipleFields && provider?.fields) {
                                const Icon = provider.icon;
                                // Handle multi-field credentials
                                return (
                                  <div key={credKey} className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-lg">
                                      <div className="h-10 w-10 rounded-lg bg-[var(--muted)]/30 flex items-center justify-center flex-shrink-0">
                                        {provider.image ? (
                                          <img src={provider.image} alt={provider.label} className="h-6 w-6 object-contain" />
                                        ) : (
                                          Icon && <Icon className="h-5 w-5 text-[var(--text-muted)]" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[var(--foreground)] text-sm font-medium">{provider.label}</p>
                                        <p className="text-[var(--text-muted)] text-xs mt-0.5">{provider.desc}</p>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newExpanded = new Set(expandedCredentials);
                                          if (isExpanded) {
                                            newExpanded.delete(credKey);
                                          } else {
                                            newExpanded.add(credKey);
                                          }
                                          setExpandedCredentials(newExpanded);
                                        }}
                                      >
                                        {isExpanded ? 'Hide' : 'Add'}
                                      </Button>
                                    </div>
                                    {isExpanded && (
                                      <div className="space-y-3 pl-4">
                                        {provider.fields.map((field) => (
                                          <CredentialInputForm
                                            key={field.key}
                                            credentialKey={field.key}
                                            onSuccess={() => {
                                              setSavedCredentials(prev => new Set(prev).add(field.key));
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              
                              // Single field credential
                              return (
                                <div key={credKey}>
                                  <CredentialInputForm
                                    credentialKey={credKey}
                                    onSuccess={() => {
                                      setSavedCredentials(prev => new Set(prev).add(credKey));
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {Object.entries(allErrors).map(([nodeId, error]: [string, string]) => {
                      const nodeInfo = data?.node_info?.[nodeId];
                      const nodeDisplayName = nodeInfo?.display_name || nodeId;
                      const isCredentialError = error.includes('Missing credentials');
                      
                      // Skip credential errors here since they're handled above
                      if (isCredentialError && hasCredentialErrors) {
                        return null;
                      }
                      
                      return (
                        <div key={nodeId} className={`rounded-lg p-4 ${isCredentialError ? 'bg-[var(--input-bg)]' : 'bg-red-500/5'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isCredentialError ? 'bg-[var(--primary)]/10' : 'bg-red-500/10'}`}>
                              {isCredentialError ? (
                                <Key className={`h-4 w-4 ${isCredentialError ? 'text-[var(--primary)]' : 'text-red-400'}`} />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium text-sm mb-1 ${isCredentialError ? 'text-[var(--foreground)]' : 'text-red-400'}`}>
                                {nodeDisplayName}
                                {nodeId !== nodeDisplayName && (
                                  <span className="text-[var(--text-muted)] text-xs ml-2 font-normal">({nodeId})</span>
                                )}
                              </h3>
                              <p className={`text-sm whitespace-pre-wrap ${isCredentialError ? 'text-[var(--text-muted)]' : 'text-red-300'}`}>
                                {error}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {isSuccess && !hasResults && !hasErrors && data && (
                  <div className="text-[var(--text-muted)] text-center py-12 text-sm">
                    No execution data available
                  </div>
                )}
              </div>
            )}
          </div>

        <DialogFooter className="flex items-center justify-between pt-4 mt-4">
          <div className="text-sm text-[var(--text-muted)]">
            Executed <span className="font-medium text-[var(--foreground)]">{(data?.executed_nodes?.length) || 0}</span> node{(data?.executed_nodes?.length) !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            {hasCredentialErrors && savedCredentials.size > 0 && onRetry && (
              <Button
                size="sm"
                onClick={() => {
                  onRetry();
                  onClose();
                }}
              >
                Retry Workflow
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
            >
              Copy Results
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
