'use client';

import { ComponentProps } from '../types';

export function Button({ component, disabled }: ComponentProps) {
  const buttonClasses = `px-4 py-2 rounded-[5px] font-medium transition-colors ${
    component.variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
    component.variant === 'secondary' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
    component.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
    component.variant === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
    'bg-gray-600 hover:bg-gray-700 text-white'
  } ${
    component.size === 'small' ? 'px-2 py-1 text-sm' :
    component.size === 'large' ? 'px-6 py-3 text-lg' :
    'px-4 py-2'
  }`;

  return (
    <button
      type="button"
      className={buttonClasses}
      disabled={disabled}
      onClick={() => {
        // Handle button click - could emit events or call callbacks
        console.log(`Button ${component.name} clicked`);
      }}
    >
      {component.icon && <span className="mr-2">{component.icon}</span>}
      {component.button_text || component.label}
    </button>
  );
}

