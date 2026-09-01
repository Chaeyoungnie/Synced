'use client'

import { useState } from 'react'
import {
  Code2,
  ExternalLink,
  GitBranch,
  RotateCcw,
  Smartphone,
  Sparkles,
  Tablet,
  Monitor,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function LivePreview() {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [refreshed, setRefreshed] = useState(false)
  const widths = { desktop: 'w-full', tablet: 'w-[min(100%,720px)]', mobile: 'w-[390px]' }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card/50 px-3">
        <div
          className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5"
          role="group"
          aria-label="Preview viewport"
        >
          {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(
            ([name, Icon]) => (
              <Tooltip key={name}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setViewport(name)}
                      className={cn(viewport === name && 'bg-accent text-primary')}
                    />
                  }
                  aria-label={`${name} viewport`}
                  aria-pressed={viewport === name}
                >
                  <Icon className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent side="bottom">{name}</TooltipContent>
              </Tooltip>
            ),
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {viewport === 'desktop'
            ? '1440 × 900'
            : viewport === 'tablet'
              ? '768 × 1024'
              : '390 × 844'}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-foreground">
          <span className="size-1.5 rounded-full bg-emerald-400" /> Live preview
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                onClick={() => {
                  setRefreshed(true)
                  setTimeout(() => setRefreshed(false), 800)
                }}
              />
            }
            aria-label="Refresh preview"
          >
            <RotateCcw className={cn('size-3.5', refreshed && 'animate-spin')} />
          </TooltipTrigger>
          <TooltipContent>Refresh preview</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="ghost" size="icon-xs" className="text-muted-foreground" />}
            aria-label="Open preview in new window"
          >
            <ExternalLink className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Open in new window</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-4 sm:p-6">
        <div
          className={cn(
            'flex min-h-[560px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-[#0f172a] shadow-2xl transition-[width] duration-300',
            widths[viewport],
          )}
        >
          <div className="flex h-8 items-center gap-1 border-b border-slate-700 bg-slate-900 px-3">
            <span className="size-2 rounded-full bg-rose-400/80" />
            <span className="size-2 rounded-full bg-amber-400/80" />
            <span className="size-2 rounded-full bg-emerald-400/80" />
            <div className="mx-auto rounded bg-slate-800 px-10 py-1 text-[9px] text-slate-400">
              preview.codebase.dev
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-950 text-slate-100">
            <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <span className="font-mono text-sm font-bold text-violet-300">
                orbit<span className="text-foreground">.</span>
              </span>
              <div className="hidden gap-5 text-[10px] text-slate-400 sm:flex">
                <span>Product</span>
                <span>Solutions</span>
                <span>Pricing</span>
              </div>
              <Button size="xs" className="bg-primary text-white">
                Get started
              </Button>
            </nav>
            <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
              <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[10px] text-violet-200">
                <Sparkles className="size-3" /> Built for teams that move fast
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Ship better software, <span className="text-violet-300">together.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-slate-400">
                A focused workspace for building, reviewing, and shipping your best work with the
                people who make it happen.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="sm" className="bg-primary text-white">
                  Start building
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-slate-300"
                >
                  View documentation
                </Button>
              </div>
            </section>
            <section className="grid grid-cols-3 border-y border-slate-800 text-center">
              <div className="px-3 py-6">
                <p className="text-xl font-semibold text-white">10k+</p>
                <p className="mt-1 text-[9px] text-slate-500">teams shipping</p>
              </div>
              <div className="border-x border-slate-800 px-3 py-6">
                <p className="text-xl font-semibold text-white">99.99%</p>
                <p className="mt-1 text-[9px] text-slate-500">uptime guaranteed</p>
              </div>
              <div className="px-3 py-6">
                <p className="text-xl font-semibold text-white">4.9/5</p>
                <p className="mt-1 text-[9px] text-slate-500">developer rating</p>
              </div>
            </section>
            <section className="grid gap-3 px-6 py-10 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <Code2 className="size-4 text-violet-300" />
                <h3 className="mt-4 text-xs font-semibold">One shared source</h3>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  Everything your team needs in one clear, connected workspace.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <Users className="size-4 text-foreground" />
                <h3 className="mt-4 text-xs font-semibold">Work in sync</h3>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  See changes as they happen and keep momentum moving forward.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <GitBranch className="size-4 text-cyan-300" />
                <h3 className="mt-4 text-xs font-semibold">Ship confidently</h3>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  From first commit to production, your workflow stays effortless.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
