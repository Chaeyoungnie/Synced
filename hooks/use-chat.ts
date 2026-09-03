"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

export interface ChatMessage {
  id: string
  sender: string
  initials: string
  text: string
  time: string
  file?: string
  userId?: string
}

interface DbMessage {
  id: string
  workspace_id: string
  user_id: string | null
  content: string
  file_reference: string | null
  created_at: string
  profiles?: { full_name: string | null; avatar_url: string | null } | null
}

function getDemoMessages(): ChatMessage[] {
  return [
    { id: "1", sender: "Sarah", initials: "SC", text: "Updated the imports in page.tsx — can you review?", time: "just now", file: "page.tsx" },
    { id: "2", sender: "Alex", initials: "AM", text: "Looks good! I'll check the preview component next.", time: "1m ago" },
    { id: "3", sender: "Maya", initials: "MP", text: "Left a comment on the CSS variable naming in globals.css", time: "5m ago", file: "globals.css" },
  ]
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return minutes + "m ago"
  if (hours < 24) return hours + "h ago"
  if (days < 7) return days + "d ago"
  return new Date(dateStr).toLocaleDateString()
}

function dbMessageToChat(msg: DbMessage, currentUserName?: string): ChatMessage {
  // Use the sender's profile name if available, otherwise fall back to current user
  const senderProfile = msg.profiles
  const name = senderProfile?.full_name || currentUserName || "User"
  const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
  return {
    id: msg.id,
    sender: name,
    initials,
    text: msg.content,
    time: formatTimeAgo(msg.created_at),
    file: msg.file_reference || undefined,
    userId: msg.user_id || undefined,
  }
}

export function useChat(workspaceId?: string | null, userName?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  const messagesRef = useRef<ChatMessage[]>([])
  messagesRef.current = messages

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!workspaceId || !isSupabaseConfigured()) {
      setMessages(getDemoMessages())
      setIsDemo(true)
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessages(getDemoMessages())
        setIsDemo(true)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50)
      if (error) throw error
      const chatMessages = (data || []).map((m: DbMessage) => dbMessageToChat(m, userName))
      // Fetch sender names separately (no foreign key join needed)
      const userIds = [...new Set((data || []).map((m: DbMessage) => m.user_id).filter(Boolean))]
      let profileMap: Record<string, string> = {}
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds)
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name || "Unknown"]))
        }
      }
      // Re-map messages with correct sender names
      const finalMessages = (data || []).map((m: DbMessage) => {
        const senderName = profileMap[m.user_id || ''] || userName || "User"
        return dbMessageToChat({ ...m, profiles: { full_name: senderName } } as any, userName)
      })
      setMessages(finalMessages)
      setIsDemo(false)
    } catch {
      setMessages(getDemoMessages())
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [workspaceId, userName])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!workspaceId || !isSupabaseConfigured()) return
    let mounted = true
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${workspaceId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `workspace_id=eq.${workspaceId}`,
      }, async (payload) => {
        if (!mounted) return
        const newMsg = payload.new as DbMessage
        // Avoid duplicates
        if (messagesRef.current.some((m) => m.id === newMsg.id)) return
        // Fetch sender's profile name since realtime payload doesn't include joins
        let senderName = userName
        if (newMsg.user_id) {
          const supabase = createClient()
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", newMsg.user_id)
            .single()
          if (profile?.full_name) senderName = profile.full_name
        }
        const chatMsg = dbMessageToChat(newMsg, senderName)
        setMessages((prev) => [chatMsg, ...prev])
      })
      .subscribe()
    return () => { mounted = false; supabase.removeChannel(channel) }
  }, [workspaceId, userName])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Send message
  const sendMessage = useCallback(async (text: string, fileRef?: string) => {
    if (!text.trim()) return
    // Fetch current user's profile name for accurate sender display
    let senderName = userName || "You"
    let senderInitials = senderName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
        if (profile?.full_name) {
          senderName = profile.full_name
          senderInitials = senderName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        }
      }
    } catch {
      // Use fallback name
    }
    // Optimistic add
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: senderName,
      initials: senderInitials,
      text: text.trim(),
      time: "just now",
      file: fileRef,
    }
    setMessages((prev) => [optimisticMsg, ...prev])

    if (isDemo || !workspaceId || !isSupabaseConfigured()) return
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from("messages").insert({
        workspace_id: workspaceId,
        user_id: user?.id || null,
        content: text.trim(),
        file_reference: fileRef || null,
      })
    } catch {
      // Message already added optimistically
    }
  }, [isDemo, workspaceId, userName])

  return { messages, loading, isDemo, sendMessage, refresh: fetchMessages }
}
