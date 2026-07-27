import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatCardColor = 'red' | 'blue' | 'green' | 'purple' | 'yellow' | 'orange';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  helperText?: string;
  color?: StatCardColor;
  loading?: boolean;
}

const colorClasses: Record<StatCardColor, { wrapper: string; icon: string }> = {
  red: {
    wrapper: 'bg-red-50 text-red-600',
    icon: 'bg-red-100 text-red-600',
  },
  blue: {
    wrapper: 'bg-blue-50 text-blue-600',
    icon: 'bg-blue-100 text-blue-600',
  },
  green: {
    wrapper: 'bg-emerald-50 text-emerald-600',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  purple: {
    wrapper: 'bg-purple-50 text-purple-600',
    icon: 'bg-purple-100 text-purple-600',
  },
  yellow: {
    wrapper: 'bg-amber-50 text-amber-600',
    icon: 'bg-amber-100 text-amber-600',
  },
  orange: {
    wrapper: 'bg-orange-50 text-orange-600',
    icon: 'bg-orange-100 text-orange-600',
  },
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      icon,
      trend,
      helperText,
      color = 'blue',
      loading = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const palette = colorClasses[color];
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
          className,
        )}
        {...rest}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {label}
            </p>
            {loading ? (
              <div className="skeleton mt-2 h-8 w-1/2" />
            ) : (
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {value}
              </p>
            )}
            {trend || helperText ? (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {trend ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 font-medium',
                      trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600',
                    )}
                  >
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {Math.abs(trend.value)}%
                  </span>
                ) : null}
                {trend?.label || helperText ? (
                  <span className="text-slate-500">{trend?.label ?? helperText}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          {icon ? (
            <div
              className={cn(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                palette.icon,
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
StatCard.displayName = 'StatCard';