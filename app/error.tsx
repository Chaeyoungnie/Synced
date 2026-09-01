'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <p className="font-mono text-xs text-primary">SOMETHING WENT WRONG</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
        That didn&apos;t work.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="mt-9 flex gap-3">
        <Button onClick={reset} variant="outline" className="border-border">
          Try again
        </Button>
        <Button render={<a href="/" />} nativeButton={false}>
          Go home
        </Button>
      </div>
    </div>
  )
}
