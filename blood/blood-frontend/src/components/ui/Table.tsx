import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped = false, hoverable = true, ...rest }, ref) => (
    <table
      ref={ref}
      className={cn('w-full border-collapse text-sm', className)}
      data-striped={striped ? 'true' : undefined}
      data-hoverable={hoverable ? 'true' : undefined}
      {...rest}
    />
  ),
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...rest }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-slate-50 border-b border-slate-200', className)}
    {...rest}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...rest }, ref) => (
  <tbody ref={ref} className={cn('bg-white', className)} {...rest} />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    striped?: boolean;
    hoverable?: boolean;
  }
>(({ className, striped = false, hoverable = true, ...rest }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors',
      striped && 'even:bg-slate-50/60',
      hoverable && 'hover:bg-slate-50',
      className,
    )}
    {...rest}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...rest }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
      className,
    )}
    {...rest}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...rest }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100 last:border-b-0',
      className,
    )}
    {...rest}
  />
));
TableCell.displayName = 'TableCell';

export interface TableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  colSpan?: number;
}

export const TableEmpty = React.forwardRef<HTMLTableRowElement, TableEmptyProps>(
  ({ className, colSpan = 1, children, ...rest }, ref) => (
    <tr ref={ref} className={className} {...rest}>
      <td
        colSpan={colSpan}
        className="px-4 py-12 text-center text-sm text-slate-500"
      >
        {children}
      </td>
    </tr>
  ),
);
TableEmpty.displayName = 'TableEmpty';