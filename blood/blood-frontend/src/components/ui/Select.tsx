import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: SelectSize;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: 'h-8 pl-3 pr-8 text-xs',
  md: 'h-10 pl-3.5 pr-10 text-sm',
  lg: 'h-12 pl-4 pr-12 text-base',
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      size = 'md',
      id,
      options,
      placeholder,
      disabled,
      children,
      ...rest
    },
    ref,
  ) => {
    const reactId = React.useId();
    const selectId = id ?? reactId;
    const describedBy: string[] = [];
    if (error) describedBy.push(`${selectId}-error`);
    if (helperText) describedBy.push(`${selectId}-helper`);

    return (
      <div className={cn('w-full', containerClassName)}>
        {label ? (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white text-slate-900 transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500',
              sizeClasses[size],
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-300 focus:border-red-500 focus:ring-red-100',
              className,
            )}
            {...rest}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        {error ? (
          <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = 'Select';