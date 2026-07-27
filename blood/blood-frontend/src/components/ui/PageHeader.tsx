import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, breadcrumbs, actions, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-4 pb-6 mb-6 border-b border-slate-200 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
      {...rest}
    >
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1">
                    {crumb.href && !isLast ? (
                      <Link
                        to={crumb.href}
                        className="hover:text-red-600 transition-colors truncate max-w-[200px]"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          'truncate max-w-[240px]',
                          isLast && 'text-slate-700 font-medium',
                        )}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!isLast ? (
                      <ChevronRight
                        className="h-3.5 w-3.5 text-slate-300"
                        aria-hidden="true"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-500 max-w-3xl">{description}</p>
        ) : null}
        {children}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  ),
);
PageHeader.displayName = 'PageHeader';