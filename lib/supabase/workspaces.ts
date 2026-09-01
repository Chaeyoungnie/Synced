import { createClient } from './client'
import type { Database } from './types'

type Workspace = Database['public']['Tables']['workspaces']['Row']
type File = Database['public']['Tables']['files']['Row']

// ============================================
// WORKSPACE OPERATIONS
// ============================================

export async function createWorkspace(name: string, description?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, description, owner_id: user.id })
    .select()
    .single()

  return { data, error }
}

export async function getWorkspaces() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      collaborators!inner(user_id, role, profiles:user_id(full_name, avatar_url))
    `)
    .or(`owner_id.eq.${user.id},collaborators.user_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  return { data, error }
}

export async function getWorkspace(workspaceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      collaborators(user_id, role, profiles:user_id(full_name, avatar_url, email))
    `)
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

export async function createFile(workspaceId: string, file: Omit<Database['public']['Tables']['files']['Insert'], 'workspace_id'>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('files')
    .insert({ ...file, workspace_id: workspaceId, created_by: user?.id })
    .select()
    .single()

  return { data, error }
}

export async function updateFileContent(fileId: string, content: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('files')
    .update({ content, git_status: 'modified' })
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

export async function addCollaborator(workspaceId: string, email: string, role: Database['public']['Tables']['collaborators']['Insert']['role'] = 'viewer') {
  const supabase = createClient()
  
  // First find the user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
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

export function subscribeToMessages(workspaceId: string, callback: (message: Database['public']['Tables']['messages']['Row']) => void) {
  const supabase = createClient()

  return supabase
    .channel(`messages:${workspaceId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `workspace_id=eq.${workspaceId}`,
    }, (payload) => {
      callback(payload.new as Database['public']['Tables']['messages']['Row'])
    })
    .subscribe()
}
