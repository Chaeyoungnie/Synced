'use client'

import { useState } from 'react'
import { History, RotateCcw, Clock, ChevronDown, ChevronRight, FileCode2, Eye, GitCompareArrows } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { type FileVersion } from '@/hooks/use-file-versions'

interface VersionHistoryPanelProps {
  open: boolean
  onToggle: () => void
  versions: FileVersion[]
  loading: boolean
  currentFileName: string
  currentContent: string
  onRestore: (content: string) => void
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return minutes + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days < 7) return days + 'd ago'
  return new Date(dateStr).toLocaleDateString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function computeDiffStats(oldContent: string, newContent: string): { added: number; removed: number } {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  let added = 0
  let removed = 0
  const maxLen = Math.max(oldLines.length, newLines.length)
  for (let i = 0; i < maxLen; i++) {
    if (i >= oldLines.length) added++
    else if (i >= newLines.length) removed++
    else if (oldLines[i] !== newLines[i]) {
      added++
      removed++
    }
  }
  return { added, removed }
}

export function VersionHistoryPanel({
  open,
  onToggle,
  versions,
  loading,
  currentFileName,
  currentContent,
  onRestore,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [diffVersion, setDiffVersion] = useState<FileVersion | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const showPreview = (content: string) => {
    setPreviewContent(content)
  }

  if (!open) return null

  return (
    <div className="flex h-full flex-col border-l border-border bg-card/50">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <History className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium">Version History</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{versions.length} versions</span>
      </div>

      {/* File name indicator */}
      <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-1.5">
        <FileCode2 className="size-3 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground truncate">{currentFileName}</span>
      </div>

      {/* Diff panel */}
      {diffVersion && (
        <div className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[10px] font-medium text-muted-foreground">
              v{diffVersion.version_number} → Current
            </span>
            <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => setDiffVersion(null)}>
              Close
            </Button>
          </div>
          <div className="max-h-60 overflow-auto">
            <table className="w-full border-collapse font-mono text-[10px] leading-[16px]">
              <tbody>
                {(() => {
                  const oldLines = diffVersion.content.split('\n')
                  const newLines = currentContent.split('\n')
                  const maxLen = Math.max(oldLines.length, newLines.length)
                  const rows = []
                  for (let i = 0; i < maxLen; i++) {
                    const oldLine = oldLines[i] || ''
                    const newLine = newLines[i] || ''
                    const isSame = oldLine === newLine
                    rows.push(
                      <tr key={i} className={!isSame ? 'bg-emerald-500/5' : undefined}>
                        <td className="w-6 text-right pr-1 text-muted-foreground/30 select-none">{i + 1}</td>
                        <td className={cn('px-1', !isSame && 'text-red-400 bg-red-500/5', 'w-[45%]')}>{oldLine}</td>
                        <td className="w-px bg-border" />
                        <td className={cn('px-1', !isSame && 'text-emerald-400 bg-emerald-500/5', 'w-[45%]')}>{newLine}</td>
                      </tr>
                    )
                  }
                  return rows
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview panel */}
      {previewContent !== null && !diffVersion && (
        <div className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[10px] font-medium text-muted-foreground">Preview</span>
            <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => setPreviewContent(null)}>
              Close
            </Button>
          </div>
          <pre className="max-h-40 overflow-auto px-3 pb-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
            {previewContent}
          </pre>
        </div>
      )}

      {/* Version list */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <span className="ml-2 text-xs text-muted-foreground">Loading versions...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center">
            <History className="mx-auto size-6 text-muted-foreground/40" />
            <p className="mt-2 text-xs text-muted-foreground">No versions yet</p>
            <p className="text-[10px] text-muted-foreground/60">Versions are saved as you edit</p>
          </div>
        ) : (
          <div className="relative p-2">
            {/* Timeline line */}
            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-border" />

            {versions.map((version, i) => {
              const isSelected = selectedVersion === version.id
              const isExpanded = expandedVersions.has(version.id)
              const isCurrent = i === 0
              const prevVersion = versions[i + 1]
              const diff = prevVersion ? computeDiffStats(prevVersion.content, version.content) : null

              return (
                <div key={version.id} className="relative mb-1">
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-[18px] top-2.5 z-10 size-2 rounded-full border-2',
                    isCurrent ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background'
                  )} />

                  {/* Version entry */}
                  <div
                    className={cn(
                      'ml-9 rounded-md border border-transparent px-2 py-1.5 transition-colors cursor-pointer',
                      isSelected && 'border-primary/30 bg-accent'
                    )}
                    onClick={() => setSelectedVersion(isSelected ? null : version.id)}
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs font-medium',
                        isCurrent ? 'text-primary' : 'text-foreground'
                      )}>
                        v{version.version_number}
                      </span>
                      {isCurrent && (
                        <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
                          CURRENT
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {formatTimeAgo(version.created_at)}
                      </span>
                    </div>

                    {/* Diff stats */}
                    {diff && (diff.added > 0 || diff.removed > 0) && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                        {diff.added > 0 && (
                          <span className="text-emerald-500">+{diff.added}</span>
                        )}
                        {diff.removed > 0 && (
                          <span className="text-red-500">-{diff.removed}</span>
                        )}
                        <span className="text-muted-foreground/50">lines changed</span>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                      <Clock className="size-2.5" />
                      {formatDate(version.created_at)}
                    </div>

                    {/* Expanded actions */}
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] gap-1"
                          onClick={(e) => { e.stopPropagation(); showPreview(version.content) }}
                        >
                          <Eye className="size-2.5" /> Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] gap-1"
                          onClick={(e) => { e.stopPropagation(); setDiffVersion(version) }}
                        >
                          <GitCompareArrows className="size-2.5" /> Diff
                        </Button>
                        {!isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] gap-1"
                            onClick={(e) => { e.stopPropagation(); onRestore(version.content) }}
                          >
                            <RotateCcw className="size-2.5" /> Restore
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] gap-1 ml-auto"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(version.id) }}
                        >
                          {isExpanded ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
                          {isExpanded ? 'Less' : 'More'}
                        </Button>
                      </div>
                    )}

                    {/* Expanded content preview */}
                    {isSelected && isExpanded && (
                      <pre className="mt-2 max-h-32 overflow-auto rounded border border-border bg-muted/30 p-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                        {version.content}
                      </pre>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
