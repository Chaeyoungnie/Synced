import { createClient, isSupabaseConfigured } from './client'

export type ActivityAction = 
  | 'file_created'
  | 'file_edited' 
  | 'file_deleted'
  | 'file_renamed'
  | 'workspace_created'
  | 'workspace_deleted'

interface ActivityDetails {
  fileName?: string
  workspaceName?: string
  oldName?: string
  newName?: string
  lineCount?: number
}

export async function logActivity(
  workspaceId: string,
  action: ActivityAction,
  details?: ActivityDetails
) {
  if (!isSupabaseConfigured()) return
  
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('[Activity] No user logged in, skipping activity log')
      return
    }
    
    const { error } = await supabase.from('activities').insert({
      workspace_id: workspaceId,
      user_id: user.id,
      action,
      details: details || {},
    })
    if (error) {
      console.error('[Activity] Failed to log activity:', error.message, error.details)
    } else {
      console.log('[Activity] Logged:', action, details)
    }
  } catch (e) {
    console.error('[Activity] Exception logging activity:', e)
  }
}
