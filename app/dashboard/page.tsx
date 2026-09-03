'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Folder, Users, Clock, MoreHorizontal, Trash2, Settings2, ArrowLeft, Search, Sparkles, Globe, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useUser } from '@/hooks/use-user'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { createWorkspace, getWorkspaces, deleteWorkspace } from '@/lib/supabase/workspaces'
import { getMyInvitations, acceptInvitation, declineInvitation, type Invitation } from '@/lib/supabase/invitations'

interface Workspace {
  id: string; name: string; description: string;
  fileCount: number; collaboratorCount: number;
  lastModified: string; isPublic: boolean;
  language: string; color: string;
}

const MOCK: Workspace[] = [
  { id: '1', name: 'Collaborative Editor', description: 'A real-time collaborative code editor with AI assistance', fileCount: 24, collaboratorCount: 4, lastModified: '2 minutes ago', isPublic: false, language: 'TypeScript', color: '#6366f1' },
  { id: '2', name: 'API Gateway', description: 'REST API with authentication and rate limiting', fileCount: 18, collaboratorCount: 2, lastModified: '1 hour ago', isPublic: true, language: 'Go', color: '#f59e0b' },
  { id: '3', name: 'ML Pipeline', description: 'Data processing pipeline for model training', fileCount: 31, collaboratorCount: 6, lastModified: '3 days ago', isPublic: false, language: 'Python', color: '#10b981' },
  { id: '4', name: 'Mobile App', description: 'React Native cross-platform mobile application', fileCount: 42, collaboratorCount: 3, lastModified: '5 days ago', isPublic: false, language: 'TypeScript', color: '#ec4899' },
]

const LC: Record<string, string> = { TypeScript: '#3178c6', Python: '#3572a5', Go: '#00add8' }

