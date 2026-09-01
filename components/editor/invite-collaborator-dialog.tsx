'use client'

import { useState } from 'react'
import { UserPlus, Mail, Shield, Pencil, Eye, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Role = 'viewer' | 'editor' | 'admin'

const roles: { value: Role; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'viewer', label: 'Viewer', description: 'Can view files but cannot edit', icon: <Eye className="size-3.5" /> },
  { value: 'editor', label: 'Editor', description: 'Can view and edit files', icon: <Pencil className="size-3.5" /> },
  { value: 'admin', label: 'Admin', description: 'Can edit, manage collaborators, and settings', icon: <Shield className="size-3.5" /> },
]

interface InviteCollaboratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string, role: Role) => Promise<void>
}

export function InviteCollaboratorDialog({ open, onOpenChange, onInvite }: InviteCollaboratorDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('editor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await onInvite(email.trim(), role)
      setSuccess(true)
      setEmail('')
      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to invite collaborator'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail('')
      setError(null)
      setSuccess(false)
      setRole('editor')
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Invite Collaborator
          </DialogTitle>
          <DialogDescription>
            Add a team member to this workspace by their email address.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-sm font-medium">Invitation sent!</p>
            <p className="text-xs text-muted-foreground">They will appear as a collaborator once they accept.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  className="pl-9"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-md border p-2.5 text-xs transition-colors',
                      role === r.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    {r.icon}
                    <span className="font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60">
                {roles.find(r => r.value === role)?.description}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!email.trim() || loading}
                className="gap-1.5"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <UserPlus className="size-3.5" />
                )}
                {loading ? 'Sending...' : 'Send Invite'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
