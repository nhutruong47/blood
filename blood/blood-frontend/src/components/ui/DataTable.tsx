import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => unknown;
  cell?: (row: T, rowIndex: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  enableHiding?: boolean;
  defaultVisible?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;

  // Sorting
  defaultSort?: { key: string; direction: SortDirection };

  // Selection
  selectable?: boolean;
  selectedKeys?: Array<string | number>;
  onSelectionChange?: (keys: Array<string | number>) => void;

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  page?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // Column visibility
  enableColumnToggle?: boolean;
}

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    rowKey,
    loading = false,
    emptyTitle = 'No results found',
    emptyDescription = 'There is nothing to display here yet.',
    emptyIcon,
    emptyAction,
    defaultSort,
    selectable = false,
    selectedKeys,
    onSelectionChange,
    pageSize: controlledPageSize,
    pageSizeOptions = [5, 10, 20, 50],
    page: controlledPage,
    total,
    onPageChange,
    onPageSizeChange,
    enableColumnToggle = false,
  } = props;

  // Sorting state
  const [sortKey, setSortKey] = React.useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = React.useState<SortDirection>(defaultSort?.direction ?? 'asc');

  // Pagination (internal fallback when uncontrolled)
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalSize, setInternalSize] = React.useState(pageSizeOptions[1] ?? pageSizeOptions[0]);

  const pageSize = controlledPageSize ?? internalSize;
  const currentPage = controlledPage ?? internalPage;

  // Column visibility
  const initialVisible = React.useMemo(
    () =>
      new Set(
        columns.filter((c) => c.defaultVisible !== false).map((c) => c.key),
      ),
    [columns],
  );
  const [visibleCols, setVisibleCols] = React.useState<Set<string>>(initialVisible);
  const [columnMenuOpen, setColumnMenuOpen] = React.useState(false);

  // Selection
  const isControlledSelection = selectedKeys !== undefined;
  const [internalSelection, setInternalSelection] = React.useState<Array<string | number>>([]);
  const currentSelection = isControlledSelection ? (selectedKeys as Array<string | number>) : internalSelection;

  const setSelection = (next: Array<string | number>) => {
    if (!isControlledSelection) setInternalSelection(next);
    onSelectionChange?.(next);
  };

  // Sort
  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    const accessor = col.accessor;
    if (!accessor) return data;

    const copy = [...data];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const aStr = String(av).toLowerCase();
      const bStr = String(bv).toLowerCase();
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir, columns]);

  // Pagination
  const effectiveTotal = total ?? sortedData.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pagedData = React.useMemo(() => {
    if (controlledPage !== undefined || total !== undefined) return sortedData;
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize, controlledPage, total]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const setPage = (next: number) => {
    if (controlledPage === undefined) setInternalPage(next);
    onPageChange?.(next);
  };

  const setSize = (next: number) => {
    if (controlledPageSize === undefined) {
      setInternalSize(next);
      setInternalPage(1);
    }
    onPageSizeChange?.(next);
    onPageChange?.(1);
  };

  const visibleColumns = columns.filter(
    (c) => !enableColumnToggle || visibleCols.has(c.key),
  );

  const allKeysOnPage = pagedData.map(rowKey);
  const allSelectedOnPage =
    allKeysOnPage.length > 0 && allKeysOnPage.every((k) => currentSelection.includes(k));
  const someSelectedOnPage =
    !allSelectedOnPage && allKeysOnPage.some((k) => currentSelection.includes(k));

  const toggleAllOnPage = () => {
    if (allSelectedOnPage) {
      setSelection(currentSelection.filter((k) => !allKeysOnPage.includes(k)));
    } else {
      const merged = Array.from(new Set([...currentSelection, ...allKeysOnPage]));
      setSelection(merged);
    }
  };

  const toggleRow = (key: string | number) => {
    if (currentSelection.includes(key)) {
      setSelection(currentSelection.filter((k) => k !== key));
    } else {
      setSelection([...currentSelection, key]);
    }
  };

  const startIndex = (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, effectiveTotal);

  const renderPageButtons = () => {
    const buttons: React.ReactNode[] = [];
    const max = totalPages;
    const current = safePage;
    const add = (n: number) => {
      if (n < 1 || n > max) return;
      if (buttons.some((b) => React.isValidElement(b) && (b as React.ReactElement).key === `p-${n}`)) return;
      buttons.push(
        <button
          key={`p-${n}`}
          type="button"
          onClick={() => setPage(n)}
          aria-current={n === current ? 'page' : undefined}
          className={cn(
            'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-medium transition-colors',
            n === current
              ? 'bg-red-600 text-white'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          {n}
        </button>,
      );
    };
    const addEllipsis = (key: string) => {
      buttons.push(
        <span key={key} className="px-2 text-slate-400">
          …
        </span>,
      );
    };

    if (max <= 7) {
      for (let i = 1; i <= max; i++) add(i);
      return buttons;
    }

    add(1);
    if (current > 4) addEllipsis('e1');
    for (let i = Math.max(2, current - 1); i <= Math.min(max - 1, current + 1); i++) add(i);
    if (current < max - 3) addEllipsis('e2');
    add(max);
    return buttons;
  };

  return (
    <div className="w-full">
      {enableColumnToggle ? (
        <div className="flex items-center justify-end mb-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setColumnMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
              Columns
            </button>
            {columnMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 p-2 animate-in"
                onMouseLeave={() => setColumnMenuOpen(false)}
              >
                {columns.map((col) => {
                  const visible = visibleCols.has(col.key);
                  return (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        disabled={col.enableHiding === false}
                        onChange={() => {
                          setVisibleCols((prev) => {
                            const next = new Set(prev);
                            if (next.has(col.key)) next.delete(col.key);
                            else next.add(col.key);
                            return next;
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="truncate">{typeof col.header === 'string' ? col.header : col.key}</span>
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              {selectable ? (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={allSelectedOnPage}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelectedOnPage;
                    }}
                    onChange={toggleAllOnPage}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                </TableHead>
              ) : null}
              {visibleColumns.map((col) => {
                const isSortable = !!col.sortable;
                const isActive = sortKey === col.key;
                return (
                  <TableHead
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.className,
                    )}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-slate-700 transition-colors',
                          isActive && 'text-slate-900',
                        )}
                      >
                        {col.header}
                        {isActive ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                <TableRow key={`sk-${i}`} hoverable={false}>
                  {selectable ? (
                    <TableCell>
                      <Skeleton variant="rectangle" width={16} height={16} />
                    </TableCell>
                  ) : null}
                  {visibleColumns.map((col) => (
                    <TableCell key={`${i}-${col.key}`}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={(selectable ? 1 : 0) + visibleColumns.length}
                  className="p-0"
                >
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              pagedData.map((row, rowIdx) => {
                const key = rowKey(row);
                const isSelected = currentSelection.includes(key);
                return (
                  <TableRow key={key} striped={false}>
                    {selectable ? (
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`Select row ${rowIdx + 1}`}
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.map((col) => {
                      const value = col.cell
                        ? col.cell(row, rowIdx)
                        : col.accessor
                          ? (col.accessor(row) as React.ReactNode)
                          : null;
                      return (
                        <TableCell
                          key={col.key}
                          className={cn(
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            col.className,
                          )}
                        >
                          {value as React.ReactNode}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && pagedData.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Showing <span className="font-medium text-slate-700">{startIndex}</span>–
              <span className="font-medium text-slate-700">{endIndex}</span> of{' '}
              <span className="font-medium text-slate-700">{effectiveTotal}</span>
            </span>
            <label className="flex items-center gap-1.5">
              Rows per page:
              <select
                value={pageSize}
                onChange={(e) => setSize(Number(e.target.value))}
                className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              aria-label="First page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-0.5">{renderPageButtons()}</div>
            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Last page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}