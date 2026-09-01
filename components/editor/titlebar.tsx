'use client'

import { useState, useEffect } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [platform, setPlatform] = useState<string>('win32')

  useEffect(() => {
    const api = (window as any).electronAPI
    if (!api) return
    api.getPlatform().then((p: string) => setPlatform(p))
  }, [])

  const isMac = platform === 'darwin'
  const isWindows = platform === 'win32'

  const handleMinimize = () => (window as any).electronAPI?.minimize()
  const handleMaximize = () => {
    ;(window as any).electronAPI?.maximize()
    setIsMaximized(!isMaximized)
  }
  const handleClose = () => (window as any).electronAPI?.close()

  // On macOS, use native traffic lights with spacing
  if (isMac) {
    return (
      <div className="flex h-8 shrink-0 items-center bg-card/50 border-b border-border">
        {/* Traffic light spacing — leave room for the native buttons */}
        <div className="w-20" />
        {/* Draggable area */}
        <div data-tauri-drag-region className="flex-1 h-full cursor-default" />
      </div>
    )
  }

  // Windows / Linux — custom window controls
  return (
    <div className="flex h-8 shrink-0 items-center bg-card/50 border-b border-border select-none">
      {/* Draggable area */}
      <div data-tauri-drag-region className="flex-1 h-full cursor-default" />
      {/* Window controls */}
      <div className="flex h-full">
        <button
          onClick={handleMinimize}
          className="flex h-full w-12 items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Minimize"
        >
          <Minus className="size-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="flex h-full w-12 items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Copy className="size-3" /> : <Square className="size-3" />}
        </button>
        <button
          onClick={handleClose}
          className="flex h-full w-12 items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
