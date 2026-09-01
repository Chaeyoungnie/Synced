'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Sparkles, FolderOpen, Users, Terminal, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: FolderOpen,
    title: 'File Explorer',
    description: 'Browse and manage your project files in the sidebar. Click any file to open it in the editor.',
    position: 'left' as const,
  },
  {
    icon: Sparkles,
    title: 'Code Editor',
    description: 'Write code with syntax highlighting, auto-completion, and real-time collaboration.',
    position: 'center' as const,
  },
  {
    icon: Users,
    title: 'Collaborate',
    description: 'See who is online, chat in real-time, and invite your team to work together.',
    position: 'right' as const,
  },
  {
    icon: Terminal,
    title: 'Terminal',
    description: 'Run commands directly in the editor with the built-in terminal.',
    position: 'bottom' as const,
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Track changes, create branches, and manage your code history.',
    position: 'right' as const,
  },
]

export function Onboarding() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('synced-onboarding-seen')
    if (!hasSeenOnboarding) {
      setShow(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('synced-onboarding-seen', 'true')
    setShow(false)
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleDismiss()
    }
  }

  if (!show) return null

  const current = steps[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="Skip tour"
        >
          <X className="size-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">{current.title}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{current.description}</p>
        </div>

        {/* Progress dots */}
        <div className="mb-4 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`size-2 rounded-full transition-colors ${
                i === step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={handleDismiss}>
            Skip tour
          </Button>
          <Button className="flex-1 gap-2" onClick={handleNext}>
            {step < steps.length - 1 ? 'Next' : 'Get started'}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
