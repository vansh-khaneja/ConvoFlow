'use client';

import { ComponentProps } from '../types';

export function Label({ component, theme }: ComponentProps) {
  const textColor = theme?.textColor || '#ffffff';

  return (
    <div className="text-sm" style={{ color: textColor }}>
      {component.html ? (
        <div dangerouslySetInnerHTML={{ __html: component.text || '' }} />
      ) : (
        component.text || component.label
      )}
    </div>
  );
}

