import * as React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon, title, description, action, className, children, ...rest },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12',
        className,
      )}
      {...rest}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      {title ? (
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      ) : null}
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
      {children}
    </div>
  ),
);
EmptyState.displayName = 'EmptyState';