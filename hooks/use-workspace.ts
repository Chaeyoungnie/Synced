"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { logActivity } from "@/lib/supabase/activities"
import { fileTree as mockFileTree, fileContents as mockFileContents, collaborators as mockCollaborators } from "@/components/editor/data"
import type { FileNode, FolderNode, GitStatus } from "@/components/editor/data"

export interface WorkspaceFile {
  id: string
  name: string
  path: string
  type: string
  content: string | null
  git_status: GitStatus
  parent_id: string | null
  workspace_id: string
}

export interface WorkspaceData {
  id: string
  name: string
  description: string | null
}

export interface CollaboratorData {
  name: string
  initials: string
  color: string
  role: string
  status: string
}

function filesToTree(files: WorkspaceFile[]): FolderNode {
  const root: FolderNode = { name: "workspace", open: true, children: [] }
  const byParent: Record<string, (FileNode | FolderNode)[]> = { "": root.children }
  const sorted = [...files].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1
    if (a.type !== "folder" && b.type === "folder") return 1
    return a.name.localeCompare(b.name)
  })
  for (const file of sorted) {
    const parentId = file.parent_id || ""
    if (!byParent[parentId]) byParent[parentId] = []
    if (file.type === "folder") {
      const node: FolderNode = { name: file.name, open: true, children: [] }
      byParent[parentId].push(node)
      byParent[file.id] = node.children
    } else {
      const fileType = file.type === "css" ? "css" : file.type === "json" ? "json" : "code"
      byParent[parentId].push({ name: file.name, type: fileType, status: file.git_status || "committed" })
    }
  }
  return root
}

function filesToContentMap(files: WorkspaceFile[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const file of files) {
    if (file.content !== null) map[file.name] = file.content
  }
  return map
}

const emptyTree: FolderNode = { name: 'workspace', open: true, children: [] }

