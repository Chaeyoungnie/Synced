export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          is_public: boolean
          share_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          workspace_id: string
          parent_id: string | null
          name: string
          path: string
          type: 'code' | 'css' | 'json' | 'html' | 'text' | 'folder'
          content: string | null
          git_status: 'committed' | 'modified' | 'new' | 'untracked' | 'deleted'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          parent_id?: string | null
          name: string
          path: string
          type: 'code' | 'css' | 'json' | 'html' | 'text' | 'folder'
          content?: string | null
          git_status?: 'committed' | 'modified' | 'new' | 'untracked' | 'deleted'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          parent_id?: string | null
          name?: string
          path?: string
          type?: 'code' | 'css' | 'json' | 'html' | 'text' | 'folder'
          content?: string | null
          git_status?: 'committed' | 'modified' | 'new' | 'untracked' | 'deleted'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collaborators: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string
        }
      }
      file_versions: {
        Row: {
          id: string
          file_id: string
          content: string
          version_number: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          content: string
          version_number: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          content?: string
          version_number?: number
          created_by?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          action: string
          details: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          action: string
          details?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          action?: string
          details?: Record<string, unknown> | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          content: string
          file_reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          content: string
          file_reference?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          content?: string
          file_reference?: string | null
          created_at?: string
        }
      }
    }
  }
}
