'use client'

import { ChevronRight, Home, FileCode2, FileJson, Hash, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface BreadcrumbsProps {
  filePath: string
  onNavigate?: (segment: string, index: number) => void
}

function SegmentIcon({ name, isLast }: { name: string; isLast: boolean }) {
  if (!isLast) {
    return <Folder className="size-3 shrink-0 text-muted-foreground/50" />
  }
  if (name.endsWith('.json')) return <FileJson className="size-3 shrink-0 text-amber-400" />
  if (name.endsWith('.css')) return <Hash className="size-3 shrink-0 text-cyan-400" />
  if (name.includes('.')) return <FileCode2 className="size-3 shrink-0 text-violet-400" />
  return <Folder className="size-3 shrink-0 text-muted-foreground/50" />
}

export function Breadcrumbs({ filePath, onNavigate }: BreadcrumbsProps) {
  const segments = filePath.split('/').filter(Boolean)

  return (
    <nav
      className="flex h-8 shrink-0 items-center gap-0 border-b border-border bg-card/20 px-3 text-[11px] text-muted-foreground overflow-x-auto"
      aria-label="File path"
    >
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate?.('', -1)}
        aria-label="Home"
      >
        <Home className="size-3" />
      </Button>
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1
        return (
          <span key={i} className="flex items-center shrink-0">
            <ChevronRight className="size-3 shrink-0 mx-0.5 opacity-30" />
            <button
              className={cn(
                'flex items-center gap-1 rounded px-1.5 py-0.5 transition-all duration-150',
                isLast
                  ? 'text-foreground font-medium bg-accent/30'
                  : 'hover:bg-accent hover:text-foreground',
              )}
              onClick={() => onNavigate?.(segment, i)}
            >
              <SegmentIcon name={segment} isLast={isLast} />
              <span>{segment}</span>
            </button>
          </span>
        )
      })}
    </nav>
  )
}
