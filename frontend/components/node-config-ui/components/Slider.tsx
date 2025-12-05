'use client';

import { ComponentProps } from '../types';
import { useEffect } from 'react';

export function Slider({ component, value, onChange, theme, disabled }: ComponentProps) {
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';
  const minValue = component.min_value ?? 0;
  const maxValue = component.max_value ?? 100;
  const step = component.step ?? 1;
  
  // Get current value and clamp it to valid range
  const rawValue = value ?? component.default_value ?? component.min_value ?? 0;
  
  // Clamp value to min/max range for display
  const currentValue = typeof rawValue === 'number' 
    ? Math.max(minValue, Math.min(maxValue, rawValue))
    : rawValue;
  
  // If value is out of range, update it
  useEffect(() => {
    if (typeof rawValue === 'number' && (rawValue < minValue || rawValue > maxValue)) {
      const clampedValue = Math.max(minValue, Math.min(maxValue, rawValue));
      onChange(clampedValue);
    }
  }, [rawValue, minValue, maxValue, onChange]);

  return (
    <div 
      className="space-y-2"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-1">
        {component.show_value !== false && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: textColor }}>
              {typeof currentValue === 'number' && step < 1
                ? currentValue.toFixed(step.toString().split('.')[1]?.length || 1)
                : currentValue}
            </span>
            {component.min_value !== undefined && component.max_value !== undefined && (
              <span className="text-xs" style={{ color: mutedTextColor }}>
                ({minValue} - {maxValue})
              </span>
            )}
          </div>
        )}
      </div>
      <input
        type="range"
        value={currentValue}
        onChange={(e) => {
          e.stopPropagation();
          onChange(parseFloat(e.target.value));
        }}
        onInput={(e) => {
          e.stopPropagation();
          onChange(parseFloat((e.target as HTMLInputElement).value));
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onMouseMove={(e) => {
          if (e.buttons === 1) {
            e.stopPropagation();
          }
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
        }}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
        style={{
          backgroundColor: '#374151',
          accentColor: primaryColor,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        disabled={disabled}
        min={minValue}
        max={maxValue}
        step={step}
        aria-label={component.label}
        aria-required={component.required}
        aria-valuemin={minValue}
        aria-valuemax={maxValue}
        aria-valuenow={currentValue}
        aria-describedby={component.description ? `${component.name}-description` : undefined}
      />
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

