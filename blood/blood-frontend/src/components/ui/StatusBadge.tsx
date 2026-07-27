import * as React from 'react';
import { Badge, type BadgeVariant } from './Badge';

export type StatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'red'
  | 'green'
  | 'yellow'
  | 'gray'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'teal';

const toneMap: Record<StatusTone, BadgeVariant> = {
  neutral: 'gray',
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  red: 'red',
  green: 'green',
  yellow: 'yellow',
  gray: 'gray',
  blue: 'blue',
  purple: 'purple',
  orange: 'orange',
  teal: 'teal',
};

export interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status?: string;
  tone?: StatusTone;
  label?: React.ReactNode;
  dot?: boolean;
  size?: 'sm' | 'md';
}

function autoTone(status?: string): StatusTone {
  if (!status) return 'neutral';
  const u = status.toUpperCase();
  if (
    ['ACTIVE', 'COMPLETED', 'FULFILLED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL', 'RESOLVED', 'AVAILABLE'].includes(u)
  )
    return 'success';
  if (['PENDING', 'SUBMITTED', 'PROCESSING', 'TRIAGED', 'MATCHING_DONOR', 'RESERVED'].includes(u))
    return 'info';
  if (['WARNING', 'EXPIRING', 'NEAR_EXPIRY', 'DEFERRED'].includes(u)) return 'warning';
  if (
    ['REJECTED', 'CANCELLED', 'EXPIRED', 'INACTIVE', 'SUSPENDED', 'FAILED', 'ERROR'].includes(u)
  )
    return 'danger';
  return 'neutral';
}

function formatLabel(status?: string): string {
  if (!status) return '';
  return status
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    { status, tone, label, dot = true, size = 'md', className, ...rest },
    ref,
  ) => {
    const resolvedTone = tone ?? autoTone(status);
    return (
      <Badge
        ref={ref}
        variant={toneMap[resolvedTone]}
        dot={dot}
        size={size}
        className={className}
        {...rest}
      >
        {label ?? formatLabel(status)}
      </Badge>
    );
  },
);
StatusBadge.displayName = 'StatusBadge';