export default function DashboardPage() {
  const { user, loading: userLoading, signOut } = useUser()
  const router = useRouter()
  const [ws, setWs] = useState<Workspace[]>(MOCK)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [sq, setSq] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const loadedRef = useRef(false)

  useEffect(() => {
    // Skip if still loading user or already loaded
    if (userLoading || loadedRef.current) return

    const loadWorkspaces = async () => {
      if (!user || !isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      try {
        const { data: workspaces, error: wsError } = await getWorkspaces()
        if (wsError || !workspaces) {
          setLoading(false)
          return
        }

        const mapped: Workspace[] = workspaces.map((w: any) => ({
          id: w.id,
          name: w.name,
          description: w.description || '',
          fileCount: 0,
          collaboratorCount: 1,
          lastModified: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : 'Never',
          isPublic: w.is_public || false,
          language: 'TypeScript',
          color: '#6366f1',
        }))

        setAuthWs(mapped)

        // Load invitations
        setInvitationsLoading(true)
        try {
          const invs = await getMyInvitations()
          setInvitations(invs)
        } catch {}
        setInvitationsLoading(false)
      } catch (e) {
        console.error('Error loading workspaces:', e)
      }
      setLoading(false)
    }

    loadedRef.current = true
    loadWorkspaces()
  }, [user, userLoading])

  const [authWs, setAuthWs] = useState<Workspace[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [invitationsLoading, setInvitationsLoading] = useState(false)

  const allWs = user ? (authWs.length > 0 ? authWs : MOCK) : MOCK
  const filtered = allWs.filter(w => w.name.toLowerCase().includes(sq.toLowerCase()) || w.description.toLowerCase().includes(sq.toLowerCase()))

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    if (user && isSupabaseConfigured()) {
      try {
        const { data, error } = await createWorkspace(newName, newDesc || undefined)
        if (data && !error) {
          router.push("/editor?ws=" + data.id)
          setAuthWs(prev => [{ id: data.id, name: data.name, description: data.description || '', fileCount: 0, collaboratorCount: 1, lastModified: 'Just now', isPublic: false, language: 'TypeScript', color: '#6366f1' }, ...prev])
        }
      } catch {}
    } else {
      setWs(prev => [{ id: String(Date.now()), name: newName, description: newDesc || 'New workspace', fileCount: 0, collaboratorCount: 1, lastModified: 'Just now', isPublic: false, language: 'TypeScript', color: '#6366f1' }, ...prev])
    }
    setNewName(''); setNewDesc(''); setCreateOpen(false); setCreating(false)
  }

  const dn = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer'
  const init = dn.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></div>
            <span className="text-sm font-semibold">Synced</span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="icon" className="rounded-full bg-primary text-[10px] font-bold text-primary-foreground" />}>{init}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8}>
                  <DropdownMenuItem onClick={() => router.push('/profile')}><User className="size-4" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/')}><ArrowLeft className="size-4" /> Home</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={async () => { await signOut(); router.push('/') }}><Trash2 className="size-4" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/sign-in"><Button variant="outline" size="sm">Sign in</Button></Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Workspaces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {allWs.length} workspace{allWs.length !== 1 ? 's' : ''} · {invitations.length > 0 && invitations.length + ' invitation' + (invitations.length !== 1 ? 's' : '') + ' pending'} {user ? '· Signed in as ' + dn : '· Demo mode'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search workspaces..." className="w-64 pl-9" value={sq} onChange={e => setSq(e.target.value)} />
            </div>
            <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> New</Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(w => (
            <div key={w.id} className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: w.color }}>{w.name[0]}</div>
                  <div>
                    <h3 className="font-semibold leading-tight">{w.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="size-2 rounded-full" style={{ backgroundColor: LC[w.language] || '#999' }} />
                      {w.language}
                      {w.isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
                    </div>
                  </div>
                </div>
                <div className="relative z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100" onClick={(e: React.MouseEvent) => e.stopPropagation()} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push('/editor?ws=' + w.id)}><Settings2 className="size-4" /> Open</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={async () => { if (user && isSupabaseConfigured()) { await deleteWorkspace(w.id) } setAuthWs(p => p.filter(x => x.id !== w.id)) }}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{w.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Folder className="size-3" /> {w.fileCount} files</span>
                  <span className="flex items-center gap-1"><Users className="size-3" /> {w.collaboratorCount}</span>
                </div>
                <span className="flex items-center gap-1"><Clock className="size-3" /> {w.lastModified}</span>
              </div>
              <button onClick={() => router.push('/editor?ws=' + w.id)} className="absolute inset-0 rounded-xl z-0" aria-label={`Open ${w.name}`} />
            </div>
          ))}
          <button onClick={() => setCreateOpen(true)} className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-5 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10"><Plus className="size-6" /></div>
            <span className="text-sm font-medium">Create new workspace</span>
          </button>
        </div>

        {/* Shared with you section */}
        {invitations.length > 0 && (
          <div className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Shared with you</h2>
                <p className="text-xs text-muted-foreground">{invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-all hover:border-primary/30 hover:shadow-sm">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {(inv.workspace_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{inv.workspace_name}</h3>
                      <p className="text-[11px] text-muted-foreground">from {inv.inviter_name}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={async () => {
                          await declineInvitation(inv.id)
                          setInvitations(prev => prev.filter(i => i.id !== inv.id))
                        }}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={async () => {
                          const { error } = await acceptInvitation(inv.id)
                          if (!error) {
                            setInvitations(prev => prev.filter(i => i.id !== inv.id))
                            setAuthWs(prev => [{
                              id: inv.workspace_id,
                              name: inv.workspace_name || 'Shared workspace',
                              description: '',
                              fileCount: 0,
                              collaboratorCount: 2,
                              lastModified: 'Just now',
                              isPublic: false,
                              language: 'TypeScript',
                              color: '#6366f1',
                            }, ...prev])
                          }
                        }}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>Create a new workspace to start coding.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="ws-name" className="text-sm font-medium">Name</label>
              <Input id="ws-name" placeholder="My project" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="ws-desc" className="text-sm font-medium">Description</label>
              <Input id="ws-desc" placeholder="Brief description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
