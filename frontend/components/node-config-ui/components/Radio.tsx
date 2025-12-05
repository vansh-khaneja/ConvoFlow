'use client';

import { ComponentProps } from '../types';

export function Radio({ component, value, onChange, theme, disabled }: ComponentProps) {
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';

  return (
    <div className="space-y-1">
      <div className={`space-y-2 ${component.orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}`}>
        {component.options?.map((option) => {
          const isSelected = value === option.value;
          return (
            <label 
              key={option.value} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name={component.name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 border-2 rounded-full focus:ring-2 focus:ring-offset-0 transition-all duration-200 appearance-none cursor-pointer"
                  style={{
                    borderColor: isSelected ? primaryColor : primaryColor + '60',
                    backgroundColor: isSelected ? primaryColor : 'transparent',
                    opacity: disabled || option.disabled ? 0.5 : 1,
                    cursor: disabled || option.disabled ? 'not-allowed' : 'pointer',
                  }}
                  disabled={disabled || option.disabled}
                  aria-label={option.label}
                />
                {isSelected && (
                  <div 
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                )}
              </div>
              <span 
                className="text-sm"
                style={{ 
                  color: disabled || option.disabled ? mutedTextColor : textColor 
                }}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {component.description && (
        <p 
          id={`${component.name}-description`}
          className="text-xs mt-1"
          style={{ color: mutedTextColor }}
        >
          {component.description}
        </p>
      )}
    </div>
  );
}

