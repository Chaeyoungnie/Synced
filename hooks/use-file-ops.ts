'use client'

import { useCallback } from 'react'
import { features } from '@/lib/features'

export interface LocalFile {
  filePath: string
  name: string
  content: string
}

export function useFileOps() {
  const flags = features()
  const isDesktop = flags.platform === 'desktop'

  const openFileDialog = useCallback(async (): Promise<LocalFile | null> => {
    if (!isDesktop || !(window as any).electronAPI) return null
    try {
      return await (window as any).electronAPI.openFileDialog()
    } catch {
      return null
    }
  }, [isDesktop])

  const saveFileDialog = useCallback(async (defaultName: string, content: string): Promise<{ filePath: string; saved: boolean } | null> => {
    if (!isDesktop || !(window as any).electronAPI) return null
    try {
      return await (window as any).electronAPI.saveFileDialog(defaultName, content)
    } catch {
      return null
    }
  }, [isDesktop])

  const readLocalFile = useCallback(async (filePath: string): Promise<LocalFile | null> => {
    if (!isDesktop || !(window as any).electronAPI) return null
    try {
      return await (window as any).electronAPI.readLocalFile(filePath)
    } catch {
      return null
    }
  }, [isDesktop])

  const saveLocalFile = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    if (!isDesktop || !(window as any).electronAPI) return false
    try {
      const result = await (window as any).electronAPI.saveLocalFile(filePath, content)
      return result?.saved ?? false
    } catch {
      return false
    }
  }, [isDesktop])

  return {
    isDesktop,
    openFileDialog,
    saveFileDialog,
    readLocalFile,
    saveLocalFile,
  }
}
