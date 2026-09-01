'use client'

import { useMemo } from 'react'
import { X, GitCompareArrows } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DiffLine {
  oldNum: number | null
  newNum: number | null
  oldText: string
  newText: string
  type: 'same' | 'added' | 'removed' | 'changed'
}

interface DiffViewerProps {
  oldContent: string
  newContent: string
  oldLabel?: string
  newLabel?: string
  onClose?: () => void
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: DiffLine[] = []

  // Simple LCS-based diff
  const m = oldLines.length
  const n = newLines.length

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find aligned lines
  const pairs: { oldIdx: number; newIdx: number }[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      pairs.unshift({ oldIdx: i - 1, newIdx: j - 1 })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      pairs.unshift({ oldIdx: -1, newIdx: j - 1 })
      j--
    } else {
      pairs.unshift({ oldIdx: i - 1, newIdx: -1 })
      i--
    }
  }

  // Build diff lines from aligned pairs
  for (const pair of pairs) {
    if (pair.oldIdx >= 0 && pair.newIdx >= 0) {
      result.push({
        oldNum: pair.oldIdx + 1,
        newNum: pair.newIdx + 1,
        oldText: oldLines[pair.oldIdx],
        newText: newLines[pair.newIdx],
        type: 'same',
      })
    } else if (pair.oldIdx >= 0) {
      result.push({
        oldNum: pair.oldIdx + 1,
        newNum: null,
        oldText: oldLines[pair.oldIdx],
        newText: '',
        type: 'removed',
      })
    } else {
      result.push({
        oldNum: null,
        newNum: pair.newIdx + 1,
        oldText: '',
        newText: newLines[pair.newIdx],
        type: 'added',
      })
    }
  }

  return result
}

function DiffStats({ lines }: { lines: DiffLine[] }) {
  const added = lines.filter(l => l.type === 'added').length
  const removed = lines.filter(l => l.type === 'removed').length
  const changed = lines.filter(l => l.type === 'changed').length

  return (
    <div className="flex items-center gap-2 text-[10px]">
      {added > 0 && <span className="text-emerald-500">+{added}</span>}
      {removed > 0 && <span className="text-red-500">-{removed}</span>}
      {changed > 0 && <span className="text-amber-500">~{changed}</span>}
      <span className="text-muted-foreground/50">{lines.length} lines</span>
    </div>
  )
}

export function DiffViewer({ oldContent, newContent, oldLabel = 'Old', newLabel = 'New', onClose }: DiffViewerProps) {
  const lines = useMemo(() => computeDiff(oldContent, newContent), [oldContent, newContent])

  return (
    <div className="flex h-full flex-col border-l border-border bg-card/50">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <GitCompareArrows className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium">Diff Viewer</span>
        <DiffStats lines={lines} />
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="ml-auto">
            <X className="size-3" />
          </Button>
        )}
      </div>

      {/* Labels */}
      <div className="flex border-b border-border">
        <div className="flex-1 border-r border-border px-3 py-1">
          <span className="text-[10px] font-medium text-muted-foreground">{oldLabel}</span>
        </div>
        <div className="flex-1 px-3 py-1">
          <span className="text-[10px] font-medium text-muted-foreground">{newLabel}</span>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-[11px] leading-[18px]">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className={cn(
                line.type === 'added' && 'bg-emerald-500/10',
                line.type === 'removed' && 'bg-red-500/10',
                line.type === 'changed' && 'bg-amber-500/10',
              )}>
                {/* Old side */}
                <td className={cn(
                  'w-1/2 border-r border-border p-0',
                  line.type === 'removed' && 'bg-red-500/5',
                )}>
                  <div className="flex">
                    <span className="w-8 shrink-0 select-none text-right pr-1.5 text-muted-foreground/40 text-[10px]">
                      {line.oldNum || ''}
                    </span>
                    <span className={cn(
                      'flex-1 px-2 whitespace-pre-wrap break-all',
                      line.type === 'removed' && 'text-red-400',
                      line.type === 'same' && 'text-muted-foreground',
                    )}>
                      {line.type !== 'added' ? line.oldText : ''}
                    </span>
                  </div>
                </td>
                {/* New side */}
                <td className={cn(
                  'w-1/2 p-0',
                  line.type === 'added' && 'bg-emerald-500/5',
                )}>
                  <div className="flex">
                    <span className="w-8 shrink-0 select-none text-right pr-1.5 text-muted-foreground/40 text-[10px]">
                      {line.newNum || ''}
                    </span>
                    <span className={cn(
                      'flex-1 px-2 whitespace-pre-wrap break-all',
                      line.type === 'added' && 'text-emerald-400',
                      line.type === 'same' && 'text-muted-foreground',
                    )}>
                      {line.type !== 'removed' ? line.newText : ''}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
