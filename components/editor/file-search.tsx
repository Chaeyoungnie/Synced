'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Search, FileCode2, FileJson, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface FileSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: { name: string; path?: string }[]
  onSelect: (fileName: string) => void
}

function fuzzyMatch(query: string, text: string): { match: boolean; score: number } {
  if (!query) return { match: true, score: 0 }
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  // Exact substring match (high score)
  const idx = lower.indexOf(q)
  if (idx !== -1) return { match: true, score: 100 - idx }

  // Character-by-character fuzzy
  let qi = 0
  let score = 0
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) {
      qi++
      score += 10 - i // Earlier matches score higher
    }
  }
  return qi === q.length ? { match: true, score } : { match: false, score: 0 }
}

function getFileIcon(name: string) {
  if (name.endsWith('.json')) return <FileJson className="size-3.5 text-amber-400" />
  if (name.endsWith('.css')) return <Hash className="size-3.5 text-cyan-400" />
  return <FileCode2 className="size-3.5 text-violet-400" />
}

export function FileSearch({ open, onOpenChange, files, onSelect }: FileSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    if (!query) return files.map((f) => ({ ...f, score: 0 }))
    return files
      .map((f) => {
        // Match against name first, then path as fallback
        const nameMatch = fuzzyMatch(query, f.name)
        const pathMatch = f.path ? fuzzyMatch(query, f.path) : { match: false, score: 0 }
        const match = nameMatch.match || pathMatch.match
        const score = nameMatch.match ? nameMatch.score + 50 : pathMatch.score // Prefer name matches
        return { ...f, match, score }
      })
      .filter((f) => f.match)
      .sort((a, b) => b.score - a.score)
  }, [query, files])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            onSelect(results[selectedIndex].name)
            onOpenChange(false)
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          break
      }
    },
    [results, selectedIndex, onSelect, onOpenChange],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-md rounded-lg border border-border bg-popover shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name..."
            className="border-0 focus-visible:ring-0 h-11"
            onKeyDown={handleKeyDown}
          />
          <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-auto p-1">
          {results.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">No files found</p>
          ) : (
            results.slice(0, 25).map((file, i) => (
              <button
                key={file.name + file.path}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  i === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
                onClick={() => {
                  onSelect(file.name)
                  onOpenChange(false)
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {getFileIcon(file.name)}
                <span className="flex-1 text-left truncate">{file.name}</span>
                {file.path && (
                  <span className="text-[10px] text-muted-foreground/60 truncate max-w-[150px]">{file.path}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
