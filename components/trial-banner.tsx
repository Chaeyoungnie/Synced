'use client'

import { useState } from 'react'
import { Download, X, Sparkles } from 'lucide-react'
import { features } from '@/lib/features'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false)
  const flags = features()

  // Don't show on desktop
  if (flags.platform === 'desktop' || dismissed) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-500/20 text-sm">
      <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
      <span className="text-muted-foreground">
        You&apos;re using the <strong className="text-foreground">free web trial</strong> — limited to {flags.maxFiles} files, single user.
      </span>
      <Link href="/download">
        <Button size="sm" variant="default" className="ml-auto gap-1.5 h-7">
          <Download className="h-3.5 w-3.5" />
          Get Desktop App
        </Button>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
