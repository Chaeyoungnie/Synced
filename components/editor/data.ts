export type GitStatus = 'modified' | 'new' | 'untracked' | 'committed' | 'deleted'

export interface FileNode {
  name: string
  type: 'code' | 'css' | 'json'
  status?: GitStatus
}

export interface FolderNode {
  name: string
  open?: boolean
  children: (FileNode | FolderNode)[]
}

export const fileTree: FolderNode = {
  name: 'collaborative-editor',
  open: true,
  children: [
    { name: 'page.tsx', type: 'code', status: 'committed' },
    { name: 'editor-shell.tsx', type: 'code', status: 'modified' },
    { name: 'globals.css', type: 'css', status: 'committed' },
    { name: 'layout.tsx', type: 'code', status: 'committed' },
    { name: 'components.json', type: 'json', status: 'committed' },
    {
      name: 'components',
      open: true,
      children: [
        {
          name: 'editor',
          children: [
            { name: 'sidebar.tsx', type: 'code', status: 'modified' },
            { name: 'tab-bar.tsx', type: 'code', status: 'new' },
            { name: 'code-editor.tsx', type: 'code', status: 'committed' },
            { name: 'code-mirror-editor.tsx', type: 'code', status: 'committed' },
            { name: 'live-preview.tsx', type: 'code', status: 'committed' },
            { name: 'collaboration-panel.tsx', type: 'code', status: 'committed' },
            { name: 'presence-avatar.tsx', type: 'code', status: 'committed' },
            { name: 'breadcrumbs.tsx', type: 'code', status: 'new' },
            { name: 'file-context-menu.tsx', type: 'code', status: 'new' },
            { name: 'data.ts', type: 'code', status: 'committed' },
          ],
        },
        { name: 'landing-page.tsx', type: 'code', status: 'committed' },
        {
          name: 'ui',
          children: [
            { name: 'button.tsx', type: 'code', status: 'committed' },
            { name: 'input.tsx', type: 'code', status: 'committed' },
            { name: 'dialog.tsx', type: 'code', status: 'committed' },
            { name: 'badge.tsx', type: 'code', status: 'committed' },
            { name: 'tabs.tsx', type: 'code', status: 'committed' },
            { name: 'tooltip.tsx', type: 'code', status: 'committed' },
            { name: 'separator.tsx', type: 'code', status: 'committed' },
            { name: 'avatar.tsx', type: 'code', status: 'committed' },
            { name: 'dropdown-menu.tsx', type: 'code', status: 'committed' },
          ],
        },
      ],
    },
  ],
}

// Flat list for backward compat
export const files: FileNode[] = [
  { name: 'page.tsx', type: 'code', status: 'committed' },
  { name: 'editor-shell.tsx', type: 'code', status: 'modified' },
  { name: 'globals.css', type: 'css', status: 'committed' },
  { name: 'layout.tsx', type: 'code', status: 'committed' },
  { name: 'components.json', type: 'json', status: 'committed' },
]

export const fileContents: Record<string, string> = {
  'page.tsx': `import { EditorShell } from '@/components/editor-shell'

export default function Page() {
  return <EditorShell sampleMode />
}`,
  'editor-shell.tsx': `'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'

export function EditorShell({ sampleMode = false }) {
  const [activeFile, setActiveFile] = useState('page.tsx')

  return (
    <main className="flex h-svh min-h-[600px] flex-col">
      <header className="flex h-14 items-center border-b px-4">
        <Sparkles className="size-3.5" />
        <span>Collaborative Editor</span>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r">
          {/* Sidebar content */}
        </aside>
        <section className="flex-1">
          {/* Code editor */}
        </section>
      </div>
    </main>
  )
}`,
  'globals.css': `@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.13 0.02 260);
  --foreground: oklch(0.94 0.015 260);
  --primary: oklch(0.72 0.19 290);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.105 0.01 260);
  --foreground: oklch(0.96 0.01 260);
  --primary: oklch(0.96 0 0);
}`,
  'layout.tsx': `import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Codebase — Build together. Ship further.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={geist.variable}>
        {children}
      </body>
    </html>
  )
}`,
  'components.json': `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}`,
}

/** Flatten a FolderNode tree into a list of { name, path } objects */
export function flattenFileTree(tree: FolderNode, prefix = ''): { name: string; path: string }[] {
  const results: { name: string; path: string }[] = []
  for (const child of tree.children) {
    if ('children' in child) {
      // FolderNode — recurse
      results.push(...flattenFileTree(child, prefix ? `${prefix}/${child.name}` : child.name))
    } else {
      // FileNode
      results.push({ name: child.name, path: prefix || '' })
    }
  }
  return results
}

export const codeLines = fileContents['page.tsx'].split('\n')

export const collaborators = [
  { name: 'Sarah Chen', initials: 'SC', color: 'bg-primary', role: 'Admin', status: 'Editing page.tsx' },
  { name: 'Alex Morgan', initials: 'AM', color: 'bg-foreground', role: 'Editor', status: 'Viewing globals.css' },
  { name: 'You', initials: 'JD', color: 'bg-foreground', role: 'Editor', status: 'Online' },
  { name: 'Maya Patel', initials: 'MP', color: 'bg-muted-foreground', role: 'Viewer', status: '5m ago' },
]
