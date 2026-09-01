'use client'

import { X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function TrialBanner({ className }: { className?: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className={cn("flex items-center justify-between gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 px-4 py-2", className)}>
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">FREE</span>
        <span className="text-muted-foreground">
          You are using the web trial. <a href="/download" className="font-medium text-primary hover:underline">Download the desktop app</a> for full features.
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-muted-foreground">
        <X className="size-3" />
      </button>
    </div>
  )
}