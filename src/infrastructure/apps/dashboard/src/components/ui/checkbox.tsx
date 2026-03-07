/**
 * @fileoverview Checkbox Component
 * @description Custom checkbox with Aeterna styling (no Radix dependency)
 */

'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked: controlledChecked, defaultChecked, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleClick = () => {
      if (props.disabled) return;
      const newValue = !checked;
      if (!isControlled) {
        // Complexity: O(1)
        setInternalChecked(newValue);
      }
      onCheckedChange?.(newValue);
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={handleClick}
        disabled={props.disabled}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded border border-violet-500/30 bg-[#12121a]',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-violet-500/50 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          checked && 'bg-violet-600 border-violet-500',
          className
        )}
      >
        {checked && (
          <span className="flex items-center justify-center text-white">
            <Check className="h-3 w-3" />
          </span>
        )}
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={() => {}}
          className="sr-only"
          {...props}
        />
      </button>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
