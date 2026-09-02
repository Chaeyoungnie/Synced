"use client"

import { useState, useCallback, useEffect } from "react"
import { features } from "@/lib/features"

export interface GitBranch {
  name: string
  isCurrent: boolean
  lastCommit: string
  commitCount: number
}

export interface GitCommit {
  id: string
  message: string
  author: string
  date: string
  files: string[]
}

export interface GitChange {
  file: string
  status: "modified" | "new" | "deleted" | "renamed"
  staged: boolean
}

const DEMO_BRANCHES: GitBranch[] = [
  { name: "main", isCurrent: true, lastCommit: "feat: add collaboration panel", commitCount: 47 },
  { name: "develop", isCurrent: false, lastCommit: "chore: update dependencies", commitCount: 123 },
  { name: "feature/real-time-cursors", isCurrent: false, lastCommit: "feat: implement cursor tracking", commitCount: 8 },
]

const DEMO_COMMITS: GitCommit[] = [
  { id: "a1b2c3d", message: "feat: add real-time collaboration", author: "You", date: new Date(Date.now() - 3600000).toISOString(), files: ["editor-shell.tsx", "use-presence.ts"] },
  { id: "e4f5g6h", message: "fix: resolve cursor position sync", author: "Sarah Chen", date: new Date(Date.now() - 7200000).toISOString(), files: ["remote-cursors.ts"] },
  { id: "i7j8k9l", message: "feat: implement version history panel", author: "You", date: new Date(Date.now() - 86400000).toISOString(), files: ["version-history-panel.tsx", "use-file-versions.ts"] },
  { id: "m0n1o2p", message: "chore: add loading skeletons", author: "Alex Morgan", date: new Date(Date.now() - 172800000).toISOString(), files: ["loading-skeleton.tsx"] },
  { id: "q3r4s5t", message: "feat: add terminal emulator", author: "You", date: new Date(Date.now() - 259200000).toISOString(), files: ["terminal-panel.tsx", "commands.ts"] },
]

const DEMO_CHANGES: GitChange[] = [
  { file: "editor-shell.tsx", status: "modified", staged: false },
  { file: "sidebar.tsx", status: "modified", staged: false },
  { file: "version-history-panel.tsx", status: "modified", staged: true },
  { file: "diff-viewer.tsx", status: "new", staged: false },
]

function formatDate(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return minutes + "m ago"
  if (hours < 24) return hours + "h ago"
  if (days < 7) return days + "d ago"
  return new Date(dateStr).toLocaleDateString()
}

export function useGit(isDemo: boolean = true) {
  const [branches, setBranches] = useState<GitBranch[]>([])
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [changes, setChanges] = useState<GitChange[]>([])
  const [currentBranch, setCurrentBranch] = useState("main")

  // Load demo data once when in demo mode, clear when switching to real workspace
  useEffect(() => {
    if (isDemo) {
      setBranches(DEMO_BRANCHES)
      setCommits(DEMO_COMMITS)
      setChanges(DEMO_CHANGES)
    } else {
      setBranches([])
      setCommits([])
      setChanges([])
    }
  }, [isDemo])

  const switchBranch = useCallback((branchName: string) => {
    setBranches(prev => prev.map(b => ({ ...b, isCurrent: b.name === branchName })))
    setCurrentBranch(branchName)
  }, [])

  const createBranch = useCallback((name: string) => {
    const newBranch: GitBranch = {
      name,
      isCurrent: false,
      lastCommit: "Initial commit",
      commitCount: 0,
    }
    setBranches(prev => [...prev, newBranch])
  }, [])

  const stageFile = useCallback((file: string) => {
    setChanges(prev => prev.map(c => c.file === file ? { ...c, staged: true } : c))
  }, [])

  const unstageFile = useCallback((file: string) => {
    setChanges(prev => prev.map(c => c.file === file ? { ...c, staged: false } : c))
  }, [])

  const stageAll = useCallback(() => {
    setChanges(prev => prev.map(c => ({ ...c, staged: true })))
  }, [])

  const unstageAll = useCallback(() => {
    setChanges(prev => prev.map(c => ({ ...c, staged: false })))
  }, [])

  const commit = useCallback((message: string) => {
    const stagedFiles = changes.filter(c => c.staged).map(c => c.file)
    if (stagedFiles.length === 0 || !message.trim()) return

    const newCommit: GitCommit = {
      id: Math.random().toString(36).substring(2, 9),
      message: message.trim(),
      author: "You",
      date: new Date().toISOString(),
      files: stagedFiles,
    }

    setCommits(prev => [newCommit, ...prev])
    setChanges(prev => prev.filter(c => !c.staged))
    setBranches(prev => prev.map(b =>
      b.name === currentBranch
        ? { ...b, lastCommit: message.trim(), commitCount: b.commitCount + 1 }
        : b
    ))
  }, [changes, currentBranch])

  const discardChanges = useCallback((file: string) => {
    setChanges(prev => prev.filter(c => c.file !== file))
  }, [])

  const stageCount = changes.filter(c => c.staged).length
  const unstageCount = changes.filter(c => !c.staged).length

  return {
    branches,
    commits,
    changes,
    currentBranch,
    stageCount,
    unstageCount,
    formatDate,
    switchBranch,
    createBranch,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll,
    commit,
    discardChanges,
  }
}
