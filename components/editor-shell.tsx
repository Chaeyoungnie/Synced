'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PanelGroup, Panel, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels'
import {
  Eye,
  FileCode2,
  FilePlus,
  GripVertical,
  History,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Sun,
  User,
  Copy,
  Link2,
  Command,
  SplitSquareHorizontal,
  Trash2,
  Bot,
  UserPlus,
  Terminal,
  FolderOpen,
  Users,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/hooks/use-theme'
import { useModifierKey } from '@/hooks/use-modifier-key'
import { useBeforeUnload } from '@/hooks/use-before-unload'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MobileBottomSheet } from '@/components/editor/mobile-bottom-sheet'
import { useUser } from '@/hooks/use-user'
import { AIAssistant } from '@/components/editor/ai-assistant'
import { SettingsModal } from '@/components/editor/settings-modal'
import { useToast } from '@/components/editor/toast-provider'
import { FileSearch } from '@/components/editor/file-search'
import { KeybindingsModal } from '@/components/editor/keybindings-modal'
import { Sidebar } from '@/components/editor/sidebar'
import { CodeEditor } from '@/components/editor/code-editor'
import { LivePreview } from '@/components/editor/live-preview'
import { CollaborationPanel } from '@/components/editor/collaboration-panel'
import { TabBar, type Tab } from '@/components/editor/tab-bar'
import { Breadcrumbs } from '@/components/editor/breadcrumbs'
import { type FileNode, type FolderNode, flattenFileTree } from '@/components/editor/data'
import { useWorkspace } from '@/hooks/use-workspace'
import { usePresence } from '@/hooks/use-presence'
import type { RemoteCursor } from '@/lib/codemirror/remote-cursors'
import { VersionHistoryPanel } from '@/components/editor/version-history-panel'
import { useFileVersions } from '@/hooks/use-file-versions'
import { InviteCollaboratorDialog } from '@/components/editor/invite-collaborator-dialog'
import { NotificationBell } from '@/components/editor/notifications'
import { addCollaborator } from '@/lib/supabase/workspaces'
import { TerminalPanel } from '@/components/editor/terminal-panel'
import { GitPanel } from '@/components/editor/git-panel'
import { TrialBanner } from '@/components/trial-banner'
import { UpgradeDialog } from '@/components/upgrade-dialog'
import { features } from '@/lib/features'
import { useTrialLimits } from '@/hooks/use-trial-limits'
import { useGit } from '@/hooks/use-git'
import { useFileOps } from '@/hooks/use-file-ops'
import { TitleBar } from '@/components/editor/titlebar'
import { Onboarding } from '@/components/editor/onboarding'
import { EmptyState } from '@/components/editor/empty-state'
import { FindReplace } from '@/components/editor/find-replace'
import { DeployButton } from '@/components/editor/deploy-button'

function ResizeHandle() {
  return (
    <PanelResizeHandle className="group/resize relative flex w-px items-center justify-center bg-border transition-colors hover:bg-primary/20">
      <div className="z-10 flex h-8 w-1 items-center justify-center rounded-sm bg-muted text-muted-foreground transition-colors group-hover/resize:bg-primary group-hover/resize:text-primary-foreground">
        <GripVertical className="size-3 rotate-90" />
      </div>
    </PanelResizeHandle>
  )
}

