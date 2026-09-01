'use client'

import { FilePlus, Upload, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onNewFile?: () => void
  onOpenFile?: () => void
  workspaceName?: string
}

export function EmptyState({ onNewFile, onOpenFile, workspaceName }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
        <FolderOpen className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold">
          {workspaceName ? `Welcome to ${workspaceName}` : 'Empty workspace'}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          This workspace has no files yet. Create a new file or open an existing one to get started.
        </p>
      </div>
      <div className="flex gap-3">
        {onNewFile && (
          <Button onClick={onNewFile} className="gap-2">
            <FilePlus className="size-4" />
            New file
          </Button>
        )}
        {onOpenFile && (
          <Button variant="outline" onClick={onOpenFile} className="gap-2">
            <Upload className="size-4" />
            Open file
          </Button>
        )}
      </div>
    </div>
  )
}
