"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export interface FileVersion {
  id: string
  file_id: string
  content: string
  version_number: number
  created_by: string | null
  created_at: string
}

interface VersionAuthor {
  full_name: string | null
}

// Demo versions for when Supabase is not configured
function getDemoVersions(fileName: string): FileVersion[] {
  const now = Date.now()
  // Return in descending version order (newest first) to match DB query
  return [
    {
      id: 'v-3',
      file_id: 'demo',
      content: '// Current version',
      version_number: 3,
      created_by: 'demo-user',
      created_at: new Date(now - 3600000).toISOString(),
    },
    {
      id: 'v-2',
      file_id: 'demo',
      content: '// Updated version with new features',
      version_number: 2,
      created_by: 'demo-user',
      created_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'v-1',
      file_id: 'demo',
      content: '// Initial version of ' + fileName,
      version_number: 1,
      created_by: 'demo-user',
      created_at: new Date(now - 86400000 * 3).toISOString(),
    },
  ]
}

export function useFileVersions(fileId: string | null, fileName?: string) {
  const [versions, setVersions] = useState<FileVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(true)

  const fetchVersions = useCallback(async () => {
    if (!fileId) {
      setVersions(fileName ? getDemoVersions(fileName) : [])
      setIsDemo(true)
      return
    }
    if (!isSupabaseConfigured()) {
      setVersions(getDemoVersions(fileName || 'file'))
      setIsDemo(true)
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('file_versions')
        .select('*')
        .eq('file_id', fileId)
        .order('version_number', { ascending: false })
      if (error) throw error
      setVersions((data || []) as FileVersion[])
      setIsDemo(false)
    } catch {
      setVersions(getDemoVersions(fileName || 'file'))
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [fileId, fileName])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  const restoreVersion = useCallback(async (version: FileVersion): Promise<string | null> => {
    return version.content
  }, [])

  const saveVersion = useCallback(async (fileIdParam: string, content: string): Promise<void> => {
    if (!isSupabaseConfigured() || !fileIdParam) return
    try {
      const supabase = createClient()
      // Get latest version number
      const { data: latest } = await supabase
        .from('file_versions')
        .select('version_number')
        .eq('file_id', fileIdParam)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()
      const nextVersion = (latest?.version_number || 0) + 1
      await supabase.from('file_versions').insert({
        file_id: fileIdParam,
        content,
        version_number: nextVersion,
      })
      // Refresh the list
      fetchVersions()
    } catch {}
  }, [fetchVersions])

  return { versions, loading, isDemo, restoreVersion, saveVersion, refresh: fetchVersions }
}
