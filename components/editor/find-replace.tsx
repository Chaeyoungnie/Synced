'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Replace, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FindReplaceProps {
  open: boolean
  onClose: () => void
  onFind: (query: string) => void
  onReplace: (query: string, replacement: string) => void
  onReplaceAll: (query: string, replacement: string) => void
  matchCount: number
  currentMatch: number
}

export function FindReplace({
  open,
  onClose,
  onFind,
  onReplace,
  onReplaceAll,
  matchCount,
  currentMatch,
}: FindReplaceProps) {
  const [query, setQuery] = useState('')
  const [replacement, setReplacement] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (query) {
      onFind(query)
    }
  }, [query, onFind])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Previous match — handled by parent
        } else {
          // Next match — handled by parent
        }
      }
    },
    [onClose]
  )

  if (!open) return null

  return (
    <div className="absolute right-4 top-2 z-40 flex w-80 flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-lg">
      {/* Find row */}
      <div className="flex items-center gap-2">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Find..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-7 text-sm"
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {matchCount > 0 ? `${currentMatch}/${matchCount}` : 'No results'}
        </span>
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Toggle replace"
        >
          <Replace className="size-4" />
        </button>
        <button
          onClick={onClose}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Close find"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Replace row */}
      {showReplace && (
        <div className="flex items-center gap-2">
          <Replace className="size-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Replace..."
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onReplace(query, replacement)}
            disabled={!query || matchCount === 0}
          >
            Replace
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onReplaceAll(query, replacement)}
            disabled={!query || matchCount === 0}
          >
            All
          </Button>
        </div>
      )}
    </div>
  )
}