export function useWorkspace(workspaceId?: string | null) {
  const startEmpty = !!workspaceId
  const [fileTree, setFileTree] = useState<FolderNode>(startEmpty ? emptyTree : mockFileTree)
  const [fileContents, setFileContents] = useState<Record<string, string>>(startEmpty ? {} : { ...mockFileContents })
  const [collaborators, setCollaborators] = useState<CollaboratorData[]>(startEmpty ? [] : mockCollaborators)
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [dbFiles, setDbFiles] = useState<WorkspaceFile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(true)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const filesRef = useRef<WorkspaceFile[]>([])
  const lastSavedRef = useRef<Record<string, string>>({})
  const lastActivityRef = useRef<Record<string, number>>({})
  filesRef.current = dbFiles
  const [error, setError] = useState<string | null>(null)
  const retryCount = useRef<Record<string, number>>({})
  const MAX_RETRIES = 3

  const loadWorkspace = useCallback(async (id: string) => {
    if (!isSupabaseConfigured()) return false
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      const { data: ws } = await supabase.from("workspaces").select("id, name, description").eq("id", id).single()
      if (!ws) return false
      const { data: fetchedFiles } = await supabase.from("files").select("*").eq("workspace_id", id).order("path")
      if (!fetchedFiles) return false
      const { data: collabs } = await supabase.from("collaborators").select("role, user_id").eq("workspace_id", id)
      setWorkspace(ws as WorkspaceData)
      setDbFiles(fetchedFiles as unknown as WorkspaceFile[])
      setFileTree(filesToTree(fetchedFiles as unknown as WorkspaceFile[]))
      setFileContents(filesToContentMap(fetchedFiles as unknown as WorkspaceFile[]))
      setIsDemo(false)
      if (collabs && collabs.length > 0) {
        // Fetch profile names for each collaborator
        const userIds = collabs.map((c: any) => c.user_id).filter(Boolean)
        let profileMap: Record<string, string> = {}
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds)
          if (profiles) {
            profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name || "Unknown"]))
          }
        }
        setCollaborators(collabs.map((c: any) => {
          const name = profileMap[c.user_id] || "Unknown"
          return {
            name,
            initials: name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
            color: "bg-foreground",
            role: c.role.charAt(0).toUpperCase() + c.role.slice(1),
            status: "Online",
          }
        }))
      }
      return true
    } catch { return false }
  }, [])

  const saveFile = useCallback((fileName: string, content: string) => {
    setFileContents(prev => ({ ...prev, [fileName]: content }))
    lastSavedRef.current[fileName] = content
    setError(null)
    if (isDemo) return
    // Log activity at most once per 30 seconds per file
    const now = Date.now()
    if (workspaceId && (!lastActivityRef.current[fileName] || now - lastActivityRef.current[fileName] > 30000)) {
      lastActivityRef.current[fileName] = now
      logActivity(workspaceId, 'file_edited', { fileName, lineCount: content.split('\n').length })
    }
    if (saveTimers.current[fileName]) clearTimeout(saveTimers.current[fileName])
    saveTimers.current[fileName] = setTimeout(async () => {
      const file = filesRef.current.find(f => f.name === fileName)
      const attemptSave = async (attempt: number) => {
        try {
          const supabase = createClient()
          if (file) {
            // File exists — update it
            const { error: saveError } = await supabase.from("files").update({ content, git_status: "modified" }).eq("id", file.id)
            if (saveError) throw saveError
            setDbFiles(prev => prev.map(f => f.id === file.id ? { ...f, content, git_status: "modified" as GitStatus } : f))
          } else if (workspaceId) {
            // File doesn't exist yet (create still in progress) — insert it
            const fileType = fileName.endsWith('.css') ? 'css' : fileName.endsWith('.json') ? 'json' : 'typescript'
            const { data, error: insertError } = await supabase.from("files").insert({
              workspace_id: workspaceId,
              name: fileName,
              path: '/' + fileName,
              content,
              language: fileType,
              git_status: 'modified',
            }).select().single()
            if (insertError) throw insertError
            if (data) {
              setDbFiles(prev => [...prev, data as unknown as WorkspaceFile])
            }
          }
          retryCount.current[fileName] = 0
        } catch (e) {
          if (attempt < MAX_RETRIES) {
            setTimeout(() => attemptSave(attempt + 1), 1000 * Math.pow(2, attempt))
          } else {
            setError('Failed to save ' + fileName + '. Changes may be lost.')
            retryCount.current[fileName] = 0
          }
        }
      }
      await attemptSave(0)
    }, 1000)
  }, [isDemo])

  const createFile = useCallback(async (name: string, type: string = "code", initialContent: string = "") => {
    setFileContents(prev => ({ ...prev, [name]: initialContent }))
    // Optimistically add to dbFiles so the useEffect updates fileTree immediately
    const optimisticFile = { id: 'temp-' + Date.now(), name, path: '/' + name, content: initialContent, language: name.endsWith('.css') ? 'css' : name.endsWith('.json') ? 'json' : 'typescript', git_status: 'new' as GitStatus, workspace_id: workspaceId || '' }
    setDbFiles(prev => [...prev, optimisticFile as unknown as WorkspaceFile])
    if (isDemo || !workspaceId || !workspace) return
    try {
      const supabase = createClient()
      const fileType = name.endsWith('.css') ? 'css' : name.endsWith('.json') ? 'json' : 'typescript'
      const { data } = await supabase.from("files").insert({ workspace_id: workspaceId, name, path: "/" + name, content: initialContent, language: fileType, git_status: "new" }).select().single()
      if (data) {
        // Replace optimistic file with real file from DB
        setDbFiles(prev => prev.map(f => f.id === optimisticFile.id ? data as unknown as WorkspaceFile : f))
        logActivity(workspaceId, 'file_created', { fileName: name })
      }
    } catch {}
  }, [isDemo, workspaceId, workspace])

  const deleteFile = useCallback(async (fileName: string) => {
    if (isDemo) return
    const file = filesRef.current.find(f => f.name === fileName)
    if (!file) return
    // Optimistic: remove from sidebar immediately
    setDbFiles(prev => prev.filter(f => f.id !== file.id))
    setFileContents(prev => { const next = { ...prev }; delete next[fileName]; return next })
    try {
      const supabase = createClient()
      const { error } = await supabase.from("files").delete().eq("id", file.id)
      if (error) {
        console.error('[Delete] Failed:', error.message)
        // Revert: add file back
        setDbFiles(prev => [...prev, file])
      } else {
        if (workspaceId) logActivity(workspaceId, 'file_deleted', { fileName })
      }
    } catch (e) {
      console.error('[Delete] Exception:', e)
      setDbFiles(prev => [...prev, file])
    }
  }, [isDemo, workspaceId])

  const renameFile = useCallback(async (oldName: string, newName: string) => {
    const file = filesRef.current.find(f => f.name === oldName)
    if (!file) return
    // Optimistic: rename in sidebar immediately
    setFileContents(prev => {
      const next = { ...prev }
      if (next[oldName] !== undefined) { next[newName] = next[oldName]; delete next[oldName] }
      return next
    })
    setDbFiles(prev => prev.map(f => f.id === file.id ? { ...f, name: newName, path: "/" + newName } : f))
    if (isDemo) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("files").update({ name: newName, path: "/" + newName }).eq("id", file.id)
      if (error) {
        console.error('[Rename] Failed:', error.message)
        // Revert
        setDbFiles(prev => prev.map(f => f.id === file.id ? { ...f, name: oldName, path: "/" + oldName } : f))
        setFileContents(prev => {
          const next = { ...prev }
          if (next[newName] !== undefined) { next[oldName] = next[newName]; delete next[newName] }
          return next
        })
      } else {
        if (workspaceId) logActivity(workspaceId, 'file_renamed', { oldName, newName })
      }
    } catch (e) {
      console.error('[Rename] Exception:', e)
    }
  }, [isDemo, workspaceId])

  const subscribeToChanges = useCallback((id: string) => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const channel = supabase
      .channel('files:' + id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'files',
        filter: 'workspace_id=eq.' + id,
      }, (payload: any) => {
        console.log('[Files Realtime] Event:', payload.eventType, payload)

        // Handle DELETE events
        if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id
          if (deletedId) {
            // Look up name BEFORE removing from dbFiles
            setDbFiles(prev => {
              const file = prev.find(f => f.id === deletedId)
              if (file) {
                setFileContents(cc => { const next = { ...cc }; delete next[file.name]; return next })
              }
              return prev.filter(f => f.id !== deletedId)
            })
          }
          return
        }

        const updated = payload.new as WorkspaceFile
        if (!updated) return

        // Handle UPDATE (including rename)
        setDbFiles(prev => {
          const exists = prev.find(f => f.id === updated.id)
          if (exists) {
            // If name changed, clean up old content key
            if (exists.name !== updated.name) {
              setFileContents(cc => {
                const next = { ...cc }
                next[updated.name] = updated.content || ''
                delete next[exists.name]
                return next
              })
            }
            return prev.map(f => f.id === updated.id ? updated : f)
          }
          return [...prev, updated]
        })
        setFileContents(prev => ({ ...prev, [updated.name]: updated.content || '' }))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

useEffect(() => {
    let mounted = true

    
    let cleanupSub: (() => void) | undefined
    async function init() {
      if (workspaceId && isSupabaseConfigured()) {
        const ok = await loadWorkspace(workspaceId)
        if (mounted) { if (!ok) setIsDemo(true); setLoading(false) }
        if (mounted && ok) cleanupSub = subscribeToChanges(workspaceId)
      } else { if (mounted) { setIsDemo(true); setLoading(false) } }
    }
    init()
    return () => { mounted = false; cleanupSub?.() }
  }, [workspaceId, loadWorkspace, subscribeToChanges])

  // Keep fileTree in sync with dbFiles (fixes real-time file tree updates)
  useEffect(() => {
    setFileTree(filesToTree(dbFiles))
  }, [dbFiles])

  useEffect(() => () => { Object.values(saveTimers.current).forEach(clearTimeout) }, [])

  return { fileTree, fileContents, collaborators, workspace, files: dbFiles, loading, isDemo, error, saveFile, createFile, deleteFile, renameFile }
}
