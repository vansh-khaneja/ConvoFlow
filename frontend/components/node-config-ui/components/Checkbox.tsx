'use client';

import { ComponentProps } from '../types';

export function Checkbox({ component, value, onChange, theme, disabled }: ComponentProps) {
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';
  
  // Get checked/unchecked values with defaults
  const checkedValue = component.checked_value !== undefined ? component.checked_value : true;
  const uncheckedValue = component.unchecked_value !== undefined ? component.unchecked_value : false;
  
  // Determine if checked: compare with checked_value, or if value is undefined/null, use default_value
  const currentValue = value !== undefined && value !== null ? value : component.default_value;
  const isChecked = currentValue === checkedValue;

  return (
    <div className="space-y-1">
      <label className="flex items-start space-x-3 cursor-pointer group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onChange(e.target.checked ? checkedValue : uncheckedValue);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-2 focus:ring-2 focus:ring-offset-0 transition-all duration-200 appearance-none cursor-pointer"
            style={{
              backgroundColor: isChecked ? primaryColor : 'transparent',
              borderColor: isChecked ? primaryColor : primaryColor + '60',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            disabled={disabled}
            aria-label={component.label}
            aria-required={component.required}
            aria-describedby={component.description ? `${component.name}-description` : undefined}
          />
          {isChecked && (
            <svg 
              className="absolute w-3 h-3 pointer-events-none"
              style={{ color: '#ffffff' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
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

