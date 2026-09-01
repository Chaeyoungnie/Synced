'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, Code2, Command, Menu, Terminal, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const snippets = ['npm create codebase@latest', 'collaborators: 04', 'preview: synced']

function ProductWindow() {
  const [tab, setTab] = useState<'code' | 'preview'>('code')
  return (
    <div className="relative mx-auto mt-16 max-w-6xl px-5 sm:mt-24">
      <div className="overflow-hidden border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="flex h-11 items-center justify-between border-b border-border px-4 font-mono text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" /> workspace / launch.tsx
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-foreground" /> synced
          </div>
        </div>
        <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn('px-3 text-xs', tab === 'code' ? 'bg-accent text-foreground' : 'text-muted-foreground')}
            onClick={() => setTab('code')}
          >
            Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('px-3 text-xs', tab === 'preview' ? 'bg-accent text-foreground' : 'text-muted-foreground')}
            onClick={() => setTab('preview')}
          >
            Preview
          </Button>
          <span className="ml-auto hidden font-mono text-[10px] text-muted-foreground sm:block">
            Sarah, Marcus, you
          </span>
        </div>
        {tab === 'code' ? (
          <div className="grid min-h-[330px] md:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-border p-5 font-mono text-xs leading-7 md:border-b-0 md:border-r">
              <div className="mb-3 text-muted-foreground">01 / launch.tsx</div>
              {[
                'export default function Launch() {',
                '  return (',
                '    <Workspace',
                '      livePreview',
                '      collaborators={team}',
                '    />',
                '  )',
                '}',
              ].map((line, index) => (
                <div key={line} className={cn('flex px-2', index === 4 && 'bg-accent')}>
                  <span className="mr-5 w-4 select-none text-right text-muted-foreground/50">{index + 1}</span>
                  <span
                    className={cn(
                      index === 0 || index === 2
                        ? 'text-primary'
                        : index === 4
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                    )}
                  >
                    {line}
                  </span>
                  {index === 4 && (
                    <span className="ml-auto bg-primary px-1 text-[9px] leading-5 text-primary-foreground">Sarah</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center bg-background p-6">
              <div className="w-full max-w-sm border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="font-mono text-xs font-semibold">
                    orbit<span className="text-primary">.</span>
                  </span>
                  <Button size="xs" className="bg-primary text-primary-foreground">Get started</Button>
                </div>
                <div className="px-5 py-10">
                  <div className="mb-3 font-mono text-[9px] text-primary">BUILD / SHARE / SHIP</div>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Make ideas
                    <br />
                    move faster.
                  </h3>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    A calm place for your team to build together, with every change visible.
                  </p>
                  <div className="mt-6 h-2 w-2/3 bg-accent" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[330px] bg-background p-6">
            <div className="mx-auto max-w-3xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3 font-mono text-[10px] text-muted-foreground">
                <span className="text-primary">●</span> preview.codebase.dev{' '}
                <span className="ml-auto">1440 × 900</span>
              </div>
              <div className="px-8 py-14 sm:px-16">
                <p className="font-mono text-[10px] text-primary">YOUR NEXT RELEASE</p>
                <h3 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight sm:text-6xl">
                  Make ideas
                  <br />
                  move faster.
                </h3>
                <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                  The preview is not a screenshot. It is the thing you are building, updating as your team works.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [open, setOpen] = useState(false)
  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-foreground">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center bg-primary text-primary-foreground">
            <Code2 className="size-4" />
          </span>
          Synced
        </a>
        <div
          className={cn(
            'absolute left-0 right-0 top-20 z-10 border-b border-border bg-background p-5 md:static md:flex md:items-center md:gap-8 md:border-0 md:p-0',
            open ? 'flex flex-col gap-5' : 'hidden md:flex',
          )}
        >
          <a href="#why" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
            Why Synced
          </a>
          <a href="#workflow" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
            Workflow
          </a>
          <a href="#pricing" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </a>
          <Button size="sm" className="gap-2" render={<a href="#pricing" />} nativeButton={false}>
            Start building <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="md:hidden" aria-label="Toggle navigation">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* 01 — Hero */}
      <section className="mx-auto max-w-7xl border-t border-border px-5 pb-4 pt-20 sm:px-8 sm:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-6 font-mono text-xs text-primary">01 — THE SHARED WORKSPACE</p>
            <h1 className="max-w-4xl text-balance text-6xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-8xl">
              Build in the
              <br />
              <span className="text-primary">same direction.</span>
            </h1>
          </div>
          <div className="max-w-sm pb-2">
            <p className="text-pretty text-lg leading-7 text-muted-foreground">
              Synced brings your code, live product, and team into one visible loop.
            </p>
            <Button variant="outline" className="mt-7 gap-2 border-border">
              Open the workspace <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </div>
        <ProductWindow />
      </section>

      {/* 02 — Why Synced */}
      <section id="why" className="mx-auto max-w-7xl scroll-mt-20 border-t border-border px-5 py-24 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs text-primary">02 — WHY SYNCED</p>
            <h2 className="mt-5 max-w-md text-4xl font-semibold tracking-tight sm:text-5xl">
              Less handoff.
              <br />
              More momentum.
            </h2>
            <div className="mt-12 grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
              {[
                ['01', 'See the work', 'Everyone sees the same code, context, and current product.'],
                ['02', 'Move together', 'Comments, cursors, and decisions stay attached to the work.'],
                ['03', 'Ship clearly', 'Preview the real result before it leaves the room.'],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <p className="font-mono text-xs text-primary">{n}</p>
                  <h3 className="mt-8 text-lg font-medium">{t}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            <div className="bg-background p-6">
              <Command className="size-5" />
              <h3 className="mt-8 font-medium">One clear source</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Code, decisions, and product context stay together instead of getting scattered across tools.
              </p>
            </div>
            <div className="bg-background p-6">
              <Users className="size-5" />
              <h3 className="mt-8 font-medium">Built for together</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Invite your team into the work without turning the workspace into noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — The Workflow */}
      <section id="workflow" className="border-y border-border bg-card px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs text-primary">03 — THE WORKFLOW</p>
            <h2 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
              From first thought
              <br />
              to live product.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {snippets.map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-4 border border-border bg-background p-4 font-mono text-xs"
              >
                <span className="text-primary">0{i + 1}</span>
                <span>{item}</span>
                <Check className="ml-auto size-4 text-emerald-400" />
              </div>
            ))}
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A tighter loop for teams who want to spend less time translating and more time making.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-14 grid max-w-7xl gap-px bg-border md:grid-cols-3">
          {[
            ['01', 'Write', 'Shape the idea in a workspace that keeps context close.'],
            ['02', 'See', 'Watch the product take form in a live, responsive preview.'],
            ['03', 'Ship', 'Move from shared decision to production without the relay race.'],
          ].map(([number, title, body]) => (
            <div key={number} className="bg-background p-6">
              <span className="font-mono text-xs text-muted-foreground">{number}</span>
              <h3 className="mt-14 text-xl font-medium">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 04 — Testimonial */}
      <section className="mx-auto max-w-7xl border-t border-border px-5 py-24 sm:px-8">
        <p className="font-mono text-xs text-primary">04 — TRUSTED IN THE LOOP</p>
        <blockquote className="mt-8 max-w-4xl text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
          "Synced gives the team a shared sense of what is real, what changed, and what happens next."
        </blockquote>
        <p className="mt-7 text-sm text-muted-foreground">Maya Chen · Product lead at Northstar</p>
        <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6 font-mono text-xs text-muted-foreground">
          <span>northstar</span>
          <span>arc / systems</span>
          <span>fieldwork</span>
          <span>monument</span>
        </div>
      </section>

      {/* 05 — Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 border-t border-border px-5 py-24 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="font-mono text-xs text-primary">05 — PRICING</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Start free.
              <br />
              Grow when ready.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
              A simple workspace for solo builders, with room for your whole team when the time is right.
            </p>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            <div className="bg-background p-7">
              <h3 className="font-medium">Personal</h3>
              <p className="mt-2 text-sm text-muted-foreground">For trying the loop.</p>
              <p className="mt-8 text-3xl font-semibold">Free</p>
              <Button variant="outline" className="mt-8 w-full border-border" render={<a href="/editor" />} nativeButton={false}>
                Open sample
              </Button>
            </div>
            <div className="bg-primary p-7 text-primary-foreground">
              <h3 className="font-medium">Team</h3>
              <p className="mt-2 text-sm opacity-70">For shipping together.</p>
              <p className="mt-8 text-3xl font-semibold">
                $18 <span className="text-sm font-normal opacity-70">/ seat</span>
              </p>
              <Button
                variant="outline"
                className="mt-8 w-full border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary"
              >
                Talk to us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — FAQ */}
      <section className="mx-auto max-w-7xl border-t border-border px-5 py-24 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs text-primary">06 — FAQ</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight">
              Good questions
              <br />
              make better work.
            </h2>
          </div>
          <div className="border-t border-border">
            {[
              ['Is the sample really free?', 'Yes. The personal sample is free to use and designed for one person.'],
              [
                'Does Synced replace my code editor?',
                'It gives your team a shared layer around the editor, preview, and product decisions.',
              ],
              ['Can I invite collaborators?', 'Team collaboration is part of the paid workspace experience.'],
            ].map(([q, a]) => (
              <details key={q} className="group border-b border-border py-5">
                <summary className="cursor-pointer list-none text-sm font-medium">
                  {q}
                  <span className="float-right text-muted-foreground group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-xl pt-4 text-sm leading-6 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl border-t border-border px-5 py-24 text-center sm:px-8">
        <p className="font-mono text-xs text-primary">READY WHEN YOU ARE</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
          Make the next thing
          <br />
          together.
        </h2>
        <Button className="mx-auto mt-9 gap-2" render={<a href="/editor" />} nativeButton={false}>
          Open the free workspace <ArrowUpRight className="size-4" />
        </Button>
      </section>

      <Separator />

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 Synced</span>
        <div className="flex gap-6">
          <a href="#top" className="hover:text-foreground">
            Back to top
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
        </div>
      </footer>
    </main>
  )
}
