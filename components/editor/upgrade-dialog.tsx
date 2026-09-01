'use client'

import { Download, Sparkles, Users, GitBranch, History, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const FEATURES = [
  { icon: Users, label: "Real-time collaboration", desc: "Work together with live cursors and chat" },
  { icon: GitBranch, label: "Git integration", desc: "Branches, commits, and diffs built-in" },
  { icon: History, label: "Version history", desc: "Track changes and restore any version" },
  { icon: Terminal, label: "Native terminal", desc: "Full terminal with system access" },
  { icon: Sparkles, label: "AI assistant", desc: "Code review, suggestions, and explanations" },
  { icon: Download, label: "Unlimited files", desc: "No limits on project size" },
]

export function UpgradeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Upgrade to Desktop
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Get the full collaborative coding experience.</p>
        <div className="space-y-3 py-2">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <f.icon className="size-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 gap-1.5" onClick={() => window.open("/download", "_blank")}>
            <Download className="size-3.5" /> Download Desktop
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Continue Free</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}