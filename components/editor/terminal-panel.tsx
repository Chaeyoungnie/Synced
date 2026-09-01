'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Terminal, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  executeCommand,
  createInitialState,
  getPrompt,
  type TerminalLine,
  type TerminalState,
} from '@/lib/terminal/commands'
import type { FolderNode } from '@/components/editor/data'

interface TerminalPanelProps {
  open: boolean
  onToggle: () => void
  fileTree: FolderNode
  fileContents: Record<string, string>
  onSaveFile?: (name: string, content: string) => void
  onOpenFile?: (name: string) => void
}

function renderLine(line: TerminalLine) {
  if (line.type === 'input') {
    return <span className="text-foreground">{line.text}</span>
  }
  if (line.type === 'error') {
    return <span className="text-red-400">{line.text}</span>
  }
  if (line.type === 'info') {
    return <span className="text-emerald-400">{line.text}</span>
  }
  return <span className="text-muted-foreground">{line.text}</span>
}

export function TerminalPanel({
  open,
  onToggle,
  fileTree,
  fileContents,
  onSaveFile,
  onOpenFile,
}: TerminalPanelProps) {
  const [state, setState] = useState<TerminalState>(createInitialState)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.lines])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSubmit = useCallback(() => {
    const result = executeCommand(input, state, {
      fileTree,
      fileContents,
      onSaveFile,
      onOpenFile,
    })
    setState(result.newState)
    setInput('')
  }, [input, state, fileTree, fileContents, onSaveFile, onOpenFile])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (state.history.length > 0) {
        const newIndex = state.historyIndex < state.history.length - 1 ? state.historyIndex + 1 : state.historyIndex
        const cmd = state.history[state.history.length - 1 - newIndex]
        if (cmd !== undefined) {
          setInput(cmd)
          setState(prev => ({ ...prev, historyIndex: newIndex }))
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1
        const cmd = state.history[state.history.length - 1 - newIndex]
        setInput(cmd || '')
        setState(prev => ({ ...prev, historyIndex: newIndex }))
      } else {
        setInput('')
        setState(prev => ({ ...prev, historyIndex: -1 }))
      }
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      setState(prev => ({ ...prev, lines: [] }))
    }
  }, [state, handleSubmit])

  const handleClear = useCallback(() => {
    setState(prev => ({ ...prev, lines: [] }))
  }, [])

  if (!open) return null

  return (
    <div className="flex h-full flex-col bg-[#0a0a0f] text-sm font-mono">
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-1.5">
        <Terminal className="size-3.5 text-emerald-400" />
        <span className="text-[11px] font-medium text-muted-foreground">Terminal</span>
        <span className="text-[9px] text-muted-foreground/50">
          {state.cwd ? `~/workspace/${state.cwd}` : '~/workspace'}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleClear}
            className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground/50 hover:bg-white/5 hover:text-muted-foreground"
          >
            Clear
          </button>
          <button
            onClick={onToggle}
            className="rounded p-0.5 text-muted-foreground/50 hover:bg-white/5 hover:text-muted-foreground"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-3"
        onClick={() => inputRef.current?.focus()}
      >
        {state.lines.map((line) => (
          <div key={line.id} className="min-h-[18px] leading-[18px] whitespace-pre-wrap break-all">
            {renderLine(line)}
          </div>
        ))}

        {/* Current prompt line */}
        <div className="flex items-center gap-0 min-h-[18px] leading-[18px]">
          <span className="text-emerald-400 shrink-0">{getPrompt(state.cwd)} </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-foreground outline-none caret-emerald-400"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  )
}
