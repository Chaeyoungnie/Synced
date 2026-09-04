import { createClient, isSupabaseConfigured } from './client'

export interface Invitation {
  id: string
  workspace_id: string
  inviter_id: string
  invitee_email: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  workspace_name?: string
  inviter_name?: string
}

// Create a new invitation
export async function createInvitation(workspaceId: string, email: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Check if already a collaborator
  const { data: existing } = await supabase
    .from('collaborators')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id, status')
    .eq('workspace_id', workspaceId)
    .eq('invitee_email', email)
    .eq('status', 'pending')
    .single()

  if (existingInvite) {
    return { error: 'Already invited' }
  }

  const { error } = await supabase.from('invitations').insert({
    workspace_id: workspaceId,
    inviter_id: user.id,
    invitee_email: email,
    status: 'pending',
  })

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') return { error: 'Already invited' }
    return { error: error.message }
  }

  return {}
}

// Fetch pending invitations for the current user
export async function getMyInvitations(): Promise<Invitation[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get current user's email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  const email = profile?.email || user.email
  if (!email) return []

  // Fetch pending invitations for this email
  const { data: invitations, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('invitee_email', email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error || !invitations) return []

  // Fetch workspace names and inviter names
  const enriched = await Promise.all(invitations.map(async (inv) => {
    let workspaceName = 'Unknown workspace'
    let inviterName = 'Someone'

    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', inv.workspace_id)
      .single()
    if (ws && !wsError) workspaceName = ws.name
    else workspaceName = 'Shared workspace'

    const { data: inviter } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', inv.inviter_id)
      .single()
    if (inviter?.full_name) inviterName = inviter.full_name

    return { ...inv, workspace_name: workspaceName, inviter_name: inviterName }
  }))

  return enriched
}

// Accept an invitation
export async function acceptInvitation(invitationId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Get the invitation
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (!invitation) return { error: 'Invitation not found' }
  if (invitation.status !== 'pending') return { error: 'Invitation already processed' }

  // Add as collaborator
  const { error: collabError } = await supabase.from('collaborators').insert({
    workspace_id: invitation.workspace_id,
    user_id: user.id,
    role: 'editor',
  })

  if (collabError) {
    if (collabError.code === '23505') {
      // Already a collaborator, just mark invitation as accepted
    } else {
      return { error: collabError.message }
    }
  }

  // Mark invitation as accepted
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', invitationId)

  if (error) return { error: error.message }

  return {}
}

// Decline an invitation
export async function declineInvitation(invitationId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' }

  const supabase = createClient()
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', invitationId)

  if (error) return { error: error.message }
  return {}
}
