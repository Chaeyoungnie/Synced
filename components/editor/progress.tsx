'use client'

import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  value: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  className?: string
}

const SIZES = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
}

const VARIANTS = {
  default: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

export function ProgressIndicator({
  value,
  size = 'md',
  variant = 'default',
  showLabel = false,
  className,
}: ProgressIndicatorProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn('overflow-hidden rounded-full bg-muted', SIZES[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-500 ease-out',
            VARIANTS[variant],
            SIZES[size],
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const SPINNER_SIZES = {
  xs: 'size-3 border',
  sm: 'size-4 border',
  md: 'size-6 border-2',
  lg: 'size-8 border-2',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-current border-t-transparent',
        SPINNER_SIZES[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-md bg-muted',
            i === lines - 1 ? 'h-3 w-3/4' : 'h-3 w-full',
            className,
          )}
        />
      ))}
    </div>
  )
}
