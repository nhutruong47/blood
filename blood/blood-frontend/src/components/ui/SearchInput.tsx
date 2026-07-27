import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

const sizeClasses = {
  sm: 'h-8 pl-8 pr-8 text-xs',
  md: 'h-10 pl-10 pr-10 text-sm',
  lg: 'h-12 pl-12 pr-12 text-base',
};

const iconSize = {
  sm: 'h-3.5 w-3.5 left-2.5',
  md: 'h-4 w-4 left-3',
  lg: 'h-5 w-5 left-3.5',
};

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      value,
      defaultValue,
      onChange,
      onSearch,
      debounceMs = 300,
      size = 'md',
      id,
      placeholder = 'Search...',
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<string>(defaultValue ?? '');
    const current = isControlled ? (value as string) : internal;
    const [debouncedValue, setDebouncedValue] = React.useState<string>(current);
    const reactId = React.useId();
    const inputId = id ?? reactId;

    const handleChange = (next: string) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    React.useEffect(() => {
      const handle = window.setTimeout(() => setDebouncedValue(current), debounceMs);
      return () => window.clearTimeout(handle);
    }, [current, debounceMs]);

    React.useEffect(() => {
      onSearch?.(debouncedValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue]);

    const hasValue = current.length > 0;

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <span
          className={cn(
            'pointer-events-none absolute inset-y-0 flex items-center text-slate-400',
            iconSize[size],
          )}
          aria-hidden="true"
        >
          <Search className={size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
        </span>
        <input
          ref={ref}
          id={inputId}
          type="search"
          value={current}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100',
            'transition-all duration-150',
            sizeClasses[size],
            className,
          )}
          {...rest}
        />
        {hasValue ? (
          <button
            type="button"
            onClick={() => handleChange('')}
            aria-label="Clear search"
            className={cn(
              'absolute inset-y-0 right-0 flex items-center text-slate-400 hover:text-slate-600',
              size === 'sm' ? 'pr-2' : size === 'lg' ? 'pr-4' : 'pr-3',
            )}
          >
            <X className={size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';