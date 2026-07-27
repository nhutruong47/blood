import * as React from 'react';
import { Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BloodGroup =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export type BloodGroupShort =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

const SHORT_BY_GROUP: Record<BloodGroup, BloodGroupShort> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
};

const GROUP_BY_SHORT: Record<BloodGroupShort, BloodGroup> = {
  'A+': 'A_POSITIVE',
  'A-': 'A_NEGATIVE',
  'B+': 'B_POSITIVE',
  'B-': 'B_NEGATIVE',
  'AB+': 'AB_POSITIVE',
  'AB-': 'AB_NEGATIVE',
  'O+': 'O_POSITIVE',
  'O-': 'O_NEGATIVE',
};

const colorClasses: Record<BloodGroup, { bg: string; text: string; ring: string }> = {
  O_POSITIVE: { bg: 'bg-red-50', text: 'text-red-500', ring: 'ring-red-200' },
  O_NEGATIVE: { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-300' },
  A_POSITIVE: { bg: 'bg-blue-50', text: 'text-blue-500', ring: 'ring-blue-200' },
  A_NEGATIVE: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-300' },
  B_POSITIVE: { bg: 'bg-purple-50', text: 'text-purple-500', ring: 'ring-purple-200' },
  B_NEGATIVE: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-300' },
  AB_POSITIVE: { bg: 'bg-teal-50', text: 'text-teal-500', ring: 'ring-teal-200' },
  AB_NEGATIVE: { bg: 'bg-teal-100', text: 'text-teal-600', ring: 'ring-teal-300' },
};

export type BloodTypeBadgeSize = 'sm' | 'md' | 'lg';

export interface BloodTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  bloodGroup?: string;
  short?: BloodGroupShort;
  size?: BloodTypeBadgeSize;
  showIcon?: boolean;
  /** Render as a solid colored block (when used as an avatar/category badge). */
  solid?: boolean;
}

function normalizeGroup(input?: string): BloodGroup | null {
  if (!input) return null;
  if ((Object.values(GROUP_BY_SHORT) as string[]).includes(input)) {
    return input as BloodGroup;
  }
  if (input in SHORT_BY_GROUP) {
    return input as BloodGroup;
  }
  return null;
}

function resolveShort(input?: string): BloodGroupShort | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  if (upper in SHORT_BY_GROUP) return SHORT_BY_GROUP[upper as BloodGroup];
  const stripped = upper.replace(/\s+/g, '').replace('_', '');
  // Try compact forms like "AB_POSITIVE" -> "AB+"
  const compact: Record<string, BloodGroupShort> = {
    APOSITIVE: 'A+',
    ANEGATIVE: 'A-',
    BPOSITIVE: 'B+',
    BNEGATIVE: 'B-',
    ABPOSITIVE: 'AB+',
    ABNEGATIVE: 'AB-',
    OPOSITIVE: 'O+',
    ONEGATIVE: 'O-',
  };
  return compact[stripped] ?? null;
}

const sizeClasses: Record<BloodTypeBadgeSize, string> = {
  sm: 'h-6 min-w-[2.25rem] px-2 text-[11px] gap-1',
  md: 'h-8 min-w-[3rem] px-2.5 text-xs gap-1.5',
  lg: 'h-10 min-w-[3.5rem] px-3 text-sm gap-1.5',
};

const iconSizes: Record<BloodTypeBadgeSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export const BloodTypeBadge = React.forwardRef<HTMLSpanElement, BloodTypeBadgeProps>(
  (
    {
      bloodGroup,
      short,
      size = 'md',
      showIcon = false,
      solid = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const group = normalizeGroup(bloodGroup);
    const resolvedShort = short ?? (group ? SHORT_BY_GROUP[group] : undefined) ?? resolveShort(bloodGroup);
    if (!resolvedShort) return null;
    const palette = group ? colorClasses[group] : colorClasses.O_POSITIVE;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-tight ring-1 ring-inset whitespace-nowrap',
          solid
            ? `${palette.bg} ${palette.text} ${palette.ring}`
            : `bg-white text-slate-700 ring-slate-200`,
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {showIcon ? (
          <Droplet
            className={cn(
              iconSizes[size],
              group ? palette.text : 'text-slate-400',
              'fill-current',
            )}
            aria-hidden="true"
          />
        ) : null}
        {resolvedShort}
        {children}
      </span>
    );
  },
);
BloodTypeBadge.displayName = 'BloodTypeBadge';