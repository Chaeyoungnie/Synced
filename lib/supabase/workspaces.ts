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
}export async function getWorkspaces() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Get ONLY workspaces where user is the owner
  const { data: ownedWorkspaces, error: ownedError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  return { data: ownedWorkspaces || [], error: ownedError }
}

// Get workspaces shared with the current user as a collaborator
export async function getSharedWorkspaces() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('collaborators')
    .select('workspaces(*)')
    .eq('user_id', user.id)

  if (error) return { data: [], error }

  const workspaces = (data || []).map((c: any) => c.workspaces).filter(Boolean)
  return { data: workspaces, error: null }
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
  
  // Find the user by email (check profiles.email first, then auth email)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) {
    // Try searching by full_name as fallback (in case email isn't set)
    const { data: nameProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', email)
      .single()
    
    if (!nameProfile) throw new Error('No user found with that email. They may need to sign up first.')
    
    // Check if already a collaborator
    const { data: existing } = await supabase
      .from('collaborators')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', nameProfile.id)
      .single()
    
    if (existing) throw new Error('This user is already a collaborator.')
    
    const { data, error } = await supabase
      .from('collaborators')
      .insert({
        workspace_id: workspaceId,
        user_id: nameProfile.id,
        role,
      })
      .select()
      .single()
    
    if (error) throw error
    return { data, error }
  }

  // Check if already a collaborator
  const { data: existing } = await supabase
    .from('collaborators')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', profile.id)
    .single()

  if (existing) throw new Error('This user is already a collaborator.')

  const { data, error } = await supabase
    .from('collaborators')
    .insert({
      workspace_id: workspaceId,
      user_id: profile.id,
      role,
    })
    .select()
    .single()

  if (error) throw error
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

export async function searchUsers(query: string) {
  if (!query || query.length < 2) return []
  const supabase = createClient()
  
  // Search profiles by email or full_name (case-insensitive)
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10)

  return data || []
}

export async function getCollaborators(workspaceId: string) {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('collaborators')
    .select('id, user_id, role, created_at, profiles:user_id(full_name, email, avatar_url)')
    .eq('workspace_id', workspaceId)

  return (data || []).map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    name: c.profiles?.full_name || 'Unknown',
    email: c.profiles?.email || '',
    avatar: c.profiles?.avatar_url || null,
    role: c.role,
    joinedAt: c.created_at,
  }))
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
