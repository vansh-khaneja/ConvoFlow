'use client';

import React from 'react';
import { Plus, Search, Key, Trash2, FileCode } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui-kit/dialog';
import { EmptyState } from '@/components/ui-kit/empty-state';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { CredentialCard } from '@/components/cards/CredentialCard';
import { toast } from 'sonner';
import { useCredentialsForm, KeySelection } from '@/hooks/useCredentialsForm';
import { providers } from '@/config/providers';

export function CredentialsTab({ isCompact = false }: { isCompact?: boolean }) {
  const {
    items,
    isLoading,
    showModal,
    selectedKey,
    customKey,
    value,
    fieldValues,
    customFields,
    filter,
    busy,
    currentPage,
    providersPerPage,
    configuredItems,
    visibleItems,
    setShowModal,
    setSelectedKey,
    setCustomKey,
    setValue,
    setFieldValues,
    setCustomFields,
    setFilter,
    setCurrentPage,
    addOrUpdate,
    remove,
  } = useCredentialsForm(providers);

  // Colors are now handled by CredentialCard using theme config

  if (isCompact) {
    // Compact sidebar version
    const configuredItems = items.filter((i) => i.value);
    return (
      <div className="space-y-2 mt-2">
        <Button 
          onClick={() => {
            setShowModal(true);
            setCurrentPage(0);
          }} 
          size="sm"
          className="w-full h-8 text-xs"
        >
          <Plus className="h-3 w-3 mr-1.5" />
          Add Secret
        </Button>
        {configuredItems.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] px-2 py-1">No credentials</div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {configuredItems.map((it) => (
              <div key={it.key} className="flex items-center justify-between gap-2 px-2 py-1.5 bg-[var(--card-bg)] rounded text-xs hover:bg-[var(--card-hover)] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.label}</div>
                  <div className="text-[var(--text-muted)] truncate text-[10px]">{it.key}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400"
                  disabled={busy}
                  onClick={() => remove(it.key)}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal for adding credentials */}
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setCurrentPage(0);
            setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto credentials-modal-scroll" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
          }}>
            <style>{`
              .credentials-modal-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .credentials-modal-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .credentials-modal-scroll::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.2);
                border-radius: 10px;
                border: none;
                transition: background 0.2s ease;
              }
              .credentials-modal-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.4);
              }
              .credentials-modal-scroll::-webkit-scrollbar-button {
                display: none;
              }
              [data-theme="dark"] .credentials-modal-scroll::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.3);
              }
              [data-theme="dark"] .credentials-modal-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.5);
              }
            `}</style>
            <DialogHeader>
              <DialogTitle>Create New Secret</DialogTitle>
              <DialogDescription>
                Add API credentials for your workflow integrations
              </DialogDescription>
            </DialogHeader>
            {/* Note: Full form would be included here in compact mode */}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Responsive Layout */}
      <div className="space-y-4">
        {/* Title and Count */}
        <div>
          <h3 className="text-lg font-semibold mb-1">Saved Credentials</h3>
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <span>{configuredItems.length} Credential{configuredItems.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {/* Search and Create Button - Stack on mobile, side by side on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex-1 w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Search credentials..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="bg-[var(--card-bg)] border-[var(--border-color)] rounded-[5px] w-full"
            />
          </div>
          <div className="flex-shrink-0">
            <Button 
              onClick={() => {
                setShowModal(true);
                setCurrentPage(0);
              }} 
              className="h-9 w-full sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Secret
            </Button>
          </div>
        </div>
      </div>

      {configuredItems.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No credentials configured"
          description="Add your first API credential to start building workflows"
          action={{ label: 'Create Secret', onClick: () => {
            setShowModal(true);
            setCurrentPage(0);
          } }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {visibleItems.map((it) =>
            it.value ? (() => {
              // Find provider by exact key match first
              let provider = providers.find(p => p.key === it.key);
              
              // If not found, check if it's a field from a multi-field provider
              if (!provider) {
                provider = providers.find(p => 
                  p.fields?.some(f => f.key === it.key)
                );
              }
              
              return (
                <CredentialCard
                  key={it.key}
                  credential={it}
                  provider={provider}
                  onDelete={remove}
                  disabled={busy}
                />
              );
            })() : null
          )}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          setCurrentPage(0);
          setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto credentials-modal-scroll" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
        }}>
          <style>{`
            .credentials-modal-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .credentials-modal-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .credentials-modal-scroll::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.2);
              border-radius: 10px;
              border: none;
              transition: background 0.2s ease;
            }
            .credentials-modal-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.4);
            }
            .credentials-modal-scroll::-webkit-scrollbar-button {
              display: none;
            }
            [data-theme="dark"] .credentials-modal-scroll::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.3);
            }
            [data-theme="dark"] .credentials-modal-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.5);
            }
          `}</style>
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Secret</DialogTitle>
            <DialogDescription className="text-base">
              Add API credentials for your workflow integrations
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            <label className="text-sm font-semibold text-[var(--foreground)] mb-3 block">Select Provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[calc(96px*2+0.75rem*1)]">
              {(() => {
                const startIndex = currentPage * providersPerPage;
                const endIndex = startIndex + providersPerPage;
                const paginatedProviders = providers.slice(startIndex, endIndex);
                
                return paginatedProviders.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      onClick={() => {
                        setSelectedKey(p.key);
                        setFieldValues({});
                        setValue('');
                        setCustomKey('');
                        setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
                      }}
                      className={`group flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all min-h-[100px] ${
                        selectedKey === p.key
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-[0_0_0_3px_rgba(139,92,246,0.1)]'
                          : 'border-[var(--border-color)] hover:border-[var(--primary)]/50 bg-[var(--card-bg)] shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className={`h-11 w-11 rounded-lg flex items-center justify-center transition-all ${selectedKey === p.key ? 'bg-[var(--primary)]/20 scale-110' : 'bg-[var(--muted)]/30 group-hover:scale-105'}`}>
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.label} className="h-6 w-6 object-contain" />
                        ) : (
                          Icon && (
                            <Icon
                              className={`h-5 w-5 ${
                                selectedKey === p.key ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                              }`}
                            />
                          )
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">{p.label}</div>
                        <div className="text-xs text-[var(--text-muted)] leading-snug line-clamp-2">{p.desc}</div>
                      </div>
                      {selectedKey === p.key && (
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                });
              })()}
            </div>
            
            {(() => {
              const totalPages = Math.ceil(providers.length / providersPerPage);
              if (totalPages <= 1) return null;
              
              return (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
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
                        className={`h-2 w-2 rounded-full transition-all ${
                          currentPage === i
                            ? 'bg-[var(--primary)] w-6'
                            : 'bg-[var(--border-color)] hover:bg-[var(--primary)]/50'
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              );
            })()}
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4">
              <div className="space-y-3">
                {(() => {
                  const selectedProvider = providers.find(p => p.key === selectedKey);
                  
                  // Show multiple fields if provider has fields defined
                  if (selectedProvider?.fields) {
                    return (
                      <>
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                          <Label className="text-xs text-[var(--text-muted)] font-medium">Key</Label>
                          <Label className="text-xs text-[var(--text-muted)] font-medium">Value</Label>
                          <div></div>
                        </div>
                        {selectedProvider.fields.map((field) => (
                          <div key={field.key} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                            <Input
                              value={field.key}
                              disabled
                              className="bg-[var(--muted)]/30 text-[var(--text-muted)] cursor-not-allowed"
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                type={field.type}
                                value={fieldValues[field.key] || ''}
                                onChange={(e) => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="flex-1"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setFieldValues(prev => {
                                const updated = { ...prev };
                                delete updated[field.key];
                                return updated;
                              })}
                              className="h-8 w-8 rounded-full border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--card-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)]"
                              disabled={selectedProvider.fields?.length === 1}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </>
                    );
                  }
                  
                  // Single field or custom fields
                  if (selectedKey === 'CUSTOM' && customFields.length > 1) {
                    // Multiple custom fields
                    return (
                      <>
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                          <Label className="text-xs text-[var(--text-muted)] font-medium">Key</Label>
                          <Label className="text-xs text-[var(--text-muted)] font-medium">Value</Label>
                          <div></div>
                        </div>
                        {customFields.map((field) => (
                          <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                            <Input
                              value={field.key}
                              onChange={(e) => {
                                setCustomFields((prev) =>
                                  prev.map((f) =>
                                    f.id === field.id ? { ...f, key: e.target.value.toUpperCase() } : f
                                  )
                                );
                              }}
                              placeholder="MY_SERVICE_API_KEY"
                            />
                            <Input
                              type="password"
                              value={field.value}
                              onChange={(e) => {
                                setCustomFields((prev) =>
                                  prev.map((f) =>
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  )
                                );
                              }}
                              placeholder="Enter API key"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const targetId = field.id;
                                setCustomFields((prev) => {
                                  if (prev.length > 1) {
                                    return prev.filter((f) => f.id !== targetId);
                                  } else {
                                    return [{ id: Date.now().toString(), key: '', value: '' }];
                                  }
                                });
                              }}
                              className="h-8 w-8 rounded-full border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--card-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)]"
                              disabled={customFields.length === 1}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </>
                    );
                  }
                  
                  // Single field (original behavior)
                  return (
                    <>
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                        <Label className="text-xs text-[var(--text-muted)] font-medium">Key</Label>
                        <Label className="text-xs text-[var(--text-muted)] font-medium">Value</Label>
                        <div></div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                        {selectedKey === 'CUSTOM' ? (
                          <Input
                            value={customKey}
                            onChange={(e) => setCustomKey(e.target.value.toUpperCase())}
                            placeholder="MY_SERVICE_API_KEY"
                          />
                        ) : (
                          <Input
                            value={selectedKey}
                            disabled
                            className="bg-[var(--muted)]/30 text-[var(--text-muted)] cursor-not-allowed"
                          />
                        )}
                        <Input
                          type="password"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder="Enter API key"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setValue('');
                            if (selectedKey === 'CUSTOM') setCustomKey('');
                          }}
                          className="h-8 w-8 rounded-full border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--card-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)]"
                          disabled={!value && !customKey}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={selectedKey !== 'CUSTOM'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedKey === 'CUSTOM') {
                      const isSingleFieldMode = customFields.length === 1 && 
                        !customFields[0].key.trim() && !customFields[0].value.trim();
                      
                      if (isSingleFieldMode && (customKey.trim() || value.trim())) {
                        setCustomFields([
                          { id: Date.now().toString(), key: customKey.trim(), value: value.trim() },
                          { id: (Date.now() + 1).toString(), key: '', value: '' }
                        ]);
                        setCustomKey('');
                        setValue('');
                      } else {
                        setCustomFields([...customFields, { id: Date.now().toString(), key: '', value: '' }]);
                      }
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add another
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".env"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const content = event.target?.result as string;
                          const lines = content.split('\n');
                          const parsed: Record<string, string> = {};
                          
                          lines.forEach(line => {
                            const trimmed = line.trim();
                            if (!trimmed || trimmed.startsWith('#')) return;
                            
                            const match = trimmed.match(/^([^=]+)=(.*)$/);
                            if (match) {
                              const key = match[1].trim();
                              const value = match[2].trim().replace(/^["']|["']$/g, '');
                              parsed[key] = value;
                            }
                          });
                          
                          const matchedProviderKeys: string[] = [];
                          const matchedFields: Record<string, string> = {};
                          const customFields: Array<{ id: string; key: string; value: string }> = [];
                          
                          Object.entries(parsed).forEach(([key, val]) => {
                            const matchedProvider = providers.find(p => 
                              p.key === key || p.fields?.some(f => f.key === key)
                            );
                            
                            if (matchedProvider) {
                              matchedProviderKeys.push(matchedProvider.key);
                              matchedFields[key] = val;
                            } else {
                              customFields.push({ id: Date.now().toString() + Math.random(), key, value: val });
                            }
                          });
                          
                          const uniqueProviders = [...new Set(matchedProviderKeys)];
                          if (uniqueProviders.length === 1 && customFields.length === 0) {
                            const matchedProvider = providers.find(p => p.key === uniqueProviders[0]);
                            if (matchedProvider) {
                              setSelectedKey(matchedProvider.key as KeySelection);
                              setFieldValues(matchedFields);
                              setCustomKey('');
                              setValue('');
                              setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
                            }
                          } else if (matchedFields && Object.keys(matchedFields).length > 0 && customFields.length === 0) {
                            const firstProvider = providers.find(p => 
                              p.key === uniqueProviders[0] || p.fields?.some(f => f.key === Object.keys(matchedFields)[0])
                            );
                            if (firstProvider) {
                              setSelectedKey(firstProvider.key as KeySelection);
                              setFieldValues(matchedFields);
                              setCustomKey('');
                              setValue('');
                              setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
                            }
                          } else if (customFields.length > 0) {
                            setSelectedKey('CUSTOM');
                            setFieldValues({});
                            Object.entries(matchedFields).forEach(([key, val]) => {
                              const isProviderKey = providers.some(p => p.key === key || p.fields?.some(f => f.key === key));
                              if (!isProviderKey) {
                                customFields.push({ id: Date.now().toString() + Math.random(), key, value: val });
                              }
                            });
                            
                            if (customFields.length === 0) {
                              customFields.push({ id: Date.now().toString(), key: '', value: '' });
                            }
                            
                            if (customFields.length === 1) {
                              setCustomFields([...customFields, { id: (Date.now() + 1).toString(), key: '', value: '' }]);
                            } else {
                              setCustomFields(customFields);
                            }
                            setCustomKey('');
                            setValue('');
                          }
                          
                          e.target.value = '';
                        } catch (error) {
                          toast.error('Failed to parse .env file. Please check the format.');
                          console.error(error);
                        }
                      };
                      reader.readAsText(file);
                    }}
                    id="env-file-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      document.getElementById('env-file-input')?.click();
                    }}
                  >
                    <FileCode className="h-3.5 w-3.5 mr-1.5" />
                    Import .env
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowModal(false);
              setCurrentPage(0);
              setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
            }}>
              Cancel
            </Button>
            <Button
              disabled={(() => {
                if (busy) return true;
                const selectedProvider = providers.find(p => p.key === selectedKey);
                if (selectedProvider?.fields) {
                  return selectedProvider.fields.some(f => f.required && !fieldValues[f.key]?.trim());
                }
                if (selectedKey === 'CUSTOM') {
                  const hasMultiFieldValues = customFields.length > 1 || 
                    customFields.some(f => f.key.trim() || f.value.trim());
                  
                  if (hasMultiFieldValues) {
                    const validFields = customFields.filter(f => f.key.trim() && f.value.trim());
                    return validFields.length === 0;
                  }
                  return !value || !customKey;
                }
                return !value;
              })()}
              onClick={addOrUpdate}
            >
              {busy && <LoadingSpinner size="sm" className="mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

