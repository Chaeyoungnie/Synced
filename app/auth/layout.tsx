import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side — branding */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 lg:flex">
        <div className="max-w-md space-y-6 px-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="text-2xl font-bold">Synced</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Build together.<br />Ship further.
          </h1>
          <p className="text-muted-foreground">
            The collaborative workspace for code, live preview, and modern product teams.
          </p>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <div>
              <p className="text-2xl font-bold text-foreground">10k+</p>
              <p>Developers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">50k+</p>
              <p>Workspaces</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">99.9%</p>
              <p>Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
