'use client';

import { ComponentProps } from '../types';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';

export function Select({ 
  component, 
  value, 
  onChange, 
  theme, 
  disabled, 
  dynamicOptions, 
  loadingOptions,
  parameters 
}: ComponentProps) {
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const backgroundColor = theme?.backgroundColor || '#13111C';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';
  
  const baseClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 appearance-none ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-80 cursor-pointer'
  }`;

  // Check if this is a collection selector or model selector
  const isCollectionSelector = component.name === 'collection_name';
  const isModelSelector = component.name === 'model';

  let options, loading;
  if (isCollectionSelector) {
    options = dynamicOptions?.['collections'];
    loading = loadingOptions?.has('collections') || false;
  } else if (isModelSelector) {
    const serviceValue = parameters?.['service'];
    const cacheKey = `models_${serviceValue}`;
    options = serviceValue ? dynamicOptions?.[cacheKey] : component.options;
    loading = serviceValue ? (loadingOptions?.has(cacheKey) || false) : false;
  } else {
    options = component.options;
    loading = false;
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={baseClasses}
          style={{
            backgroundColor: backgroundColor,
            borderColor: primaryColor + '60',
            color: textColor,
            borderWidth: '1.5px',
            borderStyle: 'solid',
            outline: 'none',
            paddingRight: '2.5rem',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = primaryColor;
            e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = primaryColor + '60';
            e.target.style.boxShadow = 'none';
          }}
          disabled={disabled || loading}
          multiple={component.multiple}
          aria-label={component.label}
          aria-required={component.required}
          aria-describedby={component.description ? `${component.name}-description` : undefined}
        >
          {loading && (
            <option value="" disabled>
              {isCollectionSelector ? 'Loading collections...' : 'Loading models...'}
            </option>
          )}
          {isModelSelector && !parameters?.['service'] && (
            <option value="" disabled>
              Select a service first
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown arrow icon */}
        <div 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          style={{ color: textColor + '80' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" style={{ color: primaryColor }} />
          </div>
        )}
      </div>
      {component.description && (
        <p 
          id={`${component.name}-description`}
          className="text-xs"
          style={{ color: mutedTextColor }}
        >
          {component.description}
        </p>
      )}
    </div>
  );
}

