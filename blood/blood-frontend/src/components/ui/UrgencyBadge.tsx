import * as React from 'react';
import { cn } from '@/lib/utils';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface UrgencyBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  urgency?: UrgencyLevel;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

const levelConfig: Record<UrgencyLevel, { classes: string; dot: string; label: string }> = {
  CRITICAL: {
    classes: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-500',
    label: 'Critical',
  },
  HIGH: {
    classes: 'bg-orange-50 text-orange-700 ring-orange-200',
    dot: 'bg-orange-500',
    label: 'High',
  },
  MEDIUM: {
    classes: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
    label: 'Medium',
  },
  LOW: {
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Low',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

function normalize(level?: string): UrgencyLevel | null {
  if (!level) return null;
  const u = level.toUpperCase();
  if (u === 'CRITICAL' || u === 'EMERGENCY') return 'CRITICAL';
  if (u === 'HIGH' || u === 'URGENT') return 'HIGH';
  if (u === 'MEDIUM' || u === 'ROUTINE' || u === 'NORMAL') return 'MEDIUM';
  if (u === 'LOW') return 'LOW';
  return null;
}

export const UrgencyBadge = React.forwardRef<HTMLSpanElement, UrgencyBadgeProps>(
  (
    { urgency, pulse, size = 'md', className, children, ...rest },
    ref,
  ) => {
    const resolved = normalize(urgency);
    if (!resolved) return null;
    const cfg = levelConfig[resolved];
    const shouldPulse = (pulse ?? resolved === 'CRITICAL') && resolved === 'CRITICAL';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium ring-1 ring-inset whitespace-nowrap',
          cfg.classes,
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            cfg.dot,
            shouldPulse && 'animate-pulse',
          )}
          aria-hidden="true"
        />
        {children ?? cfg.label}
      </span>
    );
  },
);
UrgencyBadge.displayName = 'UrgencyBadge';