function CommandPalette({
  open,
  onOpenChange,
  onAction,
  mod,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: string) => void
  mod: string
}) {
  const [query, setQuery] = useState('')

  const commands = [
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: `${mod}+B` },
    { id: 'toggle-panel', label: 'Toggle Collaboration Panel', shortcut: `${mod}+\\` },
    { id: 'toggle-preview', label: 'Toggle Preview', shortcut: `${mod}+1` },
    { id: 'split-editor', label: 'Split Editor Right', shortcut: `${mod}+\\` },
    { id: 'new-file', label: 'New File', shortcut: `${mod}+N` },
    { id: 'share', label: 'Share Workspace', shortcut: '' },
    { id: 'save', label: 'Save File', shortcut: `${mod}+S` },
    { id: 'find', label: 'Find in File', shortcut: `${mod}+F` },
    { id: 'open-file', label: 'Quick Open File', shortcut: `${mod}+P` },
    { id: 'keybindings', label: 'Keyboard Shortcuts', shortcut: `${mod}+⇧P` },
    { id: 'ai-assistant', label: 'AI Assistant', shortcut: '' },
    { id: 'settings', label: 'Open Settings', shortcut: '' },
  ]

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()),
  )

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="border-0 focus-visible:ring-0 h-11"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered.length > 0) {
                onAction(filtered[0].id)
                onOpenChange(false)
              }
            }}
          />
        </div>
        <div className="max-h-64 overflow-auto p-1">
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => {
                onAction(cmd.id)
                onOpenChange(false)
              }}
            >
              <span className="flex-1 text-left">{cmd.label}</span>
              {cmd.shortcut && (
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No commands found
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getFileType(name: string): Tab['type'] {
  if (name.endsWith('.css')) return 'css'
  if (name.endsWith('.json')) return 'json'
  return 'code'
}

export function EditorShell({ sampleMode = false, workspaceId = null }: { sampleMode?: boolean; workspaceId?: string | null }) {

  const { onlineUsers, setActiveFile: setPresenceFile, setCursorPosition } = usePresence(workspaceId)

  const presenceCollaborators = onlineUsers.map(u => ({ name: u.name, initials: u.initials, color: u.color, role: u.role, status: u.status }))

  const { fileTree: wsFileTree, fileContents: wsFileContents, collaborators: wsCollaborators, files: dbFiles, workspace, loading: wsLoading, error: wsError, saveFile, createFile: wsCreateFile, deleteFile: wsDeleteFile, renameFile: wsRenameFile, isDemo } = useWorkspace(workspaceId)
  const { resolvedTheme, setTheme } = useTheme()
  const mod = useModifierKey()
  const { toast } = useToast()
  const { user, signOut } = useUser()
  const router = useRouter()
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const sidebarRef = useRef<ImperativePanelHandle>(null)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const collabRef = useRef<ImperativePanelHandle>(null)
  const [activeFile, setActiveFile] = useState('page.tsx')
  const remoteCursors: RemoteCursor[] = onlineUsers.filter(u => u.id !== user?.id && u.activeFile === activeFile && u.cursorLine !== null).map(u => ({ id: u.id, name: u.name.split(' ')[0], color: u.color, line: u.cursorLine || 1, col: u.cursorCol || 1 }))
  const [contents, setContents] = useState<Record<string, string>>({ ...wsFileContents })
  const [openTabs, setOpenTabs] = useState<Tab[]>([{ id: 'page.tsx', name: 'page.tsx', type: 'code' }])
  const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set())
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('Collaborative Editor')
  const [saveState, setSaveState] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const [secondFile, setSecondFile] = useState<string | null>(null)
  const [splitMode, setSplitMode] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [fileSearchOpen, setFileSearchOpen] = useState(false)
  const [keybindingsOpen, setKeybindingsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const { versions: fileVersions, loading: versionsLoading, restoreVersion, saveVersion } = useFileVersions(activeFileId, activeFile)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [mobileSheet, setMobileSheet] = useState<'sidebar' | 'collab' | null>(null)
  const [gitOpen, setGitOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null)
  const git = useGit()
  const { openFileDialog, saveFileDialog } = useFileOps()
  
  useEffect(() => {
    if (workspace?.name) setTitleValue(workspace.name)
  }, [workspace?.name])
  
  const allFiles = flattenFileTree(wsFileTree)
  const trialLimits = useTrialLimits(allFiles.length)

  const openFile = useCallback((fileName: string) => { setActiveFile(fileName); setPresenceFile(fileName); setSaveState('unsaved'); const match = dbFiles.find(f => f.name === fileName); setActiveFileId(match?.id || null); setOpenTabs((prev) => { if (prev.some((t) => t.id === fileName)) return prev; return [...prev, { id: fileName, name: fileName, type: getFileType(fileName) }] }); setModifiedFiles((prev) => new Set(prev).add(fileName)) }, [dbFiles])
  const closeTab = useCallback((tabId: string) => { setOpenTabs((prev) => { const next = prev.filter((t) => t.id !== tabId); if (tabId === activeFile && next.length > 0) setActiveFile(next[next.length - 1].id); return next }); setModifiedFiles((prev) => { const next = new Set(prev); next.delete(tabId); return next }) }, [activeFile])
  const handleRename = useCallback(() => { if (!renameValue.trim() || renameValue === renameTarget) { setRenameOpen(false); return }; wsRenameFile(renameTarget, renameValue); setContents((prev) => { const next = { ...prev }; if (next[renameTarget] !== undefined) { next[renameValue] = next[renameTarget]; delete next[renameTarget] } return next }); setOpenTabs((prev) => prev.map((t) => t.id === renameTarget ? { ...t, id: renameValue, name: renameValue } : t)); if (activeFile === renameTarget) setActiveFile(renameValue); if (secondFile === renameTarget) setSecondFile(renameValue); setRenameOpen(false); toast('File renamed', 'success') }, [renameValue, renameTarget, activeFile, secondFile])
  const handleDelete = useCallback(() => { wsDeleteFile(deleteTarget); setContents((prev) => { const next = { ...prev }; delete next[deleteTarget]; return next }); setOpenTabs((prev) => { const remaining = prev.filter((t) => t.id !== deleteTarget); if (activeFile === deleteTarget && remaining.length > 0) setActiveFile(remaining[0].id); return remaining }); setDeleteOpen(false); toast('File deleted', 'success') }, [deleteTarget, activeFile])
  const handleTabReorder = useCallback((fromIndex: number, toIndex: number) => {
    setOpenTabs(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])
  const handleNewFile = useCallback((name?: string) => { if (!trialLimits.canAddFile) { setUpgradeReason(trialLimits.upgradeReason); setUpgradeDialogOpen(true); return; }; const fileName = name || 'untitled.tsx'; wsCreateFile(fileName, 'code'); openFile(fileName); setContents((prev) => ({ ...prev, [fileName]: '' })) }, [openFile, trialLimits.canAddFile, trialLimits.upgradeReason])
  useBeforeUnload(modifiedFiles.size > 0)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandOpen((p) => !p) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); setFileSearchOpen((p) => !p) }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') { e.preventDefault(); setKeybindingsOpen((p) => !p) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); if (sidebarRef.current) { const n = !leftCollapsed; setLeftCollapsed(n); if (n) sidebarRef.current?.collapse(); else sidebarRef.current?.expand() } }
      if ((e.metaKey || e.ctrlKey) && e.key === '') { e.preventDefault(); if (collabRef.current) { const n = !rightCollapsed; setRightCollapsed(n); if (n) collabRef.current?.collapse(); else collabRef.current?.expand() } }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); setSaveState('saving'); if (activeFileId) saveVersion(activeFileId, contents[activeFile] || ''); setTimeout(() => setSaveState('saved'), 800); toast('File saved', 'success') }
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') { e.preventDefault(); if (openTabs.length > 0) closeTab(activeFile) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); handleNewFile() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); setFindOpen(true) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [leftCollapsed, rightCollapsed, toast])
  const handleCommandAction = useCallback((action: string) => { switch (action) { case 'toggle-sidebar': { const n = !leftCollapsed; setLeftCollapsed(n); if (sidebarRef.current) { if (n) sidebarRef.current.collapse(); else sidebarRef.current.expand() }; break } case 'toggle-panel': { const n = !rightCollapsed; setRightCollapsed(n); if (collabRef.current) { if (n) collabRef.current.collapse(); else collabRef.current.expand() }; break } case 'split-editor': setSplitMode(true); break; case 'new-file': handleNewFile(); break;        case 'save': setSaveState('saving'); if (activeFileId) saveVersion(activeFileId, contents[activeFile] || ''); setTimeout(() => setSaveState('saved'), 800); break; case 'open-file': openFileDialog().then((file) => { if (file) { openFile(file.name); setContents((prev) => ({ ...prev, [file.name]: file.content })) } else { setFileSearchOpen(true) } }); break; case 'keybindings': setKeybindingsOpen(true); break; case 'settings': setSettingsOpen(true); break; case 'ai-assistant': setAiOpen(true); break } }, [leftCollapsed, rightCollapsed, handleNewFile])

  // Show loading skeleton while workspace loads from Supabase
  if (wsLoading && workspaceId) {
    return (
      <main className="flex h-svh min-h-[600px] flex-col overflow-hidden bg-background text-foreground">
        <div className="flex h-14 shrink-0 items-center border-b border-border bg-card/50 px-4">
          <div className="flex items-center gap-3">
            <div className="size-7 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading workspace...</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-svh min-h-[600px] flex-col overflow-hidden bg-background text-foreground">
      <TitleBar />
      <TrialBanner />
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-card/50 px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex size-7 items-center justify-center rounded bg-primary text-primary-foreground"><Sparkles className="size-3.5" /></Link>
          <Link href="/dashboard" className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline">Workspaces /</Link>
          <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-semibold hover:text-primary" onClick={() => setEditingTitle(true)}><FileCode2 className="size-3.5" /> {titleValue}</Button>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setCommandOpen(true)}><Command className="size-3.5" /></Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="icon-sm" onClick={() => setSplitMode(!splitMode)}><SplitSquareHorizontal className="size-3.5" /></Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="icon-sm" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}</Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="icon-sm" onClick={() => setAiOpen(!aiOpen)}><Bot className="size-3.5" /></Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="icon-sm" onClick={() => setVersionHistoryOpen(!versionHistoryOpen)}><History className="size-3.5" /></Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="icon-sm" onClick={() => setTerminalOpen(!terminalOpen)}><Terminal className="size-3.5" /></Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="icon-sm" onClick={() => setGitOpen(!gitOpen)} className="relative">
            <GitBranch className="size-3.5" />
            {(git.stageCount + git.unstageCount) > 0 && (
              <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                {git.stageCount + git.unstageCount}
              </span>
            )}
          </Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="icon-sm" onClick={() => setSettingsOpen(true)}><Settings2 className="size-3.5" /></Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <span className="text-[11px] text-muted-foreground">{saveState === "saved" ? "Saved" : saveState === "saving" ? "Saving..." : "Unsaved"}</span>
          <NotificationBell />
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setInviteOpen(true)}><UserPlus className="size-3.5" /> Invite</Button>
          <DeployButton workspaceName={workspace?.name} />
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => toast("Share link copied!", "success")}><Share2 className="size-3.5" /> Share</Button>
        </div>
      </header>
      <div className="flex h-6 items-center border-b border-border bg-muted/30 px-4 text-[11px] text-muted-foreground">{isDemo ? "Free personal sample · changes stay in this browser" : "Connected to Supabase · " + (workspace?.name || "workspace") + " · changes saved to cloud"}{wsError && <span className="ml-auto text-red-500">{wsError}</span> || trialLimits.canAddFile === false && <span className="ml-auto text-amber-500">File limit reached ({allFiles.length}/5)</span>}{trialLimits.canAddFile && !trialLimits.canUseCollaboration && <span className="ml-auto">{allFiles.length}/{trialLimits.fileCount === Infinity ? '∞' : 5} files</span>}</div>
      <PanelGroup direction="vertical" className="flex-1">
        <Panel defaultSize={terminalOpen ? 70 : 100} minSize={40}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={15} minSize={3} collapsedSize={3} onCollapse={() => setLeftCollapsed(true)} onExpand={() => setLeftCollapsed(false)}>
              <Sidebar fileTree={wsFileTree} collaboratorList={presenceCollaborators.length > 0 ? presenceCollaborators : wsCollaborators} collapsed={leftCollapsed} onToggle={() => { const n = !leftCollapsed; setLeftCollapsed(n); if (sidebarRef.current) { if (n) sidebarRef.current.collapse(); else sidebarRef.current.expand() } }} activeFile={activeFile} onFileChange={openFile} onNewFile={() => handleNewFile()} onFileRename={(name) => { setRenameTarget(name); setRenameValue(name); setRenameOpen(true) }} onFileDelete={(name) => { setDeleteTarget(name); setDeleteOpen(true) }} modifiedFiles={modifiedFiles} />
            </Panel>
            <ResizeHandle />
            <Panel defaultSize={splitMode ? 45 : 65} minSize={20}>
              <PanelGroup direction="horizontal">
                <Panel defaultSize={splitMode ? 50 : 100} minSize={20}>
                  <TabBar tabs={openTabs} activeTab={activeFile} onTabSelect={openFile} onTabClose={closeTab} onTabReorder={handleTabReorder} />
                  {openTabs.length === 0 ? (
                    <EmptyState
                      workspaceName={workspace?.name}
                      onNewFile={() => handleNewFile()}
                      onOpenFile={() => setFileSearchOpen(true)}
                    />
                  ) : (
                    <>
                      <FindReplace open={findOpen} onClose={() => setFindOpen(false)} onFind={() => {}} onReplace={() => {}} onReplaceAll={() => {}} matchCount={0} currentMatch={0} />
                      <CodeEditor remoteCursors={remoteCursors} onCursorChange={setCursorPosition} activeFile={activeFile} onFileChange={openFile} fileContents={contents} onCloseFile={() => closeTab(activeFile)} />
                    </>
                  )}
                </Panel>
                {splitMode && (
                  <>
                    <ResizeHandle />
                    <Panel defaultSize={50} minSize={20}>
                      {secondFile ? (
                        <>
                          <TabBar tabs={[{ id: secondFile, name: secondFile, type: 'code' }]} activeTab={secondFile} onTabSelect={openFile} onTabClose={() => setSplitMode(false)} onTabReorder={() => {}} />
                          <CodeEditor remoteCursors={[]} onCursorChange={() => {}} activeFile={secondFile} onFileChange={openFile} fileContents={contents} onCloseFile={() => setSplitMode(false)} />
                        </>
                      ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                          <p className="text-sm text-muted-foreground">Click a file in the sidebar to open it in this panel</p>
                          <Button variant="outline" size="sm" onClick={() => setSplitMode(false)}>Close split</Button>
                        </div>
                      )}
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>
            <ResizeHandle />
            <Panel defaultSize={20} minSize={3} collapsedSize={3} onCollapse={() => setRightCollapsed(true)} onExpand={() => setRightCollapsed(false)}>
              <CollaborationPanel collaboratorList={presenceCollaborators.length > 0 ? presenceCollaborators : wsCollaborators} open={!rightCollapsed} onToggle={() => { const n = !rightCollapsed; setRightCollapsed(n); if (collabRef.current) { if (n) collabRef.current.collapse(); else collabRef.current.expand() } }} workspaceId={workspaceId} userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'} />
            </Panel>
          </PanelGroup>
        </Panel>
        {terminalOpen && <ResizeHandle />}
        {terminalOpen && (
          <Panel defaultSize={30} minSize={10}>
            <TerminalPanel
              open={terminalOpen}
              onToggle={() => setTerminalOpen(false)}
              fileTree={wsFileTree}
              fileContents={contents}
              onSaveFile={saveFile}
              onOpenFile={openFile}
            />
          </Panel>
        )}
      </PanelGroup>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} onAction={handleCommandAction} mod={mod} />
      <FileSearch open={fileSearchOpen} onOpenChange={setFileSearchOpen} files={flattenFileTree(wsFileTree)} onSelect={(f) => { openFile(f); setFileSearchOpen(false) }} />
      <KeybindingsModal open={keybindingsOpen} onOpenChange={setKeybindingsOpen} mod={mod} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AIAssistant open={aiOpen} onToggle={() => setAiOpen(!aiOpen)} activeFile={activeFile} fileContent={contents[activeFile] || ""} onApplyCode={(code: string) => { setContents((prev) => ({ ...prev, [activeFile]: code })) }} />
      {versionHistoryOpen && (
        <div className="absolute right-0 top-14 bottom-0 z-30 w-72">
          <VersionHistoryPanel
            open={versionHistoryOpen}
            onToggle={() => setVersionHistoryOpen(false)}
            versions={fileVersions}
            loading={versionsLoading}
            currentFileName={activeFile}
            currentContent={contents[activeFile] || ''}
            onRestore={(content) => {
              setContents(prev => ({ ...prev, [activeFile]: content }))
              setSaveState('unsaved')
              toast('Version restored', 'success')
            }}
          />
        </div>
      )}
      {gitOpen && (
        <div className="absolute right-0 top-14 bottom-0 z-30 w-80">
          <GitPanel
            open={gitOpen}
            onToggle={() => setGitOpen(false)}
            branches={git.branches}
            commits={git.commits}
            changes={git.changes}
            currentBranch={git.currentBranch}
            stageCount={git.stageCount}
            unstageCount={git.unstageCount}
            formatDate={git.formatDate}
            onSwitchBranch={git.switchBranch}
            onCreateBranch={git.createBranch}
            onStageFile={git.stageFile}
            onUnstageFile={git.unstageFile}
            onStageAll={git.stageAll}
            onUnstageAll={git.unstageAll}
            onCommit={git.commit}
            onDiscardChanges={git.discardChanges}
            onOpenFile={openFile}
          />
        </div>
      )}
      <InviteCollaboratorDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={async (email, role) => {
          if (!workspaceId) {
            toast('Sign in to invite collaborators', 'info')
            return
          }
          await addCollaborator(workspaceId, email, role)
          toast('Invitation sent to ' + email, 'success')
        }}
      />
      {/* Mobile bottom navigation */}
      <div className="flex h-12 items-center justify-around border-t border-border bg-card/80 backdrop-blur-sm md:hidden">
        <button onClick={() => setMobileSheet('sidebar')} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground p-2">
          <FolderOpen className="size-4" />
          <span className="text-[9px]">Files</span>
        </button>
        <button onClick={() => setFileSearchOpen(true)} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground p-2">
          <Search className="size-4" />
          <span className="text-[9px]">Search</span>
        </button>
        <button onClick={() => setTerminalOpen(!terminalOpen)} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground p-2">
          <Terminal className="size-4" />
          <span className="text-[9px]">Terminal</span>
        </button>
        <button onClick={() => setMobileSheet('collab')} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground p-2">
          <Users className="size-4" />
          <span className="text-[9px]">Team</span>
        </button>
        <button onClick={() => setSettingsOpen(true)} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground p-2">
          <Settings2 className="size-4" />
          <span className="text-[9px]">Settings</span>
        </button>
      </div>

      {/* Mobile sidebar sheet */}
      <MobileBottomSheet open={mobileSheet === 'sidebar'} onOpenChange={(open) => !open && setMobileSheet(null)} title="Files">
        <div className="p-4">
          <Sidebar
            fileTree={wsFileTree}
            collaboratorList={presenceCollaborators.length > 0 ? presenceCollaborators : wsCollaborators}
            collapsed={false}
            onToggle={() => setMobileSheet(null)}
            activeFile={activeFile}
            onFileChange={(f) => { openFile(f); setMobileSheet(null) }}
            onNewFile={() => handleNewFile()}
            onFileRename={(name) => { setRenameTarget(name); setRenameValue(name); setRenameOpen(true) }}
            onFileDelete={(name) => { setDeleteTarget(name); setDeleteOpen(true) }}
            modifiedFiles={modifiedFiles}
          />
        </div>
      </MobileBottomSheet>

      {/* Mobile collaboration sheet */}
      <MobileBottomSheet open={mobileSheet === 'collab'} onOpenChange={(open) => !open && setMobileSheet(null)} title="Collaboration">
        <CollaborationPanel
          collaboratorList={presenceCollaborators.length > 0 ? presenceCollaborators : wsCollaborators}
          open={true}
          onToggle={() => setMobileSheet(null)}
          workspaceId={workspaceId}
          userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'}
        />
      </MobileBottomSheet>      <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} reason={upgradeReason} />
    </main>
  )
}

export default EditorShell