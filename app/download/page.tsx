'use client'

import Link from 'next/link'
import { ArrowLeft, Monitor, Laptop, Terminal, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const platforms = [
  {
    name: 'Windows',
    icon: Monitor,
    format: '.exe',
    size: '~180 MB',
    download: '#',
    requirements: 'Windows 10 or later',
  },
  {
    name: 'macOS',
    icon: Laptop,
    format: '.dmg',
    size: '~160 MB',
    download: '#',
    requirements: 'macOS 12 or later (Intel & Apple Silicon)',
  },
  {
    name: 'Linux',
    icon: Terminal,
    format: '.AppImage',
    size: '~150 MB',
    download: '#',
    requirements: 'Ubuntu 20.04+ / Fedora 36+ / Debian 11+',
  },
]

const features = [
  'Real-time collaboration with live cursors',
  'Git integration — branches, commits, diffs',
  'Version history with side-by-side diffs',
  'Native terminal with full system access',
  'Unlimited files and workspaces',
  'Offline mode — work without internet',
  'Auto-updates — always on the latest version',
  'Custom themes and keyboard shortcuts',
]

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Freebuff
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Download <span className="text-blue-500">Freebuff</span> Desktop
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          The full collaborative code editor experience — real-time collaboration,
          Git integration, native terminal, and unlimited files. Free forever.
        </p>
      </section>

      {/* Download Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="flex flex-col p-6 rounded-xl border border-border bg-card hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <p.icon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.format} · {p.size}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{p.requirements}</p>
              <a href={p.download}>
                <Button className="w-full mt-auto">
                  Download for {p.name}
                </Button>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Features Comparison */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">What&apos;s included</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Freebuff is open source and free forever.
      </footer>
    </div>
  )
}
