'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NodeUIConfig, UIComponent, UIGroup, NodeTheme } from './types';
import { UIGroup as UIGroupComponent } from './UIGroup';

interface DeclarativeUIRendererProps {
  uiConfig: NodeUIConfig;
  parameters: Record<string, any>;
  onParameterChange: (name: string, value: any) => void;
  nodeTheme?: NodeTheme;
}

interface DynamicOptions {
  [key: string]: Array<{ value: string; label: string; disabled?: boolean }>;
}

export function DeclarativeUIRenderer({
  uiConfig,
  parameters,
  onParameterChange,
  nodeTheme
}: DeclarativeUIRendererProps) {
  const [dynamicOptions, setDynamicOptions] = useState<DynamicOptions>({});
  const [loadingOptions, setLoadingOptions] = useState<Set<string>>(new Set());
  
  // Use refs to track state without causing re-renders
  const dynamicOptionsRef = useRef<DynamicOptions>({});
  const loadingOptionsRef = useRef<Set<string>>(new Set());
  
  // Update refs when state changes
  useEffect(() => {
    dynamicOptionsRef.current = dynamicOptions;
  }, [dynamicOptions]);
  
  useEffect(() => {
    loadingOptionsRef.current = loadingOptions;
  }, [loadingOptions]);
  
  // Theme-aware colors
  const textColor = nodeTheme?.textColor || '#ffffff';
  const mutedTextColor = '#d1d5db';

  const fetchCollections = React.useCallback(async () => {
    if (dynamicOptionsRef.current['collections']) return; // Already fetched

    setLoadingOptions(prev => new Set(prev).add('collections'));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/vector-store/collections`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const collections = data.collections.map((collection: any) => ({
          value: collection.name,
          label: `${collection.name} (${collection.points_count} docs)`
        }));

        setDynamicOptions(prev => ({
          ...prev,
          collections
        }));
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoadingOptions(prev => {
        const newSet = new Set(prev);
        newSet.delete('collections');
        return newSet;
      });
    }
  }, []); // No dependencies - uses refs

  // Fetch collections when component mounts or when collection selector is present
  React.useEffect(() => {
    const hasCollectionSelector = uiConfig.groups.some(group =>
      group.components.some(comp => comp.name === 'collection_name')
    );

    if (hasCollectionSelector && !dynamicOptionsRef.current['collections'] && !loadingOptionsRef.current.has('collections')) {
      fetchCollections();
    }
  }, [uiConfig.groups, fetchCollections]);

  // Track previous service value to detect actual changes
  const previousServiceRef = useRef<string>('');

  const fetchModels = React.useCallback(async (service: string) => {
    const cacheKey = `models_${service}`;
    if (dynamicOptionsRef.current[cacheKey]) return; // Already fetched

    setLoadingOptions(prev => new Set(prev).add(cacheKey));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/nodes/models/${service}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const models = data.data.models.map((model: string) => ({
          value: model,
          label: model
        }));

        setDynamicOptions(prev => ({
          ...prev,
          [cacheKey]: models
        }));
      }
    } catch (error) {
      console.error(`Error fetching models for ${service}:`, error);
    } finally {
      setLoadingOptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  }, []); // No dependencies - uses refs

  // Fetch models when service changes
  React.useEffect(() => {
    const serviceValue = parameters['service'];
    if (serviceValue && serviceValue !== '' && serviceValue !== previousServiceRef.current) {
      fetchModels(serviceValue);
      previousServiceRef.current = serviceValue;
    }
  }, [parameters['service'], fetchModels]);

  // Reset model when service changes and current model is invalid
  React.useEffect(() => {
    const serviceValue = parameters['service'];
    if (serviceValue && serviceValue !== '' && parameters['model'] && parameters['model'] !== '') {
      const cacheKey = `models_${serviceValue}`;
      const serviceModels = dynamicOptionsRef.current[cacheKey];

      // If models are still loading, don't reset yet - wait for them to load
      if (loadingOptionsRef.current.has(cacheKey)) {
        return;
      }

      // If models haven't been fetched yet, don't reset
      if (!serviceModels || serviceModels.length === 0) {
        return;
      }

      // Check if current model is valid for this service
      const isModelValid = serviceModels.some((option: { value: string }) => option.value === parameters['model']);

      // Only reset if model is not valid for this service
      if (!isModelValid) {
        onParameterChange('model', '');
      }
    }
  }, [parameters['service'], parameters['model'], onParameterChange]);

  return (
    <div className="space-y-6">
      {uiConfig.groups.map((group, index) => (
        <div 
          key={group.name}
          style={{
            marginBottom: index < uiConfig.groups.length - 1 ? '0' : '0',
          }}
        >
          <UIGroupComponent
            group={group}
            parameters={parameters}
            onParameterChange={onParameterChange}
            theme={nodeTheme}
            dynamicOptions={dynamicOptions}
            loadingOptions={loadingOptions}
          />
        </div>
      ))}
    </div>
  );
}

