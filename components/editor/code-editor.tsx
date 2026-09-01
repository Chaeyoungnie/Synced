'use client'

import { useState, useCallback } from 'react'
import { FileCode2, FileJson, Hash, X, Code2, MousePointerClick } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { CodeMirrorEditor } from './code-mirror-editor'
import type { RemoteCursor } from '@/lib/codemirror/remote-cursors'
import { fileContents as defaultContents } from './data'

function getFileIcon(name: string) {
  if (name.endsWith('.json')) return <FileJson className="size-3.5 text-amber-400" />
  if (name.endsWith('.css')) return <Hash className="size-3.5 text-cyan-400" />
  return <FileCode2 className="size-3.5 text-violet-400" />
}

function getLanguage(name: string): string {
  const ext = name.split('.').pop()
  switch (ext) {
    case 'tsx':
    case 'ts':
      return 'TypeScript'
    case 'jsx':
    case 'js':
      return 'JavaScript'
    case 'css':
      return 'CSS'
    case 'json':
      return 'JSON'
    case 'html':
      return 'HTML'
    default:
      return ext?.toUpperCase() || 'Text'
  }
}

export function EmptyState({ onNewFile }: { onNewFile?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
        <Code2 className="size-8 text-muted-foreground/50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No file open</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select a file from the sidebar or create a new one
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={onNewFile}>
          <FileCode2 className="size-3" /> New file
        </Button>
        <span className="text-[10px] text-muted-foreground">
          or press <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[9px] font-mono">Ctrl+P</kbd> to search
        </span>
      </div>
    </div>
  )
}

export function CodeEditor({
  activeFile,
  onFileChange,
  fileContents,
  onCloseFile,
  onCursorChange,
  remoteCursors = [],
}: {
  activeFile: string
  onFileChange?: (file: string) => void
  fileContents?: Record<string, string>
  onCloseFile?: () => void
  onCursorChange?: (line: number, col: number) => void
  remoteCursors?: RemoteCursor[]
}) {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
  const allContents = fileContents ?? defaultContents
  const content = allContents[activeFile]

  const handleCursorChange = useCallback(
    (line: number, col: number) => {
      setCursorPos({ line, col })
      onCursorChange?.(line, col)
    },
    [onCursorChange],
  )

  if (!content && content !== '') {
    return <EmptyState onNewFile={() => onFileChange?.('new')} />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      {/* File header */}
      <div className="flex h-11 shrink-0 items-center border-b border-border bg-card/40 px-3">
        {getFileIcon(activeFile)}
        <span className="ml-2 text-xs font-medium">{activeFile}</span>
        <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[9px] font-mono">
          {getLanguage(activeFile)}
        </Badge>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-xs" className="ml-auto text-muted-foreground" />
            }
            aria-label="Close file"
            onClick={onCloseFile}
          >
            <X className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Close file</TooltipContent>
        </Tooltip>
      </div>

      {/* Editor */}
      <div className="min-h-0 flex-1 overflow-auto">
        <CodeMirrorEditor
          value={content}
          filename={activeFile}
          onChange={(value) => {
            console.log(`${activeFile} updated:`, value.length, 'chars')
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex h-7 shrink-0 items-center gap-4 border-t border-border bg-card/40 px-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-400" /> Ready
        </span>
        <span className="hidden sm:inline">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span className="ml-auto hidden sm:flex items-center gap-2">
          <span>{getLanguage(activeFile)}</span>
          <span className="text-border">|</span>
          <span>UTF-8</span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1"><MousePointerClick className="size-2.5" /> Spaces: 2</span>
        </span>
      </div>
    </div>
  )
}
