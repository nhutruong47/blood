import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TabsContextValue {
  value: string;
  setValue: (next: string) => void;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`${component} must be used within <Tabs>`);
  return ctx;
}

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
  id,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
  const reactId = React.useId();
  const baseId = id ?? reactId;

  const currentValue = isControlled ? (value as string) : internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue, baseId }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<TabListProps> = ({
  className,
  children,
  ...rest
}) => (
  <div
    role="tablist"
    aria-orientation="horizontal"
    className={cn(
      'flex items-center gap-1 border-b border-slate-200 overflow-x-auto',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const Tab: React.FC<TabProps> = ({
  className,
  value,
  icon,
  disabled = false,
  children,
  ...rest
}) => {
  const ctx = useTabsContext('Tab');
  const isActive = ctx.value === value;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;
  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded-t-md',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'text-red-600'
          : 'text-slate-500 hover:text-slate-700',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="inline-flex">{icon}</span> : null}
      {children}
      <span
        className={cn(
          'absolute inset-x-0 -bottom-px h-0.5 transition-opacity',
          isActive ? 'bg-red-600 opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      />
    </button>
  );
};

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  className,
  value,
  forceMount = false,
  children,
  ...rest
}) => {
  const ctx = useTabsContext('TabPanel');
  const isActive = ctx.value === value;
  if (!isActive && !forceMount) return null;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;
  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      className={cn('pt-4 animate-in', className)}
      {...rest}
    >
      {children}
    </div>
  );
};