'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, FileCode2, FileJson, Hash, XCircle, MinusCircle, Columns2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  name: string
  type: 'code' | 'css' | 'json'
  modified?: boolean
}

function FileIcon({ type, className }: { type: Tab['type']; className?: string }) {
  switch (type) {
    case 'json':
      return <FileJson className={cn('size-3.5 shrink-0 text-amber-400', className)} />
    case 'css':
      return <Hash className={cn('size-3.5 shrink-0 text-cyan-400', className)} />
    default:
      return <FileCode2 className={cn('size-3.5 shrink-0 text-violet-400', className)} />
  }
}

interface TabContextMenuProps {
  tabId: string
  tabIndex: number
  totalTabs: number
  onTabClose: (id: string) => void
  onCloseOthers: (id: string) => void
  onCloseAll: () => void
  onCloseRight: (id: string) => void
}

function TabContextMenu({
  tabId,
  tabIndex,
  totalTabs,
  onTabClose,
  onCloseOthers,
  onCloseAll,
  onCloseRight,
}: TabContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('contextmenu', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('contextmenu', close)
    }
  }, [open])

  const items = [
    { label: 'Close', icon: <X className="size-3.5" />, onClick: () => onTabClose(tabId), disabled: totalTabs <= 1 },
    { label: 'Close Others', icon: <MinusCircle className="size-3.5" />, onClick: () => onCloseOthers(tabId), disabled: totalTabs <= 1 },
    { label: 'Close All', icon: <Trash2 className="size-3.5" />, onClick: onCloseAll },
    ...(tabIndex < totalTabs - 1
      ? [{ label: 'Close Right', icon: <Columns2 className="size-3.5" />, onClick: () => onCloseRight(tabId) }]
      : []),
  ]

  return (
    <>
      <div
        ref={ref}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setPos({ x: e.clientX, y: e.clientY })
          setOpen(true)
        }}
        className="contents"
      />
      {open &&
        createPortal(
          <div
            className="fixed z-[100] min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95 duration-100"
            style={{ top: pos.y, left: pos.x }}
          >
            {items.map((item, i) => (
              <button
                key={i}
                disabled={item.disabled}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  item.disabled
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                onClick={() => {
                  item.onClick()
                  setOpen(false)
                }}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabReorder?: (fromIndex: number, toIndex: number) => void
  onTabCloseOthers?: (tabId: string) => void
  onTabCloseAll?: () => void
  onTabCloseRight?: (tabId: string) => void
  onSplitRight?: (tabId: string) => void
}

export function TabBar({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  onTabReorder,
  onTabCloseOthers,
  onTabCloseAll,
  onTabCloseRight,
}: TabBarProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounterRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tabs[index].id)
    const ghost = document.createElement('div')
    ghost.style.opacity = '0'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }, [tabs])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    dragCounterRef.current++
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    dragCounterRef.current = 0
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onTabReorder?.(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, onTabReorder])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragCounterRef.current = 0
  }, [])

  // Scroll active tab into view
  useEffect(() => {
    const activeIdx = tabs.findIndex((t) => t.id === activeTab)
    if (activeIdx >= 0 && scrollRef.current) {
      const tabEl = scrollRef.current.children[activeIdx] as HTMLElement
      tabEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [activeTab, tabs])

  return (
    <div
      ref={scrollRef}
      className="flex h-9 shrink-0 overflow-x-auto border-b border-border bg-card/20 tab-scrollbar"
    >
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={cn(
            'group flex shrink-0 items-center border-r border-border transition-all duration-150 relative',
            activeTab === tab.id
              ? 'bg-background text-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            draggedIndex === index && 'opacity-40',
            dragOverIndex === index && draggedIndex !== index && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary before:z-10',
          )}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
            onClick={() => onTabSelect(tab.id)}
          >
            <FileIcon type={tab.type} />
            <span className="max-w-[120px] truncate">{tab.name}</span>
            {tab.modified && (
              <span className="size-1.5 shrink-0 rounded-full bg-orange-400 animate-pulse" />
            )}
          </button>
          <div className="flex items-center pr-1">
            <button
              className="rounded p-0.5 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              aria-label={`Close ${tab.name}`}
            >
              <X className="size-3" />
            </button>
          </div>
          <TabContextMenu
            tabId={tab.id}
            tabIndex={index}
            totalTabs={tabs.length}
            onTabClose={onTabClose}
            onCloseOthers={onTabCloseOthers || (() => {})}
            onCloseAll={onTabCloseAll || (() => {})}
            onCloseRight={onTabCloseRight || (() => {})}
          />
        </div>
      ))}
    </div>
  )
}
