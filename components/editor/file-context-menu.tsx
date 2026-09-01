'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Copy,
  FilePlus,
  Pencil,
  Trash2,
  FolderPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileContextMenuProps {
  children: React.ReactNode
  fileName: string
  onRename?: (fileName: string) => void
  onDelete?: (fileName: string) => void
  onCopyPath?: (fileName: string) => void
  onNewFile?: () => void
  onNewFolder?: () => void
}

interface MenuItem {
  label: string
  icon: React.ReactNode
  shortcut?: string
  destructive?: boolean
  onClick: () => void
}

export function FileContextMenu({
  children,
  fileName,
  onRename,
  onDelete,
  onCopyPath,
  onNewFile,
  onNewFolder,
}: FileContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const items: MenuItem[] = [
    {
      label: 'New File',
      icon: <FilePlus className="size-3.5" />,
      shortcut: '⌘N',
      onClick: () => { onNewFile?.(); setOpen(false) },
    },
    {
      label: 'New Folder',
      icon: <FolderPlus className="size-3.5" />,
      onClick: () => { onNewFolder?.(); setOpen(false) },
    },
    { label: '', icon: null, onClick: () => {} }, // separator
    {
      label: 'Rename',
      icon: <Pencil className="size-3.5" />,
      shortcut: 'F2',
      onClick: () => { onRename?.(fileName); setOpen(false) },
    },
    {
      label: 'Copy Path',
      icon: <Copy className="size-3.5" />,
      shortcut: '⌘⇧C',
      onClick: () => { onCopyPath?.(fileName); setOpen(false) },
    },
    { label: '', icon: null, onClick: () => {} }, // separator
    {
      label: 'Delete',
      icon: <Trash2 className="size-3.5" />,
      shortcut: '⌫',
      destructive: true,
      onClick: () => { onDelete?.(fileName); setOpen(false) },
    },
  ]

  return (
    <>
      <div onContextMenu={handleContextMenu} className="contents">
        {children}
      </div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] min-w-[180px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95 duration-100"
            style={{ top: position.y, left: position.x }}
          >
            {items.map((item, i) => {
              if (!item.label) {
                return <div key={i} className="my-1 h-px bg-border" />
              }
              return (
                <button
                  key={i}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    item.destructive
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={item.onClick}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] text-muted-foreground">{item.shortcut}</span>
                  )}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
