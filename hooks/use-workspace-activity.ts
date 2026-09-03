"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

export interface ActivityEvent {
  id: string
  action: string
  details: Record<string, unknown>
  created_at: string
  userName: string
  userInitials: string
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    file_created: "created a file",
    file_edited: "edited a file",
    file_deleted: "deleted a file",
    file_renamed: "renamed a file",
    workspace_created: "created workspace",
    workspace_deleted: "deleted workspace",
    mention: "mentioned someone",
    comment: "left a comment",
  }
  return labels[action] || action.replace(/_/g, " ")
}

function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    file_created: "📄",
    file_edited: "✏️",
    file_deleted: "🗑️",
    file_renamed: "📝",
    workspace_created: "📁",
    workspace_deleted: "❌",
    mention: "💬",
    comment: "💭",
  }
  return icons[action] || "•"
}

export { getActionLabel, getActionIcon, formatTimeAgo }

export function useWorkspaceActivity(workspaceId?: string | null) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const activitiesRef = useRef<ActivityEvent[]>([])
  activitiesRef.current = activities

  const fetchActivities = useCallback(async () => {
    if (!workspaceId || !isSupabaseConfigured()) {
      setActivities([])
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100)
      if (error) throw error

      // Fetch user names for all unique user IDs
      const userIds = [...new Set((data || []).map((a: any) => a.user_id).filter(Boolean))]
      let profileMap: Record<string, { name: string; initials: string }> = {}
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds)
        if (profiles) {
          profileMap = Object.fromEntries(
            profiles.map((p: any) => {
              const name = p.full_name || "Unknown"
              return [
                p.id,
                {
                  name,
                  initials: name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
                },
              ]
            })
          )
        }
      }

      const events: ActivityEvent[] = (data || []).map((a: any) => {
        const profile = profileMap[a.user_id] || { name: "Unknown", initials: "U" }
        return {
          id: a.id,
          action: a.action,
          details: a.details || {},
          created_at: a.created_at,
          userName: profile.name,
          userInitials: profile.initials,
        }
      })
      setActivities(events)
    } catch {
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  // Subscribe to realtime activities
  useEffect(() => {
    if (!workspaceId || !isSupabaseConfigured()) return
    let mounted = true
    const supabase = createClient()
    const channel = supabase
      .channel(`activities:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        async (payload) => {
          if (!mounted) return
          const newActivity = payload.new as any
          if (activitiesRef.current.some((a) => a.id === newActivity.id)) return

          // Fetch sender name
          let userName = "Unknown"
          let userInitials = "U"
          if (newActivity.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", newActivity.user_id)
              .single()
            if (profile?.full_name) {
              userName = profile.full_name
              userInitials = userName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
            }
          }

          const event: ActivityEvent = {
            id: newActivity.id,
            action: newActivity.action,
            details: newActivity.details || {},
            created_at: newActivity.created_at,
            userName,
            userInitials,
          }
          setActivities((prev) => [event, ...prev])
        }
      )
      .subscribe((status) => {
        console.log('[Activity Realtime] Channel status:', status)
      })
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  // Initial fetch
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Filter activities by search query
  const filteredActivities = searchQuery
    ? activities.filter((a) => {
        const query = searchQuery.toLowerCase()
        const actionMatch = a.action.toLowerCase().includes(query)
        const nameMatch = a.userName.toLowerCase().includes(query)
        const detailMatch = JSON.stringify(a.details).toLowerCase().includes(query)
        return actionMatch || nameMatch || detailMatch
      })
    : activities

  return {
    activities: filteredActivities,
    allActivities: activities,
    loading,
    searchQuery,
    setSearchQuery,
    refresh: fetchActivities,
  }
}
