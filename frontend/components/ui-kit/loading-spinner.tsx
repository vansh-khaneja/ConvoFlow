'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  inline?: boolean;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  inline = false,
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        className
      )}
      style={{ color: 'currentColor' }}
    />
  );

  if (inline) {
    return (
      <span className={cn('inline-flex items-center gap-2', className)} {...props}>
        {spinner}
        {text && <span>{text}</span>}
      </span>
    );
  }

  if (text) {
    return (
      <div className={cn('flex items-center gap-2', className)} {...props}>
        {spinner}
        <span>{text}</span>
      </div>
    );
  }

  return <div className={cn('flex items-center justify-center', className)} {...props}>{spinner}</div>;
}

