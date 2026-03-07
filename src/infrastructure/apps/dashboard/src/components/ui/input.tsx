/**
 * @fileoverview Input Component
 * @description Reusable input component with variants and states
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-[#12121a] px-3 py-2 text-sm',
            'border-violet-500/20 text-white placeholder:text-gray-500',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            error && 'border-red-500/50 focus-visible:ring-red-500/50',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1.5 text-xs text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
