import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextareaSize;
  containerClassName?: string;
}

const sizeClasses: Record<TextareaSize, string> = {
  sm: 'px-3 py-2 text-xs min-h-[80px]',
  md: 'px-3.5 py-2.5 text-sm min-h-[100px]',
  lg: 'px-4 py-3 text-base min-h-[140px]',
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
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
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
          className={cn(
            'w-full rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-150 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500',
            sizeClasses[size],
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:border-red-500 focus:ring-red-100',
            className,
          )}
          {...rest}
        />
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
Textarea.displayName = 'Textarea';