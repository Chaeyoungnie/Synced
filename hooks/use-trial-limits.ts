'use client'

import { useCallback, useMemo } from 'react'
import { features } from '@/lib/features'

export interface TrialLimits {
  fileCount: number
  canAddFile: boolean
  canUseCollaboration: boolean
  canUseGit: boolean
  canUseVersionHistory: boolean
  canInviteCollaborators: boolean
  upgradeReason: string | null
}

export function useTrialLimits(fileCount: number): TrialLimits {
  const flags = useMemo(() => features(), [])

  const canAddFile = flags.unlimitedFiles || fileCount < flags.maxFiles
  const upgradeReason = useMemo(() => {
    if (flags.platform === 'desktop') return null
    if (!flags.unlimitedFiles && fileCount >= flags.maxFiles) {
      return `You've reached the ${flags.maxFiles} file limit. Upgrade to desktop for unlimited files.`
    }
    if (!flags.collaboration) {
      return 'Real-time collaboration is available in the desktop app.'
    }
    return null
  }, [flags, fileCount])

  return {
    fileCount,
    canAddFile,
    canUseCollaboration: flags.collaboration,
    canUseGit: flags.gitIntegration,
    canUseVersionHistory: flags.versionHistory,
    canInviteCollaborators: flags.inviteCollaborators,
    upgradeReason,
  }
}
