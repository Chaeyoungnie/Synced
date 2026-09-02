'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'

export interface PresenceUser {
  id: string
  name: string
  initials: string
  color: string
  role: string
  status: string
  activeFile: string | null
  cursorLine: number | null
  cursorCol: number | null
}

// Colors for presence avatars
const PRESENCE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']

function getColorForUser(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash |= 0
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length]
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

// Fallback demo users when not connected to Supabase
const DEMO_PRESENCE: PresenceUser[] = [
  { id: 'sc', name: 'Sarah Chen', initials: 'SC', color: '#6366f1', role: 'Admin', status: 'Editing page.tsx', activeFile: 'page.tsx', cursorLine: 3, cursorCol: 1 },
  { id: 'am', name: 'Alex Morgan', initials: 'AM', color: '#f59e0b', role: 'Editor', status: 'Viewing globals.css', activeFile: 'globals.css', cursorLine: 1, cursorCol: 1 },
  { id: 'mp', name: 'Maya Patel', initials: 'MP', color: '#10b981', role: 'Viewer', status: '5m ago', activeFile: null, cursorLine: null, cursorCol: null },
]

export function usePresence(workspaceId?: string | null) {
  const { user } = useUser()
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>(DEMO_PRESENCE)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<any>(null)
  const activeFileRef = useRef<string | null>(null)
  const cursorRef = useRef<{ line: number; col: number } | null>(null)
  // Unique key per tab so same user in multiple tabs shows as separate connections
  const tabIdRef = useRef(Math.random().toString(36).slice(2))

  // Track current user's active file and cursor
  const setActiveFile = useCallback((fileName: string | null) => {
    activeFileRef.current = fileName
    // Broadcast update to channel
    if (channelRef.current && isConnected) {
      channelRef.current.track({
        active_file: fileName,
        cursor_line: cursorRef.current?.line || null,
        cursor_col: cursorRef.current?.col || null,
      })
    }
  }, [isConnected])

  const setCursorPosition = useCallback((line: number, col: number) => {
    cursorRef.current = { line, col }
    if (channelRef.current && isConnected) {
      channelRef.current.track({
        active_file: activeFileRef.current,
        cursor_line: line,
        cursor_col: col,
      })
    }
  }, [isConnected])

  useEffect(() => {
    if (!workspaceId || !isSupabaseConfigured() || !user) {
      setOnlineUsers(DEMO_PRESENCE)
      return
    }

    let mounted = true
    const supabase = createClient()
    const channelName = `presence:workspace:${workspaceId}`

    // Use a unique key per tab so multiple tabs of the same user appear as separate connections
    const presenceKey = `${user.id}:${tabIdRef.current}`

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!mounted) return
        const state = channel.presenceState()
        const users: PresenceUser[] = []

        for (const [key, presences] of Object.entries(state)) {
          const presence = (presences as any[])[0]
          if (!presence) continue

          users.push({
            id: key,
            name: presence.user_name || 'Unknown',
            initials: getInitials(presence.user_name || 'U'),
            color: getColorForUser(key),
            role: presence.role || 'Editor',
            status: presence.active_file ? `Editing ${presence.active_file}` : 'Online',
            activeFile: presence.active_file || null,
            cursorLine: presence.cursor_line || null,
            cursorCol: presence.cursor_col || null,
          })
        }

        // Always include current user
        const hasCurrentUser = users.some(u => u.id === user.id)
        if (!hasCurrentUser) {
          users.unshift({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'You',
            initials: getInitials(user.user_metadata?.full_name || 'You'),
            color: getColorForUser(user.id),
            role: 'Editor',
            status: 'Online',
            activeFile: activeFileRef.current,
            cursorLine: cursorRef.current?.line || null,
            cursorCol: cursorRef.current?.col || null,
          })
        }

        setOnlineUsers(users)
        setIsConnected(true)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // sync handles this
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // sync handles this
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'You'
          await channel.track({
            user_id: user.id,
            user_name: userName,
            role: 'Editor',
            active_file: activeFileRef.current,
            cursor_line: cursorRef.current?.line || null,
            cursor_col: cursorRef.current?.col || null,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      mounted = false
      channelRef.current = null
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [workspaceId, user])

  return {
    onlineUsers,
    isConnected,
    setActiveFile,
    setCursorPosition,
  }
}
