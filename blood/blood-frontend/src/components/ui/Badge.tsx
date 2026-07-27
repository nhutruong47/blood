import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'red'
  | 'green'
  | 'yellow'
  | 'gray'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'teal';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  red: 'bg-red-50 text-red-700 ring-red-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
  gray: 'bg-slate-100 text-slate-600 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  red: 'bg-red-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  gray: 'bg-slate-400',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'gray', size = 'md', dot = false, children, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium ring-1 ring-inset whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotClasses[variant])}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  ),
);
Badge.displayName = 'Badge';