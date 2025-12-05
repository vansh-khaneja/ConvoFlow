'use client';

import { ComponentProps } from '../types';

export function Divider({ component, theme }: ComponentProps) {
  const borderColor = '#4b5563';

  return (
    <hr 
      className={component.orientation === 'vertical' ? 'w-px h-full' : 'w-full'}
      style={{ 
        borderWidth: component.thickness || 1,
        borderColor: component.color || borderColor
      }}
    />
  );
}

