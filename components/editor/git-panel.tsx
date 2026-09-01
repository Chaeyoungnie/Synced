'use client'

import { useState } from 'react'
import {
  GitBranch,
  GitCommit,
  GitMerge,
  Plus,
  Minus,
  Check,
  Trash2,
  Undo2,
  ChevronDown,
  ChevronRight,
  FileCode2,
  FilePlus,
  FileMinus,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  type GitBranch as GitBranchType,
  type GitCommit as GitCommitType,
  type GitChange,
} from '@/hooks/use-git'

interface GitPanelProps {
  open: boolean
  onToggle: () => void
  branches: GitBranchType[]
  commits: GitCommitType[]
  changes: GitChange[]
  currentBranch: string
  stageCount: number
  unstageCount: number
  formatDate: (date: string) => string
  onSwitchBranch: (name: string) => void
  onCreateBranch: (name: string) => void
  onStageFile: (file: string) => void
  onUnstageFile: (file: string) => void
  onStageAll: () => void
  onUnstageAll: () => void
  onCommit: (message: string) => void
  onDiscardChanges: (file: string) => void
  onOpenFile?: (name: string) => void
}

function ChangeIcon({ status }: { status: GitChange['status'] }) {
  switch (status) {
    case 'modified': return <FileCode2 className="size-3.5 text-amber-400" />
    case 'new': return <FilePlus className="size-3.5 text-emerald-400" />
    case 'deleted': return <FileMinus className="size-3.5 text-red-400" />
    case 'renamed': return <FileCode2 className="size-3.5 text-blue-400" />
  }
}

