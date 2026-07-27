import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  size?: InputSize;
  wrapperClassName?: string;
  containerClassName?: string;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3.5 text-sm',
  lg: 'h-12 px-4 text-base',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      containerClassName,
      label,
      error,
      helperText,
      iconLeft,
      iconRight,
      size = 'md',
      id,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedBy: string[] = [];
    if (error) describedBy.push(`${inputId}-error`);
    if (helperText) describedBy.push(`${inputId}-helper`);

    return (
      <div className={cn('w-full', containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        ) : null}
        <div className={cn('relative', wrapperClassName)}>
          {iconLeft ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {iconLeft}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
            className={cn(
              'w-full rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500',
              sizeClasses[size],
              iconLeft ? 'pl-9' : '',
              iconRight ? 'pr-9' : '',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-300 focus:border-red-500 focus:ring-red-100',
              className,
            )}
            {...rest}
          />
          {iconRight ? (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {iconRight}
            </span>
          ) : null}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';