'use client';

import { ComponentProps } from '../types';

export function ColorPicker({ component, value, onChange, theme, disabled }: ComponentProps) {
  const primaryColor = theme?.primaryColor || '#3b82f6';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';
  const currentValue = value || component.default_value || '#000000';

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="h-10 w-20 border rounded-lg cursor-pointer transition-all duration-200"
          style={{ 
            borderColor: primaryColor + '60',
            borderWidth: '1.5px',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
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
          aria-label={component.label}
          aria-required={component.required}
          aria-describedby={component.description ? `${component.name}-description` : undefined}
        />
        <div className="flex-1">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: theme?.backgroundColor || '#13111C',
              borderColor: primaryColor + '60',
              color: textColor,
              borderWidth: '1.5px',
              borderStyle: 'solid',
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
            placeholder="#000000"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />
        </div>
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

