'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileCode2,
  FileJson,
  FilePlus,
  Folder,
  FolderOpen,
  Hash,
  MoreHorizontal,
  Search,
  Users,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileIcon, FolderIcon } from '@/components/editor/file-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { PresenceAvatar } from './presence-avatar'
import { FileContextMenu } from './file-context-menu'
import { collaborators as defaultCollaborators, type FileNode, type FolderNode, type GitStatus } from './data'

function GitStatusDot({ status }: { status?: GitStatus }) {
  if (!status || status === 'committed') return null
  return (
    <span
      className={cn(
        'ml-auto size-2 shrink-0 rounded-full',
        status === 'modified' && 'bg-amber-400',
        status === 'new' && 'bg-emerald-400',
        status === 'untracked' && 'bg-blue-400',
        status === 'deleted' && 'bg-red-400',
      )}
      title={status}
    />
  )
}

function flattenForSearch(tree: FolderNode, prefix = ''): { name: string; path: string }[] {
  const results: { name: string; path: string }[] = []
  for (const child of tree.children) {
    if ('children' in child) {
      results.push(...flattenForSearch(child, prefix ? `${prefix}/${child.name}` : child.name))
    } else {
      results.push({ name: child.name, path: prefix })
    }
  }
  return results
}

function SidebarSearch({ fileTree, onFileChange }: { fileTree: FolderNode; onFileChange: (name: string) => void }) {
  const [query, setQuery] = useState('')
  const allFiles = useMemo(() => flattenForSearch(fileTree), [fileTree])
  const [selectedIdx, setSelectedIdx] = useState(0)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allFiles.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)).slice(0, 10)
  }, [query, allFiles])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(prev => Math.min(prev + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(prev => Math.max(prev - 1, 0)) }
    if (e.key === 'Enter' && results[selectedIdx]) { onFileChange(results[selectedIdx].name); setQuery(''); setSelectedIdx(0) }
    if (e.key === 'Escape') { setQuery(''); setSelectedIdx(0) }
  }

  if (!query.trim()) {
    return (
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0) }}
          onKeyDown={handleKeyDown}
          placeholder="Search files..."
          className="w-full rounded-md border border-border bg-background px-2 pl-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0) }}
        onKeyDown={handleKeyDown}
        placeholder="Search files..."
        className="w-full rounded-md border border-border bg-background px-2 pl-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        autoFocus
      />
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-lg">
          {results.map((file, i) => (
            <button
              key={file.name + file.path}
              className={cn(
                'flex w-full items-center gap-2 px-2.5 py-1.5 text-xs transition-colors',
                i === selectedIdx ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
              )}
              onClick={() => { onFileChange(file.name); setQuery(''); setSelectedIdx(0) }}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <FileCode2 className="size-3 shrink-0" />
              <span className="truncate font-medium">{file.name}</span>
              {file.path && <span className="ml-auto truncate text-[10px] text-muted-foreground/50">{file.path}</span>}
            </button>
          ))}
        </div>
      )}
      {query && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-popover p-2 text-center text-xs text-muted-foreground shadow-lg">
          No files found
        </div>
      )}
    </div>
  )
}

function FileBadge({ type }: { type: FileNode["type"] }) {
  switch (type) {
    case 'json':
      return <FileJson className="size-4 shrink-0 text-amber-400" />
    case 'css':
      return <Hash className="size-4 shrink-0 text-cyan-400" />
    default:
      return <FileCode2 className="size-4 shrink-0 text-violet-400" />
  }
}

function PresenceDot({ users, fileName }: { users: { name: string; initials: string; color: string }[]; fileName: string }) {
  if (users.length === 0) return null
  return (
    <div className="ml-auto flex -space-x-1.5">
      {users.slice(0, 3).map((u, i) => (
        <div
          key={i}
          className="size-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white ring-2 ring-sidebar"
          style={{ backgroundColor: u.color }}
          title={u.name}
        >
          {u.initials}
        </div>
      ))}
      {users.length > 3 && (
        <div className="size-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white bg-muted ring-2 ring-sidebar">
          +{users.length - 3}
        </div>
      )}
    </div>
  )
}

