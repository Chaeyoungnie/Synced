'use client'

import { cn } from '@/lib/utils'

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn('animate-pulse rounded bg-muted', className)} style={style} />
  )
}

export function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="size-7 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* New file button */}
      <Skeleton className="mb-4 h-8 w-full rounded-md" />

      {/* Search */}
      <Skeleton className="mb-4 h-8 w-full rounded-md" />

      {/* Files heading */}
      <Skeleton className="mb-3 h-3 w-12" />

      {/* File tree items */}
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5" style={{ paddingLeft: `${(i % 3) * 12 + 12}px` }}>
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-3.5 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
          </div>
        ))}
      </div>

      {/* Collaborators */}
      <div className="mt-auto pt-6">
        <Skeleton className="mb-3 h-3 w-24" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex h-9 items-center gap-1 border-b border-border bg-muted/20 px-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-md px-3 py-1.5">
            <Skeleton className="h-3.5 rounded" style={{ width: `${50 + i * 15}px` }} />
            {i === 0 && <Skeleton className="size-3 rounded-full" />}
          </div>
        ))}
      </div>

      {/* Code lines */}
      <div className="flex-1 p-4 font-mono text-[12px] leading-[20px]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-6 text-right" />
            <Skeleton className="h-3.5 rounded" style={{ width: `${30 + Math.random() * 60}%` }} />
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex h-6 items-center gap-3 border-t border-border bg-muted/20 px-3">
        <Skeleton className="h-2.5 w-10" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  )
}

export function CollaborationSkeleton() {
  return (
    <div className="flex h-full flex-col border-l border-border bg-sidebar p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="size-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* People section */}
      <Skeleton className="mb-3 h-3 w-16" />
      <div className="mb-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Activity section */}
      <Skeleton className="mb-3 h-3 w-16" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-2.5 w-8" />
              </div>
              <Skeleton className="h-3 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="mt-auto pt-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="flex h-screen">
      <SidebarSkeleton />
      <div className="flex-1">
        <EditorSkeleton />
      </div>
      <CollaborationSkeleton />
    </div>
  )
}
