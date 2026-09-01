"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
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
  is_public: boolean
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

export function useWorkspace(workspaceId?: string | null) {
  const [fileTree, setFileTree] = useState<FolderNode>(mockFileTree)
  const [fileContents, setFileContents] = useState<Record<string, string>>({ ...mockFileContents })
  const [collaborators, setCollaborators] = useState<CollaboratorData[]>(mockCollaborators)
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [dbFiles, setDbFiles] = useState<WorkspaceFile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(true)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const filesRef = useRef<WorkspaceFile[]>([])
  const lastSavedRef = useRef<Record<string, string>>({})
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
      const { data: ws } = await supabase.from("workspaces").select("id, name, description, is_public").eq("id", id).single()
      if (!ws) return false
      const { data: fetchedFiles } = await supabase.from("files").select("*").eq("workspace_id", id).order("path")
      if (!fetchedFiles) return false
      const { data: collabs } = await supabase.from("collaborators").select("role, profiles:user_id(full_name, avatar_url)").eq("workspace_id", id)
      setWorkspace(ws as WorkspaceData)
      setDbFiles(fetchedFiles as unknown as WorkspaceFile[])
      setFileTree(filesToTree(fetchedFiles as unknown as WorkspaceFile[]))
      setFileContents(filesToContentMap(fetchedFiles as unknown as WorkspaceFile[]))
      setIsDemo(false)
      if (collabs) {
        setCollaborators(collabs.map((c: any) => ({
          name: c.profiles?.full_name || "Unknown",
          initials: (c.profiles?.full_name || "U").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
          color: "bg-foreground",
          role: c.role.charAt(0).toUpperCase() + c.role.slice(1),
          status: "Online",
        })))
      }
      return true
    } catch { return false }
  }, [])

  const saveFile = useCallback((fileName: string, content: string) => {
    setFileContents(prev => ({ ...prev, [fileName]: content }))
    lastSavedRef.current[fileName] = content
    setError(null)
    if (isDemo) return
    if (saveTimers.current[fileName]) clearTimeout(saveTimers.current[fileName])
    saveTimers.current[fileName] = setTimeout(async () => {
      const file = filesRef.current.find(f => f.name === fileName)
      if (!file) return
      const attemptSave = async (attempt: number) => {
        try {
          const supabase = createClient()
          const { error: saveError } = await supabase.from("files").update({ content, git_status: "modified" }).eq("id", file.id)
          if (saveError) throw saveError
          setDbFiles(prev => prev.map(f => f.id === file.id ? { ...f, content, git_status: "modified" as GitStatus } : f))
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

  const createFile = useCallback(async (name: string, type: string = "code") => {
    setFileContents(prev => ({ ...prev, [name]: "" }))
    setFileTree(prev => ({ ...prev, children: [...prev.children, { name, type: type as any, status: "new" } as FileNode] }))
    if (isDemo || !workspaceId || !workspace) return
    try {
      const supabase = createClient()
      const { data } = await supabase.from("files").insert({ workspace_id: workspaceId, name, path: "/" + name, type: type as any, content: "", git_status: "new" }).select().single()
      if (data) { setDbFiles(prev => [...prev, data as unknown as WorkspaceFile]) }
    } catch {}
  }, [isDemo, workspaceId, workspace])

  const deleteFile = useCallback(async (fileName: string) => {
    if (isDemo) return
    const file = filesRef.current.find(f => f.name === fileName)
    if (!file) return
    try {
      const supabase = createClient()
      await supabase.from("files").delete().eq("id", file.id)
      setDbFiles(prev => prev.filter(f => f.id !== file.id))
    } catch {}
  }, [isDemo])

  const renameFile = useCallback(async (oldName: string, newName: string) => {
    setFileContents(prev => {
      const next = { ...prev }
      if (next[oldName] !== undefined) { next[newName] = next[oldName]; delete next[oldName] }
      return next
    })
    if (isDemo) return
    const file = filesRef.current.find(f => f.name === oldName)
    if (!file) return
    try {
      const supabase = createClient()
      await supabase.from("files").update({ name: newName, path: "/" + newName }).eq("id", file.id)
      setDbFiles(prev => prev.map(f => f.id === file.id ? { ...f, name: newName, path: "/" + newName } : f))
    } catch {}
  }, [isDemo])

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
        const updated = payload.new as WorkspaceFile
        if (!updated) return
        // Check if this was our own save (avoid echo loop)
        const localContent = lastSavedRef.current[updated.name]
        if (localContent === updated.content) return
        // Update local state with remote change
        setDbFiles(prev => {
          const exists = prev.find(f => f.id === updated.id)
          if (exists) {
            return prev.map(f => f.id === updated.id ? updated : f)
          }
          return [...prev, updated]
        })
        setFileContents(prev => ({ ...prev, [updated.name]: updated.content || '' }))
        setFileTree(prev => filesToTree(
          filesRef.current.map(f => f.id === updated.id ? updated : f)
        ))
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

  useEffect(() => () => { Object.values(saveTimers.current).forEach(clearTimeout) }, [])

  return { fileTree, fileContents, collaborators, workspace, files: dbFiles, loading, isDemo, error, saveFile, createFile, deleteFile, renameFile }
}
