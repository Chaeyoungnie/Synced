import { createClient } from './client'
import type { Database } from './types'
import { logActivity } from './activities'

type Workspace = Database['public']['Tables']['workspaces']['Row']
type File = Database['public']['Tables']['files']['Row']

// ============================================
// WORKSPACE OPERATIONS
// ============================================

export async function createWorkspace(name: string, description?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // First, ensure the user has a profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    // Create profile if it doesn't exist
    await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
      })
  }

  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, description, owner_id: user.id })
    .select()
    .single()

  if (data && !error) {
    logActivity(data.id, 'workspace_created', { workspaceName: name })
  }

  return { data, error }
}

export async function getWorkspaces() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Simple query first - just get workspaces owned by the user
  const { data: ownedWorkspaces, error: ownedError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  if (ownedError) {
    return { data: null, error: ownedError }
  }

  return { data: ownedWorkspaces || [], error: null }
}

export async function getWorkspace(workspaceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  return { data, error }
}

export async function updateWorkspace(workspaceId: string, updates: Partial<Pick<Workspace, 'name' | 'description' | 'is_public'>>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', workspaceId)
    .select()
    .single()

  return { data, error }
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)

  return { error }
}

// ============================================
// FILE OPERATIONS
// ============================================

export async function getFiles(workspaceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('path')

  return { data, error }
}

export async function getFile(fileId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single()

  return { data, error }
}

export async function createFile(workspaceId: string, file: { name: string; path: string; content?: string; language?: string }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('files')
    .insert({
      workspace_id: workspaceId,
      name: file.name,
      path: file.path,
      content: file.content || '',
      language: file.language || 'plaintext',
    })
    .select()
    .single()

  return { data, error }
}

export async function updateFileContent(fileId: string, content: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('files')
    .update({ content })
    .eq('id', fileId)
    .select()
    .single()

  return { data, error }
}

export async function deleteFile(fileId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)

  return { error }
}

// ============================================
// COLLABORATOR OPERATIONS
// ============================================

export async function addCollaborator(workspaceId: string, email: string, role: string = 'viewer') {
  const supabase = createClient()
  
  // First find the user by email in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', email)
    .single()

  if (!profile) throw new Error('User not found')

  const { data, error } = await supabase
    .from('collaborators')
    .insert({
      workspace_id: workspaceId,
      user_id: profile.id,
      role,
    })
    .select()
    .single()

  return { data, error }
}

export async function removeCollaborator(workspaceId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)

  return { error }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToFiles(workspaceId: string, callback: (file: File) => void) {
  const supabase = createClient()

  return supabase
    .channel(`files:${workspaceId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'files',
      filter: `workspace_id=eq.${workspaceId}`,
    }, (payload) => {
      callback(payload.new as File)
    })
    .subscribe()
}

export function subscribeToMessages(workspaceId: string, callback: (message: { id: string; content: string; user_id: string; created_at: string }) => void) {
  const supabase = createClient()

  return supabase
    .channel(`messages:${workspaceId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `workspace_id=eq.${workspaceId}`,
    }, (payload) => {
      callback(payload.new as { id: string; content: string; user_id: string; created_at: string })
    })
    .subscribe()
}
