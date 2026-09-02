'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong during sign-in. This could be because:
      </p>
      <ul className="mx-auto max-w-sm text-left text-sm text-muted-foreground space-y-1">
        <li>• The OAuth provider is not configured in Supabase</li>
        <li>• The redirect URL doesn&apos;t match in your OAuth settings</li>
        <li>• You denied access to the application</li>
      </ul>
      <div className="flex justify-center gap-3 pt-2">
        <Link href="/auth/sign-in">
          <Button variant="outline">Try again</Button>
        </Link>
        <Link href="/">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  )
}
