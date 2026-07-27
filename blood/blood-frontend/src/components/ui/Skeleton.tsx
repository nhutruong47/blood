import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, variant = 'rectangle', width, height, style, lines = 1, ...rest },
    ref,
  ) => {
    const baseStyle: React.CSSProperties = { ...style };
    if (width !== undefined) baseStyle.width = typeof width === 'number' ? `${width}px` : width;
    if (height !== undefined) baseStyle.height = typeof height === 'number' ? `${height}px` : height;

    if (variant === 'text') {
      const items = Array.from({ length: Math.max(1, lines) }, (_, i) => i);
      return (
        <div ref={ref} className={cn('flex flex-col gap-2', className)} {...rest}>
          {items.map((i) => (
            <div
              key={i}
              className={cn(
                'skeleton h-3',
                i === items.length - 1 && items.length > 1 ? 'w-3/4' : 'w-full',
              )}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        style={baseStyle}
        className={cn(
          'skeleton',
          variant === 'circle' && 'rounded-full',
          variant === 'rectangle' && 'rounded-md',
          !width && !height && variant !== 'circle' && 'w-full h-4',
          !width && variant === 'circle' && 'h-10 w-10',
          className,
        )}
        {...rest}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';