function CollapsibleSection({ title, count, defaultOpen = true, children }: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        className="flex w-full items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setOpen(prev => !prev)}
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        <span>{title}</span>
        {count !== undefined && (
          <Badge variant="secondary" className="ml-1 h-4 rounded-full px-1.5 text-[9px]">{count}</Badge>
        )}
      </button>
      <div className={cn('overflow-hidden transition-all duration-200', open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0')}>
        {children}
      </div>
    </div>
  )
}

export function GitPanel({
  open,
  onToggle,
  branches,
  commits,
  changes,
  currentBranch,
  stageCount,
  unstageCount,
  formatDate,
  onSwitchBranch,
  onCreateBranch,
  onStageFile,
  onUnstageFile,
  onStageAll,
  onUnstageAll,
  onCommit,
  onDiscardChanges,
  onOpenFile,
}: GitPanelProps) {
  const [commitMsg, setCommitMsg] = useState('')
  const [showNewBranch, setShowNewBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [activeTab, setActiveTab] = useState<'changes' | 'branches' | 'history'>('changes')

  const handleCommit = () => {
    if (!commitMsg.trim() || stageCount === 0) return
    onCommit(commitMsg.trim())
    setCommitMsg('')
  }

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return
    onCreateBranch(newBranchName.trim())
    setNewBranchName('')
    setShowNewBranch(false)
  }

  if (!open) return null

  return (
    <div className="flex h-full flex-col border-l border-border bg-sidebar">
      {/* Header */}
      <div className="flex h-14 items-center border-b border-border px-3">
        <GitBranch className="size-4 text-primary" />
        <span className="ml-2 text-sm font-semibold">Source Control</span>
        {(stageCount > 0 || unstageCount > 0) && (
          <Badge variant="secondary" className="ml-2 h-4 rounded-full px-1.5 text-[9px]">
            {stageCount + unstageCount}
          </Badge>
        )}
      </div>

      {/* Branch indicator */}
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-1.5">
        <GitBranch className="size-3 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{currentBranch}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['changes', 'branches', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-1.5 text-[11px] font-medium transition-colors capitalize',
              activeTab === tab ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
            {tab === 'changes' && (stageCount + unstageCount) > 0 && (
              <span className="ml-1 text-[9px]">({stageCount + unstageCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {activeTab === 'changes' && (
          <div className="space-y-3">
            {/* Commit input */}
            {stageCount > 0 && (
              <div className="space-y-2">
                <Input
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
                  placeholder="Commit message..."
                  className="h-8 text-xs"
                />
                <Button
                  size="sm"
                  className="w-full h-7 text-xs gap-1.5"
                  disabled={!commitMsg.trim() || stageCount === 0}
                  onClick={handleCommit}
                >
                  <GitCommit className="size-3" /> Commit ({stageCount} file{stageCount !== 1 ? 's' : ''})
                </Button>
              </div>
            )}

            {/* Staged changes */}
            {stageCount > 0 && (
              <CollapsibleSection title="Staged Changes" count={stageCount} defaultOpen={true}>
                <div className="space-y-0.5">
                  {changes.filter(c => c.staged).map(change => (
                    <div key={change.file} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent/50 group">
                      <ChangeIcon status={change.status} />
                      <button
                        className="flex-1 text-left truncate text-muted-foreground hover:text-foreground"
                        onClick={() => onOpenFile?.(change.file)}
                      >
                        {change.file}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => onUnstageFile(change.file)}
                        title="Unstage"
                      >
                        <Minus className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-1 h-6 text-[10px] text-muted-foreground" onClick={onUnstageAll}>
                  Unstage All
                </Button>
              </CollapsibleSection>
            )}

            {/* Unstaged changes */}
            {unstageCount > 0 && (
              <CollapsibleSection title="Changes" count={unstageCount} defaultOpen={true}>
                <div className="space-y-0.5">
                  {changes.filter(c => !c.staged).map(change => (
                    <div key={change.file} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent/50 group">
                      <ChangeIcon status={change.status} />
                      <button
                        className="flex-1 text-left truncate text-muted-foreground hover:text-foreground"
                        onClick={() => onOpenFile?.(change.file)}
                      >
                        {change.file}
                      </button>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onStageFile(change.file)}
                          title="Stage"
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onDiscardChanges(change.file)}
                          title="Discard"
                        >
                          <Undo2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {stageCount === 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-1 h-6 text-[10px] text-muted-foreground" onClick={onStageAll}>
                    Stage All
                  </Button>
                )}
              </CollapsibleSection>
            )}

            {stageCount === 0 && unstageCount === 0 && (
              <div className="py-8 text-center">
                <Check className="mx-auto size-6 text-emerald-500/40" />
                <p className="mt-2 text-xs text-muted-foreground">No changes</p>
                <p className="text-[10px] text-muted-foreground/60">Working tree clean</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-2">
            {/* New branch */}
            {showNewBranch ? (
              <div className="flex gap-1.5">
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateBranch(); if (e.key === 'Escape') setShowNewBranch(false) }}
                  placeholder="branch-name"
                  className="h-7 text-xs flex-1"
                  autoFocus
                />
                <Button size="sm" className="h-7 text-[10px]" onClick={handleCreateBranch} disabled={!newBranchName.trim()}>Create</Button>
                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setShowNewBranch(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1.5" onClick={() => setShowNewBranch(true)}>
                <Plus className="size-3" /> New Branch
              </Button>
            )}

            {/* Branch list */}
            <div className="space-y-0.5">
              {branches.map(branch => (
                <button
                  key={branch.name}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                    branch.isCurrent ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                  onClick={() => onSwitchBranch(branch.name)}
                >
                  <GitBranch className="size-3" />
                  <span className="flex-1 text-left truncate font-medium">{branch.name}</span>
                  {branch.isCurrent && <Check className="size-3" />}
                  <span className="text-[10px] text-muted-foreground/50">{branch.commitCount}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {commits.map(commit => (
              <div key={commit.id} className="rounded-md border border-border/50 p-2">
                <div className="flex items-start gap-2">
                  <GitCommit className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground leading-snug">{commit.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-mono">{commit.id}</span>
                      <span>·</span>
                      <span>{commit.author}</span>
                      <span>·</span>
                      <span>{formatDate(commit.date)}</span>
                    </div>
                    {commit.files.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {commit.files.map(f => (
                          <span key={f} className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
