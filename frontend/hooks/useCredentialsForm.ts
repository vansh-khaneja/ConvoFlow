'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCredentials } from './useWorkflowQueries';
import { setCredential, deleteCredential } from '../api';

const STORAGE_KEY = 'convoflow_credentials_status';

export type KeySelection = string | 'CUSTOM';

export interface Provider {
  key: string;
  label: string;
  desc: string;
  icon?: any;
  image?: string;
  fields?: Array<{
    key: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }>;
}

export interface CredentialItem {
  key: string;
  label: string;
  value?: string;
  isPreset?: boolean;
}

export function useCredentialsForm(providers: Provider[]) {
  const { data: credentialsData, isLoading, refetch: refetchCredentials } = useCredentials();
  
  const [items, setItems] = useState<CredentialItem[]>([
    { key: 'TAVILY_API_KEY', label: 'Tavily', isPreset: true },
    { key: 'OPENAI_API_KEY', label: 'OpenAI', isPreset: true },
    { key: 'GROQ_API_KEY', label: 'Groq', isPreset: true },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeySelection>('TAVILY_API_KEY');
  const [customKey, setCustomKey] = useState('');
  const [value, setValue] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<Array<{ id: string; key: string; value: string }>>([
    { id: Date.now().toString(), key: '', value: '' }
  ]);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const providersPerPage = 6;

  // Process credentials data from React Query
  useEffect(() => {
    if (!credentialsData?.credentials) return;
    
    const credentials = credentialsData.credentials as string[];
    const savedKeys = new Set(credentials);
    
    // Start with preset items
    const initialItems: CredentialItem[] = [
      { key: 'TAVILY_API_KEY', label: 'Tavily', isPreset: true },
      { key: 'OPENAI_API_KEY', label: 'OpenAI', isPreset: true },
      { key: 'GROQ_API_KEY', label: 'Groq', isPreset: true },
    ];
    
    // Update preset items with saved status
    const updatedItems = initialItems.map((it) => 
      savedKeys.has(it.key) ? { ...it, value: '********' } : it
    );
    
    // Add any additional saved credentials that aren't in the preset list
    savedKeys.forEach((key: string) => {
      if (!initialItems.some((it) => it.key === key)) {
        // Find if this key belongs to a provider
        const provider = providers.find(p => 
          p.key === key || p.fields?.some(f => f.key === key)
        );
        
        let label = key;
        if (provider) {
          // Check if it's a field from a multi-field provider
          const field = provider.fields?.find(f => f.key === key);
          if (field) {
            label = `${provider.label} - ${field.label}`;
          } else {
            label = provider.label;
          }
        }
        
        updatedItems.push({ key, label, value: '********', isPreset: false });
      }
    });
    
    setItems(updatedItems);
    
    // Also update localStorage for backward compatibility
    try {
      const savedStatus: Record<string, boolean> = {};
      savedKeys.forEach((key: string) => {
        savedStatus[key] = true;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStatus));
    } catch {}
  }, [credentialsData, providers]);

  const addOrUpdate = async () => {
    const selectedProvider = providers.find(p => p.key === selectedKey);
    
    // If provider has multiple fields, check all required fields
    if (selectedProvider?.fields) {
      const missingFields = selectedProvider.fields.filter(f => f.required && !fieldValues[f.key]?.trim());
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }
      
      // Save all fields
      try {
        setBusy(true);
        const savePromises = selectedProvider.fields.map(field => {
          const fieldValue = fieldValues[field.key]?.trim();
          if (!fieldValue) return Promise.resolve(null);
          
          return setCredential({ key: field.key, value: fieldValue });
        });
        
        const results = await Promise.all(savePromises);
        const failed = results.filter(r => r && !r.success);
        if (failed.length > 0) throw new Error('Failed to save some credentials');
        
        setShowModal(false);
        setValue('');
        setFieldValues({});
        setCustomKey('');
        setCurrentPage(0);
        await refetchCredentials();
        toast.success('Credentials saved successfully');
      } catch (e) {
        console.error(e);
        toast.error('Failed to save credentials');
      } finally {
        setBusy(false);
      }
      return;
    }
    
    // Handle custom fields (multiple custom credentials)
    if (selectedKey === 'CUSTOM' && customFields.length > 0) {
      const validFields = customFields.filter(f => f.key.trim() && f.value.trim());
      if (validFields.length === 0) {
        // Fallback to single field mode
        if (!value.trim() || !customKey.trim()) return;
      } else {
        // Save multiple custom fields
        try {
          setBusy(true);
          const savePromises = validFields.map(field => {
            const key = field.key.trim().toUpperCase();
            const value = field.value.trim();
            if (!key || !value) return Promise.resolve(null);
            
            return setCredential({ key, value });
          });
          
          const results = await Promise.all(savePromises);
          const failed = results.filter(r => r && !r.ok);
          if (failed.length > 0) throw new Error('Failed to save some credentials');
          
          setShowModal(false);
          setValue('');
          setFieldValues({});
          setCustomKey('');
          setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
          setCurrentPage(0);
          await refetchCredentials();
          toast.success('Credentials saved successfully');
        } catch (e) {
          console.error(e);
          toast.error('Failed to save credentials');
        } finally {
          setBusy(false);
        }
        return;
      }
    }
    
    // Single field (original behavior)
    if (!value.trim()) return;
    const keyToSave = selectedKey === 'CUSTOM' ? customKey.trim() : (selectedKey as string);
    if (!keyToSave) return;
    try {
      setBusy(true);
      const response = await setCredential({ key: keyToSave, value });
      if (!response.success) throw new Error('Failed to save credential');
      setShowModal(false);
      setValue('');
      setFieldValues({});
      setCustomKey('');
      setCustomFields([{ id: Date.now().toString(), key: '', value: '' }]);
      setCurrentPage(0);
      await refetchCredentials();
      toast.success('Credential saved successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save credential');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (key: string) => {
    try {
      setBusy(true);
      const response = await deleteCredential({ key });
      if (!response.success) throw new Error('Failed to delete credential');
      
      await refetchCredentials();
      toast.success('Credential deleted successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete credential');
    } finally {
      setBusy(false);
    }
  };

  const configuredItems = items.filter((i) => i.value);
  const visibleItems = (configuredItems.length ? configuredItems : items).filter((i) =>
    i.label.toLowerCase().includes(filter.toLowerCase()) || i.key.toLowerCase().includes(filter.toLowerCase())
  );

  return {
    // State
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
    
    // Setters
    setShowModal,
    setSelectedKey,
    setCustomKey,
    setValue,
    setFieldValues,
    setCustomFields,
    setFilter,
    setCurrentPage,
    
    // Actions
    addOrUpdate,
    remove,
  };
}

