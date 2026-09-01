'use client'

import { useState } from 'react'
import {
  Download,
  Users,
  GitBranch,
  History,
  Terminal,
  Zap,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: string | null
}

const features_list = [
  { icon: Users, label: 'Real-time Collaboration', desc: 'Work together with live cursors and chat' },
  { icon: GitBranch, label: 'Git Integration', desc: 'Branches, commits, and diffs built-in' },
  { icon: History, label: 'Version History', desc: 'Track changes and compare versions' },
  { icon: Terminal, label: 'Native Terminal', desc: 'Real terminal with full system access' },
  { icon: Zap, label: 'Unlimited Files', desc: 'No limits on the number of files' },
]

export function UpgradeDialog({ open, onOpenChange, reason }: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" />
            Upgrade to Desktop
          </DialogTitle>
        </DialogHeader>

        {reason && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-muted-foreground">
            {reason}
          </div>
        )}

        <div className="space-y-3 mt-2">
          <p className="text-sm text-muted-foreground">
            Unlock the full experience with the desktop app:
          </p>
          {features_list.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-blue-500/10 shrink-0 mt-0.5">
                <f.icon className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Link href="/download" className="flex-1">
            <Button className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download Free
            </Button>
          </Link>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
