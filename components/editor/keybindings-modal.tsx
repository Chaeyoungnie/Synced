'use client'

import { Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface KeybindingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mod: string
}

const sections = [
  {
    title: 'General',
    bindings: [
      { keys: ['Ctrl/⌘', 'K'], action: 'Command palette' },
      { keys: ['Ctrl/⌘', 'P'], action: 'Quick open file' },
      { keys: ['Ctrl/⌘', 'S'], action: 'Save file & create version' },
      { keys: ['Ctrl/⌘', 'N'], action: 'New file' },
      { keys: ['Ctrl/⌘', 'W'], action: 'Close active tab' },
      { keys: ['Ctrl/⌘', '⇧', 'P'], action: 'Keyboard shortcuts' },
    ],
  },
  {
    title: 'Navigation',
    bindings: [
      { keys: ['Ctrl/⌘', 'B'], action: 'Toggle sidebar' },
      { keys: ['Ctrl/⌘', '\\'], action: 'Toggle collaboration panel' },
      { keys: ['Ctrl/⌘', '⇧', '\\'], action: 'Split editor' },
      { keys: ['Ctrl/⌘', 'L'], action: 'Clear terminal' },
      { keys: ['↑', '↓'], action: 'Navigate file list' },
    ],
  },
  {
    title: 'Editor',
    bindings: [
      { keys: ['Ctrl/⌘', 'F'], action: 'Find in file' },
      { keys: ['Ctrl/⌘', 'H'], action: 'Find and replace' },
      { keys: ['Ctrl/⌘', 'G'], action: 'Find next match' },
      { keys: ['Ctrl/⌘', '⇧', 'G'], action: 'Find previous match' },
      { keys: ['Ctrl/⌘', '/'], action: 'Toggle comment' },
    ],
  },
  {
    title: 'Terminal',
    bindings: [
      { keys: ['Enter'], action: 'Execute command' },
      { keys: ['↑', '↓'], action: 'Navigate command history' },
      { keys: ['Ctrl/⌘', 'L'], action: 'Clear terminal' },
    ],
  },
  {
    title: 'Theme',
    bindings: [
      { keys: ["Ctrl/⌘", "'"], action: 'Toggle dark / light' },
    ],
  },
]

export function KeybindingsModal({ open, onOpenChange, mod }: KeybindingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="size-4" /> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.bindings.map((binding, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
                  >
                    <span className="text-foreground">{binding.action}</span>
                    <div className="flex items-center gap-1">
                      {binding.keys.map((key, ki) => (
                        <span key={ki}>
                          <kbd
                            className={cn(
                              'rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground',
                            )}
                          >
                            {key}
                          </kbd>
                          {ki < binding.keys.length - 1 && (
                            <span className="text-[10px] text-muted-foreground mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