function FolderItem({
  folder,
  depth,
  activeFile,
  onFileChange,
  onFileRename,
  onFileDelete,
  onToggleFolder,
  modifiedFiles,
  filePresenceMap,
}: {
  folder: FolderNode
  depth: number
  activeFile: string
  onFileChange: (file: string) => void
  onFileRename?: (name: string) => void
  onFileDelete?: (name: string) => void
  onToggleFolder: (path: string) => void
  modifiedFiles?: Set<string>
  fileTree?: FolderNode
  collaboratorList?: { name: string; initials: string; color: string; role: string; status: string }[]
  filePresenceMap?: Record<string, { name: string; initials: string; color: string }[]>
}) {
  return (
    <div>
      <button
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => onToggleFolder(folder.name)}
      >
        {folder.open ? (
          <ChevronDown className="size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" />
        )}
        {folder.open ? (
          <FolderOpen className="size-4 shrink-0 text-primary/70" />
        ) : (
          <Folder className="size-4 shrink-0 text-primary/70" />
        )}
        <span className="truncate font-medium">{folder.name}</span>
      </button>
      {folder.open && (
        <div>
          {folder.children.map((child) => {
            if ('children' in child) {
              return (              <FolderItem
                        key={child.name}
                        folder={child}
                        depth={depth + 1}
                        activeFile={activeFile}
                        onFileChange={onFileChange}
                        onFileRename={onFileRename}
                        onFileDelete={onFileDelete}
                        onToggleFolder={onToggleFolder}
                        modifiedFiles={modifiedFiles}
                        filePresenceMap={filePresenceMap}
                      />
              )
            }
            return (
              <FileContextMenu
                key={child.name}
                fileName={child.name}
                onRename={onFileRename}
                onDelete={onFileDelete}
                onCopyPath={(name) => navigator.clipboard?.writeText(`components/editor/${name}`)}
              >
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 text-left text-[13px] transition-colors',
                    activeFile === child.name
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                  style={{ paddingLeft: `${(depth + 1) * 12 + 12}px`, paddingRight: '12px' }}
                  onClick={() => onFileChange(child.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onFileChange(child.name)
                    }
                  }}
                >
                  <FileBadge type={child.type} />
                  <span className="truncate">{child.name}</span>
                  <PresenceDot users={filePresenceMap?.[child.name] || []} fileName={child.name} />
                  {modifiedFiles?.has(child.name) && (
                    <span className="ml-auto size-1.5 shrink-0 rounded-full bg-orange-400" title="Unsaved changes" />
                  )}
                  <GitStatusDot status={child.status} />
                </div>
              </FileContextMenu>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar({
  collapsed,
  onToggle,
  activeFile,
  onFileChange,
  onFileRename,
  onFileDelete,
  onNewFile,
  mobileSheetOpen,
  onMobileSheetToggle,
  modifiedFiles,
  fileTree,
  collaboratorList,
  filePresenceMap,
}: {
  collapsed: boolean
  onToggle: () => void
  activeFile: string
  onFileChange: (file: string) => void
  onFileRename?: (fileName: string) => void
  onFileDelete?: (fileName: string) => void
  onNewFile?: () => void
  mobileSheetOpen?: boolean
  onMobileSheetToggle?: () => void
  modifiedFiles?: Set<string>
  fileTree?: FolderNode
  collaboratorList?: { name: string; initials: string; color: string; role: string; status: string }[]
  filePresenceMap?: Record<string, { name: string; initials: string; color: string }[]>
}) {
  const activeCollaborators = collaboratorList || defaultCollaborators

  const [folderState, setFolderState] = useState<Record<string, boolean>>({
    'collaborative-editor': true,
    components: true,
    editor: true,
    ui: true,
  })

  const toggleFolder = useCallback((name: string) => {
    setFolderState((prev) => ({ ...prev, [name]: !prev[name] }))
  }, [])

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar overflow-hidden min-w-0 w-full',
        collapsed && 'items-center',
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b border-border px-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 rounded-md p-1 -m-1 transition-colors hover:bg-accent/50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="flex size-7 items-center justify-center rounded bg-primary text-primary-foreground">
            <Code2 className="size-4" />
          </div>
          {!collapsed && <span className="ml-1 text-sm font-semibold tracking-tight">Synced</span>}
        </button>

        {!collapsed && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggle}
                  className="ml-auto text-muted-foreground"
                />
              }
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-1 py-2 text-muted-foreground">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onToggle}
                  className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground"
                />
              }
              aria-label="Expand sidebar"
            >
              <Search className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right">Search & browse files</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onToggle}
                  className="flex size-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-accent hover:text-foreground"
                />
              }
              aria-label="Expand sidebar"
            >
              <FolderOpen className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right">Browse files</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onToggle}
                  className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground"
                />
              }
              aria-label="Expand sidebar"
            >
              <Users className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right">Collaborators</TooltipContent>
          </Tooltip>

          <Separator className="my-1 w-5" />

          <button
            onClick={onMobileSheetToggle}
            className="md:hidden flex size-8 flex-col items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Collaboration"
          >
            <MessageCircle className="size-3.5" />
          </button>

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onToggle}
                  className="mb-1 flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent hover:text-foreground hover:border-primary/30"
                />
              }
              aria-label="Expand sidebar"
            >
              <ChevronRight className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
          <div className="mb-5 flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
            <FolderOpen className="size-3.5" /> WORKSPACE <MoreHorizontal className="ml-auto size-4" />
          </div>

          {/* New File button */}
          <div className="mb-3 flex items-center gap-2 px-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs text-muted-foreground"
              onClick={onNewFile}
            >
              <FilePlus className="size-3" /> New file
            </Button>
          </div>

          {/* Search files */}
          <div className="mb-3 px-1">
            <SidebarSearch fileTree={fileTree || { name: 'root', open: true, children: [] }} onFileChange={onFileChange} />
          </div>

          {/* Nested file tree */}
          <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <ChevronDown className="size-3" /> Files
            </div>
            {fileTree && fileTree.children.length > 0 ? (
              fileTree.children.map((child) => {
                if ('children' in child) {
                  return (
                    <FolderItem
                      key={child.name}
                      folder={child}
                      depth={0}
                      activeFile={activeFile}
                      onFileChange={onFileChange}
                      onFileRename={onFileRename}
                      onFileDelete={onFileDelete}
                      onToggleFolder={toggleFolder}
                      modifiedFiles={modifiedFiles}
                    />
                  )
                }
                return (
                  <FileContextMenu
                    key={child.name}
                    fileName={child.name}
                    onRename={onFileRename}
                    onDelete={onFileDelete}
                    onCopyPath={(name) => navigator.clipboard?.writeText(name)}
                  >
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 text-left text-[13px] transition-colors',
                    activeFile === child.name
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                  style={{ paddingLeft: '24px', paddingRight: '12px' }}
                  onClick={() => onFileChange(child.name)}
                >
                  <FileBadge type={child.type} />
                  <span className="truncate">{child.name}</span>
                  <PresenceDot users={filePresenceMap?.[child.name] || []} fileName={child.name} />
                </div>
                  </FileContextMenu>
                )
              })
            ) : (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                No files yet
              </div>
            )}
          </div>

          {/* Git status legend */}
          {!collapsed && (
            <div className="mt-4 flex items-center gap-3 px-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber-400" /> modified</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400" /> new</span>
            </div>
          )}

          <div className="mt-7 flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ChevronRight className="size-3" /> Shared folders
          </div>

          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <div className="mb-3 flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
              <Users className="size-3.5" /> COLLABORATORS{' '}
              <Badge variant="secondary" className="ml-auto h-5 rounded-full px-1.5 text-[10px]">
                4
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              {activeCollaborators.slice(0, 3).map((person) => (
                <div key={person.name} className="flex items-center gap-2">
                  <PresenceAvatar initials={person.initials} color={person.color} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{person.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{person.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
