'use client';

import { ComponentProps } from '../types';

export function Toggle({ component, value, onChange, theme, disabled }: ComponentProps) {
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';
  const isOn = value === component.on_value;

  return (
    <div className="space-y-1">
      <label className="flex items-start space-x-3 cursor-pointer group">
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 flex-shrink-0 mt-0.5 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
          }`}
          style={{
            backgroundColor: isOn ? primaryColor : '#4b5563',
            boxShadow: isOn ? `0 0 0 2px ${primaryColor}30` : 'none',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              onChange(isOn ? component.off_value : component.on_value);
            }
          }}
          disabled={disabled}
          aria-label={component.label}
          aria-pressed={isOn}
          aria-required={component.required}
          aria-describedby={component.description ? `${component.name}-description` : undefined}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
              isOn ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <div className="flex-1">
          <span 
            className="text-sm font-medium block"
            style={{ color: textColor }}
          >
            {component.label}
          </span>
          {component.description && (
            <p 
              id={`${component.name}-description`}
              className="text-xs mt-0.5"
              style={{ color: mutedTextColor }}
            >
              {component.description}
            </p>
          )}
        </div>
      </label>
    </div>
  );
}

