'use client';

import { ComponentProps } from '../types';

export function TextInput({ component, value, onChange, theme, disabled }: ComponentProps) {
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const backgroundColor = theme?.backgroundColor || '#13111C';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';
  
  const baseClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-80'
  }`;

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        placeholder={component.placeholder || `Enter ${component.label.toLowerCase()}`}
        className={baseClasses}
        style={{
          backgroundColor: backgroundColor,
          borderColor: primaryColor + '60',
          color: textColor,
          borderWidth: '1.5px',
          borderStyle: 'solid',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = primaryColor;
          e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = primaryColor + '60';
          e.target.style.boxShadow = 'none';
        }}
        disabled={disabled}
        maxLength={component.max_length}
        minLength={component.min_length}
        pattern={component.pattern}
        aria-label={component.label}
        aria-required={component.required}
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

