'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Folder, FileCode2, Users, MessageSquare, X, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'synced_onboarding_complete'

interface Step {
  icon: React.ReactNode
  title: string
  description: string
  highlight?: string
}

const steps: Step[] = [
  {
    icon: <Sparkles className="size-5" />,
    title: 'Welcome to Synced!',
    description: 'Your collaborative workspace for building together. Let us show you around.',
  },
  {
    icon: <Folder className="size-5" />,
    title: 'Create a workspace',
    description: 'Click the "+ New" button to create your first workspace. Give it a name and description.',
    highlight: 'new',
  },
  {
    icon: <FileCode2 className="size-5" />,
    title: 'Write code together',
    description: 'Open your workspace and create files. Your code saves automatically to the cloud.',
    highlight: 'editor',
  },
  {
    icon: <Users className="size-5" />,
    title: 'Invite your team',
    description: 'Click "Invite" in the top bar to send collaboration invitations by email.',
    highlight: 'invite',
  },
  {
    icon: <MessageSquare className="size-5" />,
    title: 'Chat & collaborate',
    description: 'Use the right sidebar to chat with your team, see activity, and track changes in real-time.',
    highlight: 'collab',
  },
]

export function OnboardingGuide({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
    onComplete()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  if (!visible) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleComplete}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'size-1.5 rounded-full transition-colors',
                i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary/40' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {step.icon}
          </div>
          <h2 className="mb-2 text-lg font-semibold">{step.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="gap-1.5">
              {currentStep === steps.length - 1 ? 'Get started' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Button to replay the guide
export function ReplayGuideButton() {
  const handleReplay = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleReplay} className="gap-1.5 text-xs text-muted-foreground">
      <RotateCcw className="size-3" />
      Replay guide
    </Button>
  )
}
