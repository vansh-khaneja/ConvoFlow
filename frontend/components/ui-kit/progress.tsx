'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  showValue = false,
  size = 'md',
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)} {...props}>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-[var(--muted)]',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out bg-[var(--primary)]',
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-[var(--text-muted)] text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

